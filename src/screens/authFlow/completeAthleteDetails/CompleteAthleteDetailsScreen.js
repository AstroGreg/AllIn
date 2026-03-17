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
import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import { ArrowLeft2, Buildings, CloseCircle, Global, Profile2User, User } from 'iconsax-react-nativejs';
import { createStyles } from './CompleteAthleteDetailsScreenStyles';
import SizeBox from '../../../constants/SizeBox';
import Images from '../../../constants/Images';
import Icons from '../../../constants/Icons';
import ChestNumbersByYearField from '../../../components/profile/ChestNumbersByYearField';
import SearchPickerModal from '../../../components/profile/SearchPickerModal';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { ApiError, getGroup, searchClubs, searchGroups, } from '../../../services/apiGateway';
import { buildDisciplineSearchOptions, focusUsesChestNumbers, getChestNumberFieldLabel, getDisciplineLabel, getFocusDisciplineModalTitle, getFocusMainDisciplineLabel, getOfficialClubFieldLabel, getOfficialClubHelperText, getOfficialClubModalTitle, getOfficialClubPlaceholder, getOfficialClubSearchFocuses, getSportFocusLabel, getTrainingGroupFieldLabel, getTrainingGroupModalTitle, getTrainingGroupPlaceholder, normalizeMainDisciplines, normalizeSelectedEvents, } from '../../../utils/profileSelections';
import { buildBottomTabUserProfileReset } from '../../../utils/navigationResets';
const CompleteAthleteDetailsScreen = ({ navigation, route }) => {
    var _a, _b, _c, _d, _e, _f, _g;
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const { updateUserProfile, apiAccessToken, userProfile } = useAuth();
    const persistedSelectedFocuses = useMemo(() => { var _a, _b; return normalizeSelectedEvents((_b = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.selectedEvents) !== null && _b !== void 0 ? _b : []); }, [(_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.selectedEvents]);
    const existingSelectedFocuses = useMemo(() => { var _a; return normalizeSelectedEvents((_a = userProfile === null || userProfile === void 0 ? void 0 : userProfile.selectedEvents) !== null && _a !== void 0 ? _a : []); }, [userProfile === null || userProfile === void 0 ? void 0 : userProfile.selectedEvents]);
    const flowSelectedFocuses = useMemo(() => { var _a, _b, _c, _d; return normalizeSelectedEvents((_d = (_b = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.flowSelectedEvents) !== null && _b !== void 0 ? _b : (_c = route === null || route === void 0 ? void 0 : route.params) === null || _c === void 0 ? void 0 : _c.selectedEvents) !== null && _d !== void 0 ? _d : []); }, [(_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.flowSelectedEvents, (_c = route === null || route === void 0 ? void 0 : route.params) === null || _c === void 0 ? void 0 : _c.selectedEvents]);
    const selectedFocuses = flowSelectedFocuses.length > 0 ? flowSelectedFocuses : persistedSelectedFocuses;
    const currentYear = useMemo(() => String(new Date().getFullYear()), []);
    const showsChestNumbers = useMemo(() => selectedFocuses.some((focusId) => focusUsesChestNumbers(focusId)), [selectedFocuses]);
    const initialMainDisciplines = useMemo(() => {
        var _a, _b, _c;
        return normalizeMainDisciplines((_a = userProfile === null || userProfile === void 0 ? void 0 : userProfile.mainDisciplines) !== null && _a !== void 0 ? _a : {}, {
            trackFieldMainEvent: (_b = userProfile === null || userProfile === void 0 ? void 0 : userProfile.trackFieldMainEvent) !== null && _b !== void 0 ? _b : null,
            roadTrailMainEvent: (_c = userProfile === null || userProfile === void 0 ? void 0 : userProfile.roadTrailMainEvent) !== null && _c !== void 0 ? _c : null,
        });
    }, [userProfile]);
    const clubSearchFocuses = useMemo(() => getOfficialClubSearchFocuses(selectedFocuses), [selectedFocuses]);
    const showOfficialClubField = clubSearchFocuses.length > 0;
    const officialClubHelperText = useMemo(() => getOfficialClubHelperText(selectedFocuses, t), [selectedFocuses, t]);
    const [chestNumbersByYear, setChestNumbersByYear] = useState((() => {
        const raw = userProfile === null || userProfile === void 0 ? void 0 : userProfile.chestNumbersByYear;
        if (!raw || typeof raw !== 'object' || Array.isArray(raw))
            return {};
        const out = {};
        Object.entries(raw).forEach(([year, chest]) => {
            const safeYear = String(year || '').trim();
            if (!/^\d{4}$/.test(safeYear))
                return;
            const parsed = Number(chest);
            if (!Number.isInteger(parsed) || parsed < 0)
                return;
            out[safeYear] = String(parsed);
        });
        return out;
    })());
    const [website, setWebsite] = useState(String((_d = userProfile === null || userProfile === void 0 ? void 0 : userProfile.website) !== null && _d !== void 0 ? _d : ''));
    const [clubName, setClubName] = useState(String((_f = (_e = userProfile === null || userProfile === void 0 ? void 0 : userProfile.trackFieldClub) !== null && _e !== void 0 ? _e : userProfile === null || userProfile === void 0 ? void 0 : userProfile.runningClub) !== null && _f !== void 0 ? _f : ''));
    const [clubId, setClubId] = useState('');
    const [runningGroupName, setRunningGroupName] = useState('');
    const [runningGroupId, setRunningGroupId] = useState(String((_g = userProfile === null || userProfile === void 0 ? void 0 : userProfile.runningClubGroupId) !== null && _g !== void 0 ? _g : ''));
    const [mainDisciplines, setMainDisciplines] = useState(initialMainDisciplines);
    const [isSaving, setIsSaving] = useState(false);
    const [isReviewing, setIsReviewing] = useState(false);
    const [clubModalVisible, setClubModalVisible] = useState(false);
    const [clubQuery, setClubQuery] = useState('');
    const [clubOptions, setClubOptions] = useState([]);
    const [clubsLoading, setClubsLoading] = useState(false);
    const [clubsError, setClubsError] = useState(null);
    const [groupModalVisible, setGroupModalVisible] = useState(false);
    const [groupQuery, setGroupQuery] = useState('');
    const [groupOptions, setGroupOptions] = useState([]);
    const [groupsLoading, setGroupsLoading] = useState(false);
    const [groupsError, setGroupsError] = useState(null);
    const [disciplineModalVisible, setDisciplineModalVisible] = useState(false);
    const [disciplineFocusId, setDisciplineFocusId] = useState(null);
    const [disciplineQuery, setDisciplineQuery] = useState('');
    const clubOptionsCacheRef = useRef({});
    const groupOptionsCacheRef = useRef({});
    const clubOptionsPromiseCacheRef = useRef({});
    const groupOptionsPromiseCacheRef = useRef({});
    const getClubCacheKey = (queryValue) => JSON.stringify({
        q: String(queryValue || '').trim().toLowerCase(),
        focuses: [...clubSearchFocuses].sort(),
    });
    const getGroupCacheKey = (queryValue) => String(queryValue || '').trim().toLowerCase();
    const mapClubOptions = (clubs = []) => clubs.map((club) => ({
        id: String(club.club_id || ''),
        title: String(club.name || club.code || '').trim(),
        subtitle: String(club.city || club.federation || club.code || '').trim() || null,
    })).filter((club) => club.id && club.title);
    const mapGroupOptions = (groups = []) => groups.map((group) => ({
        id: String(group.group_id || ''),
        title: String(group.name || '').trim(),
        subtitle: String(group.location || '').trim() || null,
    })).filter((group) => group.id && group.title);
    const fetchClubOptions = (queryValue, limit = 50) => __awaiter(void 0, void 0, void 0, function* () {
        const normalizedQuery = String(queryValue || '').trim();
        const cacheKey = getClubCacheKey(normalizedQuery);
        const cached = clubOptionsCacheRef.current[cacheKey];
        if (cached)
            return cached;
        const inFlight = clubOptionsPromiseCacheRef.current[cacheKey];
        if (inFlight)
            return inFlight;
        const pending = searchClubs(apiAccessToken, {
            q: normalizedQuery || undefined,
            focuses: clubSearchFocuses,
            limit,
        })
            .then((res) => {
            const mapped = mapClubOptions(res.clubs || []);
            clubOptionsCacheRef.current[cacheKey] = mapped;
            return mapped;
        })
            .finally(() => {
            delete clubOptionsPromiseCacheRef.current[cacheKey];
        });
        clubOptionsPromiseCacheRef.current[cacheKey] = pending;
        return pending;
    });
    const fetchGroupOptions = (queryValue, limit = 50) => __awaiter(void 0, void 0, void 0, function* () {
        const normalizedQuery = String(queryValue || '').trim();
        const cacheKey = getGroupCacheKey(normalizedQuery);
        const cached = groupOptionsCacheRef.current[cacheKey];
        if (cached)
            return cached;
        const inFlight = groupOptionsPromiseCacheRef.current[cacheKey];
        if (inFlight)
            return inFlight;
        const pending = searchGroups(apiAccessToken, {
            q: normalizedQuery || undefined,
            limit,
        })
            .then((res) => {
            const mapped = mapGroupOptions(res.groups || []);
            groupOptionsCacheRef.current[cacheKey] = mapped;
            return mapped;
        })
            .finally(() => {
            delete groupOptionsPromiseCacheRef.current[cacheKey];
        });
        groupOptionsPromiseCacheRef.current[cacheKey] = pending;
        return pending;
    });
    useEffect(() => {
        if (!apiAccessToken || !runningGroupId)
            return;
        let mounted = true;
        getGroup(apiAccessToken, runningGroupId)
            .then((response) => {
            var _a, _b;
            if (mounted)
                setRunningGroupName(String((_b = (_a = response === null || response === void 0 ? void 0 : response.group) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : ''));
        })
            .catch(() => {
            if (mounted)
                setRunningGroupName('');
        });
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, runningGroupId]);
    useEffect(() => {
        if (!apiAccessToken || clubSearchFocuses.length === 0)
            return;
        let mounted = true;
        const cacheKey = getClubCacheKey('');
        if (clubOptionsCacheRef.current[cacheKey])
            return;
        fetchClubOptions('', 50)
            .then((mapped) => {
            if (!mounted)
                return;
            if (!clubModalVisible && !clubQuery.trim())
                setClubOptions(mapped);
        })
            .catch(() => {
            // Best-effort prefetch only.
        });
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, clubModalVisible, clubQuery, clubSearchFocuses]);
    useEffect(() => {
        if (!apiAccessToken)
            return;
        const cacheKey = getGroupCacheKey('');
        if (groupOptionsCacheRef.current[cacheKey])
            return;
        let mounted = true;
        fetchGroupOptions('', 50)
            .then((mapped) => {
            if (!mounted)
                return;
            if (!groupModalVisible && !groupQuery.trim())
                setGroupOptions(mapped);
        })
            .catch(() => {
            // Best-effort prefetch only.
        });
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, groupModalVisible, groupQuery]);
    useEffect(() => {
        if (!clubModalVisible || !apiAccessToken)
            return;
        const normalizedQuery = clubQuery.trim();
        const cacheKey = getClubCacheKey(normalizedQuery);
        const cached = clubOptionsCacheRef.current[cacheKey];
        if (cached) {
            setClubOptions(cached);
            setClubsError(null);
            setClubsLoading(false);
            return;
        }
        let mounted = true;
        const timeout = setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            setClubsLoading(true);
            setClubsError(null);
            try {
                const mapped = yield fetchClubOptions(normalizedQuery, 50);
                if (!mounted)
                    return;
                setClubOptions(mapped);
            }
            catch (e) {
                if (!mounted)
                    return;
                const msg = e instanceof ApiError ? e.message : String((_a = e === null || e === void 0 ? void 0 : e.message) !== null && _a !== void 0 ? _a : e);
                setClubsError(msg);
                setClubOptions([]);
            }
            finally {
                if (mounted)
                    setClubsLoading(false);
            }
        }), normalizedQuery ? 120 : 0);
        return () => {
            mounted = false;
            clearTimeout(timeout);
        };
    }, [apiAccessToken, clubModalVisible, clubQuery, clubSearchFocuses]);
    useEffect(() => {
        if (!groupModalVisible || !apiAccessToken)
            return;
        const normalizedQuery = groupQuery.trim();
        const cacheKey = getGroupCacheKey(normalizedQuery);
        const cached = groupOptionsCacheRef.current[cacheKey];
        if (cached) {
            setGroupOptions(cached);
            setGroupsError(null);
            setGroupsLoading(false);
            return;
        }
        let mounted = true;
        const timeout = setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            setGroupsLoading(true);
            setGroupsError(null);
            try {
                const mapped = yield fetchGroupOptions(normalizedQuery, 50);
                if (!mounted)
                    return;
                setGroupOptions(mapped);
            }
            catch (e) {
                if (!mounted)
                    return;
                const msg = e instanceof ApiError ? e.message : String((_a = e === null || e === void 0 ? void 0 : e.message) !== null && _a !== void 0 ? _a : e);
                setGroupsError(msg);
                setGroupOptions([]);
            }
            finally {
                if (mounted)
                    setGroupsLoading(false);
            }
        }), normalizedQuery ? 120 : 0);
        return () => {
            mounted = false;
            clearTimeout(timeout);
        };
    }, [apiAccessToken, groupModalVisible, groupQuery]);
    const disciplineOptionsByFocus = useMemo(() => {
        return selectedFocuses.reduce((acc, focusId) => {
            acc[focusId] = buildDisciplineSearchOptions(focusId, t);
            return acc;
        }, {});
    }, [selectedFocuses, t]);
    const disciplineOptions = useMemo(() => {
        if (!disciplineFocusId)
            return [];
        const normalizedQuery = disciplineQuery.trim().toLowerCase();
        return (disciplineOptionsByFocus[disciplineFocusId] || []).filter((option) => {
            var _a;
            if (!normalizedQuery)
                return true;
            return `${option.title} ${(_a = option.subtitle) !== null && _a !== void 0 ? _a : ''}`.toLowerCase().includes(normalizedQuery);
        });
    }, [disciplineFocusId, disciplineOptionsByFocus, disciplineQuery]);
    const reviewRows = useMemo(() => {
        const rows = [];
        const focusValue = selectedFocuses.map((focusId) => getSportFocusLabel(focusId, t)).join(', ');
        if (focusValue)
            rows.push({ label: t('Sport focus'), value: focusValue });
        if (showsChestNumbers) {
            const chestValue = Object.entries(chestNumbersByYear)
                .sort(([a], [b]) => Number(b) - Number(a))
                .map(([year, chest]) => `${year}: ${chest}`)
                .join(' • ');
            if (chestValue)
                rows.push({ label: t('Chest number'), value: chestValue });
        }
        if (clubName.trim())
            rows.push({ label: getOfficialClubFieldLabel(selectedFocuses, t), value: clubName.trim() });
        if (runningGroupName.trim())
            rows.push({ label: getTrainingGroupFieldLabel(selectedFocuses, t), value: runningGroupName.trim() });
        selectedFocuses.forEach((focusId) => {
            const selectedDiscipline = String(mainDisciplines[focusId] || '').trim();
            if (!selectedDiscipline)
                return;
            rows.push({
                label: getFocusMainDisciplineLabel(focusId, t),
                value: getDisciplineLabel(focusId, selectedDiscipline, t),
            });
        });
        if (website.trim())
            rows.push({ label: t('Website'), value: website.trim() });
        return rows;
    }, [chestNumbersByYear, clubName, mainDisciplines, runningGroupName, selectedFocuses, showsChestNumbers, t, website]);
    const handleSkip = () => {
        setIsReviewing(true);
    };
    const handleFinish = () => __awaiter(void 0, void 0, void 0, function* () {
        var _h, _j, _k, _l;
        if (!isReviewing) {
            setIsReviewing(true);
            return;
        }
        setIsSaving(true);
        try {
            const nextSelectedEvents = Array.from(new Set([
                ...existingSelectedFocuses,
                ...persistedSelectedFocuses,
                ...flowSelectedFocuses,
            ]));
            const normalizedChest = Object.entries(chestNumbersByYear).reduce((acc, [year, chest]) => {
                const parsed = Number(chest);
                if (/^\d{4}$/.test(String(year)) && Number.isInteger(parsed) && parsed >= 0) {
                    acc[String(year)] = String(parsed);
                }
                return acc;
            }, {});
            const normalizedMainDisciplines = Object.entries(mainDisciplines).reduce((acc, [focusId, discipline]) => {
                const safeFocus = String(focusId || '').trim();
                const safeDiscipline = String(discipline || '').trim();
                if (!safeFocus || !safeDiscipline)
                    return acc;
                acc[safeFocus] = safeDiscipline;
                return acc;
            }, {});
            yield updateUserProfile({
                category: 'find',
                selectedEvents: nextSelectedEvents,
                chestNumbersByYear: normalizedChest,
                website: String(website || '').trim(),
                runningClub: String(clubName || '').trim(),
                trackFieldClub: String(clubName || '').trim(),
                runningClubGroupId: String(runningGroupId || '').trim(),
                trackFieldMainEvent: String(normalizedMainDisciplines['track-field'] || '').trim(),
                roadTrailMainEvent: String(normalizedMainDisciplines['road-events'] || '').trim(),
                mainDisciplines: normalizedMainDisciplines,
            });
            const targetFocus = (_k = (_j = (_h = flowSelectedFocuses[0]) !== null && _h !== void 0 ? _h : persistedSelectedFocuses[0]) !== null && _j !== void 0 ? _j : nextSelectedEvents[0]) !== null && _k !== void 0 ? _k : null;
            navigation.dispatch(CommonActions.reset(buildBottomTabUserProfileReset(targetFocus ? { forceProfileCategory: targetFocus } : undefined)));
        }
        catch (e) {
            Alert.alert(t('Error'), String((_l = e === null || e === void 0 ? void 0 : e.message) !== null && _l !== void 0 ? _l : t('Failed to save details. Please try again.')));
        }
        finally {
            setIsSaving(false);
        }
    });
    const clearClub = () => {
        setClubName('');
        setClubId('');
    };
    const clearRunningGroup = () => {
        setRunningGroupName('');
        setRunningGroupId('');
    };
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer, testID: "profile-complete-athlete-details-screen" }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.screenContent }, { children: [_jsx(View, Object.assign({ style: Styles.topBar }, { children: _jsx(TouchableOpacity, Object.assign({ testID: "complete-athlete-back-button", style: Styles.backButtonCircle, activeOpacity: 0.8, onPress: () => {
                                if (isReviewing) {
                                    setIsReviewing(false);
                                    return;
                                }
                                navigation.goBack();
                            } }, { children: _jsx(ArrowLeft2, { size: 22, color: colors.primaryColor, variant: "Linear" }) })) })), _jsxs(View, Object.assign({ style: Styles.heroSection }, { children: [_jsx(View, Object.assign({ style: Styles.imageContainer }, { children: _jsx(FastImage, { source: Images.signup4, style: Styles.headerImage, resizeMode: "contain" }) })), _jsx(SizeBox, { height: 18 }), _jsxs(View, Object.assign({ style: Styles.contentContainer }, { children: [_jsx(Text, Object.assign({ style: Styles.headingText }, { children: isReviewing ? t('Review your athlete profile') : t('Complete Your Athlete Details') })), _jsx(SizeBox, { height: 8 }), _jsx(Text, Object.assign({ style: Styles.subHeadingText }, { children: isReviewing
                                            ? t('Check the final details once before creating this athlete profile.')
                                            : t('Add the optional details you want on your athlete profile.') }))] }))] })), _jsx(View, Object.assign({ style: Styles.formViewport }, { children: isReviewing ? (_jsx(ScrollView, Object.assign({ testID: "profile-complete-athlete-details-scroll", style: Styles.formScroll, contentContainerStyle: Styles.formContent, showsVerticalScrollIndicator: false }, { children: _jsx(View, Object.assign({ style: Styles.formContainer }, { children: _jsx(View, Object.assign({ style: Styles.reviewCard, testID: "athlete-review-card" }, { children: reviewRows.length > 0 ? (reviewRows.map((row) => (_jsxs(View, Object.assign({ style: Styles.reviewRow }, { children: [_jsx(Text, Object.assign({ style: Styles.reviewLabel }, { children: row.label })), _jsx(Text, Object.assign({ style: Styles.reviewValue }, { children: row.value }))] }), `${row.label}-${row.value}`)))) : (_jsx(Text, Object.assign({ style: Styles.reviewHint }, { children: t('No optional details were added. You can still create this athlete profile now.') }))) })) })) }))) : (_jsx(ScrollView, Object.assign({ testID: "profile-complete-athlete-details-scroll", style: Styles.formScroll, contentContainerStyle: Styles.formContent, showsVerticalScrollIndicator: false }, { children: _jsxs(View, Object.assign({ style: Styles.formContainer }, { children: [showsChestNumbers ? (_jsx(ChestNumbersByYearField, { currentYear: currentYear, values: chestNumbersByYear, onChange: setChestNumbersByYear, label: getChestNumberFieldLabel(currentYear, t), helperText: t('Add your current bib now, then add other years if you want to keep the history complete.'), addYearLabel: t('Add year'), moreYearsLabel: t('More years'), inputPlaceholder: t('Enter chest number') })) : null, showOfficialClubField ? (_jsxs(_Fragment, { children: [_jsx(Text, Object.assign({ style: Styles.clubFieldLabel }, { children: getOfficialClubFieldLabel(selectedFocuses, t) })), _jsxs(View, Object.assign({ style: Styles.clubFieldContainer }, { children: [_jsxs(TouchableOpacity, Object.assign({ testID: "profile-athlete-club-picker-open", style: Styles.clubFieldTapArea, activeOpacity: 0.8, onPress: () => setClubModalVisible(true) }, { children: [_jsxs(View, Object.assign({ style: Styles.clubFieldLeft }, { children: [_jsx(Buildings, { size: 16, color: colors.primaryColor }), _jsx(SizeBox, { width: 10 }), _jsx(Text, Object.assign({ style: clubName ? Styles.clubFieldText : Styles.clubFieldPlaceholder }, { children: clubName || getOfficialClubPlaceholder(selectedFocuses, t) }))] })), _jsx(Icons.Dropdown, { height: 20, width: 20 })] })), clubName ? (_jsx(TouchableOpacity, Object.assign({ style: Styles.clubClearButton, activeOpacity: 0.8, onPress: clearClub }, { children: _jsx(CloseCircle, { size: 18, color: colors.grayColor }) }))) : null] }))] })) : officialClubHelperText ? (_jsx(Text, Object.assign({ style: Styles.helperTextLeft }, { children: officialClubHelperText }))) : null, _jsx(Text, Object.assign({ style: Styles.clubFieldLabel }, { children: getTrainingGroupFieldLabel(selectedFocuses, t) })), _jsxs(View, Object.assign({ style: Styles.clubFieldContainer }, { children: [_jsxs(TouchableOpacity, Object.assign({ testID: "profile-athlete-group-picker-open", style: Styles.clubFieldTapArea, activeOpacity: 0.8, onPress: () => setGroupModalVisible(true) }, { children: [_jsxs(View, Object.assign({ style: Styles.clubFieldLeft }, { children: [_jsx(Profile2User, { size: 16, color: colors.primaryColor }), _jsx(SizeBox, { width: 10 }), _jsx(Text, Object.assign({ style: runningGroupName ? Styles.clubFieldText : Styles.clubFieldPlaceholder }, { children: runningGroupName || getTrainingGroupPlaceholder(selectedFocuses, t) }))] })), _jsx(Icons.Dropdown, { height: 20, width: 20 })] })), runningGroupName ? (_jsx(TouchableOpacity, Object.assign({ style: Styles.clubClearButton, activeOpacity: 0.8, onPress: clearRunningGroup }, { children: _jsx(CloseCircle, { size: 18, color: colors.grayColor }) }))) : null] })), selectedFocuses.map((focusId) => {
                                        const selectedDiscipline = String(mainDisciplines[focusId] || '').trim();
                                        return (_jsxs(View, { children: [_jsx(Text, Object.assign({ style: Styles.clubFieldLabel }, { children: getFocusMainDisciplineLabel(focusId, t) })), _jsxs(View, Object.assign({ style: Styles.clubFieldContainer }, { children: [_jsxs(TouchableOpacity, Object.assign({ testID: `profile-athlete-discipline-picker-open-${focusId}`, style: Styles.clubFieldTapArea, activeOpacity: 0.8, onPress: () => {
                                                                setDisciplineFocusId(focusId);
                                                                setDisciplineQuery('');
                                                                setDisciplineModalVisible(true);
                                                            } }, { children: [_jsxs(View, Object.assign({ style: Styles.clubFieldLeft }, { children: [_jsx(User, { size: 16, color: colors.primaryColor }), _jsx(SizeBox, { width: 10 }), _jsx(Text, Object.assign({ style: selectedDiscipline ? Styles.clubFieldText : Styles.clubFieldPlaceholder }, { children: selectedDiscipline ? getDisciplineLabel(focusId, selectedDiscipline, t) : t('Choose main discipline') }))] })), _jsx(Icons.Dropdown, { height: 20, width: 20 })] })), selectedDiscipline ? (_jsx(TouchableOpacity, Object.assign({ style: Styles.clubClearButton, activeOpacity: 0.8, onPress: () => setMainDisciplines((prev) => {
                                                                const next = Object.assign({}, prev);
                                                                delete next[focusId];
                                                                return next;
                                                            }) }, { children: _jsx(CloseCircle, { size: 18, color: colors.grayColor }) }))) : null] }))] }, focusId));
                                    }), _jsx(Text, Object.assign({ style: Styles.clubFieldLabel }, { children: t('Website (optional)') })), _jsxs(View, Object.assign({ style: Styles.clubFieldContainer }, { children: [_jsx(Global, { size: 16, color: colors.primaryColor }), _jsx(SizeBox, { width: 10 }), _jsx(TextInput, { testID: "athlete-website-input", style: Styles.websiteInput, value: website, onChangeText: setWebsite, placeholder: t('Add website'), placeholderTextColor: colors.grayColor, keyboardType: "url", autoCapitalize: "none", autoCorrect: false })] })), _jsx(Text, Object.assign({ style: Styles.helperTextLeft }, { children: t('Website appears at the bottom of the profile and stays optional.') }))] })) }))) }))] })), _jsxs(View, Object.assign({ style: [Styles.buttonContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }] }, { children: [_jsx(TouchableOpacity, Object.assign({ testID: isReviewing ? 'athlete-review-back-button' : 'athlete-skip-button', style: Styles.skipButton, onPress: isReviewing ? () => setIsReviewing(false) : handleSkip }, { children: _jsx(Text, Object.assign({ style: Styles.skipButtonText }, { children: isReviewing ? t('Back') : t('Skip') })) })), _jsx(TouchableOpacity, Object.assign({ testID: isReviewing ? 'athlete-create-profile-button' : 'athlete-finish-button', style: Styles.finishButton, onPress: handleFinish, disabled: isSaving }, { children: isSaving ? (_jsx(ActivityIndicator, { size: "small", color: colors.pureWhite })) : (_jsx(Text, Object.assign({ style: Styles.finishButtonText }, { children: isReviewing ? t('Create profile') : t('Review') }))) }))] })), clubModalVisible && !clubsLoading && (clubOptions.length > 0 || Boolean(clubsError)) ? (_jsx(View, { testID: "profile-athlete-club-picker-ready", style: { position: 'absolute', width: 1, height: 1, opacity: 0 } })) : null, !clubModalVisible && !clubsLoading && clubOptions.length > 0 ? (_jsx(View, { testID: "profile-athlete-club-prefetch-ready", style: { position: 'absolute', width: 1, height: 1, opacity: 0 } })) : null, groupModalVisible && !groupsLoading && (groupOptions.length > 0 || Boolean(groupsError)) ? (_jsx(View, { testID: "profile-athlete-group-picker-ready", style: { position: 'absolute', width: 1, height: 1, opacity: 0 } })) : null, !groupModalVisible && !groupsLoading && groupOptions.length > 0 ? (_jsx(View, { testID: "profile-athlete-group-prefetch-ready", style: { position: 'absolute', width: 1, height: 1, opacity: 0 } })) : null, disciplineModalVisible && disciplineOptions.length > 0 ? (_jsx(View, { testID: "profile-athlete-discipline-picker-ready", style: { position: 'absolute', width: 1, height: 1, opacity: 0 } })) : null, !disciplineModalVisible && Object.keys(disciplineOptionsByFocus).length > 0 ? (_jsx(View, { testID: "profile-athlete-discipline-prefetch-ready", style: { position: 'absolute', width: 1, height: 1, opacity: 0 } })) : null, _jsx(SearchPickerModal, { visible: clubModalVisible, title: getOfficialClubModalTitle(selectedFocuses, t), placeholder: getOfficialClubPlaceholder(selectedFocuses, t), testIDPrefix: "profile-athlete-club-picker", query: clubQuery, onChangeQuery: setClubQuery, onClose: () => setClubModalVisible(false), options: clubOptions, loading: clubsLoading, error: clubsError, emptyText: t('No clubs found.'), selectedId: clubId, onSelect: (option) => {
                    setClubId(option.id);
                    setClubName(option.title);
                    setClubModalVisible(false);
                } }), _jsx(SearchPickerModal, { visible: groupModalVisible, title: getTrainingGroupModalTitle(selectedFocuses, t), placeholder: getTrainingGroupPlaceholder(selectedFocuses, t), testIDPrefix: "profile-athlete-group-picker", query: groupQuery, onChangeQuery: setGroupQuery, onClose: () => setGroupModalVisible(false), options: groupOptions, loading: groupsLoading, error: groupsError, emptyText: t('No groups found.'), selectedId: runningGroupId, onSelect: (option) => {
                    setRunningGroupId(option.id);
                    setRunningGroupName(option.title);
                    setGroupModalVisible(false);
                } }), _jsx(SearchPickerModal, { visible: disciplineModalVisible, title: disciplineFocusId ? getFocusDisciplineModalTitle(disciplineFocusId, t) : t('Disciplines'), placeholder: t('Search discipline'), testIDPrefix: "profile-athlete-discipline-picker", query: disciplineQuery, onChangeQuery: setDisciplineQuery, onClose: () => setDisciplineModalVisible(false), options: disciplineOptions, loading: false, emptyText: t('No disciplines found.'), selectedId: disciplineFocusId ? String(mainDisciplines[disciplineFocusId] || '') : '', onSelect: (option) => {
                    if (disciplineFocusId) {
                        setMainDisciplines((prev) => (Object.assign(Object.assign({}, prev), { [disciplineFocusId]: option.id })));
                    }
                    setDisciplineModalVisible(false);
                } })] })));
};
export default CompleteAthleteDetailsScreen;
