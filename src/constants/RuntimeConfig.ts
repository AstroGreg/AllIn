import { NativeModules } from 'react-native';
import { AppConfig } from './AppConfig';

const resolveDevHost = () => {
    const scriptURL = NativeModules?.SourceCode?.scriptURL ?? '';
    if (typeof scriptURL !== 'string' || !scriptURL.startsWith('http')) return null;
    const match = scriptURL.match(/^https?:\/\/([^/:]+)(?::\d+)?\//i);
    return match?.[1] ?? null;
};

export const getDevScriptURL = () => {
    const scriptURL = NativeModules?.SourceCode?.scriptURL ?? '';
    return typeof scriptURL === 'string' ? scriptURL : '';
};

export const getApiBaseUrl = () => {
    const raw = (AppConfig.API_GATEWAY_URL ?? process.env.API_GATEWAY_URL ?? '').trim();
    if (raw) return raw;

    if (__DEV__) {
        const host = resolveDevHost();
        if (host && host !== 'localhost' && host !== '127.0.0.1') {
            return `http://${host}:3000`;
        }
        const devOverride = (AppConfig.DEV_API_GATEWAY_URL ?? '').trim();
        if (devOverride) return devOverride;
        return 'http://172.20.10.14:3000';
    }

    return 'https://myjourney.coffee';
};

export const getHlsBaseUrl = () => {
    const raw = (
        AppConfig.HLS_BASE_URL ??
        AppConfig.MEDIA_BASE_URL ??
        process.env.HLS_BASE_URL ??
        ''
    ).trim();
    if (raw) return raw;
    return getApiBaseUrl();
};
