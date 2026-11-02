import { Capacitor } from '@capacitor/core';
import { MotoSparUser } from '../types/motospar';
import { NativeSecureSession } from './nativeSecureSession';

/**
 * Browser/PWA sessions use localStorage. Native Android sessions are encrypted
 * with an AES-GCM key held by Android Keystore; only ciphertext is persisted in
 * SharedPreferences. A one-time migration moves legacy WebView tokens into the
 * native store and removes the plaintext copies after a successful write.
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@usertoken',
  REFRESH_TOKEN: '@user_refreshtoken',
  USER_DETAILS: '@userdetails',
} as const;

export interface StoredSession {
  accessToken: string | null;
  refreshToken: string | null;
  user: MotoSparUser | null;
}

const emptySession = (): StoredSession => ({
  accessToken: null,
  refreshToken: null,
  user: null,
});

let nativeSessionCache: StoredSession | null = null;
let nativeSessionLoad: Promise<StoredSession> | null = null;

function readLegacySession(): StoredSession {
  try {
    const rawUser = localStorage.getItem(STORAGE_KEYS.USER_DETAILS);
    let user: MotoSparUser | null = null;
    if (rawUser) {
      const parsed: unknown = JSON.parse(rawUser);
      if (parsed && typeof parsed === 'object') {
        user = parsed as MotoSparUser;
      }
    }
    return {
      accessToken: localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
      refreshToken: localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
      user,
    };
  } catch {
    return emptySession();
  }
}

function clearLegacySession(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DETAILS);
  } catch {
    // The encrypted native session remains authoritative if local cleanup fails.
  }
}

function normalizeSession(value: unknown): StoredSession {
  if (!value || typeof value !== 'object') return emptySession();
  const session = value as Record<string, unknown>;
  return {
    accessToken:
      typeof session.accessToken === 'string' && session.accessToken.trim()
        ? session.accessToken
        : null,
    refreshToken:
      typeof session.refreshToken === 'string' && session.refreshToken.trim()
        ? session.refreshToken
        : null,
    user:
      session.user && typeof session.user === 'object'
        ? (session.user as MotoSparUser)
        : null,
  };
}

async function loadNativeSession(): Promise<StoredSession> {
  if (nativeSessionCache) return nativeSessionCache;
  if (nativeSessionLoad) return nativeSessionLoad;

  nativeSessionLoad = (async () => {
    const result = await NativeSecureSession.getSession();
    if (result.value) {
      nativeSessionCache = normalizeSession(JSON.parse(result.value));
      clearLegacySession();
      return nativeSessionCache;
    }

    // Migrate a session saved by the previous WebView build. Never fall back to
    // writing new native credentials to localStorage if Keystore access fails.
    const legacy = readLegacySession();
    if (legacy.accessToken || legacy.refreshToken || legacy.user) {
      await NativeSecureSession.setSession({ value: JSON.stringify(legacy) });
      nativeSessionCache = legacy;
      clearLegacySession();
      return legacy;
    }

    nativeSessionCache = emptySession();
    clearLegacySession();
    return nativeSessionCache;
  })();

  try {
    return await nativeSessionLoad;
  } finally {
    nativeSessionLoad = null;
  }
}

export async function getAccessToken(): Promise<string | null> {
  return (await readStoredSession()).accessToken;
}

export async function getRefreshToken(): Promise<string | null> {
  return (await readStoredSession()).refreshToken;
}

export async function getStoredUser(): Promise<MotoSparUser | null> {
  return (await readStoredSession()).user;
}

export async function readStoredSession(): Promise<StoredSession> {
  if (Capacitor.isNativePlatform()) {
    return loadNativeSession();
  }

  const session = readLegacySession();
  return {
    ...session,
    accessToken: session.accessToken?.trim() || null,
    refreshToken: session.refreshToken?.trim() || null,
  };
}

export async function persistSession(params: {
  accessToken?: string | null;
  refreshToken?: string | null;
  user?: MotoSparUser | null;
}): Promise<void> {
  const current = await readStoredSession();
  const next: StoredSession = {
    accessToken:
      params.accessToken === undefined
        ? current.accessToken
        : params.accessToken || null,
    refreshToken:
      params.refreshToken === undefined
        ? current.refreshToken
        : params.refreshToken || null,
    user: params.user === undefined ? current.user : params.user || null,
  };

  if (Capacitor.isNativePlatform()) {
    await NativeSecureSession.setSession({ value: JSON.stringify(next) });
    nativeSessionCache = next;
    clearLegacySession();
    return;
  }

  try {
    if (params.accessToken !== undefined) {
      if (params.accessToken) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, params.accessToken);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      }
    }
    if (params.refreshToken !== undefined) {
      if (params.refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, params.refreshToken);
      } else {
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      }
    }
    if (params.user !== undefined) {
      if (params.user) {
        localStorage.setItem(
          STORAGE_KEYS.USER_DETAILS,
          JSON.stringify(params.user)
        );
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER_DETAILS);
      }
    }
  } catch (error) {
    throw new Error('Unable to persist the customer session securely.', {
      cause: error,
    });
  }
}

export async function clearAllSessionStorage(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await NativeSecureSession.clearSession();
    nativeSessionCache = emptySession();
    clearLegacySession();
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DETAILS);
  } catch {
    // Ignore browser storage cleanup errors; callers still clear in-memory state.
  }
}
