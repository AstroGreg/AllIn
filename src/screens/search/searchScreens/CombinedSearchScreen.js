var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, InteractionManager, Modal, Text, TouchableOpacity, View, } from 'react-native';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { AddCircle, ArrowLeft2, CloseCircle, SearchNormal1, TickCircle } from 'iconsax-react-nativejs';
import KeyboardAvoidingContainer from '../../../components/KeyboardAvoidingContainer';
import CustomSwitch from '../../../components/customSwitch/CustomSwitch';
import { useAuth } from '../../../context/AuthContext';
import { ApiError, getProfileSummary, grantFaceRecognitionConsent, searchFaceByEnrollment, searchMediaByBib, searchObject, searchEvents, } from '../../../services/apiGateway';
import { createStyles } from './CombinedSearchScreenStyles';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import UnifiedSearchInput from '../../../components/unifiedSearchInput/UnifiedSearchInput';
const COMPETITION_AUTOLOAD_LIMIT = 3;
const COMPETITION_SEARCH_LIMIT = 60;
const CombinedSearchScreen = ({ navigation }) => {
    var _a, _b, _c, _d, _e, _f;
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const { apiAccessToken, userProfile } = useAuth();
    const route = useRoute();
    const origin = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.origin;
    const tutorialMode = Boolean((_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.tutorialMode);
    const preselectedEventsParam = useMemo(() => { var _a, _b; return (Array.isArray((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.preselectedEvents) ? (_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.preselectedEvents : []); }, [(_c = route === null || route === void 0 ? void 0 : route.params) === null || _c === void 0 ? void 0 : _c.preselectedEvents]);
    const prefillCompetitionName = (_d = route === null || route === void 0 ? void 0 : route.params) === null || _d === void 0 ? void 0 : _d.prefillCompetitionName;
    const autoCompare = Boolean((_e = route === null || route === void 0 ? void 0 : route.params) === null || _e === void 0 ? void 0 : _e.autoCompare);
    const resumeCombinedSearch = (_f = route === null || route === void 0 ? void 0 : route.params) === null || _f === void 0 ? void 0 : _f.resumeCombinedSearch;
    const [bib, setBib] = useState('');
    const [useDefaultBib, setUseDefaultBib] = useState(false);
    const [contextText, setContextText] = useState('');
    const [includeFace, setIncludeFace] = useState(false);
    const [selectedEvents, setSelectedEvents] = useState([]);
    const [showCompetitionModal, setShowCompetitionModal] = useState(false);
    const [competitionQuery, setCompetitionQuery] = useState('');
    const [eventOptions, setEventOptions] = useState([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);
    const [eventsError, setEventsError] = useState(null);
    const [competitionPrefetchReady, setCompetitionPrefetchReady] = useState(false);
    const [screenInteractionReady, setScreenInteractionReady] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [errorText, setErrorText] = useState(null);
    const [needsConsent, setNeedsConsent] = useState(false);
    const [missingAngles, setMissingAngles] = useState(null);
    const [faceEnrollmentStatus, setFaceEnrollmentStatus] = useState('unknown');
    const [isCheckingFaceSetup, setIsCheckingFaceSetup] = useState(false);
    const [showAutoCompareModal, setShowAutoCompareModal] = useState(false);
    const [pendingAutoRun, setPendingAutoRun] = useState(false);
    const [profileChestByYear, setProfileChestByYear] = useState({});
    const [competitionRequiredError, setCompetitionRequiredError] = useState(false);
    const [tutorialDemoRan, setTutorialDemoRan] = useState(false);
    const competitionOptionsCacheRef = useRef({});
    const competitionInflightRef = useRef({});
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
    const normalizeEventOptions = useCallback((events) => {
        return events
            .map((event) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            return ({
                id: String((_b = (_a = event.id) !== null && _a !== void 0 ? _a : event.event_id) !== null && _b !== void 0 ? _b : ''),
                name: String((_e = (_d = (_c = event.name) !== null && _c !== void 0 ? _c : event.event_name) !== null && _d !== void 0 ? _d : event.event_title) !== null && _e !== void 0 ? _e : ''),
                location: (_g = (_f = event.location) !== null && _f !== void 0 ? _f : event.event_location) !== null && _g !== void 0 ? _g : null,
                date: (_j = (_h = event.date) !== null && _h !== void 0 ? _h : event.event_date) !== null && _j !== void 0 ? _j : null,
            });
        })
            .filter((event) => Boolean(event.id && event.name));
    }, []);
    const sameEventSelection = useCallback((left, right) => {
        if (left.length !== right.length)
            return false;
        return left.every((event, index) => { var _a; return String(event.id) === String((_a = right[index]) === null || _a === void 0 ? void 0 : _a.id); });
    }, []);
    const selectedEventIds = useMemo(() => selectedEvents.map((event) => event.id), [selectedEvents]);
    const hasCompetition = selectedEventIds.length > 0;
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
    const getYearFromEvent = useCallback((event) => {
        var _a, _b, _c;
        return getYearFromDateLike((_a = event.date) !== null && _a !== void 0 ? _a : null) ||
            getYearFromDateLike((_b = event.name) !== null && _b !== void 0 ? _b : null) ||
            getYearFromDateLike((_c = event.location) !== null && _c !== void 0 ? _c : null);
    }, [getYearFromDateLike]);
    const resolveDefaultChestForEvents = useCallback((events) => {
        var _a;
        const byYear = Object.assign(Object.assign({}, normalizeChestByYear((_a = userProfile === null || userProfile === void 0 ? void 0 : userProfile.chestNumbersByYear) !== null && _a !== void 0 ? _a : {})), profileChestByYear);
        const currentYear = String(new Date().getFullYear());
        for (const event of events) {
            const year = getYearFromEvent(event);
            if (year && byYear[year] != null && String(byYear[year]).trim().length > 0) {
                return String(byYear[year]).trim();
            }
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
    }, [getYearFromEvent, normalizeChestByYear, profileChestByYear, userProfile === null || userProfile === void 0 ? void 0 : userProfile.chestNumbersByYear]);
    const defaultBib = useMemo(() => resolveDefaultChestForEvents(selectedEvents), [resolveDefaultChestForEvents, selectedEvents]);
    const activeBib = useMemo(() => { var _a; return String((_a = (useDefaultBib ? defaultBib : bib)) !== null && _a !== void 0 ? _a : '').trim(); }, [bib, defaultBib, useDefaultBib]);
    const refreshMe = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _g, _h;
        if (!apiAccessToken)
            return;
        try {
            const summary = yield getProfileSummary(apiAccessToken);
            setProfileChestByYear(normalizeChestByYear((_h = (_g = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _g === void 0 ? void 0 : _g.chest_numbers_by_year) !== null && _h !== void 0 ? _h : {}));
        }
        catch (_j) {
            // keep local fallback from userProfile
        }
    }), [apiAccessToken, normalizeChestByYear]);
    useFocusEffect(useCallback(() => {
        refreshMe();
    }, [refreshMe]));
    const fetchEvents = useCallback((query) => __awaiter(void 0, void 0, void 0, function* () {
        var _k;
        const trimmedQuery = query.trim();
        const cacheKey = trimmedQuery.toLowerCase();
        const isAutoload = trimmedQuery.length === 0;
        const cached = competitionOptionsCacheRef.current[cacheKey];
        if (cached) {
            setEventsError(null);
            setEventOptions(cached);
            setIsLoadingEvents(false);
            if (cacheKey === '' && cached.length > 0) {
                setCompetitionPrefetchReady(true);
            }
            return;
        }
        setIsLoadingEvents(true);
        setEventsError(null);
        const requestAccessToken = apiAccessToken !== null && apiAccessToken !== void 0 ? apiAccessToken : '';
        try {
            let request = competitionInflightRef.current[cacheKey];
            if (!request) {
                request = searchEvents(requestAccessToken, {
                    q: trimmedQuery,
                    limit: isAutoload ? COMPETITION_AUTOLOAD_LIMIT : COMPETITION_SEARCH_LIMIT,
                }).then((res) => {
                    const list = Array.isArray(res === null || res === void 0 ? void 0 : res.events) ? res.events : [];
                    return list
                        .slice(0, isAutoload ? COMPETITION_AUTOLOAD_LIMIT : undefined)
                        .map((event) => {
                        var _a, _b;
                        return ({
                            id: String(event.event_id),
                            name: String(event.event_name || event.event_title || t('Competition')),
                            location: (_a = event.event_location) !== null && _a !== void 0 ? _a : null,
                            date: (_b = event.event_date) !== null && _b !== void 0 ? _b : null,
                        });
                    });
                });
                competitionInflightRef.current[cacheKey] = request;
            }
            const options = yield request;
            competitionOptionsCacheRef.current[cacheKey] = options;
            setEventOptions(options);
            if (cacheKey === '' && options.length > 0) {
                setCompetitionPrefetchReady(true);
            }
        }
        catch (e) {
            const msg = e instanceof ApiError ? e.message : String((_k = e === null || e === void 0 ? void 0 : e.message) !== null && _k !== void 0 ? _k : e);
            setEventsError(msg);
        }
        finally {
            delete competitionInflightRef.current[cacheKey];
            setIsLoadingEvents(false);
        }
    }), [apiAccessToken, t]);
    useEffect(() => {
        fetchEvents('').catch(() => {
            // fall back to loading on modal open
        });
    }, [fetchEvents]);
    useEffect(() => {
        let cancelled = false;
        const task = InteractionManager.runAfterInteractions(() => {
            if (!cancelled) {
                setScreenInteractionReady(true);
            }
        });
        return () => {
            var _a;
            cancelled = true;
            setScreenInteractionReady(false);
            (_a = task.cancel) === null || _a === void 0 ? void 0 : _a.call(task);
        };
    }, []);
    useEffect(() => {
        if (!showCompetitionModal)
            return;
        const handle = setTimeout(() => {
            fetchEvents(competitionQuery.trim());
        }, competitionQuery.trim().length === 0 ? 0 : 120);
        return () => clearTimeout(handle);
    }, [competitionQuery, fetchEvents, showCompetitionModal]);
    useEffect(() => {
        if (!showCompetitionModal) {
            setCompetitionQuery('');
            setEventsError(null);
        }
    }, [showCompetitionModal]);
    useEffect(() => {
        if (preselectedEventsParam.length > 0) {
            const normalized = normalizeEventOptions(preselectedEventsParam);
            if (normalized.length > 0 && !sameEventSelection(selectedEvents, normalized)) {
                setSelectedEvents(normalized);
            }
        }
        else if (selectedEvents.length === 0 && prefillCompetitionName) {
            setCompetitionQuery(String(prefillCompetitionName));
            setShowCompetitionModal(true);
        }
    }, [normalizeEventOptions, prefillCompetitionName, preselectedEventsParam, sameEventSelection, selectedEvents]);
    useEffect(() => {
        if (!resumeCombinedSearch)
            return;
        const restoredEvents = Array.isArray(resumeCombinedSearch.selectedEvents)
            ? normalizeEventOptions(resumeCombinedSearch.selectedEvents)
            : [];
        if (restoredEvents.length > 0) {
            setSelectedEvents(restoredEvents);
        }
        if (typeof resumeCombinedSearch.bib === 'string') {
            setBib(resumeCombinedSearch.bib);
        }
        if (typeof resumeCombinedSearch.useSavedBib === 'boolean') {
            setUseDefaultBib(resumeCombinedSearch.useSavedBib);
        }
        if (typeof resumeCombinedSearch.contextText === 'string') {
            setContextText(resumeCombinedSearch.contextText);
        }
        if (typeof resumeCombinedSearch.includeFace === 'boolean') {
            setIncludeFace(resumeCombinedSearch.includeFace);
            if (resumeCombinedSearch.includeFace) {
                setFaceEnrollmentStatus('ready');
            }
        }
        if (resumeCombinedSearch.autoRun) {
            setPendingAutoRun(true);
        }
        navigation.setParams({ resumeCombinedSearch: undefined });
    }, [navigation, normalizeEventOptions, resumeCombinedSearch]);
    useEffect(() => {
        if (autoCompare) {
            setShowAutoCompareModal(true);
        }
    }, [autoCompare]);
    useEffect(() => {
        if (!defaultBib && useDefaultBib) {
            setUseDefaultBib(false);
        }
    }, [defaultBib, useDefaultBib]);
    const toggleEvent = (option) => {
        setSelectedEvents((prev) => {
            const exists = prev.some((event) => event.id === option.id);
            if (exists) {
                return prev.filter((event) => event.id !== option.id);
            }
            setCompetitionRequiredError(false);
            return [...prev, option];
        });
    };
    const removeEvent = (id) => {
        setSelectedEvents((prev) => prev.filter((event) => event.id !== id));
    };
    const applyAutoCompare = () => {
        setShowAutoCompareModal(false);
        setIncludeFace(true);
        if (defaultBib)
            setUseDefaultBib(true);
        setPendingAutoRun(true);
    };
    const startFaceEnrollmentFlow = useCallback(() => {
        const resumePayload = {
            selectedEvents,
            bib,
            useSavedBib: useDefaultBib,
            contextText,
            includeFace: true,
            autoRun: true,
        };
        navigation.navigate('SearchFaceCaptureScreen', {
            mode: 'enrolFace',
            afterEnroll: {
                screen: 'AISearchScreen',
                params: Object.assign(Object.assign({}, (origin ? { origin } : {})), { resumeCombinedSearch: resumePayload }),
            },
        });
    }, [bib, contextText, includeFace, navigation, origin, selectedEvents]);
    const verifyFaceSearchReady = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _l, _m;
        if (!apiAccessToken || selectedEventIds.length === 0) {
            return 'error';
        }
        const requestAccessToken = apiAccessToken !== null && apiAccessToken !== void 0 ? apiAccessToken : '';
        try {
            yield searchFaceByEnrollment(requestAccessToken, {
                event_ids: [selectedEventIds[0]],
                label: 'default',
                limit: 1,
                top: 1,
                save: false,
            });
            setNeedsConsent(false);
            setMissingAngles(null);
            setFaceEnrollmentStatus('ready');
            return 'ready';
        }
        catch (e) {
            if (e instanceof ApiError) {
                const body = (_l = e.body) !== null && _l !== void 0 ? _l : {};
                if (e.status === 403 && String(e.message).toLowerCase().includes('consent')) {
                    setNeedsConsent(true);
                    setMissingAngles(null);
                    return 'consent';
                }
                if (e.status === 400 && Array.isArray(body === null || body === void 0 ? void 0 : body.missing_angles)) {
                    setMissingAngles(body.missing_angles.map(String));
                    setFaceEnrollmentStatus('missing');
                    setNeedsConsent(false);
                    return 'missing';
                }
                setErrorText(e.message);
                return 'error';
            }
            setErrorText(String((_m = e === null || e === void 0 ? void 0 : e.message) !== null && _m !== void 0 ? _m : e));
            return 'error';
        }
    }), [apiAccessToken, selectedEventIds]);
    const runCombinedSearch = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _o, _p, _q, _r, _s, _t, _u;
        if (selectedEventIds.length === 0) {
            setCompetitionRequiredError(true);
            return;
        }
        setCompetitionRequiredError(false);
        const wantsBib = activeBib.length > 0;
        const wantsContext = contextText.trim().length > 0;
        const wantsFace = includeFace;
        if (!wantsBib && !wantsContext && !wantsFace) {
            setErrorText(t('Add a chest number, context, or enable face search.'));
            return;
        }
        setIsSearching(true);
        setErrorText(null);
        setNeedsConsent(false);
        setMissingAngles(null);
        const collected = [];
        const seen = new Set();
        const eventNameLookup = new Map(selectedEvents.map((event) => [event.id, event.name]));
        const requestAccessToken = apiAccessToken !== null && apiAccessToken !== void 0 ? apiAccessToken : '';
        const addResults = (items, matchType) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
            for (const item of items) {
                const id = String((_b = (_a = item.media_id) !== null && _a !== void 0 ? _a : item.id) !== null && _b !== void 0 ? _b : '');
                if (!id || seen.has(id))
                    continue;
                seen.add(id);
                const eventId = String((_c = item.event_id) !== null && _c !== void 0 ? _c : '').trim();
                const matchTimeSeconds = Number(item.match_time_seconds);
                collected.push({
                    media_id: id,
                    event_id: eventId || undefined,
                    match_type: matchType,
                    event_name: (_d = item.event_name) !== null && _d !== void 0 ? _d : eventNameLookup.get(eventId),
                    type: item.type === 'video' ? 'video' : 'image',
                    thumbnail_url: (_g = (_f = (_e = item.thumbnail_url) !== null && _e !== void 0 ? _e : item.preview_url) !== null && _f !== void 0 ? _f : item.original_url) !== null && _g !== void 0 ? _g : '',
                    preview_url: (_k = (_j = (_h = item.preview_url) !== null && _h !== void 0 ? _h : item.thumbnail_url) !== null && _j !== void 0 ? _j : item.original_url) !== null && _k !== void 0 ? _k : '',
                    original_url: (_l = item.original_url) !== null && _l !== void 0 ? _l : '',
                    bib_number: (_m = item.bib_number) !== null && _m !== void 0 ? _m : undefined,
                    match_time_seconds: Number.isFinite(matchTimeSeconds) ? matchTimeSeconds : undefined,
                    created_at: (_o = item.created_at) !== null && _o !== void 0 ? _o : undefined,
                    confidence: (_p = item.confidence) !== null && _p !== void 0 ? _p : undefined,
                    match_percent: (_q = item.match_percent) !== null && _q !== void 0 ? _q : undefined,
                    score: (_r = item.score) !== null && _r !== void 0 ? _r : undefined,
                });
            }
        };
        const errors = [];
        try {
            if (wantsBib) {
                const bibResponses = yield Promise.all(selectedEventIds.map((eventId) => __awaiter(void 0, void 0, void 0, function* () {
                    var _v;
                    try {
                        const res = yield searchMediaByBib(requestAccessToken, {
                            event_id: eventId,
                            bib: activeBib,
                            include_original: false,
                        });
                        return { eventId, results: Array.isArray(res === null || res === void 0 ? void 0 : res.results) ? res.results : [], error: null };
                    }
                    catch (e) {
                        const msg = e instanceof ApiError ? e.message : String((_v = e === null || e === void 0 ? void 0 : e.message) !== null && _v !== void 0 ? _v : e);
                        return { eventId, results: [], error: `${t('Chest number')}: ${msg}` };
                    }
                })));
                for (const response of bibResponses) {
                    if (response.error) {
                        errors.push(response.error);
                        continue;
                    }
                    addResults(response.results.map((r) => (Object.assign(Object.assign({}, r), { event_id: response.eventId, event_name: eventNameLookup.get(response.eventId) }))), 'bib');
                }
            }
            if (wantsContext) {
                const contextResponses = yield Promise.all(selectedEventIds.map((eventId) => __awaiter(void 0, void 0, void 0, function* () {
                    var _w;
                    try {
                        const results = yield searchObject(requestAccessToken, {
                            q: contextText.trim(),
                            top: 150,
                            event_id: eventId,
                        });
                        return { eventId, results: Array.isArray(results) ? results : [], error: null };
                    }
                    catch (e) {
                        const msg = e instanceof ApiError ? e.message : String((_w = e === null || e === void 0 ? void 0 : e.message) !== null && _w !== void 0 ? _w : e);
                        return { eventId, results: [], error: `${t('Context')}: ${msg}` };
                    }
                })));
                for (const response of contextResponses) {
                    if (response.error) {
                        errors.push(response.error);
                        continue;
                    }
                    addResults(response.results.map((r) => (Object.assign(Object.assign({}, r), { event_id: response.eventId, event_name: eventNameLookup.get(response.eventId) }))), 'context');
                }
            }
            if (wantsFace) {
                try {
                    const res = yield searchFaceByEnrollment(requestAccessToken, {
                        event_ids: selectedEventIds,
                        label: 'default',
                        limit: 600,
                        top: 100,
                        save: true,
                    });
                    setFaceEnrollmentStatus('ready');
                    const results = Array.isArray(res === null || res === void 0 ? void 0 : res.results) ? res.results : [];
                    addResults(results.map((r) => {
                        var _a, _b;
                        return (Object.assign(Object.assign({}, r), { event_name: (_a = r.event_name) !== null && _a !== void 0 ? _a : eventNameLookup.get(String((_b = r.event_id) !== null && _b !== void 0 ? _b : '').trim()) }));
                    }), 'face');
                }
                catch (e) {
                    if (e instanceof ApiError) {
                        const body = (_o = e.body) !== null && _o !== void 0 ? _o : {};
                        if (e.status === 403 && String(e.message).toLowerCase().includes('consent')) {
                            setNeedsConsent(true);
                            errors.push(t('Face: consent required.'));
                        }
                        else if (e.status === 400 && Array.isArray(body === null || body === void 0 ? void 0 : body.missing_angles)) {
                            setMissingAngles(body.missing_angles.map(String));
                            setFaceEnrollmentStatus('missing');
                            setIncludeFace(false);
                            errors.push(t('Face: enrollment required.'));
                            setErrorText(t('Face: enrollment required.'));
                            return;
                        }
                        else {
                            errors.push(`${t('Face')}: ${e.message}`);
                        }
                    }
                    else {
                        errors.push(`${t('Face')}: ${String((_p = e === null || e === void 0 ? void 0 : e.message) !== null && _p !== void 0 ? _p : e)}`);
                    }
                }
            }
            if (collected.length === 0) {
                setErrorText((_q = errors[0]) !== null && _q !== void 0 ? _q : t('No matches found. Try adjusting your inputs.'));
                return;
            }
            if (errors.length > 0) {
                setErrorText(errors[0]);
            }
            navigation.navigate('AISearchResultsScreen', {
                matchedCount: collected.length,
                results: collected,
                matchType: 'combined',
                refineContext: {
                    bib: activeBib || undefined,
                    date: selectedEvents.length === 1 ? (_s = (_r = selectedEvents[0]) === null || _r === void 0 ? void 0 : _r.date) !== null && _s !== void 0 ? _s : undefined : undefined,
                },
                manualBrowse: selectedEventIds.length === 1
                    ? {
                        eventId: selectedEventIds[0],
                        competitionId: selectedEventIds[0],
                        eventName: (_t = selectedEvents[0]) === null || _t === void 0 ? void 0 : _t.name,
                        eventDate: (_u = selectedEvents[0]) === null || _u === void 0 ? void 0 : _u.date,
                    }
                    : undefined,
            });
        }
        finally {
            setIsSearching(false);
        }
    }), [
        apiAccessToken,
        activeBib,
        contextText,
        includeFace,
        navigation,
        t,
        selectedEvents,
        selectedEventIds,
    ]);
    useEffect(() => {
        if (!pendingAutoRun)
            return;
        if (!hasCompetition)
            return;
        if (!activeBib && !contextText.trim() && !includeFace)
            return;
        setPendingAutoRun(false);
        runCombinedSearch();
    }, [activeBib, contextText, hasCompetition, includeFace, pendingAutoRun, runCombinedSearch]);
    const handleGrantConsent = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _x;
        if (!apiAccessToken)
            return;
        setErrorText(null);
        try {
            yield grantFaceRecognitionConsent(apiAccessToken);
            setNeedsConsent(false);
            yield refreshMe();
            const status = yield verifyFaceSearchReady();
            if (status === 'ready') {
                setIncludeFace(true);
                return;
            }
            if (status === 'missing') {
                Alert.alert(t('Face setup required'), t('Please enroll your face before enabling face search.'), [
                    { text: t('Not now'), style: 'cancel' },
                    { text: t('Set up face'), onPress: startFaceEnrollmentFlow },
                ]);
            }
        }
        catch (e) {
            const message = e instanceof ApiError ? e.message : String((_x = e === null || e === void 0 ? void 0 : e.message) !== null && _x !== void 0 ? _x : e);
            setErrorText(message);
        }
    }), [apiAccessToken, refreshMe, startFaceEnrollmentFlow, t, verifyFaceSearchReady]);
    const handleEnroll = useCallback(() => {
        setIncludeFace(false);
        setFaceEnrollmentStatus('unknown');
        startFaceEnrollmentFlow();
    }, [startFaceEnrollmentFlow]);
    const handleToggleFaceSearch = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        if (includeFace) {
            setIncludeFace(false);
            return;
        }
        if (faceEnrollmentStatus === 'ready') {
            setIncludeFace(true);
            return;
        }
        if (faceEnrollmentStatus === 'missing') {
            Alert.alert(t('Face setup required'), t('Please enroll your face before enabling face search.'), [
                { text: t('Not now'), style: 'cancel' },
                { text: t('Set up face'), onPress: handleEnroll },
            ]);
            return;
        }
        if (selectedEventIds.length === 0) {
            setCompetitionRequiredError(true);
            Alert.alert(t('Select competitions'), t('Select at least one competition first, then enable face search.'), [
                { text: t('Cancel'), style: 'cancel' },
                { text: t('Select competitions'), onPress: () => setShowCompetitionModal(true) },
            ]);
            return;
        }
        setIsCheckingFaceSetup(true);
        setErrorText(null);
        setNeedsConsent(false);
        setMissingAngles(null);
        try {
            const status = yield verifyFaceSearchReady();
            if (status === 'ready') {
                setIncludeFace(true);
                return;
            }
            if (status === 'consent') {
                Alert.alert(t('Face recognition consent'), t('Allow face recognition for AI search?'), [
                    { text: t('Cancel'), style: 'cancel' },
                    {
                        text: t('Allow'),
                        onPress: () => __awaiter(void 0, void 0, void 0, function* () {
                            var _y;
                            try {
                                yield grantFaceRecognitionConsent(apiAccessToken !== null && apiAccessToken !== void 0 ? apiAccessToken : '');
                                setNeedsConsent(false);
                                const retryStatus = yield verifyFaceSearchReady();
                                if (retryStatus === 'ready') {
                                    setIncludeFace(true);
                                    return;
                                }
                                if (retryStatus === 'missing') {
                                    Alert.alert(t('Face setup required'), t('Please enroll your face before enabling face search.'), [
                                        { text: t('Not now'), style: 'cancel' },
                                        { text: t('Set up face'), onPress: startFaceEnrollmentFlow },
                                    ]);
                                }
                            }
                            catch (consentError) {
                                const message = consentError instanceof ApiError ? consentError.message : String((_y = consentError === null || consentError === void 0 ? void 0 : consentError.message) !== null && _y !== void 0 ? _y : consentError);
                                setErrorText(message);
                            }
                        }),
                    },
                ]);
                return;
            }
            if (status === 'missing') {
                setIncludeFace(false);
                Alert.alert(t('Face setup required'), t('Please enroll your face before enabling face search.'), [
                    { text: t('Not now'), style: 'cancel' },
                    { text: t('Set up face'), onPress: startFaceEnrollmentFlow },
                ]);
            }
        }
        finally {
            setIsCheckingFaceSetup(false);
        }
    }), [
        apiAccessToken,
        faceEnrollmentStatus,
        includeFace,
        selectedEventIds,
        startFaceEnrollmentFlow,
        t,
        verifyFaceSearchReady,
    ]);
    const handleBack = useCallback(() => {
        if (navigation.canGoBack()) {
            navigation.goBack();
            return;
        }
        navigation.navigate('SearchScreen');
    }, [navigation]);
    const runTutorialDemoSearch = useCallback(() => {
        const fakeResults = [
            {
                media_id: 'tutorial-face-1',
                event_id: 'tutorial-event',
                event_name: 'Tutorial Event',
                type: 'image',
                thumbnail_url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200&auto=format&fit=crop',
                preview_url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200&auto=format&fit=crop',
                match_type: 'face',
            },
            {
                media_id: 'tutorial-context-1',
                event_id: 'tutorial-event',
                event_name: 'Tutorial Event',
                type: 'image',
                thumbnail_url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1200&auto=format&fit=crop',
                preview_url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1200&auto=format&fit=crop',
                match_type: 'context',
            },
            {
                media_id: 'tutorial-bib-1',
                event_id: 'tutorial-event',
                event_name: 'Tutorial Event',
                type: 'image',
                bib_number: '4455',
                thumbnail_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop',
                preview_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop',
                match_type: 'bib',
            },
        ];
        setTutorialDemoRan(true);
        navigation.navigate('AISearchResultsScreen', {
            matchedCount: fakeResults.length,
            results: fakeResults,
            matchType: 'combined',
            refineContext: {
                bib: '4455',
            },
            manualBrowse: {
                eventId: 'tutorial-event',
                competitionId: 'tutorial-event',
                eventName: 'Tutorial Event',
            },
        });
    }, [navigation]);
    return (_jsxs(View, Object.assign({ style: styles.mainContainer, testID: "ai-search-screen" }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.headerButton, onPress: handleBack }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: styles.headerTitle }, { children: t('AI Search') })), _jsx(View, { style: { width: 44, height: 44 } })] })), _jsx(KeyboardAvoidingContainer, { children: _jsxs(View, Object.assign({ style: styles.container }, { children: [_jsx(SizeBox, { height: 18 }), _jsx(Text, Object.assign({ style: styles.title }, { children: t('Search by chest, face, and context') })), _jsx(SizeBox, { height: 6 }), tutorialMode && (_jsxs(View, Object.assign({ style: {
                                borderWidth: 1,
                                borderColor: colors.lightGrayColor,
                                borderRadius: 12,
                                backgroundColor: colors.cardBackground,
                                padding: 12,
                                marginTop: 8,
                                marginBottom: 10,
                                gap: 8,
                            } }, { children: [_jsx(Text, Object.assign({ style: { fontWeight: '700', color: colors.mainTextColor, fontSize: 15 } }, { children: t('Tutorial: AI Search') })), _jsx(Text, Object.assign({ style: { color: colors.subTextColor, fontSize: 13, lineHeight: 18 } }, { children: t('Input 1: competitions. Input 2: chest number. Input 3: context text. Toggle face search to include face matching. Run the demo search to see face/context/chest matches.') })), _jsx(TouchableOpacity, Object.assign({ style: {
                                        height: 40,
                                        borderRadius: 10,
                                        backgroundColor: colors.primaryColor,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }, onPress: runTutorialDemoSearch }, { children: _jsx(Text, Object.assign({ style: { color: '#fff', fontWeight: '700' } }, { children: t('Run tutorial search') })) })), _jsx(TouchableOpacity, Object.assign({ style: {
                                        height: 40,
                                        borderRadius: 10,
                                        borderWidth: 1,
                                        borderColor: colors.lightGrayColor,
                                        backgroundColor: tutorialDemoRan ? colors.primaryColor : colors.btnBackgroundColor,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }, disabled: !tutorialDemoRan, onPress: () => navigation.navigate('AvailableEventsScreen', {
                                        tutorialMode: true,
                                        tutorialStep: 'subscribe-flow',
                                    }) }, { children: _jsx(Text, Object.assign({ style: { color: tutorialDemoRan ? '#fff' : colors.subTextColor, fontWeight: '700' } }, { children: t('Continue to subscribe tutorial') })) }))] }))), _jsxs(View, Object.assign({ style: styles.competitionSection }, { children: [_jsx(Text, Object.assign({ style: styles.sectionTitle }, { children: t('Competitions') })), selectedEvents.length > 0 ? (_jsxs(View, Object.assign({ style: styles.selectedCompetitionsRow }, { children: [_jsx(View, Object.assign({ style: styles.competitionChipsWrap }, { children: selectedEvents.map((event) => (_jsxs(View, Object.assign({ style: styles.competitionChip }, { children: [_jsx(Text, Object.assign({ style: styles.competitionChipText, numberOfLines: 1 }, { children: event.name })), _jsx(TouchableOpacity, Object.assign({ style: styles.competitionChipRemove, onPress: () => removeEvent(event.id) }, { children: _jsx(CloseCircle, { size: 14, color: colors.subTextColor, variant: "Linear" }) }))] }), event.id))) })), _jsx(TouchableOpacity, Object.assign({ style: [styles.sectionAction, styles.inlineEditAction], onPress: () => setShowCompetitionModal(true) }, { children: _jsx(Text, Object.assign({ style: styles.sectionActionText }, { children: t('Edit') })) }))] }))) : (_jsx(TouchableOpacity, Object.assign({ testID: "ai-search-open-competition-selector", style: [
                                        styles.emptyCompetitionCard,
                                        competitionRequiredError && styles.emptyCompetitionCardError,
                                    ], onPress: () => setShowCompetitionModal(true) }, { children: _jsx(Text, Object.assign({ style: styles.emptyCompetitionText }, { children: t('Select competitions') })) })))] })), _jsx(Modal, Object.assign({ visible: showAutoCompareModal, transparent: true, animationType: "fade", onRequestClose: () => setShowAutoCompareModal(false) }, { children: _jsx(View, Object.assign({ style: styles.modalOverlay }, { children: _jsxs(View, Object.assign({ style: styles.modalCard }, { children: [_jsxs(View, Object.assign({ style: styles.modalHeader }, { children: [_jsx(Text, Object.assign({ style: styles.modalTitle }, { children: t('AI quick compare') })), _jsx(TouchableOpacity, Object.assign({ style: styles.modalCloseButton, onPress: () => setShowAutoCompareModal(false) }, { children: _jsx(CloseCircle, { size: 22, color: colors.subTextColor, variant: "Linear" }) }))] })), _jsx(Text, Object.assign({ style: styles.helperText }, { children: t('We will compare your saved face and chest number to quickly find results in these competitions.') })), _jsx(SizeBox, { height: 16 }), _jsx(TouchableOpacity, Object.assign({ style: styles.modalDoneButton, onPress: applyAutoCompare }, { children: _jsx(Text, Object.assign({ style: styles.modalDoneButtonText }, { children: t('Compare now') })) })), _jsx(SizeBox, { height: 10 }), _jsx(TouchableOpacity, Object.assign({ style: styles.modalSecondaryButton, onPress: () => setShowAutoCompareModal(false) }, { children: _jsx(Text, Object.assign({ style: styles.modalSecondaryButtonText }, { children: t('Not now') })) }))] })) })) })), _jsx(SizeBox, { height: 22 }), _jsxs(View, Object.assign({ style: styles.toggleRow }, { children: [_jsxs(View, Object.assign({ style: styles.toggleInfo }, { children: [_jsx(Text, Object.assign({ style: styles.faceSectionTitle }, { children: t('Face search') })), _jsx(Text, Object.assign({ style: styles.helperText }, { children: isCheckingFaceSetup ? t('Checking face setup…') : t('Use your enrolled face to match photos.') }))] })), _jsxs(View, Object.assign({ style: styles.faceActions }, { children: [_jsxs(TouchableOpacity, Object.assign({ style: styles.redoFaceButton, onPress: handleEnroll }, { children: [_jsx(AddCircle, { size: 20, color: colors.primaryColor, variant: "Bold" }), _jsx(Text, Object.assign({ style: styles.redoFaceText }, { children: t('Redo face') }))] })), _jsx(CustomSwitch, { isEnabled: includeFace, toggleSwitch: handleToggleFaceSearch })] }))] })), needsConsent && (_jsx(TouchableOpacity, Object.assign({ style: styles.secondaryButton, onPress: handleGrantConsent }, { children: _jsx(Text, Object.assign({ style: styles.secondaryButtonText }, { children: t('Grant face consent') })) }))), missingAngles && (_jsx(TouchableOpacity, Object.assign({ style: styles.secondaryButton, onPress: handleEnroll }, { children: _jsx(Text, Object.assign({ style: styles.secondaryButtonText }, { children: t('Enroll your face') })) }))), _jsx(SizeBox, { height: 20 }), _jsx(Text, Object.assign({ style: styles.sectionTitle }, { children: t('Chest number') })), !useDefaultBib || !defaultBib ? (_jsx(UnifiedSearchInput, { testID: "ai-search-bib-input", containerStyle: styles.inputContainer, left: _jsx(SearchNormal1, { size: 20, color: colors.grayColor, variant: "Linear" }), inputStyle: styles.input, placeholder: t('e.g. 1234'), value: bib, onChangeText: setBib, keyboardType: "number-pad", returnKeyType: "next" })) : null, _jsx(SizeBox, { height: 10 }), _jsxs(View, Object.assign({ style: styles.toggleRow }, { children: [_jsxs(View, Object.assign({ style: styles.toggleInfo }, { children: [_jsx(Text, Object.assign({ style: styles.faceSectionTitle }, { children: t('Use saved chest number') })), _jsx(Text, Object.assign({ style: styles.helperText }, { children: defaultBib
                                                ? `${defaultBib}`
                                                : t('No saved chest number yet. Enter the chest number for this competition below.') }))] })), _jsx(CustomSwitch, { isEnabled: useDefaultBib, toggleSwitch: () => {
                                        if (!defaultBib)
                                            return;
                                        setUseDefaultBib((prev) => !prev);
                                    } })] })), _jsx(SizeBox, { height: 20 }), _jsx(Text, Object.assign({ style: styles.sectionTitle }, { children: t('Context') })), _jsx(UnifiedSearchInput, { testID: "ai-search-context-input", containerStyle: styles.inputContainer, left: _jsx(SearchNormal1, { size: 20, color: colors.grayColor, variant: "Linear" }), inputStyle: styles.input, placeholder: t('e.g. finish line, podium, medal'), value: contextText, onChangeText: setContextText, returnKeyType: "done" }), errorText && _jsx(Text, Object.assign({ style: styles.errorText }, { children: errorText })), _jsx(SizeBox, { height: 20 }), _jsx(TouchableOpacity, Object.assign({ testID: "ai-search-run-button", style: [styles.primaryButton, (!hasCompetition || isSearching) && styles.primaryButtonDisabled], onPress: runCombinedSearch, disabled: !hasCompetition || isSearching }, { children: _jsx(Text, Object.assign({ style: styles.primaryButtonText }, { children: isSearching ? t('Searching…') : t('Run AI search') })) })), !showCompetitionModal && competitionPrefetchReady ? (_jsx(View, { testID: "ai-search-competition-prefetch-ready", style: { position: 'absolute', width: 1, height: 1, opacity: 0 } })) : null, screenInteractionReady ? (_jsx(View, { testID: "ai-search-screen-idle-ready", style: { position: 'absolute', width: 1, height: 1, opacity: 0 } })) : null, showCompetitionModal && !isLoadingEvents && eventOptions.length > 0 ? (_jsx(View, { testID: "ai-search-competition-modal-ready", style: { position: 'absolute', width: 1, height: 1, opacity: 0 } })) : null, _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] })) }), _jsx(View, Object.assign({ pointerEvents: showCompetitionModal ? 'auto' : 'none', style: [
                    styles.modalOverlay,
                    styles.modalOverlayAbsolute,
                    !showCompetitionModal ? { opacity: 0 } : null,
                ], testID: "ai-search-competition-modal-overlay" }, { children: _jsxs(View, Object.assign({ style: styles.modalCard, testID: "ai-search-competition-modal-card" }, { children: [_jsxs(View, Object.assign({ style: styles.modalHeader }, { children: [_jsx(Text, Object.assign({ style: styles.modalTitle }, { children: t('Choose one or more') })), _jsx(TouchableOpacity, Object.assign({ testID: "ai-search-competition-modal-close", style: styles.modalCloseButton, onPress: () => setShowCompetitionModal(false) }, { children: _jsx(CloseCircle, { size: 22, color: colors.subTextColor, variant: "Linear" }) }))] })), _jsx(UnifiedSearchInput, { testID: "ai-search-competition-modal-input", containerStyle: styles.modalSearchRow, left: _jsx(SearchNormal1, { size: 18, color: colors.subTextColor, variant: "Linear" }), inputStyle: styles.modalSearchInput, placeholder: t('Search competitions'), placeholderTextColor: colors.subTextColor, value: competitionQuery, onChangeText: setCompetitionQuery }), eventsError && _jsx(Text, Object.assign({ style: styles.modalErrorText }, { children: eventsError })), isLoadingEvents ? (_jsx(View, Object.assign({ style: styles.modalLoadingRow }, { children: _jsx(ActivityIndicator, { color: colors.primaryColor }) }))) : (_jsx(FlatList, { data: eventOptions, keyExtractor: (item) => item.id, style: styles.modalList, contentContainerStyle: styles.modalListContent, keyboardShouldPersistTaps: "handled", initialNumToRender: 8, maxToRenderPerBatch: 8, windowSize: 4, removeClippedSubviews: true, renderItem: ({ item: event }) => {
                                const selected = selectedEventIds.includes(event.id);
                                const meta = [event.date ? new Date(event.date).toLocaleDateString() : null, event.location]
                                    .filter(Boolean)
                                    .join(' • ');
                                return (_jsxs(TouchableOpacity, Object.assign({ testID: `ai-search-competition-option-${event.id}`, style: [styles.modalOption, selected && styles.modalOptionSelected], onPress: () => toggleEvent(event) }, { children: [_jsxs(View, Object.assign({ style: styles.modalOptionTextWrap }, { children: [_jsx(Text, Object.assign({ style: styles.modalOptionTitle }, { children: event.name })), !!meta && _jsx(Text, Object.assign({ style: styles.modalOptionSubtext }, { children: meta }))] })), selected && (_jsx(TickCircle, { size: 22, color: colors.primaryColor, variant: "Bold" }))] }), event.id));
                            }, ListEmptyComponent: _jsx(Text, Object.assign({ style: styles.modalEmptyText }, { children: t('No competitions found.') })) })), _jsx(TouchableOpacity, Object.assign({ testID: "ai-search-competition-modal-done", style: styles.modalDoneButton, onPress: () => setShowCompetitionModal(false) }, { children: _jsxs(Text, Object.assign({ style: styles.modalDoneButtonText }, { children: [t('Done'), " (", selectedEventIds.length, " ", t('selected'), ")"] })) }))] })) }))] })));
};
export default CombinedSearchScreen;
