import React, {useCallback, useMemo, useState, useEffect, useRef} from 'react';
import {ActivityIndicator, Alert, Image, Linking, Modal, Platform, Pressable, Share, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
// useFocusEffect not available in some runtime bundles; use navigation listeners instead.
import FastImage from 'react-native-fast-image';
import {createStyles} from './PhotoDetailScreenStyles';
import SizeBox from '../../constants/SizeBox';
import {useTheme} from '../../context/ThemeContext';
import {useAuth} from '../../context/AuthContext';
import {useEvents} from '../../context/EventsContext';
import {ApiError, getAiFeedbackLabel, getMediaById, postAiFeedbackLabel, recordDownload, recordMediaView, type MediaViewAllItem} from '../../services/apiGateway';
import Video from 'react-native-video';
import ShimmerEffect from '../../components/shimmerEffect/ShimmerEffect';
import {getApiBaseUrl, getHlsBaseUrl} from '../../constants/RuntimeConfig';
import Slider from '@react-native-community/slider';
import {CameraRoll, iosRequestAddOnlyGalleryPermission} from '@react-native-camera-roll/camera-roll';
import Icons from '../../constants/Icons';
import { useTranslation } from 'react-i18next'

type FeedbackChoice = 'yes' | 'no' | null;

const PhotoDetailScreen = ({navigation, route}: any) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const {colors, isDark} = useTheme();
    const Styles = createStyles(colors);
    const moreDotsColor = isDark ? '#FFFFFF' : '#000000';
    const {apiAccessToken} = useAuth();
    const {eventNameById} = useEvents();

    const eventTitle = route?.params?.eventTitle || '';
    const legacyPhoto = route?.params?.photo ?? null;
    const media = route?.params?.media ?? null;
    const startAt = Number(route?.params?.startAt ?? 0);
    const preferredVideoUrl = route?.params?.preferredVideoUrl ?? null;

    const mediaId: string | null = media?.id ? String(media.id) : null;
    const eventId: string | null = media?.eventId ? String(media.eventId) : null;
    const matchType: string | null = media?.matchType ? String(media.matchType) : null;
    const photoFallbackIds = useMemo(
        () => [
            '87873d40-addf-4289-aa82-7cd300acdd94',
            '4ac31817-e954-4d22-934d-27f82ddf5163',
            '4fed0d64-9fd4-42c4-bf24-875aad683c6d',
        ],
        [],
    );
    const isPhotoView = useMemo(() => {
        const t = String(media?.type ?? legacyPhoto?.type ?? 'image').toLowerCase();
        return t !== 'video';
    }, [legacyPhoto?.type, media?.type]);
    const effectiveMediaId = useMemo(() => {
        if (!isPhotoView) return mediaId;
        if (mediaId) return mediaId;
        const seed = `${eventTitle}-${startAt}`;
        let hash = 0;
        for (let i = 0; i < seed.length; i += 1) {
            hash = (hash << 5) - hash + seed.charCodeAt(i);
            hash |= 0;
        }
        const index = Math.abs(hash) % photoFallbackIds.length;
        return photoFallbackIds[index];
    }, [eventTitle, isPhotoView, mediaId, photoFallbackIds, startAt]);
    const resolvedMediaId = effectiveMediaId ?? mediaId;

    useEffect(() => {
        if (!apiAccessToken) return;
        const id = String(resolvedMediaId || '').trim();
        if (!id) return;
        recordMediaView(apiAccessToken, id).catch(() => {});
    }, [apiAccessToken, resolvedMediaId]);

    const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);
    const hlsBaseUrl = useMemo(() => getHlsBaseUrl(), []);

    const toAbsoluteUrl = useCallback((value?: string | null) => {
        if (!value) return null;
        const str = String(value);
        if (str.startsWith('http://') || str.startsWith('https://')) return str;
        return `${apiBaseUrl}${str.startsWith('/') ? '' : '/'}${str}`;
    }, [apiBaseUrl]);

    const normalizeMedia = useCallback((item: MediaViewAllItem) => ({
        id: item.media_id,
        eventId: item.event_id,
        thumbnailUrl: item.thumbnail_url,
        previewUrl: item.preview_url,
        originalUrl: item.original_url,
        fullUrl: item.full_url,
        rawUrl: item.raw_url,
        vp9Url: item.vp9_url,
        av1Url: item.av1_url,
        hlsManifestPath: item.hls_manifest_path,
        type: item.type,
        assets: item.assets ?? [],
        title: (item as any).title ?? null,
    }), []);

    const [resolvedMedia, setResolvedMedia] = useState<ReturnType<typeof normalizeMedia> | null>(null);
    const activeMedia = isPhotoView ? resolvedMedia : (resolvedMedia ?? media);
    const matchPercent = typeof media?.matchPercent === 'number' ? media.matchPercent : null;
    const headerLabel = eventTitle || eventNameById(eventId) || 'Media';

    const shouldFetchMedia = useMemo(() => {
        if (!apiAccessToken || !effectiveMediaId) return false;
        if (isPhotoView) return true;
        if (!media) return true;
        const hasUrls =
            Boolean(media.previewUrl || media.preview_url) ||
            Boolean(media.originalUrl || media.original_url) ||
            Boolean(media.fullUrl || media.full_url) ||
            Boolean(media.rawUrl || media.raw_url) ||
            Boolean(media.hlsManifestPath || media.hls_manifest_path);
        const hasAssets = Array.isArray((media as any).assets) && (media as any).assets.length > 0;
        return !(hasUrls || hasAssets);
    }, [apiAccessToken, effectiveMediaId, isPhotoView, media]);

    useEffect(() => {
        let isMounted = true;
        const loadMedia = async () => {
            if (!shouldFetchMedia) return;
            try {
                const fresh = await getMediaById(apiAccessToken, effectiveMediaId);
                if (isMounted) setResolvedMedia(normalizeMedia(fresh));
            } catch {
                // ignore fetch errors; fall back to route data
            }
        };
        loadMedia();
        return () => {
            isMounted = false;
        };
    }, [apiAccessToken, effectiveMediaId, normalizeMedia, shouldFetchMedia]);

    const hlsUrl = useMemo(() => {
        const path = activeMedia?.hlsManifestPath || activeMedia?.hls_manifest_path;
        if (!path) return null;
        const str = String(path);
        if (str.startsWith('http://') || str.startsWith('https://')) return str;
        const suffix = str.startsWith('/') ? str : `/${str}`;
        return `${hlsBaseUrl}${suffix}`;
    }, [activeMedia?.hlsManifestPath, activeMedia?.hls_manifest_path, hlsBaseUrl]);

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

    const hlsUrlWithToken = useMemo(() => {
        if (!hlsUrl) return null;
        if (!apiAccessToken) return hlsUrl;
        if (isSignedUrl(hlsUrl)) return hlsUrl;
        const sep = hlsUrl.includes('?') ? '&' : '?';
        return `${hlsUrl}${sep}access_token=${encodeURIComponent(apiAccessToken)}`;
    }, [apiAccessToken, hlsUrl, isSignedUrl]);

    const bestImageUrl = useMemo(() => {
        const candidates = [activeMedia?.previewUrl, activeMedia?.originalUrl, activeMedia?.thumbnailUrl].filter(Boolean);
        if (candidates.length > 0) return toAbsoluteUrl(String(candidates[0]));
        return null;
    }, [activeMedia?.originalUrl, activeMedia?.previewUrl, activeMedia?.thumbnailUrl, toAbsoluteUrl]);

    const assetMp4Url = useMemo(() => {
        const assets = activeMedia?.assets ?? [];
        if (!Array.isArray(assets) || assets.length === 0) return null;
        const mp4Assets = assets.filter((a) => {
            const variant = String(a.variant ?? '').toLowerCase();
            const mime = String(a.mime_type ?? '').toLowerCase();
            const url = String(a.url ?? '').toLowerCase();
            return /mp4|mov|m4v/.test(variant) || /video\/mp4/.test(mime) || /\.(mp4|mov|m4v)(\?|$)/.test(url);
        });
        if (mp4Assets.length === 0) return null;
        const signedFirst = mp4Assets.find((a) => {
            const urlType = String(a.url_type ?? '').toLowerCase();
            const url = String(a.url ?? '').toLowerCase();
            return (
                urlType.includes('signed') ||
                url.includes('x-amz-signature') ||
                url.includes('token=') ||
                url.includes('sig=') ||
                url.includes('sv=')
            );
        });
        return (signedFirst?.url || mp4Assets[0]?.url || null) as string | null;
    }, [activeMedia?.assets]);

    const assetHlsUrl = useMemo(() => {
        const assets = activeMedia?.assets ?? [];
        if (!Array.isArray(assets) || assets.length === 0) return null;
        const hlsAssets = assets.filter((a) => {
            const variant = String(a.variant ?? '').toLowerCase();
            const mime = String(a.mime_type ?? '').toLowerCase();
            const url = String(a.url ?? '').toLowerCase();
            return /hls|m3u8|mpegurl/.test(variant) || /mpegurl/.test(mime) || /\.m3u8(\?|$)/.test(url);
        });
        if (hlsAssets.length === 0) return null;
        const signedFirst = hlsAssets.find((a) => {
            const urlType = String(a.url_type ?? '').toLowerCase();
            const url = String(a.url ?? '').toLowerCase();
            return (
                urlType.includes('signed') ||
                url.includes('x-amz-signature') ||
                url.includes('token=') ||
                url.includes('sig=') ||
                url.includes('sv=')
            );
        });
        const candidate = (signedFirst?.url || hlsAssets[0]?.url || null) as string | null;
        if (!candidate) return null;
        return candidate.startsWith('http') ? candidate : null;
    }, [activeMedia?.assets]);

    const isVideoFile = useCallback((value?: string | null) => {
        if (!value) return false;
        const cleaned = String(value).toLowerCase();
        return /\.(m3u8|mp4|mov|m4v)(\?|$)/.test(cleaned);
    }, []);

    const videoCandidates = useMemo(() => {
        const rawCandidates = [
            preferredVideoUrl,
            assetMp4Url,
            activeMedia?.fullUrl,
            activeMedia?.rawUrl,
            activeMedia?.originalUrl,
            activeMedia?.previewUrl,
            assetHlsUrl,
            hlsUrlWithToken,
        ]
            .filter(Boolean)
            .map((value) => String(value));

        const normalized = rawCandidates
            .map((value) => {
                if (value.startsWith('http://') || value.startsWith('https://')) return value;
                if (value.toLowerCase().includes('.m3u8')) return null;
                return toAbsoluteUrl(value);
            })
            .filter((value): value is string => !!value);

        const allowNonExtension = String(activeMedia?.type ?? '').toLowerCase() === 'video';
        const filtered = allowNonExtension ? normalized : normalized.filter((value) => isVideoFile(value));

        const unique: string[] = [];
        filtered.forEach((value) => {
            if (!unique.includes(value)) unique.push(value);
        });
        return unique;
    }, [activeMedia?.fullUrl, activeMedia?.originalUrl, activeMedia?.previewUrl, activeMedia?.rawUrl, activeMedia?.type, assetHlsUrl, assetMp4Url, hlsUrlWithToken, isVideoFile, preferredVideoUrl, toAbsoluteUrl]);

    const bestVideoUrl = useMemo(() => videoCandidates[0] ?? null, [videoCandidates]);
    const [videoSourceIndex, setVideoSourceIndex] = useState(0);
    const activeVideoUrl = videoCandidates[videoSourceIndex] ?? bestVideoUrl;

    const isVideo = useMemo(() => {
        if (activeMedia?.type) return String(activeMedia.type).toLowerCase() === 'video';
        const u = (bestVideoUrl ?? bestImageUrl ?? '').toLowerCase();
        return /\.(mp4|mov|m4v|m3u8)(\\?|$)/.test(u) || u.includes('video');
    }, [bestImageUrl, bestVideoUrl, activeMedia?.type]);

    const videoRef = useRef<Video>(null);
    const hasSeekedRef = useRef(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isSeeking, setIsSeeking] = useState(false);
    const [videoError, setVideoError] = useState<string | null>(null);
    const [isVideoLoading, setIsVideoLoading] = useState(true);
    const [hasInitialTime, setHasInitialTime] = useState(false);
    const downloadInFlightRef = useRef(false);
    const [downloadVisible, setDownloadVisible] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
    const [moreMenuVisible, setMoreMenuVisible] = useState(false);
    const [moreMenuActions, setMoreMenuActions] = useState<Array<{label: string; onPress: () => void}>>([]);

    const formatTime = useCallback((value: number) => {
        const safeValue = Number.isFinite(value) ? Math.max(0, value) : 0;
        const minutes = Math.floor(safeValue / 60);
        const seconds = Math.floor(safeValue % 60);
        const paddedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
        return `${minutes}:${paddedSeconds}`;
    }, []);

    const seekTo = useCallback((time: number) => {
        const clamped = Math.max(0, Math.min(time, duration || 0));
        videoRef.current?.seek(clamped);
        setCurrentTime(clamped);
    }, [duration]);

    const handleSeekComplete = useCallback((time: number) => {
        seekTo(time);
    }, [seekTo]);

    const togglePlayback = useCallback(() => {
        setIsPlaying((prev) => !prev);
    }, []);

    const sliderMax = useMemo(() => Math.max(duration, 1), [duration]);

    const shouldAttachAuthHeader = useMemo(() => {
        if (!activeVideoUrl || !apiAccessToken) return false;
        if (isSignedUrl(activeVideoUrl)) return false;
        if (activeVideoUrl.toLowerCase().includes('.m3u8')) return false;
        return true;
    }, [activeVideoUrl, apiAccessToken, isSignedUrl]);

    const videoHeaders = useMemo(() => {
        if (!shouldAttachAuthHeader || !apiAccessToken) return undefined;
        return { Authorization: `Bearer ${apiAccessToken}` };
    }, [apiAccessToken, shouldAttachAuthHeader]);

    useEffect(() => {
        setVideoSourceIndex(0);
        setVideoError(null);
        setCurrentTime(0);
        setIsVideoLoading(true);
        setHasInitialTime(false);
        hasSeekedRef.current = false;
    }, [resolvedMediaId, bestVideoUrl]);

    useEffect(() => {
        setIsVideoLoading(true);
        setHasInitialTime(false);
    }, [activeVideoUrl]);

    const getShareModule = useCallback(() => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            return require('react-native-share');
        } catch {
            return null;
        }
    }, []);

    const getFsModule = useCallback(() => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            return require('react-native-fs');
        } catch {
            return null;
        }
    }, []);

    const requestPhotoPermission = useCallback(async () => {
        if (Platform.OS !== 'ios') return true;
        try {
            const status = await iosRequestAddOnlyGalleryPermission();
            return status === 'granted' || status === 'limited';
        } catch {
            return true;
        }
    }, []);

    const handleReportIssue = useCallback(async () => {
        const eventLabel = eventTitle || eventNameById(eventId);
        const subject = eventLabel ? `Report issue: ${eventLabel}` : 'Report issue';
        const body = `Event: ${eventLabel || 'n/a'}\nMedia ID: ${resolvedMediaId ?? 'n/a'}\n`;
        const mailto = `mailto:support@bcs.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        try {
            await Linking.openURL(mailto);
        } catch {
            Alert.alert(t('Unable to open email'), t('Please email support@bcs.com with the issue details.'));
        }
    }, [eventId, eventNameById, eventTitle, resolvedMediaId]);

    const isHlsUrl = useCallback((value?: string | null) => {
        if (!value) return false;
        return String(value).toLowerCase().includes('.m3u8');
    }, []);

    const extensionFromUrl = useCallback((value: string) => {
        const base = value.split('?')[0];
        const match = base.match(/\.(mp4|mov|m4v|jpg|jpeg|png)$/i);
        if (match?.[1]) return match[1].toLowerCase();
        return 'mp4';
    }, []);

    const resolveDownloadUrl = useCallback(async () => {

        const candidates = [
            assetMp4Url,
            activeMedia?.originalUrl,
            activeMedia?.fullUrl,
            activeMedia?.rawUrl,
            activeMedia?.previewUrl,
        ]
            .filter(Boolean)
            .map((value) => toAbsoluteUrl(String(value)))
            .filter(Boolean) as string[];

        const direct = candidates.find((value) => !isHlsUrl(value));
        if (direct) return direct;

        if (resolvedMediaId && apiAccessToken) {
            try {
                const fresh = await getMediaById(apiAccessToken, resolvedMediaId);
                const freshCandidates = [
                    fresh.original_url,
                    fresh.full_url,
                    fresh.raw_url,
                    fresh.preview_url,
                    fresh.thumbnail_url,
                ]
                    .filter(Boolean)
                    .map((value) => toAbsoluteUrl(String(value)))
                    .filter(Boolean) as string[];

                const freshDirect = freshCandidates.find((value) => !isHlsUrl(value));
                if (freshDirect) return freshDirect;
            } catch {
                // ignore
            }
        }

        return bestVideoUrl ?? null;
    }, [activeMedia?.fullUrl, activeMedia?.originalUrl, activeMedia?.previewUrl, activeMedia?.rawUrl, apiAccessToken, assetMp4Url, bestVideoUrl, isHlsUrl, resolvedMediaId, toAbsoluteUrl]);

    const resolveShareUrl = useCallback(async () => {
        const candidate = await resolveDownloadUrl();
        if (candidate && !isHlsUrl(candidate)) {
            return candidate;
        }
        return bestImageUrl ?? null;
    }, [bestImageUrl, isHlsUrl, resolveDownloadUrl]);

    const ensureLocalFile = useCallback(
        async (remoteUrl: string, extensionHint: string, onProgress?: (ratio: number | null) => void) => {
            const fsModule = getFsModule();
            if (!fsModule?.downloadFile || !fsModule?.CachesDirectoryPath) {
                return null;
            }

            const safeExt = extensionHint.startsWith('.') ? extensionHint : `.${extensionHint}`;
            const baseName = resolvedMediaId ? `allin-${resolvedMediaId}` : `allin-${Date.now()}`;
            const destPath = `${fsModule.CachesDirectoryPath}/${baseName}${safeExt}`;

            try {
                const result = await fsModule.downloadFile({
                    fromUrl: remoteUrl,
                    toFile: destPath,
                    background: true,
                    progressDivider: 5,
                    progress: (res: any) => {
                        if (!res?.bytesExpected) {
                            onProgress?.(null);
                            return;
                        }
                        const ratio = Math.min(1, Math.max(0, res.bytesWritten / res.bytesExpected));
                        onProgress?.(ratio);
                    },
                }).promise;
                if (result?.statusCode && result.statusCode >= 400) {
                    return null;
                }
                return `file://${destPath}`;
            } catch {
                return null;
            }
        },
        [getFsModule, resolvedMediaId],
    );

    const handleDownload = useCallback(async () => {
        if (downloadInFlightRef.current) return;
        if (!apiAccessToken) {
            Alert.alert(t('Missing API token'), t('Log in or set a Dev API token to download.'));
            return;
        }

        if (!resolvedMediaId) {
            Alert.alert(t('Missing media'), t('This item has no media_id to download.'));
            return;
        }

        const downloadUrl = await resolveDownloadUrl();
        if (!downloadUrl) {
            Alert.alert(t('No download URL'), t('The API did not provide a downloadable URL for this media.'));
            return;
        }

        downloadInFlightRef.current = true;
        setDownloadProgress(null);
        setDownloadVisible(true);
        const fileUrl = await ensureLocalFile(downloadUrl, extensionFromUrl(downloadUrl), setDownloadProgress);
        if (!fileUrl) {
            Alert.alert(t('Download failed'), t('Unable to download the media file.'));
            setDownloadVisible(false);
            setDownloadProgress(null);
            downloadInFlightRef.current = false;
            return;
        }
        try {
            await recordDownload(apiAccessToken, {media_id: resolvedMediaId, event_id: eventId});
        } catch {
            // ignore
        }
        try {
            const shareModule = getShareModule();
            if (shareModule?.default?.open) {
                await shareModule.default.open({
                    urls: [fileUrl],
                    type: fileUrl.toLowerCase().includes('.mp4') ? 'video/mp4' : 'image/jpeg',
                    filename: resolvedMediaId ? `allin_${resolvedMediaId}` : `allin_${Date.now()}`,
                    failOnCancel: false,
                    showAppsToView: true,
                });
            } else {
                await Share.share({url: fileUrl, message: 'AllIn media'});
            }
        } catch (err: any) {
            const msg = String(err?.message ?? err);
            Alert.alert('Download failed', msg);
        } finally {
            setDownloadVisible(false);
            setDownloadProgress(null);
            downloadInFlightRef.current = false;
        }
    }, [apiAccessToken, ensureLocalFile, eventId, extensionFromUrl, getShareModule, resolveDownloadUrl, resolvedMediaId]);

    const handleShareNative = useCallback(async () => {
        const shareUrl = await resolveShareUrl();
        if (!shareUrl) {
            Alert.alert(t('No media available'), t('There is no media to share.'));
            return;
        }
        const localShareUrl = await ensureLocalFile(shareUrl, extensionFromUrl(shareUrl));
        if (!localShareUrl) {
            Alert.alert(t('Share failed'), t('Unable to download the media file.'));
            return;
        }
        try {
            await Share.share({message: 'AllIn media', url: localShareUrl});
        } catch (e: any) {
            const msg = String(e?.message ?? e);
            Alert.alert('Share failed', msg);
        }
    }, [ensureLocalFile, extensionFromUrl, resolveShareUrl]);

    const handleShareInstagram = useCallback(async () => {
        const shareModule = getShareModule();
        const bannerUri = Image.resolveAssetSource(require('../../assets/imgs/advertisement.png')).uri;
        const shareUrl = await resolveShareUrl();

        if (shareModule?.default?.shareSingle) {
            const ShareLib = shareModule.default;
            try {
                const localAsset = shareUrl
                    ? await ensureLocalFile(shareUrl, extensionFromUrl(shareUrl))
                    : null;
                if (!localAsset) {
                    Alert.alert(t('Share failed'), t('Unable to download the media file.'));
                    return;
                }
                await ShareLib.shareSingle({
                    social: ShareLib.Social.INSTAGRAM_STORIES,
                    backgroundImage: localAsset && !localAsset.includes('.mp4') ? localAsset : bannerUri,
                    backgroundVideo: localAsset && localAsset.includes('.mp4') ? localAsset : undefined,
                    stickerImage: bannerUri,
                    backgroundTopColor: '#0D0F12',
                    backgroundBottomColor: '#0D0F12',
                    attributionURL: 'https://myjourney.coffee',
                });
                return;
            } catch (e: any) {
                const msg = String(e?.message ?? e);
                Alert.alert('Instagram Story failed', msg);
                return;
            }
        }

        if (!shareUrl) {
            Alert.alert(t('No media available'), t('There is no media to share.'));
            return;
        }
        await handleShareNative();
    }, [ensureLocalFile, extensionFromUrl, getShareModule, handleShareNative, resolveShareUrl]);

    const openMoreMenu = useCallback(() => {
        const actions = [
            {label: 'Download', onPress: handleDownload},
            {label: 'Share', onPress: handleShareNative},
            {label: 'Share to Instagram Story', onPress: handleShareInstagram},
            {label: 'Report an issue with this video/photo', onPress: handleReportIssue},
            {
                label: 'Go to author profile',
                onPress: () => navigation.navigate('BottomTabBar', {screen: 'Profile'}),
            },
            {
                label: 'Go to event',
                onPress: () => {
                    const eventName = headerLabel || 'Competition';
                    navigation.navigate('CompetitionDetailsScreen', {
                        name: eventName,
                        description: `Competition held in ${eventName}`,
                        competitionType: 'track',
                    });
                },
            },
            {
                label: 'Mark as inappropriate content',
                onPress: () => Alert.alert(t('Thanks'), t('We will review this content.')),
            },
            {
                label: 'Request this video removed',
                onPress: () => Alert.alert(t('Request sent'), t('We will review the removal request.')),
            },
        ];
        setMoreMenuActions(actions);
        setMoreMenuVisible(true);
    }, [handleDownload, handleReportIssue, handleShareInstagram, handleShareNative, headerLabel, navigation, t]);

    useEffect(() => {
        const parent = navigation.getParent?.();
        if (!parent) return undefined;

        const hideTabBar = () => parent.setOptions({tabBarStyle: {display: 'none'}});
        const showTabBar = () => parent.setOptions({tabBarStyle: undefined});

        hideTabBar();
        const unsubscribeFocus = navigation.addListener?.('focus', hideTabBar);
        const unsubscribeBlur = navigation.addListener?.('blur', showTabBar);

        return () => {
            if (typeof unsubscribeFocus === 'function') unsubscribeFocus();
            if (typeof unsubscribeBlur === 'function') unsubscribeBlur();
            showTabBar();
        };
    }, [navigation]);


    const [feedback, setFeedback] = useState<FeedbackChoice>(null);
    const [isSavingFeedback, setIsSavingFeedback] = useState(false);
    const [feedbackLoaded, setFeedbackLoaded] = useState(false);

    useEffect(() => {
        let cancelled = false;
        if (!apiAccessToken || !resolvedMediaId) {
            setFeedbackLoaded(true);
            return;
        }

        setFeedbackLoaded(false);
        setFeedback(null);

        const run = async () => {
            try {
                const existing = await getAiFeedbackLabel(apiAccessToken, {
                    media_id: String(resolvedMediaId),
                    event_id: eventId ?? undefined,
                });
                if (cancelled) return;
                if (existing) {
                    setFeedback(existing.label ? 'yes' : 'no');
                }
            } catch {
                // Ignore lookup failures; keep UI available.
            } finally {
                if (!cancelled) {
                    setFeedbackLoaded(true);
                }
            }
        };

        run();
        return () => {
            cancelled = true;
        };
    }, [apiAccessToken, eventId, resolvedMediaId]);

    const submitFeedback = useCallback(
        async (choice: Exclude<FeedbackChoice, null>) => {
            const feedbackId = resolvedMediaId;
            if (!feedbackId) return;
            if (!apiAccessToken) {
                Alert.alert(t('Missing API token'), t('Log in or set a Dev API token to label results.'));
                return;
            }

            setIsSavingFeedback(true);
            try {
                await postAiFeedbackLabel(apiAccessToken, {
                    media_id: feedbackId,
                    label: choice === 'yes',
                    event_id: eventId,
                    meta: {source: 'photo_detail'},
                });
                setFeedback(choice);
            } catch (e: any) {
                const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
                Alert.alert('Could not save label', msg);
            } finally {
                setIsSavingFeedback(false);
            }
        },
        [apiAccessToken, eventId, resolvedMediaId],
    );

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.backButton} onPress={() => navigation.goBack()}>
                    <Icons.BackArrow height={24} width={24} />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{headerLabel}</Text>
                <View style={Styles.headerAction} />
            </View>

            <View style={[Styles.content, isVideo && Styles.contentFull]}>
                {/* Question Card */}
                {!isVideo && !!resolvedMediaId && !!matchType && feedbackLoaded && feedback === null && (
                    <View style={Styles.questionCard}>
                        <Text style={Styles.questionText}>{t('Is this photo/video actually you?')}</Text>
                        <View style={Styles.buttonsRow}>
                            <TouchableOpacity
                                style={[
                                    Styles.noButton,
                                    feedback === 'no' && {opacity: 0.85},
                                    isSavingFeedback && {opacity: 0.6},
                                ]}
                                disabled={isSavingFeedback}
                                onPress={() => submitFeedback('no')}
                            >
                                <Text style={Styles.noButtonText}>{feedback === 'no' ? t('Not me') : t('No')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    Styles.yesButton,
                                    feedback === 'yes' && {opacity: 0.85},
                                    isSavingFeedback && {opacity: 0.6},
                                ]}
                                disabled={isSavingFeedback}
                                onPress={() => submitFeedback('yes')}
                            >
                                <Text style={Styles.buttonText}>{feedback === 'yes' ? t('This is me') : t('Yes')}</Text>
                            </TouchableOpacity>
                        </View>
                        {isSavingFeedback && (
                            <>
                                <SizeBox height={10} />
                                <Text style={[Styles.questionText, {marginBottom: 0}]}>{t('Saving…')}</Text>
                            </>
                        )}
                    </View>
                )}

                {!isVideo && <SizeBox height={18} />}

                {/* Photo Preview */}
                <View style={[Styles.photoContainer, isVideo && Styles.photoContainerFull]}>
                    {isVideo && activeVideoUrl ? (
                        <>
                            {isVideoLoading && (
                                <View style={Styles.videoSkeleton}>
                                    <ShimmerEffect width="100%" height="100%" borderRadius={0} />
                                </View>
                            )}
                            <Video
                                ref={videoRef}
                                key={activeVideoUrl}
                                source={{
                                    uri: activeVideoUrl,
                                    type: activeVideoUrl.toLowerCase().includes('.m3u8') ? 'm3u8' : undefined,
                                    headers: videoHeaders,
                                }}
                                style={Styles.photoImage}
                                resizeMode="cover"
                                paused={!isPlaying}
                                controls={false}
                                onLoadStart={() => setIsVideoLoading(true)}
                                onLoad={(meta) => {
                                    setDuration(meta.duration || 0);
                                    setVideoError(null);
                                    if (!hasSeekedRef.current && Number.isFinite(startAt) && startAt > 0) {
                                        const seekToTime = Math.min(startAt, meta.duration || startAt);
                                        hasSeekedRef.current = true;
                                        videoRef.current?.seek(seekToTime);
                                        setCurrentTime(seekToTime);
                                        setHasInitialTime(true);
                                    } else {
                                        setHasInitialTime(false);
                                    }
                                    setIsVideoLoading(false);
                                }}
                                onProgress={(progress) => {
                                    const nextTime = progress.currentTime || 0;
                                    if (!hasInitialTime && nextTime > 0) {
                                        setHasInitialTime(true);
                                    }
                                    if (!isSeeking) {
                                        setCurrentTime(nextTime);
                                    }
                                }}
                                onEnd={() => {
                                    setIsPlaying(false);
                                    setCurrentTime(0);
                                }}
                                onError={(err) => {
                                    const msg = err?.error?.errorString || err?.errorString || 'Video failed to load';
                                    setVideoError(msg);
                                    setCurrentTime(0);
                                    setIsPlaying(false);
                                    setDuration(0);
                                    setIsSeeking(false);
                                    setIsVideoLoading(false);
                                    if (videoSourceIndex + 1 < videoCandidates.length) {
                                        setVideoSourceIndex((prev) => Math.min(prev + 1, videoCandidates.length - 1));
                                        setVideoError(null);
                                        setIsPlaying(true);
                                    }
                                }}
                                repeat={false}
                            />
                            {!isVideoLoading && hasInitialTime && (
                                <>
                                    <TouchableOpacity
                                        style={Styles.videoTapOverlay}
                                        activeOpacity={1}
                                        onPress={togglePlayback}
                                    >
                                        {!isPlaying && (
                                            <View style={Styles.videoPlayBadge}>
                                                <Icons.PlayCricle height={36} width={36} />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                    <View style={[Styles.videoControlsOverlay, {paddingBottom: 16 + insets.bottom}]}>
                                        {isSeeking && (
                                            <View style={Styles.videoTimeRow}>
                                                <Text style={Styles.videoTimeText}>
                                                    {formatTime(currentTime)} / {formatTime(duration)}
                                                </Text>
                                            </View>
                                        )}
                                        <View style={Styles.videoScrubberWrap} pointerEvents="auto">
                                            <Slider
                                                style={Styles.videoScrubber}
                                                minimumValue={0}
                                                maximumValue={sliderMax}
                                                value={Math.min(currentTime, sliderMax)}
                                                minimumTrackTintColor={colors.primaryColor}
                                                maximumTrackTintColor="rgba(255,255,255,0.4)"
                                                thumbTintColor={colors.primaryColor}
                                                disabled={!duration}
                                                onSlidingStart={() => setIsSeeking(true)}
                                                onValueChange={(value) => setCurrentTime(value)}
                                                onSlidingComplete={(value) => {
                                                    setIsSeeking(false);
                                                    handleSeekComplete(value);
                                                }}
                                            />
                                        </View>
                                        {videoError && (
                                            <Text style={Styles.videoErrorText}>{videoError}</Text>
                                        )}
                                    </View>
                                </>
                            )}
                        </>
                    ) : bestImageUrl ? (
                        <FastImage
                            source={{uri: bestImageUrl}}
                            style={Styles.photoImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={Styles.videoPlaceholder}>
                            <Text style={Styles.videoPlaceholderText}>{t('No preview available')}</Text>
                        </View>
                    )}

                    {/* Top Row - Views and More */}
                    {!isVideo && (
                        <View style={Styles.topRow}>
                        <View style={Styles.viewsContainer}>
                            <Icons.Eye height={24} width={24} />
                                <Text style={Styles.viewsText}>
                                    {matchPercent != null ? `Match ${matchPercent.toFixed(0)}%` : ''}
                                </Text>
                            </View>
                        <TouchableOpacity onPress={openMoreMenu}>
                            <Icons.More height={24} width={24} stroke={moreDotsColor} />
                        </TouchableOpacity>
                        </View>
                    )}

                </View>
            </View>

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

            <Modal
                visible={moreMenuVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setMoreMenuVisible(false)}
            >
                <View style={Styles.moreMenuOverlay}>
                    <Pressable style={Styles.moreMenuBackdrop} onPress={() => setMoreMenuVisible(false)} />
                    <View style={Styles.moreMenuContainer}>
                        {moreMenuActions.map((item, index) => (
                            <TouchableOpacity
                                key={`${item.label}-${index}`}
                                style={Styles.moreMenuAction}
                                activeOpacity={0.85}
                                onPress={() => {
                                    setMoreMenuVisible(false);
                                    setTimeout(() => item.onPress(), 120);
                                }}
                            >
                                <Text style={Styles.moreMenuActionText}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={Styles.moreMenuCancel}
                            activeOpacity={0.85}
                            onPress={() => setMoreMenuVisible(false)}
                        >
                            <Text style={Styles.moreMenuCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default PhotoDetailScreen;
