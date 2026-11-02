import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Edit3,
  Heart,
  Loader2,
  MessageSquarePlus,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  Trash2,
  Zap,
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
  addProductReview,
  deleteProductReview,
  editProductReview,
  fetchProductReviews,
  getProductDetail,
} from '../../services/motosparApi';
import { triggerHaptic } from '../../services/haptics';
import {
  ProductItem,
  ProductVariant,
  ReviewItem,
} from '../../types/motospar';

interface ProductDetailViewProps {
  productId: string;
  onBack: () => void;
  onNavigateToCart: () => void;
  onStartBuyNowCheckout: () => void;
}

function normalizeVariants(product: ProductItem | null): ProductVariant[] {
  if (!product) return [];
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    return product.variants;
  }
  // The product endpoint may return a flat variant. A product UUID alone is
  // not a valid variant ID for the cart/order APIs, so never use it as one.
  const fallbackId = String(
    product.variant_id || ''
  );
  if (!fallbackId) return [];
  return [
    {
      id: fallbackId,
      name: product.name || product.title || 'Standard Variant',
      price:
        product.discounted_price ??
        product.selling_price ??
        product.price ??
        product.final_listing_price_on_motospar,
      mrp: product.mrp,
      stock: product.stock,
      quantity_in_stock: product.quantity_in_stock,
      in_stock: product.in_stock,
      delivery_charge: product.delivery_charge,
      mechanic_fees: product.mechanic_fees,
      driver_fees: product.driver_fees,
      image: product.image || product.thumbnail,
      images: product.images,
    },
  ];
}

