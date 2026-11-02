import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

function getConfiguredApiBaseUrl(): string {
  const raw =
    process.env.API_BASE_URL ||
    process.env.VITE_API_BASE_URL ||
    'https://api.motospar.com';
  const parsed = new URL(raw);
  if (
    parsed.username ||
    parsed.password ||
    parsed.search ||
    parsed.hash ||
    parsed.pathname !== '/' ||
    (process.env.NODE_ENV === 'production' && parsed.protocol !== 'https:')
  ) {
    throw new Error('API_BASE_URL must be a clean HTTPS origin in production.');
  }
  return parsed.origin;
}

function getConfiguredChatWebhookUrl(): string {
  return (
    process.env.N8N_CHAT_WEBHOOK_URL ||
    process.env.VITE_N8N_CHAT_WEBHOOK_URL ||
    ''
  ).trim();
}

async function startServer() {
  const app = express();

  // Public runtime configuration status (never exposes secrets)
  app.get('/api-config', (_req, res) => {
    const apiBaseUrl = getConfiguredApiBaseUrl();
    const chatUrl = getConfiguredChatWebhookUrl();
    res.json({
      apiBaseUrl,
      hasChatWebhook: Boolean(chatUrl),
      policyUrl: 'https://motospar.com/policy',
    });
  });

  // Pass-through proxy for the n8n chat webhook
  app.post('/chat-proxy', express.json({ limit: '1mb' }), async (req, res) => {
    const webhookUrl = getConfiguredChatWebhookUrl();
    if (!webhookUrl) {
      res.status(503).json({
        status: false,
        message:
          'Chat assistant webhook (N8N_CHAT_WEBHOOK_URL) is not configured in the environment.',
      });
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const upstreamRes = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/plain, */*',
        },
        body: JSON.stringify(req.body || {}),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const contentType = upstreamRes.headers.get('content-type') || '';
      const rawText = await upstreamRes.text();

      res.status(upstreamRes.status);
      if (contentType.includes('application/json')) {
        try {
          res.json(JSON.parse(rawText));
        } catch {
          res.send(rawText);
        }
      } else {
        res.send(rawText);
      }
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      // Keep upstream/network details in server logs only; callers receive a
      // stable error without internal hostnames or infrastructure information.
      console.error('Chat upstream request failed:', err);
      res.status(502).json({
        status: false,
        message: 'Chat service is temporarily unavailable. Please try again.',
      });
    }
  });

  // Raw body pass-through proxy for MotoSpar REST API (/api-proxy/* -> {API_BASE_URL}/api/*)
  // Using express.raw so both application/json and multipart/form-data boundaries remain intact
  app.use(
    '/api-proxy',
    express.raw({ type: '*/*', limit: '25mb' }),
    async (req, res) => {
      // Never allow a client-controlled upstream URL here: this endpoint is
      // deployed as a same-origin proxy and must not become an SSRF proxy.
      const baseUrl = getConfiguredApiBaseUrl();

      // Ensure exact path and trailing slash preservation
      const subPath = req.originalUrl.replace(/^\/api-proxy\/?/, '');
      const normalizedPath = subPath.startsWith('api/')
        ? subPath
        : `api/${subPath}`;
      const targetUrl = `${baseUrl}/${normalizedPath}`;

      const forwardHeaders: Record<string, string> = {
        Accept: 'application/json, */*',
      };

      if (typeof req.headers.authorization === 'string') {
        forwardHeaders['Authorization'] = req.headers.authorization;
      }
      if (typeof req.headers['content-type'] === 'string') {
        forwardHeaders['Content-Type'] = req.headers['content-type'];
      }

      const method = req.method.toUpperCase();
      const hasBody =
        method !== 'GET' &&
        method !== 'HEAD' &&
        Buffer.isBuffer(req.body) &&
        req.body.length > 0;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      try {
        const upstreamResponse = await fetch(targetUrl, {
          method,
          headers: forwardHeaders,
          body: hasBody ? new Uint8Array(req.body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const responseContentType =
          upstreamResponse.headers.get('content-type') || 'application/json';
        const responseBuffer = Buffer.from(
          await upstreamResponse.arrayBuffer()
        );

        res.status(upstreamResponse.status);
        res.setHeader('Content-Type', responseContentType);
        res.send(responseBuffer);
      } catch (err: unknown) {
        clearTimeout(timeoutId);
        const errMessage =
          err instanceof Error
            ? err.name === 'AbortError'
              ? 'Request to MotoSpar backend timed out (25s)'
              : err.message
            : 'Network error connecting to MotoSpar API';

        res.status(502).json({
          status: false,
          error_code: 'UPSTREAM_NETWORK_ERROR',
          message: `Unable to reach MotoSpar backend (${errMessage}).`,
        });
      }
    }
  );

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MotoSpar Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
