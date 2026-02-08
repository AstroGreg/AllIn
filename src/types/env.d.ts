declare module 'react-native-config' {
    export interface NativeConfig {
        AUTH0_DOMAIN?: string;
        AUTH0_CLIENT_ID?: string;
        AUTH0_AUDIENCE?: string;
        API_GATEWAY_URL?: string;
    }

    export const Config: NativeConfig;
    export default Config;
}
