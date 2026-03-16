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
import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Pressable, useWindowDimensions, ActivityIndicator, Platform, Switch, Alert, InteractionManager } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft2, ArrowDown2, Calendar, Clock, CloseCircle, Location, SearchNormal1, User, } from 'iconsax-react-nativejs';
import { createStyles } from './AvailableCompetitionsScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Images from '../../constants/Images';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventsContext';
import { ApiError, getEventCompetitions, getProfileSummary, grantFaceRecognitionConsent, searchEvents, searchFaceByEnrollment, unsubscribeToEvent } from '../../services/apiGateway';
import { useTranslation } from 'react-i18next';
import { buildSubscriptionDisciplineOptions, normalizeSubscriptionCategories, SUBSCRIPTION_ALL_DISCIPLINE_ID, SUBSCRIPTION_CATEGORY_OPTIONS, toggleSubscriptionCategory, toggleSubscriptionDiscipline, } from '../../utils/eventSubscription';
import { getSportFocusLabel, resolveCompetitionFocusId } from '../../utils/profileSelections';
const EVENT_FILTERS = ['Competition', 'Location'];
const COMPETITION_TYPE_FILTERS = [
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
const AvailableEventsScreen = ({ navigation, route }) => {
    var _a;
    const insets = useSafeAreaInsets();
    const { width: windowWidth } = useWindowDimensions();
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
    const [activeFilter, setActiveFilter] = useState('Competition');
    const [filterValues, setFilterValues] = useState({
        Competition: '',
        Location: '',
    });
    const [competitionTypeFilter, setCompetitionTypeFilter] = useState('all');
    const [timeRange, setTimeRange] = useState({
        start: null,
        end: null,
    });
    const [showIosPicker, setShowIosPicker] = useState(false);
    const [calendarStart, setCalendarStart] = useState(null);
    const [calendarEnd, setCalendarEnd] = useState(null);
    const [nativePickerVisible, setNativePickerVisible] = useState(false);
    const [nativePickerDate, setNativePickerDate] = useState(new Date());
    const [activeDateField, setActiveDateField] = useState(null);
    const [showSubscribeModal, setShowSubscribeModal] = useState(false);
    const [modalEvent, setModalEvent] = useState(null);
    const [unsubscribeEvent, setUnsubscribeEvent] = useState(null);
    const [isUnsubscribing, setIsUnsubscribing] = useState(false);
    const [subscribeStep, setSubscribeStep] = useState(0);
    const [chestNumber, setChestNumber] = useState('');
    const [useDefaultChest, setUseDefaultChest] = useState(false);
    const [allowFaceRecognition, setAllowFaceRecognition] = useState(false);
    const [selectedDisciplineIds, setSelectedDisciplineIds] = useState([SUBSCRIPTION_ALL_DISCIPLINE_ID]);
    const [selectedCategoryLabels, setSelectedCategoryLabels] = useState(['All']);
    const [subscribeDisciplines, setSubscribeDisciplines] = useState([]);
    const [subscribeDisciplinesLoading, setSubscribeDisciplinesLoading] = useState(false);
    const [availableEvents, setAvailableEvents] = useState([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);
    const [eventsError, setEventsError] = useState(null);
    const [visibleEventCount, setVisibleEventCount] = useState(DEFAULT_EVENTS_INITIAL_LIMIT);
    const [profileFaceVerified, setProfileFaceVerified] = useState(null);
    const [profileFaceConsentGranted, setProfileFaceConsentGranted] = useState(null);
    const loadMoreLockedRef = useRef(false);
    const autoOpenRequestHandledRef = useRef('');
    const { apiAccessToken, userProfile } = useAuth();
    const { events: subscribedEvents, refresh: refreshSubscribedEvents } = useEvents();
    const subscribedEventIdSet = useMemo(() => new Set((Array.isArray(subscribedEvents) ? subscribedEvents : [])
        .map((event) => String((event === null || event === void 0 ? void 0 : event.event_id) || '').trim())
        .filter(Boolean)), [subscribedEvents]);
    const getYearFromDateLike = useCallback((value) => {
        const raw = String(value !== null && value !== void 0 ? value : '').trim();
        if (!raw)
            return null;
        const iso = new Date(raw);
        if (!Number.isNaN(iso.getTime()))
            return String(iso.getFullYear());
        const m = raw.match(/\b(19|20)\d{2}\b/);
        return m ? m[0] : null;
    }, []);
    const defaultChestNumber = useMemo(() => {
        var _a, _b, _c, _d;
        const byYear = ((_a = userProfile === null || userProfile === void 0 ? void 0 : userProfile.chestNumbersByYear) !== null && _a !== void 0 ? _a : {});
        const eventYear = getYearFromDateLike((_b = modalEvent === null || modalEvent === void 0 ? void 0 : modalEvent.date) !== null && _b !== void 0 ? _b : null) ||
            getYearFromDateLike((_c = modalEvent === null || modalEvent === void 0 ? void 0 : modalEvent.name) !== null && _c !== void 0 ? _c : null) ||
            getYearFromDateLike((_d = modalEvent === null || modalEvent === void 0 ? void 0 : modalEvent.location) !== null && _d !== void 0 ? _d : null);
        if (eventYear && byYear[eventYear] != null && String(byYear[eventYear]).trim().length > 0) {
            return String(byYear[eventYear]).trim();
        }
        const currentYear = String(new Date().getFullYear());
        if (byYear[currentYear] != null && String(byYear[currentYear]).trim().length > 0) {
            return String(byYear[currentYear]).trim();
        }
        return '';
    }, [getYearFromDateLike, modalEvent === null || modalEvent === void 0 ? void 0 : modalEvent.date, modalEvent === null || modalEvent === void 0 ? void 0 : modalEvent.location, modalEvent === null || modalEvent === void 0 ? void 0 : modalEvent.name, userProfile === null || userProfile === void 0 ? void 0 : userProfile.chestNumbersByYear]);
    const activeValue = (_a = filterValues[activeFilter]) !== null && _a !== void 0 ? _a : '';
    const searchPlaceholder = activeFilter === 'Competition' ? t('typeCompetition') : t('typeLocation');
    const hasFaceEnrollment = profileFaceVerified !== null && profileFaceVerified !== void 0 ? profileFaceVerified : Boolean(userProfile === null || userProfile === void 0 ? void 0 : userProfile.faceVerified);
    const faceConsentGranted = profileFaceConsentGranted !== null && profileFaceConsentGranted !== void 0 ? profileFaceConsentGranted : Boolean(userProfile === null || userProfile === void 0 ? void 0 : userProfile.faceConsentGranted);
    const getCompetitionTypeLabel = useCallback((type) => {
        return getSportFocusLabel(type, t);
    }, [t]);
    const resolveCompetitionType = useCallback((params) => {
        return resolveCompetitionFocusId(params);
    }, []);
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
        if (isEnd) {
            return new Date(year, month - 1, day, 23, 59, 59, 999);
        }
        return new Date(year, month - 1, day, 0, 0, 0, 0);
    };
    const parseEventDate = (value) => {
        if (!value)
            return null;
        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime()))
            return parsed;
        const [day, month, year] = value.split('/').map(Number);
        if (!day || !month || !year)
            return null;
        return new Date(year, month - 1, day, 12, 0, 0, 0);
    };
    const formatEventDate = useCallback((value) => {
        const parsed = parseEventDate(value);
        if (!parsed)
            return String(value || '');
        return parsed.toLocaleDateString('en-CA');
    }, []);
    const isWithinRange = useCallback((date) => {
        if (!date)
            return false;
        const start = timeRange.start;
        const end = timeRange.end;
        if (start && end)
            return date >= start && date <= end;
        if (start)
            return date >= start;
        if (end)
            return date <= end;
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
    const applyIosDateTime = () => {
        if (!calendarStart) {
            setShowIosPicker(false);
            return;
        }
        const start = fromDateString(calendarStart, false);
        const endSeed = calendarEnd !== null && calendarEnd !== void 0 ? calendarEnd : calendarStart;
        const end = fromDateString(endSeed, true);
        if (!start || !end) {
            setShowIosPicker(false);
            return;
        }
        const finalEnd = end < start ? new Date(start.getTime()) : end;
        setTimeRange({ start, end: finalEnd });
        setShowIosPicker(false);
    };
    const formatDateRange = (start, end) => {
        const sameDay = start.toDateString() === end.toDateString();
        const startText = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        if (sameDay)
            return startText;
        const endText = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return `${startText} → ${endText}`;
    };
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
    const loadEvents = useCallback((query) => __awaiter(void 0, void 0, void 0, function* () {
        var _b;
        if (!apiAccessToken)
            return;
        setIsLoadingEvents(true);
        setEventsError(null);
        try {
            const res = yield searchEvents(apiAccessToken, { q: query, limit: 200 });
            const list = Array.isArray(res === null || res === void 0 ? void 0 : res.events) ? res.events : [];
            const mapped = list.map((event) => ({
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
                organizingClub: String(event.organizing_club
                    || event.organizer_club
                    || event.competition_organizing_club
                    || event.competition_organizer_name
                    || '').trim(),
                thumbnail: event.thumbnail_url ? { uri: event.thumbnail_url } : Images.photo4,
            }));
            setAvailableEvents(mapped);
        }
        catch (e) {
            const msg = e instanceof ApiError ? e.message : String((_b = e === null || e === void 0 ? void 0 : e.message) !== null && _b !== void 0 ? _b : e);
            setEventsError(msg);
            setAvailableEvents([]);
        }
        finally {
            setIsLoadingEvents(false);
        }
    }), [apiAccessToken, formatEventDate, resolveCompetitionType]);
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
    const openSubscribeModal = useCallback((event) => {
        resetSubscribeForm();
        setModalEvent(event);
        setShowSubscribeModal(true);
        if (!apiAccessToken || !(event === null || event === void 0 ? void 0 : event.id))
            return;
        setSubscribeDisciplinesLoading(true);
        getEventCompetitions(apiAccessToken, String(event.id), { onlyWithMedia: false })
            .then((res) => {
            const options = buildSubscriptionDisciplineOptions(Array.isArray(res === null || res === void 0 ? void 0 : res.competitions) ? res.competitions : []);
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
    useEffect(() => {
        const autoOpenParams = route === null || route === void 0 ? void 0 : route.params;
        const requestId = String((autoOpenParams === null || autoOpenParams === void 0 ? void 0 : autoOpenParams.autoOpenSubscribeRequestId) || '').trim();
        const targetEventId = String((autoOpenParams === null || autoOpenParams === void 0 ? void 0 : autoOpenParams.autoOpenSubscribeEventId) || '').trim();
        if (!requestId || !targetEventId)
            return;
        if (autoOpenRequestHandledRef.current === requestId)
            return;
        if (isLoadingEvents)
            return;
        const matchedEvent = availableEvents.find((event) => String((event === null || event === void 0 ? void 0 : event.id) || '').trim() === targetEventId);
        const fallbackEvent = {
            id: targetEventId,
            title: String((autoOpenParams === null || autoOpenParams === void 0 ? void 0 : autoOpenParams.autoOpenSubscribeEventTitle) || ''),
            date: String((autoOpenParams === null || autoOpenParams === void 0 ? void 0 : autoOpenParams.autoOpenSubscribeEventDate) || ''),
            location: String((autoOpenParams === null || autoOpenParams === void 0 ? void 0 : autoOpenParams.autoOpenSubscribeEventLocation) || ''),
            competitionType: resolveCompetitionType({
                type: (autoOpenParams === null || autoOpenParams === void 0 ? void 0 : autoOpenParams.autoOpenSubscribeEventCompetitionType) || null,
                name: (autoOpenParams === null || autoOpenParams === void 0 ? void 0 : autoOpenParams.autoOpenSubscribeEventTitle) || null,
                location: (autoOpenParams === null || autoOpenParams === void 0 ? void 0 : autoOpenParams.autoOpenSubscribeEventLocation) || null,
                organizer: (autoOpenParams === null || autoOpenParams === void 0 ? void 0 : autoOpenParams.autoOpenSubscribeEventOrganizingClub) || null,
            }),
            organizingClub: String((autoOpenParams === null || autoOpenParams === void 0 ? void 0 : autoOpenParams.autoOpenSubscribeEventOrganizingClub) || ''),
            thumbnail: Images.photo4,
        };
        openSubscribeModal(matchedEvent || fallbackEvent);
        autoOpenRequestHandledRef.current = requestId;
        var _a;
        (_a = navigation.setParams) === null || _a === void 0 ? void 0 : _a.call(navigation, {
            autoOpenSubscribeRequestId: undefined,
            autoOpenSubscribeEventId: undefined,
            autoOpenSubscribeEventTitle: undefined,
            autoOpenSubscribeEventDate: undefined,
            autoOpenSubscribeEventLocation: undefined,
            autoOpenSubscribeEventCompetitionType: undefined,
            autoOpenSubscribeEventOrganizingClub: undefined,
        });
    }, [availableEvents, isLoadingEvents, navigation, openSubscribeModal, resolveCompetitionType, route === null || route === void 0 ? void 0 : route.params]);
    const closeSubscribeModal = useCallback(() => {
        setShowSubscribeModal(false);
        setModalEvent(null);
        resetSubscribeForm();
    }, [resetSubscribeForm]);
    const refreshProfileFaceState = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _c, _d;
        if (!apiAccessToken) {
            return {
                hasFaceEnrollment: Boolean(userProfile === null || userProfile === void 0 ? void 0 : userProfile.faceVerified),
                faceConsentGranted: Boolean(userProfile === null || userProfile === void 0 ? void 0 : userProfile.faceConsentGranted),
            };
        }
        try {
            const summary = yield getProfileSummary(apiAccessToken);
            const nextHasFaceEnrollment = Boolean((_c = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _c === void 0 ? void 0 : _c.face_verified);
            const nextFaceConsentGranted = Boolean((_d = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _d === void 0 ? void 0 : _d.face_consent_granted);
            setProfileFaceVerified(nextHasFaceEnrollment);
            setProfileFaceConsentGranted(nextFaceConsentGranted);
            return {
                hasFaceEnrollment: nextHasFaceEnrollment,
                faceConsentGranted: nextFaceConsentGranted,
            };
        }
        catch (_e) {
            return {
                hasFaceEnrollment: profileFaceVerified !== null && profileFaceVerified !== void 0 ? profileFaceVerified : Boolean(userProfile === null || userProfile === void 0 ? void 0 : userProfile.faceVerified),
                faceConsentGranted: profileFaceConsentGranted !== null && profileFaceConsentGranted !== void 0 ? profileFaceConsentGranted : Boolean(userProfile === null || userProfile === void 0 ? void 0 : userProfile.faceConsentGranted),
            };
        }
    }), [apiAccessToken, profileFaceConsentGranted, profileFaceVerified, userProfile]);
    const startFaceEnrollment = useCallback(() => {
        closeSubscribeModal();
        InteractionManager.runAfterInteractions(() => {
            var _a;
            const parentNav = (_a = navigation.getParent) === null || _a === void 0 ? void 0 : _a.call(navigation);
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
    const handleFaceToggle = useCallback((nextValue) => __awaiter(void 0, void 0, void 0, function* () {
        var _f, _g;
        if (!nextValue) {
            setAllowFaceRecognition(false);
            return;
        }
        if (!apiAccessToken) {
            Alert.alert(t('Missing API token'), t('Log in again to enable face recognition.'));
            return;
        }
        const eventId = String((_f = modalEvent === null || modalEvent === void 0 ? void 0 : modalEvent.id) !== null && _f !== void 0 ? _f : '').trim();
        if (!eventId) {
            const latest = yield refreshProfileFaceState();
            if (latest.hasFaceEnrollment && latest.faceConsentGranted) {
                setAllowFaceRecognition(true);
                return;
            }
            Alert.alert(t('Select competition'), t('Pick a competition first, then enable face recognition.'));
            return;
        }
        try {
            yield searchFaceByEnrollment(apiAccessToken, {
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
        }
        catch (e) {
            if (e instanceof ApiError) {
                const body = (_g = e.body) !== null && _g !== void 0 ? _g : {};
                if (e.status === 403 && String(e.message).toLowerCase().includes('consent')) {
                    setProfileFaceVerified(true);
                    setProfileFaceConsentGranted(false);
                    Alert.alert(t('Face recognition consent'), t('Allow face recognition for this competition?'), [
                        { text: t('Cancel'), style: 'cancel' },
                        {
                            text: t('Allow'),
                            onPress: () => __awaiter(void 0, void 0, void 0, function* () {
                                var _h;
                                try {
                                    yield grantFaceRecognitionConsent(apiAccessToken);
                                    setProfileFaceConsentGranted(true);
                                    const latest = yield refreshProfileFaceState();
                                    if (latest.hasFaceEnrollment) {
                                        setAllowFaceRecognition(true);
                                        return;
                                    }
                                    setAllowFaceRecognition(false);
                                    Alert.alert(t('Face setup required'), t('Set up your face scan to use face recognition for this competition.'), [
                                        { text: t('Cancel'), style: 'cancel' },
                                        { text: t('Set up face'), onPress: startFaceEnrollment },
                                    ]);
                                }
                                catch (consentError) {
                                    const msg = consentError instanceof ApiError ? consentError.message : String((_h = consentError === null || consentError === void 0 ? void 0 : consentError.message) !== null && _h !== void 0 ? _h : consentError);
                                    Alert.alert(t('Consent failed'), msg);
                                }
                            }),
                        },
                    ]);
                    return;
                }
                if (e.status === 400 && Array.isArray(body === null || body === void 0 ? void 0 : body.missing_angles)) {
                    setProfileFaceVerified(false);
                    Alert.alert(t('Face setup required'), t('Set up your face scan to use face recognition for this competition.'), [
                        { text: t('Cancel'), style: 'cancel' },
                        { text: t('Set up face'), onPress: startFaceEnrollment },
                    ]);
                    return;
                }
            }
        }
        const latest = yield refreshProfileFaceState();
        if (latest.hasFaceEnrollment && latest.faceConsentGranted) {
            setAllowFaceRecognition(true);
            return;
        }
        if (latest.faceConsentGranted) {
            Alert.alert(t('Face setup required'), t('Set up your face scan to use face recognition for this competition.'), [
                { text: t('Cancel'), style: 'cancel' },
                { text: t('Set up face'), onPress: startFaceEnrollment },
            ]);
            return;
        }
        Alert.alert(t('Face recognition consent'), t('Before face setup, please confirm consent for face recognition.'), [
            { text: t('Cancel'), style: 'cancel' },
            {
                text: t('Continue'),
                onPress: () => __awaiter(void 0, void 0, void 0, function* () {
                    var _j;
                    try {
                        yield grantFaceRecognitionConsent(apiAccessToken);
                        setProfileFaceConsentGranted(true);
                        startFaceEnrollment();
                    }
                    catch (consentError) {
                        const msg = consentError instanceof ApiError ? consentError.message : String((_j = consentError === null || consentError === void 0 ? void 0 : consentError.message) !== null && _j !== void 0 ? _j : consentError);
                        Alert.alert(t('Consent failed'), msg);
                    }
                }),
            },
        ]);
    }), [apiAccessToken, modalEvent === null || modalEvent === void 0 ? void 0 : modalEvent.id, refreshProfileFaceState, startFaceEnrollment, t]);
    useEffect(() => {
        if (!apiAccessToken)
            return;
        void refreshProfileFaceState();
    }, [apiAccessToken, refreshProfileFaceState]);
    const activeChestNumber = useMemo(() => {
        var _a;
        return String((_a = (useDefaultChest ? defaultChestNumber : chestNumber)) !== null && _a !== void 0 ? _a : '').trim();
    }, [chestNumber, defaultChestNumber, useDefaultChest]);
    const normalizedDisciplineIds = useMemo(() => selectedDisciplineIds.includes(SUBSCRIPTION_ALL_DISCIPLINE_ID) ? [] : selectedDisciplineIds, [selectedDisciplineIds]);
    const selectedDisciplineLabels = useMemo(() => {
        if (selectedDisciplineIds.includes(SUBSCRIPTION_ALL_DISCIPLINE_ID)) {
            return [t('all')];
        }
        const labels = subscribeDisciplines
            .filter((option) => selectedDisciplineIds.includes(option.id))
            .map((option) => option.label);
        return labels.length > 0 ? labels : [t('all')];
    }, [selectedDisciplineIds, subscribeDisciplines, t]);
    const normalizedCategoryLabels = useMemo(() => normalizeSubscriptionCategories(selectedCategoryLabels), [selectedCategoryLabels]);
    const handleSubscribeReview = useCallback(() => {
        var _a, _b, _c, _d;
        if (!(modalEvent === null || modalEvent === void 0 ? void 0 : modalEvent.id))
            return;
        const safeChestNumber = /^\d+$/.test(activeChestNumber) ? activeChestNumber : '';
        const eventYear = getYearFromDateLike(modalEvent === null || modalEvent === void 0 ? void 0 : modalEvent.date) ||
            getYearFromDateLike(modalEvent === null || modalEvent === void 0 ? void 0 : modalEvent.title) ||
            String(new Date().getFullYear());
        closeSubscribeModal();
        navigation.navigate('EventSummaryScreen', {
            mode: 'eventSubscription',
            subscription: {
                eventId: String(modalEvent.id),
                eventTitle: String((_a = modalEvent.title) !== null && _a !== void 0 ? _a : ''),
                eventDate: String((_b = modalEvent.date) !== null && _b !== void 0 ? _b : ''),
                eventLocation: String((_c = modalEvent.location) !== null && _c !== void 0 ? _c : ''),
                eventTypeLabel: getCompetitionTypeLabel(modalEvent.competitionType),
                organizingClub: String((_d = modalEvent.organizingClub) !== null && _d !== void 0 ? _d : ''),
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
        const filtered = availableEvents.filter((event) => {
            const eventDate = parseEventDate(event.date);
            const rangeOk = timeRange.start || timeRange.end ? isWithinRange(eventDate) : true;
            const typeOk = competitionTypeFilter === 'all' ? true : event.competitionType === competitionTypeFilter;
            const competitionOk = competitionQuery ? event.title.toLowerCase().includes(competitionQuery) : true;
            const locationOk = locationQuery ? event.location.toLowerCase().includes(locationQuery) : true;
            return competitionOk && locationOk && rangeOk && typeOk;
        });
        return filtered.sort((a, b) => {
            var _a, _b, _c, _d;
            const primaryQuery = String(filterValues[activeFilter] || '').trim().toLowerCase();
            const secondaryQuery = activeFilter === 'Competition' ? locationQuery : competitionQuery;
            const aPrimary = activeFilter === 'Competition'
                ? rankMatch(a.title, primaryQuery)
                : rankMatch(a.location, primaryQuery);
            const bPrimary = activeFilter === 'Competition'
                ? rankMatch(b.title, primaryQuery)
                : rankMatch(b.location, primaryQuery);
            if (aPrimary !== bPrimary)
                return aPrimary - bPrimary;
            const aSecondary = activeFilter === 'Competition'
                ? rankMatch(a.location, secondaryQuery)
                : rankMatch(a.title, secondaryQuery);
            const bSecondary = activeFilter === 'Competition'
                ? rankMatch(b.location, secondaryQuery)
                : rankMatch(b.title, secondaryQuery);
            if (aSecondary !== bSecondary)
                return aSecondary - bSecondary;
            const aDate = (_b = (_a = parseEventDate(a.date)) === null || _a === void 0 ? void 0 : _a.getTime()) !== null && _b !== void 0 ? _b : 0;
            const bDate = (_d = (_c = parseEventDate(b.date)) === null || _c === void 0 ? void 0 : _c.getTime()) !== null && _d !== void 0 ? _d : 0;
            return bDate - aDate;
        });
    }, [activeFilter, availableEvents, competitionQuery, competitionTypeFilter, filterValues, isWithinRange, locationQuery, timeRange.end, timeRange.start]);
    const pageSize = hasTypedQuery ? SEARCH_EVENTS_INITIAL_LIMIT : DEFAULT_EVENTS_INITIAL_LIMIT;
    const visibleEvents = useMemo(() => filteredEvents.slice(0, visibleEventCount), [filteredEvents, visibleEventCount]);
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
        if (loadMoreLockedRef.current || !hasMoreEvents)
            return;
        loadMoreLockedRef.current = true;
        setVisibleEventCount((prev) => Math.min(prev + pageSize, filteredEvents.length));
    }, [filteredEvents.length, hasMoreEvents, pageSize]);
    const handleSearchChange = (value) => {
        setFilterValues((prev) => (Object.assign(Object.assign({}, prev), { [activeFilter]: value })));
    };
    const clearFilterValue = (filter) => {
        setFilterValues((prev) => (Object.assign(Object.assign({}, prev), { [filter]: '' })));
    };
    const closeUnsubscribeModal = useCallback(() => {
        if (isUnsubscribing)
            return;
        setUnsubscribeEvent(null);
    }, [isUnsubscribing]);
    const confirmUnsubscribe = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const eventId = String(((_a = unsubscribeEvent === null || unsubscribeEvent === void 0 ? void 0 : unsubscribeEvent.id) !== null && _a !== void 0 ? _a : '')).trim();
        if (!eventId) {
            setUnsubscribeEvent(null);
            return;
        }
        if (!apiAccessToken) {
            setUnsubscribeEvent(null);
            Alert.alert(t('Upload unavailable'), t('Log in again to manage event subscriptions.'));
            return;
        }
        try {
            setIsUnsubscribing(true);
            yield unsubscribeToEvent(apiAccessToken, eventId);
            yield refreshSubscribedEvents();
            setUnsubscribeEvent(null);
        }
        catch (e) {
            const msg = e instanceof ApiError ? e.message : String((_b = e === null || e === void 0 ? void 0 : e.message) !== null && _b !== void 0 ? _b : e);
            Alert.alert(t('Subscription failed'), msg || t('Could not unsubscribe from this event.'));
        }
        finally {
            setIsUnsubscribing(false);
        }
    }), [apiAccessToken, refreshSubscribedEvents, t, unsubscribeEvent === null || unsubscribeEvent === void 0 ? void 0 : unsubscribeEvent.id]);
    const handleEventCardPress = useCallback((eventItem) => {
        const eventId = String((eventItem === null || eventItem === void 0 ? void 0 : eventItem.id) || '').trim();
        if (subscribedEventIdSet.has(eventId)) {
            if (!apiAccessToken) {
                Alert.alert(t('Upload unavailable'), t('Log in again to manage event subscriptions.'));
                return;
            }
            setUnsubscribeEvent(eventItem);
            return;
        }
        openSubscribeModal(eventItem);
    }, [apiAccessToken, openSubscribeModal, subscribedEventIdSet, t]);
    const renderEventCard = (item) => (_jsxs(TouchableOpacity, Object.assign({ style: Styles.eventCard, activeOpacity: 0.85, onPress: () => handleEventCardPress(item), testID: `available-event-card-${item.id}` }, { children: [_jsx(View, Object.assign({ style: Styles.eventIconContainer }, { children: _jsx(Calendar, { size: 20, color: colors.primaryColor, variant: "Linear" }) })), _jsx(SizeBox, { width: 16 }), _jsxs(View, Object.assign({ style: Styles.eventContent }, { children: [_jsxs(View, Object.assign({ style: Styles.eventNameRow }, { children: [_jsx(Text, Object.assign({ style: Styles.eventName }, { children: item.title })), _jsxs(View, Object.assign({ style: Styles.eventTypeRow }, { children: [_jsx(View, Object.assign({ style: Styles.eventTypeBadge }, { children: _jsx(Text, Object.assign({ style: Styles.eventTypeBadgeText }, { children: getCompetitionTypeLabel(item.competitionType) })) })), subscribedEventIdSet.has(String((item === null || item === void 0 ? void 0 : item.id) || '').trim()) ? (_jsx(View, Object.assign({ style: Styles.subscribedCheckBadge, testID: `available-event-subscribed-${item.id}` }, { children: _jsx(Text, Object.assign({ style: Styles.subscribedCheckText }, { children: "✓" })) }))) : null] }))] })), _jsx(SizeBox, { height: 6 }), _jsxs(View, Object.assign({ style: Styles.eventDetails }, { children: [item.date ? (_jsxs(View, Object.assign({ style: Styles.eventDetailItem }, { children: [_jsx(Calendar, { size: 14, color: colors.subTextColor, variant: "Linear" }), _jsx(SizeBox, { width: 4 }), _jsx(Text, Object.assign({ style: Styles.eventDetailText }, { children: item.date }))] }))) : null, item.location ? (_jsxs(View, Object.assign({ style: Styles.eventDetailItem }, { children: [_jsx(Location, { size: 14, color: colors.subTextColor, variant: "Linear" }), _jsx(SizeBox, { width: 4 }), _jsx(Text, Object.assign({ style: Styles.eventDetailText }, { children: item.location }))] }))) : null] })), item.organizingClub ? (_jsxs(_Fragment, { children: [_jsx(SizeBox, { height: 4 }), _jsx(Text, Object.assign({ style: Styles.eventMetaText, numberOfLines: 1 }, { children: item.organizingClub }))] })) : null] }))] }), item.id));
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.backButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 20, color: colors.mainTextColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('events') })), _jsx(View, { style: Styles.headerSpacer })] })), _jsxs(ScrollView, Object.assign({ testID: "available-events-screen", showsVerticalScrollIndicator: false, contentContainerStyle: Styles.scrollContent, onScroll: handleMainScroll, scrollEventThrottle: 16 }, { children: [_jsx(View, Object.assign({ style: Styles.searchRow }, { children: _jsxs(View, Object.assign({ style: Styles.searchInputContainer }, { children: [_jsx(SearchNormal1, { size: 16, color: colors.subTextColor, variant: "Linear" }), _jsx(SizeBox, { width: 8 }), _jsx(View, Object.assign({ style: Styles.searchInputPill }, { children: _jsxs(Text, Object.assign({ style: Styles.searchInputPillText }, { children: [activeFilter === 'Competition' ? t('competition') : t('location'), ":"] })) })), _jsx(TextInput, { style: Styles.searchInput, placeholder: searchPlaceholder, placeholderTextColor: colors.subTextColor, value: activeValue, onChangeText: handleSearchChange, returnKeyType: "search" })] })) })), _jsx(SizeBox, { height: 16 }), _jsx(View, Object.assign({ style: Styles.filterTabsContainer }, { children: _jsx(ScrollView, Object.assign({ horizontal: true, showsHorizontalScrollIndicator: false }, { children: EVENT_FILTERS.map((filter) => (_jsx(TouchableOpacity, Object.assign({ style: [
                                    Styles.filterTab,
                                    activeFilter === filter && Styles.filterTabActive
                                ], onPress: () => setActiveFilter(filter) }, { children: _jsx(Text, Object.assign({ style: [
                                        Styles.filterTabText,
                                        activeFilter === filter && Styles.filterTabTextActive
                                    ] }, { children: filter === 'Competition' ? t('competition') : t('location') })) }), filter))) })) })), _jsx(SizeBox, { height: 16 }), _jsxs(View, Object.assign({ style: Styles.typeFilterRow }, { children: [_jsx(Text, Object.assign({ style: Styles.typeFilterLabel }, { children: t('competitionType') })), _jsx(View, Object.assign({ style: Styles.typeFilterChips }, { children: COMPETITION_TYPE_FILTERS.map((option) => (_jsx(TouchableOpacity, Object.assign({ style: [
                                        Styles.typeFilterChip,
                                        competitionTypeFilter === option.key && Styles.typeFilterChipActive,
                                    ], onPress: () => setCompetitionTypeFilter(option.key) }, { children: _jsx(Text, Object.assign({ style: [
                                            Styles.typeFilterChipText,
                                            competitionTypeFilter === option.key && Styles.typeFilterChipTextActive,
                                        ] }, { children: option.focusId ? getSportFocusLabel(option.focusId, t) : t(option.labelKey) })) }), option.key))) }))] })), _jsx(SizeBox, { height: 12 }), _jsxs(View, Object.assign({ style: Styles.activeChipsContainer }, { children: [activeFilters.map((filter) => (_jsxs(TouchableOpacity, Object.assign({ style: Styles.activeChip, onPress: () => clearFilterValue(filter) }, { children: [_jsxs(Text, Object.assign({ style: Styles.activeChipText }, { children: [(filter === 'Competition' ? t('competition') : t('location')), ": ", filterValues[filter]] })), _jsx(CloseCircle, { size: 16, color: "#FFFFFF", variant: "Linear" })] }), filter))), timeRange.start && timeRange.end ? (_jsxs(TouchableOpacity, Object.assign({ style: Styles.timeRangeChipActive, onPress: openDateTimePicker }, { children: [_jsx(Clock, { size: 14, color: colors.primaryColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: Styles.timeRangeTextActive }, { children: formatDateRange(timeRange.start, timeRange.end) })), _jsx(TouchableOpacity, Object.assign({ onPress: () => setTimeRange({ start: null, end: null }) }, { children: _jsx(CloseCircle, { size: 16, color: colors.primaryColor, variant: "Linear" }) }))] }))) : (_jsxs(TouchableOpacity, Object.assign({ style: Styles.timeRangeChip, onPress: openDateTimePicker }, { children: [_jsx(Clock, { size: 14, color: colors.subTextColor, variant: "Linear" }), _jsx(SizeBox, { width: 4 }), _jsx(Text, Object.assign({ style: Styles.timeRangeText }, { children: t('selectDateRange') })), _jsx(SizeBox, { width: 4 }), _jsx(ArrowDown2, { size: 14, color: colors.subTextColor, variant: "Linear" })] })))] })), _jsx(SizeBox, { height: 16 }), _jsxs(View, Object.assign({ style: Styles.sectionHeader }, { children: [_jsx(Text, Object.assign({ style: Styles.sectionTitle }, { children: t('availableEvents') })), _jsx(View, Object.assign({ style: Styles.eventsCountBadge }, { children: _jsxs(Text, Object.assign({ style: Styles.eventsCountText }, { children: [filteredEvents.length, " ", t('events').toLowerCase()] })) }))] })), eventsError ? (_jsx(Text, Object.assign({ style: Styles.errorText }, { children: eventsError }))) : isLoadingEvents ? (_jsx(View, Object.assign({ style: { paddingVertical: 20, alignItems: 'center' } }, { children: _jsx(ActivityIndicator, { color: colors.primaryColor }) }))) : filteredEvents.length > 0 ? (visibleEvents.map(renderEventCard)) : (_jsx(View, Object.assign({ style: { paddingVertical: 20 } }, { children: _jsx(Text, Object.assign({ style: Styles.emptyStateText }, { children: t('No events found.') })) }))), _jsx(SizeBox, { height: 20 })] })), _jsx(Modal, Object.assign({ visible: Boolean(unsubscribeEvent), transparent: true, animationType: "fade", onRequestClose: closeUnsubscribeModal }, { children: _jsxs(View, Object.assign({ style: Styles.modalBackdrop }, { children: [_jsx(Pressable, { style: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }, onPress: closeUnsubscribeModal }), _jsxs(View, Object.assign({ style: [Styles.modalCard, { width: modalWidth }] }, { children: [_jsx(Text, Object.assign({ style: Styles.modalTitle }, { children: "Do you want to unsubscribe from this event?" })), _jsx(SizeBox, { height: 16 }), _jsxs(View, Object.assign({ style: Styles.modalButtonsRow }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.modalCancelButton, onPress: closeUnsubscribeModal, disabled: isUnsubscribing }, { children: _jsx(Text, Object.assign({ style: Styles.modalCancelText }, { children: "Cancel" })) })), _jsx(TouchableOpacity, Object.assign({ style: [Styles.modalConfirmButton, isUnsubscribing && Styles.modalConfirmButtonDisabled], onPress: confirmUnsubscribe, disabled: isUnsubscribing, testID: "available-event-unsubscribe-confirm" }, { children: _jsx(Text, Object.assign({ style: Styles.modalConfirmText }, { children: "Yes" })) }))] }))] }))] })) })), _jsx(Modal, Object.assign({ visible: showSubscribeModal, transparent: true, animationType: "slide", onRequestClose: closeSubscribeModal }, { children: _jsxs(View, Object.assign({ style: Styles.feedbackBackdrop }, { children: [_jsx(Pressable, { style: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }, onPress: closeSubscribeModal }), _jsx(View, Object.assign({ style: Styles.feedbackCard }, { children: _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, contentContainerStyle: Styles.modalScrollContent }, { children: [_jsxs(View, Object.assign({ style: Styles.modalHeaderRow }, { children: [_jsx(Text, Object.assign({ style: Styles.modalTitle }, { children: subscribeStep === 0 ? t('Discipline') : subscribeStep === 1 ? t('Category') : t('User') })), _jsx(TouchableOpacity, Object.assign({ style: Styles.modalHeaderAction, onPress: () => {
                                                    if (!modalEvent)
                                                        return;
                                                    closeSubscribeModal();
                                                    navigation.navigate('CompetitionDetailsScreen', {
                                                        name: modalEvent.title,
                                                        location: modalEvent.location,
                                                        date: modalEvent.date,
                                                        organizingClub: modalEvent.organizingClub,
                                                        competitionType: modalEvent.competitionType,
                                                        eventId: modalEvent.id,
                                                    });
                                                } }, { children: _jsx(Text, Object.assign({ style: Styles.modalHeaderActionText }, { children: t('viewCompetition') })) }))] })), subscribeStep === 0 ? (_jsxs(View, Object.assign({ style: Styles.modalSectionCard }, { children: [_jsx(Text, Object.assign({ style: Styles.modalSectionTitle }, { children: t('disciplines') })), _jsx(Text, Object.assign({ style: Styles.modalSectionHint }, { children: t('Choose one or more disciplines, or keep All for the full competition.') })), subscribeDisciplinesLoading ? (_jsx(View, Object.assign({ style: { paddingVertical: 10, alignItems: 'center' } }, { children: _jsx(ActivityIndicator, { color: colors.primaryColor }) }))) : (_jsx(View, Object.assign({ style: Styles.modalChipsGrid }, { children: subscribeDisciplines.map((item) => {
                                                    const isSelected = selectedDisciplineIds.includes(item.id);
                                                    return (_jsx(TouchableOpacity, Object.assign({ style: [Styles.modalChip, isSelected && Styles.modalChipActive], onPress: () => setSelectedDisciplineIds((prev) => toggleSubscriptionDiscipline(prev, item.id)), activeOpacity: 0.8 }, { children: _jsx(Text, Object.assign({ style: [Styles.modalChipText, isSelected && Styles.modalChipTextActive] }, { children: item.id === SUBSCRIPTION_ALL_DISCIPLINE_ID ? t('all') : item.label })) }), `discipline-${item.id}`));
                                                }) })))] }))) : null, subscribeStep === 1 ? (_jsxs(View, Object.assign({ style: Styles.modalSectionCard }, { children: [_jsx(Text, Object.assign({ style: Styles.modalSectionTitle }, { children: t('Category') })), _jsx(Text, Object.assign({ style: Styles.modalSectionHint }, { children: t('Choose the categories you want to follow, or keep All.') })), _jsx(View, Object.assign({ style: Styles.modalChipsGrid }, { children: SUBSCRIPTION_CATEGORY_OPTIONS.map((item) => {
                                                    const isSelected = normalizedCategoryLabels.includes(item);
                                                    return (_jsx(TouchableOpacity, Object.assign({ style: [Styles.modalChip, isSelected && Styles.modalChipActive], onPress: () => setSelectedCategoryLabels((prev) => toggleSubscriptionCategory(prev, item)), activeOpacity: 0.8 }, { children: _jsx(Text, Object.assign({ style: [Styles.modalChipText, isSelected && Styles.modalChipTextActive] }, { children: t(item === 'All' ? 'all' : item) })) }), `category-${item}`));
                                                }) }))] }))) : null, subscribeStep === 2 ? (_jsxs(_Fragment, { children: [_jsxs(View, Object.assign({ style: Styles.modalSectionCard }, { children: [_jsx(Text, Object.assign({ style: Styles.modalSectionTitle }, { children: t('Chest number') })), _jsx(Text, Object.assign({ style: Styles.modalSectionHint }, { children: t('Chest number is optional. Leave it empty to follow all photos for this subscription.') })), !useDefaultChest || !defaultChestNumber ? (_jsxs(View, Object.assign({ style: Styles.modalChestInput }, { children: [_jsx(User, { size: 16, color: colors.subTextColor, variant: "Linear" }), _jsx(TextInput, { style: Styles.modalChestTextInput, placeholder: t('enterChestNumber'), placeholderTextColor: colors.subTextColor, value: chestNumber, onChangeText: setChestNumber })] }))) : null, _jsxs(TouchableOpacity, Object.assign({ style: Styles.defaultChestRow, onPress: () => {
                                                            if (!defaultChestNumber)
                                                                return;
                                                            setUseDefaultChest((prev) => !prev);
                                                        }, activeOpacity: 0.8 }, { children: [_jsx(View, Object.assign({ style: [Styles.defaultChestBox, useDefaultChest && Styles.defaultChestBoxActive] }, { children: useDefaultChest && _jsx(Text, Object.assign({ style: Styles.defaultChestCheck }, { children: t('✓') })) })), _jsx(Text, Object.assign({ style: Styles.defaultChestText }, { children: defaultChestNumber
                                                                    ? `${t('useDefaultNumber')} (${defaultChestNumber})`
                                                                    : t('No saved chest number yet. Enter the chest number for this competition below.') }))] }))] })), _jsxs(View, Object.assign({ style: Styles.modalSectionCard }, { children: [_jsx(Text, Object.assign({ style: Styles.modalSectionTitle }, { children: t('Face') })), _jsxs(View, Object.assign({ style: Styles.modalToggleRow }, { children: [_jsxs(View, Object.assign({ style: Styles.modalToggleCopy }, { children: [_jsx(Text, Object.assign({ style: Styles.modalToggleTitle }, { children: t('Allow face recognition for this competition') })), _jsx(Text, Object.assign({ style: Styles.modalToggleHint }, { children: !hasFaceEnrollment
                                                                            ? t('Face: enrollment required.')
                                                                            : faceConsentGranted
                                                                                ? t('Enable this only if you want notifications narrowed to your face.')
                                                                                : t('Permission will be requested when you confirm.') }))] })), _jsx(Switch, { value: allowFaceRecognition, onValueChange: handleFaceToggle, trackColor: { false: colors.lightGrayColor, true: colors.primaryColor }, thumbColor: colors.pureWhite })] }))] }))] })) : null, _jsxs(View, Object.assign({ style: Styles.modalButtonsRow }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.modalCancelButton, onPress: () => {
                                                    if (subscribeStep === 0) {
                                                        closeSubscribeModal();
                                                        return;
                                                    }
                                                    setSubscribeStep((prev) => Math.max(0, prev - 1));
                                                } }, { children: _jsx(Text, Object.assign({ style: Styles.modalCancelText }, { children: subscribeStep === 0 ? t('cancel') : t('Back') })) })), _jsx(TouchableOpacity, Object.assign({ style: Styles.modalConfirmButton, onPress: () => {
                                                    if (subscribeStep < 2) {
                                                        setSubscribeStep((prev) => Math.min(2, prev + 1));
                                                        return;
                                                    }
                                                    handleSubscribeReview();
                                                }, testID: "available-event-subscribe-confirm" }, { children: _jsx(Text, Object.assign({ style: Styles.modalConfirmText }, { children: subscribeStep < 2 ? t('Next') : t('Review') })) }))] }))] })) }))] })) })), _jsx(Modal, Object.assign({ visible: showIosPicker, transparent: true, animationType: "fade", onRequestClose: () => {
                    setShowIosPicker(false);
                    closeNativePicker();
                } }, { children: _jsxs(View, Object.assign({ style: Styles.dateModalOverlay }, { children: [_jsx(Pressable, { style: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }, onPress: () => {
                                setShowIosPicker(false);
                                closeNativePicker();
                            } }), _jsxs(View, Object.assign({ style: [Styles.dateModalContainer, { width: modalWidth }] }, { children: [_jsx(Text, Object.assign({ style: Styles.dateModalTitle }, { children: t('selectDateRange') })), _jsx(SizeBox, { height: 10 }), _jsxs(View, Object.assign({ style: Styles.quickRangeRow }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.quickRangeChip, onPress: () => setQuickRange('week') }, { children: _jsx(Text, Object.assign({ style: Styles.quickRangeChipText }, { children: t('thisWeek') })) })), _jsx(TouchableOpacity, Object.assign({ style: Styles.quickRangeChip, onPress: () => setQuickRange('month') }, { children: _jsx(Text, Object.assign({ style: Styles.quickRangeChipText }, { children: t('thisMonth') })) })), _jsx(TouchableOpacity, Object.assign({ style: Styles.quickRangeChip, onPress: () => setQuickRange('year') }, { children: _jsx(Text, Object.assign({ style: Styles.quickRangeChipText }, { children: t('thisYear') })) }))] })), _jsx(SizeBox, { height: 8 }), _jsxs(View, Object.assign({ style: Styles.rangeHeaderRow }, { children: [_jsxs(TouchableOpacity, Object.assign({ style: Styles.rangePill, onPress: () => openRangeFieldPicker('start'), activeOpacity: 0.8 }, { children: [_jsx(Text, Object.assign({ style: Styles.rangePillLabel }, { children: t('start') })), _jsx(Text, Object.assign({ style: Styles.rangePillValue }, { children: calendarStart !== null && calendarStart !== void 0 ? calendarStart : t('selectDate') }))] })), _jsxs(TouchableOpacity, Object.assign({ style: Styles.rangePill, onPress: () => openRangeFieldPicker('end'), activeOpacity: 0.8 }, { children: [_jsx(Text, Object.assign({ style: Styles.rangePillLabel }, { children: t('end') })), _jsx(Text, Object.assign({ style: Styles.rangePillValue }, { children: calendarEnd !== null && calendarEnd !== void 0 ? calendarEnd : t('selectDate') }))] }))] })), _jsx(SizeBox, { height: 12 }), _jsxs(View, Object.assign({ style: Styles.dateModalButtonRow }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.dateModalCancelButton, onPress: () => {
                                                setShowIosPicker(false);
                                                closeNativePicker();
                                            } }, { children: _jsx(Text, Object.assign({ style: Styles.dateModalCancelText }, { children: t('cancel') })) })), _jsx(TouchableOpacity, Object.assign({ style: [Styles.dateModalSubmitButton, !calendarStart && Styles.dateModalSubmitButtonDisabled], onPress: applyIosDateTime, disabled: !calendarStart }, { children: _jsx(Text, Object.assign({ style: Styles.dateModalSubmitText }, { children: t('apply') })) }))] }))] })), Platform.OS === 'ios' && nativePickerVisible && activeDateField ? (_jsxs(View, Object.assign({ style: Styles.nativePickerOverlay }, { children: [_jsx(Pressable, { style: Styles.nativePickerBackdrop, onPress: closeNativePicker }), _jsxs(View, Object.assign({ style: Styles.nativePickerSheet }, { children: [_jsxs(View, Object.assign({ style: Styles.nativePickerToolbar }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.nativePickerAction, onPress: closeNativePicker }, { children: _jsx(Text, Object.assign({ style: Styles.nativePickerActionText }, { children: t('cancel') })) })), _jsx(TouchableOpacity, Object.assign({ style: Styles.nativePickerAction, onPress: applyNativePickerSelection }, { children: _jsx(Text, Object.assign({ style: Styles.nativePickerActionText }, { children: t('apply') })) }))] })), _jsx(DateTimePicker, Object.assign({}, pickerVisualProps, { value: nativePickerDate, mode: "date", display: "spinner", onChange: onNativePickerChange }))] }))] }))) : null] })) })), nativePickerVisible && activeDateField && Platform.OS === 'android' ? (_jsx(DateTimePicker, Object.assign({}, pickerVisualProps, { value: nativePickerDate, mode: "date", display: "default", onChange: onNativePickerChange }))) : null] })));
};
export default AvailableEventsScreen;
