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
  CustomerRegisterRequest,
  LoginViaEmailRequest,
  MotoSparUser,
  ProfileUpdateMultipartFields,
} from '../types/motospar';
import { onUnauthorizedSession } from '../services/apiClient';
import { clearNativeGoogleSession } from '../services/nativeGoogleSignIn';
import {
  AuthSessionPayload,
  googleLoginCallback,
  loginViaEmail,
  logoutCustomer,
  registerCustomer,
  updateCustomerProfile,
} from '../services/motosparApi';
import {
  clearAllSessionStorage,
  persistSession,
  readStoredSession,
} from '../services/storage';

interface AuthContextValue {
  isHydrating: boolean;
  isAuthenticated: boolean;
  user: MotoSparUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  authLoading: boolean;
  loginWithEmail: (
    payload: LoginViaEmailRequest
  ) => Promise<ApiResult<AuthSessionPayload>>;
  loginWithGoogleAccessToken: (
    googleAccessToken: string
  ) => Promise<ApiResult<AuthSessionPayload>>;
  loginWithGoogleIdToken: (
    googleIdToken: string
  ) => Promise<ApiResult<AuthSessionPayload>>;
  registerAccount: (
    payload: CustomerRegisterRequest
  ) => Promise<ApiResult<AuthSessionPayload>>;
  updateProfile: (
    fields: ProfileUpdateMultipartFields
  ) => Promise<ApiResult<AuthSessionPayload>>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function extractAuthCredentials(
  result: ApiResult<AuthSessionPayload>,
  fallbackEmail?: string
): {
  access: string | null;
  refresh: string | null;
  user: MotoSparUser | null;
} {
  const data = result.data || {};
  const raw = result.raw || {};
  const nested =
    raw.data && typeof raw.data === 'object'
      ? (raw.data as Record<string, unknown>)
      : {};

  const access =
    (typeof data.access === 'string' && data.access) ||
    (typeof nested.access === 'string' && nested.access) ||
    (typeof raw.access === 'string' && raw.access) ||
    null;

  const refresh =
    (typeof data.refresh === 'string' && data.refresh) ||
    (typeof nested.refresh === 'string' && nested.refresh) ||
    (typeof raw.refresh === 'string' && raw.refresh) ||
    null;

  const userCandidate =
    (data.user && typeof data.user === 'object' ? data.user : null) ||
    (nested.user && typeof nested.user === 'object'
      ? (nested.user as MotoSparUser)
      : null) ||
    (raw.user && typeof raw.user === 'object'
      ? (raw.user as MotoSparUser)
      : null);

  const user: MotoSparUser | null = userCandidate
    ? userCandidate
    : access && fallbackEmail
      ? { email: fallbackEmail }
      : null;

  return { access, refresh, user };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isHydrating, setIsHydrating] = useState<boolean>(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<MotoSparUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // Restore stored session on app launch before rendering protected views
  useEffect(() => {
    let isMounted = true;
    readStoredSession()
      .then((stored) => {
        if (!isMounted) return;
        if (stored.accessToken) {
          setAccessToken(stored.accessToken);
          setRefreshToken(stored.refreshToken);
          setUser(stored.user);
        }
      })
      .catch(() => {
        // Fail closed: if native secure storage cannot be read, do not restore
        // a session from an insecure fallback store.
        if (isMounted) console.error('Secure customer session could not be restored.');
      })
      .finally(() => {
        if (isMounted) setIsHydrating(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for unrecoverable 401 unauthorized events from apiClient
  useEffect(() => {
    return onUnauthorizedSession(() => {
      void clearAllSessionStorage().catch(() => {
        console.error('Secure customer session could not be cleared.');
      });
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
    });
  }, []);

  const applySessionFromResult = useCallback(
    async (result: ApiResult<AuthSessionPayload>, fallbackEmail?: string) => {
      const { access, refresh, user: nextUser } = extractAuthCredentials(
        result,
        fallbackEmail
      );
      await persistSession({
        ...(access ? { accessToken: access } : {}),
        ...(refresh ? { refreshToken: refresh } : {}),
        ...(nextUser ? { user: nextUser } : {}),
      });
      if (access) {
        setAccessToken(access);
      }
      if (refresh) {
        setRefreshToken(refresh);
      }
      if (nextUser) {
        setUser(nextUser);
      }
    },
    []
  );

  const loginWithEmail = useCallback(
    async (
      payload: LoginViaEmailRequest
    ): Promise<ApiResult<AuthSessionPayload>> => {
      setAuthLoading(true);
      try {
        const res = await loginViaEmail(payload);
        if (res.ok) {
          try {
            await applySessionFromResult(res, payload.email);
          } catch {
            return {
              ...res,
              ok: false,
              message: 'MotoSpar could not securely save this session on the device.',
            };
          }
        }
        return res;
      } finally {
        setAuthLoading(false);
      }
    },
    [applySessionFromResult]
  );

  const loginWithGoogleAccessToken = useCallback(
    async (
      googleAccessToken: string
    ): Promise<ApiResult<AuthSessionPayload>> => {
      setAuthLoading(true);
      try {
        const res = await googleLoginCallback({
          access_token: googleAccessToken,
        });
        if (res.ok) {
          try {
            await applySessionFromResult(res);
          } catch {
            return {
              ...res,
              ok: false,
              message: 'MotoSpar could not securely save this session on the device.',
            };
          }
        }
        return res;
      } finally {
        setAuthLoading(false);
      }
    },
    [applySessionFromResult]
  );

  const loginWithGoogleIdToken = useCallback(
    async (googleIdToken: string): Promise<ApiResult<AuthSessionPayload>> => {
      setAuthLoading(true);
      try {
        const res = await googleLoginCallback({ id_token: googleIdToken });
        if (res.ok) {
          try {
            await applySessionFromResult(res);
          } catch {
            return {
              ...res,
              ok: false,
              message: 'MotoSpar could not securely save this session on the device.',
            };
          }
        }
        return res;
      } finally {
        setAuthLoading(false);
      }
    },
    [applySessionFromResult]
  );

  const registerAccount = useCallback(
    async (
      payload: CustomerRegisterRequest
    ): Promise<ApiResult<AuthSessionPayload>> => {
      setAuthLoading(true);
      try {
        const res = await registerCustomer(payload);
        if (res.ok) {
          const { access } = extractAuthCredentials(res, payload.email);
          if (access) {
            try {
              await applySessionFromResult(res, payload.email);
            } catch {
              return {
                ...res,
                ok: false,
                message: 'MotoSpar could not securely save this session on the device.',
              };
            }
          }
        }
        return res;
      } finally {
        setAuthLoading(false);
      }
    },
    [applySessionFromResult]
  );

  const updateProfile = useCallback(
    async (
      fields: ProfileUpdateMultipartFields
    ): Promise<ApiResult<AuthSessionPayload>> => {
      setAuthLoading(true);
      try {
        const res = await updateCustomerProfile(fields);
        if (res.ok) {
          const { access, refresh, user: updatedUser } =
            extractAuthCredentials(res);
          const mergedUser = updatedUser
            ? updatedUser
            : user
              ? {
                  ...user,
                  first_name: fields.first_name,
                  last_name: fields.last_name,
                  phone_number: fields.phone_number,
                  address: fields.address,
                  state: fields.state,
                  postal_code: fields.postal_code,
                  country: fields.country,
                  bio: fields.bio,
                }
              : null;
          try {
            await persistSession({
              ...(access ? { accessToken: access } : {}),
              ...(refresh ? { refreshToken: refresh } : {}),
              ...(mergedUser ? { user: mergedUser } : {}),
            });
          } catch {
            return {
              ...res,
              ok: false,
              message: 'MotoSpar could not securely save the updated session on this device.',
            };
          }
          if (access) {
            setAccessToken(access);
          }
          if (refresh) {
            setRefreshToken(refresh);
          }
          if (mergedUser) {
            setUser(mergedUser);
          }
        }
        return res;
      } finally {
        setAuthLoading(false);
      }
    },
    [user]
  );

  const logout = useCallback(async () => {
    setAuthLoading(true);
    try {
      try {
        const storedSession = await readStoredSession();
        const currentRefresh = refreshToken || storedSession.refreshToken || '';
        if (currentRefresh) {
          await logoutCustomer({ refresh_token: currentRefresh });
        }
      } catch {
        // Local logout still proceeds if the refresh token cannot be read or
        // the backend is unavailable.
      }
    } finally {
      // Always purge all 3 storage keys (@usertoken, @user_refreshtoken, @userdetails)
      try {
        await clearAllSessionStorage();
      } catch {
        console.error('Secure customer session could not be cleared.');
      }
      try {
        await clearNativeGoogleSession();
      } catch {
        // MotoSpar session is already cleared; provider state is best effort.
      }
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      setAuthLoading(false);
    }
  }, [refreshToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isHydrating,
      isAuthenticated: Boolean(accessToken),
      user,
      accessToken,
      refreshToken,
      authLoading,
      loginWithEmail,
      loginWithGoogleAccessToken,
      loginWithGoogleIdToken,
      registerAccount,
      updateProfile,
      logout,
    }),
    [
      isHydrating,
      accessToken,
      user,
      refreshToken,
      authLoading,
      loginWithEmail,
      loginWithGoogleAccessToken,
      loginWithGoogleIdToken,
      registerAccount,
      updateProfile,
      logout,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
