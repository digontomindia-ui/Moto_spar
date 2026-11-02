import { Capacitor } from '@capacitor/core';
import { getEnvChatWebhookUrl } from '../config/env';
import {
  AddReviewMultipartFields,
  ApiResult,
  CartAddRequest,
  CartEditRequest,
  CartItem,
  ContactUsRequest,
  CreateBuyNowOrderRequest,
  CreateOrderFromCartRequest,
  CustomerRegisterRequest,
  EditReviewMultipartFields,
  GoogleLoginCallbackRequest,
  LoginViaEmailRequest,
  LogoutRequest,
  MotoSparOrder,
  MotoSparUser,
  NotificationItem,
  PaginationRequest,
  ProductItem,
  ProductSearchRequest,
  ProfileUpdateMultipartFields,
  RazorpayCallbackRequest,
  RazorpayInitiateData,
  RazorpayPrefill,
  RequestPasswordResetPayload,
  ResetPasswordPayload,
  ReviewItem,
  ShippingAddress,
  ShippingAddressAddRequest,
  ShippingAddressEditRequest,
  SubCategoryItem,
  VerifyPasswordResetOtpPayload,
  WishlistItem,
} from '../types/motospar';
import { requestMotoSpar } from './apiClient';

/**
 * Complete MotoSpar Customer API service layer.
 * Every endpoint path, HTTP method, trailing slash, and payload contract matches
 * API_INTEGRATION.md and ARCHITECTURE.md without mock fallbacks.
 */

// ============================================================================
// 1. AUTHENTICATION & ACCOUNT ENDPOINTS
// ============================================================================

export interface AuthSessionPayload {
  status?: string | boolean;
  access?: string;
  refresh?: string;
  user?: MotoSparUser;
  [key: string]: unknown;
}

/** POST /api/login-via-email/ */
export function loginViaEmail(
  payload: LoginViaEmailRequest
): Promise<ApiResult<AuthSessionPayload>> {
  return requestMotoSpar<AuthSessionPayload>({
    method: 'POST',
    path: 'login-via-email',
    authenticated: false,
    jsonBody: payload,
  });
}

/** POST /api/google/login/callback/ */
export function googleLoginCallback(
  payload: GoogleLoginCallbackRequest
): Promise<ApiResult<AuthSessionPayload>> {
  return requestMotoSpar<AuthSessionPayload>({
    method: 'POST',
    path: 'google/login/callback',
    authenticated: false,
    jsonBody: payload,
  });
}

/** POST /api/customer/register/ */
export function registerCustomer(
  payload: CustomerRegisterRequest
): Promise<ApiResult<AuthSessionPayload>> {
  return requestMotoSpar<AuthSessionPayload>({
    method: 'POST',
    path: 'customer/register',
    authenticated: false,
    jsonBody: payload,
  });
}

/** POST /api/customer/account-deletion-request/ */
export function requestAccountDeletion(): Promise<ApiResult<Record<string, unknown>>> {
  return requestMotoSpar<Record<string, unknown>>({
    method: 'POST',
    path: 'customer/account-deletion-request',
    authenticated: true,
  });
}

/** POST /api/request-password-reset/ */
export function requestPasswordReset(
  payload: RequestPasswordResetPayload
): Promise<ApiResult<Record<string, unknown>>> {
  return requestMotoSpar<Record<string, unknown>>({
    method: 'POST',
    path: 'request-password-reset',
    authenticated: false,
    jsonBody: payload,
  });
}

/** POST /api/password-reset/verify-otp/ */
export function verifyPasswordResetOtp(
  payload: VerifyPasswordResetOtpPayload
): Promise<ApiResult<Record<string, unknown>>> {
  return requestMotoSpar<Record<string, unknown>>({
    method: 'POST',
    path: 'password-reset/verify-otp',
    authenticated: false,
    jsonBody: payload,
  });
}

