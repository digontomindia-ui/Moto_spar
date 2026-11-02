import {
  getActiveApiBaseUrl,
  getConnectionMode,
} from '../config/env';
import {
  ApiDiagnosticRecord,
  ApiResult,
} from '../types/motospar';
import {
  clearAllSessionStorage,
  getAccessToken,
  getRefreshToken,
  persistSession,
} from './storage';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method: HttpMethod;
  /** Path after /api/, e.g. "login-via-email" or "products/search" */
  path: string;
  authenticated?: boolean;
  jsonBody?: unknown;
  multipartBody?: FormData;
  timeoutMs?: number;
  skipAutoRefresh?: boolean;
}

const MAX_DIAGNOSTICS = 40;
const diagnosticsLog: ApiDiagnosticRecord[] = [];
const diagnosticsListeners = new Set<() => void>();
let unauthorizedSessionHandler: (() => void) | null = null;
let activeRefreshPromise: Promise<string | null> | null = null;

export function onUnauthorizedSession(handler: () => void): () => void {
  unauthorizedSessionHandler = handler;
  return () => {
    if (unauthorizedSessionHandler === handler) {
      unauthorizedSessionHandler = null;
    }
  };
}

export function getApiDiagnostics(): ApiDiagnosticRecord[] {
  return [...diagnosticsLog];
}

export function subscribeApiDiagnostics(listener: () => void): () => void {
  diagnosticsListeners.add(listener);
  return () => {
    diagnosticsListeners.delete(listener);
  };
}

export function clearApiDiagnostics(): void {
  diagnosticsLog.length = 0;
  diagnosticsListeners.forEach((l) => l());
}

function recordDiagnostic(entry: ApiDiagnosticRecord): void {
  diagnosticsLog.unshift(entry);
  if (diagnosticsLog.length > MAX_DIAGNOSTICS) {
    diagnosticsLog.pop();
  }
  diagnosticsListeners.forEach((l) => l());
}

/**
 * Extracts only top-level field keys for safe diagnostics logging.
 * NEVER logs values, passwords, tokens, payment signatures, or PII.
 */
function extractSafePayloadKeys(
  jsonBody?: unknown,
  multipartBody?: FormData
): string[] | undefined {
  if (multipartBody) {
    const keys = new Set<string>();
    multipartBody.forEach((_val, key) => keys.add(key));
    return Array.from(keys);
  }
  if (jsonBody && typeof jsonBody === 'object' && !Array.isArray(jsonBody)) {
    return Object.keys(jsonBody as Record<string, unknown>);
  }
  return undefined;
}

/**
 * Builds the exact URL preserving MotoSpar's `/api/{path}/` trailing-slash rule.
 */
export function buildEndpointUrl(path: string): {
  fetchUrl: string;
  canonicalPath: string;
} {
  const trimmed = path.replace(/^\/+/, '').replace(/\/+$/, '');
  const withoutLeadingApi = trimmed.startsWith('api/')
    ? trimmed.slice(4)
    : trimmed;
  const canonicalPath = `/api/${withoutLeadingApi}/`;
  const mode = getConnectionMode();

  if (mode === 'proxy') {
    return {
      fetchUrl: `/api-proxy/${withoutLeadingApi}/`,
      canonicalPath,
    };
  }
  return {
    fetchUrl: `${getActiveApiBaseUrl()}${canonicalPath}`,
    canonicalPath,
  };
}

/**
 * Attempts to refresh the access token via POST /api/token/refresh/
 * using the stored refresh token.
 */
async function tryRefreshAccessToken(): Promise<string | null> {
  if (activeRefreshPromise) {
    return activeRefreshPromise;
  }

  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  activeRefreshPromise = (async () => {
    try {
      const { fetchUrl } = buildEndpointUrl('token/refresh');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-MotoSpar-Base-Url': getActiveApiBaseUrl(),
      };

      const res = await fetch(fetchUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!res.ok) {
        return null;
      }

      const body = (await res.json()) as Record<string, unknown>;
      const nestedData =
        body.data && typeof body.data === 'object'
          ? (body.data as Record<string, unknown>)
          : null;

      const newAccess =
        (typeof body.access === 'string' && body.access) ||
        (nestedData &&
          typeof nestedData.access === 'string' &&
          nestedData.access) ||
        null;

      const newRefresh =
        (typeof body.refresh === 'string' && body.refresh) ||
        (nestedData &&
          typeof nestedData.refresh === 'string' &&
          nestedData.refresh) ||
        undefined;

      if (newAccess) {
        await persistSession({
          accessToken: newAccess,
          ...(newRefresh ? { refreshToken: newRefresh } : {}),
        });
        return newAccess;
      }
      return null;
    } catch {
      return null;
    } finally {
      activeRefreshPromise = null;
    }
  })();

  return activeRefreshPromise;
}

/**
 * Parses MotoSpar's varied response envelopes:
 * - { data: { status: "success", ... }, message: "..." }
 * - { status: true, message: "...", data: { ... } }
 * - Direct serializer responses or error dicts ({ detail, message, errors })
 */
