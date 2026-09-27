import Config from 'react-native-config';

// Supplied from .env at build time. n8n's `/webhook-test/` URLs work only
// while the workflow is listening in the n8n editor; use an active `/webhook/`
// URL in .env for a production build.
export const N8N_CHAT_WEBHOOK_URL = Config.N8N_CHAT_WEBHOOK_URL;

export const N8N_CHAT_SOURCE = 'motospar-customer-mobile-app';
