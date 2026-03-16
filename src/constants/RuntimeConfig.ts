import { Platform } from 'react-native';
import { AppConfig } from './AppConfig';
let apiBaseUrlOverride: string | null = null;
let hlsBaseUrlOverride: string | null = null;

const normalizeAndroidLoopback = (rawUrl: string | null) => {
    const trimmed = String(rawUrl ?? '').trim();
    if (!trimmed || Platform.OS !== 'android') return trimmed;
    return trimmed
        .replace(/^http:\/\/127\.0\.0\.1(?=[:/]|$)/i, 'http://10.0.2.2')
        .replace(/^https:\/\/127\.0\.0\.1(?=[:/]|$)/i, 'https://10.0.2.2')
        .replace(/^http:\/\/localhost(?=[:/]|$)/i, 'http://10.0.2.2')
        .replace(/^https:\/\/localhost(?=[:/]|$)/i, 'https://10.0.2.2')
        .replace(/\/$/, '');
};

export const setRuntimeUrlOverrides = (overrides: {
    apiBaseUrl?: string | null;
    hlsBaseUrl?: string | null;
}) => {
    apiBaseUrlOverride = normalizeAndroidLoopback(String(overrides.apiBaseUrl ?? '').trim() || null) || null;
    hlsBaseUrlOverride = normalizeAndroidLoopback(String(overrides.hlsBaseUrl ?? '').trim() || null) || null;
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
    return normalizeAndroidLoopback(requireEnv('API_GATEWAY_URL', AppConfig.API_GATEWAY_URL));
};

export const getHlsBaseUrl = () => {
    if (hlsBaseUrlOverride) return hlsBaseUrlOverride;
    const raw = String(
        AppConfig.HLS_BASE_URL ??
        AppConfig.MEDIA_BASE_URL ??
        process.env.HLS_BASE_URL ??
        '',
    ).trim();
    if (raw) return normalizeAndroidLoopback(raw);
    // Explicit fallback to API is allowed, but API itself must be configured.
    return getApiBaseUrl();
};
