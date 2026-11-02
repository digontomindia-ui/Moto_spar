import React, { useMemo, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  Edit3,
  Loader2,
  MapPin,
  Minus,
  Navigation,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from 'lucide-react';
import { PartImage } from '../../components/ui/PartImage';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '../../components/ui/StateDisplay';
import { useAuth } from '../../context/AuthContext';
import { useCommerce } from '../../context/CommerceContext';
import {
  createBuyNowOrder,
  createOrderFromCart,
  fetchCustomerOrders,
  initiateRazorpayPayment,
  verifyRazorpayCallback,
} from '../../services/motosparApi';
import { triggerHaptic } from '../../services/haptics';
import { openNativeRazorpay } from '../../services/nativeRazorpay';
import {
  CartItem,
  MotoSparOrder,
  PaymentMethod,
  ShippingAddress,
} from '../../types/motospar';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (
        event: string,
        callback: (response: Record<string, unknown>) => void
      ) => void;
    };
  }
}

interface CartAndCheckoutViewProps {
  onContinueShopping: () => void;
  onOpenProductDetail: (productId: string) => void;
  onViewOrders: () => void;
}

type CheckoutStage =
  | 'IDLE'
  | 'CREATING_ORDER'
  | 'INITIATING_RAZORPAY'
  | 'AWAITING_SDK'
  | 'VERIFYING_CALLBACK'
  | 'CONFIRMED_SUCCESS'
  | 'PAYMENT_UNVERIFIED';

function extractCartItemVariantId(item: CartItem): string {
  if (typeof item.variant === 'string') return item.variant;
  if (item.variant && typeof item.variant === 'object') {
    return String(item.variant.id || item.variant.variant_id || '');
  }
  return String(item.variant_id || item.id);
}

function safeNonnegativeAmount(raw: unknown): number {
  const amount = Number(raw);
  return Number.isFinite(amount) && amount >= 0 ? amount : 0;
}

function extractCartItemTitle(item: CartItem): string {
  if (item.product_name) return item.product_name;
  if (item.variant_name) return item.variant_name;
  if (item.variant && typeof item.variant === 'object') {
    return item.variant.name || item.variant.title || 'MotoSpar Variant';
  }
  return `Part Variant #${extractCartItemVariantId(item).slice(0, 8)}`;
}

function extractCartItemImage(item: CartItem): string | null {
  if (typeof item.image === 'string' && item.image) return item.image;
  if (item.variant && typeof item.variant === 'object') {
    if (typeof item.variant.image === 'string' && item.variant.image) {
      return item.variant.image;
    }
    if (
      Array.isArray(item.variant.images) &&
      item.variant.images.length > 0
    ) {
      const first = item.variant.images[0];
      if (typeof first === 'string') return first;
      if (first && typeof first === 'object') {
        return first.image || first.url || first.image_url || null;
      }
    }
  }
  return null;
}

