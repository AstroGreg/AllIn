import { View, Text, TouchableOpacity, ScrollView, Dimensions, Platform, ActionSheetIOS, Modal } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import SizeBox from '../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FastImage from 'react-native-fast-image'
import Images from '../../constants/Images'
import Icons from '../../constants/Icons'
import { useTheme } from '../../context/ThemeContext'
import { createStyles } from './UserProfileStyles'
import { ArrowLeft2, User, Edit2, Trash, Clock, ArrowRight, DocumentText, Gallery, DocumentDownload, Location, VideoSquare } from 'iconsax-react-nativejs'
import { launchImageLibrary } from 'react-native-image-picker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ProfileTimeline, { TimelineEntry } from '../../components/profileTimeline/ProfileTimeline'
import { useAuth } from '../../context/AuthContext'
import { getMediaById } from '../../services/apiGateway'
import { getApiBaseUrl } from '../../constants/RuntimeConfig'
import { useFocusEffect } from '@react-navigation/native'

const UserProfileScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { user, userProfile, apiAccessToken } = useAuth();
    const [activeTab, setActiveTab] = useState('photos');
    const [timelineItems, setTimelineItems] = useState<TimelineEntry[]>([]);
    const [profileTab, setProfileTab] = useState<'timeline' | 'activity' | 'collections' | 'downloads'>('timeline');
    const [blogEntries, setBlogEntries] = useState<any[]>([]);
    const [profileCategory, setProfileCategory] = useState<'Track&Field' | 'Road&Trail'>('Track&Field');
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [profileImage, setProfileImage] = useState<any>(Images.profile1);
    const photoIds = useMemo(
        () => [
            '87873d40-addf-4289-aa82-7cd300acdd94',
            '4ac31817-e954-4d22-934d-27f82ddf5163',
            '4fed0d64-9fd4-42c4-bf24-875aad683c6d',
        ],
        [],
    );
    const [photoMap, setPhotoMap] = useState<Record<string, string>>({});

    const { width } = Dimensions.get('window');
    const imageWidth = Math.floor((width - 40 - 24 - 30) / 4);

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

    const defaultBlogs = useMemo(() => ([
        {
            id: 'blog-1',
            title: 'IFAM Outdoor Oordegem',
            date: '09/08/2025',
            description: "Elias took part in the 800m and achieved a time close to his best 1'50\"99.",
            media: [],
        },
        {
            id: 'blog-2',
            title: 'BK 10000m AC Duffel',
            date: '09/06/2025',
            description: 'This race meant everything to me. Running the European Championships on home soil.',
            media: [],
        },
    ]), []);

    const loadProfileData = useCallback(async () => {
        const storedTimeline = await AsyncStorage.getItem(timelineStorageKey);
        if (storedTimeline) {
            try {
                const parsed = JSON.parse(storedTimeline);
                if (Array.isArray(parsed)) {
                    const normalized = parsed.map((entry) => ({
                        ...entry,
                        photos: Array.isArray(entry.photos) ? entry.photos : [],
                        linkedBlogs: Array.isArray(entry.linkedBlogs) ? entry.linkedBlogs : [],
                        linkedCompetitions: Array.isArray(entry.linkedCompetitions) ? entry.linkedCompetitions : [],
                    }));
                    setTimelineItems(normalized);
                }
            } catch {
                setTimelineItems(defaultTimeline);
            }
        } else {
            await AsyncStorage.setItem(timelineStorageKey, JSON.stringify(defaultTimeline));
            setTimelineItems(defaultTimeline);
        }

        const storedBlogs = await AsyncStorage.getItem(blogStorageKey);
        if (storedBlogs) {
            try {
                const parsed = JSON.parse(storedBlogs);
                if (Array.isArray(parsed)) {
                    setBlogEntries(parsed);
                    return;
                }
            } catch {
                // ignore
            }
        }
        await AsyncStorage.setItem(blogStorageKey, JSON.stringify(defaultBlogs));
        setBlogEntries(defaultBlogs);

        const storedCategory = await AsyncStorage.getItem(categoryStorageKey);
        if (storedCategory === 'Road&Trail' || storedCategory === 'Track&Field') {
            setProfileCategory(storedCategory);
        }
    }, [blogStorageKey, defaultBlogs, defaultTimeline, timelineStorageKey]);

    useFocusEffect(
        useCallback(() => {
            loadProfileData();
        }, [loadProfileData]),
    );

    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken) return () => {};
        const isSignedUrl = (value?: string | null) => {
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
        };
        const withAccessToken = (value?: string | null) => {
            if (!value) return undefined;
            if (!apiAccessToken) return value;
            if (isSignedUrl(value)) return value;
            if (value.includes('access_token=')) return value;
            const sep = value.includes('?') ? '&' : '?';
            return `${value}${sep}access_token=${encodeURIComponent(apiAccessToken)}`;
        };
        const toAbsoluteUrl = (value?: string | null) => {
            if (!value) return null;
            const raw = String(value);
            if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
            const base = getApiBaseUrl();
            if (!base) return raw;
            return `${base.replace(/\/$/, '')}/${raw.replace(/^\//, '')}`;
        };

        Promise.all(
            photoIds.map(async (id) => {
                const media = await getMediaById(apiAccessToken, id);
                const thumbCandidate =
                    media.thumbnail_url || media.preview_url || media.full_url || media.raw_url || null;
                const resolved = thumbCandidate ? toAbsoluteUrl(String(thumbCandidate)) : null;
                return [id, withAccessToken(resolved) || resolved] as const;
            }),
        )
            .then((entries) => {
                if (!mounted) return;
                const map: Record<string, string> = {};
                entries.forEach(([id, url]) => {
                    if (url) map[id] = url;
                });
                setPhotoMap(map);
            })
            .catch(() => {});

        return () => {
            mounted = false;
        };
    }, [apiAccessToken, photoIds]);

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

    const deleteBlog = useCallback(async (entryId: string) => {
        const updated = blogEntries.filter((item) => item.id !== entryId);
        setBlogEntries(updated);
        await AsyncStorage.setItem(blogStorageKey, JSON.stringify(updated));
    }, [blogEntries, blogStorageKey]);

    const showDownloadsTab = true;

    const collections = [
        { id: 1, imgUrl: Images.photo1 },
        { id: 2, imgUrl: Images.photo3 },
        { id: 3, imgUrl: Images.photo4 },
        { id: 4, imgUrl: Images.photo5 },
    ];

    const collectionVideos = [
        { id: 1, thumbnail: Images.photo1, title: '17:45 / MIN-M (Series)', author: 'Smith', duration: '5:06 mins' },
        { id: 2, thumbnail: Images.photo3, title: '17:45 / MIN-M (Series)', author: 'Smith', duration: '5:06 mins' },
    ];


    const events = [
        {
            id: 1,
            image: photoMap[photoIds[0]] ? { uri: photoMap[photoIds[0]] } : null,
            title: 'City Run Marathon',
            status: 'Subscribed',
            media: '254 videos',
            location: 'Dhaka',
            date: '27/05/2025',
        },
        {
            id: 2,
            image: photoMap[photoIds[1]] ? { uri: photoMap[photoIds[1]] } : null,
            title: 'City Run Marathon',
            status: 'Completed',
            media: '48 videos',
            location: 'Dhaka',
            date: '27/05/2025',
        },
    ];

    const competitionOptions = useMemo(
        () => events.map((entry) => entry.title).filter(Boolean),
        [events],
    );

    const uploadedCompetitions = useMemo(
        () => [
            {
                id: 'uc1',
                title: 'PK 400m Limburg 2025',
                location: 'Limburg, Belgium',
                date: '04/02/2026',
                competitionType: 'track',
                uploads: 14,
                image: photoMap[photoIds[0]] ? { uri: photoMap[photoIds[0]] } : null,
            },
            {
                id: 'uc2',
                title: 'Sunrise 10K Community Run',
                location: 'Brussels, Belgium',
                date: '27/05/2025',
                competitionType: 'road',
                uploads: 9,
                image: photoMap[photoIds[1]] ? { uri: photoMap[photoIds[1]] } : null,
            },
            {
                id: 'uc3',
                title: 'BK Studentent 23',
                location: 'Ghent, Belgium',
                date: '16/03/2025',
                competitionType: 'track',
                uploads: 6,
                image: photoMap[photoIds[2]] ? { uri: photoMap[photoIds[2]] } : null,
            },
            {
                id: 'uc4',
                title: 'IFAM 2024',
                location: 'Brussels, Belgium',
                date: '27/05/2025',
                competitionType: 'track',
                uploads: 11,
                image: photoMap[photoIds[0]] ? { uri: photoMap[photoIds[0]] } : null,
            },
            {
                id: 'uc5',
                title: 'Brussels City Run 2026',
                location: 'Brussels, Belgium',
                date: '12/06/2026',
                competitionType: 'road',
                uploads: 8,
                image: photoMap[photoIds[1]] ? { uri: photoMap[photoIds[1]] } : null,
            },
            {
                id: 'uc6',
                title: 'Indoor Classic 2026',
                location: 'Antwerp, Belgium',
                date: '11/01/2026',
                competitionType: 'track',
                uploads: 5,
                image: photoMap[photoIds[2]] ? { uri: photoMap[photoIds[2]] } : null,
            },
        ],
        [photoIds, photoMap],
    );
    const previewCompetitions = useMemo(
        () => uploadedCompetitions.slice(0, 5),
        [uploadedCompetitions],
    );


    const activityItems = useMemo(() => {
        const blogItems = blogEntries.map((entry) => ({
            ...entry,
            type: 'blog',
        }));
        const eventItems = events.map((entry) => ({
            ...entry,
            type: 'event',
        }));
        return [...blogItems, ...eventItems];
    }, [blogEntries, events]);


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
                            <Text style={Styles.activityEventSubtitle}>Subscribed competition</Text>
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
                        <Text style={Styles.activityBadgeText}>Blog</Text>
                    </View>
                </View>
                <Text style={Styles.activityMeta}>{item.date}</Text>
                <Text style={Styles.activityDescription} numberOfLines={2}>
                    {item.description}
                </Text>
                <View style={Styles.activityActionsRow}>
                    <TouchableOpacity style={Styles.activityAction} onPress={() => openBlogEditor(item)}>
                        <Text style={Styles.activityActionText}>Edit</Text>
                        <Edit2 size={16} color="#FFFFFF" variant="Linear" />
                    </TouchableOpacity>
                    <TouchableOpacity style={Styles.activityDelete} onPress={() => deleteBlog(item.id)}>
                        <Text style={Styles.activityDeleteText}>Delete</Text>
                        <Trash size={16} color="#ED5454" variant="Linear" />
                    </TouchableOpacity>
                </View>
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
                <Text style={Styles.headerTitle}>Profile</Text>
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
                                    <Text style={Styles.statValue}>1.2K</Text>
                                    <Text style={Styles.statLabel}>Posts</Text>
                                </View>
                                <View style={Styles.statDivider} />
                                <View style={Styles.statItem}>
                                    <Text style={Styles.statValue}>45.8K</Text>
                                    <Text style={Styles.statLabel}>Followers</Text>
                                </View>
                            </View>
                        </View>
                        <View style={Styles.profileCategoryOnly}>
                            <Icons.TrackFieldLogo width={28} height={24} />
                            <Text style={Styles.profileCategoryText}>{profileCategory}</Text>
                        </View>
                    </View>

                    {/* Bio Section */}
                    <View style={Styles.bioSection}>
                        <View style={Styles.bioHeader}>
                            <Text style={Styles.bioTitle}>Bio</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('EditBioScreens')}>
                                <Edit2 size={16} color={colors.mainTextColor} variant="Linear" />
                            </TouchableOpacity>
                        </View>
                        <Text style={Styles.bioText}>
                            Passionate photographer capturing life's most authentic moments through the lens.
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
                        <Text style={[Styles.profileTabText, profileTab === 'timeline' && Styles.profileTabTextActive]}>Timeline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[Styles.profileTab, profileTab === 'activity' && Styles.profileTabActive]}
                        onPress={() => setProfileTab('activity')}
                    >
                        <DocumentText size={18} color={profileTab === 'activity' ? colors.primaryColor : colors.grayColor} variant="Linear" />
                        <Text style={[Styles.profileTabText, profileTab === 'activity' && Styles.profileTabTextActive]}>News</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[Styles.profileTab, profileTab === 'collections' && Styles.profileTabActive]}
                        onPress={() => setProfileTab('collections')}
                    >
                        <Gallery size={18} color={profileTab === 'collections' ? colors.primaryColor : colors.grayColor} variant="Linear" />
                        <Text style={[Styles.profileTabText, profileTab === 'collections' && Styles.profileTabTextActive]}>Collections</Text>
                    </TouchableOpacity>
                    {showDownloadsTab && (
                        <TouchableOpacity
                            style={[Styles.profileTab, profileTab === 'downloads' && Styles.profileTabActive]}
                            onPress={() => setProfileTab('downloads')}
                        >
                            <DocumentDownload size={18} color={profileTab === 'downloads' ? colors.primaryColor : colors.grayColor} variant="Linear" />
                            <Text style={[Styles.profileTabText, profileTab === 'downloads' && Styles.profileTabTextActive]}>Downloads</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {profileTab === 'timeline' && (
                    <ProfileTimeline
                        title="Timeline"
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
                            <Text style={Styles.sectionTitle}>News</Text>
                            <TouchableOpacity onPress={() => openBlogEditor()}>
                                <Text style={Styles.viewAllText}>Add blog</Text>
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
                                <Text style={Styles.sectionTitle}>Collections</Text>
                                <TouchableOpacity onPress={() => {
                                    if (activeTab === 'photos') {
                                        navigation.navigate('ViewUserCollectionsPhotosScreen');
                                    } else if (activeTab === 'videos') {
                                        navigation.navigate('ViewUserCollectionsVideosScreen');
                                    }
                                }}>
                                    <Text style={Styles.viewAllText}>View All</Text>
                                </TouchableOpacity>
                            </View>
                            <SizeBox height={16} />

                            <View style={Styles.toggleContainer}>
                                <TouchableOpacity
                                    style={[Styles.toggleButton, activeTab === 'photos' && Styles.toggleButtonActive]}
                                    onPress={() => setActiveTab('photos')}
                                >
                                    <Text style={activeTab === 'photos' ? Styles.toggleTextActive : Styles.toggleText}>Photos</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[Styles.toggleButton, activeTab === 'videos' && Styles.toggleButtonActive]}
                                    onPress={() => setActiveTab('videos')}
                                >
                                    <Text style={activeTab === 'videos' ? Styles.toggleTextActive : Styles.toggleText}>Videos</Text>
                                </TouchableOpacity>
                            </View>

                            <SizeBox height={16} />

                            {activeTab === 'photos' ? (
                                <View style={Styles.collectionsCard}>
                                    <View style={Styles.collectionsGrid}>
                                {collections.map((item, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        activeOpacity={0.85}
                                        onPress={() =>
                                            navigation.navigate('PhotoDetailScreen', {
                                                eventTitle: 'Collections',
                                                media: {
                                                    id: photoIds[index % photoIds.length],
                                                    type: 'photo',
                                                },
                                            })
                                        }
                                    >
                                        <FastImage
                                            source={item.imgUrl}
                                            style={[Styles.collectionImage, { width: imageWidth }]}
                                            resizeMode="cover"
                                        />
                                    </TouchableOpacity>
                                ))}
                                    </View>
                                </View>
                            ) : (
                                <View style={Styles.videosGrid}>
                                    {collectionVideos.map((video, index) => (
                                        <TouchableOpacity
                                            key={video.id}
                                            style={Styles.videoCard}
                                            activeOpacity={0.85}
                                            onPress={() =>
                                                navigation.navigate('VideoPlayingScreen', {
                                                    video: {
                                                        title: video.title,
                                                        subtitle: video.title,
                                                        thumbnail: video.thumbnail,
                                                    },
                                                })
                                            }
                                        >
                                            <View style={Styles.videoThumbnailContainer}>
                                                <FastImage source={video.thumbnail} style={Styles.videoThumbnail} resizeMode="cover" />
                                                <View style={Styles.videoPlayIconContainer}>
                                                    <Icons.PlayCricle width={26} height={26} />
                                                </View>
                                            </View>
                                            <Text style={Styles.videoCardTitle}>{video.title}</Text>
                                            <View style={Styles.videoCardMeta}>
                                                <View style={Styles.videoMetaItem}>
                                                    <User size={12} color="#9B9F9F" variant="Linear" />
                                                    <Text style={Styles.videoMetaText}>{video.author}</Text>
                                                </View>
                                                <View style={Styles.videoMetaItem}>
                                                    <Clock size={12} color="#9B9F9F" variant="Linear" />
                                                    <Text style={Styles.videoMetaText}>{video.duration}</Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
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
                            <Text style={Styles.mainEditButtonText}>Edit</Text>
                            <Edit2 size={18} color="#FFFFFF" variant="Linear" />
                        </TouchableOpacity>
                    </>
                )}

                {profileTab === 'downloads' && showDownloadsTab && (
                    <View style={Styles.downloadsSection}>
                        <Text style={Styles.sectionTitle}>Downloads</Text>
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
                                    <Text style={Styles.downloadsText}>Total downloads: </Text>
                                    <Text style={Styles.downloadsTextBold}>1,204</Text>
                                </Text>
                            </View>
                            <View style={Styles.downloadsDetailsButton}>
                                <Text style={Styles.downloadsDetailsButtonText}>Details</Text>
                                <ArrowRight size={18} color="#9B9F9F" variant="Linear" />
                            </View>
                        </TouchableOpacity>
                        <View style={Styles.earningsRow}>
                            <View style={Styles.earningsCard}>
                                <Text style={Styles.earningsLabel}>Views</Text>
                                <Text style={Styles.earningsValue}>18.4K</Text>
                            </View>
                            <View style={Styles.earningsCard}>
                                <Text style={Styles.earningsLabel}>Profit</Text>
                                <Text style={Styles.earningsValue}>€482</Text>
                            </View>
                        </View>
                        <View style={Styles.downloadAnalyticsSection}>
                            <View style={Styles.sectionHeader}>
                                <Text style={Styles.downloadAnalyticsTitle}>Competitions</Text>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('DownloadsDetailsScreen', { mode: 'competitions' })}
                                >
                                    <Text style={Styles.viewAllText}>View more</Text>
                                </TouchableOpacity>
                            </View>
                            {previewCompetitions.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={Styles.competitionCard}
                                    activeOpacity={0.85}
                                    onPress={() =>
                                        navigation.navigate('DownloadsDetailsScreen', {
                                            mode: 'competition-media',
                                            competition: item,
                                        })
                                    }
                                >
                                    {item.image ? (
                                        <FastImage source={item.image} style={Styles.competitionThumb} resizeMode="cover" />
                                    ) : (
                                        <View style={Styles.competitionThumbPlaceholder} />
                                    )}
                                    <View style={Styles.competitionInfo}>
                                        <Text style={Styles.competitionTitle}>{item.title}</Text>
                                        <Text style={Styles.competitionMeta}>
                                            {item.uploads} uploads • {item.date}
                                        </Text>
                                        <Text style={Styles.competitionMetaSecondary}>{item.location}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                            {previewCompetitions.length === 0 && (
                                <Text style={Styles.emptyText}>No competitions found.</Text>
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
                            <Text style={Styles.categoryModalTitle}>Switch category</Text>
                            <SizeBox height={12} />
                            <TouchableOpacity
                                style={Styles.categoryOption}
                                onPress={() => {
                                    setCategory('Track&Field');
                                    setShowCategoryModal(false);
                                }}
                            >
                                <Text style={Styles.categoryOptionText}>Track&Field</Text>
                            </TouchableOpacity>
                            <View style={Styles.categoryOptionDivider} />
                            <TouchableOpacity
                                style={Styles.categoryOption}
                                onPress={() => {
                                    setCategory('Road&Trail');
                                    setShowCategoryModal(false);
                                }}
                            >
                                <Text style={Styles.categoryOptionText}>Road&Trail</Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </Modal>
            )}

        </View>
    );
};

export default UserProfileScreen;
