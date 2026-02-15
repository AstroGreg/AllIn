import React, { useCallback, useState } from 'react';
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
import { getProfileCollectionByType, type ProfileCollectionItem } from '../../services/apiGateway';
import { getApiBaseUrl } from '../../constants/RuntimeConfig';
import { useTranslation } from 'react-i18next'

const ViewUserCollectionsPhotosScreen = ({ navigation, route }: any) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { apiAccessToken } = useAuth();
    const initialTab = route?.params?.initialTab === 'videos' ? 'videos' : 'photos';
    const [activeTab, setActiveTab] = useState<'photos' | 'videos'>(initialTab);
    const [photoItems, setPhotoItems] = useState<ProfileCollectionItem[]>([]);
    const [videoItems, setVideoItems] = useState<ProfileCollectionItem[]>([]);

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

    const toAbsoluteUrl = useCallback((value?: string | null) => {
        if (!value) return null;
        const raw = String(value);
        if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
        const base = getApiBaseUrl();
        if (!base) return raw;
        return `${base.replace(/\/$/, '')}/${raw.replace(/^\//, '')}`;
    }, []);

    const withAccessToken = useCallback((value?: string | null) => {
        if (!value) return undefined;
        if (!apiAccessToken) return value;
        if (isSignedUrl(value)) return value;
        if (value.includes('access_token=')) return value;
        const sep = value.includes('?') ? '&' : '?';
        return `${value}${sep}access_token=${encodeURIComponent(apiAccessToken)}`;
    }, [apiAccessToken, isSignedUrl]);

    const resolveThumbUrl = useCallback((media: ProfileCollectionItem) => {
        const thumbCandidate =
            media.thumbnail_url || media.preview_url || media.full_url || media.raw_url || media.original_url || null;
        const resolved = thumbCandidate ? toAbsoluteUrl(String(thumbCandidate)) : null;
        return withAccessToken(resolved) || resolved;
    }, [toAbsoluteUrl, withAccessToken]);

    const resolveMediaUrl = useCallback((media: ProfileCollectionItem) => {
        const candidate =
            media.preview_url || media.full_url || media.original_url || media.raw_url || null;
        const resolved = candidate ? toAbsoluteUrl(String(candidate)) : null;
        return withAccessToken(resolved) || resolved;
    }, [toAbsoluteUrl, withAccessToken]);

    const loadCollections = useCallback(async () => {
        if (!apiAccessToken) {
            setPhotoItems([]);
            setVideoItems([]);
            return;
        }
        try {
            const [photos, videos] = await Promise.all([
                getProfileCollectionByType(apiAccessToken, 'image'),
                getProfileCollectionByType(apiAccessToken, 'video'),
            ]);
            setPhotoItems(Array.isArray(photos?.items) ? photos.items : []);
            setVideoItems(Array.isArray(videos?.items) ? videos.items : []);
        } catch {
            setPhotoItems([]);
            setVideoItems([]);
        }
    }, [apiAccessToken]);

    useFocusEffect(
        useCallback(() => {
            loadCollections();
        }, [loadCollections]),
    );

    const renderVideoCard = (video: ProfileCollectionItem) => {
        const thumb = resolveThumbUrl(video);
        const mediaUrl = resolveMediaUrl(video);
        return (
        <TouchableOpacity
            key={video.media_id}
            style={Styles.videoCard}
            onPress={() => navigation.navigate('VideoPlayingScreen', {
                video: {
                    media_id: video.media_id,
                    title: t('Video'),
                    thumbnail: thumb ? { uri: String(thumb) } : undefined,
                    uri: mediaUrl ?? '',
                }
            })}
        >
            <View style={Styles.thumbnailContainer}>
                {thumb ? (
                    <FastImage source={{ uri: String(thumb) }} style={Styles.thumbnail} resizeMode="cover" />
                ) : (
                    <View style={[Styles.thumbnail, { backgroundColor: colors.btnBackgroundColor }]} />
                )}
                <View style={Styles.playIconContainer}>
                    <Icons.PlayCricle width={26} height={26} />
                </View>
            </View>
            <Text style={Styles.videoTitle}>{t('Video')}</Text>
            <View style={Styles.videoMeta}>
                <View style={Styles.metaItem}>
                    <User size={14} color={colors.subTextColor} variant="Linear" />
                    <Text style={Styles.metaText}>{t('uploaded')}</Text>
                </View>
                <View style={Styles.metaItem}>
                    <Clock size={14} color={colors.subTextColor} variant="Linear" />
                    <Text style={Styles.metaText}>{video.created_at ? String(video.created_at).slice(0, 10) : ''}</Text>
                </View>
            </View>
        </TouchableOpacity>
        );
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{t('Collections')}</Text>
                <View style={[Styles.headerButton, { opacity: 0 }]} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {/* Section Header */}
                <View style={Styles.sectionHeader}>
                    <Text style={Styles.sectionTitle}>{t('Collections')}</Text>
                    <View style={Styles.photosCountBadge}>
                        <Text style={Styles.photosCountText}>
                            {activeTab === 'photos'
                                ? `${photoItems.length} ${t('Photos')}`
                                : `${videoItems.length} ${t('Videos')}`}
                        </Text>
                    </View>
                </View>

                <SizeBox height={16} />

                {/* Toggle */}
                <View style={Styles.toggleContainer}>
                    <TouchableOpacity
                        style={[Styles.toggleButton, activeTab === 'photos' && Styles.toggleButtonActive]}
                        onPress={() => setActiveTab('photos')}
                    >
                        <Text style={activeTab === 'photos' ? Styles.toggleTextActive : Styles.toggleText}>{t('Photos')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[Styles.toggleButton, activeTab === 'videos' && Styles.toggleButtonActive]}
                        onPress={() => setActiveTab('videos')}
                    >
                        <Text style={activeTab === 'videos' ? Styles.toggleTextActive : Styles.toggleText}>{t('Videos')}</Text>
                    </TouchableOpacity>
                </View>

                <SizeBox height={16} />

                {/* Content Grid */}
                {activeTab === 'photos' ? (
                    <View style={Styles.photosCard}>
                        <View style={Styles.photosGrid}>
                            {photoItems.map((photo) => {
                                const thumb = resolveThumbUrl(photo);
                                return (
                                <Pressable
                                    key={String(photo.media_id)}
                                    onPress={() => navigation.navigate('PhotoDetailScreen', {
                                        eventTitle: t('Collections'),
                                        media: {
                                            id: photo.media_id,
                                            type: photo.type,
                                        },
                                    })}
                                >
                                    {thumb ? (
                                        <FastImage
                                            source={{ uri: String(thumb) }}
                                            style={Styles.photoImage}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View style={[Styles.photoImage, { backgroundColor: colors.btnBackgroundColor }]} />
                                    )}
                                </Pressable>
                                );
                            })}
                        </View>
                    </View>
                ) : (
                    <View style={Styles.videosGrid}>
                        {videoItems.map(renderVideoCard)}
                    </View>
                )}

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    );
};

export default ViewUserCollectionsPhotosScreen;
