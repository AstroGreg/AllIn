import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Pressable, useWindowDimensions, ActivityIndicator, Platform, Switch, Alert, InteractionManager } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ArrowLeft2,
    ArrowDown2,
    Calendar,
    Clock,
    CloseCircle,
    Location,
    SearchNormal1,
    User,
} from 'iconsax-react-nativejs';
import { createStyles } from './AvailableCompetitionsScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Images from '../../constants/Images';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { ApiError, getEventCompetitions, getProfileSummary, grantFaceRecognitionConsent, searchEvents, searchFaceByEnrollment } from '../../services/apiGateway';
import { useTranslation } from 'react-i18next';
import {
    buildSubscriptionDisciplineOptions,
    normalizeSubscriptionCategories,
    SUBSCRIPTION_ALL_DISCIPLINE_ID,
    SUBSCRIPTION_CATEGORY_OPTIONS,
    toggleSubscriptionCategory,
    toggleSubscriptionDiscipline,
    type SubscriptionDisciplineOption,
} from '../../utils/eventSubscription';
import { getSportFocusLabel, resolveCompetitionFocusId, type SportFocusId } from '../../utils/profileSelections';

const EVENT_FILTERS = ['Competition', 'Location'] as const;
type EventFilterKey = typeof EVENT_FILTERS[number];
type CompetitionType = SportFocusId;
type CompetitionTypeFilter = 'all' | CompetitionType;
const COMPETITION_TYPE_FILTERS: Array<{ key: CompetitionTypeFilter; focusId?: SportFocusId; labelKey?: string }> = [
    { key: 'all', labelKey: 'all' },
    { key: 'track-field', focusId: 'track-field' },
    { key: 'road-events', focusId: 'road-events' },
    { key: 'triathlon', focusId: 'triathlon' },
    { key: 'ironman', focusId: 'ironman' },
    { key: 'cycling', focusId: 'cycling' },
    { key: 'hyrox', focusId: 'hyrox' },
];
const DEFAULT_EVENTS_INITIAL_LIMIT = 10;
const SEARCH_EVENTS_INITIAL_LIMIT = 20;
const SCROLL_LOAD_THRESHOLD_PX = 220;
const AvailableEventsScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { width: windowWidth } = useWindowDimensions();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const Styles = createStyles(colors);
    const isLightTheme = String(colors.backgroundColor || '').toLowerCase() === '#ffffff';
    const pickerVisualProps = useMemo<any>(() => (
        Platform.OS === 'ios'
            ? {
                themeVariant: isLightTheme ? 'light' : 'dark',
                textColor: isLightTheme ? '#0B1220' : '#F8FAFC',
                accentColor: colors.primaryColor,
            }
            : {}
    ), [colors.primaryColor, isLightTheme]);
    const [activeFilter, setActiveFilter] = useState<EventFilterKey>('Competition');
    const [filterValues, setFilterValues] = useState<Record<EventFilterKey, string>>({
        Competition: '',
        Location: '',
    });
    const [competitionTypeFilter, setCompetitionTypeFilter] = useState<CompetitionTypeFilter>('all');
    const [timeRange, setTimeRange] = useState<{ start: Date | null; end: Date | null }>({
        start: null,
        end: null,
    });
    const [showIosPicker, setShowIosPicker] = useState(false);
    const [calendarStart, setCalendarStart] = useState<string | null>(null);
    const [calendarEnd, setCalendarEnd] = useState<string | null>(null);
    const [nativePickerVisible, setNativePickerVisible] = useState(false);
    const [nativePickerDate, setNativePickerDate] = useState<Date>(new Date());
    const [activeDateField, setActiveDateField] = useState<'start' | 'end' | null>(null);
    const [showSubscribeModal, setShowSubscribeModal] = useState(false);
    const [modalEvent, setModalEvent] = useState<any | null>(null);
    const [subscribeStep, setSubscribeStep] = useState<0 | 1 | 2>(0);
    const [chestNumber, setChestNumber] = useState('');
    const [useDefaultChest, setUseDefaultChest] = useState(false);
    const [allowFaceRecognition, setAllowFaceRecognition] = useState(false);
    const [selectedDisciplineIds, setSelectedDisciplineIds] = useState<string[]>([SUBSCRIPTION_ALL_DISCIPLINE_ID]);
    const [selectedCategoryLabels, setSelectedCategoryLabels] = useState<string[]>(['All']);
    const [subscribeDisciplines, setSubscribeDisciplines] = useState<SubscriptionDisciplineOption[]>([]);
    const [subscribeDisciplinesLoading, setSubscribeDisciplinesLoading] = useState(false);
    const [availableEvents, setAvailableEvents] = useState<any[]>([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);
    const [eventsError, setEventsError] = useState<string | null>(null);
    const [visibleEventCount, setVisibleEventCount] = useState(DEFAULT_EVENTS_INITIAL_LIMIT);
    const [profileFaceVerified, setProfileFaceVerified] = useState<boolean | null>(null);
    const [profileFaceConsentGranted, setProfileFaceConsentGranted] = useState<boolean | null>(null);
    const loadMoreLockedRef = useRef(false);
    const { apiAccessToken, userProfile } = useAuth();
    const getYearFromDateLike = useCallback((value?: string | null) => {
        const raw = String(value ?? '').trim();
        if (!raw) return null;
        const iso = new Date(raw);
        if (!Number.isNaN(iso.getTime())) return String(iso.getFullYear());
        const m = raw.match(/\b(19|20)\d{2}\b/);
        return m ? m[0] : null;
    }, []);
    const defaultChestNumber = useMemo(() => {
        const byYear = (userProfile?.chestNumbersByYear ?? {}) as Record<string, string>;
        const eventYear =
            getYearFromDateLike(modalEvent?.date ?? null) ||
            getYearFromDateLike(modalEvent?.name ?? null) ||
            getYearFromDateLike(modalEvent?.location ?? null);
        if (eventYear && byYear[eventYear] != null && String(byYear[eventYear]).trim().length > 0) {
            return String(byYear[eventYear]).trim();
        }
        const currentYear = String(new Date().getFullYear());
        if (byYear[currentYear] != null && String(byYear[currentYear]).trim().length > 0) {
            return String(byYear[currentYear]).trim();
        }
        return '';
    }, [getYearFromDateLike, modalEvent?.date, modalEvent?.location, modalEvent?.name, userProfile?.chestNumbersByYear]);

    const activeValue = filterValues[activeFilter] ?? '';
    const searchPlaceholder = activeFilter === 'Competition' ? t('typeCompetition') : t('typeLocation');
    const hasFaceEnrollment = profileFaceVerified ?? Boolean((userProfile as any)?.faceVerified);
    const faceConsentGranted = profileFaceConsentGranted ?? Boolean((userProfile as any)?.faceConsentGranted);

    const getCompetitionTypeLabel = useCallback((type: CompetitionType) => {
        return getSportFocusLabel(type, t);
    }, [t]);

    const resolveCompetitionType = useCallback((params?: {
        type?: string | null;
        name?: string | null;
        location?: string | null;
        organizer?: string | null;
    }) => {
        return resolveCompetitionFocusId(params);
    }, []);

    const toDateString = (date: Date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const fromDateString = (value: string, isEnd: boolean) => {
        const [year, month, day] = value.split('-').map(Number);
        if (!year || !month || !day) return null;
        if (isEnd) {
            return new Date(year, month - 1, day, 23, 59, 59, 999);
        }
        return new Date(year, month - 1, day, 0, 0, 0, 0);
    };

    const parseEventDate = (value: string) => {
        if (!value) return null;
        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) return parsed;
        const [day, month, year] = value.split('/').map(Number);
        if (!day || !month || !year) return null;
        return new Date(year, month - 1, day, 12, 0, 0, 0);
    };

    const formatEventDate = useCallback((value: string) => {
        const parsed = parseEventDate(value);
        if (!parsed) return String(value || '');
        return parsed.toLocaleDateString('en-CA');
    }, []);

    const isWithinRange = useCallback((date: Date | null) => {
        if (!date) return false;
        const start = timeRange.start;
        const end = timeRange.end;
        if (start && end) return date >= start && date <= end;
        if (start) return date >= start;
        if (end) return date <= end;
        return true;
    }, [timeRange.end, timeRange.start]);

    const openDateTimePicker = () => {
        const todaySeed = toDateString(new Date());
        const startSeed = timeRange.start ? toDateString(timeRange.start) : todaySeed;
        const endSeed = timeRange.end ? toDateString(timeRange.end) : null;
        setCalendarStart(startSeed);
        setCalendarEnd(endSeed);
        setNativePickerVisible(false);
        setActiveDateField(null);
        setShowIosPicker(true);
    };

    const setQuickRange = (preset: 'week' | 'month' | 'year') => {
        const today = new Date();
        if (preset === 'week') {
            const day = today.getDay();
            const diffToMonday = (day + 6) % 7;
            const start = new Date(today);
            start.setDate(today.getDate() - diffToMonday);
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            setCalendarStart(toDateString(start));
            setCalendarEnd(toDateString(end));
            return;
        }
        if (preset === 'month') {
            const start = new Date(today.getFullYear(), today.getMonth(), 1);
            const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            setCalendarStart(toDateString(start));
            setCalendarEnd(toDateString(end));
            return;
        }
        const start = new Date(today.getFullYear(), 0, 1);
        const end = new Date(today.getFullYear(), 11, 31);
        setCalendarStart(toDateString(start));
        setCalendarEnd(toDateString(end));
    };

    const applyIosDateTime = () => {
        if (!calendarStart) {
            setShowIosPicker(false);
            return;
        }
        const start = fromDateString(calendarStart, false);
        const endSeed = calendarEnd ?? calendarStart;
        const end = fromDateString(endSeed, true);
        if (!start || !end) {
            setShowIosPicker(false);
            return;
        }
        const finalEnd = end < start ? new Date(start.getTime()) : end;
        setTimeRange({ start, end: finalEnd });
        setShowIosPicker(false);
    };

    const formatDateRange = (start: Date, end: Date) => {
        const sameDay = start.toDateString() === end.toDateString();
        const startText = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        if (sameDay) return startText;
        const endText = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return `${startText} → ${endText}`;
    };

    const closeNativePicker = useCallback(() => {
        setActiveDateField(null);
        setNativePickerVisible(false);
    }, []);

    const openRangeFieldPicker = useCallback((field: 'start' | 'end') => {
        const fallback = toDateString(new Date());
        const seedValue = field === 'start'
            ? (calendarStart ?? calendarEnd ?? fallback)
            : (calendarEnd ?? calendarStart ?? fallback);
        const seed = fromDateString(seedValue, field === 'end') ?? new Date();
        setActiveDateField(field);
        setNativePickerDate(seed);
        setNativePickerVisible(true);
    }, [calendarEnd, calendarStart]);

    const applyPickedDateToField = useCallback((pickedDate: Date, field: 'start' | 'end') => {
        const selectedDay = toDateString(pickedDate);
        if (field === 'start') {
            setCalendarStart(selectedDay);
            if (calendarEnd && selectedDay > calendarEnd) {
                setCalendarEnd(selectedDay);
            }
            return;
        }
        if (!calendarStart || selectedDay < calendarStart) {
            setCalendarStart(selectedDay);
            setCalendarEnd(selectedDay);
            return;
        }
        setCalendarEnd(selectedDay);
    }, [calendarEnd, calendarStart]);

    const onNativePickerChange = useCallback((event: any, selectedDate?: Date) => {
        if (event?.type === 'dismissed') {
            closeNativePicker();
            return;
        }
        const pickedDate = selectedDate ?? nativePickerDate;
        setNativePickerDate(pickedDate);
        if (Platform.OS === 'android' && activeDateField) {
            applyPickedDateToField(pickedDate, activeDateField);
            closeNativePicker();
        }
    }, [activeDateField, applyPickedDateToField, closeNativePicker, nativePickerDate]);

    const applyNativePickerSelection = useCallback(() => {
        if (!activeDateField) {
            closeNativePicker();
            return;
        }
        applyPickedDateToField(nativePickerDate, activeDateField);
        closeNativePicker();
    }, [activeDateField, applyPickedDateToField, closeNativePicker, nativePickerDate]);

    const loadEvents = useCallback(async (query: string) => {
        if (!apiAccessToken) return;
        setIsLoadingEvents(true);
        setEventsError(null);
        try {
            const res = await searchEvents(apiAccessToken, { q: query, limit: 200 });
            const list = Array.isArray(res?.events) ? res.events : [];
            const mapped = list.map((event: any) => ({
                    id: String(event.event_id),
                    title: event.event_name || event.event_title || 'Competition',
                    location: event.event_location || '',
                    date: formatEventDate(String(event.event_date || '')),
                    competitionType: resolveCompetitionType({
                        type: event.competition_type,
                        name: event.event_name || event.event_title,
                        location: event.event_location,
                        organizer: event.organizing_club || event.organizer_club || null,
                    }),
                    organizingClub: String(
                        event.organizing_club
                        || event.organizer_club
                        || event.competition_organizing_club
                        || event.competition_organizer_name
                        || '',
                    ).trim(),
                    thumbnail: event.thumbnail_url ? { uri: event.thumbnail_url } : Images.photo4,
                }));
            setAvailableEvents(mapped);
        } catch (e: any) {
            const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
            setEventsError(msg);
            setAvailableEvents([]);
        } finally {
            setIsLoadingEvents(false);
        }
    }, [apiAccessToken, formatEventDate, resolveCompetitionType]);

    useEffect(() => {
        loadEvents('');
    }, [loadEvents]);

    const modalWidth = Math.min(windowWidth * 0.9, 420);

    const resetSubscribeForm = useCallback(() => {
        setSubscribeStep(0);
        setChestNumber('');
        setUseDefaultChest(false);
        setAllowFaceRecognition(false);
        setSelectedDisciplineIds([SUBSCRIPTION_ALL_DISCIPLINE_ID]);
        setSelectedCategoryLabels(['All']);
        setSubscribeDisciplines([]);
        setSubscribeDisciplinesLoading(false);
    }, [userProfile]);

    const openSubscribeModal = useCallback((event: any) => {
        resetSubscribeForm();
        setModalEvent(event);
        setShowSubscribeModal(true);
        if (!apiAccessToken || !event?.id) return;
        setSubscribeDisciplinesLoading(true);
        getEventCompetitions(apiAccessToken, String(event.id), { onlyWithMedia: false })
            .then((res) => {
                const options = buildSubscriptionDisciplineOptions(Array.isArray(res?.competitions) ? res.competitions : []);
                setSubscribeDisciplines(options);
                setSelectedDisciplineIds([SUBSCRIPTION_ALL_DISCIPLINE_ID]);
            })
            .catch(() => {
                setSubscribeDisciplines([]);
                setSelectedDisciplineIds([SUBSCRIPTION_ALL_DISCIPLINE_ID]);
            })
            .finally(() => {
                setSubscribeDisciplinesLoading(false);
            });
    }, [apiAccessToken, resetSubscribeForm]);

    const closeSubscribeModal = useCallback(() => {
        setShowSubscribeModal(false);
        setModalEvent(null);
        resetSubscribeForm();
    }, [resetSubscribeForm]);
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
    const startFaceEnrollment = useCallback(() => {
        closeSubscribeModal();
        InteractionManager.runAfterInteractions(() => {
            const parentNav = navigation.getParent?.();
            if (parentNav) {
                parentNav.navigate('Search', {
                    screen: 'SearchFaceCaptureScreen',
                    params: {
                        mode: 'enrolFace',
                        requireConsentBeforeEnroll: false,
                        afterEnroll: {
                            screen: 'AISearchScreen',
                        },
                    },
                });
                return;
            }
            navigation.navigate('AISearchScreen');
        });
    }, [closeSubscribeModal, navigation]);
    const handleFaceToggle = useCallback(async (nextValue: boolean) => {
        if (!nextValue) {
            setAllowFaceRecognition(false);
            return;
        }
        if (!apiAccessToken) {
            Alert.alert(t('Missing API token'), t('Log in again to enable face recognition.'));
            return;
        }
        const eventId = String(modalEvent?.id ?? '').trim();
        if (!eventId) {
            const latest = await refreshProfileFaceState();
            if (latest.hasFaceEnrollment && latest.faceConsentGranted) {
                setAllowFaceRecognition(true);
                return;
            }
            Alert.alert(t('Select competition'), t('Pick a competition first, then enable face recognition.'));
            return;
        }
        try {
            await searchFaceByEnrollment(apiAccessToken, {
                event_ids: [eventId],
                label: 'default',
                limit: 1,
                top: 1,
                save: false,
            });
            setProfileFaceVerified(true);
            setProfileFaceConsentGranted(true);
            setAllowFaceRecognition(true);
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
                                            setAllowFaceRecognition(true);
                                            return;
                                        }
                                        setAllowFaceRecognition(false);
                                        Alert.alert(
                                            t('Face setup required'),
                                            t('Set up your face scan to use face recognition for this competition.'),
                                            [
                                                { text: t('Cancel'), style: 'cancel' },
                                                { text: t('Set up face'), onPress: startFaceEnrollment },
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
                            { text: t('Set up face'), onPress: startFaceEnrollment },
                        ],
                    );
                    return;
                }
            }
        }
        const latest = await refreshProfileFaceState();
        if (latest.hasFaceEnrollment && latest.faceConsentGranted) {
            setAllowFaceRecognition(true);
            return;
        }
        if (latest.faceConsentGranted) {
            Alert.alert(
                t('Face setup required'),
                t('Set up your face scan to use face recognition for this competition.'),
                [
                    { text: t('Cancel'), style: 'cancel' },
                    { text: t('Set up face'), onPress: startFaceEnrollment },
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
                            startFaceEnrollment();
                        } catch (consentError: any) {
                            const msg = consentError instanceof ApiError ? consentError.message : String(consentError?.message ?? consentError);
                            Alert.alert(t('Consent failed'), msg);
                        }
                    },
                },
            ],
        );
    }, [apiAccessToken, modalEvent?.id, refreshProfileFaceState, startFaceEnrollment, t]);

    useEffect(() => {
        if (!apiAccessToken) return;
        void refreshProfileFaceState();
    }, [apiAccessToken, refreshProfileFaceState]);

    const activeChestNumber = useMemo(() => {
        return String((useDefaultChest ? defaultChestNumber : chestNumber) ?? '').trim();
    }, [chestNumber, defaultChestNumber, useDefaultChest]);
    const normalizedDisciplineIds = useMemo(
        () => selectedDisciplineIds.includes(SUBSCRIPTION_ALL_DISCIPLINE_ID) ? [] : selectedDisciplineIds,
        [selectedDisciplineIds],
    );
    const selectedDisciplineLabels = useMemo(
        () => {
            if (selectedDisciplineIds.includes(SUBSCRIPTION_ALL_DISCIPLINE_ID)) {
                return [t('all')];
            }
            const labels = subscribeDisciplines
                .filter((option) => selectedDisciplineIds.includes(option.id))
                .map((option) => option.label);
            return labels.length > 0 ? labels : [t('all')];
        },
        [selectedDisciplineIds, subscribeDisciplines, t],
    );
    const normalizedCategoryLabels = useMemo(
        () => normalizeSubscriptionCategories(selectedCategoryLabels),
        [selectedCategoryLabels],
    );

    const handleSubscribeReview = useCallback(() => {
        if (!modalEvent?.id) return;
        const safeChestNumber = /^\d+$/.test(activeChestNumber) ? activeChestNumber : '';
        const eventYear =
            getYearFromDateLike(modalEvent?.date) ||
            getYearFromDateLike(modalEvent?.title) ||
            String(new Date().getFullYear());
        closeSubscribeModal();
        navigation.navigate('EventSummaryScreen', {
            mode: 'eventSubscription',
            subscription: {
                eventId: String(modalEvent.id),
                eventTitle: String(modalEvent.title ?? ''),
                eventDate: String(modalEvent.date ?? ''),
                eventLocation: String(modalEvent.location ?? ''),
                eventTypeLabel: getCompetitionTypeLabel(modalEvent.competitionType),
                organizingClub: String(modalEvent.organizingClub ?? ''),
                competitionYear: eventYear,
                isTrackCompetition: true,
                chestNumber: safeChestNumber || null,
                useFaceRecognition: hasFaceEnrollment ? allowFaceRecognition : false,
                hasFaceEnrollment,
                faceConsentGranted,
                disciplineIds: normalizedDisciplineIds,
                disciplineLabels: selectedDisciplineLabels,
                categoryLabels: normalizedCategoryLabels,
            },
        });
    }, [
        activeChestNumber,
        allowFaceRecognition,
        closeSubscribeModal,
        faceConsentGranted,
        getCompetitionTypeLabel,
        getYearFromDateLike,
        hasFaceEnrollment,
        modalEvent,
        navigation,
        normalizedCategoryLabels,
        normalizedDisciplineIds,
        selectedDisciplineLabels,
    ]);

    const competitionQuery = filterValues.Competition.trim().toLowerCase();
    const locationQuery = filterValues.Location.trim().toLowerCase();
    const hasTypedQuery = competitionQuery.length > 0 || locationQuery.length > 0;
    const activeFilters = EVENT_FILTERS.filter((filter) => filterValues[filter].trim().length > 0);
    const filteredEvents = useMemo(() => {
        const rankMatch = (value: string, query: string) => {
            if (!query) return 1;
            const safeValue = String(value || '').toLowerCase();
            const idx = safeValue.indexOf(query);
            if (idx === 0) return 0;
            if (idx > 0) return 1;
            return 2;
        };
        const filtered = availableEvents.filter((event) => {
            const eventDate = parseEventDate(event.date);
            const rangeOk = timeRange.start || timeRange.end ? isWithinRange(eventDate) : true;
            const typeOk = competitionTypeFilter === 'all' ? true : event.competitionType === competitionTypeFilter;
            const competitionOk = competitionQuery ? event.title.toLowerCase().includes(competitionQuery) : true;
            const locationOk = locationQuery ? event.location.toLowerCase().includes(locationQuery) : true;
            return competitionOk && locationOk && rangeOk && typeOk;
        });
        return filtered.sort((a, b) => {
            const primaryQuery = String(filterValues[activeFilter] || '').trim().toLowerCase();
            const secondaryQuery = activeFilter === 'Competition' ? locationQuery : competitionQuery;
            const aPrimary = activeFilter === 'Competition'
                ? rankMatch(a.title, primaryQuery)
                : rankMatch(a.location, primaryQuery);
            const bPrimary = activeFilter === 'Competition'
                ? rankMatch(b.title, primaryQuery)
                : rankMatch(b.location, primaryQuery);
            if (aPrimary !== bPrimary) return aPrimary - bPrimary;
            const aSecondary = activeFilter === 'Competition'
                ? rankMatch(a.location, secondaryQuery)
                : rankMatch(a.title, secondaryQuery);
            const bSecondary = activeFilter === 'Competition'
                ? rankMatch(b.location, secondaryQuery)
                : rankMatch(b.title, secondaryQuery);
            if (aSecondary !== bSecondary) return aSecondary - bSecondary;
            const aDate = parseEventDate(a.date)?.getTime() ?? 0;
            const bDate = parseEventDate(b.date)?.getTime() ?? 0;
            return bDate - aDate;
        });
    }, [activeFilter, availableEvents, competitionQuery, competitionTypeFilter, filterValues, isWithinRange, locationQuery, timeRange.end, timeRange.start]);
    const pageSize = hasTypedQuery ? SEARCH_EVENTS_INITIAL_LIMIT : DEFAULT_EVENTS_INITIAL_LIMIT;
    const visibleEvents = useMemo(
        () => filteredEvents.slice(0, visibleEventCount),
        [filteredEvents, visibleEventCount],
    );
    const hasMoreEvents = visibleEvents.length < filteredEvents.length;

    useEffect(() => {
        loadMoreLockedRef.current = false;
        setVisibleEventCount(pageSize);
    }, [
        pageSize,
        activeFilter,
        competitionQuery,
        locationQuery,
        competitionTypeFilter,
        timeRange.start,
        timeRange.end,
    ]);

    const handleMainScroll = useCallback((event: any) => {
        const native = event?.nativeEvent;
        if (!native) return;
        const { contentOffset, contentSize, layoutMeasurement } = native;
        const distanceToBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
        if (distanceToBottom > SCROLL_LOAD_THRESHOLD_PX) {
            loadMoreLockedRef.current = false;
            return;
        }
        if (loadMoreLockedRef.current || !hasMoreEvents) return;
        loadMoreLockedRef.current = true;
        setVisibleEventCount((prev) => Math.min(prev + pageSize, filteredEvents.length));
    }, [filteredEvents.length, hasMoreEvents, pageSize]);

    const handleSearchChange = (value: string) => {
        setFilterValues((prev) => ({
            ...prev,
            [activeFilter]: value,
        }));
    };

    const clearFilterValue = (filter: EventFilterKey) => {
        setFilterValues((prev) => ({
            ...prev,
            [filter]: '',
        }));
    };

    const renderEventCard = (item: any) => (
        <TouchableOpacity
            key={item.id}
            style={Styles.eventCard}
            activeOpacity={0.85}
            onPress={() => openSubscribeModal(item)}
            testID={`available-event-card-${item.id}`}
        >
            <View style={Styles.eventIconContainer}>
                            <Calendar size={20} color={colors.primaryColor} variant="Linear" />
            </View>
            <SizeBox width={16} />
            <View style={Styles.eventContent}>
                <View style={Styles.eventNameRow}>
                    <Text style={Styles.eventName}>{item.title}</Text>
                    <View style={Styles.eventTypeBadge}>
                        <Text style={Styles.eventTypeBadgeText}>{getCompetitionTypeLabel(item.competitionType)}</Text>
                    </View>
                </View>
                <SizeBox height={6} />
                <View style={Styles.eventDetails}>
                    {item.date ? (
                        <View style={Styles.eventDetailItem}>
                            <Calendar size={14} color={colors.subTextColor} variant="Linear" />
                            <SizeBox width={4} />
                            <Text style={Styles.eventDetailText}>{item.date}</Text>
                        </View>
                    ) : null}
                    {item.location ? (
                        <View style={Styles.eventDetailItem}>
                            <Location size={14} color={colors.subTextColor} variant="Linear" />
                            <SizeBox width={4} />
                            <Text style={Styles.eventDetailText}>{item.location}</Text>
                        </View>
                    ) : null}
                </View>
                {item.organizingClub ? (
                    <>
                        <SizeBox height={4} />
                        <Text style={Styles.eventMetaText} numberOfLines={1}>{item.organizingClub}</Text>
                    </>
                ) : null}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={20} color={colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{t('events')}</Text>
                <View style={Styles.headerSpacer} />
            </View>

            <ScrollView
                testID="available-events-screen"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={Styles.scrollContent}
                onScroll={handleMainScroll}
                scrollEventThrottle={16}
            >
                <View style={Styles.searchRow}>
                    <View style={Styles.searchInputContainer}>
                        <SearchNormal1 size={16} color={colors.subTextColor} variant="Linear" />
                        <SizeBox width={8} />
                        <View style={Styles.searchInputPill}>
                            <Text style={Styles.searchInputPillText}>
                                {activeFilter === 'Competition' ? t('competition') : t('location')}:
                            </Text>
                        </View>
                        <TextInput
                            style={Styles.searchInput}
                            placeholder={searchPlaceholder}
                            placeholderTextColor={colors.subTextColor}
                            value={activeValue}
                            onChangeText={handleSearchChange}
                            returnKeyType="search"
                        />
                    </View>
                </View>

                <SizeBox height={16} />

                <View style={Styles.filterTabsContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {EVENT_FILTERS.map((filter) => (
                            <TouchableOpacity
                                key={filter}
                                style={[
                                    Styles.filterTab,
                                    activeFilter === filter && Styles.filterTabActive
                                ]}
                                onPress={() => setActiveFilter(filter)}
                            >
                                <Text style={[
                                    Styles.filterTabText,
                                    activeFilter === filter && Styles.filterTabTextActive
                                ]}>
                                    {filter === 'Competition' ? t('competition') : t('location')}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <SizeBox height={16} />

                <View style={Styles.typeFilterRow}>
                    <Text style={Styles.typeFilterLabel}>{t('competitionType')}</Text>
                    <View style={Styles.typeFilterChips}>
                        {COMPETITION_TYPE_FILTERS.map((option) => (
                            <TouchableOpacity
                                key={option.key}
                                style={[
                                    Styles.typeFilterChip,
                                    competitionTypeFilter === option.key && Styles.typeFilterChipActive,
                                ]}
                                onPress={() => setCompetitionTypeFilter(option.key)}
                            >
                                <Text
                                    style={[
                                        Styles.typeFilterChipText,
                                        competitionTypeFilter === option.key && Styles.typeFilterChipTextActive,
                                    ]}
                                >
                                    {option.focusId ? getSportFocusLabel(option.focusId, t) : t(option.labelKey!)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <SizeBox height={12} />

                <View style={Styles.activeChipsContainer}>
                    {activeFilters.map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={Styles.activeChip}
                            onPress={() => clearFilterValue(filter)}
                        >
                            <Text style={Styles.activeChipText}>
                                {(filter === 'Competition' ? t('competition') : t('location'))}: {filterValues[filter]}
                            </Text>
                            <CloseCircle size={16} color="#FFFFFF" variant="Linear" />
                        </TouchableOpacity>
                    ))}
                    {timeRange.start && timeRange.end ? (
                        <TouchableOpacity
                            style={Styles.timeRangeChipActive}
                            onPress={openDateTimePicker}
                        >
                            <Clock size={14} color={colors.primaryColor} variant="Linear" />
                            <Text style={Styles.timeRangeTextActive}>{formatDateRange(timeRange.start, timeRange.end)}</Text>
                            <TouchableOpacity onPress={() => setTimeRange({ start: null, end: null })}>
                                <CloseCircle size={16} color={colors.primaryColor} variant="Linear" />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={Styles.timeRangeChip} onPress={openDateTimePicker}>
                            <Clock size={14} color={colors.subTextColor} variant="Linear" />
                            <SizeBox width={4} />
                            <Text style={Styles.timeRangeText}>{t('selectDateRange')}</Text>
                            <SizeBox width={4} />
                            <ArrowDown2 size={14} color={colors.subTextColor} variant="Linear" />
                        </TouchableOpacity>
                    )}
                </View>

                <SizeBox height={16} />

                {/* Available Events Section */}
                <View style={Styles.sectionHeader}>
                    <Text style={Styles.sectionTitle}>{t('availableEvents')}</Text>
                    <View style={Styles.eventsCountBadge}>
                        <Text style={Styles.eventsCountText}>{filteredEvents.length} {t('events').toLowerCase()}</Text>
                    </View>
                </View>

                {eventsError ? (
                    <Text style={Styles.errorText}>{eventsError}</Text>
                ) : isLoadingEvents ? (
                    <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                        <ActivityIndicator color={colors.primaryColor} />
                    </View>
                ) : filteredEvents.length > 0 ? (
                    visibleEvents.map(renderEventCard)
                ) : (
                    <View style={{ paddingVertical: 20 }}>
                        <Text style={Styles.emptyStateText}>{t('No events found.')}</Text>
                    </View>
                )}

                <SizeBox height={20} />
            </ScrollView>

            <Modal
                visible={showSubscribeModal}
                transparent
                animationType="slide"
                onRequestClose={closeSubscribeModal}
            >
                <View style={Styles.feedbackBackdrop}>
                    <Pressable style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }} onPress={closeSubscribeModal} />
                    <View style={Styles.feedbackCard}>
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={Styles.modalScrollContent}
                        >
                                <View style={Styles.modalHeaderRow}>
                                    <Text style={Styles.modalTitle}>
                                        {subscribeStep === 0 ? t('Discipline') : subscribeStep === 1 ? t('Category') : t('User')}
                                    </Text>
                                    <TouchableOpacity
                                        style={Styles.modalHeaderAction}
                                        onPress={() => {
                                            if (!modalEvent) return;
                                            closeSubscribeModal();
                                            navigation.navigate('CompetitionDetailsScreen', {
                                                name: modalEvent.title,
                                                location: modalEvent.location,
                                                date: modalEvent.date,
                                                organizingClub: modalEvent.organizingClub,
                                                competitionType: modalEvent.competitionType,
                                                eventId: modalEvent.id,
                                            });
                                        }}
                                    >
                                        <Text style={Styles.modalHeaderActionText}>{t('viewCompetition')}</Text>
                                    </TouchableOpacity>
                                </View>

                                {subscribeStep === 0 ? (
                                    <View style={Styles.modalSectionCard}>
                                        <Text style={Styles.modalSectionTitle}>{t('disciplines')}</Text>
                                        <Text style={Styles.modalSectionHint}>{t('Choose one or more disciplines, or keep All for the full competition.')}</Text>
                                        {subscribeDisciplinesLoading ? (
                                            <View style={{ paddingVertical: 10, alignItems: 'center' }}>
                                                <ActivityIndicator color={colors.primaryColor} />
                                            </View>
                                        ) : (
                                            <View style={Styles.modalChipsGrid}>
                                                {subscribeDisciplines.map((item) => {
                                                    const isSelected = selectedDisciplineIds.includes(item.id);
                                                    return (
                                                        <TouchableOpacity
                                                            key={`discipline-${item.id}`}
                                                            style={[Styles.modalChip, isSelected && Styles.modalChipActive]}
                                                            onPress={() => setSelectedDisciplineIds((prev) => toggleSubscriptionDiscipline(prev, item.id))}
                                                            activeOpacity={0.8}
                                                        >
                                                            <Text style={[Styles.modalChipText, isSelected && Styles.modalChipTextActive]}>
                                                                {item.id === SUBSCRIPTION_ALL_DISCIPLINE_ID ? t('all') : item.label}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </View>
                                        )}
                                    </View>
                                ) : null}

                                {subscribeStep === 1 ? (
                                    <View style={Styles.modalSectionCard}>
                                        <Text style={Styles.modalSectionTitle}>{t('Category')}</Text>
                                        <Text style={Styles.modalSectionHint}>{t('Choose the categories you want to follow, or keep All.')}</Text>
                                        <View style={Styles.modalChipsGrid}>
                                            {SUBSCRIPTION_CATEGORY_OPTIONS.map((item) => {
                                                const isSelected = normalizedCategoryLabels.includes(item);
                                                return (
                                                    <TouchableOpacity
                                                        key={`category-${item}`}
                                                        style={[Styles.modalChip, isSelected && Styles.modalChipActive]}
                                                        onPress={() => setSelectedCategoryLabels((prev) => toggleSubscriptionCategory(prev, item))}
                                                        activeOpacity={0.8}
                                                    >
                                                        <Text style={[Styles.modalChipText, isSelected && Styles.modalChipTextActive]}>
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
                                        <View style={Styles.modalSectionCard}>
                                        <Text style={Styles.modalSectionTitle}>{t('Chest number')}</Text>
                                        <Text style={Styles.modalSectionHint}>{t('Chest number is optional. Leave it empty to follow all photos for this subscription.')}</Text>
                                        {!useDefaultChest || !defaultChestNumber ? (
                                            <View style={Styles.modalChestInput}>
                                                <User size={16} color={colors.subTextColor} variant="Linear" />
                                                <TextInput
                                                    style={Styles.modalChestTextInput}
                                                    placeholder={t('enterChestNumber')}
                                                    placeholderTextColor={colors.subTextColor}
                                                    value={chestNumber}
                                                    onChangeText={setChestNumber}
                                                />
                                            </View>
                                        ) : null}
                                        <TouchableOpacity
                                            style={Styles.defaultChestRow}
                                            onPress={() => {
                                                if (!defaultChestNumber) return;
                                                setUseDefaultChest((prev) => !prev);
                                            }}
                                            activeOpacity={0.8}
                                        >
                                            <View style={[Styles.defaultChestBox, useDefaultChest && Styles.defaultChestBoxActive]}>
                                                {useDefaultChest && <Text style={Styles.defaultChestCheck}>{t('✓')}</Text>}
                                            </View>
                                            <Text style={Styles.defaultChestText}>
                                                {defaultChestNumber
                                                    ? `${t('useDefaultNumber')} (${defaultChestNumber})`
                                                    : t('No saved chest number yet. Enter the chest number for this competition below.')}
                                            </Text>
                                        </TouchableOpacity>
                                        </View>

                                        <View style={Styles.modalSectionCard}>
                                            <Text style={Styles.modalSectionTitle}>{t('Face')}</Text>
                                            <View style={Styles.modalToggleRow}>
                                                <View style={Styles.modalToggleCopy}>
                                                    <Text style={Styles.modalToggleTitle}>{t('Allow face recognition for this competition')}</Text>
                                                    <Text style={Styles.modalToggleHint}>
                                                        {!hasFaceEnrollment
                                                            ? t('Face: enrollment required.')
                                                            : faceConsentGranted
                                                                ? t('Enable this only if you want notifications narrowed to your face.')
                                                                : t('Permission will be requested when you confirm.')}
                                                    </Text>
                                                </View>
                                                <Switch
                                                    value={allowFaceRecognition}
                                                    onValueChange={handleFaceToggle}
                                                    trackColor={{ false: colors.lightGrayColor, true: colors.primaryColor }}
                                                    thumbColor={colors.pureWhite}
                                                />
                                            </View>
                                        </View>
                                    </>
                                ) : null}

                                <View style={Styles.modalButtonsRow}>
                                    <TouchableOpacity
                                        style={Styles.modalCancelButton}
                                        onPress={() => {
                                            if (subscribeStep === 0) {
                                                closeSubscribeModal();
                                                return;
                                            }
                                            setSubscribeStep((prev) => Math.max(0, prev - 1) as 0 | 1 | 2);
                                        }}
                                    >
                                        <Text style={Styles.modalCancelText}>{subscribeStep === 0 ? t('cancel') : t('Back')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={Styles.modalConfirmButton}
                                        onPress={() => {
                                            if (subscribeStep < 2) {
                                                setSubscribeStep((prev) => Math.min(2, prev + 1) as 0 | 1 | 2);
                                                return;
                                            }
                                            handleSubscribeReview();
                                        }}
                                        testID="available-event-subscribe-confirm"
                                    >
                                        <Text style={Styles.modalConfirmText}>
                                            {subscribeStep < 2 ? t('Next') : t('Review')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={showIosPicker}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    setShowIosPicker(false);
                    closeNativePicker();
                }}
            >
                <View style={Styles.dateModalOverlay}>
                    <Pressable
                        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
                        onPress={() => {
                            setShowIosPicker(false);
                            closeNativePicker();
                        }}
                    />
                    <View style={[Styles.dateModalContainer, { width: modalWidth }]}>
                        <Text style={Styles.dateModalTitle}>{t('selectDateRange')}</Text>
                        <SizeBox height={10} />
                        <View style={Styles.quickRangeRow}>
                            <TouchableOpacity style={Styles.quickRangeChip} onPress={() => setQuickRange('week')}>
                                <Text style={Styles.quickRangeChipText}>{t('thisWeek')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={Styles.quickRangeChip} onPress={() => setQuickRange('month')}>
                                <Text style={Styles.quickRangeChipText}>{t('thisMonth')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={Styles.quickRangeChip} onPress={() => setQuickRange('year')}>
                                <Text style={Styles.quickRangeChipText}>{t('thisYear')}</Text>
                            </TouchableOpacity>
                        </View>
                        <SizeBox height={8} />
                        <View style={Styles.rangeHeaderRow}>
                            <TouchableOpacity
                                style={Styles.rangePill}
                                onPress={() => openRangeFieldPicker('start')}
                                activeOpacity={0.8}
                            >
                                <Text style={Styles.rangePillLabel}>{t('start')}</Text>
                                <Text style={Styles.rangePillValue}>{calendarStart ?? t('selectDate')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={Styles.rangePill}
                                onPress={() => openRangeFieldPicker('end')}
                                activeOpacity={0.8}
                            >
                                <Text style={Styles.rangePillLabel}>{t('end')}</Text>
                                <Text style={Styles.rangePillValue}>{calendarEnd ?? t('selectDate')}</Text>
                            </TouchableOpacity>
                        </View>
                        <SizeBox height={12} />
                        <View style={Styles.dateModalButtonRow}>
                            <TouchableOpacity style={Styles.dateModalCancelButton} onPress={() => {
                                setShowIosPicker(false);
                                closeNativePicker();
                            }}>
                                <Text style={Styles.dateModalCancelText}>{t('cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[Styles.dateModalSubmitButton, !calendarStart && Styles.dateModalSubmitButtonDisabled]}
                                onPress={applyIosDateTime}
                                disabled={!calendarStart}
                            >
                                <Text style={Styles.dateModalSubmitText}>{t('apply')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {Platform.OS === 'ios' && nativePickerVisible && activeDateField ? (
                        <View style={Styles.nativePickerOverlay}>
                            <Pressable style={Styles.nativePickerBackdrop} onPress={closeNativePicker} />
                            <View style={Styles.nativePickerSheet}>
                                <View style={Styles.nativePickerToolbar}>
                                    <TouchableOpacity style={Styles.nativePickerAction} onPress={closeNativePicker}>
                                        <Text style={Styles.nativePickerActionText}>{t('cancel')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={Styles.nativePickerAction} onPress={applyNativePickerSelection}>
                                        <Text style={Styles.nativePickerActionText}>{t('apply')}</Text>
                                    </TouchableOpacity>
                                </View>
                                <DateTimePicker
                                    {...pickerVisualProps}
                                    value={nativePickerDate}
                                    mode="date"
                                    display="spinner"
                                    onChange={onNativePickerChange}
                                />
                            </View>
                        </View>
                    ) : null}
                </View>
            </Modal>

            {nativePickerVisible && activeDateField && Platform.OS === 'android' ? (
                <DateTimePicker
                    {...pickerVisualProps}
                    value={nativePickerDate}
                    mode="date"
                    display="default"
                    onChange={onNativePickerChange}
                />
            ) : null}
        </View>
    );
};

export default AvailableEventsScreen;
