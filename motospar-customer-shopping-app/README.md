# MotoSpar customer shopping app

This project contains the customer shopping experience as a React/Vite web app and an Android app shell generated with Capacitor. The Android app loads the Vite production bundle locally inside Capacitor's native Android WebView; it does not need a hosted website to launch.

## Requirements

- Node.js 22 or newer
- JDK 21, Android Studio, and Android SDK (API 24 or newer)
- A configured MotoSpar API URL in `.env.local` or the build environment

## Install dependencies

```sh
npm install
```

Copy `.env.example` to `.env.local` and set the real environment values. `VITE_API_BASE_URL` should point at the MotoSpar API base URL, for example `https://api.motospar.com`. Android support chat calls the authenticated `/api/customer/chat/` backend endpoint; configure `N8N_CHAT_WEBHOOK_URL` on the backend server with the active production n8n `/webhook/` URL. The local browser server still supports `/chat-proxy` for development. Do not put backend secrets or a production chat webhook in the mobile app.

## Open and run the Android project

```sh
npm run build:android
npm run android:open
```

Android Studio opens the native project in `android/`. Select an emulator or connected device and press Run. The generated Android application ID is `com.motosparapp` and the display name is `MotoSpar`.

For a connected device/emulator, `npm run android` builds and launches through the Capacitor CLI. Android Studio and a configured SDK are required for Gradle builds.

## Update the Android app after web changes

```sh
npm run build:android
```

This builds the web assets without registering the PWA service worker, then runs `cap sync android` to copy the current bundle and plugins into the Android project. Open/sync the project in Android Studio after changing native configuration or dependencies.

## Run the browser/PWA version

```sh
npm run dev
```

The browser build retains the PWA manifest and service worker. The Android build omits the service worker to avoid conflicts with Capacitor's native bridge.

## Native scope

This conversion packages the existing React web UI in a native Android shell. It is a hybrid Android app rather than a React Native rewrite. Native Android customer sessions use an AES-GCM store whose key is held by Android Keystore; browser/PWA sessions continue to use `localStorage`. The Android store migrates legacy WebView session keys and the previous React Native AsyncStorage SQLite session keys, then removes those plaintext rows after a successful encrypted write. Android checkout uses the native Razorpay SDK, Google sign-in uses Android Credential Manager, and current location uses the Capacitor Geolocation plugin. File inputs use Android's system picker through Capacitor's WebView bridge. The browser build keeps its web equivalents.

## Release readiness

The Android app now uses direct HTTPS API calls (the same-origin `/api-proxy` only exists in the web server), and the web proxy accepts only the server-configured API origin. For a release build:

1. Set `VITE_API_BASE_URL` to the production HTTPS API origin before `npm run build:android`.
2. Set the public Google web client ID in `VITE_GOOGLE_CLIENT_ID` and the same ID in the backend's `GOOGLE_OAUTH2_CLIENT_ID`. Deploy the backend change that accepts and verifies Google ID tokens, and install `google-auth` from backend requirements. Register `com.motosparapp` and each relevant signing certificate fingerprint in the Google Cloud Android OAuth client. Set the server-side chat webhook only when chat is enabled in production. Never put private provider keys in `VITE_*` variables.
3. Set `ANDROID_KEYSTORE_PATH`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, and `ANDROID_KEY_PASSWORD` in the release environment, then run `./gradlew bundleRelease` from `android/` (or build the release bundle from Android Studio). Release Gradle tasks fail if signing configuration is missing. Keep the keystore and values out of source control.
4. Complete the Android device release checks below before publishing.

**Release blockers to close before publishing:** test secure session migration/restore/logout on Android devices; validate Google sign-in with the Android OAuth client and signing certificate fingerprints; validate Razorpay's Android checkout and server verification on physical devices; deploy the backend Google ID-token, pricing, chat, and account-deletion changes; configure a production n8n webhook; correct invalid live catalog price/stock records; verify production API and payment webhooks/signature verification; publish a working privacy policy and the public `/account-deletion/` page; confirm the accepted Play upload key and Play Console configuration. A successful build alone does not certify the app for store release.

The release variant enables code shrinking and resource shrinking. Increment `versionCode` for each Play upload and update `versionName` when releasing a new customer version.

The current audit bundle in `android/app/build/outputs/bundle/release/app-release-DEBUG-KEY-TEST-ONLY.aab` was deliberately signed with the Android debug key to check that the release variant compiles. It cannot update the existing Play listing. A real release build must be rerun with the accepted Play upload keystore; Gradle then creates `app-release.aab`.
