import { AppConfig } from './AppConfig';
let apiBaseUrlOverride: string | null = null;
let hlsBaseUrlOverride: string | null = null;

export const setRuntimeUrlOverrides = (overrides: {
    apiBaseUrl?: string | null;
    hlsBaseUrl?: string | null;
}) => {
    apiBaseUrlOverride = String(overrides.apiBaseUrl ?? '').trim() || null;
    hlsBaseUrlOverride = String(overrides.hlsBaseUrl ?? '').trim() || null;
};

const requireEnv = (key: string, value: any): string => {
    const out = String(value ?? process.env[key] ?? '').trim();
    if (!out) {
        throw new Error(`[Config] Missing required env var: ${key}. Check react-native-config/.env loading.`);
    }
    return out;
};

export const getApiBaseUrl = () => {
    if (apiBaseUrlOverride) return apiBaseUrlOverride;
    return requireEnv('API_GATEWAY_URL', AppConfig.API_GATEWAY_URL);
};

export const getHlsBaseUrl = () => {
    if (hlsBaseUrlOverride) return hlsBaseUrlOverride;
    const raw = String(
        AppConfig.HLS_BASE_URL ??
        AppConfig.MEDIA_BASE_URL ??
        process.env.HLS_BASE_URL ??
        '',
    ).trim();
    if (raw) return raw;
    // Explicit fallback to API is allowed, but API itself must be configured.
    return getApiBaseUrl();
};
