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
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft2, Buildings, CloseCircle, Global, Profile2User, User } from 'iconsax-react-nativejs';
import { createStyles } from '../MenuStyles';
import SizeBox from '../../../constants/SizeBox';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { ApiError, getGroup, getProfileSummary, searchClubs, searchGroups, } from '../../../services/apiGateway';
import { useTranslation } from 'react-i18next';
import ChestNumbersByYearField from '../../../components/profile/ChestNumbersByYearField';
import SearchPickerModal from '../../../components/profile/SearchPickerModal';
import { buildDisciplineSearchOptions, focusUsesChestNumbers, getChestNumberFieldLabel, getDisciplineLabel, getFocusDisciplineModalTitle, getFocusMainDisciplineLabel, getMainDisciplineForFocus, getOfficialClubFieldLabel, getOfficialClubHelperText, getOfficialClubModalTitle, getOfficialClubPlaceholder, getOfficialClubSearchFocuses, getSportFocusLabel, getTrainingGroupFieldLabel, getTrainingGroupModalTitle, getTrainingGroupPlaceholder, normalizeFocusId, normalizeMainDisciplines, normalizeSelectedEvents, } from '../../../utils/profileSelections';
const normalizeChestByYear = (raw) => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw))
        return {};
    const out = {};
    for (const [year, chest] of Object.entries(raw)) {
        const safeYear = String(year !== null && year !== void 0 ? year : '').trim();
        if (!/^\d{4}$/.test(safeYear))
            continue;
        const parsed = Number(chest);
        if (!Number.isInteger(parsed) || parsed < 0)
            continue;
        out[safeYear] = String(parsed);
    }
    return out;
};
const TrackFieldSettings = ({ navigation, route }) => {
    var _a;
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const Styles = createStyles(colors);
    const { apiAccessToken, userProfile, updateUserProfile } = useAuth();
    const currentYear = useMemo(() => String(new Date().getFullYear()), []);
    const requestedFocusId = String(((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.focusId) || '').trim();
    const requestedFocus = useMemo(() => normalizeFocusId(requestedFocusId), [requestedFocusId]);
    const allSelectedFocuses = useMemo(() => {
        var _a;
        return normalizeSelectedEvents((_a = userProfile === null || userProfile === void 0 ? void 0 : userProfile.selectedEvents) !== null && _a !== void 0 ? _a : []);
    }, [userProfile === null || userProfile === void 0 ? void 0 : userProfile.selectedEvents]);
    const selectedFocuses = useMemo(() => {
        if (!requestedFocus)
            return allSelectedFocuses;
        return allSelectedFocuses.filter((focusId) => focusId === requestedFocus);
    }, [allSelectedFocuses, requestedFocus]);
    const focusToDelete = useMemo(() => {
        if (requestedFocus && allSelectedFocuses.includes(requestedFocus))
            return requestedFocus;
        if (selectedFocuses.length === 1)
            return selectedFocuses[0];
        return null;
    }, [allSelectedFocuses, requestedFocus, selectedFocuses]);
    const screenTitle = useMemo(() => {
        if (selectedFocuses.length === 1)
            return getSportFocusLabel(selectedFocuses[0], t);
        return t('Athlete details');
    }, [selectedFocuses, t]);
    const clubSearchFocuses = useMemo(() => getOfficialClubSearchFocuses(selectedFocuses), [selectedFocuses]);
    const showOfficialClubField = clubSearchFocuses.length > 0;
    const officialClubHelperText = useMemo(() => getOfficialClubHelperText(selectedFocuses, t), [selectedFocuses, t]);
    const [chestByYear, setChestByYear] = useState({});
    const [clubInput, setClubInput] = useState('');
    const [clubId, setClubId] = useState('');
    const [runningGroupName, setRunningGroupName] = useState('');
    const [runningGroupId, setRunningGroupId] = useState('');
    const [websiteInput, setWebsiteInput] = useState('');
    const [mainDisciplines, setMainDisciplines] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
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
    useEffect(() => {
        let active = true;
        (() => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5;
            const fallbackMainDisciplines = normalizeMainDisciplines((_a = userProfile === null || userProfile === void 0 ? void 0 : userProfile.mainDisciplines) !== null && _a !== void 0 ? _a : {}, {
                trackFieldMainEvent: (_b = userProfile === null || userProfile === void 0 ? void 0 : userProfile.trackFieldMainEvent) !== null && _b !== void 0 ? _b : null,
                roadTrailMainEvent: (_c = userProfile === null || userProfile === void 0 ? void 0 : userProfile.roadTrailMainEvent) !== null && _c !== void 0 ? _c : null,
            });
            if (!apiAccessToken) {
                if (!active)
                    return;
                setChestByYear(normalizeChestByYear((_d = userProfile === null || userProfile === void 0 ? void 0 : userProfile.chestNumbersByYear) !== null && _d !== void 0 ? _d : {}));
                setClubInput(String((_f = (_e = userProfile === null || userProfile === void 0 ? void 0 : userProfile.trackFieldClub) !== null && _e !== void 0 ? _e : userProfile === null || userProfile === void 0 ? void 0 : userProfile.runningClub) !== null && _f !== void 0 ? _f : ''));
                setRunningGroupId(String((_g = userProfile === null || userProfile === void 0 ? void 0 : userProfile.runningClubGroupId) !== null && _g !== void 0 ? _g : ''));
                setWebsiteInput(String((_h = userProfile === null || userProfile === void 0 ? void 0 : userProfile.website) !== null && _h !== void 0 ? _h : ''));
                setMainDisciplines(fallbackMainDisciplines);
                setIsLoading(false);
                return;
            }
            try {
                const summary = yield getProfileSummary(apiAccessToken);
                if (!active)
                    return;
                setChestByYear(normalizeChestByYear((_k = (_j = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _j === void 0 ? void 0 : _j.chest_numbers_by_year) !== null && _k !== void 0 ? _k : {}));
                setClubInput(String((_o = (_m = (_l = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _l === void 0 ? void 0 : _l.track_field_club) !== null && _m !== void 0 ? _m : userProfile === null || userProfile === void 0 ? void 0 : userProfile.trackFieldClub) !== null && _o !== void 0 ? _o : ''));
                setRunningGroupId(String((_r = (_q = (_p = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _p === void 0 ? void 0 : _p.running_club_group_id) !== null && _q !== void 0 ? _q : userProfile === null || userProfile === void 0 ? void 0 : userProfile.runningClubGroupId) !== null && _r !== void 0 ? _r : ''));
                setWebsiteInput(String((_u = (_t = (_s = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _s === void 0 ? void 0 : _s.website) !== null && _t !== void 0 ? _t : userProfile === null || userProfile === void 0 ? void 0 : userProfile.website) !== null && _u !== void 0 ? _u : ''));
                setMainDisciplines(normalizeMainDisciplines((_w = (_v = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _v === void 0 ? void 0 : _v.main_disciplines) !== null && _w !== void 0 ? _w : {}, {
                    trackFieldMainEvent: (_y = (_x = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _x === void 0 ? void 0 : _x.track_field_main_event) !== null && _y !== void 0 ? _y : null,
                    roadTrailMainEvent: (_0 = (_z = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _z === void 0 ? void 0 : _z.road_trail_main_event) !== null && _0 !== void 0 ? _0 : null,
                }));
            }
            catch (_6) {
                if (!active)
                    return;
                setChestByYear(normalizeChestByYear((_1 = userProfile === null || userProfile === void 0 ? void 0 : userProfile.chestNumbersByYear) !== null && _1 !== void 0 ? _1 : {}));
                setClubInput(String((_3 = (_2 = userProfile === null || userProfile === void 0 ? void 0 : userProfile.trackFieldClub) !== null && _2 !== void 0 ? _2 : userProfile === null || userProfile === void 0 ? void 0 : userProfile.runningClub) !== null && _3 !== void 0 ? _3 : ''));
                setRunningGroupId(String((_4 = userProfile === null || userProfile === void 0 ? void 0 : userProfile.runningClubGroupId) !== null && _4 !== void 0 ? _4 : ''));
                setWebsiteInput(String((_5 = userProfile === null || userProfile === void 0 ? void 0 : userProfile.website) !== null && _5 !== void 0 ? _5 : ''));
                setMainDisciplines(fallbackMainDisciplines);
            }
            finally {
                if (active)
                    setIsLoading(false);
            }
        }))();
        return () => {
            active = false;
        };
    }, [apiAccessToken, userProfile]);
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
        if (!clubModalVisible || !apiAccessToken)
            return;
        let mounted = true;
        const timeout = setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            setClubsLoading(true);
            setClubsError(null);
            try {
                const res = yield searchClubs(apiAccessToken, {
                    q: clubQuery.trim() || undefined,
                    focuses: clubSearchFocuses,
                    limit: 200,
                });
                if (!mounted)
                    return;
                const mapped = (res.clubs || []).map((club) => ({
                    id: String(club.club_id || ''),
                    title: String(club.name || club.code || '').trim(),
                    subtitle: String(club.city || club.federation || club.code || '').trim() || null,
                })).filter((club) => club.id && club.title);
                setClubOptions(mapped);
            }
            catch (e) {
                if (!mounted)
                    return;
                const message = e instanceof ApiError ? e.message : String((_a = e === null || e === void 0 ? void 0 : e.message) !== null && _a !== void 0 ? _a : e);
                setClubsError(message);
                setClubOptions([]);
            }
            finally {
                if (mounted)
                    setClubsLoading(false);
            }
        }), 250);
        return () => {
            mounted = false;
            clearTimeout(timeout);
        };
    }, [apiAccessToken, clubModalVisible, clubQuery, clubSearchFocuses]);
    useEffect(() => {
        if (!groupModalVisible || !apiAccessToken)
            return;
        let mounted = true;
        const timeout = setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            setGroupsLoading(true);
            setGroupsError(null);
            try {
                const res = yield searchGroups(apiAccessToken, {
                    q: groupQuery.trim() || undefined,
                    limit: 200,
                });
                if (!mounted)
                    return;
                const mapped = (res.groups || []).map((group) => ({
                    id: String(group.group_id || ''),
                    title: String(group.name || '').trim(),
                    subtitle: String(group.location || '').trim() || null,
                })).filter((group) => group.id && group.title);
                setGroupOptions(mapped);
            }
            catch (e) {
                if (!mounted)
                    return;
                const message = e instanceof ApiError ? e.message : String((_a = e === null || e === void 0 ? void 0 : e.message) !== null && _a !== void 0 ? _a : e);
                setGroupsError(message);
                setGroupOptions([]);
            }
            finally {
                if (mounted)
                    setGroupsLoading(false);
            }
        }), 250);
        return () => {
            mounted = false;
            clearTimeout(timeout);
        };
    }, [apiAccessToken, groupModalVisible, groupQuery]);
    const disciplineOptions = useMemo(() => {
        if (!disciplineFocusId)
            return [];
        const normalizedQuery = disciplineQuery.trim().toLowerCase();
        return buildDisciplineSearchOptions(disciplineFocusId, t).filter((option) => {
            var _a;
            if (!normalizedQuery)
                return true;
            const haystack = `${option.title} ${(_a = option.subtitle) !== null && _a !== void 0 ? _a : ''}`.toLowerCase();
            return haystack.includes(normalizedQuery);
        });
    }, [disciplineFocusId, disciplineQuery, t]);
    const handleSave = () => __awaiter(void 0, void 0, void 0, function* () {
        var _b;
        const payloadChest = Object.entries(chestByYear).reduce((acc, [year, chest]) => {
            const parsed = Number(chest);
            if (/^\d{4}$/.test(year) && Number.isInteger(parsed) && parsed >= 0)
                acc[year] = parsed;
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
        setIsSaving(true);
        try {
            yield updateUserProfile({
                chestNumbersByYear: Object.entries(payloadChest).reduce((acc, [year, chest]) => {
                    acc[year] = String(chest);
                    return acc;
                }, {}),
                trackFieldClub: String(clubInput || '').trim(),
                runningClub: String(clubInput || '').trim(),
                runningClubGroupId: String(runningGroupId || '').trim(),
                trackFieldMainEvent: normalizedMainDisciplines['track-field'] || '',
                roadTrailMainEvent: normalizedMainDisciplines['road-events'] || '',
                mainDisciplines: normalizedMainDisciplines,
                website: String(websiteInput || '').trim(),
            }, { persistLocally: false });
            navigation.goBack();
        }
        catch (e) {
            const message = e instanceof ApiError ? e.message : String((_b = e === null || e === void 0 ? void 0 : e.message) !== null && _b !== void 0 ? _b : e);
            Alert.alert(t('Save failed'), message || t('Please try again'));
        }
        finally {
            setIsSaving(false);
        }
    });
    const handleDeleteFocus = () => {
        if (!focusToDelete || isDeleting || isSaving)
            return;
        const focusLabel = getSportFocusLabel(focusToDelete, t);
        Alert.alert(t('Delete sport focus'), t('Do you want to remove {{focus}} from your athlete profile?', { focus: focusLabel }), [
            { text: t('Cancel'), style: 'cancel' },
            {
                text: t('Delete'),
                style: 'destructive',
                onPress: () => __awaiter(void 0, void 0, void 0, function* () {
                    var _a, _b;
                    setIsDeleting(true);
                    try {
                        const nextSelectedFocuses = allSelectedFocuses.filter((focusId) => focusId !== focusToDelete);
                        const nextMainDisciplines = Object.entries(mainDisciplines).reduce((acc, [focusId, discipline]) => {
                            const focusKey = String(focusId).trim();
                            if (focusKey === focusToDelete)
                                return acc;
                            const safeFocus = String(focusId || '').trim();
                            const safeDiscipline = String(discipline || '').trim();
                            if (!safeFocus || !safeDiscipline)
                                return acc;
                            acc[safeFocus] = safeDiscipline;
                            return acc;
                        }, {});
                        const nextChestByYear = nextSelectedFocuses.some((focusId) => focusUsesChestNumbers(focusId))
                            ? chestByYear
                            : {};
                        yield updateUserProfile({
                            selectedEvents: nextSelectedFocuses,
                            mainDisciplines: nextMainDisciplines,
                            trackFieldMainEvent: focusToDelete === 'track-field'
                                ? ''
                                : String(nextMainDisciplines['track-field'] || '').trim(),
                            roadTrailMainEvent: focusToDelete === 'road-events'
                                ? ''
                                : String(nextMainDisciplines['road-events'] || '').trim(),
                            chestNumbersByYear: nextChestByYear,
                        });
                        navigation.goBack();
                    }
                    catch (e) {
                        const message = e instanceof ApiError ? e.message : String((_a = e === null || e === void 0 ? void 0 : e.message) !== null && _a !== void 0 ? _a : e);
                        Alert.alert(t('Delete failed'), message || t('Please try again'));
                    }
                    finally {
                        setIsDeleting(false);
                    }
                }),
            },
        ]);
    };
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: screenTitle })), _jsx(View, { style: Styles.headerSpacer })] })), _jsxs(ScrollView, Object.assign({ style: Styles.container, showsVerticalScrollIndicator: false }, { children: [_jsx(SizeBox, { height: 24 }), isLoading ? (_jsx(ActivityIndicator, { color: colors.primaryColor })) : (_jsxs(_Fragment, { children: [selectedFocuses.length === 0 ? (_jsxs(_Fragment, { children: [_jsx(Text, Object.assign({ style: Styles.inlineHelperText }, { children: t('Add an athlete focus first to edit athlete details.') })), _jsx(SizeBox, { height: 14 })] })) : null, selectedFocuses.some((focusId) => focusUsesChestNumbers(focusId)) ? (_jsxs(_Fragment, { children: [_jsx(ChestNumbersByYearField, { currentYear: currentYear, values: chestByYear, onChange: setChestByYear, label: getChestNumberFieldLabel(currentYear, t), helperText: t('Keep the current year up to date and add older years only when you want them shown on the profile.'), addYearLabel: t('Add year'), moreYearsLabel: t('More years'), inputPlaceholder: t('Enter chest number') }), _jsx(SizeBox, { height: 14 })] })) : null, showOfficialClubField ? (_jsxs(_Fragment, { children: [_jsxs(View, Object.assign({ style: Styles.addCardInputGroup }, { children: [_jsx(Text, Object.assign({ style: Styles.addCardLabel }, { children: getOfficialClubFieldLabel(selectedFocuses, t) })), _jsx(SizeBox, { height: 8 }), _jsxs(View, Object.assign({ style: Styles.addCardInputContainer }, { children: [_jsxs(TouchableOpacity, Object.assign({ style: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }, activeOpacity: 0.85, onPress: () => setClubModalVisible(true) }, { children: [_jsx(Buildings, { size: 20, color: colors.primaryColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: [Styles.addCardPlaceholder, clubInput ? Styles.addCardInputText : null] }, { children: clubInput || getOfficialClubPlaceholder(selectedFocuses, t) }))] })), clubInput ? (_jsx(TouchableOpacity, Object.assign({ onPress: () => { setClubInput(''); setClubId(''); } }, { children: _jsx(CloseCircle, { size: 18, color: colors.grayColor }) }))) : null] }))] })), _jsx(SizeBox, { height: 14 })] })) : officialClubHelperText ? (_jsxs(_Fragment, { children: [_jsx(Text, Object.assign({ style: Styles.inlineHelperText }, { children: officialClubHelperText })), _jsx(SizeBox, { height: 14 })] })) : null, _jsxs(View, Object.assign({ style: Styles.addCardInputGroup }, { children: [_jsx(Text, Object.assign({ style: Styles.addCardLabel }, { children: getTrainingGroupFieldLabel(selectedFocuses, t) })), _jsx(SizeBox, { height: 8 }), _jsxs(View, Object.assign({ style: Styles.addCardInputContainer }, { children: [_jsxs(TouchableOpacity, Object.assign({ style: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }, activeOpacity: 0.85, onPress: () => setGroupModalVisible(true) }, { children: [_jsx(Profile2User, { size: 20, color: colors.primaryColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: [Styles.addCardPlaceholder, runningGroupName ? Styles.addCardInputText : null] }, { children: runningGroupName || getTrainingGroupPlaceholder(selectedFocuses, t) }))] })), runningGroupName ? (_jsx(TouchableOpacity, Object.assign({ onPress: () => { setRunningGroupName(''); setRunningGroupId(''); } }, { children: _jsx(CloseCircle, { size: 18, color: colors.grayColor }) }))) : null] }))] })), _jsx(SizeBox, { height: 14 }), selectedFocuses.map((focusId) => {
                                var _a, _b;
                                const currentDiscipline = getMainDisciplineForFocus(mainDisciplines, focusId, {
                                    trackFieldMainEvent: (_a = mainDisciplines['track-field']) !== null && _a !== void 0 ? _a : '',
                                    roadTrailMainEvent: (_b = mainDisciplines['road-events']) !== null && _b !== void 0 ? _b : '',
                                });
                                const currentDisciplineLabel = currentDiscipline
                                    ? getDisciplineLabel(focusId, currentDiscipline, t)
                                    : '';
                                return (_jsxs(React.Fragment, { children: [_jsxs(View, Object.assign({ style: Styles.addCardInputGroup }, { children: [_jsx(Text, Object.assign({ style: Styles.addCardLabel }, { children: getFocusMainDisciplineLabel(focusId, t) })), _jsx(SizeBox, { height: 8 }), _jsxs(View, Object.assign({ style: Styles.addCardInputContainer }, { children: [_jsxs(TouchableOpacity, Object.assign({ style: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }, activeOpacity: 0.85, onPress: () => {
                                                                setDisciplineFocusId(focusId);
                                                                setDisciplineQuery('');
                                                                setDisciplineModalVisible(true);
                                                            } }, { children: [_jsx(User, { size: 20, color: colors.primaryColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: [Styles.addCardPlaceholder, currentDiscipline ? Styles.addCardInputText : null] }, { children: currentDisciplineLabel || t('Choose main discipline') }))] })), currentDiscipline ? (_jsx(TouchableOpacity, Object.assign({ onPress: () => setMainDisciplines((prev) => {
                                                                const next = Object.assign({}, prev);
                                                                delete next[focusId];
                                                                return next;
                                                            }) }, { children: _jsx(CloseCircle, { size: 18, color: colors.grayColor }) }))) : null] }))] })), _jsx(SizeBox, { height: 14 })] }, focusId));
                            }), _jsxs(View, Object.assign({ style: Styles.addCardInputGroup }, { children: [_jsx(Text, Object.assign({ style: Styles.addCardLabel }, { children: t('Website (optional)') })), _jsx(SizeBox, { height: 8 }), _jsxs(View, Object.assign({ style: Styles.addCardInputContainer }, { children: [_jsx(Global, { size: 20, color: colors.primaryColor, variant: "Linear" }), _jsx(TextInput, { style: Styles.addCardInput, value: websiteInput, onChangeText: setWebsiteInput, placeholder: t('Add website'), placeholderTextColor: colors.grayColor, autoCapitalize: "none", autoCorrect: false, keyboardType: "url" })] })), _jsx(Text, Object.assign({ style: Styles.inlineHelperText }, { children: t('Website appears at the bottom of the profile and stays optional.') }))] }))] })), _jsx(SizeBox, { height: 24 }), _jsx(TouchableOpacity, Object.assign({ style: [Styles.continueBtn, isSaving && { opacity: 0.6 }], disabled: isSaving || isDeleting, onPress: handleSave }, { children: isSaving ? (_jsx(ActivityIndicator, { size: "small", color: colors.pureWhite })) : (_jsx(Text, Object.assign({ style: Styles.continueBtnText }, { children: t('Save') }))) })), focusToDelete ? (_jsxs(_Fragment, { children: [_jsx(SizeBox, { height: 12 }), _jsx(TouchableOpacity, Object.assign({ testID: "delete-sport-focus-button", style: [Styles.continueBtn, { backgroundColor: colors.errorColor }, isDeleting && { opacity: 0.6 }], disabled: isDeleting || isSaving, onPress: handleDeleteFocus }, { children: isDeleting ? (_jsx(ActivityIndicator, { size: "small", color: colors.pureWhite })) : (_jsx(Text, Object.assign({ style: Styles.continueBtnText }, { children: t('Delete sport focus') }))) }))] })) : null, _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] })), _jsx(SearchPickerModal, { visible: clubModalVisible, title: getOfficialClubModalTitle(selectedFocuses, t), placeholder: getOfficialClubPlaceholder(selectedFocuses, t), query: clubQuery, onChangeQuery: setClubQuery, onClose: () => setClubModalVisible(false), options: clubOptions, loading: clubsLoading, error: clubsError, emptyText: t('No clubs found.'), selectedId: clubId, onSelect: (option) => {
                    setClubId(option.id);
                    setClubInput(option.title);
                    setClubModalVisible(false);
                } }), _jsx(SearchPickerModal, { visible: groupModalVisible, title: getTrainingGroupModalTitle(selectedFocuses, t), placeholder: getTrainingGroupPlaceholder(selectedFocuses, t), query: groupQuery, onChangeQuery: setGroupQuery, onClose: () => setGroupModalVisible(false), options: groupOptions, loading: groupsLoading, error: groupsError, emptyText: t('No groups found.'), selectedId: runningGroupId, onSelect: (option) => {
                    setRunningGroupId(option.id);
                    setRunningGroupName(option.title);
                    setGroupModalVisible(false);
                } }), _jsx(SearchPickerModal, { visible: disciplineModalVisible, title: disciplineFocusId ? getFocusDisciplineModalTitle(disciplineFocusId, t) : t('Disciplines'), placeholder: t('Search discipline'), query: disciplineQuery, onChangeQuery: setDisciplineQuery, onClose: () => setDisciplineModalVisible(false), options: disciplineOptions, loading: false, emptyText: t('No disciplines found.'), selectedId: disciplineFocusId ? getMainDisciplineForFocus(mainDisciplines, disciplineFocusId) : null, onSelect: (option) => {
                    if (disciplineFocusId) {
                        setMainDisciplines((prev) => (Object.assign(Object.assign({}, prev), { [disciplineFocusId]: option.id })));
                    }
                    setDisciplineModalVisible(false);
                } })] })));
};
export default TrackFieldSettings;
