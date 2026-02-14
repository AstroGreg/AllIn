import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { createStyles } from './ViewUserProfileStyles'
import SizeBox from '../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FastImage from 'react-native-fast-image'
import Images from '../../constants/Images'
import Icons from '../../constants/Icons'
import { useTheme } from '../../context/ThemeContext'
import {
    ArrowLeft2,
    User,
    SearchNormal1,
    Clock,
    DocumentText,
    Gallery,
    Location,
    VideoSquare,
} from 'iconsax-react-nativejs'
import ShareModal from '../../components/shareModal/ShareModal'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ProfileTimeline, { TimelineEntry } from '../../components/profileTimeline/ProfileTimeline'
import { useAuth } from '../../context/AuthContext'
import { getMediaById } from '../../services/apiGateway'
import { getApiBaseUrl } from '../../constants/RuntimeConfig'

const ViewUserProfileScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const [activeTab, setActiveTab] = useState('photos');
    const [showShareModal, setShowShareModal] = useState(false);
    const [timelineItems, setTimelineItems] = useState<TimelineEntry[]>([]);
    const [profileTab, setProfileTab] = useState<'timeline' | 'activity' | 'collections'>('timeline');
    const { apiAccessToken } = useAuth();
    const photoIds = useMemo(
        () => [
            '87873d40-addf-4289-aa82-7cd300acdd94',
            '4ac31817-e954-4d22-934d-27f82ddf5163',
            '4fed0d64-9fd4-42c4-bf24-875aad683c6d',
        ],
        [],
    );
    const [photoMap, setPhotoMap] = useState<Record<string, string>>({});

    const profileKey = useMemo(() => {
        const user = route?.params?.user;
        return (
            user?.id ||
            user?.user_id ||
            user?.username ||
            user?.name ||
            route?.params?.profileKey ||
            'public'
        );
    }, [route?.params?.profileKey, route?.params?.user]);

    const timelineStorageKey = useMemo(() => `@profile_timeline_${profileKey}`, [profileKey]);

    const defaultTimeline = useMemo<TimelineEntry[]>(
        () => ([
            {
                id: 'tl-2016',
                year: '2016',
                title: 'Started athletics',
                description: 'Joined the local track club and began structured training.',
                highlight: 'First medal',
            },
            {
                id: 'tl-2020',
                year: '2020',
                title: 'National finals',
                description: 'Competed in national finals and set new personal bests.',
                highlight: 'PB 10.60',
            },
            {
                id: 'tl-2025',
                year: '2025',
                title: 'Sunrise 10K',
                description: 'Top 10 finish at the Sunrise 10K Community Run.',
                highlight: 'Top 10',
            },
        ]),
        [],
    );

    useEffect(() => {
        const loadTimeline = async () => {
            const stored = await AsyncStorage.getItem(timelineStorageKey);
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed)) {
                        const normalized = parsed.map((entry) => ({
                            ...entry,
                            photos: Array.isArray(entry.photos) ? entry.photos : [],
                            linkedBlogs: Array.isArray(entry.linkedBlogs) ? entry.linkedBlogs : [],
                            linkedCompetitions: Array.isArray(entry.linkedCompetitions) ? entry.linkedCompetitions : [],
                        }));
                        setTimelineItems(normalized);
                        return;
                    }
                } catch {
                    // ignore
                }
            }
            setTimelineItems(defaultTimeline);
        };
        loadTimeline();
    }, [defaultTimeline, timelineStorageKey]);

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

    const openTimelineDetail = (item: TimelineEntry) => {
        navigation.navigate('ProfileTimelineDetailScreen', {
            item,
            ownerName: route?.params?.user?.name ?? 'Profile',
        });
    };

    const collections = [
        { id: 1, imgUrl: Images.photo1 },
        { id: 2, imgUrl: Images.photo3 },
        { id: 3, imgUrl: Images.photo4 },
        { id: 4, imgUrl: Images.photo5 },
    ]

    const collectionVideos = [
        { id: 1, thumbnail: Images.photo1, title: '17:45 / MIN-M (Series)', author: 'Smith', duration: '5:06 mins' },
        { id: 2, thumbnail: Images.photo3, title: '17:45 / MIN-M (Series)', author: 'Smith', duration: '5:06 mins' },
    ]

    const posts = [
        {
            id: 1,
            title: 'IFAM Outdoor Oordegem',
            date: '09/08/2025',
            description: "Elias took part in the 800m and achieved a time close to his best 1'50\"99. For Lode it was a disappointing first half of his match DNF in the 5000m",
            image: Images.photo1,
        },
        {
            id: 2,
            title: 'BK 10000m AC Duffel',
            date: '09/06/2025',
            description: "This race meant everything to me. Running the European Championships on home soil, with my family and friends lining",
            image: Images.photo3,
        },
    ]

    const events = [
        {
            id: 1,
            title: 'Sunrise 10K Community Run',
            date: '27/05/2025',
            location: 'Brussels',
            status: 'Subscribed',
            media: '254 videos',
            image: photoMap[photoIds[0]] ? { uri: photoMap[photoIds[0]] } : null,
        },
        {
            id: 2,
            title: 'BK Studentent 23',
            date: '16/03/2025',
            location: 'Ghent',
            status: 'Completed',
            media: '48 videos',
            image: photoMap[photoIds[1]] ? { uri: photoMap[photoIds[1]] } : null,
        },
    ];

    const handlePostPress = (post: any) => {
        if (post.id === 1) {
            navigation.navigate('ViewUserBlogDetailsScreen', {
                post: {
                    title: post.title,
                    date: post.date,
                    image: post.image,
                    readCount: '1k',
                    writer: 'James Ray',
                    writerImage: Images.profile1,
                    description: `The IFAM Outdoor Oordegem is an internationally renowned athletics meeting held annually in Oordegem, Belgium. Recognized by World Athletics, it attracts a diverse mix of elite and emerging athletes from across Europe and beyond who compete in a full range of track and field events, including sprints, middle- and long-distance races, hurdles, jumps, and throws. Known for its exceptionally fast track and well-organized schedule, the event has become a prime venue for athletes seeking personal bests or qualification standards for major championships. Hosted at the Sport Vlaanderen stadium in Oordegem, typically in late spring or summer, the IFAM Outdoor combines high-level competition with a welcoming atmosphere for both athletes and spectators. Its growing reputation as one of Europe's largest and most competitive outdoor meetings highlights its importance in the international athletics calendar.`,
                },
            });
        } else if (post.id === 2) {
            navigation.navigate('ViewUserBlogDetailsScreen', {
                post: {
                    title: 'IFAM Outdoor Oordegem',
                    date: '09/08/2025',
                    image: post.image,
                    gallery: [Images.photo1, Images.photo3, Images.photo4, Images.photo5, Images.photo6],
                    readCount: '1k',
                    writer: 'James Ray',
                    writerImage: Images.profile1,
                    description: `The IFAM Outdoor Oordegem is an internationally renowned athletics meeting held annually in Oordegem, Belgium. Recognized by World Athletics, it attracts a diverse mix of elite and emerging athletes from across Europe and beyond who compete in a full range of track and field events, including sprints, middle- and long-distance races, hurdles, jumps, and throws. Known for its exceptionally fast track and well-organized schedule, the event has become a prime venue for athletes seeking personal bests or qualification standards for major championships. Hosted at the Sport Vlaanderen stadium in Oordegem, typically in late spring or summer, the IFAM Outdoor combines high-level competition with a welcoming atmosphere for both athletes and spectators. Its growing reputation as one of Europe's largest and most competitive outdoor meetings highlights its importance in the international athletics calendar.`,
                },
            });
        }
    };

    // Posts are rendered in the combined activity list

    const activityItems = useMemo(() => {
        const blogItems = posts.map((entry) => ({ ...entry, type: 'blog' }));
        const eventItems = events.map((entry) => ({ ...entry, type: 'event' }));
        return [...blogItems, ...eventItems];
    }, [events, posts]);

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
                onPress={() => handlePostPress(item)}
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
                <TouchableOpacity style={Styles.headerButton}>
                    <User size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                <SizeBox height={24} />

                {/* Search Card */}
                <View style={Styles.searchCard}>
                    <Text style={Styles.searchLabel}>Looking for another athlete?</Text>
                    <View style={Styles.searchInput}>
                        <SearchNormal1 size={16} color="#9B9F9F" variant="Linear" />
                        <Text style={Styles.searchPlaceholder}>Search</Text>
                    </View>
                </View>

                <SizeBox height={24} />

                {/* Profile Card */}
                <View style={Styles.profileCard}>
                    <View style={Styles.profileHeader}>
                        {/* Share Button */}
                        <TouchableOpacity style={Styles.shareButton} onPress={() => setShowShareModal(true)}>
                            <Text style={Styles.shareButtonText}>Share</Text>
                            <Image source={Icons.ShareGray} style={{ width: 18, height: 18 }} />
                        </TouchableOpacity>
                    </View>

                    <View style={Styles.profileTopRow}>
                        <View style={Styles.profileLeft}>
                            {/* Name */}
                            <View style={Styles.nameContainer}>
                                <Text style={Styles.userName}>James Ray</Text>
                                <Icons.BlueTick width={16} height={16} />
                            </View>

                            {/* Handle */}
                            <Text style={Styles.userHandle}>jamesray2@</Text>

                            <View style={Styles.categoryRow}>
                                <Text style={Styles.categoryLabel}>Category</Text>
                                <View style={Styles.categoryPill}>
                                    <Text style={Styles.categoryValue}>Track&Field</Text>
                                </View>
                            </View>
                        </View>
                        <View style={Styles.profileRight}>
                            {/* Profile Image */}
                            <View style={Styles.profileImageContainer}>
                                <FastImage source={Images.profile1} style={Styles.profileImage} resizeMode="cover" />
                            </View>
                            {/* Stats Row */}
                            <View style={Styles.statsRowRight}>
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
                    </View>

                    {/* Unfollow Button */}
                    <TouchableOpacity style={Styles.unfollowButton}>
                        <Text style={Styles.unfollowButtonText}>Unfollow</Text>
                    </TouchableOpacity>

                    {/* Bio Section */}
                    <View style={Styles.bioSection}>
                        <View style={Styles.bioHeader}>
                            <Text style={Styles.bioTitle}>Bio</Text>
                        </View>
                        <Text style={Styles.bioText}>
                            Passionate photographer capturing life's most authentic moments through the lens.
                        </Text>
                        <View style={Styles.separator} />
                    </View>

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
                </View>

                {profileTab === 'timeline' && (
                    <ProfileTimeline
                        title="Timeline"
                        items={timelineItems}
                        onPressItem={openTimelineDetail}
                    />
                )}

                {profileTab === 'activity' && (
                    <View style={Styles.activitySection}>
                        <View style={Styles.sectionHeader}>
                            <Text style={Styles.sectionTitle}>News</Text>
                        </View>
                        <View style={Styles.postsContainer}>
                            {activityItems.map(renderActivityCard)}
                        </View>
                    </View>
                )}

                {profileTab === 'collections' && (
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

                        {activeTab === 'photos' ? (
                            <View style={Styles.collectionsGrid}>
                                {collections.map((item) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        onPress={() => navigation.navigate('PhotoDetailScreen', {
                                            eventTitle: 'BK Studenten 2023',
                                            photo: {
                                                title: 'PK 2025 indoor Passionate',
                                                views: '122K+',
                                                thumbnail: item.imgUrl,
                                            }
                                        })}
                                    >
                                        <FastImage
                                            source={item.imgUrl}
                                            style={Styles.collectionImage}
                                            resizeMode="cover"
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            <View style={Styles.videosGrid}>
                                {collectionVideos.map((video) => (
                                    <TouchableOpacity
                                        key={video.id}
                                        style={Styles.videoCard}
                                        onPress={() => navigation.navigate('VideoPlayingScreen', {
                                            video: {
                                                title: 'BK Studenten 2023',
                                                subtitle: video.title,
                                                thumbnail: video.thumbnail,
                                            }
                                        })}
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
                )}

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>

            {/* Share Modal */}
            <ShareModal
                visible={showShareModal}
                onClose={() => setShowShareModal(false)}
            />
        </View>
    )
}

export default ViewUserProfileScreen
