import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { createStyles } from './GroupProfileStyles';
import { ArrowLeft2, Location, Profile2User, Trash, UserTick } from 'iconsax-react-nativejs';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
    followProfile,
    getGroup,
    getGroupMembers,
    getMyGroups,
    getProfileSummary,
    removeGroupMember,
    unfollowProfile,
    type GroupMember,
    type GroupSummary,
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

    const { apiAccessToken } = useAuth();

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
            }),
        [colors],
    );

    const handleToggleFollow = async (member: GroupMember) => {
        if (!apiAccessToken || !member.profile_id || !viewerProfileId) return;
        if (String(member.profile_id) === String(viewerProfileId)) return;
        try {
            if (member.is_following) {
                await unfollowProfile(apiAccessToken, String(member.profile_id));
                setMembers((prev) =>
                    prev.map((m) => (m.profile_id === member.profile_id ? { ...m, is_following: false } : m)),
                );
            } else {
                await followProfile(apiAccessToken, String(member.profile_id));
                setMembers((prev) =>
                    prev.map((m) => (m.profile_id === member.profile_id ? { ...m, is_following: true } : m)),
                );
            }
        } catch {
            // ignore for now
        }
    };

    const handleRemoveMember = async (member: GroupMember) => {
        if (!apiAccessToken || !group?.group_id) return;
        try {
            await removeGroupMember(apiAccessToken, String(group.group_id), String(member.profile_id));
            setMembers((prev) => prev.filter((m) => m.profile_id !== member.profile_id));
        } catch {
            // ignore for now
        }
    };

    const renderMember = (member: GroupMember) => {
        const isSelf = viewerProfileId && String(member.profile_id) === String(viewerProfileId);
        const avatarUrl = member.avatar_url ? toAbsoluteUrl(String(member.avatar_url)) : null;
        return (
            <View key={member.profile_id} style={localStyles.memberRow}>
                <View style={localStyles.memberInfo}>
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
                </View>
                {!isSelf && (
                    <TouchableOpacity
                        style={[
                            localStyles.followButton,
                            member.is_following && localStyles.followButtonAlt,
                        ]}
                        onPress={() => handleToggleFollow(member)}
                    >
                        <Text style={[localStyles.followText, member.is_following && localStyles.followTextAlt]}>
                            {member.is_following ? t('Following') : t('Follow')}
                        </Text>
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
                    <View style={localStyles.emptyState}>
                        <Location size={20} color={colors.subTextColor} variant="Linear" />
                        <Text style={localStyles.emptyText}>{t('No events yet')}</Text>
                    </View>
                )}

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    );
};

export default GroupProfileScreen;
