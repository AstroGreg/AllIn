package com.gregreynders.spotme

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule

class AppEnvModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String = "AppEnv"

    override fun getConstants(): MutableMap<String, Any> {
        val out = HashMap<String, Any>()

        putBuildConfigValue(out, "AUTH0_DOMAIN")
        putBuildConfigValue(out, "AUTH0_CLIENT_ID")
        putBuildConfigValue(out, "AUTH0_AUDIENCE")
        putBuildConfigValue(out, "AUTH0_REDIRECT_URI")
        putBuildConfigValue(out, "API_GATEWAY_URL")
        putBuildConfigValue(out, "HLS_BASE_URL")
        putBuildConfigValue(out, "INSTAGRAM_APP_ID")

        return out
    }

    private fun putBuildConfigValue(target: MutableMap<String, Any>, key: String) {
        val value = runCatching {
            BuildConfig::class.java.getField(key).get(null) as? String
        }.getOrNull()
        putIfNotBlank(target, key, value)
    }

    private fun putIfNotBlank(target: MutableMap<String, Any>, key: String, value: String?) {
        val normalized = value?.trim().orEmpty()
        if (normalized.isNotEmpty()) {
            target[key] = normalized
        }
    }
}
