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
import { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { ArrowLeft2, User, Clock } from 'iconsax-react-nativejs';
import { createStyles } from './ViewUserCollectionsPhotosScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Icons from '../../constants/Icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { getProfileCollectionByType } from '../../services/apiGateway';
import { getApiBaseUrl } from '../../constants/RuntimeConfig';
import { useTranslation } from 'react-i18next';
const ViewUserCollectionsPhotosScreen = ({ navigation, route }) => {
    var _a;
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { apiAccessToken } = useAuth();
    const initialTab = ((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.initialTab) === 'videos' ? 'videos' : 'photos';
    const [activeTab, setActiveTab] = useState(initialTab);
    const [photoItems, setPhotoItems] = useState([]);
    const [videoItems, setVideoItems] = useState([]);
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
    const resolveThumbUrl = useCallback((media) => {
        const thumbCandidate = media.thumbnail_url || media.preview_url || media.full_url || media.raw_url || media.original_url || null;
        const resolved = thumbCandidate ? toAbsoluteUrl(String(thumbCandidate)) : null;
        return withAccessToken(resolved) || resolved;
    }, [toAbsoluteUrl, withAccessToken]);
    const resolveMediaUrl = useCallback((media) => {
        const candidate = media.preview_url || media.full_url || media.original_url || media.raw_url || null;
        const resolved = candidate ? toAbsoluteUrl(String(candidate)) : null;
        return withAccessToken(resolved) || resolved;
    }, [toAbsoluteUrl, withAccessToken]);
    const loadCollections = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        if (!apiAccessToken) {
            setPhotoItems([]);
            setVideoItems([]);
            return;
        }
        try {
            const [photos, videos] = yield Promise.all([
                getProfileCollectionByType(apiAccessToken, 'image', { include_original: false }),
                getProfileCollectionByType(apiAccessToken, 'video', { include_original: false }),
            ]);
            setPhotoItems(Array.isArray(photos === null || photos === void 0 ? void 0 : photos.items) ? photos.items : []);
            setVideoItems(Array.isArray(videos === null || videos === void 0 ? void 0 : videos.items) ? videos.items : []);
        }
        catch (_b) {
            setPhotoItems([]);
            setVideoItems([]);
        }
    }), [apiAccessToken]);
    useFocusEffect(useCallback(() => {
        loadCollections();
    }, [loadCollections]));
    const renderVideoCard = (video) => {
        const thumb = resolveThumbUrl(video);
        const mediaUrl = resolveMediaUrl(video);
        return (_jsxs(TouchableOpacity, Object.assign({ style: Styles.videoCard, onPress: () => navigation.navigate('VideoPlayingScreen', {
                video: {
                    media_id: video.media_id,
                    title: t('Video'),
                    thumbnail: thumb ? { uri: String(thumb) } : undefined,
                    uri: mediaUrl !== null && mediaUrl !== void 0 ? mediaUrl : '',
                }
            }) }, { children: [_jsxs(View, Object.assign({ style: Styles.thumbnailContainer }, { children: [thumb ? (_jsx(FastImage, { source: { uri: String(thumb) }, style: Styles.thumbnail, resizeMode: "cover" })) : (_jsx(View, { style: [Styles.thumbnail, { backgroundColor: colors.btnBackgroundColor }] })), _jsx(View, Object.assign({ style: Styles.playIconContainer }, { children: _jsx(Icons.PlayCricle, { width: 26, height: 26 }) }))] })), _jsx(Text, Object.assign({ style: Styles.videoTitle }, { children: t('Video') })), _jsxs(View, Object.assign({ style: Styles.videoMeta }, { children: [_jsxs(View, Object.assign({ style: Styles.metaItem }, { children: [_jsx(User, { size: 14, color: colors.subTextColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: Styles.metaText }, { children: t('uploaded') }))] })), _jsxs(View, Object.assign({ style: Styles.metaItem }, { children: [_jsx(Clock, { size: 14, color: colors.subTextColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: Styles.metaText }, { children: video.created_at ? String(video.created_at).slice(0, 10) : '' }))] }))] }))] }), video.media_id));
    };
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.mainTextColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('Collections') })), _jsx(View, { style: [Styles.headerButton, { opacity: 0 }] })] })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, contentContainerStyle: Styles.scrollContent }, { children: [_jsxs(View, Object.assign({ style: Styles.sectionHeader }, { children: [_jsx(Text, Object.assign({ style: Styles.sectionTitle }, { children: t('Collections') })), _jsx(View, Object.assign({ style: Styles.photosCountBadge }, { children: _jsx(Text, Object.assign({ style: Styles.photosCountText }, { children: activeTab === 'photos'
                                        ? `${photoItems.length} ${t('Photos')}`
                                        : `${videoItems.length} ${t('Videos')}` })) }))] })), _jsx(SizeBox, { height: 16 }), _jsxs(View, Object.assign({ style: Styles.toggleContainer }, { children: [_jsx(TouchableOpacity, Object.assign({ style: [Styles.toggleButton, activeTab === 'photos' && Styles.toggleButtonActive], onPress: () => setActiveTab('photos') }, { children: _jsx(Text, Object.assign({ style: activeTab === 'photos' ? Styles.toggleTextActive : Styles.toggleText }, { children: t('Photos') })) })), _jsx(TouchableOpacity, Object.assign({ style: [Styles.toggleButton, activeTab === 'videos' && Styles.toggleButtonActive], onPress: () => setActiveTab('videos') }, { children: _jsx(Text, Object.assign({ style: activeTab === 'videos' ? Styles.toggleTextActive : Styles.toggleText }, { children: t('Videos') })) }))] })), _jsx(SizeBox, { height: 16 }), activeTab === 'photos' ? (_jsx(View, Object.assign({ style: Styles.photosCard }, { children: _jsx(View, Object.assign({ style: Styles.photosGrid }, { children: photoItems.map((photo) => {
                                const thumb = resolveThumbUrl(photo);
                                return (_jsx(Pressable, Object.assign({ onPress: () => navigation.navigate('PhotoDetailScreen', {
                                        eventTitle: t('Collections'),
                                        media: {
                                            id: photo.media_id,
                                            type: photo.type,
                                        },
                                    }) }, { children: thumb ? (_jsx(FastImage, { source: { uri: String(thumb) }, style: Styles.photoImage, resizeMode: "cover" })) : (_jsx(View, { style: [Styles.photoImage, { backgroundColor: colors.btnBackgroundColor }] })) }), String(photo.media_id)));
                            }) })) }))) : (_jsx(View, Object.assign({ style: Styles.videosGrid }, { children: videoItems.map(renderVideoCard) }))), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] }))] })));
};
export default ViewUserCollectionsPhotosScreen;
