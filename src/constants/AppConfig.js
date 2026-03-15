const REQUIRED_KEYS = [
    'AUTH0_DOMAIN',
    'AUTH0_CLIENT_ID',
    'AUTH0_AUDIENCE',
    'AUTH0_REDIRECT_URI',
];
const OPTIONAL_KEYS = [
    'API_GATEWAY_URL',
    'HLS_BASE_URL',
    'MEDIA_BASE_URL',
    'INSTAGRAM_APP_ID',
];
const normalize = (value) => String(value !== null && value !== void 0 ? value : '').trim();
const loadReactNativeConfig = () => {
    try {
        const mod = require('react-native-config');
        const config = (mod && mod.default) ? mod.default : mod;
        return config && typeof config === 'object' ? config : {};
    }
    catch (_a) {
        return {};
    }
};
const loadAppEnvFallback = () => {
    var _a;
    try {
        const rn = require('react-native');
        const appEnv = (_a = rn === null || rn === void 0 ? void 0 : rn.NativeModules) === null || _a === void 0 ? void 0 : _a.AppEnv;
        return appEnv && typeof appEnv === 'object' ? appEnv : {};
    }
    catch (_b) {
        return {};
    }
};
const fromRnConfig = loadReactNativeConfig();
const fromAppEnv = loadAppEnvFallback();
const mergedConfig = {};
const keys = new Set([
    ...REQUIRED_KEYS,
    ...OPTIONAL_KEYS,
    ...Object.keys(fromAppEnv),
    ...Object.keys(fromRnConfig),
]);
for (const key of keys) {
    const preferred = normalize(fromRnConfig[key]);
    const fallback = normalize(fromAppEnv[key]);
    if (preferred) {
        mergedConfig[key] = preferred;
    }
    else if (fallback) {
        mergedConfig[key] = fallback;
    }
}
const missing = REQUIRED_KEYS.filter((key) => !normalize(mergedConfig[key]));
if (missing.length > 0) {
    throw new Error(`[Config] Missing required env var(s): ${missing.join(', ')}. ` +
        `Checked react-native-config and AppEnv fallback.`);
}
export const AppConfig = mergedConfig;
