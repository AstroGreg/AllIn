import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Video from 'react-native-video';
import FastImage from 'react-native-fast-image';
import {
    ArrowLeft2,
    Calendar,
    Location,
    Clock,
} from 'iconsax-react-nativejs';
import { createStyles } from './VideoEditRequestsScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Icons from '../../constants/Icons';
import Images from '../../constants/Images';
import ShimmerEffect from '../../components/shimmerEffect/ShimmerEffect';
import { useAuth } from '../../context/AuthContext';
import { getMediaById } from '../../services/apiGateway';
import { getApiBaseUrl, getHlsBaseUrl } from '../../constants/RuntimeConfig';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { selectPreferredVideoUrls } from '../../utils/videoUrls';

function formatDurationLabel(totalSeconds?: number | null) {
    const safeSeconds = Math.max(0, Math.round(Number(totalSeconds ?? 0)));
    if (!safeSeconds) return '';
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;
    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function resolveMediaDuration(assets?: Array<{ duration_seconds?: number | null }>, fallbackSeconds?: number | null) {
    const assetWithDuration = Array.isArray(assets)
        ? assets.find((asset) => Number(asset?.duration_seconds ?? 0) > 0)
        : null;
    return formatDurationLabel(assetWithDuration?.duration_seconds ?? fallbackSeconds ?? 0);
}

const VideoEditRequestsScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { apiAccessToken } = useAuth();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const mediaId = '86db92e8-1b8e-44a5-95c4-fb4764f6783e';
    const [videoData, setVideoData] = useState({
        title: 'BK Studentent 23',
        location: 'Berlin, Germany',
        duration: '',
        date: '27.5.2025',
        videoUri: '',
        thumbnail: Images.photo7,
    });
    const videoPoster =
        typeof videoData.thumbnail === 'number'
            ? Image.resolveAssetSource(videoData.thumbnail).uri
            : videoData.thumbnail?.uri;

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

    const toAbsoluteUrl = useCallback((value?: string | null) => {
        if (!value) return null;
        const raw = String(value);
        if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
        const base = getApiBaseUrl();
        if (!base) return raw;
        return `${base.replace(/\/$/, '')}/${raw.replace(/^\//, '')}`;
    }, []);

    const toHlsUrl = useCallback((value?: string | null) => {
        if (!value) return null;
        const raw = String(value);
        if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
        const base = getHlsBaseUrl();
        if (!base) return raw;
        return `${base.replace(/\/$/, '')}/${raw.replace(/^\//, '')}`;
    }, []);

    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken) return () => {};
        getMediaById(apiAccessToken, mediaId)
            .then((media) => {
                if (!mounted) return;
                const preferredUrls = selectPreferredVideoUrls(media, { toAbsoluteUrl, toHlsUrl });
                const resolvedVideo = preferredUrls.playbackUrl || '';
                const thumbCandidate = media.thumbnail_url || media.preview_url || media.full_url || media.raw_url || null;
                const resolvedPoster = thumbCandidate ? toAbsoluteUrl(String(thumbCandidate)) : null;
                const resolvedDuration = resolveMediaDuration(media.assets, Number((media as any)?.duration_seconds ?? 0));
                setVideoData((prev) => ({
                    ...prev,
                    duration: resolvedDuration || prev.duration,
                    videoUri: withAccessToken(resolvedVideo) || resolvedVideo,
                    thumbnail: resolvedPoster ? { uri: withAccessToken(resolvedPoster) || resolvedPoster } : prev.thumbnail,
                }));
            })
            .catch(() => {});
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, mediaId, toAbsoluteUrl, toHlsUrl, withAccessToken]);

    const handleVideoPress = () => {
        setIsPlaying(!isPlaying);
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={20} color={colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{t('Video details')}</Text>
                <View style={{ width: 44, height: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {/* Video Player */}
                <TouchableOpacity
                    style={Styles.videoContainer}
                    onPress={handleVideoPress}
                    activeOpacity={0.9}
                >
                    {isPlaying ? (
                        <>
                            {isLoading && (
                                <View style={[StyleSheet.absoluteFill, { zIndex: 1 }]}>
                                    <ShimmerEffect
                                        width="100%"
                                        height="100%"
                                        borderRadius={10}
                                    />
                                </View>
                            )}
                            <Video
                                source={{ uri: videoData.videoUri, type: 'm3u8' }}
                                style={Styles.videoPlayer}
                                controls={true}
                                resizeMode="cover"
                                repeat={false}
                                paused={false}
                                poster={videoPoster}
                                posterResizeMode="cover"
                                ignoreSilentSwitch="ignore"
                                onLoad={() => setIsLoading(false)}
                                onError={() => setIsLoading(false)}
                            />
                        </>
                    ) : (
                        <>
                            <FastImage
                                source={videoData.thumbnail}
                                style={Styles.videoPlayer}
                                resizeMode="cover"
                            />
                            <View style={Styles.playButtonOverlay}>
                                <Icons.PlayCricle height={34} width={34} />
                            </View>
                        </>
                    )}
                </TouchableOpacity>

                {/* Video Info */}
                <View style={Styles.videoInfo}>
                    <View style={Styles.videoInfoRow}>
                        <Text style={Styles.videoTitle}>{videoData.title}</Text>
                        <View style={Styles.locationContainer}>
                            <Location size={16} color={colors.subTextColor} variant="Linear" />
                            <Text style={Styles.locationText}>{videoData.location}</Text>
                        </View>
                    </View>
                    <View style={Styles.videoInfoRow}>
                        <View style={Styles.durationContainer}>
                            <Clock size={16} color={colors.subTextColor} variant="Linear" />
                            <Text style={Styles.durationText}>{videoData.duration}</Text>
                        </View>
                        <View style={Styles.dateContainer}>
                            <Calendar size={16} color={colors.subTextColor} variant="Linear" />
                            <Text style={Styles.dateText}>{videoData.date}</Text>
                        </View>
                    </View>
                </View>

                {/* Request for Edits Section */}
                <Text style={Styles.sectionTitle}>{t('Request for edits')}</Text>
                <SizeBox height={16} />

                {/* Empty State */}
                <View style={Styles.emptyStateContainer}>
                    <Icons.FileEmptyColorful height={147} width={143} />
                    <SizeBox height={16} />
                    <Text style={Styles.emptyStateText}>{t('No edit request found')}</Text>
                </View>

                <SizeBox height={40} />
            </ScrollView>
        </View>
    );
};

export default VideoEditRequestsScreen;
