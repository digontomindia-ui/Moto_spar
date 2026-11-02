package com.motosparapp;

import android.content.SharedPreferences;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.nio.charset.StandardCharsets;
import java.io.File;
import java.security.KeyStore;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import org.json.JSONObject;

@CapacitorPlugin(name = "SecureSession")
public class SecureSessionPlugin extends Plugin {
    private static final String PREFERENCES_NAME = "motospar_secure_session";
    private static final String SESSION_KEY = "encrypted_session";
    private static final String KEYSTORE_PROVIDER = "AndroidKeyStore";
    private static final String KEY_ALIAS = "com.motosparapp.customer_session.v1";
    private static final String CIPHER_TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int GCM_TAG_LENGTH_BITS = 128;

    @PluginMethod
    public void getSession(PluginCall call) {
        try {
            SharedPreferences preferences = getContext().getSharedPreferences(
                PREFERENCES_NAME,
                android.content.Context.MODE_PRIVATE
            );
            String encrypted = preferences.getString(SESSION_KEY, null);
            String sessionValue = encrypted == null ? readLegacyReactNativeSession() : decrypt(encrypted);

            if (encrypted != null) {
                // Retry cleanup if a prior migration wrote the encrypted copy
                // successfully but could not remove the old AsyncStorage rows.
                clearLegacyReactNativeSession();
            }

            if (encrypted == null && sessionValue != null && !sessionValue.isEmpty()) {
                String migratedCiphertext = encrypt(sessionValue);
                boolean saved = preferences.edit()
                    .putString(SESSION_KEY, migratedCiphertext)
                    .commit();
                if (!saved) {
                    call.reject("Legacy session could not be secured on this device.");
                    return;
                }
                clearLegacyReactNativeSession();
            }

            JSObject result = new JSObject();
            result.put("value", sessionValue == null ? "" : sessionValue);
            call.resolve(result);
        } catch (Exception error) {
            call.reject("Secure session could not be read.", error);
        }
    }

    @PluginMethod
    public void setSession(PluginCall call) {
        String value = call.getString("value");
        if (value == null) {
            call.reject("A session value is required.");
            return;
        }

        try {
            String encrypted = encrypt(value);
            SharedPreferences preferences = getContext().getSharedPreferences(
                PREFERENCES_NAME,
                android.content.Context.MODE_PRIVATE
            );
            boolean saved = preferences.edit().putString(SESSION_KEY, encrypted).commit();
            if (!saved) {
                call.reject("Secure session could not be saved.");
                return;
            }
            clearLegacyReactNativeSession();
            call.resolve();
        } catch (Exception error) {
            call.reject("Secure session could not be saved.", error);
        }
    }

    @PluginMethod
    public void clearSession(PluginCall call) {
        try {
            SharedPreferences preferences = getContext().getSharedPreferences(
                PREFERENCES_NAME,
                android.content.Context.MODE_PRIVATE
            );
            boolean cleared = preferences.edit().remove(SESSION_KEY).commit();
            if (!cleared) {
                call.reject("Secure session could not be cleared.");
                return;
            }
            call.resolve();
        } catch (Exception error) {
            call.reject("Secure session could not be cleared.", error);
        }
    }

    private String encrypt(String plaintext) throws Exception {
        Cipher cipher = Cipher.getInstance(CIPHER_TRANSFORMATION);
        cipher.init(Cipher.ENCRYPT_MODE, getOrCreateKey());
        byte[] iv = cipher.getIV();
        byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
        return Base64.encodeToString(iv, Base64.NO_WRAP)
            + ":"
            + Base64.encodeToString(ciphertext, Base64.NO_WRAP);
    }

