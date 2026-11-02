import React, { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Settings2,
  ShieldCheck,
  UserPlus,
  Wrench,
} from 'lucide-react';
import { PWAInstallBanner } from '../../components/ui/PWAInstallBanner';
import {
  ConnectionMode,
  DEFAULT_PRODUCTION_API_BASE_URL,
  getActiveApiBaseUrl,
  getConnectionMode,
  getGoogleClientId,
  setConnectionMode,
  setCustomApiBaseUrl,
} from '../../config/env';
import { useAuth } from '../../context/AuthContext';
import { signInWithNativeGoogle } from '../../services/nativeGoogleSignIn';
import {
  requestPasswordReset,
  resetPassword,
  verifyPasswordResetOtp,
} from '../../services/motosparApi';

type AuthScreenMode =
  | 'LOGIN'
  | 'REGISTER'
  | 'FORGOT_REQUEST_OTP'
  | 'FORGOT_VERIFY_OTP'
  | 'FORGOT_RESET_PASSWORD';

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: {
              access_token?: string;
              error?: string;
            }) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

export const AuthFlow: React.FC = () => {
  const {
    loginWithEmail,
    loginWithGoogleAccessToken,
    loginWithGoogleIdToken,
    registerAccount,
    authLoading,
  } = useAuth();

  const [mode, setMode] = useState<AuthScreenMode>('LOGIN');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [googleSignInLoading, setGoogleSignInLoading] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Registration fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Password recovery fields (preserved across the 3 stages)
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryOtp, setRecoveryOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  // Google sign-in token exchange fallback drawer (when testing with a Google SDK token)
  const [showGoogleTokenModal, setShowGoogleTokenModal] = useState(false);
  const [manualGoogleToken, setManualGoogleToken] = useState('');

  // Environment configuration drawer
  const [showEnvConfig, setShowEnvConfig] = useState(false);
  const [apiBaseInput, setApiBaseInput] = useState(getActiveApiBaseUrl());
  const [connModeInput, setConnModeInput] = useState<ConnectionMode>(
    getConnectionMode()
  );

  const switchMode = (next: AuthScreenMode) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setMode(next);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const email = loginEmail.trim();
    if (!email || !loginPassword) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    const res = await loginWithEmail({
      email,
      password: loginPassword,
    });

    if (!res.ok) {
      setErrorMessage(res.message);
    }
  };

  const handleGoogleSignInClick = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const clientId = getGoogleClientId();
    if (Capacitor.isNativePlatform()) {
      if (googleSignInLoading) return;
      if (!clientId) {
        setErrorMessage('Google Sign-In is not configured for this release.');
        return;
      }
      setGoogleSignInLoading(true);
      try {
        const idToken = await signInWithNativeGoogle(clientId);
        const result = await loginWithGoogleIdToken(idToken);
        if (!result.ok) setErrorMessage(result.message);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Google Sign-In could not be completed.');
      } finally {
        setGoogleSignInLoading(false);
      }
      return;
    }
    if (
      clientId &&
      window.google?.accounts?.oauth2?.initTokenClient
    ) {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        callback: async (tokenResponse) => {
          if (tokenResponse.error || !tokenResponse.access_token) {
            setErrorMessage(
              tokenResponse.error ||
                'Google Sign-In did not return an access token.'
            );
            return;
          }
          const res = await loginWithGoogleAccessToken(
            tokenResponse.access_token
          );
          if (!res.ok) {
            setErrorMessage(res.message);
          }
        },
      });
      tokenClient.requestAccessToken();
    } else {
      // Manual token exchange is a development-only diagnostic. Never expose
      // an access-token paste flow to production customers.
      if (import.meta.env.DEV) {
        setShowGoogleTokenModal(true);
      } else {
        setErrorMessage(
          clientId
            ? 'Google Sign-In is still loading. Please try again.'
            : 'Google Sign-In is not configured for this release. Please sign in with your email address.'
        );
      }
    }
  };

  const handleManualGoogleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!import.meta.env.DEV) return;
    const token = manualGoogleToken.trim();
    if (!token) {
      setErrorMessage('Please provide a valid Google OAuth access token.');
      return;
    }
    setShowGoogleTokenModal(false);
    const res = await loginWithGoogleAccessToken(token);
    if (!res.ok) {
      setErrorMessage(res.message);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !regEmail.trim() ||
      !regPassword ||
      !regConfirmPassword
    ) {
      setErrorMessage('All registration fields are required.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Password and confirm password do not match.');
      return;
    }

    const res = await registerAccount({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      confirm_password: regConfirmPassword,
    });

    if (res.ok) {
      setSuccessMessage(
        res.message ||
          'Account created on MotoSpar. You can now sign in with your credentials.'
      );
      setLoginEmail(regEmail.trim());
      setMode('LOGIN');
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const email = recoveryEmail.trim();
    if (!email) {
      setErrorMessage('Please enter the email address for your account.');
      return;
    }

    setRecoveryLoading(true);
    try {
      const res = await requestPasswordReset({ email });
      if (res.ok) {
        setSuccessMessage(
          res.message || `OTP sent to ${email}. Please check your inbox.`
        );
        setMode('FORGOT_VERIFY_OTP');
      } else {
        setErrorMessage(res.message);
      }
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const email = recoveryEmail.trim();
    const otp = recoveryOtp.trim();
    if (!email || !otp) {
      setErrorMessage('Please enter the OTP sent to your email.');
      return;
    }

    setRecoveryLoading(true);
    try {
      const res = await verifyPasswordResetOtp({ email, otp });
      if (res.ok) {
        setSuccessMessage(
          res.message || 'OTP verified. Enter your new password below.'
        );
        setMode('FORGOT_RESET_PASSWORD');
      } else {
        setErrorMessage(res.message);
      }
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const email = recoveryEmail.trim();
    if (!newPassword || !confirmNewPassword) {
      setErrorMessage('Please enter and confirm your new password.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('New password and confirmation do not match.');
      return;
    }

    setRecoveryLoading(true);
    try {
      const res = await resetPassword({
        email,
        new_password: newPassword,
        confirm_password: confirmNewPassword,
      });
      if (res.ok) {
        setSuccessMessage(
          res.message || 'Password reset complete. Sign in with your new password.'
        );
        setLoginEmail(email);
        setMode('LOGIN');
      } else {
        setErrorMessage(res.message);
      }
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleSaveEnvConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomApiBaseUrl(apiBaseInput);
    setConnectionMode(connModeInput);
    setShowEnvConfig(false);
    setSuccessMessage(
      `API configuration updated to ${getActiveApiBaseUrl()} (${connModeInput} mode).`
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top minimal bar */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 font-display">
            MotoSpar
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowEnvConfig((v) => !v)}
          className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-2"
        >
          <Settings2 className="w-4 h-4 text-slate-500" />
          <span>API Config</span>
        </button>
      </header>

      <div className="max-w-md w-full mx-auto px-4 pt-4">
        <PWAInstallBanner />
      </div>

      {/* Optional Environment Configuration Drawer */}
      {showEnvConfig && (
        <div className="max-w-md w-full mx-auto mt-4 px-4">
          <form
            onSubmit={handleSaveEnvConfig}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">
                MotoSpar API Target Configuration
              </h3>
              <button
                type="button"
                onClick={() => {
                  setApiBaseInput(DEFAULT_PRODUCTION_API_BASE_URL);
                  setCustomApiBaseUrl(null);
                }}
                className="text-xs font-medium text-rose-600 hover:underline"
              >
                Reset to Default
              </button>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                API_BASE_URL
              </label>
              <input
                type="url"
                required
                value={apiBaseInput}
                onChange={(e) => setApiBaseInput(e.target.value)}
                placeholder="https://api.motospar.com"
                className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-slate-900"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                All endpoints resolve to {'{API_BASE_URL}/api/{path}/'}.
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Connection Mode
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setConnModeInput('proxy')}
                  className={`min-h-[40px] text-xs font-medium rounded-lg transition-colors ${
                    connModeInput === 'proxy'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Express Proxy (CORS-Safe)
                </button>
                <button
                  type="button"
                  onClick={() => setConnModeInput('direct')}
                  className={`min-h-[40px] text-xs font-medium rounded-lg transition-colors ${
                    connModeInput === 'direct'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Direct Browser Fetch
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowEnvConfig(false)}
                className="min-h-[44px] px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-medium hover:bg-slate-800"
              >
                Save Target
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Auth Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
          {/* Status Alerts */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold mb-0.5">Authentication Error</p>
                <p className="text-red-800 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="mb-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold mb-0.5">Success</p>
                <p className="text-emerald-800 leading-relaxed">
                  {successMessage}
                </p>
              </div>
            </div>
          )}

          {/* MODE: LOGIN */}
          {mode === 'LOGIN' && (
            <div>
              <div className="mb-6">
                <p className="text-xs font-medium text-rose-600 mb-1">
                  Customer Portal · Car &amp; Bike Parts
                </p>
                <h1 className="text-2xl font-bold text-slate-900 font-display">
                  Sign in to MotoSpar
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Access live OEM &amp; aftermarket catalogs, saved addresses,
                  and order tracking.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full min-h-[46px] pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setRecoveryEmail(loginEmail);
                        switchMode('FORGOT_REQUEST_OTP');
                      }}
                      className="text-xs font-medium text-rose-600 hover:text-rose-700"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full min-h-[46px] pl-10 pr-11 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                      className="min-h-[44px] min-w-[44px] absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {authLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>
              </form>

              {(getGoogleClientId() || import.meta.env.DEV) && (
                <>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-3 text-slate-500">
                        Or continue with
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={authLoading || googleSignInLoading}
                    onClick={handleGoogleSignInClick}
                    className="w-full min-h-[48px] px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2.5 disabled:opacity-60"
                  >
                    {googleSignInLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-slate-700" />
                    )}
                    <span>
                      {googleSignInLoading
                        ? 'Signing in with Google...'
                        : 'Continue with Google'}
                    </span>
                  </button>
                </>
              )}

              <p className="text-center text-xs text-slate-600 mt-6">
                New to MotoSpar?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('REGISTER')}
                  className="font-semibold text-rose-600 hover:text-rose-700 ml-1"
                >
                  Create customer account
                </button>
              </p>
            </div>
          )}

          {/* MODE: REGISTER */}
          {mode === 'REGISTER' && (
            <div>
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => switchMode('LOGIN')}
                  className="min-h-[44px] -ml-2 px-2 inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 mb-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Sign In</span>
                </button>
                <h1 className="text-2xl font-bold text-slate-900 font-display">
                  Create Customer Account
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Register with MotoSpar to shop parts and track orders.
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Aarav"
                      className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Sharma"
                      className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full min-h-[48px] mt-2 px-5 py-3 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {authLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Registering...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Create Account</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* MODE: FORGOT PASSWORD — STEP 1: REQUEST OTP */}
          {mode === 'FORGOT_REQUEST_OTP' && (
            <div>
              <button
                type="button"
                onClick={() => switchMode('LOGIN')}
                className="min-h-[44px] -ml-2 px-2 inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Sign In</span>
              </button>
              <h1 className="text-2xl font-bold text-slate-900 font-display">
                Password Recovery
              </h1>
              <p className="text-sm text-slate-600 mt-1 mb-5">
                Step 1 of 3 · Enter your registered email to receive a one-time
                verification code.
              </p>

              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Account Email
                  </label>
                  <input
                    type="email"
                    required
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full min-h-[46px] px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={recoveryLoading}
                  className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {recoveryLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Requesting OTP...</span>
                    </>
                  ) : (
                    <span>Send OTP</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* MODE: FORGOT PASSWORD — STEP 2: VERIFY OTP */}
          {mode === 'FORGOT_VERIFY_OTP' && (
            <div>
              <button
                type="button"
                onClick={() => switchMode('FORGOT_REQUEST_OTP')}
                className="min-h-[44px] -ml-2 px-2 inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Change Email</span>
              </button>
              <h1 className="text-2xl font-bold text-slate-900 font-display">
                Verify OTP
              </h1>
              <p className="text-sm text-slate-600 mt-1 mb-5">
                Step 2 of 3 · Enter the OTP sent to{' '}
                <span className="font-medium text-slate-900">
                  {recoveryEmail}
                </span>
                .
              </p>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    One-Time Password (OTP)
                  </label>
                  <input
                    type="text"
                    required
                    value={recoveryOtp}
                    onChange={(e) => setRecoveryOtp(e.target.value)}
                    placeholder="Enter OTP code"
                    className="w-full min-h-[46px] px-3.5 py-2.5 text-base font-mono tracking-widest bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={recoveryLoading}
                  className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {recoveryLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying OTP...</span>
                    </>
                  ) : (
                    <span>Verify Code</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* MODE: FORGOT PASSWORD — STEP 3: RESET PASSWORD */}
          {mode === 'FORGOT_RESET_PASSWORD' && (
            <div>
              <button
                type="button"
                onClick={() => switchMode('FORGOT_VERIFY_OTP')}
                className="min-h-[44px] -ml-2 px-2 inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to OTP</span>
              </button>
              <h1 className="text-2xl font-bold text-slate-900 font-display">
                Set New Password
              </h1>
              <p className="text-sm text-slate-600 mt-1 mb-5">
                Step 3 of 3 · Choose a new password for{' '}
                <span className="font-medium text-slate-900">
                  {recoveryEmail}
                </span>
                .
              </p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full min-h-[46px] px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full min-h-[46px] px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={recoveryLoading}
                  className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {recoveryLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Reset Password</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Google Sign-In Configuration / Token Exchange Modal */}
      {import.meta.env.DEV && showGoogleTokenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 font-display mb-2">
              Google Sign-In Exchange
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              {getGoogleClientId()
                ? 'Google Identity Services SDK is initializing. You can also paste a Google OAuth access token below to exchange it directly with POST /api/google/login/callback/.'
                : 'VITE_GOOGLE_CLIENT_ID is not set in the environment. Simulated login is disabled. To test POST /api/google/login/callback/ directly, configure VITE_GOOGLE_CLIENT_ID or provide a valid Google OAuth access_token below:'}
            </p>
            <form onSubmit={handleManualGoogleTokenSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Google Access Token
                </label>
                <input
                  type="text"
                  required
                  value={manualGoogleToken}
                  onChange={(e) => setManualGoogleToken(e.target.value)}
                  placeholder="ya29.a0..."
                  className="w-full min-h-[44px] px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGoogleTokenModal(false)}
                  className="min-h-[44px] px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                >
                  Exchange Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="py-4 px-6 text-center text-xs text-slate-500">
        MotoSpar Customer Shopping App · Connected to live MotoSpar API
      </footer>
    </div>
  );
};
