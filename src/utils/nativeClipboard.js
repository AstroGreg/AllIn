function loadClipboardModule() {
    var _a;
    try {
        const clipboard = require('@react-native-clipboard/clipboard');
        return (_a = clipboard === null || clipboard === void 0 ? void 0 : clipboard.default) !== null && _a !== void 0 ? _a : clipboard;
    }
    catch (_b) {
        return null;
    }
}
export function setClipboardString(value) {
    const clipboard = loadClipboardModule();
    if (!clipboard || typeof clipboard.setString !== 'function') {
        return false;
    }
    try {
        clipboard.setString(value);
        return true;
    }
    catch (_a) {
        return false;
    }
}
