var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import AsyncStorage from '@react-native-async-storage/async-storage';
export function calculateUploadProgressState(input) {
    var _a, _b, _c, _d, _e, _f;
    const phase = (_a = input.phase) !== null && _a !== void 0 ? _a : 'uploading';
    const total = Math.max(0, Number((_b = input.total) !== null && _b !== void 0 ? _b : 0));
    const uploaded = Math.max(0, Math.min(total || Number.MAX_SAFE_INTEGER, Number((_c = input.uploaded) !== null && _c !== void 0 ? _c : 0)));
    const derivedProcessingTotal = Number((_d = input.processing_total) !== null && _d !== void 0 ? _d : 0) > 0
        ? Number((_e = input.processing_total) !== null && _e !== void 0 ? _e : 0)
        : phase === 'processing' || phase === 'done'
            ? Math.max(uploaded, total > 0 ? uploaded : 0)
            : 0;
    const processingTotal = Math.max(0, derivedProcessingTotal);
    const processingReady = Math.max(0, Math.min(processingTotal || Number.MAX_SAFE_INTEGER, Number((_f = input.processing_ready) !== null && _f !== void 0 ? _f : 0)));
    if (phase === 'done') {
        return {
            total,
            uploaded,
            processingTotal,
            processingReady: processingTotal || uploaded || total,
            overallProgress: 1,
        };
    }
    if (phase === 'processing') {
        const uploadDenominator = Math.max(1, total);
        const processingDenominator = Math.max(1, processingTotal || uploaded);
        return {
            total,
            uploaded,
            processingTotal: processingDenominator,
            processingReady,
            overallProgress: Math.min(1, (uploaded + processingReady) / (uploadDenominator + processingDenominator)),
        };
    }
    return {
        total,
        uploaded,
        processingTotal,
        processingReady,
        overallProgress: total > 0 ? Math.min(1, uploaded / Math.max(1, total)) : 0,
    };
}
const STORAGE_KEY = '@upload_sessions_v1';
function safeParse(raw) {
    if (!raw)
        return null;
    try {
        return JSON.parse(raw);
    }
    catch (_a) {
        return null;
    }
}
export function listUploadSessions() {
    return __awaiter(this, void 0, void 0, function* () {
        const raw = yield AsyncStorage.getItem(STORAGE_KEY);
        const parsed = safeParse(raw);
        const sessions = Array.isArray(parsed) ? parsed : [];
        return sessions.sort((a, b) => { var _a, _b; return ((_a = b.updatedAt) !== null && _a !== void 0 ? _a : 0) - ((_b = a.updatedAt) !== null && _b !== void 0 ? _b : 0); });
    });
}
export function getUploadSession(sessionId) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const sessions = yield listUploadSessions();
        return (_a = sessions.find((s) => s.id === sessionId)) !== null && _a !== void 0 ? _a : null;
    });
}
export function upsertUploadSession(session) {
    return __awaiter(this, void 0, void 0, function* () {
        const sessions = yield listUploadSessions();
        const idx = sessions.findIndex((s) => s.id === session.id);
        const next = [...sessions];
        if (idx >= 0)
            next[idx] = session;
        else
            next.unshift(session);
        yield AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    });
}
export function removeUploadSession(sessionId) {
    return __awaiter(this, void 0, void 0, function* () {
        const sessions = yield listUploadSessions();
        const next = sessions.filter((s) => s.id !== sessionId);
        yield AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    });
}
