import React, { useCallback, useRef, useState } from 'react';
import { ArrowDown, Loader2, RefreshCw } from 'lucide-react';
import { triggerHaptic } from '../../services/haptics';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  isRefreshing?: boolean;
  refreshingLabel?: string;
  pullLabel?: string;
  releaseLabel?: string;
  children: React.ReactNode;
}

const PULL_THRESHOLD = 68;
const MAX_PULL_DISTANCE = 116;

/**
 * Mobile-native pull-to-refresh wrapper supporting both touch gestures (mobile)
 * and top-of-list pointer pull gestures (desktop preview).
 * Animates using compositor-friendly transform and opacity properties.
 */
export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  isRefreshing = false,
  refreshingLabel = 'Refreshing from MotoSpar...',
  pullLabel = 'Pull down to refresh',
  releaseLabel = 'Release to fetch fresh data',
  children,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const startYRef = useRef<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const thresholdCrossedRef = useRef<boolean>(false);

  const [pullDistance, setPullDistance] = useState<number>(0);
  const [internalRefreshing, setInternalRefreshing] = useState<boolean>(false);

  const activeRefreshing = isRefreshing || internalRefreshing;

  const isAtScrollTop = useCallback((): boolean => {
    if (typeof window !== 'undefined' && window.scrollY > 4) {
      return false;
    }
    let el: HTMLElement | null = containerRef.current;
    while (el) {
      if (el.scrollTop > 4) {
        return false;
      }
      el = el.parentElement;
    }
    return true;
  }, []);

  const beginPull = useCallback(
    (clientY: number) => {
      if (activeRefreshing) return;
      if (!isAtScrollTop()) return;
      startYRef.current = clientY;
      isDraggingRef.current = true;
      thresholdCrossedRef.current = false;
    },
    [activeRefreshing, isAtScrollTop]
  );

  const updatePull = useCallback(
    (clientY: number) => {
      if (!isDraggingRef.current || startYRef.current === null || activeRefreshing) {
        return;
      }
      if (!isAtScrollTop()) {
        isDraggingRef.current = false;
        startYRef.current = null;
        thresholdCrossedRef.current = false;
        setPullDistance(0);
        return;
      }

      const deltaY = clientY - startYRef.current;
      if (deltaY <= 0) {
        thresholdCrossedRef.current = false;
        setPullDistance(0);
        return;
      }

      // Apply natural rubber-band resistance
      const damped = Math.min(
        MAX_PULL_DISTANCE,
        Math.round(Math.pow(deltaY, 0.82))
      );

      if (damped >= PULL_THRESHOLD && !thresholdCrossedRef.current) {
        thresholdCrossedRef.current = true;
        triggerHaptic('selection');
      } else if (damped < PULL_THRESHOLD && thresholdCrossedRef.current) {
        thresholdCrossedRef.current = false;
      }

      setPullDistance(damped);
    },
    [activeRefreshing, isAtScrollTop]
  );

  const finishPull = useCallback(async () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    startYRef.current = null;

    if (pullDistance >= PULL_THRESHOLD && !activeRefreshing) {
      setPullDistance(56);
      setInternalRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setInternalRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, activeRefreshing, onRefresh]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    beginPull(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    updatePull(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    finishPull();
  };

  // Mouse handlers (so desktop preview users can also drag down from the top pull strip)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement | null;
    if (
      target &&
      ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'].includes(target.tagName)
    ) {
      return;
    }
    beginPull(e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    updatePull(e.clientY);
  };

  const handleMouseUp = () => {
    finishPull();
  };

  const isReadyToRelease = pullDistance >= PULL_THRESHOLD;
  const visualOffset = activeRefreshing ? 56 : pullDistance;
  const progressRatio = Math.min(1, visualOffset / PULL_THRESHOLD);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="relative"
    >
      {/* Pull Indicator Pill */}
      <div
        aria-live="polite"
        style={{
          transform: `translateY(${Math.max(0, visualOffset - 48)}px)`,
          opacity: activeRefreshing ? 1 : progressRatio,
        }}
        className={`pointer-events-none fixed left-1/2 -translate-x-1/2 top-16 z-30 transition-all ${
          isDraggingRef.current ? 'duration-0' : 'duration-200'
        }`}
      >
        {(visualOffset > 8 || activeRefreshing) && (
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900 text-white shadow-lg border border-slate-700 text-xs font-medium whitespace-nowrap">
            {activeRefreshing ? (
              <>
                <Loader2 className="w-4 h-4 text-rose-500 animate-spin" />
                <span>{refreshingLabel}</span>
              </>
            ) : isReadyToRelease ? (
              <>
                <RefreshCw className="w-4 h-4 text-rose-500 rotate-180 transition-transform duration-150" />
                <span>{releaseLabel}</span>
              </>
            ) : (
              <>
                <ArrowDown
                  style={{
                    transform: `rotate(${Math.round(progressRatio * 180)}deg)`,
                  }}
                  className="w-4 h-4 text-slate-300 transition-transform duration-75"
                />
                <span>{pullLabel}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Subtle Interactive Pull Hint Bar at Top */}
      <div className="flex items-center justify-center pb-2 select-none">
        <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
          <ArrowDown className="w-3 h-3" />
          <span>Pull down to refresh live data</span>
        </div>
      </div>

      {/* Main Content shifted by transform during pull */}
      <div
        style={{
          transform:
            visualOffset > 0 ? `translateY(${visualOffset}px)` : undefined,
        }}
        className={
          isDraggingRef.current
            ? ''
            : 'transition-transform duration-200 ease-out'
        }
      >
        {children}
      </div>
    </div>
  );
};
