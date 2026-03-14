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
import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft2, Ghost, Trash } from 'iconsax-react-nativejs';
import { createStyles } from './CompetitionDetailsStyles';
import SizeBox from '../../constants/SizeBox';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import FastImage from 'react-native-fast-image';
import { ApiError, getCompetitionMaps, getEventCompetitions } from '../../services/apiGateway';
import { getApiBaseUrl } from '../../constants/RuntimeConfig';
import { getSportFocusLabel, normalizeFocusId } from '../../utils/profileSelections';
import E2EPerfReady from '../../components/e2e/E2EPerfReady';
const DIVISIONS = [
    'Pupil',
    'Miniem',
    'Cadet',
    'Scholier',
    'Junior',
    'Beloften',
    'Seniors',
    'Masters',
];
const FIELD_DISCIPLINE_PATTERN = /jump|throw|put|vault|discus|javelin|hammer/i;
const ROAD_DISCIPLINE_PATTERN = /road|trail|cross|veldloop|checkpoint|finish|start|\b\d+\s?km\b/i;
const GENERIC_DISCIPLINE_NAMES = new Set([
    'track field',
    'track&field',
    'road trail',
    'road&trail',
    'event',
    'competition',
]);
const CompetitionDetailsScreen = ({ navigation, route }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { apiAccessToken } = useAuth();
    const Styles = createStyles(colors);
    const perfStartedAtRef = useRef(Date.now());
    const competition = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.competition;
    const account = (_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.account;
    const anonymous = (_c = route === null || route === void 0 ? void 0 : route.params) === null || _c === void 0 ? void 0 : _c.anonymous;
    const competitionType = (_e = (_d = route === null || route === void 0 ? void 0 : route.params) === null || _d === void 0 ? void 0 : _d.competitionType) !== null && _e !== void 0 ? _e : 'track';
    const [competitionFocusId, setCompetitionFocusId] = useState(normalizeFocusId((_j = (_g = (_f = competition === null || competition === void 0 ? void 0 : competition.competition_focus) !== null && _f !== void 0 ? _f : competition === null || competition === void 0 ? void 0 : competition.competition_type) !== null && _g !== void 0 ? _g : (_h = route === null || route === void 0 ? void 0 : route.params) === null || _h === void 0 ? void 0 : _h.competitionFocus) !== null && _j !== void 0 ? _j : (_k = route === null || route === void 0 ? void 0 : route.params) === null || _k === void 0 ? void 0 : _k.competitionType));
    const [activeTab, setActiveTab] = useState('track');
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedGender, setSelectedGender] = useState(null);
    const [selectedDivision, setSelectedDivision] = useState(null);
    const [uploadCounts, setUploadCounts] = useState({});
    const [trackEvents, setTrackEvents] = useState([]);
    const [fieldEvents, setFieldEvents] = useState([]);
    const [roadEvents, setRoadEvents] = useState([]);
    const [isLoadingDisciplines, setIsLoadingDisciplines] = useState(false);
    const [disciplinesError, setDisciplinesError] = useState(null);
    const [roadCourseMaps, setRoadCourseMaps] = useState([]);
    const [selectedRoadCourseMapId, setSelectedRoadCourseMapId] = useState('');
    const [isLoadingRoadCourseMaps, setIsLoadingRoadCourseMaps] = useState(false);
    const perfReady = !isLoadingDisciplines && !isLoadingRoadCourseMaps && (trackEvents.length + fieldEvents.length + roadEvents.length + roadCourseMaps.length > 0 || disciplinesError !== null);
    const competitionId = useMemo(() => String((competition === null || competition === void 0 ? void 0 : competition.id) || (competition === null || competition === void 0 ? void 0 : competition.event_id) || (competition === null || competition === void 0 ? void 0 : competition.eventId) || '').trim(), [competition === null || competition === void 0 ? void 0 : competition.event_id, competition === null || competition === void 0 ? void 0 : competition.eventId, competition === null || competition === void 0 ? void 0 : competition.id]);
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
    const formatDate = useCallback((value) => {
        if (!value)
            return '';
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime()))
            return value;
        const day = String(parsed.getDate()).padStart(2, '0');
        const month = String(parsed.getMonth() + 1).padStart(2, '0');
        const year = parsed.getFullYear();
        return `${day}/${month}/${year}`;
    }, []);
    const isRoadFocus = competitionFocusId === 'road-events' || competitionType === 'road';
    const isTrackFieldFocus = competitionFocusId === 'track-field' || (!competitionFocusId && competitionType === 'track');
    const competitionTypeLabel = useMemo(() => (competitionFocusId ? getSportFocusLabel(competitionFocusId, t) : (isRoadFocus ? t('roadAndTrail') : t('trackAndField'))), [competitionFocusId, isRoadFocus, t]);
    const competitionMetaLine = useMemo(() => {
        const parts = [
            competitionTypeLabel,
            String((competition === null || competition === void 0 ? void 0 : competition.location) || '').trim(),
            formatDate(competition === null || competition === void 0 ? void 0 : competition.date),
        ].filter((part) => {
            const value = String(part || '').trim();
            return value.length > 0 && value !== '-' && value !== '—';
        });
        return parts.join(' • ');
    }, [competition === null || competition === void 0 ? void 0 : competition.date, competition === null || competition === void 0 ? void 0 : competition.location, competitionTypeLabel, formatDate]);
    const organizingClub = useMemo(() => String((competition === null || competition === void 0 ? void 0 : competition.organizingClub) || (competition === null || competition === void 0 ? void 0 : competition.organizing_club) || '').trim(), [competition === null || competition === void 0 ? void 0 : competition.organizingClub, competition === null || competition === void 0 ? void 0 : competition.organizing_club]);
    const classifyDiscipline = useCallback((name, typeToken, groupToken, focusId) => {
        const normalizedName = name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
        const normalizedType = String(typeToken || '').toLowerCase();
        const normalizedGroup = String(groupToken || '').toLowerCase();
        if (focusId === 'road-events') {
            return 'road';
        }
        if (focusId && focusId !== 'track-field') {
            return 'track';
        }
        if (ROAD_DISCIPLINE_PATTERN.test(normalizedType)
            || ROAD_DISCIPLINE_PATTERN.test(normalizedName)
            || normalizedGroup === 'road'
            || normalizedGroup === 'trail'
            || competitionType === 'road') {
            return 'road';
        }
        if (/field/.test(normalizedType) || FIELD_DISCIPLINE_PATTERN.test(normalizedName) || normalizedGroup === 'jumps' || normalizedGroup === 'throws') {
            return 'field';
        }
        return 'track';
    }, [competitionType]);
    const normalizeCheckpointLabel = useCallback((value) => {
        return String(value || '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, ' ')
            .trim();
    }, []);
    useEffect(() => {
        if (!apiAccessToken || !competitionId) {
            setTrackEvents([]);
            setFieldEvents([]);
            setRoadEvents([]);
            setIsLoadingDisciplines(false);
            setDisciplinesError(null);
            return;
        }
        let isActive = true;
        const loadDisciplines = () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            setIsLoadingDisciplines(true);
            setDisciplinesError(null);
            try {
                const res = yield getEventCompetitions(apiAccessToken, competitionId);
                if (!isActive)
                    return;
                const rows = Array.isArray(res === null || res === void 0 ? void 0 : res.competitions) ? res.competitions : [];
                const resolvedFocus = normalizeFocusId((_c = (_b = (_a = rows[0]) === null || _a === void 0 ? void 0 : _a.competition_focus) !== null && _b !== void 0 ? _b : competitionFocusId) !== null && _c !== void 0 ? _c : competitionType);
                setCompetitionFocusId(resolvedFocus);
                const seenIds = new Set();
                const seenNames = new Set();
                const normalizedRows = [];
                for (const row of rows) {
                    const id = String((row === null || row === void 0 ? void 0 : row.id) || '').trim();
                    const rawName = String((row === null || row === void 0 ? void 0 : row.competition_name) || (row === null || row === void 0 ? void 0 : row.competition_name_normalized) || '').trim();
                    const typeToken = String((row === null || row === void 0 ? void 0 : row.competition_type) || '').trim();
                    const groupToken = String((row === null || row === void 0 ? void 0 : row.discipline_group) || '').trim();
                    if (!id || !rawName || seenIds.has(id))
                        continue;
                    seenIds.add(id);
                    const normalizedName = rawName.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
                    if (seenNames.has(normalizedName))
                        continue;
                    seenNames.add(normalizedName);
                    normalizedRows.push({
                        id,
                        name: rawName,
                        kind: classifyDiscipline(rawName, typeToken, groupToken, resolvedFocus),
                        group: (_d = row === null || row === void 0 ? void 0 : row.discipline_group) !== null && _d !== void 0 ? _d : null,
                    });
                }
                const withoutGeneric = normalizedRows.filter((item) => {
                    const normalizedName = item.name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
                    return !GENERIC_DISCIPLINE_NAMES.has(normalizedName);
                });
                const events = withoutGeneric.length > 0 ? withoutGeneric : normalizedRows;
                if (resolvedFocus === 'road-events' || competitionType === 'road') {
                    const roadOnly = events.filter((item) => item.kind === 'road');
                    setRoadEvents(roadOnly.length > 0 ? roadOnly : events);
                    setTrackEvents([]);
                    setFieldEvents([]);
                }
                else if (resolvedFocus && resolvedFocus !== 'track-field') {
                    setTrackEvents(events);
                    setFieldEvents([]);
                    setRoadEvents([]);
                }
                else {
                    const field = events.filter((item) => item.kind === 'field');
                    const track = events.filter((item) => item.kind !== 'field');
                    setTrackEvents(track);
                    setFieldEvents(field);
                    setRoadEvents([]);
                }
            }
            catch (error) {
                if (!isActive)
                    return;
                const message = error instanceof ApiError ? error.message : String((error === null || error === void 0 ? void 0 : error.message) || error);
                setDisciplinesError(message);
                setTrackEvents([]);
                setFieldEvents([]);
                setRoadEvents([]);
            }
            finally {
                if (isActive)
                    setIsLoadingDisciplines(false);
            }
        });
        loadDisciplines();
        return () => {
            isActive = false;
        };
    }, [apiAccessToken, classifyDiscipline, competitionFocusId, competitionId, competitionType]);
    useEffect(() => {
        if (!apiAccessToken || !competitionId || !isRoadFocus) {
            setRoadCourseMaps([]);
            setSelectedRoadCourseMapId('');
            setIsLoadingRoadCourseMaps(false);
            return;
        }
        let active = true;
        const loadRoadMaps = () => __awaiter(void 0, void 0, void 0, function* () {
            setIsLoadingRoadCourseMaps(true);
            try {
                const res = yield getCompetitionMaps(apiAccessToken, {
                    event_id: competitionId,
                    include_checkpoints: true,
                });
                if (!active)
                    return;
                const maps = (Array.isArray(res === null || res === void 0 ? void 0 : res.maps) ? res.maps : []).map((map) => {
                    var _a, _b;
                    const url = (_b = (_a = map.image_url) !== null && _a !== void 0 ? _a : map.storage_key) !== null && _b !== void 0 ? _b : null;
                    return {
                        id: String(map.id),
                        label: String(map.name || t('Course map')),
                        imageUrl: withAccessToken(toAbsoluteUrl(url)),
                        disciplineId: map.competition_id ? String(map.competition_id) : null,
                        checkpoints: Array.isArray(map.checkpoints)
                            ? map.checkpoints.map((cp) => {
                                var _a, _b;
                                return ({
                                    id: String(cp.id),
                                    label: String(cp.label || `Checkpoint ${Number((_a = cp.checkpoint_index) !== null && _a !== void 0 ? _a : 0) + 1}`),
                                    checkpointIndex: Number((_b = cp.checkpoint_index) !== null && _b !== void 0 ? _b : 0),
                                });
                            })
                            : [],
                    };
                });
                setRoadCourseMaps(maps);
                setSelectedRoadCourseMapId((prev) => {
                    var _a;
                    return (maps.some((item) => item.id === prev) ? prev : (((_a = maps[0]) === null || _a === void 0 ? void 0 : _a.id) || ''));
                });
            }
            catch (_a) {
                if (!active)
                    return;
                setRoadCourseMaps([]);
                setSelectedRoadCourseMapId('');
            }
            finally {
                if (active)
                    setIsLoadingRoadCourseMaps(false);
            }
        });
        loadRoadMaps();
        return () => {
            active = false;
        };
    }, [apiAccessToken, competitionId, isRoadFocus, t, toAbsoluteUrl, withAccessToken]);
    const activeEvents = useMemo(() => {
        if (isRoadFocus)
            return roadEvents;
        if (!isTrackFieldFocus)
            return trackEvents;
        return activeTab === 'track' ? trackEvents : fieldEvents;
    }, [activeTab, fieldEvents, isRoadFocus, isTrackFieldFocus, roadEvents, trackEvents]);
    const selectedRoadCourseMap = useMemo(() => {
        var _a;
        if (roadCourseMaps.length === 0)
            return null;
        return (_a = roadCourseMaps.find((map) => map.id === selectedRoadCourseMapId)) !== null && _a !== void 0 ? _a : roadCourseMaps[0];
    }, [roadCourseMaps, selectedRoadCourseMapId]);
    const loadCounts = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        if (!competitionId) {
            setUploadCounts({});
            return;
        }
        try {
            // Use the current upload draft (assets selected) instead of persisting "uploaded counts" forever.
            const assetsRaw = yield AsyncStorage.getItem(`@upload_assets_${competitionId}`);
            const parsed = assetsRaw ? JSON.parse(assetsRaw) : {};
            const counts = {};
            if (parsed && typeof parsed === 'object') {
                for (const [name, list] of Object.entries(parsed)) {
                    const arr = Array.isArray(list) ? list : [];
                    let photos = 0;
                    let videos = 0;
                    for (const asset of arr) {
                        const mediaType = String((asset === null || asset === void 0 ? void 0 : asset.type) || '').toLowerCase();
                        if (mediaType.includes('video'))
                            videos += 1;
                        else
                            photos += 1;
                    }
                    if (photos + videos > 0) {
                        counts[String(name)] = { photos, videos };
                    }
                }
            }
            setUploadCounts(counts);
        }
        catch (_m) {
            setUploadCounts({});
        }
    }), [competitionId]);
    useFocusEffect(useCallback(() => {
        loadCounts();
    }, [loadCounts]));
    const openCategoryModal = (category) => {
        if (isRoadFocus) {
            const matchedMap = roadCourseMaps.find((map) => map.disciplineId === category.id);
            if (matchedMap) {
                setSelectedRoadCourseMapId(matchedMap.id);
            }
        }
        setSelectedEvent(category);
        setSelectedGender(null);
        setSelectedDivision(null);
        setCategoryModalVisible(true);
    };
    const handleContinue = () => {
        var _a, _b, _c, _d, _e;
        if (!selectedEvent || !selectedGender || !selectedDivision)
            return;
        const selectedMap = isRoadFocus ? selectedRoadCourseMap : null;
        const selectedEventNameNormalized = normalizeCheckpointLabel(selectedEvent === null || selectedEvent === void 0 ? void 0 : selectedEvent.name);
        const selectedCheckpoint = (() => {
            var _a;
            if (!selectedMap || !Array.isArray(selectedMap.checkpoints) || selectedMap.checkpoints.length === 0) {
                return null;
            }
            const checkpoints = selectedMap.checkpoints;
            const exact = checkpoints.find((cp) => normalizeCheckpointLabel(cp.label) === selectedEventNameNormalized);
            if (exact)
                return exact;
            const includesMatch = checkpoints.find((cp) => {
                const cpNorm = normalizeCheckpointLabel(cp.label);
                return (cpNorm.includes(selectedEventNameNormalized) ||
                    selectedEventNameNormalized.includes(cpNorm));
            });
            if (includesMatch)
                return includesMatch;
            if (/\bstart\b/i.test((selectedEvent === null || selectedEvent === void 0 ? void 0 : selectedEvent.name) || '')) {
                const startMatch = checkpoints.find((cp) => /\bstart\b/i.test(cp.label || ''));
                if (startMatch)
                    return startMatch;
            }
            if (/\bfinish\b/i.test((selectedEvent === null || selectedEvent === void 0 ? void 0 : selectedEvent.name) || '')) {
                const finishMatch = checkpoints.find((cp) => /\bfinish\b/i.test(cp.label || ''));
                if (finishMatch)
                    return finishMatch;
            }
            const kmMatch = String((selectedEvent === null || selectedEvent === void 0 ? void 0 : selectedEvent.name) || '').match(/(\d+(?:[.,]\d+)?)\s*km/i);
            if (kmMatch === null || kmMatch === void 0 ? void 0 : kmMatch[1]) {
                const kmValue = kmMatch[1].replace(',', '.');
                const byKm = checkpoints.find((cp) => new RegExp(`\\b${kmValue}\\s*km\\b`, 'i').test(cp.label || ''));
                if (byKm)
                    return byKm;
            }
            return (_a = checkpoints[0]) !== null && _a !== void 0 ? _a : null;
        })();
        navigation.navigate('UploadDetailsScreen', {
            competition,
            category: selectedEvent,
            gender: selectedGender,
            division: selectedDivision,
            account,
            anonymous,
            competitionType: isRoadFocus ? 'road' : 'track',
            discipline_id: (_a = selectedEvent === null || selectedEvent === void 0 ? void 0 : selectedEvent.id) !== null && _a !== void 0 ? _a : null,
            competition_map_id: (_b = selectedMap === null || selectedMap === void 0 ? void 0 : selectedMap.id) !== null && _b !== void 0 ? _b : null,
            checkpoint_id: (_c = selectedCheckpoint === null || selectedCheckpoint === void 0 ? void 0 : selectedCheckpoint.id) !== null && _c !== void 0 ? _c : null,
            checkpoint_label: (_d = selectedCheckpoint === null || selectedCheckpoint === void 0 ? void 0 : selectedCheckpoint.label) !== null && _d !== void 0 ? _d : null,
            e2eFixtureFiles: Array.isArray((_e = route === null || route === void 0 ? void 0 : route.params) === null || _e === void 0 ? void 0 : _e.e2eFixtureFiles) ? route.params.e2eFixtureFiles : undefined,
        });
        setCategoryModalVisible(false);
    };
    const renderEventCard = (category) => {
        const counts = uploadCounts[category.name];
        const videos = Number((counts === null || counts === void 0 ? void 0 : counts.videos) || 0);
        const photos = Number((counts === null || counts === void 0 ? void 0 : counts.photos) || 0);
        const total = videos + photos;
        const parts = [];
        if (videos > 0)
            parts.push(`${videos} video${videos === 1 ? '' : 's'}`);
        if (photos > 0)
            parts.push(`${photos} photo${photos === 1 ? '' : 's'}`);
        const countLabel = total > 0 ? `Selected: ${parts.join(' • ')}` : 'No files selected';
        const hasUploads = total > 0;
        return (_jsx(TouchableOpacity, Object.assign({ style: [Styles.eventCard, hasUploads && Styles.eventCardActive], activeOpacity: 0.85, onPress: () => openCategoryModal(category), testID: `upload-discipline-card-${category.id}` }, { children: _jsxs(View, Object.assign({ style: Styles.eventText }, { children: [_jsx(Text, Object.assign({ style: Styles.eventName }, { children: category.name })), _jsx(Text, Object.assign({ style: [Styles.eventMeta, hasUploads && Styles.eventMetaActive] }, { children: countLabel }))] })) }), category.id));
    };
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer, testID: "upload-competition-details-screen" }, { children: [_jsx(E2EPerfReady, { screen: "upload-competition", ready: perfReady, startedAtMs: perfStartedAtRef.current }), _jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: (competition === null || competition === void 0 ? void 0 : competition.name) || t('BK Studenten 2023') })), _jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: () => {
                            if (!competitionId)
                                return;
                            Alert.alert(t('Reset upload draft?'), t('This will clear selected files for this competition on this device.'), [
                                { text: t('Cancel'), style: 'cancel' },
                                {
                                    text: t('Reset'),
                                    style: 'destructive',
                                    onPress: () => __awaiter(void 0, void 0, void 0, function* () {
                                        try {
                                            yield AsyncStorage.multiRemove([
                                                `@upload_assets_${competitionId}`,
                                                `@upload_counts_${competitionId}`,
                                                `@upload_session_${competitionId}`,
                                                `@upload_activity_${competitionId}`,
                                            ]);
                                        }
                                        catch (_a) { }
                                        loadCounts();
                                    }),
                                },
                            ]);
                        }, activeOpacity: 0.8 }, { children: anonymous ? (_jsx(Ghost, { size: 22, color: colors.primaryColor, variant: "Linear" })) : (_jsx(Trash, { size: 20, color: colors.primaryColor, variant: "Linear" })) }))] })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, contentContainerStyle: Styles.scrollContent }, { children: [_jsxs(View, Object.assign({ style: Styles.infoCard }, { children: [_jsx(Text, Object.assign({ style: Styles.infoSub }, { children: competitionMetaLine || competitionTypeLabel })), organizingClub ? (_jsx(Text, Object.assign({ style: Styles.infoMeta, numberOfLines: 1 }, { children: organizingClub }))) : null] })), isRoadFocus ? (_jsxs(_Fragment, { children: [_jsx(SizeBox, { height: 12 }), _jsx(View, Object.assign({ style: Styles.mapCard }, { children: isLoadingRoadCourseMaps ? (_jsxs(View, Object.assign({ style: Styles.disciplineLoadingState }, { children: [_jsx(ActivityIndicator, { color: colors.primaryColor }), _jsx(SizeBox, { height: 8 }), _jsx(Text, Object.assign({ style: Styles.disciplineLoadingText }, { children: t('Loading course maps...') }))] }))) : (selectedRoadCourseMap === null || selectedRoadCourseMap === void 0 ? void 0 : selectedRoadCourseMap.imageUrl) ? (_jsxs(_Fragment, { children: [_jsx(FastImage, { source: { uri: selectedRoadCourseMap.imageUrl }, style: Styles.mapImage, resizeMode: "cover" }), _jsx(View, Object.assign({ style: Styles.mapOverlay }, { children: _jsx(Text, Object.assign({ style: Styles.mapTitle }, { children: selectedRoadCourseMap.label || t('Course map') })) }))] })) : (_jsx(View, Object.assign({ style: Styles.disciplineEmptyState }, { children: _jsx(Text, Object.assign({ style: Styles.disciplineEmptyTitle }, { children: t('No map uploaded for this course yet.') })) }))) }))] })) : null, _jsx(SizeBox, { height: 20 }), isTrackFieldFocus && (_jsxs(_Fragment, { children: [_jsxs(View, Object.assign({ style: Styles.toggleContainer }, { children: [_jsx(TouchableOpacity, Object.assign({ style: [Styles.toggleTab, activeTab === 'track' && Styles.toggleTabActive], onPress: () => setActiveTab('track') }, { children: _jsx(Text, Object.assign({ style: [Styles.toggleTabText, activeTab === 'track' && Styles.toggleTabTextActive] }, { children: t('Track events') })) })), _jsx(TouchableOpacity, Object.assign({ style: [Styles.toggleTab, activeTab === 'field' && Styles.toggleTabActive], onPress: () => setActiveTab('field') }, { children: _jsx(Text, Object.assign({ style: [Styles.toggleTabText, activeTab === 'field' && Styles.toggleTabTextActive] }, { children: t('Field events') })) }))] })), _jsx(SizeBox, { height: 20 })] })), _jsx(Text, Object.assign({ style: Styles.sectionTitle }, { children: isRoadFocus ? t('Choose a checkpoint') : t('Disciplines') })), _jsx(SizeBox, { height: 16 }), isLoadingDisciplines ? (_jsxs(View, Object.assign({ style: Styles.disciplineLoadingState }, { children: [_jsx(ActivityIndicator, { color: colors.primaryColor }), _jsx(SizeBox, { height: 8 }), _jsx(Text, Object.assign({ style: Styles.disciplineLoadingText }, { children: t('Loading disciplines...') }))] }))) : activeEvents.length > 0 ? (activeEvents.map(renderEventCard)) : (_jsxs(View, Object.assign({ style: Styles.disciplineEmptyState }, { children: [_jsx(Text, Object.assign({ style: Styles.disciplineEmptyTitle }, { children: t('No disciplines configured for this competition yet.') })), disciplinesError ? (_jsxs(_Fragment, { children: [_jsx(SizeBox, { height: 6 }), _jsx(Text, Object.assign({ style: Styles.disciplineEmptySubtitle }, { children: disciplinesError }))] })) : null] }))), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] })), _jsx(Modal, Object.assign({ visible: categoryModalVisible, transparent: true, animationType: "fade", onRequestClose: () => setCategoryModalVisible(false) }, { children: _jsx(Pressable, Object.assign({ style: Styles.modalBackdrop, onPress: () => setCategoryModalVisible(false) }, { children: _jsxs(Pressable, Object.assign({ style: Styles.modalCard, onPress: () => { } }, { children: [_jsx(Text, Object.assign({ style: Styles.modalTitle }, { children: t('Select category') })), _jsx(Text, Object.assign({ style: Styles.modalSubtitle }, { children: (_l = selectedEvent === null || selectedEvent === void 0 ? void 0 : selectedEvent.name) !== null && _l !== void 0 ? _l : t('Event') })), _jsxs(View, Object.assign({ style: Styles.modalSection }, { children: [_jsx(Text, Object.assign({ style: Styles.modalLabel }, { children: t('Gender') })), _jsx(View, Object.assign({ style: Styles.choiceRow }, { children: ['Men', 'Women'].map((gender) => {
                                            const active = selectedGender === gender;
                                            return (_jsx(TouchableOpacity, Object.assign({ style: [Styles.choiceChip, active && Styles.choiceChipActive], onPress: () => setSelectedGender(gender), testID: `upload-gender-${String(gender).toLowerCase()}` }, { children: _jsx(Text, Object.assign({ style: [Styles.choiceChipText, active && Styles.choiceChipTextActive] }, { children: gender })) }), gender));
                                        }) }))] })), _jsxs(View, Object.assign({ style: Styles.modalSection }, { children: [_jsx(Text, Object.assign({ style: Styles.modalLabel }, { children: t('Division') })), _jsx(View, Object.assign({ style: Styles.choiceRow }, { children: DIVISIONS.map((division) => {
                                            const active = selectedDivision === division;
                                            return (_jsx(TouchableOpacity, Object.assign({ style: [Styles.choiceChip, active && Styles.choiceChipActive], onPress: () => setSelectedDivision(division), testID: `upload-division-${String(division).toLowerCase()}` }, { children: _jsx(Text, Object.assign({ style: [Styles.choiceChipText, active && Styles.choiceChipTextActive] }, { children: division })) }), division));
                                        }) }))] })), _jsxs(View, Object.assign({ style: Styles.modalActions }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.modalGhost, onPress: () => setCategoryModalVisible(false) }, { children: _jsx(Text, Object.assign({ style: Styles.modalGhostText }, { children: t('Cancel') })) })), _jsx(TouchableOpacity, Object.assign({ style: [Styles.modalPrimary, (!selectedGender || !selectedDivision) && Styles.modalPrimaryDisabled], disabled: !selectedGender || !selectedDivision, onPress: handleContinue, testID: "upload-discipline-continue" }, { children: _jsx(Text, Object.assign({ style: Styles.modalPrimaryText }, { children: t('Continue') })) }))] }))] })) })) }))] })));
};
export default CompetitionDetailsScreen;
