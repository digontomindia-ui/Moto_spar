import React, { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import {
  CheckCircle2,
  Download,
  MoreVertical,
  PlusSquare,
  Share,
  Smartphone,
  WifiOff,
  Wrench,
  X,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { triggerHaptic } from '../../services/haptics';

interface PWAInstallBannerProps {
  /** Optional className for wrapper spacing */
  className?: string;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  className = '',
}) => {
  const {
    isInstalled,
    hasNativePrompt,
    platform,
    isIOS,
    shouldShowBanner,
    isOnline,
    promptNativeInstall,
    dismissBanner,
  } = usePWAInstall();

  // An Android Capacitor shell is already installed as a native app; do not
  // show the browser-only PWA install prompt inside it.
  if (Capacitor.isNativePlatform()) return null;

  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'android' | 'ios'>(
    isIOS ? 'ios' : 'android'
  );
  const [justInstalledMessage, setJustInstalledMessage] = useState<
    string | null
  >(null);

  const handleInstallClick = async () => {
    triggerHaptic('selection');

    if (hasNativePrompt) {
      const outcome = await promptNativeInstall();
      if (outcome === 'accepted') {
        triggerHaptic('success');
        setJustInstalledMessage(
          'MotoSpar is being added to your home screen for instant access.'
        );
      }
      return;
    }

    // If native beforeinstallprompt isn't available (iOS Safari, or iframe preview / already dismissed browser prompt),
    // open the platform-tailored Add to Home Screen guide modal.
    setActiveGuideTab(isIOS ? 'ios' : 'android');
    setShowInstructionsModal(true);
  };

  const handleDismiss = () => {
    triggerHaptic('impactLight');
    dismissBanner();
  };

  return (
    <>
      {/* Offline Connectivity Banner */}
      {!isOnline && (
        <div
          role="status"
          aria-live="polite"
          className="mb-3 rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs text-amber-900"
        >
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              You are currently offline. Cached MotoSpar shell is active; live
              parts search and checkout will resume automatically when
              reconnected.
            </span>
          </div>
        </div>
      )}

      {/* Just Installed Confirmation Toast */}
      {justInstalledMessage && (
        <div className="mb-4 rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs font-medium text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{justInstalledMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setJustInstalledMessage(null)}
            className="p-1 text-emerald-700 hover:text-emerald-950 rounded-lg"
            aria-label="Close installation message"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add to Home Screen Banner */}
      {shouldShowBanner && (
        <section
          aria-label="Install MotoSpar Mobile App"
          className={`bg-slate-900 text-white rounded-2xl p-3.5 sm:px-5 sm:py-3.5 border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${className}`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-inner">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-sm font-bold text-white font-display truncate">
                  Add MotoSpar to Home Screen
                </h2>
                <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-rose-400 border border-slate-700 shrink-0">
                  PWA App
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 line-clamp-2">
                {isIOS
                  ? 'Install on your iPhone or iPad for full-screen spare parts lookup, live order tracking, and instant launch.'
                  : platform === 'android'
                    ? 'Install as a standalone Android app for full-screen browsing, haptic feedback, and one-tap order tracking.'
                    : 'Install the MotoSpar app on your mobile device or desktop for a fast, full-screen native experience.'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              {isIOS ? (
                <>
                  <Share className="w-3.5 h-3.5" />
                  <span>How to Install</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>
                    {hasNativePrompt ? 'Install App' : 'Add to Home Screen'}
                  </span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss Add to Home Screen banner"
              className="min-h-[44px] min-w-[44px] rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* Step-by-Step Android & iOS Installation Modal */}
      {showInstructionsModal && !isInstalled && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-modal-title"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <h3
                    id="pwa-install-modal-title"
                    className="text-base font-bold text-slate-900 font-display"
                  >
                    Install MotoSpar Mobile App
                  </h3>
                  <p className="text-xs text-slate-500">
                    Launch directly from your home screen in standalone mode
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowInstructionsModal(false)}
                className="min-h-[44px] min-w-[44px] rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
                aria-label="Close installation guide"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Platform Switcher Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  setActiveGuideTab('android');
                }}
                className={`min-h-[40px] px-3 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeGuideTab === 'android'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Android (Chrome)
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  setActiveGuideTab('ios');
                }}
                className={`min-h-[40px] px-3 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeGuideTab === 'ios'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                iPhone / iPad (Safari)
              </button>
            </div>

            {/* Instructions Content */}
            {activeGuideTab === 'android' ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div className="text-xs text-slate-700">
                    <p className="font-semibold text-slate-900">
                      Open in Chrome on Android
                    </p>
                    <p className="mt-0.5 text-slate-600">
                      Tap the browser menu icon{' '}
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-800 font-medium">
                        <MoreVertical className="w-3 h-3 mr-0.5" /> Menu
                      </span>{' '}
                      in the top-right corner of Chrome.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div className="text-xs text-slate-700">
                    <p className="font-semibold text-slate-900">
                      Select &ldquo;Install app&rdquo; or &ldquo;Add to Home
                      screen&rdquo;
                    </p>
                    <p className="mt-0.5 text-slate-600">
                      Tap{' '}
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-800 font-medium">
                        <Download className="w-3 h-3 mr-1 text-rose-600" />
                        Install app
                      </span>{' '}
                      from the menu options.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div className="text-xs text-slate-700">
                    <p className="font-semibold text-slate-900">
                      Launch MotoSpar from your Home Screen
                    </p>
                    <p className="mt-0.5 text-slate-600">
                      MotoSpar will appear in your app drawer and home screen
                      with full-screen navigation and haptic feedback.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div className="text-xs text-slate-700">
                    <p className="font-semibold text-slate-900">
                      Tap the Share button in Safari
                    </p>
                    <p className="mt-0.5 text-slate-600">
                      In the bottom toolbar of iOS Safari, tap the{' '}
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-800 font-medium">
                        <Share className="w-3 h-3 mr-1 text-rose-600" />
                        Share
                      </span>{' '}
                      icon.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div className="text-xs text-slate-700">
                    <p className="font-semibold text-slate-900">
                      Tap &ldquo;Add to Home Screen&rdquo;
                    </p>
                    <p className="mt-0.5 text-slate-600">
                      Scroll down the share sheet and select{' '}
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-800 font-medium">
                        <PlusSquare className="w-3 h-3 mr-1 text-rose-600" />
                        Add to Home Screen
                      </span>
                      .
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div className="text-xs text-slate-700">
                    <p className="font-semibold text-slate-900">
                      Tap &ldquo;Add&rdquo; in the top-right corner
                    </p>
                    <p className="mt-0.5 text-slate-600">
                      The MotoSpar icon will be added to your iPhone or iPad
                      Home Screen and open without browser bars.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Native prompt button if available */}
            {hasNativePrompt && (
              <button
                type="button"
                onClick={async () => {
                  const outcome = await promptNativeInstall();
                  if (outcome === 'accepted') {
                    setShowInstructionsModal(false);
                  }
                }}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Trigger Native Install Prompt Now</span>
              </button>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  dismissBanner();
                  setShowInstructionsModal(false);
                }}
                className="text-xs font-medium text-slate-500 hover:text-slate-800"
              >
                Don&apos;t show banner again
              </button>

              <button
                type="button"
                onClick={() => setShowInstructionsModal(false)}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