/** POST /api/reset-password/ */
export function resetPassword(
  payload: ResetPasswordPayload
): Promise<ApiResult<Record<string, unknown>>> {
  return requestMotoSpar<Record<string, unknown>>({
    method: 'POST',
    path: 'reset-password',
    authenticated: false,
    jsonBody: payload,
  });
}

/** POST /api/logout/ */
export function logoutCustomer(
  payload: LogoutRequest
): Promise<ApiResult<Record<string, unknown>>> {
  return requestMotoSpar<Record<string, unknown>>({
    method: 'POST',
    path: 'logout',
    authenticated: true,
    jsonBody: payload,
    skipAutoRefresh: true,
  });
}

/** PATCH /api/profile/update/ (Multipart) */
export function updateCustomerProfile(
  fields: ProfileUpdateMultipartFields
): Promise<ApiResult<AuthSessionPayload>> {
  const formData = new FormData();
  formData.append('first_name', fields.first_name);
  formData.append('last_name', fields.last_name);
  formData.append('phone_number', fields.phone_number);
  formData.append('address', fields.address);
  formData.append('state', fields.state);
  formData.append('postal_code', fields.postal_code);
  formData.append('country', fields.country);
  formData.append('bio', fields.bio);
  if (fields.profile_picture instanceof File) {
    formData.append('profile_picture', fields.profile_picture);
  }

  return requestMotoSpar<AuthSessionPayload>({
    method: 'PATCH',
    path: 'profile/update',
    authenticated: true,
    multipartBody: formData,
  });
}

/** POST /api/contact-us/ */
export function submitContactUs(
  payload: ContactUsRequest
): Promise<ApiResult<Record<string, unknown>>> {
  return requestMotoSpar<Record<string, unknown>>({
    method: 'POST',
    path: 'contact-us',
    authenticated: false,
    jsonBody: payload,
  });
}

// ============================================================================
// 2. CATALOG & PRODUCT ENDPOINTS
// ============================================================================

export interface ProductSearchResponseData {
  products?: ProductItem[];
  results?: ProductItem[];
  has_next?: boolean;
  total?: number;
  count?: number;
  [key: string]: unknown;
}

/** POST /api/products/search/ (Bearer authenticated in current app, page size 15) */
export function searchProducts(
  payload: ProductSearchRequest
): Promise<ApiResult<ProductSearchResponseData>> {
  return requestMotoSpar<ProductSearchResponseData>({
    method: 'POST',
    path: 'products/search',
    authenticated: true,
    jsonBody: payload,
  });
}

export interface ProductDetailResponseData {
  products?: ProductItem | ProductItem[];
  product?: ProductItem;
  [key: string]: unknown;
}

/** GET /api/products/{productId}/ (Bearer authenticated in current app) */
export function getProductDetail(
  productId: string
): Promise<ApiResult<ProductDetailResponseData>> {
  return requestMotoSpar<ProductDetailResponseData>({
    method: 'GET',
    path: `products/${encodeURIComponent(productId)}`,
    authenticated: true,
  });
}

export interface SubCategoriesResponseData {
  subcategories?: SubCategoryItem[];
  sub_categories?: SubCategoryItem[];
  [key: string]: unknown;
}

/** GET /api/sub-categories/{categoryId}/ (Public in current app) */
export function getSubCategories(
  categoryId: string
): Promise<ApiResult<SubCategoriesResponseData>> {
  return requestMotoSpar<SubCategoriesResponseData>({
    method: 'GET',
    path: `sub-categories/${encodeURIComponent(categoryId)}`,
    authenticated: false,
  });
}

// ============================================================================
// 3. CART & SAVED SHIPPING ADDRESSES
// ============================================================================

/** POST /api/customer/cart/add/ */
export function addToCart(
  payload: CartAddRequest
): Promise<ApiResult<Record<string, unknown>>> {
  return requestMotoSpar<Record<string, unknown>>({
    method: 'POST',
    path: 'customer/cart/add',
    authenticated: true,
    jsonBody: payload,
  });
}

