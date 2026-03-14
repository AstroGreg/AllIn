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
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View, Share, Alert, useWindowDimensions, Modal, Pressable, RefreshControl, TextInput } from 'react-native';
import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { createStyles } from './HomeStyles';
import Header from './components/Header';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useEvents } from '../../context/EventsContext';
import Icons from '../../constants/Icons';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { ApiError, createMediaIssueRequest, getHomeOverview, getMediaViewAll, getNotifications, getPostById, getProfileSummaryById, getProfileSummary, recordDownload, togglePostLike, toggleMediaLike, } from '../../services/apiGateway';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import NewsFeedCard from './components/NewsFeedCard';
import Images from '../../constants/Images';
import { getApiBaseUrl, getHlsBaseUrl } from '../../constants/RuntimeConfig';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import ShimmerEffect from '../../components/shimmerEffect/ShimmerEffect';
import NativeShare from 'react-native-share';
import RNFS from 'react-native-fs';
import { translateText } from '../../i18n';
import E2EPerfReady from '../../components/e2e/E2EPerfReady';
import { useInstagramStoryImageComposer } from '../../components/share/InstagramStoryComposer';
import { shareBlogToInstagramStory, shareMediaToInstagramStory } from '../../components/share/instagramStoryShare';
const HOME_FEED_PAGE_SIZE = 8;
const HomeScreen = ({ navigation }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t, i18n } = useTranslation();
    const Styles = createStyles(colors);
    const { height: windowHeight, width: windowWidth } = useWindowDimensions();
    const { user, userProfile, apiAccessToken } = useAuth();
    const { eventNameById } = useEvents();
    const isFocused = useIsFocused();
    const perfStartedAtRef = useRef(Date.now());
    const userName = (() => {
        var _a, _b, _c;
        const profileFullName = [userProfile === null || userProfile === void 0 ? void 0 : userProfile.firstName, userProfile === null || userProfile === void 0 ? void 0 : userProfile.lastName].filter(Boolean).join(' ').trim();
        if (profileFullName)
            return profileFullName;
        const auth0FullName = [user === null || user === void 0 ? void 0 : user.givenName, user === null || user === void 0 ? void 0 : user.familyName].filter(Boolean).join(' ').trim();
        if (auth0FullName)
            return auth0FullName;
        const username = (_a = userProfile === null || userProfile === void 0 ? void 0 : userProfile.username) === null || _a === void 0 ? void 0 : _a.trim();
        if (username)
            return username;
        const nickname = (_b = user === null || user === void 0 ? void 0 : user.nickname) === null || _b === void 0 ? void 0 : _b.trim();
        if (nickname)
            return nickname;
        const name = (_c = user === null || user === void 0 ? void 0 : user.name) === null || _c === void 0 ? void 0 : _c.trim();
        if (name)
            return name;
        return t('Guest');
    })();
    const [profileAvatarUrl, setProfileAvatarUrl] = useState(null);
    const profilePic = (_a = profileAvatarUrl !== null && profileAvatarUrl !== void 0 ? profileAvatarUrl : user === null || user === void 0 ? void 0 : user.picture) !== null && _a !== void 0 ? _a : null;
    const [overview, setOverview] = useState(null);
    const [isLoadingOverview, setIsLoadingOverview] = useState(false);
    const [overviewError, setOverviewError] = useState(null);
    const [refreshingFeed, setRefreshingFeed] = useState(false);
    const [allVideos, setAllVideos] = useState([]);
    const [allPhotos, setAllPhotos] = useState([]);
    const [uploaderMap, setUploaderMap] = useState({});
    const [feedVisibleCount, setFeedVisibleCount] = useState(HOME_FEED_PAGE_SIZE);
    const feedLayoutsRef = useRef({});
    const scrollViewLayoutRef = useRef({ x: 0, y: 0 });
    const videoContainerOffsetRef = useRef(null);
    const sharedVideoRectRef = useRef(null);
    const scrollYRef = useRef(0);
    const [isVideoVisible, setIsVideoVisible] = useState(true);
    const [isBlogVisible, setIsBlogVisible] = useState(true);
    const videoResumeRef = useRef(0);
    const [resumeVideoAt, setResumeVideoAt] = useState(0);
    const [overlayVisible, setOverlayVisible] = useState(false);
    const [overlayVideoUrl, setOverlayVideoUrl] = useState(null);
    const [overlayMedia, setOverlayMedia] = useState(null);
    const [overlayLoading, setOverlayLoading] = useState(true);
    const [overlayPlaying, setOverlayPlaying] = useState(true);
    const [overlayMuted, setOverlayMuted] = useState(true);
    const [overlayDuration, setOverlayDuration] = useState(0);
    const [overlayCurrentTime, setOverlayCurrentTime] = useState(0);
    const [overlaySeeking, setOverlaySeeking] = useState(false);
    const [overlayHasInitialTime, setOverlayHasInitialTime] = useState(false);
    const [overlayStartAt, setOverlayStartAt] = useState(0);
    const overlayVideoRef = useRef(null);
    const [sharedVideoRect, setSharedVideoRect] = useState(null);
    const resumeByUrlRef = useRef({});
    const pendingSeekRef = useRef(null);
    const downloadInFlightRef = useRef(false);
    const [downloadVisible, setDownloadVisible] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(null);
    const [showAiSearchIntro, setShowAiSearchIntro] = useState(false);
    const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
    const [feedMenuVisible, setFeedMenuVisible] = useState(false);
    const [feedMenuTitle, setFeedMenuTitle] = useState('');
    const [feedMenuActions, setFeedMenuActions] = useState([]);
    const [reportIssueVisible, setReportIssueVisible] = useState(false);
    const [reportStep, setReportStep] = useState('reason');
    const [selectedReportReason, setSelectedReportReason] = useState('');
    const [customReportReason, setCustomReportReason] = useState('');
    const [reportTargetMedia, setReportTargetMedia] = useState(null);
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);
    const [infoPopupVisible, setInfoPopupVisible] = useState(false);
    const [infoPopupTitle, setInfoPopupTitle] = useState('');
    const [infoPopupMessage, setInfoPopupMessage] = useState('');
    const [translatedBlogsById, setTranslatedBlogsById] = useState({});
    const [activeMediaCards, setActiveMediaCards] = useState({});
    const feedViewabilityConfig = useRef({ itemVisiblePercentThreshold: 20 }).current;
    const aiSearchButtonRef = useRef(null);
    const [aiSearchButtonRect, setAiSearchButtonRect] = useState(null);
    const loadDebounceRef = useRef(null);
    const loadInFlightRef = useRef(null);
    const lastLoadRequestRef = useRef(0);
    const feedLoadThrottleRef = useRef(0);
    const uploaderFetchInFlightRef = useRef(new Set());
    const { composeInstagramStoryImage, composerElement } = useInstagramStoryImageComposer();
    const onFeedViewableItemsChanged = useRef(({ viewableItems }) => {
        const next = {};
        viewableItems.forEach((token) => {
            var _a;
            if (!token.isViewable)
                return;
            const entry = token.item;
            if (!entry || entry.kind !== 'media')
                return;
            const mediaId = String(((_a = entry.media) === null || _a === void 0 ? void 0 : _a.media_id) || '').trim();
            if (!mediaId)
                return;
            next[`feed-media-${mediaId}`] = true;
        });
        setActiveMediaCards((prev) => {
            const prevKeys = Object.keys(prev);
            const nextKeys = Object.keys(next);
            if (prevKeys.length === nextKeys.length) {
                let same = true;
                for (const key of nextKeys) {
                    if (prev[key] !== next[key]) {
                        same = false;
                        break;
                    }
                }
                if (same)
                    return prev;
            }
            return next;
        });
    }).current;
    const enableSharedOverlay = false;
    const useSharedPlayerInFeed = Boolean(enableSharedOverlay &&
        overlayVideoUrl &&
        sharedVideoRect &&
        sharedVideoRect.width > 0 &&
        sharedVideoRect.height > 0);
    const showInfoPopup = useCallback((title, message) => {
        setInfoPopupTitle(title);
        setInfoPopupMessage(message);
        setInfoPopupVisible(true);
    }, []);
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
    const openReportIssuePopup = useCallback((media) => {
        setReportTargetMedia(media !== null && media !== void 0 ? media : null);
        setSelectedReportReason('');
        setCustomReportReason('');
        setReportStep('reason');
        setReportIssueVisible(true);
    }, []);
    const performLoadOverview = useCallback((force = false) => __awaiter(void 0, void 0, void 0, function* () {
        var _r;
        if (!apiAccessToken) {
            setOverview(null);
            setAllVideos([]);
            setAllPhotos([]);
            setOverviewError(t('Log in to load overview.'));
            return;
        }
        setIsLoadingOverview(true);
        setOverviewError(null);
        try {
            const [overviewResult, mediaResult] = yield Promise.allSettled([
                getHomeOverview(apiAccessToken, 'me'),
                getMediaViewAll(apiAccessToken),
            ]);
            let firstError = null;
            if (overviewResult.status === 'fulfilled') {
                setOverview(overviewResult.value);
            }
            else {
                setOverview(null);
                firstError = overviewResult.reason;
            }
            if (mediaResult.status === 'fulfilled') {
                const mediaItems = Array.isArray(mediaResult.value) ? mediaResult.value : [];
                setAllVideos(mediaItems.filter((item) => String((item === null || item === void 0 ? void 0 : item.type) || '').toLowerCase() === 'video'));
                setAllPhotos(mediaItems.filter((item) => String((item === null || item === void 0 ? void 0 : item.type) || '').toLowerCase() !== 'video'));
            }
            else {
                setAllVideos([]);
                setAllPhotos([]);
                firstError = firstError !== null && firstError !== void 0 ? firstError : mediaResult.reason;
            }
            if (firstError && overviewResult.status !== 'fulfilled' && mediaResult.status !== 'fulfilled') {
                throw firstError;
            }
        }
        catch (e) {
            const msg = e instanceof ApiError ? e.message : String((_r = e === null || e === void 0 ? void 0 : e.message) !== null && _r !== void 0 ? _r : e);
            setOverviewError(msg);
        }
        finally {
            setIsLoadingOverview(false);
        }
    }), [apiAccessToken, t]);
    const loadOverview = useCallback((force = false) => {
        if (!apiAccessToken) {
            setOverview(null);
            setOverviewError(t('Log in to load overview.'));
            return Promise.resolve();
        }
        const now = Date.now();
        const recent = now - lastLoadRequestRef.current < 400;
        if (!force && recent) {
            return new Promise((resolve) => {
                if (loadDebounceRef.current) {
                    clearTimeout(loadDebounceRef.current);
                }
                loadDebounceRef.current = setTimeout(() => {
                    lastLoadRequestRef.current = Date.now();
                    if (loadInFlightRef.current) {
                        loadInFlightRef.current.finally(() => resolve());
                        return;
                    }
                    const task = performLoadOverview(force);
                    loadInFlightRef.current = task;
                    task.finally(() => {
                        loadInFlightRef.current = null;
                        resolve();
                    });
                }, 350);
            });
        }
        lastLoadRequestRef.current = now;
        if (loadInFlightRef.current) {
            return loadInFlightRef.current;
        }
        const task = performLoadOverview(force);
        loadInFlightRef.current = task;
        task.finally(() => {
            loadInFlightRef.current = null;
        });
        return task;
    }, [apiAccessToken, performLoadOverview, t]);
    useFocusEffect(useCallback(() => {
        loadOverview(false);
    }, [loadOverview]));
    const loadUnreadNotificationsCount = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _s;
        if (!apiAccessToken) {
            setUnreadNotificationsCount(0);
            return;
        }
        try {
            const resp = yield getNotifications(apiAccessToken, { limit: 1, offset: 0 });
            const count = Number((_s = resp === null || resp === void 0 ? void 0 : resp.unread_count) !== null && _s !== void 0 ? _s : 0);
            setUnreadNotificationsCount(Number.isFinite(count) && count > 0 ? count : 0);
        }
        catch (_t) {
            setUnreadNotificationsCount(0);
        }
    }), [apiAccessToken]);
    useFocusEffect(useCallback(() => {
        loadUnreadNotificationsCount();
    }, [loadUnreadNotificationsCount]));
    const handleRefresh = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        if (refreshingFeed)
            return;
        setRefreshingFeed(true);
        try {
            yield loadOverview(true);
            setFeedVisibleCount(HOME_FEED_PAGE_SIZE);
        }
        finally {
            setRefreshingFeed(false);
        }
    }), [loadOverview, refreshingFeed]);
    useEffect(() => {
        if (isFocused) {
            setResumeVideoAt(videoResumeRef.current || 0);
        }
    }, [isFocused]);
    useEffect(() => {
        var _a;
        if (!enableSharedOverlay)
            return;
        const media = (_a = overviewVideo !== null && overviewVideo !== void 0 ? overviewVideo : topVideos[0]) !== null && _a !== void 0 ? _a : null;
        if (!media || !overviewInlineVideoUrl)
            return;
        if (!overlayVisible) {
            setOverlayMedia(media);
            setOverlayVideoUrl((prev) => (prev === overviewInlineVideoUrl ? prev : overviewInlineVideoUrl));
        }
    }, [enableSharedOverlay, overviewInlineVideoUrl, overviewVideo, topVideos, overlayVisible]);
    useEffect(() => {
        var _a, _b, _c;
        if (overlayVisible || !overlayVideoUrl)
            return;
        const resumeTime = (_c = (_b = (_a = resumeByUrlRef.current[overlayVideoUrl]) !== null && _a !== void 0 ? _a : videoResumeRef.current) !== null && _b !== void 0 ? _b : overlayCurrentTime) !== null && _c !== void 0 ? _c : 0;
        if (!Number.isFinite(resumeTime) || resumeTime <= 0)
            return;
        requestAnimationFrame(() => {
            var _a;
            (_a = overlayVideoRef.current) === null || _a === void 0 ? void 0 : _a.seek(resumeTime);
        });
        const timer = setTimeout(() => {
            var _a;
            (_a = overlayVideoRef.current) === null || _a === void 0 ? void 0 : _a.seek(resumeTime);
        }, 150);
        return () => clearTimeout(timer);
    }, [overlayVisible, overlayVideoUrl, overlayCurrentTime]);
    const apiBaseUrl = useMemo(() => {
        return getApiBaseUrl();
    }, []);
    const hlsBaseUrl = useMemo(() => {
        return getHlsBaseUrl();
    }, []);
    const toAbsoluteUrl = useCallback((value) => {
        if (!value)
            return null;
        const str = String(value);
        if (str.startsWith('http://') || str.startsWith('https://'))
            return str;
        return `${apiBaseUrl}${str.startsWith('/') ? '' : '/'}${str}`;
    }, [apiBaseUrl]);
    useEffect(() => {
        if (!apiAccessToken || !isFocused)
            return;
        let mounted = true;
        getProfileSummary(apiAccessToken)
            .then((summary) => {
            var _a, _b, _c;
            if (!mounted)
                return;
            const avatarMedia = (_b = (_a = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _a === void 0 ? void 0 : _a.avatar_media) !== null && _b !== void 0 ? _b : null;
            const avatarCandidate = (avatarMedia === null || avatarMedia === void 0 ? void 0 : avatarMedia.thumbnail_url) ||
                (avatarMedia === null || avatarMedia === void 0 ? void 0 : avatarMedia.preview_url) ||
                (avatarMedia === null || avatarMedia === void 0 ? void 0 : avatarMedia.full_url) ||
                (avatarMedia === null || avatarMedia === void 0 ? void 0 : avatarMedia.raw_url) ||
                (avatarMedia === null || avatarMedia === void 0 ? void 0 : avatarMedia.original_url) ||
                ((_c = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _c === void 0 ? void 0 : _c.avatar_url) ||
                null;
            if (avatarCandidate) {
                const resolved = toAbsoluteUrl(String(avatarCandidate));
                setProfileAvatarUrl(resolved);
            }
            else {
                setProfileAvatarUrl(null);
            }
        })
            .catch(() => { });
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, isFocused, toAbsoluteUrl]);
    const toHlsUrl = useCallback((value) => {
        if (!value)
            return null;
        const str = String(value);
        if (str.startsWith('http://') || str.startsWith('https://'))
            return str;
        return `${hlsBaseUrl}${str.startsWith('/') ? '' : '/'}${str}`;
    }, [hlsBaseUrl]);
    const formatTimeAgo = useCallback((value) => {
        if (!value)
            return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime()))
            return '';
        const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
        if (diffSeconds < 60)
            return 'just now';
        const minutes = Math.floor(diffSeconds / 60);
        if (minutes < 60)
            return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24)
            return `${hours} hour${hours === 1 ? '' : 's'} ago`;
        const days = Math.floor(hours / 24);
        if (days < 7)
            return `${days} day${days === 1 ? '' : 's'} ago`;
        return date.toLocaleDateString();
    }, []);
    const formatUploadDate = useCallback((value) => {
        const date = value ? new Date(value) : new Date();
        if (Number.isNaN(date.getTime()))
            return new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    }, []);
    const formatPostTime = useCallback((value) => {
        if (!value)
            return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime()))
            return '';
        const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
        if (diffSeconds < 60)
            return t('just now');
        const minutes = Math.floor(diffSeconds / 60);
        if (minutes < 60)
            return `${minutes}${t('m ago')}`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24)
            return `${hours}${t('h ago')}`;
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    }, [t]);
    const pickDescription = useCallback((title, description, fallback) => {
        const trimmedTitle = (title !== null && title !== void 0 ? title : '').trim();
        const trimmedDesc = (description !== null && description !== void 0 ? description : '').trim();
        const fallbackText = (fallback !== null && fallback !== void 0 ? fallback : '').trim();
        const candidate = trimmedDesc || fallbackText;
        if (!candidate)
            return '';
        if (trimmedTitle && candidate.toLowerCase() === trimmedTitle.toLowerCase()) {
            return '';
        }
        return candidate;
    }, []);
    const formatLikesLabel = useCallback((media) => {
        var _a, _b;
        if (!media)
            return '';
        const raw = Number((_b = (_a = media.likes_count) !== null && _a !== void 0 ? _a : media.likesCount) !== null && _b !== void 0 ? _b : 0);
        const count = Number.isFinite(raw) && raw > 0 ? raw : 0;
        return `${count.toLocaleString()} ${t('likes')}`;
    }, [t]);
    const formatViewsLabel = useCallback((media) => {
        var _a, _b;
        if (!media)
            return '';
        const raw = Number((_b = (_a = media.views_count) !== null && _a !== void 0 ? _a : media.viewsCount) !== null && _b !== void 0 ? _b : 0);
        const count = Number.isFinite(raw) && raw > 0 ? raw : 0;
        return count.toLocaleString();
    }, []);
    const getInstagramStoryMatchLabel = useCallback((media) => {
        if (!media)
            return '';
        const tokens = new Set();
        const ingest = (value) => {
            const normalized = String(value !== null && value !== void 0 ? value : '').trim().toLowerCase();
            if (!normalized)
                return;
            if (normalized.includes('face'))
                tokens.add('face');
            if (normalized.includes('bib') || normalized.includes('chest') || normalized.includes('number'))
                tokens.add('bib');
            if (normalized.includes('context'))
                tokens.add('context');
        };
        const rawMatchTypes = Array.isArray(media === null || media === void 0 ? void 0 : media.match_types)
            ? media.match_types
            : [];
        rawMatchTypes.forEach(ingest);
        ingest(media === null || media === void 0 ? void 0 : media.match_type);
        ingest(media === null || media === void 0 ? void 0 : media.matchType);
        if (tokens.has('face') && tokens.has('bib'))
            return 'Face + Chest';
        if (tokens.has('face'))
            return 'Face';
        if (tokens.has('bib'))
            return 'Chest';
        if (tokens.has('context'))
            return 'Context';
        return '';
    }, []);
    const getInstagramStoryEventLabel = useCallback((media) => {
        return String((media === null || media === void 0 ? void 0 : media.event_name)
            || (media === null || media === void 0 ? void 0 : media.competition_name)
            || ((media === null || media === void 0 ? void 0 : media.event_id) ? eventNameById(media.event_id) : '')
            || '').trim();
    }, [eventNameById]);
    const handleToggleLike = useCallback((mediaId) => __awaiter(void 0, void 0, void 0, function* () {
        var _u;
        const id = String(mediaId || '').trim();
        if (!id || !apiAccessToken)
            return;
        try {
            const r = yield toggleMediaLike(apiAccessToken, id);
            // Update cached overview/media lists in-place (best effort).
            setOverview((prev) => {
                var _a, _b, _c;
                if (!prev)
                    return prev;
                const next = JSON.parse(JSON.stringify(prev));
                const slots = ['video', 'photo'];
                for (const k of slots) {
                    const m = (_a = next === null || next === void 0 ? void 0 : next.overview) === null || _a === void 0 ? void 0 : _a[k];
                    if (m && String(m.media_id) === id) {
                        m.likes_count = r.likes_count;
                        m.liked_by_me = r.liked;
                    }
                }
                if (((_c = (_b = next === null || next === void 0 ? void 0 : next.overview) === null || _b === void 0 ? void 0 : _b.blog) === null || _c === void 0 ? void 0 : _c.media) && String(next.overview.blog.media.media_id) === id) {
                    next.overview.blog.media.likes_count = r.likes_count;
                    next.overview.blog.media.liked_by_me = r.liked;
                }
                return next;
            });
            setAllVideos((prev) => prev.map((x) => (String(x.media_id) === id ? Object.assign(Object.assign({}, x), { likes_count: r.likes_count, liked_by_me: r.liked }) : x)));
            setAllPhotos((prev) => prev.map((x) => (String(x.media_id) === id ? Object.assign(Object.assign({}, x), { likes_count: r.likes_count, liked_by_me: r.liked }) : x)));
        }
        catch (e) {
            const msg = e instanceof ApiError ? e.message : String((_u = e === null || e === void 0 ? void 0 : e.message) !== null && _u !== void 0 ? _u : e);
            Alert.alert(t('Like failed'), msg || t('Could not update like right now.'));
        }
    }), [apiAccessToken, t]);
    const handleTogglePostLike = useCallback((postId) => __awaiter(void 0, void 0, void 0, function* () {
        var _v;
        const id = String(postId || '').trim();
        if (!id || !apiAccessToken)
            return;
        try {
            const r = yield togglePostLike(apiAccessToken, id);
            setOverview((prev) => {
                var _a, _b, _c;
                if (!prev)
                    return prev;
                const next = JSON.parse(JSON.stringify(prev));
                if (((_b = (_a = next === null || next === void 0 ? void 0 : next.overview) === null || _a === void 0 ? void 0 : _a.blog) === null || _b === void 0 ? void 0 : _b.post) && String(next.overview.blog.post.id) === id) {
                    next.overview.blog.post.likes_count = r.likes_count;
                    next.overview.blog.post.liked_by_me = r.liked;
                }
                if (Array.isArray((_c = next === null || next === void 0 ? void 0 : next.overview) === null || _c === void 0 ? void 0 : _c.feed_posts)) {
                    next.overview.feed_posts = next.overview.feed_posts.map((entry) => {
                        var _a;
                        return String(((_a = entry === null || entry === void 0 ? void 0 : entry.post) === null || _a === void 0 ? void 0 : _a.id) || '') === id
                            ? Object.assign(Object.assign({}, entry), { post: Object.assign(Object.assign({}, entry.post), { likes_count: r.likes_count, liked_by_me: r.liked }) }) : entry;
                    });
                }
                return next;
            });
        }
        catch (e) {
            const msg = e instanceof ApiError ? e.message : String((_v = e === null || e === void 0 ? void 0 : e.message) !== null && _v !== void 0 ? _v : e);
            Alert.alert(t('Like failed'), msg || t('Could not update like right now.'));
        }
    }), [apiAccessToken, t]);
    const formatDuration = useCallback((value) => {
        const safeValue = Number.isFinite(value) ? Math.max(0, value) : 0;
        const minutes = Math.floor(safeValue / 60);
        const seconds = Math.floor(safeValue % 60);
        const paddedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
        return `${minutes}:${paddedSeconds}`;
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
    const getFileExtension = useCallback((value) => {
        if (!value)
            return '';
        const clean = String(value).split('?')[0];
        const match = clean.match(/\.([a-z0-9]+)$/i);
        return match ? match[1].toLowerCase() : '';
    }, []);
    const pickDownloadUrl = useCallback((media) => {
        if (!media)
            return null;
        const candidates = [
            media.original_url,
            media.full_url,
            media.raw_url,
            media.preview_url,
            media.thumbnail_url,
        ]
            .filter(Boolean)
            .map((value) => {
            const absolute = toAbsoluteUrl(String(value));
            return withAccessToken(absolute || '') || absolute || '';
        })
            .filter(Boolean);
        if (media.type === 'video') {
            const mp4 = candidates.find((value) => /\.(mp4|mov|m4v)(\?|$)/i.test(value));
            return mp4 || candidates[0] || null;
        }
        const image = candidates.find((value) => /\.(jpg|jpeg|png|webp|heic)(\?|$)/i.test(value));
        return image || candidates[0] || null;
    }, [toAbsoluteUrl, withAccessToken]);
    const buildDownloadPath = useCallback((media, sourceUrl) => {
        const ext = getFileExtension(sourceUrl) || (media.type === 'video' ? 'mp4' : 'jpg');
        const safeId = String(media.media_id || 'media').replace(/[^a-z0-9_-]/gi, '');
        const fileName = `allin_${safeId}_${Date.now()}.${ext}`;
        return `${RNFS.CachesDirectoryPath}/${fileName}`;
    }, [getFileExtension]);
    const getMediaShareUrl = useCallback((media) => {
        if (!media)
            return '';
        const hls = media.hls_manifest_path ? toHlsUrl(media.hls_manifest_path) : null;
        if (hls)
            return withAccessToken(hls) || hls;
        const url = media.preview_url || media.original_url || media.full_url || media.raw_url || null;
        return url ? withAccessToken(toAbsoluteUrl(url) || '') || '' : '';
    }, [toAbsoluteUrl, toHlsUrl, withAccessToken]);
    const handleShareMedia = useCallback((media) => __awaiter(void 0, void 0, void 0, function* () {
        const url = getMediaShareUrl(media);
        if (!url) {
            Alert.alert(t('Share unavailable'), t('No media link available yet.'));
            return;
        }
        try {
            yield Share.share({ message: url, url });
        }
        catch (_w) {
            // ignore share cancellation
        }
    }), [getMediaShareUrl, t]);
    const getInstagramShareEventTitle = useCallback((media) => {
        var _a;
        const eventName = (media === null || media === void 0 ? void 0 : media.event_id) ? String(eventNameById(media.event_id) || '').trim() : '';
        if (eventName) {
            return eventName;
        }
        const fallbackTitle = String((_a = media === null || media === void 0 ? void 0 : media.title) !== null && _a !== void 0 ? _a : '').trim();
        return fallbackTitle || null;
    }, [eventNameById]);
    const getInstagramShareMatchLabel = useCallback((media) => {
        const rawValues = [
            media === null || media === void 0 ? void 0 : media.match_type,
            media === null || media === void 0 ? void 0 : media.matchType,
            ...(Array.isArray(media === null || media === void 0 ? void 0 : media.match_types) ? media.match_types : []),
            ...(Array.isArray(media === null || media === void 0 ? void 0 : media.matchTypes) ? media.matchTypes : []),
        ];
        const normalized = rawValues
            .map((value) => String(value !== null && value !== void 0 ? value : '').trim().toLowerCase())
            .filter(Boolean);
        if (normalized.length === 0) {
            return null;
        }
        const has = (value) => normalized.includes(value);
        if (has('combined') || ((has('face') || has('facial')) && (has('bib') || has('chest')))) {
            return t('Face + Chest');
        }
        if (has('face') || has('facial')) {
            return t('Face');
        }
        if (has('bib') || has('chest')) {
            return t('Chest');
        }
        if (has('context')) {
            return t('Context');
        }
        return null;
    }, [t]);
    const handleShareMediaInstagram = useCallback((media) => __awaiter(void 0, void 0, void 0, function* () {
        var _x;
        if (!(media === null || media === void 0 ? void 0 : media.media_id)) {
            Alert.alert(t('Share unavailable'), t('No media available yet.'));
            return;
        }
        if (downloadInFlightRef.current) {
            return;
        }
        const sourceUrl = pickDownloadUrl(media);
        if (!sourceUrl) {
            Alert.alert(t('Share unavailable'), t('This media is not ready to share.'));
            return;
        }
        if (sourceUrl.toLowerCase().includes('.m3u8')) {
            Alert.alert(t('Share unavailable'), t('This video is streaming-only right now. Try again later.'));
            return;
        }
        downloadInFlightRef.current = true;
        setDownloadProgress(null);
        setDownloadVisible(true);
        const localPath = buildDownloadPath(media, sourceUrl);
        try {
            const download = RNFS.downloadFile({
                fromUrl: sourceUrl,
                toFile: localPath,
                background: true,
                progressDivider: 5,
                progress: (res) => {
                    if (!res || !res.bytesExpected) {
                        setDownloadProgress(null);
                        return;
                    }
                    const ratio = Math.min(1, Math.max(0, res.bytesWritten / res.bytesExpected));
                    setDownloadProgress(ratio);
                },
            }).promise;
            yield download;
            const exists = yield RNFS.exists(localPath);
            if (!exists) {
                throw new Error('Download failed');
            }
            const fileUrl = `file://${localPath}`;
            const storyTitle = media.type === 'video' ? null : getInstagramShareEventTitle(media);
            const storySubtitle = media.type === 'video' ? null : getInstagramShareMatchLabel(media);
            yield shareMediaToInstagramStory({
                t,
                composeInstagramStoryImage,
                localAssetUrl: fileUrl,
                isVideo: media.type === 'video',
                title: storyTitle,
                subtitle: storySubtitle,
            });
        }
        catch (e) {
            const msg = String((_x = e === null || e === void 0 ? void 0 : e.message) !== null && _x !== void 0 ? _x : t('Instagram Story failed'));
            if (!/cancel/i.test(msg)) {
                Alert.alert(t('Instagram Story failed'), msg);
            }
        }
        finally {
            setDownloadVisible(false);
            setDownloadProgress(null);
            downloadInFlightRef.current = false;
        }
    }), [buildDownloadPath, composeInstagramStoryImage, getInstagramShareEventTitle, getInstagramShareMatchLabel, pickDownloadUrl, t]);
    const resolvePostInstagramImage = useCallback((post) => __awaiter(void 0, void 0, void 0, function* () {
        const pickMediaUrl = (media) => {
            const candidate = (media === null || media === void 0 ? void 0 : media.type) !== 'video'
                ? ((media === null || media === void 0 ? void 0 : media.thumbnail_url) ||
                    (media === null || media === void 0 ? void 0 : media.preview_url) ||
                    (media === null || media === void 0 ? void 0 : media.original_url) ||
                    (media === null || media === void 0 ? void 0 : media.full_url) ||
                    (media === null || media === void 0 ? void 0 : media.raw_url) ||
                    null)
                : null;
            if (!candidate) {
                return null;
            }
            return withAccessToken(toAbsoluteUrl(String(candidate)) || '') || null;
        };
        if (apiAccessToken && (post === null || post === void 0 ? void 0 : post.id)) {
            try {
                const detail = yield getPostById(apiAccessToken, String(post.id));
                const firstImage = Array.isArray(detail === null || detail === void 0 ? void 0 : detail.media)
                    ? detail.media.find((media) => { var _a; return String((_a = media === null || media === void 0 ? void 0 : media.type) !== null && _a !== void 0 ? _a : '').toLowerCase() !== 'video'; })
                    : null;
                const detailedUrl = pickMediaUrl(firstImage);
                if (detailedUrl) {
                    return detailedUrl;
                }
            }
            catch (_y) {
                // fall back to summary cover media
            }
        }
        return pickMediaUrl(post === null || post === void 0 ? void 0 : post.cover_media);
    }), [apiAccessToken, toAbsoluteUrl, withAccessToken]);
    const getPostShareMessage = useCallback((post) => {
        if (!post)
            return t('Latest blog');
        return post.title
            ? String(post.title)
            : String(post.summary || post.description || t('Latest blog'));
    }, [t]);
    const handleSharePost = useCallback((post) => __awaiter(void 0, void 0, void 0, function* () {
        if (!post)
            return;
        try {
            yield NativeShare.open({
                message: getPostShareMessage(post),
                subject: (post === null || post === void 0 ? void 0 : post.title) ? String(post.title) : undefined,
            });
        }
        catch (_z) {
            // ignore
        }
    }), [getPostShareMessage]);
    const handleSharePostInstagram = useCallback((post) => __awaiter(void 0, void 0, void 0, function* () {
        var _0;
        if (!post)
            return;
        try {
            const resolvedCoverImage = yield resolvePostInstagramImage(post);
            yield shareBlogToInstagramStory({
                t,
                composeInstagramStoryImage,
                imageUri: resolvedCoverImage,
                title: getPostShareMessage(post),
                subtitle: pickDescription(post.title, post.summary, post.description),
            });
        }
        catch (e) {
            const msg = String((_0 = e === null || e === void 0 ? void 0 : e.message) !== null && _0 !== void 0 ? _0 : t('Instagram Story failed'));
            if (!/cancel/i.test(msg)) {
                Alert.alert(t('Instagram Story failed'), msg);
            }
        }
    }), [composeInstagramStoryImage, getPostShareMessage, pickDescription, resolvePostInstagramImage, t]);
    const openPostShareOptions = useCallback((post) => {
        if (!post)
            return;
        Alert.alert(t('Share'), undefined, [
            { text: t('Cancel'), style: 'cancel' },
            { text: t('Share'), onPress: () => { handleSharePost(post).catch(() => { }); } },
            {
                text: t('Share to Instagram Story'),
                onPress: () => { handleSharePostInstagram(post).catch(() => { }); },
            },
        ]);
    }, [handleSharePost, handleSharePostInstagram, t]);
    const handleDownloadMedia = useCallback((media) => __awaiter(void 0, void 0, void 0, function* () {
        var _1;
        if (!(media === null || media === void 0 ? void 0 : media.media_id)) {
            Alert.alert(t('Download unavailable'), t('No media available yet.'));
            return;
        }
        if (downloadInFlightRef.current) {
            return;
        }
        const sourceUrl = pickDownloadUrl(media);
        if (!sourceUrl) {
            Alert.alert(t('Download unavailable'), t('This media is not ready to download.'));
            return;
        }
        if (sourceUrl.toLowerCase().includes('.m3u8')) {
            Alert.alert(t('Download unavailable'), t('This video is streaming-only right now. Try again later.'));
            return;
        }
        downloadInFlightRef.current = true;
        setDownloadProgress(null);
        setDownloadVisible(true);
        if (apiAccessToken) {
            recordDownload(apiAccessToken, { media_id: media.media_id, event_id: (_1 = media.event_id) !== null && _1 !== void 0 ? _1 : undefined }).catch(() => { });
        }
        const localPath = buildDownloadPath(media, sourceUrl);
        try {
            const download = RNFS.downloadFile({
                fromUrl: sourceUrl,
                toFile: localPath,
                background: true,
                progressDivider: 5,
                progress: (res) => {
                    if (!res || !res.bytesExpected) {
                        setDownloadProgress(null);
                        return;
                    }
                    const ratio = Math.min(1, Math.max(0, res.bytesWritten / res.bytesExpected));
                    setDownloadProgress(ratio);
                },
            }).promise;
            yield download;
            const exists = yield RNFS.exists(localPath);
            if (!exists) {
                throw new Error('Download failed');
            }
            const fileUrl = `file://${localPath}`;
            const extension = getFileExtension(localPath) || (media.type === 'video' ? 'mp4' : 'jpg');
            const filename = `allin_${media.media_id}.${extension}`;
            yield NativeShare.open({
                urls: [fileUrl],
                type: media.type === 'video' ? 'video/mp4' : 'image/jpeg',
                filename,
                failOnCancel: false,
                showAppsToView: true,
            });
        }
        catch (e) {
            const msg = e instanceof ApiError ? e.message : t('Download failed');
            Alert.alert(t('Download failed'), msg);
        }
        finally {
            setDownloadVisible(false);
            setDownloadProgress(null);
            downloadInFlightRef.current = false;
        }
    }), [apiAccessToken, buildDownloadPath, pickDownloadUrl, t]);
    const openFeedMenu = useCallback((media, opts = {}) => {
        const safeMedia = media !== null && media !== void 0 ? media : null;
        const eventName = (safeMedia === null || safeMedia === void 0 ? void 0 : safeMedia.event_id) ? eventNameById(safeMedia.event_id) : undefined;
        const label = opts.title || eventName || t('Event');
        const actions = [
            { label: t('Download'), onPress: () => handleDownloadMedia(safeMedia) },
            { label: t('Share'), onPress: () => handleShareMedia(safeMedia) },
            { label: t('Share to Instagram Story'), onPress: () => handleShareMediaInstagram(safeMedia) },
            {
                label: t('Report an issue with this video/photo'),
                onPress: () => openReportIssuePopup(safeMedia),
            },
            {
                label: t('Go to author profile'),
                onPress: () => navigation.navigate('BottomTabBar', { screen: 'Profile' }),
            },
            {
                label: t('Go to event'),
                onPress: () => {
                    const location = String((safeMedia === null || safeMedia === void 0 ? void 0 : safeMedia.event_location) || '').trim();
                    const organizer = String((safeMedia === null || safeMedia === void 0 ? void 0 : safeMedia.organizing_club)
                        || (safeMedia === null || safeMedia === void 0 ? void 0 : safeMedia.organizer_club)
                        || '').trim();
                    const eventDate = String((safeMedia === null || safeMedia === void 0 ? void 0 : safeMedia.event_date) || '').trim();
                    const typeToken = `${(safeMedia === null || safeMedia === void 0 ? void 0 : safeMedia.competition_type) || ''} ${label} ${location}`.toLowerCase();
                    const competitionType = /road|trail|marathon|veldloop|veldlopen|cross|5k|10k|half|ultra|city\s*run/.test(typeToken)
                        ? 'road'
                        : 'track';
                    navigation.navigate('CompetitionDetailsScreen', {
                        eventId: (safeMedia === null || safeMedia === void 0 ? void 0 : safeMedia.event_id) ? String(safeMedia.event_id) : undefined,
                        name: label,
                        location,
                        date: eventDate,
                        organizingClub: organizer,
                        competitionType,
                    });
                },
            },
            {
                label: t('Mark as inappropriate content'),
                onPress: () => showInfoPopup(t('Thanks'), t('We will review this content.')),
            },
            {
                label: t('Request this video removed'),
                onPress: () => showInfoPopup(t('Request sent'), t('We will review the removal request.')),
            },
        ];
        if (opts.isVideo) {
            actions.unshift({
                label: t('View in player'),
                onPress: () => {
                    var _a, _b;
                    return navigation.navigate('VideoPlayingScreen', {
                        mediaId: safeMedia === null || safeMedia === void 0 ? void 0 : safeMedia.media_id,
                        video: {
                            title: label,
                            thumbnail: (_a = getMediaThumb(safeMedia)) !== null && _a !== void 0 ? _a : Images.photo1,
                            uri: (_b = pickPlayableVideoUrl(safeMedia)) !== null && _b !== void 0 ? _b : '',
                        },
                    });
                },
            });
        }
        setFeedMenuTitle(label);
        setFeedMenuActions(actions);
        setFeedMenuVisible(true);
    }, [eventNameById, getMediaThumb, handleDownloadMedia, handleShareMedia, handleShareMediaInstagram, navigation, openReportIssuePopup, pickPlayableVideoUrl, showInfoPopup, t]);
    const pickPlayableVideoUrl = useCallback((media) => {
        if (!media)
            return null;
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
        if (mp4)
            return mp4;
        const hls = media.hls_manifest_path ? toHlsUrl(media.hls_manifest_path) : null;
        return hls || candidates[0] || null;
    }, [toAbsoluteUrl, toHlsUrl]);
    const prewarmVideo = useCallback((url) => {
        if (!url)
            return;
        try {
            const isHls = url.toLowerCase().includes('.m3u8');
            if (!isHls) {
                const headers = { Range: 'bytes=0-65535' };
                fetch(url, { method: 'GET', headers }).catch(() => { });
                return;
            }
            fetch(url, { method: 'GET' })
                .then((res) => res.text())
                .then((text) => {
                const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
                const segmentLine = lines.find((line) => !line.startsWith('#'));
                if (!segmentLine)
                    return;
                let segmentUrl = segmentLine;
                if (!/^https?:\/\//i.test(segmentLine)) {
                    const base = url.split('?')[0];
                    const prefix = base.substring(0, base.lastIndexOf('/') + 1);
                    segmentUrl = `${prefix}${segmentLine}`;
                }
                fetch(segmentUrl, { method: 'GET' }).catch(() => { });
            })
                .catch(() => { });
        }
        catch (_a) {
            // ignore warm failures
        }
    }, []);
    const openOverlayPlayer = useCallback((media, inlineUrl, startAt = 0) => {
        var _a;
        if (!media)
            return;
        const rect = sharedVideoRectRef.current;
        const canUseShared = rect && rect.width > 0 && rect.height > 0;
        if (!canUseShared) {
            buildMediaCardPress(media, startAt, inlineUrl || undefined);
            return;
        }
        const playerUrl = withAccessToken(pickPlayableVideoUrl(media) || inlineUrl || '');
        if (!playerUrl)
            return;
        const storedResume = (_a = resumeByUrlRef.current[playerUrl]) !== null && _a !== void 0 ? _a : 0;
        const resumeTime = Number.isFinite(startAt) && startAt > 0
            ? startAt
            : (overlayVideoUrl === playerUrl ? (videoResumeRef.current || storedResume || 0) : (storedResume || 0));
        const sameSource = overlayVideoUrl && overlayVideoUrl === playerUrl;
        prewarmVideo(playerUrl);
        setOverlayMedia(media);
        if (!sameSource) {
            setOverlayVideoUrl(playerUrl);
            setOverlayDuration(0);
            setOverlayLoading(true);
            setOverlayHasInitialTime(resumeTime > 0);
        }
        else {
            setOverlayLoading(false);
            if (overlayCurrentTime > 0 || resumeTime > 0) {
                setOverlayHasInitialTime(true);
            }
        }
        setOverlayStartAt(resumeTime);
        setOverlayCurrentTime(resumeTime);
        if (resumeTime > 0) {
            pendingSeekRef.current = resumeTime;
            resumeByUrlRef.current[playerUrl] = resumeTime;
        }
        setOverlayPlaying(true);
        setOverlayMuted(true);
        setOverlayVisible(true);
    }, [buildMediaCardPress, overlayCurrentTime, overlayVideoUrl, pickPlayableVideoUrl, prewarmVideo, withAccessToken]);
    const closeOverlayPlayer = useCallback(() => {
        var _a, _b, _c, _d;
        setOverlayVisible(false);
        setOverlayPlaying(true);
        const resumeTime = (_c = (_b = (_a = pendingSeekRef.current) !== null && _a !== void 0 ? _a : videoResumeRef.current) !== null && _b !== void 0 ? _b : overlayCurrentTime) !== null && _c !== void 0 ? _c : 0;
        if (overlayVideoUrl) {
            resumeByUrlRef.current[overlayVideoUrl] = resumeTime;
        }
        videoResumeRef.current = resumeTime;
        setResumeVideoAt(resumeTime);
        if (resumeTime > 0) {
            (_d = overlayVideoRef.current) === null || _d === void 0 ? void 0 : _d.seek(resumeTime);
            requestAnimationFrame(() => {
                var _a;
                (_a = overlayVideoRef.current) === null || _a === void 0 ? void 0 : _a.seek(resumeTime);
            });
        }
        pendingSeekRef.current = null;
        setOverlayStartAt(resumeTime);
        setOverlayCurrentTime(resumeTime);
        setOverlayHasInitialTime(true);
        setOverlayLoading(false);
        updateVisibility();
        updateSharedVideoRect();
    }, [overlayCurrentTime, updateSharedVideoRect, updateVisibility]);
    const overviewVideo = (_c = (_b = overview === null || overview === void 0 ? void 0 : overview.overview) === null || _b === void 0 ? void 0 : _b.video) !== null && _c !== void 0 ? _c : null;
    const overviewPhoto = (_e = (_d = overview === null || overview === void 0 ? void 0 : overview.overview) === null || _d === void 0 ? void 0 : _d.photo) !== null && _e !== void 0 ? _e : null;
    const overviewBlog = (_g = (_f = overview === null || overview === void 0 ? void 0 : overview.overview) === null || _f === void 0 ? void 0 : _f.blog) !== null && _g !== void 0 ? _g : null;
    const sortByNewest = useCallback((items) => {
        return [...items].sort((a, b) => {
            var _a, _b;
            const aDate = new Date(String((_a = a.created_at) !== null && _a !== void 0 ? _a : '')).getTime();
            const bDate = new Date(String((_b = b.created_at) !== null && _b !== void 0 ? _b : '')).getTime();
            if (Number.isNaN(aDate) || Number.isNaN(bDate))
                return 0;
            return bDate - aDate;
        });
    }, []);
    const mediaDedupFingerprint = useCallback((media) => {
        if (!media)
            return '';
        const stripQuery = (value) => String(value || '').trim().split('?')[0] || '';
        const assetKeys = Array.isArray(media.assets)
            ? media.assets
                .map((a) => String((a === null || a === void 0 ? void 0 : a.storage_key) || '').trim())
                .filter(Boolean)
                .sort()
                .join('|')
            : '';
        const urlKey = [
            stripQuery(media.thumbnail_url),
            stripQuery(media.preview_url),
            stripQuery(media.original_url),
            stripQuery(media.full_url),
            stripQuery(media.raw_url),
        ]
            .filter(Boolean)
            .join('|');
        return assetKeys || urlKey || '';
    }, []);
    const topVideos = useMemo(() => {
        const unique = [];
        sortByNewest(allVideos).forEach((item) => {
            if (unique.find((existing) => existing.media_id === item.media_id))
                return;
            unique.push(item);
        });
        return unique;
    }, [allVideos, sortByNewest]);
    const topPhotos = useMemo(() => {
        const unique = [];
        sortByNewest(allPhotos).forEach((item) => {
            if (unique.find((existing) => existing.media_id === item.media_id))
                return;
            unique.push(item);
        });
        return unique;
    }, [allPhotos, sortByNewest]);
    const infiniteFeedItems = useMemo(() => {
        var _a, _b, _c;
        const sourcePosts = Array.isArray((_a = overview === null || overview === void 0 ? void 0 : overview.overview) === null || _a === void 0 ? void 0 : _a.feed_posts) && ((_b = overview === null || overview === void 0 ? void 0 : overview.overview) === null || _b === void 0 ? void 0 : _b.feed_posts.length)
            ? overview.overview.feed_posts
            : ((_c = overview === null || overview === void 0 ? void 0 : overview.overview) === null || _c === void 0 ? void 0 : _c.blog)
                ? [overview.overview.blog]
                : [];
        const postItems = sourcePosts
            .map((entry) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
            return ({
                kind: 'post',
                created_at: (_b = (_a = entry === null || entry === void 0 ? void 0 : entry.post) === null || _a === void 0 ? void 0 : _a.created_at) !== null && _b !== void 0 ? _b : null,
                post: {
                    id: entry.post.id,
                    title: (_c = entry.post.title) !== null && _c !== void 0 ? _c : '',
                    summary: (_d = entry.post.summary) !== null && _d !== void 0 ? _d : undefined,
                    description: (_e = entry.post.description) !== null && _e !== void 0 ? _e : undefined,
                    created_at: (_f = entry.post.created_at) !== null && _f !== void 0 ? _f : undefined,
                    likes_count: (_g = entry.post.likes_count) !== null && _g !== void 0 ? _g : 0,
                    liked_by_me: (_h = entry.post.liked_by_me) !== null && _h !== void 0 ? _h : false,
                    reading_time_minutes: (_j = entry.post.reading_time_minutes) !== null && _j !== void 0 ? _j : undefined,
                    views_count: (_k = entry.post.views_count) !== null && _k !== void 0 ? _k : 0,
                    author: entry.author
                        ? {
                            profile_id: (_l = entry.author.profile_id) !== null && _l !== void 0 ? _l : '',
                            display_name: (_m = entry.author.display_name) !== null && _m !== void 0 ? _m : undefined,
                            avatar_url: (_o = entry.author.avatar_url) !== null && _o !== void 0 ? _o : undefined,
                        }
                        : undefined,
                },
            });
        });
        const mediaItems = [...allVideos, ...allPhotos].map((media) => {
            var _a;
            return ({
                kind: 'media',
                created_at: (_a = media === null || media === void 0 ? void 0 : media.created_at) !== null && _a !== void 0 ? _a : null,
                media,
            });
        });
        const sorted = [...postItems, ...mediaItems].sort((a, b) => {
            const aTs = new Date(String(a.created_at || '')).getTime();
            const bTs = new Date(String(b.created_at || '')).getTime();
            const safeA = Number.isFinite(aTs) ? aTs : 0;
            const safeB = Number.isFinite(bTs) ? bTs : 0;
            return safeB - safeA;
        });
        const seenFeedKeys = new Set();
        return sorted.filter((entry) => {
            var _a, _b, _c, _d;
            const key = entry.kind === 'media'
                ? `media:${String(((_a = entry.media) === null || _a === void 0 ? void 0 : _a.media_id) || '').trim() || mediaDedupFingerprint(entry.media)}`
                : `post:${String(((_b = entry.post) === null || _b === void 0 ? void 0 : _b.id) || '').trim() || `${String(((_c = entry.post) === null || _c === void 0 ? void 0 : _c.created_at) || '')}|${String(((_d = entry.post) === null || _d === void 0 ? void 0 : _d.title) || '')}`}`;
            if (!key || seenFeedKeys.has(key))
                return false;
            seenFeedKeys.add(key);
            return true;
        });
    }, [allPhotos, allVideos, mediaDedupFingerprint, overview]);
    useEffect(() => {
        setFeedVisibleCount((prev) => {
            const target = Math.min(HOME_FEED_PAGE_SIZE, infiniteFeedItems.length);
            if (prev === target)
                return prev;
            return target;
        });
    }, [infiniteFeedItems.length]);
    const visibleFeedItems = useMemo(() => infiniteFeedItems.slice(0, feedVisibleCount), [feedVisibleCount, infiniteFeedItems]);
    const hasMoreFeedItems = feedVisibleCount < infiniteFeedItems.length;
    const hasOverviewContent = Boolean(((_h = overview === null || overview === void 0 ? void 0 : overview.overview) === null || _h === void 0 ? void 0 : _h.video)
        || ((_j = overview === null || overview === void 0 ? void 0 : overview.overview) === null || _j === void 0 ? void 0 : _j.photo)
        || ((_k = overview === null || overview === void 0 ? void 0 : overview.overview) === null || _k === void 0 ? void 0 : _k.blog)
        || (((_o = (_m = (_l = overview === null || overview === void 0 ? void 0 : overview.overview) === null || _l === void 0 ? void 0 : _l.feed_posts) === null || _m === void 0 ? void 0 : _m.length) !== null && _o !== void 0 ? _o : 0) > 0));
    const perfReady = !isLoadingOverview && (overview !== null || overviewError !== null);
    const loadMoreFeedItems = useCallback(() => {
        if (!hasMoreFeedItems)
            return;
        const now = Date.now();
        if (now - feedLoadThrottleRef.current < 250)
            return;
        feedLoadThrottleRef.current = now;
        setFeedVisibleCount((prev) => Math.min(prev + HOME_FEED_PAGE_SIZE, infiniteFeedItems.length));
    }, [hasMoreFeedItems, infiniteFeedItems.length]);
    const overviewInlineVideoUrl = useMemo(() => {
        var _a, _b, _c, _d, _e;
        return withAccessToken(((overviewVideo === null || overviewVideo === void 0 ? void 0 : overviewVideo.hls_manifest_path)
            ? toHlsUrl(overviewVideo.hls_manifest_path)
            : null) ||
            (((_a = topVideos[0]) === null || _a === void 0 ? void 0 : _a.hls_manifest_path)
                ? toHlsUrl(topVideos[0].hls_manifest_path)
                : null) ||
            toAbsoluteUrl((overviewVideo === null || overviewVideo === void 0 ? void 0 : overviewVideo.preview_url) ||
                (overviewVideo === null || overviewVideo === void 0 ? void 0 : overviewVideo.preview_url) ||
                (overviewVideo === null || overviewVideo === void 0 ? void 0 : overviewVideo.original_url) ||
                (overviewVideo === null || overviewVideo === void 0 ? void 0 : overviewVideo.full_url) ||
                (overviewVideo === null || overviewVideo === void 0 ? void 0 : overviewVideo.raw_url) ||
                ((_b = topVideos[0]) === null || _b === void 0 ? void 0 : _b.preview_url) ||
                ((_c = topVideos[0]) === null || _c === void 0 ? void 0 : _c.original_url) ||
                ((_d = topVideos[0]) === null || _d === void 0 ? void 0 : _d.full_url) ||
                ((_e = topVideos[0]) === null || _e === void 0 ? void 0 : _e.raw_url) ||
                undefined) || undefined);
    }, [
        overviewVideo === null || overviewVideo === void 0 ? void 0 : overviewVideo.hls_manifest_path,
        overviewVideo === null || overviewVideo === void 0 ? void 0 : overviewVideo.preview_url,
        overviewVideo === null || overviewVideo === void 0 ? void 0 : overviewVideo.original_url,
        overviewVideo === null || overviewVideo === void 0 ? void 0 : overviewVideo.full_url,
        overviewVideo === null || overviewVideo === void 0 ? void 0 : overviewVideo.raw_url,
        topVideos,
        toAbsoluteUrl,
        toHlsUrl,
        withAccessToken,
    ]);
    const getMediaThumb = useCallback((item) => {
        if (!item)
            return null;
        const candidate = item.preview_url ||
            item.thumbnail_url ||
            item.full_url ||
            item.raw_url ||
            null;
        if (!candidate)
            return null;
        const absolute = toAbsoluteUrl(candidate);
        const resolved = withAccessToken(absolute || '') || absolute;
        return resolved ? { uri: resolved } : null;
    }, [toAbsoluteUrl, withAccessToken]);
    const blogPrimaryMedia = useMemo(() => {
        return ((overviewBlog === null || overviewBlog === void 0 ? void 0 : overviewBlog.media) ||
            topPhotos[0] ||
            overviewPhoto ||
            overviewVideo ||
            null);
    }, [overviewBlog === null || overviewBlog === void 0 ? void 0 : overviewBlog.media, overviewPhoto, overviewVideo, topPhotos]);
    const blogPrimaryImage = useMemo(() => {
        return getMediaThumb(blogPrimaryMedia) || Images.photo3;
    }, [blogPrimaryMedia, getMediaThumb]);
    const blogExtraVideos = useMemo(() => {
        return topVideos;
    }, [topVideos]);
    const blogGalleryItems = useMemo(() => {
        const buildItem = (media, fallbackImage) => {
            const image = getMediaThumb(media) || fallbackImage || Images.photo3;
            const videoUri = pickPlayableVideoUrl(media);
            const isVideo = Boolean((media === null || media === void 0 ? void 0 : media.type) === 'video' ||
                (videoUri && /\.(m3u8|mp4|mov|m4v)(\?|$)/.test(videoUri.toLowerCase())));
            return {
                image,
                videoUri,
                type: isVideo ? 'video' : 'image',
                media: media !== null && media !== void 0 ? media : null,
            };
        };
        const items = [
            buildItem(blogPrimaryMedia, Images.photo3),
            ...blogExtraVideos.map((item) => buildItem(item, Images.photo3)),
        ];
        return items;
    }, [blogExtraVideos, blogPrimaryMedia, getMediaThumb, toAbsoluteUrl, toHlsUrl]);
    const blogGalleryImages = useMemo(() => blogGalleryItems.map((item) => item.image), [blogGalleryItems]);
    const blogMediaCounts = useMemo(() => {
        let photos = 0;
        let videos = 0;
        blogGalleryItems.forEach((item) => {
            if (item.type === 'video') {
                videos += 1;
            }
            else {
                photos += 1;
            }
        });
        return { photos, videos };
    }, [blogGalleryItems]);
    const blogMediaCountsLabel = useMemo(() => {
        const parts = [];
        if (blogMediaCounts.photos > 0)
            parts.push(`${blogMediaCounts.photos} photo${blogMediaCounts.photos === 1 ? '' : 's'}`);
        if (blogMediaCounts.videos > 0)
            parts.push(`${blogMediaCounts.videos} video${blogMediaCounts.videos === 1 ? '' : 's'}`);
        if (parts.length === 0)
            return 'No media';
        return parts.join(' • ');
    }, [blogMediaCounts]);
    const extractProfileIdFromMedia = useCallback((item) => {
        if (!item)
            return null;
        const fromAny = (item === null || item === void 0 ? void 0 : item.uploader_profile_id) ||
            (item === null || item === void 0 ? void 0 : item.profile_id) ||
            (item === null || item === void 0 ? void 0 : item.author_profile_id) ||
            (item === null || item === void 0 ? void 0 : item.owner_profile_id) ||
            null;
        return fromAny ? String(fromAny) : null;
    }, []);
    useEffect(() => {
        if (!apiAccessToken)
            return;
        const missing = [];
        visibleFeedItems.forEach((entry) => {
            if (entry.kind !== 'media')
                return;
            const profileId = String(extractProfileIdFromMedia(entry.media) || '').trim();
            if (!profileId)
                return;
            if (uploaderMap[profileId])
                return;
            if (uploaderFetchInFlightRef.current.has(profileId))
                return;
            missing.push(profileId);
        });
        if (missing.length === 0)
            return;
        missing.forEach((profileId) => {
            uploaderFetchInFlightRef.current.add(profileId);
            getProfileSummaryById(apiAccessToken, profileId)
                .then((res) => {
                var _a, _b;
                const displayName = String(((_a = res === null || res === void 0 ? void 0 : res.profile) === null || _a === void 0 ? void 0 : _a.display_name) || '').trim();
                const avatarCandidate = String(((_b = res === null || res === void 0 ? void 0 : res.profile) === null || _b === void 0 ? void 0 : _b.avatar_url) || '').trim();
                setUploaderMap((prev) => (Object.assign(Object.assign({}, prev), { [profileId]: {
                        name: displayName || `@${profileId.slice(0, 8)}`,
                        avatarUrl: avatarCandidate || null,
                    } })));
            })
                .catch(() => { })
                .finally(() => {
                uploaderFetchInFlightRef.current.delete(profileId);
            });
        });
    }, [apiAccessToken, extractProfileIdFromMedia, uploaderMap, visibleFeedItems]);
    const getMediaUploaderInfo = useCallback((media) => {
        const profileId = String(extractProfileIdFromMedia(media) || '').trim();
        const mapped = profileId ? uploaderMap[profileId] : undefined;
        const isSelf = !!profileId && profileId === String((overview === null || overview === void 0 ? void 0 : overview.profile_id) || '').trim();
        const fallbackName = isSelf ? userName : ((mapped === null || mapped === void 0 ? void 0 : mapped.name) || t('Uploader'));
        const fallbackAvatar = isSelf
            ? (profilePic ? { uri: profilePic } : Images.profilePic)
            : (mapped === null || mapped === void 0 ? void 0 : mapped.avatarUrl)
                ? { uri: toAbsoluteUrl(mapped.avatarUrl) }
                : Images.profilePic;
        return {
            profileId,
            name: fallbackName,
            avatar: fallbackAvatar,
        };
    }, [extractProfileIdFromMedia, overview === null || overview === void 0 ? void 0 : overview.profile_id, profilePic, toAbsoluteUrl, t, uploaderMap, userName]);
    const openProfileFromId = useCallback((profileId) => {
        const safeProfileId = String(profileId || '').trim();
        if (!safeProfileId)
            return;
        const ownProfileId = String((overview === null || overview === void 0 ? void 0 : overview.profile_id) || '').trim();
        if (ownProfileId && safeProfileId === ownProfileId) {
            // console.log("own: " + ownProfileId);
            // console.log("safe: " + safeProfileId);
            navigation.navigate('BottomTabBar', { screen: 'Profile' });
            return;
        }
        navigation.navigate('ViewUserProfileScreen', { profileId: safeProfileId });
    }, [navigation, overview === null || overview === void 0 ? void 0 : overview.profile_id]);
    const updateVisibility = useCallback(() => {
        const scrollY = scrollYRef.current;
        const viewportBottom = scrollY + windowHeight;
        const layouts = feedLayoutsRef.current;
        const videoLayout = layouts[0];
        const blogLayout = layouts[1];
        const isVisible = (layout) => {
            if (!layout)
                return false;
            const top = layout.y;
            const bottom = layout.y + layout.height;
            return bottom > scrollY && top < viewportBottom;
        };
        if (videoLayout) {
            const nextVideoVisible = isVisible(videoLayout);
            setIsVideoVisible((prev) => (prev === nextVideoVisible ? prev : nextVideoVisible));
        }
        if (blogLayout) {
            const nextBlogVisible = isVisible(blogLayout);
            setIsBlogVisible((prev) => (prev === nextBlogVisible ? prev : nextBlogVisible));
        }
    }, [windowHeight]);
    const updateSharedVideoRect = useCallback(() => {
        const cardLayout = feedLayoutsRef.current[0];
        const offset = videoContainerOffsetRef.current;
        if (!cardLayout || !offset)
            return;
        const scrollY = scrollYRef.current;
        const scrollViewLayout = scrollViewLayoutRef.current;
        const next = {
            x: scrollViewLayout.x + cardLayout.x + offset.x,
            y: scrollViewLayout.y + cardLayout.y + offset.y - scrollY,
            width: offset.width,
            height: offset.height,
        };
        const prev = sharedVideoRectRef.current;
        if (!prev ||
            Math.abs(prev.x - next.x) > 0.5 ||
            Math.abs(prev.y - next.y) > 0.5 ||
            Math.abs(prev.width - next.width) > 0.5 ||
            Math.abs(prev.height - next.height) > 0.5) {
            sharedVideoRectRef.current = next;
            setSharedVideoRect(next);
        }
    }, []);
    const buildMediaCardPress = useCallback((item, startAt, preferredVideoUrl) => {
        if (!item)
            return;
        navigation.navigate('PhotoDetailScreen', {
            eventTitle: eventNameById(item.event_id),
            media: {
                id: item.media_id,
                eventId: item.event_id,
                thumbnailUrl: item.thumbnail_url,
                previewUrl: item.preview_url,
                originalUrl: item.original_url,
                fullUrl: item.full_url,
                rawUrl: item.raw_url,
                hlsManifestPath: item.hls_manifest_path,
                type: item.type,
            },
            startAt: startAt !== null && startAt !== void 0 ? startAt : 0,
            preferredVideoUrl: preferredVideoUrl !== null && preferredVideoUrl !== void 0 ? preferredVideoUrl : undefined,
        });
    }, [eventNameById, navigation]);
    const getMediaAspectRatios = useCallback((media) => {
        var _a, _b;
        if (!media)
            return undefined;
        const assets = Array.isArray(media.assets) ? media.assets : [];
        const preferredVariants = ['raw', 'full', 'preview_watermark', 'thumbnail'];
        for (const variant of preferredVariants) {
            const asset = assets.find((entry) => { var _a; return String((_a = entry === null || entry === void 0 ? void 0 : entry.variant) !== null && _a !== void 0 ? _a : '').toLowerCase() === variant; });
            const width = Number((_a = asset === null || asset === void 0 ? void 0 : asset.width) !== null && _a !== void 0 ? _a : 0);
            const height = Number((_b = asset === null || asset === void 0 ? void 0 : asset.height) !== null && _b !== void 0 ? _b : 0);
            if (width > 0 && height > 0) {
                return { 0: width / height };
            }
        }
        return undefined;
    }, []);
    const keyExtractor = useCallback((item) => {
        var _a, _b, _c, _d;
        if (item.kind === 'post') {
            return `post:${String(((_a = item.post) === null || _a === void 0 ? void 0 : _a.id) || '').trim() || `${String(((_b = item.post) === null || _b === void 0 ? void 0 : _b.created_at) || '')}|${String(((_c = item.post) === null || _c === void 0 ? void 0 : _c.title) || '')}`}`;
        }
        return `media:${String(((_d = item.media) === null || _d === void 0 ? void 0 : _d.media_id) || '').trim() || mediaDedupFingerprint(item.media)}`;
    }, [mediaDedupFingerprint]);
    const renderFeedItem = useCallback(({ item }) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        if (item.kind === 'post') {
            const post = item.post;
            const translated = Boolean(translatedBlogsById[String(post.id)]);
            const postDescriptionRaw = String((_b = (_a = post.summary) !== null && _a !== void 0 ? _a : post.description) !== null && _b !== void 0 ? _b : '');
            const postDescription = translated ? translateText(postDescriptionRaw, i18n.language) : postDescriptionRaw;
            return (_jsx(NewsFeedCard, { title: (_c = post.title) !== null && _c !== void 0 ? _c : t('Latest blog'), images: ['__text__'], textSlide: {
                    title: (_d = post.title) !== null && _d !== void 0 ? _d : t('Latest blog'),
                    description: postDescription,
                }, user: {
                    name: (_f = (_e = post.author) === null || _e === void 0 ? void 0 : _e.display_name) !== null && _f !== void 0 ? _f : userName,
                    avatar: ((_g = post.author) === null || _g === void 0 ? void 0 : _g.avatar_url)
                        ? { uri: toAbsoluteUrl(post.author.avatar_url) }
                        : Images.profilePic,
                    date: formatPostTime(post.created_at),
                }, onPressUser: () => { var _a; return openProfileFromId((_a = post.author) === null || _a === void 0 ? void 0 : _a.profile_id); }, headerSeparated: true, hideBelowText: true, likesLabel: `${Number((_h = post === null || post === void 0 ? void 0 : post.likes_count) !== null && _h !== void 0 ? _h : 0).toLocaleString()} ${t('likes')}`, liked: Boolean(post === null || post === void 0 ? void 0 : post.liked_by_me), onToggleLike: () => handleTogglePostLike(post.id), likeDisabled: !String((_j = post === null || post === void 0 ? void 0 : post.id) !== null && _j !== void 0 ? _j : '').trim(), showActions: true, onTranslate: () => setTranslatedBlogsById((prev) => (Object.assign(Object.assign({}, prev), { [String(post.id)]: !prev[String(post.id)] }))), onShare: () => openPostShareOptions(post), onPress: () => {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
                    navigation.navigate('ViewUserBlogDetailsScreen', {
                        postId: post.id,
                        post: {
                            id: post.id,
                            title: (_a = post.title) !== null && _a !== void 0 ? _a : t('Latest blog'),
                            date: post.created_at
                                ? new Date(post.created_at).toLocaleDateString()
                                : '',
                            image: Images.photo3,
                            gallery: [],
                            galleryItems: [],
                            readCount: post.reading_time_minutes
                                ? `${post.reading_time_minutes} min`
                                : '1 min',
                            author: {
                                profile_id: (_c = (_b = post.author) === null || _b === void 0 ? void 0 : _b.profile_id) !== null && _c !== void 0 ? _c : null,
                                display_name: (_e = (_d = post.author) === null || _d === void 0 ? void 0 : _d.display_name) !== null && _e !== void 0 ? _e : userName,
                                avatar_url: (_g = (_f = post.author) === null || _f === void 0 ? void 0 : _f.avatar_url) !== null && _g !== void 0 ? _g : null,
                            },
                            writer: (_j = (_h = post.author) === null || _h === void 0 ? void 0 : _h.display_name) !== null && _j !== void 0 ? _j : userName,
                            writerImage: ((_k = post.author) === null || _k === void 0 ? void 0 : _k.avatar_url)
                                ? { uri: toAbsoluteUrl(post.author.avatar_url) }
                                : Images.profilePic,
                            description: (_m = (_l = post.description) !== null && _l !== void 0 ? _l : post.summary) !== null && _m !== void 0 ? _m : '',
                        },
                    });
                } }));
        }
        const media = item.media;
        const mediaKey = `feed-media-${media.media_id}`;
        const isVideoItem = String(media.type || '').toLowerCase() === 'video';
        const thumb = getMediaThumb(media) || Images.photo1;
        const playableVideoUrl = isVideoItem
            ? (withAccessToken(pickPlayableVideoUrl(media) || '') || undefined)
            : undefined;
        const titleText = isVideoItem ? t('Video') : t('Photo');
        const uploader = getMediaUploaderInfo(media);
        const mediaAspectRatios = getMediaAspectRatios(media);
        return (_jsx(NewsFeedCard, { title: titleText, description: "", images: [thumb], isVideo: isVideoItem, videoUri: playableVideoUrl, showPlayOverlay: isVideoItem, videoIndexes: isVideoItem ? [0] : [], toggleVideoOnPress: isVideoItem, isActive: Boolean(activeMediaCards[mediaKey]) && isFocused && !overlayVisible, mediaAspectRatios: mediaAspectRatios, user: {
                name: uploader.name,
                avatar: uploader.avatar,
                date: formatPostTime(media.created_at),
            }, onPressUser: () => openProfileFromId(uploader.profileId || (overview === null || overview === void 0 ? void 0 : overview.profile_id)), headerSeparated: true, viewsLabel: formatViewsLabel(media), likesLabel: formatLikesLabel(media), liked: Boolean(media === null || media === void 0 ? void 0 : media.liked_by_me), onToggleLike: () => handleToggleLike(media.media_id), likeDisabled: !String((_k = media === null || media === void 0 ? void 0 : media.media_id) !== null && _k !== void 0 ? _k : '').trim(), showActions: true, onShare: () => handleShareMedia(media), onDownload: () => handleDownloadMedia(media), onPressMore: () => openFeedMenu(media, {
                isVideo: isVideoItem,
                title: isVideoItem ? t('Video') : t('Photo'),
            }), onPress: () => buildMediaCardPress(media) }));
    }, [
        activeMediaCards,
        buildMediaCardPress,
        formatLikesLabel,
        formatPostTime,
        formatViewsLabel,
        getMediaThumb,
        getMediaAspectRatios,
        getMediaUploaderInfo,
        handleDownloadMedia,
        handleShareMedia,
        handleToggleLike,
        handleTogglePostLike,
        i18n.language,
        isFocused,
        navigation,
        openFeedMenu,
        openPostShareOptions,
        openProfileFromId,
        overlayVisible,
        overview === null || overview === void 0 ? void 0 : overview.profile_id,
        pickPlayableVideoUrl,
        profilePic,
        t,
        toAbsoluteUrl,
        translatedBlogsById,
        userName,
        withAccessToken,
    ]);
    const feedListExtraData = useMemo(() => ({
        activeMediaCards,
        isFocused,
        language: i18n.language,
        overlayVisible,
        overviewProfileId: overview === null || overview === void 0 ? void 0 : overview.profile_id,
        profilePic,
        translatedBlogsById,
        uploaderMap,
    }), [
        activeMediaCards,
        i18n.language,
        isFocused,
        overlayVisible,
        overview === null || overview === void 0 ? void 0 : overview.profile_id,
        profilePic,
        translatedBlogsById,
        uploaderMap,
    ]);
    const ListHeader = useMemo(() => (_jsxs(View, Object.assign({ style: Styles.scrollContent }, { children: [_jsx(SizeBox, { height: 24 }), _jsxs(View, Object.assign({ style: Styles.sectionQuickActions }, { children: [_jsx(View, Object.assign({ style: Styles.sectionHeader }, { children: _jsx(Text, Object.assign({ style: Styles.sectionTitle }, { children: t('quickActions') })) })), _jsxs(View, Object.assign({ style: Styles.quickActionsGrid }, { children: [_jsxs(View, Object.assign({ style: Styles.quickActionsRow }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.quickActionCard, onPress: () => navigation.navigate('DownloadsDetailsScreen') }, { children: _jsx(Text, Object.assign({ style: Styles.quickActionText, numberOfLines: 1 }, { children: t('myDownloads') })) })), _jsx(TouchableOpacity, Object.assign({ ref: aiSearchButtonRef, style: [Styles.quickActionCard, showAiSearchIntro && Styles.aiSearchFocusCard], activeOpacity: 0.8, onLayout: () => {
                                            if (!showAiSearchIntro)
                                                return;
                                            requestAnimationFrame(() => {
                                                var _a;
                                                (_a = aiSearchButtonRef.current) === null || _a === void 0 ? void 0 : _a.measureInWindow((x, y, width, height) => {
                                                    if (!width || !height)
                                                        return;
                                                    setAiSearchButtonRect({ x, y, width, height });
                                                });
                                            });
                                        }, onPress: () => navigation.push('AISearchScreen', { origin: 'home' }) }, { children: _jsx(Text, Object.assign({ style: Styles.quickActionText, numberOfLines: 1 }, { children: t('aiSearch') })) }))] })), _jsx(View, Object.assign({ style: Styles.quickActionsRow }, { children: _jsx(TouchableOpacity, Object.assign({ style: [Styles.quickActionCard, Styles.quickActionCardFull], onPress: () => navigation.push('AvailableEventsScreen') }, { children: _jsx(Text, Object.assign({ style: Styles.quickActionText, numberOfLines: 1 }, { children: t('subscribeCompetition') })) })) }))] }))] }))] }))), [
        Styles.quickActionCard,
        Styles.quickActionCardFull,
        Styles.quickActionText,
        Styles.quickActionsGrid,
        Styles.quickActionsRow,
        Styles.scrollContent,
        Styles.sectionHeader,
        Styles.sectionQuickActions,
        Styles.sectionTitle,
        Styles.aiSearchFocusCard,
        navigation,
        showAiSearchIntro,
        t,
    ]);
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer, testID: "home-screen" }, { children: [_jsx(E2EPerfReady, { screen: "home", ready: perfReady, startedAtMs: perfStartedAtRef.current }), _jsx(SizeBox, { height: insets.top }), _jsx(Header, { userName: userName, profilePic: profilePic, notificationCount: unreadNotificationsCount, onPressFeed: () => navigation.push('HubScreen'), onPressNotifications: () => navigation.navigate('NotificationsScreen'), onPressProfile: () => navigation.navigate('BottomTabBar', { screen: 'Profile' }) }), _jsx(FlatList, { data: visibleFeedItems, extraData: feedListExtraData, renderItem: renderFeedItem, keyExtractor: keyExtractor, ListHeaderComponent: ListHeader, ListFooterComponent: isLoadingOverview && visibleFeedItems.length === 0 ? (_jsx(View, Object.assign({ style: { paddingVertical: 12 } }, { children: _jsx(ActivityIndicator, { color: colors.primaryColor }) }))) : overviewError ? (_jsx(View, Object.assign({ style: { paddingVertical: 16, paddingHorizontal: 20 } }, { children: _jsx(Text, Object.assign({ style: { color: colors.grayColor, textAlign: 'center' } }, { children: overviewError })) }))) : hasMoreFeedItems ? (_jsx(View, Object.assign({ style: { paddingVertical: 12 } }, { children: _jsx(ActivityIndicator, { color: colors.primaryColor }) }))) : null, onViewableItemsChanged: onFeedViewableItemsChanged, viewabilityConfig: feedViewabilityConfig, showsVerticalScrollIndicator: false, contentContainerStyle: { paddingBottom: insets.bottom > 0 ? insets.bottom + 20 : 40 }, refreshControl: _jsx(RefreshControl, { refreshing: refreshingFeed, onRefresh: handleRefresh, tintColor: colors.primaryColor }), initialNumToRender: HOME_FEED_PAGE_SIZE, maxToRenderPerBatch: 6, windowSize: 7, removeClippedSubviews: true, scrollEnabled: !overlayVisible, onLayout: (event) => {
                    scrollYRef.current = 0;
                    scrollViewLayoutRef.current = {
                        x: event.nativeEvent.layout.x,
                        y: event.nativeEvent.layout.y,
                    };
                }, onScroll: (event) => {
                    scrollYRef.current = event.nativeEvent.contentOffset.y;
                }, onEndReached: loadMoreFeedItems, onEndReachedThreshold: 0.35 }), enableSharedOverlay && overlayVideoUrl && sharedVideoRect && sharedVideoRect.width > 0 && sharedVideoRect.height > 0 && (_jsxs(View, Object.assign({ style: Styles.sharedVideoLayer, pointerEvents: overlayVisible ? 'auto' : 'none' }, { children: [_jsxs(View, Object.assign({ style: [
                            Styles.sharedVideoWrapper,
                            overlayVisible
                                ? Styles.sharedVideoFullscreen
                                : {
                                    left: sharedVideoRect.x,
                                    top: sharedVideoRect.y,
                                    width: sharedVideoRect.width,
                                    height: sharedVideoRect.height,
                                },
                        ] }, { children: [overlayVisible && overlayLoading && (_jsx(View, Object.assign({ style: Styles.videoOverlaySkeleton }, { children: _jsx(ShimmerEffect, { width: "100%", height: "100%", borderRadius: 0 }) }))), _jsx(Video, { ref: overlayVideoRef, source: {
                                    uri: overlayVideoUrl,
                                    type: overlayVideoUrl.toLowerCase().includes('.m3u8') ? 'm3u8' : undefined,
                                }, style: Styles.sharedVideo, resizeMode: "cover", paused: overlayVisible
                                    ? !overlayPlaying
                                    : !(isFocused && (isVideoVisible || !overlayHasInitialTime)), controls: false, muted: overlayMuted, volume: overlayMuted ? 0 : 1.0, repeat: false, playInBackground: false, playWhenInactive: false, ignoreSilentSwitch: "ignore", automaticallyWaitsToMinimizeStalling: false, bufferConfig: {
                                    minBufferMs: 500,
                                    maxBufferMs: 6000,
                                    bufferForPlaybackMs: 150,
                                    bufferForPlaybackAfterRebufferMs: 600,
                                }, onLoadStart: () => {
                                    setOverlayLoading(true);
                                    setOverlayHasInitialTime(false);
                                }, onLoad: (meta) => {
                                    var _a, _b;
                                    setOverlayDuration(meta.duration || 0);
                                    const storedResume = overlayVideoUrl ? ((_a = resumeByUrlRef.current[overlayVideoUrl]) !== null && _a !== void 0 ? _a : 0) : 0;
                                    const desiredStart = overlayStartAt > 0 ? overlayStartAt : storedResume;
                                    if (desiredStart > 0) {
                                        const seekTo = Math.min(desiredStart, meta.duration || desiredStart);
                                        (_b = overlayVideoRef.current) === null || _b === void 0 ? void 0 : _b.seek(seekTo);
                                        setOverlayCurrentTime(seekTo);
                                        setOverlayHasInitialTime(true);
                                    }
                                    else {
                                        setOverlayHasInitialTime(false);
                                    }
                                    setOverlayLoading(false);
                                }, onReadyForDisplay: () => {
                                    setOverlayHasInitialTime(true);
                                }, onProgress: (progress) => {
                                    const nextTime = progress.currentTime || 0;
                                    videoResumeRef.current = nextTime;
                                    if (overlayVideoUrl) {
                                        resumeByUrlRef.current[overlayVideoUrl] = nextTime;
                                    }
                                    if (pendingSeekRef.current != null) {
                                        const target = pendingSeekRef.current;
                                        if (Math.abs(nextTime - target) < 0.5 || nextTime >= target) {
                                            pendingSeekRef.current = null;
                                            setOverlayHasInitialTime(true);
                                        }
                                        else {
                                            return;
                                        }
                                    }
                                    if (!overlayHasInitialTime && nextTime > 0) {
                                        setOverlayHasInitialTime(true);
                                    }
                                    if (!overlaySeeking) {
                                        setOverlayCurrentTime(nextTime);
                                    }
                                }, onError: () => {
                                    setOverlayLoading(false);
                                } }), !overlayPlaying && overlayVisible && !overlayLoading && (_jsx(View, Object.assign({ style: Styles.videoOverlayPlayBadge }, { children: _jsx(Icons.PlayCricle, { height: 38, width: 38 }) }))), _jsx(TouchableOpacity, { activeOpacity: 0.9, onPress: () => {
                                    var _a, _b;
                                    if (overlayVisible) {
                                        setOverlayPlaying((prev) => !prev);
                                    }
                                    else {
                                        openOverlayPlayer((_b = (_a = overlayMedia !== null && overlayMedia !== void 0 ? overlayMedia : overviewVideo) !== null && _a !== void 0 ? _a : topVideos[0]) !== null && _b !== void 0 ? _b : null, overlayVideoUrl, overlayCurrentTime);
                                    }
                                }, pointerEvents: overlayVisible ? 'auto' : 'none', style: Styles.sharedVideoTap }), overlayVisible && !overlayLoading && (_jsxs(TouchableOpacity, Object.assign({ style: Styles.videoMuteButton, activeOpacity: 0.85, onPress: () => setOverlayMuted((prev) => !prev) }, { children: [_jsx(Icons.Volume, { width: 18, height: 18 }), overlayMuted ? _jsx(View, { style: Styles.videoMuteSlash }) : null] })))] })), overlayVisible && (_jsxs(View, Object.assign({ style: Styles.sharedVideoChrome }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.videoOverlayHeader }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.videoOverlayBack, onPress: closeOverlayPlayer }, { children: _jsx(Icons.BackArrow, { height: 22, width: 22 }) })), _jsx(Text, Object.assign({ style: Styles.videoOverlayTitle }, { children: (_q = (_p = overlayMedia === null || overlayMedia === void 0 ? void 0 : overlayMedia.title) !== null && _p !== void 0 ? _p : overviewVideo === null || overviewVideo === void 0 ? void 0 : overviewVideo.title) !== null && _q !== void 0 ? _q : t('Video') })), _jsxs(View, Object.assign({ style: Styles.videoOverlayActions }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.videoOverlayActionButton, onPress: () => handleDownloadMedia(overlayMedia) }, { children: _jsx(Icons.DownloadBlue, { width: 20, height: 20 }) })), _jsx(TouchableOpacity, Object.assign({ style: Styles.videoOverlayActionButton, onPress: () => handleShareMedia(overlayMedia) }, { children: _jsx(FastImage, { source: Icons.ShareBlue, style: Styles.videoOverlayActionIcon }) }))] }))] })), !overlayLoading && (_jsxs(View, Object.assign({ style: [Styles.videoOverlayControls, { paddingBottom: 14 + insets.bottom }] }, { children: [_jsxs(Text, Object.assign({ style: Styles.videoOverlayTime }, { children: [formatDuration(overlayHasInitialTime ? overlayCurrentTime : overlayStartAt || overlayCurrentTime), " / ", formatDuration(overlayDuration)] })), _jsx(Slider, { style: Styles.videoOverlaySlider, minimumValue: 0, maximumValue: Math.max(overlayDuration, 1), value: Math.min(overlayHasInitialTime ? overlayCurrentTime : overlayStartAt || overlayCurrentTime, Math.max(overlayDuration, 1)), minimumTrackTintColor: colors.primaryColor, maximumTrackTintColor: "rgba(0,0,0,0.2)", thumbTintColor: colors.primaryColor, onSlidingStart: () => {
                                            setOverlaySeeking(true);
                                            setOverlayPlaying(false);
                                        }, onValueChange: (value) => {
                                            setOverlayCurrentTime(value);
                                            videoResumeRef.current = value;
                                            if (overlayVideoUrl) {
                                                resumeByUrlRef.current[overlayVideoUrl] = value;
                                            }
                                        }, onSlidingComplete: (value) => {
                                            var _a;
                                            setOverlaySeeking(false);
                                            setOverlayCurrentTime(value);
                                            videoResumeRef.current = value;
                                            if (overlayVideoUrl) {
                                                resumeByUrlRef.current[overlayVideoUrl] = value;
                                            }
                                            pendingSeekRef.current = value;
                                            (_a = overlayVideoRef.current) === null || _a === void 0 ? void 0 : _a.seek(value);
                                            setOverlayHasInitialTime(true);
                                            setOverlayPlaying(true);
                                        } })] })))] })))] }))), showAiSearchIntro && (_jsxs(View, Object.assign({ style: Styles.aiSearchIntroOverlay, pointerEvents: "box-none" }, { children: [_jsx(View, { style: Styles.aiSearchIntroDimmer }), aiSearchButtonRect ? (_jsx(View, { pointerEvents: "none", style: [
                            Styles.aiSearchIntroSpotlight,
                            {
                                left: Math.max(aiSearchButtonRect.x - 8, 8),
                                top: Math.max(aiSearchButtonRect.y - 8, 8),
                                width: aiSearchButtonRect.width + 16,
                                height: aiSearchButtonRect.height + 16,
                            },
                        ] })) : null, _jsxs(View, Object.assign({ style: [
                            Styles.aiSearchIntroPopup,
                            aiSearchButtonRect
                                ? {
                                    left: Math.min(Math.max(aiSearchButtonRect.x, 8), Math.max(windowWidth - 200 - 8, 8)),
                                    top: aiSearchButtonRect.y + aiSearchButtonRect.height + 10,
                                }
                                : undefined,
                        ] }, { children: [_jsx(Text, Object.assign({ style: Styles.aiSearchIntroText }, { children: t('Find yourself') })), _jsx(TouchableOpacity, Object.assign({ style: Styles.aiSearchIntroNextButton, activeOpacity: 0.85, onPress: () => setShowAiSearchIntro(false) }, { children: _jsx(Text, Object.assign({ style: Styles.aiSearchIntroNextText }, { children: t('Next') })) }))] }))] }))), _jsx(Modal, Object.assign({ visible: feedMenuVisible, transparent: true, animationType: "fade", onRequestClose: () => setFeedMenuVisible(false) }, { children: _jsxs(View, Object.assign({ style: Styles.feedMenuOverlay }, { children: [_jsx(Pressable, { style: Styles.feedMenuBackdrop, onPress: () => setFeedMenuVisible(false) }), _jsxs(View, Object.assign({ style: Styles.feedMenuContainer }, { children: [feedMenuActions.map((item, index) => (_jsx(TouchableOpacity, Object.assign({ style: Styles.feedMenuAction, activeOpacity: 0.85, onPress: () => {
                                        setFeedMenuVisible(false);
                                        setTimeout(() => item.onPress(), 120);
                                    } }, { children: _jsx(Text, Object.assign({ style: Styles.feedMenuActionText }, { children: item.label })) }), `${item.label}-${index}`))), _jsx(TouchableOpacity, Object.assign({ style: Styles.feedMenuCancel, activeOpacity: 0.85, onPress: () => setFeedMenuVisible(false) }, { children: _jsx(Text, Object.assign({ style: Styles.feedMenuCancelText }, { children: t('Cancel') })) }))] }))] })) })), _jsx(Modal, Object.assign({ visible: infoPopupVisible, transparent: true, animationType: "fade", onRequestClose: () => setInfoPopupVisible(false) }, { children: _jsxs(View, Object.assign({ style: Styles.feedMenuOverlay }, { children: [_jsx(Pressable, { style: Styles.feedMenuBackdrop, onPress: () => setInfoPopupVisible(false) }), _jsxs(View, Object.assign({ style: Styles.feedInfoModalContainer }, { children: [_jsx(Text, Object.assign({ style: Styles.feedInfoModalTitle }, { children: infoPopupTitle })), _jsx(Text, Object.assign({ style: Styles.feedInfoModalText }, { children: infoPopupMessage }))] }))] })) })), _jsx(Modal, Object.assign({ visible: reportIssueVisible, transparent: true, animationType: "fade", onRequestClose: () => {
                    if (isSubmittingReport)
                        return;
                    setReportIssueVisible(false);
                    setReportStep('reason');
                    setSelectedReportReason('');
                    setCustomReportReason('');
                    setReportTargetMedia(null);
                } }, { children: _jsxs(View, Object.assign({ style: Styles.feedMenuOverlay }, { children: [_jsx(Pressable, { style: Styles.feedMenuBackdrop, onPress: () => {
                                if (isSubmittingReport)
                                    return;
                                setReportIssueVisible(false);
                                setReportStep('reason');
                                setSelectedReportReason('');
                                setCustomReportReason('');
                                setReportTargetMedia(null);
                            } }), _jsxs(View, Object.assign({ style: Styles.feedMenuContainer }, { children: [_jsx(Text, Object.assign({ style: Styles.feedMenuTitle }, { children: reportStep === 'reason'
                                        ? t('Report an issue with this photo/video')
                                        : t('Confirm request') })), _jsx(View, { style: Styles.feedMenuDivider }), reportStep === 'reason' ? (_jsxs(_Fragment, { children: [reportReasons.map((reason) => (_jsx(TouchableOpacity, Object.assign({ style: Styles.feedMenuAction, activeOpacity: 0.85, onPress: () => {
                                                setSelectedReportReason(reason);
                                                if (reason === t('Custom')) {
                                                    return;
                                                }
                                                setReportStep('confirm');
                                            } }, { children: _jsx(Text, Object.assign({ style: Styles.feedMenuActionText }, { children: reason })) }), reason))), selectedReportReason === t('Custom') ? (_jsxs(View, Object.assign({ style: [Styles.feedMenuAction, { borderBottomWidth: 0 }] }, { children: [_jsx(TextInput, { style: [Styles.feedMenuActionText, { borderWidth: 1, borderColor: colors.borderColor, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }], value: customReportReason, onChangeText: setCustomReportReason, placeholder: t('Type your request'), placeholderTextColor: colors.subTextColor }), _jsx(TouchableOpacity, Object.assign({ style: [Styles.feedInfoModalButton, { alignSelf: 'stretch', alignItems: 'center', marginTop: 10 }], activeOpacity: 0.85, onPress: () => {
                                                        if (!customReportReason.trim())
                                                            return;
                                                        setReportStep('confirm');
                                                    } }, { children: _jsx(Text, Object.assign({ style: Styles.feedInfoModalButtonText }, { children: t('Next') })) }))] }))) : null, _jsx(TouchableOpacity, Object.assign({ style: Styles.feedMenuCancel, activeOpacity: 0.85, onPress: () => {
                                                setReportIssueVisible(false);
                                                setReportStep('reason');
                                                setSelectedReportReason('');
                                                setCustomReportReason('');
                                                setReportTargetMedia(null);
                                            } }, { children: _jsx(Text, Object.assign({ style: Styles.feedMenuCancelText }, { children: t('Cancel') })) }))] })) : (_jsxs(_Fragment, { children: [_jsx(View, Object.assign({ style: Styles.feedMenuAction }, { children: _jsx(Text, Object.assign({ style: Styles.feedMenuActionText }, { children: `${t('Reason')}: ${selectedReportReason}${selectedReportReason === t('Custom') ? ` - ${customReportReason.trim()}` : ''}` })) })), _jsx(TouchableOpacity, Object.assign({ style: [Styles.feedInfoModalButton, { alignSelf: 'stretch', alignItems: 'center', marginTop: 8 }], activeOpacity: 0.85, disabled: isSubmittingReport, onPress: () => __awaiter(void 0, void 0, void 0, function* () {
                                                const mediaId = String((reportTargetMedia === null || reportTargetMedia === void 0 ? void 0 : reportTargetMedia.media_id) || (reportTargetMedia === null || reportTargetMedia === void 0 ? void 0 : reportTargetMedia.id) || '').trim();
                                                if (!apiAccessToken || !mediaId) {
                                                    showInfoPopup(t('Request failed'), t('No media selected for this request.'));
                                                    return;
                                                }
                                                const issue_type = selectedReportReason === t('Wrong competition')
                                                    ? 'wrong_competition'
                                                    : selectedReportReason === t('Wrong heat')
                                                        ? 'wrong_heat'
                                                        : 'custom';
                                                setIsSubmittingReport(true);
                                                try {
                                                    yield createMediaIssueRequest(apiAccessToken, {
                                                        media_id: mediaId,
                                                        event_id: (reportTargetMedia === null || reportTargetMedia === void 0 ? void 0 : reportTargetMedia.event_id) ? String(reportTargetMedia.event_id) : undefined,
                                                        issue_type,
                                                        custom_text: issue_type === 'custom' ? customReportReason.trim() : undefined,
                                                    });
                                                }
                                                catch (e) {
                                                    const msg = String((e === null || e === void 0 ? void 0 : e.message) || t('Could not submit request'));
                                                    showInfoPopup(t('Request failed'), msg);
                                                    setIsSubmittingReport(false);
                                                    return;
                                                }
                                                setReportIssueVisible(false);
                                                setReportStep('reason');
                                                setSelectedReportReason('');
                                                setCustomReportReason('');
                                                setReportTargetMedia(null);
                                                setIsSubmittingReport(false);
                                                setTimeout(() => {
                                                    showInfoPopup(t('Request sent'), t('Your edit request is now pending.'));
                                                }, 120);
                                            }) }, { children: _jsx(Text, Object.assign({ style: Styles.feedInfoModalButtonText }, { children: isSubmittingReport ? t('Submitting...') : t('Submit') })) }))] }))] }))] })) })), downloadVisible && (_jsx(View, Object.assign({ style: Styles.downloadOverlay, pointerEvents: "auto" }, { children: _jsxs(View, Object.assign({ style: Styles.downloadCard }, { children: [_jsx(Text, Object.assign({ style: Styles.downloadTitle }, { children: t('Preparing download') })), downloadProgress == null ? (_jsx(ActivityIndicator, { color: colors.primaryColor })) : (_jsxs(_Fragment, { children: [_jsx(View, Object.assign({ style: Styles.downloadProgressTrack }, { children: _jsx(View, { style: [Styles.downloadProgressFill, { width: `${Math.round(downloadProgress * 100)}%` }] }) })), _jsxs(Text, Object.assign({ style: Styles.downloadProgressLabel }, { children: [Math.round(downloadProgress * 100), "%"] }))] }))] })) }))), composerElement] })));
};
export default HomeScreen;
