import React, {useCallback, useMemo, useState} from 'react';
import {FlatList, RefreshControl, Text, TouchableOpacity, View, TextInput} from 'react-native';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
import {useTheme} from '../../context/ThemeContext';
import {useAuth} from '../../context/AuthContext';
import {useEvents} from '../../context/EventsContext';
import {ApiError, getCompetitionMedia, getDownloads, getDownloadsProfit, getUploadedCompetitions, type DownloadItem, type MediaProfitItem, type MediaViewAllItem, type UploadedCompetition} from '../../services/apiGateway';
import { getApiBaseUrl } from '../../constants/RuntimeConfig';
import {createStyles} from './DownloadsDetailsStyles';
import {useFocusEffect} from '@react-navigation/native';
import { useTranslation } from 'react-i18next'

const DownloadsDetailsScreen = ({ navigation, route }: any) => {
    const { t } = useTranslation();
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
    const [profitItems, setProfitItems] = useState<MediaProfitItem[]>([]);
    const [competitions, setCompetitions] = useState<UploadedCompetition[]>([]);
    const [competitionMediaItems, setCompetitionMediaItems] = useState<MediaViewAllItem[]>([]);

    const loadDownloads = useCallback(async () => {
        if (!apiAccessToken) {
            setDownloads([]);
            setErrorText(t('Log in to view downloads.'));
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
    }, [apiAccessToken, t]);

    const loadProfit = useCallback(async () => {
        if (!apiAccessToken) {
            setProfitItems([]);
            return;
        }
        try {
            const resp = await getDownloadsProfit(apiAccessToken, {limit: 200});
            const items = Array.isArray(resp?.items) ? resp.items : [];
            items.sort((a, b) => (Number(b.downloads_count ?? 0) - Number(a.downloads_count ?? 0)) || (Number(b.views_count ?? 0) - Number(a.views_count ?? 0)));
            setProfitItems(items);
        } catch {
            setProfitItems([]);
        }
    }, [apiAccessToken]);

    const loadCompetitions = useCallback(async () => {
        if (!apiAccessToken) {
            setCompetitions([]);
            return;
        }
        try {
            const resp = await getUploadedCompetitions(apiAccessToken, {limit: 200});
            const items = Array.isArray(resp?.competitions) ? resp.competitions : [];
            setCompetitions(items);
        } catch {
            setCompetitions([]);
        }
    }, [apiAccessToken]);

    const loadCompetitionMedia = useCallback(async (eventId?: string | null) => {
        if (!apiAccessToken || !eventId) {
            setCompetitionMediaItems([]);
            return;
        }
        try {
            const resp = await getCompetitionMedia(apiAccessToken, String(eventId), {limit: 500});
            setCompetitionMediaItems(Array.isArray(resp?.items) ? resp.items : []);
        } catch {
            setCompetitionMediaItems([]);
        }
    }, [apiAccessToken]);

    useFocusEffect(
        useCallback(() => {
            if (isProfitView) {
                loadProfit();
                return;
            }
            if (isCompetitionList) {
                loadCompetitions();
                return;
            }
            if (isCompetitionMedia) {
                const eventId = route?.params?.competition?.event_id ?? route?.params?.competitionId ?? null;
                loadCompetitionMedia(eventId);
                return;
            }
            loadDownloads();
        }, [
            isCompetitionList,
            isCompetitionMedia,
            isProfitView,
            loadDownloads,
            loadProfit,
            loadCompetitions,
            loadCompetitionMedia,
            route?.params?.competition?.event_id,
            route?.params?.competitionId,
        ]),
    );

    const profitList = useMemo(() => {
        return profitItems.map((media) => {
            const eventName = media.event_id ? eventNameById(String(media.event_id)) : '';
            const title = eventName || t('Uploaded media');
            return {
                id: String(media.media_id),
                title,
                downloads: Number(media.downloads_count ?? 0) || 0,
                views: Number(media.views_count ?? 0) || 0,
                likes: Number(media.likes_count ?? 0) || 0,
                profit_cents: Number(media.profit_cents ?? 0) || 0,
                media,
            };
        });
    }, [eventNameById, profitItems, t]);

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
                        {media.type === 'video' ? t('Video') : t('Photo')} • {String(item.download.last_downloaded_at).slice(0, 10)}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }, [Styles.card, Styles.cardImage, Styles.cardMetaRow, Styles.cardMetaText, colors.btnBackgroundColor, eventNameById, navigation, t, toAbsoluteUrl, withAccessToken]);

    const formatMoney = useCallback((cents: number) => {
        if (!Number.isFinite(cents)) return '—';
        return `€${(cents / 100).toFixed(2)}`;
    }, []);

    const renderProfitItem = useCallback(({item}: {item: {id: string; title: string; downloads: number; views: number; likes: number; profit_cents: number; media: MediaViewAllItem}}) => (
        <TouchableOpacity
            style={Styles.profitCard}
            activeOpacity={0.85}
            onPress={() => {
                if (item.media.type === 'video') {
                    navigation.navigate('VideoPlayingScreen', {
                        video: {
                            title: item.title,
                            thumbnail: undefined,
                            uri: item.media.preview_url ?? item.media.original_url ?? item.media.full_url ?? item.media.raw_url ?? '',
                        },
                    });
                } else {
                    navigation.navigate('PhotoDetailScreen', {
                        eventTitle: item.title,
                        media: {
                            id: item.media.media_id,
                            eventId: null,
                            type: item.media.type,
                        },
                    });
                }
            }}
        >
            <Text style={Styles.profitTitle}>{item.title}</Text>
            <View style={Styles.profitRow}>
                <Text style={Styles.profitMeta}>{item.downloads} {t('downloads')}</Text>
                <Text style={Styles.profitMeta}>
                    {item.views.toLocaleString()} {t('views')} • {item.likes.toLocaleString()} {t('likes')}
                </Text>
                <Text style={Styles.profitAmount}>{formatMoney(item.profit_cents)}</Text>
            </View>
        </TouchableOpacity>
    ), [Styles.profitAmount, Styles.profitCard, Styles.profitMeta, Styles.profitRow, Styles.profitTitle, formatMoney, navigation, t]);

    const formatEventDate = useCallback((value?: string | null) => {
        if (!value) return '';
        const raw = String(value);
        const dt = new Date(raw);
        if (Number.isNaN(dt.getTime())) return raw.slice(0, 10);
        return dt.toLocaleDateString();
    }, []);

    const formatCompetitionType = useCallback((value?: string | null) => {
        const raw = String(value || '').toLowerCase();
        if (raw.includes('road') || raw.includes('trail') || raw.includes('marathon')) return t('roadAndTrail');
        if (raw.includes('track') || raw.includes('field')) return t('trackAndField');
        return t('competition');
    }, [t]);

    const renderCompetitionItem = useCallback(
        ({item}: {item: UploadedCompetition}) => (
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
                    <Text style={Styles.competitionRowTitle}>{item.event_name || t('competition')}</Text>
                    <Text style={Styles.competitionRowMeta}>{Number(item.uploads_count ?? 0)} {t('uploads')} • {formatEventDate(item.event_date)}</Text>
                    <Text style={Styles.competitionRowMetaSecondary}>{item.event_location ?? ''}</Text>
                </View>
                <View style={Styles.competitionBadge}>
                    <Text style={Styles.competitionBadgeText}>{formatCompetitionType(item.event_type)}</Text>
                </View>
            </TouchableOpacity>
        ),
        [Styles.competitionBadge, Styles.competitionBadgeText, Styles.competitionRow, Styles.competitionRowInfo, Styles.competitionRowMeta, Styles.competitionRowMetaSecondary, Styles.competitionRowTitle, formatCompetitionType, formatEventDate, navigation, t],
    );

    const renderCompetitionMediaItem = useCallback(
        ({item}: {item: MediaViewAllItem}) => {
            const thumbCandidate = item.thumbnail_url || item.preview_url || item.full_url || item.raw_url || null;
            const resolvedThumb = thumbCandidate ? toAbsoluteUrl(String(thumbCandidate)) : null;
            const thumb = withAccessToken(resolvedThumb) || resolvedThumb;
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
                                eventTitle: selectedCompetition?.event_name || t('competition'),
                                media: {
                                    id: item.media_id,
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
                        <Text style={Styles.mediaTitle}>{selectedCompetition?.event_name || t('competition')}</Text>
                        <Text style={Styles.mediaMeta}>{item.type === 'video' ? t('Video') : t('Photo')}</Text>
                    </View>
                </TouchableOpacity>
            );
        },
        [Styles.mediaInfo, Styles.mediaMeta, Styles.mediaRow, Styles.mediaThumb, Styles.mediaThumbPlaceholder, Styles.mediaTitle, navigation, selectedCompetition?.event_name, t, toAbsoluteUrl, withAccessToken],
    );

    const filteredCompetitions = useMemo(() => {
        const query = competitionSearch.trim().toLowerCase();
        if (!query) return competitions;
        return competitions.filter((item) => (item.event_name || '').toLowerCase().includes(query));
    }, [competitionSearch, competitions]);

    const selectedCompetition = route?.params?.competition
        ?? competitions.find((item) => item.event_id === route?.params?.competitionId)
        ?? null;

    const headerTitle = isCompetitionList
        ? t('Competitions')
        : isCompetitionMedia
            ? (selectedCompetition?.event_name || `${t('competition')} ${t('uploads')}`)
            : isProfitView
                ? t('Download profit')
                : t('Downloads');

    const headerCount = isCompetitionList
        ? filteredCompetitions.length
        : isCompetitionMedia
            ? competitionMediaItems.length
            : isProfitView
                ? profitList.length
                : (isLoading && downloads.length === 0 ? 0 : downloads.length);

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
                    keyExtractor={(item) => String(item.event_id)}
                    contentContainerStyle={[Styles.listContent, {paddingBottom: insets.bottom > 0 ? insets.bottom + 20 : 40}]}
                    ListHeaderComponent={
                        <View style={Styles.listHeader}>
                            <Text style={Styles.sectionTitle}>{t('Competitions')}</Text>
                            <View style={Styles.searchBar}>
                                <TextInput
                                    style={Styles.searchInput}
                                    placeholder={t('Search competition')}
                                    placeholderTextColor={colors.grayColor}
                                    value={competitionSearch}
                                    onChangeText={setCompetitionSearch}
                                />
                            </View>
                        </View>
                    }
                    ListEmptyComponent={
                        <Text style={Styles.emptyText}>{t('No competitions found.')}</Text>
                    }
                    renderItem={renderCompetitionItem}
                />
            )}

            {isCompetitionMedia && (
                <FlatList
                    data={competitionMediaItems}
                    keyExtractor={(item) => String(item.media_id)}
                    contentContainerStyle={[Styles.listContent, {paddingBottom: insets.bottom > 0 ? insets.bottom + 20 : 40}]}
                    ListHeaderComponent={
                        <Text style={Styles.sectionTitle}>{t('Your uploads')}</Text>
                    }
                    ListEmptyComponent={
                        <Text style={Styles.emptyText}>{t('No uploads yet.')}</Text>
                    }
                    renderItem={renderCompetitionMediaItem}
                />
            )}

            {!isCompetitionList && !isCompetitionMedia && (
                <FlatList
                    data={isProfitView ? profitList : downloads}
                    keyExtractor={(item: any) => (isProfitView ? String(item.id) : String(item.download.download_id))}
                    numColumns={isProfitView ? 1 : 2}
                    columnWrapperStyle={isProfitView ? undefined : Styles.gridRow}
                    contentContainerStyle={[Styles.listContent, {paddingBottom: insets.bottom > 0 ? insets.bottom + 20 : 40}]}
                    ListHeaderComponent={isProfitView ? null : <Text style={Styles.sectionTitle}>{t('Downloads')}</Text>}
                    ListEmptyComponent={
                        errorText && !isProfitView ? (
                            <Text style={Styles.errorText}>{errorText}</Text>
                        ) : (
                            <Text style={Styles.emptyText}>
                                {isProfitView ? t('No uploads yet.') : t('No downloads yet.')}
                            </Text>
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
