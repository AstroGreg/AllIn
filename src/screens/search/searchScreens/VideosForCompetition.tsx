import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native'
import React, { useMemo, useEffect, useState, useCallback } from 'react'
import { createStyles } from '../SearchStyles'
import CustomHeader from '../../../components/customHeader/CustomHeader'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Icons from '../../../constants/Icons'
import { useAuth } from '../../../context/AuthContext'
import { getHubAppearanceMedia, getMediaViewAll, type MediaViewAllItem } from '../../../services/apiGateway'
import { getHlsBaseUrl } from '../../../constants/RuntimeConfig'
import Images from '../../../constants/Images'
import { useTheme } from '../../../context/ThemeContext'
import { useTranslation } from 'react-i18next'

const VideosForEvent = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const eventName = route?.params?.eventName || 'Event';
    const eventId = route?.params?.eventId;
    const appearanceOnly = Boolean(route?.params?.appearanceOnly);
    const division = route?.params?.division;
    const gender = route?.params?.gender;
    const { apiAccessToken } = useAuth();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const [items, setItems] = useState<MediaViewAllItem[]>([]);

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

    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken) return () => {};
        const load = async () => {
            try {
                let list: MediaViewAllItem[] = [];
                if (appearanceOnly && eventId) {
                    const res = await getHubAppearanceMedia(apiAccessToken, String(eventId));
                    list = Array.isArray(res?.results) ? res.results : [];
                } else {
                    const res = await getMediaViewAll(apiAccessToken);
                    list = Array.isArray(res) ? res : [];
                }
                if (!mounted) return;
                const filtered = list.filter((item) => {
                    if (eventId && String(item.event_id ?? '') !== String(eventId)) return false;
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
    }, [apiAccessToken, appearanceOnly, eventId]);

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
                timer: String(
                    (item.assets || []).find((asset) => Number(asset.duration_seconds) > 0)?.duration_seconds ?? ''
                ),
                thumbnail: resolvedThumb,
                media: item,
            };
        });
    }, [eventName, items, toHlsUrl, withAccessToken]);

    const renderItem = ({ item }: any) => {
        return (
            <View style={[styles.borderBox, { marginBottom: 24 }]}>
                <Text style={styles.subText}>{item.event}</Text>
                <SizeBox height={16} />
                <View style={[styles.row, styles.spaceBetween]}>
                    <Text style={styles.subText}>{t('Author')}: {item.name}</Text>
                    <Text style={styles.subText}>{formatDuration(item.timer)} {t('Mins')}</Text>
                    <Text style={styles.subText}>{Number(item.media.views_count ?? 0)} {t('Views')}</Text>
                </View>
                <SizeBox height={12} />
                <TouchableOpacity
                    onPress={() => navigation.navigate('VideoPlayingScreen', {
                        mediaId: item.media.media_id,
                        video: {
                            title: eventName,
                            thumbnail: item.thumbnail ? { uri: item.thumbnail } : Images.photo7,
                            uri: item.videoUri ?? '',
                        },
                    })}
                    style={{ position: 'relative' }}
                >
                    <Image
                        source={item.thumbnail ? { uri: item.thumbnail } : Images.photo7}
                        style={{ width: '100%', height: 150, borderRadius: 8 }}
                    />
                    <View style={{ position: 'absolute', right: 12, bottom: 12 }}>
                        <Icons.PlayCricle height={28} width={28} />
                    </View>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />
            <CustomHeader title={t('Video')} onBackPress={() => navigation.goBack()} onPressSetting={() => navigation.navigate('ProfileSettings')} />

            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <>
                        <SizeBox height={24} />
                        <View style={{ marginHorizontal: 20 }}>
                            <Text style={styles.titleText}>{eventName}</Text>
                            <SizeBox height={2} />
                            <Text style={styles.filterText}>
                                {[eventName, division, gender].filter(Boolean).join(' • ')}
                            </Text>
                            <SizeBox height={10} />
                            <View style={styles.separator} />
                        </View>
                        <SizeBox height={27} />
                    </>
                }
            />
        </View>
    )
}

export default VideosForEvent
