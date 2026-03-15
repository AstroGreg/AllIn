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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
import { createStyles } from './PhotosScreenStyles';
import SizeBox from '../../constants/SizeBox';
import { useAuth } from '../../context/AuthContext';
import { getMediaById } from '../../services/apiGateway';
import { getApiBaseUrl } from '../../constants/RuntimeConfig';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const PhotosScreen = ({ navigation, route }) => {
    var _a;
    const insets = useSafeAreaInsets();
    const { apiAccessToken } = useAuth();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const Styles = createStyles(colors);
    const eventTitle = ((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.eventTitle) || t('BK Studentent 23');
    const photoIds = useMemo(() => [
        '87873d40-addf-4289-aa82-7cd300acdd94',
        '4ac31817-e954-4d22-934d-27f82ddf5163',
        '4fed0d64-9fd4-42c4-bf24-875aad683c6d',
    ], []);
    const [photoMap, setPhotoMap] = useState({});
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
    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken)
            return () => { };
        Promise.all(photoIds.map((id) => __awaiter(void 0, void 0, void 0, function* () {
            const media = yield getMediaById(apiAccessToken, id);
            const thumbCandidate = media.thumbnail_url || media.preview_url || media.full_url || media.raw_url || null;
            const resolvedThumb = thumbCandidate ? toAbsoluteUrl(String(thumbCandidate)) : null;
            return [id, withAccessToken(resolvedThumb) || resolvedThumb];
        })))
            .then((entries) => {
            if (!mounted)
                return;
            const map = {};
            entries.forEach(([id, url]) => {
                if (url)
                    map[id] = url;
            });
            setPhotoMap(map);
        })
            .catch(() => { });
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, photoIds, toAbsoluteUrl, withAccessToken]);
    const photos = useMemo(() => {
        var _a, _b, _c;
        return ([
            {
                id: photoIds[0],
                title: `${eventTitle} ${t('Photo')} 1`,
                date: '27/05/2025',
                thumbnail: (_a = photoMap[photoIds[0]]) !== null && _a !== void 0 ? _a : '',
            },
            {
                id: photoIds[1],
                title: `${eventTitle} ${t('Photo')} 2`,
                date: '27/05/2025',
                thumbnail: (_b = photoMap[photoIds[1]]) !== null && _b !== void 0 ? _b : '',
            },
            {
                id: photoIds[2],
                title: `${eventTitle} ${t('Photo')} 3`,
                date: '27/05/2025',
                thumbnail: (_c = photoMap[photoIds[2]]) !== null && _c !== void 0 ? _c : '',
            },
        ]);
    }, [eventTitle, photoIds, photoMap, t]);
    const renderPhotoCard = (photo) => (_jsxs(TouchableOpacity, Object.assign({ style: Styles.mediaCard, activeOpacity: 0.85, onPress: () => navigation.navigate('PhotoDetailScreen', {
            eventTitle,
            media: {
                id: photo.id,
                type: 'image',
                title: photo.title,
                thumbnailUrl: photo.thumbnail,
                previewUrl: photo.thumbnail,
                originalUrl: photo.thumbnail,
                fullUrl: photo.thumbnail,
            },
        }) }, { children: [photo.thumbnail ? (_jsx(FastImage, { source: { uri: photo.thumbnail }, style: Styles.mediaThumbnail, resizeMode: "cover" })) : (_jsx(View, { style: Styles.mediaThumbnailPlaceholder })), _jsxs(View, Object.assign({ style: Styles.mediaInfo }, { children: [_jsx(Text, Object.assign({ style: Styles.mediaTitle, numberOfLines: 2 }, { children: photo.title })), _jsx(Text, Object.assign({ style: Styles.mediaMeta }, { children: photo.date }))] }))] }), photo.id));
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.backButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.mainTextColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: eventTitle })), _jsx(View, { style: Styles.headerSpacer })] })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, contentContainerStyle: Styles.scrollContent }, { children: [photos.map(renderPhotoCard), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] }))] })));
};
export default PhotosScreen;
