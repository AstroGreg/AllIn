import {ActivityIndicator, FlatList, Text, TouchableOpacity, View, Share, Alert, useWindowDimensions, Modal, Pressable, RefreshControl, TextInput, type ListRenderItemInfo, type ViewToken} from 'react-native'
import React, {useCallback, useMemo, useRef, useState, useEffect} from 'react'
import { createStyles } from './HomeStyles'
import Header from './components/Header'
import SizeBox from '../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../../context/ThemeContext'
import { useEvents } from '../../context/EventsContext'
import Icons from '../../constants/Icons'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'
import {
    ApiError,
    createMediaIssueRequest,
    getAllPhotos,
    getAllVideos,
    getHomeOverview,
    getNotifications,
    getProfileSummaryById,
    getPosts,
    getProfileSummary,
    recordDownload,
    togglePostLike,
    toggleMediaLike,
    type HomeOverviewMedia,
    type HomeOverviewResponse,
    type MediaViewAllItem,
    type PostSummary,
} from '../../services/apiGateway'
import {useFocusEffect, useIsFocused} from '@react-navigation/native'
import FastImage from 'react-native-fast-image'
import NewsFeedCard from './components/NewsFeedCard'
import Images from '../../constants/Images'
import { getApiBaseUrl, getHlsBaseUrl } from '../../constants/RuntimeConfig'
import Video from 'react-native-video'
import Slider from '@react-native-community/slider'
import ShimmerEffect from '../../components/shimmerEffect/ShimmerEffect'
import NativeShare from 'react-native-share'
import RNFS from 'react-native-fs'
import CameraRoll from '@react-native-camera-roll/camera-roll'
import { translateText } from '../../i18n'

const HOME_CACHE_TTL_MS = 2 * 60 * 1000;
const HOME_FEED_PAGE_SIZE = 8;
type HomeFeedItem =
    | { kind: 'media'; created_at?: string | null; media: MediaViewAllItem }
    | { kind: 'post'; created_at?: string | null; post: PostSummary };

const homeCache: {
    overview: HomeOverviewResponse | null;
    videos: MediaViewAllItem[];
    photos: MediaViewAllItem[];
    posts: PostSummary[];
    fetchedAt: number;
} = {
    overview: null,
    videos: [],
    photos: [],
    posts: [],
    fetchedAt: 0,
};

const HomeScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t, i18n } = useTranslation();
    const Styles = createStyles(colors);
    const { height: windowHeight, width: windowWidth } = useWindowDimensions();
    const { user, userProfile, apiAccessToken } = useAuth();
    const { eventNameById } = useEvents();
    const isFocused = useIsFocused();

    const userName = (() => {
        const profileFullName = [userProfile?.firstName, userProfile?.lastName].filter(Boolean).join(' ').trim();
        if (profileFullName) return profileFullName;

        const auth0FullName = [user?.givenName, user?.familyName].filter(Boolean).join(' ').trim();
        if (auth0FullName) return auth0FullName;

        const username = userProfile?.username?.trim();
        if (username) return username;

        const nickname = user?.nickname?.trim();
        if (nickname) return nickname;

        const name = user?.name?.trim();
        if (name) return name;

        return t('Guest');
    })();

    const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);
    const profilePic = profileAvatarUrl ?? user?.picture ?? null;

    const [overview, setOverview] = useState<HomeOverviewResponse | null>(null);
    const [isLoadingOverview, setIsLoadingOverview] = useState(false);
    const [overviewError, setOverviewError] = useState<string | null>(null);
    const [refreshingFeed, setRefreshingFeed] = useState(false);
    const [allVideos, setAllVideos] = useState<MediaViewAllItem[]>([]);
    const [allPhotos, setAllPhotos] = useState<MediaViewAllItem[]>([]);
    const [allPosts, setAllPosts] = useState<PostSummary[]>([]);
    const [uploaderMap, setUploaderMap] = useState<Record<string, { name: string; avatarUrl?: string | null }>>({});
    const [feedVisibleCount, setFeedVisibleCount] = useState(HOME_FEED_PAGE_SIZE);
    const feedLayoutsRef = useRef<Record<number, { x: number; y: number; width: number; height: number }>>({});
    const scrollViewLayoutRef = useRef({ x: 0, y: 0 });
    const videoContainerOffsetRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
    const sharedVideoRectRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
    const scrollYRef = useRef(0);
    const [isVideoVisible, setIsVideoVisible] = useState(true);
    const [isBlogVisible, setIsBlogVisible] = useState(true);
    const videoResumeRef = useRef(0);
    const [resumeVideoAt, setResumeVideoAt] = useState(0);
    const [overlayVisible, setOverlayVisible] = useState(false);
    const [overlayVideoUrl, setOverlayVideoUrl] = useState<string | null>(null);
    const [overlayMedia, setOverlayMedia] = useState<HomeOverviewMedia | MediaViewAllItem | null>(null);
    const [overlayLoading, setOverlayLoading] = useState(true);
    const [overlayPlaying, setOverlayPlaying] = useState(true);
    const [overlayMuted, setOverlayMuted] = useState(true);
    const [overlayDuration, setOverlayDuration] = useState(0);
    const [overlayCurrentTime, setOverlayCurrentTime] = useState(0);
    const [overlaySeeking, setOverlaySeeking] = useState(false);
    const [overlayHasInitialTime, setOverlayHasInitialTime] = useState(false);
    const [overlayStartAt, setOverlayStartAt] = useState(0);
    const overlayVideoRef = useRef<Video>(null);
    const [sharedVideoRect, setSharedVideoRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    const resumeByUrlRef = useRef<Record<string, number>>({});
    const pendingSeekRef = useRef<number | null>(null);
    const downloadInFlightRef = useRef(false);
    const [downloadVisible, setDownloadVisible] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
    const [showAiSearchIntro, setShowAiSearchIntro] = useState(false);
    const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
    const [feedMenuVisible, setFeedMenuVisible] = useState(false);
    const [feedMenuTitle, setFeedMenuTitle] = useState('');
    const [feedMenuActions, setFeedMenuActions] = useState<Array<{ label: string; onPress: () => void }>>([]);
    const [reportIssueVisible, setReportIssueVisible] = useState(false);
    const [reportStep, setReportStep] = useState<'reason' | 'confirm'>('reason');
    const [selectedReportReason, setSelectedReportReason] = useState('');
    const [customReportReason, setCustomReportReason] = useState('');
    const [reportTargetMedia, setReportTargetMedia] = useState<HomeOverviewMedia | MediaViewAllItem | null>(null);
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);
    const [infoPopupVisible, setInfoPopupVisible] = useState(false);
    const [infoPopupTitle, setInfoPopupTitle] = useState('');
    const [infoPopupMessage, setInfoPopupMessage] = useState('');
    const [translatedBlogsById, setTranslatedBlogsById] = useState<Record<string, boolean>>({});
    const [activeMediaCards, setActiveMediaCards] = useState<Record<string, boolean>>({});
    const feedViewabilityConfig = useRef({ itemVisiblePercentThreshold: 20 }).current;
    const aiSearchButtonRef = useRef<View>(null);
    const [aiSearchButtonRect, setAiSearchButtonRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    const loadDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const loadInFlightRef = useRef<Promise<void> | null>(null);
    const lastLoadRequestRef = useRef(0);
    const feedLoadThrottleRef = useRef(0);
    const uploaderFetchInFlightRef = useRef<Set<string>>(new Set());
    const onFeedViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
        const next: Record<string, boolean> = {};
        viewableItems.forEach((token) => {
            if (!token.isViewable) return;
            const entry = token.item as HomeFeedItem | undefined;
            if (!entry || entry.kind !== 'media') return;
            const mediaId = String(entry.media?.media_id || '').trim();
            if (!mediaId) return;
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
                if (same) return prev;
            }
            return next;
        });
    }).current;
    const enableSharedOverlay = false;
    const useSharedPlayerInFeed = Boolean(
        enableSharedOverlay &&
        overlayVideoUrl &&
        sharedVideoRect &&
        sharedVideoRect.width > 0 &&
        sharedVideoRect.height > 0
    );

    const showInfoPopup = useCallback((title: string, message: string) => {
        setInfoPopupTitle(title);
        setInfoPopupMessage(message);
        setInfoPopupVisible(true);
    }, []);

    useEffect(() => {
        if (!infoPopupVisible) return;
        const timer = setTimeout(() => {
            setInfoPopupVisible(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, [infoPopupVisible]);

    const reportReasons = useMemo(
        () => [
            t('Wrong competition'),
            t('Wrong heat'),
            t('Custom'),
        ],
        [t],
    );

    const openReportIssuePopup = useCallback((media?: HomeOverviewMedia | MediaViewAllItem | null) => {
        setReportTargetMedia(media ?? null);
        setSelectedReportReason('');
        setCustomReportReason('');
        setReportStep('reason');
        setReportIssueVisible(true);
    }, []);

    const performLoadOverview = useCallback(async (force = false) => {
        if (!apiAccessToken) {
            setOverview(null);
            setOverviewError(t('Log in to load overview.'));
            return;
        }
        const now = Date.now();
        const cacheFresh = !force && homeCache.fetchedAt > 0 && now - homeCache.fetchedAt < HOME_CACHE_TTL_MS;
        if (cacheFresh && homeCache.overview) {
            if (overview) {
                return;
            }
            setOverviewError(null);
            setOverview(homeCache.overview);
            setAllVideos(homeCache.videos);
            setAllPhotos(homeCache.photos);
            setAllPosts(homeCache.posts);
            return;
        }
        setIsLoadingOverview(true);
        setOverviewError(null);
        try {
            const data = await getHomeOverview(apiAccessToken, 'me');
            setOverview(data);
            homeCache.overview = data;
            homeCache.fetchedAt = Date.now();

            // Load heavier lists in background so Home stays responsive and navigation is not blocked.
            void Promise.allSettled([
                getAllVideos(apiAccessToken),
                getAllPhotos(apiAccessToken),
                getPosts(apiAccessToken, { limit: 500 }),
            ]).then((results) => {
                const [videosRes, photosRes, postsRes] = results;
                if (videosRes.status === 'fulfilled') {
                    setAllVideos(videosRes.value);
                    homeCache.videos = videosRes.value;
                }
                if (photosRes.status === 'fulfilled') {
                    setAllPhotos(photosRes.value);
                    homeCache.photos = photosRes.value;
                }
                if (postsRes.status === 'fulfilled') {
                    const posts = Array.isArray(postsRes.value?.posts) ? postsRes.value.posts : [];
                    setAllPosts(posts);
                    homeCache.posts = posts;
                }
                homeCache.fetchedAt = Date.now();
            });
        } catch (e: any) {
            const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
            setOverviewError(msg);
        } finally {
            setIsLoadingOverview(false);
        }
    }, [apiAccessToken, overview, t]);

    const loadOverview = useCallback((force = false) => {
        if (!apiAccessToken) {
            setOverview(null);
            setOverviewError(t('Log in to load overview.'));
            return Promise.resolve();
        }

        const now = Date.now();
        const recent = now - lastLoadRequestRef.current < 400;
        if (!force && recent) {
            return new Promise<void>((resolve) => {
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

    useFocusEffect(
        useCallback(() => {
            loadOverview(false);
        }, [loadOverview]),
    );

    const loadUnreadNotificationsCount = useCallback(async () => {
        if (!apiAccessToken) {
            setUnreadNotificationsCount(0);
            return;
        }
        try {
            const resp = await getNotifications(apiAccessToken, { limit: 1, offset: 0 });
            const count = Number(resp?.unread_count ?? 0);
            setUnreadNotificationsCount(Number.isFinite(count) && count > 0 ? count : 0);
        } catch {
            setUnreadNotificationsCount(0);
        }
    }, [apiAccessToken]);

    useFocusEffect(
        useCallback(() => {
            loadUnreadNotificationsCount();
        }, [loadUnreadNotificationsCount]),
    );
    const handleRefresh = useCallback(async () => {
        if (refreshingFeed) return;
        setRefreshingFeed(true);
        try {
            await loadOverview(true);
            setFeedVisibleCount(HOME_FEED_PAGE_SIZE);
        } finally {
            setRefreshingFeed(false);
        }
    }, [loadOverview, refreshingFeed]);

    useEffect(() => {
        if (isFocused) {
            setResumeVideoAt(videoResumeRef.current || 0);
        }
    }, [isFocused]);

    useEffect(() => {
        if (!enableSharedOverlay) return;
        const media = overviewVideo ?? topVideos[0] ?? null;
        if (!media || !overviewInlineVideoUrl) return;
        if (!overlayVisible) {
            setOverlayMedia(media);
            setOverlayVideoUrl((prev) => (prev === overviewInlineVideoUrl ? prev : overviewInlineVideoUrl));
        }
    }, [enableSharedOverlay, overviewInlineVideoUrl, overviewVideo, topVideos, overlayVisible]);

    useEffect(() => {
        if (overlayVisible || !overlayVideoUrl) return;
        const resumeTime =
            resumeByUrlRef.current[overlayVideoUrl] ??
            videoResumeRef.current ??
            overlayCurrentTime ??
            0;
        if (!Number.isFinite(resumeTime) || resumeTime <= 0) return;
        requestAnimationFrame(() => {
            overlayVideoRef.current?.seek(resumeTime);
        });
        const timer = setTimeout(() => {
            overlayVideoRef.current?.seek(resumeTime);
        }, 150);
        return () => clearTimeout(timer);
    }, [overlayVisible, overlayVideoUrl, overlayCurrentTime]);

    const apiBaseUrl = useMemo(() => {
        return getApiBaseUrl();
    }, []);
    const hlsBaseUrl = useMemo(() => {
        return getHlsBaseUrl();
    }, []);

    const toAbsoluteUrl = useCallback((value?: string | null) => {
        if (!value) return null;
        const str = String(value);
        if (str.startsWith('http://') || str.startsWith('https://')) return str;
        return `${apiBaseUrl}${str.startsWith('/') ? '' : '/'}${str}`;
    }, [apiBaseUrl]);

    useEffect(() => {
        if (!apiAccessToken || !isFocused) return;
        let mounted = true;
        getProfileSummary(apiAccessToken)
            .then((summary) => {
                if (!mounted) return;
                const avatarMedia = summary?.profile?.avatar_media ?? null;
                const avatarCandidate =
                    avatarMedia?.thumbnail_url ||
                    avatarMedia?.preview_url ||
                    avatarMedia?.full_url ||
                    avatarMedia?.raw_url ||
                    avatarMedia?.original_url ||
                    summary?.profile?.avatar_url ||
                    null;
                if (avatarCandidate) {
                    const resolved = toAbsoluteUrl(String(avatarCandidate));
                    setProfileAvatarUrl(resolved);
                } else {
                    setProfileAvatarUrl(null);
                }
            })
            .catch(() => {});
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, isFocused, toAbsoluteUrl]);

    const toHlsUrl = useCallback((value?: string | null) => {
        if (!value) return null;
        const str = String(value);
        if (str.startsWith('http://') || str.startsWith('https://')) return str;
        return `${hlsBaseUrl}${str.startsWith('/') ? '' : '/'}${str}`;
    }, [hlsBaseUrl]);

    const formatTimeAgo = useCallback((value?: string | null) => {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
        if (diffSeconds < 60) return 'just now';
        const minutes = Math.floor(diffSeconds / 60);
        if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
        return date.toLocaleDateString();
    }, []);

    const formatUploadDate = useCallback((value?: string | null) => {
        const date = value ? new Date(value) : new Date();
        if (Number.isNaN(date.getTime())) return new Date().toLocaleDateString('en-GB', {
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

    const formatPostTime = useCallback((value?: string | null) => {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
        if (diffSeconds < 60) return t('just now');
        const minutes = Math.floor(diffSeconds / 60);
        if (minutes < 60) return `${minutes}${t('m ago')}`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}${t('h ago')}`;
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    }, [t]);

    const pickDescription = useCallback((title?: string | null, description?: string | null, fallback?: string) => {
        const trimmedTitle = (title ?? '').trim();
        const trimmedDesc = (description ?? '').trim();
        const fallbackText = (fallback ?? '').trim();
        const candidate = trimmedDesc || fallbackText;
        if (!candidate) return '';
        if (trimmedTitle && candidate.toLowerCase() === trimmedTitle.toLowerCase()) {
            return '';
        }
        return candidate;
    }, []);

    const formatLikesLabel = useCallback((media?: HomeOverviewMedia | MediaViewAllItem | null) => {
        if (!media) return '';
        const raw = Number((media as any).likes_count ?? (media as any).likesCount ?? 0);
        const count = Number.isFinite(raw) && raw > 0 ? raw : 0;
        return `${count.toLocaleString()} ${t('likes')}`;
    }, [t]);
    const formatViewsLabel = useCallback((media?: HomeOverviewMedia | MediaViewAllItem | null) => {
        if (!media) return '';
        const raw = Number((media as any).views_count ?? (media as any).viewsCount ?? 0);
        const count = Number.isFinite(raw) && raw > 0 ? raw : 0;
        return count.toLocaleString();
    }, []);

    const handleToggleLike = useCallback(async (mediaId?: string | null) => {
        const id = String(mediaId || '').trim();
        if (!id || !apiAccessToken) return;
        try {
            const r = await toggleMediaLike(apiAccessToken, id);
            // Update cached overview/media lists in-place (best effort).
            setOverview((prev) => {
                if (!prev) return prev;
                const next: any = JSON.parse(JSON.stringify(prev));
                const slots = ['video', 'photo'];
                for (const k of slots) {
                    const m = next?.overview?.[k];
                    if (m && String(m.media_id) === id) {
                        m.likes_count = r.likes_count;
                        m.liked_by_me = r.liked;
                    }
                }
                if (next?.overview?.blog?.media && String(next.overview.blog.media.media_id) === id) {
                    next.overview.blog.media.likes_count = r.likes_count;
                    next.overview.blog.media.liked_by_me = r.liked;
                }
                return next;
            });
            setAllVideos((prev) => prev.map((x: any) => (String(x.media_id) === id ? { ...x, likes_count: r.likes_count, liked_by_me: r.liked } : x)));
            setAllPhotos((prev) => prev.map((x: any) => (String(x.media_id) === id ? { ...x, likes_count: r.likes_count, liked_by_me: r.liked } : x)));
        } catch (e: any) {
            const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
            Alert.alert(t('Like failed'), msg || t('Could not update like right now.'));
        }
    }, [apiAccessToken, t]);

    const handleTogglePostLike = useCallback(async (postId?: string | null) => {
        const id = String(postId || '').trim();
        if (!id || !apiAccessToken) return;
        try {
            const r = await togglePostLike(apiAccessToken, id);
            setOverview((prev) => {
                if (!prev) return prev;
                const next: any = JSON.parse(JSON.stringify(prev));
                if (next?.overview?.blog?.post && String(next.overview.blog.post.id) === id) {
                    next.overview.blog.post.likes_count = r.likes_count;
                    next.overview.blog.post.liked_by_me = r.liked;
                }
                return next;
            });
            setAllPosts((prev) =>
                prev.map((post) =>
                    String(post.id) === id
                        ? { ...post, likes_count: r.likes_count, liked_by_me: r.liked }
                        : post
                )
            );
        } catch (e: any) {
            const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
            Alert.alert(t('Like failed'), msg || t('Could not update like right now.'));
        }
    }, [apiAccessToken, t]);


    const formatDuration = useCallback((value: number) => {
        const safeValue = Number.isFinite(value) ? Math.max(0, value) : 0;
        const minutes = Math.floor(safeValue / 60);
        const seconds = Math.floor(safeValue % 60);
        const paddedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
        return `${minutes}:${paddedSeconds}`;
    }, []);

    const isSignedUrl = useCallback((value?: string | null) => {
        if (!value) return false;
        const lower = String(value).toLowerCase();
        return (
            lower.includes('x-amz-signature') ||
            lower.includes('x-amz-credential') ||
            lower.includes('x-amz-security-token') ||
            lower.includes('signature=') ||
            lower.includes('sig=') ||
            lower.includes('token=') ||
            lower.includes('expires=') ||
            lower.includes('sv=') ||
            lower.includes('se=') ||
            lower.includes('sp=')
        );
    }, []);

    const withAccessToken = useCallback((value?: string | null) => {
        if (!value) return undefined;
        if (!apiAccessToken) return value;
        if (isSignedUrl(value)) return value;
        if (value.includes('access_token=')) return value;
        const sep = value.includes('?') ? '&' : '?';
        return `${value}${sep}access_token=${encodeURIComponent(apiAccessToken)}`;
    }, [apiAccessToken, isSignedUrl]);

    const getFileExtension = useCallback((value?: string | null) => {
        if (!value) return '';
        const clean = String(value).split('?')[0];
        const match = clean.match(/\.([a-z0-9]+)$/i);
        return match ? match[1].toLowerCase() : '';
    }, []);

    const pickDownloadUrl = useCallback((media?: HomeOverviewMedia | MediaViewAllItem | null) => {
        if (!media) return null;
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

    const buildDownloadPath = useCallback((media: HomeOverviewMedia | MediaViewAllItem, sourceUrl: string) => {
        const ext = getFileExtension(sourceUrl) || (media.type === 'video' ? 'mp4' : 'jpg');
        const safeId = String(media.media_id || 'media').replace(/[^a-z0-9_-]/gi, '');
        const fileName = `allin_${safeId}_${Date.now()}.${ext}`;
        return `${RNFS.CachesDirectoryPath}/${fileName}`;
    }, [getFileExtension]);

    const getMediaShareUrl = useCallback((media?: HomeOverviewMedia | MediaViewAllItem | null) => {
        if (!media) return '';
        const hls = media.hls_manifest_path ? toHlsUrl(media.hls_manifest_path) : null;
        if (hls) return withAccessToken(hls) || hls;
        const url = media.preview_url || media.original_url || media.full_url || media.raw_url || null;
        return url ? withAccessToken(toAbsoluteUrl(url) || '') || '' : '';
    }, [toAbsoluteUrl, toHlsUrl, withAccessToken]);

    const handleShareMedia = useCallback(async (media?: HomeOverviewMedia | MediaViewAllItem | null) => {
        const url = getMediaShareUrl(media);
        if (!url) {
            Alert.alert(t('Share unavailable'), t('No media link available yet.'));
            return;
        }
        try {
            await Share.share({ message: url, url });
        } catch {
            // ignore share cancellation
        }
    }, [getMediaShareUrl, t]);

    const handleDownloadMedia = useCallback(async (media?: HomeOverviewMedia | MediaViewAllItem | null) => {
        if (!media?.media_id) {
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
            recordDownload(apiAccessToken, { media_id: media.media_id, event_id: media.event_id ?? undefined }).catch(() => {});
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
            await download;
            const exists = await RNFS.exists(localPath);
            if (!exists) {
                throw new Error('Download failed');
            }
            const fileUrl = `file://${localPath}`;
            const extension = getFileExtension(localPath) || (media.type === 'video' ? 'mp4' : 'jpg');
            const filename = `allin_${media.media_id}.${extension}`;
            await NativeShare.open({
                urls: [fileUrl],
                type: media.type === 'video' ? 'video/mp4' : 'image/jpeg',
                filename,
                failOnCancel: false,
                showAppsToView: true,
            });
        } catch (e: any) {
            const msg = e instanceof ApiError ? e.message : t('Download failed');
            Alert.alert(t('Download failed'), msg);
        } finally {
            setDownloadVisible(false);
            setDownloadProgress(null);
            downloadInFlightRef.current = false;
        }
    }, [apiAccessToken, buildDownloadPath, pickDownloadUrl, t]);

    const openFeedMenu = useCallback(
        (media: HomeOverviewMedia | MediaViewAllItem | null, opts: { isVideo?: boolean; title?: string } = {}) => {
            const safeMedia = media ?? null;
            const eventName = safeMedia?.event_id ? eventNameById(safeMedia.event_id) : undefined;
            const label = opts.title || eventName || t('Event');
            const actions = [
                { label: t('Download'), onPress: () => handleDownloadMedia(safeMedia) },
                { label: t('Share'), onPress: () => handleShareMedia(safeMedia) },
                { label: t('Share to Instagram Story'), onPress: () => handleShareMedia(safeMedia) },
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
                        const location = String((safeMedia as any)?.event_location || '').trim();
                        const organizer = String(
                            (safeMedia as any)?.organizing_club
                            || (safeMedia as any)?.organizer_club
                            || '',
                        ).trim();
                        const eventDate = String((safeMedia as any)?.event_date || '').trim();
                        const typeToken = `${(safeMedia as any)?.competition_type || ''} ${label} ${location}`.toLowerCase();
                        const competitionType = /road|trail|marathon|veldloop|veldlopen|cross|5k|10k|half|ultra|city\s*run/.test(typeToken)
                            ? 'road'
                            : 'track';
                        navigation.navigate('CompetitionDetailsScreen', {
                            eventId: safeMedia?.event_id ? String(safeMedia.event_id) : undefined,
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
                    onPress: () =>
                        navigation.navigate('VideoPlayingScreen', {
                            mediaId: safeMedia?.media_id,
                            video: {
                                title: label,
                                thumbnail: getMediaThumb(safeMedia) ?? Images.photo1,
                                uri: pickPlayableVideoUrl(safeMedia) ?? '',
                            },
                        }),
                });
            }
            setFeedMenuTitle(label);
            setFeedMenuActions(actions);
            setFeedMenuVisible(true);
        },
        [eventNameById, getMediaThumb, handleDownloadMedia, handleShareMedia, navigation, openReportIssuePopup, pickPlayableVideoUrl, showInfoPopup, t],
    );

    const pickPlayableVideoUrl = useCallback((media?: HomeOverviewMedia | MediaViewAllItem | null) => {
        if (!media) return null;
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
        if (mp4) return mp4;
        const hls = media.hls_manifest_path ? toHlsUrl(media.hls_manifest_path) : null;
        return hls || candidates[0] || null;
    }, [toAbsoluteUrl, toHlsUrl]);

    const prewarmVideo = useCallback((url?: string) => {
        if (!url) return;
        try {
            const isHls = url.toLowerCase().includes('.m3u8');
            if (!isHls) {
                const headers = { Range: 'bytes=0-65535' };
                fetch(url, { method: 'GET', headers }).catch(() => {});
                return;
            }
            fetch(url, { method: 'GET' })
                .then((res) => res.text())
                .then((text) => {
                    const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
                    const segmentLine = lines.find((line) => !line.startsWith('#'));
                    if (!segmentLine) return;
                    let segmentUrl = segmentLine;
                    if (!/^https?:\/\//i.test(segmentLine)) {
                        const base = url.split('?')[0];
                        const prefix = base.substring(0, base.lastIndexOf('/') + 1);
                        segmentUrl = `${prefix}${segmentLine}`;
                    }
                    fetch(segmentUrl, { method: 'GET' }).catch(() => {});
                })
                .catch(() => {});
        } catch {
            // ignore warm failures
        }
    }, []);

    const openOverlayPlayer = useCallback((media: HomeOverviewMedia | MediaViewAllItem | null, inlineUrl?: string | null, startAt = 0) => {
        if (!media) return;
        const rect = sharedVideoRectRef.current;
        const canUseShared = rect && rect.width > 0 && rect.height > 0;
        if (!canUseShared) {
            buildMediaCardPress(media as MediaViewAllItem, startAt, inlineUrl || undefined);
            return;
        }
        const playerUrl = withAccessToken(pickPlayableVideoUrl(media) || inlineUrl || '');
        if (!playerUrl) return;
        const storedResume = resumeByUrlRef.current[playerUrl] ?? 0;
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
        } else {
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
        setOverlayVisible(false);
        setOverlayPlaying(true);
        const resumeTime = pendingSeekRef.current ?? videoResumeRef.current ?? overlayCurrentTime ?? 0;
        if (overlayVideoUrl) {
            resumeByUrlRef.current[overlayVideoUrl] = resumeTime;
        }
        videoResumeRef.current = resumeTime;
        setResumeVideoAt(resumeTime);
        if (resumeTime > 0) {
            overlayVideoRef.current?.seek(resumeTime);
            requestAnimationFrame(() => {
                overlayVideoRef.current?.seek(resumeTime);
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

    const overviewVideo = overview?.overview?.video ?? null;
    const overviewPhoto = overview?.overview?.photo ?? null;
    const overviewBlog = overview?.overview?.blog ?? null;

    const sortByNewest = useCallback((items: MediaViewAllItem[]) => {
        return [...items].sort((a, b) => {
            const aDate = new Date(String(a.created_at ?? '')).getTime();
            const bDate = new Date(String(b.created_at ?? '')).getTime();
            if (Number.isNaN(aDate) || Number.isNaN(bDate)) return 0;
            return bDate - aDate;
        });
    }, []);

    const mediaDedupFingerprint = useCallback((media?: Partial<MediaViewAllItem> | null) => {
        if (!media) return '';
        const stripQuery = (value?: string | null) => String(value || '').trim().split('?')[0] || '';
        const assetKeys = Array.isArray(media.assets)
            ? media.assets
                  .map((a) => String(a?.storage_key || '').trim())
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
        const unique: MediaViewAllItem[] = [];
        sortByNewest(allVideos).forEach((item) => {
            if (unique.find((existing) => existing.media_id === item.media_id)) return;
            unique.push(item);
        });
        return unique;
    }, [allVideos, sortByNewest]);

    const topPhotos = useMemo(() => {
        const unique: MediaViewAllItem[] = [];
        sortByNewest(allPhotos).forEach((item) => {
            if (unique.find((existing) => existing.media_id === item.media_id)) return;
            unique.push(item);
        });
        return unique;
    }, [allPhotos, sortByNewest]);

    const infiniteFeedItems = useMemo<HomeFeedItem[]>(() => {
        const uniqueMedia: MediaViewAllItem[] = [];
        const seenIds = new Set<string>();
        const seenFingerprints = new Set<string>();

        const overviewMediaCandidates: Array<HomeOverviewMedia | null | undefined> = [
            overview?.overview?.video,
            overview?.overview?.photo,
            overview?.overview?.blog?.media,
        ];
        overviewMediaCandidates.forEach((item) => {
            if (!item) return;
            const id = String((item as any).media_id || '').trim();
            const fingerprint = mediaDedupFingerprint(item as unknown as MediaViewAllItem);
            if ((id && seenIds.has(id)) || (fingerprint && seenFingerprints.has(fingerprint))) return;
            if (id) seenIds.add(id);
            if (fingerprint) seenFingerprints.add(fingerprint);
            uniqueMedia.push(item as unknown as MediaViewAllItem);
        });

        sortByNewest([...topVideos, ...topPhotos]).forEach((item) => {
            const id = String(item.media_id || '').trim();
            const fingerprint = mediaDedupFingerprint(item);
            if (!id && !fingerprint) return;
            if ((id && seenIds.has(id)) || (fingerprint && seenFingerprints.has(fingerprint))) return;
            if (id) seenIds.add(id);
            if (fingerprint) seenFingerprints.add(fingerprint);
            uniqueMedia.push(item);
        });
        const mediaEntries: HomeFeedItem[] = uniqueMedia.map((media) => ({
            kind: 'media',
            created_at: media.created_at ?? null,
            media,
        }));

        const seededBlogEntry: HomeFeedItem[] =
            overview?.overview?.blog?.post && !allPosts.some((p) => String(p?.id || '') === String(overview.overview.blog?.post?.id || ''))
                ? [{
                    kind: 'post',
                    created_at: overview.overview.blog.post.created_at ?? null,
                    post: {
                        id: overview.overview.blog.post.id,
                        title: overview.overview.blog.post.title ?? '',
                        summary: overview.overview.blog.post.summary ?? undefined,
                        description: overview.overview.blog.post.description ?? undefined,
                        created_at: overview.overview.blog.post.created_at ?? undefined,
                        likes_count: overview.overview.blog.post.likes_count ?? 0,
                        liked_by_me: overview.overview.blog.post.liked_by_me ?? false,
                        reading_time_minutes: overview.overview.blog.post.reading_time_minutes ?? undefined,
                        views_count: overview.overview.blog.post.views_count ?? 0,
                        author: overview.overview.blog.author
                            ? {
                                  profile_id: overview.overview.blog.author.profile_id ?? '',
                                  display_name: overview.overview.blog.author.display_name ?? undefined,
                                  avatar_url: overview.overview.blog.author.avatar_url ?? undefined,
                              }
                            : undefined,
                    } as PostSummary,
                }]
                : [];

        const seenPostKeys = new Set<string>();
        const textOnlyPosts: HomeFeedItem[] = allPosts
            .filter((post) => !post?.cover_media)
            .filter((post) => {
                const id = String(post?.id || '').trim();
                const key = id || [
                    String(post?.created_at || '').trim(),
                    String(post?.title || '').trim().toLowerCase(),
                    String(post?.summary || post?.description || '').trim().slice(0, 120).toLowerCase(),
                ].join('|');
                if (!key || seenPostKeys.has(key)) return false;
                seenPostKeys.add(key);
                return true;
            })
            .map((post) => ({
                kind: 'post',
                created_at: post?.created_at ?? null,
                post,
            }));
        const sorted = [...seededBlogEntry, ...mediaEntries, ...textOnlyPosts].sort((a, b) => {
            const aTs = new Date(String(a.created_at || '')).getTime();
            const bTs = new Date(String(b.created_at || '')).getTime();
            const safeA = Number.isFinite(aTs) ? aTs : 0;
            const safeB = Number.isFinite(bTs) ? bTs : 0;
            return safeB - safeA;
        });
        const seenFeedKeys = new Set<string>();
        return sorted.filter((entry) => {
            const key =
                entry.kind === 'media'
                    ? `media:${String(entry.media?.media_id || '').trim() || mediaDedupFingerprint(entry.media)}`
                    : `post:${String(entry.post?.id || '').trim() || `${String(entry.post?.created_at || '')}|${String(entry.post?.title || '')}`}`;
            if (!key || seenFeedKeys.has(key)) return false;
            seenFeedKeys.add(key);
            return true;
        });
    }, [allPosts, mediaDedupFingerprint, overview, sortByNewest, topPhotos, topVideos]);

    useEffect(() => {
        setFeedVisibleCount((prev) => {
            const target = Math.min(HOME_FEED_PAGE_SIZE, infiniteFeedItems.length);
            if (prev === target) return prev;
            return target;
        });
    }, [infiniteFeedItems.length]);

    const visibleFeedItems = useMemo(
        () => infiniteFeedItems.slice(0, feedVisibleCount),
        [feedVisibleCount, infiniteFeedItems],
    );

    const hasMoreFeedItems = feedVisibleCount < infiniteFeedItems.length;

    const loadMoreFeedItems = useCallback(() => {
        if (!hasMoreFeedItems) return;
        const now = Date.now();
        if (now - feedLoadThrottleRef.current < 250) return;
        feedLoadThrottleRef.current = now;
        setFeedVisibleCount((prev) => Math.min(prev + HOME_FEED_PAGE_SIZE, infiniteFeedItems.length));
    }, [hasMoreFeedItems, infiniteFeedItems.length]);

    const overviewInlineVideoUrl = useMemo(() => {
        return withAccessToken(
            (overviewVideo?.hls_manifest_path
                ? toHlsUrl(overviewVideo.hls_manifest_path)
                : null) ||
            (topVideos[0]?.hls_manifest_path
                ? toHlsUrl(topVideos[0].hls_manifest_path)
                : null) ||
            toAbsoluteUrl(
                overviewVideo?.preview_url ||
                overviewVideo?.preview_url ||
                overviewVideo?.original_url ||
                overviewVideo?.full_url ||
                overviewVideo?.raw_url ||
                topVideos[0]?.preview_url ||
                topVideos[0]?.original_url ||
                topVideos[0]?.full_url ||
                topVideos[0]?.raw_url ||
                undefined,
            ) || undefined
        );
    }, [
        overviewVideo?.hls_manifest_path,
        overviewVideo?.preview_url,
        overviewVideo?.original_url,
        overviewVideo?.full_url,
        overviewVideo?.raw_url,
        topVideos,
        toAbsoluteUrl,
        toHlsUrl,
        withAccessToken,
    ]);

    const getMediaThumb = useCallback((item?: HomeOverviewMedia | null) => {
        if (!item) return null;
        const candidate =
            item.preview_url ||
            item.thumbnail_url ||
            item.full_url ||
            item.raw_url ||
            null;
        if (!candidate) return null;
        const absolute = toAbsoluteUrl(candidate);
        const resolved = withAccessToken(absolute || '') || absolute;
        return resolved ? { uri: resolved } : null;
    }, [toAbsoluteUrl, withAccessToken]);

    const blogPrimaryMedia = useMemo(() => {
        return (
            overviewBlog?.media ||
            topPhotos[0] ||
            overviewPhoto ||
            overviewVideo ||
            null
        );
    }, [overviewBlog?.media, overviewPhoto, overviewVideo, topPhotos]);

    const blogPrimaryImage = useMemo(() => {
        return getMediaThumb(blogPrimaryMedia) || Images.photo3;
    }, [blogPrimaryMedia, getMediaThumb]);

    const blogExtraVideos = useMemo(() => {
        return topVideos as HomeOverviewMedia[];
    }, [topVideos]);

    const blogGalleryItems = useMemo(() => {
        const buildItem = (media?: HomeOverviewMedia | MediaViewAllItem | null, fallbackImage?: any) => {
            const image = getMediaThumb(media) || fallbackImage || Images.photo3;
            const videoUri = pickPlayableVideoUrl(media);
            const isVideo = Boolean(
                media?.type === 'video' ||
                (videoUri && /\.(m3u8|mp4|mov|m4v)(\?|$)/.test(videoUri.toLowerCase())),
            );
            return {
                image,
                videoUri,
                type: isVideo ? 'video' : 'image',
                media: media ?? null,
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
            } else {
                photos += 1;
            }
        });
        return { photos, videos };
    }, [blogGalleryItems]);
    const blogMediaCountsLabel = useMemo(() => {
        const parts = [];
        if (blogMediaCounts.photos > 0) parts.push(`${blogMediaCounts.photos} photo${blogMediaCounts.photos === 1 ? '' : 's'}`);
        if (blogMediaCounts.videos > 0) parts.push(`${blogMediaCounts.videos} video${blogMediaCounts.videos === 1 ? '' : 's'}`);
        if (parts.length === 0) return 'No media';
        return parts.join(' • ');
    }, [blogMediaCounts]);

    const extractProfileIdFromMedia = useCallback((item?: HomeOverviewMedia | MediaViewAllItem | null) => {
        if (!item) return null;
        const fromAny =
            (item as any)?.uploader_profile_id ||
            (item as any)?.profile_id ||
            (item as any)?.author_profile_id ||
            (item as any)?.owner_profile_id ||
            null;
        return fromAny ? String(fromAny) : null;
    }, []);

    useEffect(() => {
        if (!apiAccessToken) return;
        const missing: string[] = [];
        visibleFeedItems.forEach((entry) => {
            if (entry.kind !== 'media') return;
            const profileId = String(extractProfileIdFromMedia(entry.media) || '').trim();
            if (!profileId) return;
            if (uploaderMap[profileId]) return;
            if (uploaderFetchInFlightRef.current.has(profileId)) return;
            missing.push(profileId);
        });
        if (missing.length === 0) return;
        missing.forEach((profileId) => {
            uploaderFetchInFlightRef.current.add(profileId);
            getProfileSummaryById(apiAccessToken, profileId)
                .then((res) => {
                    const displayName = String(res?.profile?.display_name || '').trim();
                    const avatarCandidate = String(res?.profile?.avatar_url || '').trim();
                    setUploaderMap((prev) => ({
                        ...prev,
                        [profileId]: {
                            name: displayName || `@${profileId.slice(0, 8)}`,
                            avatarUrl: avatarCandidate || null,
                        },
                    }));
                })
                .catch(() => {})
                .finally(() => {
                    uploaderFetchInFlightRef.current.delete(profileId);
                });
        });
    }, [apiAccessToken, extractProfileIdFromMedia, uploaderMap, visibleFeedItems]);

    const getMediaUploaderInfo = useCallback((media?: MediaViewAllItem | null) => {
        const profileId = String(extractProfileIdFromMedia(media) || '').trim();
        const mapped = profileId ? uploaderMap[profileId] : undefined;
        const isSelf = !!profileId && profileId === String(overview?.profile_id || '').trim();
        const fallbackName = isSelf ? userName : (mapped?.name || t('Uploader'));
        const fallbackAvatar =
            isSelf
                ? (profilePic ? { uri: profilePic } : Images.profile1)
                : mapped?.avatarUrl
                    ? { uri: toAbsoluteUrl(mapped.avatarUrl) as string }
                    : Images.profile1;
        return {
            profileId,
            name: fallbackName,
            avatar: fallbackAvatar,
        };
    }, [extractProfileIdFromMedia, overview?.profile_id, profilePic, toAbsoluteUrl, t, uploaderMap, userName]);

    const openProfileFromId = useCallback((profileId?: string | null) => {
        const safeProfileId = String(profileId || '').trim();
        if (!safeProfileId) return;
        const ownProfileId = String(overview?.profile_id || '').trim();
        if (ownProfileId && safeProfileId === ownProfileId) {
            // console.log("own: " + ownProfileId);
            // console.log("safe: " + safeProfileId);
            navigation.navigate('BottomTabBar', { screen: 'Profile' });
            return;
        }
        navigation.navigate('ViewUserProfileScreen', { profileId: safeProfileId });
    }, [navigation, overview?.profile_id]);

    const updateVisibility = useCallback(() => {
        const scrollY = scrollYRef.current;
        const viewportBottom = scrollY + windowHeight;
        const layouts = feedLayoutsRef.current;
        const videoLayout = layouts[0];
        const blogLayout = layouts[1];
        const isVisible = (layout?: { y: number; height: number }) => {
            if (!layout) return false;
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
        if (!cardLayout || !offset) return;
        const scrollY = scrollYRef.current;
        const scrollViewLayout = scrollViewLayoutRef.current;
        const next = {
            x: scrollViewLayout.x + cardLayout.x + offset.x,
            y: scrollViewLayout.y + cardLayout.y + offset.y - scrollY,
            width: offset.width,
            height: offset.height,
        };
        const prev = sharedVideoRectRef.current;
        if (
            !prev ||
            Math.abs(prev.x - next.x) > 0.5 ||
            Math.abs(prev.y - next.y) > 0.5 ||
            Math.abs(prev.width - next.width) > 0.5 ||
            Math.abs(prev.height - next.height) > 0.5
        ) {
            sharedVideoRectRef.current = next;
            setSharedVideoRect(next);
        }
    }, []);

    const buildMediaCardPress = useCallback((item?: MediaViewAllItem | null, startAt?: number, preferredVideoUrl?: string) => {
        if (!item) return;
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
            startAt: startAt ?? 0,
            preferredVideoUrl: preferredVideoUrl ?? undefined,
        });
    }, [eventNameById, navigation]);

    const getMediaAspectRatios = useCallback((media?: MediaViewAllItem | null) => {
        if (!media) return undefined;
        const assets = Array.isArray(media.assets) ? media.assets : [];
        const preferredVariants = ['raw', 'full', 'preview_watermark', 'thumbnail'];
        for (const variant of preferredVariants) {
            const asset = assets.find((entry) => String(entry?.variant ?? '').toLowerCase() === variant);
            const width = Number(asset?.width ?? 0);
            const height = Number(asset?.height ?? 0);
            if (width > 0 && height > 0) {
                return { 0: width / height };
            }
        }
        return undefined;
    }, []);

    const keyExtractor = useCallback((item: HomeFeedItem) => {
        if (item.kind === 'post') {
            return `post:${String(item.post?.id || '').trim() || `${String(item.post?.created_at || '')}|${String(item.post?.title || '')}`}`;
        }
        return `media:${String(item.media?.media_id || '').trim() || mediaDedupFingerprint(item.media)}`;
    }, [mediaDedupFingerprint]);

    const renderFeedItem = useCallback(
        ({ item }: ListRenderItemInfo<HomeFeedItem>) => {
            if (item.kind === 'post') {
                const post = item.post;
                const translated = Boolean(translatedBlogsById[String(post.id)]);
                const postDescriptionRaw = String(post.summary ?? post.description ?? '');
                const postDescription = translated ? translateText(postDescriptionRaw, i18n.language) : postDescriptionRaw;
                return (
                    <NewsFeedCard
                        title={post.title ?? t('Latest blog')}
                        images={['__text__']}
                        textSlide={{
                            title: post.title ?? t('Latest blog'),
                            description: postDescription,
                        }}
                        user={{
                            name: post.author?.display_name ?? userName,
                            avatar: post.author?.avatar_url
                                ? { uri: toAbsoluteUrl(post.author.avatar_url) as string }
                                : (profilePic ? { uri: profilePic } : Images.profile1),
                            date: formatPostTime(post.created_at),
                        }}
                        onPressUser={() => openProfileFromId(post.author?.profile_id)}
                        headerSeparated
                        hideBelowText
                        likesLabel={`${Number(post?.likes_count ?? 0).toLocaleString()} ${t('likes')}`}
                        liked={Boolean(post?.liked_by_me)}
                        onToggleLike={() => handleTogglePostLike(post.id)}
                        likeDisabled={!String(post?.id ?? '').trim()}
                        showActions
                        onTranslate={() =>
                            setTranslatedBlogsById((prev) => ({
                                ...prev,
                                [String(post.id)]: !prev[String(post.id)],
                            }))
                        }
                        onShare={async () => {
                            try {
                                await NativeShare.open({
                                    message: post?.title
                                        ? String(post.title)
                                        : String(post?.description ?? post?.summary ?? t('Latest blog')),
                                    subject: post?.title ? String(post.title) : undefined,
                                });
                            } catch {
                                // ignore
                            }
                        }}
                        onPress={() => {
                            navigation.navigate('ViewUserBlogDetailsScreen', {
                                postId: post.id,
                                post: {
                                    id: post.id,
                                    title: post.title ?? t('Latest blog'),
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
                                        profile_id: post.author?.profile_id ?? null,
                                        display_name: post.author?.display_name ?? userName,
                                        avatar_url: post.author?.avatar_url ?? null,
                                    },
                                    writer: post.author?.display_name ?? userName,
                                    writerImage: post.author?.avatar_url
                                        ? { uri: toAbsoluteUrl(post.author.avatar_url) as string }
                                        : (profilePic ? { uri: profilePic } : Images.profile1),
                                    description: post.description ?? post.summary ?? '',
                                },
                            });
                        }}
                    />
                );
            }

            const media = item.media;
            const mediaKey = `feed-media-${media.media_id}`;
            const isVideoItem = String(media.type || '').toLowerCase() === 'video';
            const thumb = getMediaThumb(media as any) || Images.photo1;
            const playableVideoUrl = isVideoItem
                ? (withAccessToken(pickPlayableVideoUrl(media) || '') || undefined)
                : undefined;
            const titleText = isVideoItem ? t('Video') : t('Photo');
            const uploader = getMediaUploaderInfo(media);
            const mediaAspectRatios = getMediaAspectRatios(media);
            return (
                <NewsFeedCard
                    title={titleText}
                    description=""
                    images={[thumb]}
                    isVideo={isVideoItem}
                    videoUri={playableVideoUrl}
                    showPlayOverlay={isVideoItem}
                    videoIndexes={isVideoItem ? [0] : []}
                    toggleVideoOnPress={isVideoItem}
                    isActive={Boolean(activeMediaCards[mediaKey]) && isFocused && !overlayVisible}
                    mediaAspectRatios={mediaAspectRatios}
                    user={{
                        name: uploader.name,
                        avatar: uploader.avatar,
                        date: formatPostTime(media.created_at),
                    }}
                    onPressUser={() =>
                        openProfileFromId(
                            uploader.profileId || overview?.profile_id
                        )
                    }
                    headerSeparated
                    viewsLabel={formatViewsLabel(media)}
                    likesLabel={formatLikesLabel(media)}
                    liked={Boolean(media?.liked_by_me)}
                    onToggleLike={() => handleToggleLike(media.media_id)}
                    likeDisabled={!String(media?.media_id ?? '').trim()}
                    showActions
                    onShare={() => handleShareMedia(media)}
                    onDownload={() => handleDownloadMedia(media)}
                    onPressMore={() =>
                        openFeedMenu(media, {
                            isVideo: isVideoItem,
                            title: isVideoItem ? t('Video') : t('Photo'),
                        })
                    }
                    onPress={() => buildMediaCardPress(media)}
                />
            );
        },
        [
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
            openProfileFromId,
            overlayVisible,
            overview?.profile_id,
            pickPlayableVideoUrl,
            profilePic,
            t,
            toAbsoluteUrl,
            translatedBlogsById,
            userName,
            withAccessToken,
        ],
    );

    const feedListExtraData = useMemo(
        () => ({
            activeMediaCards,
            isFocused,
            language: i18n.language,
            overlayVisible,
            overviewProfileId: overview?.profile_id,
            profilePic,
            translatedBlogsById,
            uploaderMap,
        }),
        [
            activeMediaCards,
            i18n.language,
            isFocused,
            overlayVisible,
            overview?.profile_id,
            profilePic,
            translatedBlogsById,
            uploaderMap,
        ],
    );

    const ListHeader = useMemo(
        () => (
            <View style={Styles.scrollContent}>
                <SizeBox height={24} />

                {/* Quick Actions */}
                <View style={Styles.sectionQuickActions}>
                    <View style={Styles.sectionHeader}>
                        <Text style={Styles.sectionTitle}>{t('quickActions')}</Text>
                    </View>
                    <View style={Styles.quickActionsGrid}>
                        {/* First Row - My downloads & Add myself */}
                        <View style={Styles.quickActionsRow}>
                            <TouchableOpacity
                                style={Styles.quickActionCard}
                                onPress={() => navigation.navigate('DownloadsDetailsScreen')}
                            >
                                <Text style={Styles.quickActionText} numberOfLines={1}>{t('myDownloads')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                ref={aiSearchButtonRef}
                                style={[Styles.quickActionCard, showAiSearchIntro && Styles.aiSearchFocusCard]}
                                activeOpacity={0.8}
                                onLayout={() => {
                                    if (!showAiSearchIntro) return;
                                    requestAnimationFrame(() => {
                                        aiSearchButtonRef.current?.measureInWindow((x, y, width, height) => {
                                            if (!width || !height) return;
                                            setAiSearchButtonRect({ x, y, width, height });
                                        });
                                    });
                                }}
                                onPress={() => navigation.push('AISearchScreen', { origin: 'home' })}
                            >
                                <Text style={Styles.quickActionText} numberOfLines={1}>{t('aiSearch')}</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Add myself to events */}
                        <View style={Styles.quickActionsRow}>
                            <TouchableOpacity
                                style={[Styles.quickActionCard, Styles.quickActionCardFull]}
                                onPress={() => navigation.push('AvailableEventsScreen')}
                            >
                                <Text style={Styles.quickActionText} numberOfLines={1}>{t('subscribeCompetition')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        ),
        [
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
        ],
    );

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <Header
                userName={userName}
                profilePic={profilePic}
                notificationCount={unreadNotificationsCount}
                onPressFeed={() => navigation.push('HubScreen')}
                onPressNotifications={() => navigation.navigate('NotificationsScreen')}
                onPressProfile={() => navigation.navigate('BottomTabBar', { screen: 'Profile' })}
            />
            <FlatList
                data={visibleFeedItems}
                extraData={feedListExtraData}
                renderItem={renderFeedItem}
                keyExtractor={keyExtractor}
                ListHeaderComponent={ListHeader}
                ListFooterComponent={
                    hasMoreFeedItems ? (
                        <View style={{ paddingVertical: 12 }}>
                            <ActivityIndicator color={colors.primaryColor} />
                        </View>
                    ) : null
                }
                onViewableItemsChanged={onFeedViewableItemsChanged}
                viewabilityConfig={feedViewabilityConfig}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingBottom: insets.bottom > 0 ? insets.bottom + 20 : 40}}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshingFeed}
                        onRefresh={handleRefresh}
                        tintColor={colors.primaryColor}
                    />
                }
                initialNumToRender={HOME_FEED_PAGE_SIZE}
                maxToRenderPerBatch={6}
                windowSize={7}
                removeClippedSubviews
                scrollEnabled={!overlayVisible}
                onLayout={(event) => {
                    scrollYRef.current = 0;
                    scrollViewLayoutRef.current = {
                        x: event.nativeEvent.layout.x,
                        y: event.nativeEvent.layout.y,
                    };
                }}
                onScroll={(event) => {
                    scrollYRef.current = event.nativeEvent.contentOffset.y;
                }}
                onEndReached={loadMoreFeedItems}
                onEndReachedThreshold={0.35}
            />

            {enableSharedOverlay && overlayVideoUrl && sharedVideoRect && sharedVideoRect.width > 0 && sharedVideoRect.height > 0 && (
                <View
                    style={Styles.sharedVideoLayer}
                    pointerEvents={overlayVisible ? 'auto' : 'none'}
                >
                    <View
                        style={[
                            Styles.sharedVideoWrapper,
                            overlayVisible
                                ? Styles.sharedVideoFullscreen
                                : {
                                      left: sharedVideoRect.x,
                                      top: sharedVideoRect.y,
                                      width: sharedVideoRect.width,
                                      height: sharedVideoRect.height,
                                  },
                        ]}
                    >
                        {overlayVisible && overlayLoading && (
                            <View style={Styles.videoOverlaySkeleton}>
                                <ShimmerEffect width="100%" height="100%" borderRadius={0} />
                            </View>
                        )}
                        <Video
                            ref={overlayVideoRef}
                            source={{
                                uri: overlayVideoUrl,
                                type: overlayVideoUrl.toLowerCase().includes('.m3u8') ? 'm3u8' : undefined,
                            }}
                            style={Styles.sharedVideo}
                            resizeMode="cover"
                            paused={
                                overlayVisible
                                    ? !overlayPlaying
                                    : !(isFocused && (isVideoVisible || !overlayHasInitialTime))
                            }
                            controls={false}
                            muted={overlayMuted}
                            volume={overlayMuted ? 0 : 1.0}
                            repeat={false}
                            playInBackground={false}
                            playWhenInactive={false}
                            ignoreSilentSwitch="ignore"
                            automaticallyWaitsToMinimizeStalling={false}
                            bufferConfig={{
                                minBufferMs: 500,
                                maxBufferMs: 6000,
                                bufferForPlaybackMs: 150,
                                bufferForPlaybackAfterRebufferMs: 600,
                            }}
                            onLoadStart={() => {
                                setOverlayLoading(true);
                                setOverlayHasInitialTime(false);
                            }}
                            onLoad={(meta) => {
                                setOverlayDuration(meta.duration || 0);
                                const storedResume = overlayVideoUrl ? (resumeByUrlRef.current[overlayVideoUrl] ?? 0) : 0;
                                const desiredStart = overlayStartAt > 0 ? overlayStartAt : storedResume;
                                if (desiredStart > 0) {
                                    const seekTo = Math.min(desiredStart, meta.duration || desiredStart);
                                    overlayVideoRef.current?.seek(seekTo);
                                    setOverlayCurrentTime(seekTo);
                                    setOverlayHasInitialTime(true);
                                } else {
                                    setOverlayHasInitialTime(false);
                                }
                                setOverlayLoading(false);
                            }}
                            onReadyForDisplay={() => {
                                setOverlayHasInitialTime(true);
                            }}
                            onProgress={(progress) => {
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
                                    } else {
                                        return;
                                    }
                                }
                                if (!overlayHasInitialTime && nextTime > 0) {
                                    setOverlayHasInitialTime(true);
                                }
                                if (!overlaySeeking) {
                                    setOverlayCurrentTime(nextTime);
                                }
                            }}
                            onError={() => {
                                setOverlayLoading(false);
                            }}
                        />
                        {!overlayPlaying && overlayVisible && !overlayLoading && (
                            <View style={Styles.videoOverlayPlayBadge}>
                                <Icons.PlayCricle height={38} width={38} />
                            </View>
                        )}
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => {
                                if (overlayVisible) {
                                    setOverlayPlaying((prev) => !prev);
                                } else {
                                    openOverlayPlayer(overlayMedia ?? overviewVideo ?? topVideos[0] ?? null, overlayVideoUrl, overlayCurrentTime);
                                }
                            }}
                            pointerEvents={overlayVisible ? 'auto' : 'none'}
                            style={Styles.sharedVideoTap}
                        />
                        {overlayVisible && !overlayLoading && (
                            <TouchableOpacity
                                style={Styles.videoMuteButton}
                                activeOpacity={0.85}
                                onPress={() => setOverlayMuted((prev) => !prev)}
                            >
                                <Icons.Volume width={18} height={18} />
                                {overlayMuted ? <View style={Styles.videoMuteSlash} /> : null}
                            </TouchableOpacity>
                        )}
                    </View>

                    {overlayVisible && (
                        <View style={Styles.sharedVideoChrome}>
                            <SizeBox height={insets.top} />
                            <View style={Styles.videoOverlayHeader}>
                                <TouchableOpacity style={Styles.videoOverlayBack} onPress={closeOverlayPlayer}>
                                    <Icons.BackArrow height={22} width={22} />
                                </TouchableOpacity>
                                <Text style={Styles.videoOverlayTitle}>
                                    {overlayMedia?.title ?? overviewVideo?.title ?? t('Video')}
                                </Text>
                                <View style={Styles.videoOverlayActions}>
                                    <TouchableOpacity
                                        style={Styles.videoOverlayActionButton}
                                        onPress={() => handleDownloadMedia(overlayMedia)}
                                    >
                                        <Icons.DownloadBlue width={20} height={20} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={Styles.videoOverlayActionButton}
                                        onPress={() => handleShareMedia(overlayMedia)}
                                    >
                                        <FastImage source={Icons.ShareBlue} style={Styles.videoOverlayActionIcon} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {!overlayLoading && (
                                <View style={[Styles.videoOverlayControls, { paddingBottom: 14 + insets.bottom }]}>
                                    <Text style={Styles.videoOverlayTime}>
                                        {formatDuration(
                                            overlayHasInitialTime ? overlayCurrentTime : overlayStartAt || overlayCurrentTime
                                        )} / {formatDuration(overlayDuration)}
                                    </Text>
                                    <Slider
                                        style={Styles.videoOverlaySlider}
                                        minimumValue={0}
                                        maximumValue={Math.max(overlayDuration, 1)}
                                        value={Math.min(
                                            overlayHasInitialTime ? overlayCurrentTime : overlayStartAt || overlayCurrentTime,
                                            Math.max(overlayDuration, 1)
                                        )}
                                        minimumTrackTintColor={colors.primaryColor}
                                        maximumTrackTintColor="rgba(0,0,0,0.2)"
                                        thumbTintColor={colors.primaryColor}
                                        onSlidingStart={() => {
                                            setOverlaySeeking(true);
                                            setOverlayPlaying(false);
                                        }}
                                        onValueChange={(value) => {
                                            setOverlayCurrentTime(value);
                                            videoResumeRef.current = value;
                                            if (overlayVideoUrl) {
                                                resumeByUrlRef.current[overlayVideoUrl] = value;
                                            }
                                        }}
                                        onSlidingComplete={(value) => {
                                            setOverlaySeeking(false);
                                            setOverlayCurrentTime(value);
                                            videoResumeRef.current = value;
                                            if (overlayVideoUrl) {
                                                resumeByUrlRef.current[overlayVideoUrl] = value;
                                            }
                                            pendingSeekRef.current = value;
                                            overlayVideoRef.current?.seek(value);
                                            setOverlayHasInitialTime(true);
                                            setOverlayPlaying(true);
                                        }}
                                    />
                                </View>
                            )}
                        </View>
                    )}
                </View>
            )}

            {showAiSearchIntro && (
                <View style={Styles.aiSearchIntroOverlay} pointerEvents="box-none">
                    <View style={Styles.aiSearchIntroDimmer} />
                    {aiSearchButtonRect ? (
                        <View
                            pointerEvents="none"
                            style={[
                                Styles.aiSearchIntroSpotlight,
                                {
                                    left: Math.max(aiSearchButtonRect.x - 8, 8),
                                    top: Math.max(aiSearchButtonRect.y - 8, 8),
                                    width: aiSearchButtonRect.width + 16,
                                    height: aiSearchButtonRect.height + 16,
                                },
                            ]}
                        />
                    ) : null}
                    <View
                        style={[
                            Styles.aiSearchIntroPopup,
                            aiSearchButtonRect
                                ? {
                                    left: Math.min(
                                        Math.max(aiSearchButtonRect.x, 8),
                                        Math.max(windowWidth - 200 - 8, 8)
                                    ),
                                    top: aiSearchButtonRect.y + aiSearchButtonRect.height + 10,
                                }
                                : undefined,
                        ]}
                    >
                        <Text style={Styles.aiSearchIntroText}>{t('Find yourself')}</Text>
                        <TouchableOpacity
                            style={Styles.aiSearchIntroNextButton}
                            activeOpacity={0.85}
                            onPress={() => setShowAiSearchIntro(false)}
                        >
                            <Text style={Styles.aiSearchIntroNextText}>{t('Next')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}


            <Modal
                visible={feedMenuVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setFeedMenuVisible(false)}
            >
                <View style={Styles.feedMenuOverlay}>
                    <Pressable
                        style={Styles.feedMenuBackdrop}
                        onPress={() => setFeedMenuVisible(false)}
                    />
                    <View style={Styles.feedMenuContainer}>
                        {feedMenuActions.map((item, index) => (
                            <TouchableOpacity
                                key={`${item.label}-${index}`}
                                style={Styles.feedMenuAction}
                                activeOpacity={0.85}
                                onPress={() => {
                                    setFeedMenuVisible(false);
                                    setTimeout(() => item.onPress(), 120);
                                }}
                            >
                                <Text style={Styles.feedMenuActionText}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={Styles.feedMenuCancel}
                            activeOpacity={0.85}
                            onPress={() => setFeedMenuVisible(false)}
                        >
                            <Text style={Styles.feedMenuCancelText}>{t('Cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={infoPopupVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setInfoPopupVisible(false)}
            >
                <View style={Styles.feedMenuOverlay}>
                    <Pressable style={Styles.feedMenuBackdrop} onPress={() => setInfoPopupVisible(false)} />
                    <View style={Styles.feedInfoModalContainer}>
                        <Text style={Styles.feedInfoModalTitle}>{infoPopupTitle}</Text>
                        <Text style={Styles.feedInfoModalText}>{infoPopupMessage}</Text>
                    </View>
                </View>
            </Modal>
            <Modal
                visible={reportIssueVisible}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    if (isSubmittingReport) return;
                    setReportIssueVisible(false);
                    setReportStep('reason');
                    setSelectedReportReason('');
                    setCustomReportReason('');
                    setReportTargetMedia(null);
                }}
            >
                <View style={Styles.feedMenuOverlay}>
                    <Pressable
                        style={Styles.feedMenuBackdrop}
                        onPress={() => {
                            if (isSubmittingReport) return;
                            setReportIssueVisible(false);
                            setReportStep('reason');
                            setSelectedReportReason('');
                            setCustomReportReason('');
                            setReportTargetMedia(null);
                        }}
                    />
                    <View style={Styles.feedMenuContainer}>
                        <Text style={Styles.feedMenuTitle}>
                            {reportStep === 'reason'
                                ? t('Report an issue with this photo/video')
                                : t('Confirm request')}
                        </Text>
                        <View style={Styles.feedMenuDivider} />
                        {reportStep === 'reason' ? (
                            <>
                                {reportReasons.map((reason) => (
                                    <TouchableOpacity
                                        key={reason}
                                        style={Styles.feedMenuAction}
                                        activeOpacity={0.85}
                                        onPress={() => {
                                            setSelectedReportReason(reason);
                                            if (reason === t('Custom')) {
                                                return;
                                            }
                                            setReportStep('confirm');
                                        }}
                                    >
                                        <Text style={Styles.feedMenuActionText}>{reason}</Text>
                                    </TouchableOpacity>
                                ))}
                                {selectedReportReason === t('Custom') ? (
                                    <View style={[Styles.feedMenuAction, { borderBottomWidth: 0 }]}>
                                        <TextInput
                                            style={[Styles.feedMenuActionText, { borderWidth: 1, borderColor: colors.borderColor, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }]}
                                            value={customReportReason}
                                            onChangeText={setCustomReportReason}
                                            placeholder={t('Type your request')}
                                            placeholderTextColor={colors.subTextColor}
                                        />
                                        <TouchableOpacity
                                            style={[Styles.feedInfoModalButton, { alignSelf: 'stretch', alignItems: 'center', marginTop: 10 }]}
                                            activeOpacity={0.85}
                                            onPress={() => {
                                                if (!customReportReason.trim()) return;
                                                setReportStep('confirm');
                                            }}
                                        >
                                            <Text style={Styles.feedInfoModalButtonText}>{t('Next')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : null}
                                <TouchableOpacity
                                    style={Styles.feedMenuCancel}
                                    activeOpacity={0.85}
                                    onPress={() => {
                                        setReportIssueVisible(false);
                                        setReportStep('reason');
                                        setSelectedReportReason('');
                                        setCustomReportReason('');
                                        setReportTargetMedia(null);
                                    }}
                                >
                                    <Text style={Styles.feedMenuCancelText}>{t('Cancel')}</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <View style={Styles.feedMenuAction}>
                                    <Text style={Styles.feedMenuActionText}>
                                        {`${t('Reason')}: ${selectedReportReason}${selectedReportReason === t('Custom') ? ` - ${customReportReason.trim()}` : ''}`}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={[Styles.feedInfoModalButton, { alignSelf: 'stretch', alignItems: 'center', marginTop: 8 }]}
                                    activeOpacity={0.85}
                                    disabled={isSubmittingReport}
                                    onPress={async () => {
                                        const mediaId = String((reportTargetMedia as any)?.media_id || (reportTargetMedia as any)?.id || '').trim();
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
                                            await createMediaIssueRequest(apiAccessToken, {
                                                media_id: mediaId,
                                                event_id: reportTargetMedia?.event_id ? String(reportTargetMedia.event_id) : undefined,
                                                issue_type,
                                                custom_text: issue_type === 'custom' ? customReportReason.trim() : undefined,
                                            });
                                        } catch (e: any) {
                                            const msg = String(e?.message || t('Could not submit request'));
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
                                    }}
                                >
                                    <Text style={Styles.feedInfoModalButtonText}>
                                        {isSubmittingReport ? t('Submitting...') : t('Submit')}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            {downloadVisible && (
                <View style={Styles.downloadOverlay} pointerEvents="auto">
                    <View style={Styles.downloadCard}>
                        <Text style={Styles.downloadTitle}>{t('Preparing download')}</Text>
                        {downloadProgress == null ? (
                            <ActivityIndicator color={colors.primaryColor} />
                        ) : (
                            <>
                                <View style={Styles.downloadProgressTrack}>
                                    <View style={[Styles.downloadProgressFill, { width: `${Math.round(downloadProgress * 100)}%` }]} />
                                </View>
                                <Text style={Styles.downloadProgressLabel}>
                                    {Math.round(downloadProgress * 100)}%
                                </Text>
                            </>
                        )}
                    </View>
                </View>
            )}
        </View>
    )
}

export default HomeScreen
