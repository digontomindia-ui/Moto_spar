import { Capacitor } from '@capacitor/core';

/**
 * Environment and endpoint configuration for MotoSpar Customer Mobile App.
 * Reads API_BASE_URL from environment configuration and defaults to https://api.motospar.com
 * strictly as documented in API_INTEGRATION.md.
 */

export const DEFAULT_PRODUCTION_API_BASE_URL = 'https://api.motospar.com';
export const MOTOSPAR_POLICY_URL = 'https://motospar.com/policy';

const OVERRIDE_BASE_URL_STORAGE_KEY = '@motospar_env_api_base_url';
const CONNECTION_MODE_STORAGE_KEY = '@motospar_connection_mode';

export type ConnectionMode = 'proxy' | 'direct';

export function getEnvConfiguredApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return DEFAULT_PRODUCTION_API_BASE_URL;
}

export function getActiveApiBaseUrl(): string {
  if (!import.meta.env.DEV || Capacitor.isNativePlatform()) {
    return getEnvConfiguredApiBaseUrl();
  }
  try {
    const custom = localStorage.getItem(OVERRIDE_BASE_URL_STORAGE_KEY);
    if (custom && custom.trim().startsWith('http')) {
      return custom.trim().replace(/\/+$/, '');
    }
  } catch {
    // Ignore storage read errors
  }
  return getEnvConfiguredApiBaseUrl();
}

export function setCustomApiBaseUrl(url: string | null): void {
  if (!import.meta.env.DEV || Capacitor.isNativePlatform()) return;
  try {
    if (!url || !url.trim()) {
      localStorage.removeItem(OVERRIDE_BASE_URL_STORAGE_KEY);
    } else {
      localStorage.setItem(
        OVERRIDE_BASE_URL_STORAGE_KEY,
        url.trim().replace(/\/+$/, '')
      );
    }
  } catch {
    // Ignore storage write errors
  }
}

export function getConnectionMode(): ConnectionMode {
  // The browser dev server owns /api-proxy. A native WebView has no local
  // Express server, so Android/iOS must call the configured HTTPS API directly.
  if (Capacitor.isNativePlatform()) {
    return 'direct';
  }

  try {
    const stored = localStorage.getItem(CONNECTION_MODE_STORAGE_KEY);
    if (stored === 'direct' || stored === 'proxy') {
      return stored;
    }
  } catch {
    // Ignore
  }
  return 'proxy';
}

export function setConnectionMode(mode: ConnectionMode): void {
  try {
    localStorage.setItem(CONNECTION_MODE_STORAGE_KEY, mode);
  } catch {
    // Ignore
  }
}

export function getGoogleClientId(): string {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  return typeof clientId === 'string' ? clientId.trim() : '';
}

export function getEnvChatWebhookUrl(): string {
  const webhook = import.meta.env.VITE_N8N_CHAT_WEBHOOK_URL;
  return typeof webhook === 'string' ? webhook.trim() : '';
}

/**
 * Resolves relative media or profile picture URLs returned by the MotoSpar API
 * against the active API_BASE_URL, as specified in API_INTEGRATION.md.
 */
export function resolveMediaUrl(rawPath?: string | null): string | null {
  if (!rawPath || typeof rawPath !== 'string') return null;
  const trimmed = rawPath.trim();
  if (!trimmed) return null;
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  const baseUrl = getActiveApiBaseUrl();
  const normalizedRelative = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${baseUrl}${normalizedRelative}`;
}