/** PATCH /api/customer/cart/{cartItemId}/edit/ */
export function editCartItem(
  cartItemId: string,
  payload: CartEditRequest
): Promise<ApiResult<Record<string, unknown>>> {
  return requestMotoSpar<Record<string, unknown>>({
    method: 'PATCH',
    path: `customer/cart/${encodeURIComponent(cartItemId)}/edit`,
    authenticated: true,
    jsonBody: payload,
  });
}

export interface CartViewResponseData {
  cart_item?: CartItem[];
  cart_items?: CartItem[];
  items?: CartItem[];
  [key: string]: unknown;
}

/** GET /api/customer/cart/view/ */
export function viewCart(): Promise<ApiResult<CartViewResponseData>> {
  return requestMotoSpar<CartViewResponseData>({
    method: 'GET',
    path: 'customer/cart/view',
    authenticated: true,
  });
}

/** DELETE /api/customer/cart/{cartItemId}/delete/ */
export function deleteCartItem(
  cartItemId: string
): Promise<ApiResult<Record<string, unknown>>> {
  return requestMotoSpar<Record<string, unknown>>({
    method: 'DELETE',
    path: `customer/cart/${encodeURIComponent(cartItemId)}/delete`,
    authenticated: true,
  });
}

/** POST /api/customer/shipping-address/add/ */
export function addShippingAddress(
  payload: ShippingAddressAddRequest
): Promise<ApiResult<{ shipping_address?: ShippingAddress; [key: string]: unknown }>> {
  return requestMotoSpar<{ shipping_address?: ShippingAddress; [key: string]: unknown }>({
    method: 'POST',
    path: 'customer/shipping-address/add',
    authenticated: true,
    jsonBody: payload,
  });
}

export interface ShippingAddressesViewData {
  shipping_addresses?: ShippingAddress[];
  addresses?: ShippingAddress[];
  [key: string]: unknown;
}

/** GET /api/customer/shipping-address/view/ */
export function viewShippingAddresses(): Promise<
  ApiResult<ShippingAddressesViewData>
> {
  return requestMotoSpar<ShippingAddressesViewData>({
    method: 'GET',
    path: 'customer/shipping-address/view',
    authenticated: true,
  });
}

/** PATCH /api/customer/shipping-address/{addressId}/edit/ */
export function editShippingAddress(
  addressId: string,
  payload: ShippingAddressEditRequest
): Promise<ApiResult<{ shipping_address?: ShippingAddress; [key: string]: unknown }>> {
  return requestMotoSpar<{ shipping_address?: ShippingAddress; [key: string]: unknown }>({
    method: 'PATCH',
    path: `customer/shipping-address/${encodeURIComponent(addressId)}/edit`,
    authenticated: true,
    jsonBody: payload,
  });
}

/** DELETE /api/customer/shipping-address/{addressId}/delete/ */
export function deleteShippingAddress(
  addressId: string
): Promise<ApiResult<Record<string, unknown>>> {
  return requestMotoSpar<Record<string, unknown>>({
    method: 'DELETE',
    path: `customer/shipping-address/${encodeURIComponent(addressId)}/delete`,
    authenticated: true,
  });
}

// ============================================================================
// 4. CHECKOUT, ORDER CREATION & RAZORPAY ONLINE PAYMENT
// ============================================================================

export interface OrderCreateResponseData {
  order?: MotoSparOrder;
  id?: string;
  [key: string]: unknown;
}

/**
 * POST /api/customer/order/create-from-cart/
 * No automatic retries for order-creating calls.
 */
export function createOrderFromCart(
  payload: CreateOrderFromCartRequest
): Promise<ApiResult<OrderCreateResponseData>> {
  return requestMotoSpar<OrderCreateResponseData>({
    method: 'POST',
    path: 'customer/order/create-from-cart',
    authenticated: true,
    jsonBody: payload,
  });
}

/**
 * POST /api/customer/order/create/ (Buy-now order)
 * No automatic retries for order-creating calls.
 */
