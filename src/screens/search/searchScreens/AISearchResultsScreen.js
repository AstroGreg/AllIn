var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useMemo } from 'react';
import { Alert, FlatList, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { useEvents } from '../../../context/EventsContext';
import FastImage from 'react-native-fast-image';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
import Icons from '../../../constants/Icons';
import { createStyles } from './AISearchResultsScreenStyles';
import { useAuth } from '../../../context/AuthContext';
import { ApiError, getMediaById, recordDownload } from '../../../services/apiGateway';
import { useTranslation } from 'react-i18next';
const clampPercent = (value) => Math.max(0, Math.min(100, value));
const AISearchResultsScreen = ({ navigation, route }) => {
    var _a, _b, _c, _d, _e, _f;
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const { apiAccessToken } = useAuth();
    const { eventNameById } = useEvents();
    const rawResults = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.results;
    const results = useMemo(() => (Array.isArray(rawResults) ? rawResults : []), [rawResults]);
    const defaultMatchType = ((_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.matchType) ? String(route.params.matchType) : undefined;
    const refineContext = ((_d = (_c = route === null || route === void 0 ? void 0 : route.params) === null || _c === void 0 ? void 0 : _c.refineContext) !== null && _d !== void 0 ? _d : {});
    const parseConfidencePercent = useCallback((raw) => {
        const matchPercent = Number(raw === null || raw === void 0 ? void 0 : raw.match_percent);
        if (Number.isFinite(matchPercent))
            return clampPercent(matchPercent);
        const confidence = Number(raw === null || raw === void 0 ? void 0 : raw.confidence);
        if (Number.isFinite(confidence))
            return clampPercent(confidence <= 1 ? confidence * 100 : confidence);
        const score = Number(raw === null || raw === void 0 ? void 0 : raw.score);
        if (Number.isFinite(score))
            return clampPercent(score <= 1 ? score * 100 : score);
        return null;
    }, []);
    const parsedResults = useMemo(() => {
        return results.map((r, idx) => {
            var _a, _b, _c, _d, _e;
            return (Object.assign(Object.assign({}, (Number.isFinite(Number(r.match_time_seconds))
                ? { matchTimeSeconds: Number(r.match_time_seconds) }
                : {})), { id: String((_b = (_a = r.media_id) !== null && _a !== void 0 ? _a : r.id) !== null && _b !== void 0 ? _b : idx), imageUrl: String((_e = (_d = (_c = r.thumbnail_url) !== null && _c !== void 0 ? _c : r.preview_url) !== null && _d !== void 0 ? _d : r.original_url) !== null && _e !== void 0 ? _e : ''), type: r.type === 'video' || r.type === 'image' ? r.type : undefined, previewUrl: r.preview_url ? String(r.preview_url) : undefined, originalUrl: r.original_url ? String(r.original_url) : undefined, eventId: r.event_id ? String(r.event_id) : undefined, eventName: r.event_name ? String(r.event_name) : undefined, matchType: r.match_type ? String(r.match_type) : r.bib_number ? 'bib' : defaultMatchType, bibNumber: r.bib_number ? String(r.bib_number) : undefined, createdAt: r.created_at ? String(r.created_at) : undefined, confidencePercent: parseConfidencePercent(r) }));
        });
    }, [defaultMatchType, parseConfidencePercent, results]);
    const matchedCount = (_f = (_e = route === null || route === void 0 ? void 0 : route.params) === null || _e === void 0 ? void 0 : _e.matchedCount) !== null && _f !== void 0 ? _f : parsedResults.length;
    const sortedResults = useMemo(() => {
        return [...parsedResults].sort((a, b) => {
            var _a, _b;
            const aConfidence = Number((_a = a.confidencePercent) !== null && _a !== void 0 ? _a : -1);
            const bConfidence = Number((_b = b.confidencePercent) !== null && _b !== void 0 ? _b : -1);
            if (aConfidence !== bConfidence)
                return bConfidence - aConfidence;
            return String(a.eventName || '').localeCompare(String(b.eventName || ''));
        });
    }, [parsedResults]);
    const refinePills = useMemo(() => {
        const pills = [];
        if (refineContext.bib)
            pills.push({ key: 'bib', label: `${t('Chest number')}: ${refineContext.bib}` });
        if (refineContext.discipline)
            pills.push({ key: 'discipline', label: `${t('discipline')}: ${refineContext.discipline}` });
        if (refineContext.checkpoint)
            pills.push({ key: 'checkpoint', label: `${t('Checkpoint')}: ${refineContext.checkpoint}` });
        return pills;
    }, [refineContext.bib, refineContext.checkpoint, refineContext.discipline, t]);
    const matchLabel = useCallback((matchType) => {
        const key = String(matchType !== null && matchType !== void 0 ? matchType : '').toLowerCase();
        if (key === 'bib')
            return t('Chest number');
        if (key === 'context')
            return t('Context');
        if (key === 'face')
            return t('Face');
        if (key === 'combined')
            return t('Combined');
        return t('AI');
    }, [t]);
    const confidenceLabel = useCallback((item) => {
        var _a;
        if (String((_a = item.matchType) !== null && _a !== void 0 ? _a : '').toLowerCase() === 'bib') {
            return t('Chest number');
        }
        if (item.confidencePercent == null)
            return t('Needs review');
        const rounded = Math.round(item.confidencePercent);
        return `${rounded}% ${t('match')}`;
    }, [t]);
    const formatMatchTime = useCallback((value) => {
        if (!Number.isFinite(value))
            return null;
        const safe = Math.max(0, Math.floor(Number(value)));
        const minutes = Math.floor(safe / 60);
        const seconds = safe % 60;
        return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
    }, []);
    const downloadOne = useCallback((item) => __awaiter(void 0, void 0, void 0, function* () {
        var _g;
        if (!apiAccessToken) {
            Alert.alert(t('Missing API token'), t('Log in or set a Dev API token to download.'));
            return;
        }
        const mediaId = String(item.id || '').trim();
        if (!mediaId)
            return;
        const startUrl = (item.originalUrl || item.previewUrl || '').trim();
        try {
            let url = startUrl || null;
            if (!url) {
                const fresh = yield getMediaById(apiAccessToken, mediaId);
                url = (fresh.original_url || fresh.full_url || fresh.raw_url || fresh.preview_url || fresh.thumbnail_url || null);
                url = url ? String(url) : null;
            }
            if (!url) {
                Alert.alert(t('No download URL'), t('The API did not provide a downloadable URL for this media.'));
                return;
            }
            try {
                yield recordDownload(apiAccessToken, { media_id: mediaId, event_id: item.eventId });
            }
            catch (_h) {
                // ignore analytics failures
            }
            yield Share.share({ message: url, url });
        }
        catch (e) {
            const msg = e instanceof ApiError ? e.message : String((_g = e === null || e === void 0 ? void 0 : e.message) !== null && _g !== void 0 ? _g : e);
            Alert.alert(t('Download failed'), msg);
        }
    }), [apiAccessToken, t]);
    const openMedia = useCallback((item) => __awaiter(void 0, void 0, void 0, function* () {
        var _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
        let resolvedThumbnail = item.imageUrl;
        let resolvedPreview = item.previewUrl;
        let resolvedOriginal = item.originalUrl;
        if (!resolvedThumbnail && !resolvedPreview && !resolvedOriginal) {
            if (!apiAccessToken) {
                Alert.alert(t('Missing URL'), t('No preview/original URL was provided for this result.'));
                return;
            }
            try {
                const fresh = yield getMediaById(apiAccessToken, item.id);
                resolvedThumbnail = String((_j = fresh.thumbnail_url) !== null && _j !== void 0 ? _j : '') || resolvedThumbnail;
                resolvedPreview = String((_k = fresh.preview_url) !== null && _k !== void 0 ? _k : '') || resolvedPreview;
                resolvedOriginal = String((_o = (_m = (_l = fresh.original_url) !== null && _l !== void 0 ? _l : fresh.full_url) !== null && _m !== void 0 ? _m : fresh.raw_url) !== null && _o !== void 0 ? _o : '') || resolvedOriginal;
            }
            catch (e) {
                const msg = e instanceof ApiError ? e.message : String((_p = e === null || e === void 0 ? void 0 : e.message) !== null && _p !== void 0 ? _p : e);
                Alert.alert(t('Open failed'), msg);
                return;
            }
        }
        const url = (_q = resolvedPreview !== null && resolvedPreview !== void 0 ? resolvedPreview : resolvedOriginal) !== null && _q !== void 0 ? _q : resolvedThumbnail;
        if (!url) {
            Alert.alert(t('Missing URL'), t('No preview/original URL was provided for this result.'));
            return;
        }
        if (item.type === 'video') {
            navigation.navigate('VideoPlayingScreen', {
                mediaId: item.id,
                startAt: (_r = item.matchTimeSeconds) !== null && _r !== void 0 ? _r : 0,
                video: {
                    title: item.eventName || eventNameById(item.eventId),
                    thumbnail: resolvedThumbnail,
                    uri: (_s = resolvedOriginal !== null && resolvedOriginal !== void 0 ? resolvedOriginal : resolvedPreview) !== null && _s !== void 0 ? _s : resolvedThumbnail,
                },
            });
            return;
        }
        navigation.navigate('PhotoDetailScreen', {
            startAt: (_t = item.matchTimeSeconds) !== null && _t !== void 0 ? _t : 0,
            eventTitle: item.eventName || eventNameById(item.eventId),
            media: {
                id: item.id,
                eventId: item.eventId,
                thumbnailUrl: resolvedThumbnail,
                previewUrl: resolvedPreview,
                originalUrl: resolvedOriginal,
                type: item.type,
                matchType: item.matchType,
                bibNumber: item.bibNumber,
            },
        });
    }), [apiAccessToken, eventNameById, navigation, t]);
    const renderResultCard = useCallback((item) => (_jsxs(TouchableOpacity, Object.assign({ style: styles.resultCard, onPress: () => openMedia(item), activeOpacity: 0.85, testID: `ai-search-result-${item.id}` }, { children: [_jsx(FastImage, { source: { uri: item.imageUrl }, style: styles.resultImage, resizeMode: FastImage.resizeMode.cover }), _jsx(TouchableOpacity, Object.assign({ style: styles.downloadButton, onPress: () => downloadOne(item) }, { children: _jsx(Icons.DownloadBlue, { width: 16, height: 16 }) })), _jsxs(View, Object.assign({ style: styles.resultBody }, { children: [_jsx(Text, Object.assign({ style: styles.resultEventName, numberOfLines: 1 }, { children: item.eventName || eventNameById(item.eventId) || t('Competition') })), _jsxs(View, Object.assign({ style: styles.resultChipRow }, { children: [_jsx(View, Object.assign({ style: styles.sourceChip }, { children: _jsx(Text, Object.assign({ style: styles.sourceChipText }, { children: matchLabel(item.matchType) })) })), _jsx(View, Object.assign({ style: styles.confidenceChip }, { children: _jsx(Text, Object.assign({ style: styles.confidenceChipText }, { children: confidenceLabel(item) })) }))] })), _jsxs(View, { children: [item.bibNumber ? _jsxs(Text, Object.assign({ style: styles.resultMeta }, { children: [t('Chest number'), ": ", item.bibNumber] })) : null, item.type === 'video' ? _jsx(Text, Object.assign({ style: styles.resultMeta }, { children: t('Video') })) : null, item.type === 'video' && item.matchTimeSeconds != null ? (_jsxs(Text, Object.assign({ style: styles.resultMeta }, { children: [t('Match time'), ": ", formatMatchTime(item.matchTimeSeconds)] }))) : null] })] }))] }), item.id)), [confidenceLabel, downloadOne, eventNameById, formatMatchTime, matchLabel, openMedia, styles, t]);
    return (_jsxs(View, Object.assign({ style: styles.mainContainer, testID: "ai-search-results-screen" }, { children: [_jsx(SizeBox, { height: insets.top }), sortedResults.length > 0 ? (_jsx(View, { testID: "ai-search-results-ready", style: { position: 'absolute', width: 1, height: 1, opacity: 0 } })) : null, _jsxs(View, Object.assign({ style: styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: styles.headerTitle }, { children: t('AI results') })), _jsx(View, { style: { width: 44, height: 44 } })] })), _jsxs(View, Object.assign({ style: styles.refineBar }, { children: [_jsx(ScrollView, Object.assign({ horizontal: true, showsHorizontalScrollIndicator: false, contentContainerStyle: styles.refinePillsRow }, { children: refinePills.length > 0 ? refinePills.map((pill) => (_jsx(View, Object.assign({ style: styles.refinePill }, { children: _jsx(Text, Object.assign({ style: styles.refinePillText }, { children: pill.label })) }), pill.key))) : null })), _jsx(TouchableOpacity, Object.assign({ style: styles.refineButton, onPress: () => navigation.goBack() }, { children: _jsx(Text, Object.assign({ style: styles.refineButtonText }, { children: t('Refine') })) }))] })), _jsx(FlatList, { data: sortedResults, keyExtractor: (item) => item.id, numColumns: 2, style: styles.container, contentContainerStyle: [styles.listContent, { paddingBottom: insets.bottom > 0 ? insets.bottom + 20 : 40 }], columnWrapperStyle: sortedResults.length > 0 ? styles.gridRow : undefined, showsVerticalScrollIndicator: false, initialNumToRender: 6, maxToRenderPerBatch: 8, windowSize: 4, removeClippedSubviews: true, renderItem: ({ item }) => renderResultCard(item), ListHeaderComponent: (_jsxs(_Fragment, { children: [_jsx(SizeBox, { height: 16 }), _jsxs(View, Object.assign({ style: styles.resultsHeader }, { children: [_jsxs(View, { children: [_jsx(Text, Object.assign({ style: styles.resultsTitle }, { children: t('Possible matches') })), _jsx(Text, Object.assign({ style: styles.resultsSubtitle }, { children: t('Possible matches are sorted by chance so the strongest candidates appear first.') }))] }), _jsx(View, Object.assign({ style: styles.resultsBadge }, { children: _jsxs(Text, Object.assign({ style: styles.resultsBadgeText }, { children: [matchedCount, " ", t('found')] })) }))] })), _jsx(SizeBox, { height: 18 })] })), ListEmptyComponent: (_jsx(View, Object.assign({ style: styles.section }, { children: _jsx(Text, Object.assign({ style: styles.emptySectionText }, { children: t('No possible matches to review.') })) }))) })] })));
};
export default AISearchResultsScreen;
