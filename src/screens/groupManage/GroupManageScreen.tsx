import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft2, Add, SearchNormal1, Trash } from 'iconsax-react-nativejs';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SizeBox from '../../constants/SizeBox';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
  getGroup,
  getGroupMembers,
  getProfileSummary,
  inviteGroupMember,
  listGroupInvites,
  removeGroupMember,
  searchProfiles,
  updateGroup,
  updateGroupMemberRole,
  type GroupMember,
  type GroupMemberInvite,
  type GroupSummary,
  type ProfileSearchResult,
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
  const [viewerProfileId, setViewerProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [memberQuery, setMemberQuery] = useState('');
  const [memberSearchLoading, setMemberSearchLoading] = useState(false);
  const [memberSearchResults, setMemberSearchResults] = useState<ProfileSearchResult[]>([]);
  const [pendingInviteByProfile, setPendingInviteByProfile] = useState<Record<string, string>>({});
  const [addBusyByProfile, setAddBusyByProfile] = useState<Record<string, boolean>>({});
  const [roleBusyByProfile, setRoleBusyByProfile] = useState<Record<string, boolean>>({});
  const [removeBusyByProfile, setRemoveBusyByProfile] = useState<Record<string, boolean>>({});

  const [selectedInviteProfile, setSelectedInviteProfile] = useState<ProfileSearchResult | null>(null);
  const [invitePublicRoles, setInvitePublicRoles] = useState<PublicMemberRole[]>(['athlete']);
  const [invitePermission, setInvitePermission] = useState<'member' | 'admin'>('member');
  const [memberRoleTags, setMemberRoleTags] = useState<Record<string, PublicMemberRole[]>>({});

  const [manualCoachName, setManualCoachName] = useState('');
  const [isSavingManualCoach, setIsSavingManualCoach] = useState(false);

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
  const roleTagsStorageKey = useMemo(
    () => (groupId ? `@group_member_role_tags_${groupId}` : ''),
    [groupId],
  );

  const persistRoleTags = useCallback(
    async (next: Record<string, PublicMemberRole[]>) => {
      if (!roleTagsStorageKey) return;
      try {
        await AsyncStorage.setItem(roleTagsStorageKey, JSON.stringify(next));
      } catch {
        // ignore
      }
    },
    [roleTagsStorageKey],
  );

  useEffect(() => {
    let mounted = true;
    if (!roleTagsStorageKey) {
      setMemberRoleTags({});
      return () => {
        mounted = false;
      };
    }
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(roleTagsStorageKey);
        if (!mounted) return;
        const parsed = raw ? JSON.parse(raw) : {};
        const next = Object.entries(parsed || {}).reduce((acc, [profileId, roles]) => {
          const normalized = Array.isArray(roles)
            ? roles
                .map((entry) => String(entry || '').toLowerCase())
                .filter((entry): entry is PublicMemberRole => entry === 'athlete' || entry === 'coach' || entry === 'physio')
            : [];
          if (normalized.length > 0) acc[String(profileId)] = normalized;
          return acc;
        }, {} as Record<string, PublicMemberRole[]>);
        setMemberRoleTags(next);
      } catch {
        if (mounted) setMemberRoleTags({});
      }
    })();
    return () => {
      mounted = false;
    };
  }, [roleTagsStorageKey]);

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

  useEffect(() => {
    let mounted = true;
    if (!apiAccessToken) return () => {};
    getProfileSummary(apiAccessToken)
      .then((resp) => {
        if (mounted) setViewerProfileId(resp?.profile_id ? String(resp.profile_id) : null);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [apiAccessToken]);

  useEffect(() => {
    let mounted = true;
    if (!apiAccessToken || !groupId || !canManageGroup) {
      setPendingInviteByProfile({});
      return () => {
        mounted = false;
      };
    }
    (async () => {
      try {
        const resp = await listGroupInvites(apiAccessToken, groupId, { status: 'pending', limit: 200 });
        if (!mounted) return;
        const invites = Array.isArray(resp?.invites) ? resp.invites : [];
        const next = invites.reduce((acc, invite: GroupMemberInvite) => {
          const profileId = String(invite?.profile_id || '').trim();
          if (profileId) acc[profileId] = String(invite.role || 'member');
          return acc;
        }, {} as Record<string, string>);
        setPendingInviteByProfile(next);
      } catch {
        if (mounted) setPendingInviteByProfile({});
      }
    })();
    return () => {
      mounted = false;
    };
  }, [apiAccessToken, canManageGroup, groupId]);

  const memberIds = useMemo(() => new Set(members.map((m) => String(m.profile_id))), [members]);

  const filteredMemberSearchResults = useMemo(() => {
    const own = String(viewerProfileId || '').trim();
    return memberSearchResults.filter((profile) => {
      const profileId = String(profile?.profile_id || '').trim();
      if (!profileId) return false;
      if (profileId === own) return false;
      return !memberIds.has(profileId);
    });
  }, [memberIds, memberSearchResults, viewerProfileId]);

  useEffect(() => {
    let mounted = true;
    if (!apiAccessToken || !canManageGroup || !groupId) {
      setMemberSearchResults([]);
      setMemberSearchLoading(false);
      return () => {
        mounted = false;
      };
    }
    const query = memberQuery.trim();
    if (!query) {
      setMemberSearchResults([]);
      setMemberSearchLoading(false);
      return () => {
        mounted = false;
      };
    }

    const timer = setTimeout(async () => {
      setMemberSearchLoading(true);
      try {
        const resp = await searchProfiles(apiAccessToken, { q: query, limit: 12 });
        if (!mounted) return;
        setMemberSearchResults(resp?.profiles || []);
      } catch {
        if (!mounted) return;
        setMemberSearchResults([]);
      } finally {
        if (mounted) setMemberSearchLoading(false);
      }
    }, 250);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [apiAccessToken, canManageGroup, groupId, memberQuery]);

  const handleAddMember = async (profile: ProfileSearchResult) => {
    if (!apiAccessToken || !groupId || !canManageGroup) return;
    const profileId = String(profile?.profile_id || '').trim();
    if (!profileId || memberIds.has(profileId)) return;
    if (pendingInviteByProfile[profileId]) return;
    if (addBusyByProfile[profileId]) return;
    const roleToInvite = invitePermission;
    setAddBusyByProfile((prev) => ({ ...prev, [profileId]: true }));
    try {
      await inviteGroupMember(apiAccessToken, groupId, {
        profile_id: profileId,
        role: roleToInvite,
      });
      const nextRoles: PublicMemberRole[] = invitePublicRoles.length > 0 ? invitePublicRoles : ['athlete'];
      const nextTags = { ...memberRoleTags, [profileId]: Array.from(new Set(nextRoles)) };
      setMemberRoleTags(nextTags);
      await persistRoleTags(nextTags);
      setPendingInviteByProfile((prev) => ({ ...prev, [profileId]: roleToInvite }));
      setMemberSearchResults((prev) => prev.filter((p) => String(p.profile_id) !== profileId));
      setSelectedInviteProfile(null);
      setInvitePermission('member');
      setInvitePublicRoles(['athlete']);
      setMemberQuery('');
    } catch {
      // ignore
    } finally {
      setAddBusyByProfile((prev) => ({ ...prev, [profileId]: false }));
    }
  };

  const handleRemoveMember = useCallback(async (member: GroupMember) => {
    if (!apiAccessToken || !groupId || !canManageGroup) return;
    const targetProfileId = String(member?.profile_id || '').trim();
    if (!targetProfileId) return;
    if (removeBusyByProfile[targetProfileId]) return;
    setRemoveBusyByProfile((prev) => ({ ...prev, [targetProfileId]: true }));
    try {
      await removeGroupMember(apiAccessToken, groupId, targetProfileId);

      setMembers((prev) => prev.filter((entry) => String(entry?.profile_id || '').trim() !== targetProfileId));
      setPendingInviteByProfile((prev) => {
        if (!Object.prototype.hasOwnProperty.call(prev, targetProfileId)) return prev;
        const next = { ...prev };
        delete next[targetProfileId];
        return next;
      });

      if (Object.prototype.hasOwnProperty.call(memberRoleTags, targetProfileId)) {
        const nextTags = { ...memberRoleTags };
        delete nextTags[targetProfileId];
        setMemberRoleTags(nextTags);
        await persistRoleTags(nextTags);
      }

      await loadData();
    } catch {
      // ignore
    } finally {
      setRemoveBusyByProfile((prev) => ({ ...prev, [targetProfileId]: false }));
    }
  }, [apiAccessToken, canManageGroup, groupId, loadData, memberRoleTags, persistRoleTags, removeBusyByProfile]);

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
    const profileId = String(member?.profile_id || '').trim();
    const local = profileId ? memberRoleTags[profileId] : undefined;
    if (Array.isArray(local) && local.length > 0) return local;
    const backendRole = String(member?.role || '').toLowerCase();
    if (backendRole === 'athlete' || backendRole === 'coach' || backendRole === 'physio') return [backendRole];
    return [];
  }, [memberRoleTags]);

  const toggleInvitePublicRole = useCallback((role: PublicMemberRole) => {
    setInvitePublicRoles((prev) => {
      if (prev.includes(role)) {
        const next = prev.filter((entry) => entry !== role);
        return next.length > 0 ? next : prev;
      }
      return [...prev, role];
    });
  }, []);

  const toggleMemberPublicRole = useCallback(async (profileId: string, role: PublicMemberRole, fallbackRole?: string | null) => {
    const safeProfileId = String(profileId || '').trim();
    if (!safeProfileId) return;
    const currentBase = Array.isArray(memberRoleTags[safeProfileId])
      ? memberRoleTags[safeProfileId]
      : (String(fallbackRole || '').toLowerCase() === 'athlete' || String(fallbackRole || '').toLowerCase() === 'coach' || String(fallbackRole || '').toLowerCase() === 'physio')
        ? ([String(fallbackRole).toLowerCase()] as PublicMemberRole[])
        : [];
    const set = new Set<PublicMemberRole>(currentBase);
    if (set.has(role)) {
      if (set.size === 1) return;
      set.delete(role);
    } else {
      set.add(role);
    }
    const nextRoles = Array.from(set);
    const next = { ...memberRoleTags, [safeProfileId]: nextRoles };
    setMemberRoleTags(next);
    await persistRoleTags(next);
  }, [memberRoleTags, persistRoleTags]);

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
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.lightGrayColor,
    },
    memberInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.btnBackgroundColor },
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
              <Text style={styles.sectionTitle}>{t('Invite member')}</Text>
              <Text style={styles.hint}>{t('Search first, then choose public roles and permission')}</Text>
              <View style={styles.searchInputWrap}>
                <SearchNormal1 size={18} color={colors.primaryColor} variant="Linear" />
                <TextInput
                  style={styles.searchInput}
                  placeholder={t('Search users')}
                  placeholderTextColor={colors.subTextColor}
                  value={memberQuery}
                  onChangeText={setMemberQuery}
                  returnKeyType="search"
                />
              </View>

              {memberSearchLoading ? (
                <View style={styles.stateRow}><ActivityIndicator size="small" color={colors.primaryColor} /></View>
              ) : null}

              {!memberSearchLoading && !selectedInviteProfile
                ? filteredMemberSearchResults.map((profile) => {
                  const profileId = String(profile.profile_id);
                  const pendingRole = pendingInviteByProfile[profileId];
                  return (
                    <TouchableOpacity
                      key={profileId}
                      style={styles.searchResultRow}
                      onPress={() => setSelectedInviteProfile(profile)}
                      disabled={Boolean(pendingRole)}
                    >
                      <View style={{ flex: 1, paddingRight: 12 }}>
                        <Text style={styles.searchResultName}>{profile.display_name || t('Unnamed user')}</Text>
                        <Text style={styles.searchResultMeta}>
                          {pendingRole ? `${t('Invite pending')} (${pendingRole})` : t('Tap to continue')}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
                : null}

              {selectedInviteProfile ? (
                <View style={styles.selectedInviteCard}>
                  <Text style={styles.selectedInviteName}>{selectedInviteProfile.display_name || t('Unnamed user')}</Text>
                  <Text style={styles.selectedInviteMeta}>{t('Select public roles')}</Text>
                  <View style={styles.roleToggle}>
                    {(['athlete', 'coach', 'physio'] as const).map((role) => (
                      <TouchableOpacity
                        key={role}
                        style={[styles.roleButton, invitePublicRoles.includes(role) && styles.roleButtonActive]}
                        onPress={() => toggleInvitePublicRole(role)}
                      >
                        <Text style={invitePublicRoles.includes(role) ? styles.roleTextActive : styles.roleText}>
                          {t(role === 'athlete' ? 'Athlete' : role === 'coach' ? 'Coach' : 'Physio')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.selectedInviteMeta}>{t('Select permission')}</Text>
                  <View style={styles.roleToggle}>
                    <TouchableOpacity
                      style={[styles.roleButton, invitePermission === 'member' && styles.roleButtonActive]}
                      onPress={() => setInvitePermission('member')}
                    >
                      <Text style={invitePermission === 'member' ? styles.roleTextActive : styles.roleText}>{t('Member')}</Text>
                    </TouchableOpacity>
                    {isOwner ? (
                      <TouchableOpacity
                        style={[styles.roleButton, invitePermission === 'admin' && styles.roleButtonActive]}
                        onPress={() => setInvitePermission('admin')}
                      >
                        <Text style={invitePermission === 'admin' ? styles.roleTextActive : styles.roleText}>{t('Admin')}</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.neutralButton} onPress={() => setSelectedInviteProfile(null)}>
                      <Text style={styles.neutralButtonText}>{t('Cancel')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleAddMember(selectedInviteProfile)}
                      disabled={Boolean(addBusyByProfile[String(selectedInviteProfile.profile_id)]) || invitePublicRoles.length === 0}
                    >
                      {addBusyByProfile[String(selectedInviteProfile.profile_id)] ? (
                        <ActivityIndicator size="small" color={colors.whiteColor} />
                      ) : (
                        <>
                          <Add size={14} color={colors.whiteColor} variant="Linear" />
                          <Text style={styles.actionButtonText}>{t('Invite')}</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{t('Manage members')}</Text>
              {members.map((member) => {
                const avatarUrl = member.avatar_url ? toAbsoluteUrl(String(member.avatar_url)) : null;
                const role = String(member.role || '').toLowerCase();
                const canEditRole = role !== 'owner' && !(isAdmin && role === 'admin');
                const isRemovingMember = Boolean(removeBusyByProfile[String(member.profile_id)]);
                const permissionOptions = isOwner ? (['member', 'admin'] as const) : (['member'] as const);
                const selectedPermission: 'member' | 'admin' = role === 'admin' ? 'admin' : 'member';
                const publicRoles = getDisplayRoles(member);
                return (
                  <View key={String(member.profile_id)} style={styles.memberRow}>
                    <View style={styles.memberInfo}>
                      {avatarUrl ? <FastImage source={{ uri: avatarUrl }} style={styles.avatar} /> : <View style={styles.avatar} />}
                      <View style={{ flex: 1 }}>
                        <Text style={styles.memberName}>{member.display_name || t('Member')}</Text>
                        {canEditRole ? (
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
                            <Text style={styles.memberRole}>{t('Public role tags')}</Text>
                            <View style={styles.roleButtonsInline}>
                              {(['athlete', 'coach', 'physio'] as const).map((option) => {
                                const selected = publicRoles.includes(option);
                                return (
                                  <TouchableOpacity
                                    key={`${member.profile_id}-tag-${option}`}
                                    style={[styles.roleButtonInline, selected && styles.roleButtonInlineActive]}
                                    onPress={() => toggleMemberPublicRole(String(member.profile_id), option, member.role)}
                                  >
                                    <Text style={selected ? styles.roleButtonInlineTextActive : styles.roleButtonInlineText}>
                                      {t(option === 'coach' ? 'Coach' : option === 'physio' ? 'Physio' : 'Athlete')}
                                    </Text>
                                  </TouchableOpacity>
                                );
                              })}
                            </View>
                          </>
                        ) : (
                          <Text style={styles.memberRole}>{t('Owner')}</Text>
                        )}
                      </View>
                    </View>
                    {canEditRole ? (
                      <TouchableOpacity
                        onPress={() => handleRemoveMember(member)}
                        disabled={isRemovingMember}
                        style={isRemovingMember ? styles.iconButtonDisabled : undefined}
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
            </View>
          </>
        ) : null}

        <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
      </ScrollView>
    </View>
  );
};

export default GroupManageScreen;
