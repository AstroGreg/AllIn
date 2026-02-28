import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Pressable, useWindowDimensions, ActivityIndicator, Alert, Platform } from 'react-native';
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
import { useEvents } from '../../context/EventsContext';
import { ApiError, grantFaceRecognitionConsent, searchEvents, subscribeToEvent } from '../../services/apiGateway';
import { useTranslation } from 'react-i18next';

const EVENT_FILTERS = ['Competition', 'Location'] as const;
type EventFilterKey = typeof EVENT_FILTERS[number];
type CompetitionType = 'track' | 'road';
type CompetitionTypeFilter = 'all' | CompetitionType;
const COMPETITION_TYPE_FILTERS: Array<{ key: CompetitionTypeFilter; labelKey: string }> = [
    { key: 'all', labelKey: 'all' },
    { key: 'track', labelKey: 'trackAndField' },
    { key: 'road', labelKey: 'roadAndTrail' },
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
    const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
    const [chestNumber, setChestNumber] = useState('');
    const [useDefaultChest, setUseDefaultChest] = useState(true);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(['All']);
    const [allowFaceRecognition, setAllowFaceRecognition] = useState(false);
    const [availableEvents, setAvailableEvents] = useState<any[]>([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);
    const [eventsError, setEventsError] = useState<string | null>(null);
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [visibleEventCount, setVisibleEventCount] = useState(DEFAULT_EVENTS_INITIAL_LIMIT);
    const loadMoreLockedRef = useRef(false);
    const { apiAccessToken, userProfile } = useAuth();
    const { refresh: refreshSubscribed } = useEvents();
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

    const suggestedEvents = useMemo(
        () => ['60m', '100m', '200m', '400m', '800m', '1500m', '5K', '10K', 'Long jump', 'Shot put'],
        []
    );
    const categoryOptions = useMemo(
        () => ['Men', 'Women', 'Junior', 'Cadet', 'Master', 'Senior'],
        []
    );

    const getCompetitionTypeLabel = (type: CompetitionType) => {
        if (type === 'road') return t('roadAndTrail');
        return t('trackAndField');
    };

    const resolveCompetitionType = useCallback((params?: {
        type?: string | null;
        name?: string | null;
        location?: string | null;
    }) => {
        const token = `${params?.type || ''} ${params?.name || ''} ${params?.location || ''}`.toLowerCase();
        if (/road|trail|marathon|veldloop|veldlopen|cross|5k|10k|half|ultra|city\s*run/.test(token)) {
            return 'road' as const;
        }
        return 'track' as const;
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
                    date: event.event_date || '',
                    competitionType: resolveCompetitionType({
                        type: event.competition_type,
                        name: event.event_name || event.event_title,
                        location: event.event_location,
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
    }, [apiAccessToken, resolveCompetitionType]);

    useEffect(() => {
        loadEvents('');
    }, [loadEvents]);

    const modalWidth = Math.min(windowWidth * 0.9, 420);

    const resetSubscribeForm = () => {
        setSelectedEvents([]);
        setSelectedCategories(['All']);
        setChestNumber('');
        setUseDefaultChest(true);
        setAllowFaceRecognition(false);
    };

    const openSubscribeModal = (event: any) => {
        resetSubscribeForm();
        setModalEvent(event);
        setShowSubscribeModal(true);
    };

    const closeSubscribeModal = () => {
        setShowSubscribeModal(false);
        setModalEvent(null);
        resetSubscribeForm();
    };

    const toggleEvent = (value: string) => {
        const cleaned = value.trim();
        if (!cleaned) return;
        setSelectedEvents((prev) =>
            prev.includes(cleaned) ? prev.filter((item) => item !== cleaned) : [...prev, cleaned]
        );
    };

    const toggleCategory = (value: string) => {
        setSelectedCategories((prev) => {
            if (prev.includes(value)) {
                const next = prev.filter((item) => item !== value);
                return next.length === 0 ? ['All'] : next;
            }
            const next = prev.filter((item) => item !== 'All');
            return [...next, value];
        });
    };

    const isTrackCompetition = String(modalEvent?.competitionType || '').toLowerCase() === 'track';
    const hasChestNumber = !isTrackCompetition || (
        useDefaultChest
            ? Boolean(defaultChestNumber)
            : chestNumber.trim().length > 0
    );
    const canContinue = selectedEvents.length > 0 && hasChestNumber;

    const handleSubscribeContinue = async () => {
        if (!modalEvent || !apiAccessToken) return;
        setIsSubscribing(true);
        try {
            await subscribeToEvent(apiAccessToken, modalEvent.id);
            if (allowFaceRecognition) {
                await grantFaceRecognitionConsent(apiAccessToken);
            }
            await refreshSubscribed();
            setShowSubscribeModal(false);
            navigation.navigate('EventSummaryScreen', {
                event: {
                    title: modalEvent.title,
                    date: modalEvent.date,
                    location: modalEvent.location,
                },
                personal: {
                    name: userProfile?.firstName || 'Athlete',
                    chestNumber: isTrackCompetition ? (useDefaultChest ? defaultChestNumber : (chestNumber || defaultChestNumber)) : '',
                    events: selectedEvents,
                    categories: selectedCategories,
                    allowFaceRecognition,
                },
            });
            resetSubscribeForm();
            setModalEvent(null);
        } catch (e: any) {
            const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
            Alert.alert(t('Could not subscribe'), msg);
        } finally {
            setIsSubscribing(false);
        }
    };

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
                                    {t(option.labelKey)}
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
                animationType="fade"
                onRequestClose={closeSubscribeModal}
            >
                <View style={Styles.modalBackdrop}>
                    <View style={Styles.modalCard}>
                        <View style={Styles.modalHeaderRow}>
                            <Text style={Styles.modalTitle}>{t('subscribeToEvent')}</Text>
                            <TouchableOpacity
                                style={Styles.modalHeaderAction}
                                onPress={() => {
                                    if (!modalEvent) return;
                                    setShowSubscribeModal(false);
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
                        <Text style={Styles.modalSubtitle}>
                            {modalEvent?.title ?? t('selectDisciplineChest')}
                        </Text>

                        <Text style={Styles.modalSectionTitle}>{t('disciplines')}</Text>
                        <ScrollView contentContainerStyle={Styles.modalChipsGrid}>
                            {suggestedEvents.map((item) => {
                                const isSelected = selectedEvents.includes(item);
                                return (
                                    <TouchableOpacity
                                        key={`modal-${item}`}
                                        style={[Styles.modalChip, isSelected && Styles.modalChipActive]}
                                        onPress={() => toggleEvent(item)}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[Styles.modalChipText, isSelected && Styles.modalChipTextActive]}>
                                            {item}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        <Text style={Styles.modalSectionTitle}>{t('notificationsFor')}</Text>
                        <View style={Styles.modalChipsGrid}>
                            {selectedCategories.includes('All') && (
                                <View style={[Styles.modalChip, Styles.modalChipActive]}>
                                    <Text style={[Styles.modalChipText, Styles.modalChipTextActive]}>{t('all')}</Text>
                                </View>
                            )}
                            {categoryOptions.map((item) => {
                                const isSelected = selectedCategories.includes(item);
                                return (
                                    <TouchableOpacity
                                        key={`cat-${item}`}
                                        style={[Styles.modalChip, isSelected && Styles.modalChipActive]}
                                        onPress={() => toggleCategory(item)}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[Styles.modalChipText, isSelected && Styles.modalChipTextActive]}>
                                            {t(item.toLowerCase())}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {isTrackCompetition && (
                            <>
                                <Text style={Styles.modalSectionTitle}>{t('chestNumber')}</Text>
                                <View style={Styles.modalChestInput}>
                                    <User size={16} color={colors.subTextColor} variant="Linear" />
                                    <TextInput
                                        style={Styles.modalChestTextInput}
                                        placeholder={t('enterChestNumber')}
                                        placeholderTextColor={colors.subTextColor}
                                        value={useDefaultChest ? defaultChestNumber : chestNumber}
                                        onChangeText={setChestNumber}
                                        editable={!useDefaultChest}
                                    />
                                </View>
                                <TouchableOpacity
                                    style={Styles.defaultChestRow}
                                    onPress={() => setUseDefaultChest((prev) => !prev)}
                                    activeOpacity={0.8}
                                >
                                    <View style={[Styles.defaultChestBox, useDefaultChest && Styles.defaultChestBoxActive]}>
                                        {useDefaultChest && <Text style={Styles.defaultChestCheck}>{t('✓')}</Text>}
                                    </View>
                                    <Text style={Styles.defaultChestText}>
                                        {t('useDefaultNumber')} ({defaultChestNumber})
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}

                        <TouchableOpacity
                            style={Styles.defaultChestRow}
                            onPress={() => setAllowFaceRecognition((prev) => !prev)}
                            activeOpacity={0.8}
                        >
                            <View style={[Styles.defaultChestBox, allowFaceRecognition && Styles.defaultChestBoxActive]}>
                                {allowFaceRecognition && <Text style={Styles.defaultChestCheck}>{t('✓')}</Text>}
                            </View>
                            <Text style={Styles.defaultChestText}>{t('Allow face recognition for this competition')}</Text>
                        </TouchableOpacity>

                        <View style={Styles.modalButtonsRow}>
                            <TouchableOpacity style={Styles.modalCancelButton} onPress={closeSubscribeModal}>
                                <Text style={Styles.modalCancelText}>{t('cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[Styles.modalConfirmButton, (!canContinue || isSubscribing) && Styles.modalConfirmButtonDisabled]}
                                onPress={handleSubscribeContinue}
                                disabled={!canContinue || isSubscribing}
                            >
                                {isSubscribing ? (
                                    <ActivityIndicator color={colors.pureWhite} />
                                ) : (
                                    <Text style={[Styles.modalConfirmText, !canContinue && Styles.modalConfirmTextDisabled]}>
                                        {t('continue')}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
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
