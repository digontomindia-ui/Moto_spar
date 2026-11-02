import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Bell,
  CheckCheck,
  CheckCircle2,
  ChevronRight,
  Compass,
  ExternalLink,
  FileText,
  Heart,
  Loader2,
  LogOut,
  Mail,
  Package,
  RefreshCw,
  Search,
  Send,
  ShoppingBag,
  Trash2,
  Truck,
  User,
} from 'lucide-react';
import { PartImage } from '../../components/ui/PartImage';
import { PullToRefresh } from '../../components/ui/PullToRefresh';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  OrderCardSkeleton,
  OrderListSkeleton,
} from '../../components/ui/StateDisplay';
import {
  ConnectionMode,
  DEFAULT_PRODUCTION_API_BASE_URL,
  MOTOSPAR_POLICY_URL,
  getActiveApiBaseUrl,
  getConnectionMode,
  setConnectionMode,
  setCustomApiBaseUrl,
} from '../../config/env';
import { useAuth } from '../../context/AuthContext';
import { useCommerce } from '../../context/CommerceContext';
import {
  clearApiDiagnostics,
  getApiDiagnostics,
  subscribeApiDiagnostics,
} from '../../services/apiClient';
import {
  fetchCustomerOrders,
  requestAccountDeletion,
  submitContactUs,
} from '../../services/motosparApi';
import {
  ApiDiagnosticRecord,
  MotoSparOrder,
  WishlistItem,
} from '../../types/motospar';
import { triggerHaptic } from '../../services/haptics';
import { LiveOrderTracker } from './LiveOrderTracker';
import { OrderTrackingDetail } from './OrderTrackingDetail';

type OrderFilterType = 'ALL' | 'ACTIVE' | 'DELIVERED' | 'PAYMENT_PENDING';

export type AccountSectionTab =
  | 'PROFILE'
  | 'ORDERS'
  | 'TRACK_ORDER'
  | 'WISHLIST'
  | 'NOTIFICATIONS'
  | 'CONTACT'
  | 'POLICY'
  | 'DELETE_ACCOUNT'
  | 'DIAGNOSTICS';

interface AccountHubViewProps {
  initialSection?: AccountSectionTab;
  onOpenProductDetail: (productId: string) => void;
}

