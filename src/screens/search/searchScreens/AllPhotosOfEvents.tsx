import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native'
import React, { useMemo, useEffect, useState, useCallback } from 'react'
import SizeBox from '../../../constants/SizeBox'
import Styles from '../SearchStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomHeader from '../../../components/customHeader/CustomHeader';
import { useAuth } from '../../../context/AuthContext';
import { getMediaById } from '../../../services/apiGateway';
import { getApiBaseUrl } from '../../../constants/RuntimeConfig';

const AllPhotosOfEvents = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const eventName = route?.params?.eventName || 'Event';
    const division = route?.params?.division;
    const gender = route?.params?.gender;
    const { apiAccessToken } = useAuth();
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

    const data = useMemo(
        () => ([
            {
                id: photoIds[0],
                name: 'Passionate',
                photoUrl: photoMap[photoIds[0]] ?? '',
                price: '$15',
                uploadedAt: '2026-02-05',
            },
            {
                id: photoIds[1],
                name: 'Passionate',
                photoUrl: photoMap[photoIds[1]] ?? '',
                price: '$15',
                uploadedAt: '2026-02-02',
            },
            {
                id: photoIds[2],
                name: 'Passionate',
                photoUrl: photoMap[photoIds[2]] ?? '',
                price: '$15',
                uploadedAt: '2026-01-29',
            },
        ]),
        [photoIds, photoMap],
    );

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <CustomHeader title='All Photograph' onBackPress={() => navigation.goBack()} />

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
                        onPress={() => navigation.navigate('PhotoDetailScreen', {
                            eventTitle: eventName,
                            media: {
                                id: item.id,
                                type: 'image',
                                title: `${eventName} ${item.name}`,
                                thumbnailUrl: item.photoUrl,
                                previewUrl: item.photoUrl,
                                originalUrl: item.photoUrl,
                                fullUrl: item.photoUrl,
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
                            <View style={{ width: '100%', height: 180, backgroundColor: '#F2F4F7' }} />
                        )}
                        <View style={{ paddingHorizontal: 14, paddingVertical: 12 }}>
                            <Text style={[Styles.titleText, { fontSize: 16 }]} numberOfLines={1}>{eventName}</Text>
                            <SizeBox height={6} />
                            <Text style={Styles.subText} numberOfLines={1}>
                                {item.name} • {item.price}
                            </Text>
                            <SizeBox height={4} />
                            <Text style={Styles.subText} numberOfLines={1}>
                                Uploaded {formatDate(item.uploadedAt)}
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
                style={{ flex: 1 }}
                ListFooterComponent={<SizeBox height={30} />}
            />
        </View>
    )
}

export default AllPhotosOfEvents
