import { View, Text, TouchableOpacity, ScrollView, Dimensions, Platform, ActionSheetIOS, Modal, ActivityIndicator, Alert, TextInput } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import SizeBox from '../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FastImage from 'react-native-fast-image'
import Images from '../../constants/Images'
import Icons from '../../constants/Icons'
import { useTheme } from '../../context/ThemeContext'
import { createStyles } from './UserProfileStyles'
import { ArrowLeft2, User, Edit2, Clock, ArrowRight, DocumentText, Gallery, DocumentDownload, ArrowDown2 } from 'iconsax-react-nativejs'
import { launchImageLibrary } from 'react-native-image-picker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ProfileTimeline, { TimelineEntry } from '../../components/profileTimeline/ProfileTimeline'
import { useAuth } from '../../context/AuthContext'
import { deletePost, getDownloadsSummary, getPosts, getProfileCollectionByType, getProfileSummary, getProfileTimeline, getUploadedCompetitions, updateProfileSummary, uploadMediaBatch, type PostSummary, type ProfileCollectionItem, type ProfileSummaryResponse, type ProfileTimelineEntry, type UploadedCompetition } from '../../services/apiGateway'
import { getApiBaseUrl } from '../../constants/RuntimeConfig'
import { useFocusEffect } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import ProfileNewsSection, { type ProfileNewsItem } from '../../components/profileNews/ProfileNewsSection'

const UserProfileScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const Styles = createStyles(colors);
    const { user, userProfile, apiAccessToken, updateUserProfile } = useAuth();
    const [activeTab, setActiveTab] = useState('photos');
    const [timelineItems, setTimelineItems] = useState<TimelineEntry[]>([]);
    const [profileTab, setProfileTab] = useState<'timeline' | 'activity' | 'collections' | 'downloads'>('timeline');
    const [blogEntries, setBlogEntries] = useState<any[]>([]);
    const [profileCategory, setProfileCategory] = useState<'Track&Field' | 'Road&Trail'>('Track&Field');
    const [showProfileMenuModal, setShowProfileMenuModal] = useState(false);
    const [pendingDeleteBlog, setPendingDeleteBlog] = useState<ProfileNewsItem | null>(null);
    const [isDeletingBlog, setIsDeletingBlog] = useState(false);
    const [profileImage, setProfileImage] = useState<any>(Images.profile1);
    const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
    const [downloadsSummary, setDownloadsSummary] = useState<{ total_downloads: number; total_views: number; total_profit_cents?: number } | null>(
        null,
    );
    const [profileSummary, setProfileSummary] = useState<ProfileSummaryResponse | null>(null);
    const currentYear = useMemo(() => String(new Date().getFullYear()), []);
    const currentYearNumber = useMemo(() => Number(currentYear), [currentYear]);
    const [chestYearInput, setChestYearInput] = useState<string>(currentYear);
    const [showChestYearModal, setShowChestYearModal] = useState(false);
    const [chestNumberInput, setChestNumberInput] = useState<string>('');
    const [chestNumbersByYear, setChestNumbersByYear] = useState<Record<string, string>>({});
    const [isSavingChestNumber, setIsSavingChestNumber] = useState(false);
    const [showSaveFailedModal, setShowSaveFailedModal] = useState(false);
    const [photoCollectionItems, setPhotoCollectionItems] = useState<ProfileCollectionItem[]>([]);
    const [videoCollectionItems, setVideoCollectionItems] = useState<ProfileCollectionItem[]>([]);
    const [uploadedCompetitions, setUploadedCompetitions] = useState<UploadedCompetition[]>([]);

    const { width } = Dimensions.get('window');
    const imageWidth = Math.floor((width - 40 - 24 - 30) / 4);
    const profileCategoryLabel = profileCategory === 'Road&Trail' ? t('roadAndTrail') : t('trackAndField');
    const chestYearOptions = useMemo(
        () => Array.from({ length: Math.max(0, currentYearNumber - 2000 + 1) }, (_, i) => String(2000 + i)),
        [currentYearNumber],
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

    const getChestForYear = useCallback((year: string, source: Record<string, string>) => {
        const safeYear = String(year || '').trim();
        if (/^\d{4}$/.test(safeYear) && source[safeYear] != null) {
            return String(source[safeYear]);
        }
        return '';
    }, []);

    const isSignedUrl = useCallback((value?: string | null) => {
        if (!value) return false;
        const lower = String(value).toLowerCase();
        return (
            lower.includes('x-amz-signature') ||
            lower.includes('x-amz-credential') ||
            lower.includes('x-amz-security-token') ||
            lower.includes('signature=') ||
            lower.includes('token=') ||
            lower.includes('expires=')
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
                setChestNumberInput(getChestForYear(chestYearInput, serverChestByYear));
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
                setChestNumberInput(getChestForYear(chestYearInput, localChestByYear));
            }
        } else {
            setProfileSummary(null);
            const localChestByYear = normalizeChestByYear(userProfile?.chestNumbersByYear ?? {});
            setChestNumbersByYear(localChestByYear);
            setChestNumberInput(getChestForYear(chestYearInput, localChestByYear));
        }

        // News/blogs: server-driven (no more local dummy list)
        const postsProfileId = summaryProfileId;
        if (apiAccessToken && postsProfileId) {
            try {
                const resp = await getPosts(apiAccessToken, { author_profile_id: String(postsProfileId), limit: 50 });
                const posts = Array.isArray((resp as any)?.posts) ? (resp as any).posts : [];
                const sortedPosts = [...posts].sort((a: PostSummary, b: PostSummary) => {
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
                const mapped = sortedPosts.map((p: PostSummary) => {
                    const cover = (p as any)?.cover_media || null;
                    const coverCandidate = cover?.thumbnail_url || cover?.preview_url || cover?.full_url || cover?.raw_url || null;
                    const resolved = coverCandidate ? toAbsoluteUrl(String(coverCandidate)) : null;
                    const coverImage = resolved ? (withAccessToken(resolved) || resolved) : null;
                    return ({
                        id: String(p.id),
                        title: String(p.title || ''),
                        date: p.created_at ? String(p.created_at).slice(0, 10) : '',
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
        } else {
            setUploadedCompetitions([]);
        }
    }, [
        apiAccessToken,
        categoryStorageKey,
        chestYearInput,
        getChestForYear,
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

    useEffect(() => {
        setChestNumberInput(getChestForYear(chestYearInput, chestNumbersByYear));
    }, [chestNumbersByYear, chestYearInput, getChestForYear]);

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

    const setCategory = async (value: 'Track&Field' | 'Road&Trail') => {
        setProfileCategory(value);
        await AsyncStorage.setItem(categoryStorageKey, value);
    };

    const openProfileMenu = () => {
        if (Platform.OS === 'ios') {
            const options = [
                t('cancel'),
                `${t('Switch to')} ${t('trackAndField')}`,
                `${t('Switch to')} ${t('roadAndTrail')}`,
                t('Add profile'),
                t('Add group'),
            ];
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options,
                    cancelButtonIndex: 0,
                },
                (buttonIndex) => {
                    if (buttonIndex === 1) setCategory('Track&Field');
                    if (buttonIndex === 2) setCategory('Road&Trail');
                    if (buttonIndex === 3) navigation.navigate('SelectCategoryScreen');
                    if (buttonIndex === 4) navigation.navigate('CreateGroupProfileScreen');
                },
            );
        } else {
            setShowProfileMenuModal(true);
        }
    };

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

    const handleSaveChestNumber = useCallback(async () => {
        if (!apiAccessToken) return;
        const year = String(chestYearInput || '').trim();
        if (!/^\d{4}$/.test(year)) {
            setShowSaveFailedModal(true);
            return;
        }
        const trimmed = String(chestNumberInput || '').trim();
        const nextChest = trimmed.length > 0 ? Number(trimmed) : null;
        if (nextChest != null && (!Number.isInteger(nextChest) || nextChest < 0)) {
            setShowSaveFailedModal(true);
            return;
        }
        const nextByYear: Record<string, string> = { ...chestNumbersByYear };
        if (nextChest == null) {
            delete nextByYear[year];
        } else {
            nextByYear[year] = String(nextChest);
        }
        const payloadByYear: Record<string, number> = Object.entries(nextByYear).reduce((acc, [k, v]) => {
            const parsed = Number(v);
            if (/^\d{4}$/.test(String(k)) && Number.isInteger(parsed) && parsed >= 0) {
                acc[String(k)] = parsed;
            }
            return acc;
        }, {} as Record<string, number>);
        setIsSavingChestNumber(true);
        try {
            const updated = await updateProfileSummary(apiAccessToken, {
                chest_numbers_by_year: payloadByYear,
            });
            setProfileSummary(updated);
            const storedByYear = normalizeChestByYear(updated?.profile?.chest_numbers_by_year ?? payloadByYear);
            setChestNumbersByYear(storedByYear);
            setChestNumberInput(getChestForYear(year, storedByYear));
            await updateUserProfile({ chestNumbersByYear: storedByYear });
        } catch {
            setShowSaveFailedModal(true);
        } finally {
            setIsSavingChestNumber(false);
        }
    }, [
        apiAccessToken,
        chestNumberInput,
        chestNumbersByYear,
        chestYearInput,
        getChestForYear,
        normalizeChestByYear,
        updateUserProfile,
    ]);

    const showDownloadsTab = true;
    const savedChestByYear = useMemo(
        () => normalizeChestByYear(profileSummary?.profile?.chest_numbers_by_year ?? {}),
        [normalizeChestByYear, profileSummary?.profile?.chest_numbers_by_year],
    );
    const savedChestNumberForYear = getChestForYear(chestYearInput, savedChestByYear);
    const canSaveChestNumber =
        !isSavingChestNumber &&
        /^\d{4}$/.test(String(chestYearInput || '').trim()) &&
        String(chestNumberInput).trim() !== String(savedChestNumberForYear).trim();

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
        return blogEntries.map((entry) => ({
            id: String(entry.id),
            title: String(entry.title || ''),
            date: entry.date ? String(entry.date) : '',
            description: entry.description ? String(entry.description) : '',
            coverImage: entry.coverImage ? String(entry.coverImage) : null,
        }));
    }, [blogEntries]);

    const handleSwipeDeleteBlog = useCallback((item: ProfileNewsItem) => {
        setPendingDeleteBlog(item);
    }, []);

    const confirmDeleteBlog = useCallback(async () => {
        if (!apiAccessToken || !pendingDeleteBlog || isDeletingBlog) return;
        setIsDeletingBlog(true);
        try {
            await deletePost(apiAccessToken, String(pendingDeleteBlog.id));
            setBlogEntries((prev) => prev.filter((entry) => String(entry.id) !== String(pendingDeleteBlog.id)));
            setPendingDeleteBlog(null);
        } catch {
            Alert.alert(t('Error'), t('Could not delete this post.'));
        } finally {
            setIsDeletingBlog(false);
        }
    }, [apiAccessToken, isDeletingBlog, pendingDeleteBlog, t]);


    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
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
                                    <Text style={Styles.statValue}>{formatCount(profileSummary?.posts_count ?? blogEntries.length)}</Text>
                                    <Text style={Styles.statLabel}>{t('Posts')}</Text>
                                </View>
                                <View style={Styles.statDivider} />
                                <View style={Styles.statItem}>
                                    <Text style={Styles.statValue}>{formatCount(profileSummary?.followers_count ?? 0)}</Text>
                                    <Text style={Styles.statLabel}>{t('Followers')}</Text>
                                </View>
                                <View style={Styles.statDivider} />
                                <View style={Styles.statItem}>
                                    <Icons.TrackFieldLogo width={28} height={24} />
                                    <Text style={Styles.statLabel}>{profileCategoryLabel}</Text>
                                </View>
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
                            {profileSummary?.profile?.bio
                                ? String(profileSummary.profile.bio)
                                : t('Write your bio...')}
                        </Text>
                        <View style={Styles.bioDivider} />
                    </View>
                    <View style={Styles.chestNumberSection}>
                        <Text style={Styles.chestNumberLabel}>{t('chestNumber')}</Text>
                        <View style={Styles.chestNumberRow}>
                            <TouchableOpacity
                                style={Styles.chestYearPickerButton}
                                activeOpacity={0.85}
                                onPress={() => {
                                    if (!isSavingChestNumber) setShowChestYearModal(true);
                                }}
                            >
                                <Text style={Styles.chestYearPickerText}>{chestYearInput}</Text>
                                <ArrowDown2 size={14} color={colors.subTextColor} variant="Linear" />
                            </TouchableOpacity>
                            <TextInput
                                value={chestNumberInput}
                                onChangeText={(value) => setChestNumberInput(String(value || '').replace(/[^0-9]/g, ''))}
                                keyboardType="number-pad"
                                placeholder={t('chestNumber')}
                                placeholderTextColor={colors.subTextColor}
                                style={Styles.chestNumberInput}
                                editable={!isSavingChestNumber}
                                returnKeyType="done"
                                onSubmitEditing={handleSaveChestNumber}
                            />
                            <TouchableOpacity
                                style={[
                                    Styles.chestNumberSaveButton,
                                    !canSaveChestNumber && Styles.chestNumberSaveButtonDisabled,
                                ]}
                                disabled={!canSaveChestNumber}
                                onPress={handleSaveChestNumber}
                            >
                                {isSavingChestNumber ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={Styles.chestNumberSaveText}>{t('save')}</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

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
                        onPressItem={(item) => {
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
                                            {Number(item.uploads_count ?? 0)} {t('uploads')} • {formatEventDate(item.event_date)}
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

            {Platform.OS !== 'ios' && (
                <Modal
                    visible={showProfileMenuModal}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowProfileMenuModal(false)}
                >
                    <TouchableOpacity
                        style={Styles.categoryModalBackdrop}
                        activeOpacity={1}
                        onPress={() => setShowProfileMenuModal(false)}
                    >
                        <TouchableOpacity
                            activeOpacity={1}
                            style={Styles.categoryModalCard}
                            onPress={() => {}}
                        >
                            <Text style={Styles.categoryModalTitle}>{t('Profile options')}</Text>
                            <SizeBox height={12} />
                            <TouchableOpacity
                                style={Styles.categoryOption}
                                onPress={() => {
                                    setCategory('Track&Field');
                                    setShowProfileMenuModal(false);
                                }}
                            >
                                <Text style={Styles.categoryOptionText}>{`${t('Switch to')} ${t('trackAndField')}`}</Text>
                            </TouchableOpacity>
                            <View style={Styles.categoryOptionDivider} />
                            <TouchableOpacity
                                style={Styles.categoryOption}
                                onPress={() => {
                                    setCategory('Road&Trail');
                                    setShowProfileMenuModal(false);
                                }}
                            >
                                <Text style={Styles.categoryOptionText}>{`${t('Switch to')} ${t('roadAndTrail')}`}</Text>
                            </TouchableOpacity>
                            <View style={Styles.categoryOptionDivider} />
                            <TouchableOpacity
                                style={Styles.categoryOption}
                                onPress={() => {
                                    setShowProfileMenuModal(false);
                                    navigation.navigate('SelectCategoryScreen');
                                }}
                            >
                                <Text style={Styles.categoryOptionText}>{t('Add profile')}</Text>
                            </TouchableOpacity>
                            <View style={Styles.categoryOptionDivider} />
                            <TouchableOpacity
                                style={Styles.categoryOption}
                                onPress={() => {
                                    setShowProfileMenuModal(false);
                                    navigation.navigate('CreateGroupProfileScreen');
                                }}
                            >
                                <Text style={Styles.categoryOptionText}>{t('Add group')}</Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </Modal>
            )}

            <Modal
                visible={showChestYearModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowChestYearModal(false)}
            >
                <TouchableOpacity
                    style={Styles.categoryModalBackdrop}
                    activeOpacity={1}
                    onPress={() => setShowChestYearModal(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={Styles.categoryModalCard}
                        onPress={() => {}}
                    >
                        <Text style={Styles.categoryModalTitle}>{t('year')}</Text>
                        <SizeBox height={8} />
                        <ScrollView style={Styles.chestYearList}>
                            {chestYearOptions.map((year) => {
                                const active = year === chestYearInput;
                                return (
                                    <TouchableOpacity
                                        key={`chest-year-${year}`}
                                        style={Styles.chestYearOption}
                                        onPress={() => {
                                            setChestYearInput(year);
                                            setShowChestYearModal(false);
                                        }}
                                    >
                                        <Text style={[Styles.chestYearOptionText, active && Styles.chestYearOptionTextActive]}>
                                            {year}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            <Modal
                visible={showSaveFailedModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowSaveFailedModal(false)}
            >
                <TouchableOpacity
                    style={Styles.categoryModalBackdrop}
                    activeOpacity={1}
                    onPress={() => setShowSaveFailedModal(false)}
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
                        <Text style={Styles.categoryModalTitle}>{t('Save failed')}</Text>
                        <SizeBox height={8} />
                        <Text style={[Styles.emptyStateText, { textAlign: 'center' }]}>
                            {t('Please try again')}
                        </Text>
                        <SizeBox height={12} />
                        <TouchableOpacity
                            style={[Styles.categoryOption, { borderRadius: 10 }]}
                            onPress={() => setShowSaveFailedModal(false)}
                        >
                            <Text style={Styles.categoryOptionText}>{t('Cancel')}</Text>
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

        </View>
    );
};

export default UserProfileScreen;
