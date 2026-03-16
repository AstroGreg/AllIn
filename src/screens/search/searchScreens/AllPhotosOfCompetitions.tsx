import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, StyleSheet, useWindowDimensions } from 'react-native'
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import SizeBox from '../../../constants/SizeBox'
import { createStyles } from '../SearchStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomHeader from '../../../components/customHeader/CustomHeader';
import { useAuth } from '../../../context/AuthContext';
import { getCompetitionPublicMedia, getHubAppearanceMedia, type MediaViewAllItem } from '../../../services/apiGateway';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const PAGE_SIZE = 60;

const AllPhotosOfEvents = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const eventName = route?.params?.eventName || 'Event';
    const eventId = route?.params?.eventId;
    const competitionId = route?.params?.competitionId;
    const appearanceOnly = Boolean(route?.params?.appearanceOnly);
    const disciplineId = route?.params?.disciplineId;
    const checkpointId = route?.params?.checkpointId ?? route?.params?.checkpoint?.id;
    const categoryLabel = route?.params?.categoryLabel;
    const routeCategoryLabels = route?.params?.categoryLabels;
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
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const itemCountRef = useRef(0);
    const targetCompetitionId = competitionId ?? eventId;
    const activeCategoryLabels = useMemo(() => {
        const routeLabels = Array.isArray(routeCategoryLabels) ? routeCategoryLabels : [];
        const raw = routeLabels.length > 0 ? routeLabels : (categoryLabel ? [categoryLabel] : []);
        return raw
            .map((value) => String(value ?? '').trim())
            .filter(Boolean);
    }, [categoryLabel, routeCategoryLabels]);
    const shouldUseAppearanceFeed = appearanceOnly
        && !disciplineId
        && !checkpointId
        && activeCategoryLabels.length === 0;
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

    const mergeItems = useCallback((current: MediaViewAllItem[], incoming: MediaViewAllItem[]) => {
        const seen = new Set<string>();
        return [...current, ...incoming].filter((item) => {
            const key = String(item?.media_id ?? '');
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, []);

    useEffect(() => {
        itemCountRef.current = items.length;
    }, [items.length]);

    const loadPage = useCallback(async (offset: number, append: boolean) => {
        if (!apiAccessToken) return;
        if (append) {
            setIsFetchingMore(true);
        } else if (offset === 0 && itemCountRef.current > 0) {
            setIsRefreshing(true);
        } else {
            setIsLoading(true);
        }
        try {
            let list: MediaViewAllItem[] = [];
            if (shouldUseAppearanceFeed && (eventId || competitionId)) {
                const res = await getHubAppearanceMedia(apiAccessToken, String(eventId ?? competitionId), {
                    include_original: false,
                    limit: PAGE_SIZE,
                    offset,
                });
                list = Array.isArray(res?.results) ? res.results : [];
            } else if (targetCompetitionId) {
                const res = await getCompetitionPublicMedia(apiAccessToken, String(targetCompetitionId), {
                    type: 'image',
                    discipline_id: disciplineId ? String(disciplineId) : undefined,
                    checkpoint_id: checkpointId ? String(checkpointId) : undefined,
                    category_labels: activeCategoryLabels.length > 0 ? activeCategoryLabels : undefined,
                    limit: PAGE_SIZE,
                    offset,
                    include_original: false,
                });
                list = Array.isArray(res) ? res : [];
            }
            const filtered = list.filter((item) => !isVideoMedia(item));
            setItems((prev) => append ? mergeItems(prev, filtered) : filtered);
            setHasMore(filtered.length === PAGE_SIZE);
        } catch {
            if (!append) {
                setItems([]);
                setHasMore(false);
            }
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
            setIsFetchingMore(false);
        }
    }, [activeCategoryLabels, apiAccessToken, checkpointId, competitionId, disciplineId, eventId, isVideoMedia, mergeItems, shouldUseAppearanceFeed, targetCompetitionId]);

    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken) return () => {};
        const load = async () => {
            try {
                await loadPage(0, false);
            } finally {
                if (!mounted) return;
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, loadPage]);

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
        <View style={styles.mainContainer} testID="all-photos-events-screen">
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
                onRefresh={() => loadPage(0, false)}
                refreshing={isRefreshing}
                onEndReachedThreshold={0.35}
                onEndReached={() => {
                    if (isLoading || isRefreshing || isFetchingMore || !hasMore) return;
                    loadPage(items.length, true);
                }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        activeOpacity={0.9}
                        style={[localStyles.mediaTile, { width: tileWidth }]}
                        testID={`competition-photo-card-${item.id}`}
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
                            {(categoryLabel || activeCategoryLabels.length > 0) && (
                                <Text style={localStyles.subtitle}>
                                    {[categoryLabel || (activeCategoryLabels.length ? activeCategoryLabels.join(', ') : null)].filter(Boolean).join(' • ')}
                                </Text>
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
                ListFooterComponent={
                    isFetchingMore ? (
                        <View style={{ paddingVertical: 16 }}>
                            <ActivityIndicator color={colors.primaryColor} />
                        </View>
                    ) : null
                }
            />
        </View>
    )
}

export default AllPhotosOfEvents
