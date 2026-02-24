import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native'
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
                    const res = await getCompetitionPublicMedia(apiAccessToken, String(targetCompetitionId), {type: 'image', limit: 500});
                    list = Array.isArray(res) ? res : [];
                } else {
                    list = [];
                }
                if (!mounted) return;
                const filtered = list.filter((item) => {
                    return String(item.type).toLowerCase() !== 'video';
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
    }, [apiAccessToken, appearanceOnly, competitionId, eventId, targetCompetitionId, withAccessToken]);

    const data = useMemo(() => {
        return items.map((item) => {
            const candidate = item.thumbnail_url || item.preview_url || item.full_url || item.raw_url || null;
            return {
                id: item.media_id,
                photoUrl: withAccessToken(candidate) || candidate || '',
                uploadedAt: item.created_at ?? '',
                likes: item.likes_count ?? 0,
                views: item.views_count ?? 0,
                media: item,
            };
        });
    }, [items, withAccessToken]);

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />
            <CustomHeader title={t('All Photograph')} onBackPress={() => navigation.goBack()} />

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
                            <Image
                                source={{ uri: item.photoUrl }}
                                style={{ width: '100%', height: 180 }}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={{ width: '100%', height: 180, backgroundColor: colors.secondaryColor }} />
                        )}
                        <View style={{ paddingHorizontal: 14, paddingVertical: 12 }}>
                            <Text style={[styles.titleText, { fontSize: 16 }]} numberOfLines={1}>{eventName}</Text>
                            <SizeBox height={6} />
                            <Text style={styles.subText} numberOfLines={1}>
                                {item.likes} {t('likes')} • {item.views} {t('views')}
                            </Text>
                            <SizeBox height={4} />
                            <Text style={styles.subText} numberOfLines={1}>
                                {t('Uploaded')} {formatDate(item.uploadedAt)}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={{
                    paddingTop: 20,
                    paddingBottom: 10,
                }}
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
                style={{ flex: 1 }}
                ListFooterComponent={<SizeBox height={30} />}
            />
        </View>
    )
}

export default AllPhotosOfEvents
