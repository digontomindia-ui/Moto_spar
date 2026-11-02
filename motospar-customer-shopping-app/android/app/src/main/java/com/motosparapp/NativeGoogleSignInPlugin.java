package com.motosparapp;

import android.os.CancellationSignal;
import androidx.core.content.ContextCompat;
import androidx.credentials.CredentialManager;
import androidx.credentials.CredentialManagerCallback;
import androidx.credentials.ClearCredentialStateRequest;
import androidx.credentials.CustomCredential;
import androidx.credentials.GetCredentialRequest;
import androidx.credentials.GetCredentialResponse;
import androidx.credentials.exceptions.GetCredentialException;
import androidx.credentials.exceptions.ClearCredentialException;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.PluginMethod;
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption;
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential;

@CapacitorPlugin(name = "NativeGoogleSignIn")
public class NativeGoogleSignInPlugin extends Plugin {
    @PluginMethod
    public void clearSession(PluginCall call) {
        CredentialManager.create(getContext()).clearCredentialStateAsync(
            new ClearCredentialStateRequest(),
            null,
            ContextCompat.getMainExecutor(getContext()),
            new CredentialManagerCallback<Void, ClearCredentialException>() {
                @Override
                public void onResult(Void ignored) {
                    call.resolve();
                }

                @Override
                public void onError(ClearCredentialException error) {
                    call.reject("Could not clear Google credential state.");
                }
            }
        );
    }

    @PluginMethod
    public void signIn(PluginCall call) {
        String clientId = call.getString("clientId");
        if (clientId == null || clientId.trim().isEmpty()) {
            call.reject("Google sign-in is not configured.");
            return;
        }

        GetSignInWithGoogleOption option = new GetSignInWithGoogleOption.Builder(clientId).build();
        GetCredentialRequest request = new GetCredentialRequest.Builder()
            .addCredentialOption(option)
            .build();
        CredentialManager manager = CredentialManager.create(getContext());

        manager.getCredentialAsync(
            getActivity(),
            request,
            new CancellationSignal(),
            ContextCompat.getMainExecutor(getContext()),
            new CredentialManagerCallback<GetCredentialResponse, GetCredentialException>() {
                @Override
                public void onResult(GetCredentialResponse result) {
                    if (!(result.getCredential() instanceof CustomCredential)) {
                        call.reject("Google returned an unsupported credential.");
                        return;
                    }
                    CustomCredential credential = (CustomCredential) result.getCredential();
                    if (!GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL.equals(credential.getType())) {
                        call.reject("Google returned an unsupported sign-in response.");
                        return;
                    }
                    try {
                        String token = GoogleIdTokenCredential.createFrom(credential.getData()).getIdToken();
                        JSObject response = new JSObject();
                        response.put("idToken", token);
                        call.resolve(response);
                    } catch (Exception error) {
                        call.reject("Google sign-in response could not be read.");
                    }
                }

                @Override
                public void onError(GetCredentialException error) {
                    call.reject("Google sign-in was cancelled or could not be completed.");
                }
            }
        );
    }
}
