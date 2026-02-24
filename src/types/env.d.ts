declare module 'react-native-config' {
    export interface NativeConfig {
        AUTH0_DOMAIN?: string;
        AUTH0_CLIENT_ID?: string;
        AUTH0_AUDIENCE?: string;
        AUTH0_REDIRECT_URI?: string;
        API_GATEWAY_URL?: string;
        HLS_BASE_URL?: string;
        MEDIA_BASE_URL?: string;
        INSTAGRAM_APP_ID?: string;
    }

    export const Config: NativeConfig;
    export default Config;
}
