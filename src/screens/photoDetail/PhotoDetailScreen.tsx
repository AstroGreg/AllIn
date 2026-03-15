import React, {useCallback, useMemo, useState, useEffect, useRef} from 'react';
import {ActivityIndicator, Alert, Modal, Pressable, Share, Text, TouchableOpacity, View, TextInput, ScrollView} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
// useFocusEffect not available in some runtime bundles; use navigation listeners instead.
import FastImage from 'react-native-fast-image';
import {createStyles} from './PhotoDetailScreenStyles';
import SizeBox from '../../constants/SizeBox';
import {useTheme} from '../../context/ThemeContext';
import {useAuth} from '../../context/AuthContext';
import {useEvents} from '../../context/EventsContext';
import {ApiError, attachMediaToPost, createMediaIssueRequest, createPost, getAiFeedbackLabel, getMediaById, postAiFeedbackLabel, recordDownload, recordMediaView, type MediaViewAllItem} from '../../services/apiGateway';
import Video from 'react-native-video';
import ShimmerEffect from '../../components/shimmerEffect/ShimmerEffect';
import {getApiBaseUrl, getHlsBaseUrl} from '../../constants/RuntimeConfig';
import Slider from '@react-native-community/slider';
import Icons from '../../constants/Icons';
import { useTranslation } from 'react-i18next'
import { useInstagramStoryImageComposer } from '../../components/share/InstagramStoryComposer';
import { shareMediaToInstagramStory } from '../../components/share/instagramStoryShare';
import { usePreventMediaCapture } from '../../utils/usePreventMediaCapture';

type FeedbackChoice = 'yes' | 'no' | null;

