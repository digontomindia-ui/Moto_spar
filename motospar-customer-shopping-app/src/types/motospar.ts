/**
 * Typed Request and Response models for the MotoSpar Customer API.
 * Matches exact contracts documented in API_INTEGRATION.md and ARCHITECTURE.md.
 */

export type PaymentMethod = 'PAYMENT_GATEWAY' | 'CASH_ON_DELIVERY';

export interface MotoSparUser {
  id?: string;
  user_id?: string;
  pk?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  email: string;
  phone_number?: string;
  address?: string;
  state?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  bio?: string;
  profile_picture?: string | null;
  [key: string]: unknown;
}

export interface LoginViaEmailRequest {
  email: string;
  password: string;
}

export interface GoogleLoginCallbackRequest {
  access_token?: string;
  id_token?: string;
}

export interface CustomerRegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface RequestPasswordResetPayload {
  email: string;
}

export interface VerifyPasswordResetOtpPayload {
  email: string;
  otp: string;
}

export interface ResetPasswordPayload {
  email: string;
  new_password: string;
  confirm_password: string;
}

export interface LogoutRequest {
  refresh_token: string;
}

export interface ProfileUpdateMultipartFields {
  first_name: string;
  last_name: string;
  phone_number: string;
  address: string;
  state: string;
  postal_code: string;
  country: string;
  bio: string;
  profile_picture?: File | null;
}

export interface ContactUsRequest {
  name: string;
  email: string;
  phone_number: string;
  message: string;
}

export interface ProductSearchRequest {
  limit: number;
  offset: number;
  search?: string;
  category_id: string;
  sub_category_id: string;
  brand: string;
  model: string;
  year: string;
  min_price?: number | string;
  max_price?: number | string;
}

export interface ProductVariantImage {
  id?: string;
  image?: string;
  url?: string;
  image_url?: string;
}

export interface ProductVariant {
  id: string;
  variant_id?: string;
  name?: string;
  title?: string;
  sku?: string;
  price?: number | string;
  selling_price?: number | string;
  final_listing_price_on_motospar?: number | string;
  discounted_price?: number | string;
  mrp?: number | string;
  stock?: number;
  quantity?: number;
  quantity_in_stock?: number;
  in_stock?: boolean;
  is_in_stock?: boolean;
  delivery_charge?: number | string;
  mechanic_fees?: number | string;
  driver_fees?: number | string;
  images?: (string | ProductVariantImage)[];
  image?: string;
  attributes?: Record<string, string | number>;
  is_wishlisted?: boolean;
  [key: string]: unknown;
}

export interface ProductItem {
  id: string;
  product_id?: string;
  variant_id?: string;
  name?: string;
  title?: string;
  description?: string;
  brand?: string;
  model?: string;
  year?: string | number;
  category?: string;
  category_id?: string;
  sub_category?: string;
  sub_category_id?: string;
  price?: number | string;
  selling_price?: number | string;
  final_listing_price_on_motospar?: number | string;
  discounted_price?: number | string;
  mrp?: number | string;
  stock?: number;
  quantity_in_stock?: number;
  in_stock?: boolean;
  delivery_charge?: number | string;
  mechanic_fees?: number | string;
  driver_fees?: number | string;
  image?: string;
  thumbnail?: string;
  images?: (string | ProductVariantImage)[];
  variants?: ProductVariant[];
  average_rating?: number | string;
  review_count?: number;
  is_wishlisted?: boolean;
  [key: string]: unknown;
}

export interface SubCategoryItem {
  id: string;
  name: string;
  category?: string;
  category_id?: string;
  image?: string;
  icon?: string;
  description?: string;
  [key: string]: unknown;
}

export interface CartAddRequest {
  variant: string;
  quantity: number;
  price_at_addition: number;
  delivery_charge: number;
  mechanic_fees?: number;
  driver_fees?: number;
}

export interface CartEditRequest {
  quantity?: number;
  price_at_addition?: number;
  mechanic_fees?: number;
  driver_fees?: number;
}

export interface CartItem {
  id: string;
  cart_item_id?: string;
  variant: string | ProductVariant;
  variant_id?: string;
  product_id?: string;
  product_name?: string;
  variant_name?: string;
  image?: string;
  quantity: number;
  price_at_addition: number | string;
  delivery_charge?: number | string;
  mechanic_fees?: number | string;
  driver_fees?: number | string;
  total_price?: number | string;
  [key: string]: unknown;
}

