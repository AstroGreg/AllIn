import { View, Text, TouchableOpacity, ScrollView, Switch, Modal, Image, ActivityIndicator, Alert, InteractionManager } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowLeft2, ArrowRight } from 'iconsax-react-nativejs'
import Icons from '../../../constants/Icons'
import { createStyles } from './CompetitionDetailsScreenStyles'
import { useAuth } from '../../../context/AuthContext'
import { ApiError, CompetitionMapCheckpoint, CompetitionMapSummary, getCompetitionMapById, getCompetitionMaps, getEventCompetitions, getProfileSummary, searchEvents, searchFaceByEnrollment, searchMediaByBib, grantFaceRecognitionConsent, unsubscribeToEvent } from '../../../services/apiGateway'
import { useTheme } from '../../../context/ThemeContext'
import { useTranslation } from 'react-i18next'
import UnifiedSearchInput from '../../../components/unifiedSearchInput/UnifiedSearchInput';
import { useEvents } from '../../../context/EventsContext'
import { getApiBaseUrl } from '../../../constants/RuntimeConfig';
import { getSportFocusLabel, normalizeFocusId, type SportFocusId } from '../../../utils/profileSelections';
import { buildSubscriptionDisciplineOptions, normalizeSubscriptionCategories, SUBSCRIPTION_ALL_DISCIPLINE_ID, SUBSCRIPTION_CATEGORY_OPTIONS, toggleSubscriptionCategory, toggleSubscriptionDiscipline } from '../../../utils/eventSubscription';

interface EventCategory {
    id: string | number;
    name: string;
    badges?: string[];
    hasArrow?: boolean;
    thumbnailUrl: string | null;
    group?: string | null;
}

