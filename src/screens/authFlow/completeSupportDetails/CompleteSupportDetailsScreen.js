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
import { useEffect, useMemo, useState } from 'react';
import { CommonActions } from '@react-navigation/native';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Add, ArrowLeft2, CloseCircle, SearchNormal1 } from 'iconsax-react-nativejs';
import { createStyles } from '../completeAthleteDetails/CompleteAthleteDetailsScreenStyles';
import SearchPickerModal from '../../../components/profile/SearchPickerModal';
import SizeBox from '../../../constants/SizeBox';
import Icons from '../../../constants/Icons';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { searchClubs, searchGroups, searchProfiles, } from '../../../services/apiGateway';
import { getOfficialClubFieldLabel, getOfficialClubHelperText, getOfficialClubModalTitle, getOfficialClubPlaceholder, getOfficialClubSearchFocuses, getSportFocusDefinitions, getSportFocusLabel, getTrainingGroupFieldLabel, getTrainingGroupModalTitle, getTrainingGroupPlaceholder, normalizeSelectedEvents, } from '../../../utils/profileSelections';
import { buildBottomTabUserProfileReset } from '../../../utils/navigationResets';
const ROLES = ['Coach', 'Parent', 'Fysiotherapist', 'Fan'];
const CompleteSupportDetailsScreen = ({ navigation, route }) => {
    var _a, _b, _c, _d;
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const { updateUserProfile, apiAccessToken, userProfile } = useAuth();
    const editMode = Boolean((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.editMode);
    const initialSupportFocuses = useMemo(() => {
        var _a, _b, _c, _d, _e;
        const fromRoute = normalizeSelectedEvents((_d = (_b = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.supportFocuses) !== null && _b !== void 0 ? _b : (_c = route === null || route === void 0 ? void 0 : route.params) === null || _c === void 0 ? void 0 : _c.selectedEvents) !== null && _d !== void 0 ? _d : []);
        if (fromRoute.length > 0)
            return fromRoute;
        return normalizeSelectedEvents((_e = userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportFocuses) !== null && _e !== void 0 ? _e : []);
    }, [(_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.selectedEvents, (_c = route === null || route === void 0 ? void 0 : route.params) === null || _c === void 0 ? void 0 : _c.supportFocuses, userProfile]);
    const initialSelectedClubs = useMemo(() => {
        const hydrated = Array.isArray(userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportClubs) ? userProfile.supportClubs : [];
        if (hydrated.length > 0) {
            return hydrated.reduce((acc, club) => {
                var _a, _b, _c, _d;
                const code = String((_a = club === null || club === void 0 ? void 0 : club.code) !== null && _a !== void 0 ? _a : '').trim().toUpperCase();
                const name = String((_b = club === null || club === void 0 ? void 0 : club.name) !== null && _b !== void 0 ? _b : '').trim();
                if (!code || !name)
                    return acc;
                const subtitle = [String((_c = club === null || club === void 0 ? void 0 : club.city) !== null && _c !== void 0 ? _c : '').trim(), String((_d = club === null || club === void 0 ? void 0 : club.federation) !== null && _d !== void 0 ? _d : '').trim()].filter(Boolean).join(' · ');
                acc.push({
                    code,
                    name,
                    subtitle: subtitle || null,
                });
                return acc;
            }, []);
        }
        const codes = Array.isArray(userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportClubCodes)
            ? userProfile.supportClubCodes.map((entry) => String(entry !== null && entry !== void 0 ? entry : '').trim().toUpperCase()).filter(Boolean)
            : [];
        return codes.map((code) => ({ code, name: code }));
    }, [userProfile]);
    const initialSelectedGroups = useMemo(() => {
        const hydrated = Array.isArray(userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportGroups) ? userProfile.supportGroups : [];
        if (hydrated.length > 0) {
            return hydrated.reduce((acc, group) => {
                var _a, _b, _c, _d;
                const id = String((_a = group === null || group === void 0 ? void 0 : group.group_id) !== null && _a !== void 0 ? _a : '').trim();
                const name = String((_b = group === null || group === void 0 ? void 0 : group.name) !== null && _b !== void 0 ? _b : '').trim();
                if (!id || !name)
                    return acc;
                const subtitle = [String((_c = group === null || group === void 0 ? void 0 : group.role) !== null && _c !== void 0 ? _c : '').trim(), String((_d = group === null || group === void 0 ? void 0 : group.location) !== null && _d !== void 0 ? _d : '').trim()].filter(Boolean).join(' · ');
                acc.push({
                    id,
                    name,
                    subtitle: subtitle || null,
                });
                return acc;
            }, []);
        }
        const ids = Array.isArray(userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportGroupIds)
            ? userProfile.supportGroupIds.map((entry) => String(entry !== null && entry !== void 0 ? entry : '').trim()).filter(Boolean)
            : [];
        return ids.map((id) => ({ id, name: id }));
    }, [userProfile]);
    const initialSelectedAthletes = useMemo(() => {
        const names = Array.isArray(userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportAthletes)
            ? userProfile.supportAthletes.map((entry) => String(entry !== null && entry !== void 0 ? entry : '').trim()).filter(Boolean)
            : [];
        const profileIds = Array.isArray(userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportAthleteProfileIds)
            ? userProfile.supportAthleteProfileIds.map((entry) => String(entry !== null && entry !== void 0 ? entry : '').trim()).filter(Boolean)
            : [];
        return names.map((name, index) => {
            const profileId = profileIds[index];
            return {
                key: profileId ? `db:${profileId}` : `custom:${name.toLowerCase()}`,
                profileId,
                name,
                isCustom: !profileId,
            };
        });
    }, [userProfile]);
    const [supportRole, setSupportRole] = useState(String((_d = userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportRole) !== null && _d !== void 0 ? _d : 'Coach') || 'Coach');
    const supportFocuses = initialSupportFocuses;
    const [selectedClubs, setSelectedClubs] = useState(initialSelectedClubs);
    const [selectedGroups, setSelectedGroups] = useState(initialSelectedGroups);
    const [selectedAthletes, setSelectedAthletes] = useState(initialSelectedAthletes);
    const [clubPickerVisible, setClubPickerVisible] = useState(false);
    const [groupPickerVisible, setGroupPickerVisible] = useState(false);
    const [clubQuery, setClubQuery] = useState('');
    const [groupQuery, setGroupQuery] = useState('');
    const [clubOptions, setClubOptions] = useState([]);
    const [groupOptions, setGroupOptions] = useState([]);
    const [clubsLoading, setClubsLoading] = useState(false);
    const [groupsLoading, setGroupsLoading] = useState(false);
    const [clubsError, setClubsError] = useState(null);
    const [groupsError, setGroupsError] = useState(null);
    const [athleteQuery, setAthleteQuery] = useState('');
    const [athleteResults, setAthleteResults] = useState([]);
    const [isSearchingAthletes, setIsSearchingAthletes] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const clubSearchFocuses = useMemo(() => getOfficialClubSearchFocuses(supportFocuses), [supportFocuses]);
    const supportFocusLabel = useMemo(() => supportFocuses.map((focusId) => getSportFocusLabel(focusId, t)).join(' · '), [supportFocuses, t]);
    const clubLabel = useMemo(() => getOfficialClubFieldLabel(supportFocuses, t), [supportFocuses, t]);
    const clubPlaceholder = useMemo(() => getOfficialClubPlaceholder(supportFocuses, t), [supportFocuses, t]);
    const clubModalTitle = useMemo(() => getOfficialClubModalTitle(supportFocuses, t), [supportFocuses, t]);
    const clubHelperText = useMemo(() => getOfficialClubHelperText(supportFocuses, t), [supportFocuses, t]);
    const groupLabel = useMemo(() => getTrainingGroupFieldLabel(supportFocuses, t), [supportFocuses, t]);
    const groupPlaceholder = useMemo(() => getTrainingGroupPlaceholder(supportFocuses, t), [supportFocuses, t]);
    const groupModalTitle = useMemo(() => getTrainingGroupModalTitle(supportFocuses, t), [supportFocuses, t]);
    const selectedClubCodes = useMemo(() => new Set(selectedClubs.map((entry) => entry.code)), [selectedClubs]);
    const selectedGroupIds = useMemo(() => new Set(selectedGroups.map((entry) => entry.id)), [selectedGroups]);
    const normalizedSelectedAthleteNames = useMemo(() => new Set(selectedAthletes.map((entry) => entry.name.trim().toLowerCase()).filter(Boolean)), [selectedAthletes]);
    const localStyles = useMemo(() => StyleSheet.create({
        roleRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
        },
        roleButton: {
            borderWidth: 1,
            borderColor: colors.borderColor,
            backgroundColor: colors.secondaryColor,
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 10,
        },
        roleButtonSelected: {
            borderColor: colors.primaryColor,
            backgroundColor: colors.secondaryBlueColor,
        },
        roleButtonText: {
            color: colors.mainTextColor,
        },
        roleButtonTextSelected: {
            color: colors.primaryColor,
        },
        focusWrap: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
        },
        focusButton: {
            borderWidth: 1,
            borderColor: colors.borderColor,
            backgroundColor: colors.secondaryColor,
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 999,
        },
        focusButtonSelected: {
            borderColor: colors.primaryColor,
            backgroundColor: colors.secondaryBlueColor,
        },
        focusButtonText: {
            color: colors.mainTextColor,
            fontSize: 13,
        },
        focusButtonTextSelected: {
            color: colors.primaryColor,
            fontWeight: '600',
        },
        helperText: {
            color: colors.grayColor,
            fontSize: 12,
            lineHeight: 18,
        },
        selectorButton: {
            minHeight: 54,
            borderWidth: 1,
            borderRadius: 10,
            borderColor: colors.borderColor,
            backgroundColor: colors.secondaryColor,
            paddingHorizontal: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
        },
        selectorButtonDisabled: {
            opacity: 0.45,
        },
        selectorButtonTextWrap: {
            flex: 1,
            gap: 4,
        },
        selectorButtonTitle: {
            color: colors.mainTextColor,
            fontSize: 14,
        },
        selectorButtonSubtitle: {
            color: colors.grayColor,
            fontSize: 12,
        },
        chipsWrap: {
            marginTop: 10,
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
        },
        chip: {
            borderWidth: 1,
            borderColor: colors.primaryColor,
            backgroundColor: colors.secondaryBlueColor,
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 6,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            maxWidth: '100%',
        },
        chipTextWrap: {
            maxWidth: '92%',
        },
        chipText: {
            color: colors.primaryColor,
            fontSize: 12,
            fontWeight: '600',
        },
        chipSubText: {
            color: colors.primaryColor,
            fontSize: 10,
        },
        athleteInputRow: {
            minHeight: 54,
            borderWidth: 1,
            borderRadius: 10,
            borderColor: colors.borderColor,
            backgroundColor: colors.secondaryColor,
            color: colors.mainTextColor,
            paddingHorizontal: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
        },
        athleteInput: {
            flex: 1,
            color: colors.mainTextColor,
            paddingVertical: 12,
        },
        customActionButton: {
            alignSelf: 'flex-start',
            marginTop: 8,
            height: 34,
            borderRadius: 17,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderColor: colors.primaryColor,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: colors.secondaryBlueColor,
        },
        customActionButtonDisabled: {
            opacity: 0.45,
        },
        customActionText: {
            color: colors.primaryColor,
            fontWeight: '600',
            fontSize: 12,
        },
        resultsDropdown: {
            marginTop: 8,
            borderWidth: 0.5,
            borderColor: colors.lightGrayColor,
            borderRadius: 10,
            backgroundColor: colors.cardBackground,
            maxHeight: 190,
        },
        resultRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 12,
            paddingVertical: 11,
            borderBottomWidth: 0.5,
            borderBottomColor: colors.lightGrayColor,
        },
        resultRowLast: {
            borderBottomWidth: 0,
        },
        resultName: {
            color: colors.mainTextColor,
            flexShrink: 1,
            marginRight: 10,
        },
        resultMeta: {
            color: colors.grayColor,
            fontSize: 12,
            marginTop: 2,
        },
        selectedHint: {
            color: colors.grayColor,
            fontSize: 12,
            marginTop: 8,
        },
        headerContainer: {
            paddingHorizontal: 20,
        },
    }), [colors]);
    useEffect(() => {
        if (!clubPickerVisible || !apiAccessToken || clubSearchFocuses.length === 0) {
            setClubOptions([]);
            setClubsLoading(false);
            setClubsError(null);
            return;
        }
        let active = true;
        const handle = setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            setClubsLoading(true);
            setClubsError(null);
            try {
                const response = yield searchClubs(apiAccessToken, {
                    q: clubQuery.trim() || undefined,
                    limit: 30,
                    focuses: clubSearchFocuses,
                });
                if (!active)
                    return;
                const options = (Array.isArray(response === null || response === void 0 ? void 0 : response.clubs) ? response.clubs : []).reduce((acc, club) => {
                    var _a, _b, _c, _d;
                    const code = String((_a = club === null || club === void 0 ? void 0 : club.code) !== null && _a !== void 0 ? _a : '').trim().toUpperCase();
                    const name = String((_b = club === null || club === void 0 ? void 0 : club.name) !== null && _b !== void 0 ? _b : '').trim();
                    if (!code || !name || selectedClubCodes.has(code))
                        return acc;
                    const subtitle = [String((_c = club === null || club === void 0 ? void 0 : club.city) !== null && _c !== void 0 ? _c : '').trim(), String((_d = club === null || club === void 0 ? void 0 : club.federation) !== null && _d !== void 0 ? _d : '').trim()].filter(Boolean).join(' · ');
                    acc.push({
                        id: code,
                        title: name,
                        subtitle: subtitle || code,
                    });
                    return acc;
                }, []);
                setClubOptions(options);
            }
            catch (_a) {
                if (!active)
                    return;
                setClubOptions([]);
                setClubsError(t('Could not load clubs right now.'));
            }
            finally {
                if (active)
                    setClubsLoading(false);
            }
        }), 220);
        return () => {
            active = false;
            clearTimeout(handle);
        };
    }, [apiAccessToken, clubPickerVisible, clubQuery, clubSearchFocuses, selectedClubCodes, t]);
    useEffect(() => {
        if (!groupPickerVisible || !apiAccessToken) {
            setGroupOptions([]);
            setGroupsLoading(false);
            setGroupsError(null);
            return;
        }
        let active = true;
        const handle = setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            setGroupsLoading(true);
            setGroupsError(null);
            try {
                const response = yield searchGroups(apiAccessToken, {
                    q: groupQuery.trim() || undefined,
                    limit: 30,
                });
                if (!active)
                    return;
                const options = (Array.isArray(response === null || response === void 0 ? void 0 : response.groups) ? response.groups : []).reduce((acc, group) => {
                    var _a, _b, _c, _d;
                    const id = String((_a = group === null || group === void 0 ? void 0 : group.group_id) !== null && _a !== void 0 ? _a : '').trim();
                    const name = String((_b = group === null || group === void 0 ? void 0 : group.name) !== null && _b !== void 0 ? _b : '').trim();
                    if (!id || !name || selectedGroupIds.has(id))
                        return acc;
                    const subtitle = [String((_c = group === null || group === void 0 ? void 0 : group.location) !== null && _c !== void 0 ? _c : '').trim(), String((_d = group === null || group === void 0 ? void 0 : group.my_role) !== null && _d !== void 0 ? _d : '').trim()].filter(Boolean).join(' · ');
                    acc.push({
                        id,
                        title: name,
                        subtitle: subtitle || null,
                    });
                    return acc;
                }, []);
                setGroupOptions(options);
            }
            catch (_a) {
                if (!active)
                    return;
                setGroupOptions([]);
                setGroupsError(t('Could not load groups right now.'));
            }
            finally {
                if (active)
                    setGroupsLoading(false);
            }
        }), 220);
        return () => {
            active = false;
            clearTimeout(handle);
        };
    }, [apiAccessToken, groupPickerVisible, groupQuery, selectedGroupIds, t]);
    useEffect(() => {
        if (!apiAccessToken)
            return;
        const term = athleteQuery.trim();
        if (term.length < 2) {
            setAthleteResults([]);
            setIsSearchingAthletes(false);
            return;
        }
        let active = true;
        const handle = setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            setIsSearchingAthletes(true);
            try {
                const response = yield searchProfiles(apiAccessToken, { q: term, limit: 8 });
                if (!active)
                    return;
                const list = Array.isArray(response === null || response === void 0 ? void 0 : response.profiles) ? response.profiles : [];
                const filtered = list.filter((profile) => {
                    const profileId = String(profile.profile_id || '').trim();
                    const name = String(profile.display_name || '').trim().toLowerCase();
                    if (!profileId || !name)
                        return false;
                    if (normalizedSelectedAthleteNames.has(name))
                        return false;
                    return !selectedAthletes.some((entry) => entry.profileId && entry.profileId === profileId);
                });
                setAthleteResults(filtered);
            }
            catch (_a) {
                if (!active)
                    return;
                setAthleteResults([]);
            }
            finally {
                if (active)
                    setIsSearchingAthletes(false);
            }
        }), 260);
        return () => {
            active = false;
            clearTimeout(handle);
        };
    }, [apiAccessToken, athleteQuery, normalizedSelectedAthleteNames, selectedAthletes]);
    const addClub = (option) => {
        var _a;
        const code = String((_a = option.id) !== null && _a !== void 0 ? _a : '').trim().toUpperCase();
        if (!code || selectedClubCodes.has(code))
            return;
        setSelectedClubs((prev) => { var _a; return [...prev, { code, name: option.title, subtitle: (_a = option.subtitle) !== null && _a !== void 0 ? _a : null }]; });
        setClubPickerVisible(false);
        setClubQuery('');
    };
    const addGroup = (option) => {
        var _a;
        const id = String((_a = option.id) !== null && _a !== void 0 ? _a : '').trim();
        if (!id || selectedGroupIds.has(id))
            return;
        setSelectedGroups((prev) => { var _a; return [...prev, { id, name: option.title, subtitle: (_a = option.subtitle) !== null && _a !== void 0 ? _a : null }]; });
        setGroupPickerVisible(false);
        setGroupQuery('');
    };
    const removeClub = (code) => {
        setSelectedClubs((prev) => prev.filter((entry) => entry.code !== code));
    };
    const removeGroup = (id) => {
        setSelectedGroups((prev) => prev.filter((entry) => entry.id !== id));
    };
    const addAthleteFromProfile = (profile) => {
        const profileId = String(profile.profile_id || '').trim();
        const name = String(profile.display_name || '').trim();
        if (!profileId || !name)
            return;
        const normalized = name.toLowerCase();
        if (normalizedSelectedAthleteNames.has(normalized))
            return;
        setSelectedAthletes((prev) => [...prev, { key: `db:${profileId}`, profileId, name, isCustom: false }]);
        setAthleteQuery('');
        setAthleteResults([]);
    };
    const addCustomAthlete = () => {
        const name = athleteQuery.trim();
        if (name.length < 2)
            return;
        const normalized = name.toLowerCase();
        if (normalizedSelectedAthleteNames.has(normalized)) {
            setAthleteQuery('');
            return;
        }
        setSelectedAthletes((prev) => [...prev, { key: `custom:${normalized}`, name, isCustom: true }]);
        setAthleteQuery('');
        setAthleteResults([]);
    };
    const removeAthlete = (key) => {
        setSelectedAthletes((prev) => prev.filter((entry) => entry.key !== key));
    };
    const handleSkip = () => {
        void handleFinish();
    };
    const handleFinish = () => __awaiter(void 0, void 0, void 0, function* () {
        if (supportFocuses.length === 0) {
            Alert.alert(t('Missing sport focus'), t('Choose at least one sport focus.'));
            return;
        }
        setIsLoading(true);
        try {
            const linkedAthletes = selectedAthletes.map((entry) => entry.name.trim()).filter(Boolean);
            const linkedAthleteProfileIds = selectedAthletes.map((entry) => String(entry.profileId || '').trim()).filter(Boolean);
            yield updateUserProfile({
                category: 'support',
                supportRole,
                supportOrganization: '',
                supportBaseLocation: '',
                supportAthletes: linkedAthletes,
                supportAthleteProfileIds: linkedAthleteProfileIds,
                supportClubCodes: selectedClubs.map((entry) => entry.code),
                supportGroupIds: selectedGroups.map((entry) => entry.id),
                supportFocuses,
            });
            if (editMode) {
                navigation.goBack();
                return;
            }
            navigation.dispatch(CommonActions.reset(buildBottomTabUserProfileReset({ forceProfileCategory: 'support' })));
        }
        catch (_e) {
            Alert.alert(t('Error'), t('Failed to save details. Please try again.'));
        }
        finally {
            setIsLoading(false);
        }
    });
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsx(View, Object.assign({ style: Styles.topBar }, { children: _jsx(TouchableOpacity, Object.assign({ style: Styles.backButtonCircle, activeOpacity: 0.8, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 22, color: colors.primaryColor, variant: "Linear" }) })) })), _jsxs(View, Object.assign({ style: Styles.heroSection }, { children: [_jsx(Text, Object.assign({ style: Styles.headingText }, { children: t(editMode ? 'Edit Support Profile' : 'Complete Your Support Profile') })), _jsx(SizeBox, { height: 8 }), _jsx(Text, Object.assign({ style: Styles.subHeadingText }, { children: t('Your supported sports are already set. Add the role, clubs, groups, and athletes you want visible.') }))] })), _jsx(View, Object.assign({ style: Styles.formViewport }, { children: _jsxs(ScrollView, Object.assign({ style: Styles.formScroll, showsVerticalScrollIndicator: false, keyboardShouldPersistTaps: "handled", contentContainerStyle: Styles.formContent }, { children: [_jsxs(View, Object.assign({ style: Styles.formContainer }, { children: [_jsx(Text, Object.assign({ style: Styles.clubFieldLabel }, { children: t('Support role') })), _jsx(View, Object.assign({ style: localStyles.roleRow }, { children: ROLES.map((role) => {
                                        const selected = supportRole === role;
                                        return (_jsx(TouchableOpacity, Object.assign({ onPress: () => setSupportRole(role), style: [localStyles.roleButton, selected && localStyles.roleButtonSelected] }, { children: _jsx(Text, Object.assign({ style: selected ? localStyles.roleButtonTextSelected : localStyles.roleButtonText }, { children: role })) }), role));
                                    }) })), _jsx(Text, Object.assign({ style: Styles.clubFieldLabel }, { children: t('Sports you support') })), supportFocusLabel.length > 0 ? (_jsx(Text, Object.assign({ style: localStyles.helperText }, { children: supportFocusLabel }))) : null, _jsx(View, Object.assign({ style: localStyles.focusWrap }, { children: getSportFocusDefinitions()
                                        .filter((focus) => supportFocuses.includes(focus.id))
                                        .map((focus) => (_jsx(View, Object.assign({ style: [localStyles.focusButton, localStyles.focusButtonSelected] }, { children: _jsx(Text, Object.assign({ style: localStyles.focusButtonTextSelected }, { children: getSportFocusLabel(focus.id, t) })) }), focus.id))) })), _jsx(Text, Object.assign({ style: Styles.clubFieldLabel }, { children: clubLabel })), clubHelperText ? _jsx(Text, Object.assign({ style: localStyles.helperText }, { children: clubHelperText })) : null, _jsxs(TouchableOpacity, Object.assign({ style: [localStyles.selectorButton, clubSearchFocuses.length === 0 && localStyles.selectorButtonDisabled], activeOpacity: 0.85, disabled: clubSearchFocuses.length === 0, onPress: () => setClubPickerVisible(true) }, { children: [_jsxs(View, Object.assign({ style: localStyles.selectorButtonTextWrap }, { children: [_jsx(Text, Object.assign({ style: localStyles.selectorButtonTitle }, { children: t('Add official club') })), _jsx(Text, Object.assign({ style: localStyles.selectorButtonSubtitle }, { children: clubPlaceholder }))] })), _jsx(Add, { size: 18, color: colors.primaryColor })] })), selectedClubs.length > 0 ? (_jsx(View, Object.assign({ style: localStyles.chipsWrap }, { children: selectedClubs.map((club) => (_jsxs(TouchableOpacity, Object.assign({ style: localStyles.chip, onPress: () => removeClub(club.code) }, { children: [_jsxs(View, Object.assign({ style: localStyles.chipTextWrap }, { children: [_jsx(Text, Object.assign({ style: localStyles.chipText, numberOfLines: 1 }, { children: club.name })), club.subtitle ? _jsx(Text, Object.assign({ style: localStyles.chipSubText, numberOfLines: 1 }, { children: club.subtitle })) : null] })), _jsx(CloseCircle, { size: 14, color: colors.primaryColor })] }), club.code))) }))) : null, _jsx(Text, Object.assign({ style: Styles.clubFieldLabel }, { children: groupLabel })), _jsxs(TouchableOpacity, Object.assign({ style: localStyles.selectorButton, activeOpacity: 0.85, onPress: () => setGroupPickerVisible(true) }, { children: [_jsxs(View, Object.assign({ style: localStyles.selectorButtonTextWrap }, { children: [_jsx(Text, Object.assign({ style: localStyles.selectorButtonTitle }, { children: t('Add group') })), _jsx(Text, Object.assign({ style: localStyles.selectorButtonSubtitle }, { children: groupPlaceholder }))] })), _jsx(Add, { size: 18, color: colors.primaryColor })] })), selectedGroups.length > 0 ? (_jsx(View, Object.assign({ style: localStyles.chipsWrap }, { children: selectedGroups.map((group) => (_jsxs(TouchableOpacity, Object.assign({ style: localStyles.chip, onPress: () => removeGroup(group.id) }, { children: [_jsxs(View, Object.assign({ style: localStyles.chipTextWrap }, { children: [_jsx(Text, Object.assign({ style: localStyles.chipText, numberOfLines: 1 }, { children: group.name })), group.subtitle ? _jsx(Text, Object.assign({ style: localStyles.chipSubText, numberOfLines: 1 }, { children: group.subtitle })) : null] })), _jsx(CloseCircle, { size: 14, color: colors.primaryColor })] }), group.id))) }))) : null, _jsx(Text, Object.assign({ style: Styles.clubFieldLabel }, { children: t('Athletes you support') })), _jsx(Text, Object.assign({ style: localStyles.selectedHint }, { children: t('Search athlete profiles and add them one by one.') })), _jsxs(View, Object.assign({ style: localStyles.athleteInputRow }, { children: [_jsx(SearchNormal1, { size: 18, color: colors.primaryColor }), _jsx(TextInput, { value: athleteQuery, onChangeText: setAthleteQuery, placeholder: t('Search athlete name'), placeholderTextColor: colors.grayColor, style: localStyles.athleteInput, autoCapitalize: "words" })] })), _jsxs(TouchableOpacity, Object.assign({ style: [
                                        localStyles.customActionButton,
                                        athleteQuery.trim().length < 2 && localStyles.customActionButtonDisabled,
                                    ], onPress: addCustomAthlete, disabled: athleteQuery.trim().length < 2 }, { children: [_jsx(Add, { size: 14, color: colors.primaryColor }), _jsx(Text, Object.assign({ style: localStyles.customActionText }, { children: t('Add custom athlete') }))] })), (athleteQuery.trim().length >= 2 || athleteResults.length > 0) && (_jsx(View, Object.assign({ style: localStyles.resultsDropdown }, { children: isSearchingAthletes ? (_jsxs(View, Object.assign({ style: [localStyles.resultRow, localStyles.resultRowLast] }, { children: [_jsx(Text, Object.assign({ style: localStyles.resultName }, { children: t('Searching athletes...') })), _jsx(ActivityIndicator, { size: "small", color: colors.primaryColor })] }))) : athleteResults.length > 0 ? (athleteResults.map((profile, index) => (_jsxs(TouchableOpacity, Object.assign({ style: [localStyles.resultRow, index === athleteResults.length - 1 && localStyles.resultRowLast], onPress: () => addAthleteFromProfile(profile) }, { children: [_jsxs(View, Object.assign({ style: { flex: 1 } }, { children: [_jsx(Text, Object.assign({ style: localStyles.resultName }, { children: String(profile.display_name || t('Unnamed athlete')) })), _jsx(Text, Object.assign({ style: localStyles.resultMeta }, { children: t('Athlete profile') }))] })), _jsx(Add, { size: 16, color: colors.primaryColor })] }), profile.profile_id)))) : (_jsx(View, Object.assign({ style: [localStyles.resultRow, localStyles.resultRowLast] }, { children: _jsx(Text, Object.assign({ style: localStyles.resultName }, { children: t('No athletes found. Use custom add.') })) }))) }))), selectedAthletes.length > 0 ? (_jsx(View, Object.assign({ style: localStyles.chipsWrap }, { children: selectedAthletes.map((entry) => (_jsxs(TouchableOpacity, Object.assign({ style: localStyles.chip, onPress: () => removeAthlete(entry.key) }, { children: [_jsx(Text, Object.assign({ style: localStyles.chipText, numberOfLines: 1 }, { children: entry.name })), _jsx(CloseCircle, { size: 14, color: colors.primaryColor })] }), entry.key))) }))) : null] })), _jsx(SizeBox, { height: 20 })] })) })), _jsxs(View, Object.assign({ style: [Styles.buttonContainer, {
                        marginTop: 0,
                        paddingTop: 12,
                        paddingBottom: Math.max(insets.bottom, 14),
                        backgroundColor: colors.backgroundColor,
                    }] }, { children: [editMode ? (_jsx(TouchableOpacity, Object.assign({ style: Styles.skipButton, activeOpacity: 0.7, onPress: () => navigation.goBack() }, { children: _jsx(Text, Object.assign({ style: Styles.skipButtonText }, { children: t('Cancel') })) }))) : (_jsxs(TouchableOpacity, Object.assign({ style: Styles.skipButton, activeOpacity: 0.7, onPress: handleSkip }, { children: [_jsx(Text, Object.assign({ style: Styles.skipButtonText }, { children: t('Skip') })), _jsx(Icons.RightBtnIconGrey, { height: 18, width: 18 })] }))), _jsx(TouchableOpacity, Object.assign({ style: [Styles.finishButton, (isLoading || supportFocuses.length === 0) && { opacity: 0.5 }], activeOpacity: 0.7, onPress: handleFinish, disabled: isLoading || supportFocuses.length === 0 }, { children: isLoading ? (_jsx(ActivityIndicator, { size: "small", color: "#fff" })) : (_jsxs(_Fragment, { children: [_jsx(Text, Object.assign({ style: Styles.finishButtonText }, { children: t(editMode ? 'Save' : 'Finish') })), _jsx(Icons.RightBtnIcon, { height: 18, width: 18 })] })) }))] })), _jsx(SearchPickerModal, { visible: clubPickerVisible, title: clubModalTitle, placeholder: clubPlaceholder, query: clubQuery, onChangeQuery: setClubQuery, onClose: () => {
                    setClubPickerVisible(false);
                    setClubQuery('');
                }, options: clubOptions, loading: clubsLoading, error: clubsError, emptyText: t('No clubs found.'), onSelect: addClub }), _jsx(SearchPickerModal, { visible: groupPickerVisible, title: groupModalTitle, placeholder: groupPlaceholder, query: groupQuery, onChangeQuery: setGroupQuery, onClose: () => {
                    setGroupPickerVisible(false);
                    setGroupQuery('');
                }, options: groupOptions, loading: groupsLoading, error: groupsError, emptyText: t('No groups found.'), onSelect: addGroup })] })));
};
export default CompleteSupportDetailsScreen;
