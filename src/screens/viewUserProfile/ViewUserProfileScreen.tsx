import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, Dimensions, Linking, Alert } from 'react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Images from '../../constants/Images';
import { useTheme } from '../../context/ThemeContext';
import { createStyles } from '../userProfile/UserProfileStyles';
import { ArrowLeft2, Clock, DocumentText, Gallery } from 'iconsax-react-nativejs';
import ProfileTimeline, { TimelineEntry } from '../../components/profileTimeline/ProfileTimeline';
import { useAuth } from '../../context/AuthContext';
import {
    followProfile,
    getPosts,
    getProfileCollections,
    getProfileSummary,
    getProfileSummaryById,
    getProfileTimeline,
    unfollowProfile,
    type PostSummary,
    type ProfileGroupMembership,
    type ProfileCollection,
    type ProfileSummary,
    type ProfileTimelineEntry,
} from '../../services/apiGateway';
import { getApiBaseUrl } from '../../constants/RuntimeConfig';
import { useTranslation } from 'react-i18next';
import ProfileNewsSection, { type ProfileNewsItem } from '../../components/profileNews/ProfileNewsSection';
import SportFocusIcon from '../../components/profile/SportFocusIcon';
import SupportProfileSummary, { getSupportProfileBadgeLabel } from '../../components/profile/SupportProfileSummary';
import {
    focusUsesChestNumbers,
    getDisciplineLabel,
    getMainDisciplineForFocus,
    getProfileCollectionScopeKey,
    getSportFocusLabel,
    normalizeMainDisciplines,
    normalizeProfileModeId,
    normalizeSelectedEvents,
    type SportFocusId,
} from '../../utils/profileSelections';

type PostSummaryWithCover = PostSummary & { coverImage?: string | null };
type ProfileMembershipItem = {
    group_id: string;
    name: string;
    location: string;
    role: string | null;
    is_official_club: boolean;
    official_club_code: string | null;
};

