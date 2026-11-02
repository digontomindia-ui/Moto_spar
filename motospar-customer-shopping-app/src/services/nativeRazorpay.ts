import { registerPlugin } from '@capacitor/core';

export interface NativePaymentResult {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
}

const NativeRazorpay = registerPlugin<{
  open(options: Record<string, unknown>): Promise<NativePaymentResult>;
}>('NativeRazorpay');

export function openNativeRazorpay(
  options: Record<string, unknown>
): Promise<NativePaymentResult> {
  return NativeRazorpay.open(options);
}
