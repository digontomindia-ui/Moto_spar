import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ApiResult,
  CartAddRequest,
  CartEditRequest,
  CartItem,
  NotificationItem,
  ProductVariant,
  ShippingAddress,
  ShippingAddressAddRequest,
  ShippingAddressEditRequest,
  WishlistItem,
} from '../types/motospar';
import {
  addShippingAddress,
  addToCart,
  deleteCartItem,
  deleteShippingAddress,
  editCartItem,
  editShippingAddress,
  fetchNotifications,
  fetchWishlistItems,
  markAllNotificationsRead,
  toggleWishlistVariant,
  viewCart,
  viewShippingAddresses,
} from '../services/motosparApi';
import { triggerHaptic } from '../services/haptics';
import { useAuth } from './AuthContext';

export interface BuyNowStaging {
  productId: string;
  productName: string;
  variant: ProductVariant;
  quantity: number;
  unitPrice: number;
  deliveryCharge: number;
  mechanicFees: number;
  driverFees: number;
  image?: string | null;
}

interface CommerceContextValue {
  // Cart state
  cartItems: CartItem[];
  cartLoading: boolean;
  cartError: string | null;
  refreshCart: () => Promise<void>;
  addItemToCart: (
    payload: CartAddRequest
  ) => Promise<ApiResult<Record<string, unknown>>>;
  updateCartItem: (
    cartItemId: string,
    payload: CartEditRequest
  ) => Promise<ApiResult<Record<string, unknown>>>;
  removeCartItem: (
    cartItemId: string
  ) => Promise<ApiResult<Record<string, unknown>>>;

  // Shipping addresses state
  addresses: ShippingAddress[];
  addressesLoading: boolean;
  addressesError: string | null;
  selectedAddressId: string;
  setSelectedAddressId: (id: string) => void;
  refreshAddresses: () => Promise<void>;
  createAddress: (
    payload: ShippingAddressAddRequest
  ) => Promise<ApiResult<{ shipping_address?: ShippingAddress; [key: string]: unknown }>>;
  updateAddress: (
    addressId: string,
    payload: ShippingAddressEditRequest
  ) => Promise<ApiResult<{ shipping_address?: ShippingAddress; [key: string]: unknown }>>;
  removeAddress: (
    addressId: string
  ) => Promise<ApiResult<Record<string, unknown>>>;

  // Wishlist state
  wishlistItems: WishlistItem[];
  wishlistLoading: boolean;
  wishlistError: string | null;
  wishlistHasNext: boolean;
  refreshWishlist: (offset?: number) => Promise<void>;
  toggleWishlist: (
    variantId: string
  ) => Promise<ApiResult<Record<string, unknown>>>;
  isVariantWishlisted: (variantId?: string) => boolean;

  // Notifications state
  notifications: NotificationItem[];
  notificationsLoading: boolean;
  notificationsError: string | null;
  unreadNotificationsCount: number;
  refreshNotifications: () => Promise<void>;
  markAllRead: () => Promise<ApiResult<Record<string, unknown>>>;

  // Checkout staging (Cart vs Buy Now)
  buyNowStaging: BuyNowStaging | null;
  setBuyNowStaging: (staging: BuyNowStaging | null) => void;
}

const CommerceContext = createContext<CommerceContextValue | undefined>(
  undefined
);

