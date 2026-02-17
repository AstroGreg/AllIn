import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ArrowLeft2,
    ArrowRight2,
    Setting5,
    TickSquare,
} from 'iconsax-react-nativejs';
import { createStyles } from './CompetitionsScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Icons from '../../constants/Icons';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventsContext';
import { ApiError, getHubAppearances, type HubAppearanceSummary, searchEvents, type SubscribedEvent } from '../../services/apiGateway';

const CompetitionsScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const { apiAccessToken } = useAuth();
    const { events: subscribedEvents } = useEvents();
    const [activeTab, setActiveTab] = useState<'track' | 'field'>('track');
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [showSubscribedOnly, setShowSubscribedOnly] = useState(true);
    const [showWithVideosOnly, setShowWithVideosOnly] = useState(true);

    const [allEvents, setAllEvents] = useState<SubscribedEvent[]>([]);
    const [appearanceSummary, setAppearanceSummary] = useState<HubAppearanceSummary[]>([]);
    const [eventsError, setEventsError] = useState<string | null>(null);
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);

    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken) {
            setAllEvents([]);
            return () => {};
        }
        setIsLoadingEvents(true);
        setEventsError(null);
        searchEvents(apiAccessToken, { q: '', limit: 200 })
            .then((res) => {
                if (!mounted) return;
                const list = Array.isArray(res?.events) ? res.events : [];
                setAllEvents(list);
            })
            .catch((e: any) => {
                if (!mounted) return;
                const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
                setEventsError(msg);
                setAllEvents([]);
            })
            .finally(() => {
                if (mounted) setIsLoadingEvents(false);
            });
        return () => {
            mounted = false;
        };
    }, [apiAccessToken]);

    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken) {
            setAppearanceSummary([]);
            return () => {};
        }
        getHubAppearances(apiAccessToken)
            .then((res) => {
                if (!mounted) return;
                setAppearanceSummary(Array.isArray(res?.appearances) ? res.appearances : []);
            })
            .catch(() => {
                if (!mounted) return;
                setAppearanceSummary([]);
            });
        return () => {
            mounted = false;
        };
    }, [apiAccessToken]);

    const appearanceByEvent = useMemo(() => {
        const map = new Map<string, HubAppearanceSummary>();
        appearanceSummary.forEach((item) => {
            if (!item?.event_id) return;
            map.set(String(item.event_id), item);
        });
        return map;
    }, [appearanceSummary]);

    const subscribedIds = useMemo(
        () => new Set(subscribedEvents.map((event) => String(event.event_id))),
        [subscribedEvents],
    );

    const getEventTypeToken = useCallback((event: SubscribedEvent) => {
        return `${(event as any).competition_type || ''} ${(event as any).event_type || ''} ${event.event_name || ''} ${event.event_title || ''}`.toLowerCase();
    }, []);

    const resolveEventType = useCallback((event: SubscribedEvent) => {
        const name = getEventTypeToken(event);
        if (/javelin|discus|shot|hammer|pole|jump|field/.test(name)) return 'field';
        if (/marathon|trail|road|run|5k|10k|half|relay/.test(name)) return 'track';
        return 'track';
    }, [getEventTypeToken]);

    const resolveCompetitionType = useCallback((event: SubscribedEvent) => {
        const name = getEventTypeToken(event);
        if (/marathon|trail|road/.test(name)) return 'marathon';
        return 'track';
    }, [getEventTypeToken]);

    const combinedEvents = useMemo(() => {
        const map = new Map<string, SubscribedEvent>();
        allEvents.forEach((event) => {
            if (!event?.event_id) return;
            map.set(String(event.event_id), event);
        });
        subscribedEvents.forEach((event) => {
            if (!event?.event_id) return;
            if (!map.has(String(event.event_id))) {
                map.set(String(event.event_id), event);
            }
        });
        appearanceSummary.forEach((appearance) => {
            if (!appearance?.event_id) return;
            if (!map.has(String(appearance.event_id))) {
                map.set(String(appearance.event_id), {
                    event_id: String(appearance.event_id),
                    event_name: appearance.event_name ?? null,
                    event_location: appearance.event_location ?? null,
                    event_date: appearance.event_date ?? null,
                });
            }
        });
        return Array.from(map.values());
    }, [allEvents, appearanceSummary, subscribedEvents]);

    const filteredEvents = useMemo(() => {
        let list = combinedEvents;
        if (showSubscribedOnly) {
            list = list.filter((event) => subscribedIds.has(String(event.event_id)));
        }
        if (showWithVideosOnly) {
            list = list.filter((event) => {
                const appearance = appearanceByEvent.get(String(event.event_id));
                return Number(appearance?.videos_count ?? 0) > 0;
            });
        }
        list = list.filter((event) => resolveEventType(event) === activeTab);
        return list;
    }, [activeTab, appearanceByEvent, combinedEvents, resolveEventType, showSubscribedOnly, showWithVideosOnly, subscribedIds]);

    const renderEventCard = (item: any) => (
        <TouchableOpacity
            key={item.id}
            style={styles.eventCard}
            activeOpacity={0.7}
            onPress={() => {
                navigation.navigate('CompetitionDetailsScreen', {
                    eventId: item.eventId,
                    name: item.name,
                    description: item.description,
                    competitionType: item.competitionType,
                });
            }}
        >
            <Text style={styles.eventName}>{item.name}</Text>
            <View style={styles.eventRight}>
                {item.badges.length > 0 ? (
                    <View style={styles.badgesContainer}>
                        {item.badges.map((badge: string, index: number) => (
                            <View key={index} style={styles.badge}>
                                <Text style={styles.badgeText}>{t(badge)}</Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    <ArrowRight2 size={24} color={colors.subTextColor} variant="Linear" />
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={20} color={colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Competitions')}</Text>
                <TouchableOpacity style={styles.settingsButton}>
                    <Icons.Setting height={24} width={24} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Competition Info */}
                <View style={styles.competitionInfo}>
                    <Text style={styles.competitionTitle}>{t('Competitions')}</Text>
                    <Text style={styles.competitionDescription}>
                        {isLoadingEvents ? t('Loading competitions…') : `${combinedEvents.length} ${t('competitions available')}`}
                    </Text>
                </View>

                <SizeBox height={24} />

                {/* Toggle Button */}
                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        style={[styles.toggleButton, activeTab === 'track' && styles.toggleButtonActive]}
                        onPress={() => setActiveTab('track')}
                    >
                        <Text style={[styles.toggleText, activeTab === 'track' && styles.toggleTextActive]}>
                            {t('Track Events')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleButton, activeTab === 'field' && styles.toggleButtonActive]}
                        onPress={() => setActiveTab('field')}
                    >
                        <Text style={[styles.toggleText, activeTab === 'field' && styles.toggleTextActive]}>
                            {t('Field Events')}
                        </Text>
                    </TouchableOpacity>
                </View>

                <SizeBox height={24} />

                {/* Videos Section */}
                <View style={styles.sectionHeaderContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('Videos')}</Text>
                        <TouchableOpacity
                            style={styles.filterButton}
                            onPress={() => setShowFilterPopup(!showFilterPopup)}
                        >
                            <Setting5 size={16} color={colors.pureWhite} variant="Linear" />
                        </TouchableOpacity>
                    </View>

                    {/* Filter Popup */}
                    {showFilterPopup && (
                        <View style={styles.filterPopup}>
                            <TouchableOpacity
                                style={styles.filterOption}
                                onPress={() => setShowSubscribedOnly(!showSubscribedOnly)}
                            >
                                <Text style={styles.filterOptionText}>{t('Show only subscribed events')}</Text>
                                <View style={[styles.checkbox, showSubscribedOnly && styles.checkboxChecked]}>
                                    {showSubscribedOnly && (
                                        <TickSquare size={24} color={colors.primaryColor} variant="Bold" />
                                    )}
                                </View>
                            </TouchableOpacity>

                            <View style={styles.filterDivider} />

                            <TouchableOpacity
                                style={styles.filterOption}
                                onPress={() => setShowWithVideosOnly(!showWithVideosOnly)}
                            >
                                <Text style={styles.filterOptionText}>{t('Show only events with videos of me')}</Text>
                                <View style={[styles.checkbox, showWithVideosOnly && styles.checkboxChecked]}>
                                    {showWithVideosOnly && (
                                        <TickSquare size={24} color={colors.primaryColor} variant="Bold" />
                                    )}
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <SizeBox height={27} />

                {/* Events List */}
                <View style={styles.eventsList}>
                    {eventsError ? (
                        <Text style={styles.emptyStateText}>{eventsError}</Text>
                    ) : filteredEvents.length === 0 ? (
                        <Text style={styles.emptyStateText}>{t('No competitions found yet.')}</Text>
                    ) : (
                        filteredEvents.map((event) => {
                            const eventId = String(event.event_id);
                            const appearance = appearanceByEvent.get(eventId);
                            const badges: string[] = [];
                            if (appearance) badges.push('Found');
                            if (subscribedIds.has(eventId)) badges.push('Subscribed');
                            const location = event.event_location ? String(event.event_location) : '';
                            const date = event.event_date ? new Date(event.event_date).toLocaleDateString() : '';
                            const description = [location, date].filter(Boolean).join(' • ');
                            return renderEventCard({
                                id: eventId,
                                eventId,
                                name: event.event_name || event.event_title || t('Competition'),
                                description,
                                badges,
                                competitionType: resolveCompetitionType(event),
                            });
                        })
                    )}
                </View>

                <SizeBox height={24} />

                {/* Photos Section */}
                <Text style={styles.photosTitle}>{t('Photos')}</Text>

                <SizeBox height={24} />

                {/* Show All Photos Button */}
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => navigation.navigate('AllPhotosOfEvents', { eventName: t('All competitions') })}
                >
                    <Text style={styles.primaryButtonText}>{t('Show All Photos')}</Text>
                    <ArrowRight2 size={18} color={colors.pureWhite} variant="Linear" />
                </TouchableOpacity>

                <SizeBox height={40} />
            </ScrollView>
        </View>
    );
};

export default CompetitionsScreen;
