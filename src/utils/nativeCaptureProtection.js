function loadCaptureProtectionModule() {
    var _a, _b;
    try {
        const captureProtection = require('react-native-capture-protection');
        return (_b = (_a = captureProtection === null || captureProtection === void 0 ? void 0 : captureProtection.CaptureProtection) !== null && _a !== void 0 ? _a : captureProtection === null || captureProtection === void 0 ? void 0 : captureProtection.default) !== null && _b !== void 0 ? _b : captureProtection;
    }
    catch (_c) {
        return null;
    }
}
export function preventMediaCapture(options) {
    const captureProtection = loadCaptureProtectionModule();
    if (!captureProtection || typeof captureProtection.prevent !== 'function') {
        return Promise.resolve();
    }
    try {
        return Promise.resolve(captureProtection.prevent(options));
    }
    catch (_a) {
        return Promise.resolve();
    }
}
export function allowMediaCapture() {
    const captureProtection = loadCaptureProtectionModule();
    if (!captureProtection || typeof captureProtection.allow !== 'function') {
        return Promise.resolve();
    }
    try {
        return Promise.resolve(captureProtection.allow());
    }
    catch (_a) {
        return Promise.resolve();
    }
}
