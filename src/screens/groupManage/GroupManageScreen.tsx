import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Add, ArrowLeft2, Copy, Link21, Refresh2, Share as ShareIcon, Trash } from 'iconsax-react-nativejs';
import Clipboard from '@react-native-clipboard/clipboard';
import SizeBox from '../../constants/SizeBox';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
  getGroup,
  getGroupMembers,
  createGroupInviteLink,
  removeGroupMember,
  updateGroup,
  updateGroupMemberRole,
  updateGroupMemberPublicRoles,
  type GroupMember,
  type GroupSummary,
} from '../../services/apiGateway';
import { getApiBaseUrl } from '../../constants/RuntimeConfig';

type PublicMemberRole = 'athlete' | 'coach' | 'physio';

const GroupManageScreen = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { apiAccessToken } = useAuth();
  const groupId = String(route?.params?.groupId || '').trim();

  const [group, setGroup] = useState<GroupSummary | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(false);

  const [roleBusyByProfile, setRoleBusyByProfile] = useState<Record<string, boolean>>({});
  const [removeBusyByProfile, setRemoveBusyByProfile] = useState<Record<string, boolean>>({});

  const [manualCoachName, setManualCoachName] = useState('');
  const [isSavingManualCoach, setIsSavingManualCoach] = useState(false);
  const [inviteLinkVisible, setInviteLinkVisible] = useState(false);
  const [inviteLinkBusy, setInviteLinkBusy] = useState(false);
  const [inviteLinkUrl, setInviteLinkUrl] = useState('');
  const [inviteLinkPermission, setInviteLinkPermission] = useState<'member' | 'admin'>('member');
  const [inviteLinkPublicRoles, setInviteLinkPublicRoles] = useState<PublicMemberRole[]>(['athlete']);

  const canManageGroup = useMemo(() => {
    const role = String(group?.my_role || '').toLowerCase();
    return role === 'owner' || role === 'admin';
  }, [group?.my_role]);
  const isOwner = useMemo(() => String(group?.my_role || '').toLowerCase() === 'owner', [group?.my_role]);
  const isAdmin = useMemo(() => String(group?.my_role || '').toLowerCase() === 'admin', [group?.my_role]);

  const toAbsoluteUrl = useCallback((value?: string | null) => {
    if (!value) return null;
    const raw = String(value);
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
    const base = getApiBaseUrl();
    if (!base) return raw;
    return `${base.replace(/\/$/, '')}/${raw.replace(/^\//, '')}`;
  }, []);

  const loadData = useCallback(async () => {
    if (!apiAccessToken || !groupId) return;
    setLoading(true);
    try {
      const [groupResp, membersResp] = await Promise.all([
        getGroup(apiAccessToken, groupId),
        getGroupMembers(apiAccessToken, groupId),
      ]);
      setGroup(groupResp.group);
      setMembers(membersResp.members || []);
    } catch {
      setGroup(null);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [apiAccessToken, groupId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRemoveMember = useCallback(async (member: GroupMember) => {
    if (!apiAccessToken || !groupId || !canManageGroup) return;
    const targetProfileId = String(member?.profile_id || '').trim();
    if (!targetProfileId) return;
    if (removeBusyByProfile[targetProfileId]) return;
    setRemoveBusyByProfile((prev) => ({ ...prev, [targetProfileId]: true }));
    try {
      await removeGroupMember(apiAccessToken, groupId, targetProfileId);

      setMembers((prev) => prev.filter((entry) => String(entry?.profile_id || '').trim() !== targetProfileId));

      await loadData();
    } catch {
      // ignore
    } finally {
      setRemoveBusyByProfile((prev) => ({ ...prev, [targetProfileId]: false }));
    }
  }, [apiAccessToken, canManageGroup, groupId, loadData, removeBusyByProfile]);

  const handleChangeMemberPermission = useCallback(async (member: GroupMember, nextPermission: 'member' | 'admin') => {
    if (!apiAccessToken || !groupId || !canManageGroup) return;
    const targetProfileId = String(member?.profile_id || '').trim();
    if (!targetProfileId) return;
    const currentRole = String(member?.role || '').toLowerCase();
    const currentPermission: 'member' | 'admin' = currentRole === 'admin' ? 'admin' : 'member';
    if (currentPermission === nextPermission) return;
    if (currentRole === 'owner') return;
    if (isAdmin && (currentRole === 'admin' || nextPermission === 'admin')) return;
    if (roleBusyByProfile[targetProfileId]) return;
    setRoleBusyByProfile((prev) => ({ ...prev, [targetProfileId]: true }));
    try {
      await updateGroupMemberRole(apiAccessToken, groupId, targetProfileId, { role: nextPermission });
      await loadData();
    } catch {
      // ignore
    } finally {
      setRoleBusyByProfile((prev) => ({ ...prev, [targetProfileId]: false }));
    }
  }, [apiAccessToken, canManageGroup, groupId, isAdmin, loadData, roleBusyByProfile]);

  const getDisplayRoles = useCallback((member: GroupMember): PublicMemberRole[] => {
    const remoteRoles = Array.isArray(member?.public_roles)
      ? member.public_roles
          .map((entry) => String(entry || '').toLowerCase())
          .filter((entry): entry is PublicMemberRole => entry === 'athlete' || entry === 'coach' || entry === 'physio')
      : [];
    if (remoteRoles.length > 0) return remoteRoles;
    const backendRole = String(member?.role || '').toLowerCase();
    if (backendRole === 'athlete' || backendRole === 'coach' || backendRole === 'physio') return [backendRole];
    return [];
  }, []);

  const toggleInviteLinkPublicRole = useCallback((role: PublicMemberRole) => {
    setInviteLinkPublicRoles((prev) => {
      if (prev.includes(role)) {
        const next = prev.filter((entry) => entry !== role);
        return next.length > 0 ? next : prev;
      }
      return [...prev, role];
    });
  }, []);

  const toggleMemberPublicRole = useCallback(async (member: GroupMember, role: PublicMemberRole) => {
    const safeProfileId = String(member?.profile_id || '').trim();
    if (!safeProfileId) return;
    const currentBase = getDisplayRoles(member);
    const set = new Set<PublicMemberRole>(currentBase);
    if (set.has(role)) {
      if (set.size === 1) return;
      set.delete(role);
    } else {
      set.add(role);
    }
    const nextRoles = Array.from(set);
    if (!apiAccessToken || !groupId) return;
    try {
      await updateGroupMemberPublicRoles(apiAccessToken, groupId, safeProfileId, { public_roles: nextRoles });
      setMembers((prev) => prev.map((entry) => (
        String(entry?.profile_id || '').trim() === safeProfileId
          ? { ...entry, public_roles: nextRoles }
          : entry
      )));
    } catch {
      // ignore
    }
  }, [apiAccessToken, getDisplayRoles, groupId]);

  const manualCoachNames = useMemo(() => {
    const source = Array.isArray(group?.coaches) ? (group?.coaches ?? []) : [];
    return source.map((entry) => String(entry || '').trim()).filter(Boolean);
  }, [group?.coaches]);

  const handleAddManualCoach = useCallback(async () => {
    const value = String(manualCoachName || '').trim();
    if (!apiAccessToken || !groupId || !canManageGroup || !value || isSavingManualCoach) return;
    setIsSavingManualCoach(true);
    try {
      const next = Array.from(new Set([...manualCoachNames, value]));
      const updated = await updateGroup(apiAccessToken, groupId, { coaches: next });
      setGroup((prev) => {
        if (!prev) return updated?.group ?? prev;
        return updated?.group ? { ...prev, ...updated.group } : prev;
      });
      setManualCoachName('');
    } catch {
      // ignore
    } finally {
      setIsSavingManualCoach(false);
    }
  }, [apiAccessToken, canManageGroup, groupId, isSavingManualCoach, manualCoachName, manualCoachNames]);

  const handleRemoveManualCoach = useCallback(async (name: string) => {
    const value = String(name || '').trim();
    if (!apiAccessToken || !groupId || !canManageGroup || !value) return;
    try {
      const next = manualCoachNames.filter((entry) => String(entry || '').trim().toLowerCase() !== value.toLowerCase());
      const updated = await updateGroup(apiAccessToken, groupId, { coaches: next });
      setGroup((prev) => {
        if (!prev) return updated?.group ?? prev;
        return updated?.group ? { ...prev, ...updated.group } : prev;
      });
    } catch {
      // ignore
    }
  }, [apiAccessToken, canManageGroup, groupId, manualCoachNames]);

  const buildInviteLinkUrl = useCallback((token: string) => `spotme://group-invite/${encodeURIComponent(token)}`, []);

  const openInviteLinkModal = useCallback(() => {
    setInviteLinkVisible(true);
    setInviteLinkBusy(false);
    setInviteLinkUrl('');
    setInviteLinkPermission('member');
    setInviteLinkPublicRoles(['athlete']);
  }, []);

  const closeInviteLinkModal = useCallback(() => {
    if (inviteLinkBusy) return;
    setInviteLinkVisible(false);
  }, [inviteLinkBusy]);

  const handleGenerateInviteLink = useCallback(async () => {
    if (!apiAccessToken || !groupId || !canManageGroup || inviteLinkPublicRoles.length === 0 || inviteLinkBusy) return;
    setInviteLinkBusy(true);
    try {
      const resp = await createGroupInviteLink(apiAccessToken, groupId, {
        role: inviteLinkPermission,
        public_roles: inviteLinkPublicRoles,
      });
      const token = String(resp?.invite_link?.token || '').trim();
      setInviteLinkUrl(token ? buildInviteLinkUrl(token) : '');
    } catch (error: any) {
      const message = String(error?.message ?? error ?? '').trim() || t('Unable to create invitation link');
      Alert.alert(t('Invitation link failed'), message);
    } finally {
      setInviteLinkBusy(false);
    }
  }, [apiAccessToken, buildInviteLinkUrl, canManageGroup, groupId, inviteLinkBusy, inviteLinkPermission, inviteLinkPublicRoles, t]);

  const handleCopyInviteLink = useCallback(() => {
    if (!inviteLinkUrl) return;
    Clipboard.setString(inviteLinkUrl);
    Alert.alert(t('Copied'), t('Invitation link copied to clipboard.'));
  }, [inviteLinkUrl, t]);

  const handleShareInviteLink = useCallback(async () => {
    if (!inviteLinkUrl) return;
    try {
      await Share.share({
        message: inviteLinkUrl,
        url: inviteLinkUrl,
      });
    } catch {
      // ignore share cancellation/errors here
    }
  }, [inviteLinkUrl]);

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
    return (
      <View style={styles.container}>
        <SizeBox height={insets.top} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
            <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('Manage')}</Text>
          <View style={{ width: 44, height: 44 }} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SizeBox height={insets.top} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Manage')}</Text>
        <View style={{ width: 44, height: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.stateRow}><ActivityIndicator size="small" color={colors.primaryColor} /></View>
        ) : null}

        {!loading && canManageGroup ? (
          <>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{t('Invitation link')}</Text>
              <Text style={styles.hint}>{t('Generate a shareable link so people can join this group directly in the app')}</Text>
              <TouchableOpacity style={styles.inviteLinkButton} onPress={openInviteLinkModal}>
                <Link21 size={16} color={colors.primaryColor} variant="Linear" />
                <Text style={styles.inviteLinkButtonText}>{t('Generate invitation link')}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{t('Manage members')}</Text>
              {members.map((member) => {
                const permissionRole = String(member.permission_role || member.role || '').toLowerCase();
                const canEditPermission = permissionRole !== 'owner' && !(isAdmin && permissionRole === 'admin');
                const canEditPublicRoles = canManageGroup;
                const isRemovingMember = Boolean(removeBusyByProfile[String(member.profile_id)]);
                const permissionOptions = isOwner ? (['member', 'admin'] as const) : (['member'] as const);
                const selectedPermission: 'member' | 'admin' = permissionRole === 'admin' ? 'admin' : 'member';
                const publicRoles = getDisplayRoles(member);
                const badges = [
                  ...(permissionRole === 'owner' ? [t('Owner')] : []),
                  ...(permissionRole === 'admin' ? [t('Admin')] : []),
                  ...publicRoles.map((role) => t(role === 'coach' ? 'Coach' : role === 'physio' ? 'Physio' : 'Athlete')),
                ];
                return (
                  <View key={String(member.profile_id)} style={styles.memberRow}>
                    <View style={styles.memberInfo}>
                      <View style={styles.memberBody}>
                        <Text style={styles.memberName}>{member.display_name || t('Member')}</Text>
                        {badges.length > 0 ? (
                          <View style={styles.roleBadgeRow}>
                            {badges.map((badge, index) => (
                              <View key={`${member.profile_id}-badge-${badge}-${index}`} style={styles.roleBadge}>
                                <Text style={styles.roleBadgeText}>{badge}</Text>
                              </View>
                            ))}
                          </View>
                        ) : null}
                        {canEditPermission || canEditPublicRoles ? (
                          <>
                            {canEditPermission ? (
                              <>
                                <Text style={styles.memberRole}>{t('Permission')}</Text>
                                <View style={styles.roleButtonsInline}>
                                  {permissionOptions.map((option) => {
                                    const selected = selectedPermission === option;
                                    return (
                                      <TouchableOpacity
                                        key={`${member.profile_id}-permission-${option}`}
                                        style={[styles.roleButtonInline, selected && styles.roleButtonInlineActive]}
                                        disabled={Boolean(roleBusyByProfile[String(member.profile_id)])}
                                        onPress={() => handleChangeMemberPermission(member, option)}
                                      >
                                        <Text style={selected ? styles.roleButtonInlineTextActive : styles.roleButtonInlineText}>
                                          {t(option === 'admin' ? 'Admin' : 'Member')}
                                        </Text>
                                      </TouchableOpacity>
                                    );
                                  })}
                                </View>
                              </>
                            ) : null}
                            {canEditPublicRoles ? (
                              <>
                                <Text style={styles.memberRole}>{t('Public role tags')}</Text>
                                <View style={styles.roleButtonsInline}>
                                  {(['athlete', 'coach', 'physio'] as const).map((option) => {
                                    const selected = publicRoles.includes(option);
                                    return (
                                      <TouchableOpacity
                                        key={`${member.profile_id}-tag-${option}`}
                                        style={[styles.roleButtonInline, selected && styles.roleButtonInlineActive]}
                                        onPress={() => toggleMemberPublicRole(member, option)}
                                      >
                                        <Text style={selected ? styles.roleButtonInlineTextActive : styles.roleButtonInlineText}>
                                          {t(option === 'coach' ? 'Coach' : option === 'physio' ? 'Physio' : 'Athlete')}
                                        </Text>
                                      </TouchableOpacity>
                                    );
                                  })}
                                </View>
                              </>
                            ) : null}
                          </>
                        ) : null}
                      </View>
                    </View>
                    {canEditPermission ? (
                      <TouchableOpacity
                        onPress={() => handleRemoveMember(member)}
                        disabled={isRemovingMember}
                        style={[
                          styles.memberRemoveButton,
                          isRemovingMember && styles.iconButtonDisabled,
                        ]}
                      >
                        {isRemovingMember ? (
                          <ActivityIndicator size="small" color={colors.errorColor || '#E14B4B'} />
                        ) : (
                          <Trash size={18} color={colors.errorColor || '#E14B4B'} variant="Linear" />
                        )}
                      </TouchableOpacity>
                    ) : null}
                  </View>
                );
              })}
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{t('Add coach name')}</Text>
              <View style={styles.searchInputWrap}>
                <TextInput
                  style={styles.searchInput}
                  placeholder={t('Coach name')}
                  placeholderTextColor={colors.subTextColor}
                  value={manualCoachName}
                  onChangeText={setManualCoachName}
                />
                <TouchableOpacity style={styles.actionButton} onPress={handleAddManualCoach} disabled={isSavingManualCoach || !manualCoachName.trim()}>
                  {isSavingManualCoach ? (
                    <ActivityIndicator size="small" color={colors.whiteColor} />
                  ) : (
                    <>
                      <Add size={14} color={colors.whiteColor} variant="Linear" />
                      <Text style={styles.actionButtonText}>{t('Add')}</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
              {manualCoachNames.length > 0 ? (
                <View style={styles.manualCoachChips}>
                  {manualCoachNames.map((coachName) => (
                    <TouchableOpacity
                      key={`manual-coach-${coachName}`}
                      style={styles.manualCoachChip}
                      onPress={() => handleRemoveManualCoach(coachName)}
                    >
                      <Text style={styles.manualCoachChipText}>{coachName}</Text>
                      <Trash size={14} color={colors.errorColor || '#E14B4B'} variant="Linear" />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}
            </View>
          </>
        ) : null}

        <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
      </ScrollView>

      <Modal
        visible={inviteLinkVisible}
        transparent
        animationType="fade"
        onRequestClose={closeInviteLinkModal}
      >
        <Pressable style={styles.modalBackdrop} onPress={closeInviteLinkModal}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>{t('Invitation link')}</Text>
            <Text style={styles.modalHint}>{t('Choose the public role tags for people joining through this link, then generate and share it.')}</Text>

            <Text style={styles.selectedInviteMeta}>{t('Select public roles')}</Text>
            <View style={styles.roleToggle}>
              {(['athlete', 'coach', 'physio'] as const).map((role) => (
                <TouchableOpacity
                  key={`invite-link-role-${role}`}
                  style={[styles.roleButton, inviteLinkPublicRoles.includes(role) && styles.roleButtonActive]}
                  onPress={() => toggleInviteLinkPublicRole(role)}
                >
                  <Text style={inviteLinkPublicRoles.includes(role) ? styles.roleTextActive : styles.roleText}>
                    {t(role === 'athlete' ? 'Athlete' : role === 'coach' ? 'Coach' : 'Physio')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.selectedInviteMeta}>{t('Select permission')}</Text>
            <View style={styles.roleToggle}>
              <TouchableOpacity
                style={[styles.roleButton, inviteLinkPermission === 'member' && styles.roleButtonActive]}
                onPress={() => setInviteLinkPermission('member')}
              >
                <Text style={inviteLinkPermission === 'member' ? styles.roleTextActive : styles.roleText}>{t('Member')}</Text>
              </TouchableOpacity>
              {isOwner ? (
                <TouchableOpacity
                  style={[styles.roleButton, inviteLinkPermission === 'admin' && styles.roleButtonActive]}
                  onPress={() => setInviteLinkPermission('admin')}
                >
                  <Text style={inviteLinkPermission === 'admin' ? styles.roleTextActive : styles.roleText}>{t('Admin')}</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {inviteLinkUrl ? (
              <View style={styles.linkValueCard}>
                <Text style={styles.linkValueText}>{inviteLinkUrl}</Text>
              </View>
            ) : null}

            <View style={styles.modalActionsRow}>
              <TouchableOpacity style={styles.modalAction} onPress={closeInviteLinkModal} disabled={inviteLinkBusy}>
                <Text style={styles.modalActionText}>{t('Close')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalAction, styles.modalActionPrimary]}
                onPress={handleGenerateInviteLink}
                disabled={inviteLinkBusy || inviteLinkPublicRoles.length === 0}
              >
                {inviteLinkBusy ? (
                  <ActivityIndicator size="small" color={colors.whiteColor} />
                ) : (
                  <>
                    <Refresh2 size={16} color={colors.whiteColor} variant="Linear" />
                    <Text style={styles.modalActionTextPrimary}>{inviteLinkUrl ? t('Regenerate') : t('Generate')}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {inviteLinkUrl ? (
              <View style={styles.modalActionsRow}>
                <TouchableOpacity style={styles.modalAction} onPress={handleCopyInviteLink}>
                  <Copy size={16} color={colors.mainTextColor} variant="Linear" />
                  <Text style={styles.modalActionText}>{t('Copy link')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalAction} onPress={handleShareInviteLink}>
                  <ShareIcon size={16} color={colors.mainTextColor} variant="Linear" />
                  <Text style={styles.modalActionText}>{t('Share')}</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default GroupManageScreen;
