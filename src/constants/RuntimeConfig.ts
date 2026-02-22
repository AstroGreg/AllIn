import { AppConfig } from './AppConfig';
const requireEnv = (key: string, value: any): string => {
    const out = String(value ?? process.env[key] ?? '').trim();
    if (!out) {
        throw new Error(`[Config] Missing required env var: ${key}. Check react-native-config/.env loading.`);
    }
    return out;
};

export const getApiBaseUrl = () => {
    return requireEnv('API_GATEWAY_URL', AppConfig.API_GATEWAY_URL);
};

export const getHlsBaseUrl = () => {
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
