package com.motosparapp;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import com.getcapacitor.PluginHandle;
import com.razorpay.PaymentData;
import com.razorpay.PaymentResultWithDataListener;

public class MainActivity extends BridgeActivity implements PaymentResultWithDataListener {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(SecureSessionPlugin.class);
        registerPlugin(NativeRazorpayPlugin.class);
        registerPlugin(NativeGoogleSignInPlugin.class);
        super.onCreate(savedInstanceState);
    }

    private NativeRazorpayPlugin paymentPlugin() {
        PluginHandle handle = getBridge().getPlugin("NativeRazorpay");
        return handle == null ? null : (NativeRazorpayPlugin) handle.getInstance();
    }

    @Override
    public void onPaymentSuccess(String paymentId, PaymentData data) {
        NativeRazorpayPlugin plugin = paymentPlugin();
        if (plugin != null) plugin.completePayment(paymentId, data);
    }

    @Override
    public void onPaymentError(int code, String description, PaymentData data) {
        NativeRazorpayPlugin plugin = paymentPlugin();
        if (plugin != null) plugin.failPayment(code, description);
    }
}
