let config: Record<string, any> = {};

try {
    const mod = require('react-native-config');
    config = (mod && mod.default) ? mod.default : mod;
} catch {
    config = {};
}

export const AppConfig = config;
