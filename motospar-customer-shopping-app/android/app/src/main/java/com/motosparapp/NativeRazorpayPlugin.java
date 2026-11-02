package com.motosparapp;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.razorpay.Checkout;
import com.razorpay.PaymentData;
import org.json.JSONObject;

@CapacitorPlugin(name = "NativeRazorpay")
public class NativeRazorpayPlugin extends Plugin {
    private PluginCall pendingCall;

    @PluginMethod
    public void open(PluginCall call) {
        String key = call.getString("key");
        String orderId = call.getString("order_id");
        Integer amount = call.getInt("amount");
        if (key == null || key.isEmpty() || orderId == null || orderId.isEmpty()
                || amount == null || amount <= 0) {
            call.reject("A valid backend key, order ID, and amount are required.");
            return;
        }
        if (pendingCall != null) {
            call.reject("A payment is already in progress.");
            return;
        }
        pendingCall = call;
        getActivity().runOnUiThread(() -> {
            try {
                JSONObject options = new JSONObject(call.getData().toString());
                Checkout checkout = new Checkout();
                checkout.setKeyID(key);
                checkout.open(getActivity(), options);
            } catch (Exception error) {
                PluginCall pending = pendingCall;
                pendingCall = null;
                if (pending != null) pending.reject("Could not open native Razorpay checkout.", error);
            }
        });
    }

    void completePayment(String paymentId, PaymentData data) {
        PluginCall pending = pendingCall;
        pendingCall = null;
        if (pending == null) return;
        try {
            JSONObject response = data == null ? new JSONObject() : data.getData();
            JSObject result = JSObject.fromJSONObject(response);
            if (paymentId != null && !paymentId.isEmpty()) {
                result.put("razorpay_payment_id", paymentId);
            }
            pending.resolve(result);
        } catch (Exception error) {
            pending.reject("Could not read Razorpay payment result.", error);
        }
    }

    void failPayment(int code, String description) {
        PluginCall pending = pendingCall;
        pendingCall = null;
        if (pending != null) pending.reject(
            description == null || description.isEmpty() ? "Payment was cancelled or failed." : description,
            String.valueOf(code)
        );
    }
}
