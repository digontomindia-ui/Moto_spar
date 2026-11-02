/**
 * Native-style Haptic Feedback utility for the MotoSpar Customer Mobile App.
 * Uses the Web Vibration API (`navigator.vibrate`) with distinct tactile patterns
 * for cart actions, wishlist toggles, pull-to-refresh threshold snaps, and
 * verified order completions. Safely degrades on unsupported desktop browsers.
 */

export type HapticPattern =
  | 'selection'
  | 'impactLight'
  | 'impactMedium'
  | 'success'
  | 'warning'
  | 'error';

const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  selection: 10,
  impactLight: 16,
  impactMedium: 28,
  success: [20, 45, 35],
  warning: [30, 55, 30],
  error: [45, 50, 45, 50, 60],
};

const HAPTICS_ENABLED_KEY = '@motospar_haptics_enabled';

export function isHapticsEnabled(): boolean {
  try {
    const stored = localStorage.getItem(HAPTICS_ENABLED_KEY);
    if (stored === 'false') return false;
  } catch {
    // Ignore storage read errors
  }
  return true;
}

export function setHapticsEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(HAPTICS_ENABLED_KEY, enabled ? 'true' : 'false');
  } catch {
    // Ignore storage write errors
  }
}

export function triggerHaptic(pattern: HapticPattern = 'selection'): void {
  if (typeof window === 'undefined' || !isHapticsEnabled()) {
    return;
  }

  // Respect user's reduced-motion accessibility setting
  if (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return;
  }

  try {
    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.vibrate === 'function'
    ) {
      navigator.vibrate(HAPTIC_PATTERNS[pattern]);
    }
  } catch {
    // Ignore errors on browsers that restrict vibration outside active gestures
  }
}
