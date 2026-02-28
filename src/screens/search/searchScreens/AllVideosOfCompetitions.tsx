import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, StyleSheet } from 'react-native'
import React, { useMemo, useEffect, useState, useCallback } from 'react'
import { createStyles } from '../SearchStyles'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import CustomHeader from '../../../components/customHeader/CustomHeader'
import Icons from '../../../constants/Icons'
import { useAuth } from '../../../context/AuthContext'
import { getCompetitionPublicMedia, getHubAppearanceMedia, type MediaViewAllItem } from '../../../services/apiGateway'
import { getHlsBaseUrl } from '../../../constants/RuntimeConfig'
import Images from '../../../constants/Images'
import { useTheme } from '../../../context/ThemeContext'
import { useTranslation } from 'react-i18next'

const AllVideosOfEvents = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
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
        listWrap: {
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 20,
        },
        videoCard: {
            borderRadius: 14,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: colors.borderColor,
            backgroundColor: colors.cardBackground,
            marginBottom: 14,
        },
        thumbWrap: {
            width: '100%',
            height: 196,
            backgroundColor: colors.secondaryColor,
            justifyContent: 'center',
            alignItems: 'center',
        },
        thumb: {
            width: '100%',
            height: '100%',
        },
        playOverlay: {
            position: 'absolute',
            width: 54,
            height: 54,
            borderRadius: 27,
            backgroundColor: 'rgba(0,0,0,0.38)',
            alignItems: 'center',
            justifyContent: 'center',
        },
        cardBody: {
            paddingHorizontal: 14,
            paddingVertical: 12,
        },
        titleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
        },
        videoTitle: {
            ...styles.titleText,
            fontSize: 16,
            flex: 1,
        },
        metaChip: {
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 999,
            backgroundColor: colors.secondaryBlueColor,
            borderWidth: 0.5,
            borderColor: colors.primaryColor,
        },
        metaChipText: {
            ...styles.subText,
            color: colors.primaryColor,
            fontSize: 11,
        },
        infoRow: {
            marginTop: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
        },
        infoText: {
            ...styles.subText,
            color: colors.subTextColor,
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
    }), [colors, styles.filterText, styles.subText, styles.titleText]);

    const [items, setItems] = useState<MediaViewAllItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const targetCompetitionId = competitionId ?? eventId;
    const helperCopy = useMemo(() => {
        if (checkpointId) return t('Shows videos tagged to this checkpoint.');
        if (disciplineId) return t('Shows videos tagged to this discipline.');
        return t('Includes all competition videos, including untagged uploads.');
    }, [checkpointId, disciplineId, t]);
    const emptyCopy = useMemo(() => {
        if (checkpointId) return t('No videos found for this checkpoint yet.');
        if (disciplineId) return t('No videos found for this discipline yet.');
        return t('No videos found for this competition yet.');
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

    const toHlsUrl = useCallback((value?: string | null) => {
        if (!value) return null;
        const raw = String(value);
        if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
        const base = getHlsBaseUrl();
        if (!base) return raw;
        return `${base.replace(/\/$/, '')}/${raw.replace(/^\//, '')}`;
    }, []);

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

    const formatDuration = (value?: string) => {
        const totalSeconds = Number.parseInt(String(value ?? '0'), 10);
        if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return '—';
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const paddedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
        if (hours > 0) {
            const paddedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
            return `${hours}:${paddedMinutes}:${paddedSeconds}`;
        }
        return `${minutes}:${paddedSeconds}`;
    };

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
                        type: 'video',
                        discipline_id: disciplineId ? String(disciplineId) : undefined,
                        checkpoint_id: checkpointId ? String(checkpointId) : undefined,
                        limit: 500,
                    });
                    list = Array.isArray(res) ? res : [];
                } else {
                    list = [];
                }
                if (!mounted) return;
                const filtered = list.filter((item) => isVideoMedia(item));
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
            const thumbCandidate = item.thumbnail_url || item.preview_url || item.full_url || item.raw_url || null;
            const resolvedThumb = withAccessToken(thumbCandidate) || thumbCandidate || '';
            const hls = item.hls_manifest_path ? toHlsUrl(item.hls_manifest_path) : null;
            const candidates = [item.full_url, item.original_url, item.raw_url, item.preview_url]
                .filter(Boolean)
                .map((value) => String(value));
            const mp4 = candidates.find((value) => /\.(mp4|mov|m4v)(\?|$)/i.test(value));
            const resolvedVideo = hls || mp4 || candidates[0] || null;
            return {
                id: item.media_id,
                videoUri: withAccessToken(resolvedVideo) || resolvedVideo,
                thumbnailUrl: resolvedThumb,
                uploadedAt: item.created_at ?? '',
                timer: String(
                    (item.assets || []).find((asset) => Number(asset.duration_seconds) > 0)?.duration_seconds ?? ''
                ),
                media: item,
            };
        });
    }, [items, toHlsUrl, withAccessToken]);

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />
            <CustomHeader title={t('All Videos')} onBackPress={() => navigation.goBack()} isSetting={false} />

            <FlatList
                data={data}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={[
                    localStyles.listWrap,
                    { paddingBottom: insets.bottom > 0 ? insets.bottom + 30 : 30 },
                ]}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        activeOpacity={0.9}
                        style={localStyles.videoCard}
                        onPress={() => navigation.navigate('VideoPlayingScreen', {
                            mediaId: item.media.media_id,
                            video: {
                                title: eventName,
                                thumbnail: item.thumbnailUrl ? { uri: item.thumbnailUrl } : Images.photo7,
                                uri: item.videoUri ?? '',
                            },
                        })}
                    >
                        <View style={localStyles.thumbWrap}>
                            <Image source={item.thumbnailUrl ? { uri: item.thumbnailUrl } : Images.photo7} style={localStyles.thumb} resizeMode="cover" />
                            <View style={localStyles.playOverlay}>
                                <Icons.PlayCricle width={34} height={34} />
                            </View>
                        </View>
                        <View style={localStyles.cardBody}>
                            <View style={localStyles.titleRow}>
                                <Text style={localStyles.videoTitle} numberOfLines={1}>{eventName}</Text>
                                <View style={localStyles.metaChip}>
                                    <Text style={localStyles.metaChipText}>{formatDuration(item.timer)}</Text>
                                </View>
                            </View>
                            <View style={localStyles.infoRow}>
                                <Text style={localStyles.infoText} numberOfLines={1}>
                                    {Number(item.media.views_count ?? 0)} {t('views')}
                                </Text>
                                <Text style={localStyles.infoText} numberOfLines={1}>
                                    {t('Uploaded')} {formatDate(item.uploadedAt)}
                                </Text>
                            </View>
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
                                <Text style={styles.subText}>{t('Loading videos...')}</Text>
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

export default AllVideosOfEvents