export interface ShippingAddress {
  id: string;
  user?: string;
  name: string;
  email: string;
  phone_number: string;
  alternate_phone_number?: string;
  street_address: string;
  state: string;
  city: string;
  postal_code: string;
  address_type: string;
  latitude: number | string;
  longitude: number | string;
  is_default?: boolean;
  [key: string]: unknown;
}

export interface ShippingAddressAddRequest {
  user: string;
  name: string;
  email: string;
  phone_number: string;
  alternate_phone_number: string;
  street_address: string;
  state: string;
  city: string;
  postal_code: string;
  address_type: string;
  latitude: number | string;
  longitude: number | string;
}

export interface ShippingAddressEditRequest {
  phone_number: string;
  alternate_phone_number: string;
  street_address: string;
  state: string;
  city: string;
  postal_code: string;
  address_type: string;
  latitude: number | string;
  longitude: number | string;
}

export interface CreateOrderFromCartRequest {
  shipping_address: string;
  payment_method: PaymentMethod;
  billing_address: string;
  delivery_charge?: number;
}

export interface BuyNowOrderItemPayload {
  variant: string;
  quantity: number;
  mechanic_fees: number;
}

export interface CreateBuyNowOrderRequest {
  shipping_address: string;
  payment_method: PaymentMethod;
  billing_address: string;
  order_items: BuyNowOrderItemPayload[];
  delivery_charge: number;
  driver_fees: number;
}

export interface MotoSparOrderItem {
  id?: string;
  variant?: string | ProductVariant;
  product_id?: string;
  product_name?: string;
  variant_name?: string;
  quantity: number;
  price?: number | string;
  mechanic_fees?: number | string;
  status?: string;
  image?: string;
  [key: string]: unknown;
}

export interface MotoSparOrder {
  id: string;
  order_number?: string;
  status?: string;
  order_status?: string;
  payment_status?: string;
  payment_method?: PaymentMethod | string;
  is_successful?: boolean;
  total_price?: number | string;
  total_amount?: number | string;
  delivery_charge?: number | string;
  driver_fees?: number | string;
  mechanic_fees?: number | string;
  shipping_address?: ShippingAddress | string;
  billing_address?: ShippingAddress | string;
  order_items?: MotoSparOrderItem[];
  items?: MotoSparOrderItem[];
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface RazorpayPrefill {
  name?: string;
  email?: string;
  contact?: string;
  amount?: number | string;
  currency?: string;
  razorpay_key?: string;
}

export interface RazorpayInitiateData {
  order?: {
    id: string;
    payment_status?: string;
    [key: string]: unknown;
  };
  razorpay_order_id: string;
  status?: string;
  code?: number;
  prefill?: RazorpayPrefill;
}

export interface RazorpayCallbackRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface WishlistItem {
  id: string;
  variant?: ProductVariant | string;
  variant_id?: string;
  product?: ProductItem | string;
  product_id?: string;
  name?: string;
  price?: number | string;
  image?: string;
  created_at?: string;
  [key: string]: unknown;
}

export interface ReviewItem {
  id: string;
  product?: string;
  user?: string | { id?: string; name?: string; first_name?: string; last_name?: string; email?: string };
  user_name?: string;
  rating: number;
  title: string;
  body: string;
  images?: (string | { id?: string; image?: string; url?: string })[];
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface AddReviewMultipartFields {
  product: string;
  user: string;
  rating: number;
  title: string;
  body: string;
  images?: File[];
}

export interface EditReviewMultipartFields {
  rating: number;
  title: string;
  body: string;
  images?: File[];
}

export interface NotificationItem {
  id: string;
  title?: string;
  message?: string;
  body?: string;
  status?: 'UNREAD' | 'READ' | string;
  is_read?: boolean;
  created_at?: string;
  [key: string]: unknown;
}

export interface PaginationRequest {
  limit: number;
  offset: number;
}

export interface ApiDiagnosticRecord {
  id: string;
  timestamp: string;
  method: string;
  endpoint: string;
  httpStatus: number | null;
  ok: boolean;
  durationMs: number;
  payloadKeys?: string[];
  errorMessage?: string;
}

export interface ApiResult<T = unknown> {
  ok: boolean;
  httpStatus: number | null;
  message: string;
  data: T | null;
  raw: Record<string, unknown> | null;
  endpoint: string;
  method: string;
  isNetworkError?: boolean;
  isAuthError?: boolean;
}
