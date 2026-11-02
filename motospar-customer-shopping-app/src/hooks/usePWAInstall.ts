import { useCallback, useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const DISMISS_STORAGE_KEY = '@motospar_pwa_banner_dismissed_v1';

export type PWAPlatformType = 'ios' | 'android' | 'desktop';

function detectPlatform(): PWAPlatformType {
  if (typeof window === 'undefined') return 'desktop';
  const ua = window.navigator.userAgent || '';
  const isIOSDevice =
    /iPad|iPhone|iPod/.test(ua) ||
    (window.navigator.platform === 'MacIntel' &&
      window.navigator.maxTouchPoints > 1);
  if (isIOSDevice) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'desktop';
}

function detectStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const isStandaloneMedia = window.matchMedia(
    '(display-mode: standalone)'
  ).matches;
  const isFullscreenMedia = window.matchMedia(
    '(display-mode: fullscreen)'
  ).matches;
  const isMinimalUiMedia = window.matchMedia(
    '(display-mode: minimal-ui)'
  ).matches;
  const isIOSStandalone =
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
    true;
  return (
    isStandaloneMedia ||
    isFullscreenMedia ||
    isMinimalUiMedia ||
    isIOSStandalone
  );
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(() =>
    detectStandalone()
  );
  const [platform] = useState<PWAPlatformType>(() => detectPlatform());
  const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(DISMISS_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    setIsInstalled(detectStandalone());

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsInstalled(true);
      }
    };
    mediaQuery.addEventListener('change', handleMediaChange);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const promptNativeInstall = useCallback(async (): Promise<
    'accepted' | 'dismissed' | 'unavailable'
  > => {
    if (!deferredPrompt) {
      return 'unavailable';
    }
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }
    return outcome;
  }, [deferredPrompt]);

  const dismissBanner = useCallback(() => {
    setIsBannerDismissed(true);
    try {
      localStorage.setItem(DISMISS_STORAGE_KEY, 'true');
    } catch {
      // Ignore storage quota errors
    }
  }, []);

  const resetBannerDismissal = useCallback(() => {
    setIsBannerDismissed(false);
    try {
      localStorage.removeItem(DISMISS_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }, []);

  return {
    isInstalled,
    hasNativePrompt: Boolean(deferredPrompt),
    platform,
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    isBannerDismissed,
    shouldShowBanner: !isInstalled && !isBannerDismissed,
    isOnline,
    promptNativeInstall,
    dismissBanner,
    resetBannerDismissal,
  };
}
