import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native'
import React, { useMemo, useEffect, useState, useCallback } from 'react'
import Styles from '../SearchStyles'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import CustomHeader from '../../../components/customHeader/CustomHeader'
import Icons from '../../../constants/Icons'
import { useAuth } from '../../../context/AuthContext'
import { getMediaById } from '../../../services/apiGateway'
import { getApiBaseUrl, getHlsBaseUrl } from '../../../constants/RuntimeConfig'
import Images from '../../../constants/Images'

const AllVideosOfEvents = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const eventName = route?.params?.eventName || 'Event';
    const division = route?.params?.division;
    const gender = route?.params?.gender;
    const { apiAccessToken } = useAuth();
    const mediaId = '86db92e8-1b8e-44a5-95c4-fb4764f6783e';
    const [sharedThumbUrl, setSharedThumbUrl] = useState<string | null>(null);
    const [sharedVideoUrl, setSharedVideoUrl] = useState<string | null>(null);

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
        getMediaById(apiAccessToken, mediaId)
            .then((media) => {
                if (!mounted) return;
                const hls = media.hls_manifest_path ? toHlsUrl(media.hls_manifest_path) : null;
                const candidates = [
                    media.preview_url,
                    media.original_url,
                    media.full_url,
                    media.raw_url,
                ]
                    .filter(Boolean)
                    .map((value) => toAbsoluteUrl(String(value)) || '')
                    .filter(Boolean);
                const mp4 = candidates.find((value) => /\.(mp4|mov|m4v)(\?|$)/i.test(value));
                const resolvedVideo = hls || mp4 || candidates[0] || null;
                const thumbCandidate = media.thumbnail_url || media.preview_url || media.full_url || media.raw_url || null;
                const resolvedThumb = thumbCandidate ? toAbsoluteUrl(String(thumbCandidate)) : null;
                setSharedVideoUrl(withAccessToken(resolvedVideo) || resolvedVideo);
                setSharedThumbUrl(withAccessToken(resolvedThumb) || resolvedThumb);
            })
            .catch(() => {});
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, mediaId, toAbsoluteUrl, toHlsUrl, withAccessToken]);

    const data = useMemo(() => ([
        {
            id: 1,
            name: 'Passionate',
            event: eventName,
            videoUri: sharedVideoUrl,
            thumbnailUrl: sharedThumbUrl,
            uploadedAt: '2026-02-05',
            timer: '2300',
        },
        {
            id: 2,
            name: 'Passionate',
            event: eventName,
            videoUri: sharedVideoUrl,
            thumbnailUrl: sharedThumbUrl,
            uploadedAt: '2026-02-02',
            timer: '2300',
        },
        {
            id: 3,
            name: 'Passionate',
            event: eventName,
            videoUri: sharedVideoUrl,
            thumbnailUrl: sharedThumbUrl,
            uploadedAt: '2026-01-29',
            timer: '2300',
        },
    ]), [eventName, sharedThumbUrl, sharedVideoUrl]);

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <CustomHeader
                title='All Videos'
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
                            backgroundColor: '#FFFFFF',
                            borderWidth: 1,
                            borderColor: '#E8ECF2',
                        }}
                        onPress={() => navigation.navigate('VideoPlayingScreen', {
                            mediaId,
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
                            <Text style={[Styles.titleText, { fontSize: 16 }]} numberOfLines={1}>{eventName}</Text>
                            <SizeBox height={6} />
                            <Text style={Styles.subText} numberOfLines={1}>
                                By {item.name} • {formatDuration(item.timer)}
                            </Text>
                            <SizeBox height={4} />
                            <Text style={Styles.subText} numberOfLines={1}>
                                Uploaded {formatDate(item.uploadedAt)}
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
                        <Text style={Styles.titleText}>{eventName}</Text>
                        {(division || gender) && (
                            <>
                                <SizeBox height={6} />
                                <Text style={Styles.filterText}>{[division, gender].filter(Boolean).join(' • ')}</Text>
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
