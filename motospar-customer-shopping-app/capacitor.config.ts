import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.motosparapp',
  appName: 'MotoSpar',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
  },
  plugins: {
    // Android WebView runs on https://localhost. Use native networking for
    // MotoSpar API requests so customer auth does not depend on browser CORS.
    CapacitorHttp: { enabled: true },
  },
};

export default config;
