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
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { ArrowDown2, ArrowLeft2, ArrowRight, ArrowUp2 } from 'iconsax-react-nativejs';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventsContext';
import { ApiError, getCompetitionMedia, getDownloads, getDownloadsDashboard, getDownloadsProfit, getUploadedCompetitions, } from '../../services/apiGateway';
import { getApiBaseUrl } from '../../constants/RuntimeConfig';
import { createStyles } from './DownloadsDetailsStyles';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
const COMPETITION_MEDIA_PAGE_SIZE = 60;
const PERIOD_OPTIONS = [
    { key: 'week', label: 'This week' },
    { key: 'month', label: 'This month' },
    { key: 'all', label: 'All time' },
];
const DownloadsDetailsScreen = ({ navigation, route }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { apiAccessToken } = useAuth();
    const { eventNameById } = useEvents();
    const rawMode = String((_b = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.mode) !== null && _b !== void 0 ? _b : 'history');
    const mode = rawMode === 'downloads'
        ? 'history'
        : rawMode === 'history'
            ? 'history'
            : rawMode === 'profit'
                ? 'profit'
                : rawMode === 'competitions'
                    ? 'competitions'
                    : rawMode === 'competition-media'
                        ? 'competition-media'
                        : 'history';
    const isDashboardView = mode === 'dashboard';
    const isHistoryView = mode === 'history';
    const isProfitView = mode === 'profit';
    const isCompetitionList = mode === 'competitions';
    const isCompetitionMedia = mode === 'competition-media';
    const tutorialMode = Boolean((_c = route === null || route === void 0 ? void 0 : route.params) === null || _c === void 0 ? void 0 : _c.tutorialMode);
    const tutorialStep = String((_e = (_d = route === null || route === void 0 ? void 0 : route.params) === null || _d === void 0 ? void 0 : _d.tutorialStep) !== null && _e !== void 0 ? _e : '');
    const [tutorialDemoDownloaded, setTutorialDemoDownloaded] = useState(Boolean((_f = route === null || route === void 0 ? void 0 : route.params) === null || _f === void 0 ? void 0 : _f.tutorialDemoDownloaded));
    const [dashboard, setDashboard] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [downloads, setDownloads] = useState([]);
    const [profitItems, setProfitItems] = useState([]);
    const [competitions, setCompetitions] = useState([]);
    const [competitionMediaItems, setCompetitionMediaItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCompetitionMediaLoadingMore, setIsCompetitionMediaLoadingMore] = useState(false);
    const [hasMoreCompetitionMedia, setHasMoreCompetitionMedia] = useState(true);
    const [errorText, setErrorText] = useState(null);
    const [competitionSearch, setCompetitionSearch] = useState('');
    const tutorialPhotoUrl = 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200&auto=format&fit=crop';
    useFocusEffect(useCallback(() => {
        var _a;
        if (!tutorialMode)
            return;
        if ((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.tutorialDemoDownloaded) {
            setTutorialDemoDownloaded(true);
        }
    }, [(_g = route === null || route === void 0 ? void 0 : route.params) === null || _g === void 0 ? void 0 : _g.tutorialDemoDownloaded, tutorialMode]));
    const isSignedUrl = useCallback((value) => {
        if (!value)
            return false;
        const lower = String(value).toLowerCase();
        return (lower.includes('x-amz-signature') ||
            lower.includes('x-amz-credential') ||
            lower.includes('x-amz-security-token') ||
            lower.includes('signature=') ||
            lower.includes('sig=') ||
            lower.includes('token=') ||
            lower.includes('expires=') ||
            lower.includes('sv=') ||
            lower.includes('se=') ||
            lower.includes('sp='));
    }, []);
    const toAbsoluteUrl = useCallback((value) => {
        if (!value)
            return null;
        const raw = String(value);
        if (raw.startsWith('http://') || raw.startsWith('https://'))
            return raw;
        const base = getApiBaseUrl();
        if (!base)
            return raw;
        return `${base.replace(/\/$/, '')}/${raw.replace(/^\//, '')}`;
    }, []);
    const withAccessToken = useCallback((value) => {
        if (!value)
            return undefined;
        if (!apiAccessToken)
            return value;
        if (isSignedUrl(value))
            return value;
        if (value.includes('access_token='))
            return value;
        const sep = value.includes('?') ? '&' : '?';
        return `${value}${sep}access_token=${encodeURIComponent(apiAccessToken)}`;
    }, [apiAccessToken, isSignedUrl]);
    const formatMoney = useCallback((cents) => {
        const safe = Number(cents !== null && cents !== void 0 ? cents : 0);
        if (!Number.isFinite(safe))
            return '€0.00';
        return `€${(safe / 100).toFixed(2)}`;
    }, []);
    const formatMetricValue = useCallback((key, metrics) => {
        var _a, _b, _c;
        if (!metrics)
            return key === 'revenue' ? '€0.00' : '0';
        if (key === 'revenue')
            return formatMoney((_a = metrics.revenue_cents) !== null && _a !== void 0 ? _a : 0);
        if (key === 'downloads')
            return String(Number((_b = metrics.downloads) !== null && _b !== void 0 ? _b : 0).toLocaleString());
        return String(Number((_c = metrics.views) !== null && _c !== void 0 ? _c : 0).toLocaleString());
    }, [formatMoney]);
    const formatEventDate = useCallback((value) => {
        if (!value)
            return '';
        const raw = String(value);
        const dt = new Date(raw);
        if (Number.isNaN(dt.getTime()))
            return raw.slice(0, 10);
        return dt.toLocaleDateString();
    }, []);
    const formatCompetitionType = useCallback((value) => {
        const raw = String(value || '').toLowerCase();
        if (raw.includes('road') || raw.includes('trail') || raw.includes('marathon'))
            return t('roadAndTrail');
        if (raw.includes('track') || raw.includes('field'))
            return t('trackAndField');
        return t('competition');
    }, [t]);
    const loadDashboard = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _r;
        if (!apiAccessToken) {
            setDashboard(null);
            setErrorText(t('Log in (or set a Dev API token) to view downloads.'));
            return;
        }
        setIsLoading(true);
        setErrorText(null);
        try {
            const data = yield getDownloadsDashboard(apiAccessToken);
            setDashboard(data);
        }
        catch (e) {
            const msg = e instanceof ApiError ? e.message : String((_r = e === null || e === void 0 ? void 0 : e.message) !== null && _r !== void 0 ? _r : e);
            setDashboard(null);
            setErrorText(msg);
        }
        finally {
            setIsLoading(false);
        }
    }), [apiAccessToken, t]);
    const loadDownloads = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _s;
        if (!apiAccessToken) {
            setDownloads([]);
            setErrorText(t('Log in (or set a Dev API token) to view downloads.'));
            return;
        }
        setIsLoading(true);
        setErrorText(null);
        try {
            const data = yield getDownloads(apiAccessToken, { limit: 200 });
            setDownloads(Array.isArray(data) ? data : []);
        }
        catch (e) {
            const msg = e instanceof ApiError ? e.message : String((_s = e === null || e === void 0 ? void 0 : e.message) !== null && _s !== void 0 ? _s : e);
            setErrorText(msg);
        }
        finally {
            setIsLoading(false);
        }
    }), [apiAccessToken, t]);
    const loadProfit = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _t;
        if (!apiAccessToken) {
            setProfitItems([]);
            return;
        }
        setIsLoading(true);
        setErrorText(null);
        try {
            const resp = yield getDownloadsProfit(apiAccessToken, { limit: 200 });
            const items = Array.isArray(resp === null || resp === void 0 ? void 0 : resp.items) ? resp.items : [];
            items.sort((a, b) => {
                var _a, _b, _c, _d;
                return Number((_a = b.downloads_count) !== null && _a !== void 0 ? _a : 0) - Number((_b = a.downloads_count) !== null && _b !== void 0 ? _b : 0) ||
                    Number((_c = b.views_count) !== null && _c !== void 0 ? _c : 0) - Number((_d = a.views_count) !== null && _d !== void 0 ? _d : 0);
            });
            setProfitItems(items);
        }
        catch (e) {
            const msg = e instanceof ApiError ? e.message : String((_t = e === null || e === void 0 ? void 0 : e.message) !== null && _t !== void 0 ? _t : e);
            setProfitItems([]);
            setErrorText(msg);
        }
        finally {
            setIsLoading(false);
        }
    }), [apiAccessToken]);
    const loadCompetitions = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _u;
        if (!apiAccessToken) {
            setCompetitions([]);
            return;
        }
        setIsLoading(true);
        setErrorText(null);
        try {
            const resp = yield getUploadedCompetitions(apiAccessToken, { limit: 200 });
            const items = Array.isArray(resp === null || resp === void 0 ? void 0 : resp.competitions) ? resp.competitions : [];
            setCompetitions(items);
        }
        catch (e) {
            const msg = e instanceof ApiError ? e.message : String((_u = e === null || e === void 0 ? void 0 : e.message) !== null && _u !== void 0 ? _u : e);
            setCompetitions([]);
            setErrorText(msg);
        }
        finally {
            setIsLoading(false);
        }
    }), [apiAccessToken]);
    const mergeCompetitionMediaItems = useCallback((current, incoming) => {
        const seen = new Set();
        return [...current, ...incoming].filter((item) => {
            var _a;
            const key = String((_a = item === null || item === void 0 ? void 0 : item.media_id) !== null && _a !== void 0 ? _a : '');
            if (!key || seen.has(key))
                return false;
            seen.add(key);
            return true;
        });
    }, []);
    const loadCompetitionMedia = useCallback((eventId, opts) => __awaiter(void 0, void 0, void 0, function* () {
        var _v, _w;
        if (!apiAccessToken || !eventId) {
            setCompetitionMediaItems([]);
            setHasMoreCompetitionMedia(false);
            return;
        }
        const offset = Math.max(0, Number((_v = opts === null || opts === void 0 ? void 0 : opts.offset) !== null && _v !== void 0 ? _v : 0));
        const append = Boolean(opts === null || opts === void 0 ? void 0 : opts.append);
        if (append) {
            setIsCompetitionMediaLoadingMore(true);
        }
        else {
            setIsLoading(true);
        }
        setErrorText(null);
        try {
            const resp = yield getCompetitionMedia(apiAccessToken, String(eventId), {
                limit: COMPETITION_MEDIA_PAGE_SIZE,
                offset,
                include_original: false,
            });
            const incoming = Array.isArray(resp === null || resp === void 0 ? void 0 : resp.items) ? resp.items : [];
            setCompetitionMediaItems((prev) => append ? mergeCompetitionMediaItems(prev, incoming) : incoming);
            setHasMoreCompetitionMedia(incoming.length === COMPETITION_MEDIA_PAGE_SIZE);
        }
        catch (e) {
            const msg = e instanceof ApiError ? e.message : String((_w = e === null || e === void 0 ? void 0 : e.message) !== null && _w !== void 0 ? _w : e);
            if (!append) {
                setCompetitionMediaItems([]);
                setHasMoreCompetitionMedia(false);
            }
            setErrorText(msg);
        }
        finally {
            setIsLoading(false);
            setIsCompetitionMediaLoadingMore(false);
        }
    }), [apiAccessToken, mergeCompetitionMediaItems]);
    useFocusEffect(useCallback(() => {
        var _a, _b, _c, _d, _e;
        if (isDashboardView) {
            loadDashboard();
            return;
        }
        if (isHistoryView) {
            loadDownloads();
            return;
        }
        if (isProfitView) {
            loadProfit();
            return;
        }
        if (isCompetitionList) {
            loadCompetitions();
            return;
        }
        if (isCompetitionMedia) {
            const eventId = (_e = (_c = (_b = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.competition) === null || _b === void 0 ? void 0 : _b.event_id) !== null && _c !== void 0 ? _c : (_d = route === null || route === void 0 ? void 0 : route.params) === null || _d === void 0 ? void 0 : _d.competitionId) !== null && _e !== void 0 ? _e : null;
            loadCompetitionMedia(eventId, { offset: 0, append: false });
        }
    }, [
        isCompetitionList,
        isCompetitionMedia,
        isDashboardView,
        isHistoryView,
        isProfitView,
        loadCompetitionMedia,
        loadCompetitions,
        loadDashboard,
        loadDownloads,
        loadProfit,
        (_j = (_h = route === null || route === void 0 ? void 0 : route.params) === null || _h === void 0 ? void 0 : _h.competition) === null || _j === void 0 ? void 0 : _j.event_id,
        (_k = route === null || route === void 0 ? void 0 : route.params) === null || _k === void 0 ? void 0 : _k.competitionId,
    ]));
    const selectedCompetition = (_o = (_m = (_l = route === null || route === void 0 ? void 0 : route.params) === null || _l === void 0 ? void 0 : _l.competition) !== null && _m !== void 0 ? _m : competitions.find((item) => { var _a; return item.event_id === ((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.competitionId); })) !== null && _o !== void 0 ? _o : null;
    const selectedDashboardMetrics = (_q = (_p = dashboard === null || dashboard === void 0 ? void 0 : dashboard.periods) === null || _p === void 0 ? void 0 : _p[selectedPeriod]) !== null && _q !== void 0 ? _q : null;
    const dashboardCompetitions = useMemo(() => {
        var _a;
        const query = competitionSearch.trim().toLowerCase();
        const list = (_a = dashboard === null || dashboard === void 0 ? void 0 : dashboard.competitions) !== null && _a !== void 0 ? _a : [];
        if (!query)
            return list;
        return list.filter((item) => {
            const haystack = [item.event_name, item.event_location, item.event_type].filter(Boolean).join(' ').toLowerCase();
            return haystack.includes(query);
        });
    }, [competitionSearch, dashboard === null || dashboard === void 0 ? void 0 : dashboard.competitions]);
    const profitList = useMemo(() => {
        return profitItems.map((media) => {
            var _a, _b, _c, _d;
            const eventName = media.event_id ? eventNameById(String(media.event_id)) : '';
            const title = eventName || t('Uploaded media');
            return {
                id: String(media.media_id),
                title,
                downloads: Number((_a = media.downloads_count) !== null && _a !== void 0 ? _a : 0) || 0,
                views: Number((_b = media.views_count) !== null && _b !== void 0 ? _b : 0) || 0,
                likes: Number((_c = media.likes_count) !== null && _c !== void 0 ? _c : 0) || 0,
                profit_cents: Number((_d = media.profit_cents) !== null && _d !== void 0 ? _d : 0) || 0,
                media,
            };
        });
    }, [eventNameById, profitItems, t]);
    const filteredCompetitions = useMemo(() => {
        const query = competitionSearch.trim().toLowerCase();
        if (!query)
            return competitions;
        return competitions.filter((item) => (item.event_name || '').toLowerCase().includes(query));
    }, [competitionSearch, competitions]);
    const headerTitle = isCompetitionList
        ? t('Competitions')
        : isCompetitionMedia
            ? (selectedCompetition === null || selectedCompetition === void 0 ? void 0 : selectedCompetition.event_name) || `${t('competition')} ${t('uploads')}`
            : isProfitView
                ? t('Download profit')
                : isHistoryView
                    ? t('Download history')
                    : t('Downloads');
    const headerCount = isDashboardView
        ? dashboardCompetitions.length
        : isCompetitionList
            ? filteredCompetitions.length
            : isCompetitionMedia
                ? competitionMediaItems.length
                : isProfitView
                    ? profitList.length
                    : downloads.length;
    const renderHistoryItem = useCallback(({ item }) => {
        const media = item.media;
        const thumbCandidate = media.thumbnail_url || media.preview_url || media.original_url || null;
        const resolvedThumb = thumbCandidate ? toAbsoluteUrl(String(thumbCandidate)) : null;
        const thumb = withAccessToken(resolvedThumb) || resolvedThumb;
        return (_jsxs(TouchableOpacity, Object.assign({ style: Styles.card, activeOpacity: 0.85, onPress: () => {
                navigation.navigate('PhotoDetailScreen', {
                    eventTitle: eventNameById(media.event_id),
                    media: {
                        id: media.media_id,
                        eventId: media.event_id,
                        thumbnailUrl: media.thumbnail_url,
                        previewUrl: media.preview_url,
                        originalUrl: media.original_url,
                        fullUrl: media.full_url,
                        rawUrl: media.raw_url,
                        hlsManifestPath: media.hls_manifest_path,
                        type: media.type,
                    },
                });
            } }, { children: [thumb ? (_jsx(FastImage, { source: { uri: String(thumb) }, style: Styles.cardImage, resizeMode: "cover" })) : (_jsx(View, { style: [Styles.cardImage, { backgroundColor: colors.btnBackgroundColor }] })), _jsx(View, Object.assign({ style: Styles.cardMetaRow }, { children: _jsxs(Text, Object.assign({ style: Styles.cardMetaText }, { children: [media.type === 'video' ? t('Video') : t('Photo'), " \u2022 ", String(item.download.last_downloaded_at).slice(0, 10)] })) }))] })));
    }, [
        Styles.card,
        Styles.cardImage,
        Styles.cardMetaRow,
        Styles.cardMetaText,
        colors.btnBackgroundColor,
        eventNameById,
        navigation,
        t,
        toAbsoluteUrl,
        withAccessToken,
    ]);
    const renderProfitItem = useCallback(({ item }) => {
        const thumbCandidate = item.media.thumbnail_url || item.media.preview_url || item.media.original_url || item.media.full_url || item.media.raw_url || null;
        const resolvedThumb = thumbCandidate ? toAbsoluteUrl(String(thumbCandidate)) : null;
        const thumb = withAccessToken(resolvedThumb) || resolvedThumb;
        return (_jsx(TouchableOpacity, Object.assign({ style: Styles.profitCard, activeOpacity: 0.85, onPress: () => {
                var _a, _b, _c, _d, _e;
                if (item.media.type === 'video') {
                    navigation.navigate('VideoPlayingScreen', {
                        video: {
                            title: item.title,
                            media_id: item.media.media_id,
                            thumbnail: thumb ? { uri: String(thumb) } : undefined,
                            uri: (_d = (_c = (_b = (_a = item.media.preview_url) !== null && _a !== void 0 ? _a : item.media.original_url) !== null && _b !== void 0 ? _b : item.media.full_url) !== null && _c !== void 0 ? _c : item.media.raw_url) !== null && _d !== void 0 ? _d : '',
                        },
                    });
                }
                else {
                    navigation.navigate('PhotoDetailScreen', {
                        eventTitle: item.title,
                        media: {
                            id: item.media.media_id,
                            eventId: (_e = item.media.event_id) !== null && _e !== void 0 ? _e : null,
                            thumbnailUrl: item.media.thumbnail_url,
                            previewUrl: item.media.preview_url,
                            originalUrl: item.media.original_url,
                            fullUrl: item.media.full_url,
                            rawUrl: item.media.raw_url,
                            hlsManifestPath: item.media.hls_manifest_path,
                            type: item.media.type,
                        },
                    });
                }
            } }, { children: _jsxs(View, Object.assign({ style: Styles.profitTopRow }, { children: [thumb ? (_jsx(FastImage, { source: { uri: String(thumb) }, style: Styles.profitThumb, resizeMode: "cover" })) : (_jsx(View, { style: Styles.profitThumbPlaceholder })), _jsxs(View, Object.assign({ style: Styles.profitInfo }, { children: [_jsx(Text, Object.assign({ style: Styles.profitTitle }, { children: item.title })), _jsxs(View, Object.assign({ style: Styles.profitRow }, { children: [_jsxs(Text, Object.assign({ style: Styles.profitMeta }, { children: [item.downloads, " ", t('downloads')] })), _jsxs(Text, Object.assign({ style: Styles.profitMeta }, { children: [item.views.toLocaleString(), " ", t('views'), " \u2022 ", item.likes.toLocaleString(), " ", t('likes')] })), _jsx(Text, Object.assign({ style: Styles.profitAmount }, { children: formatMoney(item.profit_cents) }))] }))] }))] })) })));
    }, [
        Styles.profitAmount,
        Styles.profitCard,
        Styles.profitInfo,
        Styles.profitMeta,
        Styles.profitRow,
        Styles.profitThumb,
        Styles.profitThumbPlaceholder,
        Styles.profitTitle,
        Styles.profitTopRow,
        formatMoney,
        navigation,
        t,
        toAbsoluteUrl,
        withAccessToken,
    ]);
    const renderCompetitionItem = useCallback(({ item }) => {
        var _a, _b;
        return (_jsxs(TouchableOpacity, Object.assign({ style: Styles.competitionRow, activeOpacity: 0.85, onPress: () => {
                navigation.navigate('DownloadsDetailsScreen', {
                    mode: 'competition-media',
                    competition: item,
                });
            } }, { children: [_jsxs(View, Object.assign({ style: Styles.competitionRowInfo }, { children: [_jsx(Text, Object.assign({ style: Styles.competitionRowTitle }, { children: item.event_name || t('competition') })), _jsxs(Text, Object.assign({ style: Styles.competitionRowMeta }, { children: [Number((_a = item.uploads_count) !== null && _a !== void 0 ? _a : 0), " ", t('uploads'), " \u2022 ", formatEventDate(item.event_date)] })), _jsx(Text, Object.assign({ style: Styles.competitionRowMetaSecondary }, { children: (_b = item.event_location) !== null && _b !== void 0 ? _b : '' }))] })), _jsx(View, Object.assign({ style: Styles.competitionBadge }, { children: _jsx(Text, Object.assign({ style: Styles.competitionBadgeText }, { children: formatCompetitionType(item.event_type) })) }))] })));
    }, [
        Styles.competitionBadge,
        Styles.competitionBadgeText,
        Styles.competitionRow,
        Styles.competitionRowInfo,
        Styles.competitionRowMeta,
        Styles.competitionRowMetaSecondary,
        Styles.competitionRowTitle,
        formatCompetitionType,
        formatEventDate,
        navigation,
        t,
    ]);
    const renderCompetitionMediaItem = useCallback(({ item }) => {
        const thumbCandidate = item.thumbnail_url || item.preview_url || item.full_url || item.raw_url || null;
        const resolvedThumb = thumbCandidate ? toAbsoluteUrl(String(thumbCandidate)) : null;
        const thumb = withAccessToken(resolvedThumb) || resolvedThumb;
        return (_jsxs(TouchableOpacity, Object.assign({ style: Styles.mediaRow, activeOpacity: 0.85, onPress: () => {
                var _a, _b, _c, _d, _e, _f;
                if (item.type === 'video') {
                    navigation.navigate('VideoPlayingScreen', {
                        video: {
                            title: (selectedCompetition === null || selectedCompetition === void 0 ? void 0 : selectedCompetition.event_name) || t('competition'),
                            media_id: item.media_id,
                            thumbnail: thumb ? { uri: String(thumb) } : undefined,
                            uri: (_d = (_c = (_b = (_a = item.preview_url) !== null && _a !== void 0 ? _a : item.original_url) !== null && _b !== void 0 ? _b : item.full_url) !== null && _c !== void 0 ? _c : item.raw_url) !== null && _d !== void 0 ? _d : '',
                        },
                    });
                }
                else {
                    navigation.navigate('PhotoDetailScreen', {
                        eventTitle: (selectedCompetition === null || selectedCompetition === void 0 ? void 0 : selectedCompetition.event_name) || t('competition'),
                        media: {
                            id: item.media_id,
                            eventId: (_f = (_e = item.event_id) !== null && _e !== void 0 ? _e : selectedCompetition === null || selectedCompetition === void 0 ? void 0 : selectedCompetition.event_id) !== null && _f !== void 0 ? _f : null,
                            thumbnailUrl: item.thumbnail_url,
                            previewUrl: item.preview_url,
                            originalUrl: item.original_url,
                            fullUrl: item.full_url,
                            rawUrl: item.raw_url,
                            hlsManifestPath: item.hls_manifest_path,
                            type: item.type,
                        },
                    });
                }
            } }, { children: [thumb ? (_jsx(FastImage, { source: { uri: String(thumb) }, style: Styles.mediaThumb, resizeMode: "cover" })) : (_jsx(View, { style: Styles.mediaThumbPlaceholder })), _jsxs(View, Object.assign({ style: Styles.mediaInfo }, { children: [_jsx(Text, Object.assign({ style: Styles.mediaTitle }, { children: (selectedCompetition === null || selectedCompetition === void 0 ? void 0 : selectedCompetition.event_name) || t('competition') })), _jsx(Text, Object.assign({ style: Styles.mediaMeta }, { children: item.type === 'video' ? t('Video') : t('Photo') }))] }))] })));
    }, [
        Styles.mediaInfo,
        Styles.mediaMeta,
        Styles.mediaRow,
        Styles.mediaThumb,
        Styles.mediaThumbPlaceholder,
        Styles.mediaTitle,
        navigation,
        selectedCompetition === null || selectedCompetition === void 0 ? void 0 : selectedCompetition.event_name,
        selectedCompetition === null || selectedCompetition === void 0 ? void 0 : selectedCompetition.event_id,
        t,
        toAbsoluteUrl,
        withAccessToken,
    ]);
    const renderDashboardCompetition = useCallback((item) => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const metrics = (_b = (_a = item.metrics) === null || _a === void 0 ? void 0 : _a[selectedPeriod]) !== null && _b !== void 0 ? _b : { downloads: 0, views: 0, revenue_cents: 0 };
        const trend = (_d = (_c = item.trends) === null || _c === void 0 ? void 0 : _c[selectedPeriod]) !== null && _d !== void 0 ? _d : { direction: 'flat', delta_downloads: 0, delta_views: 0, delta_revenue_cents: 0 };
        const trendColor = trend.direction === 'up' ? '#24A148' : trend.direction === 'down' ? '#D93025' : colors.subTextColor;
        const cover = withAccessToken(toAbsoluteUrl(item.cover_thumbnail_url)) || toAbsoluteUrl(item.cover_thumbnail_url);
        const trendIcon = trend.direction === 'up'
            ? _jsx(ArrowUp2, { size: 16, color: trendColor, variant: "Linear" })
            : trend.direction === 'down'
                ? _jsx(ArrowDown2, { size: 16, color: trendColor, variant: "Linear" })
                : _jsx(View, { style: Styles.trendFlatDot });
        const trendLabel = selectedPeriod === 'all'
            ? t('Stable all-time performance')
            : trend.direction === 'up'
                ? t('Up versus the previous period')
                : trend.direction === 'down'
                    ? t('Down versus the previous period')
                    : t('Holding steady versus the previous period');
        return (_jsxs(View, Object.assign({ style: Styles.dashboardCompetitionCard }, { children: [_jsxs(View, Object.assign({ style: Styles.dashboardCompetitionTopRow }, { children: [cover ? (_jsx(FastImage, { source: { uri: String(cover) }, style: Styles.dashboardCompetitionThumb, resizeMode: "cover" })) : (_jsx(View, { style: Styles.dashboardCompetitionThumbPlaceholder })), _jsxs(View, Object.assign({ style: Styles.dashboardCompetitionInfo }, { children: [_jsx(Text, Object.assign({ style: Styles.dashboardCompetitionTitle }, { children: item.event_name || t('competition') })), _jsx(Text, Object.assign({ style: Styles.dashboardCompetitionMeta }, { children: [formatCompetitionType(item.event_type), formatEventDate(item.event_date), item.event_location]
                                        .filter((part) => String(part || '').trim().length > 0)
                                        .join(' • ') })), _jsxs(View, Object.assign({ style: Styles.trendRow }, { children: [trendIcon, _jsx(Text, Object.assign({ style: [Styles.trendText, { color: trendColor }] }, { children: trendLabel }))] }))] }))] })), _jsxs(View, Object.assign({ style: Styles.dashboardCompetitionStatsRow }, { children: [_jsxs(View, Object.assign({ style: Styles.dashboardMiniStat }, { children: [_jsx(Text, Object.assign({ style: Styles.dashboardMiniStatLabel }, { children: t('downloads') })), _jsx(Text, Object.assign({ style: Styles.dashboardMiniStatValue }, { children: Number((_e = metrics.downloads) !== null && _e !== void 0 ? _e : 0).toLocaleString() }))] })), _jsxs(View, Object.assign({ style: Styles.dashboardMiniStat }, { children: [_jsx(Text, Object.assign({ style: Styles.dashboardMiniStatLabel }, { children: t('views') })), _jsx(Text, Object.assign({ style: Styles.dashboardMiniStatValue }, { children: Number((_f = metrics.views) !== null && _f !== void 0 ? _f : 0).toLocaleString() }))] })), _jsxs(View, Object.assign({ style: Styles.dashboardMiniStat }, { children: [_jsx(Text, Object.assign({ style: Styles.dashboardMiniStatLabel }, { children: t('Revenue') })), _jsx(Text, Object.assign({ style: Styles.dashboardMiniStatValue }, { children: formatMoney((_g = metrics.revenue_cents) !== null && _g !== void 0 ? _g : 0) }))] }))] })), _jsxs(View, Object.assign({ style: Styles.dashboardCompetitionFooter }, { children: [_jsxs(Text, Object.assign({ style: Styles.dashboardCompetitionFootnote }, { children: [Number((_h = item.uploads_count) !== null && _h !== void 0 ? _h : 0), " ", t('uploads')] })), _jsxs(TouchableOpacity, Object.assign({ style: Styles.dashboardOpenButton, onPress: () => {
                                navigation.navigate('DownloadsDetailsScreen', {
                                    mode: 'competition-media',
                                    competition: {
                                        event_id: item.event_id,
                                        event_name: item.event_name,
                                        event_location: item.event_location,
                                        event_date: item.event_date,
                                        event_type: item.event_type,
                                        uploads_count: item.uploads_count,
                                        cover_thumbnail_url: item.cover_thumbnail_url,
                                    },
                                });
                            } }, { children: [_jsx(Text, Object.assign({ style: Styles.dashboardOpenButtonText }, { children: t('Open details') })), _jsx(ArrowRight, { size: 16, color: colors.primaryColor, variant: "Linear" })] }))] }))] }), item.event_id));
    }, [
        Styles.dashboardCompetitionCard,
        Styles.dashboardCompetitionFooter,
        Styles.dashboardCompetitionFootnote,
        Styles.dashboardCompetitionInfo,
        Styles.dashboardCompetitionMeta,
        Styles.dashboardCompetitionThumb,
        Styles.dashboardCompetitionThumbPlaceholder,
        Styles.dashboardCompetitionTitle,
        Styles.dashboardCompetitionTopRow,
        Styles.dashboardMiniStat,
        Styles.dashboardMiniStatLabel,
        Styles.dashboardMiniStatValue,
        Styles.dashboardCompetitionStatsRow,
        Styles.dashboardOpenButton,
        Styles.dashboardOpenButtonText,
        Styles.trendFlatDot,
        Styles.trendRow,
        Styles.trendText,
        colors.primaryColor,
        colors.subTextColor,
        formatCompetitionType,
        formatEventDate,
        formatMoney,
        navigation,
        selectedPeriod,
        t,
        toAbsoluteUrl,
        withAccessToken,
    ]);
    const dashboardRefreshControl = useMemo(() => _jsx(RefreshControl, { refreshing: isLoading, onRefresh: loadDashboard, tintColor: colors.primaryColor }), [colors.primaryColor, isLoading, loadDashboard]);
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: headerTitle })), _jsx(View, Object.assign({ style: Styles.headerCountBadge }, { children: _jsx(Text, Object.assign({ style: Styles.headerCountText }, { children: String(headerCount) })) }))] })), isDashboardView && (_jsxs(ScrollView, Object.assign({ contentContainerStyle: [Styles.dashboardContent, { paddingBottom: insets.bottom > 0 ? insets.bottom + 24 : 40 }], refreshControl: dashboardRefreshControl, showsVerticalScrollIndicator: false }, { children: [_jsxs(View, Object.assign({ style: Styles.dashboardHero }, { children: [_jsx(Text, Object.assign({ style: Styles.dashboardEyebrow }, { children: t('Revenue dashboard') })), _jsx(Text, Object.assign({ style: Styles.dashboardTitle }, { children: t('Downloads, views, and revenue') })), _jsx(Text, Object.assign({ style: Styles.dashboardSubtitle }, { children: t('Track what is performing now, then open a competition to inspect the media behind it.') }))] })), _jsx(View, Object.assign({ style: Styles.periodToggleRow }, { children: PERIOD_OPTIONS.map((option) => {
                            const isActive = option.key === selectedPeriod;
                            return (_jsx(TouchableOpacity, Object.assign({ style: [Styles.periodToggle, isActive && Styles.periodToggleActive], onPress: () => setSelectedPeriod(option.key) }, { children: _jsx(Text, Object.assign({ style: [Styles.periodToggleText, isActive && Styles.periodToggleTextActive] }, { children: t(option.label) })) }), option.key));
                        }) })), _jsxs(View, Object.assign({ style: Styles.kpiGrid }, { children: [_jsxs(View, Object.assign({ style: Styles.kpiCard }, { children: [_jsx(Text, Object.assign({ style: Styles.kpiLabel }, { children: t('Downloads') })), _jsx(Text, Object.assign({ style: Styles.kpiValue }, { children: formatMetricValue('downloads', selectedDashboardMetrics) }))] })), _jsxs(View, Object.assign({ style: Styles.kpiCard }, { children: [_jsx(Text, Object.assign({ style: Styles.kpiLabel }, { children: t('Views') })), _jsx(Text, Object.assign({ style: Styles.kpiValue }, { children: formatMetricValue('views', selectedDashboardMetrics) }))] })), _jsxs(View, Object.assign({ style: Styles.kpiCard }, { children: [_jsx(Text, Object.assign({ style: Styles.kpiLabel }, { children: t('Revenue') })), _jsx(Text, Object.assign({ style: Styles.kpiValue }, { children: formatMetricValue('revenue', selectedDashboardMetrics) }))] }))] })), _jsxs(View, Object.assign({ style: Styles.dashboardQuickLinks }, { children: [_jsxs(TouchableOpacity, Object.assign({ style: Styles.dashboardQuickLink, onPress: () => navigation.navigate('DownloadsDetailsScreen', { mode: 'profit' }) }, { children: [_jsx(Text, Object.assign({ style: Styles.dashboardQuickLinkTitle }, { children: t('Top media') })), _jsx(Text, Object.assign({ style: Styles.dashboardQuickLinkSubtitle }, { children: t('See which uploads convert best') }))] })), _jsxs(TouchableOpacity, Object.assign({ style: Styles.dashboardQuickLink, onPress: () => navigation.navigate('DownloadsDetailsScreen', { mode: 'history' }) }, { children: [_jsx(Text, Object.assign({ style: Styles.dashboardQuickLinkTitle }, { children: t('Download history') })), _jsx(Text, Object.assign({ style: Styles.dashboardQuickLinkSubtitle }, { children: t('Review every purchased photo or video') }))] }))] })), _jsxs(View, Object.assign({ style: Styles.listHeader }, { children: [_jsx(Text, Object.assign({ style: Styles.sectionTitle }, { children: t('Competition performance') })), _jsx(View, Object.assign({ style: Styles.searchBar }, { children: _jsx(TextInput, { style: Styles.searchInput, placeholder: t('Search competition'), placeholderTextColor: colors.grayColor, value: competitionSearch, onChangeText: setCompetitionSearch }) }))] })), errorText ? _jsx(Text, Object.assign({ style: Styles.errorText }, { children: errorText })) : null, !isLoading && dashboardCompetitions.length === 0 ? (_jsx(Text, Object.assign({ style: Styles.emptyText }, { children: t('No uploaded competitions found yet.') }))) : null, dashboardCompetitions.map(renderDashboardCompetition)] }))), isCompetitionList && (_jsx(FlatList, { data: filteredCompetitions, keyExtractor: (item) => String(item.event_id), contentContainerStyle: [Styles.listContent, { paddingBottom: insets.bottom > 0 ? insets.bottom + 20 : 40 }], ListHeaderComponent: _jsxs(View, Object.assign({ style: Styles.listHeader }, { children: [_jsx(Text, Object.assign({ style: Styles.sectionTitle }, { children: t('Competitions') })), _jsx(View, Object.assign({ style: Styles.searchBar }, { children: _jsx(TextInput, { style: Styles.searchInput, placeholder: t('Search competition'), placeholderTextColor: colors.grayColor, value: competitionSearch, onChangeText: setCompetitionSearch }) }))] })), ListEmptyComponent: _jsx(Text, Object.assign({ style: Styles.emptyText }, { children: t('No competitions found.') })), refreshControl: _jsx(RefreshControl, { refreshing: isLoading, onRefresh: loadCompetitions, tintColor: colors.primaryColor }), renderItem: renderCompetitionItem })), isCompetitionMedia && (_jsx(FlatList, { data: competitionMediaItems, keyExtractor: (item) => String(item.media_id), contentContainerStyle: [Styles.listContent, { paddingBottom: insets.bottom > 0 ? insets.bottom + 20 : 40 }], ListHeaderComponent: _jsx(Text, Object.assign({ style: Styles.sectionTitle }, { children: t('Your uploads') })), ListEmptyComponent: _jsx(Text, Object.assign({ style: Styles.emptyText }, { children: t('No uploads yet.') })), refreshControl: _jsx(RefreshControl, { refreshing: isLoading, onRefresh: () => { var _a, _b, _c; return loadCompetitionMedia((_c = (_a = selectedCompetition === null || selectedCompetition === void 0 ? void 0 : selectedCompetition.event_id) !== null && _a !== void 0 ? _a : (_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.competitionId) !== null && _c !== void 0 ? _c : null, { offset: 0, append: false }); }, tintColor: colors.primaryColor }), onEndReachedThreshold: 0.35, onEndReached: () => {
                    var _a, _b, _c;
                    if (isLoading || isCompetitionMediaLoadingMore || !hasMoreCompetitionMedia)
                        return;
                    loadCompetitionMedia((_c = (_a = selectedCompetition === null || selectedCompetition === void 0 ? void 0 : selectedCompetition.event_id) !== null && _a !== void 0 ? _a : (_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.competitionId) !== null && _c !== void 0 ? _c : null, {
                        offset: competitionMediaItems.length,
                        append: true,
                    });
                }, ListFooterComponent: isCompetitionMediaLoadingMore ? (_jsx(View, Object.assign({ style: { paddingVertical: 16 } }, { children: _jsx(ActivityIndicator, { color: colors.primaryColor }) }))) : null, renderItem: renderCompetitionMediaItem })), isProfitView && (_jsx(FlatList, { data: profitList, keyExtractor: (item) => String(item.id), contentContainerStyle: [Styles.listContent, { paddingBottom: insets.bottom > 0 ? insets.bottom + 20 : 40 }], ListEmptyComponent: _jsx(Text, Object.assign({ style: Styles.emptyText }, { children: t('No uploads yet.') })), refreshControl: _jsx(RefreshControl, { refreshing: isLoading, onRefresh: loadProfit, tintColor: colors.primaryColor }), renderItem: renderProfitItem })), isHistoryView && (_jsx(FlatList, { data: downloads, keyExtractor: (item) => String(item.download.download_id), numColumns: 2, columnWrapperStyle: Styles.gridRow, contentContainerStyle: [Styles.listContent, { paddingBottom: insets.bottom > 0 ? insets.bottom + 20 : 40 }], ListHeaderComponent: _jsx(View, { children: tutorialMode && (_jsxs(View, Object.assign({ style: Styles.tutorialCard }, { children: [_jsx(Text, Object.assign({ style: Styles.tutorialTitle }, { children: tutorialStep === 'download-demo' ? t('Tutorial: Download demo photo') : t('Tutorial: My downloads') })), _jsx(Text, Object.assign({ style: Styles.tutorialBody }, { children: tutorialStep === 'download-demo'
                                    ? t('Tap the button below to download the demo photo. Then continue to see where your downloaded files appear.')
                                    : t('All photos and videos you download are listed here. You can always come back to this screen from Home.') })), _jsx(FastImage, { source: { uri: tutorialPhotoUrl }, style: Styles.tutorialImage }), tutorialStep === 'download-demo' ? (_jsx(TouchableOpacity, Object.assign({ style: Styles.tutorialPrimaryButton, onPress: () => setTutorialDemoDownloaded(true) }, { children: _jsx(Text, Object.assign({ style: Styles.tutorialPrimaryButtonText }, { children: tutorialDemoDownloaded ? t('Downloaded') : t('Download demo') })) }))) : null] }))) }), ListEmptyComponent: _jsx(Text, Object.assign({ style: Styles.emptyText }, { children: t('No downloads yet.') })), refreshControl: _jsx(RefreshControl, { refreshing: isLoading, onRefresh: loadDownloads, tintColor: colors.primaryColor }), renderItem: renderHistoryItem })), isLoading && !isDashboardView && !downloads.length && !profitList.length && !filteredCompetitions.length && !competitionMediaItems.length ? (_jsx(View, Object.assign({ style: Styles.loadingOverlay }, { children: _jsx(ActivityIndicator, { color: colors.primaryColor }) }))) : null] })));
};
export default DownloadsDetailsScreen;
