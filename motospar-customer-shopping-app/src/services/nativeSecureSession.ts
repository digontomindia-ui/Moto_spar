import { registerPlugin } from '@capacitor/core';

interface NativeSecureSessionPlugin {
  getSession(): Promise<{ value: string }>;
  setSession(options: { value: string }): Promise<void>;
  clearSession(): Promise<void>;
}

export const NativeSecureSession = registerPlugin<NativeSecureSessionPlugin>(
  'SecureSession'
);
