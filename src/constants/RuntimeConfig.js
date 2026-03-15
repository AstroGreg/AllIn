import { AppConfig } from './AppConfig';
let apiBaseUrlOverride = null;
let hlsBaseUrlOverride = null;
export const setRuntimeUrlOverrides = (overrides) => {
    var _a, _b;
    apiBaseUrlOverride = String((_a = overrides.apiBaseUrl) !== null && _a !== void 0 ? _a : '').trim() || null;
    hlsBaseUrlOverride = String((_b = overrides.hlsBaseUrl) !== null && _b !== void 0 ? _b : '').trim() || null;
};
const requireEnv = (key, value) => {
    var _a;
    const out = String((_a = value !== null && value !== void 0 ? value : process.env[key]) !== null && _a !== void 0 ? _a : '').trim();
    if (!out) {
        throw new Error(`[Config] Missing required env var: ${key}. Check react-native-config/.env loading.`);
    }
    return out;
};
export const getApiBaseUrl = () => {
    if (apiBaseUrlOverride)
        return apiBaseUrlOverride;
    return requireEnv('API_GATEWAY_URL', AppConfig.API_GATEWAY_URL);
};
export const getHlsBaseUrl = () => {
    var _a, _b, _c;
    if (hlsBaseUrlOverride)
        return hlsBaseUrlOverride;
    const raw = String((_c = (_b = (_a = AppConfig.HLS_BASE_URL) !== null && _a !== void 0 ? _a : AppConfig.MEDIA_BASE_URL) !== null && _b !== void 0 ? _b : process.env.HLS_BASE_URL) !== null && _c !== void 0 ? _c : '').trim();
    if (raw)
        return raw;
    // Explicit fallback to API is allowed, but API itself must be configured.
    return getApiBaseUrl();
};
