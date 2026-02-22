import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, Linking, Alert, Modal } from 'react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { createStyles } from './GroupProfileStyles';
import { Location, Profile2User, User } from 'iconsax-react-nativejs';
import Icons from '../../constants/Icons';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
    deletePost,
    followProfile,
    getGroupCollectionByType,
    getGroup,
    getGroupAssignedEvents,
    getGroupMembers,
    getMediaById,
    getMyGroups,
    getPosts,
    getProfileSummary,
    unfollowProfile,
    type GroupAssignedEvent,
    type GroupCollection,
    type GroupCollectionItem,
    type GroupMember,
    type GroupSummary,
    type PostSummary,
} from '../../services/apiGateway';
import { getApiBaseUrl } from '../../constants/RuntimeConfig';

const GroupProfileScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);

    const [activeTab, setActiveTab] = useState<'news' | 'members' | 'competitions' | 'collections'>('news');
    const [groupId, setGroupId] = useState<string | null>(route?.params?.groupId ?? null);
    const [group, setGroup] = useState<GroupSummary | null>(null);
    const [members, setMembers] = useState<GroupMember[]>([]);
    const [groupNews, setGroupNews] = useState<PostSummary[]>([]);
    const [groupCompetitions, setGroupCompetitions] = useState<GroupAssignedEvent[]>([]);
    const [photoCollection, setPhotoCollection] = useState<{ collection: GroupCollection | null; items: GroupCollectionItem[] }>({ collection: null, items: [] });
    const [videoCollection, setVideoCollection] = useState<{ collection: GroupCollection | null; items: GroupCollectionItem[] }>({ collection: null, items: [] });
    const [collectionsLoading, setCollectionsLoading] = useState(false);
    const [viewerProfileId, setViewerProfileId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [followBusyByProfile, setFollowBusyByProfile] = useState<Record<string, boolean>>({});
    const [deletingPostById, setDeletingPostById] = useState<Record<string, boolean>>({});
    const [groupIconUrl, setGroupIconUrl] = useState<string | null>(null);
    const [storedFocuses, setStoredFocuses] = useState<string[]>([]);
    const [showProfileSwitcherModal, setShowProfileSwitcherModal] = useState(false);
    const [myGroups, setMyGroups] = useState<Array<{ id: string; name: string }>>([]);
    const [memberRoleTags, setMemberRoleTags] = useState<Record<string, Array<'athlete' | 'coach' | 'physio'>>>({});
    const showBackButton = Boolean(route?.params?.showBackButton) || String(route?.params?.origin || '').toLowerCase() === 'search';

    const { apiAccessToken, userProfile } = useAuth();

    useEffect(() => {
        const incomingGroupId = String(route?.params?.groupId ?? '').trim();
        if (!incomingGroupId) return;
        if (incomingGroupId !== String(groupId ?? '')) setGroupId(incomingGroupId);
    }, [groupId, route?.params?.groupId]);

    useEffect(() => {
        const incomingTab = String(route?.params?.tab ?? '').trim().toLowerCase();
        if (incomingTab === 'competitions') setActiveTab('competitions');
        if (incomingTab === 'athletes' || incomingTab === 'members') setActiveTab('members');
        if (incomingTab === 'collections') setActiveTab('collections');
    }, [route?.params?.tab]);

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

    const loadBaseGroupData = useCallback(async () => {
        if (!apiAccessToken) return;
        setLoading(true);
        try {
            let targetGroupId = groupId;
            if (!targetGroupId) {
                const mine = await getMyGroups(apiAccessToken);
                targetGroupId = mine.groups?.[0]?.group_id ?? null;
                setGroupId(targetGroupId);
            }
            if (!targetGroupId) {
                setGroup(null);
                setMembers([]);
                return;
            }
            const [groupResp, membersResp] = await Promise.all([
                getGroup(apiAccessToken, targetGroupId),
                getGroupMembers(apiAccessToken, targetGroupId),
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
        loadBaseGroupData();
    }, [loadBaseGroupData]);

    const toAbsoluteUrl = useCallback((value?: string | null) => {
        if (!value) return null;
        const raw = String(value);
        if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
        const base = getApiBaseUrl();
        if (!base) return raw;
        return `${base.replace(/\/$/, '')}/${raw.replace(/^\//, '')}`;
    }, []);

    const withAccessToken = useCallback((value?: string | null) => {
        if (!value) return null;
        if (!apiAccessToken) return value;
        if (String(value).includes('access_token=')) return value;
        const sep = String(value).includes('?') ? '&' : '?';
        return `${value}${sep}access_token=${encodeURIComponent(apiAccessToken)}`;
    }, [apiAccessToken]);

    useEffect(() => {
        let mounted = true;
        const iconMediaId = String(group?.avatar_media_id || '').trim();
        if (!apiAccessToken || !iconMediaId) {
            setGroupIconUrl(null);
            return () => {
                mounted = false;
            };
        }
        (async () => {
            try {
                const iconMedia = await getMediaById(apiAccessToken, iconMediaId);
                if (!mounted) return;
                const iconRaw = iconMedia?.thumbnail_url || iconMedia?.preview_url || iconMedia?.full_url || iconMedia?.raw_url || iconMedia?.original_url || null;
                const iconAbsolute = toAbsoluteUrl(iconRaw ? String(iconRaw) : null);
                const icon = withAccessToken(iconAbsolute || null);
                setGroupIconUrl(icon || null);
            } catch {
                if (mounted) {
                    setGroupIconUrl(null);
                }
            }
        })();
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, group, toAbsoluteUrl, withAccessToken]);

    const canManageGroup = useMemo(() => {
        const role = String(group?.my_role || '').toLowerCase();
        return role === 'owner' || role === 'admin';
    }, [group?.my_role]);
    const hasGroupRelationship = useMemo(() => String(group?.my_role || '').trim().length > 0, [group?.my_role]);
    const canOpenGroupSwitcher = hasGroupRelationship;

    const selectedEventsNormalized = useMemo(() => {
        const raw = userProfile?.selectedEvents;
        if (!Array.isArray(raw)) return [];
        return raw
            .map((entry: any) =>
                String(
                    typeof entry === 'string'
                        ? entry
                        : entry?.id ?? entry?.value ?? entry?.event_id ?? entry?.name ?? '',
                )
                    .trim()
                    .toLowerCase(),
            )
            .filter(Boolean);
    }, [userProfile?.selectedEvents]);

    const hasTrackFieldProfile = useMemo(
        () => selectedEventsNormalized.some((entry) => entry === 'track-field' || entry === 'track&field' || entry === 'track_field' || entry.includes('track')),
        [selectedEventsNormalized],
    );
    const hasRoadTrailProfile = useMemo(
        () => selectedEventsNormalized.some((entry) => entry === 'road-events' || entry === 'road&trail' || entry === 'road_trail' || entry.includes('road') || entry.includes('trail')),
        [selectedEventsNormalized],
    );

    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken || !canOpenGroupSwitcher) {
            setMyGroups([]);
            return () => {
                mounted = false;
            };
        }
        getMyGroups(apiAccessToken)
            .then((resp) => {
                if (!mounted) return;
                const groups = Array.isArray(resp?.groups)
                    ? resp.groups
                        .map((item) => ({
                            id: String(item?.group_id || '').trim(),
                            name: String(item?.name || '').trim(),
                        }))
                        .filter((item) => item.id.length > 0)
                    : [];
                setMyGroups(groups);
            })
            .catch(() => {
                if (mounted) setMyGroups([]);
            });
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, canOpenGroupSwitcher]);

    const groupName = group?.name || t('Group');
    const groupDescription = (group?.bio || group?.description || '').trim() || t('No description added yet.');
    const groupWebsite = String((group as any)?.website ?? '').trim();
    useEffect(() => {
        let mounted = true;
        const safeGroupId = String(group?.group_id || '').trim();
        if (!safeGroupId) {
            setStoredFocuses([]);
            return () => {
                mounted = false;
            };
        }
        (async () => {
            try {
                const raw = String((await AsyncStorage.getItem(`@group_focuses_${safeGroupId}`)) || '').trim();
                if (!raw) {
                    if (mounted) setStoredFocuses([]);
                    return;
                }
                const parsed = JSON.parse(raw);
                const normalized = (Array.isArray(parsed) ? parsed : [])
                    .map((entry: any) => String(entry || '').trim().toLowerCase())
                    .filter(Boolean);
                if (mounted) setStoredFocuses(normalized);
            } catch {
                if (mounted) setStoredFocuses([]);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [group?.group_id]);

    useEffect(() => {
        let mounted = true;
        const safeGroupId = String(group?.group_id || '').trim();
        if (!safeGroupId) {
            setMemberRoleTags({});
            return () => {
                mounted = false;
            };
        }
        (async () => {
            try {
                const raw = await AsyncStorage.getItem(`@group_member_role_tags_${safeGroupId}`);
                if (!mounted) return;
                const parsed = raw ? JSON.parse(raw) : {};
                const next = Object.entries(parsed || {}).reduce((acc, [profileId, roles]) => {
                    const normalized = Array.isArray(roles)
                        ? roles
                            .map((entry) => String(entry || '').toLowerCase())
                            .filter((entry): entry is 'athlete' | 'coach' | 'physio' => entry === 'athlete' || entry === 'coach' || entry === 'physio')
                        : [];
                    if (normalized.length > 0) acc[String(profileId)] = normalized;
                    return acc;
                }, {} as Record<string, Array<'athlete' | 'coach' | 'physio'>>);
                setMemberRoleTags(next);
            } catch {
                if (mounted) setMemberRoleTags({});
            }
        })();
        return () => {
            mounted = false;
        };
    }, [group?.group_id]);

    const groupFocuses = useMemo(() => {
        const raw = [
            ...(Array.isArray((group as any)?.focuses) ? ((group as any)?.focuses as string[]) : []),
            ...(Array.isArray((group as any)?.competition_focuses) ? ((group as any)?.competition_focuses as string[]) : []),
            ...(Array.isArray((group as any)?.selected_events) ? ((group as any)?.selected_events as string[]) : []),
            ...storedFocuses,
        ]
            .map((entry) => String(entry || '').trim().toLowerCase())
            .filter(Boolean);
        const mapped = Array.from(
            new Set(
                raw
                    .map((entry) => {
                        if (entry.includes('track')) return 'track-field';
                        if (entry.includes('road') || entry.includes('trail')) return 'road-events';
                        return '';
                    })
                    .filter(Boolean),
            ),
        );
        return mapped.length > 0 ? mapped : ['track-field'];
    }, [group, storedFocuses]);

    const membersWithDisplayRoles = useMemo(
        () =>
            members.map((member) => {
                const profileId = String(member.profile_id || '').trim();
                const localRoles = memberRoleTags[profileId] || [];
                const backendRole = String(member.role || '').toLowerCase();
                const fallbackRoles =
                    backendRole === 'athlete' || backendRole === 'coach' || backendRole === 'physio'
                        ? [backendRole]
                        : [];
                return {
                    ...member,
                    displayRoles: localRoles.length > 0 ? localRoles : fallbackRoles,
                };
            }),
        [memberRoleTags, members],
    );
    const coaches = useMemo(
        () => members.filter((m) => {
            const role = String(m.role || '').toLowerCase();
            return role === 'coach' || role === 'owner';
        }),
        [members],
    );
    const manualCoachNames = useMemo(() => {
        const source = Array.isArray(group?.coaches) ? (group?.coaches ?? []) : [];
        return source.map((entry) => String(entry || '').trim()).filter(Boolean);
    }, [group?.coaches]);

    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken || !group?.group_id || activeTab !== 'news') {
            setGroupNews([]);
            return () => {
                mounted = false;
            };
        }
        (async () => {
            try {
                const resp = await getPosts(apiAccessToken, { group_id: String(group.group_id), limit: 50 });
                if (!mounted) return;
                setGroupNews(Array.isArray(resp?.posts) ? resp.posts : []);
            } catch {
                if (mounted) setGroupNews([]);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [activeTab, apiAccessToken, group?.group_id]);

    const loadCompetitions = useCallback(async () => {
        if (!apiAccessToken || !group?.group_id) return;
        try {
            const resp = await getGroupAssignedEvents(apiAccessToken, String(group.group_id));
            setGroupCompetitions(Array.isArray(resp?.events) ? resp.events : []);
        } catch {
            setGroupCompetitions([]);
        }
    }, [apiAccessToken, group?.group_id]);

    const loadCollections = useCallback(async () => {
        if (!apiAccessToken || !group?.group_id) {
            setPhotoCollection({ collection: null, items: [] });
            setVideoCollection({ collection: null, items: [] });
            return;
        }
        setCollectionsLoading(true);
        try {
            const [photos, videos] = await Promise.all([
                getGroupCollectionByType(apiAccessToken, String(group.group_id), 'image'),
                getGroupCollectionByType(apiAccessToken, String(group.group_id), 'video'),
            ]);
            setPhotoCollection({
                collection: photos?.collection ?? null,
                items: Array.isArray(photos?.items) ? photos.items : [],
            });
            setVideoCollection({
                collection: videos?.collection ?? null,
                items: Array.isArray(videos?.items) ? videos.items : [],
            });
        } catch {
            setPhotoCollection({ collection: null, items: [] });
            setVideoCollection({ collection: null, items: [] });
        } finally {
            setCollectionsLoading(false);
        }
    }, [apiAccessToken, group?.group_id]);

    useEffect(() => {
        if (activeTab === 'competitions') loadCompetitions();
    }, [activeTab, loadCompetitions, route?.params?.refreshTs]);

    useEffect(() => {
        if (activeTab === 'collections') loadCollections();
    }, [activeTab, loadCollections, route?.params?.refreshTs]);

    const handleToggleFollow = async (member: GroupMember) => {
        if (!apiAccessToken || !member.profile_id || !viewerProfileId) return;
        if (String(member.profile_id) === String(viewerProfileId)) return;
        const targetProfileId = String(member.profile_id);
        if (followBusyByProfile[targetProfileId]) return;
        setFollowBusyByProfile((prev) => ({ ...prev, [targetProfileId]: true }));
        try {
            if (member.is_following) {
                await unfollowProfile(apiAccessToken, targetProfileId);
                setMembers((prev) => prev.map((m) => (String(m.profile_id) === targetProfileId ? { ...m, is_following: false } : m)));
            } else {
                await followProfile(apiAccessToken, targetProfileId);
                setMembers((prev) => prev.map((m) => (String(m.profile_id) === targetProfileId ? { ...m, is_following: true } : m)));
            }
        } catch {
            // ignore
        } finally {
            setFollowBusyByProfile((prev) => ({ ...prev, [targetProfileId]: false }));
        }
    };

    const handleDeleteNewsPost = useCallback(async (postId: string) => {
        const safePostId = String(postId || '').trim();
        if (!apiAccessToken || !safePostId || deletingPostById[safePostId]) return;
        setDeletingPostById((prev) => ({ ...prev, [safePostId]: true }));
        try {
            await deletePost(apiAccessToken, safePostId);
            setGroupNews((prev) => prev.filter((post) => String(post.id) !== safePostId));
        } catch {
            // ignore
        } finally {
            setDeletingPostById((prev) => ({ ...prev, [safePostId]: false }));
        }
    }, [apiAccessToken, deletingPostById]);
    const openGroupWebsite = useCallback(async () => {
        const raw = String(groupWebsite || '').trim();
        if (!raw) return;
        const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
        try {
            await Linking.openURL(normalized);
        } catch {
            Alert.alert(t('Error'), t('Could not open website.'));
        }
    }, [groupWebsite, t]);

    const localStyles = useMemo(
        () =>
            StyleSheet.create({
                emptyState: {
                    paddingVertical: 24,
                    alignItems: 'center',
                },
                emptyText: {
                    fontSize: 12,
                    color: colors.subTextColor,
                },
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
                eventListCard: {
                    borderWidth: 0.5,
                    borderColor: colors.lightGrayColor,
                    borderRadius: 10,
                    paddingHorizontal: 14,
                    paddingVertical: 13,
                    marginBottom: 12,
                    backgroundColor: colors.cardBackground,
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
                newsTopRow: {
                    marginTop: 18,
                    marginBottom: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                },
                newsAddButton: {
                    borderRadius: 20,
                    backgroundColor: colors.primaryColor,
                    paddingHorizontal: 16,
                    paddingVertical: 9,
                },
                newsAddButtonText: {
                    fontSize: 12,
                    color: colors.whiteColor,
                },
                postDeleteButton: {
                    marginTop: 10,
                    alignSelf: 'flex-start',
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.errorColor || '#E14B4B',
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                },
                postDeleteButtonText: {
                    fontSize: 11,
                    color: colors.errorColor || '#E14B4B',
                },
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
                actionButtonText: {
                    fontSize: 13,
                    color: colors.primaryColor,
                },
                collectionsHeaderRow: {
                    marginTop: 18,
                    marginBottom: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                },
                collectionsManageButton: {
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: colors.primaryColor,
                    backgroundColor: colors.secondaryBlueColor,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                },
                collectionsManageButtonText: {
                    fontSize: 11,
                    color: colors.primaryColor,
                },
                collectionsManageActions: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                },
                collectionsActionChip: {
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: colors.primaryColor,
                    backgroundColor: colors.secondaryBlueColor,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                },
                collectionsActionChipText: {
                    fontSize: 11,
                    color: colors.primaryColor,
                },
                collectionsCard: {
                    borderWidth: 0.5,
                    borderColor: colors.lightGrayColor,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                    backgroundColor: colors.cardBackground,
                },
                collectionsCardTitle: {
                    fontSize: 13,
                    color: colors.mainTextColor,
                },
                collectionsGrid: {
                    marginTop: 10,
                    flexDirection: 'row',
                    gap: 8,
                    justifyContent: 'space-between',
                },
                collectionImage: {
                    width: 76,
                    height: 108,
                    borderRadius: 6,
                    backgroundColor: colors.btnBackgroundColor,
                },
            }),
        [colors],
    );

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

                <View style={styles.header}>
                    {showBackButton || !hasGroupRelationship ? (
                        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                            <Icons.BackArrow width={20} height={20} />
                        </TouchableOpacity>
                    ) : (
                        <View style={{ width: 44, height: 44 }} />
                    )}
                    <Text style={styles.headerTitle}>{groupName}</Text>
                    {canOpenGroupSwitcher ? (
                        <TouchableOpacity style={styles.headerButton} onPress={() => setShowProfileSwitcherModal(true)}>
                            <User size={24} color={colors.primaryColor} variant="Linear" />
                        </TouchableOpacity>
                    ) : (
                        <View style={{ width: 44, height: 44 }} />
                    )}
                </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {group ? (
                    <View style={styles.profileCard}>
                        <View style={styles.profileCardHeaderRow}>
                            <Text style={styles.profileCardHeaderTitle}>{groupName}</Text>
                            {canManageGroup ? (
                                <TouchableOpacity
                                    style={styles.manageShortcutButton}
                                    onPress={() => navigation.navigate('GroupManageScreen', { groupId: group?.group_id })}
                                >
                                    <Text style={styles.manageShortcutText}>{t('Manage')}</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>
                        <View style={styles.profileInfoContainer}>
                            {groupIconUrl ? (
                                <FastImage source={{ uri: groupIconUrl }} style={styles.profileAvatar} />
                            ) : (
                                <View style={styles.profileAvatar}>
                                    <Profile2User size={40} color={colors.primaryColor} variant="Linear" />
                                </View>
                            )}
                        </View>

                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{group?.member_count ?? members.length}</Text>
                                <Text style={styles.statLabel}>{t('Members')}</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{Number(group?.likes_count ?? 0)}</Text>
                                <Text style={styles.statLabel}>{t('likes')}</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{Number(group?.followers_count ?? 0)}</Text>
                                <Text style={styles.statLabel}>{t('Followers')}</Text>
                            </View>
                        </View>

                        <View style={styles.bioSection}>
                            <Text style={styles.bioText}>{groupDescription}</Text>
                            <View style={styles.groupFocusSection}>
                                <View style={styles.groupFocusInlineBox}>
                                    {groupFocuses.map((focusId) => (
                                        <View key={`focus-chip-${focusId}`} style={styles.groupFocusChip}>
                                            {focusId === 'track-field' ? (
                                                <Icons.TrackFieldLogo width={16} height={16} />
                                            ) : (
                                                <Icons.PersonRunningColorful width={16} height={16} />
                                            )}
                                            <Text style={styles.groupFocusChipText}>
                                                {focusId === 'track-field' ? t('trackAndField') : t('roadAndTrail')}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                            {(coaches.length > 0 || manualCoachNames.length > 0) ? (
                                <Text style={[styles.bioText, { marginTop: 10 }]}> 
                                    {t('Coaches')}: {Array.from(new Set([
                                        ...manualCoachNames,
                                        ...coaches.map((c) => String(c.display_name || '').trim()).filter(Boolean),
                                    ])).join(', ')}
                                </Text>
                            ) : null}
                            {groupWebsite.length > 0 ? (
                                <TouchableOpacity style={styles.websiteContainer} activeOpacity={0.85} onPress={openGroupWebsite}>
                                    <Text style={[styles.websiteText, { color: colors.primaryColor, textDecorationLine: 'underline' }]} numberOfLines={1}>
                                        {groupWebsite}
                                    </Text>
                                </TouchableOpacity>
                            ) : null}
                            <View style={styles.bioDivider} />
                        </View>
                    </View>
                ) : null}

                {group ? (
                    <View style={styles.toggleTabBar}>
                        {(['news', 'members', 'competitions', 'collections'] as const).map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                style={[styles.toggleTab, activeTab === tab && styles.toggleTabActive]}
                                onPress={() => setActiveTab(tab)}
                            >
                                <Text style={activeTab === tab ? styles.toggleTabTextActive : styles.toggleTabText}>
                                    {tab === 'news'
                                        ? t('News')
                                        : tab === 'members'
                                            ? t('Members')
                                            : tab === 'competitions'
                                                ? t('Competitions')
                                                : t('Collections')}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : null}

                {loading ? (
                    <View style={localStyles.emptyState}>
                        <ActivityIndicator size="small" color={colors.primaryColor} />
                    </View>
                ) : null}

                {!loading && group && activeTab === 'members' ? (
                    <View>
                        {membersWithDisplayRoles.length === 0 ? (
                            <View style={localStyles.emptyState}>
                                <Text style={localStyles.emptyText}>{t('No members yet')}</Text>
                            </View>
                        ) : (
                            membersWithDisplayRoles.map((member) => {
                                const avatarUrl = member.avatar_url ? toAbsoluteUrl(String(member.avatar_url)) : null;
                                const isSelf = viewerProfileId && String(member.profile_id) === String(viewerProfileId);
                                return (
                                    <View key={String(member.profile_id)} style={localStyles.memberRow}>
                                        <TouchableOpacity
                                            activeOpacity={0.85}
                                            style={localStyles.memberInfo}
                                            onPress={() => {
                                                const safeProfileId = String(member.profile_id || '').trim();
                                                if (!safeProfileId) return;
                                                if (viewerProfileId && safeProfileId === String(viewerProfileId)) {
                                                    navigation.navigate('UserProfileScreen');
                                                    return;
                                                }
                                                navigation.navigate('ViewUserProfileScreen', { profileId: safeProfileId });
                                            }}
                                        >
                                            {avatarUrl ? <FastImage source={{ uri: avatarUrl }} style={localStyles.avatar} /> : <View style={localStyles.avatar} />}
                                            <View>
                                                <Text style={localStyles.memberName}>{member.display_name || t('Member')}</Text>
                                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                                                    {member.displayRoles.length > 0 ? (
                                                        member.displayRoles.map((role) => (
                                                            <View
                                                                key={`${member.profile_id}-tag-${role}`}
                                                                style={{
                                                                    borderWidth: 1,
                                                                    borderColor: colors.primaryColor,
                                                                    backgroundColor: colors.secondaryBlueColor,
                                                                    borderRadius: 999,
                                                                    paddingHorizontal: 8,
                                                                    paddingVertical: 3,
                                                                }}
                                                            >
                                                                <Text style={{ color: colors.primaryColor, fontSize: 11 }}>
                                                                    {role === 'coach' ? t('Coach') : role === 'physio' ? t('Physio') : t('Athlete')}
                                                                </Text>
                                                            </View>
                                                        ))
                                                    ) : (
                                                        <Text style={localStyles.memberRole}>
                                                            {String(member.role || '').toLowerCase() === 'admin' ? t('Admin') : t('Member')}
                                                        </Text>
                                                    )}
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                        {!isSelf ? (
                                            <TouchableOpacity
                                                style={[localStyles.followButton, member.is_following && localStyles.followButtonAlt]}
                                                disabled={Boolean(followBusyByProfile[String(member.profile_id)])}
                                                onPress={() => handleToggleFollow(member)}
                                            >
                                                {followBusyByProfile[String(member.profile_id)] ? (
                                                    <ActivityIndicator size="small" color={member.is_following ? colors.primaryColor : colors.whiteColor} />
                                                ) : (
                                                    <Text style={[localStyles.followText, member.is_following && localStyles.followTextAlt]}>
                                                        {member.is_following ? t('Following') : t('Follow')}
                                                    </Text>
                                                )}
                                            </TouchableOpacity>
                                        ) : null}
                                    </View>
                                );
                            })
                        )}
                    </View>
                ) : null}

                {!loading && group && activeTab === 'news' ? (
                    <View>
                        <View style={localStyles.newsTopRow}>
                            <Text style={styles.bioTitle}>{t('News')}</Text>
                            {canManageGroup ? (
                                <TouchableOpacity
                                    style={localStyles.newsAddButton}
                                    onPress={() => navigation.navigate('ProfileBlogEditorScreen', { mode: 'add', groupId: String(group.group_id) })}
                                >
                                    <Text style={localStyles.newsAddButtonText}>{t('Add blog')}</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>
                        {groupNews.length === 0 ? (
                            <View style={localStyles.emptyState}>
                                <Text style={localStyles.emptyText}>{t('No news yet.')}</Text>
                            </View>
                        ) : (
                            groupNews.map((post) => (
                                <View key={String(post.id)} style={localStyles.eventListCard}>
                                    <TouchableOpacity
                                        activeOpacity={0.85}
                                        onPress={() => navigation.navigate('ViewUserBlogDetailsScreen', { postId: String(post.id), postPreview: post })}
                                    >
                                        <Text style={localStyles.eventListName}>{String(post.title || t('Blog'))}</Text>
                                        {post.created_at ? <Text style={localStyles.eventListMeta}>{String(post.created_at).slice(0, 10)}</Text> : null}
                                        {post.summary ? (
                                            <Text style={localStyles.eventListMeta} numberOfLines={2}>
                                                {String(post.summary)}
                                            </Text>
                                        ) : null}
                                    </TouchableOpacity>
                                    {canManageGroup ? (
                                        <TouchableOpacity
                                            style={localStyles.postDeleteButton}
                                            onPress={() => handleDeleteNewsPost(String(post.id))}
                                            disabled={Boolean(deletingPostById[String(post.id)])}
                                        >
                                            {deletingPostById[String(post.id)] ? (
                                                <ActivityIndicator size="small" color={colors.errorColor || '#E14B4B'} />
                                            ) : (
                                                <Text style={localStyles.postDeleteButtonText}>{t('Delete')}</Text>
                                            )}
                                        </TouchableOpacity>
                                    ) : null}
                                </View>
                            ))
                        )}
                    </View>
                ) : null}

                {!loading && group && activeTab === 'competitions' ? (
                    <View>
                        {canManageGroup ? (
                            <TouchableOpacity
                                style={localStyles.actionButton}
                                onPress={() => navigation.navigate('GroupCompetitionSelectScreen', { groupId: String(group.group_id) })}
                            >
                                <Text style={localStyles.actionButtonText}>{t('Add athlete to competition')}</Text>
                            </TouchableOpacity>
                        ) : null}

                        <View style={{ marginTop: 12 }}>
                            {groupCompetitions.length === 0 ? (
                                <View style={localStyles.emptyState}>
                                    <Location size={20} color={colors.subTextColor} variant="Linear" />
                                    <Text style={localStyles.emptyText}>{t('No competitions yet')}</Text>
                                </View>
                            ) : (
                                groupCompetitions.map((event) => {
                                    const eventName = String(event.event_name || t('Competition'));
                                    const eventMetaParts = [event.event_location, event.event_date].filter(Boolean);
                                    return (
                                        <TouchableOpacity
                                            key={String(event.event_id)}
                                            style={localStyles.eventListCard}
                                            onPress={() => {
                                                navigation.navigate('CompetitionDetailsScreen', {
                                                    id: String(event.event_id),
                                                    event_id: String(event.event_id),
                                                    name: eventName,
                                                    location: event.event_location,
                                                    date: event.event_date,
                                                });
                                            }}
                                        >
                                            <Text style={localStyles.eventListName}>{eventName}</Text>
                                            {eventMetaParts.length > 0 ? (
                                                <Text style={localStyles.eventListMeta}>{eventMetaParts.join(' · ')}</Text>
                                            ) : null}
                                            <Text style={localStyles.eventListMeta}>
                                                {t('Assigned athletes')}: {Number(event.assigned_athletes_count ?? 0)}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })
                            )}
                        </View>
                    </View>
                ) : null}

                {!loading && group && activeTab === 'collections' ? (
                    <View>
                        <View style={localStyles.collectionsHeaderRow}>
                            <Text style={styles.bioTitle}>{t('Photo collections')}</Text>
                            {canManageGroup ? (
                                <TouchableOpacity
                                    style={localStyles.collectionsManageButton}
                                    onPress={() =>
                                        navigation.navigate('GroupCollectionsManageScreen', {
                                            groupId: String(group.group_id),
                                            type: 'image',
                                        })
                                    }
                                >
                                    <Text style={localStyles.collectionsManageButtonText}>{t('Manage')}</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>
                        {collectionsLoading ? (
                            <View style={localStyles.emptyState}>
                                <ActivityIndicator size="small" color={colors.primaryColor} />
                            </View>
                        ) : (
                            <View style={localStyles.collectionsCard}>
                                <Text style={localStyles.collectionsCardTitle}>{photoCollection.collection?.name || t('Photo collections')}</Text>
                                {photoCollection.items.length === 0 ? (
                                    <View style={localStyles.emptyState}>
                                        <Text style={localStyles.emptyText}>{t('No collections yet.')}</Text>
                                    </View>
                                ) : (
                                    <View style={localStyles.collectionsGrid}>
                                        {photoCollection.items.slice(0, 4).map((item) => {
                                            const thumb = toAbsoluteUrl(String(item.thumbnail_url || item.preview_url || item.full_url || item.raw_url || item.original_url || ''));
                                            const thumbUrl = withAccessToken(thumb || undefined) || thumb;
                                            return (
                                                <TouchableOpacity
                                                    key={String(item.media_id)}
                                                    activeOpacity={0.85}
                                                    onPress={() =>
                                                        navigation.navigate('PhotoDetailScreen', {
                                                            eventTitle: photoCollection.collection?.name || t('Collection'),
                                                            media: { id: item.media_id, type: 'photo' },
                                                        })
                                                    }
                                                >
                                                    {thumbUrl ? (
                                                        <FastImage source={{ uri: String(thumbUrl) }} style={localStyles.collectionImage} />
                                                    ) : (
                                                        <View style={localStyles.collectionImage} />
                                                    )}
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                )}
                            </View>
                        )}

                        <View style={localStyles.collectionsHeaderRow}>
                            <Text style={styles.bioTitle}>{t('Video collections')}</Text>
                            {canManageGroup ? (
                                <TouchableOpacity
                                    style={localStyles.collectionsManageButton}
                                    onPress={() =>
                                        navigation.navigate('GroupCollectionsManageScreen', {
                                            groupId: String(group.group_id),
                                            type: 'video',
                                        })
                                    }
                                >
                                    <Text style={localStyles.collectionsManageButtonText}>{t('Manage')}</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>
                        {collectionsLoading ? (
                            <View style={localStyles.emptyState}>
                                <ActivityIndicator size="small" color={colors.primaryColor} />
                            </View>
                        ) : (
                            <View style={localStyles.collectionsCard}>
                                <Text style={localStyles.collectionsCardTitle}>{videoCollection.collection?.name || t('Video collections')}</Text>
                                {videoCollection.items.length === 0 ? (
                                    <View style={localStyles.emptyState}>
                                        <Text style={localStyles.emptyText}>{t('No collections yet.')}</Text>
                                    </View>
                                ) : (
                                    <View style={localStyles.collectionsGrid}>
                                        {videoCollection.items.slice(0, 4).map((item) => {
                                            const thumb = toAbsoluteUrl(String(item.thumbnail_url || item.preview_url || item.full_url || item.raw_url || item.original_url || ''));
                                            const thumbUrl = withAccessToken(thumb || undefined) || thumb;
                                            return (
                                                <TouchableOpacity
                                                    key={String(item.media_id)}
                                                    activeOpacity={0.85}
                                                    onPress={() =>
                                                        navigation.navigate('PhotoDetailScreen', {
                                                            eventTitle: videoCollection.collection?.name || t('Collection'),
                                                            media: { id: item.media_id, type: 'video' },
                                                        })
                                                    }
                                                >
                                                    {thumbUrl ? (
                                                        <FastImage source={{ uri: String(thumbUrl) }} style={localStyles.collectionImage} />
                                                    ) : (
                                                        <View style={localStyles.collectionImage} />
                                                    )}
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                ) : null}

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>

            <Modal
                visible={showProfileSwitcherModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowProfileSwitcherModal(false)}
            >
                <TouchableOpacity
                    style={styles.profileSwitcherBackdrop}
                    activeOpacity={1}
                    onPress={() => setShowProfileSwitcherModal(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => {}}
                        style={styles.profileSwitcherSheet}
                    >
                        <View style={styles.profileSwitcherHandle} />
                        <Text style={styles.profileSwitcherTitle}>{t('Switch profile')}</Text>
                        <SizeBox height={8} />

                        {hasTrackFieldProfile ? (
                            <TouchableOpacity
                                style={styles.profileSwitcherRow}
                                onPress={() => {
                                    setShowProfileSwitcherModal(false);
                                    navigation.navigate('BottomTabBar', {
                                        screen: 'Profile',
                                        params: {
                                            screen: 'UserProfileScreen',
                                            params: { forceProfileCategory: 'Track&Field' },
                                        },
                                    });
                                }}
                            >
                                <View style={styles.profileSwitcherAvatar}>
                                    <Icons.TrackFieldLogo width={20} height={20} />
                                </View>
                                <Text style={styles.profileSwitcherLabel}>{t('trackAndField')}</Text>
                                <Text style={styles.profileSwitcherCheck} />
                            </TouchableOpacity>
                        ) : null}

                        {hasRoadTrailProfile ? (
                            <TouchableOpacity
                                style={styles.profileSwitcherRow}
                                onPress={() => {
                                    setShowProfileSwitcherModal(false);
                                    navigation.navigate('BottomTabBar', {
                                        screen: 'Profile',
                                        params: {
                                            screen: 'UserProfileScreen',
                                            params: { forceProfileCategory: 'Road&Trail' },
                                        },
                                    });
                                }}
                            >
                                <View style={styles.profileSwitcherAvatar}>
                                    <Icons.PersonRunningColorful width={20} height={20} />
                                </View>
                                <Text style={styles.profileSwitcherLabel}>{t('roadAndTrail')}</Text>
                                <Text style={styles.profileSwitcherCheck} />
                            </TouchableOpacity>
                        ) : null}

                        {myGroups.map((item) => (
                            <TouchableOpacity
                                key={`switch-group-${item.id}`}
                                style={[
                                    styles.profileSwitcherRow,
                                    String(groupId || '') === item.id ? styles.profileSwitcherRowActive : null,
                                ]}
                                onPress={() => {
                                    setShowProfileSwitcherModal(false);
                                    if (String(groupId || '') !== item.id) {
                                        setGroupId(item.id);
                                        setActiveTab('news');
                                    }
                                }}
                            >
                                <View style={styles.profileSwitcherAvatar}>
                                    <Icons.GroupColorful width={18} height={18} />
                                </View>
                                <Text style={styles.profileSwitcherLabel}>{item.name || t('Group')}</Text>
                                <Text style={styles.profileSwitcherCheck}>{String(groupId || '') === item.id ? '✓' : ''}</Text>
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            style={[styles.profileSwitcherRow, styles.profileSwitcherAddRow]}
                            onPress={() => {
                                setShowProfileSwitcherModal(false);
                                navigation.navigate('CategorySelectionScreen', { fromAddFlow: true });
                            }}
                        >
                            <View style={styles.profileSwitcherAvatarAdd}>
                                <Text style={styles.profileSwitcherPlus}>+</Text>
                            </View>
                            <Text style={styles.profileSwitcherAddLabel}>{t('Add')}</Text>
                            <Text style={styles.profileSwitcherCheck} />
                        </TouchableOpacity>

                        <SizeBox height={Math.max(insets.bottom, 8)} />
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

export default GroupProfileScreen;
