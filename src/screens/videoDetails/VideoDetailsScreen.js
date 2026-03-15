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
import { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { ArrowLeft2, Calendar, Location, Clock, TickCircle, Refresh, } from 'iconsax-react-nativejs';
import { createStyles } from './VideoDetailsScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Icons from '../../constants/Icons';
import Images from '../../constants/Images';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../../context/AuthContext';
import { deleteMedia, deletePost, getMediaById, getMediaIssueRequests, getMyMediaIssueRequests, updateMedia, updateMediaIssueRequest } from '../../services/apiGateway';
import { getApiBaseUrl, getHlsBaseUrl } from '../../constants/RuntimeConfig';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const VideoDetailsScreen = ({ navigation, route }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
    const insets = useSafeAreaInsets();
    const { apiAccessToken } = useAuth();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    const [showManageModal, setShowManageModal] = useState(false);
    const [uploadFileName, setUploadFileName] = useState(null);
    const [requestsExpanded, setRequestsExpanded] = useState(false);
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [wontFixReason, setWontFixReason] = useState('');
    const [statusChoice, setStatusChoice] = useState('fixed');
    const [mediaType, setMediaType] = useState(String(((_b = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.video) === null || _b === void 0 ? void 0 : _b.type) || '').toLowerCase() === 'video' ? 'video' : 'image');
    const [issueRequests, setIssueRequests] = useState([]);
    const [isSavingStatus, setIsSavingStatus] = useState(false);
    const [eventIdDraft, setEventIdDraft] = useState(String(((_d = (_c = route === null || route === void 0 ? void 0 : route.params) === null || _c === void 0 ? void 0 : _c.video) === null || _d === void 0 ? void 0 : _d.event_id) || '').trim());
    const [titleDraft, setTitleDraft] = useState(String(((_f = (_e = route === null || route === void 0 ? void 0 : route.params) === null || _e === void 0 ? void 0 : _e.video) === null || _f === void 0 ? void 0 : _f.title) || '').trim());
    const eventIdDraftRef = useRef(String(((_h = (_g = route === null || route === void 0 ? void 0 : route.params) === null || _g === void 0 ? void 0 : _g.video) === null || _h === void 0 ? void 0 : _h.event_id) || '').trim());
    const titleDraftRef = useRef(String(((_k = (_j = route === null || route === void 0 ? void 0 : route.params) === null || _j === void 0 ? void 0 : _j.video) === null || _k === void 0 ? void 0 : _k.title) || '').trim());
    const routeVideo = (_l = route === null || route === void 0 ? void 0 : route.params) === null || _l === void 0 ? void 0 : _l.video;
    const mediaId = String(((_m = route === null || route === void 0 ? void 0 : route.params) === null || _m === void 0 ? void 0 : _m.mediaId) || (routeVideo === null || routeVideo === void 0 ? void 0 : routeVideo.media_id) || '').trim();
    const routePostId = String(((_p = (_o = route === null || route === void 0 ? void 0 : route.params) === null || _o === void 0 ? void 0 : _o.video) === null || _p === void 0 ? void 0 : _p.post_id) || ((_q = route === null || route === void 0 ? void 0 : route.params) === null || _q === void 0 ? void 0 : _q.postId) || '').trim();
    const detailsTitle = mediaType === 'video' ? t('Video details') : t('Photo details');
    const [videoData, setVideoData] = useState({
        title: (_r = routeVideo === null || routeVideo === void 0 ? void 0 : routeVideo.title) !== null && _r !== void 0 ? _r : 'BK Studentent 23',
        location: (_s = routeVideo === null || routeVideo === void 0 ? void 0 : routeVideo.location) !== null && _s !== void 0 ? _s : 'Berlin, Germany',
        duration: (_t = routeVideo === null || routeVideo === void 0 ? void 0 : routeVideo.duration) !== null && _t !== void 0 ? _t : '2 Minutes',
        date: (_u = routeVideo === null || routeVideo === void 0 ? void 0 : routeVideo.date) !== null && _u !== void 0 ? _u : '27/05/2025',
        videoUri: (_v = routeVideo === null || routeVideo === void 0 ? void 0 : routeVideo.uri) !== null && _v !== void 0 ? _v : '',
        thumbnail: (_w = routeVideo === null || routeVideo === void 0 ? void 0 : routeVideo.thumbnail) !== null && _w !== void 0 ? _w : Images.photo7,
    });
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
    const toHlsUrl = useCallback((value) => {
        if (!value)
            return null;
        const raw = String(value);
        if (raw.startsWith('http://') || raw.startsWith('https://'))
            return raw;
        const base = getHlsBaseUrl();
        if (!base)
            return raw;
        return `${base.replace(/\/$/, '')}/${raw.replace(/^\//, '')}`;
    }, []);
    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken)
            return () => { };
        getMediaById(apiAccessToken, mediaId)
            .then((media) => {
            if (!mounted)
                return;
            const hls = media.hls_manifest_path ? toHlsUrl(media.hls_manifest_path) : null;
            setMediaType(String((media === null || media === void 0 ? void 0 : media.type) || (routeVideo === null || routeVideo === void 0 ? void 0 : routeVideo.type) || 'image').toLowerCase() === 'video' ? 'video' : 'image');
            const nextEventIdDraft = String((media === null || media === void 0 ? void 0 : media.event_id) || (routeVideo === null || routeVideo === void 0 ? void 0 : routeVideo.event_id) || '').trim();
            const nextTitleDraft = String((media === null || media === void 0 ? void 0 : media.title) || (routeVideo === null || routeVideo === void 0 ? void 0 : routeVideo.title) || '').trim();
            eventIdDraftRef.current = nextEventIdDraft;
            titleDraftRef.current = nextTitleDraft;
            setEventIdDraft(nextEventIdDraft);
            setTitleDraft(nextTitleDraft);
            const candidates = [
                media.preview_url,
                media.original_url,
                media.full_url,
                media.raw_url,
            ]
                .filter(Boolean)
                .map((value) => toAbsoluteUrl(String(value)) || '')
                .filter(Boolean);
            const mp4 = candidates.find((value) => /\.(mp4|mov|m4v)(\?|$)/i.test(value));
            const resolvedVideo = hls || mp4 || candidates[0] || '';
            const thumbCandidate = media.thumbnail_url || media.preview_url || media.full_url || media.raw_url || null;
            const resolvedPoster = thumbCandidate ? toAbsoluteUrl(String(thumbCandidate)) : null;
            setVideoData((prev) => (Object.assign(Object.assign({}, prev), { title: String((media === null || media === void 0 ? void 0 : media.title) || prev.title || '').trim() || prev.title, videoUri: withAccessToken(resolvedVideo) || resolvedVideo, thumbnail: resolvedPoster ? { uri: withAccessToken(resolvedPoster) || resolvedPoster } : prev.thumbnail })));
        })
            .catch(() => { });
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, mediaId, routeVideo === null || routeVideo === void 0 ? void 0 : routeVideo.event_id, routeVideo === null || routeVideo === void 0 ? void 0 : routeVideo.type, toAbsoluteUrl, toHlsUrl, withAccessToken]);
    const loadIssueRequests = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _x, _y;
        if (!apiAccessToken || !mediaId) {
            setIssueRequests([]);
            return;
        }
        const normalizeRow = (raw) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2;
            const rawIssueType = String((_c = (_b = (_a = raw === null || raw === void 0 ? void 0 : raw.issue_type) !== null && _a !== void 0 ? _a : raw === null || raw === void 0 ? void 0 : raw.issueType) !== null && _b !== void 0 ? _b : raw === null || raw === void 0 ? void 0 : raw.type) !== null && _c !== void 0 ? _c : '').toLowerCase();
            const rawStatus = String((_d = raw === null || raw === void 0 ? void 0 : raw.status) !== null && _d !== void 0 ? _d : '').toLowerCase();
            const createdAt = String((_f = (_e = raw === null || raw === void 0 ? void 0 : raw.created_at) !== null && _e !== void 0 ? _e : raw === null || raw === void 0 ? void 0 : raw.createdAt) !== null && _f !== void 0 ? _f : '');
            return {
                id: String((_j = (_h = (_g = raw === null || raw === void 0 ? void 0 : raw.request_id) !== null && _g !== void 0 ? _g : raw === null || raw === void 0 ? void 0 : raw.requestId) !== null && _h !== void 0 ? _h : raw === null || raw === void 0 ? void 0 : raw.id) !== null && _j !== void 0 ? _j : ''),
                mediaId: String((_u = (_s = (_q = (_p = (_o = (_m = (_l = (_k = raw === null || raw === void 0 ? void 0 : raw.media_id) !== null && _k !== void 0 ? _k : raw === null || raw === void 0 ? void 0 : raw.mediaId) !== null && _l !== void 0 ? _l : raw === null || raw === void 0 ? void 0 : raw.target_media_id) !== null && _m !== void 0 ? _m : raw === null || raw === void 0 ? void 0 : raw.targetMediaId) !== null && _o !== void 0 ? _o : raw === null || raw === void 0 ? void 0 : raw.asset_media_id) !== null && _p !== void 0 ? _p : raw === null || raw === void 0 ? void 0 : raw.assetMediaId) !== null && _q !== void 0 ? _q : (_r = raw === null || raw === void 0 ? void 0 : raw.media) === null || _r === void 0 ? void 0 : _r.media_id) !== null && _s !== void 0 ? _s : (_t = raw === null || raw === void 0 ? void 0 : raw.media) === null || _t === void 0 ? void 0 : _t.id) !== null && _u !== void 0 ? _u : ''),
                postId: String((_y = (_w = (_v = raw === null || raw === void 0 ? void 0 : raw.post_id) !== null && _v !== void 0 ? _v : raw === null || raw === void 0 ? void 0 : raw.postId) !== null && _w !== void 0 ? _w : (_x = raw === null || raw === void 0 ? void 0 : raw.post) === null || _x === void 0 ? void 0 : _x.id) !== null && _y !== void 0 ? _y : ''),
                title: rawIssueType === 'wrong_competition'
                    ? t('Wrong competition')
                    : rawIssueType === 'wrong_heat'
                        ? t('Wrong heat')
                        : t('Custom request'),
                date: createdAt.slice(0, 10),
                time: createdAt.slice(11, 16),
                status: rawStatus === 'resolved' ? 'fixed' : (rawStatus === 'wont_fix' ? 'wont_fix' : 'pending'),
                reason: String((_0 = (_z = raw === null || raw === void 0 ? void 0 : raw.resolution_reason) !== null && _z !== void 0 ? _z : raw === null || raw === void 0 ? void 0 : raw.resolutionReason) !== null && _0 !== void 0 ? _0 : ''),
                custom: String((_2 = (_1 = raw === null || raw === void 0 ? void 0 : raw.custom_text) !== null && _1 !== void 0 ? _1 : raw === null || raw === void 0 ? void 0 : raw.customText) !== null && _2 !== void 0 ? _2 : ''),
            };
        };
        try {
            const [hubResult, mediaResult] = yield Promise.allSettled([
                getMyMediaIssueRequests(apiAccessToken, { limit: 100, offset: 0 }),
                getMediaIssueRequests(apiAccessToken, mediaId, { limit: 100, offset: 0 }),
            ]);
            const hubRows = hubResult.status === 'fulfilled' && Array.isArray((_x = hubResult.value) === null || _x === void 0 ? void 0 : _x.requests)
                ? hubResult.value.requests
                : [];
            const mediaRows = mediaResult.status === 'fulfilled' && Array.isArray((_y = mediaResult.value) === null || _y === void 0 ? void 0 : _y.requests)
                ? mediaResult.value.requests
                : [];
            const allRows = [...hubRows, ...mediaRows];
            const normalized = allRows
                .map(normalizeRow)
                .filter((row) => row.id.length > 0)
                .filter((row) => {
                if (row.mediaId)
                    return row.mediaId === mediaId;
                if (routePostId && row.postId)
                    return row.postId === routePostId;
                return true;
            });
            const deduped = Array.from(normalized.reduce((map, row) => {
                if (!map.has(row.id))
                    map.set(row.id, row);
                return map;
            }, new Map())).map(([, row]) => row);
            setIssueRequests(deduped);
        }
        catch (_z) {
            setIssueRequests([]);
        }
    }), [apiAccessToken, mediaId, routePostId, t]);
    useEffect(() => {
        loadIssueRequests().catch(() => { });
    }, [loadIssueRequests]);
    useEffect(() => {
        var _a;
        const unsubscribe = (_a = navigation.addListener) === null || _a === void 0 ? void 0 : _a.call(navigation, 'focus', () => {
            loadIssueRequests().catch(() => { });
        });
        return () => {
            if (typeof unsubscribe === 'function')
                unsubscribe();
        };
    }, [loadIssueRequests, navigation]);
    const visibleRequests = requestsExpanded ? issueRequests : issueRequests.slice(0, 2);
    const canLoadMore = issueRequests.length > 2 && !requestsExpanded;
    const handleVideoPress = () => {
        var _a;
        if (mediaType === 'video') {
            navigation.navigate('VideoPlayingScreen', {
                video: {
                    title: videoData.title,
                    thumbnail: videoData.thumbnail,
                    uri: videoData.videoUri,
                    media_id: mediaId,
                },
            });
            return;
        }
        navigation.navigate('PhotoDetailScreen', {
            media: {
                id: mediaId,
                eventId: eventIdDraft || null,
                thumbnailUrl: ((_a = videoData.thumbnail) === null || _a === void 0 ? void 0 : _a.uri) || null,
                previewUrl: videoData.videoUri || null,
                originalUrl: videoData.videoUri || null,
                type: 'image',
            },
            eventTitle: videoData.title,
        });
    };
    const handlePickVideo = () => __awaiter(void 0, void 0, void 0, function* () {
        var _0;
        const result = yield launchImageLibrary({
            mediaType: 'video',
            selectionLimit: 1,
            presentationStyle: 'fullScreen',
            assetRepresentationMode: 'current',
        });
        const asset = (_0 = result.assets) === null || _0 === void 0 ? void 0 : _0[0];
        if (asset) {
            setUploadFileName(asset.fileName || asset.uri || 'new_upload.mp4');
        }
    });
    const openStatusModal = (item) => {
        var _a;
        setSelectedRequest(item);
        setWontFixReason((_a = item.reason) !== null && _a !== void 0 ? _a : '');
        setStatusChoice(item.status === 'wont_fix' ? 'wont_fix' : 'fixed');
        setStatusModalVisible(true);
    };
    const applyStatusChange = () => {
        const status = statusChoice;
        if (!selectedRequest)
            return;
        if (status === 'wont_fix' && !wontFixReason.trim()) {
            return;
        }
        if (!apiAccessToken || !mediaId)
            return;
        setIsSavingStatus(true);
        updateMediaIssueRequest(apiAccessToken, mediaId, String(selectedRequest.id), {
            status: status === 'fixed' ? 'resolved' : 'wont_fix',
            resolution_reason: status === 'wont_fix' ? wontFixReason.trim() : '',
        })
            .then(() => {
            setIssueRequests((prev) => prev.map((req) => req.id === selectedRequest.id
                ? Object.assign(Object.assign({}, req), { status, reason: status === 'wont_fix' ? wontFixReason.trim() : '' }) : req));
            setStatusModalVisible(false);
            loadIssueRequests().catch(() => { });
        })
            .finally(() => setIsSavingStatus(false));
    };
    const saveMediaEventChange = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _1;
        if (!apiAccessToken || !mediaId)
            return;
        try {
            const nextEventIdDraft = eventIdDraftRef.current.trim();
            const nextTitleDraft = titleDraftRef.current.trim();
            const payload = Object.assign({ event_id: nextEventIdDraft || null }, (mediaType === 'video' ? { title: nextTitleDraft || null } : {}));
            const updated = yield updateMedia(apiAccessToken, mediaId, payload);
            const nextTitle = String(((_1 = updated === null || updated === void 0 ? void 0 : updated.media) === null || _1 === void 0 ? void 0 : _1.title) || nextTitleDraft || videoData.title || '').trim();
            setVideoData((prev) => (Object.assign(Object.assign({}, prev), { title: nextTitle || prev.title })));
            titleDraftRef.current = nextTitle;
            setTitleDraft(nextTitle);
            setShowManageModal(false);
        }
        catch (_2) { }
    }), [apiAccessToken, mediaId, mediaType, videoData.title]);
    const handleDeleteMedia = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        if (!apiAccessToken || !mediaId)
            return;
        try {
            yield deleteMedia(apiAccessToken, mediaId);
            setShowManageModal(false);
            navigation.goBack();
        }
        catch (_3) { }
    }), [apiAccessToken, mediaId, navigation]);
    const openBlogSettings = useCallback(() => {
        if (!routePostId)
            return;
        setShowManageModal(false);
        navigation.navigate('ProfileBlogEditorScreen', { mode: 'edit', postId: routePostId });
    }, [navigation, routePostId]);
    const handleDeleteBlog = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        if (!apiAccessToken || !routePostId)
            return;
        try {
            yield deletePost(apiAccessToken, routePostId);
            setShowManageModal(false);
            navigation.goBack();
        }
        catch (_4) { }
    }), [apiAccessToken, navigation, routePostId]);
    const renderEditRequestCard = (item) => (_jsxs(TouchableOpacity, Object.assign({ style: Styles.editRequestCard, onPress: () => openStatusModal(item), activeOpacity: 0.8, testID: `video-details-edit-request-${item.id}` }, { children: [_jsx(View, Object.assign({ style: Styles.editRequestHeader }, { children: _jsx(View, Object.assign({ style: Styles.receiptIconContainer }, { children: _jsx(Icons.ReceiptEdit, { height: 22, width: 22 }) })) })), _jsxs(View, Object.assign({ style: Styles.editRequestContent }, { children: [_jsx(Text, Object.assign({ style: Styles.editRequestTitle }, { children: item.title })), _jsxs(View, Object.assign({ style: Styles.editRequestMeta }, { children: [_jsxs(View, Object.assign({ style: Styles.metaItem }, { children: [_jsx(Calendar, { size: 12, color: "#9B9F9F", variant: "Linear" }), _jsx(Text, Object.assign({ style: Styles.metaText }, { children: item.date }))] })), _jsxs(View, Object.assign({ style: Styles.metaItem }, { children: [_jsx(Clock, { size: 12, color: "#9B9F9F", variant: "Linear" }), _jsx(Text, Object.assign({ style: Styles.metaText }, { children: item.time }))] }))] }))] })), item.status === 'fixed' ? (_jsxs(View, Object.assign({ style: Styles.fixedBadge }, { children: [_jsx(Text, Object.assign({ style: Styles.fixedBadgeText }, { children: t('Fixed') })), _jsx(TickCircle, { size: 14, color: "#00BD48", variant: "Linear" })] }))) : item.status === 'wont_fix' ? (_jsxs(View, Object.assign({ style: Styles.wontFixBadge }, { children: [_jsx(Text, Object.assign({ style: Styles.wontFixBadgeText }, { children: t("Won't fix") })), _jsx(Refresh, { size: 14, color: "#FF3B30", variant: "Linear" })] }))) : (_jsxs(View, Object.assign({ style: Styles.pendingBadge }, { children: [_jsx(Text, Object.assign({ style: Styles.pendingBadgeText }, { children: t('Pending') })), _jsx(Refresh, { size: 14, color: "#FF8000", variant: "Linear" })] })))] }), item.id));
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer, testID: "video-details-screen" }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.backButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 20, color: colors.mainTextColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: detailsTitle })), _jsx(View, { style: { width: 44, height: 44 } })] })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, contentContainerStyle: Styles.scrollContent }, { children: [_jsxs(TouchableOpacity, Object.assign({ style: Styles.videoContainer, onPress: handleVideoPress, activeOpacity: 0.9 }, { children: [_jsx(FastImage, { source: videoData.thumbnail, style: Styles.videoPlayer, resizeMode: "cover" }), mediaType === 'video' ? (_jsx(View, Object.assign({ style: Styles.playButtonOverlay }, { children: _jsx(Icons.PlayCricle, { height: 34, width: 34 }) }))) : null] })), _jsxs(View, Object.assign({ style: Styles.videoInfo }, { children: [_jsxs(View, Object.assign({ style: Styles.videoInfoRow }, { children: [_jsx(Text, Object.assign({ style: Styles.videoTitle }, { children: videoData.title })), _jsxs(View, Object.assign({ style: Styles.locationContainer }, { children: [_jsx(Location, { size: 16, color: "#9B9F9F", variant: "Linear" }), _jsx(Text, Object.assign({ style: Styles.locationText }, { children: videoData.location }))] }))] })), _jsxs(View, Object.assign({ style: Styles.videoInfoRow }, { children: [_jsxs(View, Object.assign({ style: Styles.durationContainer }, { children: [_jsx(Clock, { size: 16, color: "#9B9F9F", variant: "Linear" }), _jsx(Text, Object.assign({ style: Styles.durationText }, { children: videoData.duration }))] })), _jsxs(View, Object.assign({ style: Styles.dateContainer }, { children: [_jsx(Calendar, { size: 16, color: "#9B9F9F", variant: "Linear" }), _jsx(Text, Object.assign({ style: Styles.dateText }, { children: videoData.date }))] }))] }))] })), _jsx(Text, Object.assign({ style: Styles.sectionTitle }, { children: t('Request for edits') })), _jsx(SizeBox, { height: 16 }), issueRequests.length === 0 ? (_jsxs(View, Object.assign({ style: Styles.emptyStateContainer }, { children: [_jsx(Icons.FileEmptyColorful, { height: 120, width: 120 }), _jsx(SizeBox, { height: 12 }), _jsx(Text, Object.assign({ style: Styles.emptyStateText }, { children: t('No edit request found') }))] }))) : (_jsxs(_Fragment, { children: [_jsx(View, Object.assign({ style: Styles.receivedLabel }, { children: _jsx(Text, Object.assign({ style: Styles.receivedText }, { children: t('Received') })) })), _jsx(SizeBox, { height: 16 }), _jsx(View, Object.assign({ style: Styles.editRequestsGrid }, { children: _jsx(View, Object.assign({ style: Styles.editRequestsRow }, { children: visibleRequests.map(renderEditRequestCard) })) })), canLoadMore && (_jsx(TouchableOpacity, Object.assign({ style: Styles.loadMoreButton, onPress: () => setRequestsExpanded(true) }, { children: _jsx(Text, Object.assign({ style: Styles.loadMoreText }, { children: t('Load more') })) })))] })), _jsx(SizeBox, { height: 24 }), _jsx(TouchableOpacity, Object.assign({ style: Styles.primaryButton, onPress: () => setShowManageModal(true), testID: "video-details-manage-upload-button" }, { children: _jsx(Text, Object.assign({ style: Styles.primaryButtonText }, { children: t('Manage upload') })) })), _jsx(SizeBox, { height: 20 })] })), _jsx(Modal, Object.assign({ visible: showManageModal, transparent: true, animationType: "fade", onRequestClose: () => setShowManageModal(false) }, { children: _jsx(View, Object.assign({ style: Styles.modalBackdrop }, { children: _jsxs(View, Object.assign({ style: Styles.modalCard, testID: "video-details-manage-modal" }, { children: [_jsx(Text, Object.assign({ style: Styles.modalTitle }, { children: t('Edit upload') })), _jsx(Text, Object.assign({ style: Styles.modalSubtitle }, { children: t('Update your media details.') })), routePostId ? (_jsxs(_Fragment, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.modalUploadButton, onPress: openBlogSettings }, { children: _jsx(Text, Object.assign({ style: Styles.modalUploadText }, { children: t('Edit blog settings') })) })), _jsx(SizeBox, { height: 10 }), _jsx(TouchableOpacity, Object.assign({ style: [Styles.modalUploadButton, { backgroundColor: '#FFE9E9', borderColor: '#FFB3B3' }], onPress: handleDeleteBlog }, { children: _jsx(Text, Object.assign({ style: [Styles.modalUploadText, { color: '#B00020' }] }, { children: t('Delete blog') })) }))] })) : (_jsxs(_Fragment, { children: [mediaType === 'video' ? (_jsxs(_Fragment, { children: [_jsx(Text, Object.assign({ style: Styles.modalLabel }, { children: t('Reupload video') })), _jsx(TouchableOpacity, Object.assign({ style: Styles.modalUploadButton, onPress: handlePickVideo }, { children: _jsx(Text, Object.assign({ style: Styles.modalUploadText }, { children: t('Choose file') })) })), uploadFileName ? (_jsxs(Text, Object.assign({ style: Styles.modalFileName }, { children: [t('Selected:'), " ", uploadFileName] }))) : null, _jsx(Text, Object.assign({ style: Styles.modalLabel }, { children: t('Title') })), _jsx(TextInput, { testID: "video-details-title-input", style: Styles.modalInput, value: titleDraft, onChangeText: (value) => {
                                                    titleDraftRef.current = value;
                                                    setTitleDraft(value);
                                                }, placeholder: t('video title'), placeholderTextColor: "#9B9F9F" })] })) : null, _jsxs(View, Object.assign({ style: Styles.modalButtonRow }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.modalCancelButton, onPress: () => setShowManageModal(false) }, { children: _jsx(Text, Object.assign({ style: Styles.modalCancelText }, { children: t('Cancel') })) })), _jsx(TouchableOpacity, Object.assign({ testID: "video-details-save-button", style: Styles.modalSaveButton, onPress: saveMediaEventChange }, { children: _jsx(Text, Object.assign({ style: Styles.modalSaveText }, { children: t('Save') })) }))] })), _jsx(TouchableOpacity, Object.assign({ style: [Styles.modalUploadButton, { marginTop: 10, backgroundColor: '#FFE9E9', borderColor: '#FFB3B3' }], onPress: handleDeleteMedia }, { children: _jsx(Text, Object.assign({ style: [Styles.modalUploadText, { color: '#B00020' }] }, { children: mediaType === 'video' ? t('Delete video') : t('Delete photo') })) }))] }))] })) })) })), _jsx(Modal, Object.assign({ visible: statusModalVisible, transparent: true, animationType: "fade", onRequestClose: () => setStatusModalVisible(false) }, { children: _jsx(View, Object.assign({ style: Styles.modalBackdrop }, { children: _jsxs(View, Object.assign({ style: Styles.modalCard }, { children: [_jsx(Text, Object.assign({ style: Styles.modalTitle }, { children: t('Update request status') })), _jsx(Text, Object.assign({ style: Styles.modalSubtitle }, { children: selectedRequest === null || selectedRequest === void 0 ? void 0 : selectedRequest.title })), _jsx(TouchableOpacity, Object.assign({ testID: "video-details-status-fixed", style: [Styles.statusOption, statusChoice === 'fixed' && Styles.statusOptionActive], onPress: () => setStatusChoice('fixed') }, { children: _jsx(Text, Object.assign({ style: Styles.statusOptionText }, { children: t('Mark as fixed') })) })), _jsx(TouchableOpacity, Object.assign({ testID: "video-details-status-wont-fix", style: [Styles.statusOption, statusChoice === 'wont_fix' && Styles.statusOptionActive], onPress: () => setStatusChoice('wont_fix') }, { children: _jsx(Text, Object.assign({ style: Styles.statusOptionText }, { children: t("Won't fix") })) })), statusChoice === 'wont_fix' && (_jsxs(_Fragment, { children: [_jsx(Text, Object.assign({ style: Styles.modalLabel }, { children: t('Reason') })), _jsx(TextInput, { testID: "video-details-status-reason-input", style: Styles.modalInput, placeholder: t('Explain why'), placeholderTextColor: "#9B9F9F", value: wontFixReason, onChangeText: setWontFixReason })] })), _jsxs(View, Object.assign({ style: Styles.modalButtonRow }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.modalCancelButton, onPress: () => setStatusModalVisible(false) }, { children: _jsx(Text, Object.assign({ style: Styles.modalCancelText }, { children: t('Cancel') })) })), _jsx(TouchableOpacity, Object.assign({ testID: "video-details-status-save-button", style: [
                                            Styles.modalSaveButton,
                                            statusChoice === 'wont_fix' && !wontFixReason.trim() && Styles.modalSaveButtonDisabled,
                                        ], onPress: applyStatusChange, disabled: (statusChoice === 'wont_fix' && !wontFixReason.trim()) || isSavingStatus }, { children: _jsx(Text, Object.assign({ style: Styles.modalSaveText }, { children: t('Save') })) }))] }))] })) })) }))] })));
};
export default VideoDetailsScreen;
