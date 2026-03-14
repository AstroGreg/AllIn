var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import SizeBox from '../../constants/SizeBox';
import { createStyles } from './UploadProgressScreenStyles';
import { ApiError, getMediaStatus, uploadMediaBatch, uploadMediaBatchWatermark, } from '../../services/apiGateway';
import { calculateUploadProgressState, getUploadSession, upsertUploadSession, } from '../../services/uploadSessions';
import RNFS from 'react-native-fs';
import FastImage from 'react-native-fast-image';
function fileUriToPath(uri) {
    if (!uri || !uri.startsWith('file://'))
        return uri;
    // RN/iOS may give us percent-encoded file URIs (spaces => %20). RNFS expects a real filesystem path.
    let path = uri.slice('file://'.length);
    // Defensive: strip querystring if present.
    const q = path.indexOf('?');
    if (q !== -1)
        path = path.slice(0, q);
    try {
        path = decodeURI(path);
    }
    catch (_a) { }
    return path;
}
function ensureFileScheme(pathOrUri) {
    if (!pathOrUri)
        return pathOrUri;
    if (pathOrUri.startsWith('file://'))
        return pathOrUri;
    return `file://${pathOrUri}`;
}
function normalizeFileUri(uri) {
    if (!uri)
        return uri;
    if (!uri.startsWith('file://'))
        return uri;
    return ensureFileScheme(fileUriToPath(uri));
}
function salvageTmpFileIfNeeded(uri) {
    return __awaiter(this, void 0, void 0, function* () {
        // If a previous app run stored an iOS /tmp URI, it may disappear.
        // Best-effort: if it still exists, copy it into a durable document path now.
        if (!uri || !uri.startsWith('file://'))
            return uri;
        const rawPath = fileUriToPath(uri);
        if (!rawPath.includes('/tmp/'))
            return uri;
        const exists = yield RNFS.exists(rawPath);
        if (!exists)
            return uri;
        const destDir = `${RNFS.DocumentDirectoryPath}/allin_uploads`;
        try {
            yield RNFS.mkdir(destDir);
        }
        catch (_a) { }
        const name = rawPath.split('/').pop() || `upload-${Date.now()}`;
        const safeName = name.replace(/[^\w.\-]+/g, '_');
        const destPath = `${destDir}/${Date.now()}-${safeName}`;
        try {
            yield RNFS.copyFile(rawPath, destPath);
            return ensureFileScheme(destPath);
        }
        catch (_b) {
            return normalizeFileUri(uri);
        }
    });
}
const BATCH_SIZE = 1;
const STATUS_POLL_MS = 5000;
const UPLOAD_FLOW_RESET_KEY = '@upload_flow_reset_required';
const UploadProgressScreen = ({ navigation, route }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const { t } = useTranslation();
    const { apiAccessToken } = useAuth();
    const competition = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.competition;
    const anonymous = Boolean((_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.anonymous);
    const watermarkText = String((_f = (_d = (_c = route === null || route === void 0 ? void 0 : route.params) === null || _c === void 0 ? void 0 : _c.watermarkText) !== null && _d !== void 0 ? _d : (_e = route === null || route === void 0 ? void 0 : route.params) === null || _e === void 0 ? void 0 : _e.watermark_text) !== null && _f !== void 0 ? _f : '').trim();
    const sessionId = String((_h = (_g = route === null || route === void 0 ? void 0 : route.params) === null || _g === void 0 ? void 0 : _g.sessionId) !== null && _h !== void 0 ? _h : '').trim() || `u_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const autoStart = ((_j = route === null || route === void 0 ? void 0 : route.params) === null || _j === void 0 ? void 0 : _j.autoStart) !== false;
    const competitionId = useMemo(() => String((competition === null || competition === void 0 ? void 0 : competition.id) || (competition === null || competition === void 0 ? void 0 : competition.event_id) || (competition === null || competition === void 0 ? void 0 : competition.eventId) || 'competition'), [competition === null || competition === void 0 ? void 0 : competition.event_id, competition === null || competition === void 0 ? void 0 : competition.eventId, competition === null || competition === void 0 ? void 0 : competition.id]);
    const sessionKey = useMemo(() => `@upload_activity_${competitionId}`, [competitionId]);
    const assetsKey = useMemo(() => `@upload_assets_${competitionId}`, [competitionId]);
    const [items, setItems] = useState([]);
    const [phase, setPhase] = useState('idle');
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState({ ready: 0, total: 0 });
    const [sessionSnapshot, setSessionSnapshot] = useState(null);
    const pollTimerRef = useRef(null);
    const mediaIdsRef = useRef([]);
    const [statusById, setStatusById] = useState({});
    const sessionRef = useRef(null);
    const persistSession = useCallback((patch) => __awaiter(void 0, void 0, void 0, function* () {
        var _k;
        const base = (_k = sessionRef.current) !== null && _k !== void 0 ? _k : {
            id: sessionId,
            competitionId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            anonymous,
            watermarkText,
            phase: 'uploading',
            total: 0,
            uploaded: 0,
            processing_ready: 0,
            processing_total: 0,
            media_ids: [],
            error: null,
        };
        const next = Object.assign(Object.assign(Object.assign({}, base), patch), { id: base.id, competitionId: base.competitionId, updatedAt: Date.now() });
        sessionRef.current = next;
        setSessionSnapshot(next);
        yield upsertUploadSession(next);
    }), [anonymous, competitionId, sessionId, watermarkText]);
    const persistActivity = useCallback((patch) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const currentRaw = yield AsyncStorage.getItem(sessionKey);
            const current = currentRaw ? JSON.parse(currentRaw) : {};
            yield AsyncStorage.setItem(sessionKey, JSON.stringify(Object.assign(Object.assign(Object.assign({}, current), patch), { updatedAt: Date.now() })));
        }
        catch (_l) {
            // ignore
        }
    }), [sessionKey]);
    const loadAssets = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _m, _o, _p;
        const raw = yield AsyncStorage.getItem(assetsKey);
        const parsed = raw ? JSON.parse(raw) : {};
        const flat = [];
        if (parsed && typeof parsed === 'object') {
            for (const [category, list] of Object.entries(parsed)) {
                const arr = Array.isArray(list) ? list : [];
                for (const asset of arr) {
                    if (!(asset === null || asset === void 0 ? void 0 : asset.uri))
                        continue;
                    // Normalize percent-encoded file URIs (spaces => %20) and salvage older sessions that stored iOS /tmp URIs.
                    let uri = normalizeFileUri(String(asset.uri));
                    try {
                        uri = yield salvageTmpFileIfNeeded(uri);
                    }
                    catch (_q) {
                        // ignore
                    }
                    flat.push({
                        uri,
                        type: (_m = asset === null || asset === void 0 ? void 0 : asset.type) !== null && _m !== void 0 ? _m : null,
                        fileName: (_o = asset === null || asset === void 0 ? void 0 : asset.fileName) !== null && _o !== void 0 ? _o : null,
                        title: (asset === null || asset === void 0 ? void 0 : asset.title) ? String(asset.title) : null,
                        category: String(category),
                        discipline_id: (asset === null || asset === void 0 ? void 0 : asset.discipline_id) ? String(asset.discipline_id) : null,
                        competition_map_id: (asset === null || asset === void 0 ? void 0 : asset.competition_map_id) ? String(asset.competition_map_id) : null,
                        checkpoint_id: (asset === null || asset === void 0 ? void 0 : asset.checkpoint_id) ? String(asset.checkpoint_id) : null,
                        checkpoint_label: (asset === null || asset === void 0 ? void 0 : asset.checkpoint_label) ? String(asset.checkpoint_label) : null,
                        price_cents: Number((_p = asset === null || asset === void 0 ? void 0 : asset.price_cents) !== null && _p !== void 0 ? _p : 0) || 0,
                        price_currency: String((asset === null || asset === void 0 ? void 0 : asset.price_currency) || 'EUR'),
                        status: 'pending',
                        media_id: null,
                        error: null,
                    });
                }
            }
        }
        setItems(flat);
        yield persistActivity({ phase: 'uploading', total: flat.length, uploaded: 0, processing_ready: 0, processing_total: 0, watermarkText, anonymous });
        yield persistSession({ phase: 'uploading', total: flat.length, uploaded: 0, processing_ready: 0, processing_total: 0, media_ids: [] });
        return flat;
    }), [anonymous, assetsKey, persistActivity, persistSession, watermarkText]);
    const uploadAll = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7;
        if (!apiAccessToken) {
            setError(t('Log in (or set a Dev API token) to upload.'));
            return;
        }
        setError(null);
        setPhase('uploading');
        const flat = yield loadAssets();
        if (flat.length === 0) {
            setError(t('No uploads yet.'));
            setPhase('idle');
            return;
        }
        const event_id = competitionId;
        let uploadedCount = 0;
        const nextItems = [...flat];
        for (let i = 0; i < nextItems.length; i += BATCH_SIZE) {
            const batch = nextItems.slice(i, i + BATCH_SIZE);
            // mark uploading
            for (let j = 0; j < batch.length; j += 1) {
                nextItems[i + j] = Object.assign(Object.assign({}, nextItems[i + j]), { status: 'uploading' });
            }
            setItems([...nextItems]);
            try {
                const files = [];
                for (let j = 0; j < batch.length; j += 1) {
                    const b = batch[j];
                    let uri = normalizeFileUri(String(b.uri || ''));
                    if (!uri)
                        continue;
                    // Verify local file exists (file:// only). If missing, mark failed with a helpful message.
                    if (uri.startsWith('file://')) {
                        const rawPath = fileUriToPath(uri);
                        const exists = yield RNFS.exists(rawPath);
                        if (!exists) {
                            nextItems[i + j] = Object.assign(Object.assign({}, nextItems[i + j]), { status: 'failed', error: t('Selected file is no longer available. Please re-select it and try again.') });
                            continue;
                        }
                    }
                    files.push({
                        uri,
                        type: b.type || undefined,
                        name: b.fileName || `upload-${i + j + 1}`,
                        title: b.title || null,
                    });
                }
                // If everything in the batch was missing, skip hitting the API.
                if (files.length === 0) {
                    setItems([...nextItems]);
                    continue;
                }
                const resp = watermarkText
                    ? yield uploadMediaBatchWatermark(apiAccessToken, {
                        files,
                        watermark_text: watermarkText,
                        event_id,
                        discipline_id: String(((_r = batch[0]) === null || _r === void 0 ? void 0 : _r.discipline_id) || '').trim() || undefined,
                        competition_map_id: String(((_s = batch[0]) === null || _s === void 0 ? void 0 : _s.competition_map_id) || '').trim() || undefined,
                        checkpoint_id: String(((_t = batch[0]) === null || _t === void 0 ? void 0 : _t.checkpoint_id) || '').trim() || undefined,
                        is_anonymous: anonymous,
                        price_cents: Number((_v = (_u = batch[0]) === null || _u === void 0 ? void 0 : _u.price_cents) !== null && _v !== void 0 ? _v : 0) || 0,
                        price_currency: String(((_w = batch[0]) === null || _w === void 0 ? void 0 : _w.price_currency) || 'EUR'),
                        skip_profile_collection: true,
                    })
                    : yield uploadMediaBatch(apiAccessToken, {
                        files,
                        event_id,
                        discipline_id: String(((_x = batch[0]) === null || _x === void 0 ? void 0 : _x.discipline_id) || '').trim() || undefined,
                        competition_map_id: String(((_y = batch[0]) === null || _y === void 0 ? void 0 : _y.competition_map_id) || '').trim() || undefined,
                        checkpoint_id: String(((_z = batch[0]) === null || _z === void 0 ? void 0 : _z.checkpoint_id) || '').trim() || undefined,
                        is_anonymous: anonymous,
                        price_cents: Number((_1 = (_0 = batch[0]) === null || _0 === void 0 ? void 0 : _0.price_cents) !== null && _1 !== void 0 ? _1 : 0) || 0,
                        price_currency: String(((_2 = batch[0]) === null || _2 === void 0 ? void 0 : _2.price_currency) || 'EUR'),
                        skip_profile_collection: true,
                    });
                const results = Array.isArray(resp === null || resp === void 0 ? void 0 : resp.results) ? resp.results : [];
                for (let j = 0; j < batch.length; j += 1) {
                    const r = (_3 = results[j]) !== null && _3 !== void 0 ? _3 : null;
                    const ok = Boolean(r === null || r === void 0 ? void 0 : r.ok);
                    const resolvedMediaId = ok ? String((_5 = (_4 = r === null || r === void 0 ? void 0 : r.media_id) !== null && _4 !== void 0 ? _4 : r === null || r === void 0 ? void 0 : r.existing_media_id) !== null && _5 !== void 0 ? _5 : '').trim() : '';
                    if (ok && resolvedMediaId) {
                        mediaIdsRef.current.push(resolvedMediaId);
                    }
                    nextItems[i + j] = Object.assign(Object.assign({}, nextItems[i + j]), { status: ok ? 'uploaded' : 'failed', media_id: ok ? (resolvedMediaId || null) : null, error: ok ? null : String((_6 = r === null || r === void 0 ? void 0 : r.error) !== null && _6 !== void 0 ? _6 : 'upload failed') });
                    if (ok)
                        uploadedCount += 1;
                }
                setItems([...nextItems]);
                yield persistActivity({ uploaded: uploadedCount, total: nextItems.length, phase: 'uploading' });
                yield persistSession({ uploaded: uploadedCount, total: nextItems.length, phase: 'uploading' });
            }
            catch (e) {
                const msg = e instanceof ApiError ? e.message : String((_7 = e === null || e === void 0 ? void 0 : e.message) !== null && _7 !== void 0 ? _7 : e);
                setError(msg);
                // mark batch as failed
                for (let j = 0; j < batch.length; j += 1) {
                    nextItems[i + j] = Object.assign(Object.assign({}, nextItems[i + j]), { status: 'failed', error: msg });
                }
                setItems([...nextItems]);
                yield persistActivity({ uploaded: uploadedCount, total: nextItems.length, phase: 'uploading', error: msg });
                yield persistSession({ uploaded: uploadedCount, total: nextItems.length, phase: 'failed', error: msg });
            }
        }
        const mediaIds = [...mediaIdsRef.current];
        // Reset upload draft immediately after successful upload, without waiting for processing completion.
        if (uploadedCount > 0) {
            try {
                yield AsyncStorage.multiRemove([
                    assetsKey,
                    `@upload_counts_${competitionId}`,
                ]);
                yield AsyncStorage.setItem(UPLOAD_FLOW_RESET_KEY, '1');
            }
            catch (_8) {
                // ignore
            }
        }
        yield persistActivity({ media_ids: mediaIds, phase: 'processing', processing_total: mediaIds.length });
        yield persistSession({ media_ids: mediaIds, phase: 'processing', processing_total: mediaIds.length });
        setPhase('processing');
    }), [anonymous, apiAccessToken, assetsKey, competitionId, loadAssets, persistActivity, persistSession, t, watermarkText]);
    useEffect(() => {
        // If we opened this screen from "activity", we only display/poll.
        // If we opened from the upload flow, we auto-start the upload.
        (() => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const existing = yield getUploadSession(sessionId);
            if (existing) {
                sessionRef.current = existing;
                setSessionSnapshot(existing);
                if (Array.isArray(existing.media_ids)) {
                    mediaIdsRef.current = existing.media_ids;
                }
                setProcessing({
                    ready: Number((_a = existing.processing_ready) !== null && _a !== void 0 ? _a : 0),
                    total: Number((_b = existing.processing_total) !== null && _b !== void 0 ? _b : 0),
                });
                setError(existing.error ? String(existing.error) : null);
                if (existing.phase === 'processing')
                    setPhase('processing');
                if (existing.phase === 'done')
                    setPhase('done');
                if (existing.phase === 'failed')
                    setPhase('idle');
                if (!autoStart)
                    return;
            }
            if (autoStart)
                uploadAll();
        }))();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const computeUploadProgress = useMemo(() => {
        var _a, _b;
        const total = items.length > 0 ? items.length : Number((_a = sessionSnapshot === null || sessionSnapshot === void 0 ? void 0 : sessionSnapshot.total) !== null && _a !== void 0 ? _a : 0);
        const done = items.length > 0
            ? items.filter((x) => x.status === 'uploaded').length
            : Number((_b = sessionSnapshot === null || sessionSnapshot === void 0 ? void 0 : sessionSnapshot.uploaded) !== null && _b !== void 0 ? _b : 0);
        const failed = items.filter((x) => x.status === 'failed').length;
        return { total, done, failed };
    }, [items, sessionSnapshot === null || sessionSnapshot === void 0 ? void 0 : sessionSnapshot.total, sessionSnapshot === null || sessionSnapshot === void 0 ? void 0 : sessionSnapshot.uploaded]);
    const pollStatus = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        if (!apiAccessToken)
            return;
        const ids = mediaIdsRef.current;
        if (!ids || ids.length === 0)
            return;
        try {
            const resp = yield getMediaStatus(apiAccessToken, ids);
            const list = Array.isArray(resp === null || resp === void 0 ? void 0 : resp.results) ? resp.results : [];
            const map = {};
            for (const s of list) {
                if (!(s === null || s === void 0 ? void 0 : s.media_id))
                    continue;
                map[String(s.media_id)] = s;
            }
            setStatusById(map);
            const ready = list.filter((x) => { var _a, _b; return ((_a = x === null || x === void 0 ? void 0 : x.steps) === null || _a === void 0 ? void 0 : _a.transforms_done) && ((_b = x === null || x === void 0 ? void 0 : x.steps) === null || _b === void 0 ? void 0 : _b.embeddings_done); }).length;
            setProcessing({ ready, total: ids.length });
            yield persistActivity({ processing_ready: ready, processing_total: ids.length, phase: 'processing' });
            if (ready >= ids.length) {
                setPhase('done');
                yield persistActivity({ phase: 'done' });
                yield persistSession({ phase: 'done', processing_ready: ready, processing_total: ids.length });
                try {
                    yield AsyncStorage.multiRemove([
                        assetsKey,
                        `@upload_counts_${competitionId}`,
                        `@upload_session_${competitionId}`,
                    ]);
                    yield AsyncStorage.setItem(UPLOAD_FLOW_RESET_KEY, '1');
                }
                catch (_9) {
                    // ignore
                }
                if (pollTimerRef.current) {
                    clearInterval(pollTimerRef.current);
                    pollTimerRef.current = null;
                }
            }
        }
        catch (_10) {
            // ignore polling errors
        }
    }), [apiAccessToken, assetsKey, competitionId, persistActivity, persistSession]);
    useEffect(() => {
        if (phase !== 'processing')
            return;
        pollStatus();
        pollTimerRef.current = setInterval(pollStatus, STATUS_POLL_MS);
        return () => {
            if (pollTimerRef.current) {
                clearInterval(pollTimerRef.current);
                pollTimerRef.current = null;
            }
        };
    }, [phase, pollStatus]);
    const headerTitle = useMemo(() => {
        if (phase === 'uploading')
            return t('Starting upload');
        if (phase === 'processing')
            return t('Processing');
        if (phase === 'done')
            return t('Done');
        return t('Upload');
    }, [phase, t]);
    const progress = useMemo(() => {
        return calculateUploadProgressState({
            phase,
            total: computeUploadProgress.total,
            uploaded: computeUploadProgress.done,
            processing_ready: processing.ready,
            processing_total: processing.total,
        }).overallProgress;
    }, [computeUploadProgress.done, computeUploadProgress.total, phase, processing.ready, processing.total]);
    const subtitle = useMemo(() => {
        if (phase === 'processing')
            return t('We are enhancing your media and generating AI results.');
        if (phase === 'done')
            return t('Your uploads are ready.');
        return t('Uploading your files now. You can leave this screen, but uploads may pause in the background.');
    }, [phase, t]);
    const progressLabel = useMemo(() => {
        const state = calculateUploadProgressState({
            phase,
            total: computeUploadProgress.total,
            uploaded: computeUploadProgress.done,
            processing_ready: processing.ready,
            processing_total: processing.total,
        });
        if (phase === 'processing')
            return `${state.processingReady}/${state.processingTotal} ${t('ready')} • ${state.uploaded}/${state.total} ${t('uploaded')}`;
        if (phase === 'done')
            return `${state.total}/${state.total} ${t('ready')}`;
        return `${state.uploaded}/${state.total} ${t('uploaded')}`;
    }, [computeUploadProgress.done, computeUploadProgress.total, phase, processing.ready, processing.total, t]);
    const handleBack = () => {
        navigation.goBack();
    };
    const goToUploadStart = () => {
        navigation.reset({
            index: 0,
            routes: [
                {
                    name: 'BottomTabBar',
                    state: { index: 2, routes: [{ name: 'Upload' }] },
                },
            ],
        });
    };
    const goToUploadActivity = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'UploadActivityScreen' }],
        });
    };
    return (_jsxs(View, Object.assign({ style: styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.headerBtn, onPress: handleBack }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: styles.headerTitle }, { children: headerTitle })), _jsx(View, { style: styles.headerBtn })] })), _jsx(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, contentContainerStyle: { paddingBottom: insets.bottom + 24 } }, { children: _jsx(View, Object.assign({ style: styles.content }, { children: _jsxs(View, Object.assign({ style: styles.card }, { children: [_jsx(Text, Object.assign({ style: styles.title }, { children: t('Upload activity') })), _jsx(Text, Object.assign({ style: styles.subtitle }, { children: subtitle })), _jsx(View, Object.assign({ style: styles.progressBarTrack }, { children: _jsx(View, { style: [styles.progressBarFill, { width: `${Math.round(progress * 100)}%` }] }) })), _jsxs(View, Object.assign({ style: styles.progressMetaRow }, { children: [_jsx(Text, Object.assign({ style: styles.progressMeta }, { children: progressLabel })), _jsxs(Text, Object.assign({ style: styles.progressMeta }, { children: [Math.round(progress * 100), "%"] }))] })), error ? _jsx(Text, Object.assign({ style: styles.errorText }, { children: error })) : null, _jsx(View, Object.assign({ style: styles.list }, { children: items.slice(0, 6).map((it, idx) => {
                                    var _a, _b, _c, _d;
                                    const label = it.status === 'uploaded' ? t('Uploaded') : it.status === 'failed' ? t('Failed') : t('Pending');
                                    const st = it.media_id ? statusById[String(it.media_id)] : null;
                                    const thumb = (_d = (_b = (_a = st === null || st === void 0 ? void 0 : st.assets) === null || _a === void 0 ? void 0 : _a.thumbnail_url) !== null && _b !== void 0 ? _b : (_c = st === null || st === void 0 ? void 0 : st.assets) === null || _c === void 0 ? void 0 : _c.preview_url) !== null && _d !== void 0 ? _d : null;
                                    return (_jsxs(View, Object.assign({ style: styles.row }, { children: [thumb ? (_jsx(FastImage, { source: { uri: String(thumb) }, style: { width: 42, height: 42, borderRadius: 10, marginRight: 10 } })) : (_jsx(View, { style: { width: 42, height: 42, borderRadius: 10, marginRight: 10, backgroundColor: colors.btnBackgroundColor } })), _jsxs(View, Object.assign({ style: styles.rowLeft }, { children: [_jsx(Text, Object.assign({ style: styles.rowTitle, numberOfLines: 1 }, { children: it.fileName || `File ${idx + 1}` })), _jsx(Text, Object.assign({ style: styles.rowMeta, numberOfLines: 1 }, { children: it.category || '' }))] })), _jsx(View, Object.assign({ style: styles.pill }, { children: _jsx(Text, Object.assign({ style: styles.pillText }, { children: label })) }))] }), `${it.uri}-${idx}`));
                                }) })), _jsxs(View, Object.assign({ style: styles.ctaRow }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.ctaSecondary, onPress: goToUploadStart, activeOpacity: 0.85 }, { children: _jsx(Text, Object.assign({ style: styles.ctaSecondaryText }, { children: t('Back') })) })), _jsx(TouchableOpacity, Object.assign({ style: styles.ctaPrimary, onPress: () => (phase === 'done' ? goToUploadActivity() : pollStatus()), activeOpacity: 0.85 }, { children: _jsx(Text, Object.assign({ style: styles.ctaPrimaryText }, { children: phase === 'done' ? t('OK') : t('Refresh') })) }))] }))] })) })) }))] })));
};
export default UploadProgressScreen;
