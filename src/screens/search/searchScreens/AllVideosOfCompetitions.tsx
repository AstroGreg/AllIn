import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native'
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
    const division = route?.params?.division;
    const gender = route?.params?.gender;
    const { apiAccessToken } = useAuth();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const [items, setItems] = useState<MediaViewAllItem[]>([]);
    const targetCompetitionId = competitionId ?? eventId;

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
            try {
                let list: MediaViewAllItem[] = [];
                if (appearanceOnly && (eventId || competitionId)) {
                    const res = await getHubAppearanceMedia(apiAccessToken, String(eventId ?? competitionId));
                    list = Array.isArray(res?.results) ? res.results : [];
                } else if (targetCompetitionId) {
                    const res = await getCompetitionPublicMedia(apiAccessToken, String(targetCompetitionId), {type: 'video', limit: 500});
                    list = Array.isArray(res) ? res : [];
                } else {
                    list = [];
                }
                if (!mounted) return;
                const filtered = list.filter((item) => {
                    return String(item.type).toLowerCase() === 'video';
                });
                setItems(filtered);
            } catch {
                if (!mounted) return;
                setItems([]);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, appearanceOnly, competitionId, eventId, targetCompetitionId]);

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
                event: eventName,
                videoUri: withAccessToken(resolvedVideo) || resolvedVideo,
                thumbnailUrl: resolvedThumb,
                uploadedAt: item.created_at ?? '',
                timer: String(
                    (item.assets || []).find((asset) => Number(asset.duration_seconds) > 0)?.duration_seconds ?? ''
                ),
                media: item,
            };
        });
    }, [eventName, items, toHlsUrl, withAccessToken]);

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />
            <CustomHeader
                title={t('All Videos')}
                onBackPress={() => navigation.goBack()}
            />
            <FlatList
                data={data}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        activeOpacity={0.9}
                        style={{
                            marginHorizontal: 20,
                            marginBottom: 16,
                            borderRadius: 14,
                            overflow: 'hidden',
                            backgroundColor: colors.cardBackground,
                            borderWidth: 1,
                            borderColor: colors.borderColor,
                        }}
                        onPress={() => navigation.navigate('VideoPlayingScreen', {
                            mediaId: item.media.media_id,
                            video: {
                                title: eventName,
                                thumbnail: item.thumbnailUrl ? { uri: item.thumbnailUrl } : Images.photo7,
                                uri: item.videoUri ?? '',
                            },
                        })}
                    >
                        <Image
                            source={item.thumbnailUrl ? { uri: item.thumbnailUrl } : Images.photo7}
                            style={{ width: '100%', height: 180 }}
                            resizeMode="cover"
                        />
                        <View style={{ position: 'absolute', top: 0, right: 0, height: 180, left: 0, alignItems: 'center', justifyContent: 'center' }}>
                            <View style={{ backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 30, padding: 10 }}>
                                <Icons.PlayCricle width={38} height={38} />
                            </View>
                        </View>
                        <View style={{ paddingHorizontal: 14, paddingVertical: 12 }}>
                            <Text style={[styles.titleText, { fontSize: 16 }]} numberOfLines={1}>{eventName}</Text>
                            <SizeBox height={6} />
                            <Text style={styles.subText} numberOfLines={1}>
                                {t('By')} {item.name} • {formatDuration(item.timer)}
                            </Text>
                            <SizeBox height={4} />
                            <Text style={styles.subText} numberOfLines={1}>
                                {t('Uploaded')} {formatDate(item.uploadedAt)}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={{
                    paddingTop: 20,
                    paddingBottom: 10,
                }}
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
                ListHeaderComponent={
                    <View style={{ marginLeft: 20 }}>
                        <Text style={styles.titleText}>{eventName}</Text>
                        {(division || gender) && (
                            <>
                                <SizeBox height={6} />
                                <Text style={styles.filterText}>{[division, gender].filter(Boolean).join(' • ')}</Text>
                            </>
                        )}
                        <SizeBox height={16} />
                    </View>
                }
                ListFooterComponent={<SizeBox height={30} />}
            />
        </View>
    )
}

export default AllVideosOfEvents