function collectGalleryImages(
  product: ProductItem | null,
  selectedVariant: ProductVariant | null
): string[] {
  const urls: string[] = [];
  const pushUrl = (candidate: unknown) => {
    if (typeof candidate === 'string' && candidate.trim()) {
      if (!urls.includes(candidate.trim())) urls.push(candidate.trim());
    } else if (candidate && typeof candidate === 'object') {
      const obj = candidate as Record<string, unknown>;
      const raw = obj.image || obj.url || obj.image_url;
      if (typeof raw === 'string' && raw.trim() && !urls.includes(raw.trim())) {
        urls.push(raw.trim());
      }
    }
  };

  if (selectedVariant) {
    pushUrl(selectedVariant.image);
    if (Array.isArray(selectedVariant.images)) {
      selectedVariant.images.forEach(pushUrl);
    }
  }
  if (product) {
    pushUrl(product.image);
    pushUrl(product.thumbnail);
    if (Array.isArray(product.images)) {
      product.images.forEach(pushUrl);
    }
  }
  return urls;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  productId,
  onBack,
  onNavigateToCart,
  onStartBuyNowCheckout,
}) => {
  const { user } = useAuth();
  const {
    addItemToCart,
    toggleWishlist,
    isVariantWishlisted,
    setBuyNowStaging,
  } = useCommerce();

  const [product, setProduct] = useState<ProductItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [includeMechanicService, setIncludeMechanicService] =
    useState<boolean>(false);

  const [actionBusy, setActionBusy] = useState<boolean>(false);
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Reviews state (POST /api/reviews/{productId}/view/)
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState<boolean>(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [reviewsOffset, setReviewsOffset] = useState<number>(0);
  const [reviewsHasNext, setReviewsHasNext] = useState<boolean>(false);

  // Review create/edit form state
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewTitle, setReviewTitle] = useState<string>('');
  const [reviewBody, setReviewBody] = useState<string>('');
  const [reviewFiles, setReviewFiles] = useState<File[]>([]);
  const [reviewSubmitting, setReviewSubmitting] = useState<boolean>(false);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProductDetail(productId);
      if (res.ok && res.data) {
        const rawProducts = res.data.products || res.data.product || res.data;
        const resolvedProduct: ProductItem | null = Array.isArray(rawProducts)
          ? rawProducts[0] || null
          : rawProducts && typeof rawProducts === 'object'
            ? (rawProducts as ProductItem)
            : null;

        if (resolvedProduct) {
          setProduct(resolvedProduct);
          const vars = normalizeVariants(resolvedProduct);
          if (vars.length > 0) {
            setSelectedVariantId(String(vars[0].id || vars[0].variant_id || ''));
          }
        } else {
          setError('Product record was empty in the server response.');
        }
      } else {
        setError(res.message);
      }
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const loadReviews = useCallback(
    async (targetOffset = 0, append = false) => {
      setReviewsLoading(true);
      setReviewsError(null);
      try {
        const res = await fetchProductReviews(productId, {
          limit: 10,
          offset: targetOffset,
        });
        if (res.ok && res.data) {
          const list =
            res.data.reviews ||
            res.data.results ||
            (Array.isArray(res.data)
              ? (res.data as unknown as ReviewItem[])
              : []);
          const safeList = Array.isArray(list) ? list : [];
          setReviews((prev) => (append ? [...prev, ...safeList] : safeList));
          setReviewsHasNext(Boolean(res.data.has_next));
          setReviewsOffset(targetOffset);
        } else {
          if (!append) setReviews([]);
          setReviewsError(res.message);
        }
      } finally {
        setReviewsLoading(false);
      }
    },
    [productId]
  );

  useEffect(() => {
    loadProduct();
    loadReviews(0, false);
  }, [loadProduct, loadReviews]);

  const variants = useMemo(() => normalizeVariants(product), [product]);
  const selectedVariant = useMemo(
    () =>
      variants.find(
        (v) => String(v.id || v.variant_id) === selectedVariantId
      ) ||
      variants[0] ||
      null,
    [variants, selectedVariantId]
  );

  const galleryImages = useMemo(
    () => collectGalleryImages(product, selectedVariant),
    [product, selectedVariant]
  );

  const rawUnitPrice =
    selectedVariant?.discounted_price ??
    selectedVariant?.selling_price ??
    selectedVariant?.price ??
    selectedVariant?.final_listing_price_on_motospar ??
    product?.discounted_price ??
    product?.selling_price ??
    product?.price ??
    product?.final_listing_price_on_motospar;
  const unitPrice = useMemo(() => {
    const raw = rawUnitPrice;
    const num = Number(raw);
    return Number.isFinite(num) && num >= 0 ? num : null;
  }, [rawUnitPrice]);

  const deliveryCharge = useMemo(() => {
    const raw =
      selectedVariant?.delivery_charge ?? product?.delivery_charge ?? 0;
    const num = Number(raw);
    return Number.isFinite(num) ? num : 0;
  }, [selectedVariant, product]);

  const mechanicFees = useMemo(() => {
    const raw = selectedVariant?.mechanic_fees ?? product?.mechanic_fees ?? 0;
    const num = Number(raw);
    return Number.isFinite(num) ? num : 0;
  }, [selectedVariant, product]);

  const driverFees = useMemo(() => {
    const raw = selectedVariant?.driver_fees ?? product?.driver_fees ?? 0;
    const num = Number(raw);
    return Number.isFinite(num) ? num : 0;
  }, [selectedVariant, product]);

  const stockCount = useMemo(() => {
    const raw =
      selectedVariant?.quantity_in_stock ??
      selectedVariant?.stock ??
      selectedVariant?.quantity ??
      product?.quantity_in_stock ??
      product?.stock;
    if (raw === undefined || raw === null) return null;
    const num = Number(raw);
    return Number.isNaN(num) ? null : num;
  }, [selectedVariant, product]);

  const isOutOfStock =
    selectedVariant?.in_stock === false ||
    selectedVariant?.is_in_stock === false ||
    product?.in_stock === false ||
    (stockCount !== null && stockCount <= 0);

  const activeVariantUuid = String(
    selectedVariant?.id || selectedVariant?.variant_id || ''
  );
  const hasInvalidFees = [deliveryCharge, driverFees, mechanicFees].some(
    (amount) => amount < 0
  );
  const canPurchase = Boolean(
    selectedVariant && activeVariantUuid && unitPrice !== null && !hasInvalidFees && !isOutOfStock
  );
  const hasInvalidPrice =
    rawUnitPrice !== undefined &&
    rawUnitPrice !== null &&
    rawUnitPrice !== '' &&
    (!Number.isFinite(Number(rawUnitPrice)) || Number(rawUnitPrice) < 0);
  const purchaseDisabledReason = !activeVariantUuid
    ? 'The server did not return a purchasable variant for this part.'
    : unitPrice === null
      ? hasInvalidPrice
        ? 'This part has an invalid price and cannot be purchased. Please contact support.'
        : 'The server did not return a price for this variant.'
      : hasInvalidFees
        ? 'This part has an invalid delivery or installation fee. Please contact support.'
      : isOutOfStock
        ? 'This variant is currently out of stock.'
        : null;
  const wishlisted = isVariantWishlisted(activeVariantUuid);

  const handleAddToCart = async () => {
    if (!canPurchase || !selectedVariant || unitPrice === null) return;
    setActionBusy(true);
    setFeedbackBanner(null);
    try {
      const res = await addItemToCart({
        variant: activeVariantUuid,
        quantity,
        price_at_addition: unitPrice,
        delivery_charge: deliveryCharge,
        mechanic_fees: includeMechanicService ? mechanicFees : 0,
        driver_fees: driverFees,
      });
      if (res.ok) {
        setFeedbackBanner({
          type: 'success',
          text: 'Added to your MotoSpar cart.',
        });
      } else {
        setFeedbackBanner({
          type: 'error',
          text: res.message,
        });
      }
    } finally {
      setActionBusy(false);
    }
  };

  const handleBuyNow = () => {
    if (!canPurchase || !selectedVariant || unitPrice === null) return;
    triggerHaptic('impactMedium');
    setBuyNowStaging({
      productId: String(product?.id || productId),
      productName:
        product?.name ||
        product?.title ||
        selectedVariant.name ||
        'MotoSpar Part',
      variant: selectedVariant,
      quantity,
      unitPrice,
      deliveryCharge,
      mechanicFees: includeMechanicService ? mechanicFees : 0,
      driverFees,
      image: galleryImages[0] || null,
    });
    onStartBuyNowCheckout();
  };

  const handleToggleWishlist = async () => {
    setActionBusy(true);
    try {
      const res = await toggleWishlist(activeVariantUuid);
      if (!res.ok) {
        setFeedbackBanner({ type: 'error', text: res.message });
      }
    } finally {
      setActionBusy(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewBody.trim()) return;
    setReviewSubmitting(true);
    setFeedbackBanner(null);

    try {
      const userId = String(user?.id || user?.user_id || user?.pk || '');
      if (editingReviewId) {
        const res = await editProductReview(editingReviewId, {
          rating: reviewRating,
          title: reviewTitle.trim(),
          body: reviewBody.trim(),
          images: reviewFiles.length > 0 ? reviewFiles : undefined,
        });
        if (res.ok) {
          setShowReviewForm(false);
          setEditingReviewId(null);
          setReviewTitle('');
          setReviewBody('');
          setReviewFiles([]);
          await loadReviews(0, false);
        } else {
          setFeedbackBanner({ type: 'error', text: res.message });
        }
      } else {
        const res = await addProductReview({
          product: String(product?.id || productId),
          user: userId,
          rating: reviewRating,
          title: reviewTitle.trim(),
          body: reviewBody.trim(),
          images: reviewFiles.length > 0 ? reviewFiles : undefined,
        });
        if (res.ok) {
          setShowReviewForm(false);
          setReviewTitle('');
          setReviewBody('');
          setReviewFiles([]);
          await loadReviews(0, false);
        } else {
          setFeedbackBanner({ type: 'error', text: res.message });
        }
      }
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    setDeletingReviewId(reviewId);
    try {
      const res = await deleteProductReview(reviewId);
      if (res.ok) {
        await loadReviews(0, false);
      } else {
        setFeedbackBanner({ type: 'error', text: res.message });
      }
    } finally {
      setDeletingReviewId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>
        <LoadingState label="Loading product details from MotoSpar..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>
        <ErrorState
          title="Unable to Load Product Detail"
          message={error || 'Product not found.'}
          onRetry={loadProduct}
        />
      </div>
    );
  }

  const title = product.name || product.title || 'Automotive Part';
  const metadataLine = [
    product.brand ? String(product.brand) : null,
    product.model ? String(product.model) : null,
    product.year ? String(product.year) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="space-y-8 pb-10">
      {/* Top Back Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] px-3 py-2 -ml-3 rounded-xl inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>

        <button
          type="button"
          onClick={handleToggleWishlist}
          disabled={actionBusy}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors inline-flex items-center gap-2"
        >
          <Heart
            className={`w-4 h-4 ${
              wishlisted ? 'fill-rose-600 text-rose-600' : 'text-slate-600'
            }`}
          />
          <span>{wishlisted ? 'Saved in Wishlist' : 'Save to Wishlist'}</span>
        </button>
      </div>

      {feedbackBanner && (
        <div
          role={feedbackBanner.type === 'error' ? 'alert' : 'status'}
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
            feedbackBanner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedbackBanner.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-medium">{feedbackBanner.text}</span>
          </div>
          {feedbackBanner.type === 'success' && (
            <button
              type="button"
              onClick={onNavigateToCart}
              className="min-h-[36px] px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-semibold hover:bg-emerald-800 whitespace-nowrap"
            >
              View Cart
            </button>
          )}
        </div>
      )}

      {/* Contiguous Purchase Module (2-Column Split on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Product Media Gallery */}
        <div className="lg:col-span-6 space-y-3">
          <div className="aspect-4/3 bg-white border border-slate-200 rounded-3xl overflow-hidden">
            <PartImage
              src={galleryImages[activeImageIdx] || null}
              alt={title}
              className="w-full h-full"
            />
          </div>

          {galleryImages.length > 1 && (
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {galleryImages.map((imgUrl, idx) => (
                <button
                  key={imgUrl}
                  type="button"
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-18 h-18 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImageIdx === idx
                      ? 'border-rose-600'
                      : 'border-slate-200 opacity-75 hover:opacity-100'
                  }`}
                >
                  <PartImage
                    src={imgUrl}
                    alt={`${title} view ${idx + 1}`}
                    className="w-full h-full"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Contiguous Purchase & Variant Module */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 space-y-6">
          <div>
            {metadataLine && (
              <p className="text-xs text-slate-500 mb-1.5">{metadataLine}</p>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
              {title}
            </h1>

            <div className="mt-4 flex items-baseline gap-3">
              {unitPrice !== null ? (
                <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
                  ₹{unitPrice.toLocaleString('en-IN')}
                </span>
              ) : (
                <span className="text-sm font-medium text-slate-600">
                  Price unavailable from server
                </span>
              )}

              {selectedVariant?.mrp &&
                Number(selectedVariant.mrp) > (unitPrice || 0) && (
                  <span className="text-sm text-slate-400 line-through font-mono tabular-nums">
                    ₹{Number(selectedVariant.mrp).toLocaleString('en-IN')}
                  </span>
                )}

              <span className="text-xs text-slate-500">·</span>

              <span
                className={`text-xs font-semibold ${
                  isOutOfStock ? 'text-red-600' : 'text-emerald-700'
                }`}
              >
                {isOutOfStock
                  ? 'Out of Stock'
                  : stockCount !== null
                    ? `In Stock (${stockCount} units)`
                    : 'Available'}
              </span>
            </div>
          </div>

          {/* Variant Selector */}
          {variants.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Select Variant ({variants.length})
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {variants.map((v) => {
                  const vId = String(v.id || v.variant_id || '');
                  const isSelected = vId === selectedVariantId;
                  const vPrice = v.selling_price ?? v.price;
                  return (
                    <button
                      key={vId}
                      type="button"
                      onClick={() => {
                        triggerHaptic('selection');
                        setSelectedVariantId(vId);
                        setActiveImageIdx(0);
                      }}
                      className={`min-h-[48px] p-3 rounded-xl border text-left transition-colors flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs font-semibold truncate">
                        {v.name || v.title || v.sku || `Variant ${vId.slice(0, 6)}`}
                      </span>
                      {vPrice !== undefined && (
                        <span className="text-xs font-mono tabular-nums shrink-0">
                          ₹{Number(vPrice).toLocaleString('en-IN')}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity & Service Fee Breakdown */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                Quantity
              </span>
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection');
                    setQuantity((q) => Math.max(1, q - 1));
                  }}
                  aria-label="Decrease quantity"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-sm font-mono font-semibold tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection');
                    setQuantity((q) =>
                      stockCount !== null ? Math.min(stockCount, q + 1) : q + 1
                    );
                  }}
                  aria-label="Increase quantity"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Server-Returned Fees */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Server Delivery Charge</span>
                <span className="font-mono tabular-nums text-slate-900">
                  {deliveryCharge >= 0
                    ? `₹${deliveryCharge.toLocaleString('en-IN')}`
                    : 'Unavailable'}
                </span>
              </div>
              {driverFees > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Driver Fees</span>
                  <span className="font-mono tabular-nums text-slate-900">
                    ₹{driverFees.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              {mechanicFees > 0 && (
                <label className="flex items-center justify-between pt-2 border-t border-slate-200 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={includeMechanicService}
                      onChange={(e) =>
                        setIncludeMechanicService(e.target.checked)
                      }
                      className="w-4 h-4 rounded accent-rose-600"
                    />
                    <span className="font-medium text-slate-800">
                      Include Mechanic Installation Service
                    </span>
                  </div>
                  <span className="font-mono tabular-nums font-semibold text-slate-900">
                    +₹{mechanicFees.toLocaleString('en-IN')}
                  </span>
                </label>
              )}
            </div>
          </div>

          {/* Primary Purchase Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              disabled={actionBusy || !canPurchase}
              onClick={handleAddToCart}
              className="min-h-[48px] px-5 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {actionBusy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShoppingBag className="w-4 h-4" />
              )}
              <span>Add to Cart</span>
            </button>

            <button
              type="button"
              disabled={actionBusy || !canPurchase}
              onClick={handleBuyNow}
              className="min-h-[48px] px-5 py-3 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>Buy Now</span>
            </button>
          </div>
              {purchaseDisabledReason && (
            <p role="status" className="text-xs text-amber-700">
              {purchaseDisabledReason}
            </p>
          )}

          {/* Product Description */}
          {product.description && (
            <div className="pt-4 border-t border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900 mb-2">
                Technical Description
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {String(product.description)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Product Reviews Section */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">
              Customer Reviews
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified reviews loaded from MotoSpar API
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingReviewId(null);
              setReviewRating(5);
              setReviewTitle('');
              setReviewBody('');
              setReviewFiles([]);
              setShowReviewForm((v) => !v);
            }}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors inline-flex items-center gap-2 self-start"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>{showReviewForm ? 'Cancel Review' : 'Write a Review'}</span>
          </button>
        </div>

        {/* Multipart Review Form (Create / Edit) */}
        {showReviewForm && (
          <form
            onSubmit={handleReviewSubmit}
            className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4"
          >
            <h3 className="text-sm font-semibold text-slate-900">
              {editingReviewId ? 'Edit Your Review' : 'Submit Product Review'}
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="min-h-[44px] min-w-[44px] rounded-xl bg-white border border-slate-200 flex items-center justify-center"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= reviewRating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Review Title
              </label>
              <input
                type="text"
                required
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="Summarize fitment and quality"
                className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Review Details
              </label>
              <textarea
                rows={3}
                required
                value={reviewBody}
                onChange={(e) => setReviewBody(e.target.value)}
                placeholder="Share your installation and performance experience..."
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Photos (Optional Multipart Upload)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = e.target.files
                    ? Array.from(e.target.files)
                    : [];
                  setReviewFiles(files);
                }}
                className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="min-h-[44px] px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reviewSubmitting}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 disabled:opacity-60 inline-flex items-center gap-2"
              >
                {reviewSubmitting && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                <span>
                  {editingReviewId ? 'Update Review' : 'Post Review'}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* Reviews List */}
        {reviewsLoading ? (
          <LoadingState label="Loading product reviews..." />
        ) : reviewsError ? (
          <ErrorState
            title="Could Not Load Reviews"
            message={reviewsError}
            onRetry={() => loadReviews(0, false)}
          />
        ) : reviews.length === 0 ? (
          <EmptyState
            title="No Reviews Yet"
            description="No customer reviews have been submitted for this part yet."
          />
        ) : (
          <div className="divide-y divide-slate-200">
            {reviews.map((rev) => {
              const author =
                rev.user_name ||
                (typeof rev.user === 'object' && rev.user
                  ? rev.user.name ||
                    `${rev.user.first_name || ''} ${rev.user.last_name || ''}`.trim() ||
                    rev.user.email
                  : 'Verified Customer');

              return (
                <div key={rev.id} className="py-5 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= Number(rev.rating || 0)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs font-medium text-slate-700">
                          {author}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 mt-1.5">
                        {rev.title}
                      </h4>
                      <p className="text-sm text-slate-600 mt-1">
                        {rev.body}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingReviewId(rev.id);
                          setReviewRating(Number(rev.rating) || 5);
                          setReviewTitle(rev.title || '');
                          setReviewBody(rev.body || '');
                          setReviewFiles([]);
                          setShowReviewForm(true);
                        }}
                        aria-label="Edit review"
                        className="min-h-[40px] min-w-[40px] rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={deletingReviewId === rev.id}
                        onClick={() => handleDeleteReview(rev.id)}
                        aria-label="Delete review"
                        className="min-h-[40px] min-w-[40px] rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 flex items-center justify-center"
                      >
                        {deletingReviewId === rev.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {reviewsHasNext && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => loadReviews(reviewsOffset + 10, true)}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Load More Reviews
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