interface Course {
    id: string;
    label: string;
    description: string;
    imageUrl?: string;
    disciplineId?: string | null;
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
    const [competitionFocusId, setCompetitionFocusId] = useState<SportFocusId | null>(
        normalizeFocusId(route?.params?.competitionFocus ?? route?.params?.competitionType),
    );
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [checkpointModalVisible, setCheckpointModalVisible] = useState(false);
    const [selectedCheckpoint, setSelectedCheckpoint] = useState<{ id: string; label: string } | null>(null);
    const [courseOptions, setCourseOptions] = useState<Course[]>([]);
    const [trackEvents, setTrackEvents] = useState<EventCategory[]>([]);
    const [fieldEvents, setFieldEvents] = useState<EventCategory[]>([]);
    const [isDisciplinesLoading, setIsDisciplinesLoading] = useState(false);
    const [hasLoadedDisciplines, setHasLoadedDisciplines] = useState(false);
    const [isMapLoading, setIsMapLoading] = useState(false);
    const [hasLoadedMaps, setHasLoadedMaps] = useState(false);
    const [mapError, setMapError] = useState<string | null>(null);
    const [mapLoadFailed, setMapLoadFailed] = useState(false);
    const [aiCompareModalVisible, setAiCompareModalVisible] = useState(false);
    const [quickChestNumber, setQuickChestNumber] = useState('');
    const [quickUseDefaultChest, setQuickUseDefaultChest] = useState(false);
    const [quickSearchError, setQuickSearchError] = useState<string | null>(null);
    const [quickSearchLoading, setQuickSearchLoading] = useState(false);
    const [quickNeedsConsent, setQuickNeedsConsent] = useState(false);
    const [quickMissingAngles, setQuickMissingAngles] = useState<string[] | null>(null);
    const [quickUseFace, setQuickUseFace] = useState(true);
    const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false);
    const [subscribeSheetVisible, setSubscribeSheetVisible] = useState(false);
    const [subscribeStep, setSubscribeStep] = useState<0 | 1 | 2>(0);
    const [subscribeChestNumber, setSubscribeChestNumber] = useState('');
    const [subscribeUseDefaultChest, setSubscribeUseDefaultChest] = useState(true);
    const [subscribeUseFace, setSubscribeUseFace] = useState(false);
    const [profileChestByYear, setProfileChestByYear] = useState<Record<string, string>>({});
    const [profileFaceVerified, setProfileFaceVerified] = useState<boolean | null>(null);
    const [profileFaceConsentGranted, setProfileFaceConsentGranted] = useState<boolean | null>(null);
    const [subscribeDisciplineIds, setSubscribeDisciplineIds] = useState<string[]>([SUBSCRIPTION_ALL_DISCIPLINE_ID]);
    const [subscribeCategoryLabels, setSubscribeCategoryLabels] = useState<string[]>(['All']);

    const competitionName = route?.params?.name || route?.params?.eventName || t('Competition');
    const legacyDescription = String(route?.params?.description ?? '').trim();
    const legacyLocation = legacyDescription.replace(/^competition held in\s*/i, '').trim();
    const competitionLocation = String(route?.params?.location ?? '').trim() || (legacyLocation && legacyLocation !== legacyDescription ? legacyLocation : '');
    const rawCompetitionDate = String(route?.params?.date ?? '').trim();
    const competitionDate = useMemo(() => {
        if (!rawCompetitionDate) return '';
        const parsed = new Date(rawCompetitionDate);
        if (!Number.isNaN(parsed.getTime())) {
            const day = String(parsed.getDate()).padStart(2, '0');
            const month = String(parsed.getMonth() + 1).padStart(2, '0');
            const year = parsed.getFullYear();
            return `${day}/${month}/${year}`;
        }
        const slashParts = rawCompetitionDate.split('/').map((part) => Number(part));
        if (slashParts.length === 3) {
            const [day, month, year] = slashParts;
            if (day > 0 && month > 0 && year > 0) {
                return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
            }
        }
        return rawCompetitionDate;
    }, [rawCompetitionDate]);
    const organizingClub = String(
        route?.params?.organizingClub
        ?? route?.params?.organizing_club
        ?? route?.params?.organizer_club
        ?? '',
    ).trim();
    const competitionType: 'track' | 'marathon' = route?.params?.competitionType || 'track';
    const normalizedCompetitionType = String(competitionType || '').toLowerCase();
    const isRoadTrailCompetition = competitionFocusId === 'road-events' || normalizedCompetitionType === 'marathon' || normalizedCompetitionType === 'road' || normalizedCompetitionType === 'trail' || normalizedCompetitionType === 'roadtrail' || normalizedCompetitionType === 'road&trail';
    const isTrackFieldCompetition = competitionFocusId === 'track-field' || (!competitionFocusId && !isRoadTrailCompetition);
    const competitionTypeLabel = useMemo(
        () => (competitionFocusId ? getSportFocusLabel(competitionFocusId, t) : (isRoadTrailCompetition ? t('roadAndTrail') : t('trackAndField'))),
        [competitionFocusId, isRoadTrailCompetition, t],
    );
    const competitionMetaLine = useMemo(() => {
        const parts = [
            competitionTypeLabel,
            competitionLocation,
            competitionDate,
        ].filter((part) => {
            const value = String(part || '').trim();
            return value.length > 0 && value !== '-' && value !== '—';
        });
        return parts.join(' • ');
    }, [competitionDate, competitionLocation, competitionTypeLabel]);
    const eventId = route?.params?.eventId as string | undefined;
    const competitionId = route?.params?.competitionId as string | undefined;
    const resolvedEventId = useMemo(() => String(eventId ?? competitionId ?? '').trim(), [competitionId, eventId]);
    const canSubscribe = resolvedEventId.length > 0;
    const isSubscribed = useMemo(
        () => canSubscribe && subscribedEvents.some((event) => String(event.event_id) === resolvedEventId),
        [canSubscribe, resolvedEventId, subscribedEvents],
    );
    const getYearFromDateLike = useCallback((value?: string | null) => {
        const raw = String(value ?? '').trim();
        if (!raw) return null;
        const dt = new Date(raw);
        if (!Number.isNaN(dt.getTime())) return String(dt.getFullYear());
        const m = raw.match(/\b(19|20)\d{2}\b/);
        return m ? m[0] : null;
    }, []);
    const normalizeChestByYear = useCallback((raw: any): Record<string, string> => {
        if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
        const out: Record<string, string> = {};
        for (const [year, chest] of Object.entries(raw as Record<string, unknown>)) {
            const safeYear = String(year ?? '').trim();
            if (!/^\d{4}$/.test(safeYear)) continue;
            const safeChest = String(chest ?? '').trim();
            if (!/^\d+$/.test(safeChest)) continue;
            out[safeYear] = safeChest;
        }
        return out;
    }, []);
    const defaultChestNumber = useMemo(() => {
        const byYear = {
            ...normalizeChestByYear(userProfile?.chestNumbersByYear ?? {}),
            ...profileChestByYear,
        };
        const currentYear = String(new Date().getFullYear());
        const eventYear =
            getYearFromDateLike(String(route?.params?.date ?? '')) ||
            getYearFromDateLike(String(route?.params?.name ?? route?.params?.eventName ?? '')) ||
            getYearFromDateLike(String(route?.params?.location ?? ''));
        if (eventYear && byYear[eventYear] != null && String(byYear[eventYear]).trim().length > 0) {
            return String(byYear[eventYear]).trim();
        }
        if (byYear[currentYear] != null && String(byYear[currentYear]).trim().length > 0) {
            return String(byYear[currentYear]).trim();
        }
        const latestYear = Object.keys(byYear)
            .filter((year) => /^\d{4}$/.test(year) && String(byYear[year]).trim().length > 0)
            .sort((a, b) => Number(b) - Number(a))[0];
        if (latestYear) {
            return String(byYear[latestYear]).trim();
        }
        return '';
    }, [getYearFromDateLike, normalizeChestByYear, profileChestByYear, route?.params?.date, route?.params?.eventName, route?.params?.location, route?.params?.name, userProfile?.chestNumbersByYear]);
    const competitionYear = useMemo(
        () =>
            getYearFromDateLike(String(route?.params?.date ?? '')) ||
            getYearFromDateLike(competitionDate) ||
            String(new Date().getFullYear()),
        [competitionDate, getYearFromDateLike, route?.params?.date],
    );
    const activeSubscriptionChestNumber = useMemo(
        () => String((subscribeUseDefaultChest ? defaultChestNumber : subscribeChestNumber) ?? '').trim(),
        [defaultChestNumber, subscribeChestNumber, subscribeUseDefaultChest],
    );
    const hasFaceEnrollment = profileFaceVerified ?? Boolean((userProfile as any)?.faceVerified);
    const faceConsentGranted = profileFaceConsentGranted ?? Boolean((userProfile as any)?.faceConsentGranted);

    useEffect(() => {
        if (!apiAccessToken) return;
        let active = true;
        (async () => {
            try {
                const summary = await getProfileSummary(apiAccessToken);
                if (!active) return;
                setProfileChestByYear(normalizeChestByYear(summary?.profile?.chest_numbers_by_year ?? {}));
                setProfileFaceVerified(Boolean(summary?.profile?.face_verified));
                setProfileFaceConsentGranted(Boolean((summary?.profile as any)?.face_consent_granted));
            } catch {
                // keep local fallback from userProfile
            }
        })();
        return () => {
            active = false;
        };
    }, [apiAccessToken, normalizeChestByYear]);

    const currentEvents = useMemo(() => {
        if (!isTrackFieldCompetition) return trackEvents;
        return selectedTab === 'track' ? trackEvents : fieldEvents;
    }, [fieldEvents, isTrackFieldCompetition, selectedTab, trackEvents]);

    const visibleCourses = courseOptions.length > 0 ? courseOptions : FALLBACK_COURSES;
    const showCoursesSection = isRoadTrailCompetition;
    const subscriptionDisciplineOptions = useMemo(() => {
        const rows = showCoursesSection
            ? visibleCourses.map((course) => ({
                id: String(course.disciplineId ?? course.id),
                competition_name: course.label,
            }))
            : [...trackEvents, ...fieldEvents].map((event) => ({
                id: String(event.id),
                competition_name: event.name,
            }));
        return buildSubscriptionDisciplineOptions(rows);
    }, [fieldEvents, showCoursesSection, trackEvents, visibleCourses]);
    const normalizedSubscriptionDisciplineIds = useMemo(
        () => subscribeDisciplineIds.includes(SUBSCRIPTION_ALL_DISCIPLINE_ID) ? [] : subscribeDisciplineIds,
        [subscribeDisciplineIds],
    );
    const selectedSubscriptionDisciplineLabels = useMemo(
        () => {
            if (subscribeDisciplineIds.includes(SUBSCRIPTION_ALL_DISCIPLINE_ID)) {
                return [t('all')];
            }
            const labels = subscriptionDisciplineOptions
                .filter((option) => subscribeDisciplineIds.includes(option.id))
                .map((option) => option.label);
            return labels.length > 0 ? labels : [t('all')];
        },
        [subscribeDisciplineIds, subscriptionDisciplineOptions, t],
    );
    const normalizedSubscriptionCategories = useMemo(
        () => normalizeSubscriptionCategories(subscribeCategoryLabels),
        [subscribeCategoryLabels],
    );

    const selectedCourse = useMemo(() => {
        if (visibleCourses.length === 0) return null;
        return visibleCourses.find((course) => course.id === selectedCourseId) ?? visibleCourses[0];
    }, [selectedCourseId, visibleCourses]);
    const hasSelectedCourseMap = Boolean(selectedCourse?.imageUrl) && !mapLoadFailed;

    useEffect(() => {
        setMapLoadFailed(false);
    }, [selectedCourse?.id, selectedCourse?.imageUrl]);

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
        if (!value) return null;
        if (!apiAccessToken) return String(value);
        if (isSignedUrl(value)) return String(value);
        if (String(value).includes('access_token=')) return String(value);
        const sep = String(value).includes('?') ? '&' : '?';
        return `${String(value)}${sep}access_token=${encodeURIComponent(apiAccessToken)}`;
    }, [apiAccessToken, isSignedUrl]);

    const toAbsoluteUrl = useCallback((value?: string | null) => {
        if (!value) return null;
        const raw = String(value);
        if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
        const base = getApiBaseUrl();
        if (!base) return raw;
        return `${base.replace(/\/$/, '')}/${raw.replace(/^\//, '')}`;
    }, []);

    useEffect(() => {
        if (!isRoadTrailCompetition || !apiAccessToken || !resolvedEventId) {
            setMapError(null);
            setCourseOptions([]);
            setSelectedCourseId('');
            setIsMapLoading(false);
            setHasLoadedMaps(false);
            return;
        }

        let isActive = true;
        const loadMaps = async () => {
            setIsMapLoading(true);
            setHasLoadedMaps(false);
            setMapError(null);
            try {
                const res = await getCompetitionMaps(apiAccessToken, {
                    event_id: resolvedEventId || undefined,
                    include_checkpoints: true,
                });
                if (!isActive) return;
                const normalized = (res.maps || []).map((map: CompetitionMapSummary) => ({
                    id: map.id,
                    label: map.name ?? t('Course'),
                    description: map.name ? t('Course map') : t('Course map'),
                    imageUrl: withAccessToken(toAbsoluteUrl(map.image_url ?? map.storage_key ?? null)) ?? undefined,
                    disciplineId: map.competition_id ? String(map.competition_id) : null,
                    checkpoints: (map.checkpoints ?? []).map((cp: CompetitionMapCheckpoint) => ({
                        id: cp.id,
                        label: cp.label ?? `Checkpoint ${cp.checkpoint_index}`,
                    })),
                }));
                setCourseOptions(normalized);
                setSelectedCourseId((prev) =>
                    normalized.some((course) => course.id === prev) ? prev : (normalized[0]?.id || '')
                );
            } catch (e: any) {
                if (!isActive) return;
                const message = e instanceof ApiError ? e.message : String(e?.message ?? e);
                setMapError(message);
                setCourseOptions([]);
                setSelectedCourseId('');
            } finally {
                if (isActive) {
                    setIsMapLoading(false);
                    setHasLoadedMaps(true);
                }
            }
        };

        loadMaps();
        return () => {
            isActive = false;
        };
    }, [apiAccessToken, isRoadTrailCompetition, resolvedEventId, t, toAbsoluteUrl, withAccessToken]);

    useEffect(() => {
        if (!apiAccessToken || !resolvedEventId || isRoadTrailCompetition) {
            setTrackEvents([]);
            setFieldEvents([]);
            setIsDisciplinesLoading(false);
            setHasLoadedDisciplines(true);
            return;
        }

        let isActive = true;
        const loadDisciplines = async () => {
            setHasLoadedDisciplines(false);
            setIsDisciplinesLoading(true);
            try {
                const comps = await getEventCompetitions(apiAccessToken, String(resolvedEventId), { onlyWithMedia: true });
                if (!isActive) return;
                const rows = Array.isArray(comps.competitions) ? comps.competitions : [];
                const resolvedFocus = normalizeFocusId(rows[0]?.competition_focus ?? competitionFocusId ?? competitionType);
                setCompetitionFocusId(resolvedFocus);

                const mapped = rows
                    .filter((comp) => Number(comp.media_count ?? 0) > 0)
                    .map((comp) => {
                        const name = String(comp.competition_name || comp.competition_name_normalized || t('Event'));
                        const type = String(comp.competition_type || '').toLowerCase();
                        const group = String(comp.discipline_group || '').toLowerCase();
                        const kind: 'track' | 'field' = resolvedFocus && resolvedFocus !== 'track-field'
                            ? 'track'
                            : (type.includes('field') || group === 'jumps' || group === 'throws' ? 'field' : 'track');
                        return {
                            id: String(comp.id),
                            name,
                            hasArrow: true,
                            badges: comp.discipline_group ? [String(comp.discipline_group)] : undefined,
                            thumbnailUrl: withAccessToken(toAbsoluteUrl(comp.thumbnail_url ?? null)),
                            group: comp.discipline_group ?? null,
                            _kind: kind,
                        } as EventCategory & { _kind: 'track' | 'field' };
                    });

                if (resolvedFocus && resolvedFocus !== 'track-field') {
                    setTrackEvents(mapped.map(({ _kind, ...rest }) => rest));
                    setFieldEvents([]);
                    return;
                }

                setTrackEvents(mapped.filter((e) => e._kind === 'track').map(({ _kind, ...rest }) => rest));
                setFieldEvents(mapped.filter((e) => e._kind === 'field').map(({ _kind, ...rest }) => rest));
            } catch {
                if (!isActive) return;
                setTrackEvents([]);
                setFieldEvents([]);
            } finally {
                if (isActive) {
                    setIsDisciplinesLoading(false);
                    setHasLoadedDisciplines(true);
                }
            }
        };

        loadDisciplines();
        return () => {
            isActive = false;
        };
    }, [apiAccessToken, competitionFocusId, competitionType, isRoadTrailCompetition, resolvedEventId, t, toAbsoluteUrl, withAccessToken]);

    useEffect(() => {
        if (!isRoadTrailCompetition) return;
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
                                imageUrl: withAccessToken(toAbsoluteUrl(res.map.image_url ?? res.map.storage_key ?? null)) ?? course.imageUrl,
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
    }, [apiAccessToken, courseOptions, isRoadTrailCompetition, selectedCourseId, toAbsoluteUrl, withAccessToken]);

    const renderEventCard = (event: EventCategory) => (
        <TouchableOpacity
            key={event.id}
            style={styles.eventCard}
            onPress={() => navigation.navigate('EventDivisionScreen', {
                eventName: event.name,
                competitionName,
                eventId: eventId ?? competitionId,
                competitionId: competitionId ?? eventId,
                disciplineId: String(event.id),
            })}
        >
            <View style={styles.eventCardLeft}>
                {event.thumbnailUrl ? (
                    <Image source={{ uri: event.thumbnailUrl }} style={styles.eventThumbnail} />
                ) : (
                    <View style={[styles.eventThumbnail, styles.eventThumbnailFallback]} />
                )}
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

    const startFaceRegistrationFlow = useCallback(() => {
        setAiCompareModalVisible(false);
        navigation.navigate('SearchFaceCaptureScreen', {
            mode: 'enrolFace',
            afterEnroll: {screen: 'AISearchScreen'},
        });
    }, [navigation]);

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
        const bibValue = String((quickUseDefaultChest ? defaultChestNumber : quickChestNumber) ?? '').trim();
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
                            Alert.alert(
                                t('Face setup required'),
                                t('Set up your face scan to use face recognition for this competition.'),
                                [
                                    { text: t('Cancel'), style: 'cancel' },
                                    { text: t('Set up face'), onPress: startFaceRegistrationFlow },
                                ],
                            );
                            return;
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
                refineContext: {
                    bib: bibValue || undefined,
                    discipline: selectedCourse?.label || undefined,
                    checkpoint: selectedCheckpoint?.label || undefined,
                    date: competitionDate || undefined,
                },
                manualBrowse: {
                    eventId: eventId ?? competitionId,
                    competitionId: competitionId ?? eventId,
                    eventName: competitionName,
                    eventDate: competitionDate || undefined,
                    disciplineId: selectedCourse?.disciplineId ?? selectedCourse?.id ?? null,
                    disciplineLabel: selectedCourse?.label ?? null,
                    checkpointId: selectedCheckpoint?.id ?? null,
                    checkpointLabel: selectedCheckpoint?.label ?? null,
                },
            });
        } finally {
            setQuickSearchLoading(false);
        }
    }, [apiAccessToken, competitionDate, competitionId, competitionName, defaultChestNumber, eventId, navigation, quickChestNumber, quickUseDefaultChest, quickUseFace, resolveEventId, selectedCheckpoint?.id, selectedCheckpoint?.label, selectedCourse?.disciplineId, selectedCourse?.id, selectedCourse?.label, startFaceRegistrationFlow, t]);

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

    const resetSubscribeSheet = useCallback(() => {
        setSubscribeStep(0);
        setSubscribeUseDefaultChest(false);
        setSubscribeChestNumber('');
        setSubscribeUseFace(false);
        setSubscribeCategoryLabels(['All']);
        setSubscribeDisciplineIds([SUBSCRIPTION_ALL_DISCIPLINE_ID]);
    }, []);

    const openSubscribeSheet = useCallback(() => {
        resetSubscribeSheet();
        setSubscribeSheetVisible(true);
    }, [resetSubscribeSheet]);

    const closeSubscribeSheet = useCallback(() => {
        setSubscribeSheetVisible(false);
        resetSubscribeSheet();
    }, [resetSubscribeSheet]);

    const handleEnroll = useCallback(() => {
        setAiCompareModalVisible(false);
        navigation.navigate('SearchFaceCaptureScreen', {
            mode: 'enrolFace',
            afterEnroll: { screen: 'AISearchScreen' },
        });
    }, [navigation]);
    const refreshProfileFaceState = useCallback(async () => {
        if (!apiAccessToken) {
            return {
                hasFaceEnrollment: Boolean((userProfile as any)?.faceVerified),
                faceConsentGranted: Boolean((userProfile as any)?.faceConsentGranted),
            };
        }
        try {
            const summary = await getProfileSummary(apiAccessToken);
            const nextHasFaceEnrollment = Boolean(summary?.profile?.face_verified);
            const nextFaceConsentGranted = Boolean((summary?.profile as any)?.face_consent_granted);
            setProfileFaceVerified(nextHasFaceEnrollment);
            setProfileFaceConsentGranted(nextFaceConsentGranted);
            return {
                hasFaceEnrollment: nextHasFaceEnrollment,
                faceConsentGranted: nextFaceConsentGranted,
            };
        } catch {
            return {
                hasFaceEnrollment: profileFaceVerified ?? Boolean((userProfile as any)?.faceVerified),
                faceConsentGranted: profileFaceConsentGranted ?? Boolean((userProfile as any)?.faceConsentGranted),
            };
        }
    }, [apiAccessToken, profileFaceConsentGranted, profileFaceVerified, userProfile]);
    const startSubscriptionFaceEnrollment = useCallback(() => {
        closeSubscribeSheet();
        InteractionManager.runAfterInteractions(() => {
            navigation.navigate('SearchFaceCaptureScreen', {
                mode: 'enrolFace',
                requireConsentBeforeEnroll: false,
                afterEnroll: { screen: 'AISearchScreen' },
            });
        });
    }, [closeSubscribeSheet, navigation]);
    const handleSubscribeFaceToggle = useCallback(async (nextValue: boolean) => {
        if (!nextValue) {
            setSubscribeUseFace(false);
            return;
        }
        if (!apiAccessToken) {
            Alert.alert(t('Missing API token'), t('Log in again to enable face recognition.'));
            return;
        }
        if (!resolvedEventId) {
            const latest = await refreshProfileFaceState();
            if (latest.hasFaceEnrollment && latest.faceConsentGranted) {
                setSubscribeUseFace(true);
                return;
            }
            Alert.alert(t('Select competition'), t('Pick a competition first, then enable face recognition.'));
            return;
        }
        try {
            await searchFaceByEnrollment(apiAccessToken, {
                event_ids: [resolvedEventId],
                label: 'default',
                limit: 1,
                top: 1,
                save: false,
            });
            setProfileFaceVerified(true);
            setProfileFaceConsentGranted(true);
            setSubscribeUseFace(true);
            return;
        } catch (e: any) {
            if (e instanceof ApiError) {
                const body = e.body ?? {};
                if (e.status === 403 && String(e.message).toLowerCase().includes('consent')) {
                    setProfileFaceVerified(true);
                    setProfileFaceConsentGranted(false);
                    Alert.alert(
                        t('Face recognition consent'),
                        t('Allow face recognition for this competition?'),
                        [
                            { text: t('Cancel'), style: 'cancel' },
                            {
                                text: t('Allow'),
                                onPress: async () => {
                                    try {
                                        await grantFaceRecognitionConsent(apiAccessToken);
                                        setProfileFaceConsentGranted(true);
                                        const latest = await refreshProfileFaceState();
                                        if (latest.hasFaceEnrollment) {
                                            setSubscribeUseFace(true);
                                            return;
                                        }
                                        setSubscribeUseFace(false);
                                        Alert.alert(
                                            t('Face setup required'),
                                            t('Set up your face scan to use face recognition for this competition.'),
                                            [
                                                { text: t('Cancel'), style: 'cancel' },
                                                { text: t('Set up face'), onPress: startSubscriptionFaceEnrollment },
                                            ],
                                        );
                                    } catch (consentError: any) {
                                        const msg = consentError instanceof ApiError ? consentError.message : String(consentError?.message ?? consentError);
                                        Alert.alert(t('Consent failed'), msg);
                                    }
                                },
                            },
                        ],
                    );
                    return;
                }
                if (e.status === 400 && Array.isArray(body?.missing_angles)) {
                    setProfileFaceVerified(false);
                    Alert.alert(
                        t('Face setup required'),
                        t('Set up your face scan to use face recognition for this competition.'),
                        [
                            { text: t('Cancel'), style: 'cancel' },
                            { text: t('Set up face'), onPress: startSubscriptionFaceEnrollment },
                        ],
                    );
                    return;
                }
            }
        }
        const latest = await refreshProfileFaceState();
        if (latest.hasFaceEnrollment && latest.faceConsentGranted) {
            setSubscribeUseFace(true);
            return;
        }
        if (latest.faceConsentGranted) {
            Alert.alert(
                t('Face setup required'),
                t('Set up your face scan to use face recognition for this competition.'),
                [
                    { text: t('Cancel'), style: 'cancel' },
                    { text: t('Set up face'), onPress: startSubscriptionFaceEnrollment },
                ],
            );
            return;
        }
        Alert.alert(
            t('Face recognition consent'),
            t('Before face setup, please confirm consent for face recognition.'),
            [
                { text: t('Cancel'), style: 'cancel' },
                {
                    text: t('Continue'),
                    onPress: async () => {
                        try {
                            await grantFaceRecognitionConsent(apiAccessToken);
                            setProfileFaceConsentGranted(true);
                            startSubscriptionFaceEnrollment();
                        } catch (consentError: any) {
                            const msg = consentError instanceof ApiError ? consentError.message : String(consentError?.message ?? consentError);
                            Alert.alert(t('Consent failed'), msg);
                        }
                    },
                },
            ],
        );
    }, [apiAccessToken, refreshProfileFaceState, resolvedEventId, startSubscriptionFaceEnrollment, t]);

    const handleOpenSubscriptionSummary = useCallback(() => {
        if (!canSubscribe || !resolvedEventId) return;
        const safeChestNumber = /^\d+$/.test(activeSubscriptionChestNumber) ? activeSubscriptionChestNumber : '';
        closeSubscribeSheet();
        navigation.navigate('EventSummaryScreen', {
            mode: 'eventSubscription',
            subscription: {
                eventId: resolvedEventId,
                eventTitle: competitionName,
                eventDate: route?.params?.date ?? competitionDate,
                eventLocation: competitionLocation || null,
                eventTypeLabel: competitionTypeLabel,
                organizingClub,
                competitionYear,
                isTrackCompetition: true,
                chestNumber: safeChestNumber || null,
                useFaceRecognition: hasFaceEnrollment ? subscribeUseFace : false,
                hasFaceEnrollment,
                faceConsentGranted,
                disciplineIds: normalizedSubscriptionDisciplineIds,
                disciplineLabels: selectedSubscriptionDisciplineLabels,
                categoryLabels: normalizedSubscriptionCategories,
            },
        });
    }, [
        activeSubscriptionChestNumber,
        canSubscribe,
        closeSubscribeSheet,
        competitionDate,
        competitionLocation,
        competitionName,
        competitionTypeLabel,
        competitionYear,
        faceConsentGranted,
        hasFaceEnrollment,
        navigation,
        normalizedSubscriptionCategories,
        normalizedSubscriptionDisciplineIds,
        organizingClub,
        resolvedEventId,
        route?.params?.date,
        selectedSubscriptionDisciplineLabels,
        subscribeUseFace,
    ]);

    const handleSubscriptionToggle = useCallback(async () => {
        if (!apiAccessToken || !canSubscribe || isSubscriptionLoading) return;
        if (isSubscribed) {
            Alert.alert(
                t('Subscribed'),
                t('Turn off competition updates for this event?'),
                [
                    { text: t('Cancel'), style: 'cancel' },
                    {
                        text: t('Unsubscribe'),
                        style: 'destructive',
                        onPress: async () => {
                            setIsSubscriptionLoading(true);
                            try {
                                await unsubscribeToEvent(apiAccessToken, resolvedEventId);
                                await refreshSubscribed();
                            } catch (e: any) {
                                const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
                                Alert.alert(t('Could not unsubscribe'), msg);
                            } finally {
                                setIsSubscriptionLoading(false);
                            }
                        },
                    },
                ],
            );
            return;
        }
        openSubscribeSheet();
    }, [apiAccessToken, canSubscribe, isSubscribed, isSubscriptionLoading, openSubscribeSheet, refreshSubscribed, resolvedEventId, t]);

    const subscriptionButtonLabel = isSubscriptionLoading
        ? t('Loading...')
        : isSubscribed
            ? t('Subscribed')
            : t('Subscribe');
    const subscriptionButtonHint = isSubscribed
        ? t('Competition updates are enabled for this event.')
        : t('Choose disciplines, category, and optional chest number or Face ID for this competition.');

    const renderMediaSection = () => (
        <>
            <SizeBox height={24} />

            <Text style={styles.sectionTitle}>{t('Media')}</Text>
            <SizeBox height={12} />
            <View style={styles.mediaShowcaseCard}>
                <View style={styles.mediaShowcaseHead}>
                    <Text style={styles.mediaShowcaseTitle}>{t('All Videos')}</Text>
                    <View style={styles.mediaShowcaseTag}>
                        <Text style={styles.mediaShowcaseTagText}>{t('Untagged included')}</Text>
                    </View>
                </View>
                <Text style={styles.mediaShowcaseDescription}>
                    {t('Shows every uploaded video for this competition, even if not tagged to a discipline.')}
                </Text>
                <TouchableOpacity
                    style={styles.showAllButton}
                    onPress={() => navigation.navigate('AllVideosOfEvents', {
                        eventName: competitionName,
                        eventId: eventId ?? competitionId,
                        competitionId: competitionId ?? eventId,
                    })}
                >
                    <Text style={styles.showAllButtonText}>{t('Show All Videos')}</Text>
                    <ArrowRight size={18} color={colors.pureWhite} variant="Linear" />
                </TouchableOpacity>
            </View>

            <SizeBox height={18} />

            <View style={styles.mediaShowcaseCard}>
                <View style={styles.mediaShowcaseHead}>
                    <Text style={styles.mediaShowcaseTitle}>{t('All Photos')}</Text>
                    <View style={styles.mediaShowcaseTag}>
                        <Text style={styles.mediaShowcaseTagText}>{t('Untagged included')}</Text>
                    </View>
                </View>
                <Text style={styles.mediaShowcaseDescription}>
                    {t('Shows every uploaded photo for this competition, including untagged uploads.')}
                </Text>
                <TouchableOpacity
                    style={styles.showAllPhotosButton}
                    onPress={() => navigation.navigate('AllPhotosOfEvents', {
                        eventName: competitionName,
                        eventId: eventId ?? competitionId,
                        competitionId: competitionId ?? eventId,
                    })}
                >
                    <Text style={styles.showAllPhotosButtonText}>{t('Show All Photos')}</Text>
                    <ArrowRight size={18} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>
        </>
    );

    return (
        <View style={styles.mainContainer} testID="competition-details-screen">
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{competitionName}</Text>
                <View style={{ width: 44, height: 44 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Competition Info */}
                <View style={styles.competitionMetaCard}>
                    <Text style={styles.competitionDescription}>
                        {competitionMetaLine || t('Competition details')}
                    </Text>
                    {organizingClub ? (
                        <Text style={styles.competitionMetaText} numberOfLines={1}>{organizingClub}</Text>
                    ) : null}
                </View>
                {canSubscribe ? (
                    <>
                        <SizeBox height={12} />
                        <TouchableOpacity
                            style={[
                                styles.subscribeButton,
                                isSubscribed && styles.subscribeButtonActive,
                                isSubscriptionLoading && styles.subscribeButtonDisabled,
                            ]}
                            onPress={handleSubscriptionToggle}
                            disabled={isSubscriptionLoading}
                        >
                            {isSubscriptionLoading ? (
                                <ActivityIndicator color={colors.pureWhite} />
                            ) : (
                                <>
                                    <View style={styles.subscribeButtonContent}>
                                        <Text style={styles.subscribeButtonText}>
                                            {subscriptionButtonLabel}
                                        </Text>
                                        <Text style={styles.subscribeButtonHint}>
                                            {subscriptionButtonHint}
                                        </Text>
                                    </View>
                                    <View style={styles.subscribeChevronWrap}>
                                        <ArrowRight size={18} color={colors.pureWhite} variant="Linear" />
                                    </View>
                                </>
                            )}
                        </TouchableOpacity>
                    </>
                ) : null}

                <SizeBox height={20} />

                {showCoursesSection ? (
                    <>
                        <Text style={styles.sectionTitle}>{t('Courses')}</Text>
                        <SizeBox height={12} />
                        {isMapLoading || !hasLoadedMaps ? (
                            <View style={styles.emptyState}>
                                <ActivityIndicator color={colors.primaryColor} />
                                <SizeBox height={8} />
                                <Text style={styles.emptyStateText}>{t('Loading course maps...')}</Text>
                            </View>
                        ) : visibleCourses.length === 0 ? (
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
                                    {hasSelectedCourseMap ? (
                                        <Image
                                            source={{ uri: String(selectedCourse?.imageUrl) }}
                                            style={styles.mapImage}
                                            resizeMode="cover"
                                            onError={() => setMapLoadFailed(true)}
                                        />
                                    ) : (
                                        <View style={styles.mapEmptyState}>
                                            <Text style={styles.mapEmptyTitle}>{t('No map uploaded for this course yet.')}</Text>
                                            <Text style={styles.mapEmptySubtitle}>{t('Upload a course map to display it here.')}</Text>
                                        </View>
                                    )}
                                </View>
                                {mapError && (
                                    <>
                                        <SizeBox height={8} />
                                        <Text style={styles.helperText}>{t('Map data unavailable for this competition.')}</Text>
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
                                {renderMediaSection()}
                            </>
                        )}

                        <SizeBox height={insets.bottom > 0 ? insets.bottom + 80 : 100} />
                    </>
                ) : (
                    <>
                        {isTrackFieldCompetition ? (
                            <>
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
                            </>
                        ) : null}

                        {/* Disciplines Section */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{t('Disciplines')}</Text>
                            <TouchableOpacity
                                style={styles.aiActionButton}
                                onPress={() => {
                                    setQuickUseDefaultChest(false);
                                    setQuickSearchError(null);
                                    setQuickNeedsConsent(false);
                                    setQuickMissingAngles(null);
                                    setAiCompareModalVisible(true);
                                }}
                            >
                                <Icons.AiWhiteBordered width={18} height={18} />
                                <Text style={styles.aiActionButtonText}>{t('AI Search')}</Text>
                            </TouchableOpacity>
                        </View>
                        <SizeBox height={16} />
                        {!hasLoadedDisciplines || isDisciplinesLoading ? (
                            <View style={styles.emptyState}>
                                <ActivityIndicator color={colors.primaryColor} />
                                <SizeBox height={8} />
                                <Text style={styles.emptyStateText}>{t('Loading events...')}</Text>
                            </View>
                        ) : currentEvents.length > 0 ? currentEvents.map(renderEventCard) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateText}>{t('No events available yet.')}</Text>
                            </View>
                        )}

                        {renderMediaSection()}

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
                                    checkpointId: selectedCheckpoint?.id,
                                    disciplineId: selectedCourse?.disciplineId ?? selectedCourse?.id,
                                    eventId: eventId ?? competitionId,
                                    competitionId: competitionId ?? eventId,
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
                                    competitionId: competitionId ?? eventId,
                                    checkpoint: selectedCheckpoint,
                                    checkpointId: selectedCheckpoint?.id,
                                    disciplineId: selectedCourse?.disciplineId ?? selectedCourse?.id,
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
                                        setQuickUseDefaultChest(false);
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
                        {!quickUseDefaultChest || !defaultChestNumber ? (
                            <UnifiedSearchInput
                                containerStyle={styles.modalInputRow}
                                inputStyle={styles.modalInput}
                                placeholder={t('e.g. 1234')}
                                placeholderTextColor="#9B9F9F"
                                keyboardType="number-pad"
                                value={quickChestNumber}
                                onChangeText={setQuickChestNumber}
                            />
                        ) : null}
                        <View style={styles.toggleRow}>
                            <View style={{ flex: 1, paddingRight: 12 }}>
                                <Text style={styles.toggleLabel}>{t('Use saved chest number')}</Text>
                                <Text style={styles.toggleHint}>
                                    {defaultChestNumber
                                        ? `${defaultChestNumber} · ${competitionYear}`
                                        : t('No saved chest number yet. Enter the chest number for this competition below.')}
                                </Text>
                            </View>
                            <Switch
                                value={quickUseDefaultChest}
                                onValueChange={setQuickUseDefaultChest}
                                disabled={!defaultChestNumber}
                                trackColor={{ false: colors.lightGrayColor, true: colors.primaryColor }}
                                thumbColor={colors.pureWhite}
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

            <Modal
                visible={subscribeSheetVisible}
                transparent
                animationType="slide"
                onRequestClose={closeSubscribeSheet}
            >
                <TouchableOpacity
                    style={styles.feedbackOverlay}
                    activeOpacity={1}
                    onPress={closeSubscribeSheet}
                >
                    <TouchableOpacity style={styles.feedbackSheet} activeOpacity={1}>
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.feedbackScrollContent}
                        >
                                <Text style={styles.feedbackTitle}>{t('Subscribe')}</Text>
                                <Text style={styles.feedbackBody}>
                                    {t('Follow this competition to stay updated.')}
                                </Text>
                                <View style={styles.modalChipsGrid}>
                                    {[
                                        { key: 0, label: t('disciplines') },
                                        { key: 1, label: t('Category') },
                                        { key: 2, label: `${t('Chest number')} + ${t('Face')}` },
                                    ].map((step) => {
                                        const isActive = subscribeStep === step.key;
                                        return (
                                            <View key={`subscribe-step-${step.key}`} style={[styles.modalChip, isActive && styles.modalChipActive]}>
                                                <Text style={[styles.modalChipText, isActive && styles.modalChipTextActive]}>
                                                    {step.label}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </View>

                                {subscribeStep === 0 ? (
                                <View style={styles.feedbackSectionCard}>
                                    <Text style={styles.modalLabel}>{t('disciplines')}</Text>
                                    <Text style={styles.feedbackSectionHint}>{t('Select specific disciplines, or keep All for the whole competition.')}</Text>
                                    <View style={styles.modalChipsGrid}>
                                        {subscriptionDisciplineOptions.map((option) => {
                                            const isSelected = subscribeDisciplineIds.includes(option.id);
                                            return (
                                                <TouchableOpacity
                                                    key={`subscribe-discipline-${option.id}`}
                                                    style={[styles.modalChip, isSelected && styles.modalChipActive]}
                                                    onPress={() => setSubscribeDisciplineIds((prev) => toggleSubscriptionDiscipline(prev, option.id))}
                                                >
                                                    <Text style={[styles.modalChipText, isSelected && styles.modalChipTextActive]}>
                                                        {option.id === SUBSCRIPTION_ALL_DISCIPLINE_ID ? t('all') : option.label}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>
                                ) : null}

                                {subscribeStep === 1 ? (
                                <View style={styles.feedbackSectionCard}>
                                    <Text style={styles.modalLabel}>{t('Category')}</Text>
                                    <Text style={styles.feedbackSectionHint}>{t('Choose the categories you want to follow, or keep All.')}</Text>
                                    <View style={styles.modalChipsGrid}>
                                        {SUBSCRIPTION_CATEGORY_OPTIONS.map((item) => {
                                            const isSelected = normalizedSubscriptionCategories.includes(item);
                                            return (
                                                <TouchableOpacity
                                                    key={`subscribe-category-${item}`}
                                                    style={[styles.modalChip, isSelected && styles.modalChipActive]}
                                                    onPress={() => setSubscribeCategoryLabels((prev) => toggleSubscriptionCategory(prev, item))}
                                                >
                                                    <Text style={[styles.modalChipText, isSelected && styles.modalChipTextActive]}>
                                                        {t(item === 'All' ? 'all' : item)}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>
                                ) : null}

                                {subscribeStep === 2 ? (
                                <>
                                <View style={styles.feedbackSectionCard}>
                                        <Text style={styles.modalLabel}>{t('Chest number')}</Text>
                                        <Text style={styles.feedbackSectionHint}>{t('Chest number is optional. Leave it empty if you want all photos for this subscription.')}</Text>
                                        {!subscribeUseDefaultChest || !defaultChestNumber ? (
                                            <UnifiedSearchInput
                                                containerStyle={styles.modalInputRow}
                                                inputStyle={styles.modalInput}
                                                placeholder={t('enterChestNumber')}
                                                placeholderTextColor="#9B9F9F"
                                                keyboardType="number-pad"
                                                value={subscribeChestNumber}
                                                onChangeText={setSubscribeChestNumber}
                                            />
                                        ) : null}
                                        <View style={styles.toggleRow}>
                                            <View style={{ flex: 1, paddingRight: 12 }}>
                                                <Text style={styles.toggleLabel}>{t('Use saved chest number')}</Text>
                                                <Text style={styles.toggleHint}>
                                                    {defaultChestNumber
                                                        ? `${defaultChestNumber} · ${competitionYear}`
                                                        : t('No saved chest number yet. Enter the chest number for this competition below.')}
                                                </Text>
                                            </View>
                                            <Switch
                                                value={subscribeUseDefaultChest}
                                                onValueChange={setSubscribeUseDefaultChest}
                                                disabled={!defaultChestNumber}
                                                trackColor={{ false: colors.lightGrayColor, true: colors.primaryColor }}
                                                thumbColor={colors.pureWhite}
                                            />
                                        </View>
                                </View>

                                <View style={styles.feedbackSectionCard}>
                                    <Text style={styles.modalLabel}>{t('Face')}</Text>
                                    <View style={styles.toggleRow}>
                                        <View style={{ flex: 1, paddingRight: 12 }}>
                                            <Text style={styles.toggleLabel}>{t('Allow face recognition for this competition')}</Text>
                                            <Text style={styles.toggleHint}>
                                                {!hasFaceEnrollment
                                                    ? t('Face: enrollment required.')
                                                    : faceConsentGranted
                                                        ? t('Enable this only if you want notifications narrowed to your face.')
                                                        : t('Permission will be requested when you confirm.')}
                                            </Text>
                                        </View>
                                        <Switch
                                            value={subscribeUseFace}
                                            onValueChange={handleSubscribeFaceToggle}
                                            trackColor={{ false: colors.lightGrayColor, true: colors.primaryColor }}
                                            thumbColor={colors.pureWhite}
                                        />
                                    </View>
                                </View>
                                </>
                                ) : null}

                                <TouchableOpacity
                                    style={styles.modalPrimaryButton}
                                    onPress={() => {
                                        if (subscribeStep < 2) {
                                            setSubscribeStep((prev) => Math.min(2, prev + 1) as 0 | 1 | 2);
                                            return;
                                        }
                                        handleOpenSubscriptionSummary();
                                    }}
                                    testID="competition-subscribe-confirm"
                                >
                                    <>
                                        <Text style={styles.modalPrimaryButtonText}>{subscribeStep < 2 ? t('Next') : t('Review')}</Text>
                                        <ArrowRight size={18} color={colors.pureWhite} variant="Linear" />
                                    </>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.modalSecondaryButton}
                                    onPress={() => {
                                        if (subscribeStep === 0) {
                                            closeSubscribeSheet();
                                            return;
                                        }
                                        setSubscribeStep((prev) => Math.max(0, prev - 1) as 0 | 1 | 2);
                                    }}
                                >
                                    <Text style={styles.modalSecondaryButtonText}>{subscribeStep === 0 ? t('Cancel') : t('Back')}</Text>
                                </TouchableOpacity>
                        </ScrollView>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

        </View>
    )
}

export default CompetitionDetailsScreen