const ViewUserProfileScreen = ({ navigation, route }: any) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { apiAccessToken } = useAuth();

    const [profileTab, setProfileTab] = useState<'timeline' | 'activity' | 'collections'>('timeline');
    const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
    const [timelineItems, setTimelineItems] = useState<TimelineEntry[]>([]);
    const [collections, setCollections] = useState<ProfileCollection[]>([]);
    const [posts, setPosts] = useState<PostSummaryWithCover[]>([]);
    const [summary, setSummary] = useState<ProfileSummary | null>(null);
    const [viewerProfileId, setViewerProfileId] = useState<string | null>(null);
    const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);
    const { width } = Dimensions.get('window');
    const imageWidth = Math.floor((width - 40 - 24 - 30) / 4);

    const profileId = useMemo(() => {
        const fromParams = route?.params?.profileId ?? route?.params?.profile_id;
        const user = route?.params?.user;
        const resolved =
            fromParams ||
            user?.profile_id ||
            user?.profileId ||
            user?.id ||
            user?.user_id ||
            null;
        return resolved ? String(resolved) : null;
    }, [route?.params?.profileId, route?.params?.profile_id, route?.params?.user]);
    const isInitialLoading = summary === null;

    const isSignedUrl = useCallback((value?: string | null) => {
        if (!value) return false;
        const lower = String(value).toLowerCase();
        return (
            lower.includes('x-amz-signature') ||
            lower.includes('x-amz-credential') ||
            lower.includes('x-amz-security-token') ||
            lower.includes('signature=') ||
            lower.includes('sig=') ||
            lower.includes('token=') ||
            lower.includes('expires=') ||
            lower.includes('sv=') ||
            lower.includes('se=') ||
            lower.includes('sp=')
        );
    }, []);

    const toAbsoluteUrl = useCallback((value?: string | null) => {
        if (!value) return null;
        const raw = String(value);
        if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
        const base = getApiBaseUrl();
        if (!base) return raw;
        return `${base.replace(/\/$/, '')}/${raw.replace(/^\//, '')}`;
    }, []);

    const withAccessToken = useCallback((value?: string | null) => {
        if (!value) return undefined;
        if (!apiAccessToken) return value;
        if (isSignedUrl(value)) return value;
        if (value.includes('access_token=')) return value;
        const sep = value.includes('?') ? '&' : '?';
        return `${value}${sep}access_token=${encodeURIComponent(apiAccessToken)}`;
    }, [apiAccessToken, isSignedUrl]);

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
        const load = async () => {
            if (!apiAccessToken || !profileId) {
                if (mounted) {
                    setTimelineItems([]);
                    setCollections([]);
                    setPosts([]);
                    setSummary(null);
                }
                return;
            }
            const [summaryResult, timelineResult, postsResult] = await Promise.allSettled([
                getProfileSummaryById(apiAccessToken, String(profileId)),
                getProfileTimeline(apiAccessToken, String(profileId)),
                getPosts(apiAccessToken, {
                    author_profile_id: String(profileId),
                    limit: 50,
                    include_original: false,
                }),
            ]);

            const loadedSummary: ProfileSummary | null =
                summaryResult.status === 'fulfilled' ? summaryResult.value : null;
            if (mounted) {
                setSummary(loadedSummary);
            }

            if (timelineResult.status === 'fulfilled') {
                const items = Array.isArray((timelineResult.value as any)?.items) ? (timelineResult.value as any).items : [];
                const mapped: TimelineEntry[] = items.map((it: ProfileTimelineEntry) => ({
                    id: String(it.id),
                    year: String((it as any)?.year ?? ''),
                    title: String((it as any)?.title ?? ''),
                    description: (it as any)?.description ?? '',
                    highlight: (it as any)?.highlight ?? '',
                    photos: [],
                    linkedBlogs: [],
                    linkedCompetitions: [],
                    coverImage: (it as any)?.cover_thumbnail_url ?? null,
                }));
                if (mounted) setTimelineItems(mapped);
            } else if (mounted) {
                setTimelineItems([]);
            }

            if (postsResult.status === 'fulfilled') {
                const rawPosts = Array.isArray((postsResult.value as any)?.posts) ? (postsResult.value as any).posts : [];
                const sortedPosts = [...rawPosts].sort((a: PostSummary, b: PostSummary) => {
                    const aTime = Date.parse(String(a?.created_at ?? ''));
                    const bTime = Date.parse(String(b?.created_at ?? ''));
                    const timeDiff = (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
                    if (timeDiff !== 0) return timeDiff;
                    const titleDiff = String(b?.title ?? '').localeCompare(String(a?.title ?? ''), undefined, {
                        numeric: true,
                        sensitivity: 'base',
                    });
                    if (titleDiff !== 0) return titleDiff;
                    return String(b?.id ?? '').localeCompare(String(a?.id ?? ''));
                });
                const mapped = sortedPosts.map((entry: PostSummary) => {
                    const cover = (entry as any)?.cover_media || null;
                    const coverCandidate = cover?.thumbnail_url || cover?.preview_url || cover?.full_url || cover?.raw_url || null;
                    const resolved = coverCandidate ? toAbsoluteUrl(String(coverCandidate)) : null;
                    const coverImage = resolved ? (withAccessToken(resolved) || resolved) : null;
                    return {
                        ...entry,
                        coverImage,
                        mediaId: String(cover?.media_id ?? '').trim() || null,
                        mediaType: cover?.type === 'video' ? 'video' : (cover?.media_id ? 'image' : null),
                    };
                });
                if (mounted) setPosts(mapped);
            } else if (mounted) {
                setPosts([]);
            }

            try {
                const summaryProfile = (loadedSummary?.profile as any) ?? {};
                const selectedEvents = normalizeSelectedEvents(summaryProfile?.selected_events ?? []);
                const supportFocuses = normalizeSelectedEvents(summaryProfile?.support_focuses ?? []);
                const supportExists =
                    String(summaryProfile?.support_role ?? '').trim().length > 0 ||
                    supportFocuses.length > 0 ||
                    (Array.isArray(summaryProfile?.support_club_codes) && summaryProfile.support_club_codes.length > 0) ||
                    (Array.isArray(summaryProfile?.support_group_ids) && summaryProfile.support_group_ids.length > 0) ||
                    (Array.isArray(summaryProfile?.support_athlete_profile_ids) && summaryProfile.support_athlete_profile_ids.length > 0);
                const scopeFocus = selectedEvents[0] ?? (supportExists ? 'support' : null);
                const c = await getProfileCollections(apiAccessToken, String(profileId), {
                    limit: 50,
                    scope_key: scopeFocus ? getProfileCollectionScopeKey(scopeFocus) : 'default',
                });
                if (mounted) setCollections(Array.isArray((c as any)?.collections) ? (c as any).collections : []);
            } catch {
                if (mounted) setCollections([]);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, profileId, toAbsoluteUrl, withAccessToken]);

    const targetProfileId = useMemo(() => {
        const value = String(summary?.profile_id ?? profileId ?? '').trim();
        return value.length > 0 ? value : null;
    }, [profileId, summary?.profile_id]);

    const isOwnProfile = useMemo(() => {
        const viewerId = String(viewerProfileId || '').trim();
        const targetId = String(targetProfileId || '').trim();
        return viewerId.length > 0 && targetId.length > 0 && viewerId === targetId;
    }, [targetProfileId, viewerProfileId]);

    const followAllowed = useMemo(() => {
        if (!summary?.profile_id || !targetProfileId) return false;
        return !isOwnProfile;
    }, [isOwnProfile, summary?.profile_id, targetProfileId]);

    const handleToggleFollow = async () => {
        if (!apiAccessToken || !targetProfileId || !summary || isUpdatingFollow) return;
        setIsUpdatingFollow(true);
        try {
            if (summary?.is_following) {
                await unfollowProfile(apiAccessToken, targetProfileId);
                setSummary((prev) => (prev ? { ...prev, is_following: false, followers_count: Math.max(0, (prev.followers_count ?? 0) - 1) } : prev));
            } else {
                await followProfile(apiAccessToken, targetProfileId);
                setSummary((prev) => (prev ? { ...prev, is_following: true, followers_count: (prev.followers_count ?? 0) + 1 } : prev));
            }
        } finally {
            setIsUpdatingFollow(false);
        }
    };

    const profileImageUrl = useMemo(() => {
        const avatarMedia = summary?.profile?.avatar_media ?? null;
        const avatarCandidate =
            avatarMedia?.thumbnail_url ||
            avatarMedia?.preview_url ||
            avatarMedia?.full_url ||
            avatarMedia?.raw_url ||
            avatarMedia?.original_url ||
            summary?.profile?.avatar_url ||
            null;
        if (!avatarCandidate) return null;
        const resolved = toAbsoluteUrl(String(avatarCandidate));
        return withAccessToken(resolved) || resolved;
    }, [summary?.profile, toAbsoluteUrl, withAccessToken]);

    const displayName = summary?.profile?.display_name || t('Profile');
    const displayHandle = useMemo(() => {
        const raw = String(summary?.profile?.username ?? '').trim().replace(/^@+/, '');
        if (!raw) return '';
        return raw.replace(/\s+/g, '');
    }, [summary?.profile?.username]);
    const bioText = useMemo(() => {
        const raw = String(summary?.profile?.bio ?? '').trim();
        if (!raw) return t('No bio added yet.');
        const normalizedRaw = raw.replace(/^@+/, '').trim().toLowerCase();
        const normalizedHandle = displayHandle.trim().toLowerCase();
        if (normalizedHandle.length > 0 && normalizedRaw === normalizedHandle) {
            return t('No bio added yet.');
        }
        return raw;
    }, [displayHandle, summary?.profile?.bio, t]);

    const selectedFocuses = useMemo(
        () => normalizeSelectedEvents(summary?.profile?.selected_events ?? []),
        [summary?.profile?.selected_events],
    );
    const hasSupportProfile = useMemo(() => {
        return (
            String((summary?.profile as any)?.support_role ?? '').trim().length > 0 ||
            (Array.isArray((summary?.profile as any)?.support_club_codes) && (summary?.profile as any)?.support_club_codes.length > 0) ||
            (Array.isArray((summary?.profile as any)?.support_group_ids) && (summary?.profile as any)?.support_group_ids.length > 0) ||
            (Array.isArray((summary?.profile as any)?.support_athlete_profile_ids) && (summary?.profile as any)?.support_athlete_profile_ids.length > 0) ||
            (Array.isArray((summary?.profile as any)?.support_focuses) && (summary?.profile as any)?.support_focuses.length > 0)
        );
    }, [summary?.profile]);
    const activeFocus = useMemo<SportFocusId | 'support' | null>(() => {
        const forced = normalizeProfileModeId(route?.params?.forceProfileCategory);
        if (forced === 'support' && hasSupportProfile) return 'support';
        if (forced && forced !== 'support' && selectedFocuses.includes(forced)) return forced;
        if (selectedFocuses.length > 0) return selectedFocuses[0];
        if (hasSupportProfile) return 'support';
        return null;
    }, [hasSupportProfile, route?.params?.forceProfileCategory, selectedFocuses]);
    const profileCategoryLabel = activeFocus ? (activeFocus === 'support' ? t('Support') : getSportFocusLabel(activeFocus, t)) : '';
    const currentYear = useMemo(() => String(new Date().getFullYear()), []);
    const currentChestNumber = useMemo(() => {
        const raw = (summary?.profile as any)?.chest_numbers_by_year;
        if (!raw || typeof raw !== 'object') return '';
        const byYear = raw as Record<string, unknown>;
        const thisYear = String(byYear[currentYear] ?? '').trim();
        if (thisYear) return thisYear;
        const latestYear = Object.keys(byYear)
            .filter((year) => /^\d{4}$/.test(String(year)))
            .sort((a, b) => Number(b) - Number(a))
            .find((year) => String(byYear[year] ?? '').trim().length > 0);
        if (!latestYear) return '';
        return String(byYear[latestYear] ?? '').trim();
    }, [currentYear, summary?.profile]);
    const normalizeMembership = useCallback((entry: Partial<ProfileGroupMembership> | null | undefined): ProfileMembershipItem | null => {
        if (!entry || typeof entry !== 'object') return null;
        const groupId = String((entry as any)?.group_id ?? '').trim();
        const name = String((entry as any)?.name ?? '').trim();
        if (!groupId || !name) return null;
        const location = String((entry as any)?.location ?? '').trim();
        const roleRaw = String((entry as any)?.role ?? '').trim();
        const officialClubCode = String((entry as any)?.official_club_code ?? '').trim();
        const isOfficialClub = Boolean((entry as any)?.is_official_club) || officialClubCode.length > 0;
        return {
            group_id: groupId,
            name,
            location,
            role: roleRaw.length > 0 ? roleRaw : null,
            is_official_club: isOfficialClub,
            official_club_code: officialClubCode.length > 0 ? officialClubCode : null,
        };
    }, []);
    const profileMemberships = useMemo(() => {
        const groups = Array.isArray((summary?.profile as any)?.groups)
            ? ((summary?.profile as any)?.groups as Array<Partial<ProfileGroupMembership>>)
            : [];
        return groups
            .map((entry) => normalizeMembership(entry))
            .filter((entry): entry is ProfileMembershipItem => Boolean(entry))
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    }, [normalizeMembership, summary?.profile]);
    const communityMemberships = useMemo(
        () => profileMemberships.filter((entry) => !entry.is_official_club),
        [profileMemberships],
    );
    const officialMemberships = useMemo(
        () => profileMemberships.filter((entry) => entry.is_official_club),
        [profileMemberships],
    );
    const trackFieldMainEvent = useMemo(
        () => String((summary?.profile as any)?.track_field_main_event ?? '').trim(),
        [summary?.profile],
    );
    const roadTrailMainEvent = useMemo(
        () => String((summary?.profile as any)?.road_trail_main_event ?? '').trim(),
        [summary?.profile],
    );
    const nationality = useMemo(
        () => String((summary?.profile as any)?.nationality ?? '').trim(),
        [summary?.profile],
    );
    const website = useMemo(
        () => String((summary?.profile as any)?.website ?? '').trim(),
        [summary?.profile],
    );
    const supportRole = useMemo(
        () => String((summary?.profile as any)?.support_role ?? '').trim(),
        [summary?.profile],
    );
    const supportProfileBadgeLabel = useMemo(
        () => getSupportProfileBadgeLabel(supportRole, t),
        [supportRole, t],
    );
    const supportFocuses = useMemo(
        () => normalizeSelectedEvents((summary?.profile as any)?.support_focuses ?? []),
        [summary?.profile],
    );
    const supportClubs = useMemo(() => {
        const hydrated = Array.isArray((summary?.profile as any)?.support_clubs)
            ? (summary?.profile as any)?.support_clubs
            : [];
        return hydrated
            .map((club: any) => {
                const code = String(club?.code ?? '').trim().toUpperCase();
                const name = String(club?.name ?? '').trim();
                if (!code || !name) return null;
                return {
                    id: code,
                    title: name,
                    subtitle: [String(club?.city ?? '').trim(), String(club?.federation ?? '').trim()].filter(Boolean).join(' · '),
                };
            })
            .filter(Boolean) as Array<{id: string; title: string; subtitle: string}>;
    }, [summary?.profile]);
    const supportGroups = useMemo(() => {
        const hydrated = Array.isArray((summary?.profile as any)?.support_groups)
            ? (summary?.profile as any)?.support_groups
            : [];
        return hydrated
            .map((group: any) => {
                const id = String(group?.group_id ?? '').trim();
                const name = String(group?.name ?? '').trim();
                if (!id || !name) return null;
                return {
                    id,
                    title: name,
                    subtitle: [String(group?.role ?? '').trim(), String(group?.location ?? '').trim()].filter(Boolean).join(' · '),
                };
            })
            .filter(Boolean) as Array<{id: string; title: string; subtitle: string}>;
    }, [summary?.profile]);
    const directTrackFieldClub = useMemo(() => {
        const hydrated = (summary?.profile as any)?.track_field_club_detail ?? null;
        const hydratedName = String(hydrated?.name ?? '').trim();
        const raw = String((summary?.profile as any)?.track_field_club ?? '').trim();
        const title = hydratedName || raw;
        if (!title) return null;
        return {
            id: String(hydrated?.code ?? raw).trim() || title,
            title,
            subtitle: [String(hydrated?.city ?? '').trim(), String(hydrated?.federation ?? '').trim()].filter(Boolean).join(' · '),
        };
    }, [summary?.profile]);
    const runningClubGroup = useMemo(() => {
        const hydrated = (summary?.profile as any)?.running_club_group ?? null;
        const groupId = String(hydrated?.group_id ?? '').trim();
        const name = String(hydrated?.name ?? '').trim();
        if (!groupId || !name) return null;
        return {
            id: groupId,
            title: name,
            subtitle: [String(hydrated?.role ?? '').trim(), String(hydrated?.location ?? '').trim()].filter(Boolean).join(' · '),
        };
    }, [summary?.profile]);
    const mainDisciplines = useMemo(
        () => normalizeMainDisciplines((summary?.profile as any)?.main_disciplines ?? {}, {
            trackFieldMainEvent,
            roadTrailMainEvent,
        }),
        [roadTrailMainEvent, summary?.profile, trackFieldMainEvent],
    );
    const profileDistance = useMemo(() => {
        if (!activeFocus || activeFocus === 'support') return '';
        const disciplineKey = getMainDisciplineForFocus(mainDisciplines, activeFocus, {
            trackFieldMainEvent,
            roadTrailMainEvent,
        });
        if (!disciplineKey) return '';
        return getDisciplineLabel(activeFocus, disciplineKey, t);
    }, [activeFocus, mainDisciplines, roadTrailMainEvent, t, trackFieldMainEvent]);
    const athleteActiveFocus = useMemo<SportFocusId | null>(
        () => (activeFocus && activeFocus !== 'support' ? activeFocus : null),
        [activeFocus],
    );
    const formatMetaDisplayValue = useCallback((value: string) => {
        const trimmed = String(value || '').trim();
        if (trimmed.length <= 11) return trimmed;
        return `${trimmed.slice(0, 11)}...`;
    }, []);

    const visibleOfficialClubs = useMemo(() => {
        if (activeFocus === 'support') return supportClubs;
        const merged = new Map<string, {id: string; title: string; subtitle: string}>();
        const makeClubKey = (title: string, subtitle: string) =>
            `${String(title || '').trim().toLowerCase()}|${String(subtitle || '').trim().toLowerCase()}`;
        officialMemberships.forEach((entry) => {
            const subtitle = [entry.role ?? '', entry.location].filter(Boolean).join(' · ');
            merged.set(makeClubKey(entry.name, subtitle), {
                id: entry.group_id,
                title: entry.name,
                subtitle,
            });
        });
        if (directTrackFieldClub) {
            const key = makeClubKey(directTrackFieldClub.title, directTrackFieldClub.subtitle);
            if (!merged.has(key)) {
                merged.set(key, directTrackFieldClub);
            }
        }
        return Array.from(merged.values());
    }, [activeFocus, directTrackFieldClub, officialMemberships, supportClubs]);
    const visibleGroups = useMemo(() => {
        if (activeFocus === 'support') return supportGroups;
        const merged = new Map<string, {id: string; title: string; subtitle: string}>();
        communityMemberships.forEach((entry) => {
            merged.set(entry.group_id, {
                id: entry.group_id,
                title: entry.name,
                subtitle: [entry.role ?? '', entry.location].filter(Boolean).join(' · '),
            });
        });
        if (runningClubGroup) merged.set(runningClubGroup.id, runningClubGroup);
        return Array.from(merged.values());
    }, [activeFocus, communityMemberships, runningClubGroup, supportGroups]);
    const singleOfficialClub = visibleOfficialClubs.length === 1 ? visibleOfficialClubs[0] : null;
    const singleCommunityGroup = visibleGroups.length === 1 ? visibleGroups[0] : null;
    const profileMetaItems = useMemo(() => {
        const baseItems = activeFocus === 'support'
            ? []
            : [
                { key: 'nationality', value: nationality },
                { key: 'chest', value: athleteActiveFocus && focusUsesChestNumbers(athleteActiveFocus) ? currentChestNumber : '' },
                { key: 'distance', value: profileDistance },
            ];

        return [
            ...baseItems,
            { key: 'singleClub', value: singleOfficialClub?.title ?? '' },
            { key: 'singleGroup', value: singleCommunityGroup?.title ?? '' },
        ]
            .map((entry) => ({
                ...entry,
                value: formatMetaDisplayValue(String(entry.value || '').trim()),
            }))
            .filter((entry) => entry.value.length > 0);
    }, [
        activeFocus,
        athleteActiveFocus,
        currentChestNumber,
        formatMetaDisplayValue,
        nationality,
        profileDistance,
        singleCommunityGroup?.title,
        singleOfficialClub?.title,
    ]);
    const openProfileWebsite = useCallback(async () => {
        const raw = String(website || '').trim();
        if (!raw) return;
        const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
        try {
            await Linking.openURL(normalized);
        } catch {
            Alert.alert(t('Error'), t('Could not open website.'));
        }
    }, [t, website]);

    const photoCollections = useMemo(
        () => collections.filter((c) => String(c.collection_type || '').toLowerCase() === 'image'),
        [collections],
    );
    const videoCollections = useMemo(
        () => collections.filter((c) => String(c.collection_type || '').toLowerCase() === 'video'),
        [collections],
    );

    const visibleCollections = useMemo(() => {
        const list = activeTab === 'photos' ? photoCollections : videoCollections;
        return list.slice(0, 4);
    }, [activeTab, photoCollections, videoCollections]);

    const activityItems = useMemo<ProfileNewsItem[]>(() => {
        return posts.map((entry) => ({
            id: String(entry.id),
            kind: String((entry as any)?.post_type ?? '').trim().toLowerCase() === 'photo'
                ? 'photo'
                : String((entry as any)?.post_type ?? '').trim().toLowerCase() === 'video'
                    ? 'video'
                    : 'blog',
            mediaId: (entry as any)?.mediaId ? String((entry as any).mediaId) : null,
            mediaType: (entry as any)?.mediaType === 'video' ? 'video' : (entry as any)?.mediaType === 'image' ? 'image' : null,
            title: String(entry.title || ''),
            date: entry.created_at ? String(entry.created_at).slice(0, 10) : '',
            description: String(entry.summary || entry.description || ''),
            coverImage: entry.coverImage ? String(entry.coverImage) : null,
        }));
    }, [posts]);

    const hasTimeline = timelineItems.length > 0;
    const hasCollections = collections.length > 0;
    const availableTabs = useMemo(() => {
        const tabs: Array<'timeline' | 'activity' | 'collections'> = ['activity'];
        if (hasTimeline) tabs.unshift('timeline');
        if (hasCollections) tabs.push('collections');
        return tabs;
    }, [hasCollections, hasTimeline]);

    useEffect(() => {
        if (!availableTabs.includes(profileTab)) {
            setProfileTab(availableTabs[0] || 'activity');
        }
    }, [availableTabs, profileTab]);

    const localStyles = useMemo(
        () =>
            StyleSheet.create({
                profileLeftColumn: {
                    width: 132,
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    flexShrink: 0,
                },
                profileIdentityUnderAvatar: {
                    marginTop: 10,
                    width: '100%',
                    alignItems: 'center',
                    gap: 4,
                },
                profileRightColumn: {
                    flex: 1,
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    minWidth: 0,
                },
                profileCategoryCompact: {
                    alignItems: 'center',
                    gap: 4,
                    minWidth: 70,
                },
                profileCategoryCompactText: {
                    fontSize: 12,
                    color: colors.primaryColor,
                },
                followButton: {
                    marginTop: 16,
                    paddingVertical: 12,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: colors.primaryColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: summary?.is_following ? colors.btnBackgroundColor : colors.primaryColor,
                },
                followButtonText: {
                    fontSize: 14,
                    color: summary?.is_following ? colors.primaryColor : colors.whiteColor,
                },
            }),
        [colors, summary?.is_following],
    );

    if (isInitialLoading) {
        return (
            <View style={Styles.mainContainer}>
                <SizeBox height={insets.top} />
                <View style={Styles.header}>
                    <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                        <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                    </TouchableOpacity>
                    <Text style={Styles.headerTitle}>{t('Profile')}</Text>
                    <View style={{ width: 44, height: 44 }} />
                </View>
                <View style={Styles.emptyProfileContainer}>
                    <ActivityIndicator size="large" color={colors.primaryColor} />
                    <SizeBox height={16} />
                    <Text style={Styles.emptyProfileTitle}>{t('Loading...')}</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={Styles.mainContainer} testID="view-user-profile-screen">
            {!isInitialLoading ? (
                <View testID="e2e-perf-ready-view-user-profile" style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }} />
            ) : null}
            <SizeBox height={insets.top} />

            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{t('Profile')}</Text>
                <View style={{ width: 44, height: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                <View style={Styles.profileCard}>
                    <View style={Styles.profileTopRow}>
                        <View style={localStyles.profileLeftColumn}>
                            <View style={Styles.profileImageContainer}>
                                <View style={Styles.profileImageInner}>
                                    {profileImageUrl ? (
                                        <FastImage source={{ uri: profileImageUrl }} style={Styles.profileImage} resizeMode="cover" />
                                    ) : (
                                        <FastImage source={Images.profilePic} style={Styles.profileImage} resizeMode="cover" />
                                    )}
                                </View>
                            </View>
                            <View style={localStyles.profileIdentityUnderAvatar}>
                                <Text style={[Styles.userName, { textAlign: 'center' }]} numberOfLines={2}>
                                    {displayName}
                                </Text>
                                {displayHandle.length > 0 ? (
                                    <Text style={[Styles.userHandleInline, { textAlign: 'center' }]} numberOfLines={1}>
                                        @{displayHandle}
                                    </Text>
                                ) : null}
                            </View>
                        </View>
                        <View style={localStyles.profileRightColumn}>
                            <View style={Styles.statsContainerRight}>
                                <View style={Styles.statItem}>
                                    <Text style={Styles.statValue}>{summary?.followers_count ?? 0}</Text>
                                    <Text style={Styles.statLabel}>{t('Followers')}</Text>
                                </View>
                                <View style={Styles.statDivider} />
                                {profileCategoryLabel.length > 0 ? (
                                <View style={localStyles.profileCategoryCompact}>
                                        <SportFocusIcon focusId={activeFocus} size={20} color={colors.primaryColor} />
                                        <Text style={localStyles.profileCategoryCompactText}>{activeFocus === 'support' ? supportProfileBadgeLabel : profileCategoryLabel}</Text>
                                    </View>
                                ) : null}
                            </View>
                        </View>
                    </View>

                    {followAllowed && (
                        <TouchableOpacity style={localStyles.followButton} onPress={handleToggleFollow} disabled={isUpdatingFollow}>
                            {isUpdatingFollow ? (
                                <ActivityIndicator size="small" color={summary?.is_following ? colors.primaryColor : colors.whiteColor} />
                            ) : (
                                <Text style={localStyles.followButtonText}>
                                    {summary?.is_following ? t('Following') : t('Follow')}
                                </Text>
                            )}
                        </TouchableOpacity>
                    )}

                    <View style={Styles.bioSection}>
                        <View style={Styles.bioHeader}>
                            <Text style={Styles.bioTitle}>{t('Bio')}</Text>
                        </View>
                        <Text style={Styles.bioText}>{bioText}</Text>
                        <View style={Styles.bioDivider} />
                    </View>
                    {activeFocus === 'support' ? (
                        <View style={Styles.athleteMetaSection}>
                            <SupportProfileSummary role={supportRole} focuses={supportFocuses} t={t} />
                        </View>
                    ) : null}
                    {profileMetaItems.length > 0 && (
                        <View style={Styles.athleteMetaSection}>
                            <View style={Styles.athleteMetaInlineBox}>
                                {profileMetaItems.map((entry) => (
                                    <View key={entry.key} style={Styles.athleteMetaPill}>
                                        <Text style={Styles.athleteMetaPillText}>
                                            {entry.value}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                    {website.length > 0 ? (
                        <View style={Styles.athleteMetaSection}>
                            <TouchableOpacity activeOpacity={0.8} onPress={openProfileWebsite}>
                                <Text style={[Styles.athleteMetaInlineValue, { color: colors.primaryColor, textDecorationLine: 'underline' }]}>
                                    {website}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}
                    {visibleOfficialClubs.length > 1 ? (
                        <View style={Styles.membershipSection}>
                            <Text style={Styles.membershipTitle}>{t('Official clubs')}</Text>
                            <View style={Styles.membershipWrap}>
                                {visibleOfficialClubs.map((club) => (
                                    <View
                                        key={club.id}
                                        style={Styles.membershipChip}
                                    >
                                        <Text style={Styles.membershipChipTitle} numberOfLines={1}>
                                            {club.title}
                                        </Text>
                                        {club.subtitle.length > 0 ? (
                                            <Text style={Styles.membershipChipMeta} numberOfLines={1}>
                                                {club.subtitle}
                                            </Text>
                                        ) : null}
                                    </View>
                                ))}
                            </View>
                        </View>
                    ) : null}
                    {visibleGroups.length > 1 ? (
                        <View style={Styles.membershipSection}>
                            <Text style={Styles.membershipTitle}>{t(activeFocus === 'support' ? 'Groups' : 'Community groups')}</Text>
                            <View style={Styles.membershipWrap}>
                                {visibleGroups.map((group) => (
                                    <TouchableOpacity
                                        key={group.id}
                                        style={Styles.membershipChip}
                                        activeOpacity={0.85}
                                        onPress={() => navigation.navigate('GroupProfileScreen', { groupId: group.id, showBackButton: true })}
                                    >
                                        <Text style={Styles.membershipChipTitle} numberOfLines={1}>
                                            {group.title}
                                        </Text>
                                        {group.subtitle.length > 0 ? (
                                            <Text style={Styles.membershipChipMeta} numberOfLines={1}>
                                                {group.subtitle}
                                            </Text>
                                        ) : null}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    ) : null}
                </View>

                <View style={Styles.profileTabs}>
                    {hasTimeline && (
                        <TouchableOpacity
                            style={[Styles.profileTab, profileTab === 'timeline' && Styles.profileTabActive]}
                            onPress={() => setProfileTab('timeline')}
                        >
                            <Clock size={18} color={profileTab === 'timeline' ? colors.primaryColor : colors.grayColor} variant="Linear" />
                            <Text style={[Styles.profileTabText, profileTab === 'timeline' && Styles.profileTabTextActive]}>{t('Timeline')}</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[Styles.profileTab, profileTab === 'activity' && Styles.profileTabActive]}
                        onPress={() => setProfileTab('activity')}
                    >
                        <DocumentText size={18} color={profileTab === 'activity' ? colors.primaryColor : colors.grayColor} variant="Linear" />
                        <Text style={[Styles.profileTabText, profileTab === 'activity' && Styles.profileTabTextActive]}>{t('News')}</Text>
                    </TouchableOpacity>
                    {hasCollections && (
                        <TouchableOpacity
                            style={[Styles.profileTab, profileTab === 'collections' && Styles.profileTabActive]}
                            onPress={() => setProfileTab('collections')}
                        >
                            <Gallery size={18} color={profileTab === 'collections' ? colors.primaryColor : colors.grayColor} variant="Linear" />
                            <Text style={[Styles.profileTabText, profileTab === 'collections' && Styles.profileTabTextActive]}>{t('Collections')}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {profileTab === 'timeline' && (
                    <ProfileTimeline
                        title={t('Timeline')}
                        items={timelineItems}
                        onPressItem={(item) => navigation.navigate('ProfileTimelineDetailScreen', { item, ownerName: displayName })}
                    />
                )}

                {profileTab === 'activity' && (
                    <ProfileNewsSection
                        styles={Styles}
                        sectionTitle={t('News')}
                        items={activityItems}
                        emptyText={t('No news yet.')}
                        blogLabel={t('Blog')}
                        photoLabel={t('Photo')}
                        videoLabel={t('Video')}
                        onPressItem={(item) => {
                            if (item.kind === 'photo' && item.mediaId) {
                                navigation.navigate('PhotoDetailScreen', {
                                    eventTitle: item.title,
                                    media: { id: item.mediaId, type: 'image' },
                                });
                                return;
                            }
                            if (item.kind === 'video' && item.mediaId) {
                                navigation.navigate('VideoPlayingScreen', {
                                    video: {
                                        media_id: item.mediaId,
                                        title: item.title,
                                        thumbnail: item.coverImage ? { uri: String(item.coverImage) } : undefined,
                                        uri: '',
                                    },
                                });
                                return;
                            }
                            navigation.navigate('ViewUserBlogDetailsScreen', {
                                postId: item.id,
                                postPreview: {
                                    title: item.title,
                                    date: item.date,
                                    description: item.description,
                                    coverImage: item.coverImage,
                                },
                            });
                        }}
                    />
                )}

                {profileTab === 'collections' && (
                    <View style={Styles.collectionsSection}>
                        <View style={Styles.sectionHeader}>
                            <Text style={Styles.sectionTitle}>{t('Collections')}</Text>
                        </View>

                        <View style={Styles.toggleContainer}>
                            <TouchableOpacity
                                style={[Styles.toggleButton, activeTab === 'photos' && Styles.toggleButtonActive]}
                                onPress={() => setActiveTab('photos')}
                            >
                                <Text style={activeTab === 'photos' ? Styles.toggleTextActive : Styles.toggleText}>{t('Photos')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[Styles.toggleButton, activeTab === 'videos' && Styles.toggleButtonActive]}
                                onPress={() => setActiveTab('videos')}
                            >
                                <Text style={activeTab === 'videos' ? Styles.toggleTextActive : Styles.toggleText}>{t('Videos')}</Text>
                            </TouchableOpacity>
                        </View>

                        {activeTab === 'photos' ? (
                            <View style={Styles.collectionsGrid}>
                                {visibleCollections.map((c, idx) => {
                                    const thumb = c.cover_thumbnail_url ? toAbsoluteUrl(String(c.cover_thumbnail_url)) : null;
                                    const thumbUrl = thumb ? (withAccessToken(thumb) || thumb) : null;
                                    return (
                                        <TouchableOpacity
                                            key={String(c.id || idx)}
                                            onPress={() => {
                                                if (c.cover_media_id) {
                                                    navigation.navigate('PhotoDetailScreen', {
                                                        eventTitle: c.name || t('Collection'),
                                                        media: { id: c.cover_media_id, type: 'photo' },
                                                    });
                                                }
                                            }}
                                        >
                                            {thumbUrl ? (
                                                <FastImage
                                                    source={{ uri: String(thumbUrl) }}
                                                    style={[Styles.collectionImage, { width: imageWidth }]}
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <View style={[Styles.collectionImage, { width: imageWidth, backgroundColor: colors.btnBackgroundColor }]} />
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        ) : (
                            <View style={Styles.videosGrid}>
                                {visibleCollections.map((c, idx) => {
                                    const thumb = c.cover_thumbnail_url ? toAbsoluteUrl(String(c.cover_thumbnail_url)) : null;
                                    const thumbUrl = thumb ? (withAccessToken(thumb) || thumb) : null;
                                    return (
                                        <TouchableOpacity
                                            key={String(c.id || idx)}
                                            style={Styles.videoCard}
                                            onPress={() => {
                                                if (c.cover_media_id) {
                                                    navigation.navigate('PhotoDetailScreen', {
                                                        eventTitle: c.name || t('Collection'),
                                                        media: { id: c.cover_media_id, type: 'video' },
                                                    });
                                                }
                                            }}
                                        >
                                            <View style={Styles.videoThumbnailContainer}>
                                                {thumbUrl ? (
                                                    <FastImage source={{ uri: String(thumbUrl) }} style={Styles.videoThumbnail} resizeMode="cover" />
                                                ) : (
                                                    <View style={[Styles.videoThumbnail, { backgroundColor: colors.btnBackgroundColor }]} />
                                                )}
                                            </View>
                                            <Text style={Styles.videoCardTitle}>{c.name}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}
                    </View>
                )}

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    );
};

export default ViewUserProfileScreen;