export function createBuyNowOrder(
  payload: CreateBuyNowOrderRequest
): Promise<ApiResult<OrderCreateResponseData>> {
  return requestMotoSpar<OrderCreateResponseData>({
    method: 'POST',
    path: 'customer/order/create',
    authenticated: true,
    jsonBody: payload,
  });
}

/**
 * POST /api/customer/order/payment/razorpay/
 * Initiates a server-created Razorpay order for an existing MotoSpar order UUID.
 * Reads both `data.razorpay_order_id` and top-level `prefill` details.
 */
export async function initiateRazorpayPayment(orderId: string): Promise<{
  result: ApiResult<RazorpayInitiateData>;
  razorpayOrderId: string | null;
  prefill: RazorpayPrefill | null;
}> {
  const result = await requestMotoSpar<RazorpayInitiateData>({
    method: 'POST',
    path: 'customer/order/payment/razorpay',
    authenticated: true,
    jsonBody: { order_id: orderId },
  });

  const rawTop = result.raw || {};
  const dataObj: RazorpayInitiateData = result.data ?? {
    razorpay_order_id: '',
  };
  const razorpayOrderId =
    (typeof dataObj.razorpay_order_id === 'string' &&
      dataObj.razorpay_order_id) ||
    (typeof rawTop.razorpay_order_id === 'string' &&
      rawTop.razorpay_order_id) ||
    null;

  const prefill =
    (rawTop.prefill && typeof rawTop.prefill === 'object'
      ? (rawTop.prefill as RazorpayPrefill)
      : null) ||
    (dataObj.prefill && typeof dataObj.prefill === 'object'
      ? (dataObj.prefill as RazorpayPrefill)
      : null);

  return {
    result,
    razorpayOrderId,
    prefill,
  };
}

export interface RazorpayCallbackResponseData {
  order?: MotoSparOrder;
  status?: string;
  [key: string]: unknown;
}

/**
 * POST /api/customer/order/payment/razorpay/callback/
 * Verifies Razorpay signature on the server before marking order paid.
 */
export function verifyRazorpayCallback(
  payload: RazorpayCallbackRequest
): Promise<ApiResult<RazorpayCallbackResponseData>> {
  return requestMotoSpar<RazorpayCallbackResponseData>({
    method: 'POST',
    path: 'customer/order/payment/razorpay/callback',
    authenticated: true,
    jsonBody: payload,
  });
}

// ============================================================================
// 5. ORDERS, WISHLIST, REVIEWS & NOTIFICATIONS
// ============================================================================

export interface OrdersListResponseData {
  orders?: MotoSparOrder[];
  results?: MotoSparOrder[];
  has_next?: boolean;
  [key: string]: unknown;
}

/** POST /api/customer/orders/ (page size 10) */
export function fetchCustomerOrders(
  pagination: PaginationRequest = { limit: 10, offset: 0 }
): Promise<ApiResult<OrdersListResponseData>> {
  return requestMotoSpar<OrdersListResponseData>({
    method: 'POST',
    path: 'customer/orders',
    authenticated: true,
    jsonBody: pagination,
  });
}

/**
 * Retrieves real-time order status and shipping progress for a given Order ID
 * or Order Number from the MotoSpar backend (`POST /api/customer/orders/`).
 * Scans paginated server responses up to 5 pages if the order is not on the first page.
 */