export const CartAndCheckoutView: React.FC<CartAndCheckoutViewProps> = ({
  onContinueShopping,
  onOpenProductDetail,
  onViewOrders,
}) => {
  const { user } = useAuth();
  const {
    cartItems,
    cartLoading,
    cartError,
    refreshCart,
    updateCartItem,
    removeCartItem,
    addresses,
    addressesLoading,
    addressesError,
    selectedAddressId,
    setSelectedAddressId,
    refreshAddresses,
    createAddress,
    updateAddress,
    removeAddress,
    buyNowStaging,
    setBuyNowStaging,
  } = useCommerce();

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('PAYMENT_GATEWAY');
  const [separateBillingAddressId, setSeparateBillingAddressId] =
    useState<string>('');
  const [useSameBillingAddress, setUseSameBillingAddress] =
    useState<boolean>(true);

  // Cart item mutation busy tracker
  const [mutatingItemId, setMutatingItemId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Address Form modal / drawer
  const [showAddressForm, setShowAddressForm] = useState<boolean>(false);
  const [editingAddress, setEditingAddress] =
    useState<ShippingAddress | null>(null);
  const [addrName, setAddrName] = useState<string>('');
  const [addrEmail, setAddrEmail] = useState<string>('');
  const [addrPhone, setAddrPhone] = useState<string>('');
  const [addrAltPhone, setAddrAltPhone] = useState<string>('');
  const [addrStreet, setAddrStreet] = useState<string>('');
  const [addrCity, setAddrCity] = useState<string>('');
  const [addrState, setAddrState] = useState<string>('');
  const [addrPostalCode, setAddrPostalCode] = useState<string>('');
  const [addrType, setAddrType] = useState<string>('HOME');
  const [addrLat, setAddrLat] = useState<string>('');
  const [addrLng, setAddrLng] = useState<string>('');
  const [geoLoading, setGeoLoading] = useState<boolean>(false);
  const [geoMessage, setGeoMessage] = useState<string | null>(null);
  const [addrSubmitting, setAddrSubmitting] = useState<boolean>(false);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(
    null
  );

  // Checkout & Razorpay state machine
  const [checkoutStage, setCheckoutStage] = useState<CheckoutStage>('IDLE');
  const [activeOrder, setActiveOrder] = useState<MotoSparOrder | null>(null);
  const [checkoutStatusMessage, setCheckoutStatusMessage] = useState<
    string | null
  >(null);
  const [reconcilingOrder, setReconcilingOrder] = useState<boolean>(false);

  const hasInvalidCartPricing = buyNowStaging
    ? [
        buyNowStaging.unitPrice,
        buyNowStaging.deliveryCharge,
        buyNowStaging.mechanicFees,
        buyNowStaging.driverFees,
      ].some((amount) => !Number.isFinite(amount) || amount < 0)
    : cartItems.some((item) => {
        return [
          item.price_at_addition,
          item.delivery_charge,
          item.mechanic_fees,
          item.driver_fees,
        ].some((raw) => {
          const amount = Number(raw ?? 0);
          return !Number.isFinite(amount) || amount < 0;
        });
      });

  // Calculate authoritative summary from server-returned item fields
  const totals = useMemo(() => {
    if (buyNowStaging) {
      const safeUnitPrice =
        Number.isFinite(buyNowStaging.unitPrice) && buyNowStaging.unitPrice >= 0
          ? buyNowStaging.unitPrice
          : 0;
      const itemsSubtotal = safeUnitPrice * buyNowStaging.quantity;
      const delivery = safeNonnegativeAmount(buyNowStaging.deliveryCharge);
      const mechanic = safeNonnegativeAmount(buyNowStaging.mechanicFees);
      const driver = safeNonnegativeAmount(buyNowStaging.driverFees);
      return {
        itemsSubtotal,
        delivery,
        mechanic,
        driver,
        grandTotal: itemsSubtotal + delivery + mechanic + driver,
      };
    }

    let itemsSubtotal = 0;
    let delivery = 0;
    let mechanic = 0;
    let driver = 0;

    for (const item of cartItems) {
      const qty = Number(item.quantity || 1);
      const unit = Number(item.price_at_addition);
      if (Number.isFinite(unit) && unit >= 0) {
        itemsSubtotal += unit * qty;
      }
      delivery += safeNonnegativeAmount(item.delivery_charge);
      mechanic += safeNonnegativeAmount(item.mechanic_fees);
      driver += safeNonnegativeAmount(item.driver_fees);
    }

    return {
      itemsSubtotal,
      delivery,
      mechanic,
      driver,
      grandTotal: itemsSubtotal + delivery + mechanic + driver,
    };
  }, [buyNowStaging, cartItems]);

  const openNewAddressForm = () => {
    setEditingAddress(null);
    const fullName =
      user?.name ||
      `${user?.first_name || ''} ${user?.last_name || ''}`.trim() ||
      '';
    setAddrName(fullName);
    setAddrEmail(user?.email || '');
    setAddrPhone(user?.phone_number || '');
    setAddrAltPhone('');
    setAddrStreet(user?.address || '');
    setAddrCity(user?.city || '');
    setAddrState(user?.state || '');
    setAddrPostalCode(user?.postal_code || '');
    setAddrType('HOME');
    setAddrLat('');
    setAddrLng('');
    setGeoMessage(null);
    setShowAddressForm(true);
  };

  const openEditAddressForm = (addr: ShippingAddress) => {
    setEditingAddress(addr);
    setAddrName(addr.name || '');
    setAddrEmail(addr.email || user?.email || '');
    setAddrPhone(addr.phone_number || '');
    setAddrAltPhone(addr.alternate_phone_number || '');
    setAddrStreet(addr.street_address || '');
    setAddrCity(addr.city || '');
    setAddrState(addr.state || '');
    setAddrPostalCode(addr.postal_code || '');
    setAddrType(addr.address_type || 'HOME');
    setAddrLat(addr.latitude !== undefined ? String(addr.latitude) : '');
    setAddrLng(addr.longitude !== undefined ? String(addr.longitude) : '');
    setGeoMessage(null);
    setShowAddressForm(true);
  };

  /**
   * Requests platform geolocation permission ONLY when the user explicitly clicks
   * "Use Current Location". Never fabricates coordinates.
   */
  const handleRequestCurrentLocation = async () => {
    setGeoMessage(null);
    setGeoLoading(true);
    try {
      let latitude: number;
      let longitude: number;
      if (Capacitor.isNativePlatform()) {
        const permission = await Geolocation.requestPermissions();
        if (permission.location !== 'granted' && permission.coarseLocation !== 'granted') {
          throw new Error('Location permission was denied');
        }
        const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      } else {
        if (!navigator.geolocation) throw new Error('Geolocation is unavailable in this browser');
        const position = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 })
        );
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      }
      setAddrLat(latitude.toFixed(6));
      setAddrLng(longitude.toFixed(6));
      setGeoMessage('Current GPS coordinates captured.');
    } catch (error) {
      setGeoMessage(`Location could not be captured (${error instanceof Error ? error.message : 'unknown error'}). You can still enter your address manually.`);
    } finally {
      setGeoLoading(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);

    if (
      !addrName.trim() ||
      !addrEmail.trim() ||
      !addrPhone.trim() ||
      !addrStreet.trim() ||
      !addrCity.trim() ||
      !addrState.trim() ||
      !addrPostalCode.trim()
    ) {
      setActionError('Please fill in all required shipping address fields.');
      return;
    }

    setAddrSubmitting(true);
    try {
      const userId = String(user?.id || user?.user_id || user?.pk || '');
      const latValue = addrLat.trim() ? Number(addrLat.trim()) : 0;
      const lngValue = addrLng.trim() ? Number(addrLng.trim()) : 0;

      if (editingAddress) {
        const res = await updateAddress(editingAddress.id, {
          phone_number: addrPhone.trim(),
          alternate_phone_number: addrAltPhone.trim(),
          street_address: addrStreet.trim(),
          state: addrState.trim(),
          city: addrCity.trim(),
          postal_code: addrPostalCode.trim(),
          address_type: addrType,
          latitude: latValue,
          longitude: lngValue,
        });
        if (res.ok) {
          setShowAddressForm(false);
          setEditingAddress(null);
        } else {
          setActionError(res.message);
        }
      } else {
        const res = await createAddress({
          user: userId,
          name: addrName.trim(),
          email: addrEmail.trim(),
          phone_number: addrPhone.trim(),
          alternate_phone_number: addrAltPhone.trim(),
          street_address: addrStreet.trim(),
          state: addrState.trim(),
          city: addrCity.trim(),
          postal_code: addrPostalCode.trim(),
          address_type: addrType,
          latitude: latValue,
          longitude: lngValue,
        });
        if (res.ok) {
          setShowAddressForm(false);
        } else {
          setActionError(res.message);
        }
      }
    } finally {
      setAddrSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    setDeletingAddressId(addressId);
    setActionError(null);
    try {
      const res = await removeAddress(addressId);
      if (!res.ok) {
        setActionError(res.message);
      }
    } finally {
      setDeletingAddressId(null);
    }
  };

  const handleQuantityChange = async (item: CartItem, nextQty: number) => {
    const itemId = String(item.id || item.cart_item_id || '');
    if (!itemId) return;
    setMutatingItemId(itemId);
    setActionError(null);
    try {
      if (nextQty <= 0) {
        const res = await removeCartItem(itemId);
        if (!res.ok) setActionError(res.message);
      } else {
        const res = await updateCartItem(itemId, {
          quantity: nextQty,
          price_at_addition: Number(item.price_at_addition || 0),
          mechanic_fees: Number(item.mechanic_fees || 0),
          driver_fees: Number(item.driver_fees || 0),
        });
        if (!res.ok) setActionError(res.message);
      }
    } finally {
      setMutatingItemId(null);
    }
  };

  const handleRemoveCartItem = async (item: CartItem) => {
    const itemId = String(item.id || item.cart_item_id || '');
    if (!itemId) return;
    setMutatingItemId(itemId);
    setActionError(null);
    try {
      const res = await removeCartItem(itemId);
      if (!res.ok) setActionError(res.message);
    } finally {
      setMutatingItemId(null);
    }
  };

  /**
   * Executes Razorpay payment initiation + SDK checkout + backend signature callback
   * for an already-created MotoSpar order UUID.
   */
  const runRazorpayFlowForOrder = async (order: MotoSparOrder) => {
    const orderId = String(order.id || '');
    if (!orderId) {
      setCheckoutStage('PAYMENT_UNVERIFIED');
      setCheckoutStatusMessage(
        'Order creation response did not include a valid MotoSpar order.id.'
      );
      return;
    }

    setCheckoutStage('INITIATING_RAZORPAY');
    setCheckoutStatusMessage(
      'Initiating Razorpay payment order on MotoSpar server...'
    );

    const { result, razorpayOrderId, prefill } =
      await initiateRazorpayPayment(orderId);

    if (!result.ok || !razorpayOrderId) {
      setCheckoutStage('PAYMENT_UNVERIFIED');
      setCheckoutStatusMessage(
        result.message ||
          'Backend could not initiate a Razorpay order for this MotoSpar order.'
      );
      return;
    }

    const publicKey = prefill?.razorpay_key?.trim() || '';
    if (!publicKey) {
      setCheckoutStage('PAYMENT_UNVERIFIED');
      setCheckoutStatusMessage(
        'The MotoSpar backend response did not include prefill.razorpay_key. Hardcoded test keys are disabled.'
      );
      return;
    }

    // Backend creates Razorpay order in paise (total_price * 100) and returns prefill.amount in rupees.
    // Convert rupee amount to integer paise for the Razorpay SDK contract.
    const rupeeAmount = Number(
      prefill?.amount ?? order.total_price ?? totals.grandTotal
    );
    const amountInPaise = Math.round(rupeeAmount * 100);

    setCheckoutStage('AWAITING_SDK');
    setCheckoutStatusMessage('Waiting for Razorpay payment completion...');

    const rzpOptions: Record<string, unknown> = {
      key: publicKey,
      amount: amountInPaise,
      currency: prefill?.currency || 'INR',
      name: 'MotoSpar',
      description: `Order #${order.order_number || orderId.slice(0, 8)}`,
      order_id: razorpayOrderId,
      prefill: {
        name: prefill?.name || user?.name || '',
        email: prefill?.email || user?.email || '',
        contact: prefill?.contact || user?.phone_number || '',
      },
      theme: {
        color: '#e11d48',
      },
      modal: {
        ondismiss: () => {
          setCheckoutStage('PAYMENT_UNVERIFIED');
          setCheckoutStatusMessage(
            'Payment window was closed before completion. Your MotoSpar order is saved and awaiting payment verification.'
          );
        },
      },
      handler: async (sdkResponse: {
        razorpay_order_id?: string;
        razorpay_payment_id?: string;
        razorpay_signature?: string;
      }) => {
        const rzpOrderId =
          sdkResponse.razorpay_order_id || razorpayOrderId || '';
        const rzpPaymentId = sdkResponse.razorpay_payment_id || '';
        const rzpSignature = sdkResponse.razorpay_signature || '';

        if (!rzpOrderId || !rzpPaymentId || !rzpSignature) {
          setCheckoutStage('PAYMENT_UNVERIFIED');
          setCheckoutStatusMessage(
            'Razorpay SDK did not return complete signature fields for server verification.'
          );
          return;
        }

        setCheckoutStage('VERIFYING_CALLBACK');
        setCheckoutStatusMessage(
          'Verifying payment signature with MotoSpar backend...'
        );

        const verifyRes = await verifyRazorpayCallback({
          razorpay_order_id: rzpOrderId,
          razorpay_payment_id: rzpPaymentId,
          razorpay_signature: rzpSignature,
        });

        const verifiedOrder = verifyRes.data?.order || order;
        const serverSaysSuccess =
          verifyRes.ok &&
          verifiedOrder.is_successful === true &&
          String(verifiedOrder.payment_status || '').toUpperCase() ===
            'SUCCESS';

        if (serverSaysSuccess) {
          triggerHaptic('success');
          setActiveOrder(verifiedOrder);
          setCheckoutStage('CONFIRMED_SUCCESS');
          setCheckoutStatusMessage(
            'Payment signature verified by MotoSpar backend.'
          );
          setBuyNowStaging(null);
          await refreshCart();
        } else {
          triggerHaptic('error');
          setActiveOrder(verifiedOrder);
          setCheckoutStage('PAYMENT_UNVERIFIED');
          setCheckoutStatusMessage(
            verifyRes.message ||
              'Server signature verification did not confirm payment success. Please refresh order status.'
          );
        }
      },
    };

    if (Capacitor.isNativePlatform()) {
      try {
        const nativeOptions = { ...rzpOptions };
        delete nativeOptions.handler;
        delete nativeOptions.modal;
        const response = await openNativeRazorpay(nativeOptions);
        const handleSuccess = rzpOptions.handler as (
          result: typeof response
        ) => Promise<void>;
        await handleSuccess(response);
      } catch (error) {
        setCheckoutStage('PAYMENT_UNVERIFIED');
        setCheckoutStatusMessage(
          error instanceof Error ? error.message : 'Payment was cancelled or failed. Check your order before retrying.'
        );
      }
      return;
    }

    const BrowserRazorpay = window.Razorpay;
    if (typeof BrowserRazorpay !== 'function') {
      setCheckoutStage('PAYMENT_UNVERIFIED');
      setCheckoutStatusMessage('Razorpay Checkout SDK did not load. Check your connection and retry.');
      return;
    }
    const rzpInstance = new BrowserRazorpay(rzpOptions);
    rzpInstance.on('payment.failed', (failure: Record<string, unknown>) => {
      const errObj =
        failure.error && typeof failure.error === 'object'
          ? (failure.error as Record<string, unknown>)
          : {};
      const desc =
        typeof errObj.description === 'string'
          ? errObj.description
          : 'Payment failed in Razorpay checkout.';
      setCheckoutStage('PAYMENT_UNVERIFIED');
      setCheckoutStatusMessage(desc);
    });

    rzpInstance.open();
  };

  /**
   * Main Checkout handler:
   * 1. Validates real selected shipping address ID.
   * 2. Calls POST /api/customer/order/create-from-cart/ or POST /api/customer/order/create/.
   * 3. For CASH_ON_DELIVERY, shows confirmed order directly after backend success.
   * 4. For PAYMENT_GATEWAY, initiates Razorpay and awaits backend callback verification.
   */
  const handlePlaceOrder = async () => {
    setActionError(null);
    if (hasInvalidCartPricing) {
      setActionError(
        'A cart item has an invalid price. Remove it from your cart before checkout.'
      );
      return;
    }
    if (!selectedAddressId) {
      setActionError('Please select or add a shipping address before checkout.');
      return;
    }

    const billingAddressId = useSameBillingAddress
      ? selectedAddressId
      : separateBillingAddressId || selectedAddressId;

    setCheckoutStage('CREATING_ORDER');
    setCheckoutStatusMessage('Creating order on MotoSpar server...');

    const createRes = buyNowStaging
      ? await createBuyNowOrder({
          shipping_address: selectedAddressId,
          payment_method: paymentMethod,
          billing_address: billingAddressId,
          order_items: [
            {
              variant: String(
                buyNowStaging.variant.id || buyNowStaging.variant.variant_id
              ),
              quantity: buyNowStaging.quantity,
              mechanic_fees: buyNowStaging.mechanicFees,
            },
          ],
          delivery_charge: buyNowStaging.deliveryCharge,
          driver_fees: buyNowStaging.driverFees,
        })
      : await createOrderFromCart({
          shipping_address: selectedAddressId,
          payment_method: paymentMethod,
          billing_address: billingAddressId,
          delivery_charge: totals.delivery,
        });

    if (!createRes.ok || !createRes.data) {
      triggerHaptic('error');
      setCheckoutStage('IDLE');
      setActionError(
        createRes.message || 'Order creation failed on the MotoSpar server.'
      );
      return;
    }

    const createdOrder: MotoSparOrder = createRes.data.order || {
      id: String(createRes.data.id || ''),
      payment_method: paymentMethod,
      total_price: totals.grandTotal,
    };

    if (!createdOrder.id) {
      triggerHaptic('error');
      setCheckoutStage('IDLE');
      setActionError(
        'The backend reported order creation but did not return an order.id.'
      );
      return;
    }

    setActiveOrder(createdOrder);

    if (paymentMethod === 'CASH_ON_DELIVERY') {
      triggerHaptic('success');
      setCheckoutStage('CONFIRMED_SUCCESS');
      setCheckoutStatusMessage(
        'Cash on Delivery order confirmed by MotoSpar server.'
      );
      setBuyNowStaging(null);
      await refreshCart();
      return;
    }

    triggerHaptic('impactMedium');
    await runRazorpayFlowForOrder(createdOrder);
  };

  /**
   * Queries POST /api/customer/orders/ to reconcile the latest server state
   * of `activeOrder` without recreating the order.
   */
  const handleReconcileOrderStatus = async () => {
    if (!activeOrder?.id) return;
    setReconcilingOrder(true);
    try {
      const res = await fetchCustomerOrders({ limit: 10, offset: 0 });
      if (res.ok && res.data) {
        const list = res.data.orders || res.data.results || [];
        const matched = list.find((o) => String(o.id) === String(activeOrder.id));
        if (matched) {
          setActiveOrder(matched);
          const isPaid =
            matched.is_successful === true ||
            String(matched.payment_status || '').toUpperCase() === 'SUCCESS' ||
            String(matched.payment_status || '').toUpperCase() === 'PAID';
          if (isPaid) {
            setCheckoutStage('CONFIRMED_SUCCESS');
            setCheckoutStatusMessage(
              'Order payment confirmed by MotoSpar server reconciliation.'
            );
            setBuyNowStaging(null);
            await refreshCart();
          } else {
            setCheckoutStatusMessage(
              `Current server payment status: ${matched.payment_status || matched.status || 'PENDING'}.`
            );
          }
        }
      }
    } finally {
      setReconcilingOrder(false);
    }
  };

  // ============================================================================
  // CHECKOUT RESULT VIEW (VERIFIED SUCCESS OR UNVERIFIED RECOVERY)
  // ============================================================================
  if (
    checkoutStage === 'CONFIRMED_SUCCESS' ||
    checkoutStage === 'PAYMENT_UNVERIFIED'
  ) {
    const isSuccess = checkoutStage === 'CONFIRMED_SUCCESS';
    return (
      <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col items-center text-center">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
              isSuccess
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="w-7 h-7" />
            ) : (
              <Clock className="w-7 h-7" />
            )}
          </div>

          <h1 className="text-2xl font-bold text-slate-900 font-display">
            {isSuccess
              ? 'Order Confirmed'
              : 'Payment Pending or Unverified'}
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-md">
            {checkoutStatusMessage}
          </p>
        </div>

        {activeOrder && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">MotoSpar Order ID</span>
              <span className="font-mono font-semibold text-slate-900">
                {activeOrder.order_number || activeOrder.id}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Method</span>
              <span className="font-mono font-medium text-slate-800">
                {activeOrder.payment_method || paymentMethod}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Server Payment Status</span>
              <span
                className={`font-semibold ${
                  isSuccess ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {activeOrder.payment_status ||
                  (isSuccess ? 'CONFIRMED' : 'PENDING_VERIFICATION')}
              </span>
            </div>
            {(activeOrder.total_price !== undefined ||
              activeOrder.total_amount !== undefined) && (
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                <span>Server Order Total</span>
                <span className="font-mono tabular-nums">
                  ₹
                  {Number(
                    activeOrder.total_price ?? activeOrder.total_amount
                  ).toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>
        )}

        {!isSuccess && activeOrder && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              disabled={reconcilingOrder}
              onClick={handleReconcileOrderStatus}
              className="min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-50 flex items-center justify-center gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${reconcilingOrder ? 'animate-spin' : ''}`}
              />
              <span>Refresh Order Status</span>
            </button>

            <button
              type="button"
              onClick={() => runRazorpayFlowForOrder(activeOrder)}
              className="min-h-[48px] px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>Retry Razorpay Checkout</span>
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setCheckoutStage('IDLE');
              setActiveOrder(null);
              onViewOrders();
            }}
            className="flex-1 min-h-[48px] px-5 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
          >
            View My Orders
          </button>
          <button
            type="button"
            onClick={() => {
              setCheckoutStage('IDLE');
              setActiveOrder(null);
              onContinueShopping();
            }}
            className="flex-1 min-h-[48px] px-5 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm font-semibold hover:bg-slate-50"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const isItemsEmpty = !buyNowStaging && cartItems.length === 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
            {buyNowStaging ? 'Buy Now Checkout' : 'Shopping Cart & Checkout'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {buyNowStaging
              ? 'Express single-variant order creation via POST /api/customer/order/create/'
              : 'Synced with your live MotoSpar server cart'}
          </p>
        </div>

        {buyNowStaging ? (
          <button
            type="button"
            onClick={() => setBuyNowStaging(null)}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center gap-2 self-start"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Switch to Server Cart</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={refreshCart}
            disabled={cartLoading}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center gap-2 self-start"
          >
            <RefreshCw
              className={`w-4 h-4 ${cartLoading ? 'animate-spin' : ''}`}
            />
            <span>Refresh Cart</span>
          </button>
        )}
      </div>

      {actionError && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{actionError}</span>
        </div>
      )}

      {!buyNowStaging && cartLoading ? (
        <LoadingState label="Fetching your server cart..." />
      ) : !buyNowStaging && cartError ? (
        <ErrorState
          title="Could Not Load Server Cart"
          message={cartError}
          onRetry={refreshCart}
        />
      ) : isItemsEmpty ? (
        <EmptyState
          title="Your MotoSpar Cart is Empty"
          description="Browse the Car or Bike catalog to add genuine replacement parts to your cart."
          actionLabel="Browse Parts Catalog"
          onAction={onContinueShopping}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cart Items + Shipping Address Book */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Order Items List */}
            <section className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900 font-display">
                {buyNowStaging
                  ? '1. Selected Buy-Now Item'
                  : `1. Cart Items (${cartItems.length})`}
              </h2>

              {buyNowStaging ? (
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
                    <PartImage
                      src={buyNowStaging.image}
                      alt={buyNowStaging.productName}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 truncate">
                      {buyNowStaging.productName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Qty: {buyNowStaging.quantity} · Variant ID:{' '}
                      <span className="font-mono">
                        {String(buyNowStaging.variant.id).slice(0, 8)}
                      </span>
                    </p>
                    <p className="text-sm font-bold text-slate-900 font-mono tabular-nums mt-1">
                      ₹{buyNowStaging.unitPrice.toLocaleString('en-IN')} each
                    </p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {cartItems.map((item) => {
                    const itemId = String(item.id || item.cart_item_id || '');
                    const title = extractCartItemTitle(item);
                    const img = extractCartItemImage(item);
                    const qty = Number(item.quantity || 1);
                    const price = Number(item.price_at_addition);
                    const hasInvalidPrice =
                      !Number.isFinite(price) || price < 0;
                    const isMutating = mutatingItemId === itemId;

                    return (
                      <div
                        key={itemId}
                        className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5">
                          <div
                            onClick={() => {
                              if (item.product_id) {
                                onOpenProductDetail(String(item.product_id));
                              }
                            }}
                            className="w-18 h-18 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 cursor-pointer"
                          >
                            <PartImage
                              src={img}
                              alt={title}
                              className="w-full h-full"
                            />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-slate-900">
                              {title}
                            </h3>
                            <p className={`text-xs font-mono tabular-nums mt-0.5 ${hasInvalidPrice ? 'text-red-700' : 'text-slate-600'}`}>
                              {hasInvalidPrice
                                ? 'Price unavailable — remove this item'
                                : `₹${price.toLocaleString('en-IN')} unit price`}
                            </p>
                            {Number(item.delivery_charge || 0) > 0 && (
                              <p className="text-[11px] text-slate-500 font-mono tabular-nums">
                                Delivery: ₹
                                {Number(item.delivery_charge).toLocaleString(
                                  'en-IN'
                                )}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3">
                          <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                            <button
                              type="button"
                              disabled={isMutating || hasInvalidPrice}
                              onClick={() => handleQuantityChange(item, qty - 1)}
                              aria-label="Decrease item quantity"
                              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-xs font-mono font-semibold tabular-nums">
                              {isMutating ? '...' : qty}
                            </span>
                            <button
                              type="button"
                              disabled={isMutating || hasInvalidPrice}
                              onClick={() => handleQuantityChange(item, qty + 1)}
                              aria-label="Increase item quantity"
                              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            disabled={isMutating}
                            onClick={() => handleRemoveCartItem(item)}
                            aria-label="Remove item from cart"
                            className="min-h-[44px] min-w-[44px] rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* 2. Shipping & Billing Address Section */}
            <section className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-display">
                    2. Shipping Address
                  </h2>
                  <p className="text-xs text-slate-500">
                    Select a saved address or add a new delivery location
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openNewAddressForm}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 inline-flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Address</span>
                </button>
              </div>

              {/* Address Create / Edit Form */}
              {showAddressForm && (
                <form
                  onSubmit={handleSaveAddress}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {editingAddress
                        ? 'Edit Shipping Address'
                        : 'New Shipping Address'}
                    </h3>
                    <button
                      type="button"
                      onClick={handleRequestCurrentLocation}
                      disabled={geoLoading}
                      className="min-h-[40px] px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-100 inline-flex items-center gap-1.5"
                    >
                      {geoLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                      ) : (
                        <Navigation className="w-3.5 h-3.5 text-rose-600" />
                      )}
                      <span>Use Current Location</span>
                    </button>
                  </div>

                  {geoMessage && (
                    <p className="text-xs text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-2">
                      {geoMessage}
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Recipient Name
                      </label>
                      <input
                        type="text"
                        required
                        value={addrName}
                        onChange={(e) => setAddrName(e.target.value)}
                        className="w-full min-h-[44px] px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={addrEmail}
                        onChange={(e) => setAddrEmail(e.target.value)}
                        className="w-full min-h-[44px] px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={addrPhone}
                        onChange={(e) => setAddrPhone(e.target.value)}
                        className="w-full min-h-[44px] px-3 py-2 text-sm font-mono bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Alternate Phone
                      </label>
                      <input
                        type="tel"
                        value={addrAltPhone}
                        onChange={(e) => setAddrAltPhone(e.target.value)}
                        className="w-full min-h-[44px] px-3 py-2 text-sm font-mono bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      required
                      value={addrStreet}
                      onChange={(e) => setAddrStreet(e.target.value)}
                      placeholder="House/Flat No., Building, Street, Landmark"
                      className="w-full min-h-[44px] px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        required
                        value={addrCity}
                        onChange={(e) => setAddrCity(e.target.value)}
                        className="w-full min-h-[44px] px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        required
                        value={addrState}
                        onChange={(e) => setAddrState(e.target.value)}
                        className="w-full min-h-[44px] px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        required
                        value={addrPostalCode}
                        onChange={(e) => setAddrPostalCode(e.target.value)}
                        className="w-full min-h-[44px] px-3 py-2 text-sm font-mono bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Address Type
                      </label>
                      <select
                        value={addrType}
                        onChange={(e) => setAddrType(e.target.value)}
                        className="w-full min-h-[44px] px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
                      >
                        <option value="HOME">HOME</option>
                        <option value="WORK">WORK</option>
                        <option value="OTHER">OTHER</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Latitude (Optional)
                      </label>
                      <input
                        type="text"
                        value={addrLat}
                        onChange={(e) => setAddrLat(e.target.value)}
                        placeholder="0.0"
                        className="w-full min-h-[44px] px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Longitude (Optional)
                      </label>
                      <input
                        type="text"
                        value={addrLng}
                        onChange={(e) => setAddrLng(e.target.value)}
                        placeholder="0.0"
                        className="w-full min-h-[44px] px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="min-h-[44px] px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addrSubmitting}
                      className="min-h-[44px] px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 disabled:opacity-50 inline-flex items-center gap-2"
                    >
                      {addrSubmitting && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      <span>
                        {editingAddress ? 'Update Address' : 'Save Address'}
                      </span>
                    </button>
                  </div>
                </form>
              )}

              {/* Saved Addresses List */}
              {addressesLoading ? (
                <LoadingState label="Loading saved shipping addresses..." />
              ) : addressesError ? (
                <ErrorState
                  title="Could Not Load Addresses"
                  message={addressesError}
                  onRetry={refreshAddresses}
                />
              ) : addresses.length === 0 ? (
                <EmptyState
                  title="No Saved Shipping Addresses"
                  description="Add a shipping address to proceed with your MotoSpar order."
                  actionLabel="Add Shipping Address"
                  onAction={openNewAddressForm}
                />
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 rounded-2xl border transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                          isSelected
                            ? 'border-slate-900 bg-slate-50'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <MapPin
                            className={`w-4 h-4 mt-1 shrink-0 ${
                              isSelected ? 'text-rose-600' : 'text-slate-400'
                            }`}
                          />
                          <div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span className="font-semibold text-slate-900 text-sm">
                                {addr.name}
                              </span>
                              <span>·</span>
                              <span>{addr.address_type || 'HOME'}</span>
                              <span>·</span>
                              <span className="font-mono">
                                {addr.phone_number}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1">
                              {addr.street_address}, {addr.city}, {addr.state}{' '}
                              <span className="font-mono">
                                {addr.postal_code}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div
                          className="flex items-center gap-1 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => openEditAddressForm(addr)}
                            aria-label="Edit address"
                            className="min-h-[40px] min-w-[40px] rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 flex items-center justify-center"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={deletingAddressId === addr.id}
                            onClick={() => handleDeleteAddress(addr.id)}
                            aria-label="Delete address"
                            className="min-h-[40px] min-w-[40px] rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 flex items-center justify-center"
                          >
                            {deletingAddressId === addr.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Billing Address Option */}
                  <div className="pt-2">
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useSameBillingAddress}
                        onChange={(e) =>
                          setUseSameBillingAddress(e.target.checked)
                        }
                        className="w-4 h-4 rounded accent-slate-900"
                      />
                      <span>
                        Use selected shipping address as billing address
                      </span>
                    </label>

                    {!useSameBillingAddress && addresses.length > 1 && (
                      <div className="mt-2">
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Select Separate Billing Address
                        </label>
                        <select
                          value={separateBillingAddressId || selectedAddressId}
                          onChange={(e) =>
                            setSeparateBillingAddressId(e.target.value)
                          }
                          className="w-full min-h-[44px] px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                        >
                          {addresses.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name} — {a.street_address}, {a.city}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Payment Method + Authoritative Breakdown */}
          <div className="lg:col-span-5 space-y-6">
            <section className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-display">
                  3. Payment Method
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose online Razorpay checkout or Cash on Delivery
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('PAYMENT_GATEWAY')}
                  className={`w-full p-4 rounded-2xl border text-left transition-colors flex items-start gap-3.5 ${
                    paymentMethod === 'PAYMENT_GATEWAY'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mt-0.5 shrink-0 text-rose-500" />
                  <div>
                    <p className="text-sm font-semibold">
                      Online Payment (`PAYMENT_GATEWAY`)
                    </p>
                    <p
                      className={`text-xs mt-0.5 ${
                        paymentMethod === 'PAYMENT_GATEWAY'
                          ? 'text-slate-300'
                          : 'text-slate-500'
                      }`}
                    >
                      UPI, Cards, NetBanking via server-verified Razorpay order
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                  className={`w-full p-4 rounded-2xl border text-left transition-colors flex items-start gap-3.5 ${
                    paymentMethod === 'CASH_ON_DELIVERY'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <Truck className="w-5 h-5 mt-0.5 shrink-0 text-rose-500" />
                  <div>
                    <p className="text-sm font-semibold">
                      Cash on Delivery (`CASH_ON_DELIVERY`)
                    </p>
                    <p
                      className={`text-xs mt-0.5 ${
                        paymentMethod === 'CASH_ON_DELIVERY'
                          ? 'text-slate-300'
                          : 'text-slate-500'
                      }`}
                    >
                      Pay upon parts delivery at your selected shipping address
                    </p>
                  </div>
                </button>
              </div>

              {/* Fee & Item Breakdown */}
              <div className="pt-4 border-t border-slate-200 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Items Subtotal</span>
                  <span className="font-mono tabular-nums text-slate-900">
                    ₹{totals.itemsSubtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charge</span>
                  <span className="font-mono tabular-nums text-slate-900">
                    ₹{totals.delivery.toLocaleString('en-IN')}
                  </span>
                </div>
                {totals.mechanic > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Mechanic Service Fees</span>
                    <span className="font-mono tabular-nums text-slate-900">
                      ₹{totals.mechanic.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                {totals.driver > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Driver Fees</span>
                    <span className="font-mono tabular-nums text-slate-900">
                      ₹{totals.driver.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-slate-200 text-base font-bold text-slate-900">
                  <span>Estimated Order Total</span>
                  <span className="font-mono tabular-nums">
                    ₹{totals.grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={
                  checkoutStage !== 'IDLE' ||
                  !selectedAddressId ||
                  isItemsEmpty ||
                  hasInvalidCartPricing
                }
                onClick={handlePlaceOrder}
                className="w-full min-h-[50px] px-5 py-3.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {checkoutStage !== 'IDLE' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{checkoutStatusMessage || 'Processing...'}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>
                      {paymentMethod === 'PAYMENT_GATEWAY'
                        ? 'Proceed to Verified Payment'
                        : 'Place Cash on Delivery Order'}
                    </span>
                  </>
                )}
              </button>

              {hasInvalidCartPricing && (
                <p role="alert" className="text-xs text-red-700">
                  An item has an invalid price. Remove it from your cart before placing the order.
                </p>
              )}

              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  Final order amount and payment signature are verified
                  authoritatively by the MotoSpar server.
                </span>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};
