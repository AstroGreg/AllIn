import {ActivityIndicator, ScrollView, Text, TouchableOpacity, View, Share, Alert, useWindowDimensions, ActionSheetIOS, Platform} from 'react-native'
import React, {useCallback, useMemo, useRef, useState, useEffect} from 'react'
import { createStyles } from './HomeStyles'
import Header from './components/Header'
import SizeBox from '../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../../context/ThemeContext'
import { useEvents } from '../../context/EventsContext'
import Icons from '../../constants/Icons'
import { useAuth } from '../../context/AuthContext'
import {
    ApiError,
    getAllPhotos,
    getAllVideos,
    getHomeOverview,
    recordDownload,
    type HomeOverviewMedia,
    type HomeOverviewResponse,
    type MediaViewAllItem,
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

const HOME_CACHE_TTL_MS = 2 * 60 * 1000;
const homeCache: {
    overview: HomeOverviewResponse | null;
    videos: MediaViewAllItem[];
    photos: MediaViewAllItem[];
    fetchedAt: number;
} = {
    overview: null,
    videos: [],
    photos: [],
    fetchedAt: 0,
};

const HomeScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { height: windowHeight } = useWindowDimensions();
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

        return 'Guest';
    })();

    const profilePic = user?.picture;

    const [overview, setOverview] = useState<HomeOverviewResponse | null>(null);
    const [isLoadingOverview, setIsLoadingOverview] = useState(false);
    const [overviewError, setOverviewError] = useState<string | null>(null);
    const [allVideos, setAllVideos] = useState<MediaViewAllItem[]>([]);
    const [allPhotos, setAllPhotos] = useState<MediaViewAllItem[]>([]);
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
    const loadDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const loadInFlightRef = useRef<Promise<void> | null>(null);
    const lastLoadRequestRef = useRef(0);
    const enableSharedOverlay = false;
    const useSharedPlayerInFeed = Boolean(
        enableSharedOverlay &&
        overlayVideoUrl &&
        sharedVideoRect &&
        sharedVideoRect.width > 0 &&
        sharedVideoRect.height > 0
    );

    const performLoadOverview = useCallback(async (force = false) => {
        if (!apiAccessToken) {
            setOverview(null);
            setOverviewError('Log in (or set a Dev API token) to load overview.');
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
            return;
        }
        setIsLoadingOverview(true);
        setOverviewError(null);
        try {
            const [data, videos, photos] = await Promise.all([
                getHomeOverview(apiAccessToken, 'me'),
                getAllVideos(apiAccessToken),
                getAllPhotos(apiAccessToken),
            ]);
            setOverview(data);
            setAllVideos(videos);
            setAllPhotos(photos);
            homeCache.overview = data;
            homeCache.videos = videos;
            homeCache.photos = photos;
            homeCache.fetchedAt = Date.now();
        } catch (e: any) {
            const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
            setOverviewError(msg);
        } finally {
            setIsLoadingOverview(false);
        }
    }, [apiAccessToken, overview]);

    const loadOverview = useCallback((force = false) => {
        if (!apiAccessToken) {
            setOverview(null);
            setOverviewError('Log in (or set a Dev API token) to load overview.');
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
    }, [apiAccessToken, performLoadOverview]);

    useFocusEffect(
        useCallback(() => {
            loadOverview(false);
        }, [loadOverview]),
    );

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
        if (diffSeconds < 60) return 'Posted just now';
        const minutes = Math.floor(diffSeconds / 60);
        if (minutes < 60) return `Posted ${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `Posted ${hours}h ago`;
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    }, []);

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
        const raw = (media as any).likes ?? (media as any).like_count ?? (media as any).likeCount ?? null;
        if (typeof raw === 'number' && Number.isFinite(raw)) return `${raw.toLocaleString()} likes`;
        if (typeof raw === 'string' && raw.trim()) return raw.includes('like') ? raw : `${raw} likes`;
        const idSeed = String((media as any).media_id ?? (media as any).id ?? '');
        let hash = 0;
        for (let i = 0; i < idSeed.length; i += 1) {
            hash = (hash * 31 + idSeed.charCodeAt(i)) % 10000;
        }
        const value = 1200 + (hash % 8500);
        const likes = Math.max(25, Math.round(value * 0.6));
        if (likes >= 1000) return `${(likes / 1000).toFixed(1)}k likes`;
        return `${likes} likes`;
    }, []);

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
            lower.includes('token=') ||
            lower.includes('expires=')
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
            Alert.alert('Share unavailable', 'No media link available yet.');
            return;
        }
        try {
            await Share.share({ message: url, url });
        } catch {
            // ignore share cancellation
        }
    }, [getMediaShareUrl]);

    const handleDownloadMedia = useCallback(async (media?: HomeOverviewMedia | MediaViewAllItem | null) => {
        if (!media?.media_id) {
            Alert.alert('Download unavailable', 'No media available yet.');
            return;
        }
        if (downloadInFlightRef.current) {
            return;
        }
        const sourceUrl = pickDownloadUrl(media);
        if (!sourceUrl) {
            Alert.alert('Download unavailable', 'This media is not ready to download.');
            return;
        }
        if (sourceUrl.toLowerCase().includes('.m3u8')) {
            Alert.alert('Download unavailable', 'This video is streaming-only right now. Try again later.');
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
            const msg = e instanceof ApiError ? e.message : 'Download failed';
            Alert.alert('Download failed', msg);
        } finally {
            setDownloadVisible(false);
            setDownloadProgress(null);
            downloadInFlightRef.current = false;
        }
    }, [apiAccessToken, buildDownloadPath, pickDownloadUrl]);

    const openFeedMenu = useCallback(
        (media: HomeOverviewMedia | MediaViewAllItem | null, opts: { isVideo?: boolean; title?: string } = {}) => {
            const safeMedia = media ?? null;
            const eventName = safeMedia?.event_id ? eventNameById(safeMedia.event_id) : undefined;
            const label = opts.title || eventName || 'Event';
            const actions = [
                { label: 'Download', onPress: () => handleDownloadMedia(safeMedia) },
                { label: 'Share', onPress: () => handleShareMedia(safeMedia) },
                { label: 'Share to Instagram Story', onPress: () => handleShareMedia(safeMedia) },
                {
                    label: 'Report an issue with this video/photo',
                    onPress: () => Alert.alert('Request sent', 'We received your issue report.'),
                },
                {
                    label: 'Go to author profile',
                    onPress: () => navigation.navigate('BottomTabBar', { screen: 'Profile' }),
                },
                {
                    label: 'Go to event',
                    onPress: () =>
                        navigation.navigate('CompetitionDetailsScreen', {
                            name: label,
                            description: `Competition held in ${label}`,
                            competitionType: 'track',
                        }),
                },
                {
                    label: 'Mark as inappropriate content',
                    onPress: () => Alert.alert('Thanks', 'We will review this content.'),
                },
                {
                    label: 'Request this video removed',
                    onPress: () => Alert.alert('Request sent', 'We will review the removal request.'),
                },
            ];

            if (opts.isVideo) {
                actions.unshift({
                    label: 'View in player',
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

            if (Platform.OS === 'ios') {
                ActionSheetIOS.showActionSheetWithOptions(
                    {
                        options: [...actions.map((item) => item.label), 'Cancel'],
                        cancelButtonIndex: actions.length,
                    },
                    (buttonIndex) => {
                        if (buttonIndex < actions.length) {
                            actions[buttonIndex].onPress();
                        }
                    },
                );
                return;
            }

            Alert.alert(
                'More options',
                'Choose an action',
                [
                    ...actions.map((item) => ({ text: item.label, onPress: item.onPress })),
                    { text: 'Cancel', style: 'cancel' },
                ],
            );
        },
        [eventNameById, getMediaThumb, handleDownloadMedia, handleShareMedia, navigation, pickPlayableVideoUrl],
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
            item.thumbnail_url ||
            item.preview_url ||
            item.original_url ||
            item.full_url ||
            item.raw_url ||
            null;
        if (!candidate) return null;
        return {uri: toAbsoluteUrl(candidate) as string};
    }, [toAbsoluteUrl]);

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

    const ListHeader = useMemo(
        () => (
            <View style={Styles.scrollContent}>
                <SizeBox height={24} />

                {/* Quick Actions */}
                <View style={Styles.sectionQuickActions}>
                    <View style={Styles.sectionHeader}>
                        <Text style={Styles.sectionTitle}>Quick Actions</Text>
                    </View>
                    <View style={Styles.quickActionsGrid}>
                        {/* First Row - My downloads & Add myself */}
                        <View style={Styles.quickActionsRow}>
                            <TouchableOpacity
                                style={Styles.quickActionCard}
                                onPress={() => navigation.navigate('DownloadsDetailsScreen')}
                            >
                                <Text style={Styles.quickActionText} numberOfLines={1}>My downloads</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={Styles.quickActionCard}
                                activeOpacity={0.8}
                                onPress={() => navigation.navigate('Search', { screen: 'AISearchScreen', params: { origin: 'home' } })}
                            >
                                <Text style={Styles.quickActionText} numberOfLines={1}>AI Search</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Add myself to events */}
                        <View style={Styles.quickActionsRow}>
                            <TouchableOpacity
                                style={[Styles.quickActionCard, Styles.quickActionCardFull]}
                                onPress={() => navigation.navigate('AvailableEventsScreen')}
                            >
                                <Text style={Styles.quickActionText} numberOfLines={1}>Subscribe to a competition</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Overview */}
                <View
                    style={[
                        Styles.sectionOverview,
                        (overviewVideo || overviewPhoto || overviewBlog)
                            ? Styles.sectionOverviewActive
                            : Styles.sectionOverviewEmpty,
                    ]}
                >
                    {isLoadingOverview && !(overviewVideo || overviewPhoto || overviewBlog) ? (
                        <View style={{paddingVertical: 8}}>
                            <ActivityIndicator color={colors.primaryColor} />
                        </View>
                    ) : overviewError ? (
                        <Text style={[Styles.quickActionText, {color: '#FF3B30'}]}>{overviewError}</Text>
                    ) : (
                        <>
                            <View
                                onLayout={(event) => {
                                    feedLayoutsRef.current[0] = {
                                        x: event.nativeEvent.layout.x,
                                        y: event.nativeEvent.layout.y,
                                        width: event.nativeEvent.layout.width,
                                        height: event.nativeEvent.layout.height,
                                    };
                                    updateVisibility();
                                    updateSharedVideoRect();
                                }}
                            >
                                {(
                                <NewsFeedCard
                                    title={overviewVideo?.title ?? topVideos[0]?.title ?? 'PK 400m Limburg 2025'}
                                    description={pickDescription(
                                        overviewVideo?.title ?? topVideos[0]?.title,
                                        overviewVideo?.description ?? topVideos[0]?.description,
                                        'PK 400m Limburg 2025'
                                    )}
                                    images={[
                                        getMediaThumb(overviewVideo) ||
                                            getMediaThumb(topVideos[0]) ||
                                            Images.photo1,
                                    ]}
                                    isVideo
                                    useSharedPlayer={useSharedPlayerInFeed}
                                    onVideoLayout={(layout) => {
                                        videoContainerOffsetRef.current = layout;
                                        updateSharedVideoRect();
                                    }}
                                    user={{
                                        name: userName,
                                        avatar: profilePic ? {uri: profilePic} : Images.profile1,
                                        date: formatUploadDate(overviewVideo?.created_at ?? topVideos[0]?.created_at),
                                    }}
                                    hideUserDate
                                    headerTag={formatPostTime(overviewVideo?.created_at ?? topVideos[0]?.created_at)}
                                    likesLabel={formatLikesLabel(overviewVideo ?? topVideos[0])}
                                    showActions
                                    onShare={() => handleShareMedia(overviewVideo ?? topVideos[0])}
                                    onDownload={() => handleDownloadMedia(overviewVideo ?? topVideos[0])}
                                    onPressMore={() =>
                                        openFeedMenu(overviewVideo ?? topVideos[0], {
                                            isVideo: true,
                                            title: overviewVideo?.title ?? topVideos[0]?.title ?? 'Video',
                                        })
                                    }
                                    toggleVideoOnPress
                                    onVideoProgress={(time) => {
                                        videoResumeRef.current = time;
                                    }}
                                    videoUri={overviewInlineVideoUrl}
                                    hideBelowText={false}
                                    onPress={undefined}
                                    isActive={isFocused && isVideoVisible && !overlayVisible}
                                    resumeAt={resumeVideoAt}
                                    headerSeparated
                                />
                                )}
                            </View>

                            <View
                                onLayout={(event) => {
                                    feedLayoutsRef.current[1] = {
                                        x: event.nativeEvent.layout.x,
                                        y: event.nativeEvent.layout.y,
                                        width: event.nativeEvent.layout.width,
                                        height: event.nativeEvent.layout.height,
                                    };
                                    updateVisibility();
                                    updateSharedVideoRect();
                                }}
                            >
                                <NewsFeedCard
                                    title={overviewBlog?.post?.title ?? 'Latest blog'}
                                    images={['__text__']}
                                    textSlide={{
                                        title: overviewBlog?.post?.title ?? 'Latest blog',
                                        description: [
                                            overviewBlog?.post?.summary ?? overviewBlog?.post?.description ?? '',
                                            blogMediaCountsLabel,
                                        ]
                                            .filter(Boolean)
                                            .join('\n'),
                                    }}
                                    headerTag={formatPostTime(overviewBlog?.post?.created_at)}
                                    hideBelowText
                                    isActive={isFocused && isBlogVisible}
                                    user={{
                                        name: overviewBlog?.author?.display_name ?? userName,
                                        avatar: overviewBlog?.author?.avatar_url
                                            ? {uri: toAbsoluteUrl(overviewBlog.author.avatar_url) as string}
                                            : Images.profile1,
                                        date: formatUploadDate(overviewBlog?.post?.created_at),
                                    }}
                                    hideUserDate
                                    headerSeparated
                                    likesLabel={formatLikesLabel(overviewBlog?.media ?? blogPrimaryMedia)}
                                    onShare={() => handleShareMedia(overviewBlog?.media ?? blogPrimaryMedia)}
                                    onPressMore={() =>
                                        openFeedMenu(overviewBlog?.media ?? blogPrimaryMedia, {
                                            isVideo: (overviewBlog?.media ?? blogPrimaryMedia)?.type === 'video',
                                            title: overviewBlog?.post?.title ?? 'Blog',
                                        })
                                    }
                                    description={overviewBlog?.post?.summary ?? overviewBlog?.post?.description ?? ''}
                                    onPress={() => {
                                        navigation.navigate('ViewUserBlogDetailsScreen', {
                                            post: {
                                                title: overviewBlog?.post?.title ?? 'Latest blog',
                                                date: overviewBlog?.post?.created_at
                                                    ? new Date(overviewBlog.post.created_at).toLocaleDateString()
                                                    : '',
                                                image: blogPrimaryImage,
                                                gallery: blogGalleryImages,
                                                galleryItems: blogGalleryItems,
                                                readCount: overviewBlog?.post?.reading_time_minutes
                                                    ? `${overviewBlog.post.reading_time_minutes} min`
                                                    : '1 min',
                                                writer: overviewBlog?.author?.display_name ?? userName,
                                                writerImage: overviewBlog?.author?.avatar_url
                                                    ? {uri: toAbsoluteUrl(overviewBlog.author.avatar_url) as string}
                                                    : Images.profile1,
                                                description: overviewBlog?.post?.description ?? overviewBlog?.post?.summary ?? '',
                                            },
                                        });
                                    }}
                                />
                            </View>

                            <View
                                onLayout={(event) => {
                                    feedLayoutsRef.current[2] = {
                                        x: event.nativeEvent.layout.x,
                                        y: event.nativeEvent.layout.y,
                                        width: event.nativeEvent.layout.width,
                                        height: event.nativeEvent.layout.height,
                                    };
                                    updateVisibility();
                                    updateSharedVideoRect();
                                }}
                            >
                                <NewsFeedCard
                                    title={overviewPhoto?.title ?? topPhotos[0]?.title ?? 'Kobe Bryant'}
                                    description={pickDescription(
                                        overviewPhoto?.title ?? topPhotos[0]?.title,
                                        overviewPhoto?.description ?? topPhotos[0]?.description,
                                        'Kobe Bryant'
                                    )}
                                    images={[
                                        getMediaThumb(overviewPhoto) ||
                                            getMediaThumb(topPhotos[0]) ||
                                            Images.photo4,
                                    ]}
                                    headerTag={formatPostTime(overviewPhoto?.created_at ?? topPhotos[0]?.created_at)}
                                    user={{
                                        name: userName,
                                        avatar: profilePic ? {uri: profilePic} : Images.profile1,
                                    }}
                                    hideUserDate
                                    hideBelowText={false}
                                    headerSeparated
                                    likesLabel={formatLikesLabel(overviewPhoto ?? topPhotos[0])}
                                    showActions
                                    onShare={() => handleShareMedia(overviewPhoto ?? topPhotos[0])}
                                    onDownload={() => handleDownloadMedia(overviewPhoto ?? topPhotos[0])}
                                    onPressMore={() =>
                                        openFeedMenu(overviewPhoto ?? topPhotos[0], {
                                            isVideo: false,
                                            title: overviewPhoto?.title ?? topPhotos[0]?.title ?? 'Photo',
                                        })
                                    }
                                    onPress={() => buildMediaCardPress(overviewPhoto ?? topPhotos[0])}
                                />
                            </View>
                        </>
                    )}
                </View>

            </View>
        ),
        [
            Styles.gradientButtonSmall,
            Styles.gradientButtonTextSmall,
            Styles.quickActionCard,
            Styles.quickActionText,
            Styles.quickActionsGrid,
            Styles.quickActionsRow,
            Styles.scrollContent,
            Styles.sectionContainer,
            Styles.sectionHeader,
            Styles.sectionTitle,
            colors.primaryColor,
            colors.grayColor,
            isLoadingOverview,
            overviewError,
            overviewVideo?.media_id,
            overviewPhoto?.media_id,
            overviewBlog?.post?.id,
            isVideoVisible,
            isBlogVisible,
            isFocused,
            resumeVideoAt,
            overlayVisible,
            useSharedPlayerInFeed,
            overviewInlineVideoUrl,
            overlayCurrentTime,
            toAbsoluteUrl,
            toHlsUrl,
            formatUploadDate,
            formatPostTime,
            pickDescription,
            formatLikesLabel,
            isSignedUrl,
            withAccessToken,
            getMediaShareUrl,
            handleShareMedia,
            handleDownloadMedia,
            openFeedMenu,
            prewarmVideo,
            buildMediaCardPress,
            updateVisibility,
            openOverlayPlayer,
            blogPrimaryImage,
            blogExtraVideos,
            blogGalleryImages,
            blogGalleryItems,
            getMediaThumb,
            topVideos,
            topPhotos,
            navigation,
        ],
    );

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <Header
                userName={userName}
                profilePic={profilePic}
                onPressFeed={() => navigation.navigate('HubScreen')}
                onPressProfile={() => navigation.navigate('BottomTabBar', { screen: 'Profile' })}
            />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingBottom: insets.bottom > 0 ? insets.bottom + 20 : 40}}
                scrollEventThrottle={16}
                scrollEnabled={!overlayVisible}
                onLayout={(event) => {
                    scrollYRef.current = 0;
                    scrollViewLayoutRef.current = {
                        x: event.nativeEvent.layout.x,
                        y: event.nativeEvent.layout.y,
                    };
                    updateVisibility();
                    updateSharedVideoRect();
                }}
                onScroll={(event) => {
                    scrollYRef.current = event.nativeEvent.contentOffset.y;
                    updateVisibility();
                    updateSharedVideoRect();
                }}
            >
            {ListHeader}
        </ScrollView>

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
                            muted={false}
                            volume={1.0}
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
                    </View>

                    {overlayVisible && (
                        <View style={Styles.sharedVideoChrome}>
                            <SizeBox height={insets.top} />
                            <View style={Styles.videoOverlayHeader}>
                                <TouchableOpacity style={Styles.videoOverlayBack} onPress={closeOverlayPlayer}>
                                    <Icons.BackArrow height={22} width={22} />
                                </TouchableOpacity>
                                <Text style={Styles.videoOverlayTitle}>
                                    {overlayMedia?.title ?? overviewVideo?.title ?? 'Video'}
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

            {downloadVisible && (
                <View style={Styles.downloadOverlay} pointerEvents="auto">
                    <View style={Styles.downloadCard}>
                        <Text style={Styles.downloadTitle}>Preparing download</Text>
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
