import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, StyleSheet, useWindowDimensions } from 'react-native'
import React, { useEffect, useState, useCallback, useMemo } from 'react'
import SizeBox from '../../../constants/SizeBox'
import { createStyles } from '../SearchStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomHeader from '../../../components/customHeader/CustomHeader';
import { useAuth } from '../../../context/AuthContext';
import { getCompetitionPublicMedia, getHubAppearanceMedia, type MediaViewAllItem } from '../../../services/apiGateway';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const AllPhotosOfEvents = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const eventName = route?.params?.eventName || 'Event';
    const eventId = route?.params?.eventId;
    const competitionId = route?.params?.competitionId;
    const appearanceOnly = Boolean(route?.params?.appearanceOnly);
    const disciplineId = route?.params?.disciplineId;
    const checkpointId = route?.params?.checkpointId ?? route?.params?.checkpoint?.id;
    const division = route?.params?.division;
    const gender = route?.params?.gender;
    const { apiAccessToken } = useAuth();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const localStyles = useMemo(() => StyleSheet.create({
        gridWrap: {
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 20,
        },
        columnWrap: {
            justifyContent: 'space-between',
            marginBottom: 12,
        },
        mediaTile: {
            borderRadius: 14,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: colors.borderColor,
            backgroundColor: colors.cardBackground,
        },
        mediaImage: {
            width: '100%',
        },
        mediaFallback: {
            width: '100%',
            backgroundColor: colors.secondaryColor,
        },
        mediaMeta: {
            paddingHorizontal: 10,
            paddingVertical: 10,
            borderTopWidth: 1,
            borderTopColor: colors.lightGrayColor,
        },
        mediaMetaPrimary: {
            ...styles.subText,
            color: colors.mainTextColor,
        },
        mediaMetaSecondary: {
            ...styles.subText,
            color: colors.subTextColor,
            marginTop: 4,
        },
        headerWrap: {
            marginBottom: 16,
        },
        subtitle: {
            ...styles.filterText,
            marginTop: 6,
        },
        helper: {
            ...styles.subText,
            marginTop: 6,
            color: colors.subTextColor,
        },
        emptyBox: {
            borderRadius: 12,
            borderWidth: 0.5,
            borderColor: colors.lightGrayColor,
            backgroundColor: colors.cardBackground,
            paddingVertical: 24,
            paddingHorizontal: 16,
            alignItems: 'center',
            justifyContent: 'center',
        },
    }), [colors, styles.filterText, styles.subText]);

    const [items, setItems] = useState<MediaViewAllItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const targetCompetitionId = competitionId ?? eventId;
    const tileWidth = useMemo(() => Math.max(140, Math.floor((width - 52) / 2)), [width]);
    const tileHeight = useMemo(() => Math.round(tileWidth * 1.15), [tileWidth]);
    const helperCopy = useMemo(() => {
        if (checkpointId) return t('Shows photos tagged to this checkpoint.');
        if (disciplineId) return t('Shows photos tagged to this discipline.');
        return t('Includes all competition photos, including untagged uploads.');
    }, [checkpointId, disciplineId, t]);
    const emptyCopy = useMemo(() => {
        if (checkpointId) return t('No photos found for this checkpoint yet.');
        if (disciplineId) return t('No photos found for this discipline yet.');
        return t('No photos found for this competition yet.');
    }, [checkpointId, disciplineId, t]);

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

    const isVideoMedia = useCallback((item: MediaViewAllItem) => {
        const mediaType = String(item?.type ?? '').toLowerCase();
        if (mediaType === 'video') return true;
        if (mediaType === 'image' || mediaType === 'photo') return false;
        if (item?.hls_manifest_path) return true;
        const hasVideoMime = Array.isArray(item?.assets)
            && item.assets.some((asset) => String(asset?.mime_type ?? '').toLowerCase().startsWith('video/'));
        if (hasVideoMime) return true;
        const candidates = [item?.full_url, item?.original_url, item?.raw_url, item?.preview_url]
            .filter(Boolean)
            .map((value) => String(value));
        return candidates.some((value) => /\.(mp4|mov|m4v|webm|m3u8)(\?|$)/i.test(value));
    }, []);

    const formatDate = (value?: string) => {
        if (!value) return '—';
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return value;
        return parsed.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken) return () => {};
        const load = async () => {
            setIsLoading(true);
            try {
                let list: MediaViewAllItem[] = [];
                if (appearanceOnly && (eventId || competitionId)) {
                    const res = await getHubAppearanceMedia(apiAccessToken, String(eventId ?? competitionId));
                    list = Array.isArray(res?.results) ? res.results : [];
                } else if (targetCompetitionId) {
                    const res = await getCompetitionPublicMedia(apiAccessToken, String(targetCompetitionId), {
                        type: 'image',
                        discipline_id: disciplineId ? String(disciplineId) : undefined,
                        checkpoint_id: checkpointId ? String(checkpointId) : undefined,
                        limit: 500,
                    });
                    list = Array.isArray(res) ? res : [];
                } else {
                    list = [];
                }
                if (!mounted) return;
                const filtered = list.filter((item) => !isVideoMedia(item));
                setItems(filtered);
            } catch {
                if (!mounted) return;
                setItems([]);
            } finally {
                if (mounted) setIsLoading(false);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, appearanceOnly, checkpointId, competitionId, disciplineId, eventId, isVideoMedia, targetCompetitionId]);

    const data = useMemo(() => {
        return items.map((item) => {
            const candidate = item.thumbnail_url || item.preview_url || item.full_url || item.raw_url || null;
            return {
                id: item.media_id,
                photoUrl: withAccessToken(candidate) || candidate || '',
                uploadedAt: item.created_at ?? '',
                likes: Number(item.likes_count ?? 0),
                views: Number(item.views_count ?? 0),
                media: item,
            };
        });
    }, [items, withAccessToken]);

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />
            <CustomHeader title={t('All Photos')} onBackPress={() => navigation.goBack()} isSetting={false} />

            <FlatList
                data={data}
                numColumns={2}
                keyExtractor={(item) => String(item.id)}
                columnWrapperStyle={localStyles.columnWrap}
                contentContainerStyle={[
                    localStyles.gridWrap,
                    { paddingBottom: insets.bottom > 0 ? insets.bottom + 30 : 30 },
                ]}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        activeOpacity={0.9}
                        style={[localStyles.mediaTile, { width: tileWidth }]}
                        onPress={() => navigation.navigate('PhotoDetailScreen', {
                            eventTitle: eventName,
                            media: {
                                id: item.media.media_id,
                                type: item.media.type,
                                eventId: item.media.event_id,
                                thumbnailUrl: item.media.thumbnail_url,
                                previewUrl: item.media.preview_url,
                                originalUrl: item.media.original_url,
                                fullUrl: item.media.full_url,
                                rawUrl: item.media.raw_url,
                                hlsManifestPath: item.media.hls_manifest_path,
                            },
                        })}
                    >
                        {item.photoUrl ? (
                            <Image source={{ uri: item.photoUrl }} style={[localStyles.mediaImage, { height: tileHeight }]} resizeMode="cover" />
                        ) : (
                            <View style={[localStyles.mediaFallback, { height: tileHeight }]} />
                        )}
                        <View style={localStyles.mediaMeta}>
                            <Text style={localStyles.mediaMetaPrimary} numberOfLines={1}>
                                {item.likes} {t('likes')} • {item.views} {t('views')}
                            </Text>
                            <Text style={localStyles.mediaMetaSecondary} numberOfLines={1}>
                                {t('Uploaded')} {formatDate(item.uploadedAt)}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
                ListHeaderComponent={
                    <View style={localStyles.headerWrap}>
                        <Text style={styles.titleText}>{eventName}</Text>
                        {(division || gender) && (
                            <Text style={localStyles.subtitle}>{[division, gender].filter(Boolean).join(' • ')}</Text>
                        )}
                        <Text style={localStyles.helper}>{helperCopy}</Text>
                    </View>
                }
                ListEmptyComponent={
                    <View style={localStyles.emptyBox}>
                        {isLoading ? (
                            <>
                                <ActivityIndicator color={colors.primaryColor} />
                                <SizeBox height={10} />
                                <Text style={styles.subText}>{t('Loading photos...')}</Text>
                            </>
                        ) : (
                            <Text style={styles.subText}>{emptyCopy}</Text>
                        )}
                    </View>
                }
            />
        </View>
    )
}

export default AllPhotosOfEvents