function normalizeMotoSparEnvelope<T>(
  httpStatus: number,
  httpOk: boolean,
  parsedJson: Record<string, unknown> | null,
  rawText: string,
  canonicalPath: string,
  method: HttpMethod
): ApiResult<T> {
  if (!parsedJson) {
    return {
      ok: false,
      httpStatus,
      message: httpOk
        ? 'Received an unexpected non-JSON response from the server.'
        : `Server returned HTTP ${httpStatus}${rawText ? `: ${rawText.slice(0, 140)}` : ''}.`,
      data: null,
      raw: null,
      endpoint: canonicalPath,
      method,
      isAuthError: httpStatus === 401,
    };
  }

  const nestedData =
    parsedJson.data && typeof parsedJson.data === 'object'
      ? (parsedJson.data as Record<string, unknown>)
      : null;

  // Check explicit failure indicators in either envelope level
  const topStatus = parsedJson.status;
  const nestedStatus = nestedData ? nestedData.status : undefined;

  const explicitlyFailed =
    topStatus === false ||
    topStatus === 'error' ||
    topStatus === 'failed' ||
    nestedStatus === false ||
    nestedStatus === 'error' ||
    nestedStatus === 'failed';

  const explicitlySucceeded =
    nestedStatus === 'success' ||
    nestedStatus === true ||
    topStatus === 'success' ||
    topStatus === true;

  const isSuccess = httpOk && !explicitlyFailed && (explicitlySucceeded || httpOk);

  // Extract a clean, human-readable message
  const candidateMessages: unknown[] = [
    nestedData?.message,
    nestedData?.detail,
    nestedData?.error,
    parsedJson.message,
    parsedJson.detail,
    parsedJson.error,
  ];

  let resolvedMessage = '';
  for (const candidate of candidateMessages) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      resolvedMessage = candidate.trim();
      break;
    }
  }

  if (!resolvedMessage && !isSuccess) {
    // Check field-level serializer validation errors
    const errorSource = nestedData?.errors || parsedJson.errors || nestedData || parsedJson;
    if (errorSource && typeof errorSource === 'object') {
      const fieldMessages: string[] = [];
      for (const [key, val] of Object.entries(errorSource as Record<string, unknown>)) {
        if (['status', 'code', 'data'].includes(key)) continue;
        if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'string') {
          fieldMessages.push(`${key}: ${val[0]}`);
        } else if (typeof val === 'string' && val.length > 0 && val.length < 160) {
          fieldMessages.push(`${key}: ${val}`);
        }
      }
      if (fieldMessages.length > 0) {
        resolvedMessage = fieldMessages.slice(0, 3).join(' · ');
      }
    }
  }

  if (!resolvedMessage) {
    resolvedMessage = isSuccess
      ? 'Request completed.'
      : `Request failed with HTTP ${httpStatus}.`;
  }

  const payloadData = (nestedData ?? parsedJson) as unknown as T;

  return {
    ok: isSuccess,
    httpStatus,
    message: resolvedMessage,
    data: payloadData,
    raw: parsedJson,
    endpoint: canonicalPath,
    method,
    isAuthError: httpStatus === 401,
  };
}

export async function requestMotoSpar<T = Record<string, unknown>>(
  options: RequestOptions
): Promise<ApiResult<T>> {
  const {
    method,
    path,
    authenticated = false,
    jsonBody,
    multipartBody,
    timeoutMs = 20000,
    skipAutoRefresh = false,
  } = options;

  const { fetchUrl, canonicalPath } = buildEndpointUrl(path);
  const startTime = performance.now();
  const payloadKeys = extractSafePayloadKeys(jsonBody, multipartBody);

  const executeSingleAttempt = async (
    tokenOverride?: string | null
  ): Promise<Response> => {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'X-MotoSpar-Base-Url': getActiveApiBaseUrl(),
    };

    if (authenticated) {
      const token = tokenOverride ?? (await getAccessToken());
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // IMPORTANT: Never set Content-Type: application/json on multipart requests
    if (jsonBody !== undefined && !multipartBody) {
      headers['Content-Type'] = 'application/json';
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(fetchUrl, {
        method,
        headers,
        body: multipartBody
          ? multipartBody
          : jsonBody !== undefined
            ? JSON.stringify(jsonBody)
            : undefined,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    let response = await executeSingleAttempt();

    // Auto-refresh on 401 for authenticated endpoints
    if (
      response.status === 401 &&
      authenticated &&
      !skipAutoRefresh &&
      (await getRefreshToken())
    ) {
      const refreshedToken = await tryRefreshAccessToken();
      if (refreshedToken) {
        response = await executeSingleAttempt(refreshedToken);
      } else {
        await clearAllSessionStorage();
        if (unauthorizedSessionHandler) {
          unauthorizedSessionHandler();
        }
      }
    } else if (response.status === 401 && authenticated && !skipAutoRefresh) {
      await clearAllSessionStorage();
      if (unauthorizedSessionHandler) {
        unauthorizedSessionHandler();
      }
    }

    const rawText = await response.text();
    let parsedJson: Record<string, unknown> | null = null;
    if (rawText && rawText.trim().length > 0) {
      try {
        const parsed = JSON.parse(rawText);
        if (parsed && typeof parsed === 'object') {
          parsedJson = parsed as Record<string, unknown>;
        }
      } catch {
        parsedJson = null;
      }
    }

    const result = normalizeMotoSparEnvelope<T>(
      response.status,
      response.ok,
      parsedJson,
      rawText,
      canonicalPath,
      method
    );

    const durationMs = Math.round(performance.now() - startTime);
    recordDiagnostic({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      method,
      endpoint: canonicalPath,
      httpStatus: response.status,
      ok: result.ok,
      durationMs,
      payloadKeys,
      errorMessage: result.ok ? undefined : result.message,
    });

    return result;
  } catch (err: unknown) {
    const durationMs = Math.round(performance.now() - startTime);
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    const message = isTimeout
      ? 'The request timed out while waiting for the MotoSpar server.'
      : 'Unable to reach the MotoSpar server. Please check your connection and try again.';

    recordDiagnostic({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      method,
      endpoint: canonicalPath,
      httpStatus: null,
      ok: false,
      durationMs,
      payloadKeys,
      errorMessage: message,
    });

    return {
      ok: false,
      httpStatus: null,
      message,
      data: null,
      raw: null,
      endpoint: canonicalPath,
      method,
      isNetworkError: true,
    };
  }
}
