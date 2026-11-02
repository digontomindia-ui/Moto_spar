import React, { useMemo, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Loader2,
  MapPin,
  MessageSquarePlus,
  Package,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  Star,
  Truck,
  XCircle,
} from 'lucide-react';
import { PartImage } from '../../components/ui/PartImage';
import { useAuth } from '../../context/AuthContext';
import { useCommerce } from '../../context/CommerceContext';
import { triggerHaptic } from '../../services/haptics';
import { openNativeRazorpay, NativePaymentResult } from '../../services/nativeRazorpay';
import {
  addProductReview,
  initiateRazorpayPayment,
  verifyRazorpayCallback,
} from '../../services/motosparApi';
import {
  MotoSparOrder,
  MotoSparOrderItem,
  ShippingAddress,
} from '../../types/motospar';

interface OrderTrackingDetailProps {
  order: MotoSparOrder;
  onBack: () => void;
  onRefreshOrder: () => Promise<void>;
  isRefreshing: boolean;
  onOpenProductDetail: (productId: string) => void;
}

interface TrackingStep {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const TRACKING_STEPS: TrackingStep[] = [
  {
    key: 'PLACED',
    label: 'Order Placed',
    description: 'Order registered on the MotoSpar server',
    icon: <FileText className="w-4 h-4" />,
  },
  {
    key: 'CONFIRMED',
    label: 'Confirmed & Packed',
    description: 'Vendor confirmed part availability and packaging',
    icon: <Package className="w-4 h-4" />,
  },
  {
    key: 'SHIPPED',
    label: 'In Transit / Out for Delivery',
    description: 'Dispatched with delivery partner to your address',
    icon: <Truck className="w-4 h-4" />,
  },
  {
    key: 'DELIVERED',
    label: 'Delivered',
    description: 'Part delivered to customer shipping address',
    icon: <PackageCheck className="w-4 h-4" />,
  },
];

function computeTrackingProgress(order: MotoSparOrder): {
  activeStepIndex: number;
  isCancelled: boolean;
  rawStatusLabel: string;
} {
  const rawStatus = String(
    order.order_status || order.status || 'PLACED'
  ).toUpperCase();

  if (
    rawStatus.includes('CANCEL') ||
    rawStatus.includes('FAIL') ||
    rawStatus.includes('REJECT') ||
    rawStatus.includes('RETURN')
  ) {
    return {
      activeStepIndex: -1,
      isCancelled: true,
      rawStatusLabel: rawStatus,
    };
  }

  if (rawStatus.includes('DELIVER') || rawStatus.includes('COMPLET')) {
    return { activeStepIndex: 3, isCancelled: false, rawStatusLabel: rawStatus };
  }

  if (
    rawStatus.includes('SHIP') ||
    rawStatus.includes('TRANSIT') ||
    rawStatus.includes('DISPATCH') ||
    rawStatus.includes('OUT_FOR_DELIVERY') ||
    rawStatus.includes('DRIVER')
  ) {
    return { activeStepIndex: 2, isCancelled: false, rawStatusLabel: rawStatus };
  }

  if (
    rawStatus.includes('CONFIRM') ||
    rawStatus.includes('PROCESS') ||
    rawStatus.includes('PACK') ||
    rawStatus.includes('ACCEPT') ||
    order.is_successful === true
  ) {
    return { activeStepIndex: 1, isCancelled: false, rawStatusLabel: rawStatus };
  }

  return { activeStepIndex: 0, isCancelled: false, rawStatusLabel: rawStatus };
}

export const OrderTrackingDetail: React.FC<OrderTrackingDetailProps> = ({
  order,
  onBack,
  onRefreshOrder,
  isRefreshing,
  onOpenProductDetail,
}) => {
  const { user } = useAuth();
  const { addresses } = useCommerce();

  // Inline payment verification state for pending online orders
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [paymentBanner, setPaymentBanner] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Inline review modal for ordered items
  const [reviewTargetItem, setReviewTargetItem] =
    useState<MotoSparOrderItem | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const { activeStepIndex, isCancelled, rawStatusLabel } = useMemo(
    () => computeTrackingProgress(order),
    [order]
  );

  const orderItems = useMemo(
    () => order.order_items || order.items || [],
    [order]
  );

  const resolvedShippingAddress: ShippingAddress | null = useMemo(() => {
    if (!order.shipping_address) return null;
    if (typeof order.shipping_address === 'object') {
      return order.shipping_address as ShippingAddress;
    }
    const found = addresses.find(
      (a) => String(a.id) === String(order.shipping_address)
    );
    return found || null;
  }, [order.shipping_address, addresses]);

  const paymentStatusUpper = String(
    order.payment_status || 'PENDING'
  ).toUpperCase();
  const isPaid =
    order.is_successful === true ||
    paymentStatusUpper === 'SUCCESS' ||
    paymentStatusUpper === 'PAID' ||
    paymentStatusUpper === 'COMPLETED';
  const isOnlinePaymentPending =
    !isPaid &&
    !isCancelled &&
    String(order.payment_method || '').toUpperCase() === 'PAYMENT_GATEWAY';

  const handleRetryOnlinePayment = async () => {
    if (!order.id || paymentBusy) return;
    triggerHaptic('impactMedium');
    setPaymentBusy(true);
    setPaymentBanner(null);

    try {
      const { result, razorpayOrderId, prefill } =
        await initiateRazorpayPayment(String(order.id));
      if (!result.ok || !razorpayOrderId) {
        triggerHaptic('error');
        setPaymentBanner({
          type: 'error',
          text:
            result.message ||
            'Unable to initiate Razorpay order from the MotoSpar backend.',
        });
        return;
      }

      const publicKey = prefill?.razorpay_key?.trim() || '';
      if (!publicKey) {
        triggerHaptic('error');
        setPaymentBanner({
          type: 'error',
          text: 'Backend response did not include prefill.razorpay_key.',
        });
        return;
      }

      const rupeeAmount = Number(
        prefill?.amount ?? order.total_price ?? order.total_amount ?? 0
      );
      const amountInPaise = Math.round(rupeeAmount * 100);

      const handlePaymentSuccess = async (sdkRes: NativePaymentResult) => {
        if (!sdkRes.razorpay_payment_id || !sdkRes.razorpay_signature) {
          setPaymentBanner({ type: 'error', text: 'Razorpay did not return complete verification data.' });
          return;
        }
        const verifyRes = await verifyRazorpayCallback({
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: sdkRes.razorpay_payment_id,
          razorpay_signature: sdkRes.razorpay_signature,
        });
        if (verifyRes.ok) {
          triggerHaptic('success');
          setPaymentBanner({ type: 'success', text: 'Payment verified by MotoSpar server.' });
          await onRefreshOrder();
        } else {
          triggerHaptic('error');
          setPaymentBanner({ type: 'error', text: verifyRes.message });
        }
      };

      const checkoutOptions: Record<string, unknown> = {
        key: publicKey,
        amount: amountInPaise,
        currency: prefill?.currency || 'INR',
        name: 'MotoSpar',
        description: `Order #${order.order_number || order.id.slice(0, 8)}`,
        order_id: razorpayOrderId,
        prefill: {
          name: prefill?.name || user?.name || '',
          email: prefill?.email || user?.email || '',
          contact: prefill?.contact || user?.phone_number || '',
        },
        theme: { color: '#e11d48' },
        handler: handlePaymentSuccess,
      };
      if (Capacitor.isNativePlatform()) {
        try {
          const nativeOptions = { ...checkoutOptions };
          delete nativeOptions.handler;
          await handlePaymentSuccess(await openNativeRazorpay(nativeOptions));
        } catch (error) {
          setPaymentBanner({
            type: 'error',
            text: error instanceof Error ? error.message : 'Payment was cancelled or failed. Refresh order status before retrying.',
          });
        }
        return;
      }
      const BrowserRazorpay = window.Razorpay;
      if (typeof BrowserRazorpay !== 'function') {
        setPaymentBanner({ type: 'error', text: 'Razorpay Checkout SDK did not load.' });
        return;
      }
      const rzp = new BrowserRazorpay(checkoutOptions);
      rzp.open();
    } finally {
      setPaymentBusy(false);
    }
  };

  const handleSubmitItemReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTargetItem) return;

