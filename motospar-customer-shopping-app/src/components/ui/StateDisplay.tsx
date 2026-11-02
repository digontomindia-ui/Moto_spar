import React from 'react';
import { AlertCircle, Inbox, Loader2, RefreshCw } from 'lucide-react';

interface LoadingStateProps {
  label?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  label = 'Loading from MotoSpar...',
}) => (
  <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
    <Loader2 className="w-8 h-8 text-rose-600 animate-spin mb-3" />
    <p className="text-sm font-medium text-slate-600">{label}</p>
  </div>
);

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
}) => (
  <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-white border border-slate-200 rounded-2xl">
    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-3">
      <Inbox className="w-6 h-6" />
    </div>
    <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
    <p className="text-sm text-slate-600 max-w-md mb-5">{description}</p>
    {actionLabel && onAction && (
      <button
        type="button"
        onClick={onAction}
        className="min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors whitespace-nowrap"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to complete request',
  message,
  onRetry,
}) => (
  <div
    role="alert"
    className="flex flex-col items-center justify-center py-10 px-6 text-center bg-red-50/70 border border-red-200 rounded-2xl"
  >
    <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center text-red-700 mb-3">
      <AlertCircle className="w-5 h-5" />
    </div>
    <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
    <p className="text-sm text-slate-700 max-w-md mb-5">{message}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors whitespace-nowrap"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Try Again</span>
      </button>
    )}
  </div>
);

export const ProductCardSkeleton: React.FC = () => (
  <div
    aria-hidden="true"
    className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col animate-pulse"
  >
    {/* 4:3 Image Placeholder */}
    <div className="relative aspect-4/3 bg-slate-200/70">
      <div className="absolute top-3 right-3 w-11 h-11 rounded-full bg-white/70" />
    </div>

    {/* Card Body Placeholder */}
    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
      <div className="space-y-2.5">
        {/* Unboxed metadata line */}
        <div className="h-3 w-2/5 bg-slate-200 rounded" />
        {/* Title lines */}
        <div className="h-4 w-11/12 bg-slate-200 rounded" />
        <div className="h-4 w-3/5 bg-slate-200 rounded" />
      </div>

      {/* Price & Stock footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="h-5 w-24 bg-slate-200 rounded font-mono" />
        <div className="h-3.5 w-20 bg-slate-200 rounded" />
      </div>
    </div>
  </div>
);

interface ProductGridSkeletonProps {
  count?: number;
}

export const ProductGridSkeleton: React.FC<ProductGridSkeletonProps> = ({
  count = 6,
}) => (
  <div
    role="status"
    aria-label="Loading catalog products"
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
  >
    {Array.from({ length: count }).map((_, idx) => (
      <ProductCardSkeleton key={idx} />
    ))}
  </div>
);

export const OrderCardSkeleton: React.FC = () => (
  <div
    aria-hidden="true"
    className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3.5 animate-pulse"
  >
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
      <div className="flex items-center gap-2">
        <div className="h-4 w-28 bg-slate-200 rounded" />
        <div className="h-3.5 w-32 bg-slate-200 rounded" />
        <div className="h-3.5 w-24 bg-slate-200 rounded" />
      </div>
      <div className="h-4 w-20 bg-slate-200 rounded" />
    </div>

    <div className="space-y-2.5 pt-1">
      <div className="flex items-center justify-between">
        <div className="h-3.5 w-48 bg-slate-200 rounded" />
        <div className="h-3.5 w-24 bg-slate-200 rounded" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-3.5 w-36 bg-slate-200 rounded" />
        <div className="h-3.5 w-24 bg-slate-200 rounded" />
      </div>
    </div>
  </div>
);

interface OrderListSkeletonProps {
  count?: number;
}

export const OrderListSkeleton: React.FC<OrderListSkeletonProps> = ({
  count = 4,
}) => (
  <div role="status" aria-label="Loading order history" className="space-y-4">
    {Array.from({ length: count }).map((_, idx) => (
      <OrderCardSkeleton key={idx} />
    ))}
  </div>
);
