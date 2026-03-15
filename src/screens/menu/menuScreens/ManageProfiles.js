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
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createStyles } from '../MenuStyles';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { ArrowLeft2, Add, Trash } from 'iconsax-react-nativejs';
import { useAuth } from '../../../context/AuthContext';
import { deleteGroup, getMyGroups } from '../../../services/apiGateway';
import { useTranslation } from 'react-i18next';
import { getSportFocusLabel, normalizeMainDisciplines, normalizeSelectedEvents } from '../../../utils/profileSelections';
const ManageProfiles = ({ navigation }) => {
    var _a;
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    const { apiAccessToken, userProfile, updateUserProfile } = useAuth();
    const [groups, setGroups] = useState([]);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [busyGroupId, setBusyGroupId] = useState(null);
    const [updatingSelectedEvents, setUpdatingSelectedEvents] = useState(false);
    const selectedFocuses = useMemo(() => { var _a; return normalizeSelectedEvents((_a = userProfile === null || userProfile === void 0 ? void 0 : userProfile.selectedEvents) !== null && _a !== void 0 ? _a : []); }, [userProfile === null || userProfile === void 0 ? void 0 : userProfile.selectedEvents]);
    const hasSupportProfile = useMemo(() => {
        var _a;
        return (String((_a = userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportRole) !== null && _a !== void 0 ? _a : '').trim().length > 0 ||
            (Array.isArray(userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportClubCodes) && userProfile.supportClubCodes.length > 0) ||
            (Array.isArray(userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportGroupIds) && userProfile.supportGroupIds.length > 0) ||
            (Array.isArray(userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportAthletes) && userProfile.supportAthletes.length > 0) ||
            (Array.isArray(userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportFocuses) && userProfile.supportFocuses.length > 0) ||
            (userProfile === null || userProfile === void 0 ? void 0 : userProfile.category) === 'support');
    }, [userProfile]);
    const canOpenAddProfileFlow = true;
    const linkedMainDisciplines = useMemo(() => {
        var _a, _b, _c;
        return normalizeMainDisciplines((_a = userProfile === null || userProfile === void 0 ? void 0 : userProfile.mainDisciplines) !== null && _a !== void 0 ? _a : {}, {
            trackFieldMainEvent: (_b = userProfile === null || userProfile === void 0 ? void 0 : userProfile.trackFieldMainEvent) !== null && _b !== void 0 ? _b : null,
            roadTrailMainEvent: (_c = userProfile === null || userProfile === void 0 ? void 0 : userProfile.roadTrailMainEvent) !== null && _c !== void 0 ? _c : null,
        });
    }, [userProfile]);
    const loadGroups = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        if (!apiAccessToken)
            return;
        setLoadingGroups(true);
        try {
            const resp = yield getMyGroups(apiAccessToken);
            setGroups(Array.isArray(resp === null || resp === void 0 ? void 0 : resp.groups) ? resp.groups : []);
        }
        catch (_b) {
            setGroups([]);
        }
        finally {
            setLoadingGroups(false);
        }
    }), [apiAccessToken]);
    useEffect(() => {
        loadGroups();
    }, [loadGroups]);
    const removePersonalProfile = (focusId) => __awaiter(void 0, void 0, void 0, function* () {
        if (!apiAccessToken) {
            Alert.alert(t('Error'), t('Please sign in again.'));
            return;
        }
        const next = selectedFocuses.filter((entry) => entry !== focusId);
        const nextMainDisciplines = Object.assign({}, linkedMainDisciplines);
        delete nextMainDisciplines[focusId];
        setUpdatingSelectedEvents(true);
        try {
            yield updateUserProfile({
                selectedEvents: next,
                mainDisciplines: nextMainDisciplines,
            });
        }
        catch (_c) {
            Alert.alert(t('Error'), t('Failed to save. Please try again.'));
        }
        finally {
            setUpdatingSelectedEvents(false);
        }
    });
    const handleDeleteGroup = (group) => {
        var _a;
        const groupId = String((_a = group === null || group === void 0 ? void 0 : group.group_id) !== null && _a !== void 0 ? _a : '').trim();
        if (!groupId || !apiAccessToken)
            return;
        Alert.alert(t('Delete'), `${t('Delete')} ${group.name || t('Group')}?`, [
            { text: t('Cancel'), style: 'cancel' },
            {
                text: t('Delete'),
                style: 'destructive',
                onPress: () => __awaiter(void 0, void 0, void 0, function* () {
                    setBusyGroupId(groupId);
                    try {
                        yield deleteGroup(apiAccessToken, groupId);
                        setGroups((prev) => prev.filter((entry) => String(entry.group_id) !== groupId));
                    }
                    finally {
                        setBusyGroupId(null);
                    }
                }),
            },
        ]);
    };
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('Manage profiles') })), _jsx(View, { style: Styles.headerSpacer })] })), _jsxs(ScrollView, Object.assign({ style: Styles.container, showsVerticalScrollIndicator: false }, { children: [_jsx(SizeBox, { height: 24 }), _jsx(Text, Object.assign({ style: Styles.sectionTitle }, { children: t('Personal profiles') })), _jsx(SizeBox, { height: 12 }), selectedFocuses.length > 0 ? selectedFocuses.map((focusId) => (_jsxs(React.Fragment, { children: [_jsxs(View, Object.assign({ style: Styles.accountSettingsCard }, { children: [_jsx(Text, Object.assign({ style: Styles.accountSettingsTitle }, { children: getSportFocusLabel(focusId, t) })), _jsx(TouchableOpacity, Object.assign({ onPress: () => removePersonalProfile(focusId), disabled: updatingSelectedEvents }, { children: updatingSelectedEvents ? (_jsx(ActivityIndicator, { size: "small", color: colors.primaryColor })) : (_jsx(Trash, { size: 18, color: colors.errorColor || '#E14B4B', variant: "Linear" })) }))] })), _jsx(SizeBox, { height: 10 })] }, focusId))) : (_jsxs(_Fragment, { children: [_jsx(View, Object.assign({ style: Styles.accountSettingsCard }, { children: _jsx(Text, Object.assign({ style: Styles.accountSettingsTitle }, { children: t('No personal profiles linked yet') })) })), _jsx(SizeBox, { height: 10 })] })), hasSupportProfile ? (_jsxs(_Fragment, { children: [_jsx(View, Object.assign({ style: Styles.accountSettingsCard }, { children: _jsx(TouchableOpacity, Object.assign({ onPress: () => navigation.navigate('CompleteSupportDetailsScreen', { editMode: true }), style: { flex: 1 } }, { children: _jsx(Text, Object.assign({ style: Styles.accountSettingsTitle }, { children: String((_a = userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportRole) !== null && _a !== void 0 ? _a : '').trim().length > 0
                                            ? `${String(userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportRole).trim()} ${t('profile')}`
                                            : t('Support profile') })) })) })), _jsx(SizeBox, { height: 10 })] })) : null, canOpenAddProfileFlow && (_jsxs(_Fragment, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.accountSettingsCard, onPress: () => navigation.navigate('CategorySelectionScreen', { fromAddFlow: true }) }, { children: _jsxs(View, Object.assign({ style: Styles.accountSettingsLeft }, { children: [_jsx(Add, { size: 16, color: colors.primaryColor, variant: "Linear" }), _jsx(SizeBox, { width: 10 }), _jsx(Text, Object.assign({ style: Styles.accountSettingsTitle }, { children: t('Add profile') }))] })) })), _jsx(SizeBox, { height: 10 })] })), _jsx(SizeBox, { height: 16 }), _jsx(Text, Object.assign({ style: Styles.sectionTitle }, { children: t('Groups') })), _jsx(SizeBox, { height: 12 }), loadingGroups ? (_jsx(ActivityIndicator, { color: colors.primaryColor })) : (groups.map((group) => {
                        const groupId = String(group.group_id || '');
                        const busy = busyGroupId === groupId;
                        return (_jsxs(React.Fragment, { children: [_jsxs(View, Object.assign({ style: Styles.accountSettingsCard }, { children: [_jsx(TouchableOpacity, Object.assign({ onPress: () => navigation.navigate('GroupProfileScreen', {
                                                groupId,
                                                showBackButton: true,
                                                origin: 'profile',
                                            }), style: { flex: 1 } }, { children: _jsx(Text, Object.assign({ style: Styles.accountSettingsTitle }, { children: group.name || t('Group') })) })), String(group.my_role || '').toLowerCase() === 'owner' && (_jsx(TouchableOpacity, Object.assign({ onPress: () => handleDeleteGroup(group), disabled: busy }, { children: busy ? (_jsx(ActivityIndicator, { size: "small", color: colors.primaryColor })) : (_jsx(Trash, { size: 18, color: colors.errorColor || '#E14B4B', variant: "Linear" })) })))] })), _jsx(SizeBox, { height: 10 })] }, groupId));
                    })), (groups.length === 0 || canOpenAddProfileFlow) ? (_jsx(TouchableOpacity, Object.assign({ style: Styles.accountSettingsCard, onPress: () => navigation.navigate('CategorySelectionScreen', { fromAddFlow: true }) }, { children: _jsxs(View, Object.assign({ style: Styles.accountSettingsLeft }, { children: [_jsx(Add, { size: 16, color: colors.primaryColor, variant: "Linear" }), _jsx(SizeBox, { width: 10 }), _jsx(Text, Object.assign({ style: Styles.accountSettingsTitle }, { children: t('Add group') }))] })) }))) : null, _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] }))] })));
};
export default ManageProfiles;