export const AccountHubView: React.FC<AccountHubViewProps> = ({
  initialSection = 'PROFILE',
  onOpenProductDetail,
}) => {
  const { user, updateProfile, logout, authLoading } = useAuth();
  const {
    wishlistItems,
    wishlistLoading,
    wishlistError,
    wishlistHasNext,
    refreshWishlist,
    toggleWishlist,
    addItemToCart,
    notifications,
    notificationsLoading,
    notificationsError,
    unreadNotificationsCount,
    refreshNotifications,
    markAllRead,
  } = useCommerce();

  const [activeTab, setActiveTab] = useState<AccountSectionTab>(initialSection);
  const [deletionLoading, setDeletionLoading] = useState(false);
  const [deletionFeedback, setDeletionFeedback] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialSection);
  }, [initialSection]);

  // Profile form state (PATCH /api/profile/update/)
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [address, setAddress] = useState(user?.address || '');
  const [stateField, setStateField] = useState(user?.state || '');
  const [postalCode, setPostalCode] = useState(user?.postal_code || '');
  const [country, setCountry] = useState(user?.country || 'India');
  const [bio, setBio] = useState(user?.bio || '');
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [profileBanner, setProfileBanner] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Orders state (POST /api/customer/orders/)
  const [orders, setOrders] = useState<MotoSparOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [ordersOffset, setOrdersOffset] = useState<number>(0);
  const [ordersHasNext, setOrdersHasNext] = useState<boolean>(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');
  const [orderStatusFilter, setOrderStatusFilter] =
    useState<OrderFilterType>('ALL');

  // Contact Us state (POST /api/contact-us/)
  const [contactName, setContactName] = useState(
    user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim()
  );
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState(user?.phone_number || '');
  const [contactMessage, setContactMessage] = useState('');
  const [contactLoading, setContactLoading] = useState(false);
  const [contactFeedback, setContactFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // API Diagnostics state
  const [diagnostics, setDiagnostics] = useState<ApiDiagnosticRecord[]>(() =>
    getApiDiagnostics()
  );
  const [apiBaseInput, setApiBaseInput] = useState(getActiveApiBaseUrl());
  const [connMode, setConnMode] = useState<ConnectionMode>(getConnectionMode());

  useEffect(() => {
    return subscribeApiDiagnostics(() => {
      setDiagnostics(getApiDiagnostics());
    });
  }, []);

  const loadOrders = useCallback(async (targetOffset = 0, append = false) => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const res = await fetchCustomerOrders({
        limit: 10,
        offset: targetOffset,
      });
      if (res.ok && res.data) {
        const list =
          res.data.orders ||
          res.data.results ||
          (Array.isArray(res.data)
            ? (res.data as unknown as MotoSparOrder[])
            : []);
        const safeList = Array.isArray(list) ? list : [];
        setOrders((prev) => (append ? [...prev, ...safeList] : safeList));
        setOrdersHasNext(Boolean(res.data.has_next));
        setOrdersOffset(targetOffset);
      } else {
        if (!append) setOrders([]);
        setOrdersError(res.message);
      }
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'ORDERS' || activeTab === 'TRACK_ORDER') {
      loadOrders(0, false);
    } else if (activeTab === 'WISHLIST') {
      refreshWishlist(0);
    } else if (activeTab === 'NOTIFICATIONS') {
      refreshNotifications();
    }
  }, [activeTab, loadOrders, refreshWishlist, refreshNotifications]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileBanner(null);
    const res = await updateProfile({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone_number: phone.trim(),
      address: address.trim(),
      state: stateField.trim(),
      postal_code: postalCode.trim(),
      country: country.trim(),
      bio: bio.trim(),
      profile_picture: profilePicFile,
    });
    if (res.ok) {
      setProfileBanner({
        type: 'success',
        text: res.message || 'Profile updated on MotoSpar server.',
      });
      setProfilePicFile(null);
    } else {
      setProfileBanner({
        type: 'error',
        text: res.message,
      });
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactFeedback(null);
    if (
      !contactName.trim() ||
      !contactEmail.trim() ||
      !contactPhone.trim() ||
      !contactMessage.trim()
    ) {
      setContactFeedback({
        type: 'error',
        text: 'Please complete all Contact Us fields.',
      });
      return;
    }

    setContactLoading(true);
    try {
      const res = await submitContactUs({
        name: contactName.trim(),
        email: contactEmail.trim(),
        phone_number: contactPhone.trim(),
        message: contactMessage.trim(),
      });
      if (res.ok) {
        setContactFeedback({
          type: 'success',
          text:
            res.message ||
            'Your message has been submitted to the MotoSpar team.',
        });
        setContactMessage('');
      } else {
        setContactFeedback({
          type: 'error',
          text: res.message,
        });
      }
    } finally {
      setContactLoading(false);
    }
  };

  const handleWishlistMoveToCart = async (item: WishlistItem) => {
    const variantObj =
      item.variant && typeof item.variant === 'object' ? item.variant : null;
    const variantId = String(
      variantObj?.id ||
        variantObj?.variant_id ||
        item.variant_id ||
        (typeof item.variant === 'string' ? item.variant : '') ||
        item.id
    );
    const price = Number(
      variantObj?.selling_price ?? variantObj?.price ?? item.price ?? 0
    );
    const delivery = Number(variantObj?.delivery_charge ?? 0);

    await addItemToCart({
      variant: variantId,
      quantity: 1,
      price_at_addition: price,
      delivery_charge: delivery,
    });
  };

  const selectedTrackedOrder = useMemo(
    () =>
      selectedOrderId
        ? orders.find((o) => String(o.id) === selectedOrderId) || null
        : null,
    [orders, selectedOrderId]
  );

  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const q = orderSearchQuery.trim().toLowerCase();
      if (q) {
        const idMatch = String(ord.id || '')
          .toLowerCase()
          .includes(q);
        const numMatch = String(ord.order_number || '')
          .toLowerCase()
          .includes(q);
        const items = ord.order_items || ord.items || [];
        const itemMatch = items.some((it) =>
          String(it.product_name || it.variant_name || '')
            .toLowerCase()
            .includes(q)
        );
        if (!idMatch && !numMatch && !itemMatch) return false;
      }

      const rawStatus = String(
        ord.order_status || ord.status || 'PLACED'
      ).toUpperCase();
      const payStatus = String(ord.payment_status || 'PENDING').toUpperCase();

      if (orderStatusFilter === 'DELIVERED') {
        return (
          rawStatus.includes('DELIVER') || rawStatus.includes('COMPLET')
        );
      }
      if (orderStatusFilter === 'PAYMENT_PENDING') {
        return (
          payStatus === 'PENDING' &&
          ord.is_successful !== true &&
          !rawStatus.includes('CANCEL')
        );
      }
      if (orderStatusFilter === 'ACTIVE') {
        return (
          !rawStatus.includes('DELIVER') &&
          !rawStatus.includes('COMPLET') &&
          !rawStatus.includes('CANCEL')
        );
      }
      return true;
    });
  }, [orders, orderSearchQuery, orderStatusFilter]);

  const navItems: {
    id: AccountSectionTab;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }[] = [
    { id: 'PROFILE', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'ORDERS', label: 'Orders', icon: <Package className="w-4 h-4" /> },
    {
      id: 'TRACK_ORDER',
      label: 'Track Order',
      icon: <Compass className="w-4 h-4" />,
    },
    {
      id: 'WISHLIST',
      label: 'Wishlist',
      icon: <Heart className="w-4 h-4" />,
      count: wishlistItems.length,
    },
    {
      id: 'NOTIFICATIONS',
      label: 'Notifications',
      icon: <Bell className="w-4 h-4" />,
      count: unreadNotificationsCount,
    },
    {
      id: 'CONTACT',
      label: 'Contact Us',
      icon: <Mail className="w-4 h-4" />,
    },
    {
      id: 'POLICY',
      label: 'Policy',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: 'DELETE_ACCOUNT',
      label: 'Delete Account',
      icon: <Trash2 className="w-4 h-4" />,
    },
    {
      id: 'DIAGNOSTICS',
      label: 'API Status',
      icon: <Activity className="w-4 h-4" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-12">
      {/* Left Navigation Sidebar / Horizontal Mobile Bar */}
      <aside className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-4 space-y-4">
        <div className="flex items-center gap-3 px-2 py-2 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
            <PartImage
              src={user?.profile_picture}
              alt={user?.email || 'Customer'}
              className="w-full h-full"
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">
              {user?.first_name || user?.last_name
                ? `${user?.first_name || ''} ${user?.last_name || ''}`.trim()
                : user?.name || 'MotoSpar Customer'}
            </p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>

        <nav className="flex lg:flex-col gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {navItems.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  {tab.icon}
                  <span>{tab.label}</span>
                </span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`font-mono text-[11px] ${
                      isActive ? 'text-rose-400' : 'text-rose-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            disabled={authLoading}
            onClick={logout}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of MotoSpar</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:col-span-9">
        {/* SECTION: PROFILE */}
        {activeTab === 'PROFILE' && (
          <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-display">
                Account Profile
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Multipart profile update (`PATCH /api/profile/update/`)
              </p>
            </div>

            {profileBanner && (
              <div
                role={profileBanner.type === 'error' ? 'alert' : 'status'}
                className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 ${
                  profileBanner.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}
              >
                {profileBanner.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{profileBanner.text}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={stateField}
                    onChange={(e) => setStateField(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Bio / Vehicle Notes
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Profile Picture (Optional Multipart File)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setProfilePicFile(e.target.files?.[0] || null)
                  }
                  className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="min-h-[48px] px-6 py-3 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
              >
                {authLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Save Profile Changes</span>
              </button>
            </form>
          </section>
        )}

        {/* SECTION: ORDERS & LIVE ORDER TRACKING */}
        {activeTab === 'ORDERS' && (
          <PullToRefresh
            onRefresh={() => loadOrders(0, false)}
            isRefreshing={ordersLoading}
            refreshingLabel="Refreshing your MotoSpar orders..."
            pullLabel="Pull down to refresh orders"
            releaseLabel="Release to fetch latest order status"
          >
            {selectedTrackedOrder ? (
              <OrderTrackingDetail
                order={selectedTrackedOrder}
                onBack={() => setSelectedOrderId(null)}
                onRefreshOrder={() => loadOrders(0, false)}
                isRefreshing={ordersLoading}
                onOpenProductDetail={onOpenProductDetail}
              />
            ) : (
              <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 font-display">
                      Orders &amp; Live Tracking
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Select any order to inspect shipment progress, receipts,
                      and item reviews
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      loadOrders(0, false);
                    }}
                    disabled={ordersLoading}
                    className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${
                        ordersLoading ? 'animate-spin' : ''
                      }`}
                    />
                    <span>Refresh</span>
                  </button>
                </div>

                {/* Order ID Lookup & Status Filter Controls */}
                <div className="space-y-3 pt-1">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      placeholder="Track by Order ID, Order Number, or Part Name..."
                      className="w-full min-h-[44px] pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {(
                      [
                        { id: 'ALL', label: 'All Orders' },
                        { id: 'ACTIVE', label: 'Active / In Transit' },
                        { id: 'DELIVERED', label: 'Delivered' },
                        { id: 'PAYMENT_PENDING', label: 'Payment Pending' },
                      ] as { id: OrderFilterType; label: string }[]
                    ).map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          triggerHaptic('selection');
                          setOrderStatusFilter(f.id);
                        }}
                        className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                          orderStatusFilter === f.id
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {ordersLoading && orders.length === 0 ? (
                  <OrderListSkeleton count={4} />
                ) : ordersError && orders.length === 0 ? (
                  <ErrorState
                    title="Could Not Load Orders"
                    message={ordersError}
                    onRetry={() => loadOrders(0, false)}
                  />
                ) : filteredOrders.length === 0 ? (
                  <EmptyState
                    title="No Matching Orders Found"
                    description={
                      orders.length === 0
                        ? 'You have not placed any MotoSpar orders yet.'
                        : 'No orders match the current search or status filter.'
                    }
                    actionLabel={
                      orderSearchQuery || orderStatusFilter !== 'ALL'
                        ? 'Reset Order Filters'
                        : undefined
                    }
                    onAction={
                      orderSearchQuery || orderStatusFilter !== 'ALL'
                        ? () => {
                            setOrderSearchQuery('');
                            setOrderStatusFilter('ALL');
                          }
                        : undefined
                    }
                  />
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((ord) => {
                      const items = ord.order_items || ord.items || [];
                      const total = ord.total_price ?? ord.total_amount;
                      const statusText = String(
                        ord.order_status || ord.status || 'PROCESSING'
                      ).toUpperCase();

                      return (
                        <div
                          key={ord.id}
                          onClick={() => {
                            triggerHaptic('selection');
                            setSelectedOrderId(String(ord.id));
                          }}
                          className="p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer space-y-3.5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                            <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2">
                              <span className="font-mono font-bold text-slate-900">
                                Order #{ord.order_number || ord.id.slice(0, 8)}
                              </span>
                              <span>·</span>
                              <span className="inline-flex items-center gap-1">
                                <Truck className="w-3.5 h-3.5 text-rose-600" />
                                <strong className="text-slate-900">
                                  {statusText}
                                </strong>
                              </span>
                              <span>·</span>
                              <span>
                                Payment:{' '}
                                <strong className="text-slate-900">
                                  {ord.payment_status || 'PENDING'}
                                </strong>
                              </span>
                            </div>

                            {total !== undefined && (
                              <span className="text-sm font-bold font-mono tabular-nums text-slate-900">
                                ₹{Number(total).toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>

                          {items.length > 0 && (
                            <div className="space-y-2">
                              {items.map((item, idx) => (
                                <div
                                  key={item.id || idx}
                                  className="flex items-center justify-between text-xs"
                                >
                                  <span className="text-slate-800 font-medium">
                                    {item.product_name ||
                                      item.variant_name ||
                                      'Automotive Part'}{' '}
                                    × {item.quantity}
                                  </span>
                                  {item.product_id && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onOpenProductDetail(
                                          String(item.product_id)
                                        );
                                      }}
                                      className="text-rose-600 font-semibold hover:underline"
                                    >
                                      Inspect Part
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between">
                            <span className="text-[11px] text-slate-500 font-mono">
                              {ord.created_at
                                ? new Date(ord.created_at).toLocaleString()
                                : `UUID: ${ord.id.slice(0, 12)}...`}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900">
                              <span>Track Order &amp; Details</span>
                              <ChevronRight className="w-4 h-4 text-rose-600" />
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {ordersLoading &&
                      orders.length > 0 &&
                      Array.from({ length: 2 }).map((_, idx) => (
                        <OrderCardSkeleton key={`order-more-skeleton-${idx}`} />
                      ))}

                    {ordersHasNext && (
                      <button
                        type="button"
                        disabled={ordersLoading}
                        onClick={() => loadOrders(ordersOffset + 10, true)}
                        className="min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
                      >
                        {ordersLoading
                          ? 'Loading Older Orders...'
                          : 'Load Older Orders'}
                      </button>
                    )}
                  </div>
                )}
              </section>
            )}
          </PullToRefresh>
        )}

        {/* SECTION: DEDICATED REAL-TIME ORDER TRACKER BY ORDER ID */}
        {activeTab === 'TRACK_ORDER' && (
          <LiveOrderTracker
            initialOrderId={selectedOrderId}
            knownOrders={orders}
            onOpenProductDetail={onOpenProductDetail}
          />
        )}

        {/* SECTION: WISHLIST */}
        {activeTab === 'WISHLIST' && (
          <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 font-display">
                  Saved Wishlist
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Loaded from `POST /api/customer/wishlist/items/view/`
                </p>
              </div>
              <button
                type="button"
                onClick={() => refreshWishlist(0)}
                disabled={wishlistLoading}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${
                    wishlistLoading ? 'animate-spin' : ''
                  }`}
                />
                <span>Refresh</span>
              </button>
            </div>

            {wishlistLoading ? (
              <LoadingState label="Loading saved wishlist variants..." />
            ) : wishlistError ? (
              <ErrorState
                title="Could Not Load Wishlist"
                message={wishlistError}
                onRetry={() => refreshWishlist(0)}
              />
            ) : wishlistItems.length === 0 ? (
              <EmptyState
                title="Wishlist is Empty"
                description="Tap the heart icon on any part in the catalog to save it here."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {wishlistItems.map((item) => {
                  const variantObj =
                    item.variant && typeof item.variant === 'object'
                      ? item.variant
                      : null;
                  const productObj =
                    item.product && typeof item.product === 'object'
                      ? item.product
                      : null;
                  const variantId = String(
                    variantObj?.id ||
                      variantObj?.variant_id ||
                      item.variant_id ||
                      (typeof item.variant === 'string' ? item.variant : '') ||
                      item.id
                  );
                  const productId = String(
                    productObj?.id || item.product_id || variantId
                  );
                  const title =
                    item.name ||
                    variantObj?.name ||
                    productObj?.name ||
                    `Saved Variant #${variantId.slice(0, 6)}`;
                  const price =
                    variantObj?.selling_price ??
                    variantObj?.price ??
                    item.price;
                  const image =
                    item.image || variantObj?.image || productObj?.image;

                  return (
                    <div
                      key={item.id || variantId}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          onClick={() => onOpenProductDetail(productId)}
                          className="w-18 h-18 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 cursor-pointer"
                        >
                          <PartImage
                            src={image}
                            alt={title}
                            className="w-full h-full"
                          />
                        </div>
                        <div className="min-w-0">
                          <h3
                            onClick={() => onOpenProductDetail(productId)}
                            className="text-sm font-semibold text-slate-900 truncate cursor-pointer hover:text-rose-600"
                          >
                            {title}
                          </h3>
                          {price !== undefined && (
                            <p className="text-sm font-bold font-mono tabular-nums text-slate-900 mt-1">
                              ₹{Number(price).toLocaleString('en-IN')}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleWishlistMoveToCart(item)}
                          className="flex-1 min-h-[42px] px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 inline-flex items-center justify-center gap-1.5"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleWishlist(variantId)}
                          aria-label="Remove from wishlist"
                          className="min-h-[42px] min-w-[42px] rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-red-600 flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {wishlistHasNext && (
              <button
                type="button"
                onClick={() => refreshWishlist(wishlistItems.length)}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold"
              >
                Load More Saved Parts
              </button>
            )}
          </section>
        )}

        {/* SECTION: NOTIFICATIONS */}
        {activeTab === 'NOTIFICATIONS' && (
          <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 font-display">
                  Notifications
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Unread count: {unreadNotificationsCount}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 inline-flex items-center gap-1.5"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>Mark All Read</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={refreshNotifications}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Refresh
                </button>
              </div>
            </div>

            {notificationsLoading ? (
              <LoadingState label="Loading notifications..." />
            ) : notificationsError ? (
              <ErrorState
                title="Could Not Load Notifications"
                message={notificationsError}
                onRetry={refreshNotifications}
              />
            ) : notifications.length === 0 ? (
              <EmptyState
                title="No Notifications"
                description="Your MotoSpar notification inbox is empty."
              />
            ) : (
              <div className="divide-y divide-slate-200">
                {notifications.map((n) => {
                  const isUnread =
                    String(n.status || '').toUpperCase() === 'UNREAD' ||
                    n.is_read === false;
                  return (
                    <div
                      key={n.id}
                      className={`py-4 first:pt-0 last:pb-0 ${
                        isUnread ? 'bg-rose-50/30 -mx-3 px-3 rounded-xl' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-slate-900">
                          {n.title || 'MotoSpar Update'}
                        </h3>
                        <span className="text-[11px] font-medium text-slate-500">
                          {isUnread ? 'Unread' : 'Read'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {n.message || n.body}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* SECTION: CONTACT US */}
        {activeTab === 'CONTACT' && (
          <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-display">
                Contact MotoSpar Support
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Submits directly to `POST /api/contact-us/`
              </p>
            </div>

            {contactFeedback && (
              <div
                role={contactFeedback.type === 'error' ? 'alert' : 'status'}
                className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 ${
                  contactFeedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}
              >
                {contactFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{contactFeedback.text}</span>
              </div>
            )}

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Message
                </label>
                <textarea
                  rows={4}
                  required
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Describe your part inquiry or order support question..."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <button
                type="submit"
                disabled={contactLoading}
                className="min-h-[48px] px-6 py-3 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 inline-flex items-center gap-2 disabled:opacity-50"
              >
                {contactLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Send Inquiry</span>
              </button>
            </form>
          </section>
        )}

        {/* SECTION: POLICY */}
        {activeTab === 'DELETE_ACCOUNT' && (
          <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4">
            <h1 className="text-2xl font-bold text-slate-900 font-display">Delete your account</h1>
            <p className="text-sm text-slate-600">
              Request deletion of your MotoSpar customer account and associated personal data.
              Our support team will verify your identity before processing the request.
              Support will explain any records that must be retained for legal or regulatory reasons.
            </p>
            <p className="text-sm text-slate-600">
              You can also submit a request from any browser at{' '}
              <a className="text-rose-700 underline" href="https://api.motospar.com/account-deletion/" target="_blank" rel="noopener noreferrer">
                MotoSpar account deletion
              </a>.
            </p>
            {deletionFeedback && <p role="status" className="text-sm text-slate-700">{deletionFeedback}</p>}
            <button
              type="button"
              disabled={deletionLoading}
              onClick={async () => {
                if (!window.confirm('Request deletion of your MotoSpar account and associated data?')) return;
                setDeletionLoading(true);
                const result = await requestAccountDeletion();
                setDeletionFeedback(result.message);
                setDeletionLoading(false);
              }}
              className="min-h-[48px] px-6 py-3 rounded-xl bg-red-700 text-white text-sm font-semibold disabled:opacity-50"
            >
              {deletionLoading ? 'Sending request…' : 'Request account deletion'}
            </button>
          </section>
        )}

        {activeTab === 'POLICY' && (
          <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 font-display">
                  Terms &amp; Privacy Policy
                </h1>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                  {MOTOSPAR_POLICY_URL}
                </p>
              </div>
              <a
                href={MOTOSPAR_POLICY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 inline-flex items-center gap-2"
              >
                <span>Open Official Policy Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="w-full h-[540px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
              <iframe
                src={MOTOSPAR_POLICY_URL}
                title="MotoSpar Policy"
                className="w-full h-full border-0"
                sandbox="allow-same-origin allow-scripts"
              />
            </div>
          </section>
        )}

        {/* SECTION: API DIAGNOSTICS & ENVIRONMENT TARGET */}
        {activeTab === 'DIAGNOSTICS' && (
          <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-display">
                API Environment &amp; Request Log
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Sanitized request diagnostics (never logs passwords, tokens,
                payment signatures, or personal data).
              </p>
            </div>

            {import.meta.env.DEV && <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Configured `API_BASE_URL`
                  </label>
                  <input
                    type="url"
                    value={apiBaseInput}
                    onChange={(e) => setApiBaseInput(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 text-xs font-mono bg-white border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomApiBaseUrl(apiBaseInput);
                      setConnectionMode(connMode);
                    }}
                    className="flex-1 min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setApiBaseInput(DEFAULT_PRODUCTION_API_BASE_URL);
                      setCustomApiBaseUrl(null);
                    }}
                    className="min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white"
                  >
                    Default
                  </button>
                </div>
              </div>
            </div>}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">
                  Recent Live Network Calls ({diagnostics.length})
                </h2>
                {diagnostics.length > 0 && (
                  <button
                    type="button"
                    onClick={clearApiDiagnostics}
                    className="text-xs text-slate-500 hover:text-slate-900"
                  >
                    Clear Log
                  </button>
                )}
              </div>

              {diagnostics.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">
                  No requests recorded in this session yet.
                </p>
              ) : (
                <div className="divide-y divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden">
                  {diagnostics.map((d) => (
                    <div
                      key={d.id}
                      className="p-3.5 bg-white text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 font-mono">
                          <span className="font-bold text-slate-900">
                            {d.method}
                          </span>
                          <span className="text-slate-700">{d.endpoint}</span>
                        </div>
                        {d.payloadKeys && d.payloadKeys.length > 0 && (
                          <p className="text-[11px] text-slate-500 font-mono">
                            Payload fields: {d.payloadKeys.join(', ')}
                          </p>
                        )}
                        {d.errorMessage && (
                          <p className="text-[11px] text-red-600">
                            {d.errorMessage}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 font-mono shrink-0">
                        <span
                          className={`font-semibold ${
                            d.ok ? 'text-emerald-700' : 'text-red-600'
                          }`}
                        >
                          {d.httpStatus !== null
                            ? `HTTP ${d.httpStatus}`
                            : 'NET_ERR'}
                        </span>
                        <span className="text-slate-400">{d.durationMs}ms</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
