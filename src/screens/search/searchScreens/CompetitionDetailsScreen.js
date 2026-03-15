var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { View, Text, TouchableOpacity, ScrollView, Switch, Modal, Image, ActivityIndicator, Alert, InteractionManager } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft2, ArrowRight } from 'iconsax-react-nativejs';
import Icons from '../../../constants/Icons';
import { createStyles } from './CompetitionDetailsScreenStyles';
import { useAuth } from '../../../context/AuthContext';
import { ApiError, getCompetitionMapById, getCompetitionMaps, getEventCompetitions, getProfileSummary, searchEvents, searchFaceByEnrollment, searchMediaByBib, grantFaceRecognitionConsent, unsubscribeToEvent } from '../../../services/apiGateway';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import UnifiedSearchInput from '../../../components/unifiedSearchInput/UnifiedSearchInput';
import { useEvents } from '../../../context/EventsContext';
import { getApiBaseUrl } from '../../../constants/RuntimeConfig';
import { getSportFocusLabel, normalizeFocusId } from '../../../utils/profileSelections';
import { buildSubscriptionDisciplineOptions, normalizeSubscriptionCategories, SUBSCRIPTION_ALL_DISCIPLINE_ID, SUBSCRIPTION_CATEGORY_OPTIONS, toggleSubscriptionCategory, toggleSubscriptionDiscipline } from '../../../utils/eventSubscription';
import E2EPerfReady from '../../../components/e2e/E2EPerfReady';
const FALLBACK_COURSES = [];
const CompetitionDetailsScreen = ({ navigation, route }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1;
    const insets = useSafeAreaInsets();
    const { apiAccessToken, userProfile } = useAuth();
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const { t } = useTranslation();
    const { events: subscribedEvents, refresh: refreshSubscribed } = useEvents();
    const perfStartedAtRef = useRef(Date.now());
    const [selectedTab, setSelectedTab] = useState('track');
    const [competitionFocusId, setCompetitionFocusId] = useState(normalizeFocusId((_b = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.competitionFocus) !== null && _b !== void 0 ? _b : (_c = route === null || route === void 0 ? void 0 : route.params) === null || _c === void 0 ? void 0 : _c.competitionType));
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [checkpointModalVisible, setCheckpointModalVisible] = useState(false);
    const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);
    const [courseOptions, setCourseOptions] = useState([]);
    const [trackEvents, setTrackEvents] = useState([]);
    const [fieldEvents, setFieldEvents] = useState([]);
    const [isDisciplinesLoading, setIsDisciplinesLoading] = useState(false);
    const [hasLoadedDisciplines, setHasLoadedDisciplines] = useState(false);
    const [isMapLoading, setIsMapLoading] = useState(false);
    const [hasLoadedMaps, setHasLoadedMaps] = useState(false);
    const [mapError, setMapError] = useState(null);
    const [mapLoadFailed, setMapLoadFailed] = useState(false);
    const [aiCompareModalVisible, setAiCompareModalVisible] = useState(false);
    const [quickChestNumber, setQuickChestNumber] = useState('');
    const [quickUseDefaultChest, setQuickUseDefaultChest] = useState(false);
    const [quickSearchError, setQuickSearchError] = useState(null);
    const [quickSearchLoading, setQuickSearchLoading] = useState(false);
    const [quickNeedsConsent, setQuickNeedsConsent] = useState(false);
    const [quickMissingAngles, setQuickMissingAngles] = useState(null);
    const [quickUseFace, setQuickUseFace] = useState(true);
    const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false);
    const [subscribeSheetVisible, setSubscribeSheetVisible] = useState(false);
    const [subscribeStep, setSubscribeStep] = useState(0);
    const [subscribeChestNumber, setSubscribeChestNumber] = useState('');
    const [subscribeUseDefaultChest, setSubscribeUseDefaultChest] = useState(true);
    const [subscribeUseFace, setSubscribeUseFace] = useState(false);
    const [profileChestByYear, setProfileChestByYear] = useState({});
    const [profileFaceVerified, setProfileFaceVerified] = useState(null);
    const [profileFaceConsentGranted, setProfileFaceConsentGranted] = useState(null);
    const [subscribeDisciplineIds, setSubscribeDisciplineIds] = useState([SUBSCRIPTION_ALL_DISCIPLINE_ID]);
    const [subscribeCategoryLabels, setSubscribeCategoryLabels] = useState(['All']);
    const competitionName = ((_d = route === null || route === void 0 ? void 0 : route.params) === null || _d === void 0 ? void 0 : _d.name) || ((_e = route === null || route === void 0 ? void 0 : route.params) === null || _e === void 0 ? void 0 : _e.eventName) || t('Competition');
    const legacyDescription = String((_g = (_f = route === null || route === void 0 ? void 0 : route.params) === null || _f === void 0 ? void 0 : _f.description) !== null && _g !== void 0 ? _g : '').trim();
    const legacyLocation = legacyDescription.replace(/^competition held in\s*/i, '').trim();
    const competitionLocation = String((_j = (_h = route === null || route === void 0 ? void 0 : route.params) === null || _h === void 0 ? void 0 : _h.location) !== null && _j !== void 0 ? _j : '').trim() || (legacyLocation && legacyLocation !== legacyDescription ? legacyLocation : '');
    const rawCompetitionDate = String((_l = (_k = route === null || route === void 0 ? void 0 : route.params) === null || _k === void 0 ? void 0 : _k.date) !== null && _l !== void 0 ? _l : '').trim();
    const competitionDate = useMemo(() => {
        if (!rawCompetitionDate)
            return '';
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
    const organizingClub = String((_s = (_q = (_o = (_m = route === null || route === void 0 ? void 0 : route.params) === null || _m === void 0 ? void 0 : _m.organizingClub) !== null && _o !== void 0 ? _o : (_p = route === null || route === void 0 ? void 0 : route.params) === null || _p === void 0 ? void 0 : _p.organizing_club) !== null && _q !== void 0 ? _q : (_r = route === null || route === void 0 ? void 0 : route.params) === null || _r === void 0 ? void 0 : _r.organizer_club) !== null && _s !== void 0 ? _s : '').trim();
    const competitionType = ((_t = route === null || route === void 0 ? void 0 : route.params) === null || _t === void 0 ? void 0 : _t.competitionType) || 'track';
    const normalizedCompetitionType = String(competitionType || '').toLowerCase();
    const isRoadTrailCompetition = competitionFocusId === 'road-events' || normalizedCompetitionType === 'marathon' || normalizedCompetitionType === 'road' || normalizedCompetitionType === 'trail' || normalizedCompetitionType === 'roadtrail' || normalizedCompetitionType === 'road&trail';
    const isTrackFieldCompetition = competitionFocusId === 'track-field' || (!competitionFocusId && !isRoadTrailCompetition);
    const competitionTypeLabel = useMemo(() => (competitionFocusId ? getSportFocusLabel(competitionFocusId, t) : (isRoadTrailCompetition ? t('roadAndTrail') : t('trackAndField'))), [competitionFocusId, isRoadTrailCompetition, t]);
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
    const eventId = (_u = route === null || route === void 0 ? void 0 : route.params) === null || _u === void 0 ? void 0 : _u.eventId;
    const competitionId = (_v = route === null || route === void 0 ? void 0 : route.params) === null || _v === void 0 ? void 0 : _v.competitionId;
    const resolvedEventId = useMemo(() => { var _a; return String((_a = eventId !== null && eventId !== void 0 ? eventId : competitionId) !== null && _a !== void 0 ? _a : '').trim(); }, [competitionId, eventId]);
    const canSubscribe = resolvedEventId.length > 0;
    const isSubscribed = useMemo(() => canSubscribe && subscribedEvents.some((event) => String(event.event_id) === resolvedEventId), [canSubscribe, resolvedEventId, subscribedEvents]);
    const getYearFromDateLike = useCallback((value) => {
        const raw = String(value !== null && value !== void 0 ? value : '').trim();
        if (!raw)
            return null;
        const dt = new Date(raw);
        if (!Number.isNaN(dt.getTime()))
            return String(dt.getFullYear());
        const m = raw.match(/\b(19|20)\d{2}\b/);
        return m ? m[0] : null;
    }, []);
    const normalizeChestByYear = useCallback((raw) => {
        if (!raw || typeof raw !== 'object' || Array.isArray(raw))
            return {};
        const out = {};
        for (const [year, chest] of Object.entries(raw)) {
            const safeYear = String(year !== null && year !== void 0 ? year : '').trim();
            if (!/^\d{4}$/.test(safeYear))
                continue;
            const safeChest = String(chest !== null && chest !== void 0 ? chest : '').trim();
            if (!/^\d+$/.test(safeChest))
                continue;
            out[safeYear] = safeChest;
        }
        return out;
    }, []);
    const defaultChestNumber = useMemo(() => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const byYear = Object.assign(Object.assign({}, normalizeChestByYear((_a = userProfile === null || userProfile === void 0 ? void 0 : userProfile.chestNumbersByYear) !== null && _a !== void 0 ? _a : {})), profileChestByYear);
        const currentYear = String(new Date().getFullYear());
        const eventYear = getYearFromDateLike(String((_c = (_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.date) !== null && _c !== void 0 ? _c : '')) ||
            getYearFromDateLike(String((_g = (_e = (_d = route === null || route === void 0 ? void 0 : route.params) === null || _d === void 0 ? void 0 : _d.name) !== null && _e !== void 0 ? _e : (_f = route === null || route === void 0 ? void 0 : route.params) === null || _f === void 0 ? void 0 : _f.eventName) !== null && _g !== void 0 ? _g : '')) ||
            getYearFromDateLike(String((_j = (_h = route === null || route === void 0 ? void 0 : route.params) === null || _h === void 0 ? void 0 : _h.location) !== null && _j !== void 0 ? _j : ''));
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
    }, [getYearFromDateLike, normalizeChestByYear, profileChestByYear, (_w = route === null || route === void 0 ? void 0 : route.params) === null || _w === void 0 ? void 0 : _w.date, (_x = route === null || route === void 0 ? void 0 : route.params) === null || _x === void 0 ? void 0 : _x.eventName, (_y = route === null || route === void 0 ? void 0 : route.params) === null || _y === void 0 ? void 0 : _y.location, (_z = route === null || route === void 0 ? void 0 : route.params) === null || _z === void 0 ? void 0 : _z.name, userProfile === null || userProfile === void 0 ? void 0 : userProfile.chestNumbersByYear]);
    const competitionYear = useMemo(() => {
        var _a, _b;
        return getYearFromDateLike(String((_b = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.date) !== null && _b !== void 0 ? _b : '')) ||
            getYearFromDateLike(competitionDate) ||
            String(new Date().getFullYear());
    }, [competitionDate, getYearFromDateLike, (_0 = route === null || route === void 0 ? void 0 : route.params) === null || _0 === void 0 ? void 0 : _0.date]);
    const activeSubscriptionChestNumber = useMemo(() => { var _a; return String((_a = (subscribeUseDefaultChest ? defaultChestNumber : subscribeChestNumber)) !== null && _a !== void 0 ? _a : '').trim(); }, [defaultChestNumber, subscribeChestNumber, subscribeUseDefaultChest]);
    const hasFaceEnrollment = profileFaceVerified !== null && profileFaceVerified !== void 0 ? profileFaceVerified : Boolean(userProfile === null || userProfile === void 0 ? void 0 : userProfile.faceVerified);
    const faceConsentGranted = profileFaceConsentGranted !== null && profileFaceConsentGranted !== void 0 ? profileFaceConsentGranted : Boolean(userProfile === null || userProfile === void 0 ? void 0 : userProfile.faceConsentGranted);
    useEffect(() => {
        if (!apiAccessToken)
            return;
        let active = true;
        (() => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            try {
                const summary = yield getProfileSummary(apiAccessToken);
                if (!active)
                    return;
                setProfileChestByYear(normalizeChestByYear((_b = (_a = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _a === void 0 ? void 0 : _a.chest_numbers_by_year) !== null && _b !== void 0 ? _b : {}));
                setProfileFaceVerified(Boolean((_c = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _c === void 0 ? void 0 : _c.face_verified));
                setProfileFaceConsentGranted(Boolean((_d = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _d === void 0 ? void 0 : _d.face_consent_granted));
            }
            catch (_e) {
                // keep local fallback from userProfile
            }
        }))();
        return () => {
            active = false;
        };
    }, [apiAccessToken, normalizeChestByYear]);
    const currentEvents = useMemo(() => {
        if (!isTrackFieldCompetition)
            return trackEvents;
        return selectedTab === 'track' ? trackEvents : fieldEvents;
    }, [fieldEvents, isTrackFieldCompetition, selectedTab, trackEvents]);
    const visibleCourses = courseOptions.length > 0 ? courseOptions : FALLBACK_COURSES;
    const showCoursesSection = isRoadTrailCompetition;
    const perfReady = !isDisciplinesLoading && !isMapLoading && (hasLoadedDisciplines || hasLoadedMaps);
    const subscriptionDisciplineOptions = useMemo(() => {
        const rows = showCoursesSection
            ? visibleCourses.map((course) => {
                var _a;
                return ({
                    id: String((_a = course.disciplineId) !== null && _a !== void 0 ? _a : course.id),
                    competition_name: course.label,
                });
            })
            : [...trackEvents, ...fieldEvents].map((event) => ({
                id: String(event.id),
                competition_name: event.name,
            }));
        return buildSubscriptionDisciplineOptions(rows);
    }, [fieldEvents, showCoursesSection, trackEvents, visibleCourses]);
    const normalizedSubscriptionDisciplineIds = useMemo(() => subscribeDisciplineIds.includes(SUBSCRIPTION_ALL_DISCIPLINE_ID) ? [] : subscribeDisciplineIds, [subscribeDisciplineIds]);
    const selectedSubscriptionDisciplineLabels = useMemo(() => {
        if (subscribeDisciplineIds.includes(SUBSCRIPTION_ALL_DISCIPLINE_ID)) {
            return [t('all')];
        }
        const labels = subscriptionDisciplineOptions
            .filter((option) => subscribeDisciplineIds.includes(option.id))
            .map((option) => option.label);
        return labels.length > 0 ? labels : [t('all')];
    }, [subscribeDisciplineIds, subscriptionDisciplineOptions, t]);
    const normalizedSubscriptionCategories = useMemo(() => normalizeSubscriptionCategories(subscribeCategoryLabels), [subscribeCategoryLabels]);
    const selectedCourse = useMemo(() => {
        var _a;
        if (visibleCourses.length === 0)
            return null;
        return (_a = visibleCourses.find((course) => course.id === selectedCourseId)) !== null && _a !== void 0 ? _a : visibleCourses[0];
    }, [selectedCourseId, visibleCourses]);
    const hasSelectedCourseMap = Boolean(selectedCourse === null || selectedCourse === void 0 ? void 0 : selectedCourse.imageUrl) && !mapLoadFailed;
    useEffect(() => {
        setMapLoadFailed(false);
    }, [selectedCourse === null || selectedCourse === void 0 ? void 0 : selectedCourse.id, selectedCourse === null || selectedCourse === void 0 ? void 0 : selectedCourse.imageUrl]);
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
            return null;
        if (!apiAccessToken)
            return String(value);
        if (isSignedUrl(value))
            return String(value);
        if (String(value).includes('access_token='))
            return String(value);
        const sep = String(value).includes('?') ? '&' : '?';
        return `${String(value)}${sep}access_token=${encodeURIComponent(apiAccessToken)}`;
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
        const loadMaps = () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            setIsMapLoading(true);
            setHasLoadedMaps(false);
            setMapError(null);
            try {
                const res = yield getCompetitionMaps(apiAccessToken, {
                    event_id: resolvedEventId || undefined,
                    include_checkpoints: true,
                });
                if (!isActive)
                    return;
                const normalized = (res.maps || []).map((map) => {
                    var _a, _b, _c, _d, _e;
                    return ({
                        id: map.id,
                        label: (_a = map.name) !== null && _a !== void 0 ? _a : t('Course'),
                        description: map.name ? t('Course map') : t('Course map'),
                        imageUrl: (_d = withAccessToken(toAbsoluteUrl((_c = (_b = map.image_url) !== null && _b !== void 0 ? _b : map.storage_key) !== null && _c !== void 0 ? _c : null))) !== null && _d !== void 0 ? _d : undefined,
                        disciplineId: map.competition_id ? String(map.competition_id) : null,
                        checkpoints: ((_e = map.checkpoints) !== null && _e !== void 0 ? _e : []).map((cp) => {
                            var _a;
                            return ({
                                id: cp.id,
                                label: (_a = cp.label) !== null && _a !== void 0 ? _a : `Checkpoint ${cp.checkpoint_index}`,
                            });
                        }),
                    });
                });
                setCourseOptions(normalized);
                setSelectedCourseId((prev) => { var _a; return normalized.some((course) => course.id === prev) ? prev : (((_a = normalized[0]) === null || _a === void 0 ? void 0 : _a.id) || ''); });
            }
            catch (e) {
                if (!isActive)
                    return;
                const message = e instanceof ApiError ? e.message : String((_a = e === null || e === void 0 ? void 0 : e.message) !== null && _a !== void 0 ? _a : e);
                setMapError(message);
                setCourseOptions([]);
                setSelectedCourseId('');
            }
            finally {
                if (isActive) {
                    setIsMapLoading(false);
                    setHasLoadedMaps(true);
                }
            }
        });
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
        const loadDisciplines = () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c;
            setHasLoadedDisciplines(false);
            setIsDisciplinesLoading(true);
            try {
                const comps = yield getEventCompetitions(apiAccessToken, String(resolvedEventId), { onlyWithMedia: true });
                if (!isActive)
                    return;
                const rows = Array.isArray(comps.competitions) ? comps.competitions : [];
                const resolvedFocus = normalizeFocusId((_c = (_b = (_a = rows[0]) === null || _a === void 0 ? void 0 : _a.competition_focus) !== null && _b !== void 0 ? _b : competitionFocusId) !== null && _c !== void 0 ? _c : competitionType);
                setCompetitionFocusId(resolvedFocus);
                const mapped = rows
                    .filter((comp) => { var _a; return Number((_a = comp.media_count) !== null && _a !== void 0 ? _a : 0) > 0; })
                    .map((comp) => {
                    var _a, _b;
                    const name = String(comp.competition_name || comp.competition_name_normalized || t('Event'));
                    const type = String(comp.competition_type || '').toLowerCase();
                    const group = String(comp.discipline_group || '').toLowerCase();
                    const kind = resolvedFocus && resolvedFocus !== 'track-field'
                        ? 'track'
                        : (type.includes('field') || group === 'jumps' || group === 'throws' ? 'field' : 'track');
                    return {
                        id: String(comp.id),
                        name,
                        hasArrow: true,
                        badges: comp.discipline_group ? [String(comp.discipline_group)] : undefined,
                        thumbnailUrl: withAccessToken(toAbsoluteUrl((_a = comp.thumbnail_url) !== null && _a !== void 0 ? _a : null)),
                        group: (_b = comp.discipline_group) !== null && _b !== void 0 ? _b : null,
                        _kind: kind,
                    };
                });
                if (resolvedFocus && resolvedFocus !== 'track-field') {
                    setTrackEvents(mapped.map((_a) => {
                        var { _kind } = _a, rest = __rest(_a, ["_kind"]);
                        return rest;
                    }));
                    setFieldEvents([]);
                    return;
                }
                setTrackEvents(mapped.filter((e) => e._kind === 'track').map((_a) => {
                    var { _kind } = _a, rest = __rest(_a, ["_kind"]);
                    return rest;
                }));
                setFieldEvents(mapped.filter((e) => e._kind === 'field').map((_a) => {
                    var { _kind } = _a, rest = __rest(_a, ["_kind"]);
                    return rest;
                }));
            }
            catch (_d) {
                if (!isActive)
                    return;
                setTrackEvents([]);
                setFieldEvents([]);
            }
            finally {
                if (isActive) {
                    setIsDisciplinesLoading(false);
                    setHasLoadedDisciplines(true);
                }
            }
        });
        loadDisciplines();
        return () => {
            isActive = false;
        };
    }, [apiAccessToken, competitionFocusId, competitionType, isRoadTrailCompetition, resolvedEventId, t, toAbsoluteUrl, withAccessToken]);
    useEffect(() => {
        if (!isRoadTrailCompetition)
            return;
        if (!apiAccessToken)
            return;
        if (courseOptions.length === 0)
            return;
        const current = courseOptions.find((course) => course.id === selectedCourseId);
        if (!current || (current.checkpoints && current.checkpoints.length > 0))
            return;
        let isActive = true;
        const loadCheckpoints = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const res = yield getCompetitionMapById(apiAccessToken, current.id);
                if (!isActive)
                    return;
                setCourseOptions((prev) => prev.map((course) => {
                    var _a, _b, _c, _d;
                    return course.id === current.id
                        ? Object.assign(Object.assign({}, course), { imageUrl: (_c = withAccessToken(toAbsoluteUrl((_b = (_a = res.map.image_url) !== null && _a !== void 0 ? _a : res.map.storage_key) !== null && _b !== void 0 ? _b : null))) !== null && _c !== void 0 ? _c : course.imageUrl, checkpoints: ((_d = res.checkpoints) !== null && _d !== void 0 ? _d : []).map((cp) => {
                                var _a;
                                return ({
                                    id: cp.id,
                                    label: (_a = cp.label) !== null && _a !== void 0 ? _a : `Checkpoint ${cp.checkpoint_index}`,
                                });
                            }) }) : course;
                }));
            }
            catch (_a) {
                // silent fallback
            }
        });
        loadCheckpoints();
        return () => {
            isActive = false;
        };
    }, [apiAccessToken, courseOptions, isRoadTrailCompetition, selectedCourseId, toAbsoluteUrl, withAccessToken]);
    const renderEventCard = (event) => {
        var _a;
        return (_jsxs(TouchableOpacity, Object.assign({ style: styles.eventCard, onPress: () => navigation.navigate('EventDivisionScreen', {
                eventName: event.name,
                competitionName,
                eventId: eventId !== null && eventId !== void 0 ? eventId : competitionId,
                competitionId: competitionId !== null && competitionId !== void 0 ? competitionId : eventId,
                disciplineId: String(event.id),
            }) }, { children: [_jsxs(View, Object.assign({ style: styles.eventCardLeft }, { children: [event.thumbnailUrl ? (_jsx(Image, { source: { uri: event.thumbnailUrl }, style: styles.eventThumbnail })) : (_jsx(View, { style: [styles.eventThumbnail, styles.eventThumbnailFallback] })), _jsx(Text, Object.assign({ style: styles.eventCardName }, { children: event.name }))] })), _jsxs(View, Object.assign({ style: styles.eventCardRight }, { children: [(_a = event.badges) === null || _a === void 0 ? void 0 : _a.map((badge, index) => (_jsx(View, Object.assign({ style: styles.badge }, { children: _jsx(Text, Object.assign({ style: styles.badgeText }, { children: badge })) }), index))), event.hasArrow && (_jsx(ArrowRight, { size: 20, color: "#9B9F9F", variant: "Linear" }))] }))] }), event.id));
    };
    const handleCheckpointPress = (checkpoint) => {
        setSelectedCheckpoint(checkpoint);
        setCheckpointModalVisible(true);
    };
    const resolveEventId = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        if (eventId)
            return String(eventId);
        if (!apiAccessToken)
            return null;
        try {
            const res = yield searchEvents(apiAccessToken, { q: competitionName, limit: 1 });
            const first = Array.isArray(res === null || res === void 0 ? void 0 : res.events) ? res.events[0] : null;
            return (first === null || first === void 0 ? void 0 : first.event_id) ? String(first.event_id) : null;
        }
        catch (_2) {
            return null;
        }
    }), [apiAccessToken, competitionName, eventId]);
    const startFaceRegistrationFlow = useCallback(() => {
        setAiCompareModalVisible(false);
        navigation.navigate('SearchFaceCaptureScreen', {
            mode: 'enrolFace',
            afterEnroll: { screen: 'AISearchScreen' },
        });
    }, [navigation]);
    const runQuickCompare = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _3, _4, _5, _6, _7, _8, _9, _10, _11, _12;
        if (!apiAccessToken) {
            setQuickSearchError(t('Missing API token. Please log in again.'));
            return;
        }
        const resolvedId = yield resolveEventId();
        if (!resolvedId) {
            setQuickSearchError(t('Could not resolve this competition.'));
            return;
        }
        const bibValue = String((_3 = (quickUseDefaultChest ? defaultChestNumber : quickChestNumber)) !== null && _3 !== void 0 ? _3 : '').trim();
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
        const collected = [];
        const seen = new Set();
        const addResults = (items, matchType) => {
            var _a, _b;
            for (const item of items) {
                const id = String((_b = (_a = item.media_id) !== null && _a !== void 0 ? _a : item.id) !== null && _b !== void 0 ? _b : '');
                if (!id || seen.has(id))
                    continue;
                seen.add(id);
                collected.push(Object.assign(Object.assign({}, item), { event_id: resolvedId, event_name: competitionName, match_type: matchType }));
            }
        };
        const errors = [];
        try {
            if (wantsBib) {
                try {
                    const res = yield searchMediaByBib(apiAccessToken, { event_id: resolvedId, bib: bibValue });
                    const results = Array.isArray(res === null || res === void 0 ? void 0 : res.results) ? res.results : [];
                    addResults(results, 'bib');
                }
                catch (e) {
                    const msg = e instanceof ApiError ? e.message : String((_4 = e === null || e === void 0 ? void 0 : e.message) !== null && _4 !== void 0 ? _4 : e);
                    errors.push(`${t('Chest number')}: ${msg}`);
                }
            }
            if (wantsFace) {
                try {
                    const res = yield searchFaceByEnrollment(apiAccessToken, {
                        event_ids: [resolvedId],
                        label: 'default',
                        limit: 600,
                        top: 100,
                        save: true,
                    });
                    const results = Array.isArray(res === null || res === void 0 ? void 0 : res.results) ? res.results : [];
                    addResults(results, 'face');
                }
                catch (e) {
                    if (e instanceof ApiError) {
                        const body = (_5 = e.body) !== null && _5 !== void 0 ? _5 : {};
                        if (e.status === 403 && String(e.message).toLowerCase().includes('consent')) {
                            setQuickNeedsConsent(true);
                            errors.push(t('Face: consent required.'));
                        }
                        else if (e.status === 400 && Array.isArray(body === null || body === void 0 ? void 0 : body.missing_angles)) {
                            setQuickMissingAngles(body.missing_angles.map(String));
                            errors.push(t('Face: enrollment required.'));
                            Alert.alert(t('Face setup required'), t('Set up your face scan to use face recognition for this competition.'), [
                                { text: t('Cancel'), style: 'cancel' },
                                { text: t('Set up face'), onPress: startFaceRegistrationFlow },
                            ]);
                            return;
                        }
                        else {
                            errors.push(`${t('Face')}: ${e.message}`);
                        }
                    }
                    else {
                        errors.push(`${t('Face')}: ${String((_6 = e === null || e === void 0 ? void 0 : e.message) !== null && _6 !== void 0 ? _6 : e)}`);
                    }
                }
            }
            if (collected.length === 0) {
                setQuickSearchError((_7 = errors[0]) !== null && _7 !== void 0 ? _7 : t('No matches found.'));
                return;
            }
            setAiCompareModalVisible(false);
            navigation.navigate('AISearchResultsScreen', {
                matchedCount: collected.length,
                results: collected,
                matchType: 'combined',
                refineContext: {
                    bib: bibValue || undefined,
                    discipline: (selectedCourse === null || selectedCourse === void 0 ? void 0 : selectedCourse.label) || undefined,
                    checkpoint: (selectedCheckpoint === null || selectedCheckpoint === void 0 ? void 0 : selectedCheckpoint.label) || undefined,
                    date: competitionDate || undefined,
                },
                manualBrowse: {
                    eventId: eventId !== null && eventId !== void 0 ? eventId : competitionId,
                    competitionId: competitionId !== null && competitionId !== void 0 ? competitionId : eventId,
                    eventName: competitionName,
                    eventDate: competitionDate || undefined,
                    disciplineId: (_9 = (_8 = selectedCourse === null || selectedCourse === void 0 ? void 0 : selectedCourse.disciplineId) !== null && _8 !== void 0 ? _8 : selectedCourse === null || selectedCourse === void 0 ? void 0 : selectedCourse.id) !== null && _9 !== void 0 ? _9 : null,
                    disciplineLabel: (_10 = selectedCourse === null || selectedCourse === void 0 ? void 0 : selectedCourse.label) !== null && _10 !== void 0 ? _10 : null,
                    checkpointId: (_11 = selectedCheckpoint === null || selectedCheckpoint === void 0 ? void 0 : selectedCheckpoint.id) !== null && _11 !== void 0 ? _11 : null,
                    checkpointLabel: (_12 = selectedCheckpoint === null || selectedCheckpoint === void 0 ? void 0 : selectedCheckpoint.label) !== null && _12 !== void 0 ? _12 : null,
                },
            });
        }
        finally {
            setQuickSearchLoading(false);
        }
    }), [apiAccessToken, competitionDate, competitionId, competitionName, defaultChestNumber, eventId, navigation, quickChestNumber, quickUseDefaultChest, quickUseFace, resolveEventId, selectedCheckpoint === null || selectedCheckpoint === void 0 ? void 0 : selectedCheckpoint.id, selectedCheckpoint === null || selectedCheckpoint === void 0 ? void 0 : selectedCheckpoint.label, selectedCourse === null || selectedCourse === void 0 ? void 0 : selectedCourse.disciplineId, selectedCourse === null || selectedCourse === void 0 ? void 0 : selectedCourse.id, selectedCourse === null || selectedCourse === void 0 ? void 0 : selectedCourse.label, startFaceRegistrationFlow, t]);
    const handleGrantConsent = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _13;
        if (!apiAccessToken)
            return;
        setQuickSearchError(null);
        try {
            yield grantFaceRecognitionConsent(apiAccessToken);
            setQuickNeedsConsent(false);
        }
        catch (e) {
            const msg = e instanceof ApiError ? e.message : String((_13 = e === null || e === void 0 ? void 0 : e.message) !== null && _13 !== void 0 ? _13 : e);
            setQuickSearchError(msg);
        }
    }), [apiAccessToken]);
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
    const refreshProfileFaceState = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _14, _15;
        if (!apiAccessToken) {
            return {
                hasFaceEnrollment: Boolean(userProfile === null || userProfile === void 0 ? void 0 : userProfile.faceVerified),
                faceConsentGranted: Boolean(userProfile === null || userProfile === void 0 ? void 0 : userProfile.faceConsentGranted),
            };
        }
        try {
            const summary = yield getProfileSummary(apiAccessToken);
            const nextHasFaceEnrollment = Boolean((_14 = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _14 === void 0 ? void 0 : _14.face_verified);
            const nextFaceConsentGranted = Boolean((_15 = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _15 === void 0 ? void 0 : _15.face_consent_granted);
            setProfileFaceVerified(nextHasFaceEnrollment);
            setProfileFaceConsentGranted(nextFaceConsentGranted);
            return {
                hasFaceEnrollment: nextHasFaceEnrollment,
                faceConsentGranted: nextFaceConsentGranted,
            };
        }
        catch (_16) {
            return {
                hasFaceEnrollment: profileFaceVerified !== null && profileFaceVerified !== void 0 ? profileFaceVerified : Boolean(userProfile === null || userProfile === void 0 ? void 0 : userProfile.faceVerified),
                faceConsentGranted: profileFaceConsentGranted !== null && profileFaceConsentGranted !== void 0 ? profileFaceConsentGranted : Boolean(userProfile === null || userProfile === void 0 ? void 0 : userProfile.faceConsentGranted),
            };
        }
    }), [apiAccessToken, profileFaceConsentGranted, profileFaceVerified, userProfile]);
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
    const handleSubscribeFaceToggle = useCallback((nextValue) => __awaiter(void 0, void 0, void 0, function* () {
        var _17;
        if (!nextValue) {
            setSubscribeUseFace(false);
            return;
        }
        if (!apiAccessToken) {
            Alert.alert(t('Missing API token'), t('Log in again to enable face recognition.'));
            return;
        }
        if (!resolvedEventId) {
            const latest = yield refreshProfileFaceState();
            if (latest.hasFaceEnrollment && latest.faceConsentGranted) {
                setSubscribeUseFace(true);
                return;
            }
            Alert.alert(t('Select competition'), t('Pick a competition first, then enable face recognition.'));
            return;
        }
        try {
            yield searchFaceByEnrollment(apiAccessToken, {
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
        }
        catch (e) {
            if (e instanceof ApiError) {
                const body = (_17 = e.body) !== null && _17 !== void 0 ? _17 : {};
                if (e.status === 403 && String(e.message).toLowerCase().includes('consent')) {
                    setProfileFaceVerified(true);
                    setProfileFaceConsentGranted(false);
                    Alert.alert(t('Face recognition consent'), t('Allow face recognition for this competition?'), [
                        { text: t('Cancel'), style: 'cancel' },
                        {
                            text: t('Allow'),
                            onPress: () => __awaiter(void 0, void 0, void 0, function* () {
                                var _18;
                                try {
                                    yield grantFaceRecognitionConsent(apiAccessToken);
                                    setProfileFaceConsentGranted(true);
                                    const latest = yield refreshProfileFaceState();
                                    if (latest.hasFaceEnrollment) {
                                        setSubscribeUseFace(true);
                                        return;
                                    }
                                    setSubscribeUseFace(false);
                                    Alert.alert(t('Face setup required'), t('Set up your face scan to use face recognition for this competition.'), [
                                        { text: t('Cancel'), style: 'cancel' },
                                        { text: t('Set up face'), onPress: startSubscriptionFaceEnrollment },
                                    ]);
                                }
                                catch (consentError) {
                                    const msg = consentError instanceof ApiError ? consentError.message : String((_18 = consentError === null || consentError === void 0 ? void 0 : consentError.message) !== null && _18 !== void 0 ? _18 : consentError);
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
                        { text: t('Set up face'), onPress: startSubscriptionFaceEnrollment },
                    ]);
                    return;
                }
            }
        }
        const latest = yield refreshProfileFaceState();
        if (latest.hasFaceEnrollment && latest.faceConsentGranted) {
            setSubscribeUseFace(true);
            return;
        }
        if (latest.faceConsentGranted) {
            Alert.alert(t('Face setup required'), t('Set up your face scan to use face recognition for this competition.'), [
                { text: t('Cancel'), style: 'cancel' },
                { text: t('Set up face'), onPress: startSubscriptionFaceEnrollment },
            ]);
            return;
        }
        Alert.alert(t('Face recognition consent'), t('Before face setup, please confirm consent for face recognition.'), [
            { text: t('Cancel'), style: 'cancel' },
            {
                text: t('Continue'),
                onPress: () => __awaiter(void 0, void 0, void 0, function* () {
                    var _19;
                    try {
                        yield grantFaceRecognitionConsent(apiAccessToken);
                        setProfileFaceConsentGranted(true);
                        startSubscriptionFaceEnrollment();
                    }
                    catch (consentError) {
                        const msg = consentError instanceof ApiError ? consentError.message : String((_19 = consentError === null || consentError === void 0 ? void 0 : consentError.message) !== null && _19 !== void 0 ? _19 : consentError);
                        Alert.alert(t('Consent failed'), msg);
                    }
                }),
            },
        ]);
    }), [apiAccessToken, refreshProfileFaceState, resolvedEventId, startSubscriptionFaceEnrollment, t]);
    const handleOpenSubscriptionSummary = useCallback(() => {
        var _a, _b;
        if (!canSubscribe || !resolvedEventId)
            return;
        const safeChestNumber = /^\d+$/.test(activeSubscriptionChestNumber) ? activeSubscriptionChestNumber : '';
        closeSubscribeSheet();
        navigation.navigate('EventSummaryScreen', {
            mode: 'eventSubscription',
            subscription: {
                eventId: resolvedEventId,
                eventTitle: competitionName,
                eventDate: (_b = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.date) !== null && _b !== void 0 ? _b : competitionDate,
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
        (_1 = route === null || route === void 0 ? void 0 : route.params) === null || _1 === void 0 ? void 0 : _1.date,
        selectedSubscriptionDisciplineLabels,
        subscribeUseFace,
    ]);
    const handleSubscriptionToggle = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        if (!apiAccessToken || !canSubscribe || isSubscriptionLoading)
            return;
        if (isSubscribed) {
            Alert.alert(t('Subscribed'), t('Turn off competition updates for this event?'), [
                { text: t('Cancel'), style: 'cancel' },
                {
                    text: t('Unsubscribe'),
                    style: 'destructive',
                    onPress: () => __awaiter(void 0, void 0, void 0, function* () {
                        var _20;
                        setIsSubscriptionLoading(true);
                        try {
                            yield unsubscribeToEvent(apiAccessToken, resolvedEventId);
                            yield refreshSubscribed();
                        }
                        catch (e) {
                            const msg = e instanceof ApiError ? e.message : String((_20 = e === null || e === void 0 ? void 0 : e.message) !== null && _20 !== void 0 ? _20 : e);
                            Alert.alert(t('Could not unsubscribe'), msg);
                        }
                        finally {
                            setIsSubscriptionLoading(false);
                        }
                    }),
                },
            ]);
            return;
        }
        openSubscribeSheet();
    }), [apiAccessToken, canSubscribe, isSubscribed, isSubscriptionLoading, openSubscribeSheet, refreshSubscribed, resolvedEventId, t]);
    const subscriptionButtonLabel = isSubscriptionLoading
        ? t('Loading...')
        : isSubscribed
            ? t('Subscribed')
            : t('Subscribe');
    const subscriptionButtonHint = isSubscribed
        ? t('Competition updates are enabled for this event.')
        : t('Choose disciplines, category, and optional chest number or Face ID for this competition.');
    const renderMediaSection = () => (_jsxs(_Fragment, { children: [_jsx(SizeBox, { height: 24 }), _jsx(Text, Object.assign({ style: styles.sectionTitle }, { children: t('Media') })), _jsx(SizeBox, { height: 12 }), _jsxs(View, Object.assign({ style: styles.mediaShowcaseCard }, { children: [_jsxs(View, Object.assign({ style: styles.mediaShowcaseHead }, { children: [_jsx(Text, Object.assign({ style: styles.mediaShowcaseTitle }, { children: t('All Videos') })), _jsx(View, Object.assign({ style: styles.mediaShowcaseTag }, { children: _jsx(Text, Object.assign({ style: styles.mediaShowcaseTagText }, { children: t('Untagged included') })) }))] })), _jsx(Text, Object.assign({ style: styles.mediaShowcaseDescription }, { children: t('Shows every uploaded video for this competition, even if not tagged to a discipline.') })), _jsxs(TouchableOpacity, Object.assign({ style: styles.showAllButton, onPress: () => navigation.navigate('AllVideosOfEvents', {
                            eventName: competitionName,
                            eventId: eventId !== null && eventId !== void 0 ? eventId : competitionId,
                            competitionId: competitionId !== null && competitionId !== void 0 ? competitionId : eventId,
                        }) }, { children: [_jsx(Text, Object.assign({ style: styles.showAllButtonText }, { children: t('Show All Videos') })), _jsx(ArrowRight, { size: 18, color: colors.pureWhite, variant: "Linear" })] }))] })), _jsx(SizeBox, { height: 18 }), _jsxs(View, Object.assign({ style: styles.mediaShowcaseCard }, { children: [_jsxs(View, Object.assign({ style: styles.mediaShowcaseHead }, { children: [_jsx(Text, Object.assign({ style: styles.mediaShowcaseTitle }, { children: t('All Photos') })), _jsx(View, Object.assign({ style: styles.mediaShowcaseTag }, { children: _jsx(Text, Object.assign({ style: styles.mediaShowcaseTagText }, { children: t('Untagged included') })) }))] })), _jsx(Text, Object.assign({ style: styles.mediaShowcaseDescription }, { children: t('Shows every uploaded photo for this competition, including untagged uploads.') })), _jsxs(TouchableOpacity, Object.assign({ style: styles.showAllPhotosButton, onPress: () => navigation.navigate('AllPhotosOfEvents', {
                            eventName: competitionName,
                            eventId: eventId !== null && eventId !== void 0 ? eventId : competitionId,
                            competitionId: competitionId !== null && competitionId !== void 0 ? competitionId : eventId,
                        }) }, { children: [_jsx(Text, Object.assign({ style: styles.showAllPhotosButtonText }, { children: t('Show All Photos') })), _jsx(ArrowRight, { size: 18, color: colors.primaryColor, variant: "Linear" })] }))] }))] }));
    return (_jsxs(View, Object.assign({ style: styles.mainContainer, testID: "competition-details-screen" }, { children: [_jsx(E2EPerfReady, { screen: "competition", ready: perfReady, startedAtMs: perfStartedAtRef.current }), _jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: styles.headerTitle, numberOfLines: 1 }, { children: competitionName })), _jsx(View, { style: { width: 44, height: 44 } })] })), _jsxs(ScrollView, Object.assign({ style: styles.content, showsVerticalScrollIndicator: false }, { children: [_jsxs(View, Object.assign({ style: styles.competitionMetaCard }, { children: [_jsx(Text, Object.assign({ style: styles.competitionDescription }, { children: competitionMetaLine || t('Competition details') })), organizingClub ? (_jsx(Text, Object.assign({ style: styles.competitionMetaText, numberOfLines: 1 }, { children: organizingClub }))) : null] })), canSubscribe ? (_jsxs(_Fragment, { children: [_jsx(SizeBox, { height: 12 }), _jsx(TouchableOpacity, Object.assign({ style: [
                                    styles.subscribeButton,
                                    isSubscribed && styles.subscribeButtonActive,
                                    isSubscriptionLoading && styles.subscribeButtonDisabled,
                                ], onPress: handleSubscriptionToggle, disabled: isSubscriptionLoading }, { children: isSubscriptionLoading ? (_jsx(ActivityIndicator, { color: colors.pureWhite })) : (_jsxs(_Fragment, { children: [_jsxs(View, Object.assign({ style: styles.subscribeButtonContent }, { children: [_jsx(Text, Object.assign({ style: styles.subscribeButtonText }, { children: subscriptionButtonLabel })), _jsx(Text, Object.assign({ style: styles.subscribeButtonHint }, { children: subscriptionButtonHint }))] })), _jsx(View, Object.assign({ style: styles.subscribeChevronWrap }, { children: _jsx(ArrowRight, { size: 18, color: colors.pureWhite, variant: "Linear" }) }))] })) }))] })) : null, _jsx(SizeBox, { height: 20 }), showCoursesSection ? (_jsxs(_Fragment, { children: [_jsx(Text, Object.assign({ style: styles.sectionTitle }, { children: t('Courses') })), _jsx(SizeBox, { height: 12 }), isMapLoading || !hasLoadedMaps ? (_jsxs(View, Object.assign({ style: styles.emptyState }, { children: [_jsx(ActivityIndicator, { color: colors.primaryColor }), _jsx(SizeBox, { height: 8 }), _jsx(Text, Object.assign({ style: styles.emptyStateText }, { children: t('Loading course maps...') }))] }))) : visibleCourses.length === 0 ? (_jsx(View, Object.assign({ style: styles.emptyState }, { children: _jsx(Text, Object.assign({ style: styles.emptyStateText }, { children: t('No courses available yet.') })) }))) : (_jsxs(_Fragment, { children: [_jsx(View, Object.assign({ style: styles.courseList }, { children: visibleCourses.map((course) => {
                                            const isActive = course.id === (selectedCourse === null || selectedCourse === void 0 ? void 0 : selectedCourse.id);
                                            return (_jsxs(TouchableOpacity, Object.assign({ style: [styles.courseCard, isActive && styles.courseCardActive], onPress: () => setSelectedCourseId(course.id) }, { children: [_jsx(Text, Object.assign({ style: [styles.courseTitle, isActive && styles.courseTitleActive] }, { children: course.label })), _jsx(Text, Object.assign({ style: [styles.courseDescription, isActive && styles.courseDescriptionActive] }, { children: course.description }))] }), course.id));
                                        }) })), _jsx(SizeBox, { height: 20 }), _jsx(Text, Object.assign({ style: styles.sectionTitle }, { children: t('Course map') })), _jsx(SizeBox, { height: 12 }), _jsx(View, Object.assign({ style: styles.mapCard }, { children: hasSelectedCourseMap ? (_jsx(Image, { source: { uri: String(selectedCourse === null || selectedCourse === void 0 ? void 0 : selectedCourse.imageUrl) }, style: styles.mapImage, resizeMode: "cover", onError: () => setMapLoadFailed(true) })) : (_jsxs(View, Object.assign({ style: styles.mapEmptyState }, { children: [_jsx(Text, Object.assign({ style: styles.mapEmptyTitle }, { children: t('No map uploaded for this course yet.') })), _jsx(Text, Object.assign({ style: styles.mapEmptySubtitle }, { children: t('Upload a course map to display it here.') }))] }))) })), mapError && (_jsxs(_Fragment, { children: [_jsx(SizeBox, { height: 8 }), _jsx(Text, Object.assign({ style: styles.helperText }, { children: t('Map data unavailable for this competition.') }))] })), _jsx(SizeBox, { height: 16 }), _jsx(Text, Object.assign({ style: styles.sectionTitle }, { children: t('Checkpoints') })), _jsx(SizeBox, { height: 10 }), _jsx(ScrollView, Object.assign({ horizontal: true, showsHorizontalScrollIndicator: false }, { children: selectedCourse === null || selectedCourse === void 0 ? void 0 : selectedCourse.checkpoints.map((checkpoint) => (_jsx(TouchableOpacity, Object.assign({ style: styles.checkpointChip, onPress: () => handleCheckpointPress(checkpoint) }, { children: _jsx(Text, Object.assign({ style: styles.checkpointChipText }, { children: checkpoint.label })) }), checkpoint.id))) })), _jsx(SizeBox, { height: 8 }), _jsx(Text, Object.assign({ style: styles.helperText }, { children: t('Tap a checkpoint to search photos, videos, or AI.') })), renderMediaSection()] })), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 80 : 100 })] })) : (_jsxs(_Fragment, { children: [isTrackFieldCompetition ? (_jsxs(_Fragment, { children: [_jsxs(View, Object.assign({ style: styles.tabsContainer }, { children: [_jsxs(TouchableOpacity, Object.assign({ style: [styles.tab, selectedTab === 'track' && styles.tabActive], onPress: () => setSelectedTab('track') }, { children: [_jsx(Text, Object.assign({ style: [styles.tabText, selectedTab === 'track' && styles.tabTextActive] }, { children: t('Track events') })), _jsx(ArrowRight, { size: 16, color: selectedTab === 'track' ? colors.mainTextColor : colors.subTextColor, variant: "Linear" })] })), _jsxs(TouchableOpacity, Object.assign({ style: [styles.tab, selectedTab === 'field' && styles.tabActive], onPress: () => setSelectedTab('field') }, { children: [_jsx(Text, Object.assign({ style: [styles.tabText, selectedTab === 'field' && styles.tabTextActive] }, { children: t('Field events') })), _jsx(ArrowRight, { size: 16, color: selectedTab === 'field' ? colors.mainTextColor : colors.subTextColor, variant: "Linear" })] }))] })), _jsx(SizeBox, { height: 20 })] })) : null, _jsxs(View, Object.assign({ style: styles.sectionHeader }, { children: [_jsx(Text, Object.assign({ style: styles.sectionTitle }, { children: t('Disciplines') })), _jsxs(TouchableOpacity, Object.assign({ style: styles.aiActionButton, onPress: () => {
                                            setQuickUseDefaultChest(false);
                                            setQuickSearchError(null);
                                            setQuickNeedsConsent(false);
                                            setQuickMissingAngles(null);
                                            setAiCompareModalVisible(true);
                                        } }, { children: [_jsx(Icons.AiWhiteBordered, { width: 18, height: 18 }), _jsx(Text, Object.assign({ style: styles.aiActionButtonText }, { children: t('AI Search') }))] }))] })), _jsx(SizeBox, { height: 16 }), !hasLoadedDisciplines || isDisciplinesLoading ? (_jsxs(View, Object.assign({ style: styles.emptyState }, { children: [_jsx(ActivityIndicator, { color: colors.primaryColor }), _jsx(SizeBox, { height: 8 }), _jsx(Text, Object.assign({ style: styles.emptyStateText }, { children: t('Loading events...') }))] }))) : currentEvents.length > 0 ? currentEvents.map(renderEventCard) : (_jsx(View, Object.assign({ style: styles.emptyState }, { children: _jsx(Text, Object.assign({ style: styles.emptyStateText }, { children: t('No events available yet.') })) }))), renderMediaSection(), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 100 : 120 })] }))] })), _jsx(Modal, Object.assign({ visible: checkpointModalVisible, transparent: true, animationType: "fade", onRequestClose: () => setCheckpointModalVisible(false) }, { children: _jsx(TouchableOpacity, Object.assign({ style: styles.modalOverlay, activeOpacity: 1, onPress: () => setCheckpointModalVisible(false) }, { children: _jsxs(TouchableOpacity, Object.assign({ style: styles.checkpointModal, activeOpacity: 1 }, { children: [_jsxs(Text, Object.assign({ style: styles.modalTitle }, { children: [t('Search'), " ", selectedCheckpoint === null || selectedCheckpoint === void 0 ? void 0 : selectedCheckpoint.label] })), _jsx(SizeBox, { height: 16 }), _jsxs(TouchableOpacity, Object.assign({ style: styles.modalPrimaryButton, onPress: () => {
                                    var _a;
                                    setCheckpointModalVisible(false);
                                    navigation.navigate('AllPhotosOfEvents', {
                                        checkpoint: selectedCheckpoint,
                                        checkpointId: selectedCheckpoint === null || selectedCheckpoint === void 0 ? void 0 : selectedCheckpoint.id,
                                        disciplineId: (_a = selectedCourse === null || selectedCourse === void 0 ? void 0 : selectedCourse.disciplineId) !== null && _a !== void 0 ? _a : selectedCourse === null || selectedCourse === void 0 ? void 0 : selectedCourse.id,
                                        eventId: eventId !== null && eventId !== void 0 ? eventId : competitionId,
                                        competitionId: competitionId !== null && competitionId !== void 0 ? competitionId : eventId,
                                        eventName: competitionName,
                                    });
                                } }, { children: [_jsx(Text, Object.assign({ style: styles.modalPrimaryButtonText }, { children: t('Search Photos') })), _jsx(ArrowRight, { size: 18, color: colors.pureWhite, variant: "Linear" })] })), _jsx(SizeBox, { height: 12 }), _jsxs(TouchableOpacity, Object.assign({ style: styles.modalSecondaryButton, onPress: () => {
                                    var _a;
                                    setCheckpointModalVisible(false);
                                    navigation.navigate('VideosForEvent', {
                                        eventName: competitionName,
                                        eventId: eventId !== null && eventId !== void 0 ? eventId : competitionId,
                                        competitionId: competitionId !== null && competitionId !== void 0 ? competitionId : eventId,
                                        checkpoint: selectedCheckpoint,
                                        checkpointId: selectedCheckpoint === null || selectedCheckpoint === void 0 ? void 0 : selectedCheckpoint.id,
                                        disciplineId: (_a = selectedCourse === null || selectedCourse === void 0 ? void 0 : selectedCourse.disciplineId) !== null && _a !== void 0 ? _a : selectedCourse === null || selectedCourse === void 0 ? void 0 : selectedCourse.id,
                                    });
                                } }, { children: [_jsx(Text, Object.assign({ style: styles.modalSecondaryButtonText }, { children: t('Search Videos') })), _jsx(ArrowRight, { size: 18, color: colors.primaryColor, variant: "Linear" })] })), _jsx(SizeBox, { height: 12 }), _jsxs(TouchableOpacity, Object.assign({ style: styles.modalTertiaryButton, onPress: () => {
                                    setCheckpointModalVisible(false);
                                    setQuickUseDefaultChest(false);
                                    setQuickSearchError(null);
                                    setQuickNeedsConsent(false);
                                    setQuickMissingAngles(null);
                                    setAiCompareModalVisible(true);
                                } }, { children: [_jsx(Text, Object.assign({ style: styles.modalTertiaryButtonText }, { children: t('AI Search') })), _jsx(ArrowRight, { size: 18, color: colors.primaryColor, variant: "Linear" })] }))] })) })) })), _jsx(Modal, Object.assign({ visible: aiCompareModalVisible, transparent: true, animationType: "fade", onRequestClose: () => setAiCompareModalVisible(false) }, { children: _jsx(TouchableOpacity, Object.assign({ style: styles.modalOverlay, activeOpacity: 1, onPress: () => setAiCompareModalVisible(false) }, { children: _jsxs(TouchableOpacity, Object.assign({ style: styles.checkpointModal, activeOpacity: 1 }, { children: [_jsx(Text, Object.assign({ style: styles.modalTitle }, { children: t('AI quick compare') })), _jsx(SizeBox, { height: 12 }), _jsx(Text, Object.assign({ style: styles.helperText }, { children: t('Use your chest number and optionally Face ID to find results in this competition.') })), _jsx(SizeBox, { height: 16 }), _jsx(Text, Object.assign({ style: styles.modalLabel }, { children: t('Chest number') })), !quickUseDefaultChest || !defaultChestNumber ? (_jsx(UnifiedSearchInput, { containerStyle: styles.modalInputRow, inputStyle: styles.modalInput, placeholder: t('e.g. 1234'), placeholderTextColor: "#9B9F9F", keyboardType: "number-pad", value: quickChestNumber, onChangeText: setQuickChestNumber })) : null, _jsxs(View, Object.assign({ style: styles.toggleRow }, { children: [_jsxs(View, Object.assign({ style: { flex: 1, paddingRight: 12 } }, { children: [_jsx(Text, Object.assign({ style: styles.toggleLabel }, { children: t('Use saved chest number') })), _jsx(Text, Object.assign({ style: styles.toggleHint }, { children: defaultChestNumber
                                                    ? `${defaultChestNumber} · ${competitionYear}`
                                                    : t('No saved chest number yet. Enter the chest number for this competition below.') }))] })), _jsx(Switch, { value: quickUseDefaultChest, onValueChange: setQuickUseDefaultChest, disabled: !defaultChestNumber, trackColor: { false: colors.lightGrayColor, true: colors.primaryColor }, thumbColor: colors.pureWhite })] })), _jsx(SizeBox, { height: 12 }), _jsx(Text, Object.assign({ style: styles.modalLabel }, { children: t('Face ID') })), _jsxs(View, Object.assign({ style: styles.toggleRow }, { children: [_jsxs(View, { children: [_jsx(Text, Object.assign({ style: styles.toggleLabel }, { children: t('Use Face ID') })), _jsx(Text, Object.assign({ style: styles.toggleHint }, { children: t('Match your enrolled face in this competition') }))] }), _jsx(Switch, { value: quickUseFace, onValueChange: setQuickUseFace, trackColor: { false: colors.lightGrayColor, true: colors.primaryColor }, thumbColor: colors.pureWhite })] })), quickSearchError ? (_jsxs(_Fragment, { children: [_jsx(SizeBox, { height: 10 }), _jsx(Text, Object.assign({ style: styles.modalErrorText }, { children: quickSearchError }))] })) : null, quickUseFace && quickNeedsConsent && (_jsxs(_Fragment, { children: [_jsx(SizeBox, { height: 10 }), _jsx(TouchableOpacity, Object.assign({ style: styles.modalSecondaryButton, onPress: handleGrantConsent }, { children: _jsx(Text, Object.assign({ style: styles.modalSecondaryButtonText }, { children: t('Grant face consent') })) }))] })), quickUseFace && quickMissingAngles && (_jsxs(_Fragment, { children: [_jsx(SizeBox, { height: 10 }), _jsx(TouchableOpacity, Object.assign({ style: styles.modalSecondaryButton, onPress: handleEnroll }, { children: _jsx(Text, Object.assign({ style: styles.modalSecondaryButtonText }, { children: t('Enroll your face') })) }))] })), _jsx(SizeBox, { height: 16 }), _jsx(TouchableOpacity, Object.assign({ style: [styles.modalPrimaryButton, quickSearchLoading && styles.modalPrimaryButtonDisabled], onPress: runQuickCompare, disabled: quickSearchLoading }, { children: quickSearchLoading ? (_jsx(ActivityIndicator, { color: colors.pureWhite })) : (_jsxs(_Fragment, { children: [_jsx(Text, Object.assign({ style: styles.modalPrimaryButtonText }, { children: t('Compare now') })), _jsx(ArrowRight, { size: 18, color: colors.pureWhite, variant: "Linear" })] })) })), _jsx(SizeBox, { height: 12 }), _jsx(TouchableOpacity, Object.assign({ style: styles.modalSecondaryButton, onPress: () => setAiCompareModalVisible(false) }, { children: _jsx(Text, Object.assign({ style: styles.modalSecondaryButtonText }, { children: t('Cancel') })) }))] })) })) })), _jsx(Modal, Object.assign({ visible: subscribeSheetVisible, transparent: true, animationType: "slide", onRequestClose: closeSubscribeSheet }, { children: _jsx(TouchableOpacity, Object.assign({ style: styles.feedbackOverlay, activeOpacity: 1, onPress: closeSubscribeSheet }, { children: _jsx(TouchableOpacity, Object.assign({ style: styles.feedbackSheet, activeOpacity: 1 }, { children: _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, contentContainerStyle: styles.feedbackScrollContent }, { children: [_jsx(Text, Object.assign({ style: styles.feedbackTitle }, { children: t('Subscribe') })), _jsx(Text, Object.assign({ style: styles.feedbackBody }, { children: t('Follow this competition to stay updated.') })), _jsx(View, Object.assign({ style: styles.modalChipsGrid }, { children: [
                                        { key: 0, label: t('disciplines') },
                                        { key: 1, label: t('Category') },
                                        { key: 2, label: `${t('Chest number')} + ${t('Face')}` },
                                    ].map((step) => {
                                        const isActive = subscribeStep === step.key;
                                        return (_jsx(View, Object.assign({ style: [styles.modalChip, isActive && styles.modalChipActive] }, { children: _jsx(Text, Object.assign({ style: [styles.modalChipText, isActive && styles.modalChipTextActive] }, { children: step.label })) }), `subscribe-step-${step.key}`));
                                    }) })), subscribeStep === 0 ? (_jsxs(View, Object.assign({ style: styles.feedbackSectionCard }, { children: [_jsx(Text, Object.assign({ style: styles.modalLabel }, { children: t('disciplines') })), _jsx(Text, Object.assign({ style: styles.feedbackSectionHint }, { children: t('Select specific disciplines, or keep All for the whole competition.') })), _jsx(View, Object.assign({ style: styles.modalChipsGrid }, { children: subscriptionDisciplineOptions.map((option) => {
                                                const isSelected = subscribeDisciplineIds.includes(option.id);
                                                return (_jsx(TouchableOpacity, Object.assign({ style: [styles.modalChip, isSelected && styles.modalChipActive], onPress: () => setSubscribeDisciplineIds((prev) => toggleSubscriptionDiscipline(prev, option.id)) }, { children: _jsx(Text, Object.assign({ style: [styles.modalChipText, isSelected && styles.modalChipTextActive] }, { children: option.id === SUBSCRIPTION_ALL_DISCIPLINE_ID ? t('all') : option.label })) }), `subscribe-discipline-${option.id}`));
                                            }) }))] }))) : null, subscribeStep === 1 ? (_jsxs(View, Object.assign({ style: styles.feedbackSectionCard }, { children: [_jsx(Text, Object.assign({ style: styles.modalLabel }, { children: t('Category') })), _jsx(Text, Object.assign({ style: styles.feedbackSectionHint }, { children: t('Choose the categories you want to follow, or keep All.') })), _jsx(View, Object.assign({ style: styles.modalChipsGrid }, { children: SUBSCRIPTION_CATEGORY_OPTIONS.map((item) => {
                                                const isSelected = normalizedSubscriptionCategories.includes(item);
                                                return (_jsx(TouchableOpacity, Object.assign({ style: [styles.modalChip, isSelected && styles.modalChipActive], onPress: () => setSubscribeCategoryLabels((prev) => toggleSubscriptionCategory(prev, item)) }, { children: _jsx(Text, Object.assign({ style: [styles.modalChipText, isSelected && styles.modalChipTextActive] }, { children: t(item === 'All' ? 'all' : item) })) }), `subscribe-category-${item}`));
                                            }) }))] }))) : null, subscribeStep === 2 ? (_jsxs(_Fragment, { children: [_jsxs(View, Object.assign({ style: styles.feedbackSectionCard }, { children: [_jsx(Text, Object.assign({ style: styles.modalLabel }, { children: t('Chest number') })), _jsx(Text, Object.assign({ style: styles.feedbackSectionHint }, { children: t('Chest number is optional. Leave it empty if you want all photos for this subscription.') })), !subscribeUseDefaultChest || !defaultChestNumber ? (_jsx(UnifiedSearchInput, { containerStyle: styles.modalInputRow, inputStyle: styles.modalInput, placeholder: t('enterChestNumber'), placeholderTextColor: "#9B9F9F", keyboardType: "number-pad", value: subscribeChestNumber, onChangeText: setSubscribeChestNumber })) : null, _jsxs(View, Object.assign({ style: styles.toggleRow }, { children: [_jsxs(View, Object.assign({ style: { flex: 1, paddingRight: 12 } }, { children: [_jsx(Text, Object.assign({ style: styles.toggleLabel }, { children: t('Use saved chest number') })), _jsx(Text, Object.assign({ style: styles.toggleHint }, { children: defaultChestNumber
                                                                        ? `${defaultChestNumber} · ${competitionYear}`
                                                                        : t('No saved chest number yet. Enter the chest number for this competition below.') }))] })), _jsx(Switch, { value: subscribeUseDefaultChest, onValueChange: setSubscribeUseDefaultChest, disabled: !defaultChestNumber, trackColor: { false: colors.lightGrayColor, true: colors.primaryColor }, thumbColor: colors.pureWhite })] }))] })), _jsxs(View, Object.assign({ style: styles.feedbackSectionCard }, { children: [_jsx(Text, Object.assign({ style: styles.modalLabel }, { children: t('Face') })), _jsxs(View, Object.assign({ style: styles.toggleRow }, { children: [_jsxs(View, Object.assign({ style: { flex: 1, paddingRight: 12 } }, { children: [_jsx(Text, Object.assign({ style: styles.toggleLabel }, { children: t('Allow face recognition for this competition') })), _jsx(Text, Object.assign({ style: styles.toggleHint }, { children: !hasFaceEnrollment
                                                                        ? t('Face: enrollment required.')
                                                                        : faceConsentGranted
                                                                            ? t('Enable this only if you want notifications narrowed to your face.')
                                                                            : t('Permission will be requested when you confirm.') }))] })), _jsx(Switch, { value: subscribeUseFace, onValueChange: handleSubscribeFaceToggle, trackColor: { false: colors.lightGrayColor, true: colors.primaryColor }, thumbColor: colors.pureWhite })] }))] }))] })) : null, _jsx(TouchableOpacity, Object.assign({ style: styles.modalPrimaryButton, onPress: () => {
                                        if (subscribeStep < 2) {
                                            setSubscribeStep((prev) => Math.min(2, prev + 1));
                                            return;
                                        }
                                        handleOpenSubscriptionSummary();
                                    }, testID: "competition-subscribe-confirm" }, { children: _jsxs(_Fragment, { children: [_jsx(Text, Object.assign({ style: styles.modalPrimaryButtonText }, { children: subscribeStep < 2 ? t('Next') : t('Review') })), _jsx(ArrowRight, { size: 18, color: colors.pureWhite, variant: "Linear" })] }) })), _jsx(TouchableOpacity, Object.assign({ style: styles.modalSecondaryButton, onPress: () => {
                                        if (subscribeStep === 0) {
                                            closeSubscribeSheet();
                                            return;
                                        }
                                        setSubscribeStep((prev) => Math.max(0, prev - 1));
                                    } }, { children: _jsx(Text, Object.assign({ style: styles.modalSecondaryButtonText }, { children: subscribeStep === 0 ? t('Cancel') : t('Back') })) }))] })) })) })) }))] })));
};
export default CompetitionDetailsScreen;