    private String decrypt(String encrypted) throws Exception {
        int separator = encrypted.indexOf(':');
        if (separator <= 0 || separator == encrypted.length() - 1) {
            throw new IllegalArgumentException("Stored secure session is malformed.");
        }

        byte[] iv = Base64.decode(encrypted.substring(0, separator), Base64.NO_WRAP);
        byte[] ciphertext = Base64.decode(encrypted.substring(separator + 1), Base64.NO_WRAP);
        Cipher cipher = Cipher.getInstance(CIPHER_TRANSFORMATION);
        cipher.init(
            Cipher.DECRYPT_MODE,
            getOrCreateKey(),
            new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv)
        );
        return new String(cipher.doFinal(ciphertext), StandardCharsets.UTF_8);
    }

    private SecretKey getOrCreateKey() throws Exception {
        KeyStore keyStore = KeyStore.getInstance(KEYSTORE_PROVIDER);
        keyStore.load(null);
        if (keyStore.containsAlias(KEY_ALIAS)) {
            return (SecretKey) keyStore.getKey(KEY_ALIAS, null);
        }

        KeyGenerator keyGenerator = KeyGenerator.getInstance(
            KeyProperties.KEY_ALGORITHM_AES,
            KEYSTORE_PROVIDER
        );
        KeyGenParameterSpec keySpec = new KeyGenParameterSpec.Builder(
            KEY_ALIAS,
            KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT
        )
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setRandomizedEncryptionRequired(true)
            .setKeySize(256)
            .build();
        keyGenerator.init(keySpec);
        return keyGenerator.generateKey();
    }

    /**
     * The previous React Native app used @react-native-async-storage/async-storage
     * 2.0 with newArchEnabled=false. Its Android storage is RKStorage SQLite,
     * table catalystLocalStorage, with these exact customer session keys.
     */
    private String readLegacyReactNativeSession() {
        File databaseFile = getContext().getDatabasePath("RKStorage");
        if (!databaseFile.exists()) {
            return "";
        }

        SQLiteDatabase database = null;
        Cursor cursor = null;
        try {
            database = SQLiteDatabase.openDatabase(
                databaseFile.getAbsolutePath(),
                null,
                SQLiteDatabase.OPEN_READWRITE
            );
            cursor = database.query(
                "catalystLocalStorage",
                new String[] {"key", "value"},
                "key IN (?, ?, ?)",
                new String[] {"@usertoken", "@user_refreshtoken", "@userdetails"},
                null,
                null,
                null
            );

            String accessToken = null;
            String refreshToken = null;
            String userJson = null;
            while (cursor.moveToNext()) {
                String key = cursor.getString(0);
                String value = cursor.getString(1);
                if ("@usertoken".equals(key)) accessToken = value;
                if ("@user_refreshtoken".equals(key)) refreshToken = value;
                if ("@userdetails".equals(key)) userJson = value;
            }

            if (isBlank(accessToken) && isBlank(refreshToken) && isBlank(userJson)) {
                return "";
            }

            JSONObject session = new JSONObject();
            session.put("accessToken", isBlank(accessToken) ? JSONObject.NULL : accessToken);
            session.put("refreshToken", isBlank(refreshToken) ? JSONObject.NULL : refreshToken);
            if (!isBlank(userJson)) {
                try {
                    session.put("user", new JSONObject(userJson));
                } catch (Exception malformedUserData) {
                    session.put("user", JSONObject.NULL);
                }
            } else {
                session.put("user", JSONObject.NULL);
            }
            return session.toString();
        } catch (Exception ignored) {
            // The old store may be absent, already migrated, or from another
            // AsyncStorage implementation. Keep normal fresh-install behavior.
            return "";
        } finally {
            if (cursor != null) cursor.close();
            if (database != null) database.close();
        }
    }

    private void clearLegacyReactNativeSession() {
        File databaseFile = getContext().getDatabasePath("RKStorage");
        if (!databaseFile.exists()) {
            return;
        }

        SQLiteDatabase database = null;
        try {
            database = SQLiteDatabase.openDatabase(
                databaseFile.getAbsolutePath(),
                null,
                SQLiteDatabase.OPEN_READWRITE
            );
            database.execSQL("PRAGMA secure_delete=ON");
            database.delete(
                "catalystLocalStorage",
                "key IN (?, ?, ?)",
                new String[] {"@usertoken", "@user_refreshtoken", "@userdetails"}
            );
        } catch (Exception ignored) {
            // Do not invalidate a successfully encrypted session if cleanup of
            // the retired React Native database is unavailable.
        } finally {
            if (database != null) database.close();
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
