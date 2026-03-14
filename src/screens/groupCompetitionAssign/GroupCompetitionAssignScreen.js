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
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
import SizeBox from '../../constants/SizeBox';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { assignGroupMembersToEvent, getGroupMembers } from '../../services/apiGateway';
const GroupCompetitionAssignScreen = ({ navigation, route }) => {
    var _a, _b, _c;
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const { apiAccessToken } = useAuth();
    const groupId = String(((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.groupId) || '').trim();
    const eventId = String(((_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.eventId) || '').trim();
    const eventName = String(((_c = route === null || route === void 0 ? void 0 : route.params) === null || _c === void 0 ? void 0 : _c.eventName) || t('Competition'));
    const [members, setMembers] = useState([]);
    const [selectedAthleteIds, setSelectedAthleteIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken || !groupId)
            return () => { };
        (() => __awaiter(void 0, void 0, void 0, function* () {
            setLoading(true);
            try {
                const resp = yield getGroupMembers(apiAccessToken, groupId);
                if (!mounted)
                    return;
                setMembers(Array.isArray(resp === null || resp === void 0 ? void 0 : resp.members) ? resp.members : []);
            }
            catch (_a) {
                if (mounted)
                    setMembers([]);
            }
            finally {
                if (mounted)
                    setLoading(false);
            }
        }))();
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, groupId]);
    const athletes = useMemo(() => members.filter((m) => {
        const publicRoles = Array.isArray(m.public_roles)
            ? m.public_roles.map((entry) => String(entry || '').toLowerCase())
            : [];
        if (publicRoles.includes('athlete'))
            return true;
        return String(m.role || '').toLowerCase() === 'athlete';
    }), [members]);
    const toggleAthlete = (profileId) => {
        const safe = String(profileId || '').trim();
        if (!safe)
            return;
        setSelectedAthleteIds((prev) => (prev.includes(safe) ? prev.filter((id) => id !== safe) : [...prev, safe]));
    };
    const styles = useMemo(() => StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.backgroundColor },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 0.5,
            borderBottomColor: colors.lightGrayColor,
        },
        headerButton: {
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.btnBackgroundColor,
            borderWidth: 1,
            borderColor: colors.borderColor,
            alignItems: 'center',
            justifyContent: 'center',
        },
        headerTitle: { fontSize: 18, color: colors.mainTextColor },
        card: {
            marginHorizontal: 20,
            marginTop: 16,
            borderWidth: 1,
            borderColor: colors.borderColor,
            borderRadius: 12,
            backgroundColor: colors.cardBackground,
            padding: 12,
        },
        title: { fontSize: 13, color: colors.mainTextColor },
        hint: { marginTop: 4, fontSize: 11, color: colors.subTextColor },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 10,
            borderBottomWidth: 0.5,
            borderBottomColor: colors.lightGrayColor,
        },
        rowText: { fontSize: 13, color: colors.mainTextColor },
        checkbox: {
            width: 20,
            height: 20,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: colors.primaryColor,
            alignItems: 'center',
            justifyContent: 'center',
        },
        checkboxChecked: { backgroundColor: colors.primaryColor },
        checkboxText: { fontSize: 12, color: colors.whiteColor },
        actionButton: {
            marginTop: 12,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.primaryColor,
            backgroundColor: colors.secondaryBlueColor,
            paddingVertical: 11,
            alignItems: 'center',
            justifyContent: 'center',
        },
        actionButtonDisabled: { opacity: 0.45 },
        actionButtonText: { fontSize: 13, color: colors.primaryColor },
        empty: { paddingVertical: 18, alignItems: 'center' },
        emptyText: { fontSize: 12, color: colors.subTextColor },
    }), [colors]);
    return (_jsxs(View, Object.assign({ style: styles.container }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: styles.headerTitle }, { children: t('Add athletes') })), _jsx(View, { style: { width: 44, height: 44 } })] })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false }, { children: [_jsxs(View, Object.assign({ style: styles.card }, { children: [_jsx(Text, Object.assign({ style: styles.title }, { children: eventName })), _jsx(Text, Object.assign({ style: styles.hint }, { children: t('Select athletes for this competition') })), loading ? (_jsx(View, Object.assign({ style: styles.empty }, { children: _jsx(ActivityIndicator, { size: "small", color: colors.primaryColor }) }))) : athletes.length === 0 ? (_jsx(View, Object.assign({ style: styles.empty }, { children: _jsx(Text, Object.assign({ style: styles.emptyText }, { children: t('No athletes yet') })) }))) : (athletes.map((member) => {
                                const profileId = String(member.profile_id || '');
                                const selected = selectedAthleteIds.includes(profileId);
                                return (_jsxs(TouchableOpacity, Object.assign({ style: styles.row, onPress: () => toggleAthlete(profileId) }, { children: [_jsx(Text, Object.assign({ style: styles.rowText }, { children: member.display_name || t('Member') })), _jsx(View, Object.assign({ style: [styles.checkbox, selected && styles.checkboxChecked] }, { children: selected ? _jsx(Text, Object.assign({ style: styles.checkboxText }, { children: "\u2713" })) : null }))] }), profileId));
                            })), _jsx(TouchableOpacity, Object.assign({ style: [styles.actionButton, (selectedAthleteIds.length === 0 || saving) && styles.actionButtonDisabled], disabled: selectedAthleteIds.length === 0 || saving, onPress: () => __awaiter(void 0, void 0, void 0, function* () {
                                    if (!apiAccessToken || !groupId || !eventId || selectedAthleteIds.length === 0 || saving)
                                        return;
                                    setSaving(true);
                                    try {
                                        yield assignGroupMembersToEvent(apiAccessToken, groupId, eventId, { profile_ids: selectedAthleteIds });
                                        navigation.navigate('GroupProfileScreen', {
                                            groupId,
                                            tab: 'competitions',
                                            refreshTs: Date.now(),
                                        });
                                    }
                                    finally {
                                        setSaving(false);
                                    }
                                }) }, { children: saving ? _jsx(ActivityIndicator, { size: "small", color: colors.primaryColor }) : _jsx(Text, Object.assign({ style: styles.actionButtonText }, { children: t('Confirm') })) }))] })), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] }))] })));
};
export default GroupCompetitionAssignScreen;
