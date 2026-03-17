import { View, Text, TouchableOpacity, ScrollView, Dimensions, Modal, ActivityIndicator, Alert, Linking, TextInput } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import SizeBox from '../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FastImage from 'react-native-fast-image'
import Images from '../../constants/Images'
import Icons from '../../constants/Icons'
import { useTheme } from '../../context/ThemeContext'
import { createStyles } from './UserProfileStyles'
import { User, Edit2, Clock, ArrowRight, DocumentText, Gallery, DocumentDownload, Add } from 'iconsax-react-nativejs'
import { launchImageLibrary } from 'react-native-image-picker'
import ProfileTimeline, { TimelineEntry } from '../../components/profileTimeline/ProfileTimeline'
import { useAuth } from '../../context/AuthContext'
import {
    deletePost,
    getDownloadsSummary,
    getHomeOverview,
    getMyGroups,
    getPosts,
    getProfileCollectionByType,
    getProfileSummary,
    getProfileTimeline,
    getUploadedCompetitions,
    updateProfileSummary,
    uploadMediaBatch,
    type GroupSummary,
    type PostSummary,
    type ProfileCollectionItem,
    type ProfileGroupMembership,
    type ProfileSummaryResponse,
    type ProfileTimelineEntry,
    type UploadedCompetition,
} from '../../services/apiGateway'
import { getApiBaseUrl } from '../../constants/RuntimeConfig'
import { useFocusEffect } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import ProfileNewsSection, { type ProfileNewsItem } from '../../components/profileNews/ProfileNewsSection'
import SportFocusIcon from '../../components/profile/SportFocusIcon'
import SupportProfileSummary, { getSupportProfileBadgeLabel } from '../../components/profile/SupportProfileSummary'
import E2EPerfReady from '../../components/e2e/E2EPerfReady'
import {
    focusUsesChestNumbers,
    getDisciplineLabel,
    getMainDisciplineForFocus,
    getProfileCollectionScopeKey,
    getSportFocusLabel,
    normalizeMainDisciplines,
    normalizeProfileModeId,
    normalizeSelectedEvents,
    type ProfileModeId,
    type SportFocusId,
} from '../../utils/profileSelections'

type ProfileMembershipItem = {
    group_id: string;
    name: string;
    location: string;
    role: string | null;
    is_official_club: boolean;
    official_club_code: string | null;
};

const UserProfileScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const Styles = createStyles(colors);
    const { user, userProfile, authBootstrap, apiAccessToken, updateUserProfile } = useAuth();
    const perfStartedAtRef = useRef(Date.now());
    const defaultProfileImage = useMemo(() => {
        const googlePicture = String(user?.picture ?? '').trim();
        return googlePicture ? { uri: googlePicture } : Images.profilePic;
    }, [user?.picture]);
    const [activeTab, setActiveTab] = useState('photos');
    const [timelineItems, setTimelineItems] = useState<TimelineEntry[]>([]);
    const [profileTab, setProfileTab] = useState<'timeline' | 'activity' | 'collections' | 'downloads'>('timeline');
    const [blogEntries, setBlogEntries] = useState<any[]>([]);
    const [profileCategory, setProfileCategory] = useState<ProfileModeId | null>(null);
    const [showProfileSwitcherModal, setShowProfileSwitcherModal] = useState(false);
    const [pendingDeleteBlog, setPendingDeleteBlog] = useState<ProfileNewsItem | null>(null);
    const [isDeletingBlog, setIsDeletingBlog] = useState(false);
    const [profileImage, setProfileImage] = useState<any>(defaultProfileImage);
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
    const [isTimelineLoading, setIsTimelineLoading] = useState(false);
    const [hasLoadedTimeline, setHasLoadedTimeline] = useState(false);
    const [isActivityLoading, setIsActivityLoading] = useState(false);
    const [hasLoadedActivity, setHasLoadedActivity] = useState(false);
    const [isDownloadsLoading, setIsDownloadsLoading] = useState(false);
    const [hasLoadedDownloads, setHasLoadedDownloads] = useState(false);
    const [isCollectionsLoading, setIsCollectionsLoading] = useState(false);
    const [hasLoadedCollections, setHasLoadedCollections] = useState(false);
    const [websiteEditVisible, setWebsiteEditVisible] = useState(false);
    const [websiteDraft, setWebsiteDraft] = useState('');
    const [websiteSaveBusy, setWebsiteSaveBusy] = useState(false);

    const { width } = Dimensions.get('window');
    const showBackButton = Boolean(route?.params?.showBackButton) || String(route?.params?.origin || '').toLowerCase() === 'search';
    const imageWidth = Math.floor((width - 40 - 24 - 30) / 4);
    const selectedEventProfiles = useMemo(() => {
        const serverEvents = profileSummary?.profile?.selected_events;
        if (Array.isArray(serverEvents) && serverEvents.length > 0) {
            return serverEvents;
        }
        const localEvents = userProfile?.selectedEvents;
        return Array.isArray(localEvents) ? localEvents : [];
    }, [profileSummary?.profile?.selected_events, userProfile?.selectedEvents]);
    const selectedFocusesFromProfile = useMemo(
        () => normalizeSelectedEvents(selectedEventProfiles),
        [selectedEventProfiles],
    );
    const hasSupportProfile = useMemo(() => {
        return (
            String((profileSummary?.profile as any)?.support_role ?? (userProfile as any)?.supportRole ?? '').trim().length > 0 ||
            (Array.isArray((profileSummary?.profile as any)?.support_club_codes) && (profileSummary?.profile as any)?.support_club_codes.length > 0) ||
            (Array.isArray((profileSummary?.profile as any)?.support_group_ids) && (profileSummary?.profile as any)?.support_group_ids.length > 0) ||
            (Array.isArray((profileSummary?.profile as any)?.support_athlete_profile_ids) && (profileSummary?.profile as any)?.support_athlete_profile_ids.length > 0) ||
            (Array.isArray((profileSummary?.profile as any)?.support_focuses) && (profileSummary?.profile as any)?.support_focuses.length > 0) ||
            (Array.isArray((userProfile as any)?.supportClubCodes) && (userProfile as any)?.supportClubCodes.length > 0) ||
            (Array.isArray((userProfile as any)?.supportGroupIds) && (userProfile as any)?.supportGroupIds.length > 0) ||
            (Array.isArray((userProfile as any)?.supportAthleteProfileIds) && (userProfile as any)?.supportAthleteProfileIds.length > 0) ||
            (Array.isArray((userProfile as any)?.supportFocuses) && (userProfile as any)?.supportFocuses.length > 0) ||
            userProfile?.category === 'support'
        );
    }, [profileSummary?.profile, userProfile]);
    const selectedFocuses = useMemo(() => selectedFocusesFromProfile, [selectedFocusesFromProfile]);
    const bootstrapProfileId = String(authBootstrap?.profile_id ?? '').trim();
    const summaryProfileId = String(profileSummary?.profile_id ?? '').trim();
    const hasConcreteProfileRecord =
        summaryProfileId.length > 0 ||
        bootstrapProfileId.length > 0 ||
        authBootstrap?.has_profiles === true;
    const hasAnyLinkedProfiles = hasConcreteProfileRecord || selectedFocuses.length > 0 || myGroups.length > 0 || hasSupportProfile;
    const shouldShowEmptyProfileState = didLoadProfileData && !hasAnyLinkedProfiles;
    const perfReady = Boolean(profileImage) || (didLoadProfileData && (profileSummary !== null || shouldShowEmptyProfileState));
    const profileCategoryLabel = profileCategory ? (profileCategory === 'support' ? t('Support') : getSportFocusLabel(profileCategory, t)) : '';
    const collectionScopeKey = useMemo(() => {
        if (profileCategory) return getProfileCollectionScopeKey(profileCategory);
        if (selectedFocuses.length > 0) return getProfileCollectionScopeKey(selectedFocuses[0]);
        if (hasSupportProfile) return 'support';
        return 'default';
    }, [hasSupportProfile, profileCategory, selectedFocuses]);
    const showDownloadsTab = true;
    const renderFocusIcon = useCallback(
        (focusId: ProfileModeId, size: number = 20) => (
            <SportFocusIcon focusId={focusId} size={size} color={colors.primaryColor} />
        ),
        [colors.primaryColor],
    );

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

    const blogStorageKey = useMemo(() => {
        const key = user?.sub || userProfile?.username || user?.email || 'self';
        return `@profile_blogs_${key}`;
    }, [user?.email, user?.sub, userProfile?.username]);

    useEffect(() => {
        if (profileCategory === 'support' && hasSupportProfile) return;
        if (profileCategory && profileCategory !== 'support' && selectedFocuses.includes(profileCategory)) return;
        if (selectedFocuses.length > 0) {
            setProfileCategory(selectedFocuses[0]);
            return;
        }
        if (hasSupportProfile) {
            setProfileCategory('support');
            return;
        }
        if (profileCategory !== null) setProfileCategory(null);
    }, [hasSupportProfile, profileCategory, selectedFocuses]);

    const loadProfileShell = useCallback(async () => {
        const localChestByYear = normalizeChestByYear(userProfile?.chestNumbersByYear ?? {});
        setChestNumbersByYear(localChestByYear);
        setProfileImage(defaultProfileImage);
        if (apiAccessToken) {
            let shellReady = false;
            try {
                const summary = await getProfileSummary(apiAccessToken);
                setProfileSummary(summary);
                const serverChestByYear = normalizeChestByYear(summary?.profile?.chest_numbers_by_year ?? {});
                setChestNumbersByYear(serverChestByYear);
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
                    setProfileImage(defaultProfileImage);
                }
                shellReady = true;
            } catch {
                setProfileSummary(null);
                setProfileImage(defaultProfileImage);
            }
            if (!didLoadProfileData || shellReady) {
                setDidLoadProfileData(true);
            }
            try {
                const resp = await getMyGroups(apiAccessToken);
                setMyGroups(Array.isArray((resp as any)?.groups) ? (resp as any).groups : []);
            } catch {
                setMyGroups([]);
            }
        } else {
            setProfileSummary(null);
            setProfileImage(defaultProfileImage);
            setMyGroups([]);
            setDidLoadProfileData(true);
        }
    }, [
        apiAccessToken,
        defaultProfileImage,
        didLoadProfileData,
        normalizeChestByYear,
        toAbsoluteUrl,
        userProfile?.chestNumbersByYear,
        withAccessToken,
    ]);

    const loadTimelineTab = useCallback(async (force: boolean = false) => {
        if (!force && (hasLoadedTimeline || isTimelineLoading)) return;
        setIsTimelineLoading(true);
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
        setHasLoadedTimeline(true);
        setIsTimelineLoading(false);
    }, [
        apiAccessToken,
        hasLoadedTimeline,
        isTimelineLoading,
        resolveTimelineMediaThumb,
        t,
        toAbsoluteUrl,
        withAccessToken,
    ]);

    const loadActivityTab = useCallback(async (force: boolean = false) => {
        if (!force && (hasLoadedActivity || isActivityLoading)) return;
        setIsActivityLoading(true);
        const postsProfileId = profileSummary?.profile_id ? String(profileSummary.profile_id) : null;

        if (apiAccessToken && profileCategory === 'support') {
            try {
                const overview = await getHomeOverview(apiAccessToken, 'me');
                const feedPosts = Array.isArray(overview?.overview?.feed_posts) ? overview.overview.feed_posts : [];
                const mapped = [...feedPosts]
                    .sort((a: any, b: any) => {
                        const aTime = Date.parse(String(a?.post?.created_at ?? ''));
                        const bTime = Date.parse(String(b?.post?.created_at ?? ''));
                        return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
                    })
                    .map((entry: any) => {
                        const media = entry?.media ?? null;
                        const coverCandidate = media?.thumbnail_url || media?.preview_url || media?.full_url || media?.raw_url || null;
                        const resolved = coverCandidate ? toAbsoluteUrl(String(coverCandidate)) : null;
                        const rawPostType = String(entry?.post?.post_type ?? '').trim().toLowerCase();
                        return {
                            id: String(entry?.post?.id ?? ''),
                            kind: rawPostType === 'photo' || rawPostType === 'video' ? rawPostType : 'blog',
                            postId: String(entry?.post?.id ?? ''),
                            mediaId: String(media?.media_id ?? media?.id ?? '').trim() || null,
                            mediaType: media?.type === 'video' ? 'video' : (media?.media_id || media?.id ? 'image' : null),
                            title: String(entry?.post?.title ?? ''),
                            createdAt: entry?.post?.created_at ? String(entry.post.created_at) : null,
                            date: entry?.post?.created_at ? String(entry.post.created_at).slice(0, 10) : '',
                            description: String(entry?.post?.summary ?? entry?.post?.description ?? ''),
                            coverImage: resolved ? (withAccessToken(resolved) || resolved) : null,
                            canDelete: String(entry?.post?.author?.profile_id ?? '') === String(profileSummary?.profile_id ?? ''),
                        };
                    })
                    .filter((entry) => entry.id.length > 0);
                setBlogEntries(mapped);
            } catch {
                setBlogEntries([]);
            }
            setHasLoadedActivity(true);
            setIsActivityLoading(false);
            return;
        }

        if (apiAccessToken && postsProfileId) {
            try {
                const resp = await getPosts(apiAccessToken, {
                    author_profile_id: String(postsProfileId),
                    limit: 50,
                    include_original: false,
                });
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
                    const rawPostType = String((p as any)?.post_type ?? '').trim().toLowerCase();
                    const mediaCount = Number((p as any)?.media_count ?? 0);
                    const isUploading = mediaCount > 0 && !cover?.media_id;
                    return ({
                        id: String(p.id),
                        postId: String(p.id),
                        kind: rawPostType === 'photo' || rawPostType === 'video' ? rawPostType : 'blog',
                        mediaId: String(cover?.media_id ?? '').trim() || null,
                        mediaType: cover?.type === 'video' ? 'video' : (cover?.media_id ? 'image' : null),
                        title: String(p.title || ''),
                        createdAt: createdAtRaw ? String(createdAtRaw) : null,
                        date: createdAtRaw ? String(createdAtRaw).slice(0, 10) : '',
                        description: p.summary || p.description || '',
                        coverImage,
                        status: isUploading ? 'UPLOADING' : null,
                        likes_count: Number((p as any)?.likes_count ?? 0),
                        views_count: Number((p as any)?.views_count ?? 0),
                        canDelete: String((p as any)?.author?.profile_id ?? '') === String(postsProfileId),
                    });
                });
                setBlogEntries(mapped);
            } catch {
                setBlogEntries([]);
            }
        } else {
            setBlogEntries([]);
        }

        setHasLoadedActivity(true);
        setIsActivityLoading(false);
    }, [
        apiAccessToken,
        hasLoadedActivity,
        isActivityLoading,
        profileCategory,
        profileSummary?.profile_id,
        t,
        toAbsoluteUrl,
        withAccessToken,
    ]);

    const loadDownloadsTab = useCallback(async (force: boolean = false) => {
        if (!force && (hasLoadedDownloads || isDownloadsLoading)) return;
        setIsDownloadsLoading(true);
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
            try {
                const resp = await getUploadedCompetitions(apiAccessToken, { limit: 200 });
                setUploadedCompetitions(Array.isArray((resp as any)?.competitions) ? (resp as any).competitions : []);
            } catch {
                setUploadedCompetitions([]);
            }
        } else {
            setDownloadsSummary(null);
            setUploadedCompetitions([]);
        }
        setHasLoadedDownloads(true);
        setIsDownloadsLoading(false);
    }, [apiAccessToken, hasLoadedDownloads, isDownloadsLoading]);

    const loadCollections = useCallback(async (force: boolean = false) => {
        if (!force && (hasLoadedCollections || isCollectionsLoading)) return;
        setIsCollectionsLoading(true);
        if (!apiAccessToken || !hasAnyLinkedProfiles) {
            setPhotoCollectionItems([]);
            setVideoCollectionItems([]);
            setHasLoadedCollections(true);
            setIsCollectionsLoading(false);
            return;
        }
        try {
            const resp = await getProfileCollectionByType(apiAccessToken, 'image', {
                scope_key: collectionScopeKey,
                include_original: false,
            });
            setPhotoCollectionItems(Array.isArray((resp as any)?.items) ? (resp as any).items : []);
        } catch {
            setPhotoCollectionItems([]);
        }
        try {
            const resp = await getProfileCollectionByType(apiAccessToken, 'video', {
                scope_key: collectionScopeKey,
                include_original: false,
            });
            setVideoCollectionItems(Array.isArray((resp as any)?.items) ? (resp as any).items : []);
        } catch {
            setVideoCollectionItems([]);
        }
        setHasLoadedCollections(true);
        setIsCollectionsLoading(false);
    }, [apiAccessToken, collectionScopeKey, hasAnyLinkedProfiles, hasLoadedCollections, isCollectionsLoading]);

    useFocusEffect(
        useCallback(() => {
            void loadProfileShell();
            if (profileTab === 'timeline') setHasLoadedTimeline(false);
            if (profileTab === 'activity') setHasLoadedActivity(false);
            if (profileTab === 'downloads') setHasLoadedDownloads(false);
            if (profileTab === 'collections') setHasLoadedCollections(false);
        }, [loadProfileShell, profileTab]),
    );

    useEffect(() => {
        setPhotoCollectionItems([]);
        setVideoCollectionItems([]);
        setHasLoadedCollections(false);
    }, [collectionScopeKey]);

    useEffect(() => {
        if (!didLoadProfileData || !hasAnyLinkedProfiles) return;
        if (profileTab === 'timeline') {
            void loadTimelineTab();
            return;
        }
        if (profileTab === 'activity') {
            void loadActivityTab();
            return;
        }
        if (profileTab === 'downloads' && showDownloadsTab) {
            void loadDownloadsTab();
            return;
        }
        if (profileTab === 'collections') {
            void loadCollections();
        }
    }, [
        didLoadProfileData,
        hasAnyLinkedProfiles,
        loadActivityTab,
        loadCollections,
        loadDownloadsTab,
        loadTimelineTab,
        profileTab,
        showDownloadsTab,
    ]);

    const openAddTimeline = () => {
        navigation.navigate('ProfileTimelineEditScreen', {
            mode: 'add',
            storageKey: timelineStorageKey,
            blogStorageKey,
            competitionOptions,
            collectionScopeKey,
        });
    };

    const openEditTimeline = (item: TimelineEntry) => {
        navigation.navigate('ProfileTimelineEditScreen', {
            mode: 'edit',
            storageKey: timelineStorageKey,
            item,
            blogStorageKey,
            competitionOptions,
            collectionScopeKey,
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
            collectionScopeKey,
        });
    };

    const setCategory = useCallback((value: ProfileModeId) => {
        if (value === 'support') {
            if (!hasSupportProfile) return;
            setProfileCategory('support');
            return;
        }
        if (!selectedFocuses.includes(value)) return;
        setProfileCategory(value);
    }, [hasSupportProfile, selectedFocuses]);

    const openProfileMenu = () => {
        setShowProfileSwitcherModal(true);
    };

    const handleHeaderAction = useCallback(() => {
        if (!hasConcreteProfileRecord) {
            navigation.navigate('CategorySelectionScreen', { fromAddFlow: true });
            return;
        }
        openProfileMenu();
    }, [hasConcreteProfileRecord, navigation]);

    useEffect(() => {
        const shouldOpen = Boolean(route?.params?.openProfileSwitcher);
        if (!shouldOpen) return;
        setShowProfileSwitcherModal(true);
        navigation.setParams?.({ openProfileSwitcher: false });
    }, [navigation, route?.params?.openProfileSwitcher]);

    useEffect(() => {
        const forcedCategory = normalizeProfileModeId(route?.params?.forceProfileCategory);
        if (!forcedCategory) return;
        setCategory(forcedCategory);
        navigation.setParams?.({ forceProfileCategory: undefined });
    }, [navigation, route?.params?.forceProfileCategory, setCategory]);

    const e2eAvatarFixtureFile = useMemo(() => {
        const raw = route?.params?.e2eAvatarFixtureFile;
        if (!raw || typeof raw !== 'object') return null;
        const uri = String((raw as any)?.uri || '').trim();
        if (!uri) return null;
        return {
            uri,
            type: String((raw as any)?.type || 'image/jpeg').trim(),
            name: String((raw as any)?.name || `avatar-${Date.now()}.jpg`).trim(),
        };
    }, [route?.params?.e2eAvatarFixtureFile]);

    const handleProfileImageChange = async () => {
        let asset: { uri: string; type?: string; fileName?: string } | null = null;
        if (e2eAvatarFixtureFile) {
            asset = {
                uri: e2eAvatarFixtureFile.uri,
                type: e2eAvatarFixtureFile.type,
                fileName: e2eAvatarFixtureFile.name,
            };
        } else {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                selectionLimit: 1,
                presentationStyle: 'fullScreen',
                assetRepresentationMode: 'current',
            });
            asset = result?.assets?.[0] ?? null;
        }
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
                skip_profile_collection: true,
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

    const normalizeMembership = useCallback((entry: Partial<GroupSummary & ProfileGroupMembership> | null | undefined): ProfileMembershipItem | null => {
        if (!entry || typeof entry !== 'object') return null;
        const groupId = String((entry as any)?.group_id ?? (entry as any)?.id ?? '').trim();
        const name = String((entry as any)?.name ?? '').trim();
        if (!groupId || !name) return null;
        const location = String((entry as any)?.location ?? '').trim();
        const roleRaw = String((entry as any)?.role ?? (entry as any)?.my_role ?? '').trim();
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
        const merged = new Map<string, ProfileMembershipItem>();
        const summaryGroups = Array.isArray((profileSummary?.profile as any)?.groups)
            ? ((profileSummary?.profile as any)?.groups as Array<Partial<ProfileGroupMembership>>)
            : [];
        const allGroups = [...summaryGroups, ...(myGroups || [])];
        allGroups.forEach((entry) => {
            const normalized = normalizeMembership(entry as any);
            if (!normalized) return;
            const existing = merged.get(normalized.group_id);
            if (!existing) {
                merged.set(normalized.group_id, normalized);
                return;
            }
            merged.set(normalized.group_id, {
                ...existing,
                location: existing.location || normalized.location,
                role: existing.role || normalized.role,
                is_official_club: existing.is_official_club || normalized.is_official_club,
                official_club_code: existing.official_club_code || normalized.official_club_code,
            });
        });
        return Array.from(merged.values()).sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
        );
    }, [myGroups, normalizeMembership, profileSummary?.profile]);

    const communityMemberships = useMemo(
        () => profileMemberships.filter((entry) => !entry.is_official_club),
        [profileMemberships],
    );
    const officialMemberships = useMemo(
        () => profileMemberships.filter((entry) => entry.is_official_club),
        [profileMemberships],
    );
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
    const profileMainDisciplines = useMemo(
        () => normalizeMainDisciplines(
            (profileSummary as any)?.profile?.main_disciplines ?? (userProfile as any)?.mainDisciplines ?? {},
            {
                trackFieldMainEvent,
                roadTrailMainEvent,
            },
        ),
        [profileSummary, roadTrailMainEvent, trackFieldMainEvent, userProfile],
    );
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
    const supportRole = useMemo(
        () => String((profileSummary?.profile as any)?.support_role ?? (userProfile as any)?.supportRole ?? '').trim(),
        [profileSummary?.profile, userProfile],
    );
    const supportProfileBadgeLabel = useMemo(
        () => getSupportProfileBadgeLabel(supportRole, t),
        [supportRole, t],
    );
    const supportFocuses = useMemo(
        () => normalizeSelectedEvents((profileSummary?.profile as any)?.support_focuses ?? (userProfile as any)?.supportFocuses ?? []),
        [profileSummary?.profile, userProfile],
    );
    const supportClubs = useMemo(() => {
        const hydrated = Array.isArray((profileSummary?.profile as any)?.support_clubs)
            ? (profileSummary?.profile as any)?.support_clubs
            : Array.isArray((userProfile as any)?.supportClubs)
                ? (userProfile as any)?.supportClubs
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
    }, [profileSummary?.profile, userProfile]);
    const supportGroups = useMemo(() => {
        const hydrated = Array.isArray((profileSummary?.profile as any)?.support_groups)
            ? (profileSummary?.profile as any)?.support_groups
            : Array.isArray((userProfile as any)?.supportGroups)
                ? (userProfile as any)?.supportGroups
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
    }, [profileSummary?.profile, userProfile]);
    const directTrackFieldClub = useMemo(() => {
        const hydrated = (profileSummary?.profile as any)?.track_field_club_detail ?? (userProfile as any)?.trackFieldClubDetail ?? null;
        const hydratedName = String(hydrated?.name ?? '').trim();
        const raw = String((profileSummary?.profile as any)?.track_field_club ?? userProfile?.trackFieldClub ?? '').trim();
        const title = hydratedName || raw;
        if (!title) return null;
        return {
            id: String(hydrated?.code ?? raw).trim() || title,
            title,
            subtitle: [String(hydrated?.city ?? '').trim(), String(hydrated?.federation ?? '').trim()].filter(Boolean).join(' · '),
        };
    }, [profileSummary?.profile, userProfile]);
    const runningClubGroup = useMemo(() => {
        const hydrated = (profileSummary?.profile as any)?.running_club_group ?? (userProfile as any)?.runningClubGroup ?? null;
        const groupId = String(hydrated?.group_id ?? '').trim();
        const name = String(hydrated?.name ?? '').trim();
        if (!groupId || !name) return null;
        return {
            id: groupId,
            title: name,
            subtitle: [String(hydrated?.role ?? '').trim(), String(hydrated?.location ?? '').trim()].filter(Boolean).join(' · '),
        };
    }, [profileSummary?.profile, userProfile]);

    const profileDistance = useMemo(() => {
        const activeFocus = profileCategory && profileCategory !== 'support' ? profileCategory : selectedFocuses[0] ?? null;
        if (!activeFocus) return '';
        const disciplineKey = getMainDisciplineForFocus(profileMainDisciplines, activeFocus, {
            trackFieldMainEvent,
            roadTrailMainEvent,
        });
        if (!disciplineKey) return '';
        return getDisciplineLabel(activeFocus, disciplineKey, t);
    }, [profileCategory, profileMainDisciplines, roadTrailMainEvent, selectedFocuses, t, trackFieldMainEvent]);
    const athleteProfileCategory = useMemo<SportFocusId | null>(
        () => (profileCategory && profileCategory !== 'support' ? profileCategory : null),
        [profileCategory],
    );
    const formatMetaDisplayValue = useCallback((value: string) => {
        const trimmed = String(value || '').trim();
        if (trimmed.length <= 11) return trimmed;
        return `${trimmed.slice(0, 11)}...`;
    }, []);

    const visibleOfficialClubs = useMemo(() => {
        if (profileCategory === 'support') return supportClubs;
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
    }, [directTrackFieldClub, officialMemberships, profileCategory, supportClubs]);
    const visibleGroups = useMemo(() => {
        if (profileCategory === 'support') return supportGroups;
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
    }, [communityMemberships, profileCategory, runningClubGroup, supportGroups]);
    const singleOfficialClub = visibleOfficialClubs.length === 1 ? visibleOfficialClubs[0] : null;
    const singleCommunityGroup = visibleGroups.length === 1 ? visibleGroups[0] : null;
    const profileMetaItems = useMemo(() => {
        const baseItems = profileCategory === 'support'
            ? []
            : [
                { key: 'nationality', value: profileNationality },
                { key: 'chest', value: athleteProfileCategory && focusUsesChestNumbers(athleteProfileCategory) ? currentChestNumber : '' },
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
        athleteProfileCategory,
        currentChestNumber,
        formatMetaDisplayValue,
        profileCategory,
        profileDistance,
        profileNationality,
        singleCommunityGroup?.title,
        singleOfficialClub?.title,
    ]);

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
        const normalizedSummary = fromSummary.toLowerCase();
        const isPlaceholderSummary =
            !fromSummary ||
            normalizedSummary === 'new user' ||
            normalizedSummary === 'newuser' ||
            normalizedSummary.includes('|') ||
            normalizedSummary.endsWith('.auth@allin.local');
        if (!isPlaceholderSummary) return fromSummary;

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
        const raw = String(profileSummary?.profile?.bio ?? userProfile?.bio ?? '').trim();
        if (!raw) return t('Write your bio...');
        const normalizedRaw = raw.replace(/^@+/, '').trim().toLowerCase();
        const normalizedHandle = profileHandle.trim().toLowerCase();
        if (normalizedHandle.length > 0 && normalizedRaw === normalizedHandle) {
            return t('Write your bio...');
        }
        return raw;
    }, [profileHandle, profileSummary?.profile?.bio, t, userProfile?.bio]);

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
        if (cents == null || !Number.isFinite(Number(cents))) return '-';
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

        const newsItems: ProfileNewsItem[] = blogEntries.map((entry) => ({
            id: String(entry.id),
            kind: entry.kind === 'photo' || entry.kind === 'video' ? entry.kind : 'blog',
            postId: String(entry.postId ?? entry.id),
            mediaId: entry.mediaId ? String(entry.mediaId) : null,
            mediaType: entry.mediaType === 'video' ? 'video' : entry.mediaType === 'image' ? 'image' : null,
            title: String(entry.title || ''),
            sortAt: entry.createdAt ? String(entry.createdAt) : (entry.date ? String(entry.date) : null),
            date: entry.createdAt ? toDateLabel(String(entry.createdAt)) : (entry.date ? String(entry.date) : ''),
            description: entry.description ? String(entry.description) : '',
            coverImage: entry.coverImage ? String(entry.coverImage) : null,
            status: entry.status ? String(entry.status) : null,
            canDelete: entry.canDelete !== false,
        }));

        return newsItems.sort((a, b) => {
            const aDate = toTimestamp(a.sortAt ?? a.date ?? null);
            const bDate = toTimestamp(b.sortAt ?? b.date ?? null);
            if (bDate !== aDate) return bDate - aDate;
            return String(b.id).localeCompare(String(a.id));
        });
    }, [blogEntries]);

    const handleSwipeDeleteBlog = useCallback((item: ProfileNewsItem) => {
        if (item.canDelete === false) return;
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

    const handlePressActivityItem = useCallback((item: ProfileNewsItem) => {
        if (item.kind === 'photo' && item.mediaId) {
            navigation.navigate('PhotoDetailScreen', {
                eventTitle: item.title,
                media: {
                    id: item.mediaId,
                    type: 'image',
                },
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
    }, [navigation]);

    if (shouldShowEmptyProfileState) {
        return (
            <View style={Styles.mainContainer} testID="user-profile-empty-state">
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
                    <View style={Styles.headerSpacer} />
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
        <View style={Styles.mainContainer} testID="user-profile-screen">
            <E2EPerfReady screen="profile" ready={perfReady} startedAtMs={perfStartedAtRef.current} />
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
                <TouchableOpacity style={Styles.headerButton} onPress={handleHeaderAction}>
                    {shouldShowEmptyProfileState ? (
                        <Add size={24} color={colors.primaryColor} variant="Linear" />
                    ) : (
                        <User size={24} color={colors.primaryColor} variant="Linear" />
                    )}
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
                                testID="profile-avatar-button"
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
                                            {profileCategory ? renderFocusIcon(profileCategory, 24) : null}
                                            <Text style={Styles.statLabel}>{profileCategory === 'support' ? supportProfileBadgeLabel : profileCategoryLabel}</Text>
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
                            <TouchableOpacity testID="profile-edit-bio-button" onPress={() => navigation.navigate('EditBioScreens')}>
                                <Edit2 size={16} color={colors.mainTextColor} variant="Linear" />
                            </TouchableOpacity>
                        </View>
                        <Text style={Styles.bioText}>
                            {profileBioText}
                        </Text>
                        <View style={Styles.bioDivider} />
                    </View>
                    {profileCategory === 'support' ? (
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
                            <Text style={Styles.membershipTitle}>{t(profileCategory === 'support' ? 'Groups' : 'Community groups')}</Text>
                            <View style={Styles.membershipWrap}>
                                {visibleGroups.map((group) => (
                                    <TouchableOpacity
                                        key={group.id}
                                        style={Styles.membershipChip}
                                        activeOpacity={0.85}
                                        onPress={() => navigation.navigate('GroupProfileScreen', {
                                            groupId: group.id,
                                            showBackButton: true,
                                            origin: 'profile',
                                        })}
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
                    !hasLoadedTimeline && timelineItems.length === 0 ? (
                        <View style={Styles.tabLoadingContainer}>
                            <ActivityIndicator size="small" color={colors.primaryColor} />
                            <SizeBox height={12} />
                            <Text style={Styles.emptyProfileSubtitle}>{t('Loading timeline...')}</Text>
                        </View>
                    ) : (
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
                    )
                )}

                {profileTab === 'activity' && (
                    !hasLoadedActivity && activityItems.length === 0 ? (
                        <View style={Styles.tabLoadingContainer}>
                            <ActivityIndicator size="small" color={colors.primaryColor} />
                            <SizeBox height={12} />
                            <Text style={Styles.emptyProfileSubtitle}>{t('Loading news...')}</Text>
                        </View>
                    ) : (
                        <ProfileNewsSection
                            styles={Styles}
                            sectionTitle={t('News')}
                            actionLabel={profileCategory === 'support' ? undefined : t('Add blog')}
                            onPressAction={profileCategory === 'support' ? undefined : (() => openBlogEditor())}
                            enableSwipeDelete={profileCategory !== 'support'}
                            onSwipeDelete={handleSwipeDeleteBlog}
                            items={activityItems}
                            emptyText={profileCategory === 'support' ? t('No news yet.') : t('No news yet. Publish a blog or add media to your news page.')}
                            blogLabel={t('Blog')}
                            photoLabel={t('Photo')}
                            videoLabel={t('Video')}
                            onPressItem={handlePressActivityItem}
                        />
                    )
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

                            {!hasLoadedCollections && photoCollectionItems.length === 0 && videoCollectionItems.length === 0 ? (
                                <View style={Styles.tabLoadingContainer}>
                                    <ActivityIndicator size="small" color={colors.primaryColor} />
                                    <SizeBox height={12} />
                                    <Text style={Styles.emptyProfileSubtitle}>{t('Loading collections...')}</Text>
                                </View>
                            ) : activeTab === 'photos' ? (
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
                                navigation.navigate('EditPhotoCollectionsScreen', { collectionScopeKey });
                            } else {
                                navigation.navigate('EditVideoCollectionsScreen', { collectionScopeKey });
                            }
                        }}>
                            <Text style={Styles.mainEditButtonText}>{t('Edit')}</Text>
                            <Edit2 size={18} color="#FFFFFF" variant="Linear" />
                        </TouchableOpacity>
                    </>
                )}

                {profileTab === 'downloads' && showDownloadsTab && (
                    !hasLoadedDownloads && downloadsSummary === null && uploadedCompetitions.length === 0 ? (
                        <View style={Styles.tabLoadingContainer}>
                            <ActivityIndicator size="small" color={colors.primaryColor} />
                            <SizeBox height={12} />
                            <Text style={Styles.emptyProfileSubtitle}>{t('Loading downloads...')}</Text>
                        </View>
                    ) : (
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
                                            {downloadsSummary ? String(downloadsSummary.total_downloads) : '-'}
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
                                        {downloadsSummary ? String(downloadsSummary.total_views) : '-'}
                                    </Text>
                                </View>
                                <View style={Styles.earningsCard}>
                                    <Text style={Styles.earningsLabel}>{t('Profit')}</Text>
                                    <Text style={Styles.earningsValue}>
                                        {downloadsSummary ? formatMoney(downloadsSummary.total_profit_cents ?? 0) : '-'}
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
                    )
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

                        {selectedFocuses.map((focusId) => (
                            <TouchableOpacity
                                key={focusId}
                                style={Styles.profileSwitcherRow}
                                onPress={() => {
                                    setCategory(focusId);
                                    setShowProfileSwitcherModal(false);
                                }}
                            >
                                <View style={Styles.profileSwitcherAvatar}>
                                    {renderFocusIcon(focusId, 20)}
                                </View>
                                <Text style={Styles.profileSwitcherLabel}>{getSportFocusLabel(focusId, t)}</Text>
                                <Text style={Styles.profileSwitcherCheck}>{profileCategory === focusId ? '✓' : ''}</Text>
                            </TouchableOpacity>
                        ))}

                        {hasSupportProfile ? (
                            <TouchableOpacity
                                style={Styles.profileSwitcherRow}
                                onPress={() => {
                                    setCategory('support');
                                    setShowProfileSwitcherModal(false);
                                }}
                            >
                                <View style={Styles.profileSwitcherAvatar}>
                                    {renderFocusIcon('support', 20)}
                                </View>
                                <Text style={Styles.profileSwitcherLabel}>{t('Support')}</Text>
                                <Text style={Styles.profileSwitcherCheck}>{profileCategory === 'support' ? '✓' : ''}</Text>
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
                                        navigation.navigate('GroupProfileScreen', {
                                            groupId: group.id,
                                            showBackButton: true,
                                            origin: 'profile',
                                        });
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
