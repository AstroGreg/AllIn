package com.AllIn

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule

class AppEnvModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String = "AppEnv"

    override fun getConstants(): MutableMap<String, Any> {
        val out = HashMap<String, Any>()

        putIfNotBlank(out, "AUTH0_DOMAIN", BuildConfig.AUTH0_DOMAIN)
        putIfNotBlank(out, "AUTH0_CLIENT_ID", BuildConfig.AUTH0_CLIENT_ID)
        putIfNotBlank(out, "AUTH0_AUDIENCE", BuildConfig.AUTH0_AUDIENCE)
        putIfNotBlank(out, "AUTH0_REDIRECT_URI", BuildConfig.AUTH0_REDIRECT_URI)
        putIfNotBlank(out, "API_GATEWAY_URL", BuildConfig.API_GATEWAY_URL)
        putIfNotBlank(out, "HLS_BASE_URL", BuildConfig.HLS_BASE_URL)
        putIfNotBlank(out, "INSTAGRAM_APP_ID", BuildConfig.INSTAGRAM_APP_ID)

        return out
    }

    private fun putIfNotBlank(target: MutableMap<String, Any>, key: String, value: String?) {
        val normalized = value?.trim().orEmpty()
        if (normalized.isNotEmpty()) {
            target[key] = normalized
        }
    }
}
