import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import {
    ArrowLeft2,
    Calendar,
    Location,
    VideoSquare,
} from 'iconsax-react-nativejs';
import { createStyles } from './HubScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Icons from '../../constants/Icons';
import { useTheme } from '../../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventsContext';
import { getHubAppearances, getHubUploads, getMediaViewAll } from '../../services/apiGateway';
import { getApiBaseUrl } from '../../constants/RuntimeConfig';
import { useTranslation } from 'react-i18next';

const HubScreen = ({ navigation }: any) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { apiAccessToken } = useAuth();
    const { events } = useEvents();

    const [filterType, setFilterType] = useState<'all' | 'appearance' | 'subscription' | 'upload'>('all');
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState('');
    const [hiddenCardInfo, setHiddenCardInfo] = useState<Record<string, boolean>>({});
    const [infoModalVisible, setInfoModalVisible] = useState(false);
    const [infoCard, setInfoCard] = useState<any | null>(null);
    const [neverShowAgain, setNeverShowAgain] = useState(false);

    const [appearanceCardsData, setAppearanceCardsData] = useState<any[]>([]);
    const [uploadCardsData, setUploadCardsData] = useState<any[]>([]);
    const [mediaByEvent, setMediaByEvent] = useState<Record<string, { thumbUrl?: string; videoCount: number }>>({});

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

    const normalizeThumb = useCallback((value?: string | null) => {
        if (!value) return null;
        const resolved = toAbsoluteUrl(String(value));
        return withAccessToken(resolved) || resolved;
    }, [toAbsoluteUrl, withAccessToken]);

    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken) return () => {};
        const load = async () => {
            try {
                const res = await getHubAppearances(apiAccessToken);
                if (!mounted) return;
                const list = Array.isArray(res?.appearances) ? res.appearances : [];
                setAppearanceCardsData(
                    list.map((item) => ({
                        id: item.event_id,
                        eventId: item.event_id,
                        title: item.event_name || t('competition'),
                        found: `${Number(item.photos_count ?? 0)} ${t('photos')} | ${Number(item.videos_count ?? 0)} ${t('videos')}`,
                        location: item.event_location ?? '-',
                        date: item.event_date ?? '-',
                        thumbnail: item.thumbnail_url ? { uri: item.thumbnail_url } : null,
                        matchTypes: item.match_types ?? [],
                        cardType: 'appearance',
                    })),
                );
            } catch {
                if (!mounted) return;
                setAppearanceCardsData([]);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, t]);

    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken) return () => {};
        getMediaViewAll(apiAccessToken)
            .then((items) => {
                if (!mounted) return;
                const map: Record<string, { thumbUrl?: string; videoCount: number }> = {};
                items.forEach((media) => {
                    const eventId = media.event_id ? String(media.event_id) : '';
                    if (!eventId) return;
                    const entry = map[eventId] || { videoCount: 0, thumbUrl: undefined };
                    if (!entry.thumbUrl) {
                        const candidate = media.thumbnail_url || media.preview_url || media.full_url || media.raw_url || null;
                        entry.thumbUrl = normalizeThumb(candidate) || undefined;
                    }
                    if (String(media.type).toLowerCase() === 'video') {
                        entry.videoCount += 1;
                    }
                    map[eventId] = entry;
                });
                setMediaByEvent(map);
            })
            .catch(() => {});
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, normalizeThumb]);

    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken) return () => {};
        const load = async () => {
            try {
                const res = await getHubUploads(apiAccessToken);
                if (!mounted) return;
                const list = Array.isArray(res?.results) ? res.results : [];
                setUploadCardsData(
                    list.map((item) => ({
                        id: item.media_id,
                        mediaId: item.media_id,
                        eventId: item.event_id ?? null,
                        title: item.event_name || t('upload'),
                        likes: Number(item.likes_count ?? 0),
                        views: Number(item.views_count ?? 0),
                        labelsYes: Number(item.labels_yes ?? 0),
                        labelsNo: Number(item.labels_no ?? 0),
                        labelsTotal: Number(item.labels_total ?? 0),
                        type: String(item.type || 'image'),
                        thumbnail: item.thumbnail_url ? { uri: item.thumbnail_url } : null,
                        previewUrl: item.preview_url,
                        originalUrl: item.original_url,
                        fullUrl: item.full_url,
                        rawUrl: item.raw_url,
                        hlsManifestPath: item.hls_manifest_path,
                        cardType: 'upload',
                    })),
                );
            } catch {
                if (!mounted) return;
                setUploadCardsData([]);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, t]);

    const formatDateOnly = (value?: string | null) => {
        if (!value || value === '-') return '-';
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) {
            return value;
        }
        const day = String(parsed.getDate()).padStart(2, '0');
        const month = String(parsed.getMonth() + 1).padStart(2, '0');
        const year = parsed.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const myCompetitions = useMemo(() => {
        return (events || []).map((event, index) => {
            const eventId = String(event.event_id);
            const mediaInfo = mediaByEvent[eventId];
            const title = event.event_name || event.event_title || t('competition');
            const location = event.event_location || '-';
            const date = formatDateOnly(event.event_date || '-');
            const videoCount = mediaInfo?.videoCount ?? 0;
            return {
                id: eventId || `${index}`,
                eventId,
                title,
                status: 'Subscribed',
                media: `${videoCount} ${t('videos')}`,
                location,
                date,
                thumbnail: mediaInfo?.thumbUrl ? { uri: mediaInfo.thumbUrl } : null,
                competitionType: 'track',
                cardType: 'subscription',
            };
        });
    }, [events, mediaByEvent, t]);

    const hubCards = useMemo(() => {
        return [...appearanceCardsData, ...myCompetitions, ...uploadCardsData];
    }, [appearanceCardsData, myCompetitions, uploadCardsData]);

    const filteredCards = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        const baseList = filterType === 'all'
            ? hubCards
            : hubCards.filter((card) => card.cardType === filterType);
        if (!normalizedQuery) return baseList;
        const matchesQuery = (value?: string | number | null) =>
            String(value ?? '').toLowerCase().includes(normalizedQuery);
        return baseList.filter((card) => {
            if (card.cardType === 'appearance') {
                return (
                    matchesQuery(card.title) ||
                    matchesQuery(card.found) ||
                    matchesQuery(card.location) ||
                    matchesQuery(card.date) ||
                    matchesQuery(card.match)
                );
            }
            if (card.cardType === 'subscription') {
                return (
                    matchesQuery(card.title) ||
                    matchesQuery(card.status) ||
                    matchesQuery(card.media) ||
                    matchesQuery(card.location) ||
                    matchesQuery(card.date)
                );
            }
            return (
                matchesQuery(card.title) ||
                matchesQuery(card.type) ||
                matchesQuery(card.comments) ||
                matchesQuery(card.location) ||
                matchesQuery(card.date)
            );
        });
    }, [filterType, hubCards, query]);

    const pageSize = 5;
    const visibleCards = filteredCards.slice(0, page * pageSize);
    const canLoadMore = visibleCards.length < filteredCards.length;

    useEffect(() => {
        setPage(1);
    }, [filterType, query]);

    useEffect(() => {
        const loadHidden = async () => {
            const entries = await Promise.all(
                ['appearance', 'subscription', 'upload'].map(async (type) => {
                    const value = await AsyncStorage.getItem(`hub_card_info_hidden_${type}`);
                    return [type, value === 'true'] as const;
                })
            );
            setHiddenCardInfo(Object.fromEntries(entries));
        };
        loadHidden();
    }, []);

    const openCardAction = (card: any) => {
        if (card.cardType === 'appearance') {
            navigation.navigate('AllPhotosOfEvents', {
                eventId: card.eventId ?? card.id,
                eventName: card.title,
                appearanceOnly: true,
            });
            return;
        }
        if (card.cardType === 'subscription') {
            navigation.navigate('CompetitionDetailsScreen', {
                name: card.title,
                description: `${t('Competition held in')} ${card.location}`,
                competitionType: card.competitionType ?? 'track',
                eventId: card.eventId ?? card.id,
            });
            return;
        }
        navigation.navigate('PhotoDetailScreen', {
            eventTitle: card.title,
            media: {
                id: card.mediaId ?? card.id,
                type: card.type,
                eventId: card.eventId ?? null,
                thumbnailUrl: card.thumbnail?.uri,
                previewUrl: card.previewUrl,
                originalUrl: card.originalUrl,
                fullUrl: card.fullUrl,
                rawUrl: card.rawUrl,
                hlsManifestPath: card.hlsManifestPath,
            },
        });
    };

    const handleCardPress = (card: any) => {
        const hideInfo = hiddenCardInfo[card.cardType];
        if (hideInfo) {
            openCardAction(card);
            return;
        }
        setInfoCard(card);
        setNeverShowAgain(false);
        setInfoModalVisible(true);
    };

    const handleInfoContinue = async () => {
        if (infoCard && neverShowAgain) {
            await AsyncStorage.setItem(`hub_card_info_hidden_${infoCard.cardType}`, 'true');
            setHiddenCardInfo((prev) => ({ ...prev, [infoCard.cardType]: true }));
        }
        setInfoModalVisible(false);
        if (infoCard) {
            openCardAction(infoCard);
        }
    };

    const getUploadTypeLabel = (type?: string) => {
        const normalized = String(type || '').toLowerCase();
        if (normalized === 'video') return t('Video');
        if (normalized === 'image' || normalized === 'photo') return t('Photo');
        return t('media');
    };

    const renderHubCard = (card: any) => {
        if (card.cardType === 'appearance') {
            return (
                <TouchableOpacity key={`appearance-${card.id}`} style={Styles.hubCard} activeOpacity={0.8} onPress={() => handleCardPress(card)}>
                    <View style={Styles.hubCardRow}>
                        {card.thumbnail ? (
                            <FastImage source={card.thumbnail} style={Styles.squareThumbnail} resizeMode="cover" />
                        ) : (
                            <View style={Styles.squareThumbnailPlaceholder} />
                        )}
                        <View style={Styles.cardInfo}>
                            <View style={Styles.cardHeaderRow}>
                                <Text style={Styles.cardTitle} numberOfLines={2}>{card.title}</Text>
                                <View style={Styles.typeBadge}>
                                    <Text style={Styles.typeBadgeText}>{t('Appearance')}</Text>
                                </View>
                            </View>
                            <Text style={Styles.cardSubtitle}>{card.found}</Text>
                            <View style={Styles.detailValue}>
                                <Location size={14} color={colors.grayColor} variant="Linear" />
                                <Text style={[Styles.detailText, Styles.detailTextTruncate]} numberOfLines={1} ellipsizeMode="tail">
                                    {card.location}
                                </Text>
                                <View style={Styles.detailDot} />
                                <Calendar size={14} color={colors.grayColor} variant="Linear" />
                                <Text style={Styles.detailText}>{card.date}</Text>
                            </View>
                            {card.matchTypes?.length ? (
                                <View style={Styles.matchBadge}>
                                    <Text style={Styles.matchBadgeText}>
                                        {card.matchTypes.includes('face') && card.matchTypes.includes('bib')
                                            ? t('Face + Chest')
                                            : card.matchTypes.includes('face')
                                                ? t('Face')
                                                : card.matchTypes.includes('bib')
                                                    ? t('Chest')
                                                    : t('Match')}
                                    </Text>
                                </View>
                            ) : null}
                        </View>
                    </View>
                </TouchableOpacity>
            );
        }

        if (card.cardType === 'subscription') {
            return (
                <TouchableOpacity key={`event-${card.id}`} style={Styles.hubCard} activeOpacity={0.8} onPress={() => handleCardPress(card)}>
                    <View style={Styles.hubCardRow}>
                        {card.thumbnail ? (
                            <FastImage source={card.thumbnail} style={Styles.squareThumbnail} resizeMode="cover" />
                        ) : (
                            <View style={Styles.squareThumbnailPlaceholder} />
                        )}
                        <View style={Styles.cardInfo}>
                            <View style={Styles.cardHeaderRow}>
                                <Text style={Styles.cardTitle} numberOfLines={2}>{card.title}</Text>
                                <View style={[Styles.statusBadge, card.status === 'Completed' ? Styles.statusDone : Styles.statusActive]}>
                                    <Text style={[Styles.statusText, card.status !== 'Completed' && Styles.statusTextActive]}>
                                        {t(card.status)}
                                    </Text>
                                </View>
                            </View>
                            <Text style={Styles.cardSubtitle}>{t('Subscribed competition')}</Text>
                            <View style={Styles.detailValue}>
                                <VideoSquare size={14} color={colors.grayColor} variant="Linear" />
                                <Text style={Styles.detailText}>{card.media}</Text>
                                <View style={Styles.detailDot} />
                                <Location size={14} color={colors.grayColor} variant="Linear" />
                                <Text style={[Styles.detailText, Styles.detailTextTruncate]} numberOfLines={1} ellipsizeMode="tail">
                                    {card.location}
                                </Text>
                            </View>
                            <Text style={Styles.detailText}>{formatDateOnly(card.date)}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            );
        }

        return (
            <TouchableOpacity key={`upload-${card.id}`} style={Styles.hubCard} activeOpacity={0.8} onPress={() => handleCardPress(card)}>
                <View style={Styles.hubCardRow}>
                    {card.thumbnail ? (
                        <FastImage source={card.thumbnail} style={Styles.squareThumbnail} resizeMode="cover" />
                    ) : (
                        <View style={Styles.squareThumbnailPlaceholder} />
                    )}
                    <View style={Styles.cardInfo}>
                        <View style={Styles.cardHeaderRow}>
                            <Text style={Styles.cardTitle} numberOfLines={2}>{card.title}</Text>
                            <View style={Styles.typeBadge}>
                                <Text style={Styles.typeBadgeText}>{t('upload')}</Text>
                            </View>
                        </View>
                        <Text style={Styles.cardSubtitle}>
                            {getUploadTypeLabel(card.type)} | {card.labelsTotal > 0 ? `${card.labelsYes} ${t('yes')} | ${card.labelsNo} ${t('no')}` : t('No feedback yet')}
                        </Text>
                        <TouchableOpacity style={Styles.feedbackButton}>
                            <Text style={Styles.feedbackButtonText}>{t('Manage upload')}</Text>
                            <Icons.RightBtnIcon height={16} width={16} />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            <View style={Styles.header}>
                <TouchableOpacity style={Styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={20} color={colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{t('Hub')}</Text>
                <View style={{ width: 44, height: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                <View style={Styles.sectionBlock}>
                    <Text style={Styles.sectionTitle}>{t('Competitions')}</Text>
                    <Text style={Styles.sectionSubtitle}>{t('Appearances, subscriptions, and your uploads.')}</Text>
                </View>

                <View style={Styles.filterRow}>
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'appearance', label: 'Appearances' },
                        { key: 'subscription', label: 'Subscribed' },
                        { key: 'upload', label: 'Uploads' },
                    ].map((option) => (
                        <TouchableOpacity
                            key={option.key}
                            style={[
                                Styles.filterChip,
                                filterType === option.key && Styles.filterChipActive,
                            ]}
                            onPress={() => setFilterType(option.key as any)}
                        >
                            <Text
                                style={[
                                    Styles.filterChipText,
                                    filterType === option.key && Styles.filterChipTextActive,
                                ]}
                            >
                                {t(option.label)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={Styles.searchRow}>
                    <View style={Styles.searchField}>
                        <Icons.Search width={16} height={16} />
                        <TextInput
                            placeholder={t('Search competitions, appearances, uploads')}
                            placeholderTextColor={colors.grayColor}
                            value={query}
                            onChangeText={setQuery}
                            style={Styles.searchInput}
                            returnKeyType="search"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={Styles.primaryButton}
                    onPress={() => navigation.navigate('AvailableEventsScreen')}
                >
                    <Text style={Styles.primaryButtonText}>{t('subscribeCompetition')}</Text>
                    <Icons.RightBtnIcon height={18} width={18} />
                </TouchableOpacity>

                {visibleCards.map(renderHubCard)}

                {canLoadMore && (
                    <TouchableOpacity style={Styles.loadMoreButton} onPress={() => setPage((prev) => prev + 1)}>
                        <Text style={Styles.loadMoreText}>{t('Load more')}</Text>
                    </TouchableOpacity>
                )}

                <View style={Styles.sectionBlock}>
                    <Text style={Styles.sectionTitle}>{t('Downloads')}</Text>
                    <Text style={Styles.sectionSubtitle}>{t('Your saved photos and videos.')}</Text>
                </View>
                <TouchableOpacity style={Styles.downloadsCard} onPress={() => navigation.navigate('DownloadsDetailsScreen')}>
                    <View style={Styles.downloadsInfo}>
                        <Icons.Downloads height={24} width={24} />
                        <Text style={Styles.downloadsText}>{t('Total downloads')}</Text>
                        <Text style={Styles.downloadsNumber}>{'346,456'}</Text>
                    </View>
                </TouchableOpacity>

                <SizeBox height={20} />
            </ScrollView>

            <Modal visible={infoModalVisible} transparent animationType="fade" onRequestClose={() => setInfoModalVisible(false)}>
                <View style={Styles.infoBackdrop}>
                    <View style={Styles.infoCard}>
                        <Text style={Styles.infoTitle}>{t('About this card')}</Text>
                        <Text style={Styles.infoText}>
                            {infoCard?.cardType === 'appearance' && t('This card shows where we found you in photos or videos and how you matched.')}
                            {infoCard?.cardType === 'subscription' && t('This card is a competition you subscribed to. Tap to open it.')}
                            {infoCard?.cardType === 'upload' && t('This card is media you uploaded. Tap to manage details and comments.')}
                        </Text>
                        <TouchableOpacity style={Styles.infoCheckRow} onPress={() => setNeverShowAgain((prev) => !prev)}>
                            <View style={[Styles.infoCheckBox, neverShowAgain && Styles.infoCheckBoxActive]}>
                                {neverShowAgain && <Text style={Styles.infoCheckMark}>✓</Text>}
                            </View>
                            <Text style={Styles.infoCheckText}>{t('Never show again')}</Text>
                        </TouchableOpacity>
                        <View style={Styles.infoButtonsRow}>
                            <TouchableOpacity style={Styles.infoCancelButton} onPress={() => setInfoModalVisible(false)}>
                                <Text style={Styles.infoCancelText}>{t('Close')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={Styles.infoConfirmButton} onPress={handleInfoContinue}>
                                <Text style={Styles.infoConfirmText}>{t('Continue')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default HubScreen;
