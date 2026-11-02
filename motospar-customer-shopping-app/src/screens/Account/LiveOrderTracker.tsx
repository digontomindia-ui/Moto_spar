import React, { useCallback, useEffect, useState } from 'react';
import {
  Clock,
  Compass,
  Loader2,
  RefreshCw,
  Search,
  Truck,
} from 'lucide-react';
import {
  EmptyState,
  ErrorState,
  OrderCardSkeleton,
} from '../../components/ui/StateDisplay';
import { triggerHaptic } from '../../services/haptics';
import { fetchOrderByIdFromBackend } from '../../services/motosparApi';
import { MotoSparOrder } from '../../types/motospar';
import { OrderTrackingDetail } from './OrderTrackingDetail';

interface LiveOrderTrackerProps {
  initialOrderId?: string | null;
  knownOrders?: MotoSparOrder[];
  onOpenProductDetail: (productId: string) => void;
}

/**
 * Dedicated Order Tracking component in the Account section.
 * Retrieves real-time order status and shipping progress from the MotoSpar backend
 * (`POST /api/customer/orders/`) for a given Order ID or Order Number, with optional
 * 15-second live polling.
 */
export const LiveOrderTracker: React.FC<LiveOrderTrackerProps> = ({
  initialOrderId = null,
  knownOrders = [],
  onOpenProductDetail,
}) => {
  const [orderIdInput, setOrderIdInput] = useState<string>(
    initialOrderId || ''
  );
  const [trackedOrder, setTrackedOrder] = useState<MotoSparOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [autoPollEnabled, setAutoPollEnabled] = useState<boolean>(false);

  const performLookup = useCallback(
    async (targetId: string, silent = false) => {
      const trimmed = targetId.trim();
      if (!trimmed) {
        setErrorMessage('Please enter a MotoSpar Order ID or Order Number.');
        return;
      }

      if (!silent) {
        setLoading(true);
      }
      setErrorMessage(null);

      try {
        const response = await fetchOrderByIdFromBackend(trimmed);
        if (response.ok && response.order) {
          setTrackedOrder(response.order);
          setLastSyncedAt(
            new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
          );
          if (!silent) {
            triggerHaptic('success');
          }
        } else {
          if (!silent) {
            setTrackedOrder(null);
            triggerHaptic('error');
          }
          setErrorMessage(response.message);
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    []
  );

  // Automatically fetch when opened with an initialOrderId
  useEffect(() => {
    if (initialOrderId && initialOrderId.trim()) {
      setOrderIdInput(initialOrderId);
      performLookup(initialOrderId, false);
    }
  }, [initialOrderId, performLookup]);

  // Optional 15-second live polling while tracking an active order
  useEffect(() => {
    if (!autoPollEnabled || !trackedOrder?.id) return;
    const intervalId = window.setInterval(() => {
      performLookup(String(trackedOrder.id), true);
    }, 15000);
    return () => window.clearInterval(intervalId);
  }, [autoPollEnabled, trackedOrder?.id, performLookup]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('selection');
    performLookup(orderIdInput, false);
  };

  return (
    <div className="space-y-6">
      {/* Order ID Search & Real-Time Polling Control Card */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-rose-600 mb-1">
              <Compass className="w-4 h-4" />
              <span>Real-Time MotoSpar Shipment Tracker</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">
              Track Order by ID
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Queries `POST /api/customer/orders/` on the MotoSpar backend for
              authoritative order and shipping progress
            </p>
          </div>

          {trackedOrder && (
            <label className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 cursor-pointer self-start">
              <input
                type="checkbox"
                checked={autoPollEnabled}
                onChange={(e) => {
                  triggerHaptic('selection');
                  setAutoPollEnabled(e.target.checked);
                }}
                className="w-4 h-4 rounded accent-rose-600"
              />
              <span>Auto-Refresh (15s)</span>
            </label>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-2.5"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              placeholder="Enter MotoSpar Order UUID or Order Number (e.g. #ORD-1042)"
              aria-label="MotoSpar Order ID"
              className="w-full min-h-[46px] pl-10 pr-4 py-2.5 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !orderIdInput.trim()}
            className="min-h-[46px] px-6 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Checking Backend...</span>
              </>
            ) : (
              <>
                <Truck className="w-4 h-4" />
                <span>Track Order</span>
              </>
            )}
          </button>
        </form>

        {/* Quick-Select Recent Order IDs from Loaded Account Orders */}
        {knownOrders.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[11px] font-medium text-slate-500 mb-2">
              Quick-select from your recent orders:
            </p>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {knownOrders.slice(0, 6).map((ord) => {
                const displayId = ord.order_number || ord.id.slice(0, 8);
                const isSelected =
                  trackedOrder && String(trackedOrder.id) === String(ord.id);
                return (
                  <button
                    key={ord.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      const target = String(ord.id);
                      setOrderIdInput(target);
                      performLookup(target, false);
                    }}
                    className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    #{displayId} ·{' '}
                    {String(
                      ord.order_status || ord.status || 'PLACED'
                    ).toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {lastSyncedAt && trackedOrder && (
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Last synced with MotoSpar backend at{' '}
                <strong className="font-mono text-slate-700">
                  {lastSyncedAt}
                </strong>
              </span>
            </span>
            <button
              type="button"
              onClick={() => performLookup(String(trackedOrder.id), false)}
              disabled={loading}
              className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-rose-600"
            >
              <RefreshCw
                className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`}
              />
              <span>Sync Now</span>
            </button>
          </div>
        )}
      </section>

      {/* Tracking Result Area */}
      {loading ? (
        <div className="space-y-4">
          <OrderCardSkeleton />
          <OrderCardSkeleton />
        </div>
      ) : errorMessage ? (
        <ErrorState
          title="Order Tracking Lookup Failed"
          message={errorMessage}
          onRetry={
            orderIdInput.trim()
              ? () => performLookup(orderIdInput, false)
              : undefined
          }
        />
      ) : trackedOrder ? (
        <OrderTrackingDetail
          order={trackedOrder}
          onBack={() => {
            setTrackedOrder(null);
            setOrderIdInput('');
          }}
          onRefreshOrder={() => performLookup(String(trackedOrder.id), false)}
          isRefreshing={loading}
          onOpenProductDetail={onOpenProductDetail}
        />
      ) : (
        <EmptyState
          title="Enter an Order ID to Track Progress"
          description="Type your MotoSpar Order UUID or Order Number above to retrieve real-time status, shipment progress, and server receipt details."
        />
      )}
    </div>
  );
};
