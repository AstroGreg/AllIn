import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native'
import React, { useMemo, useEffect, useState, useCallback } from 'react'
import Styles from '../SearchStyles'
import CustomHeader from '../../../components/customHeader/CustomHeader'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Icons from '../../../constants/Icons'
import { useAuth } from '../../../context/AuthContext'
import { getMediaById } from '../../../services/apiGateway'
import { getApiBaseUrl, getHlsBaseUrl } from '../../../constants/RuntimeConfig'
import Images from '../../../constants/Images'

const VideosForEvent = ({ navigation, route }: any) => {
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
            timer: '2300',
            thumbnail: sharedThumbUrl,
        },
        {
            id: 2,
            name: 'Passionate',
            event: eventName,
            videoUri: sharedVideoUrl,
            timer: '2300',
            thumbnail: sharedThumbUrl,
        },
        {
            id: 3,
            name: 'Passionate',
            event: eventName,
            videoUri: sharedVideoUrl,
            timer: '2300',
            thumbnail: sharedThumbUrl,
        },
    ]), [eventName, sharedThumbUrl, sharedVideoUrl]);

    const renderItem = ({ item }: any) => {
        return (
            <View style={[Styles.borderBox, { marginBottom: 24 }]}>
                <Text style={Styles.subText}>{item.event}</Text>
                <SizeBox height={16} />
                <View style={[Styles.row, Styles.spaceBetween]}>
                    <Text style={Styles.subText}>Author: {item.name}</Text>
                    <Text style={Styles.subText}>5:06 Mins</Text>
                    <Text style={Styles.subText}>5k Views</Text>
                </View>
                <SizeBox height={12} />
                <TouchableOpacity
                    onPress={() => navigation.navigate('VideoPlayingScreen', {
                        mediaId,
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
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <CustomHeader title='Video' onBackPress={() => navigation.goBack()} onPressSetting={() => navigation.navigate('ProfileSettings')} />

            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <>
                        <SizeBox height={24} />
                        <View style={{ marginHorizontal: 20 }}>
                            <Text style={Styles.titleText}>{eventName}</Text>
                            <SizeBox height={2} />
                            <Text style={Styles.filterText}>
                                {[eventName, division, gender].filter(Boolean).join(' • ')}
                            </Text>
                            <SizeBox height={10} />
                            <View style={Styles.separator} />
                        </View>
                        <SizeBox height={27} />
                    </>
                }
            />
        </View>
    )
}

export default VideosForEvent
