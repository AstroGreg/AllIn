import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Modal, Pressable, Alert, Platform } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FastImage from 'react-native-fast-image'
import { ArrowLeft2, SearchNormal1, Location, Calendar, VideoSquare, Ghost } from 'iconsax-react-nativejs'
import { createStyles } from './SelectCompetitionStyles'
import SizeBox from '../../constants/SizeBox'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { ApiError, getMediaViewAll, getSubscribedEvents, searchEvents, subscribeToEvent, type MediaViewAllItem, type SubscribedEvent } from '../../services/apiGateway'
import { getApiBaseUrl } from '../../constants/RuntimeConfig'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useTranslation } from 'react-i18next'
import { useFocusEffect } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const UPLOAD_FLOW_RESET_KEY = '@upload_flow_reset_required';
const UPLOAD_SEARCH_INITIAL_LIMIT = 20;
const SCROLL_LOAD_THRESHOLD_PX = 220;

interface Competition {
    id: string;
    name: string;
    videoCount: number;
    location: string;
    date: string;
    thumbnailUrl?: string | null;
    competitionType: 'track' | 'road';
    organizingClub?: string;
}

const SelectCompetitionScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
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
    const { apiAccessToken } = useAuth();
    const anonymous = route?.params?.anonymous;
    const isAnonymous = !!anonymous;

    const [activeFilter, setActiveFilter] = useState<'Competition' | 'Location'>('Competition');
    const [filterValues, setFilterValues] = useState<{ Competition: string; Location: string }>({
        Competition: '',
        Location: '',
    });
    const [eventTypeFilter, setEventTypeFilter] = useState<'all' | 'track' | 'road'>('all');
    const [timeRange, setTimeRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
    const [showCalendar, setShowCalendar] = useState(false);
    const [calendarStart, setCalendarStart] = useState<string | null>(null);
    const [calendarEnd, setCalendarEnd] = useState<string | null>(null);
    const [nativePickerVisible, setNativePickerVisible] = useState(false);
    const [nativePickerDate, setNativePickerDate] = useState<Date>(new Date());
    const [activeDateField, setActiveDateField] = useState<'start' | 'end' | null>(null);
    const [rawEvents, setRawEvents] = useState<SubscribedEvent[]>([]);
    const [subscribedEventIds, setSubscribedEventIds] = useState<Set<string>>(new Set());
    const [mediaByEvent, setMediaByEvent] = useState<Record<string, { thumbUrl?: string; videoCount: number }>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [errorText, setErrorText] = useState<string | null>(null);
    const [subscribePromptVisible, setSubscribePromptVisible] = useState(false);
    const [pendingCompetition, setPendingCompetition] = useState<Competition | null>(null);
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [visibleCompetitionCount, setVisibleCompetitionCount] = useState(UPLOAD_SEARCH_INITIAL_LIMIT);
    const loadMoreLockedRef = useRef(false);

    const resetFilters = useCallback(() => {
        setActiveFilter('Competition');
        setFilterValues({ Competition: '', Location: '' });
        setEventTypeFilter('all');
        setTimeRange({ start: null, end: null });
        setShowCalendar(false);
        setCalendarStart(null);
        setCalendarEnd(null);
        setSubscribePromptVisible(false);
        setPendingCompetition(null);
        setIsSubscribing(false);
    }, []);

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

    const normalizeThumb = useCallback((item: MediaViewAllItem) => {
        const candidate = item.thumbnail_url || item.preview_url || item.full_url || item.raw_url || null;
        const resolved = candidate ? toAbsoluteUrl(String(candidate)) : null;
        return withAccessToken(resolved) || resolved || undefined;
    }, [toAbsoluteUrl, withAccessToken]);

    const toDateString = (date: Date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const fromDateString = (value: string, isEnd: boolean) => {
        const [year, month, day] = value.split('-').map(Number);
        if (!year || !month || !day) return null;
        if (isEnd) return new Date(year, month - 1, day, 23, 59, 59, 999);
        return new Date(year, month - 1, day, 0, 0, 0, 0);
    };

    const parseEventDate = useCallback((value?: string | null) => {
        if (!value) return null;
        const raw = String(value);
        const direct = new Date(raw);
        if (!Number.isNaN(direct.getTime())) return direct;
        if (raw.includes('/')) {
            const [day, month, year] = raw.split('/').map(Number);
            if (!day || !month || !year) return null;
            return new Date(year, month - 1, day, 12, 0, 0, 0);
        }
        return null;
    }, []);

    const openDateTimePicker = () => {
        const todaySeed = toDateString(new Date());
        const startSeed = timeRange.start ? toDateString(timeRange.start) : todaySeed;
        const endSeed = timeRange.end ? toDateString(timeRange.end) : null;
        setCalendarStart(startSeed);
        setCalendarEnd(endSeed);
        setNativePickerVisible(false);
        setActiveDateField(null);
        setShowCalendar(true);
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

    const applyDateRange = () => {
        if (!calendarStart) {
            setShowCalendar(false);
            return;
        }
        const start = fromDateString(calendarStart, false);
        const endSeed = calendarEnd ?? calendarStart;
        const end = fromDateString(endSeed, true);
        if (!start || !end) {
            setShowCalendar(false);
            return;
        }
        const finalEnd = end < start ? new Date(start.getTime()) : end;
        setTimeRange({ start, end: finalEnd });
        setShowCalendar(false);
    };

    const formatDateRange = (start: Date, end: Date) => {
        const sameDay = start.toDateString() === end.toDateString();
        const startText = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        if (sameDay) return startText;
        const endText = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return `${startText} → ${endText}`;
    };

    const timeRangeLabel = timeRange.start && timeRange.end
        ? formatDateRange(timeRange.start, timeRange.end)
        : '';

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

    const activeValue = filterValues[activeFilter];
    const hasTypedQuery = useMemo(
        () => filterValues.Competition.trim().length > 0 || filterValues.Location.trim().length > 0,
        [filterValues.Competition, filterValues.Location],
    );
    const handleSearchChange = (text: string) => {
        setFilterValues((prev) => ({ ...prev, [activeFilter]: text }));
    };

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
                        entry.thumbUrl = normalizeThumb(media);
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
        if (!apiAccessToken) {
            setSubscribedEventIds(new Set());
            return () => {};
        }
        getSubscribedEvents(apiAccessToken)
            .then((resp) => {
                if (!mounted) return;
                const ids = new Set(
                    (Array.isArray(resp?.events) ? resp.events : [])
                        .map((event) => String(event?.event_id || '').trim())
                        .filter(Boolean),
                );
                setSubscribedEventIds(ids);
            })
            .catch(() => {
                if (!mounted) return;
                setSubscribedEventIds(new Set());
            });
        return () => {
            mounted = false;
        };
    }, [apiAccessToken]);

    const loadCompetitions = useCallback(async (query: string) => {
        if (!query.trim()) {
            setRawEvents([]);
            setErrorText(null);
            setIsLoading(false);
            return;
        }
        if (!apiAccessToken) {
            setRawEvents([]);
            setErrorText('Log in to load competitions.');
            return;
        }
        setIsLoading(true);
        setErrorText(null);
        try {
            const res = await searchEvents(apiAccessToken, { q: query || undefined, limit: 100, offset: 0 });
            setRawEvents(Array.isArray(res?.events) ? res.events : []);
        } catch (e: any) {
            const message = e instanceof ApiError ? e.message : String(e?.message ?? e);
            setErrorText(message);
            setRawEvents([]);
        } finally {
            setIsLoading(false);
        }
    }, [apiAccessToken]);

    useEffect(() => {
        const handle = setTimeout(() => {
            const query = String(filterValues[activeFilter] ?? '').trim();
            loadCompetitions(query);
        }, 300);
        return () => clearTimeout(handle);
    }, [loadCompetitions, filterValues, activeFilter]);

    useFocusEffect(
        useCallback(() => {
            let active = true;
            (async () => {
                try {
                    const shouldReset = await AsyncStorage.getItem(UPLOAD_FLOW_RESET_KEY);
                    if (!active || shouldReset !== '1') return;
                    resetFilters();
                    await AsyncStorage.removeItem(UPLOAD_FLOW_RESET_KEY);
                } catch {
                    // ignore
                }
            })();
            return () => {
                active = false;
            };
        }, [resetFilters]),
    );

    const competitions: Competition[] = useMemo(() => {
        return rawEvents.map((event) => {
            const eventId = String(event.event_id);
            const mediaInfo = mediaByEvent[eventId];
            const rawType = String((event as any).event_type || (event as any).competition_type || (event as any).event_category || '');
            const nameSource = event.event_name || event.event_title || '';
            const typeGuess = rawType || nameSource;
            const isRoad = /road|trail|marathon|city run/i.test(typeGuess);
            return {
                id: eventId,
                name: nameSource || 'Competition',
                location: event.event_location || '',
                date: event.event_date || '',
                videoCount: mediaInfo?.videoCount ?? 0,
                thumbnailUrl: mediaInfo?.thumbUrl ?? null,
                competitionType: isRoad ? 'road' : 'track',
                organizingClub: String(
                    (event as any).organizing_club
                    || (event as any).organizer_club
                    || (event as any).competition_organizing_club
                    || (event as any).competition_organizer_name
                    || '',
                ).trim(),
            };
        });
    }, [mediaByEvent, rawEvents]);

    const formatDisplayDate = useCallback((value: string) => {
        if (!value) return '—';
        const parsed = parseEventDate(value);
        if (!parsed) return value;
        const day = String(parsed.getDate()).padStart(2, '0');
        const month = String(parsed.getMonth() + 1).padStart(2, '0');
        const year = parsed.getFullYear();
        return `${day}/${month}/${year}`;
    }, [parseEventDate]);

    const filteredCompetitions = useMemo(() => {
        if (!hasTypedQuery) return [];
        const cFilter = filterValues.Competition.trim().toLowerCase();
        const lFilter = filterValues.Location.trim().toLowerCase();
        const rankMatch = (value: string, query: string) => {
            if (!query) return 1;
            const safeValue = String(value || '').toLowerCase();
            const idx = safeValue.indexOf(query);
            if (idx === 0) return 0;
            if (idx > 0) return 1;
            return 2;
        };
        const filtered = competitions.filter((competition) => {
            const typeOk = eventTypeFilter === 'all' ? true : competition.competitionType === eventTypeFilter;
            const name = competition.name.toLowerCase();
            const location = competition.location.toLowerCase();
            const matchesCompetition = cFilter ? name.includes(cFilter) : true;
            const matchesLocation = lFilter ? location.includes(lFilter) : true;
            const eventDate = parseEventDate(competition.date);
            const inRange =
                timeRange.start || timeRange.end
                    ? !!eventDate &&
                      (!timeRange.start || eventDate >= timeRange.start) &&
                      (!timeRange.end || eventDate <= timeRange.end)
                    : true;
            return matchesCompetition && matchesLocation && typeOk && inRange;
        });
        return filtered.sort((a, b) => {
            const primaryQuery = String(filterValues[activeFilter] || '').trim().toLowerCase();
            const secondaryQuery = activeFilter === 'Competition' ? lFilter : cFilter;
            const aPrimary = activeFilter === 'Competition'
                ? rankMatch(a.name, primaryQuery)
                : rankMatch(a.location, primaryQuery);
            const bPrimary = activeFilter === 'Competition'
                ? rankMatch(b.name, primaryQuery)
                : rankMatch(b.location, primaryQuery);
            if (aPrimary !== bPrimary) return aPrimary - bPrimary;
            const aSecondary = activeFilter === 'Competition'
                ? rankMatch(a.location, secondaryQuery)
                : rankMatch(a.name, secondaryQuery);
            const bSecondary = activeFilter === 'Competition'
                ? rankMatch(b.location, secondaryQuery)
                : rankMatch(b.name, secondaryQuery);
            if (aSecondary !== bSecondary) return aSecondary - bSecondary;
            const aDate = parseEventDate(a.date)?.getTime() ?? 0;
            const bDate = parseEventDate(b.date)?.getTime() ?? 0;
            return bDate - aDate;
        });
    }, [activeFilter, competitions, eventTypeFilter, filterValues, hasTypedQuery, parseEventDate, timeRange.end, timeRange.start]);
    const visibleCompetitions = useMemo(
        () => filteredCompetitions.slice(0, visibleCompetitionCount),
        [filteredCompetitions, visibleCompetitionCount],
    );
    const hasMoreCompetitions = visibleCompetitions.length < filteredCompetitions.length;

    useEffect(() => {
        loadMoreLockedRef.current = false;
        setVisibleCompetitionCount(UPLOAD_SEARCH_INITIAL_LIMIT);
    }, [
        activeFilter,
        hasTypedQuery,
        filterValues.Competition,
        filterValues.Location,
        eventTypeFilter,
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
        if (loadMoreLockedRef.current || !hasTypedQuery || !hasMoreCompetitions) return;
        loadMoreLockedRef.current = true;
        setVisibleCompetitionCount((prev) => Math.min(prev + UPLOAD_SEARCH_INITIAL_LIMIT, filteredCompetitions.length));
    }, [filteredCompetitions.length, hasMoreCompetitions, hasTypedQuery]);

    const continueToCompetition = useCallback((competition: Competition) => {
        navigation.navigate('CompetitionDetailsScreen', {
            competition,
            anonymous,
            competitionType: competition.competitionType,
        });
    }, [anonymous, navigation]);

    const handleUploadToCompetition = useCallback((competition: Competition) => {
        if (subscribedEventIds.has(String(competition.id))) {
            continueToCompetition(competition);
            return;
        }
        setPendingCompetition(competition);
        setSubscribePromptVisible(true);
    }, [continueToCompetition, subscribedEventIds]);

    const handleConfirmSubscribe = useCallback(async () => {
        if (!pendingCompetition) return;
        if (!apiAccessToken) {
            Alert.alert(t('Upload unavailable'), t('Log in to upload to a competition.'));
            return;
        }
        setIsSubscribing(true);
        try {
            await subscribeToEvent(apiAccessToken, pendingCompetition.id);
            setSubscribedEventIds((prev) => {
                const next = new Set(prev);
                next.add(String(pendingCompetition.id));
                return next;
            });
            setSubscribePromptVisible(false);
            continueToCompetition(pendingCompetition);
        } catch (e: any) {
            const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
            Alert.alert(t('Subscription failed'), msg || t('Could not subscribe to this event.'));
        } finally {
            setIsSubscribing(false);
        }
    }, [apiAccessToken, continueToCompetition, pendingCompetition, t]);

    const renderCompetitionCard = (competition: Competition) => (
        <TouchableOpacity
            key={competition.id}
            style={Styles.competitionCard}
            activeOpacity={0.85}
            onPress={() => handleUploadToCompetition(competition)}
        >
            <View style={Styles.competitionContent}>
                <View style={Styles.thumbnailContainer}>
                    {competition.thumbnailUrl ? (
                        <FastImage source={{ uri: competition.thumbnailUrl }} style={Styles.thumbnail} resizeMode="cover" />
                    ) : (
                        <View style={Styles.thumbnailPlaceholder} />
                    )}
                </View>
                <View style={Styles.competitionInfo}>
                    <View style={Styles.competitionHeader}>
                        <Text style={Styles.competitionName} numberOfLines={2}>{competition.name}</Text>
                        <View style={Styles.typeBadge}>
                            <Text style={Styles.typeBadgeText}>
                                {competition.competitionType === 'road' ? 'Road&Trail' : 'Track&Field'}
                            </Text>
                        </View>
                    </View>
                    <View style={Styles.metaRow}>
                        {competition.location ? (
                            <View style={Styles.infoValueRow}>
                                <Location size={14} color={colors.grayColor} variant="Linear" />
                                <Text style={Styles.infoValue} numberOfLines={1}>{competition.location}</Text>
                            </View>
                        ) : null}
                        {competition.date ? (
                            <View style={Styles.infoValueRow}>
                                <Calendar size={14} color={colors.grayColor} variant="Linear" />
                                <Text style={Styles.infoValue} numberOfLines={1}>
                                    {formatDisplayDate(competition.date)}
                                </Text>
                            </View>
                        ) : null}
                    </View>
                    <View style={Styles.videoCountRow}>
                        <VideoSquare size={14} color={colors.grayColor} variant="Linear" />
                        <Text style={Styles.videoCountText}>{competition.videoCount} media</Text>
                    </View>
                    {competition.organizingClub ? (
                        <Text style={Styles.infoValue} numberOfLines={1}>{competition.organizingClub}</Text>
                    ) : null}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{t('upload')}</Text>
                {isAnonymous ? (
                    <View style={Styles.headerGhost}>
                        <Ghost size={22} color={colors.primaryColor} variant="Linear" />
                    </View>
                ) : (
                    <View style={Styles.headerSpacer} />
                )}
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={Styles.scrollContent}
                onScroll={handleMainScroll}
                scrollEventThrottle={16}
            >
                <View style={Styles.uploadModeBanner}>
                    <Text style={Styles.uploadModeText}>
                        {isAnonymous ? t('anonymousUpload') : t('uploadToCompetition')}
                    </Text>
                </View>

                <SizeBox height={12} />

                {/* Search Bar */}
                <View style={Styles.searchRow}>
                    <View style={Styles.searchInputContainer}>
                        <SearchNormal1 size={16} color={colors.grayColor} variant="Linear" />
                        <SizeBox width={8} />
                        <View style={Styles.searchInputPill}>
                            <Text style={Styles.searchInputPillText}>{activeFilter}:</Text>
                        </View>
                        <TextInput
                            style={Styles.searchInput}
                            placeholder={activeFilter === 'Competition' ? t('searchCompetitionsToUpload') : t('searchByLocation')}
                            placeholderTextColor={colors.grayColor}
                            value={activeValue}
                            onChangeText={handleSearchChange}
                        />
                    </View>
                </View>

                <SizeBox height={14} />

                <View style={Styles.filterTabsContainer}>
                    {['Competition', 'Location'].map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[Styles.filterTab, activeFilter === filter && Styles.filterTabActive]}
                            onPress={() => setActiveFilter(filter as 'Competition' | 'Location')}
                        >
                            <Text style={[Styles.filterTabText, activeFilter === filter && Styles.filterTabTextActive]}>
                                {filter === 'Competition' ? t('competition') : t('location')}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <SizeBox height={12} />

                <View style={Styles.typeFilterRow}>
                    <Text style={Styles.typeFilterLabel}>{t('competitionType')}</Text>
                    <View style={Styles.typeFilterChips}>
                        {[
                            { key: 'all', label: t('all') },
                            { key: 'track', label: t('trackAndField') },
                            { key: 'road', label: t('roadAndTrail') },
                        ].map((tab) => (
                            <TouchableOpacity
                                key={tab.key}
                                style={[Styles.typeFilterChip, eventTypeFilter === tab.key && Styles.typeFilterChipActive]}
                                onPress={() => setEventTypeFilter(tab.key as any)}
                            >
                                <Text style={[Styles.typeFilterChipText, eventTypeFilter === tab.key && Styles.typeFilterChipTextActive]}>
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <SizeBox height={12} />

                <View style={Styles.activeChipsContainer}>
                    {filterValues.Competition.trim().length > 0 && (
                        <View style={Styles.activeChip}>
                            <Text style={Styles.activeChipText}>Competition: {filterValues.Competition}</Text>
                        </View>
                    )}
                    {filterValues.Location.trim().length > 0 && (
                        <View style={Styles.activeChip}>
                            <Text style={Styles.activeChipText}>Location: {filterValues.Location}</Text>
                        </View>
                    )}
                    <TouchableOpacity
                        style={[Styles.timeRangeChip, timeRange.start && timeRange.end && Styles.timeRangeChipActive]}
                        onPress={openDateTimePicker}
                    >
                        <Calendar size={14} color={timeRange.start ? colors.primaryColor : colors.grayColor} variant="Linear" />
                        <Text style={[Styles.timeRangeText, timeRange.start && Styles.timeRangeTextActive]}>
                            {timeRange.start && timeRange.end ? timeRangeLabel : t('selectDateRange')}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Results Header */}
                <View style={Styles.resultsHeader}>
                    <Text style={Styles.resultsTitle}>{t('availableCompetitions')}</Text>
                    <View style={Styles.resultsCountBadge}>
                        <Text style={Styles.resultsCountText}>
                            {!hasTypedQuery ? t('Type to search') : (isLoading ? '...' : `${filteredCompetitions.length} ${t('competitions')}`)}
                        </Text>
                    </View>
                </View>

                <SizeBox height={16} />

                {hasTypedQuery && isLoading && filteredCompetitions.length === 0 && (
                    <View style={Styles.loadingRow}>
                        <ActivityIndicator color={colors.primaryColor} />
                        <Text style={Styles.loadingText}>{t('loadingCompetitions')}</Text>
                    </View>
                )}

                {hasTypedQuery && !isLoading && errorText && (
                    <Text style={Styles.errorText}>{errorText}</Text>
                )}

                {/* Competition Cards */}
                {!hasTypedQuery ? (
                    <Text style={Styles.loadingText}>{t('Type competition or location to search')}</Text>
                ) : (
                    visibleCompetitions.map(renderCompetitionCard)
                )}

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>

            <Modal
                visible={subscribePromptVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setSubscribePromptVisible(false)}
            >
                <View style={Styles.modalOverlay}>
                    <Pressable
                        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
                        onPress={() => {
                            if (isSubscribing) return;
                            setSubscribePromptVisible(false);
                        }}
                    />
                    <View style={Styles.subscribeModalContainer}>
                        <Text style={Styles.subscribeModalTitle}>{t('Subscribe to event')}</Text>
                        <SizeBox height={8} />
                        <Text style={Styles.subscribeModalText}>
                            {t('Do you want to subscribe to this event before uploading?')}
                        </Text>
                        <SizeBox height={14} />
                        <View style={Styles.subscribeButtonRow}>
                            <TouchableOpacity
                                style={Styles.subscribeNoButton}
                                disabled={isSubscribing}
                                onPress={() => setSubscribePromptVisible(false)}
                            >
                                <Text style={Styles.subscribeNoText}>{t('No')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[Styles.subscribeYesButton, isSubscribing && Styles.modalSubmitButtonDisabled]}
                                disabled={isSubscribing}
                                onPress={handleConfirmSubscribe}
                            >
                                <Text style={Styles.subscribeYesText}>{isSubscribing ? t('Loading...') : t('Yes')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={showCalendar} transparent animationType="fade" onRequestClose={() => {
                setShowCalendar(false);
                closeNativePicker();
            }}>
                <View style={Styles.modalOverlay}>
                    <Pressable
                        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
                        onPress={() => {
                            setShowCalendar(false);
                            closeNativePicker();
                        }}
                    />
                    <View style={Styles.dateModalContainer}>
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
                        <View style={Styles.modalButtonRow}>
                            <TouchableOpacity style={Styles.modalCancelButton} onPress={() => {
                                setShowCalendar(false);
                                closeNativePicker();
                            }}>
                                <Text style={Styles.modalCancelText}>{t('cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[Styles.modalSubmitButton, !calendarStart && Styles.modalSubmitButtonDisabled]}
                                onPress={applyDateRange}
                                disabled={!calendarStart}
                            >
                                <Text style={Styles.modalSubmitText}>{t('apply')}</Text>
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

export default SelectCompetitionScreen;
