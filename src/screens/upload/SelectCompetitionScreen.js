var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Modal, Pressable, Platform } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { ArrowLeft2, SearchNormal1, Location, Calendar, VideoSquare, Ghost } from 'iconsax-react-nativejs';
import { createStyles } from './SelectCompetitionStyles';
import SizeBox from '../../constants/SizeBox';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { ApiError, getMediaViewAll, getSubscribedEvents, searchEvents } from '../../services/apiGateway';
import { getApiBaseUrl } from '../../constants/RuntimeConfig';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSportFocusLabel, normalizeFocusId, resolveCompetitionFocusId } from '../../utils/profileSelections';
import E2EPerfReady from '../../components/e2e/E2EPerfReady';
const UPLOAD_FLOW_RESET_KEY = '@upload_flow_reset_required';
const UPLOAD_DEFAULT_INITIAL_LIMIT = 10;
const UPLOAD_SEARCH_INITIAL_LIMIT = 20;
const SCROLL_LOAD_THRESHOLD_PX = 220;
const COMPETITION_FILTER_IDS = [
    'track-field',
    'road-events',
    'triathlon',
    'ironman',
    'cycling',
    'hyrox',
];
const SelectCompetitionScreen = ({ navigation, route }) => {
    var _a, _b, _c, _d, _e;
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const Styles = createStyles(colors);
    const isLightTheme = String(colors.backgroundColor || '').toLowerCase() === '#ffffff';
    const pickerVisualProps = useMemo(() => (Platform.OS === 'ios'
        ? {
            themeVariant: isLightTheme ? 'light' : 'dark',
            textColor: isLightTheme ? '#0B1220' : '#F8FAFC',
            accentColor: colors.primaryColor,
        }
        : {}), [colors.primaryColor, isLightTheme]);
    const { apiAccessToken } = useAuth();
    const perfStartedAtRef = useRef(Date.now());
    const anonymous = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.anonymous;
    const isAnonymous = !!anonymous;
    const fixtureCompetitions = useMemo(() => {
        var _a;
        return Array.isArray((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.e2eCompetitions)
            ? route.params.e2eCompetitions.map((entry) => {
                var _a, _b, _c, _d, _e, _f;
                return ({
                    id: String((_a = entry === null || entry === void 0 ? void 0 : entry.id) !== null && _a !== void 0 ? _a : ''),
                    name: String((_b = entry === null || entry === void 0 ? void 0 : entry.name) !== null && _b !== void 0 ? _b : ''),
                    videoCount: Number((_c = entry === null || entry === void 0 ? void 0 : entry.videoCount) !== null && _c !== void 0 ? _c : 0),
                    location: String((_d = entry === null || entry === void 0 ? void 0 : entry.location) !== null && _d !== void 0 ? _d : ''),
                    date: String((_e = entry === null || entry === void 0 ? void 0 : entry.date) !== null && _e !== void 0 ? _e : ''),
                    thumbnailUrl: (entry === null || entry === void 0 ? void 0 : entry.thumbnailUrl) ? String(entry.thumbnailUrl) : null,
                    competitionType: (_f = normalizeFocusId(entry === null || entry === void 0 ? void 0 : entry.competitionType)) !== null && _f !== void 0 ? _f : resolveCompetitionFocusId({
                        type: entry === null || entry === void 0 ? void 0 : entry.competitionType,
                        name: entry === null || entry === void 0 ? void 0 : entry.name,
                        location: entry === null || entry === void 0 ? void 0 : entry.location,
                        organizer: entry === null || entry === void 0 ? void 0 : entry.organizingClub,
                    }),
                    organizingClub: (entry === null || entry === void 0 ? void 0 : entry.organizingClub) ? String(entry.organizingClub) : undefined,
                });
            }).filter((entry) => entry.id.length > 0 && entry.name.length > 0)
            : [];
    }, [(_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.e2eCompetitions]);
    const fixtureSubscribedIds = useMemo(() => {
        var _a;
        return Array.isArray((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.e2eSubscribedEventIds)
            ? route.params.e2eSubscribedEventIds.map((entry) => String(entry !== null && entry !== void 0 ? entry : '').trim()).filter(Boolean)
            : [];
    }, [(_c = route === null || route === void 0 ? void 0 : route.params) === null || _c === void 0 ? void 0 : _c.e2eSubscribedEventIds]);
    const competitionDetailsRouteName = String((_e = (_d = route === null || route === void 0 ? void 0 : route.params) === null || _d === void 0 ? void 0 : _d.e2eCompetitionDetailsRouteName) !== null && _e !== void 0 ? _e : 'CompetitionDetailsScreen');
    const isFixtureMode = fixtureCompetitions.length > 0;
    const [activeFilter, setActiveFilter] = useState('Competition');
    const [filterValues, setFilterValues] = useState({
        Competition: '',
        Location: '',
    });
    const [eventTypeFilter, setEventTypeFilter] = useState('all');
    const [timeRange, setTimeRange] = useState({ start: null, end: null });
    const [showCalendar, setShowCalendar] = useState(false);
    const [calendarStart, setCalendarStart] = useState(null);
    const [calendarEnd, setCalendarEnd] = useState(null);
    const [nativePickerVisible, setNativePickerVisible] = useState(false);
    const [nativePickerDate, setNativePickerDate] = useState(new Date());
    const [activeDateField, setActiveDateField] = useState(null);
    const [rawEvents, setRawEvents] = useState([]);
    const [subscribedEventIds, setSubscribedEventIds] = useState(new Set());
    const [mediaByEvent, setMediaByEvent] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [errorText, setErrorText] = useState(null);
    const [subscribePromptVisible, setSubscribePromptVisible] = useState(false);
    const [pendingCompetition, setPendingCompetition] = useState(null);
    const [visibleCompetitionCount, setVisibleCompetitionCount] = useState(UPLOAD_DEFAULT_INITIAL_LIMIT);
    const loadMoreLockedRef = useRef(false);
    const perfReady = !isLoading && (rawEvents.length > 0 || errorText !== null);
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
    }, []);
    const isSignedUrl = useCallback((value) => {
        if (!value)
            return false;
        const lower = String(value).toLowerCase();
        return (lower.includes('x-amz-signature') ||
            lower.includes('x-amz-credential') ||
            lower.includes('x-amz-security-token') ||
            lower.includes('signature=') ||
            lower.includes('sig=') ||
            lower.includes('token=') ||
            lower.includes('expires=') ||
            lower.includes('sv=') ||
            lower.includes('se=') ||
            lower.includes('sp='));
    }, []);
    const withAccessToken = useCallback((value) => {
        if (!value)
            return undefined;
        if (!apiAccessToken)
            return value;
        if (isSignedUrl(value))
            return value;
        if (value.includes('access_token='))
            return value;
        const sep = value.includes('?') ? '&' : '?';
        return `${value}${sep}access_token=${encodeURIComponent(apiAccessToken)}`;
    }, [apiAccessToken, isSignedUrl]);
    const toAbsoluteUrl = useCallback((value) => {
        if (!value)
            return null;
        const raw = String(value);
        if (raw.startsWith('http://') || raw.startsWith('https://'))
            return raw;
        const base = getApiBaseUrl();
        if (!base)
            return raw;
        return `${base.replace(/\/$/, '')}/${raw.replace(/^\//, '')}`;
    }, []);
    const normalizeThumb = useCallback((item) => {
        const candidate = item.thumbnail_url || item.preview_url || item.full_url || item.raw_url || null;
        const resolved = candidate ? toAbsoluteUrl(String(candidate)) : null;
        return withAccessToken(resolved) || resolved || undefined;
    }, [toAbsoluteUrl, withAccessToken]);
    const toDateString = (date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };
    const fromDateString = (value, isEnd) => {
        const [year, month, day] = value.split('-').map(Number);
        if (!year || !month || !day)
            return null;
        if (isEnd)
            return new Date(year, month - 1, day, 23, 59, 59, 999);
        return new Date(year, month - 1, day, 0, 0, 0, 0);
    };
    const parseEventDate = useCallback((value) => {
        if (!value)
            return null;
        const raw = String(value);
        const direct = new Date(raw);
        if (!Number.isNaN(direct.getTime()))
            return direct;
        if (raw.includes('/')) {
            const [day, month, year] = raw.split('/').map(Number);
            if (!day || !month || !year)
                return null;
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
    const setQuickRange = (preset) => {
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
        const endSeed = calendarEnd !== null && calendarEnd !== void 0 ? calendarEnd : calendarStart;
        const end = fromDateString(endSeed, true);
        if (!start || !end) {
            setShowCalendar(false);
            return;
        }
        const finalEnd = end < start ? new Date(start.getTime()) : end;
        setTimeRange({ start, end: finalEnd });
        setShowCalendar(false);
    };
    const formatDateRange = (start, end) => {
        const sameDay = start.toDateString() === end.toDateString();
        const startText = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        if (sameDay)
            return startText;
        const endText = end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        return `${startText} - ${endText}`;
    };
    const timeRangeLabel = timeRange.start && timeRange.end
        ? formatDateRange(timeRange.start, timeRange.end)
        : '';
    const closeNativePicker = useCallback(() => {
        setActiveDateField(null);
        setNativePickerVisible(false);
    }, []);
    const openRangeFieldPicker = useCallback((field) => {
        var _a, _b, _c;
        const fallback = toDateString(new Date());
        const seedValue = field === 'start'
            ? ((_a = calendarStart !== null && calendarStart !== void 0 ? calendarStart : calendarEnd) !== null && _a !== void 0 ? _a : fallback)
            : ((_b = calendarEnd !== null && calendarEnd !== void 0 ? calendarEnd : calendarStart) !== null && _b !== void 0 ? _b : fallback);
        const seed = (_c = fromDateString(seedValue, field === 'end')) !== null && _c !== void 0 ? _c : new Date();
        setActiveDateField(field);
        setNativePickerDate(seed);
        setNativePickerVisible(true);
    }, [calendarEnd, calendarStart]);
    const applyPickedDateToField = useCallback((pickedDate, field) => {
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
    const onNativePickerChange = useCallback((event, selectedDate) => {
        if ((event === null || event === void 0 ? void 0 : event.type) === 'dismissed') {
            closeNativePicker();
            return;
        }
        const pickedDate = selectedDate !== null && selectedDate !== void 0 ? selectedDate : nativePickerDate;
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
    const hasTypedQuery = useMemo(() => filterValues.Competition.trim().length > 0 || filterValues.Location.trim().length > 0, [filterValues.Competition, filterValues.Location]);
    const pageSize = hasTypedQuery ? UPLOAD_SEARCH_INITIAL_LIMIT : UPLOAD_DEFAULT_INITIAL_LIMIT;
    const handleSearchChange = (text) => {
        setFilterValues((prev) => (Object.assign(Object.assign({}, prev), { [activeFilter]: text })));
    };
    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken)
            return () => { };
        getMediaViewAll(apiAccessToken, { include_original: false })
            .then((items) => {
            if (!mounted)
                return;
            const map = {};
            items.forEach((media) => {
                const eventId = media.event_id ? String(media.event_id) : '';
                if (!eventId)
                    return;
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
            .catch(() => { });
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, normalizeThumb]);
    useEffect(() => {
        let mounted = true;
        if (isFixtureMode) {
            setSubscribedEventIds(new Set(fixtureSubscribedIds));
            return () => {
                mounted = false;
            };
        }
        if (!apiAccessToken) {
            setSubscribedEventIds(new Set());
            return () => { };
        }
        getSubscribedEvents(apiAccessToken)
            .then((resp) => {
            if (!mounted)
                return;
            const ids = new Set((Array.isArray(resp === null || resp === void 0 ? void 0 : resp.events) ? resp.events : [])
                .map((event) => String((event === null || event === void 0 ? void 0 : event.event_id) || '').trim())
                .filter(Boolean));
            setSubscribedEventIds(ids);
        })
            .catch(() => {
            if (!mounted)
                return;
            setSubscribedEventIds(new Set());
        });
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, fixtureSubscribedIds, isFixtureMode, t]);
    const loadCompetitions = useCallback((query) => __awaiter(void 0, void 0, void 0, function* () {
        var _f;
        if (isFixtureMode) {
            setErrorText(null);
            setIsLoading(false);
            return;
        }
        if (!apiAccessToken) {
            setRawEvents([]);
            setErrorText(t('Log in to load competitions.'));
            return;
        }
        setIsLoading(true);
        setErrorText(null);
        try {
            const trimmedQuery = String(query || '').trim();
            const res = yield searchEvents(apiAccessToken, { q: trimmedQuery || undefined, limit: 200, offset: 0 });
            setRawEvents(Array.isArray(res === null || res === void 0 ? void 0 : res.events) ? res.events : []);
        }
        catch (e) {
            const message = e instanceof ApiError ? e.message : String((_f = e === null || e === void 0 ? void 0 : e.message) !== null && _f !== void 0 ? _f : e);
            setErrorText(message);
            setRawEvents([]);
        }
        finally {
            setIsLoading(false);
        }
    }), [apiAccessToken, isFixtureMode, t]);
    useEffect(() => {
        if (isFixtureMode) {
            setIsLoading(false);
            setErrorText(null);
            return;
        }
        const handle = setTimeout(() => {
            var _a;
            const query = String((_a = filterValues[activeFilter]) !== null && _a !== void 0 ? _a : '').trim();
            loadCompetitions(query);
        }, 300);
        return () => clearTimeout(handle);
    }, [activeFilter, filterValues, isFixtureMode, loadCompetitions]);
    useFocusEffect(useCallback(() => {
        let active = true;
        (() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const shouldReset = yield AsyncStorage.getItem(UPLOAD_FLOW_RESET_KEY);
                if (!active || shouldReset !== '1')
                    return;
                resetFilters();
                yield AsyncStorage.removeItem(UPLOAD_FLOW_RESET_KEY);
            }
            catch (_a) {
                // ignore
            }
        }))();
        return () => {
            active = false;
        };
    }, [resetFilters]));
    const competitions = useMemo(() => {
        if (isFixtureMode) {
            return fixtureCompetitions;
        }
        return rawEvents.map((event) => {
            var _a, _b;
            const eventId = String(event.event_id);
            const mediaInfo = mediaByEvent[eventId];
            const rawEventThumb = String((event === null || event === void 0 ? void 0 : event.thumbnail_url) || '').trim();
            const eventThumb = rawEventThumb
                ? (withAccessToken(toAbsoluteUrl(rawEventThumb)) || toAbsoluteUrl(rawEventThumb))
                : null;
            const nameSource = event.event_name || event.event_title || '';
            return {
                id: eventId,
                name: nameSource || t('Competition'),
                location: event.event_location || '',
                date: event.event_date || '',
                videoCount: (_a = mediaInfo === null || mediaInfo === void 0 ? void 0 : mediaInfo.videoCount) !== null && _a !== void 0 ? _a : 0,
                thumbnailUrl: (_b = eventThumb !== null && eventThumb !== void 0 ? eventThumb : mediaInfo === null || mediaInfo === void 0 ? void 0 : mediaInfo.thumbUrl) !== null && _b !== void 0 ? _b : null,
                competitionType: resolveCompetitionFocusId({
                    type: event.event_type || event.competition_type || event.event_category || '',
                    name: nameSource,
                    location: event.event_location || '',
                    organizer: event.organizing_club || event.organizer_club || '',
                }),
                organizingClub: String(event.organizing_club
                    || event.organizer_club
                    || event.competition_organizing_club
                    || event.competition_organizer_name
                    || '').trim(),
            };
        });
    }, [fixtureCompetitions, isFixtureMode, mediaByEvent, rawEvents, t, toAbsoluteUrl, withAccessToken]);
    const formatDisplayDate = useCallback((value) => {
        if (!value)
            return '—';
        const parsed = parseEventDate(value);
        if (!parsed)
            return value;
        const day = String(parsed.getDate()).padStart(2, '0');
        const month = String(parsed.getMonth() + 1).padStart(2, '0');
        const year = parsed.getFullYear();
        return `${day}/${month}/${year}`;
    }, [parseEventDate]);
    const filteredCompetitions = useMemo(() => {
        const cFilter = filterValues.Competition.trim().toLowerCase();
        const lFilter = filterValues.Location.trim().toLowerCase();
        const rankMatch = (value, query) => {
            if (!query)
                return 1;
            const safeValue = String(value || '').toLowerCase();
            const idx = safeValue.indexOf(query);
            if (idx === 0)
                return 0;
            if (idx > 0)
                return 1;
            return 2;
        };
        const filtered = competitions.filter((competition) => {
            const typeOk = eventTypeFilter === 'all' ? true : competition.competitionType === eventTypeFilter;
            const name = competition.name.toLowerCase();
            const location = competition.location.toLowerCase();
            const matchesCompetition = cFilter ? name.includes(cFilter) : true;
            const matchesLocation = lFilter ? location.includes(lFilter) : true;
            const eventDate = parseEventDate(competition.date);
            const inRange = timeRange.start || timeRange.end
                ? !!eventDate &&
                    (!timeRange.start || eventDate >= timeRange.start) &&
                    (!timeRange.end || eventDate <= timeRange.end)
                : true;
            return matchesCompetition && matchesLocation && typeOk && inRange;
        });
        return filtered.sort((a, b) => {
            var _a, _b, _c, _d;
            const primaryQuery = String(filterValues[activeFilter] || '').trim().toLowerCase();
            const secondaryQuery = activeFilter === 'Competition' ? lFilter : cFilter;
            const aPrimary = activeFilter === 'Competition'
                ? rankMatch(a.name, primaryQuery)
                : rankMatch(a.location, primaryQuery);
            const bPrimary = activeFilter === 'Competition'
                ? rankMatch(b.name, primaryQuery)
                : rankMatch(b.location, primaryQuery);
            if (aPrimary !== bPrimary)
                return aPrimary - bPrimary;
            const aSecondary = activeFilter === 'Competition'
                ? rankMatch(a.location, secondaryQuery)
                : rankMatch(a.name, secondaryQuery);
            const bSecondary = activeFilter === 'Competition'
                ? rankMatch(b.location, secondaryQuery)
                : rankMatch(b.name, secondaryQuery);
            if (aSecondary !== bSecondary)
                return aSecondary - bSecondary;
            const aDate = (_b = (_a = parseEventDate(a.date)) === null || _a === void 0 ? void 0 : _a.getTime()) !== null && _b !== void 0 ? _b : 0;
            const bDate = (_d = (_c = parseEventDate(b.date)) === null || _c === void 0 ? void 0 : _c.getTime()) !== null && _d !== void 0 ? _d : 0;
            return bDate - aDate;
        });
    }, [activeFilter, competitions, eventTypeFilter, filterValues, parseEventDate, timeRange.end, timeRange.start]);
    const visibleCompetitions = useMemo(() => filteredCompetitions.slice(0, visibleCompetitionCount), [filteredCompetitions, visibleCompetitionCount]);
    const hasMoreCompetitions = visibleCompetitions.length < filteredCompetitions.length;
    useEffect(() => {
        loadMoreLockedRef.current = false;
        setVisibleCompetitionCount(pageSize);
    }, [
        pageSize,
        activeFilter,
        hasTypedQuery,
        filterValues.Competition,
        filterValues.Location,
        eventTypeFilter,
        timeRange.start,
        timeRange.end,
    ]);
    const handleMainScroll = useCallback((event) => {
        const native = event === null || event === void 0 ? void 0 : event.nativeEvent;
        if (!native)
            return;
        const { contentOffset, contentSize, layoutMeasurement } = native;
        const distanceToBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
        if (distanceToBottom > SCROLL_LOAD_THRESHOLD_PX) {
            loadMoreLockedRef.current = false;
            return;
        }
        if (loadMoreLockedRef.current || !hasMoreCompetitions)
            return;
        loadMoreLockedRef.current = true;
        setVisibleCompetitionCount((prev) => Math.min(prev + pageSize, filteredCompetitions.length));
    }, [filteredCompetitions.length, hasMoreCompetitions, pageSize]);
    const continueToCompetition = useCallback((competition) => {
        navigation.navigate(competitionDetailsRouteName, {
            competition,
            anonymous,
            competitionType: competition.competitionType,
        });
    }, [anonymous, competitionDetailsRouteName, navigation]);
    const handleUploadToCompetition = useCallback((competition) => {
        if (subscribedEventIds.has(String(competition.id))) {
            continueToCompetition(competition);
            return;
        }
        setPendingCompetition(competition);
        setSubscribePromptVisible(true);
    }, [continueToCompetition, subscribedEventIds]);
    const handleConfirmSubscribe = useCallback(() => {
        const targetCompetition = pendingCompetition;
        setSubscribePromptVisible(false);
        setPendingCompetition(null);
        navigation.navigate('BottomTabBar', {
            screen: 'Home',
            params: {
                screen: 'AvailableEventsScreen',
                params: targetCompetition
                    ? {
                        autoOpenSubscribeEventId: String(targetCompetition.id),
                        autoOpenSubscribeRequestId: String(Date.now()),
                        autoOpenSubscribeEventTitle: String(targetCompetition.name || ''),
                        autoOpenSubscribeEventDate: String(targetCompetition.date || ''),
                        autoOpenSubscribeEventLocation: String(targetCompetition.location || ''),
                        autoOpenSubscribeEventCompetitionType: targetCompetition.competitionType,
                        autoOpenSubscribeEventOrganizingClub: String(targetCompetition.organizingClub || ''),
                    }
                    : undefined,
            },
        });
    }, [navigation, pendingCompetition]);
    const handleSkipSubscribe = useCallback(() => {
        if (!pendingCompetition) {
            setSubscribePromptVisible(false);
            return;
        }
        setSubscribePromptVisible(false);
        continueToCompetition(pendingCompetition);
    }, [continueToCompetition, pendingCompetition]);
    const renderCompetitionCard = (competition) => (_jsx(TouchableOpacity, Object.assign({ style: Styles.competitionCard, activeOpacity: 0.85, onPress: () => handleUploadToCompetition(competition), testID: `upload-competition-card-${competition.id}` }, { children: _jsxs(View, Object.assign({ style: Styles.competitionContent }, { children: [_jsx(View, Object.assign({ style: Styles.thumbnailContainer }, { children: competition.thumbnailUrl ? (_jsx(FastImage, { source: { uri: competition.thumbnailUrl }, style: Styles.thumbnail, resizeMode: "cover" })) : (_jsx(View, { style: Styles.thumbnailPlaceholder })) })), _jsxs(View, Object.assign({ style: Styles.competitionInfo }, { children: [_jsxs(View, Object.assign({ style: Styles.competitionHeader }, { children: [_jsx(Text, Object.assign({ style: Styles.competitionName, numberOfLines: 2 }, { children: competition.name })), _jsx(View, Object.assign({ style: Styles.typeBadge }, { children: _jsx(Text, Object.assign({ style: Styles.typeBadgeText }, { children: getSportFocusLabel(competition.competitionType, t) })) }))] })), _jsxs(View, Object.assign({ style: Styles.metaRow }, { children: [competition.location ? (_jsxs(View, Object.assign({ style: Styles.infoValueRow }, { children: [_jsx(Location, { size: 14, color: colors.grayColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: Styles.infoValue, numberOfLines: 1 }, { children: competition.location }))] }))) : null, competition.date ? (_jsxs(View, Object.assign({ style: Styles.infoValueRow }, { children: [_jsx(Calendar, { size: 14, color: colors.grayColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: Styles.infoValue, numberOfLines: 1 }, { children: formatDisplayDate(competition.date) }))] }))) : null] })), _jsxs(View, Object.assign({ style: Styles.videoCountRow }, { children: [_jsx(VideoSquare, { size: 14, color: colors.grayColor, variant: "Linear" }), _jsxs(Text, Object.assign({ style: Styles.videoCountText }, { children: [competition.videoCount, " ", t('media')] }))] })), competition.organizingClub ? (_jsx(Text, Object.assign({ style: Styles.infoValue, numberOfLines: 1 }, { children: competition.organizingClub }))) : null] }))] })) }), competition.id));
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer, testID: "upload-select-competition-screen" }, { children: [_jsx(E2EPerfReady, { screen: "upload-select", ready: perfReady, startedAtMs: perfStartedAtRef.current }), _jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('upload') })), isAnonymous ? (_jsx(View, Object.assign({ style: Styles.headerGhost }, { children: _jsx(Ghost, { size: 22, color: colors.primaryColor, variant: "Linear" }) }))) : (_jsx(View, { style: Styles.headerSpacer }))] })), _jsxs(ScrollView, Object.assign({ testID: "upload-select-competition-scroll", showsVerticalScrollIndicator: false, contentContainerStyle: Styles.scrollContent, onScroll: handleMainScroll, scrollEventThrottle: 16 }, { children: [_jsx(View, Object.assign({ style: Styles.uploadModeBanner }, { children: _jsx(Text, Object.assign({ style: Styles.uploadModeText }, { children: isAnonymous ? t('anonymousUpload') : t('uploadToCompetition') })) })), _jsx(SizeBox, { height: 12 }), _jsx(View, Object.assign({ style: Styles.searchRow }, { children: _jsxs(View, Object.assign({ style: Styles.searchInputContainer }, { children: [_jsx(SearchNormal1, { size: 16, color: colors.grayColor, variant: "Linear" }), _jsx(SizeBox, { width: 8 }), _jsx(View, Object.assign({ style: Styles.searchInputPill }, { children: _jsxs(Text, Object.assign({ style: Styles.searchInputPillText }, { children: [activeFilter, ":"] })) })), _jsx(TextInput, { style: Styles.searchInput, placeholder: activeFilter === 'Competition' ? t('searchCompetitionsToUpload') : t('searchByLocation'), placeholderTextColor: colors.grayColor, value: activeValue, onChangeText: handleSearchChange })] })) })), _jsx(SizeBox, { height: 14 }), _jsx(View, Object.assign({ style: Styles.filterTabsContainer }, { children: ['Competition', 'Location'].map((filter) => (_jsx(TouchableOpacity, Object.assign({ style: [Styles.filterTab, activeFilter === filter && Styles.filterTabActive], onPress: () => setActiveFilter(filter) }, { children: _jsx(Text, Object.assign({ style: [Styles.filterTabText, activeFilter === filter && Styles.filterTabTextActive] }, { children: filter === 'Competition' ? t('competition') : t('location') })) }), filter))) })), _jsx(SizeBox, { height: 12 }), _jsxs(View, Object.assign({ style: Styles.typeFilterRow }, { children: [_jsx(Text, Object.assign({ style: Styles.typeFilterLabel }, { children: t('competitionType') })), _jsx(View, Object.assign({ style: Styles.typeFilterChips }, { children: [
                                    { key: 'all', label: t('all') },
                                    ...COMPETITION_FILTER_IDS.map((focusId) => ({
                                        key: focusId,
                                        label: getSportFocusLabel(focusId, t),
                                    })),
                                ].map((tab) => (_jsx(TouchableOpacity, Object.assign({ style: [Styles.typeFilterChip, eventTypeFilter === tab.key && Styles.typeFilterChipActive], onPress: () => setEventTypeFilter(tab.key) }, { children: _jsx(Text, Object.assign({ style: [Styles.typeFilterChipText, eventTypeFilter === tab.key && Styles.typeFilterChipTextActive] }, { children: tab.label })) }), tab.key))) }))] })), _jsx(SizeBox, { height: 12 }), _jsxs(View, Object.assign({ style: Styles.activeChipsContainer }, { children: [filterValues.Competition.trim().length > 0 && (_jsx(View, Object.assign({ style: Styles.activeChip }, { children: _jsxs(Text, Object.assign({ style: Styles.activeChipText }, { children: [t('Competition'), ": ", filterValues.Competition] })) }))), filterValues.Location.trim().length > 0 && (_jsx(View, Object.assign({ style: Styles.activeChip }, { children: _jsxs(Text, Object.assign({ style: Styles.activeChipText }, { children: [t('Location'), ": ", filterValues.Location] })) }))), _jsxs(TouchableOpacity, Object.assign({ style: [Styles.timeRangeChip, timeRange.start && timeRange.end && Styles.timeRangeChipActive], onPress: openDateTimePicker }, { children: [_jsx(Calendar, { size: 14, color: timeRange.start ? colors.primaryColor : colors.grayColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: [Styles.timeRangeText, timeRange.start && Styles.timeRangeTextActive] }, { children: timeRange.start && timeRange.end ? timeRangeLabel : t('selectDateRange') }))] }))] })), _jsxs(View, Object.assign({ style: Styles.resultsHeader }, { children: [_jsx(Text, Object.assign({ style: Styles.resultsTitle }, { children: t('availableCompetitions') })), _jsx(View, Object.assign({ style: Styles.resultsCountBadge }, { children: _jsx(Text, Object.assign({ style: Styles.resultsCountText }, { children: isLoading ? '...' : `${filteredCompetitions.length} ${t('competitions')}` })) }))] })), _jsx(SizeBox, { height: 16 }), isLoading && filteredCompetitions.length === 0 && (_jsxs(View, Object.assign({ style: Styles.loadingRow }, { children: [_jsx(ActivityIndicator, { color: colors.primaryColor }), _jsx(Text, Object.assign({ style: Styles.loadingText }, { children: t('loadingCompetitions') }))] }))), !isLoading && errorText && (_jsx(Text, Object.assign({ style: Styles.errorText }, { children: errorText }))), visibleCompetitions.length > 0 ? (visibleCompetitions.map(renderCompetitionCard)) : !isLoading ? (_jsx(Text, Object.assign({ style: Styles.loadingText }, { children: hasTypedQuery ? t('No competitions found') : t('No competitions available yet.') }))) : (_jsx(_Fragment, {})), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] })), _jsx(Modal, Object.assign({ visible: subscribePromptVisible, transparent: true, animationType: "fade", onRequestClose: () => setSubscribePromptVisible(false) }, { children: _jsxs(View, Object.assign({ style: Styles.modalOverlay }, { children: [_jsx(Pressable, { style: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }, onPress: () => {
                                setSubscribePromptVisible(false);
                            } }), _jsxs(View, Object.assign({ style: Styles.subscribeModalContainer }, { children: [_jsx(Text, Object.assign({ style: Styles.subscribeModalTitle }, { children: t('Subscribe to event') })), _jsx(SizeBox, { height: 8 }), _jsx(Text, Object.assign({ style: Styles.subscribeModalText }, { children: t('You need to subscribe this event before uploading') })), _jsx(SizeBox, { height: 14 }), _jsxs(View, Object.assign({ style: Styles.subscribeButtonRow }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.subscribeNoButton, onPress: handleSkipSubscribe, testID: "upload-subscribe-skip" }, { children: _jsx(Text, Object.assign({ style: Styles.subscribeNoText }, { children: t('Cancel') })) })), _jsx(TouchableOpacity, Object.assign({ style: Styles.subscribeYesButton, onPress: handleConfirmSubscribe, testID: "upload-subscribe-confirm" }, { children: _jsx(Text, Object.assign({ style: Styles.subscribeYesText }, { children: t('Oke') })) }))] }))] }))] })) })), _jsx(Modal, Object.assign({ visible: showCalendar, transparent: true, animationType: "fade", onRequestClose: () => {
                    setShowCalendar(false);
                    closeNativePicker();
                } }, { children: _jsxs(View, Object.assign({ style: Styles.modalOverlay }, { children: [_jsx(Pressable, { style: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }, onPress: () => {
                                setShowCalendar(false);
                                closeNativePicker();
                            } }), _jsxs(View, Object.assign({ style: Styles.dateModalContainer }, { children: [_jsx(Text, Object.assign({ style: Styles.dateModalTitle }, { children: t('selectDateRange') })), _jsx(SizeBox, { height: 10 }), _jsxs(View, Object.assign({ style: Styles.quickRangeRow }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.quickRangeChip, onPress: () => setQuickRange('week') }, { children: _jsx(Text, Object.assign({ style: Styles.quickRangeChipText }, { children: t('thisWeek') })) })), _jsx(TouchableOpacity, Object.assign({ style: Styles.quickRangeChip, onPress: () => setQuickRange('month') }, { children: _jsx(Text, Object.assign({ style: Styles.quickRangeChipText }, { children: t('thisMonth') })) })), _jsx(TouchableOpacity, Object.assign({ style: Styles.quickRangeChip, onPress: () => setQuickRange('year') }, { children: _jsx(Text, Object.assign({ style: Styles.quickRangeChipText }, { children: t('thisYear') })) }))] })), _jsx(SizeBox, { height: 8 }), _jsxs(View, Object.assign({ style: Styles.rangeHeaderRow }, { children: [_jsxs(TouchableOpacity, Object.assign({ style: Styles.rangePill, onPress: () => openRangeFieldPicker('start'), activeOpacity: 0.8 }, { children: [_jsx(Text, Object.assign({ style: Styles.rangePillLabel }, { children: t('start') })), _jsx(Text, Object.assign({ style: Styles.rangePillValue }, { children: calendarStart !== null && calendarStart !== void 0 ? calendarStart : t('selectDate') }))] })), _jsxs(TouchableOpacity, Object.assign({ style: Styles.rangePill, onPress: () => openRangeFieldPicker('end'), activeOpacity: 0.8 }, { children: [_jsx(Text, Object.assign({ style: Styles.rangePillLabel }, { children: t('end') })), _jsx(Text, Object.assign({ style: Styles.rangePillValue }, { children: calendarEnd !== null && calendarEnd !== void 0 ? calendarEnd : t('selectDate') }))] }))] })), _jsx(SizeBox, { height: 12 }), _jsxs(View, Object.assign({ style: Styles.modalButtonRow }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.modalCancelButton, onPress: () => {
                                                setShowCalendar(false);
                                                closeNativePicker();
                                            } }, { children: _jsx(Text, Object.assign({ style: Styles.modalCancelText }, { children: t('cancel') })) })), _jsx(TouchableOpacity, Object.assign({ style: [Styles.modalSubmitButton, !calendarStart && Styles.modalSubmitButtonDisabled], onPress: applyDateRange, disabled: !calendarStart }, { children: _jsx(Text, Object.assign({ style: Styles.modalSubmitText }, { children: t('apply') })) }))] }))] })), Platform.OS === 'ios' && nativePickerVisible && activeDateField ? (_jsxs(View, Object.assign({ style: Styles.nativePickerOverlay }, { children: [_jsx(Pressable, { style: Styles.nativePickerBackdrop, onPress: closeNativePicker }), _jsxs(View, Object.assign({ style: Styles.nativePickerSheet }, { children: [_jsxs(View, Object.assign({ style: Styles.nativePickerToolbar }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.nativePickerAction, onPress: closeNativePicker }, { children: _jsx(Text, Object.assign({ style: Styles.nativePickerActionText }, { children: t('cancel') })) })), _jsx(TouchableOpacity, Object.assign({ style: Styles.nativePickerAction, onPress: applyNativePickerSelection }, { children: _jsx(Text, Object.assign({ style: Styles.nativePickerActionText }, { children: t('apply') })) }))] })), _jsx(DateTimePicker, Object.assign({}, pickerVisualProps, { value: nativePickerDate, mode: "date", display: "spinner", onChange: onNativePickerChange }))] }))] }))) : null] })) })), nativePickerVisible && activeDateField && Platform.OS === 'android' ? (_jsx(DateTimePicker, Object.assign({}, pickerVisualProps, { value: nativePickerDate, mode: "date", display: "default", onChange: onNativePickerChange }))) : null] })));
};
export default SelectCompetitionScreen;