export const CommerceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();

  // Cart
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState<boolean>(false);
  const [cartError, setCartError] = useState<string | null>(null);

  // Addresses
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = useState<boolean>(false);
  const [addressesError, setAddressesError] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  // Wishlist
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState<boolean>(false);
  const [wishlistError, setWishlistError] = useState<string | null>(null);
  const [wishlistHasNext, setWishlistHasNext] = useState<boolean>(false);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsLoading, setNotificationsLoading] =
    useState<boolean>(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(
    null
  );

  // Buy Now staging
  const [buyNowStaging, setBuyNowStaging] = useState<BuyNowStaging | null>(
    null
  );

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      setCartError(null);
      return;
    }
    setCartLoading(true);
    setCartError(null);
    try {
      const res = await viewCart();
      if (res.ok && res.data) {
        const list =
          res.data.cart_item ||
          res.data.cart_items ||
          res.data.items ||
          (Array.isArray(res.data) ? (res.data as unknown as CartItem[]) : []);
        setCartItems(Array.isArray(list) ? list : []);
      } else {
        setCartItems([]);
        setCartError(res.message);
      }
    } finally {
      setCartLoading(false);
    }
  }, [isAuthenticated]);

  const addItemToCart = useCallback(
    async (payload: CartAddRequest) => {
      triggerHaptic('impactMedium');
      const res = await addToCart(payload);
      if (res.ok) {
        triggerHaptic('success');
        await refreshCart();
      } else {
        triggerHaptic('error');
      }
      return res;
    },
    [refreshCart]
  );

  const updateCartItem = useCallback(
    async (cartItemId: string, payload: CartEditRequest) => {
      triggerHaptic('selection');
      const res = await editCartItem(cartItemId, payload);
      if (res.ok) {
        await refreshCart();
      } else {
        triggerHaptic('error');
      }
      return res;
    },
    [refreshCart]
  );

  const removeCartItem = useCallback(
    async (cartItemId: string) => {
      triggerHaptic('warning');
      const res = await deleteCartItem(cartItemId);
      if (res.ok) {
        await refreshCart();
      } else {
        triggerHaptic('error');
      }
      return res;
    },
    [refreshCart]
  );

  const refreshAddresses = useCallback(async () => {
    if (!isAuthenticated) {
      setAddresses([]);
      setAddressesError(null);
      return;
    }
    setAddressesLoading(true);
    setAddressesError(null);
    try {
      const res = await viewShippingAddresses();
      if (res.ok && res.data) {
        const list =
          res.data.shipping_addresses ||
          res.data.addresses ||
          (Array.isArray(res.data)
            ? (res.data as unknown as ShippingAddress[])
            : []);
        const validList = Array.isArray(list) ? list : [];
        setAddresses(validList);
        if (validList.length > 0) {
          setSelectedAddressId((prev) =>
            prev && validList.some((a) => a.id === prev)
              ? prev
              : validList[0].id
          );
        } else {
          setSelectedAddressId('');
        }
      } else {
        setAddresses([]);
        setAddressesError(res.message);
      }
    } finally {
      setAddressesLoading(false);
    }
  }, [isAuthenticated]);

  const createAddress = useCallback(
    async (payload: ShippingAddressAddRequest) => {
      const res = await addShippingAddress(payload);
      if (res.ok) {
        await refreshAddresses();
      }
      return res;
    },
    [refreshAddresses]
  );

  const updateAddress = useCallback(
    async (addressId: string, payload: ShippingAddressEditRequest) => {
      const res = await editShippingAddress(addressId, payload);
      if (res.ok) {
        await refreshAddresses();
      }
      return res;
    },
    [refreshAddresses]
  );

  const removeAddress = useCallback(
    async (addressId: string) => {
      const res = await deleteShippingAddress(addressId);
      if (res.ok) {
        await refreshAddresses();
      }
      return res;
    },
    [refreshAddresses]
  );

  const refreshWishlist = useCallback(
    async (offset = 0) => {
      if (!isAuthenticated) {
        setWishlistItems([]);
        setWishlistError(null);
        return;
      }
      setWishlistLoading(true);
      setWishlistError(null);
      try {
        const res = await fetchWishlistItems({ limit: 10, offset });
        if (res.ok && res.data) {
          const items =
            res.data.wishlist_items ||
            res.data.items ||
            (Array.isArray(res.data)
              ? (res.data as unknown as WishlistItem[])
              : []);
          const safeItems = Array.isArray(items) ? items : [];
          setWishlistItems((prev) =>
            offset === 0 ? safeItems : [...prev, ...safeItems]
          );
          setWishlistHasNext(Boolean(res.data.has_next));
        } else {
          if (offset === 0) setWishlistItems([]);
          setWishlistError(res.message);
        }
      } finally {
        setWishlistLoading(false);
      }
    },
    [isAuthenticated]
  );

  const toggleWishlist = useCallback(
    async (variantId: string) => {
      triggerHaptic('impactLight');
      const res = await toggleWishlistVariant(variantId);
      if (res.ok) {
        triggerHaptic('selection');
        await refreshWishlist(0);
      } else {
        triggerHaptic('error');
      }
      return res;
    },
    [refreshWishlist]
  );

  const isVariantWishlisted = useCallback(
    (variantId?: string): boolean => {
      if (!variantId) return false;
      return wishlistItems.some((item) => {
        if (item.variant_id === variantId || item.id === variantId) return true;
        if (
          item.variant &&
          typeof item.variant === 'object' &&
          (item.variant.id === variantId ||
            item.variant.variant_id === variantId)
        ) {
          return true;
        }
        if (typeof item.variant === 'string' && item.variant === variantId) {
          return true;
        }
        return false;
      });
    },
    [wishlistItems]
  );

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setNotificationsError(null);
      return;
    }
    setNotificationsLoading(true);
    setNotificationsError(null);
    try {
      const res = await fetchNotifications();
      if (res.ok && res.data) {
        const list =
          res.data.notifications ||
          (Array.isArray(res.data)
            ? (res.data as unknown as NotificationItem[])
            : []);
        setNotifications(Array.isArray(list) ? list : []);
      } else {
        setNotifications([]);
        setNotificationsError(res.message);
      }
    } finally {
      setNotificationsLoading(false);
    }
  }, [isAuthenticated]);

  const markAllRead = useCallback(async () => {
    const res = await markAllNotificationsRead();
    if (res.ok) {
      await refreshNotifications();
    }
    return res;
  }, [refreshNotifications]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(
      (n) =>
        String(n.status || '').toUpperCase() === 'UNREAD' ||
        n.is_read === false
    ).length;
  }, [notifications]);

  // Reset or load server state when authentication status changes
  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
      refreshAddresses();
      refreshWishlist(0);
      refreshNotifications();
    } else {
      setCartItems([]);
      setAddresses([]);
      setWishlistItems([]);
      setNotifications([]);
      setBuyNowStaging(null);
      setSelectedAddressId('');
    }
  }, [
    isAuthenticated,
    refreshCart,
    refreshAddresses,
    refreshWishlist,
    refreshNotifications,
  ]);

  const value = useMemo<CommerceContextValue>(
    () => ({
      cartItems,
      cartLoading,
      cartError,
      refreshCart,
      addItemToCart,
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
      wishlistItems,
      wishlistLoading,
      wishlistError,
      wishlistHasNext,
      refreshWishlist,
      toggleWishlist,
      isVariantWishlisted,
      notifications,
      notificationsLoading,
      notificationsError,
      unreadNotificationsCount,
      refreshNotifications,
      markAllRead,
      buyNowStaging,
      setBuyNowStaging,
    }),
    [
      cartItems,
      cartLoading,
      cartError,
      refreshCart,
      addItemToCart,
      updateCartItem,
      removeCartItem,
      addresses,
      addressesLoading,
      addressesError,
      selectedAddressId,
      refreshAddresses,
      createAddress,
      updateAddress,
      removeAddress,
      wishlistItems,
      wishlistLoading,
      wishlistError,
      wishlistHasNext,
      refreshWishlist,
      toggleWishlist,
      isVariantWishlisted,
      notifications,
      notificationsLoading,
      notificationsError,
      unreadNotificationsCount,
      refreshNotifications,
      markAllRead,
      buyNowStaging,
    ]
  );

  return (
    <CommerceContext.Provider value={value}>
      {children}
    </CommerceContext.Provider>
  );
};

export function useCommerce(): CommerceContextValue {
  const ctx = useContext(CommerceContext);
  if (!ctx) {
    throw new Error('useCommerce must be used within a CommerceProvider');
  }
  return ctx;
}
