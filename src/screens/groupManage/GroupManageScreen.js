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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Add, ArrowLeft2, Copy, Link21, Refresh2, Share as ShareIcon, Trash } from 'iconsax-react-nativejs';
import SizeBox from '../../constants/SizeBox';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { setClipboardString } from '../../utils/nativeClipboard';
import { getGroup, getGroupMembers, createGroupInviteLink, removeGroupMember, updateGroup, updateGroupMemberRole, updateGroupMemberPublicRoles, } from '../../services/apiGateway';
import { getApiBaseUrl } from '../../constants/RuntimeConfig';
const GroupManageScreen = ({ navigation, route }) => {
    var _a;
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const { apiAccessToken } = useAuth();
    const groupId = String(((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.groupId) || '').trim();
    const [group, setGroup] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [roleBusyByProfile, setRoleBusyByProfile] = useState({});
    const [removeBusyByProfile, setRemoveBusyByProfile] = useState({});
    const [manualCoachName, setManualCoachName] = useState('');
    const [isSavingManualCoach, setIsSavingManualCoach] = useState(false);
    const [inviteLinkVisible, setInviteLinkVisible] = useState(false);
    const [inviteLinkBusy, setInviteLinkBusy] = useState(false);
    const [inviteLinkUrl, setInviteLinkUrl] = useState('');
    const [inviteLinkPermission, setInviteLinkPermission] = useState('member');
    const [inviteLinkPublicRoles, setInviteLinkPublicRoles] = useState(['athlete']);
    const canManageGroup = useMemo(() => {
        const role = String((group === null || group === void 0 ? void 0 : group.my_role) || '').toLowerCase();
        return role === 'owner' || role === 'admin';
    }, [group === null || group === void 0 ? void 0 : group.my_role]);
    const isOwner = useMemo(() => String((group === null || group === void 0 ? void 0 : group.my_role) || '').toLowerCase() === 'owner', [group === null || group === void 0 ? void 0 : group.my_role]);
    const isAdmin = useMemo(() => String((group === null || group === void 0 ? void 0 : group.my_role) || '').toLowerCase() === 'admin', [group === null || group === void 0 ? void 0 : group.my_role]);
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
    const loadData = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        if (!apiAccessToken || !groupId)
            return;
        setLoading(true);
        try {
            const [groupResp, membersResp] = yield Promise.all([
                getGroup(apiAccessToken, groupId),
                getGroupMembers(apiAccessToken, groupId),
            ]);
            setGroup(groupResp.group);
            setMembers(membersResp.members || []);
        }
        catch (_b) {
            setGroup(null);
            setMembers([]);
        }
        finally {
            setLoading(false);
        }
    }), [apiAccessToken, groupId]);
    useEffect(() => {
        loadData();
    }, [loadData]);
    const handleRemoveMember = useCallback((member) => __awaiter(void 0, void 0, void 0, function* () {
        if (!apiAccessToken || !groupId || !canManageGroup)
            return;
        const targetProfileId = String((member === null || member === void 0 ? void 0 : member.profile_id) || '').trim();
        if (!targetProfileId)
            return;
        if (removeBusyByProfile[targetProfileId])
            return;
        setRemoveBusyByProfile((prev) => (Object.assign(Object.assign({}, prev), { [targetProfileId]: true })));
        try {
            yield removeGroupMember(apiAccessToken, groupId, targetProfileId);
            setMembers((prev) => prev.filter((entry) => String((entry === null || entry === void 0 ? void 0 : entry.profile_id) || '').trim() !== targetProfileId));
            yield loadData();
        }
        catch (_c) {
            // ignore
        }
        finally {
            setRemoveBusyByProfile((prev) => (Object.assign(Object.assign({}, prev), { [targetProfileId]: false })));
        }
    }), [apiAccessToken, canManageGroup, groupId, loadData, removeBusyByProfile]);
    const handleChangeMemberPermission = useCallback((member, nextPermission) => __awaiter(void 0, void 0, void 0, function* () {
        if (!apiAccessToken || !groupId || !canManageGroup)
            return;
        const targetProfileId = String((member === null || member === void 0 ? void 0 : member.profile_id) || '').trim();
        if (!targetProfileId)
            return;
        const currentRole = String((member === null || member === void 0 ? void 0 : member.role) || '').toLowerCase();
        const currentPermission = currentRole === 'admin' ? 'admin' : 'member';
        if (currentPermission === nextPermission)
            return;
        if (currentRole === 'owner')
            return;
        if (isAdmin && (currentRole === 'admin' || nextPermission === 'admin'))
            return;
        if (roleBusyByProfile[targetProfileId])
            return;
        setRoleBusyByProfile((prev) => (Object.assign(Object.assign({}, prev), { [targetProfileId]: true })));
        try {
            yield updateGroupMemberRole(apiAccessToken, groupId, targetProfileId, { role: nextPermission });
            yield loadData();
        }
        catch (_d) {
            // ignore
        }
        finally {
            setRoleBusyByProfile((prev) => (Object.assign(Object.assign({}, prev), { [targetProfileId]: false })));
        }
    }), [apiAccessToken, canManageGroup, groupId, isAdmin, loadData, roleBusyByProfile]);
    const getDisplayRoles = useCallback((member) => {
        const remoteRoles = Array.isArray(member === null || member === void 0 ? void 0 : member.public_roles)
            ? member.public_roles
                .map((entry) => String(entry || '').toLowerCase())
                .filter((entry) => entry === 'athlete' || entry === 'coach' || entry === 'physio')
            : [];
        if (remoteRoles.length > 0)
            return remoteRoles;
        const backendRole = String((member === null || member === void 0 ? void 0 : member.role) || '').toLowerCase();
        if (backendRole === 'athlete' || backendRole === 'coach' || backendRole === 'physio')
            return [backendRole];
        return [];
    }, []);
    const toggleInviteLinkPublicRole = useCallback((role) => {
        setInviteLinkPublicRoles((prev) => {
            if (prev.includes(role)) {
                const next = prev.filter((entry) => entry !== role);
                return next.length > 0 ? next : prev;
            }
            return [...prev, role];
        });
    }, []);
    const toggleMemberPublicRole = useCallback((member, role) => __awaiter(void 0, void 0, void 0, function* () {
        const safeProfileId = String((member === null || member === void 0 ? void 0 : member.profile_id) || '').trim();
        if (!safeProfileId)
            return;
        const currentBase = getDisplayRoles(member);
        const set = new Set(currentBase);
        if (set.has(role)) {
            if (set.size === 1)
                return;
            set.delete(role);
        }
        else {
            set.add(role);
        }
        const nextRoles = Array.from(set);
        if (!apiAccessToken || !groupId)
            return;
        try {
            yield updateGroupMemberPublicRoles(apiAccessToken, groupId, safeProfileId, { public_roles: nextRoles });
            setMembers((prev) => prev.map((entry) => (String((entry === null || entry === void 0 ? void 0 : entry.profile_id) || '').trim() === safeProfileId
                ? Object.assign(Object.assign({}, entry), { public_roles: nextRoles }) : entry)));
        }
        catch (_e) {
            // ignore
        }
    }), [apiAccessToken, getDisplayRoles, groupId]);
    const manualCoachNames = useMemo(() => {
        var _a;
        const source = Array.isArray(group === null || group === void 0 ? void 0 : group.coaches) ? ((_a = group === null || group === void 0 ? void 0 : group.coaches) !== null && _a !== void 0 ? _a : []) : [];
        return source.map((entry) => String(entry || '').trim()).filter(Boolean);
    }, [group === null || group === void 0 ? void 0 : group.coaches]);
    const handleAddManualCoach = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        const value = String(manualCoachName || '').trim();
        if (!apiAccessToken || !groupId || !canManageGroup || !value || isSavingManualCoach)
            return;
        setIsSavingManualCoach(true);
        const next = Array.from(new Set([...manualCoachNames, value]));
        setGroup((prev) => {
            if (!prev)
                return prev;
            return Object.assign(Object.assign({}, prev), { coaches: next });
        });
        setManualCoachName('');
        try {
            const updated = yield updateGroup(apiAccessToken, groupId, { coaches: next });
            setGroup((prev) => {
                var _a, _b;
                if (!prev)
                    return (_a = updated === null || updated === void 0 ? void 0 : updated.group) !== null && _a !== void 0 ? _a : prev;
                return (updated === null || updated === void 0 ? void 0 : updated.group) ? Object.assign(Object.assign(Object.assign({}, prev), updated.group), { coaches: Array.isArray((_b = updated.group) === null || _b === void 0 ? void 0 : _b.coaches) ? updated.group.coaches : next }) : Object.assign(Object.assign({}, prev), { coaches: next });
            });
        }
        catch (_f) {
            setGroup((prev) => {
                if (!prev)
                    return prev;
                return Object.assign(Object.assign({}, prev), { coaches: manualCoachNames });
            });
            setManualCoachName(value);
        }
        finally {
            setIsSavingManualCoach(false);
        }
    }), [apiAccessToken, canManageGroup, groupId, isSavingManualCoach, manualCoachName, manualCoachNames]);
    const handleRemoveManualCoach = useCallback((name) => __awaiter(void 0, void 0, void 0, function* () {
        const value = String(name || '').trim();
        if (!apiAccessToken || !groupId || !canManageGroup || !value)
            return;
        const next = manualCoachNames.filter((entry) => String(entry || '').trim().toLowerCase() !== value.toLowerCase());
        setGroup((prev) => {
            if (!prev)
                return prev;
            return Object.assign(Object.assign({}, prev), { coaches: next });
        });
        try {
            const updated = yield updateGroup(apiAccessToken, groupId, { coaches: next });
            setGroup((prev) => {
                var _a, _b;
                if (!prev)
                    return (_a = updated === null || updated === void 0 ? void 0 : updated.group) !== null && _a !== void 0 ? _a : prev;
                return (updated === null || updated === void 0 ? void 0 : updated.group) ? Object.assign(Object.assign(Object.assign({}, prev), updated.group), { coaches: Array.isArray((_b = updated.group) === null || _b === void 0 ? void 0 : _b.coaches) ? updated.group.coaches : next }) : Object.assign(Object.assign({}, prev), { coaches: next });
            });
        }
        catch (_g) {
            setGroup((prev) => {
                if (!prev)
                    return prev;
                return Object.assign(Object.assign({}, prev), { coaches: manualCoachNames });
            });
        }
    }), [apiAccessToken, canManageGroup, groupId, manualCoachNames]);
    const buildInviteLinkUrl = useCallback((token) => `spotme://group-invite/${encodeURIComponent(token)}`, []);
    const openInviteLinkModal = useCallback(() => {
        setInviteLinkVisible(true);
        setInviteLinkBusy(false);
        setInviteLinkUrl('');
        setInviteLinkPermission('member');
        setInviteLinkPublicRoles(['athlete']);
    }, []);
    const closeInviteLinkModal = useCallback(() => {
        if (inviteLinkBusy)
            return;
        setInviteLinkVisible(false);
    }, [inviteLinkBusy]);
    const handleGenerateInviteLink = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _h, _j, _k;
        if (!apiAccessToken || !groupId || !canManageGroup || inviteLinkPublicRoles.length === 0 || inviteLinkBusy)
            return;
        setInviteLinkBusy(true);
        try {
            const resp = yield createGroupInviteLink(apiAccessToken, groupId, {
                role: inviteLinkPermission,
                public_roles: inviteLinkPublicRoles,
            });
            const token = String(((_h = resp === null || resp === void 0 ? void 0 : resp.invite_link) === null || _h === void 0 ? void 0 : _h.token) || '').trim();
            setInviteLinkUrl(token ? buildInviteLinkUrl(token) : '');
        }
        catch (error) {
            const message = String((_k = (_j = error === null || error === void 0 ? void 0 : error.message) !== null && _j !== void 0 ? _j : error) !== null && _k !== void 0 ? _k : '').trim() || t('Unable to create invitation link');
            Alert.alert(t('Invitation link failed'), message);
        }
        finally {
            setInviteLinkBusy(false);
        }
    }), [apiAccessToken, buildInviteLinkUrl, canManageGroup, groupId, inviteLinkBusy, inviteLinkPermission, inviteLinkPublicRoles, t]);
    const handleCopyInviteLink = useCallback(() => {
        if (!inviteLinkUrl)
            return;
        const copied = setClipboardString(inviteLinkUrl);
        if (copied) {
            Alert.alert(t('Copied'), t('Invitation link copied to clipboard.'));
            return;
        }
        Alert.alert(t('Clipboard unavailable'), t('Clipboard is not available in this app build.'));
    }, [inviteLinkUrl, t]);
    const handleShareInviteLink = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        if (!inviteLinkUrl)
            return;
        try {
            yield Share.share({
                message: inviteLinkUrl,
                url: inviteLinkUrl,
            });
        }
        catch (_l) {
            // ignore share cancellation/errors here
        }
    }), [inviteLinkUrl]);
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
        sectionCard: {
            marginHorizontal: 20,
            marginTop: 14,
            borderWidth: 1,
            borderColor: colors.borderColor,
            borderRadius: 12,
            backgroundColor: colors.cardBackground,
            padding: 12,
        },
        sectionTitle: { fontSize: 13, color: colors.mainTextColor, marginBottom: 8 },
        hint: { fontSize: 11, color: colors.subTextColor, marginBottom: 8 },
        searchInputWrap: {
            height: 44,
            borderWidth: 1,
            borderColor: colors.borderColor,
            borderRadius: 10,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 10,
            backgroundColor: colors.cardBackground,
        },
        searchInput: {
            flex: 1,
            fontSize: 13,
            color: colors.mainTextColor,
            paddingVertical: 0,
            marginLeft: 8,
        },
        stateRow: { paddingVertical: 12, alignItems: 'center' },
        searchResultRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 10,
            borderBottomWidth: 0.5,
            borderBottomColor: colors.lightGrayColor,
        },
        searchResultName: { fontSize: 13, color: colors.mainTextColor },
        searchResultMeta: { fontSize: 11, color: colors.subTextColor, marginTop: 2 },
        roleToggle: { flexDirection: 'row', gap: 8, marginTop: 8 },
        roleButton: {
            flex: 1,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.borderColor,
            paddingVertical: 8,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.btnBackgroundColor,
        },
        roleButtonActive: { backgroundColor: colors.secondaryBlueColor, borderColor: colors.primaryColor },
        roleText: { fontSize: 12, color: colors.subTextColor },
        roleTextActive: { fontSize: 12, color: colors.primaryColor },
        selectedInviteCard: {
            marginTop: 10,
            borderWidth: 1,
            borderColor: colors.borderColor,
            borderRadius: 10,
            padding: 10,
            backgroundColor: colors.secondaryColor,
        },
        selectedInviteName: { fontSize: 13, color: colors.mainTextColor },
        selectedInviteMeta: { marginTop: 4, fontSize: 11, color: colors.subTextColor },
        actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
        actionButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            borderRadius: 8,
            backgroundColor: colors.primaryColor,
            paddingHorizontal: 10,
            paddingVertical: 7,
        },
        actionButtonText: { fontSize: 12, color: colors.whiteColor },
        neutralButton: {
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.errorColor || '#E14B4B',
            paddingHorizontal: 10,
            paddingVertical: 7,
        },
        neutralButtonText: { fontSize: 12, color: colors.errorColor || '#E14B4B' },
        iconButtonDisabled: { opacity: 0.6 },
        memberRow: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 10,
            paddingVertical: 8,
            borderBottomWidth: 0.5,
            borderBottomColor: colors.lightGrayColor,
        },
        memberInfo: { flex: 1 },
        memberBody: { flex: 1 },
        memberName: { fontSize: 14, color: colors.mainTextColor },
        memberRole: { fontSize: 12, color: colors.subTextColor },
        roleButtonsInline: { flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' },
        roleButtonInline: {
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.borderColor,
            paddingHorizontal: 8,
            paddingVertical: 4,
            backgroundColor: colors.btnBackgroundColor,
        },
        roleButtonInlineActive: {
            borderColor: colors.primaryColor,
            backgroundColor: colors.secondaryBlueColor,
        },
        roleButtonInlineText: { fontSize: 11, color: colors.subTextColor },
        roleButtonInlineTextActive: { fontSize: 11, color: colors.primaryColor },
        roleBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
        roleBadge: {
            borderRadius: 999,
            borderWidth: 1,
            borderColor: colors.primaryColor,
            backgroundColor: colors.secondaryBlueColor,
            paddingHorizontal: 8,
            paddingVertical: 3,
        },
        roleBadgeText: { fontSize: 11, color: colors.primaryColor },
        memberRemoveButton: {
            width: 34,
            height: 34,
            borderRadius: 17,
            borderWidth: 1,
            borderColor: colors.borderColor,
            backgroundColor: colors.btnBackgroundColor,
            alignItems: 'center',
            justifyContent: 'center',
        },
        manualCoachChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
        manualCoachChip: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: colors.borderColor,
            backgroundColor: colors.btnBackgroundColor,
            paddingHorizontal: 10,
            paddingVertical: 6,
        },
        manualCoachChipText: { fontSize: 12, color: colors.mainTextColor },
        inviteLinkButton: {
            marginTop: 10,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.primaryColor,
            backgroundColor: colors.secondaryBlueColor,
            paddingVertical: 10,
            flexDirection: 'row',
            gap: 8,
            alignItems: 'center',
            justifyContent: 'center',
        },
        inviteLinkButtonText: { fontSize: 13, color: colors.primaryColor, fontWeight: '600' },
        modalBackdrop: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            paddingHorizontal: 20,
        },
        modalCard: {
            borderRadius: 18,
            borderWidth: 1,
            borderColor: colors.borderColor,
            backgroundColor: colors.cardBackground,
            padding: 18,
            gap: 12,
        },
        modalTitle: { fontSize: 18, color: colors.mainTextColor, fontWeight: '700' },
        modalHint: { fontSize: 13, color: colors.subTextColor, lineHeight: 20 },
        linkValueCard: {
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.borderColor,
            backgroundColor: colors.btnBackgroundColor,
            paddingHorizontal: 12,
            paddingVertical: 10,
        },
        linkValueText: { fontSize: 12, color: colors.mainTextColor },
        modalActionsRow: { flexDirection: 'row', gap: 10 },
        modalAction: {
            flex: 1,
            height: 44,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.borderColor,
            backgroundColor: colors.btnBackgroundColor,
            flexDirection: 'row',
            gap: 8,
            alignItems: 'center',
            justifyContent: 'center',
        },
        modalActionPrimary: {
            backgroundColor: colors.primaryColor,
            borderColor: colors.primaryColor,
        },
        modalActionText: { fontSize: 13, color: colors.mainTextColor, fontWeight: '600' },
        modalActionTextPrimary: { fontSize: 13, color: colors.whiteColor, fontWeight: '600' },
    }), [colors]);
    if (!groupId) {
        return (_jsxs(View, Object.assign({ style: styles.container }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: styles.headerTitle }, { children: t('Manage') })), _jsx(View, { style: { width: 44, height: 44 } })] }))] })));
    }
    return (_jsxs(View, Object.assign({ style: styles.container, testID: "group-manage-screen" }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: styles.headerTitle }, { children: t('Manage') })), _jsx(View, { style: { width: 44, height: 44 } })] })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false }, { children: [loading ? (_jsx(View, Object.assign({ style: styles.stateRow }, { children: _jsx(ActivityIndicator, { size: "small", color: colors.primaryColor }) }))) : null, !loading && canManageGroup ? (_jsxs(_Fragment, { children: [_jsxs(View, Object.assign({ style: styles.sectionCard }, { children: [_jsx(Text, Object.assign({ style: styles.sectionTitle }, { children: t('Invitation link') })), _jsx(Text, Object.assign({ style: styles.hint }, { children: t('Generate a shareable link so people can join this group directly in the app') })), _jsxs(TouchableOpacity, Object.assign({ style: styles.inviteLinkButton, onPress: openInviteLinkModal, testID: "group-manage-open-invite-link" }, { children: [_jsx(Link21, { size: 16, color: colors.primaryColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: styles.inviteLinkButtonText }, { children: t('Generate invitation link') }))] }))] })), _jsxs(View, Object.assign({ style: styles.sectionCard }, { children: [_jsx(Text, Object.assign({ style: styles.sectionTitle }, { children: t('Manage members') })), members.map((member) => {
                                        const permissionRole = String(member.permission_role || member.role || '').toLowerCase();
                                        const canEditPermission = permissionRole !== 'owner' && !(isAdmin && permissionRole === 'admin');
                                        const canEditPublicRoles = canManageGroup;
                                        const isRemovingMember = Boolean(removeBusyByProfile[String(member.profile_id)]);
                                        const permissionOptions = isOwner ? ['member', 'admin'] : ['member'];
                                        const selectedPermission = permissionRole === 'admin' ? 'admin' : 'member';
                                        const publicRoles = getDisplayRoles(member);
                                        const badges = [
                                            ...(permissionRole === 'owner' ? [t('Owner')] : []),
                                            ...(permissionRole === 'admin' ? [t('Admin')] : []),
                                            ...publicRoles.map((role) => t(role === 'coach' ? 'Coach' : role === 'physio' ? 'Physio' : 'Athlete')),
                                        ];
                                        return (_jsxs(View, Object.assign({ style: styles.memberRow }, { children: [_jsx(View, Object.assign({ style: styles.memberInfo }, { children: _jsxs(View, Object.assign({ style: styles.memberBody }, { children: [_jsx(Text, Object.assign({ style: styles.memberName }, { children: member.display_name || t('Member') })), badges.length > 0 ? (_jsx(View, Object.assign({ style: styles.roleBadgeRow }, { children: badges.map((badge, index) => (_jsx(View, Object.assign({ style: styles.roleBadge }, { children: _jsx(Text, Object.assign({ style: styles.roleBadgeText }, { children: badge })) }), `${member.profile_id}-badge-${badge}-${index}`))) }))) : null, canEditPermission || canEditPublicRoles ? (_jsxs(_Fragment, { children: [canEditPermission ? (_jsxs(_Fragment, { children: [_jsx(Text, Object.assign({ style: styles.memberRole }, { children: t('Permission') })), _jsx(View, Object.assign({ style: styles.roleButtonsInline }, { children: permissionOptions.map((option) => {
                                                                                    const selected = selectedPermission === option;
                                                                                    return (_jsx(TouchableOpacity, Object.assign({ style: [styles.roleButtonInline, selected && styles.roleButtonInlineActive], disabled: Boolean(roleBusyByProfile[String(member.profile_id)]), onPress: () => handleChangeMemberPermission(member, option) }, { children: _jsx(Text, Object.assign({ style: selected ? styles.roleButtonInlineTextActive : styles.roleButtonInlineText }, { children: t(option === 'admin' ? 'Admin' : 'Member') })) }), `${member.profile_id}-permission-${option}`));
                                                                                }) }))] })) : null, canEditPublicRoles ? (_jsxs(_Fragment, { children: [_jsx(Text, Object.assign({ style: styles.memberRole }, { children: t('Public role tags') })), _jsx(View, Object.assign({ style: styles.roleButtonsInline }, { children: ['athlete', 'coach', 'physio'].map((option) => {
                                                                                    const selected = publicRoles.includes(option);
                                                                                    return (_jsx(TouchableOpacity, Object.assign({ style: [styles.roleButtonInline, selected && styles.roleButtonInlineActive], onPress: () => toggleMemberPublicRole(member, option) }, { children: _jsx(Text, Object.assign({ style: selected ? styles.roleButtonInlineTextActive : styles.roleButtonInlineText }, { children: t(option === 'coach' ? 'Coach' : option === 'physio' ? 'Physio' : 'Athlete') })) }), `${member.profile_id}-tag-${option}`));
                                                                                }) }))] })) : null] })) : null] })) })), canEditPermission ? (_jsx(TouchableOpacity, Object.assign({ onPress: () => handleRemoveMember(member), disabled: isRemovingMember, style: [
                                                        styles.memberRemoveButton,
                                                        isRemovingMember && styles.iconButtonDisabled,
                                                    ] }, { children: isRemovingMember ? (_jsx(ActivityIndicator, { size: "small", color: colors.errorColor || '#E14B4B' })) : (_jsx(Trash, { size: 18, color: colors.errorColor || '#E14B4B', variant: "Linear" })) }))) : null] }), String(member.profile_id)));
                                    })] })), _jsxs(View, Object.assign({ style: styles.sectionCard }, { children: [_jsx(Text, Object.assign({ style: styles.sectionTitle }, { children: t('Add coach name') })), _jsxs(View, Object.assign({ style: styles.searchInputWrap }, { children: [_jsx(TextInput, { style: styles.searchInput, placeholder: t('Coach name'), placeholderTextColor: colors.subTextColor, value: manualCoachName, onChangeText: setManualCoachName, testID: "group-manage-coach-input" }), _jsx(TouchableOpacity, Object.assign({ style: styles.actionButton, onPress: handleAddManualCoach, disabled: isSavingManualCoach || !manualCoachName.trim(), testID: "group-manage-coach-add" }, { children: isSavingManualCoach ? (_jsx(ActivityIndicator, { size: "small", color: colors.whiteColor })) : (_jsxs(_Fragment, { children: [_jsx(Add, { size: 14, color: colors.whiteColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: styles.actionButtonText }, { children: t('Add') }))] })) }))] })), manualCoachNames.length > 0 ? (_jsx(View, Object.assign({ style: styles.manualCoachChips }, { children: manualCoachNames.map((coachName) => (_jsxs(TouchableOpacity, Object.assign({ style: styles.manualCoachChip, onPress: () => handleRemoveManualCoach(coachName), testID: `group-manage-coach-chip-${coachName}` }, { children: [_jsx(Text, Object.assign({ style: styles.manualCoachChipText }, { children: coachName })), _jsx(Trash, { size: 14, color: colors.errorColor || '#E14B4B', variant: "Linear" })] }), `manual-coach-${coachName}`))) }))) : null] }))] })) : null, _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] })), _jsx(Modal, Object.assign({ visible: inviteLinkVisible, transparent: true, animationType: "fade", onRequestClose: closeInviteLinkModal }, { children: _jsx(Pressable, Object.assign({ style: styles.modalBackdrop, onPress: closeInviteLinkModal }, { children: _jsxs(Pressable, Object.assign({ style: styles.modalCard, onPress: (event) => {
                            event.stopPropagation();
                        } }, { children: [_jsx(Text, Object.assign({ style: styles.modalTitle }, { children: t('Invitation link') })), _jsx(Text, Object.assign({ style: styles.modalHint }, { children: t('Choose the public role tags for people joining through this link, then generate and share it.') })), _jsx(Text, Object.assign({ style: styles.selectedInviteMeta }, { children: t('Select public roles') })), _jsx(View, Object.assign({ style: styles.roleToggle }, { children: ['athlete', 'coach', 'physio'].map((role) => (_jsx(TouchableOpacity, Object.assign({ style: [styles.roleButton, inviteLinkPublicRoles.includes(role) && styles.roleButtonActive], onPress: () => toggleInviteLinkPublicRole(role) }, { children: _jsx(Text, Object.assign({ style: inviteLinkPublicRoles.includes(role) ? styles.roleTextActive : styles.roleText }, { children: t(role === 'athlete' ? 'Athlete' : role === 'coach' ? 'Coach' : 'Physio') })) }), `invite-link-role-${role}`))) })), _jsx(Text, Object.assign({ style: styles.selectedInviteMeta }, { children: t('Select permission') })), _jsxs(View, Object.assign({ style: styles.roleToggle }, { children: [_jsx(TouchableOpacity, Object.assign({ style: [styles.roleButton, inviteLinkPermission === 'member' && styles.roleButtonActive], onPress: () => setInviteLinkPermission('member') }, { children: _jsx(Text, Object.assign({ style: inviteLinkPermission === 'member' ? styles.roleTextActive : styles.roleText }, { children: t('Member') })) })), isOwner ? (_jsx(TouchableOpacity, Object.assign({ style: [styles.roleButton, inviteLinkPermission === 'admin' && styles.roleButtonActive], onPress: () => setInviteLinkPermission('admin') }, { children: _jsx(Text, Object.assign({ style: inviteLinkPermission === 'admin' ? styles.roleTextActive : styles.roleText }, { children: t('Admin') })) }))) : null] })), inviteLinkUrl ? (_jsx(View, Object.assign({ style: styles.linkValueCard, testID: "group-manage-invite-link-card" }, { children: _jsx(Text, Object.assign({ style: styles.linkValueText }, { children: inviteLinkUrl })) }))) : null, _jsxs(View, Object.assign({ style: styles.modalActionsRow }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.modalAction, onPress: closeInviteLinkModal, disabled: inviteLinkBusy }, { children: _jsx(Text, Object.assign({ style: styles.modalActionText }, { children: t('Close') })) })), _jsx(TouchableOpacity, Object.assign({ style: [styles.modalAction, styles.modalActionPrimary], onPress: handleGenerateInviteLink, disabled: inviteLinkBusy || inviteLinkPublicRoles.length === 0, testID: "group-manage-generate-invite-link" }, { children: inviteLinkBusy ? (_jsx(ActivityIndicator, { size: "small", color: colors.whiteColor })) : (_jsxs(_Fragment, { children: [_jsx(Refresh2, { size: 16, color: colors.whiteColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: styles.modalActionTextPrimary }, { children: inviteLinkUrl ? t('Regenerate') : t('Generate') }))] })) }))] })), inviteLinkUrl ? (_jsxs(View, Object.assign({ style: styles.modalActionsRow }, { children: [_jsxs(TouchableOpacity, Object.assign({ style: styles.modalAction, onPress: handleCopyInviteLink }, { children: [_jsx(Copy, { size: 16, color: colors.mainTextColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: styles.modalActionText }, { children: t('Copy link') }))] })), _jsxs(TouchableOpacity, Object.assign({ style: styles.modalAction, onPress: handleShareInviteLink }, { children: [_jsx(ShareIcon, { size: 16, color: colors.mainTextColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: styles.modalActionText }, { children: t('Share') }))] }))] }))) : null] })) })) }))] })));
};
export default GroupManageScreen;