    const variantObj =
      reviewTargetItem.variant && typeof reviewTargetItem.variant === 'object'
        ? reviewTargetItem.variant
        : null;
    const productId = String(
      reviewTargetItem.product_id ||
        variantObj?.id ||
        (typeof reviewTargetItem.variant === 'string'
          ? reviewTargetItem.variant
          : '') ||
        ''
    );

    if (!productId) {
      setReviewFeedback({
        type: 'error',
        text: 'This order item does not contain a product ID for review submission.',
      });
      return;
    }

    setReviewSubmitting(true);
    setReviewFeedback(null);
    try {
      const userId = String(user?.id || user?.user_id || user?.pk || '');
      const res = await addProductReview({
        product: productId,
        user: userId,
        rating: reviewRating,
        title: reviewTitle.trim(),
        body: reviewBody.trim(),
        images: reviewImages.length > 0 ? reviewImages : undefined,
      });

      if (res.ok) {
        triggerHaptic('success');
        setReviewFeedback({
          type: 'success',
          text: res.message || 'Review submitted to MotoSpar.',
        });
        setReviewTargetItem(null);
        setReviewTitle('');
        setReviewBody('');
        setReviewImages([]);
      } else {
        triggerHaptic('error');
        setReviewFeedback({
          type: 'error',
          text: res.message,
        });
      }
    } finally {
      setReviewSubmitting(false);
    }
  };

  const totalAmount = order.total_price ?? order.total_amount;

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('selection');
            onBack();
          }}
          className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 hover:bg-slate-50 inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </button>

        <button
          type="button"
          disabled={isRefreshing}
          onClick={() => {
            triggerHaptic('selection');
            onRefreshOrder();
          }}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 inline-flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          <span>Refresh Live Tracking</span>
        </button>
      </div>

      {paymentBanner && (
        <div
          role={paymentBanner.type === 'error' ? 'alert' : 'status'}
          className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 ${
            paymentBanner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          {paymentBanner.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{paymentBanner.text}</span>
        </div>
      )}

      {reviewFeedback && (
        <div
          role={reviewFeedback.type === 'error' ? 'alert' : 'status'}
          className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 ${
            reviewFeedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          {reviewFeedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{reviewFeedback.text}</span>
        </div>
      )}

      {/* Main Tracking Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-8">
        {/* Order Identity & Server Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>MotoSpar Order Tracking</span>
              {order.created_at && (
                <>
                  <span>·</span>
                  <span>
                    {new Date(order.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-mono mt-1">
              #{order.order_number || order.id}
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              UUID: {order.id}
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-900">
              {isCancelled ? (
                <XCircle className="w-4 h-4 text-red-600" />
              ) : activeStepIndex >= 3 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <Clock className="w-4 h-4 text-amber-600" />
              )}
              <span>Server Status: {rawStatusLabel}</span>
            </div>
            <p className="text-xs text-slate-500">
              Payment: <strong className="text-slate-800">{paymentStatusUpper}</strong>{' '}
              {order.payment_method ? `(${order.payment_method})` : ''}
            </p>
          </div>
        </div>

        {/* Visual Multi-Step Order Progress Timeline */}
        {isCancelled ? (
          <div className="p-5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-red-900">
                Order {rawStatusLabel}
              </h3>
              <p className="text-xs text-red-800 mt-0.5">
                The MotoSpar server reports that this order is no longer active.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-500">
              Shipment &amp; Fulfilment Timeline
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {TRACKING_STEPS.map((step, index) => {
                const isCompleted = index <= activeStepIndex;
                const isCurrent = index === activeStepIndex;

                return (
                  <div
                    key={step.key}
                    className={`p-4 rounded-2xl border transition-colors ${
                      isCurrent
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : isCompleted
                          ? 'border-emerald-200 bg-emerald-50/60 text-slate-900'
                          : 'border-slate-200 bg-slate-50 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          isCurrent
                            ? 'bg-rose-600 text-white'
                            : isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {step.icon}
                      </div>
                      <span className="text-[11px] font-mono font-semibold">
                        0{index + 1}
                      </span>
                    </div>
                    <p
                      className={`text-xs font-bold ${
                        isCurrent
                          ? 'text-white'
                          : isCompleted
                            ? 'text-slate-900'
                            : 'text-slate-500'
                      }`}
                    >
                      {step.label}
                    </p>
                    <p
                      className={`text-[11px] mt-1 leading-relaxed ${
                        isCurrent
                          ? 'text-slate-300'
                          : isCompleted
                            ? 'text-slate-600'
                            : 'text-slate-400'
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pending Online Payment Recovery Action */}
        {isOnlinePaymentPending && (
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-amber-950">
                  Online Payment Verification Pending
                </h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  This order was created with PAYMENT_GATEWAY and is awaiting
                  verified Razorpay completion.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={paymentBusy}
              onClick={handleRetryOnlinePayment}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 inline-flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
            >
              {paymentBusy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              <span>Complete Razorpay Payment</span>
            </button>
          </div>
        )}

        {/* Ordered Items & Per-Item Progress / Review Trigger */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 font-display">
            Ordered Parts ({orderItems.length})
          </h3>

          {orderItems.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">
              Detailed line items were not included in this order payload.
            </p>
          ) : (
            <div className="divide-y divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden">
              {orderItems.map((item, idx) => {
                const variantObj =
                  item.variant && typeof item.variant === 'object'
                    ? item.variant
                    : null;
                const title =
                  item.product_name ||
                  item.variant_name ||
                  variantObj?.name ||
                  variantObj?.title ||
                  `Part Item #${idx + 1}`;
                const img =
                  item.image ||
                  variantObj?.image ||
                  (Array.isArray(variantObj?.images) &&
                  typeof variantObj.images[0] === 'string'
                    ? variantObj.images[0]
                    : null);
                const itemPrice = item.price ?? variantObj?.selling_price ?? variantObj?.price;
                const productId =
                  item.product_id ||
                  variantObj?.id ||
                  (typeof item.variant === 'string' ? item.variant : '');

                return (
                  <div
                    key={item.id || idx}
                    className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        <PartImage
                          src={img}
                          alt={title}
                          className="w-full h-full"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">
                          {title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="font-mono">
                            Qty: {item.quantity}
                          </span>
                          {itemPrice !== undefined && (
                            <>
                              <span>·</span>
                              <span className="font-mono tabular-nums text-slate-800 font-medium">
                                ₹{Number(itemPrice).toLocaleString('en-IN')}
                              </span>
                            </>
                          )}
                          {item.status && (
                            <>
                              <span>·</span>
                              <span className="font-semibold text-slate-700">
                                {item.status}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {productId && (
                        <button
                          type="button"
                          onClick={() => onOpenProductDetail(String(productId))}
                          className="min-h-[40px] px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                        >
                          View Part
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('selection');
                          setReviewTargetItem(item);
                          setReviewRating(5);
                          setReviewTitle('');
                          setReviewBody('');
                          setReviewImages([]);
                        }}
                        className="min-h-[40px] px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 inline-flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <MessageSquarePlus className="w-3.5 h-3.5" />
                        <span>Rate &amp; Review</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Inline Review Modal for Selected Order Item */}
        {reviewTargetItem && (
          <form
            onSubmit={handleSubmitItemReview}
            className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900">
                Write Review for{' '}
                {reviewTargetItem.product_name ||
                  reviewTargetItem.variant_name ||
                  'Ordered Part'}
              </h4>
              <button
                type="button"
                onClick={() => setReviewTargetItem(null)}
                className="text-xs text-slate-500 hover:text-slate-900"
              >
                Close
              </button>
            </div>

            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection');
                    setReviewRating(star);
                  }}
                  className="min-h-[42px] min-w-[42px] rounded-xl bg-white border border-slate-200 flex items-center justify-center"
                >
                  <Star
                    className={`w-4 h-4 ${
                      star <= reviewRating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <input
              type="text"
              required
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              placeholder="Review headline"
              className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl"
            />

            <textarea
              rows={3}
              required
              value={reviewBody}
              onChange={(e) => setReviewBody(e.target.value)}
              placeholder="Share fitment, build quality, and delivery experience..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl"
            />

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Upload Photos (Optional Multipart)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) =>
                  setReviewImages(
                    e.target.files ? Array.from(e.target.files) : []
                  )
                }
                className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReviewTargetItem(null)}
                className="min-h-[44px] px-4 py-2 text-xs font-medium text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reviewSubmitting}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 inline-flex items-center gap-2 disabled:opacity-50"
              >
                {reviewSubmitting && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                <span>Submit Review</span>
              </button>
            </div>
          </form>
        )}

        {/* Shipping Address & Server Fee Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
          {/* Delivery Destination */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
              <MapPin className="w-4 h-4 text-rose-600" />
              <span>Shipping Destination</span>
            </div>
            {resolvedShippingAddress ? (
              <div className="text-xs text-slate-600 space-y-1 pt-1">
                <p className="font-semibold text-slate-900">
                  {resolvedShippingAddress.name} ·{' '}
                  <span className="font-mono">
                    {resolvedShippingAddress.phone_number}
                  </span>
                </p>
                <p>
                  {resolvedShippingAddress.street_address},{' '}
                  {resolvedShippingAddress.city},{' '}
                  {resolvedShippingAddress.state}{' '}
                  <span className="font-mono">
                    {resolvedShippingAddress.postal_code}
                  </span>
                </p>
              </div>
            ) : order.shipping_address ? (
              <p className="text-xs text-slate-600 font-mono pt-1">
                Address ID: {String(order.shipping_address)}
              </p>
            ) : (
              <p className="text-xs text-slate-500 pt-1">
                Address reference managed on MotoSpar server.
              </p>
            )}
          </div>

          {/* Server Fee & Receipt Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-semibold text-slate-800 mb-1">
              <ShieldCheck className="w-4 h-4 text-slate-700" />
              <span>Authoritative Server Receipt</span>
            </div>

            {order.delivery_charge !== undefined && (
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge</span>
                <span className="font-mono tabular-nums text-slate-900">
                  ₹{Number(order.delivery_charge).toLocaleString('en-IN')}
                </span>
              </div>
            )}
            {order.mechanic_fees !== undefined &&
              Number(order.mechanic_fees) > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Mechanic Service Fees</span>
                  <span className="font-mono tabular-nums text-slate-900">
                    ₹{Number(order.mechanic_fees).toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            {order.driver_fees !== undefined &&
              Number(order.driver_fees) > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Driver Fees</span>
                  <span className="font-mono tabular-nums text-slate-900">
                    ₹{Number(order.driver_fees).toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            {totalAmount !== undefined && (
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                <span>Order Total</span>
                <span className="font-mono tabular-nums">
                  ₹{Number(totalAmount).toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