export async function fetchOrderByIdFromBackend(
  orderIdOrNumber: string
): Promise<{
  ok: boolean;
  order: MotoSparOrder | null;
  message: string;
  httpStatus: number | null;
  endpoint: string;
}> {
  const normalizedTarget = orderIdOrNumber.trim().replace(/^#/, '').toLowerCase();
  if (!normalizedTarget) {
    return {
      ok: false,
      order: null,
      message: 'Please enter a valid MotoSpar Order ID or Order Number.',
      httpStatus: null,
      endpoint: '/api/customer/orders/',
    };
  }

  const pageSize = 10;
  const maxPagesToScan = 5;

  for (let page = 0; page < maxPagesToScan; page++) {
    const offset = page * pageSize;
    const res = await fetchCustomerOrders({ limit: pageSize, offset });

    if (!res.ok || !res.data) {
      return {
        ok: false,
        order: null,
        message: res.message || 'Unable to retrieve order status from MotoSpar server.',
        httpStatus: res.httpStatus,
        endpoint: res.endpoint,
      };
    }

    const list =
      res.data.orders ||
      res.data.results ||
      (Array.isArray(res.data) ? (res.data as unknown as MotoSparOrder[]) : []);
    const safeList = Array.isArray(list) ? list : [];

    const matched = safeList.find((ord) => {
      const idStr = String(ord.id || '').toLowerCase();
      const numStr = String(ord.order_number || '').toLowerCase();
      return (
        idStr === normalizedTarget ||
        numStr === normalizedTarget ||
        idStr.startsWith(normalizedTarget)
      );
    });

    if (matched) {
      return {
        ok: true,
        order: matched,
        message: 'Live order status retrieved from MotoSpar backend.',
        httpStatus: res.httpStatus,
        endpoint: res.endpoint,
      };
    }

    if (!res.data.has_next || safeList.length === 0) {
      break;
    }
  }

  return {
    ok: false,
    order: null,
    message: `No order matching "${orderIdOrNumber.trim()}" was found in your MotoSpar account.`,
    httpStatus: 404,
    endpoint: '/api/customer/orders/',
  };
}

/** GET /api/customer/wishlist/toggle/{variantId}/ */
export function toggleWishlistVariant(
  variantId: string
): Promise<ApiResult<Record<string, unknown>>> {
  return requestMotoSpar<Record<string, unknown>>({
    method: 'GET',
    path: `customer/wishlist/toggle/${encodeURIComponent(variantId)}`,
    authenticated: true,
  });
}

export interface WishlistViewResponseData {
  wishlist_items?: WishlistItem[];
  items?: WishlistItem[];
  has_next?: boolean;
  [key: string]: unknown;
}

/** POST /api/customer/wishlist/items/view/ (page size 10) */
export function fetchWishlistItems(
  pagination: PaginationRequest = { limit: 10, offset: 0 }
): Promise<ApiResult<WishlistViewResponseData>> {
  return requestMotoSpar<WishlistViewResponseData>({
    method: 'POST',
    path: 'customer/wishlist/items/view',
    authenticated: true,
    jsonBody: pagination,
  });
}

/** POST /api/customer/reviews/add/ (Multipart) */
export function addProductReview(
  fields: AddReviewMultipartFields
): Promise<ApiResult<Record<string, unknown>>> {
  const formData = new FormData();
  formData.append('product', fields.product);
  formData.append('user', fields.user);
  formData.append('rating', String(fields.rating));
  formData.append('title', fields.title);
  formData.append('body', fields.body);

  if (Array.isArray(fields.images) && fields.images.length > 0) {
    fields.images.forEach((file) => {
      if (file instanceof File) {
        formData.append('images', file);
      }
    });
  }

  return requestMotoSpar<Record<string, unknown>>({
    method: 'POST',
    path: 'customer/reviews/add',
    authenticated: true,
    multipartBody: formData,
  });
}

/**
 * PATCH /api/reviews/{reviewId}/edit/ (Multipart)
 * Fixes the legacy EditReview undefined `images` bug by appending `images`
 * only when actual File objects are selected.
 */
export function editProductReview(
  reviewId: string,
  fields: EditReviewMultipartFields
): Promise<ApiResult<Record<string, unknown>>> {
  const formData = new FormData();
  formData.append('rating', String(fields.rating));
  formData.append('title', fields.title);
  formData.append('body', fields.body);

  if (Array.isArray(fields.images) && fields.images.length > 0) {
    fields.images.forEach((file) => {
      if (file instanceof File) {
        formData.append('images', file);
      }
    });
  }

  return requestMotoSpar<Record<string, unknown>>({
    method: 'PATCH',
    path: `reviews/${encodeURIComponent(reviewId)}/edit`,
    authenticated: true,
    multipartBody: formData,
  });
}

/** DELETE /api/reviews/{reviewId}/delete/ */
export function deleteProductReview(
  reviewId: string
): Promise<ApiResult<Record<string, unknown>>> {
  return requestMotoSpar<Record<string, unknown>>({
    method: 'DELETE',
    path: `reviews/${encodeURIComponent(reviewId)}/delete`,
    authenticated: true,
  });
}

export interface ProductReviewsViewData {
  reviews?: ReviewItem[];
  results?: ReviewItem[];
  has_next?: boolean;
  [key: string]: unknown;
}

/** POST /api/reviews/{productId}/view/ (page size 10) */
export function fetchProductReviews(
  productId: string,
  pagination: PaginationRequest = { limit: 10, offset: 0 }
): Promise<ApiResult<ProductReviewsViewData>> {
  return requestMotoSpar<ProductReviewsViewData>({
    method: 'POST',
    path: `reviews/${encodeURIComponent(productId)}/view`,
    authenticated: true,
    jsonBody: pagination,
  });
}

export interface NotificationsViewData {
  notifications?: NotificationItem[];
  [key: string]: unknown;
}

/** POST /api/customer/notifications/ */
export function fetchNotifications(): Promise<
  ApiResult<NotificationsViewData>
> {
  return requestMotoSpar<NotificationsViewData>({
    method: 'POST',
    path: 'customer/notifications',
    authenticated: true,
  });
}

/** POST /api/customer/notifications/mark-all-read/ */
export function markAllNotificationsRead(): Promise<
  ApiResult<Record<string, unknown>>
> {
  return requestMotoSpar<Record<string, unknown>>({
    method: 'POST',
    path: 'customer/notifications/mark-all-read',
    authenticated: true,
  });
}

// ============================================================================
// 6. N8N CHAT ASSISTANT WEBHOOK
// ============================================================================

export async function sendN8nChatMessage(params: {
  chatInput: string;
  sessionId: string;
}): Promise<{ ok: boolean; reply: string; error?: string }> {
  const payload = {
    action: 'sendMessage',
    chatInput: params.chatInput,
    sessionId: params.sessionId,
    source: 'motospar-customer-mobile-app',
  };

  // A Capacitor WebView has no local Express /chat-proxy. Keep the webhook URL
  // server-side and use the same authenticated API/session handling as checkout.
  if (Capacitor.isNativePlatform()) {
    const result = await requestMotoSpar<{ reply?: string }>({
      method: 'POST',
      path: 'customer/chat',
      authenticated: true,
      jsonBody: payload,
      timeoutMs: 25000,
    });
    const reply = result.data?.reply;
    return result.ok && typeof reply === 'string' && reply.trim()
      ? { ok: true, reply }
      : { ok: false, reply: '', error: result.message };
  }

  const directWebhookUrl = getEnvChatWebhookUrl();
  const targetUrl = directWebhookUrl || '/chat-proxy';

  try {
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/plain, */*',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let errMsg = `Chat service returned HTTP ${res.status}.`;
      try {
        const errBody = await res.json();
        if (errBody && typeof errBody.message === 'string') {
          errMsg = errBody.message;
        }
      } catch {
        // Ignore parse error
      }
      return { ok: false, reply: '', error: errMsg };
    }

    const text = await res.text();
    try {
      const json = JSON.parse(text);
      const reply =
        json.output ||
        json.reply ||
        json.text ||
        json.message ||
        (Array.isArray(json) && json[0]?.output) ||
        text;
      return {
        ok: true,
        reply: typeof reply === 'string' ? reply : JSON.stringify(reply),
      };
    } catch {
      return { ok: true, reply: text };
    }
  } catch (err: unknown) {
    return {
      ok: false,
      reply: '',
      error:
        err instanceof Error
          ? err.message
          : 'Unable to connect to the MotoSpar chat webhook.',
    };
  }
}
