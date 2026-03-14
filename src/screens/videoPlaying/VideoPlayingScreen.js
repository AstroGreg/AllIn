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
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, Alert, Pressable, TextInput, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import { ArrowLeft2, ArrowRight, Eye, More, TickCircle, CloseCircle, } from 'iconsax-react-nativejs';
import { createStyles } from './VideoPlayingScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Images from '../../constants/Images';
import Icons from '../../constants/Icons';
import SubscriptionModal from '../../components/subscriptionModal/SubscriptionModal';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { ApiError, attachMediaToPost, createMediaIssueRequest, createPost, getMediaById, recordDownload } from '../../services/apiGateway';
import { getApiBaseUrl, getHlsBaseUrl } from '../../constants/RuntimeConfig';
import { useTranslation } from 'react-i18next';
import { useInstagramStoryImageComposer } from '../../components/share/InstagramStoryComposer';
import { shareMediaToInstagramStory } from '../../components/share/instagramStoryShare';
import { usePreventMediaCapture } from '../../utils/usePreventMediaCapture';
import { isE2ELaunchEnabled } from '../../constants/E2EConfig';
const E2E_HIDDEN_TEXT_STYLE = { position: 'absolute', left: -1000, top: -1000, width: 1, height: 1, opacity: 0.01 };
const VideoPlayingScreen = ({ navigation, route }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32;
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { apiAccessToken } = useAuth();
    const { composeInstagramStoryImage, composerElement } = useInstagramStoryImageComposer();
    usePreventMediaCapture(true);
    const perfStartedAtRef = useRef(Date.now());
    const [perfReadyElapsedMs, setPerfReadyElapsedMs] = useState(null);
    const showBuyModalOnLoad = ((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.showBuyModal) || false;
    const videoPrice = ((_c = (_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.video) === null || _c === void 0 ? void 0 : _c.price) || '€0,20';
    const fallbackVideo = useMemo(() => {
        var _a;
        return (((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.video) || {
            title: t('PK 800m 2023 indoor'),
            thumbnail: Images.photo1,
            uri: '',
        });
    }, [(_d = route === null || route === void 0 ? void 0 : route.params) === null || _d === void 0 ? void 0 : _d.video, t]);
    const routeMediaId = ((_f = (_e = route === null || route === void 0 ? void 0 : route.params) === null || _e === void 0 ? void 0 : _e.video) === null || _f === void 0 ? void 0 : _f.media_id) ||
        ((_h = (_g = route === null || route === void 0 ? void 0 : route.params) === null || _g === void 0 ? void 0 : _g.video) === null || _h === void 0 ? void 0 : _h.mediaId) ||
        ((_k = (_j = route === null || route === void 0 ? void 0 : route.params) === null || _j === void 0 ? void 0 : _j.video) === null || _k === void 0 ? void 0 : _k.id) ||
        ((_l = route === null || route === void 0 ? void 0 : route.params) === null || _l === void 0 ? void 0 : _l.mediaId) ||
        ((_m = route === null || route === void 0 ? void 0 : route.params) === null || _m === void 0 ? void 0 : _m.media_id) ||
        ((_o = route === null || route === void 0 ? void 0 : route.params) === null || _o === void 0 ? void 0 : _o.id) ||
        ((_q = (_p = route === null || route === void 0 ? void 0 : route.params) === null || _p === void 0 ? void 0 : _p.media) === null || _q === void 0 ? void 0 : _q.media_id) ||
        ((_s = (_r = route === null || route === void 0 ? void 0 : route.params) === null || _r === void 0 ? void 0 : _r.media) === null || _s === void 0 ? void 0 : _s.mediaId) ||
        ((_u = (_t = route === null || route === void 0 ? void 0 : route.params) === null || _t === void 0 ? void 0 : _t.media) === null || _u === void 0 ? void 0 : _u.id) ||
        null;
    const routeEventId = ((_w = (_v = route === null || route === void 0 ? void 0 : route.params) === null || _v === void 0 ? void 0 : _v.video) === null || _w === void 0 ? void 0 : _w.event_id) ||
        ((_y = (_x = route === null || route === void 0 ? void 0 : route.params) === null || _x === void 0 ? void 0 : _x.video) === null || _y === void 0 ? void 0 : _y.eventId) ||
        ((_z = route === null || route === void 0 ? void 0 : route.params) === null || _z === void 0 ? void 0 : _z.event_id) ||
        ((_0 = route === null || route === void 0 ? void 0 : route.params) === null || _0 === void 0 ? void 0 : _0.eventId) ||
        ((_2 = (_1 = route === null || route === void 0 ? void 0 : route.params) === null || _1 === void 0 ? void 0 : _1.media) === null || _2 === void 0 ? void 0 : _2.event_id) ||
        ((_4 = (_3 = route === null || route === void 0 ? void 0 : route.params) === null || _3 === void 0 ? void 0 : _3.media) === null || _4 === void 0 ? void 0 : _4.eventId) ||
        null;
    const blogTitleFromRoute = ((_5 = route === null || route === void 0 ? void 0 : route.params) === null || _5 === void 0 ? void 0 : _5.blogTitle) ||
        ((_6 = route === null || route === void 0 ? void 0 : route.params) === null || _6 === void 0 ? void 0 : _6.postTitle) ||
        ((_8 = (_7 = route === null || route === void 0 ? void 0 : route.params) === null || _7 === void 0 ? void 0 : _7.post) === null || _8 === void 0 ? void 0 : _8.title) ||
        '';
    const startAt = Number((_10 = (_9 = route === null || route === void 0 ? void 0 : route.params) === null || _9 === void 0 ? void 0 : _9.startAt) !== null && _10 !== void 0 ? _10 : 0);
    const e2eLaunchEnabled = isE2ELaunchEnabled();
    const hasInitialSeekedRef = useRef(false);
    const [videoTitle, setVideoTitle] = useState(fallbackVideo.title);
    const [videoViewsCount, setVideoViewsCount] = useState(Number((_16 = (_13 = (_12 = (_11 = route === null || route === void 0 ? void 0 : route.params) === null || _11 === void 0 ? void 0 : _11.video) === null || _12 === void 0 ? void 0 : _12.views_count) !== null && _13 !== void 0 ? _13 : (_15 = (_14 = route === null || route === void 0 ? void 0 : route.params) === null || _14 === void 0 ? void 0 : _14.video) === null || _15 === void 0 ? void 0 : _15.views) !== null && _16 !== void 0 ? _16 : 0) || 0);
    const [videoUrl, setVideoUrl] = useState(fallbackVideo.uri || null);
    const fallbackPoster = useCallback(() => {
        var _a, _b;
        if (!fallbackVideo.thumbnail)
            return null;
        if (typeof fallbackVideo.thumbnail === 'number') {
            return Image.resolveAssetSource(fallbackVideo.thumbnail).uri;
        }
        if (typeof fallbackVideo.thumbnail === 'string') {
            return fallbackVideo.thumbnail;
        }
        return (_b = (_a = fallbackVideo.thumbnail) === null || _a === void 0 ? void 0 : _a.uri) !== null && _b !== void 0 ? _b : null;
    }, [fallbackVideo.thumbnail]);
    const [posterUrl, setPosterUrl] = useState(() => fallbackPoster());
    const instagramStoryTitle = useMemo(() => {
        const blogTitle = String(blogTitleFromRoute || '').trim();
        return blogTitle || null;
    }, [blogTitleFromRoute]);
    const shouldUseStaticBlogMediaStory = useMemo(() => Boolean(String(blogTitleFromRoute || '').trim() && String(posterUrl || '').trim()), [blogTitleFromRoute, posterUrl]);
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showFailedModal, setShowFailedModal] = useState(false);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isSeeking, setIsSeeking] = useState(false);
    const [pendingSeek, setPendingSeek] = useState(0);
    const [initialSeekSeconds, setInitialSeekSeconds] = useState(null);
    const videoRef = useRef(null);
    const [sliderWidth, setSliderWidth] = useState(0);
    const [moreMenuVisible, setMoreMenuVisible] = useState(false);
    const [moreMenuActions, setMoreMenuActions] = useState([]);
    const [reportIssueVisible, setReportIssueVisible] = useState(false);
    const [reportStep, setReportStep] = useState('reason');
    const [selectedReportReason, setSelectedReportReason] = useState('');
    const [customReportReason, setCustomReportReason] = useState('');
    const [infoPopupVisible, setInfoPopupVisible] = useState(false);
    const [infoPopupTitle, setInfoPopupTitle] = useState('');
    const [infoPopupMessage, setInfoPopupMessage] = useState('');
    const hasRoutePlayableUrl = Boolean(fallbackVideo.uri ||
        ((_18 = (_17 = route === null || route === void 0 ? void 0 : route.params) === null || _17 === void 0 ? void 0 : _17.video) === null || _18 === void 0 ? void 0 : _18.preview_url) ||
        ((_20 = (_19 = route === null || route === void 0 ? void 0 : route.params) === null || _19 === void 0 ? void 0 : _19.video) === null || _20 === void 0 ? void 0 : _20.original_url) ||
        ((_22 = (_21 = route === null || route === void 0 ? void 0 : route.params) === null || _21 === void 0 ? void 0 : _21.video) === null || _22 === void 0 ? void 0 : _22.full_url) ||
        ((_24 = (_23 = route === null || route === void 0 ? void 0 : route.params) === null || _23 === void 0 ? void 0 : _23.video) === null || _24 === void 0 ? void 0 : _24.raw_url) ||
        ((_26 = (_25 = route === null || route === void 0 ? void 0 : route.params) === null || _25 === void 0 ? void 0 : _25.video) === null || _26 === void 0 ? void 0 : _26.hls_manifest_path));
    const shouldRenderNativePlayer = Boolean(videoUrl) && !(e2eLaunchEnabled && !hasRoutePlayableUrl);
    useEffect(() => {
        var _a, _b, _c, _d, _e, _f;
        setVideoTitle(fallbackVideo.title);
        setVideoViewsCount(Number((_f = (_c = (_b = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.video) === null || _b === void 0 ? void 0 : _b.views_count) !== null && _c !== void 0 ? _c : (_e = (_d = route === null || route === void 0 ? void 0 : route.params) === null || _d === void 0 ? void 0 : _d.video) === null || _e === void 0 ? void 0 : _e.views) !== null && _f !== void 0 ? _f : 0) || 0);
        setVideoUrl(fallbackVideo.uri || null);
        setPosterUrl(fallbackPoster());
        perfStartedAtRef.current = Date.now();
        setPerfReadyElapsedMs(null);
        setInitialSeekSeconds(Number.isFinite(startAt) && startAt > 0 ? startAt : null);
        hasInitialSeekedRef.current = false;
    }, [fallbackPoster, fallbackVideo.title, fallbackVideo.uri, (_28 = (_27 = route === null || route === void 0 ? void 0 : route.params) === null || _27 === void 0 ? void 0 : _27.video) === null || _28 === void 0 ? void 0 : _28.views, (_30 = (_29 = route === null || route === void 0 ? void 0 : route.params) === null || _29 === void 0 ? void 0 : _29.video) === null || _30 === void 0 ? void 0 : _30.views_count, startAt]);
    const formatTime = useCallback((value) => {
        const safe = Number.isFinite(value) ? Math.max(0, value) : 0;
        const minutes = Math.floor(safe / 60);
        const seconds = Math.floor(safe % 60);
        const padded = seconds < 10 ? `0${seconds}` : `${seconds}`;
        return `${minutes}:${padded}`;
    }, []);
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
        if (!apiAccessToken || !routeMediaId) {
            return () => { };
        }
        getMediaById(apiAccessToken, String(routeMediaId))
            .then((media) => {
            var _a;
            if (!mounted)
                return;
            const title = (media === null || media === void 0 ? void 0 : media.title) || (media === null || media === void 0 ? void 0 : media.description) || fallbackVideo.title;
            setVideoTitle(title);
            setVideoViewsCount(Number((_a = media === null || media === void 0 ? void 0 : media.views_count) !== null && _a !== void 0 ? _a : 0) || 0);
            const hls = media.hls_manifest_path ? toHlsUrl(media.hls_manifest_path) : null;
            const candidates = [
                media.preview_url,
                media.original_url,
                media.full_url,
                media.raw_url,
            ]
                .filter(Boolean)
                .map((value) => toAbsoluteUrl(String(value)) || '')
                .filter(Boolean);
            const mp4 = candidates.find((value) => /\.(mp4|mov|m4v)(\\?|$)/i.test(value));
            const resolvedVideo = hls || mp4 || candidates[0] || fallbackVideo.uri || null;
            const thumbCandidate = media.thumbnail_url || media.preview_url || media.full_url || media.raw_url || null;
            const resolvedPoster = thumbCandidate ? toAbsoluteUrl(String(thumbCandidate)) : fallbackPoster();
            setVideoUrl(withAccessToken(resolvedVideo || '') || resolvedVideo || null);
            setPosterUrl(withAccessToken(resolvedPoster || '') || resolvedPoster || null);
        })
            .catch((_err) => {
            if (!mounted)
                return;
            // ignore fetch errors for now; keep fallback values
        });
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, fallbackPoster, fallbackVideo.title, fallbackVideo.uri, routeMediaId, toAbsoluteUrl, toHlsUrl, withAccessToken]);
    useEffect(() => {
        if (showBuyModalOnLoad) {
            setShowBuyModal(true);
        }
    }, [showBuyModalOnLoad]);
    const handlePay = () => {
        setShowBuyModal(false);
        setShowSuccessModal(true);
    };
    const handleCancel = () => {
        setShowBuyModal(false);
        setShowFailedModal(true);
    };
    const getShareModule = useCallback(() => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            return require('react-native-share');
        }
        catch (_a) {
            return null;
        }
    }, []);
    const getFsModule = useCallback(() => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            return require('react-native-fs');
        }
        catch (_a) {
            return null;
        }
    }, []);
    const extensionFromUrl = useCallback((value) => {
        try {
            const clean = value.split('?')[0].split('#')[0];
            const dot = clean.lastIndexOf('.');
            if (dot >= 0)
                return clean.slice(dot + 1);
        }
        catch (_a) {
            // ignore
        }
        return 'mp4';
    }, []);
    const resolveDownloadUrl = useCallback(() => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        const candidates = [
            videoUrl,
            (_b = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.video) === null || _b === void 0 ? void 0 : _b.uri,
            (_d = (_c = route === null || route === void 0 ? void 0 : route.params) === null || _c === void 0 ? void 0 : _c.video) === null || _d === void 0 ? void 0 : _d.preview_url,
            (_f = (_e = route === null || route === void 0 ? void 0 : route.params) === null || _e === void 0 ? void 0 : _e.video) === null || _f === void 0 ? void 0 : _f.original_url,
            (_h = (_g = route === null || route === void 0 ? void 0 : route.params) === null || _g === void 0 ? void 0 : _g.video) === null || _h === void 0 ? void 0 : _h.full_url,
            (_k = (_j = route === null || route === void 0 ? void 0 : route.params) === null || _j === void 0 ? void 0 : _j.video) === null || _k === void 0 ? void 0 : _k.raw_url,
            ((_m = (_l = route === null || route === void 0 ? void 0 : route.params) === null || _l === void 0 ? void 0 : _l.video) === null || _m === void 0 ? void 0 : _m.hls_manifest_path) ? toHlsUrl((_p = (_o = route === null || route === void 0 ? void 0 : route.params) === null || _o === void 0 ? void 0 : _o.video) === null || _p === void 0 ? void 0 : _p.hls_manifest_path) : null,
        ].filter(Boolean);
        return (_r = (_q = candidates.find((value) => /\.(mp4|mov|m4v)(\?|$)/i.test(value))) !== null && _q !== void 0 ? _q : candidates[0]) !== null && _r !== void 0 ? _r : null;
    }, [(_31 = route === null || route === void 0 ? void 0 : route.params) === null || _31 === void 0 ? void 0 : _31.video, toHlsUrl, videoUrl]);
    const ensureLocalFile = useCallback((remoteUrl, extensionHint) => __awaiter(void 0, void 0, void 0, function* () {
        const fsModule = getFsModule();
        if (!(fsModule === null || fsModule === void 0 ? void 0 : fsModule.downloadFile) || !(fsModule === null || fsModule === void 0 ? void 0 : fsModule.CachesDirectoryPath)) {
            return null;
        }
        const safeExt = extensionHint.startsWith('.') ? extensionHint : `.${extensionHint}`;
        const baseName = routeMediaId ? `spotme-${routeMediaId}` : `spotme-${Date.now()}`;
        const destPath = `${fsModule.CachesDirectoryPath}/${baseName}${safeExt}`;
        try {
            const result = yield fsModule.downloadFile({
                fromUrl: remoteUrl,
                toFile: destPath,
                background: true,
            }).promise;
            if ((result === null || result === void 0 ? void 0 : result.statusCode) && result.statusCode >= 400) {
                return null;
            }
            return `file://${destPath}`;
        }
        catch (_33) {
            return null;
        }
    }), [getFsModule, routeMediaId]);
    const handleDownload = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _34, _35;
        setShowSuccessModal(false);
        if (!apiAccessToken) {
            Alert.alert(t('Missing API token'), t('Log in or set a Dev API token to download.'));
            return;
        }
        if (!routeMediaId) {
            Alert.alert(t('Missing media'), t('This item has no media_id to download.'));
            return;
        }
        const downloadUrl = resolveDownloadUrl();
        if (!downloadUrl) {
            Alert.alert(t('No download URL'), t('The API did not provide a downloadable URL for this media.'));
            return;
        }
        const fileUrl = yield ensureLocalFile(downloadUrl, extensionFromUrl(downloadUrl));
        if (!fileUrl) {
            Alert.alert(t('Download failed'), t('Unable to download the media file.'));
            return;
        }
        try {
            yield recordDownload(apiAccessToken, {
                media_id: String(routeMediaId),
                event_id: routeEventId ? String(routeEventId) : undefined,
            });
        }
        catch (_36) {
            // ignore
        }
        try {
            const shareModule = getShareModule();
            if ((_34 = shareModule === null || shareModule === void 0 ? void 0 : shareModule.default) === null || _34 === void 0 ? void 0 : _34.open) {
                yield shareModule.default.open({
                    urls: [fileUrl],
                    type: 'video/mp4',
                    filename: routeMediaId ? `spotme_${routeMediaId}` : `spotme_${Date.now()}`,
                    failOnCancel: false,
                    showAppsToView: true,
                });
            }
            else {
                yield Share.share({ url: fileUrl, message: 'SpotMe media' });
            }
        }
        catch (e) {
            const msg = String((_35 = e === null || e === void 0 ? void 0 : e.message) !== null && _35 !== void 0 ? _35 : e);
            Alert.alert(t('Download failed'), msg);
        }
    }), [apiAccessToken, ensureLocalFile, extensionFromUrl, getShareModule, resolveDownloadUrl, routeEventId, routeMediaId, t]);
    const handleShareNative = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _37, _38;
        const downloadUrl = resolveDownloadUrl();
        if (!downloadUrl) {
            Alert.alert(t('No media available'), t('There is no media to share.'));
            return;
        }
        const fileUrl = yield ensureLocalFile(downloadUrl, extensionFromUrl(downloadUrl));
        if (!fileUrl) {
            Alert.alert(t('Share failed'), t('Unable to download the media file.'));
            return;
        }
        try {
            const shareModule = getShareModule();
            if ((_37 = shareModule === null || shareModule === void 0 ? void 0 : shareModule.default) === null || _37 === void 0 ? void 0 : _37.open) {
                yield shareModule.default.open({
                    urls: [fileUrl],
                    type: 'video/mp4',
                    filename: routeMediaId ? `spotme_${routeMediaId}` : `spotme_${Date.now()}`,
                    failOnCancel: false,
                    showAppsToView: true,
                });
            }
            else {
                yield Share.share({ url: fileUrl, message: 'SpotMe media' });
            }
        }
        catch (e) {
            const msg = String((_38 = e === null || e === void 0 ? void 0 : e.message) !== null && _38 !== void 0 ? _38 : e);
            Alert.alert(t('Share failed'), msg);
        }
    }), [ensureLocalFile, extensionFromUrl, getShareModule, resolveDownloadUrl, routeMediaId, t]);
    const handleShareInstagram = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _39, _40;
        const shareModule = getShareModule();
        const downloadUrl = resolveDownloadUrl();
        if (!downloadUrl) {
            Alert.alert(t('No media available'), t('There is no media to share.'));
            return;
        }
        if (!((_39 = shareModule === null || shareModule === void 0 ? void 0 : shareModule.default) === null || _39 === void 0 ? void 0 : _39.shareSingle)) {
            yield handleShareNative();
            return;
        }
        try {
            const fileUrl = yield ensureLocalFile(downloadUrl, extensionFromUrl(downloadUrl));
            if (!fileUrl) {
                Alert.alert(t('Share failed'), t('Unable to download the media file.'));
                return;
            }
            const result = yield shareMediaToInstagramStory({
                t,
                composeInstagramStoryImage,
                localAssetUrl: fileUrl,
                isVideo: true,
                title: instagramStoryTitle,
                composeImageUri: shouldUseStaticBlogMediaStory ? posterUrl : null,
                preferComposedBackground: shouldUseStaticBlogMediaStory,
                shareModule: shareModule.default,
            });
            if (result === 'unsupported') {
                yield handleShareNative();
            }
        }
        catch (e) {
            const msg = String((_40 = e === null || e === void 0 ? void 0 : e.message) !== null && _40 !== void 0 ? _40 : e);
            if (!/cancel/i.test(msg)) {
                Alert.alert(t('Instagram Story failed'), msg);
            }
        }
    }), [composeInstagramStoryImage, ensureLocalFile, extensionFromUrl, getShareModule, handleShareNative, instagramStoryTitle, posterUrl, resolveDownloadUrl, shouldUseStaticBlogMediaStory, t]);
    const showInfoPopup = useCallback((title, message) => {
        setInfoPopupTitle(title);
        setInfoPopupMessage(message);
        setInfoPopupVisible(true);
    }, []);
    const handleAddToProfile = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _41, _42, _43, _44, _45, _46;
        if (!apiAccessToken) {
            Alert.alert(t('Missing API token'), t('Log in or set a Dev API token to add media to your news page.'));
            return;
        }
        if (!routeMediaId) {
            Alert.alert(t('Missing media'), t('This item has no media_id to add.'));
            return;
        }
        try {
            const entryTitle = String((_43 = (_42 = (_41 = route === null || route === void 0 ? void 0 : route.params) === null || _41 === void 0 ? void 0 : _41.eventTitle) !== null && _42 !== void 0 ? _42 : videoTitle) !== null && _43 !== void 0 ? _43 : t('Competition')).trim() || t('Competition');
            const created = yield createPost(apiAccessToken, {
                title: entryTitle,
                description: entryTitle,
                post_type: 'video',
            });
            const postId = String((_45 = (_44 = created === null || created === void 0 ? void 0 : created.post) === null || _44 === void 0 ? void 0 : _44.id) !== null && _45 !== void 0 ? _45 : '').trim();
            if (!postId) {
                throw new Error(t('Could not create the news post.'));
            }
            yield attachMediaToPost(apiAccessToken, postId, {
                media_ids: [String(routeMediaId)],
            });
            showInfoPopup(t('Added to news page'), t('This video now appears on your news page.'));
        }
        catch (e) {
            const message = e instanceof ApiError ? e.message : String((_46 = e === null || e === void 0 ? void 0 : e.message) !== null && _46 !== void 0 ? _46 : e);
            Alert.alert(t('Could not add'), message);
        }
    }), [apiAccessToken, (_32 = route === null || route === void 0 ? void 0 : route.params) === null || _32 === void 0 ? void 0 : _32.eventTitle, routeMediaId, showInfoPopup, t, videoTitle]);
    const handleRecharge = () => {
        setShowFailedModal(false);
        setShowSubscriptionModal(true);
    };
    useEffect(() => {
        if (!infoPopupVisible)
            return;
        const timer = setTimeout(() => {
            setInfoPopupVisible(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, [infoPopupVisible]);
    const reportReasons = useMemo(() => [
        t('Wrong competition'),
        t('Wrong heat'),
        t('Custom'),
    ], [t]);
    const openReportIssuePopup = useCallback(() => {
        setSelectedReportReason('');
        setCustomReportReason('');
        setReportStep('reason');
        setReportIssueVisible(true);
    }, []);
    const handleGoToProfile = useCallback(() => {
        navigation.navigate('BottomTabBar', { screen: 'Profile' });
    }, [navigation]);
    const handleGoToEvent = useCallback(() => {
        const location = String((fallbackVideo === null || fallbackVideo === void 0 ? void 0 : fallbackVideo.location) || '').trim();
        const eventDate = String((fallbackVideo === null || fallbackVideo === void 0 ? void 0 : fallbackVideo.date) || '').trim();
        const typeToken = `${videoTitle} ${location}`.toLowerCase();
        navigation.navigate('CompetitionDetailsScreen', {
            eventId: String((fallbackVideo === null || fallbackVideo === void 0 ? void 0 : fallbackVideo.eventId) || (fallbackVideo === null || fallbackVideo === void 0 ? void 0 : fallbackVideo.event_id) || '').trim() || undefined,
            name: videoTitle,
            location,
            date: eventDate,
            competitionType: /road|trail|marathon|veldloop|veldlopen|cross|5k|10k|half|ultra|city\s*run/.test(typeToken)
                ? 'road'
                : 'track',
        });
    }, [fallbackVideo, navigation, videoTitle]);
    const handleMarkInappropriate = useCallback(() => {
        Alert.alert(t('Thanks'), t('We will review this content.'));
    }, [t]);
    const handleRequestRemoval = useCallback(() => {
        Alert.alert(t('Request sent'), t('We will review the removal request.'));
    }, [t]);
    const openMoreMenu = useCallback(() => {
        const actions = [
            { label: t('Download'), onPress: handleDownload },
            { label: t('Share'), onPress: handleShareNative },
            { label: t('Share to Instagram Story'), onPress: handleShareInstagram },
            { label: t('Add to news'), onPress: handleAddToProfile },
            { label: t('Report an issue with this video/photo'), onPress: openReportIssuePopup },
            { label: t('Go to author profile'), onPress: handleGoToProfile },
            { label: t('Go to event'), onPress: handleGoToEvent },
            { label: t('Mark as inappropriate content'), onPress: handleMarkInappropriate },
            { label: t('Request this video removed'), onPress: handleRequestRemoval },
        ];
        setMoreMenuActions(actions);
        setMoreMenuVisible(true);
    }, [handleAddToProfile, handleDownload, handleGoToEvent, handleGoToProfile, handleMarkInappropriate, handleRequestRemoval, handleShareInstagram, handleShareNative, openReportIssuePopup, t]);
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer, testID: "video-playing-screen" }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ onPress: () => navigation.goBack(), style: Styles.headerBack }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitleCentered, numberOfLines: 1 }, { children: videoTitle })), _jsxs(View, Object.assign({ style: Styles.headerActions }, { children: [_jsxs(View, Object.assign({ style: Styles.headerViews }, { children: [_jsx(Eye, { size: 18, color: colors.grayColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: Styles.headerViewsText, numberOfLines: 1 }, { children: videoViewsCount }))] })), _jsx(TouchableOpacity, Object.assign({ onPress: openMoreMenu, style: Styles.headerMore }, { children: _jsx(More, { size: 24, color: colors.mainTextColor, variant: "Linear", style: { transform: [{ rotate: '90deg' }] } }) }))] }))] })), _jsxs(TouchableOpacity, Object.assign({ style: Styles.videoContainer, activeOpacity: 0.9, onPress: () => setIsPlaying((prev) => !prev) }, { children: [shouldRenderNativePlayer ? (_jsx(Video, { ref: videoRef, source: { uri: videoUrl, type: String(videoUrl).includes('.m3u8') ? 'm3u8' : undefined }, style: Styles.videoImage, resizeMode: "cover", controls: false, paused: !isPlaying, poster: posterUrl || Image.resolveAssetSource(Images.photo1).uri, posterResizeMode: "cover", ignoreSilentSwitch: "ignore", repeat: false, onLoad: (meta) => {
                            var _a;
                            const nextDuration = meta.duration || 0;
                            setDuration(nextDuration);
                            if (!hasInitialSeekedRef.current && Number.isFinite(startAt) && startAt > 0) {
                                const seekToTime = Math.min(startAt, nextDuration || startAt);
                                hasInitialSeekedRef.current = true;
                                (_a = videoRef.current) === null || _a === void 0 ? void 0 : _a.seek(seekToTime);
                                setCurrentTime(seekToTime);
                                setInitialSeekSeconds(seekToTime);
                            }
                            setPerfReadyElapsedMs(Date.now() - perfStartedAtRef.current);
                        }, onProgress: (progress) => {
                            if (!isSeeking) {
                                setCurrentTime(progress.currentTime);
                            }
                        } })) : (_jsx(FastImage, { source: posterUrl ? { uri: posterUrl } : Images.photo1, style: Styles.videoImage, resizeMode: "cover", onLoadEnd: () => setPerfReadyElapsedMs(Date.now() - perfStartedAtRef.current) })), perfReadyElapsedMs != null ? (_jsx(Text, Object.assign({ style: E2E_HIDDEN_TEXT_STYLE, testID: "e2e-perf-ready-video-viewer" }, { children: `ready:${perfReadyElapsedMs}` }))) : null, initialSeekSeconds != null ? (_jsx(Text, Object.assign({ style: E2E_HIDDEN_TEXT_STYLE, testID: "video-playing-initial-seek-time" }, { children: formatTime(initialSeekSeconds) }))) : null, !isPlaying && (_jsx(View, Object.assign({ style: Styles.playButtonOverlay }, { children: _jsx(Icons.PlayCricle, { width: 46, height: 46 }) }))), duration > 0 && (_jsxs(View, Object.assign({ style: Styles.videoSliderOverlay, onLayout: (event) => {
                            setSliderWidth(event.nativeEvent.layout.width);
                        } }, { children: [_jsx(View, Object.assign({ style: [
                                    Styles.videoSliderTimeBubble,
                                    sliderWidth > 0
                                        ? {
                                            left: Math.min(sliderWidth - 32, Math.max(0, (sliderWidth * (isSeeking ? pendingSeek : currentTime)) / duration - 16)),
                                        }
                                        : undefined,
                                ] }, { children: _jsx(Text, Object.assign({ style: Styles.videoSliderTime, testID: "video-playing-current-time" }, { children: formatTime(isSeeking ? pendingSeek : currentTime) })) })), _jsx(Slider, { minimumValue: 0, maximumValue: duration, value: isSeeking ? pendingSeek : currentTime, minimumTrackTintColor: colors.primaryColor, maximumTrackTintColor: "rgba(255,255,255,0.45)", thumbTintColor: colors.primaryColor, onValueChange: (value) => {
                                    setIsSeeking(true);
                                    setPendingSeek(value);
                                }, onSlidingComplete: (value) => {
                                    var _a;
                                    (_a = videoRef.current) === null || _a === void 0 ? void 0 : _a.seek(value);
                                    setCurrentTime(value);
                                    setIsSeeking(false);
                                } })] })))] })), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom : 0 }), _jsx(Modal, Object.assign({ visible: moreMenuVisible, transparent: true, animationType: "fade", onRequestClose: () => setMoreMenuVisible(false) }, { children: _jsxs(View, Object.assign({ style: Styles.moreMenuOverlay }, { children: [_jsx(Pressable, { style: Styles.moreMenuBackdrop, onPress: () => setMoreMenuVisible(false) }), _jsxs(View, Object.assign({ style: Styles.moreMenuContainer }, { children: [moreMenuActions.map((item, index) => (_jsx(TouchableOpacity, Object.assign({ style: Styles.moreMenuAction, activeOpacity: 0.85, onPress: () => {
                                        setMoreMenuVisible(false);
                                        setTimeout(() => item.onPress(), 120);
                                    } }, { children: _jsx(Text, Object.assign({ style: Styles.moreMenuActionText }, { children: item.label })) }), `${item.label}-${index}`))), _jsx(TouchableOpacity, Object.assign({ style: Styles.moreMenuCancel, activeOpacity: 0.85, onPress: () => setMoreMenuVisible(false) }, { children: _jsx(Text, Object.assign({ style: Styles.moreMenuCancelText }, { children: t('Cancel') })) }))] }))] })) })), _jsx(Modal, Object.assign({ visible: reportIssueVisible, transparent: true, animationType: "fade", onRequestClose: () => {
                    setReportIssueVisible(false);
                    setReportStep('reason');
                    setSelectedReportReason('');
                    setCustomReportReason('');
                } }, { children: _jsxs(View, Object.assign({ style: Styles.moreMenuOverlay }, { children: [_jsx(Pressable, { style: Styles.moreMenuBackdrop, onPress: () => {
                                setReportIssueVisible(false);
                                setReportStep('reason');
                                setSelectedReportReason('');
                                setCustomReportReason('');
                            } }), _jsxs(View, Object.assign({ style: Styles.moreMenuContainer }, { children: [_jsx(Text, Object.assign({ style: Styles.moreMenuTitle }, { children: reportStep === 'reason'
                                        ? t('Report an issue with this photo/video')
                                        : t('Confirm request') })), _jsx(View, { style: Styles.moreMenuDivider }), reportStep === 'reason' ? (_jsxs(_Fragment, { children: [reportReasons.map((reason) => (_jsx(TouchableOpacity, Object.assign({ style: Styles.moreMenuAction, activeOpacity: 0.85, onPress: () => {
                                                setSelectedReportReason(reason);
                                                if (reason === t('Custom')) {
                                                    return;
                                                }
                                                setReportStep('confirm');
                                            } }, { children: _jsx(Text, Object.assign({ style: Styles.moreMenuActionText }, { children: reason })) }), reason))), selectedReportReason === t('Custom') ? (_jsxs(View, Object.assign({ style: [Styles.moreMenuAction, { borderBottomWidth: 0 }] }, { children: [_jsx(TextInput, { style: [Styles.moreMenuActionText, { borderWidth: 1, borderColor: colors.borderColor, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }], value: customReportReason, onChangeText: setCustomReportReason, placeholder: t('Type your request'), placeholderTextColor: colors.subTextColor }), _jsx(TouchableOpacity, Object.assign({ style: [Styles.infoModalSubmitButton, { marginTop: 10 }], activeOpacity: 0.85, onPress: () => {
                                                        if (!customReportReason.trim())
                                                            return;
                                                        setReportStep('confirm');
                                                    } }, { children: _jsx(Text, Object.assign({ style: Styles.infoModalSubmitButtonText }, { children: t('Next') })) }))] }))) : null, _jsx(TouchableOpacity, Object.assign({ style: Styles.moreMenuCancel, activeOpacity: 0.85, onPress: () => {
                                                setReportIssueVisible(false);
                                                setReportStep('reason');
                                                setSelectedReportReason('');
                                                setCustomReportReason('');
                                            } }, { children: _jsx(Text, Object.assign({ style: Styles.moreMenuCancelText }, { children: t('Cancel') })) }))] })) : (_jsxs(_Fragment, { children: [_jsx(View, Object.assign({ style: Styles.moreMenuAction }, { children: _jsx(Text, Object.assign({ style: Styles.moreMenuActionText }, { children: `${t('Reason')}: ${selectedReportReason}${selectedReportReason === t('Custom') ? ` - ${customReportReason.trim()}` : ''}` })) })), _jsx(TouchableOpacity, Object.assign({ style: [Styles.infoModalSubmitButton, { marginTop: 8 }], activeOpacity: 0.85, onPress: () => __awaiter(void 0, void 0, void 0, function* () {
                                                const mediaId = String(routeMediaId || '').trim();
                                                if (!apiAccessToken || !mediaId)
                                                    return;
                                                const issue_type = selectedReportReason === t('Wrong competition')
                                                    ? 'wrong_competition'
                                                    : selectedReportReason === t('Wrong heat')
                                                        ? 'wrong_heat'
                                                        : 'custom';
                                                try {
                                                    yield createMediaIssueRequest(apiAccessToken, {
                                                        media_id: mediaId,
                                                        issue_type,
                                                        custom_text: issue_type === 'custom' ? customReportReason.trim() : undefined,
                                                    });
                                                }
                                                catch (e) {
                                                    const msg = String((e === null || e === void 0 ? void 0 : e.message) || t('Could not submit request'));
                                                    showInfoPopup(t('Request failed'), msg);
                                                    return;
                                                }
                                                setReportIssueVisible(false);
                                                setReportStep('reason');
                                                setSelectedReportReason('');
                                                setCustomReportReason('');
                                                setTimeout(() => {
                                                    showInfoPopup(t('Request sent'), t('Your edit request is now pending.'));
                                                }, 120);
                                            }) }, { children: _jsx(Text, Object.assign({ style: Styles.infoModalSubmitButtonText }, { children: t('Submit') })) }))] }))] }))] })) })), _jsx(Modal, Object.assign({ visible: infoPopupVisible, transparent: true, animationType: "fade", onRequestClose: () => setInfoPopupVisible(false) }, { children: _jsxs(View, Object.assign({ style: Styles.moreMenuOverlay }, { children: [_jsx(Pressable, { style: Styles.moreMenuBackdrop, onPress: () => setInfoPopupVisible(false) }), _jsxs(View, Object.assign({ style: Styles.infoModalContainer }, { children: [_jsx(Text, Object.assign({ style: Styles.infoModalTitle }, { children: infoPopupTitle })), _jsx(Text, Object.assign({ style: Styles.infoModalText }, { children: infoPopupMessage }))] }))] })) })), _jsx(Modal, Object.assign({ visible: showBuyModal, transparent: true, animationType: "fade", onRequestClose: () => setShowBuyModal(false) }, { children: _jsx(View, Object.assign({ style: Styles.modalOverlay }, { children: _jsxs(View, Object.assign({ style: Styles.modalContainer }, { children: [_jsx(FastImage, { source: posterUrl ? { uri: posterUrl } : Images.photo1, style: Styles.modalImage, resizeMode: "cover" }), _jsxs(View, Object.assign({ style: Styles.modalInfoRow }, { children: [_jsx(Text, Object.assign({ style: Styles.modalTitle }, { children: videoTitle })), _jsx(Text, Object.assign({ style: Styles.modalPrice }, { children: videoPrice }))] })), _jsx(View, { style: Styles.modalDivider }), _jsxs(View, Object.assign({ style: Styles.modalButtonsRow }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.cancelButton, onPress: handleCancel }, { children: _jsx(Text, Object.assign({ style: Styles.modalButtonText }, { children: t('Cancel') })) })), _jsx(TouchableOpacity, Object.assign({ style: Styles.payButton, onPress: handlePay }, { children: _jsx(Text, Object.assign({ style: Styles.modalButtonText }, { children: t('Pay') })) }))] }))] })) })) })), _jsx(Modal, Object.assign({ visible: showSuccessModal, transparent: true, animationType: "fade", onRequestClose: () => setShowSuccessModal(false) }, { children: _jsx(View, Object.assign({ style: Styles.modalOverlay }, { children: _jsxs(View, Object.assign({ style: Styles.successModalContainer }, { children: [_jsx(View, Object.assign({ style: Styles.successIconContainer }, { children: _jsx(TickCircle, { size: 50, color: "#00BD48", variant: "Bold" }) })), _jsx(Text, Object.assign({ style: Styles.successTitle }, { children: t('Accepted') })), _jsx(Text, Object.assign({ style: Styles.successSubtitle }, { children: t('Video added to your account. Resale is prohibited.') })), _jsxs(TouchableOpacity, Object.assign({ style: Styles.downloadButton, onPress: handleDownload }, { children: [_jsx(Text, Object.assign({ style: Styles.downloadButtonText }, { children: t('Download') })), _jsx(ArrowRight, { size: 18, color: "#FFFFFF", variant: "Linear" })] }))] })) })) })), _jsx(Modal, Object.assign({ visible: showFailedModal, transparent: true, animationType: "fade", onRequestClose: () => setShowFailedModal(false) }, { children: _jsx(View, Object.assign({ style: Styles.modalOverlay }, { children: _jsxs(View, Object.assign({ style: Styles.failedModalContainer }, { children: [_jsx(View, Object.assign({ style: Styles.failedIconContainer }, { children: _jsx(CloseCircle, { size: 50, color: "#ED5454", variant: "Bold" }) })), _jsx(Text, Object.assign({ style: Styles.failedTitle }, { children: t('Failed') })), _jsx(Text, Object.assign({ style: Styles.failedSubtitle }, { children: t('Insufficient balance. Please recharge.') })), _jsxs(View, Object.assign({ style: Styles.failedButtonsRow }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.failedCancelButton, onPress: () => setShowFailedModal(false) }, { children: _jsx(Text, Object.assign({ style: Styles.failedButtonText }, { children: t('Cancel') })) })), _jsx(TouchableOpacity, Object.assign({ style: Styles.rechargeButton, onPress: handleRecharge }, { children: _jsx(Text, Object.assign({ style: Styles.failedButtonText }, { children: t('Recharge') })) }))] }))] })) })) })), _jsx(SubscriptionModal, { isVisible: showSubscriptionModal, onClose: () => setShowSubscriptionModal(false) }), composerElement] })));
};
export default VideoPlayingScreen;
