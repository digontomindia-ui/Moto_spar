import { Capacitor, registerPlugin } from '@capacitor/core';

interface NativeGoogleSignInBridge {
  signIn(options: { clientId: string }): Promise<{ idToken: string }>;
  clearSession(): Promise<void>;
}

export async function clearNativeGoogleSession(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await NativeGoogleSignIn.clearSession();
  }
}

const NativeGoogleSignIn = registerPlugin<NativeGoogleSignInBridge>('NativeGoogleSignIn');

export async function signInWithNativeGoogle(clientId: string): Promise<string> {
  if (!Capacitor.isNativePlatform()) {
    throw new Error('Native Google sign-in is only available in the Android app.');
  }
  const response = await NativeGoogleSignIn.signIn({ clientId });
  if (!response.idToken) {
    throw new Error('Google did not return an identity token.');
  }
  return response.idToken;
}
