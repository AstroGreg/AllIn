import { View, Text, TouchableOpacity, ScrollView, Dimensions, Platform, ActionSheetIOS, Modal } from 'react-native'
import React, { useCallback, useMemo, useState } from 'react'
import SizeBox from '../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FastImage from 'react-native-fast-image'
import Images from '../../constants/Images'
import Icons from '../../constants/Icons'
import { useTheme } from '../../context/ThemeContext'
import { createStyles } from './UserProfileStyles'
import { ArrowLeft2, User, Edit2, Clock, ArrowRight, DocumentText, Gallery, DocumentDownload, Location, VideoSquare } from 'iconsax-react-nativejs'
import { launchImageLibrary } from 'react-native-image-picker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ProfileTimeline, { TimelineEntry } from '../../components/profileTimeline/ProfileTimeline'
import { useAuth } from '../../context/AuthContext'
import { getDownloadsSummary, getPosts, getProfileCollectionByType, getProfileSummary, getProfileTimeline, getUploadedCompetitions, type PostSummary, type ProfileCollectionItem, type ProfileSummaryResponse, type ProfileTimelineEntry, type UploadedCompetition } from '../../services/apiGateway'
import { getApiBaseUrl } from '../../constants/RuntimeConfig'
import { useFocusEffect } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'

const UserProfileScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const Styles = createStyles(colors);
    const { user, userProfile, apiAccessToken } = useAuth();
    const [activeTab, setActiveTab] = useState('photos');
    const [timelineItems, setTimelineItems] = useState<TimelineEntry[]>([]);
    const [profileTab, setProfileTab] = useState<'timeline' | 'activity' | 'collections' | 'downloads'>('timeline');
    const [blogEntries, setBlogEntries] = useState<any[]>([]);
    const [profileCategory, setProfileCategory] = useState<'Track&Field' | 'Road&Trail'>('Track&Field');
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [profileImage, setProfileImage] = useState<any>(Images.profile1);
    const [downloadsSummary, setDownloadsSummary] = useState<{ total_downloads: number; total_views: number; total_profit_cents?: number } | null>(
        null,
    );
    const [profileSummary, setProfileSummary] = useState<ProfileSummaryResponse | null>(null);
    const [photoCollectionItems, setPhotoCollectionItems] = useState<ProfileCollectionItem[]>([]);
    const [videoCollectionItems, setVideoCollectionItems] = useState<ProfileCollectionItem[]>([]);
    const [uploadedCompetitions, setUploadedCompetitions] = useState<UploadedCompetition[]>([]);

    const { width } = Dimensions.get('window');
    const imageWidth = Math.floor((width - 40 - 24 - 30) / 4);
    const profileCategoryLabel = profileCategory === 'Road&Trail' ? t('roadAndTrail') : t('trackAndField');

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

    const timelineStorageKey = useMemo(() => {
        const key = user?.sub || userProfile?.username || user?.email || 'self';
        return `@profile_timeline_${key}`;
    }, [user?.email, user?.sub, userProfile?.username]);
    const categoryStorageKey = useMemo(() => {
        const key = user?.sub || userProfile?.username || user?.email || 'self';
        return `@profile_category_${key}`;
    }, [user?.email, user?.sub, userProfile?.username]);

    const defaultTimeline = useMemo<TimelineEntry[]>(
        () => ([
            {
                id: 'tl-2017',
                year: '2017',
                title: 'First national meet',
                description: 'Debuted on the national stage and qualified for finals.',
                highlight: '800m 1:54.30',
            },
            {
                id: 'tl-2021',
                year: '2021',
                title: 'U23 breakthrough',
                description: 'Podium finish and personal bests across the season.',
                highlight: 'PB 400m 47.90',
            },
            {
                id: 'tl-2024',
                year: '2024',
                title: 'Signed with pro team',
                description: 'Joined an elite training group ahead of the Olympic cycle.',
                highlight: 'Top 5 EU',
            },
        ]),
        [],
    );

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
                summaryProfileId = summary?.profile_id ? String(summary.profile_id) : null;
                if (summary?.profile?.avatar_url) {
                    const resolved = toAbsoluteUrl(String(summary.profile.avatar_url));
                    const withToken = withAccessToken(resolved) || resolved;
                    if (withToken) {
                        setProfileImage({ uri: withToken });
                    }
                }
            } catch {
                setProfileSummary(null);
            }
        } else {
            setProfileSummary(null);
        }

        // News/blogs: server-driven (no more local dummy list)
        const postsProfileId = summaryProfileId || (userProfile as any)?.id || null;
        if (apiAccessToken && postsProfileId) {
            try {
                const resp = await getPosts(apiAccessToken, { author_profile_id: String(postsProfileId), limit: 50 });
                const posts = Array.isArray((resp as any)?.posts) ? (resp as any).posts : [];
                const mapped = posts.map((p: PostSummary) => ({
                    id: String(p.id),
                    title: String(p.title || ''),
                    date: p.created_at ? String(p.created_at).slice(0, 10) : '',
                    description: p.summary || p.description || '',
                    media: [],
                }));
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
        blogStorageKey,
        categoryStorageKey,
        timelineStorageKey,
        toAbsoluteUrl,
        withAccessToken,
        userProfile?.id,
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
            ownerName: user?.name ?? 'Profile',
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

    const openCategorySwitch = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Cancel', 'Track&Field', 'Road&Trail'],
                    cancelButtonIndex: 0,
                },
                (buttonIndex) => {
                    if (buttonIndex === 1) setCategory('Track&Field');
                    if (buttonIndex === 2) setCategory('Road&Trail');
                },
            );
        } else {
            setShowCategoryModal(true);
        }
    };

    const handleProfileImageChange = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            selectionLimit: 1,
        });
        if (result?.assets?.length) {
            const asset = result.assets[0];
            if (asset?.uri) {
                setProfileImage({ uri: asset.uri });
            }
        }
    };

    const showDownloadsTab = true;

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


    const activityItems = useMemo(() => {
        return blogEntries.map((entry) => ({
            ...entry,
            type: 'blog',
        }));
    }, [blogEntries]);


    const renderActivityCard = (item: any) => {
        const isBlog = item.type === 'blog';
        if (!isBlog) {
            return (
                <TouchableOpacity
                    key={`${item.type}-${item.id}`}
                    style={Styles.activityEventCard}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('PhotosScreen', { eventTitle: item.title })}
                >
                    <View style={Styles.activityEventRow}>
                        {item.image ? (
                            <FastImage source={item.image} style={Styles.activityEventThumb} resizeMode="cover" />
                        ) : (
                            <View style={Styles.activityEventThumbPlaceholder} />
                        )}
                        <View style={Styles.activityEventInfo}>
                            <View style={Styles.activityHeader}>
                                <Text style={Styles.activityTitle}>{item.title}</Text>
                                <View
                                    style={[
                                        Styles.activityStatusBadge,
                                        item.status === 'Completed' ? Styles.activityStatusDone : Styles.activityStatusActive,
                                    ]}
                                >
                                    <Text style={Styles.activityStatusText}>{item.status}</Text>
                                </View>
                            </View>
                            <Text style={Styles.activityEventSubtitle}>{t('Subscribed competition')}</Text>
                            <View style={Styles.activityEventMetaRow}>
                                <VideoSquare size={14} color={colors.grayColor} variant="Linear" />
                                <Text style={Styles.activityEventMetaText}>{item.media}</Text>
                                <View style={Styles.activityEventDot} />
                                <Location size={14} color={colors.grayColor} variant="Linear" />
                                <Text style={Styles.activityEventMetaText}>{item.location}</Text>
                            </View>
                            <Text style={Styles.activityEventMetaText}>{item.date}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            );
        }
        return (
            <TouchableOpacity
                key={`${item.type}-${item.id}`}
                style={Styles.activityCard}
                activeOpacity={0.85}
                onPress={() => {
                    navigation.navigate('ViewUserBlogDetailsScreen', {
                        post: {
                            title: item.title,
                            date: item.date,
                            image: Images.photo1,
                            readCount: '1k',
                            writer: 'James Ray',
                            writerImage: Images.profile1,
                            description: item.description,
                            galleryItems: (item.media || []).map((media: any) => ({
                                image: { uri: media.uri },
                                type: media.type,
                                videoUri: media.type === 'video' ? media.uri : undefined,
                            })),
                        },
                    });
                }}
            >
                <View style={Styles.activityHeader}>
                    <Text style={Styles.activityTitle}>{item.title}</Text>
                    <View style={[Styles.activityBadge, Styles.activityBadgeBlog]}>
                        <Text style={Styles.activityBadgeText}>{t('Blog')}</Text>
                    </View>
                </View>
                <Text style={Styles.activityMeta}>{item.date}</Text>
                <Text style={Styles.activityDescription} numberOfLines={2}>
                    {item.description}
                </Text>
            </TouchableOpacity>
        );
    };


    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{t('Profile')}</Text>
                <TouchableOpacity style={Styles.headerButton} onPress={openCategorySwitch}>
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
                            </View>
                        </View>
                        <View style={Styles.profileCategoryOnly}>
                            <Icons.TrackFieldLogo width={28} height={24} />
                            <Text style={Styles.profileCategoryText}>{profileCategoryLabel}</Text>
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
                    <View style={Styles.activitySection}>
                        <View style={Styles.sectionHeader}>
                            <Text style={Styles.sectionTitle}>{t('News')}</Text>
                            <TouchableOpacity onPress={() => openBlogEditor()}>
                                <Text style={Styles.viewAllText}>{t('Add blog')}</Text>
                            </TouchableOpacity>
                        </View>
                        <SizeBox height={16} />
                        {activityItems.map(renderActivityCard)}
                    </View>
                )}

                {profileTab === 'collections' && (
                    <>
                        <View style={Styles.collectionsSection}>
                            <View style={Styles.sectionHeader}>
                                <Text style={Styles.sectionTitle}>{t('Collections')}</Text>
                                <TouchableOpacity onPress={() => {
                                    if (activeTab === 'photos') {
                                        navigation.navigate('ViewUserCollectionsPhotosScreen', { initialTab: 'photos' });
                                    } else if (activeTab === 'videos') {
                                        navigation.navigate('ViewUserCollectionsVideosScreen', { initialTab: 'videos' });
                                    }
                                }}>
                                    <Text style={Styles.viewAllText}>{t('View all')}</Text>
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
                    visible={showCategoryModal}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowCategoryModal(false)}
                >
                    <TouchableOpacity
                        style={Styles.categoryModalBackdrop}
                        activeOpacity={1}
                        onPress={() => setShowCategoryModal(false)}
                    >
                        <TouchableOpacity
                            activeOpacity={1}
                            style={Styles.categoryModalCard}
                            onPress={() => {}}
                        >
                            <Text style={Styles.categoryModalTitle}>{t('Switch category')}</Text>
                            <SizeBox height={12} />
                            <TouchableOpacity
                                style={Styles.categoryOption}
                                onPress={() => {
                                    setCategory('Track&Field');
                                    setShowCategoryModal(false);
                                }}
                            >
                                <Text style={Styles.categoryOptionText}>{t('trackAndField')}</Text>
                            </TouchableOpacity>
                            <View style={Styles.categoryOptionDivider} />
                            <TouchableOpacity
                                style={Styles.categoryOption}
                                onPress={() => {
                                    setCategory('Road&Trail');
                                    setShowCategoryModal(false);
                                }}
                            >
                                <Text style={Styles.categoryOptionText}>{t('roadAndTrail')}</Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </Modal>
            )}

        </View>
    );
};

export default UserProfileScreen;
