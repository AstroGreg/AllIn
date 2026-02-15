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
import { getMediaById, getMediaViewAll } from '../../services/apiGateway';
import { getApiBaseUrl } from '../../constants/RuntimeConfig';
import { useTranslation } from 'react-i18next'

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

    const photoIds = useMemo(
        () => [
            '87873d40-addf-4289-aa82-7cd300acdd94',
            '4ac31817-e954-4d22-934d-27f82ddf5163',
            '4fed0d64-9fd4-42c4-bf24-875aad683c6d',
        ],
        [],
    );
    const [photoMap, setPhotoMap] = useState<Record<string, string>>({});
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

    const appearances = [
        {
            id: 1,
            title: 'Sunrise 10K Community Run',
            found: '12 photos • 3 videos',
            location: 'Brussels',
            date: '27/05/2025',
            thumbnail: photoMap[photoIds[0]] ? { uri: photoMap[photoIds[0]] } : null,
            match: 'Face + Chest',
        },
        {
            id: 2,
            title: 'BK Studentent 23',
            found: '8 photos • 1 video',
            location: 'Ghent',
            date: '16/03/2025',
            thumbnail: photoMap[photoIds[1]] ? { uri: photoMap[photoIds[1]] } : null,
            match: 'Context',
        },
    ];

    const formatDateOnly = (value?: string | null) => {
        if (!value || value === '—') return '—';
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
            const title = event.event_name || event.event_title || 'Competition';
            const location = event.event_location || '—';
            const date = formatDateOnly(event.event_date || '—');
            const videoCount = mediaInfo?.videoCount ?? 0;
            return {
                id: eventId || `${index}`,
                title,
                status: 'Subscribed',
                media: `${videoCount} videos`,
                location,
                date,
                thumbnail: mediaInfo?.thumbUrl ? { uri: mediaInfo.thumbUrl } : null,
                competitionType: 'track',
            };
        });
    }, [events, mediaByEvent]);

    const createdMedia = [
        {
            id: 1,
            title: 'PK 400m Limburg 2025',
            comments: 3,
            type: 'Video',
            thumbnail: photoMap[photoIds[0]] ? { uri: photoMap[photoIds[0]] } : null,
            videoUri: '',
            location: 'Limburg, Belgium',
            date: '04/02/2026',
        },
        {
            id: 2,
            title: 'BK Studentent 23',
            comments: 1,
            type: 'Event',
            thumbnail: photoMap[photoIds[1]] ? { uri: photoMap[photoIds[1]] } : null,
            videoUri: '',
            location: 'Berlin, Germany',
            date: '27/05/2025',
        },
    ];

    const hubCards = useMemo(() => {
        const appearanceCards = appearances.map((item) => ({
            ...item,
            cardType: 'appearance',
        }));
        const eventCards = myCompetitions.map((item) => ({
            ...item,
            cardType: 'subscription',
        }));
        const uploadCards = createdMedia.map((item) => ({
            ...item,
            cardType: 'upload',
        }));
        return [...appearanceCards, ...eventCards, ...uploadCards];
    }, [appearances, myCompetitions, createdMedia]);

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
            navigation.navigate('AllPhotosOfEvents');
            return;
        }
        if (card.cardType === 'subscription') {
            navigation.navigate('CompetitionDetailsScreen', {
                name: card.title,
                description: `Competition held in ${card.location}`,
                competitionType: card.competitionType ?? 'track',
            });
            return;
        }
        navigation.navigate('VideoDetailsScreen', {
            video: {
                title: card.title,
                location: card.location,
                date: card.date,
                duration: '2 Minutes',
                uri: card.videoUri,
                thumbnail: card.thumbnail,
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
                            <View style={Styles.matchBadge}>
                                <Text style={Styles.matchBadgeText}>{card.match}</Text>
                            </View>
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
                                    {card.status}
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
                                <Text style={Styles.typeBadgeText}>{t('Upload')}</Text>
                            </View>
                        </View>
                        <Text style={Styles.cardSubtitle}>{card.type} · {card.comments} comments</Text>
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

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={20} color={colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{t('Hub')}</Text>
                <View style={{ width: 44, height: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {/* Competitions list */}
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
                                {option.label}
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
                    <Text style={Styles.primaryButtonText}>{t('Subscribe to a competition')}</Text>
                    <Icons.RightBtnIcon height={18} width={18} />
                </TouchableOpacity>

                {visibleCards.map(renderHubCard)}

                {canLoadMore && (
                    <TouchableOpacity style={Styles.loadMoreButton} onPress={() => setPage((prev) => prev + 1)}>
                        <Text style={Styles.loadMoreText}>{t('Load more')}</Text>
                    </TouchableOpacity>
                )}

                {/* Downloads */}
                <View style={Styles.sectionBlock}>
                    <Text style={Styles.sectionTitle}>{t('Downloads')}</Text>
                    <Text style={Styles.sectionSubtitle}>{t('Your saved photos and videos.')}</Text>
                </View>
                <TouchableOpacity style={Styles.downloadsCard} onPress={() => navigation.navigate('DownloadsDetailsScreen')}>
                    <View style={Styles.downloadsInfo}>
                        <Icons.Downloads height={24} width={24} />
                        <Text style={Styles.downloadsText}>{t('Total downloads')}</Text>
                        <Text style={Styles.downloadsNumber}>{t('346,456')}</Text>
                    </View>
                </TouchableOpacity>

                <SizeBox height={20} />
            </ScrollView>

            <Modal visible={infoModalVisible} transparent animationType="fade" onRequestClose={() => setInfoModalVisible(false)}>
                <View style={Styles.infoBackdrop}>
                    <View style={Styles.infoCard}>
                        <Text style={Styles.infoTitle}>{t('About this card')}</Text>
                        <Text style={Styles.infoText}>
                            {infoCard?.cardType === 'appearance' && 'This card shows where we found you in photos or videos and how you matched.'}
                            {infoCard?.cardType === 'subscription' && 'This card is a competition you subscribed to. Tap to open it.'}
                            {infoCard?.cardType === 'upload' && 'This card is media you uploaded. Tap to manage details and comments.'}
                        </Text>
                        <TouchableOpacity style={Styles.infoCheckRow} onPress={() => setNeverShowAgain((prev) => !prev)}>
                            <View style={[Styles.infoCheckBox, neverShowAgain && Styles.infoCheckBoxActive]}>
                                {neverShowAgain && <Text style={Styles.infoCheckMark}>{t('✓')}</Text>}
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