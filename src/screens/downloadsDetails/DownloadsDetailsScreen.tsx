import React, {useCallback, useMemo, useState, useEffect} from 'react';
import {FlatList, RefreshControl, Text, TouchableOpacity, View, TextInput} from 'react-native';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
import {useTheme} from '../../context/ThemeContext';
import {useAuth} from '../../context/AuthContext';
import {useEvents} from '../../context/EventsContext';
import {ApiError, getDownloads, getMediaById, type DownloadItem} from '../../services/apiGateway';
import { getApiBaseUrl } from '../../constants/RuntimeConfig';
import {createStyles} from './DownloadsDetailsStyles';
import {useFocusEffect} from '@react-navigation/native';

const DownloadsDetailsScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const {colors} = useTheme();
    const Styles = createStyles(colors);
    const {apiAccessToken} = useAuth();
    const {eventNameById} = useEvents();
    const mode = route?.params?.mode ?? 'downloads';
    const isProfitView = mode === 'profit';
    const isCompetitionList = mode === 'competitions';
    const isCompetitionMedia = mode === 'competition-media';

    const [downloads, setDownloads] = useState<DownloadItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorText, setErrorText] = useState<string | null>(null);
    const [competitionSearch, setCompetitionSearch] = useState('');
    const [mediaThumbs, setMediaThumbs] = useState<Record<string, string>>({});

    const loadDownloads = useCallback(async () => {
        if (!apiAccessToken) {
            setDownloads([]);
            setErrorText('Log in (or set a Dev API token) to view downloads.');
            return;
        }

        setIsLoading(true);
        setErrorText(null);
        try {
            const data = await getDownloads(apiAccessToken, {limit: 200});
            setDownloads(Array.isArray(data) ? data : []);
        } catch (e: any) {
            const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
            setErrorText(msg);
        } finally {
            setIsLoading(false);
        }
    }, [apiAccessToken]);

    useFocusEffect(
        useCallback(() => {
            if (!isProfitView && !isCompetitionList && !isCompetitionMedia) {
                loadDownloads();
            }
        }, [isCompetitionList, isCompetitionMedia, isProfitView, loadDownloads]),
    );

    const profitItems = useMemo(
        () => [
            {
                id: 'p1',
                title: 'PK 400m Limburg 2025',
                downloads: 142,
                views: 2100,
                profit: 58,
                mediaId: '86db92e8-1b8e-44a5-95c4-fb4764f6783e',
                type: 'video',
            },
            {
                id: 'p2',
                title: 'Sunrise 10K Community Run',
                downloads: 98,
                views: 1400,
                profit: 41,
                mediaId: '87873d40-addf-4289-aa82-7cd300acdd94',
                type: 'photo',
            },
            {
                id: 'p3',
                title: 'BK Studentent 23',
                downloads: 77,
                views: 980,
                profit: 33,
                mediaId: '4ac31817-e954-4d22-934d-27f82ddf5163',
                type: 'photo',
            },
        ].sort((a, b) => b.profit - a.profit),
        [],
    );

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

    const renderItem = useCallback(({item}: {item: DownloadItem}) => {
        const media = item.media;
        const thumbCandidate = media.thumbnail_url || media.preview_url || media.original_url || null;
        const resolvedThumb = thumbCandidate ? toAbsoluteUrl(String(thumbCandidate)) : null;
        const thumb = withAccessToken(resolvedThumb) || resolvedThumb;

        return (
            <TouchableOpacity
                style={Styles.card}
                activeOpacity={0.85}
                onPress={() => {
                    navigation.navigate('PhotoDetailScreen', {
                        eventTitle: eventNameById(media.event_id),
                        media: {
                            id: media.media_id,
                            eventId: media.event_id,
                            thumbnailUrl: media.thumbnail_url,
                            previewUrl: media.preview_url,
                            originalUrl: media.original_url,
                            fullUrl: media.full_url,
                            rawUrl: media.raw_url,
                            hlsManifestPath: media.hls_manifest_path,
                            type: media.type,
                        },
                    });
                }}
            >
                {thumb ? (
                    <FastImage source={{uri: String(thumb)}} style={Styles.cardImage} resizeMode="cover" />
                ) : (
                    <View style={[Styles.cardImage, {backgroundColor: colors.btnBackgroundColor}]} />
                )}

                <View style={Styles.cardMetaRow}>
                    <Text style={Styles.cardMetaText}>
                        {media.type === 'video' ? 'Video' : 'Photo'} • {String(item.download.last_downloaded_at).slice(0, 10)}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }, [Styles.card, Styles.cardImage, Styles.cardMetaRow, Styles.cardMetaText, colors.btnBackgroundColor, eventNameById, navigation]);

    const renderProfitItem = useCallback(({item}: {item: {id: string; title: string; downloads: number; views: number; profit: number; mediaId: string; type: string}}) => (
        <TouchableOpacity
            style={Styles.profitCard}
            activeOpacity={0.85}
            onPress={() => {
                if (item.type === 'video') {
                    navigation.navigate('VideoPlayingScreen', {
                        video: {
                            title: item.title,
                            thumbnail: undefined,
                        },
                    });
                } else {
                    navigation.navigate('PhotoDetailScreen', {
                        eventTitle: item.title,
                        media: {
                            id: item.mediaId,
                            eventId: null,
                            type: item.type,
                        },
                    });
                }
            }}
        >
            <Text style={Styles.profitTitle}>{item.title}</Text>
            <View style={Styles.profitRow}>
                <Text style={Styles.profitMeta}>{item.downloads} downloads</Text>
                <Text style={Styles.profitMeta}>{item.views.toLocaleString()} views</Text>
                <Text style={Styles.profitAmount}>€{item.profit}</Text>
            </View>
        </TouchableOpacity>
    ), [Styles.profitAmount, Styles.profitCard, Styles.profitMeta, Styles.profitRow, Styles.profitTitle, navigation]);

    const renderCompetitionItem = useCallback(
        ({item}: {item: {id: string; title: string; location: string; date: string; competitionType: string; uploads: number}}) => (
            <TouchableOpacity
                style={Styles.competitionRow}
                activeOpacity={0.85}
                onPress={() => {
                    navigation.navigate('DownloadsDetailsScreen', {
                        mode: 'competition-media',
                        competition: item,
                    });
                }}
            >
                <View style={Styles.competitionRowInfo}>
                    <Text style={Styles.competitionRowTitle}>{item.title}</Text>
                    <Text style={Styles.competitionRowMeta}>{item.uploads} uploads • {item.date}</Text>
                    <Text style={Styles.competitionRowMetaSecondary}>{item.location}</Text>
                </View>
                <View style={Styles.competitionBadge}>
                    <Text style={Styles.competitionBadgeText}>
                        {item.competitionType === 'road' ? 'Road&Trail' : 'Track&Field'}
                    </Text>
                </View>
            </TouchableOpacity>
        ),
        [Styles.competitionBadge, Styles.competitionBadgeText, Styles.competitionRow, Styles.competitionRowInfo, Styles.competitionRowMeta, Styles.competitionRowMetaSecondary, Styles.competitionRowTitle, navigation],
    );

    const renderCompetitionMediaItem = useCallback(
        ({item}: {item: {id: string; title: string; type: string; mediaId: string}}) => {
            const thumb = mediaThumbs[item.mediaId];
            return (
                <TouchableOpacity
                    style={Styles.mediaRow}
                    activeOpacity={0.85}
                    onPress={() => {
                        if (item.type === 'video') {
                            navigation.navigate('VideoPlayingScreen', {
                                video: { title: item.title },
                            });
                        } else {
                            navigation.navigate('PhotoDetailScreen', {
                                eventTitle: selectedCompetition?.title || 'Competition',
                                media: {
                                    id: item.mediaId,
                                    eventId: null,
                                    type: item.type,
                                },
                            });
                        }
                    }}
                >
                    {thumb ? (
                        <FastImage source={{uri: String(thumb)}} style={Styles.mediaThumb} resizeMode="cover" />
                    ) : (
                        <View style={Styles.mediaThumbPlaceholder} />
                    )}
                    <View style={Styles.mediaInfo}>
                        <Text style={Styles.mediaTitle}>{item.title}</Text>
                        <Text style={Styles.mediaMeta}>{item.type === 'video' ? 'Video' : 'Photo'}</Text>
                    </View>
                </TouchableOpacity>
            );
        },
        [Styles.mediaInfo, Styles.mediaMeta, Styles.mediaRow, Styles.mediaThumb, Styles.mediaThumbPlaceholder, Styles.mediaTitle, mediaThumbs, navigation, selectedCompetition?.title],
    );

    const competitions = useMemo(
        () => [
            {
                id: 'uc1',
                title: 'PK 400m Limburg 2025',
                location: 'Limburg, Belgium',
                date: '04/02/2026',
                competitionType: 'track',
                uploads: 14,
            },
            {
                id: 'uc2',
                title: 'Sunrise 10K Community Run',
                location: 'Brussels, Belgium',
                date: '27/05/2025',
                competitionType: 'road',
                uploads: 9,
            },
            {
                id: 'uc3',
                title: 'BK Studentent 23',
                location: 'Ghent, Belgium',
                date: '16/03/2025',
                competitionType: 'track',
                uploads: 6,
            },
            {
                id: 'uc4',
                title: 'IFAM 2024',
                location: 'Brussels, Belgium',
                date: '27/05/2025',
                competitionType: 'track',
                uploads: 11,
            },
            {
                id: 'uc5',
                title: 'Brussels City Run 2026',
                location: 'Brussels, Belgium',
                date: '12/06/2026',
                competitionType: 'road',
                uploads: 8,
            },
            {
                id: 'uc6',
                title: 'Indoor Classic 2026',
                location: 'Antwerp, Belgium',
                date: '11/01/2026',
                competitionType: 'track',
                uploads: 5,
            },
        ],
        [],
    );

    const filteredCompetitions = useMemo(() => {
        const query = competitionSearch.trim().toLowerCase();
        if (!query) return competitions;
        return competitions.filter((item) => item.title.toLowerCase().includes(query));
    }, [competitionSearch, competitions]);

    const selectedCompetition = route?.params?.competition ?? competitions.find((item) => item.id === route?.params?.competitionId) ?? null;

    const competitionMediaItems = useMemo(() => {
        if (!selectedCompetition) return [];
        return [
            {
                id: `${selectedCompetition.id}-v1`,
                title: `${selectedCompetition.title} - Finish`,
                type: 'video',
                mediaId: '86db92e8-1b8e-44a5-95c4-fb4764f6783e',
            },
            {
                id: `${selectedCompetition.id}-p1`,
                title: `${selectedCompetition.title} - Finish line`,
                type: 'photo',
                mediaId: '87873d40-addf-4289-aa82-7cd300acdd94',
            },
            {
                id: `${selectedCompetition.id}-p2`,
                title: `${selectedCompetition.title} - Sprint`,
                type: 'photo',
                mediaId: '4ac31817-e954-4d22-934d-27f82ddf5163',
            },
        ];
    }, [selectedCompetition]);

    const headerTitle = isCompetitionList
        ? 'Competitions'
        : isCompetitionMedia
            ? (selectedCompetition?.title || 'Competition uploads')
            : isProfitView
                ? 'Download profit'
                : 'Downloads';

    const headerCount = isCompetitionList
        ? filteredCompetitions.length
        : isCompetitionMedia
            ? competitionMediaItems.length
            : isProfitView
                ? profitItems.length
                : (isLoading && downloads.length === 0 ? 0 : downloads.length);

    useEffect(() => {
        if (!apiAccessToken || !isCompetitionMedia) return;
        const ids = Array.from(new Set(competitionMediaItems.map((item) => item.mediaId)));
        if (ids.length === 0) return;
        let mounted = true;
        Promise.all(
            ids.map(async (id) => {
                const media = await getMediaById(apiAccessToken, id);
                const thumbCandidate =
                    media.thumbnail_url || media.preview_url || media.full_url || media.raw_url || null;
                const resolved = thumbCandidate ? toAbsoluteUrl(String(thumbCandidate)) : null;
                return [id, withAccessToken(resolved) || resolved] as const;
            }),
        )
            .then((entries) => {
                if (!mounted) return;
                const next: Record<string, string> = {};
                entries.forEach(([id, url]) => {
                    if (url) next[id] = url;
                });
                setMediaThumbs(next);
            })
            .catch(() => {});
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, competitionMediaItems, isCompetitionMedia, toAbsoluteUrl, withAccessToken]);

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{headerTitle}</Text>
                <View style={Styles.headerCountBadge}>
                    <Text style={Styles.headerCountText}>
                        {headerCount === 0 && isLoading ? '—' : String(headerCount)}
                    </Text>
                </View>
            </View>

            {isCompetitionList && (
                <FlatList
                    data={filteredCompetitions}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={[Styles.listContent, {paddingBottom: insets.bottom > 0 ? insets.bottom + 20 : 40}]}
                    ListHeaderComponent={
                        <View style={Styles.listHeader}>
                            <Text style={Styles.sectionTitle}>Competitions</Text>
                            <View style={Styles.searchBar}>
                                <TextInput
                                    style={Styles.searchInput}
                                    placeholder="Search competition"
                                    placeholderTextColor={colors.grayColor}
                                    value={competitionSearch}
                                    onChangeText={setCompetitionSearch}
                                />
                            </View>
                        </View>
                    }
                    ListEmptyComponent={
                        <Text style={Styles.emptyText}>No competitions found.</Text>
                    }
                    renderItem={renderCompetitionItem}
                />
            )}

            {isCompetitionMedia && (
                <FlatList
                    data={competitionMediaItems}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={[Styles.listContent, {paddingBottom: insets.bottom > 0 ? insets.bottom + 20 : 40}]}
                    ListHeaderComponent={
                        <Text style={Styles.sectionTitle}>Your uploads</Text>
                    }
                    ListEmptyComponent={
                        <Text style={Styles.emptyText}>No uploads yet.</Text>
                    }
                    renderItem={renderCompetitionMediaItem}
                />
            )}

            {!isCompetitionList && !isCompetitionMedia && (
                <FlatList
                    data={isProfitView ? profitItems : downloads}
                    keyExtractor={(item: any) => (isProfitView ? String(item.id) : String(item.download.download_id))}
                    numColumns={isProfitView ? 1 : 2}
                    columnWrapperStyle={isProfitView ? undefined : Styles.gridRow}
                    contentContainerStyle={[Styles.listContent, {paddingBottom: insets.bottom > 0 ? insets.bottom + 20 : 40}]}
                    ListHeaderComponent={<Text style={Styles.sectionTitle}>{isProfitView ? 'Profit per media' : 'Downloads'}</Text>}
                    ListEmptyComponent={
                        errorText && !isProfitView ? (
                            <Text style={Styles.errorText}>{errorText}</Text>
                        ) : (
                            <Text style={Styles.emptyText}>{isProfitView ? 'No profit data yet.' : 'No downloads yet.'}</Text>
                        )
                    }
                    renderItem={isProfitView ? renderProfitItem : renderItem}
                    refreshControl={
                        isProfitView ? undefined : (
                            <RefreshControl refreshing={isLoading} onRefresh={loadDownloads} tintColor={colors.primaryColor} />
                        )
                    }
                />
            )}
        </View>
    );
};

export default DownloadsDetailsScreen;
