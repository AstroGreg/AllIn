import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Video from 'react-native-video';
import FastImage from 'react-native-fast-image';
import { ArrowLeft2, Calendar, Location, Clock, } from 'iconsax-react-nativejs';
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
const VideoEditRequestsScreen = ({ navigation }) => {
    var _a;
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
        duration: '2 Minutes',
        date: '27.5.2025',
        videoUri: '',
        thumbnail: Images.photo7,
    });
    const videoPoster = typeof videoData.thumbnail === 'number'
        ? Image.resolveAssetSource(videoData.thumbnail).uri
        : (_a = videoData.thumbnail) === null || _a === void 0 ? void 0 : _a.uri;
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
            setVideoData((prev) => (Object.assign(Object.assign({}, prev), { videoUri: withAccessToken(resolvedVideo) || resolvedVideo, thumbnail: resolvedPoster ? { uri: withAccessToken(resolvedPoster) || resolvedPoster } : prev.thumbnail })));
        })
            .catch(() => { });
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, mediaId, toAbsoluteUrl, toHlsUrl, withAccessToken]);
    const handleVideoPress = () => {
        setIsPlaying(!isPlaying);
    };
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.backButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 20, color: colors.mainTextColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('Video details') })), _jsx(View, { style: { width: 44, height: 44 } })] })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, contentContainerStyle: Styles.scrollContent }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.videoContainer, onPress: handleVideoPress, activeOpacity: 0.9 }, { children: isPlaying ? (_jsxs(_Fragment, { children: [isLoading && (_jsx(View, Object.assign({ style: [StyleSheet.absoluteFill, { zIndex: 1 }] }, { children: _jsx(ShimmerEffect, { width: "100%", height: "100%", borderRadius: 10 }) }))), _jsx(Video, { source: { uri: videoData.videoUri, type: 'm3u8' }, style: Styles.videoPlayer, controls: true, resizeMode: "cover", repeat: false, paused: false, poster: videoPoster, posterResizeMode: "cover", ignoreSilentSwitch: "ignore", onLoad: () => setIsLoading(false), onError: () => setIsLoading(false) })] })) : (_jsxs(_Fragment, { children: [_jsx(FastImage, { source: videoData.thumbnail, style: Styles.videoPlayer, resizeMode: "cover" }), _jsx(View, Object.assign({ style: Styles.playButtonOverlay }, { children: _jsx(Icons.PlayCricle, { height: 34, width: 34 }) }))] })) })), _jsxs(View, Object.assign({ style: Styles.videoInfo }, { children: [_jsxs(View, Object.assign({ style: Styles.videoInfoRow }, { children: [_jsx(Text, Object.assign({ style: Styles.videoTitle }, { children: videoData.title })), _jsxs(View, Object.assign({ style: Styles.locationContainer }, { children: [_jsx(Location, { size: 16, color: colors.subTextColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: Styles.locationText }, { children: videoData.location }))] }))] })), _jsxs(View, Object.assign({ style: Styles.videoInfoRow }, { children: [_jsxs(View, Object.assign({ style: Styles.durationContainer }, { children: [_jsx(Clock, { size: 16, color: colors.subTextColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: Styles.durationText }, { children: videoData.duration }))] })), _jsxs(View, Object.assign({ style: Styles.dateContainer }, { children: [_jsx(Calendar, { size: 16, color: colors.subTextColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: Styles.dateText }, { children: videoData.date }))] }))] }))] })), _jsx(Text, Object.assign({ style: Styles.sectionTitle }, { children: t('Request for edits') })), _jsx(SizeBox, { height: 16 }), _jsxs(View, Object.assign({ style: Styles.emptyStateContainer }, { children: [_jsx(Icons.FileEmptyColorful, { height: 147, width: 143 }), _jsx(SizeBox, { height: 16 }), _jsx(Text, Object.assign({ style: Styles.emptyStateText }, { children: t('No edit request found') }))] })), _jsx(SizeBox, { height: 40 })] }))] })));
};
export default VideoEditRequestsScreen;
