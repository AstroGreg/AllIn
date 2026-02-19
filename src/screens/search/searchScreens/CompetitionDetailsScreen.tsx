import { View, Text, TouchableOpacity, ScrollView, Switch, Modal, Image, TextInput, ActivityIndicator, Alert } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowLeft2, ArrowRight } from 'iconsax-react-nativejs'
import Icons from '../../../constants/Icons'
import Images from '../../../constants/Images'
import { createStyles } from './CompetitionDetailsScreenStyles'
import { useAuth } from '../../../context/AuthContext'
import { ApiError, CompetitionMapCheckpoint, CompetitionMapSummary, getCompetitionMapById, getCompetitionMaps, getEventCompetitions, searchEvents, searchFaceByEnrollment, searchMediaByBib, grantFaceRecognitionConsent, subscribeToEvent, unsubscribeToEvent } from '../../../services/apiGateway'
import { useTheme } from '../../../context/ThemeContext'
import { useTranslation } from 'react-i18next'
import { useEvents } from '../../../context/EventsContext'

interface EventCategory {
    id: number;
    name: string;
    badges?: string[];
    hasArrow?: boolean;
    thumbnail?: any;
}

interface Course {
    id: string;
    label: string;
    description: string;
    imageUrl?: string;
    checkpoints: Array<{ id: string; label: string }>;
}

const FALLBACK_COURSES: Course[] = [];

const CompetitionDetailsScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { apiAccessToken, userProfile } = useAuth();
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const { t } = useTranslation();
    const { events: subscribedEvents, refresh: refreshSubscribed } = useEvents();
    const [selectedTab, setSelectedTab] = useState<'track' | 'field'>('track');
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [checkpointModalVisible, setCheckpointModalVisible] = useState(false);
    const [selectedCheckpoint, setSelectedCheckpoint] = useState<{ id: string; label: string } | null>(null);
    const [courseOptions, setCourseOptions] = useState<Course[]>([]);
    const [mapError, setMapError] = useState<string | null>(null);
    const [aiCompareModalVisible, setAiCompareModalVisible] = useState(false);
    const [quickChestNumber, setQuickChestNumber] = useState('');
    const [quickSearchError, setQuickSearchError] = useState<string | null>(null);
    const [quickSearchLoading, setQuickSearchLoading] = useState(false);
    const [quickNeedsConsent, setQuickNeedsConsent] = useState(false);
    const [quickMissingAngles, setQuickMissingAngles] = useState<string[] | null>(null);
    const [quickUseFace, setQuickUseFace] = useState(true);
    const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false);

    const competitionName = route?.params?.name || route?.params?.eventName || t('Competition');
    const competitionDescription = route?.params?.description
        || [route?.params?.location, route?.params?.date].filter(Boolean).join(' • ')
        || t('Competition details');
    const competitionType: 'track' | 'marathon' = route?.params?.competitionType || 'track';
    const eventId = route?.params?.eventId as string | undefined;
    const competitionId = route?.params?.competitionId as string | undefined;
    const resolvedEventId = useMemo(() => String(eventId ?? competitionId ?? '').trim(), [competitionId, eventId]);
    const canSubscribe = resolvedEventId.length > 0;
    const isSubscribed = useMemo(
        () => canSubscribe && subscribedEvents.some((event) => String(event.event_id) === resolvedEventId),
        [canSubscribe, resolvedEventId, subscribedEvents],
    );

    useEffect(() => {
        const chest = String(userProfile?.chestNumber ?? '').trim();
        if (chest) setQuickChestNumber(chest);
    }, [userProfile?.chestNumber]);

    const trackEvents: EventCategory[] = [];
    const fieldEvents: EventCategory[] = [];

    const currentEvents = selectedTab === 'track' ? trackEvents : fieldEvents;

    const visibleCourses = courseOptions.length > 0 ? courseOptions : FALLBACK_COURSES;
    const showCoursesSection = competitionType === 'marathon' || visibleCourses.length > 0;

    const selectedCourse = useMemo(() => {
        if (visibleCourses.length === 0) return null;
        return visibleCourses.find((course) => course.id === selectedCourseId) ?? visibleCourses[0];
    }, [selectedCourseId, visibleCourses]);

    useEffect(() => {
        if (!apiAccessToken || (!eventId && !competitionId)) {
            if (courseOptions.length === 0) {
                setCourseOptions([]);
                setSelectedCourseId('');
            }
            return;
        }

        let isActive = true;
        const loadMaps = async () => {
            setMapError(null);
            try {
                const res = await getCompetitionMaps(apiAccessToken, {
                    event_id: eventId,
                    competition_id: competitionId,
                    include_checkpoints: true,
                });
                if (!isActive) return;
                const normalized = (res.maps || []).map((map: CompetitionMapSummary) => ({
                    id: map.id,
                    label: map.name ?? t('Course'),
                    description: map.name ? t('Course map') : t('Course map'),
                    imageUrl: map.image_url ?? undefined,
                    checkpoints: (map.checkpoints ?? []).map((cp: CompetitionMapCheckpoint) => ({
                        id: cp.id,
                        label: cp.label ?? `Checkpoint ${cp.checkpoint_index}`,
                    })),
                }));
                if (normalized.length > 0) {
                    setCourseOptions(normalized);
                    setSelectedCourseId((prev) =>
                        normalized.some((course) => course.id === prev) ? prev : normalized[0].id
                    );
                } else if (eventId) {
                    try {
                        const comps = await getEventCompetitions(apiAccessToken, String(eventId));
                        if (!isActive) return;
                        const fallbackCourses = (comps.competitions || []).map((comp) => ({
                            id: String(comp.id),
                            label: String(comp.competition_name || comp.competition_name_normalized || t('Course')),
                            description: t('Course'),
                            imageUrl: undefined,
                            checkpoints: [],
                        }));
                        setCourseOptions(fallbackCourses);
                        setSelectedCourseId((prev) =>
                            fallbackCourses.some((course) => course.id === prev) ? prev : (fallbackCourses[0]?.id || '')
                        );
                    } catch {
                        if (courseOptions.length === 0) {
                            setCourseOptions([]);
                        }
                    }
                } else if (courseOptions.length === 0) {
                    setCourseOptions([]);
                }
            } catch (e: any) {
                if (!isActive) return;
                const message = e instanceof ApiError ? e.message : String(e?.message ?? e);
                setMapError(message);
                if (eventId) {
                    try {
                        const comps = await getEventCompetitions(apiAccessToken, String(eventId));
                        if (!isActive) return;
                        const fallbackCourses = (comps.competitions || []).map((comp) => ({
                            id: String(comp.id),
                            label: String(comp.competition_name || comp.competition_name_normalized || t('Course')),
                            description: t('Course'),
                            imageUrl: undefined,
                            checkpoints: [],
                        }));
                        setCourseOptions(fallbackCourses);
                        setSelectedCourseId((prev) =>
                            fallbackCourses.some((course) => course.id === prev) ? prev : (fallbackCourses[0]?.id || '')
                        );
                    } catch {
                        if (courseOptions.length === 0) {
                            setCourseOptions([]);
                        }
                    }
                } else if (courseOptions.length === 0) {
                    setCourseOptions([]);
                }
            }
        };

        loadMaps();
        return () => {
            isActive = false;
        };
    }, [apiAccessToken, competitionId, competitionType, courseOptions.length, eventId, t]);

    useEffect(() => {
        if (!apiAccessToken) return;
        if (courseOptions.length === 0) return;

        const current = courseOptions.find((course) => course.id === selectedCourseId);
        if (!current || (current.checkpoints && current.checkpoints.length > 0)) return;

        let isActive = true;
        const loadCheckpoints = async () => {
            try {
                const res = await getCompetitionMapById(apiAccessToken, current.id);
                if (!isActive) return;
                setCourseOptions((prev) =>
                    prev.map((course) =>
                        course.id === current.id
                            ? {
                                ...course,
                                imageUrl: res.map.image_url ?? course.imageUrl,
                                checkpoints: (res.checkpoints ?? []).map((cp) => ({
                                    id: cp.id,
                                    label: cp.label ?? `Checkpoint ${cp.checkpoint_index}`,
                                })),
                            }
                            : course,
                    ),
                );
            } catch {
                // silent fallback
            }
        };

        loadCheckpoints();
        return () => {
            isActive = false;
        };
    }, [apiAccessToken, courseOptions, selectedCourseId]);

    const renderEventCard = (event: EventCategory) => (
        <TouchableOpacity
            key={event.id}
            style={styles.eventCard}
            onPress={() => navigation.navigate('EventDivisionScreen', {
                eventName: event.name,
                competitionName,
                eventId: eventId ?? competitionId,
            })}
        >
            <View style={styles.eventCardLeft}>
                <Image source={event.thumbnail ?? Images.photo1} style={styles.eventThumbnail} />
                <Text style={styles.eventCardName}>{event.name}</Text>
            </View>
            <View style={styles.eventCardRight}>
                {event.badges?.map((badge, index) => (
                    <View key={index} style={styles.badge}>
                        <Text style={styles.badgeText}>{badge}</Text>
                    </View>
                ))}
                {event.hasArrow && (
                    <ArrowRight size={20} color="#9B9F9F" variant="Linear" />
                )}
            </View>
        </TouchableOpacity>
    );

    const handleCheckpointPress = (checkpoint: { id: string; label: string }) => {
        setSelectedCheckpoint(checkpoint);
        setCheckpointModalVisible(true);
    };

    const resolveEventId = useCallback(async () => {
        if (eventId) return String(eventId);
        if (!apiAccessToken) return null;
        try {
            const res = await searchEvents(apiAccessToken, { q: competitionName, limit: 1 });
            const first = Array.isArray(res?.events) ? res.events[0] : null;
            return first?.event_id ? String(first.event_id) : null;
        } catch {
            return null;
        }
    }, [apiAccessToken, competitionName, eventId]);

    const runQuickCompare = useCallback(async () => {
        if (!apiAccessToken) {
            setQuickSearchError(t('Missing API token. Please log in again.'));
            return;
        }
        const resolvedId = await resolveEventId();
        if (!resolvedId) {
            setQuickSearchError(t('Could not resolve this competition.'));
            return;
        }
        const bibValue = quickChestNumber.trim();
        const wantsBib = bibValue.length > 0;
        const wantsFace = quickUseFace;
        if (!wantsBib && !wantsFace) {
            setQuickSearchError(t('Add a chest number or enable face search.'));
            return;
        }

        setQuickSearchLoading(true);
        setQuickSearchError(null);
        setQuickNeedsConsent(false);
        setQuickMissingAngles(null);

        const collected: any[] = [];
        const seen = new Set<string>();
        const addResults = (items: any[], matchType: string) => {
            for (const item of items) {
                const id = String(item.media_id ?? item.id ?? '');
                if (!id || seen.has(id)) continue;
                seen.add(id);
                collected.push({
                    ...item,
                    event_id: resolvedId,
                    event_name: competitionName,
                    match_type: matchType,
                });
            }
        };

        const errors: string[] = [];

        try {
            if (wantsBib) {
                try {
                    const res = await searchMediaByBib(apiAccessToken, { event_id: resolvedId, bib: bibValue });
                    const results = Array.isArray(res?.results) ? res.results : [];
                    addResults(results, 'bib');
                } catch (e: any) {
                    const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
                    errors.push(`${t('Chest number')}: ${msg}`);
                }
            }

            if (wantsFace) {
                try {
                    const res = await searchFaceByEnrollment(apiAccessToken, {
                        event_ids: [resolvedId],
                        label: 'default',
                        limit: 600,
                        top: 100,
                        save: true,
                    });
                    const results = Array.isArray(res?.results) ? res.results : [];
                    addResults(results, 'face');
                } catch (e: any) {
                    if (e instanceof ApiError) {
                        const body = e.body ?? {};
                        if (e.status === 403 && String(e.message).toLowerCase().includes('consent')) {
                            setQuickNeedsConsent(true);
                            errors.push(t('Face: consent required.'));
                        } else if (e.status === 400 && Array.isArray(body?.missing_angles)) {
                            setQuickMissingAngles(body.missing_angles.map(String));
                            errors.push(t('Face: enrollment required.'));
                        } else {
                            errors.push(`${t('Face')}: ${e.message}`);
                        }
                    } else {
                        errors.push(`${t('Face')}: ${String(e?.message ?? e)}`);
                    }
                }
            }

            if (collected.length === 0) {
                setQuickSearchError(errors[0] ?? t('No matches found.'));
                return;
            }

            setAiCompareModalVisible(false);
            navigation.navigate('AISearchResultsScreen', {
                matchedCount: collected.length,
                results: collected,
                matchType: 'combined',
            });
        } finally {
            setQuickSearchLoading(false);
        }
    }, [apiAccessToken, competitionName, navigation, quickChestNumber, quickUseFace, resolveEventId, t]);

    const handleGrantConsent = useCallback(async () => {
        if (!apiAccessToken) return;
        setQuickSearchError(null);
        try {
            await grantFaceRecognitionConsent(apiAccessToken);
            setQuickNeedsConsent(false);
        } catch (e: any) {
            const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
            setQuickSearchError(msg);
        }
    }, [apiAccessToken]);

    const handleEnroll = useCallback(() => {
        setAiCompareModalVisible(false);
        navigation.navigate('SearchFaceCaptureScreen', {
            mode: 'enrolFace',
            afterEnroll: { screen: 'AISearchScreen' },
        });
    }, [navigation]);

    const handleSubscriptionToggle = useCallback(async () => {
        if (!apiAccessToken || !canSubscribe || isSubscriptionLoading) return;
        setIsSubscriptionLoading(true);
        try {
            if (isSubscribed) {
                await unsubscribeToEvent(apiAccessToken, resolvedEventId);
            } else {
                await subscribeToEvent(apiAccessToken, resolvedEventId);
            }
            await refreshSubscribed();
        } catch (e: any) {
            const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
            Alert.alert(isSubscribed ? t('Could not unsubscribe') : t('Could not subscribe'), msg);
        } finally {
            setIsSubscriptionLoading(false);
        }
    }, [apiAccessToken, canSubscribe, isSubscribed, isSubscriptionLoading, refreshSubscribed, resolvedEventId, t]);

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Competitions')}</Text>
                <View style={{ width: 44, height: 44 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Competition Info */}
                <Text style={styles.competitionName}>{competitionName}</Text>
                <SizeBox height={4} />
                <Text style={styles.competitionDescription}>{competitionDescription}</Text>
                {canSubscribe ? (
                    <>
                        <SizeBox height={12} />
                        <TouchableOpacity
                            style={[
                                styles.subscribeButton,
                                isSubscriptionLoading && styles.subscribeButtonDisabled,
                            ]}
                            onPress={handleSubscriptionToggle}
                            disabled={isSubscriptionLoading}
                        >
                            {isSubscriptionLoading ? (
                                <ActivityIndicator color={colors.pureWhite} />
                            ) : (
                                <Text style={styles.subscribeButtonText}>
                                    {isSubscribed ? t('Unsubscribe') : t('subscribeToEvent')}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </>
                ) : null}

                <SizeBox height={20} />

                {showCoursesSection ? (
                    <>
                        <Text style={styles.sectionTitle}>{t('Courses')}</Text>
                        <SizeBox height={12} />
                        {visibleCourses.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateText}>{t('No courses available yet.')}</Text>
                            </View>
                        ) : (
                            <>
                                <View style={styles.courseList}>
                                    {visibleCourses.map((course) => {
                                        const isActive = course.id === selectedCourse?.id;
                                        return (
                                            <TouchableOpacity
                                                key={course.id}
                                                style={[styles.courseCard, isActive && styles.courseCardActive]}
                                                onPress={() => setSelectedCourseId(course.id)}
                                            >
                                                <Text style={[styles.courseTitle, isActive && styles.courseTitleActive]}>{course.label}</Text>
                                                <Text style={[styles.courseDescription, isActive && styles.courseDescriptionActive]}>{course.description}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                <SizeBox height={20} />

                                <Text style={styles.sectionTitle}>{t('Course map')}</Text>
                                <SizeBox height={12} />
                                <View style={styles.mapCard}>
                                    <Image
                                        source={selectedCourse?.imageUrl ? { uri: selectedCourse.imageUrl } : Images.map}
                                        style={styles.mapImage}
                                        resizeMode="cover"
                                    />
                                </View>
                                {mapError && (
                                    <>
                                        <SizeBox height={8} />
                                        <Text style={styles.helperText}>{t('Map data unavailable. Showing placeholder map.')}</Text>
                                    </>
                                )}

                                <SizeBox height={16} />

                                <Text style={styles.sectionTitle}>{t('Checkpoints')}</Text>
                                <SizeBox height={10} />
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {selectedCourse?.checkpoints.map((checkpoint) => (
                                        <TouchableOpacity
                                            key={checkpoint.id}
                                            style={styles.checkpointChip}
                                            onPress={() => handleCheckpointPress(checkpoint)}
                                        >
                                            <Text style={styles.checkpointChipText}>{checkpoint.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                                <SizeBox height={8} />
                                <Text style={styles.helperText}>{t('Tap a checkpoint to search photos, videos, or AI.')}</Text>
                            </>
                        )}

                        <SizeBox height={insets.bottom > 0 ? insets.bottom + 80 : 100} />
                    </>
                ) : (
                    <>
                        {/* Tabs */}
                        <View style={styles.tabsContainer}>
                            <TouchableOpacity
                                style={[styles.tab, selectedTab === 'track' && styles.tabActive]}
                                onPress={() => setSelectedTab('track')}
                            >
                                <Text style={[styles.tabText, selectedTab === 'track' && styles.tabTextActive]}>
                                    {t('Track events')}
                                </Text>
                                <ArrowRight
                                    size={16}
                                    color={selectedTab === 'track' ? colors.mainTextColor : colors.subTextColor}
                                    variant="Linear"
                                />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.tab, selectedTab === 'field' && styles.tabActive]}
                                onPress={() => setSelectedTab('field')}
                            >
                                <Text style={[styles.tabText, selectedTab === 'field' && styles.tabTextActive]}>
                                    {t('Field events')}
                                </Text>
                                <ArrowRight
                                    size={16}
                                    color={selectedTab === 'field' ? colors.mainTextColor : colors.subTextColor}
                                    variant="Linear"
                                />
                            </TouchableOpacity>
                        </View>

                        <SizeBox height={20} />

                        {/* Videos Section */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{t('Videos')}</Text>
                            <View style={styles.sectionIcons}>
                            <TouchableOpacity
                                style={styles.sectionIconButton}
                                onPress={() => {
                                    setQuickSearchError(null);
                                    setQuickNeedsConsent(false);
                                    setQuickMissingAngles(null);
                                    setAiCompareModalVisible(true);
                                }}
                            >
                                <Icons.AiWhiteBordered width={20} height={20} />
                            </TouchableOpacity>
                            </View>
                        </View>

                        <SizeBox height={16} />

                        {/* Event Categories */}
                        {currentEvents.length > 0 ? currentEvents.map(renderEventCard) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateText}>{t('No events available yet.')}</Text>
                            </View>
                        )}

                        <SizeBox height={16} />

                        {/* Show All Videos Button */}
                        <TouchableOpacity
                            style={styles.showAllButton}
                            onPress={() => navigation.navigate('AllVideosOfEvents', {
                                eventName: competitionName,
                                eventId: eventId ?? competitionId,
                            })}
                        >
                            <Text style={styles.showAllButtonText}>{t('Show All Videos')}</Text>
                            <ArrowRight size={18} color={colors.pureWhite} variant="Linear" />
                        </TouchableOpacity>

                        <SizeBox height={24} />

                        {/* Photos Section */}
                        <Text style={styles.sectionTitle}>{t('Photos')}</Text>

                        <SizeBox height={16} />

                        {/* Show All Photos Button */}
                        <TouchableOpacity
                            style={styles.showAllPhotosButton}
                            onPress={() => navigation.navigate('AllPhotosOfEvents', {
                                eventName: competitionName,
                                eventId: eventId ?? competitionId,
                            })}
                        >
                            <Text style={styles.showAllPhotosButtonText}>{t('Show All Photos')}</Text>
                            <ArrowRight size={18} color={colors.primaryColor} variant="Linear" />
                        </TouchableOpacity>

                        <SizeBox height={insets.bottom > 0 ? insets.bottom + 100 : 120} />
                    </>
                )}
            </ScrollView>

            <Modal
                visible={checkpointModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setCheckpointModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setCheckpointModalVisible(false)}
                >
                    <TouchableOpacity style={styles.checkpointModal} activeOpacity={1}>
                        <Text style={styles.modalTitle}>{t('Search')} {selectedCheckpoint?.label}</Text>
                        <SizeBox height={16} />
                        <TouchableOpacity
                            style={styles.modalPrimaryButton}
                            onPress={() => {
                                setCheckpointModalVisible(false);
                                navigation.navigate('AllPhotosOfEvents', {
                                    checkpoint: selectedCheckpoint,
                                    eventId: eventId ?? competitionId,
                                    eventName: competitionName,
                                });
                            }}
                        >
                            <Text style={styles.modalPrimaryButtonText}>{t('Search Photos')}</Text>
                            <ArrowRight size={18} color={colors.pureWhite} variant="Linear" />
                        </TouchableOpacity>
                        <SizeBox height={12} />
                        <TouchableOpacity
                            style={styles.modalSecondaryButton}
                            onPress={() => {
                                setCheckpointModalVisible(false);
                                navigation.navigate('VideosForEvent', {
                                    eventName: competitionName,
                                    eventId: eventId ?? competitionId,
                                    checkpoint: selectedCheckpoint,
                                });
                            }}
                        >
                            <Text style={styles.modalSecondaryButtonText}>{t('Search Videos')}</Text>
                            <ArrowRight size={18} color={colors.primaryColor} variant="Linear" />
                        </TouchableOpacity>
                        <SizeBox height={12} />
                        <TouchableOpacity
                            style={styles.modalTertiaryButton}
                            onPress={() => {
                                setCheckpointModalVisible(false);
                                setQuickSearchError(null);
                                setQuickNeedsConsent(false);
                                setQuickMissingAngles(null);
                                setAiCompareModalVisible(true);
                            }}
                        >
                            <Text style={styles.modalTertiaryButtonText}>{t('AI Search')}</Text>
                            <ArrowRight size={18} color={colors.primaryColor} variant="Linear" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            <Modal
                visible={aiCompareModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setAiCompareModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setAiCompareModalVisible(false)}
                >
                    <TouchableOpacity style={styles.checkpointModal} activeOpacity={1}>
                        <Text style={styles.modalTitle}>{t('AI quick compare')}</Text>
                        <SizeBox height={12} />
                        <Text style={styles.helperText}>
                            {t('Use your chest number and optionally Face ID to find results in this competition.')}
                        </Text>
                        <SizeBox height={16} />
                        <Text style={styles.modalLabel}>{t('Chest number')}</Text>
                        <View style={styles.modalInputRow}>
                            <TextInput
                                style={styles.modalInput}
                                placeholder={t('e.g. 1234')}
                                placeholderTextColor="#9B9F9F"
                                keyboardType="number-pad"
                                value={quickChestNumber}
                                onChangeText={setQuickChestNumber}
                            />
                        </View>
                        <SizeBox height={12} />
                        <Text style={styles.modalLabel}>{t('Face ID')}</Text>
                        <View style={styles.toggleRow}>
                            <View>
                                <Text style={styles.toggleLabel}>{t('Use Face ID')}</Text>
                                <Text style={styles.toggleHint}>{t('Match your enrolled face in this competition')}</Text>
                            </View>
                            <Switch
                                value={quickUseFace}
                                onValueChange={setQuickUseFace}
                                trackColor={{ false: colors.lightGrayColor, true: colors.primaryColor }}
                                thumbColor={colors.pureWhite}
                            />
                        </View>
                        {quickSearchError ? (
                            <>
                                <SizeBox height={10} />
                                <Text style={styles.modalErrorText}>{quickSearchError}</Text>
                            </>
                        ) : null}
                        {quickUseFace && quickNeedsConsent && (
                            <>
                                <SizeBox height={10} />
                                <TouchableOpacity style={styles.modalSecondaryButton} onPress={handleGrantConsent}>
                                    <Text style={styles.modalSecondaryButtonText}>{t('Grant face consent')}</Text>
                                </TouchableOpacity>
                            </>
                        )}
                        {quickUseFace && quickMissingAngles && (
                            <>
                                <SizeBox height={10} />
                                <TouchableOpacity style={styles.modalSecondaryButton} onPress={handleEnroll}>
                                    <Text style={styles.modalSecondaryButtonText}>{t('Enroll your face')}</Text>
                                </TouchableOpacity>
                            </>
                        )}
                        <SizeBox height={16} />
                        <TouchableOpacity
                            style={[styles.modalPrimaryButton, quickSearchLoading && styles.modalPrimaryButtonDisabled]}
                            onPress={runQuickCompare}
                            disabled={quickSearchLoading}
                        >
                            {quickSearchLoading ? (
                                <ActivityIndicator color={colors.pureWhite} />
                            ) : (
                                <>
                                    <Text style={styles.modalPrimaryButtonText}>{t('Compare now')}</Text>
                                    <ArrowRight size={18} color={colors.pureWhite} variant="Linear" />
                                </>
                            )}
                        </TouchableOpacity>
                        <SizeBox height={12} />
                        <TouchableOpacity
                            style={styles.modalSecondaryButton}
                            onPress={() => setAiCompareModalVisible(false)}
                        >
                            <Text style={styles.modalSecondaryButtonText}>{t('Cancel')}</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

export default CompetitionDetailsScreen