const PhotoDetailScreen = ({navigation, route}: any) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const {colors} = useTheme();
    const Styles = createStyles(colors);
    const isDarkSurface = String(colors.backgroundColor || '').toLowerCase() !== '#ffffff';
    const headerIconColor = isDarkSurface ? colors.pureWhite : colors.primaryColor;
    const {apiAccessToken} = useAuth();
    const {eventNameById} = useEvents();
    const {composeInstagramStoryImage, composerElement} = useInstagramStoryImageComposer();
    usePreventMediaCapture(true);
    const perfStartedAtRef = useRef(Date.now());
    const [perfReadyElapsedMs, setPerfReadyElapsedMs] = useState<number | null>(null);

    const eventTitle = route?.params?.eventTitle || '';
    const blogTitleFromRoute = route?.params?.blogTitle || route?.params?.postTitle || route?.params?.post?.title || '';
    const legacyPhoto = route?.params?.photo ?? null;
    const media = route?.params?.media ?? null;
    const startAt = Number(route?.params?.startAt ?? 0);
    const preferredVideoUrl = route?.params?.preferredVideoUrl ?? null;

    const pickString = useCallback((...values: any[]) => {
        for (const value of values) {
            if (value === null || value === undefined) continue;
            const str = String(value).trim();
            if (str) return str;
        }
        return null;
    }, []);
    const routeMedia = useMemo(() => {
        const routeMediaId = pickString(
            media?.id,
            media?.mediaId,
            media?.media_id,
            legacyPhoto?.id,
            legacyPhoto?.mediaId,
            legacyPhoto?.media_id,
            route?.params?.mediaId,
            route?.params?.media_id,
        );
        const routeEventId = pickString(
            media?.eventId,
            media?.event_id,
            media?.competition_id,
            legacyPhoto?.eventId,
            legacyPhoto?.event_id,
            route?.params?.eventId,
            route?.params?.event_id,
        );
        const routeCompetitionId = pickString(
            media?.competitionId,
            media?.competition_id,
            legacyPhoto?.competitionId,
            legacyPhoto?.competition_id,
            route?.params?.competitionId,
            route?.params?.competition_id,
        );
        const routeCheckpointId = pickString(
            media?.checkpointId,
            media?.checkpoint_id,
            legacyPhoto?.checkpointId,
            legacyPhoto?.checkpoint_id,
            route?.params?.checkpointId,
            route?.params?.checkpoint_id,
        );
        const typeToken = String(
            pickString(
                media?.type,
                media?.mediaType,
                media?.media_type,
                legacyPhoto?.type,
                legacyPhoto?.mediaType,
                legacyPhoto?.media_type,
                route?.params?.type,
                'image',
            ) ?? 'image',
        ).toLowerCase();
        const normalizedType = typeToken === 'video' ? 'video' : 'image';
        const thumbnailUrl = pickString(
            media?.thumbnailUrl,
            media?.thumbnail_url,
            legacyPhoto?.thumbnailUrl,
            legacyPhoto?.thumbnail_url,
            legacyPhoto?.thumbnail,
            legacyPhoto?.photo,
        );
        const previewUrl = pickString(
            media?.previewUrl,
            media?.preview_url,
            legacyPhoto?.previewUrl,
            legacyPhoto?.preview_url,
            legacyPhoto?.thumbnail,
            legacyPhoto?.photo,
        );
        const originalUrl = pickString(
            media?.originalUrl,
            media?.original_url,
            legacyPhoto?.originalUrl,
            legacyPhoto?.original_url,
            legacyPhoto?.thumbnail,
            legacyPhoto?.photo,
        );
        const fullUrl = pickString(
            media?.fullUrl,
            media?.full_url,
            legacyPhoto?.fullUrl,
            legacyPhoto?.full_url,
        );
        const rawUrl = pickString(
            media?.rawUrl,
            media?.raw_url,
            legacyPhoto?.rawUrl,
            legacyPhoto?.raw_url,
        );
        const vp9Url = pickString(media?.vp9Url, media?.vp9_url, legacyPhoto?.vp9Url, legacyPhoto?.vp9_url);
        const av1Url = pickString(media?.av1Url, media?.av1_url, legacyPhoto?.av1Url, legacyPhoto?.av1_url);
        const hlsManifestPath = pickString(
            media?.hlsManifestPath,
            media?.hls_manifest_path,
            legacyPhoto?.hlsManifestPath,
            legacyPhoto?.hls_manifest_path,
        );
        const matchTypeValue = pickString(
            media?.matchType,
            media?.match_type,
            legacyPhoto?.matchType,
            legacyPhoto?.match_type,
            route?.params?.matchType,
            route?.params?.match_type,
        );
        const assets = Array.isArray(media?.assets)
            ? media.assets
            : Array.isArray(legacyPhoto?.assets)
                ? legacyPhoto.assets
                : [];
        return {
            id: routeMediaId,
            mediaId: routeMediaId,
            media_id: routeMediaId,
            eventId: routeEventId,
            event_id: routeEventId,
            competitionId: routeCompetitionId,
            competition_id: routeCompetitionId,
            checkpointId: routeCheckpointId,
            checkpoint_id: routeCheckpointId,
            checkpoint_label: pickString(media?.checkpoint_label, legacyPhoto?.checkpoint_label, route?.params?.checkpoint_label),
            checkpoint_name: pickString(media?.checkpoint_name, legacyPhoto?.checkpoint_name, route?.params?.checkpoint_name),
            course_label: pickString(media?.course_label, legacyPhoto?.course_label, route?.params?.course_label),
            course_name: pickString(media?.course_name, legacyPhoto?.course_name, route?.params?.course_name),
            segment_label: pickString(media?.segment_label, legacyPhoto?.segment_label, route?.params?.segment_label),
            segment_name: pickString(media?.segment_name, legacyPhoto?.segment_name, route?.params?.segment_name),
            type: normalizedType,
            thumbnailUrl,
            thumbnail_url: thumbnailUrl,
            previewUrl,
            preview_url: previewUrl,
            originalUrl,
            original_url: originalUrl,
            fullUrl,
            full_url: fullUrl,
            rawUrl,
            raw_url: rawUrl,
            vp9Url,
            vp9_url: vp9Url,
            av1Url,
            av1_url: av1Url,
            hlsManifestPath,
            hls_manifest_path: hlsManifestPath,
            matchType: matchTypeValue,
            match_type: matchTypeValue,
            matchPercent: Number(media?.matchPercent ?? media?.match_percent ?? legacyPhoto?.matchPercent ?? legacyPhoto?.match_percent),
            views_count: Number(media?.views_count ?? media?.views ?? legacyPhoto?.views_count ?? legacyPhoto?.views ?? 0),
            assets,
            title: pickString(media?.title, legacyPhoto?.title),
        };
    }, [
        legacyPhoto,
        media,
        pickString,
        route?.params?.checkpointId,
        route?.params?.checkpoint_id,
        route?.params?.checkpoint_label,
        route?.params?.checkpoint_name,
        route?.params?.competitionId,
        route?.params?.competition_id,
        route?.params?.course_label,
        route?.params?.course_name,
        route?.params?.eventId,
        route?.params?.event_id,
        route?.params?.matchType,
        route?.params?.match_type,
        route?.params?.mediaId,
        route?.params?.media_id,
        route?.params?.segment_label,
        route?.params?.segment_name,
        route?.params?.type,
    ]);
    const mediaId: string | null = routeMedia.id;
    const eventId: string | null = routeMedia.eventId;
    const matchType: string | null = routeMedia.matchType;
    const effectiveMediaId = mediaId;
    const resolvedMediaId = mediaId;

    useEffect(() => {
        if (!apiAccessToken) return;
        const id = String(resolvedMediaId || '').trim();
        if (!id) return;
        recordMediaView(apiAccessToken, id).catch(() => {});
    }, [apiAccessToken, resolvedMediaId]);

    useEffect(() => {
        perfStartedAtRef.current = Date.now();
        setPerfReadyElapsedMs(null);
        setIsImageLoading(!isVideo);
        setIsFullImageLoaded(false);
    }, [resolvedMediaId, isVideo]);

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
        mediaId: item.media_id,
        media_id: item.media_id,
        eventId: item.event_id,
        event_id: item.event_id,
        competitionId: (item as any).competition_id ?? null,
        competition_id: (item as any).competition_id ?? null,
        checkpointId: (item as any).checkpoint_id ?? null,
        checkpoint_id: (item as any).checkpoint_id ?? null,
        checkpoint_label: (item as any).checkpoint_label ?? null,
        checkpoint_name: (item as any).checkpoint_name ?? null,
        course_label: (item as any).course_label ?? null,
        course_name: (item as any).course_name ?? null,
        segment_label: (item as any).segment_label ?? null,
        segment_name: (item as any).segment_name ?? null,
        thumbnailUrl: item.thumbnail_url,
        thumbnail_url: item.thumbnail_url,
        previewUrl: item.preview_url,
        preview_url: item.preview_url,
        originalUrl: item.original_url,
        original_url: item.original_url,
        fullUrl: item.full_url,
        full_url: item.full_url,
        rawUrl: item.raw_url,
        raw_url: item.raw_url,
        vp9Url: item.vp9_url,
        vp9_url: item.vp9_url,
        av1Url: item.av1_url,
        av1_url: item.av1_url,
        hlsManifestPath: item.hls_manifest_path,
        hls_manifest_path: item.hls_manifest_path,
        type: item.type,
        assets: item.assets ?? [],
        title: (item as any).title ?? null,
        views_count: Number((item as any).views_count ?? 0),
    }), []);

    const [resolvedMedia, setResolvedMedia] = useState<ReturnType<typeof normalizeMedia> | null>(null);
    const activeMedia = resolvedMedia ?? routeMedia;
    const matchPercent = Number.isFinite(Number((activeMedia as any)?.matchPercent ?? (activeMedia as any)?.match_percent))
        ? Number((activeMedia as any)?.matchPercent ?? (activeMedia as any)?.match_percent)
        : null;
    const mediaViews = Number((activeMedia as any)?.views_count ?? (routeMedia as any)?.views_count ?? 0);
    const mediaViewsLabel = Number.isFinite(mediaViews) ? mediaViews.toLocaleString() : '0';
    const normalizeHeaderLabel = useCallback((value?: string | null) => {
        const raw = String(value ?? '').trim();
        if (!raw) return '';
        const lowered = raw.toLowerCase();
        if (lowered === 'event') return '';
        return raw;
    }, []);
    const headerLabel = useMemo(() => {
        const blogTitle = normalizeHeaderLabel(blogTitleFromRoute);
        if (blogTitle) return blogTitle;
        const routeEventTitle = normalizeHeaderLabel(eventTitle);
        if (routeEventTitle) return routeEventTitle;
        const resolvedEventName = normalizeHeaderLabel(eventNameById(eventId));
        if (resolvedEventName) return resolvedEventName;
        return '';
    }, [blogTitleFromRoute, eventId, eventNameById, eventTitle, normalizeHeaderLabel]);
    const getInstagramShareMatchLabel = useCallback((rawMatchType?: string | null) => {
        const key = String(rawMatchType ?? '').trim().toLowerCase();
        if (!key) return null;
        if (key === 'combined') return t('Face + Chest');
        if (key === 'face' || key === 'facial') return t('Face');
        if (key === 'bib' || key === 'chest') return t('Chest');
        if (key === 'context') return t('Context');
        return null;
    }, [t]);
    const instagramStoryTitle = useMemo(() => {
        const normalizedHeader = String(headerLabel || '').trim();
        if (normalizedHeader) {
            return normalizedHeader;
        }
        const mediaTitle = String((activeMedia as any)?.title ?? '').trim();
        return mediaTitle || null;
    }, [activeMedia, headerLabel]);
    const instagramStorySubtitle = useMemo(
        () => getInstagramShareMatchLabel(
            String((activeMedia as any)?.matchType ?? (activeMedia as any)?.match_type ?? matchType ?? '').trim(),
        ),
        [activeMedia, getInstagramShareMatchLabel, matchType],
    );
    const primaryMediaAsset = useMemo(() => {
        const assets = Array.isArray(activeMedia?.assets) ? activeMedia.assets : [];
        if (assets.length === 0) return null;
        const variantRank = (variant?: string | null) => {
            const key = String(variant ?? '').trim().toLowerCase();
            switch (key) {
                case 'raw':
                    return 0;
                case 'full':
                    return 1;
                case 'preview_watermark':
                    return 2;
                case 'thumbnail':
                    return 3;
                default:
                    return 9;
            }
        };
        const ranked = [...assets].sort((left, right) => {
            const rankDiff = variantRank(left?.variant) - variantRank(right?.variant);
            if (rankDiff !== 0) return rankDiff;
            const leftArea = Number(left?.width ?? 0) * Number(left?.height ?? 0);
            const rightArea = Number(right?.width ?? 0) * Number(right?.height ?? 0);
            return rightArea - leftArea;
        });
        return ranked[0] ?? null;
    }, [activeMedia?.assets]);
    const mediaDimensions = useMemo(() => {
        const width = Number(primaryMediaAsset?.width ?? 0);
        const height = Number(primaryMediaAsset?.height ?? 0);
        if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
            return null;
        }
        return { width, height };
    }, [primaryMediaAsset?.height, primaryMediaAsset?.width]);
    const formatBytes = useCallback((bytes?: number | null) => {
        const safeBytes = Number(bytes ?? 0);
        if (!Number.isFinite(safeBytes) || safeBytes <= 0) return null;
        const units = ['B', 'KB', 'MB', 'GB'];
        let value = safeBytes;
        let unitIndex = 0;
        while (value >= 1024 && unitIndex < units.length - 1) {
            value /= 1024;
            unitIndex += 1;
        }
        const precision = value >= 10 || unitIndex === 0 ? 0 : 1;
        return `${value.toFixed(precision)} ${units[unitIndex]}`;
    }, []);
    const mediaQualityText = useMemo(() => {
        const parts: string[] = [];
        if (mediaDimensions) {
            const maxDimension = Math.max(mediaDimensions.width, mediaDimensions.height);
            const qualityTier =
                maxDimension >= 3840
                    ? '4K'
                    : maxDimension >= 2560
                        ? '2K'
                        : maxDimension >= 1920
                            ? 'HD'
                            : maxDimension >= 1280
                                ? 'Web'
                                : 'Standard';
            parts.push(`${qualityTier} ${mediaDimensions.width}x${mediaDimensions.height}`);
        }
        const mimeSuffix = String(primaryMediaAsset?.mime_type ?? '').trim().split('/')[1];
        if (mimeSuffix) {
            parts.push(mimeSuffix.toUpperCase());
        }
        const fileSizeLabel = formatBytes(primaryMediaAsset?.file_size_bytes ?? null);
        if (fileSizeLabel) {
            parts.push(fileSizeLabel);
        }
        return parts.length > 0 ? parts.join(' • ') : null;
    }, [formatBytes, mediaDimensions, primaryMediaAsset?.file_size_bytes, primaryMediaAsset?.mime_type]);
    const headerMetaText = useMemo(() => {
        const parts: string[] = [];
        if (mediaQualityText) parts.push(mediaQualityText);
        if (matchPercent != null) parts.push(`Match ${matchPercent.toFixed(0)}%`);
        return parts.length > 0 ? parts.join(' • ') : null;
    }, [matchPercent, mediaQualityText]);
    const headerTitleText = useMemo(() => {
        if (headerLabel) return headerLabel;
        return String(activeMedia?.type ?? '').toLowerCase() === 'video' ? t('Video') : t('Photo');
    }, [activeMedia?.type, headerLabel, t]);
    const mediaStageStyle = useMemo(() => {
        const isVideoType = String(activeMedia?.type ?? '').toLowerCase() === 'video';
        if (isVideoType) return null;
        return {
            flex: 1,
            minHeight: 0,
        };
    }, [activeMedia?.type]);

    const shouldFetchMedia = useMemo(() => {
        if (!apiAccessToken || !effectiveMediaId) return false;
        const hasHighResMedia =
            Boolean(routeMedia.originalUrl || routeMedia.original_url) ||
            Boolean(routeMedia.fullUrl || routeMedia.full_url) ||
            Boolean(routeMedia.rawUrl || routeMedia.raw_url) ||
            Boolean(routeMedia.hlsManifestPath || routeMedia.hls_manifest_path);
        const hasAssets = Array.isArray((routeMedia as any).assets) && (routeMedia as any).assets.length > 0;
        return !hasAssets && !hasHighResMedia;
    }, [apiAccessToken, effectiveMediaId, routeMedia]);

    useEffect(() => {
        let isMounted = true;
        const loadMedia = async () => {
            if (!shouldFetchMedia) return;
            const safeMediaId = String(effectiveMediaId || '').trim();
            if (!safeMediaId || !apiAccessToken) return;
            try {
                const fresh = await getMediaById(apiAccessToken, safeMediaId);
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
            lower.includes('sig=') ||
            lower.includes('token=') ||
            lower.includes('expires=') ||
            lower.includes('sv=') ||
            lower.includes('se=') ||
            lower.includes('sp=')
        );
    }, []);

    const withAccessToken = useCallback((value?: string | null) => {
        if (!value) return null;
        const resolved = toAbsoluteUrl(value);
        if (!resolved) return null;
        if (!apiAccessToken || isSignedUrl(resolved) || resolved.includes('access_token=')) return resolved;
        const sep = resolved.includes('?') ? '&' : '?';
        return `${resolved}${sep}access_token=${encodeURIComponent(apiAccessToken)}`;
    }, [apiAccessToken, isSignedUrl, toAbsoluteUrl]);

    const hlsUrlWithToken = useMemo(() => {
        if (!hlsUrl) return null;
        if (!apiAccessToken) return hlsUrl;
        if (isSignedUrl(hlsUrl)) return hlsUrl;
        const sep = hlsUrl.includes('?') ? '&' : '?';
        return `${hlsUrl}${sep}access_token=${encodeURIComponent(apiAccessToken)}`;
    }, [apiAccessToken, hlsUrl, isSignedUrl]);

    const bestImageUrl = useMemo(() => {
        const candidates = [
            activeMedia?.previewUrl,
            activeMedia?.preview_url,
            activeMedia?.originalUrl,
            activeMedia?.original_url,
            activeMedia?.fullUrl,
            activeMedia?.full_url,
            activeMedia?.rawUrl,
            activeMedia?.raw_url,
            activeMedia?.thumbnailUrl,
            activeMedia?.thumbnail_url,
        ].filter(Boolean);
        if (candidates.length > 0) return withAccessToken(String(candidates[0])) || toAbsoluteUrl(String(candidates[0]));
        return null;
    }, [
        activeMedia?.fullUrl,
        activeMedia?.full_url,
        activeMedia?.originalUrl,
        activeMedia?.original_url,
        activeMedia?.previewUrl,
        activeMedia?.preview_url,
        activeMedia?.rawUrl,
        activeMedia?.raw_url,
        activeMedia?.thumbnailUrl,
        activeMedia?.thumbnail_url,
        toAbsoluteUrl,
        withAccessToken,
    ]);
    const thumbnailImageUrl = useMemo(() => {
        const candidates = [
            activeMedia?.thumbnailUrl,
            activeMedia?.thumbnail_url,
            activeMedia?.previewUrl,
            activeMedia?.preview_url,
            bestImageUrl,
        ].filter(Boolean);
        if (candidates.length === 0) return null;
        return withAccessToken(String(candidates[0])) || toAbsoluteUrl(String(candidates[0]));
    }, [
        activeMedia?.previewUrl,
        activeMedia?.preview_url,
        activeMedia?.thumbnailUrl,
        activeMedia?.thumbnail_url,
        bestImageUrl,
        toAbsoluteUrl,
        withAccessToken,
    ]);
    const highResImageUrl = useMemo(() => {
        const candidates = [
            activeMedia?.previewUrl,
            activeMedia?.preview_url,
            activeMedia?.originalUrl,
            activeMedia?.original_url,
            activeMedia?.fullUrl,
            activeMedia?.full_url,
            activeMedia?.rawUrl,
            activeMedia?.raw_url,
        ].filter(Boolean);
        if (candidates.length === 0) return thumbnailImageUrl;
        return withAccessToken(String(candidates[0])) || toAbsoluteUrl(String(candidates[0])) || thumbnailImageUrl;
    }, [
        activeMedia?.fullUrl,
        activeMedia?.full_url,
        activeMedia?.originalUrl,
        activeMedia?.original_url,
        activeMedia?.previewUrl,
        activeMedia?.preview_url,
        activeMedia?.rawUrl,
        activeMedia?.raw_url,
        thumbnailImageUrl,
        toAbsoluteUrl,
        withAccessToken,
    ]);
    const instagramStoryImageUrl = useMemo(() => {
        const candidates = [
            activeMedia?.rawUrl,
            activeMedia?.raw_url,
            activeMedia?.originalUrl,
            activeMedia?.original_url,
            activeMedia?.fullUrl,
            activeMedia?.full_url,
            activeMedia?.previewUrl,
            activeMedia?.preview_url,
            activeMedia?.thumbnailUrl,
            activeMedia?.thumbnail_url,
        ].filter(Boolean);
        if (candidates.length === 0) return null;

        const resolved = candidates
            .map((value) => withAccessToken(String(value)) || toAbsoluteUrl(String(value)))
            .filter(Boolean) as string[];
        const bitmapImage = resolved.find((value) => /\.(jpg|jpeg|png|heic)(\?|$)/i.test(value));
        if (bitmapImage) return bitmapImage;
        const webpImage = resolved.find((value) => /\.(webp)(\?|$)/i.test(value));
        return webpImage || resolved[0] || null;
    }, [
        activeMedia?.fullUrl,
        activeMedia?.full_url,
        activeMedia?.originalUrl,
        activeMedia?.original_url,
        activeMedia?.previewUrl,
        activeMedia?.preview_url,
        activeMedia?.rawUrl,
        activeMedia?.raw_url,
        activeMedia?.thumbnailUrl,
        activeMedia?.thumbnail_url,
        toAbsoluteUrl,
        withAccessToken,
    ]);

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
            activeMedia?.full_url,
            activeMedia?.rawUrl,
            activeMedia?.raw_url,
            activeMedia?.originalUrl,
            activeMedia?.original_url,
            activeMedia?.previewUrl,
            activeMedia?.preview_url,
            assetHlsUrl,
            hlsUrlWithToken,
        ]
            .filter(Boolean)
            .map((value) => String(value));

        const normalized = rawCandidates
            .map((value) => {
                if (value.startsWith('http://') || value.startsWith('https://')) return value;
                if (value.toLowerCase().includes('.m3u8')) return null;
                return withAccessToken(value) || toAbsoluteUrl(value);
            })
            .filter((value): value is string => !!value);

        const allowNonExtension = String(activeMedia?.type ?? '').toLowerCase() === 'video';
        const filtered = allowNonExtension ? normalized : normalized.filter((value) => isVideoFile(value));

        const unique: string[] = [];
        filtered.forEach((value) => {
            if (!unique.includes(value)) unique.push(value);
        });
        return unique;
    }, [
        activeMedia?.fullUrl,
        activeMedia?.full_url,
        activeMedia?.originalUrl,
        activeMedia?.original_url,
        activeMedia?.previewUrl,
        activeMedia?.preview_url,
        activeMedia?.rawUrl,
        activeMedia?.raw_url,
        activeMedia?.type,
        assetHlsUrl,
        assetMp4Url,
        hlsUrlWithToken,
        isVideoFile,
        preferredVideoUrl,
        toAbsoluteUrl,
        withAccessToken,
    ]);

    const bestVideoUrl = useMemo(() => videoCandidates[0] ?? null, [videoCandidates]);
    const [videoSourceIndex, setVideoSourceIndex] = useState(0);
    const activeVideoUrl = videoCandidates[videoSourceIndex] ?? bestVideoUrl;

    const isVideo = useMemo(() => {
        if (activeMedia?.type) return String(activeMedia.type).toLowerCase() === 'video';
        const u = (bestVideoUrl ?? bestImageUrl ?? '').toLowerCase();
        return /\.(mp4|mov|m4v|m3u8)(\\?|$)/.test(u) || u.includes('video');
    }, [bestImageUrl, bestVideoUrl, activeMedia?.type]);

    const videoRef = useRef<any>(null);
    const hasSeekedRef = useRef(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isSeeking, setIsSeeking] = useState(false);
    const [videoError, setVideoError] = useState<string | null>(null);
    const [isVideoLoading, setIsVideoLoading] = useState(true);
    const [isImageLoading, setIsImageLoading] = useState(true);
    const [isFullImageLoaded, setIsFullImageLoaded] = useState(false);
    const [hasInitialTime, setHasInitialTime] = useState(false);
    const [mediaViewportSize, setMediaViewportSize] = useState({width: 0, height: 0});
    const downloadInFlightRef = useRef(false);
    const [downloadVisible, setDownloadVisible] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
    const [moreMenuVisible, setMoreMenuVisible] = useState(false);
    const [moreMenuActions, setMoreMenuActions] = useState<Array<{label: string; onPress: () => void}>>([]);
    const [reportIssueVisible, setReportIssueVisible] = useState(false);
    const [reportStep, setReportStep] = useState<'reason' | 'confirm'>('reason');
    const [selectedReportReason, setSelectedReportReason] = useState('');
    const [customReportReason, setCustomReportReason] = useState('');
    const [infoPopupVisible, setInfoPopupVisible] = useState(false);
    const [infoPopupTitle, setInfoPopupTitle] = useState('');
    const [infoPopupMessage, setInfoPopupMessage] = useState('');

    const showInfoPopup = useCallback((title: string, message: string) => {
        setInfoPopupTitle(title);
        setInfoPopupMessage(message);
        setInfoPopupVisible(true);
    }, []);

    const markPerfReady = useCallback(() => {
        setPerfReadyElapsedMs((prev) => prev ?? (Date.now() - perfStartedAtRef.current));
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

    const computeDisplayFrame = useCallback(
        (
            container: { width: number; height: number },
            media: { width: number; height: number } | null,
        ) => {
            const containerWidth = Number(container?.width || 0);
            const containerHeight = Number(container?.height || 0);
            if (containerWidth <= 0 || containerHeight <= 0) {
                return { width: 0, height: 0 };
            }
            if (!media || media.width <= 0 || media.height <= 0) {
                return { width: containerWidth, height: containerHeight };
            }
            const mediaRatio = media.width / media.height;
            return {
                width: containerWidth,
                height: containerWidth / mediaRatio,
            };
        },
        [],
    );

    const resolvedImageFrame = useMemo(
        () => computeDisplayFrame(mediaViewportSize, mediaDimensions),
        [computeDisplayFrame, mediaDimensions, mediaViewportSize],
    );

    const openReportIssuePopup = useCallback(() => {
        setSelectedReportReason('');
        setCustomReportReason('');
        setReportStep('reason');
        setReportIssueVisible(true);
    }, []);

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

    const isHlsUrl = useCallback((value?: string | null) => {
        if (!value) return false;
        return String(value).toLowerCase().includes('.m3u8');
    }, []);

    const extensionFromUrl = useCallback((value: string) => {
        const base = value.split('?')[0];
        const match = base.match(/\.(mp4|mov|m4v|jpg|jpeg|png|webp|heic)$/i);
        return match?.[1] ? match[1].toLowerCase() : '';
    }, []);

    const resolveDownloadUrl = useCallback(async () => {

        const candidates = [
            assetMp4Url,
            activeMedia?.originalUrl,
            activeMedia?.original_url,
            activeMedia?.fullUrl,
            activeMedia?.full_url,
            activeMedia?.rawUrl,
            activeMedia?.raw_url,
            activeMedia?.previewUrl,
            activeMedia?.preview_url,
        ]
            .filter(Boolean)
            .map((value) => withAccessToken(String(value)) || toAbsoluteUrl(String(value)))
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
                    .map((value) => withAccessToken(String(value)) || toAbsoluteUrl(String(value)))
                    .filter(Boolean) as string[];

                const freshDirect = freshCandidates.find((value) => !isHlsUrl(value));
                if (freshDirect) return freshDirect;
            } catch {
                // ignore
            }
        }

        return bestVideoUrl ?? null;
    }, [
        activeMedia?.fullUrl,
        activeMedia?.full_url,
        activeMedia?.originalUrl,
        activeMedia?.original_url,
        activeMedia?.previewUrl,
        activeMedia?.preview_url,
        activeMedia?.rawUrl,
        activeMedia?.raw_url,
        apiAccessToken,
        assetMp4Url,
        bestVideoUrl,
        isHlsUrl,
        resolvedMediaId,
        toAbsoluteUrl,
        withAccessToken,
    ]);

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
        const fileUrl = await ensureLocalFile(
            downloadUrl,
            extensionFromUrl(downloadUrl) || (String(activeMedia?.type ?? '').toLowerCase() === 'video' ? 'mp4' : 'jpg'),
            setDownloadProgress,
        );
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
                await Share.share({url: fileUrl, message: 'SpotMe media'});
            }
        } catch (err: any) {
            const msg = String(err?.message ?? err);
            Alert.alert(t('Download failed'), msg);
        } finally {
            setDownloadVisible(false);
            setDownloadProgress(null);
            downloadInFlightRef.current = false;
        }
    }, [activeMedia?.type, apiAccessToken, ensureLocalFile, eventId, extensionFromUrl, getShareModule, resolveDownloadUrl, resolvedMediaId, t]);

    const handleShareNative = useCallback(async () => {
        const shareUrl = await resolveShareUrl();
        if (!shareUrl) {
            Alert.alert(t('No media available'), t('There is no media to share.'));
            return;
        }
        const localShareUrl = await ensureLocalFile(
            shareUrl,
            extensionFromUrl(shareUrl) || (String(activeMedia?.type ?? '').toLowerCase() === 'video' ? 'mp4' : 'jpg'),
        );
        if (!localShareUrl) {
            Alert.alert(t('Share failed'), t('Unable to download the media file.'));
            return;
        }
        try {
            await Share.share({message: 'SpotMe media', url: localShareUrl});
        } catch (e: any) {
            const msg = String(e?.message ?? e);
            Alert.alert(t('Share failed'), msg);
        }
    }, [activeMedia?.type, ensureLocalFile, extensionFromUrl, resolveShareUrl, t]);

    const handleShareInstagram = useCallback(async () => {
        const shareModule = getShareModule();
        const shareUrl = String(activeMedia?.type ?? '').toLowerCase() === 'video'
            ? await resolveShareUrl()
            : (instagramStoryImageUrl || await resolveShareUrl());
        console.log('[IGStoryScreen] handleShareInstagram.start', {
            mediaId: resolvedMediaId,
            mediaType: String(activeMedia?.type ?? ''),
            shareUrl,
            instagramStoryImageUrl,
            title: instagramStoryTitle,
            subtitle: instagramStorySubtitle,
        });

        if (shareModule?.default?.shareSingle) {
            const ShareLib = shareModule.default;
            try {
                const localAsset = shareUrl
                    ? await ensureLocalFile(
                        shareUrl,
                        extensionFromUrl(shareUrl) || (String(activeMedia?.type ?? '').toLowerCase() === 'video' ? 'mp4' : 'jpg'),
                    )
                    : null;
                if (!localAsset) {
                    Alert.alert(t('Share failed'), t('Unable to download the media file.'));
                    return;
                }
                const isLocalVideo = /\.(mp4|mov|m4v)(\?|$)/i.test(localAsset);
                console.log('[IGStoryScreen] handleShareInstagram.localAsset', {
                    mediaId: resolvedMediaId,
                    shareUrl,
                    localAsset,
                    isLocalVideo,
                });
                const result = await shareMediaToInstagramStory({
                    t,
                    composeInstagramStoryImage,
                    localAssetUrl: localAsset,
                    isVideo: isLocalVideo,
                    title: isLocalVideo ? null : instagramStoryTitle,
                    subtitle: isLocalVideo ? null : instagramStorySubtitle,
                    composeImageUri: isLocalVideo
                        ? null
                        : localAsset,
                    shareModule: ShareLib,
                });
                console.log('[IGStoryScreen] handleShareInstagram.result', {
                    mediaId: resolvedMediaId,
                    result,
                });
                if (result !== 'unsupported') {
                    return;
                }
            } catch (e: any) {
                const msg = String(e?.message ?? e);
                console.log('[IGStoryScreen] handleShareInstagram.failed', {
                    mediaId: resolvedMediaId,
                    message: msg,
                });
                if (!/cancel/i.test(msg)) {
                    Alert.alert(t('Instagram Story failed'), msg);
                }
                return;
            }
        }

        if (!shareUrl) {
            Alert.alert(t('No media available'), t('There is no media to share.'));
            return;
        }
        await handleShareNative();
    }, [activeMedia?.type, composeInstagramStoryImage, ensureLocalFile, extensionFromUrl, getShareModule, handleShareNative, instagramStoryImageUrl, instagramStorySubtitle, instagramStoryTitle, resolveShareUrl, resolvedMediaId, t]);

    const handleAddToProfile = useCallback(async () => {
        if (!apiAccessToken) {
            Alert.alert(t('Missing API token'), t('Log in or set a Dev API token to add media to your news page.'));
            return;
        }
        if (!resolvedMediaId) {
            Alert.alert(t('Missing media'), t('This item has no media_id to add.'));
            return;
        }
        try {
            const entryTitle = String(headerLabel || eventTitle || t('Competition')).trim() || t('Competition');
            const created = await createPost(apiAccessToken, {
                title: entryTitle,
                description: entryTitle,
                post_type: 'photo',
            });
            const postId = String(created?.post?.id ?? '').trim();
            if (!postId) {
                throw new Error(t('Could not create the news post.'));
            }
            await attachMediaToPost(apiAccessToken, postId, {
                media_ids: [String(resolvedMediaId)],
            });
            showInfoPopup(t('Added to news page'), t('This photo now appears on your news page.'));
        } catch (e: any) {
            const message = e instanceof ApiError ? e.message : String(e?.message ?? e);
            Alert.alert(t('Could not add'), message);
        }
    }, [apiAccessToken, eventTitle, headerLabel, resolvedMediaId, showInfoPopup, t]);

    const openMoreMenu = useCallback(() => {
        const actions = [
            {label: t('Download'), onPress: handleDownload},
            {label: t('Add to news'), onPress: handleAddToProfile},
            {label: t('Share'), onPress: handleShareNative},
            {label: t('Share to Instagram Story'), onPress: handleShareInstagram},
            {label: t('Report an issue with this video/photo'), onPress: openReportIssuePopup},
            {
                label: t('Go to author profile'),
                onPress: () => navigation.navigate('BottomTabBar', {screen: 'Profile'}),
            },
            {
                label: t('Go to event'),
                onPress: () => {
                    const eventName = headerLabel || t('Competition');
                    const typeToken = String(eventName || '').toLowerCase();
                    navigation.navigate('CompetitionDetailsScreen', {
                        eventId: eventId || undefined,
                        name: eventName,
                        competitionType: /road|trail|marathon|veldloop|veldlopen|cross|5k|10k|half|ultra|city\s*run/.test(typeToken)
                            ? 'road'
                            : 'track',
                    });
                },
            },
            {
                label: t('Mark as inappropriate content'),
                onPress: () => Alert.alert(t('Thanks'), t('We will review this content.')),
            },
            {
                label: t('Request this video removed'),
                onPress: () => Alert.alert(t('Request sent'), t('We will review the removal request.')),
            },
        ];
        setMoreMenuActions(actions);
        setMoreMenuVisible(true);
    }, [eventId, handleAddToProfile, handleDownload, handleShareInstagram, handleShareNative, headerLabel, navigation, openReportIssuePopup, t]);

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
                Alert.alert(t('Could not save label'), msg);
            } finally {
                setIsSavingFeedback(false);
            }
        },
        [apiAccessToken, eventId, resolvedMediaId, t],
    );

    return (
        <View style={Styles.mainContainer} testID="photo-detail-screen">
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.backButton} onPress={() => navigation.goBack()}>
                    <Icons.BackArrow height={24} width={24} />
                </TouchableOpacity>
                <View style={Styles.headerCenter}>
                    <Text style={Styles.headerTitle} numberOfLines={1}>{headerTitleText}</Text>
                    {headerMetaText ? (
                        <Text style={Styles.headerSubtitle} numberOfLines={1}>{headerMetaText}</Text>
                    ) : null}
                </View>
                <View style={Styles.headerRight}>
                    <View style={[Styles.headerMetricPill, !isDarkSurface && Styles.headerMetricPillLight]}>
                        <Icons.Eye height={16} width={16} color={headerIconColor} />
                        <Text style={Styles.headerMetricText}>{mediaViewsLabel}</Text>
                    </View>
                    <TouchableOpacity
                        style={[
                            Styles.headerAction,
                            isDarkSurface ? Styles.headerActionDark : Styles.headerActionLight,
                        ]}
                        onPress={openMoreMenu}
                    >
                        <Icons.More height={22} width={22} color={headerIconColor} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={[Styles.content, isVideo && Styles.contentFull]}>
                {/* Question Card */}
                {!isVideo && !!resolvedMediaId && !!matchType && feedbackLoaded && feedback === null && (
                    <View style={Styles.contentInset}>
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
                    </View>
                )}

                {/* Photo Preview */}
                <View
                    style={[Styles.mediaStage, mediaStageStyle]}
                    onLayout={(event) => {
                        const { width, height } = event.nativeEvent.layout;
                        if (width !== mediaViewportSize.width || height !== mediaViewportSize.height) {
                            setMediaViewportSize({ width, height });
                        }
                    }}
                >
                <View style={[Styles.photoContainer, Styles.photoContainerFullBleed, isVideo && Styles.photoContainerFull]}>
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
                                resizeMode="contain"
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
                                    setPerfReadyElapsedMs(Date.now() - perfStartedAtRef.current);
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
                                    const rawError = err as any;
                                    const msg = rawError?.error?.errorString || rawError?.errorString || 'Video failed to load';
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
                    ) : (thumbnailImageUrl || highResImageUrl) ? (
                        <>
                            <ScrollView
                                style={Styles.photoZoomScroll}
                                contentContainerStyle={[
                                    Styles.photoZoomContent,
                                    resolvedImageFrame.height > 0 && resolvedImageFrame.height < mediaViewportSize.height
                                        ? { minHeight: mediaViewportSize.height }
                                        : null,
                                ]}
                                minimumZoomScale={1}
                                maximumZoomScale={4}
                                showsHorizontalScrollIndicator={false}
                                showsVerticalScrollIndicator={false}
                                bouncesZoom={false}
                                pinchGestureEnabled
                            >
                                <View
                                    style={[
                                        Styles.zoomablePhoto,
                                        resolvedImageFrame.width > 0 && resolvedImageFrame.height > 0
                                            ? {
                                                width: resolvedImageFrame.width,
                                                height: resolvedImageFrame.height,
                                            }
                                            : Styles.photoImage,
                                    ]}
                                >
                                    <FastImage
                                        source={{uri: thumbnailImageUrl || highResImageUrl!}}
                                        onLoadStart={() => setIsImageLoading(true)}
                                        onLoadEnd={() => {
                                            setIsImageLoading(false);
                                            markPerfReady();
                                        }}
                                        style={Styles.photoImage}
                                        resizeMode="cover"
                                    />
                                    {highResImageUrl && highResImageUrl !== thumbnailImageUrl ? (
                                        <FastImage
                                            source={{uri: highResImageUrl}}
                                            onLoadEnd={() => {
                                                setIsFullImageLoaded(true);
                                                markPerfReady();
                                            }}
                                            style={[
                                                Styles.photoImage,
                                                {
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    opacity: isFullImageLoaded ? 1 : 0.01,
                                                },
                                            ]}
                                            resizeMode="cover"
                                        />
                                    ) : null}
                                </View>
                            </ScrollView>
                        </>
                    ) : (
                        <View style={Styles.videoPlaceholder}>
                            <Text style={Styles.videoPlaceholderText}>{t('No preview available')}</Text>
                        </View>
                    )}
                </View>
                </View>
            </View>

            {perfReadyElapsedMs != null && (
                <Text style={{height: 0, width: 0, opacity: 0}} testID="e2e-perf-ready-photo-viewer">
                    {`ready:${perfReadyElapsedMs}`}
                </Text>
            )}

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
                            <Text style={Styles.moreMenuCancelText}>{t('Cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={reportIssueVisible}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    setReportIssueVisible(false);
                    setReportStep('reason');
                    setSelectedReportReason('');
                    setCustomReportReason('');
                }}
            >
                <View style={Styles.moreMenuOverlay}>
                    <Pressable
                        style={Styles.moreMenuBackdrop}
                        onPress={() => {
                            setReportIssueVisible(false);
                            setReportStep('reason');
                            setSelectedReportReason('');
                            setCustomReportReason('');
                        }}
                    />
                    <View style={Styles.moreMenuContainer}>
                        <Text style={Styles.moreMenuTitle}>
                            {reportStep === 'reason'
                                ? t('Report an issue with this photo/video')
                                : t('Confirm request')}
                        </Text>
                        <View style={Styles.moreMenuDivider} />
                        {reportStep === 'reason' ? (
                            <>
                                {reportReasons.map((reason) => (
                                    <TouchableOpacity
                                        key={reason}
                                        style={Styles.moreMenuAction}
                                        activeOpacity={0.85}
                                        onPress={() => {
                                            setSelectedReportReason(reason);
                                            if (reason === t('Custom')) {
                                                return;
                                            }
                                            setReportStep('confirm');
                                        }}
                                    >
                                        <Text style={Styles.moreMenuActionText}>{reason}</Text>
                                    </TouchableOpacity>
                                ))}
                                {selectedReportReason === t('Custom') ? (
                                    <View style={[Styles.moreMenuAction, { borderBottomWidth: 0 }]}>
                                        <TextInput
                                            style={[Styles.moreMenuActionText, { borderWidth: 1, borderColor: colors.borderColor, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }]}
                                            value={customReportReason}
                                            onChangeText={setCustomReportReason}
                                            placeholder={t('Type your request')}
                                            placeholderTextColor={colors.subTextColor}
                                        />
                                        <TouchableOpacity
                                            style={[Styles.infoModalSubmitButton, { marginTop: 10 }]}
                                            activeOpacity={0.85}
                                            onPress={() => {
                                                if (!customReportReason.trim()) return;
                                                setReportStep('confirm');
                                            }}
                                        >
                                            <Text style={Styles.infoModalSubmitButtonText}>{t('Next')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : null}
                                <TouchableOpacity
                                    style={Styles.moreMenuCancel}
                                    activeOpacity={0.85}
                                    onPress={() => {
                                        setReportIssueVisible(false);
                                        setReportStep('reason');
                                        setSelectedReportReason('');
                                        setCustomReportReason('');
                                    }}
                                >
                                    <Text style={Styles.moreMenuCancelText}>{t('Cancel')}</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <View style={Styles.moreMenuAction}>
                                    <Text style={Styles.moreMenuActionText}>
                                        {`${t('Reason')}: ${selectedReportReason}${selectedReportReason === t('Custom') ? ` - ${customReportReason.trim()}` : ''}`}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={[Styles.infoModalSubmitButton, { marginTop: 8 }]}
                                    activeOpacity={0.85}
                                    onPress={async () => {
                                        const mediaId = String(resolvedMediaId || '').trim();
                                        if (!apiAccessToken || !mediaId) return;
                                        const issue_type = selectedReportReason === t('Wrong competition')
                                            ? 'wrong_competition'
                                            : selectedReportReason === t('Wrong heat')
                                                ? 'wrong_heat'
                                                : 'custom';
                                        try {
                                            await createMediaIssueRequest(apiAccessToken, {
                                                media_id: mediaId,
                                                event_id: eventId || undefined,
                                                issue_type,
                                                custom_text: issue_type === 'custom' ? customReportReason.trim() : undefined,
                                            });
                                        } catch (e: any) {
                                            const msg = String(e?.message || t('Could not submit request'));
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
                                    }}
                                >
                                    <Text style={Styles.infoModalSubmitButtonText}>{t('Submit')}</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            <Modal
                visible={infoPopupVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setInfoPopupVisible(false)}
            >
                <View style={Styles.moreMenuOverlay}>
                    <Pressable style={Styles.moreMenuBackdrop} onPress={() => setInfoPopupVisible(false)} />
                    <View style={Styles.infoModalContainer}>
                        <Text style={Styles.infoModalTitle}>{infoPopupTitle}</Text>
                        <Text style={Styles.infoModalText}>{infoPopupMessage}</Text>
                    </View>
                </View>
            </Modal>
            {composerElement}
        </View>
    );
};

export default PhotoDetailScreen;
