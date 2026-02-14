import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
import Styles from './PhotosScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Colors from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { getMediaById } from '../../services/apiGateway';
import { getApiBaseUrl } from '../../constants/RuntimeConfig';

const PhotosScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { apiAccessToken } = useAuth();
    const eventTitle = route?.params?.eventTitle || 'BK Studentent 23';
    const photoIds = useMemo(
        () => [
            '87873d40-addf-4289-aa82-7cd300acdd94',
            '4ac31817-e954-4d22-934d-27f82ddf5163',
            '4fed0d64-9fd4-42c4-bf24-875aad683c6d',
        ],
        [],
    );
    const [photoMap, setPhotoMap] = useState<Record<string, string>>({});

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

    const toAbsoluteUrl = useCallback((value?: string | null) => {
        if (!value) return null;
        const raw = String(value);
        if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
        const base = getApiBaseUrl();
        if (!base) return raw;
        return `${base.replace(/\/$/, '')}/${raw.replace(/^\//, '')}`;
    }, []);

    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken) return () => {};
        Promise.all(
            photoIds.map(async (id) => {
                const media = await getMediaById(apiAccessToken, id);
                const thumbCandidate =
                    media.thumbnail_url || media.preview_url || media.full_url || media.raw_url || null;
                const resolvedThumb = thumbCandidate ? toAbsoluteUrl(String(thumbCandidate)) : null;
                return [id, withAccessToken(resolvedThumb) || resolvedThumb] as const;
            }),
        )
            .then((entries) => {
                if (!mounted) return;
                const map: Record<string, string> = {};
                entries.forEach(([id, url]) => {
                    if (url) map[id] = url;
                });
                setPhotoMap(map);
            })
            .catch(() => {});
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, photoIds, toAbsoluteUrl, withAccessToken]);

    const photos = useMemo(
        () => ([
            {
                id: photoIds[0],
                title: `${eventTitle} Photo 1`,
                date: '27/05/2025',
                thumbnail: photoMap[photoIds[0]] ?? '',
            },
            {
                id: photoIds[1],
                title: `${eventTitle} Photo 2`,
                date: '27/05/2025',
                thumbnail: photoMap[photoIds[1]] ?? '',
            },
            {
                id: photoIds[2],
                title: `${eventTitle} Photo 3`,
                date: '27/05/2025',
                thumbnail: photoMap[photoIds[2]] ?? '',
            },
        ]),
        [eventTitle, photoIds, photoMap],
    );

    const renderPhotoCard = (photo: any) => (
        <TouchableOpacity
            key={photo.id}
            style={Styles.mediaCard}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('PhotoDetailScreen', {
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
            })}
        >
            {photo.thumbnail ? (
                <FastImage
                    source={{ uri: photo.thumbnail }}
                    style={Styles.mediaThumbnail}
                    resizeMode="cover"
                />
            ) : (
                <View style={Styles.mediaThumbnailPlaceholder} />
            )}
            <View style={Styles.mediaInfo}>
                <Text style={Styles.mediaTitle} numberOfLines={2}>{photo.title}</Text>
                <Text style={Styles.mediaMeta}>{photo.date}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={Colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{eventTitle}</Text>
                <View style={Styles.headerSpacer} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {photos.map(renderPhotoCard)}

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    );
};

export default PhotosScreen;
