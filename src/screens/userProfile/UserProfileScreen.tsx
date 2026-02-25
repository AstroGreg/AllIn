import { View, Text, TouchableOpacity, ScrollView, Dimensions, Modal, ActivityIndicator, Alert, Linking, TextInput } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import SizeBox from '../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FastImage from 'react-native-fast-image'
import Images from '../../constants/Images'
import Icons from '../../constants/Icons'
import { useTheme } from '../../context/ThemeContext'
import { createStyles } from './UserProfileStyles'
import { User, Edit2, Clock, ArrowRight, DocumentText, Gallery, DocumentDownload } from 'iconsax-react-nativejs'
import { launchImageLibrary } from 'react-native-image-picker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ProfileTimeline, { TimelineEntry } from '../../components/profileTimeline/ProfileTimeline'
import { useAuth } from '../../context/AuthContext'
import {
    deletePost,
    getDownloadsSummary,
    getHubAppearanceMedia,
    getHubAppearances,
    getMyGroups,
    getPosts,
    getProfileCollectionByType,
    getProfileSummary,
    getProfileTimeline,
    getSubscribedEvents,
    getUploadedCompetitions,
    updateProfileSummary,
    uploadMediaBatch,
    type HubAppearanceSummary,
    type GroupSummary,
    type PostSummary,
    type ProfileCollectionItem,
    type ProfileSummaryResponse,
    type ProfileTimelineEntry,
    type SubscribedEvent,
    type UploadedCompetition,
} from '../../services/apiGateway'
import { getApiBaseUrl } from '../../constants/RuntimeConfig'
import { useFocusEffect } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import ProfileNewsSection, { type ProfileNewsItem } from '../../components/profileNews/ProfileNewsSection'

const UserProfileScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const Styles = createStyles(colors);
    const { user, userProfile, apiAccessToken, updateUserProfile } = useAuth();
    const [activeTab, setActiveTab] = useState('photos');
    const [timelineItems, setTimelineItems] = useState<TimelineEntry[]>([]);
    const [profileTab, setProfileTab] = useState<'timeline' | 'activity' | 'collections' | 'downloads'>('timeline');
    const [blogEntries, setBlogEntries] = useState<any[]>([]);
    const [subscribedEvents, setSubscribedEvents] = useState<SubscribedEvent[]>([]);
    const [appearanceEvents, setAppearanceEvents] = useState<HubAppearanceSummary[]>([]);
    const [profileCategory, setProfileCategory] = useState<'Track&Field' | 'Road&Trail' | null>(null);
    const [showProfileSwitcherModal, setShowProfileSwitcherModal] = useState(false);
    const [pendingDeleteBlog, setPendingDeleteBlog] = useState<ProfileNewsItem | null>(null);
    const [isDeletingBlog, setIsDeletingBlog] = useState(false);
    const [profileImage, setProfileImage] = useState<any>(Images.profile1);
    const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
    const [downloadsSummary, setDownloadsSummary] = useState<{ total_downloads: number; total_views: number; total_profit_cents?: number } | null>(
        null,
    );
    const [profileSummary, setProfileSummary] = useState<ProfileSummaryResponse | null>(null);
    const currentYear = useMemo(() => String(new Date().getFullYear()), []);
    const [chestNumbersByYear, setChestNumbersByYear] = useState<Record<string, string>>({});
    const [photoCollectionItems, setPhotoCollectionItems] = useState<ProfileCollectionItem[]>([]);
    const [videoCollectionItems, setVideoCollectionItems] = useState<ProfileCollectionItem[]>([]);
    const [uploadedCompetitions, setUploadedCompetitions] = useState<UploadedCompetition[]>([]);
    const [myGroups, setMyGroups] = useState<GroupSummary[]>([]);
    const [didLoadProfileData, setDidLoadProfileData] = useState(false);
    const [websiteEditVisible, setWebsiteEditVisible] = useState(false);
    const [websiteDraft, setWebsiteDraft] = useState('');
    const [websiteSaveBusy, setWebsiteSaveBusy] = useState(false);

    const { width } = Dimensions.get('window');
    const showBackButton = Boolean(route?.params?.showBackButton) || String(route?.params?.origin || '').toLowerCase() === 'search';
    const imageWidth = Math.floor((width - 40 - 24 - 30) / 4);
    const profileCategoryLabel = profileCategory === 'Road&Trail'
        ? t('roadAndTrail')
        : profileCategory === 'Track&Field'
            ? t('trackAndField')
            : '';
    const selectedEventProfiles = useMemo(() => {
        const events = userProfile?.selectedEvents;
        return Array.isArray(events) ? events : [];
    }, [userProfile?.selectedEvents]);
    const selectedEventProfilesNormalized = useMemo(
        () =>
            selectedEventProfiles
                .map((entry: any) => String(
                    typeof entry === 'string'
                        ? entry
                        : entry?.id ?? entry?.value ?? entry?.event_id ?? entry?.name ?? '',
                ).trim().toLowerCase())
                .filter(Boolean),
        [selectedEventProfiles],
    );
    const hasTrackFieldProfile = selectedEventProfilesNormalized.some((entry) =>
        entry === 'track-field' || entry === 'track&field' || entry === 'track_field' || entry.includes('track'),
    );
    const hasRoadTrailProfile = selectedEventProfilesNormalized.some((entry) =>
        entry === 'road-events' || entry === 'road&trail' || entry === 'road_trail' || entry.includes('road') || entry.includes('trail'),
    );
    const hasServerProfile = Boolean(profileSummary?.profile_id) || Boolean(profileSummary?.profile);
    const hasAnyLinkedProfiles = hasTrackFieldProfile || hasRoadTrailProfile || myGroups.length > 0 || hasServerProfile;

    const normalizeChestByYear = useCallback((raw: any): Record<string, string> => {
        if (!raw || typeof raw !== 'object') return {};
        const out: Record<string, string> = {};
        for (const [year, chest] of Object.entries(raw)) {
            const safeYear = String(year || '').trim();
            if (!/^\d{4}$/.test(safeYear)) continue;
            const parsed = Number(chest);
            if (!Number.isInteger(parsed) || parsed < 0) continue;
            out[safeYear] = String(parsed);
        }
        return out;
    }, []);

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

    const resolveThumbUrl = useCallback((media: ProfileCollectionItem) => {
        const thumbCandidate =
            media.thumbnail_url || media.preview_url || media.full_url || media.raw_url || media.original_url || null;
        const resolved = thumbCandidate ? toAbsoluteUrl(String(thumbCandidate)) : null;
        return withAccessToken(resolved) || resolved;
    }, [toAbsoluteUrl, withAccessToken]);

    const resolveMediaUrl = useCallback((media: ProfileCollectionItem) => {
        const candidate =
            media.preview_url || media.full_url || media.original_url || media.raw_url || null;
        const resolved = candidate ? toAbsoluteUrl(String(candidate)) : null;
        return withAccessToken(resolved) || resolved;
    }, [toAbsoluteUrl, withAccessToken]);

    const resolveTimelineMediaThumb = useCallback((media: any) => {
        const thumbCandidate =
            media?.thumbnail_url || media?.preview_url || media?.full_url || media?.raw_url || media?.original_url || null;
        const resolved = thumbCandidate ? toAbsoluteUrl(String(thumbCandidate)) : null;
        return withAccessToken(resolved) || resolved;
    }, [toAbsoluteUrl, withAccessToken]);

    const timelineStorageKey = useMemo(() => {
        const key = user?.sub || userProfile?.username || user?.email || 'self';
        return `@profile_timeline_${key}`;
    }, [user?.email, user?.sub, userProfile?.username]);
    const categoryStorageKey = useMemo(() => {
        const key = user?.sub || userProfile?.username || user?.email || 'self';
        return `@profile_category_${key}`;
    }, [user?.email, user?.sub, userProfile?.username]);

    const blogStorageKey = useMemo(() => {
        const key = user?.sub || userProfile?.username || user?.email || 'self';
        return `@profile_blogs_${key}`;
    }, [user?.email, user?.sub, userProfile?.username]);

    useEffect(() => {
        const reconcileCategory = async () => {
            if (!hasTrackFieldProfile && !hasRoadTrailProfile) {
                setProfileCategory(null);
                await AsyncStorage.removeItem(categoryStorageKey);
                return;
            }
            if (profileCategory === 'Track&Field' && !hasTrackFieldProfile) {
                const fallback = hasRoadTrailProfile ? 'Road&Trail' : null;
                setProfileCategory(fallback);
                if (fallback) await AsyncStorage.setItem(categoryStorageKey, fallback);
                return;
            }
            if (profileCategory === 'Road&Trail' && !hasRoadTrailProfile) {
                const fallback = hasTrackFieldProfile ? 'Track&Field' : null;
                setProfileCategory(fallback);
                if (fallback) await AsyncStorage.setItem(categoryStorageKey, fallback);
                return;
            }
            if (!profileCategory) {
                const fallback = hasTrackFieldProfile ? 'Track&Field' : 'Road&Trail';
                setProfileCategory(fallback);
                await AsyncStorage.setItem(categoryStorageKey, fallback);
            }
        };
        reconcileCategory();
    }, [categoryStorageKey, hasRoadTrailProfile, hasTrackFieldProfile, profileCategory]);

    const loadProfileData = useCallback(async () => {
        // Timeline: server is the source of truth (no more device-local dummy timeline)
        if (apiAccessToken) {
            try {
                const resp = await getProfileTimeline(apiAccessToken, 'me');
                const items = Array.isArray((resp as any)?.items) ? (resp as any).items : [];
                const mapped: TimelineEntry[] = items.map((it: ProfileTimelineEntry) => {
                    const mediaItems = Array.isArray((it as any)?.media) ? (it as any).media : [];
                    const photos = mediaItems
                        .map((media: any) => resolveTimelineMediaThumb(media))
                        .filter(Boolean) as string[];
                    const coverUrl = (it as any)?.cover_thumbnail_url ? toAbsoluteUrl(String((it as any).cover_thumbnail_url)) : null;
                    const backgroundImage = coverUrl ? (withAccessToken(coverUrl) || coverUrl) : null;
                    const linkedPosts = Array.isArray((it as any)?.linked_posts) ? (it as any).linked_posts : [];
                    const linkedEvents = Array.isArray((it as any)?.linked_events) ? (it as any).linked_events : [];
                    const eventDate = (it as any)?.event_date ?? null;
                    const yearValue = eventDate ? new Date(String(eventDate)).getFullYear() : Number((it as any)?.year ?? '');
                    return ({
                        id: String(it.id),
                        year: Number.isFinite(yearValue) ? String(yearValue) : String((it as any)?.year ?? ''),
                        date: eventDate ? String(eventDate) : null,
                        title: String((it as any)?.title ?? ''),
                        description: (it as any)?.description ?? '',
                        highlight: (it as any)?.highlight ?? '',
                        photos,
                        mediaItems,
                        cover_media_id: (it as any)?.cover_media_id ?? null,
                        backgroundImage: backgroundImage || undefined,
                        linkedBlogs: linkedPosts.map((p: any) => ({ id: String(p.id), title: String(p.title ?? t('Blog')) })),
                        linkedCompetitions: linkedEvents.map((e: any) => ({
                            id: String(e.event_id),
                            title: String(e.event_name ?? t('competition')),
                            event_date: e.event_date ?? null,
                            event_location: e.event_location ?? null,
                        })),
                        linkedBlogIds: linkedPosts.map((p: any) => String(p.id)),
                        linkedCompetitionIds: linkedEvents.map((e: any) => String(e.event_id)),
                    } as any);
                });
                setTimelineItems(mapped);
            } catch {
                setTimelineItems([]);
            }
        } else {
            setTimelineItems([]);
        }

        const storedCategory = await AsyncStorage.getItem(categoryStorageKey);
        if (storedCategory === 'Road&Trail' || storedCategory === 'Track&Field') {
            setProfileCategory(storedCategory);
        }

        // Profile summary (bio + counts)
        let summaryProfileId: string | null = null;
        if (apiAccessToken) {
            try {
                const summary = await getProfileSummary(apiAccessToken);
                setProfileSummary(summary);
                const serverChestByYear = normalizeChestByYear(summary?.profile?.chest_numbers_by_year ?? {});
                setChestNumbersByYear(serverChestByYear);
                summaryProfileId = summary?.profile_id ? String(summary.profile_id) : null;
                const avatarMedia = summary?.profile?.avatar_media ?? null;
                const avatarCandidate =
                    avatarMedia?.thumbnail_url ||
                    avatarMedia?.preview_url ||
                    avatarMedia?.full_url ||
                    avatarMedia?.raw_url ||
                    avatarMedia?.original_url ||
                    summary?.profile?.avatar_url ||
                    null;
                if (avatarCandidate) {
                    const resolved = toAbsoluteUrl(String(avatarCandidate));
                    const withToken = withAccessToken(resolved) || resolved;
                    if (withToken) {
                        setProfileImage({ uri: withToken });
                    }
                } else {
                    setProfileImage(Images.profile1);
                }
            } catch {
                setProfileSummary(null);
                const localChestByYear = normalizeChestByYear(userProfile?.chestNumbersByYear ?? {});
                setChestNumbersByYear(localChestByYear);
            }
        } else {
            setProfileSummary(null);
            const localChestByYear = normalizeChestByYear(userProfile?.chestNumbersByYear ?? {});
            setChestNumbersByYear(localChestByYear);
        }

        // News/blogs: server-driven (no more local dummy list)
        const postsProfileId = summaryProfileId;
        if (apiAccessToken && postsProfileId) {
            try {
                const resp = await getPosts(apiAccessToken, { author_profile_id: String(postsProfileId), limit: 50 });
                const posts = Array.isArray((resp as any)?.posts) ? (resp as any).posts : [];
                const sortedPosts = [...posts].sort((a: PostSummary, b: PostSummary) => {
                    const aCreated = (a as any)?.created_at ?? (a as any)?.createdAt ?? null;
                    const bCreated = (b as any)?.created_at ?? (b as any)?.createdAt ?? null;
                    const aTime = Date.parse(String(aCreated ?? ''));
                    const bTime = Date.parse(String(bCreated ?? ''));
                    const timeDiff = (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
                    if (timeDiff !== 0) return timeDiff;
                    const titleDiff = String(b?.title ?? '').localeCompare(String(a?.title ?? ''), undefined, {
                        numeric: true,
                        sensitivity: 'base',
                    });
                    if (titleDiff !== 0) return titleDiff;
                    return String(b?.id ?? '').localeCompare(String(a?.id ?? ''));
                });
                const mapped = sortedPosts.map((p: PostSummary) => {
                    const createdAtRaw = (p as any)?.created_at ?? (p as any)?.createdAt ?? null;
                    const cover = (p as any)?.cover_media || null;
                    const coverCandidate = cover?.thumbnail_url || cover?.preview_url || cover?.full_url || cover?.raw_url || null;
                    const resolved = coverCandidate ? toAbsoluteUrl(String(coverCandidate)) : null;
                    const coverImage = resolved ? (withAccessToken(resolved) || resolved) : null;
                    return ({
                        id: String(p.id),
                        title: String(p.title || ''),
                        createdAt: createdAtRaw ? String(createdAtRaw) : null,
                        date: createdAtRaw ? String(createdAtRaw).slice(0, 10) : '',
                        description: p.summary || p.description || '',
                        coverImage,
                        likes_count: Number((p as any)?.likes_count ?? 0),
                        views_count: Number((p as any)?.views_count ?? 0),
                    });
                });
                setBlogEntries(mapped);
            } catch {
                setBlogEntries([]);
            }
        } else {
            setBlogEntries([]);
        }

        if (apiAccessToken) {
            try {
                const resp = await getSubscribedEvents(apiAccessToken);
                setSubscribedEvents(Array.isArray((resp as any)?.events) ? (resp as any).events : []);
            } catch {
                setSubscribedEvents([]);
            }
            try {
                const resp = await getHubAppearances(apiAccessToken);
                const appearances = Array.isArray((resp as any)?.appearances) ? (resp as any).appearances : [];
                const mapped = appearances.map((entry: HubAppearanceSummary) => {
                    const thumb = entry?.thumbnail_url ? toAbsoluteUrl(String(entry.thumbnail_url)) : null;
                    return {
                        ...entry,
                        thumbnail_url: thumb ? (withAccessToken(thumb) || thumb) : null,
                    } as HubAppearanceSummary;
                });
                setAppearanceEvents(mapped);
            } catch {
                setAppearanceEvents([]);
            }
        } else {
            setSubscribedEvents([]);
            setAppearanceEvents([]);
        }

        // Collections by type
        if (apiAccessToken) {
            try {
                const resp = await getProfileCollectionByType(apiAccessToken, 'image');
                setPhotoCollectionItems(Array.isArray((resp as any)?.items) ? (resp as any).items : []);
            } catch {
                setPhotoCollectionItems([]);
            }
            try {
                const resp = await getProfileCollectionByType(apiAccessToken, 'video');
                setVideoCollectionItems(Array.isArray((resp as any)?.items) ? (resp as any).items : []);
            } catch {
                setVideoCollectionItems([]);
            }
        } else {
            setPhotoCollectionItems([]);
            setVideoCollectionItems([]);
        }

        // Downloads summary (server-side)
        if (apiAccessToken) {
            try {
                const summary = await getDownloadsSummary(apiAccessToken);
                setDownloadsSummary({
                    total_downloads: Number((summary as any)?.total_downloads ?? 0),
                    total_views: Number((summary as any)?.total_views ?? 0),
                    total_profit_cents: Number((summary as any)?.total_profit_cents ?? 0),
                });
            } catch {
                setDownloadsSummary({ total_downloads: 0, total_views: 0, total_profit_cents: 0 });
            }
        } else {
            setDownloadsSummary(null);
        }

        // Competitions with uploads (server-side)
        if (apiAccessToken) {
            try {
                const resp = await getUploadedCompetitions(apiAccessToken, {limit: 200});
                setUploadedCompetitions(Array.isArray((resp as any)?.competitions) ? (resp as any).competitions : []);
            } catch {
                setUploadedCompetitions([]);
            }
            try {
                const resp = await getMyGroups(apiAccessToken);
                setMyGroups(Array.isArray((resp as any)?.groups) ? (resp as any).groups : []);
            } catch {
                setMyGroups([]);
            }
        } else {
            setUploadedCompetitions([]);
            setMyGroups([]);
        }
        setDidLoadProfileData(true);
    }, [
        apiAccessToken,
        categoryStorageKey,
        normalizeChestByYear,
        resolveTimelineMediaThumb,
        t,
        toAbsoluteUrl,
        userProfile?.chestNumbersByYear,
        withAccessToken,
    ]);

    useFocusEffect(
        useCallback(() => {
            loadProfileData();
        }, [loadProfileData]),
    );

    const openAddTimeline = () => {
        navigation.navigate('ProfileTimelineEditScreen', {
            mode: 'add',
            storageKey: timelineStorageKey,
            blogStorageKey,
            competitionOptions,
        });
    };

    const openEditTimeline = (item: TimelineEntry) => {
        navigation.navigate('ProfileTimelineEditScreen', {
            mode: 'edit',
            storageKey: timelineStorageKey,
            item,
            blogStorageKey,
            competitionOptions,
        });
    };

    const openTimelineDetail = (item: TimelineEntry) => {
        navigation.navigate('ProfileTimelineDetailScreen', {
            item,
            ownerName: user?.name ?? t('Profile'),
        });
    };

    const openBlogEditor = (entry?: any) => {
        navigation.navigate('ProfileBlogEditorScreen', {
            mode: entry ? 'edit' : 'add',
            storageKey: blogStorageKey,
            entry,
        });
    };

    const setCategory = useCallback(async (value: 'Track&Field' | 'Road&Trail') => {
        if (value === 'Track&Field' && !hasTrackFieldProfile) return;
        if (value === 'Road&Trail' && !hasRoadTrailProfile) return;
        setProfileCategory(value);
        await AsyncStorage.setItem(categoryStorageKey, value);
    }, [categoryStorageKey, hasRoadTrailProfile, hasTrackFieldProfile]);

    const openProfileMenu = () => {
        setShowProfileSwitcherModal(true);
    };

    useEffect(() => {
        const shouldOpen = Boolean(route?.params?.openProfileSwitcher);
        if (!shouldOpen) return;
        setShowProfileSwitcherModal(true);
        navigation.setParams?.({ openProfileSwitcher: false });
    }, [navigation, route?.params?.openProfileSwitcher]);

    useEffect(() => {
        const forcedCategory = String(route?.params?.forceProfileCategory || '').trim();
        if (forcedCategory !== 'Track&Field' && forcedCategory !== 'Road&Trail') return;
        setCategory(forcedCategory as 'Track&Field' | 'Road&Trail');
        navigation.setParams?.({ forceProfileCategory: undefined });
    }, [navigation, route?.params?.forceProfileCategory, setCategory]);

    const handleProfileImageChange = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            selectionLimit: 1,
        });
        const asset = result?.assets?.[0];
        if (!asset?.uri) return;

        setProfileImage({ uri: asset.uri });

        if (!apiAccessToken) return;
        setIsUpdatingAvatar(true);
        try {
            const uploadResp = await uploadMediaBatch(apiAccessToken, {
                files: [
                    {
                        uri: asset.uri,
                        type: asset.type ?? 'image/jpeg',
                        name: asset.fileName ?? `avatar-${Date.now()}.jpg`,
                    },
                ],
            });
            const firstResult = Array.isArray(uploadResp?.results) ? uploadResp.results.find((r: any) => r?.media_id || r?.storage_key) : null;
            const mediaId = firstResult?.media_id ?? null;
            let updated: ProfileSummaryResponse | null = null;
            if (mediaId) {
                updated = await updateProfileSummary(apiAccessToken, { avatar_media_id: String(mediaId) });
            } else if (firstResult?.storage_key) {
                updated = await updateProfileSummary(apiAccessToken, { avatar_url: String(firstResult.storage_key) });
            }
            if (updated) {
                setProfileSummary(updated);
                const avatarMedia = updated?.profile?.avatar_media ?? null;
                const avatarCandidate =
                    avatarMedia?.thumbnail_url ||
                    avatarMedia?.preview_url ||
                    avatarMedia?.full_url ||
                    avatarMedia?.raw_url ||
                    avatarMedia?.original_url ||
                    updated?.profile?.avatar_url ||
                    null;
                if (avatarCandidate) {
                    const resolved = toAbsoluteUrl(String(avatarCandidate));
                    const withToken = withAccessToken(resolved) || resolved;
                    if (withToken) {
                        setProfileImage({ uri: withToken });
                    }
                }
            }
        } catch (e: any) {
            Alert.alert(t('Upload failed'), String(e?.message ?? e));
        } finally {
            setIsUpdatingAvatar(false);
        }
    };

    const showDownloadsTab = true;
    const currentChestNumber = useMemo(() => {
        const byYear = normalizeChestByYear(profileSummary?.profile?.chest_numbers_by_year ?? chestNumbersByYear);
        const thisYearChest = String(byYear[currentYear] ?? '').trim();
        if (thisYearChest.length > 0) return thisYearChest;
        const latestYear = Object.keys(byYear)
            .filter((year) => /^\d{4}$/.test(String(year)))
            .sort((a, b) => Number(b) - Number(a))
            .find((year) => String(byYear[year] ?? '').trim().length > 0);
        if (!latestYear) return '';
        return String(byYear[latestYear]).trim();
    }, [chestNumbersByYear, currentYear, normalizeChestByYear, profileSummary?.profile?.chest_numbers_by_year]);

    const athleticsClub = useMemo(() => {
        const fromSummary =
            (profileSummary as any)?.profile?.track_field_club ??
            (profileSummary as any)?.profile?.athletics_club ??
            (profileSummary as any)?.profile?.running_club ??
            (profileSummary as any)?.profile?.running_club_name ??
            null;
        const fromLocal = (userProfile as any)?.trackFieldClub ?? userProfile?.runningClub ?? null;
        return String(fromSummary ?? fromLocal ?? '').trim();
    }, [profileSummary, userProfile]);

    const trackFieldMainEvent = useMemo(() => {
        return String(
            (profileSummary as any)?.profile?.track_field_main_event ??
            (userProfile as any)?.trackFieldMainEvent ??
            '',
        ).trim();
    }, [profileSummary, userProfile]);

    const roadTrailMainEvent = useMemo(() => {
        return String(
            (profileSummary as any)?.profile?.road_trail_main_event ??
            (userProfile as any)?.roadTrailMainEvent ??
            '',
        ).trim();
    }, [profileSummary, userProfile]);
    const profileWebsite = useMemo(() => {
        return String(
            (profileSummary as any)?.profile?.website ??
            userProfile?.website ??
            '',
        ).trim();
    }, [profileSummary, userProfile?.website]);

    const profileNationality = useMemo(() => {
        return String(
            (profileSummary as any)?.profile?.nationality ??
            userProfile?.nationality ??
            '',
        ).trim();
    }, [profileSummary, userProfile?.nationality]);

    const profileMetaTokens = useMemo(() => {
        const trackEventWithClub = [trackFieldMainEvent, athleticsClub].map((entry) => String(entry || '').trim()).filter(Boolean).join(' · ');
        const roadEventWithClub = [roadTrailMainEvent, athleticsClub].map((entry) => String(entry || '').trim()).filter(Boolean).join(' · ');
        if (profileCategory === 'Track&Field') {
            return [
                profileNationality,
                currentChestNumber,
                trackEventWithClub,
            ].map((entry) => String(entry || '').trim()).filter(Boolean);
        }
        if (profileCategory === 'Road&Trail') {
            return [
                profileNationality,
                roadEventWithClub,
            ].map((entry) => String(entry || '').trim()).filter(Boolean);
        }
        return [];
    }, [athleticsClub, currentChestNumber, profileCategory, profileNationality, roadTrailMainEvent, trackFieldMainEvent]);

    const openProfileWebsite = useCallback(async () => {
        const raw = String(profileWebsite || '').trim();
        if (!raw) return;
        const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
        try {
            await Linking.openURL(normalized);
        } catch {
            Alert.alert(t('Error'), t('Could not open website.'));
        }
    }, [profileWebsite, t]);
    const openWebsiteEditor = useCallback(() => {
        setWebsiteDraft(String(profileWebsite || ''));
        setWebsiteEditVisible(true);
    }, [profileWebsite]);

    const saveWebsiteOnly = useCallback(async () => {
        const nextValue = String(websiteDraft || '').trim();
        if (websiteSaveBusy) return;
        setWebsiteSaveBusy(true);
        try {
            if (apiAccessToken) {
                const updated = await updateProfileSummary(apiAccessToken, { website: nextValue || null });
                if (updated) setProfileSummary(updated);
            }
            await updateUserProfile({ website: nextValue } as any);
            setWebsiteEditVisible(false);
        } catch (e: any) {
            const message = String(e?.message ?? e ?? '');
            Alert.alert(t('Save failed'), message || t('Please try again'));
        } finally {
            setWebsiteSaveBusy(false);
        }
    }, [apiAccessToken, t, updateUserProfile, websiteDraft, websiteSaveBusy]);

    const profileDisplayName = useMemo(() => {
        const fromSummary = String((profileSummary as any)?.profile?.display_name ?? '').trim();
        if (fromSummary) return fromSummary;

        const fromLocal = [userProfile?.firstName, userProfile?.lastName]
            .filter((part) => String(part ?? '').trim().length > 0)
            .join(' ')
            .trim();
        if (fromLocal) return fromLocal;

        const fromAuth = String(user?.name ?? '').trim();
        if (fromAuth) return fromAuth;

        return t('Profile');
    }, [profileSummary, t, user?.name, userProfile?.firstName, userProfile?.lastName]);

    const profileHandle = useMemo(() => {
        const raw =
            (profileSummary as any)?.profile?.username ??
            userProfile?.username ??
            user?.nickname ??
            (user?.email ? String(user.email).split('@')[0] : '');
        const safe = String(raw ?? '').trim().replace(/^@+/, '');
        if (!safe) return '';
        return safe.replace(/\s+/g, '');
    }, [profileSummary, user?.email, user?.nickname, userProfile?.username]);

    const profileBioText = useMemo(() => {
        const raw = String(profileSummary?.profile?.bio ?? '').trim();
        if (!raw) return t('Write your bio...');
        const normalizedRaw = raw.replace(/^@+/, '').trim().toLowerCase();
        const normalizedHandle = profileHandle.trim().toLowerCase();
        if (normalizedHandle.length > 0 && normalizedRaw === normalizedHandle) {
            return t('Write your bio...');
        }
        return raw;
    }, [profileHandle, profileSummary?.profile?.bio, t]);

    const sortCollectionItems = useCallback((items: ProfileCollectionItem[]) => {
        const featured = items
            .filter((it) => it.featured_rank != null)
            .sort((a, b) => Number(a.featured_rank ?? 0) - Number(b.featured_rank ?? 0));
        const rest = items
            .filter((it) => it.featured_rank == null)
            .sort((a, b) => {
                const aTime = new Date((a.added_at ?? a.created_at) || 0).getTime();
                const bTime = new Date((b.added_at ?? b.created_at) || 0).getTime();
                return bTime - aTime;
            });
        return [...featured, ...rest];
    }, []);

    const collectionItemsForTab = useMemo(() => {
        const items = activeTab === 'photos' ? photoCollectionItems : videoCollectionItems;
        const target = activeTab === 'photos' ? 'image' : 'video';
        return items.filter((item) => String(item.type).toLowerCase() === target);
    }, [activeTab, photoCollectionItems, videoCollectionItems]);

    const visibleCollectionItems = useMemo(
        () => sortCollectionItems(collectionItemsForTab).slice(0, 4),
        [collectionItemsForTab, sortCollectionItems],
    );


    const competitionOptions = useMemo(
        () => uploadedCompetitions.map((entry) => entry.event_name).filter(Boolean) as string[],
        [uploadedCompetitions],
    );

    const formatEventDate = useCallback((value?: string | null) => {
        if (!value) return '';
        const raw = String(value);
        const dt = new Date(raw);
        if (Number.isNaN(dt.getTime())) return raw.slice(0, 10);
        return dt.toLocaleDateString();
    }, []);

    const formatMoney = useCallback((cents?: number | null) => {
        if (cents == null || !Number.isFinite(Number(cents))) return '—';
        return `€${(Number(cents) / 100).toFixed(2)}`;
    }, []);

    const formatCount = useCallback((value?: number | null) => {
        const num = Number(value ?? 0);
        if (!Number.isFinite(num)) return '0';
        if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
        if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
        return String(Math.max(0, Math.floor(num)));
    }, []);

    const previewCompetitions = useMemo(
        () => uploadedCompetitions.slice(0, 5),
        [uploadedCompetitions],
    );


    const activityItems = useMemo<ProfileNewsItem[]>(() => {
        const toTimestamp = (value?: string | null) => {
            if (!value) return 0;
            const ts = Date.parse(String(value));
            return Number.isNaN(ts) ? 0 : ts;
        };

        const toDateLabel = (value?: string | null) => {
            if (!value) return '';
            const raw = String(value);
            const dt = new Date(raw);
            if (Number.isNaN(dt.getTime())) return raw.slice(0, 10);
            return dt.toLocaleDateString();
        };

        const blogItems: ProfileNewsItem[] = blogEntries.map((entry) => ({
            id: String(entry.id),
            kind: 'blog',
            postId: String(entry.id),
            title: String(entry.title || ''),
            sortAt: entry.createdAt ? String(entry.createdAt) : (entry.date ? String(entry.date) : null),
            date: entry.createdAt ? toDateLabel(String(entry.createdAt)) : (entry.date ? String(entry.date) : ''),
            description: entry.description ? String(entry.description) : '',
            coverImage: entry.coverImage ? String(entry.coverImage) : null,
        }));

        const eventsMap = new Map<
            string,
            {
                eventId: string;
                eventName: string;
                eventDate: string | null;
                eventLocation: string | null;
                coverImage: string | null;
                isSubscribed: boolean;
                photosCount: number;
                videosCount: number;
            }
        >();

        for (const event of subscribedEvents) {
            const eventId = String(event?.event_id || '').trim();
            if (!eventId) continue;
            const current =
                eventsMap.get(eventId) ??
                {
                    eventId,
                    eventName: '',
                    eventDate: null,
                    eventLocation: null,
                    coverImage: null,
                    isSubscribed: false,
                    photosCount: 0,
                    videosCount: 0,
                };
            current.eventName = String(event?.event_name ?? event?.event_title ?? current.eventName ?? '').trim();
            current.eventDate = event?.event_date ? String(event.event_date) : current.eventDate;
            current.eventLocation = event?.event_location ? String(event.event_location) : current.eventLocation;
            current.isSubscribed = true;
            eventsMap.set(eventId, current);
        }

        for (const appearance of appearanceEvents) {
            const eventId = String(appearance?.event_id || '').trim();
            if (!eventId) continue;
            const current =
                eventsMap.get(eventId) ??
                {
                    eventId,
                    eventName: '',
                    eventDate: null,
                    eventLocation: null,
                    coverImage: null,
                    isSubscribed: false,
                    photosCount: 0,
                    videosCount: 0,
                };
            current.eventName = String(appearance?.event_name ?? current.eventName ?? '').trim();
            current.eventDate = appearance?.event_date ? String(appearance.event_date) : current.eventDate;
            current.eventLocation = appearance?.event_location ? String(appearance.event_location) : current.eventLocation;
            current.coverImage =
                appearance?.thumbnail_url && String(appearance.thumbnail_url).trim().length > 0
                    ? String(appearance.thumbnail_url)
                    : current.coverImage;
            current.photosCount = Number(appearance?.photos_count ?? current.photosCount ?? 0);
            current.videosCount = Number(appearance?.videos_count ?? current.videosCount ?? 0);
            eventsMap.set(eventId, current);
        }

        const eventItems: ProfileNewsItem[] = Array.from(eventsMap.values()).map((event) => {
            const details: string[] = [];
            if (event.isSubscribed) details.push(t('Subscribed competition'));
            const mediaParts: string[] = [];
            if (event.photosCount > 0) mediaParts.push(`${event.photosCount} ${t('Photos')}`);
            if (event.videosCount > 0) mediaParts.push(`${event.videosCount} ${t('Videos')}`);
            if (mediaParts.length > 0) details.push(mediaParts.join(' | '));
            if (event.eventLocation) details.push(String(event.eventLocation));

            return {
                id: `event:${event.eventId}`,
                kind: 'competition',
                eventId: event.eventId,
                title: event.eventName || t('competition'),
                sortAt: event.eventDate,
                date: toDateLabel(event.eventDate),
                description: details.join(' - '),
                coverImage: event.coverImage,
            };
        });

        return [...blogItems, ...eventItems].sort((a, b) => {
            const aDate = toTimestamp(a.sortAt ?? a.date ?? null);
            const bDate = toTimestamp(b.sortAt ?? b.date ?? null);
            if (bDate !== aDate) return bDate - aDate;
            return String(b.id).localeCompare(String(a.id));
        });
    }, [appearanceEvents, blogEntries, subscribedEvents, t]);

    const handleSwipeDeleteBlog = useCallback((item: ProfileNewsItem) => {
        if ((item.kind ?? 'blog') !== 'blog') return;
        setPendingDeleteBlog(item);
    }, []);

    const confirmDeleteBlog = useCallback(async () => {
        if (!apiAccessToken || !pendingDeleteBlog || isDeletingBlog) return;
        setIsDeletingBlog(true);
        const blogId = String(pendingDeleteBlog.postId ?? pendingDeleteBlog.id);
        try {
            await deletePost(apiAccessToken, blogId);
            setBlogEntries((prev) => prev.filter((entry) => String(entry.id) !== blogId));
            setPendingDeleteBlog(null);
        } catch {
            Alert.alert(t('Error'), t('Could not delete this post.'));
        } finally {
            setIsDeletingBlog(false);
        }
    }, [apiAccessToken, isDeletingBlog, pendingDeleteBlog, t]);

    const handlePressActivityItem = useCallback(async (item: ProfileNewsItem) => {
        if ((item.kind ?? 'blog') === 'blog') {
            const postId = String(item.postId ?? item.id);
            navigation.navigate('ViewUserBlogDetailsScreen', {
                postId,
                postPreview: {
                    title: item.title,
                    date: item.date,
                    description: item.description,
                    coverImage: item.coverImage,
                },
            });
            return;
        }

        const eventId = String(item.eventId || '').trim();
        if (!apiAccessToken || !eventId) {
            return;
        }

        try {
            const resp = await getHubAppearanceMedia(apiAccessToken, eventId);
            const baseResults = Array.isArray((resp as any)?.results) ? (resp as any).results : [];
            const results = baseResults.map((entry: any) => ({
                ...entry,
                event_name: entry?.event_name ?? item.title,
            }));
            navigation.navigate('AISearchResultsScreen', {
                results,
                matchedCount: results.length,
                matchType: 'context',
            });
        } catch {
            Alert.alert(t('Error'), t('Could not open this competition.'));
        }
    }, [apiAccessToken, navigation, t]);


    if (didLoadProfileData && !hasAnyLinkedProfiles) {
        return (
            <View style={Styles.mainContainer}>
                <SizeBox height={insets.top} />
                <View style={Styles.header}>
                    {showBackButton ? (
                        <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                            <Icons.BackArrow width={20} height={20} />
                        </TouchableOpacity>
                    ) : (
                        <View style={Styles.headerSpacer} />
                    )}
                    <Text style={Styles.headerTitle}>{t('Profile')}</Text>
                    <TouchableOpacity style={Styles.headerButton} onPress={openProfileMenu}>
                        <User size={24} color={colors.primaryColor} variant="Linear" />
                    </TouchableOpacity>
                </View>
                <View style={Styles.emptyProfileContainer}>
                    <TouchableOpacity
                        style={Styles.emptyProfileAddButton}
                        onPress={() => navigation.navigate('CategorySelectionScreen', { fromAddFlow: true })}
                        activeOpacity={0.85}
                    >
                        <Text style={Styles.emptyProfileAddPlus}>+</Text>
                    </TouchableOpacity>
                    <Text style={Styles.emptyProfileTitle}>{t('No profiles yet')}</Text>
                    <Text style={Styles.emptyProfileSubtitle}>{t('Tap plus to create your first profile')}</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                {showBackButton ? (
                    <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                        <Icons.BackArrow width={20} height={20} />
                    </TouchableOpacity>
                ) : (
                    <View style={Styles.headerSpacer} />
                )}
                <Text style={Styles.headerTitle}>{t('Profile')}</Text>
                <TouchableOpacity style={Styles.headerButton} onPress={openProfileMenu}>
                    <User size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={Styles.scrollContent}
            >
                {/* Profile Card */}
                <View style={Styles.profileCard}>
                    <View style={Styles.profileTopRow}>
                        <View style={Styles.profileHeaderRow}>
                            <TouchableOpacity
                                style={Styles.profileImageContainer}
                                activeOpacity={0.8}
                                onPress={handleProfileImageChange}
                            >
                                <View style={Styles.profileImageInner}>
                                    <FastImage source={profileImage} style={Styles.profileImage} />
                                    {isUpdatingAvatar && (
                                        <View style={Styles.profileImageLoading}>
                                            <ActivityIndicator color={colors.primaryColor} />
                                        </View>
                                    )}
                                </View>
                                <View style={Styles.profileImageEditBadge}>
                                    <Edit2 size={14} color="#FFFFFF" variant="Linear" />
                                </View>
                            </TouchableOpacity>
                            <View style={Styles.statsContainerRight}>
                                <View style={Styles.statItem}>
                                    <Text style={Styles.statValue}>{formatCount(profileSummary?.followers_count ?? 0)}</Text>
                                    <Text style={Styles.statLabel}>{t('Followers')}</Text>
                                </View>
                                {profileCategoryLabel.length > 0 ? (
                                    <>
                                        <View style={Styles.statDivider} />
                                        <View style={Styles.statItem}>
                                            <Icons.TrackFieldLogo width={28} height={24} />
                                            <Text style={Styles.statLabel}>{profileCategoryLabel}</Text>
                                        </View>
                                    </>
                                ) : null}
                            </View>
                        </View>
                    </View>

                    <View style={Styles.profileIdentityBlock}>
                        <View style={Styles.profileIdentityRow}>
                            <View style={Styles.profileIdentityHandleWrap}>
                                {profileHandle.length > 0 ? (
                                    <Text style={Styles.userHandleInline} numberOfLines={1}>
                                        @{profileHandle}
                                    </Text>
                                ) : null}
                            </View>
                            <View style={Styles.profileIdentityNameWrap}>
                                <Text style={Styles.userName} numberOfLines={1}>
                                    {profileDisplayName}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Bio Section */}
                    <View style={Styles.bioSection}>
                        <View style={Styles.bioHeader}>
                            <Text style={Styles.bioTitle}>{t('Bio')}</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('EditBioScreens')}>
                                <Edit2 size={16} color={colors.mainTextColor} variant="Linear" />
                            </TouchableOpacity>
                        </View>
                        <Text style={Styles.bioText}>
                            {profileBioText}
                        </Text>
                        <View style={Styles.bioDivider} />
                    </View>
                    {profileMetaTokens.length > 0 && (
                        <View style={Styles.athleteMetaSection}>
                            <View style={Styles.athleteMetaInlineBox}>
                                <Text style={Styles.athleteMetaInlineText} numberOfLines={1} ellipsizeMode="tail">
                                    {profileMetaTokens.join('  •  ')}
                                </Text>
                            </View>
                        </View>
                    )}
                    {profileWebsite.length > 0 ? (
                        <View style={Styles.athleteMetaSection}>
                            <View style={Styles.websiteInlineRow}>
                                <TouchableOpacity style={Styles.websiteInlineLinkWrap} activeOpacity={0.8} onPress={openProfileWebsite}>
                                    <Text
                                        style={Styles.websiteInlineLinkText}
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                    >
                                        {profileWebsite}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={Styles.websiteInlineEditButton} onPress={openWebsiteEditor}>
                                    <Edit2 size={15} color={colors.primaryColor} variant="Linear" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : null}
                    {profileWebsite.length === 0 ? (
                        <View style={Styles.athleteMetaSection}>
                            <TouchableOpacity style={Styles.websiteInlineAddButton} onPress={openWebsiteEditor}>
                                <Text
                                    style={[
                                        Styles.websiteInlineLinkText,
                                        { textDecorationLine: 'none' },
                                    ]}
                                    numberOfLines={1}
                                >
                                    {t('Add website')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}

                    <SizeBox height={10} />

                    {/* Links removed for cleaner profile */}
                </View>

                {/* Profile Tabs */}
                <View style={Styles.profileTabs}>
                    <TouchableOpacity
                        style={[Styles.profileTab, profileTab === 'timeline' && Styles.profileTabActive]}
                        onPress={() => setProfileTab('timeline')}
                    >
                        <Clock size={18} color={profileTab === 'timeline' ? colors.primaryColor : colors.grayColor} variant="Linear" />
                        <Text style={[Styles.profileTabText, profileTab === 'timeline' && Styles.profileTabTextActive]}>{t('Timeline')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[Styles.profileTab, profileTab === 'activity' && Styles.profileTabActive]}
                        onPress={() => setProfileTab('activity')}
                    >
                        <DocumentText size={18} color={profileTab === 'activity' ? colors.primaryColor : colors.grayColor} variant="Linear" />
                        <Text style={[Styles.profileTabText, profileTab === 'activity' && Styles.profileTabTextActive]}>{t('News')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[Styles.profileTab, profileTab === 'collections' && Styles.profileTabActive]}
                        onPress={() => setProfileTab('collections')}
                    >
                        <Gallery size={18} color={profileTab === 'collections' ? colors.primaryColor : colors.grayColor} variant="Linear" />
                        <Text style={[Styles.profileTabText, profileTab === 'collections' && Styles.profileTabTextActive]}>{t('Collections')}</Text>
                    </TouchableOpacity>
                    {showDownloadsTab && (
                        <TouchableOpacity
                            style={[Styles.profileTab, profileTab === 'downloads' && Styles.profileTabActive]}
                            onPress={() => setProfileTab('downloads')}
                        >
                            <DocumentDownload size={18} color={profileTab === 'downloads' ? colors.primaryColor : colors.grayColor} variant="Linear" />
                            <Text style={[Styles.profileTabText, profileTab === 'downloads' && Styles.profileTabTextActive]}>{t('Downloads')}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {profileTab === 'timeline' && (
                    <ProfileTimeline
                        title={t('Timeline')}
                        items={timelineItems}
                        editable
                        onAdd={openAddTimeline}
                        onEdit={(item) => {
                            const original = timelineItems.find((entry) => entry.id === item.id) ?? item;
                            openEditTimeline(original);
                        }}
                        onPressItem={openTimelineDetail}
                    />
                )}

                {profileTab === 'activity' && (
                    <ProfileNewsSection
                        styles={Styles}
                        sectionTitle={t('News')}
                        actionLabel={t('Add blog')}
                        onPressAction={() => openBlogEditor()}
                        enableSwipeDelete
                        onSwipeDelete={handleSwipeDeleteBlog}
                        items={activityItems}
                        emptyText={t('No news yet. Add your first blog to share updates.')}
                        blogLabel={t('Blog')}
                        eventLabel={t('competition')}
                        onPressItem={handlePressActivityItem}
                    />
                )}

                {profileTab === 'collections' && (
                    <>
                        <View style={Styles.collectionsSection}>
                            <View style={Styles.sectionHeader}>
                                <Text style={Styles.sectionTitle}>{t('Collections')}</Text>
                                <TouchableOpacity style={Styles.actionPill} onPress={() => {
                                    if (activeTab === 'photos') {
                                        navigation.navigate('ViewUserCollectionsPhotosScreen', { initialTab: 'photos' });
                                    } else if (activeTab === 'videos') {
                                        navigation.navigate('ViewUserCollectionsVideosScreen', { initialTab: 'videos' });
                                    }
                                }}>
                                    <Text style={Styles.actionPillText}>{t('View all')}</Text>
                                </TouchableOpacity>
                            </View>
                            <SizeBox height={16} />

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

                            <SizeBox height={16} />

                            {activeTab === 'photos' ? (
                                <View style={Styles.collectionsCard}>
                                    <View style={Styles.collectionsGrid}>
                                        {visibleCollectionItems.map((item) => {
                                            const thumb = resolveThumbUrl(item);
                                            return (
                                            <TouchableOpacity
                                                key={String(item.media_id)}
                                                activeOpacity={0.85}
                                                onPress={() => {
                                                    navigation.navigate('PhotoDetailScreen', {
                                                        eventTitle: t('Collections'),
                                                        media: {
                                                            id: item.media_id,
                                                            type: item.type,
                                                        },
                                                    });
                                                }}
                                            >
                                                {thumb ? (
                                                    <FastImage
                                                        source={{ uri: String(thumb) }}
                                                        style={[Styles.collectionImage, { width: imageWidth }]}
                                                        resizeMode="cover"
                                                    />
                                                ) : (
                                                    <View style={[Styles.collectionImage, { width: imageWidth, backgroundColor: '#1a1a1a' }]} />
                                                )}
                                            </TouchableOpacity>
                                        );
                                        })}
                                    </View>
                                    {visibleCollectionItems.length === 0 && (
                                        <Text style={Styles.emptyText}>{t('No collections yet.')}</Text>
                                    )}
                                </View>
                            ) : (
                                <View style={Styles.collectionsCard}>
                                    <View style={Styles.collectionsGrid}>
                                        {visibleCollectionItems.map((item) => {
                                            const thumb = resolveThumbUrl(item);
                                            return (
                                            <TouchableOpacity
                                                key={String(item.media_id)}
                                                activeOpacity={0.85}
                                                onPress={() => {
                                                    const mediaUrl = resolveMediaUrl(item);
                                                    navigation.navigate('VideoPlayingScreen', {
                                                        video: {
                                                            media_id: item.media_id,
                                                            title: t('Video'),
                                                            thumbnail: thumb ? { uri: String(thumb) } : undefined,
                                                            uri: mediaUrl ?? '',
                                                        },
                                                    });
                                                }}
                                            >
                                                {thumb ? (
                                                    <FastImage
                                                        source={{ uri: String(thumb) }}
                                                        style={[Styles.collectionImage, { width: imageWidth }]}
                                                        resizeMode="cover"
                                                    />
                                                ) : (
                                                    <View style={[Styles.collectionImage, { width: imageWidth, backgroundColor: '#1a1a1a' }]} />
                                                )}
                                            </TouchableOpacity>
                                        );
                                        })}
                                    </View>
                                    {visibleCollectionItems.length === 0 && (
                                        <Text style={Styles.emptyText}>{t('No collections yet.')}</Text>
                                    )}
                                </View>
                            )}
                        </View>

                        <TouchableOpacity style={Styles.mainEditButton} onPress={() => {
                            if (activeTab === 'photos') {
                                navigation.navigate('EditPhotoCollectionsScreen');
                            } else {
                                navigation.navigate('EditVideoCollectionsScreen');
                            }
                        }}>
                            <Text style={Styles.mainEditButtonText}>{t('Edit')}</Text>
                            <Edit2 size={18} color="#FFFFFF" variant="Linear" />
                        </TouchableOpacity>
                    </>
                )}

                {profileTab === 'downloads' && showDownloadsTab && (
                    <View style={Styles.downloadsSection}>
                        <Text style={Styles.sectionTitle}>{t('Downloads')}</Text>
                        <TouchableOpacity
                            style={Styles.downloadsCard}
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate('DownloadsDetailsScreen', { mode: 'profit' })}
                        >
                            <View style={Styles.downloadsContent}>
                                <View style={Styles.downloadsIconContainer}>
                                    <Icons.DownloadColorful width={24} height={24} />
                                </View>
                                <Text>
                                    <Text style={Styles.downloadsText}>{t('Total downloads')}: </Text>
                                    <Text style={Styles.downloadsTextBold}>
                                        {downloadsSummary ? String(downloadsSummary.total_downloads) : '—'}
                                    </Text>
                                </Text>
                            </View>
                            <View style={Styles.downloadsDetailsButton}>
                                <Text style={Styles.downloadsDetailsButtonText}>{t('Details')}</Text>
                                <ArrowRight size={18} color="#9B9F9F" variant="Linear" />
                            </View>
                        </TouchableOpacity>
                        <View style={Styles.earningsRow}>
                            <View style={Styles.earningsCard}>
                                <Text style={Styles.earningsLabel}>{t('Views')}</Text>
                                <Text style={Styles.earningsValue}>
                                    {downloadsSummary ? String(downloadsSummary.total_views) : '—'}
                                </Text>
                            </View>
                            <View style={Styles.earningsCard}>
                                <Text style={Styles.earningsLabel}>{t('Profit')}</Text>
                                <Text style={Styles.earningsValue}>
                                    {downloadsSummary ? formatMoney(downloadsSummary.total_profit_cents ?? 0) : '—'}
                                </Text>
                            </View>
                        </View>
                        <View style={Styles.downloadAnalyticsSection}>
                            <View style={Styles.sectionHeader}>
                                <Text style={Styles.downloadAnalyticsTitle}>{t('Competitions')}</Text>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('DownloadsDetailsScreen', { mode: 'competitions' })}
                                >
                                    <Text style={Styles.viewAllText}>{t('View more')}</Text>
                                </TouchableOpacity>
                            </View>
                            {previewCompetitions.map((item) => (
                                <TouchableOpacity
                                    key={item.event_id}
                                    style={Styles.competitionCard}
                                    activeOpacity={0.85}
                                    onPress={() =>
                                        navigation.navigate('DownloadsDetailsScreen', {
                                            mode: 'competition-media',
                                            competition: item,
                                        })
                                    }
                                >
                                    {item.cover_thumbnail_url ? (
                                        <FastImage source={{ uri: String(item.cover_thumbnail_url) }} style={Styles.competitionThumb} resizeMode="cover" />
                                    ) : (
                                        <View style={Styles.competitionThumbPlaceholder} />
                                    )}
                                    <View style={Styles.competitionInfo}>
                                        <Text style={Styles.competitionTitle}>{item.event_name || t('competition')}</Text>
                                        <Text style={Styles.competitionMeta}>
                                            {Number(item.uploads_count ?? 0)} {t('uploads')} | {formatEventDate(item.event_date)}
                                        </Text>
                                        <Text style={Styles.competitionMetaSecondary}>{item.event_location ?? ''}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                            {previewCompetitions.length === 0 && (
                                <Text style={Styles.emptyText}>{t('No competitions found.')}</Text>
                            )}
                        </View>
                    </View>
                )}

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>

            <Modal
                visible={showProfileSwitcherModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowProfileSwitcherModal(false)}
            >
                <TouchableOpacity
                    style={Styles.profileSwitcherBackdrop}
                    activeOpacity={1}
                    onPress={() => setShowProfileSwitcherModal(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={Styles.profileSwitcherSheet}
                        onPress={() => {}}
                    >
                        <View style={Styles.profileSwitcherHandle} />
                        <Text style={Styles.profileSwitcherTitle}>{t('Switch profile')}</Text>
                        <SizeBox height={8} />

                        {hasTrackFieldProfile ? (
                            <TouchableOpacity
                                style={Styles.profileSwitcherRow}
                                onPress={() => {
                                    setCategory('Track&Field');
                                    setShowProfileSwitcherModal(false);
                                }}
                            >
                                <View style={Styles.profileSwitcherAvatar}>
                                    <Icons.TrackFieldLogo width={20} height={20} />
                                </View>
                                <Text style={Styles.profileSwitcherLabel}>{t('trackAndField')}</Text>
                                <Text style={Styles.profileSwitcherCheck}>{profileCategory === 'Track&Field' ? '✓' : ''}</Text>
                            </TouchableOpacity>
                        ) : null}

                        {hasRoadTrailProfile ? (
                            <TouchableOpacity
                                style={Styles.profileSwitcherRow}
                                onPress={() => {
                                    setCategory('Road&Trail');
                                    setShowProfileSwitcherModal(false);
                                }}
                            >
                                <View style={Styles.profileSwitcherAvatar}>
                                    <Icons.PersonRunningColorful width={20} height={20} />
                                </View>
                                <Text style={Styles.profileSwitcherLabel}>{t('roadAndTrail')}</Text>
                                <Text style={Styles.profileSwitcherCheck}>{profileCategory === 'Road&Trail' ? '✓' : ''}</Text>
                            </TouchableOpacity>
                        ) : null}

                        {myGroups
                            .map((group) => ({
                                id: String(group?.group_id ?? '').trim(),
                                name: String(group?.name ?? '').trim(),
                            }))
                            .filter((group) => group.id.length > 0)
                            .map((group) => (
                                <TouchableOpacity
                                    key={group.id}
                                    style={Styles.profileSwitcherRow}
                                    onPress={() => {
                                        setShowProfileSwitcherModal(false);
                                        navigation.navigate('GroupProfileScreen', { groupId: group.id });
                                    }}
                                >
                                    <View style={Styles.profileSwitcherAvatar}>
                                        <Icons.GroupColorful width={18} height={18} />
                                    </View>
                                    <Text style={Styles.profileSwitcherLabel}>{group.name || t('Group')}</Text>
                                    <Text style={Styles.profileSwitcherCheck} />
                                </TouchableOpacity>
                            ))}

                        <TouchableOpacity
                            style={[Styles.profileSwitcherRow, Styles.profileSwitcherAddRow]}
                            onPress={() => {
                                setShowProfileSwitcherModal(false);
                                navigation.navigate('CategorySelectionScreen', { fromAddFlow: true });
                            }}
                        >
                            <View style={Styles.profileSwitcherAvatarAdd}>
                                <Text style={Styles.profileSwitcherPlus}>+</Text>
                            </View>
                            <Text style={Styles.profileSwitcherAddLabel}>{t('Add')}</Text>
                            <Text style={Styles.profileSwitcherCheck} />
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            <Modal
                visible={Boolean(pendingDeleteBlog)}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    if (!isDeletingBlog) setPendingDeleteBlog(null);
                }}
            >
                <TouchableOpacity
                    style={Styles.categoryModalBackdrop}
                    activeOpacity={1}
                    onPress={() => {
                        if (!isDeletingBlog) setPendingDeleteBlog(null);
                    }}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={[
                            Styles.categoryModalCard,
                            {
                                backgroundColor: colors.modalBackground,
                                borderWidth: 0.5,
                                borderColor: colors.lightGrayColor,
                                borderRadius: 16,
                                padding: 16,
                            },
                        ]}
                        onPress={() => {}}
                    >
                        <Text style={Styles.categoryModalTitle}>{t('Delete blog')}</Text>
                        <SizeBox height={8} />
                        <Text style={[Styles.emptyStateText, { textAlign: 'center' }]}>
                            {t('Are you sure you want to delete this post?')}
                        </Text>
                        <SizeBox height={12} />
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                            <TouchableOpacity
                                style={[Styles.categoryOption, { flex: 1, borderRadius: 10 }]}
                                disabled={isDeletingBlog}
                                onPress={() => setPendingDeleteBlog(null)}
                            >
                                <Text style={Styles.categoryOptionText}>{t('Cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    minWidth: 110,
                                    minHeight: 44,
                                    borderRadius: 12,
                                    backgroundColor: colors.errorColor || '#D32F2F',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    paddingHorizontal: 16,
                                    paddingVertical: 10,
                                }}
                                disabled={isDeletingBlog}
                                onPress={confirmDeleteBlog}
                            >
                                {isDeletingBlog ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={[Styles.categoryOptionText, { color: '#FFFFFF' }]}>{t('Delete')}</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            <Modal
                visible={websiteEditVisible}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    if (!websiteSaveBusy) setWebsiteEditVisible(false);
                }}
            >
                <TouchableOpacity
                    style={Styles.categoryModalBackdrop}
                    activeOpacity={1}
                    onPress={() => {
                        if (!websiteSaveBusy) setWebsiteEditVisible(false);
                    }}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={[
                            Styles.categoryModalCard,
                            {
                                backgroundColor: colors.modalBackground,
                                borderWidth: 0.5,
                                borderColor: colors.lightGrayColor,
                                borderRadius: 16,
                                padding: 16,
                            },
                        ]}
                        onPress={() => {}}
                    >
                        <Text style={Styles.categoryModalTitle}>{t('Website')}</Text>
                        <SizeBox height={10} />
                        <View
                            style={{
                                borderWidth: 1,
                                borderColor: colors.lightGrayColor,
                                borderRadius: 10,
                                backgroundColor: colors.secondaryColor,
                                paddingHorizontal: 12,
                                minHeight: 46,
                                justifyContent: 'center',
                            }}
                        >
                            <TextInput
                                style={{ color: colors.mainTextColor, fontSize: 14, paddingVertical: 10 }}
                                value={websiteDraft}
                                onChangeText={setWebsiteDraft}
                                placeholder={t('Enter website link (optional)')}
                                placeholderTextColor={colors.grayColor}
                                autoCapitalize="none"
                                autoCorrect={false}
                                keyboardType="url"
                            />
                        </View>
                        <SizeBox height={12} />
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                            <TouchableOpacity
                                style={[Styles.categoryOption, { flex: 1, borderRadius: 10 }]}
                                disabled={websiteSaveBusy}
                                onPress={() => setWebsiteEditVisible(false)}
                            >
                                <Text style={Styles.categoryOptionText}>{t('cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    minWidth: 110,
                                    minHeight: 44,
                                    borderRadius: 12,
                                    backgroundColor: colors.primaryColor,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    paddingHorizontal: 16,
                                    paddingVertical: 10,
                                }}
                                disabled={websiteSaveBusy}
                                onPress={saveWebsiteOnly}
                            >
                                {websiteSaveBusy ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={[Styles.categoryOptionText, { color: '#FFFFFF' }]}>{t('save')}</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

        </View>
    );
};

export default UserProfileScreen;
