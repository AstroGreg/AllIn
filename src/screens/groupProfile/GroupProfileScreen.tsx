import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, TextInput } from 'react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { createStyles } from './GroupProfileStyles';
import { Add, ArrowLeft2, Location, Profile2User, SearchNormal1, Trash, UserTick } from 'iconsax-react-nativejs';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
    addGroupMember,
    assignGroupMembersToEvent,
    followProfile,
    getGroup,
    getGroupAssignedEvents,
    getGroupMembers,
    getMyGroups,
    getProfileSummary,
    removeGroupMember,
    searchEvents,
    searchProfiles,
    unfollowProfile,
    type GroupAssignedEvent,
    type GroupMember,
    type GroupSummary,
    type ProfileSearchResult,
    type SubscribedEvent,
} from '../../services/apiGateway';
import { getApiBaseUrl } from '../../constants/RuntimeConfig';

const GroupProfileScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);

    const [activeTab, setActiveTab] = useState<'athletes' | 'coaches' | 'events'>('athletes');
    const [groupId, setGroupId] = useState<string | null>(route?.params?.groupId ?? null);
    const [group, setGroup] = useState<GroupSummary | null>(null);
    const [members, setMembers] = useState<GroupMember[]>([]);
    const [viewerProfileId, setViewerProfileId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [followBusyByProfile, setFollowBusyByProfile] = useState<Record<string, boolean>>({});
    const [addMemberRole, setAddMemberRole] = useState<'athlete' | 'coach'>('athlete');
    const [memberQuery, setMemberQuery] = useState('');
    const [memberSearchLoading, setMemberSearchLoading] = useState(false);
    const [memberSearchResults, setMemberSearchResults] = useState<ProfileSearchResult[]>([]);
    const [addBusyByProfile, setAddBusyByProfile] = useState<Record<string, boolean>>({});
    const [groupEvents, setGroupEvents] = useState<GroupAssignedEvent[]>([]);
    const [eventQuery, setEventQuery] = useState('');
    const [eventSearchLoading, setEventSearchLoading] = useState(false);
    const [eventSearchResults, setEventSearchResults] = useState<SubscribedEvent[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [selectedAthleteIds, setSelectedAthleteIds] = useState<string[]>([]);
    const [isAssigningAthletes, setIsAssigningAthletes] = useState(false);

    const { apiAccessToken } = useAuth();

    useEffect(() => {
        const incomingGroupId = String(route?.params?.groupId ?? '').trim();
        if (!incomingGroupId) return;
        if (incomingGroupId !== String(groupId ?? '')) {
            setGroupId(incomingGroupId);
        }
    }, [groupId, route?.params?.groupId]);

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
        const loadGroup = async () => {
            if (!apiAccessToken) return;
            setLoading(true);
            try {
                let targetGroupId = groupId;
                if (!targetGroupId) {
                    const mine = await getMyGroups(apiAccessToken);
                    targetGroupId = mine.groups?.[0]?.group_id ?? null;
                    if (mounted) setGroupId(targetGroupId);
                }
                if (!targetGroupId) {
                    if (mounted) {
                        setGroup(null);
                        setMembers([]);
                    }
                    return;
                }

                const groupResp = await getGroup(apiAccessToken, targetGroupId);
                const membersResp = await getGroupMembers(apiAccessToken, targetGroupId);
                if (!mounted) return;
                setGroup(groupResp.group);
                setMembers(membersResp.members || []);
            } catch {
                if (mounted) {
                    setGroup(null);
                    setMembers([]);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };
        loadGroup();
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, groupId]);

    const isOwner = useMemo(() => {
        if (!group || !viewerProfileId) return false;
        return String(group.owner_profile_id || '') === String(viewerProfileId) || group.my_role === 'owner';
    }, [group, viewerProfileId]);

    const athletes = useMemo(
        () => members.filter((m) => String(m.role || '').toLowerCase() === 'athlete'),
        [members],
    );
    const coaches = useMemo(
        () =>
            members.filter((m) => {
                const role = String(m.role || '').toLowerCase();
                return role === 'coach' || role === 'owner';
            }),
        [members],
    );

    const toAbsoluteUrl = useCallback((value?: string | null) => {
        if (!value) return null;
        const raw = String(value);
        if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
        const base = getApiBaseUrl();
        if (!base) return raw;
        return `${base.replace(/\/$/, '')}/${raw.replace(/^\//, '')}`;
    }, []);

    const groupName = group?.name || t('Group');
    const groupDescription = group?.description || t('No description added yet.');
    const groupOwnerName = group?.owner_name || t('Owner');
    const ownerAvatarUrl = group?.owner_avatar_url ? toAbsoluteUrl(String(group.owner_avatar_url)) : null;
    const memberCount = group?.member_count ?? members.length;
    const followersCount = Number(group?.followers_count ?? 0);

    const localStyles = useMemo(
        () =>
            StyleSheet.create({
                memberRow: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 12,
                    borderBottomWidth: 0.5,
                    borderBottomColor: colors.lightGrayColor,
                },
                memberInfo: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    flex: 1,
                },
                avatar: {
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: colors.btnBackgroundColor,
                },
                memberName: {
                    fontSize: 14,
                    color: colors.mainTextColor,
                },
                memberRole: {
                    fontSize: 12,
                    color: colors.subTextColor,
                },
                followButton: {
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: colors.primaryColor,
                },
                followButtonAlt: {
                    backgroundColor: colors.btnBackgroundColor,
                    borderWidth: 1,
                    borderColor: colors.primaryColor,
                },
                followText: {
                    fontSize: 12,
                    color: colors.whiteColor,
                },
                followTextAlt: {
                    color: colors.primaryColor,
                },
                ownerBadge: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                },
                emptyState: {
                    paddingVertical: 24,
                    alignItems: 'center',
                },
                emptyText: {
                    fontSize: 12,
                    color: colors.subTextColor,
                },
                deleteButton: {
                    marginLeft: 8,
                },
                addMembersSection: {
                    marginTop: 12,
                    borderWidth: 1,
                    borderColor: colors.borderColor,
                    borderRadius: 12,
                    backgroundColor: colors.whiteColor,
                    padding: 12,
                },
                addMembersTitle: {
                    fontSize: 13,
                    color: colors.mainTextColor,
                    marginBottom: 8,
                },
                roleToggle: {
                    flexDirection: 'row',
                    gap: 8,
                    marginBottom: 10,
                },
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
                roleButtonActive: {
                    backgroundColor: colors.secondaryBlueColor,
                    borderColor: colors.primaryColor,
                },
                roleText: {
                    fontSize: 12,
                    color: colors.subTextColor,
                },
                roleTextActive: {
                    fontSize: 12,
                    color: colors.primaryColor,
                },
                searchInputWrap: {
                    height: 44,
                    borderWidth: 1,
                    borderColor: colors.borderColor,
                    borderRadius: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 10,
                    backgroundColor: colors.whiteColor,
                },
                searchInput: {
                    flex: 1,
                    fontSize: 13,
                    color: colors.mainTextColor,
                    paddingVertical: 0,
                    marginLeft: 8,
                },
                searchStateRow: {
                    paddingVertical: 12,
                    alignItems: 'center',
                },
                searchResultRow: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 10,
                    borderBottomWidth: 0.5,
                    borderBottomColor: colors.lightGrayColor,
                },
                searchResultName: {
                    fontSize: 13,
                    color: colors.mainTextColor,
                },
                searchResultMeta: {
                    fontSize: 11,
                    color: colors.subTextColor,
                    marginTop: 2,
                },
                addButton: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    borderRadius: 8,
                    backgroundColor: colors.primaryColor,
                    paddingHorizontal: 10,
                    paddingVertical: 7,
                },
                addButtonText: {
                    fontSize: 12,
                    color: colors.whiteColor,
                },
                followersRow: {
                    marginTop: 8,
                    alignItems: 'center',
                },
                followersText: {
                    fontSize: 12,
                    color: colors.subTextColor,
                },
                eventsAssignSection: {
                    marginTop: 12,
                    borderWidth: 1,
                    borderColor: colors.borderColor,
                    borderRadius: 12,
                    backgroundColor: colors.whiteColor,
                    padding: 12,
                },
                eventOptionRow: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 10,
                    borderBottomWidth: 0.5,
                    borderBottomColor: colors.lightGrayColor,
                },
                eventOptionTitle: {
                    fontSize: 13,
                    color: colors.mainTextColor,
                },
                eventOptionMeta: {
                    fontSize: 11,
                    color: colors.subTextColor,
                    marginTop: 2,
                },
                eventSelectBadge: {
                    borderWidth: 1,
                    borderColor: colors.primaryColor,
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    backgroundColor: colors.secondaryBlueColor,
                },
                eventSelectBadgeText: {
                    fontSize: 11,
                    color: colors.primaryColor,
                },
                selectedEventRow: {
                    marginTop: 10,
                    paddingVertical: 8,
                    paddingHorizontal: 10,
                    borderRadius: 8,
                    backgroundColor: colors.btnBackgroundColor,
                    borderWidth: 1,
                    borderColor: colors.lightGrayColor,
                },
                selectedEventText: {
                    fontSize: 12,
                    color: colors.mainTextColor,
                },
                athleteSelectTitle: {
                    fontSize: 12,
                    color: colors.subTextColor,
                    marginTop: 12,
                    marginBottom: 6,
                },
                athleteSelectRow: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 9,
                    borderBottomWidth: 0.5,
                    borderBottomColor: colors.lightGrayColor,
                },
                athleteSelectName: {
                    fontSize: 13,
                    color: colors.mainTextColor,
                },
                checkbox: {
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: colors.primaryColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                },
                checkboxChecked: {
                    backgroundColor: colors.primaryColor,
                },
                checkboxText: {
                    fontSize: 12,
                    color: colors.whiteColor,
                },
                assignButton: {
                    marginTop: 12,
                    borderRadius: 10,
                    backgroundColor: colors.primaryColor,
                    paddingVertical: 11,
                    alignItems: 'center',
                    justifyContent: 'center',
                },
                assignButtonDisabled: {
                    opacity: 0.45,
                },
                assignButtonText: {
                    fontSize: 13,
                    color: colors.whiteColor,
                },
                eventsListSection: {
                    marginTop: 12,
                },
                eventListCard: {
                    borderWidth: 0.5,
                    borderColor: colors.lightGrayColor,
                    borderRadius: 10,
                    padding: 12,
                    marginBottom: 10,
                    backgroundColor: colors.whiteColor,
                },
                eventListName: {
                    fontSize: 13,
                    color: colors.mainTextColor,
                },
                eventListMeta: {
                    marginTop: 4,
                    fontSize: 11,
                    color: colors.subTextColor,
                },
            }),
        [colors],
    );

    const refreshGroupData = useCallback(
        async (forcedGroupId?: string | null) => {
            if (!apiAccessToken) return;
            const targetGroupId = String(forcedGroupId ?? groupId ?? '').trim();
            if (!targetGroupId) return;
            try {
                const [groupResp, membersResp] = await Promise.all([
                    getGroup(apiAccessToken, targetGroupId),
                    getGroupMembers(apiAccessToken, targetGroupId),
                ]);
                setGroup(groupResp.group);
                setMembers(membersResp.members || []);
            } catch {
                // ignore refresh errors for now
            }
        },
        [apiAccessToken, groupId],
    );

    const refreshGroupEvents = useCallback(
        async (forcedGroupId?: string | null) => {
            if (!apiAccessToken) return;
            const targetGroupId = String(forcedGroupId ?? groupId ?? '').trim();
            if (!targetGroupId) {
                setGroupEvents([]);
                return;
            }
            try {
                const resp = await getGroupAssignedEvents(apiAccessToken, targetGroupId);
                setGroupEvents(Array.isArray(resp?.events) ? resp.events : []);
            } catch {
                setGroupEvents([]);
            }
        },
        [apiAccessToken, groupId],
    );

    useEffect(() => {
        if (activeTab === 'athletes') {
            setAddMemberRole('athlete');
            return;
        }
        if (activeTab === 'coaches') {
            setAddMemberRole('coach');
            return;
        }
        setMemberQuery('');
        setMemberSearchResults([]);
        setEventQuery('');
        setEventSearchResults([]);
    }, [activeTab]);

    useEffect(() => {
        if (activeTab !== 'events' || !group?.group_id) return;
        setSelectedEventId(null);
        setSelectedAthleteIds([]);
        refreshGroupEvents(String(group.group_id));
    }, [activeTab, group?.group_id, refreshGroupEvents]);

    const memberIds = useMemo(() => {
        return new Set(members.map((m) => String(m.profile_id)));
    }, [members]);

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
        if (!apiAccessToken || !isOwner || !group?.group_id) {
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
    }, [apiAccessToken, group?.group_id, isOwner, memberQuery]);

    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken || !isOwner || !group?.group_id || activeTab !== 'events') {
            setEventSearchResults([]);
            setEventSearchLoading(false);
            return () => {
                mounted = false;
            };
        }

        const timer = setTimeout(async () => {
            setEventSearchLoading(true);
            try {
                const resp = await searchEvents(apiAccessToken, { q: eventQuery.trim(), limit: 30 });
                if (!mounted) return;
                const rows = Array.isArray(resp?.events) ? resp.events : [];
                setEventSearchResults(rows);
            } catch {
                if (!mounted) return;
                setEventSearchResults([]);
            } finally {
                if (mounted) setEventSearchLoading(false);
            }
        }, 250);

        return () => {
            mounted = false;
            clearTimeout(timer);
        };
    }, [activeTab, apiAccessToken, eventQuery, group?.group_id, isOwner]);

    const selectedEventLabel = useMemo(() => {
        const safe = String(selectedEventId || '').trim();
        if (!safe) return '';
        const fromSearch = eventSearchResults.find((evt) => String(evt.event_id || '') === safe);
        if (fromSearch) return String(fromSearch.event_name || fromSearch.event_title || t('Competition'));
        const fromAssigned = groupEvents.find((evt) => String(evt.event_id || '') === safe);
        if (fromAssigned) return String(fromAssigned.event_name || t('Competition'));
        return safe;
    }, [eventSearchResults, groupEvents, selectedEventId, t]);

    const toggleAthleteSelection = useCallback((profileId: string) => {
        const safeId = String(profileId || '').trim();
        if (!safeId) return;
        setSelectedAthleteIds((prev) => (
            prev.includes(safeId) ? prev.filter((id) => id !== safeId) : [...prev, safeId]
        ));
    }, []);

    const handleAssignAthletes = useCallback(async () => {
        if (!apiAccessToken || !group?.group_id) return;
        const eventId = String(selectedEventId || '').trim();
        if (!eventId || selectedAthleteIds.length === 0 || isAssigningAthletes) return;
        setIsAssigningAthletes(true);
        try {
            await assignGroupMembersToEvent(apiAccessToken, String(group.group_id), eventId, {
                profile_ids: selectedAthleteIds,
            });
            await refreshGroupEvents(String(group.group_id));
            setSelectedAthleteIds([]);
        } catch {
            // ignore for now
        } finally {
            setIsAssigningAthletes(false);
        }
    }, [apiAccessToken, group?.group_id, isAssigningAthletes, refreshGroupEvents, selectedAthleteIds, selectedEventId]);

    const handleAddMember = async (profile: ProfileSearchResult) => {
        if (!apiAccessToken || !group?.group_id) return;
        const profileId = String(profile?.profile_id || '').trim();
        if (!profileId || memberIds.has(profileId)) return;
        if (addBusyByProfile[profileId]) return;
        setAddBusyByProfile((prev) => ({ ...prev, [profileId]: true }));
        try {
            await addGroupMember(apiAccessToken, String(group.group_id), {
                profile_id: profileId,
                role: addMemberRole,
            });
            await refreshGroupData(String(group.group_id));
            setMemberSearchResults((prev) => prev.filter((p) => String(p.profile_id) !== profileId));
        } catch {
            // ignore for now
        } finally {
            setAddBusyByProfile((prev) => ({ ...prev, [profileId]: false }));
        }
    };

    const handleToggleFollow = async (member: GroupMember) => {
        if (!apiAccessToken || !member.profile_id || !viewerProfileId) return;
        if (String(member.profile_id) === String(viewerProfileId)) return;
        const targetProfileId = String(member.profile_id);
        if (followBusyByProfile[targetProfileId]) return;
        setFollowBusyByProfile((prev) => ({ ...prev, [targetProfileId]: true }));
        try {
            if (member.is_following) {
                await unfollowProfile(apiAccessToken, targetProfileId);
                setMembers((prev) =>
                    prev.map((m) => (String(m.profile_id) === targetProfileId ? { ...m, is_following: false } : m)),
                );
            } else {
                await followProfile(apiAccessToken, targetProfileId);
                setMembers((prev) =>
                    prev.map((m) => (String(m.profile_id) === targetProfileId ? { ...m, is_following: true } : m)),
                );
            }
        } catch {
            // ignore for now
        } finally {
            setFollowBusyByProfile((prev) => ({ ...prev, [targetProfileId]: false }));
        }
    };

    const openProfileFromId = useCallback((profileId?: string | null) => {
        const safeProfileId = String(profileId || '').trim();
        const own = String(viewerProfileId || '').trim();
        if (!safeProfileId) return;
        if (own && own === safeProfileId) {
            navigation.navigate('BottomTabBar', { screen: 'Profile' });
            return;
        }
        navigation.navigate('ViewUserProfileScreen', { profileId: safeProfileId });
    }, [navigation, viewerProfileId]);

    const handleRemoveMember = async (member: GroupMember) => {
        if (!apiAccessToken || !group?.group_id) return;
        try {
            await removeGroupMember(apiAccessToken, String(group.group_id), String(member.profile_id));
            await refreshGroupData(String(group.group_id));
        } catch {
            // ignore for now
        }
    };

    const renderMember = (member: GroupMember) => {
        const isSelf = viewerProfileId && String(member.profile_id) === String(viewerProfileId);
        const avatarUrl = member.avatar_url ? toAbsoluteUrl(String(member.avatar_url)) : null;
        return (
            <View key={member.profile_id} style={localStyles.memberRow}>
                <TouchableOpacity
                    activeOpacity={0.85}
                    style={localStyles.memberInfo}
                    onPress={() => openProfileFromId(member.profile_id)}
                >
                    <>
                        {avatarUrl ? (
                            <FastImage source={{ uri: avatarUrl }} style={localStyles.avatar} />
                        ) : (
                            <View style={localStyles.avatar} />
                        )}
                        <View>
                            <View style={localStyles.ownerBadge}>
                                <Text style={localStyles.memberName}>{member.display_name || t('Member')}</Text>
                                {String(member.role || '').toLowerCase() === 'owner' && (
                                    <UserTick size={14} color={colors.primaryColor} variant="Linear" />
                                )}
                            </View>
                            <Text style={localStyles.memberRole}>{member.role || t('Member')}</Text>
                        </View>
                    </>
                </TouchableOpacity>
                {!isSelf && (
                    <TouchableOpacity
                        style={[
                            localStyles.followButton,
                            member.is_following && localStyles.followButtonAlt,
                        ]}
                        disabled={Boolean(followBusyByProfile[String(member.profile_id)])}
                        onPress={() => handleToggleFollow(member)}
                    >
                        {followBusyByProfile[String(member.profile_id)] ? (
                            <ActivityIndicator
                                size="small"
                                color={member.is_following ? colors.primaryColor : colors.whiteColor}
                            />
                        ) : (
                            <Text style={[localStyles.followText, member.is_following && localStyles.followTextAlt]}>
                                {member.is_following ? t('Following') : t('Follow')}
                            </Text>
                        )}
                    </TouchableOpacity>
                )}
                {isOwner && String(member.role || '').toLowerCase() !== 'owner' && (
                    <TouchableOpacity style={localStyles.deleteButton} onPress={() => handleRemoveMember(member)}>
                        <Trash size={18} color={colors.errorColor || '#E14B4B'} variant="Linear" />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{groupName}</Text>
                <View style={{ width: 44, height: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {!loading && !groupId && (
                    <View style={localStyles.emptyState}>
                        <Text style={localStyles.emptyText}>{t('No groups yet.')}</Text>
                        <SizeBox height={12} />
                        <TouchableOpacity onPress={() => navigation.navigate('CreateGroupProfileScreen')}>
                            <Text style={[localStyles.emptyText, { color: colors.primaryColor }]}>{t('Create a group')}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {!loading && groupId && !group && (
                    <View style={localStyles.emptyState}>
                        <Text style={localStyles.emptyText}>{t('Group not found.')}</Text>
                    </View>
                )}

                {group ? (
                <View style={styles.profileCard}>
                    <View style={styles.profileInfoContainer}>
                        {ownerAvatarUrl ? (
                            <FastImage source={{ uri: ownerAvatarUrl }} style={styles.profileAvatar} />
                        ) : (
                            <View style={styles.profileAvatar}>
                                <Profile2User size={40} color={colors.primaryColor} variant="Linear" />
                            </View>
                        )}
                        <View style={styles.profileNameRow}>
                            <Text style={styles.profileName}>{groupName}</Text>
                        </View>
                        <Text style={styles.profileUsername}>{groupOwnerName}</Text>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{memberCount}</Text>
                            <Text style={styles.statLabel}>{t('Members')}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{athletes.length}</Text>
                            <Text style={styles.statLabel}>{t('Athletes')}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{coaches.length}</Text>
                            <Text style={styles.statLabel}>{t('Coaches')}</Text>
                        </View>
                    </View>
                    <View style={localStyles.followersRow}>
                        <Text style={localStyles.followersText}>
                            {t('Followers')}: {followersCount}
                        </Text>
                    </View>

                    <View style={styles.bioSection}>
                        <View style={styles.bioHeader}>
                            <Text style={styles.bioTitle}>{t('About')}</Text>
                        </View>
                        <Text style={styles.bioText}>{groupDescription}</Text>
                        <View style={styles.bioDivider} />
                    </View>
                </View>
                ) : null}

                {group ? (
                <View style={styles.toggleTabBar}>
                    {(['athletes', 'coaches', 'events'] as const).map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.toggleTab, activeTab === tab && styles.toggleTabActive]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={activeTab === tab ? styles.toggleTabTextActive : styles.toggleTabText}>
                                {tab === 'athletes' ? t('Athletes') : tab === 'coaches' ? t('Coaches') : t('Events')}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                ) : null}

                {!loading && group && isOwner && activeTab !== 'events' && (
                    <View style={localStyles.addMembersSection}>
                        <Text style={localStyles.addMembersTitle}>
                            {addMemberRole === 'coach' ? t('Add Coaches') : t('Add Athletes')}
                        </Text>
                        <View style={localStyles.roleToggle}>
                            <TouchableOpacity
                                style={[localStyles.roleButton, addMemberRole === 'athlete' && localStyles.roleButtonActive]}
                                onPress={() => setAddMemberRole('athlete')}
                            >
                                <Text style={addMemberRole === 'athlete' ? localStyles.roleTextActive : localStyles.roleText}>
                                    {t('Athletes')}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[localStyles.roleButton, addMemberRole === 'coach' && localStyles.roleButtonActive]}
                                onPress={() => setAddMemberRole('coach')}
                            >
                                <Text style={addMemberRole === 'coach' ? localStyles.roleTextActive : localStyles.roleText}>
                                    {t('Coaches')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={localStyles.searchInputWrap}>
                            <SearchNormal1 size={18} color={colors.primaryColor} variant="Linear" />
                            <TextInput
                                style={localStyles.searchInput}
                                placeholder={t('Search users')}
                                placeholderTextColor={colors.subTextColor}
                                value={memberQuery}
                                onChangeText={setMemberQuery}
                                returnKeyType="search"
                            />
                        </View>
                        {memberSearchLoading ? (
                            <View style={localStyles.searchStateRow}>
                                <ActivityIndicator size="small" color={colors.primaryColor} />
                            </View>
                        ) : null}
                        {!memberSearchLoading && memberQuery.trim().length > 0 && filteredMemberSearchResults.length === 0 ? (
                            <View style={localStyles.searchStateRow}>
                                <Text style={localStyles.emptyText}>{t('No results')}</Text>
                            </View>
                        ) : null}
                        {!memberSearchLoading &&
                            filteredMemberSearchResults.map((profile) => {
                                const profileId = String(profile.profile_id);
                                const busy = Boolean(addBusyByProfile[profileId]);
                                return (
                                    <View key={profileId} style={localStyles.searchResultRow}>
                                        <View style={{ flex: 1, paddingRight: 12 }}>
                                            <Text style={localStyles.searchResultName}>
                                                {profile.display_name || t('Unnamed user')}
                                            </Text>
                                            <Text style={localStyles.searchResultMeta}>
                                                {addMemberRole === 'coach' ? t('Coach') : t('Athlete')}
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            style={localStyles.addButton}
                                            onPress={() => handleAddMember(profile)}
                                            disabled={busy}
                                        >
                                            {busy ? (
                                                <ActivityIndicator size="small" color={colors.whiteColor} />
                                            ) : (
                                                <>
                                                    <Add size={14} color={colors.whiteColor} variant="Linear" />
                                                    <Text style={localStyles.addButtonText}>{t('Add')}</Text>
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}
                    </View>
                )}

                {loading && (
                    <View style={localStyles.emptyState}>
                        <ActivityIndicator size="small" color={colors.primaryColor} />
                    </View>
                )}

                {!loading && group && activeTab === 'athletes' && (
                    <View>
                        {athletes.length === 0 ? (
                            <View style={localStyles.emptyState}>
                                <Text style={localStyles.emptyText}>{t('No athletes yet')}</Text>
                            </View>
                        ) : (
                            athletes.map(renderMember)
                        )}
                    </View>
                )}

                {!loading && group && activeTab === 'coaches' && (
                    <View>
                        {coaches.length === 0 ? (
                            <View style={localStyles.emptyState}>
                                <Text style={localStyles.emptyText}>{t('No coaches yet')}</Text>
                            </View>
                        ) : (
                            coaches.map(renderMember)
                        )}
                    </View>
                )}

                {!loading && group && activeTab === 'events' && (
                    <View>
                        {isOwner && (
                            <View style={localStyles.eventsAssignSection}>
                                <Text style={localStyles.addMembersTitle}>{t('Add Group to Event')}</Text>
                                <View style={localStyles.searchInputWrap}>
                                    <SearchNormal1 size={18} color={colors.primaryColor} variant="Linear" />
                                    <TextInput
                                        style={localStyles.searchInput}
                                        placeholder={t('Search events')}
                                        placeholderTextColor={colors.subTextColor}
                                        value={eventQuery}
                                        onChangeText={setEventQuery}
                                        returnKeyType="search"
                                    />
                                </View>
                                {eventSearchLoading ? (
                                    <View style={localStyles.searchStateRow}>
                                        <ActivityIndicator size="small" color={colors.primaryColor} />
                                    </View>
                                ) : null}
                                {!eventSearchLoading && eventSearchResults.slice(0, 6).map((event) => {
                                    const eventId = String(event.event_id || '');
                                    const isSelected = selectedEventId === eventId;
                                    const eventName = String(event.event_name || event.event_title || t('Competition'));
                                    const eventMeta = [event.event_location, event.event_date].filter(Boolean).join(' · ');
                                    return (
                                        <TouchableOpacity
                                            key={eventId}
                                            style={localStyles.eventOptionRow}
                                            onPress={() => {
                                                setSelectedEventId(eventId);
                                                setSelectedAthleteIds([]);
                                            }}
                                        >
                                            <View style={{ flex: 1, paddingRight: 10 }}>
                                                <Text style={localStyles.eventOptionTitle}>{eventName}</Text>
                                                {eventMeta ? <Text style={localStyles.eventOptionMeta}>{eventMeta}</Text> : null}
                                            </View>
                                            <View style={localStyles.eventSelectBadge}>
                                                <Text style={localStyles.eventSelectBadgeText}>
                                                    {isSelected ? t('Selected') : t('Select')}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}

                                {selectedEventLabel ? (
                                    <View style={localStyles.selectedEventRow}>
                                        <Text style={localStyles.selectedEventText}>
                                            {t('Selected event')}: {selectedEventLabel}
                                        </Text>
                                    </View>
                                ) : null}

                                {selectedEventId ? (
                                    <>
                                        <Text style={localStyles.athleteSelectTitle}>{t('Select athletes')}</Text>
                                        {athletes.length === 0 ? (
                                            <View style={localStyles.searchStateRow}>
                                                <Text style={localStyles.emptyText}>{t('No athletes yet')}</Text>
                                            </View>
                                        ) : (
                                            athletes.map((member) => {
                                                const profileId = String(member.profile_id || '');
                                                const checked = selectedAthleteIds.includes(profileId);
                                                return (
                                                    <TouchableOpacity
                                                        key={profileId}
                                                        style={localStyles.athleteSelectRow}
                                                        onPress={() => toggleAthleteSelection(profileId)}
                                                    >
                                                        <Text style={localStyles.athleteSelectName}>
                                                            {member.display_name || t('Member')}
                                                        </Text>
                                                        <View style={[localStyles.checkbox, checked && localStyles.checkboxChecked]}>
                                                            {checked ? <Text style={localStyles.checkboxText}>✓</Text> : null}
                                                        </View>
                                                    </TouchableOpacity>
                                                );
                                            })
                                        )}
                                    </>
                                ) : null}

                                <TouchableOpacity
                                    style={[
                                        localStyles.assignButton,
                                        (!selectedEventId || selectedAthleteIds.length === 0 || isAssigningAthletes) && localStyles.assignButtonDisabled,
                                    ]}
                                    disabled={!selectedEventId || selectedAthleteIds.length === 0 || isAssigningAthletes}
                                    onPress={handleAssignAthletes}
                                >
                                    {isAssigningAthletes ? (
                                        <ActivityIndicator size="small" color={colors.whiteColor} />
                                    ) : (
                                        <Text style={localStyles.assignButtonText}>{t('Add Athletes to Event')}</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={localStyles.eventsListSection}>
                            {groupEvents.length === 0 ? (
                                <View style={localStyles.emptyState}>
                                    <Location size={20} color={colors.subTextColor} variant="Linear" />
                                    <Text style={localStyles.emptyText}>{t('No events yet')}</Text>
                                </View>
                            ) : (
                                groupEvents.map((event) => {
                                    const eventName = String(event.event_name || t('Competition'));
                                    const eventMetaParts = [event.event_location, event.event_date].filter(Boolean);
                                    return (
                                        <View key={String(event.event_id)} style={localStyles.eventListCard}>
                                            <Text style={localStyles.eventListName}>{eventName}</Text>
                                            {eventMetaParts.length > 0 ? (
                                                <Text style={localStyles.eventListMeta}>{eventMetaParts.join(' · ')}</Text>
                                            ) : null}
                                            <Text style={localStyles.eventListMeta}>
                                                {t('Assigned athletes')}: {Number(event.assigned_athletes_count ?? 0)}
                                            </Text>
                                        </View>
                                    );
                                })
                            )}
                        </View>
                    </View>
                )}

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    );
};

export default GroupProfileScreen;
