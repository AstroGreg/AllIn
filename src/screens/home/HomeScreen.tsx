import {ActivityIndicator, ScrollView, Text, TouchableOpacity, View} from 'react-native'
import React, {useCallback, useMemo, useState} from 'react'
import { createStyles } from './HomeStyles'
import Header from './components/Header'
import SizeBox from '../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../../context/ThemeContext'
import LinearGradient from 'react-native-linear-gradient'
import Icons from '../../constants/Icons'
import { useAuth } from '../../context/AuthContext'
import {
    ApiError,
    getAllPhotos,
    getAllVideos,
    getHomeOverview,
    type HomeOverviewMedia,
    type HomeOverviewResponse,
    type MediaViewAllItem,
} from '../../services/apiGateway'
import {useFocusEffect} from '@react-navigation/native'
import FastImage from 'react-native-fast-image'
import NewsFeedCard from './components/NewsFeedCard'
import Images from '../../constants/Images'
import { getApiBaseUrl, getHlsBaseUrl } from '../../constants/RuntimeConfig'

const HomeScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { user, userProfile, apiAccessToken } = useAuth();

    const userName = (() => {
        const profileFullName = [userProfile?.firstName, userProfile?.lastName].filter(Boolean).join(' ').trim();
        if (profileFullName) return profileFullName;

        const auth0FullName = [user?.givenName, user?.familyName].filter(Boolean).join(' ').trim();
        if (auth0FullName) return auth0FullName;

        const username = userProfile?.username?.trim();
        if (username) return username;

        const nickname = user?.nickname?.trim();
        if (nickname) return nickname;

        const name = user?.name?.trim();
        if (name) return name;

        return 'Guest';
    })();

    const profilePic = user?.picture;

    const [overview, setOverview] = useState<HomeOverviewResponse | null>(null);
    const [isLoadingOverview, setIsLoadingOverview] = useState(false);
    const [overviewError, setOverviewError] = useState<string | null>(null);
    const [allVideos, setAllVideos] = useState<MediaViewAllItem[]>([]);
    const [allPhotos, setAllPhotos] = useState<MediaViewAllItem[]>([]);

    const loadOverview = useCallback(async () => {
        if (!apiAccessToken) {
            setOverview(null);
            setOverviewError('Log in (or set a Dev API token) to load overview.');
            return;
        }
        setIsLoadingOverview(true);
        setOverviewError(null);
        try {
            const [data, videos, photos] = await Promise.all([
                getHomeOverview(apiAccessToken, 'me'),
                getAllVideos(apiAccessToken),
                getAllPhotos(apiAccessToken),
            ]);
            setOverview(data);
            setAllVideos(videos);
            setAllPhotos(photos);
        } catch (e: any) {
            const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
            setOverviewError(msg);
        } finally {
            setIsLoadingOverview(false);
        }
    }, [apiAccessToken]);

    useFocusEffect(
        useCallback(() => {
            loadOverview();
        }, [loadOverview]),
    );

    const apiBaseUrl = useMemo(() => {
        return getApiBaseUrl();
    }, []);
    const hlsBaseUrl = useMemo(() => {
        return getHlsBaseUrl();
    }, []);

    const toAbsoluteUrl = useCallback((value?: string | null) => {
        if (!value) return null;
        const str = String(value);
        if (str.startsWith('http://') || str.startsWith('https://')) return str;
        return `${apiBaseUrl}${str.startsWith('/') ? '' : '/'}${str}`;
    }, [apiBaseUrl]);

    const toHlsUrl = useCallback((value?: string | null) => {
        if (!value) return null;
        const str = String(value);
        if (str.startsWith('http://') || str.startsWith('https://')) return str;
        return `${hlsBaseUrl}${str.startsWith('/') ? '' : '/'}${str}`;
    }, [hlsBaseUrl]);

    const formatTimeAgo = useCallback((value?: string | null) => {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
        if (diffSeconds < 60) return 'just now';
        const minutes = Math.floor(diffSeconds / 60);
        if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
        return date.toLocaleDateString();
    }, []);

    const overviewVideo = overview?.overview?.video ?? null;
    const overviewPhoto = overview?.overview?.photo ?? null;
    const overviewBlog = overview?.overview?.blog ?? null;

    const sortByNewest = useCallback((items: MediaViewAllItem[]) => {
        return [...items].sort((a, b) => {
            const aDate = new Date(String(a.created_at ?? '')).getTime();
            const bDate = new Date(String(b.created_at ?? '')).getTime();
            if (Number.isNaN(aDate) || Number.isNaN(bDate)) return 0;
            return bDate - aDate;
        });
    }, []);

    const topVideos = useMemo(() => {
        const unique: MediaViewAllItem[] = [];
        sortByNewest(allVideos).forEach((item) => {
            if (unique.find((existing) => existing.media_id === item.media_id)) return;
            unique.push(item);
        });
        return unique;
    }, [allVideos, sortByNewest]);

    const topPhotos = useMemo(() => {
        const unique: MediaViewAllItem[] = [];
        sortByNewest(allPhotos).forEach((item) => {
            if (unique.find((existing) => existing.media_id === item.media_id)) return;
            unique.push(item);
        });
        return unique;
    }, [allPhotos, sortByNewest]);

    const getMediaThumb = useCallback((item?: HomeOverviewMedia | null) => {
        if (!item) return null;
        const candidate =
            item.thumbnail_url ||
            item.preview_url ||
            item.original_url ||
            item.full_url ||
            item.raw_url ||
            null;
        if (!candidate) return null;
        return {uri: toAbsoluteUrl(candidate) as string};
    }, [toAbsoluteUrl]);

    const blogPrimaryMedia = useMemo(() => {
        return (
            overviewBlog?.media ||
            topPhotos[0] ||
            overviewPhoto ||
            overviewVideo ||
            null
        );
    }, [overviewBlog?.media, overviewPhoto, overviewVideo, topPhotos]);

    const blogPrimaryImage = useMemo(() => {
        return getMediaThumb(blogPrimaryMedia) || Images.photo3;
    }, [blogPrimaryMedia, getMediaThumb]);

    const blogExtraVideos = useMemo(() => {
        return topVideos as HomeOverviewMedia[];
    }, [topVideos]);

    const blogGalleryItems = useMemo(() => {
        const buildItem = (media?: HomeOverviewMedia | MediaViewAllItem | null, fallbackImage?: any) => {
            const image = getMediaThumb(media) || fallbackImage || Images.photo3;
            const videoUri = media
                ? (
                    toHlsUrl(media.hls_manifest_path || undefined) ||
                    toAbsoluteUrl(
                        media.preview_url ||
                        media.original_url ||
                        media.full_url ||
                        media.raw_url ||
                        undefined,
                    )
                ) || undefined
                : undefined;
            const isVideo = Boolean(
                media?.type === 'video' ||
                (videoUri && /\.(m3u8|mp4|mov|m4v)(\?|$)/.test(videoUri.toLowerCase())),
            );
            return {
                image,
                videoUri,
                type: isVideo ? 'video' : 'image',
                media: media ?? null,
            };
        };

        const items = [
            buildItem(blogPrimaryMedia, Images.photo3),
            ...blogExtraVideos.map((item) => buildItem(item, Images.photo3)),
        ];
        return items;
    }, [blogExtraVideos, blogPrimaryMedia, getMediaThumb, toAbsoluteUrl, toHlsUrl]);

    const blogGalleryImages = useMemo(() => blogGalleryItems.map((item) => item.image), [blogGalleryItems]);

    const buildMediaCardPress = useCallback((item?: MediaViewAllItem | null) => {
        if (!item) return;
        navigation.navigate('PhotoDetailScreen', {
            eventTitle: item.event_id ? `Event ${String(item.event_id).slice(0, 8)}…` : 'Media',
            media: {
                id: item.media_id,
                eventId: item.event_id,
                thumbnailUrl: item.thumbnail_url,
                previewUrl: item.preview_url,
                originalUrl: item.original_url,
                fullUrl: item.full_url,
                rawUrl: item.raw_url,
                hlsManifestPath: item.hls_manifest_path,
                type: item.type,
            },
        });
    }, [navigation]);

    const ListHeader = useMemo(
        () => (
            <View style={Styles.scrollContent}>
                <SizeBox height={24} />

                {/* Quick Actions */}
                <View style={Styles.sectionContainer}>
                    <View style={Styles.sectionHeader}>
                        <Text style={Styles.sectionTitle}>Quick Actions</Text>
                    </View>
                    <View style={Styles.quickActionsGrid}>
                        {/* First Row - My downloads & Add myself */}
                        <View style={Styles.quickActionsRow}>
                            <TouchableOpacity
                                style={Styles.quickActionCard}
                                onPress={() => navigation.navigate('DownloadsDetailsScreen')}
                            >
                                <View style={Styles.quickActionContent}>
                                    <View style={Styles.quickActionIconContainer}>
                                        <Icons.QuickDownload width={30} height={30} />
                                    </View>
                                    <View style={Styles.quickActionTextContainer}>
                                        <Text style={Styles.quickActionText} numberOfLines={1}>My downloads</Text>
                                        <View style={Styles.quickActionChevronCircle}>
                                            <Icons.QuickChevron width={16} height={16} />
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={Styles.quickActionCard}
                                onPress={() => navigation.navigate('AvailableEventsScreen')}
                            >
                                <View style={Styles.quickActionContent}>
                                    <View style={Styles.quickActionIconContainer}>
                                        <Icons.QuickAddMyself width={30} height={30} />
                                    </View>
                                    <View style={Styles.quickActionTextContainer}>
                                        <Text style={Styles.quickActionText} numberOfLines={1}>Add myself</Text>
                                        <View style={Styles.quickActionChevronCircle}>
                                            <Icons.QuickChevron width={16} height={16} />
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Context Search, Face Search & BIB Search */}
                        <View style={Styles.quickActionsRow}>
                            <TouchableOpacity
                                style={{ flex: 1 }}
                                activeOpacity={0.8}
                                onPress={() => navigation.navigate('ContextSearchScreen')}
                            >
                                <LinearGradient
                                    colors={['#155DFC', '#7F22FE']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={Styles.gradientButtonSmall}
                                >
                                    <Text style={Styles.gradientButtonTextSmall}>Context Search</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ flex: 1 }}
                                activeOpacity={0.8}
                                onPress={() => navigation.navigate('Search', { screen: 'FaceSearchScreen' })}
                            >
                                <LinearGradient
                                    colors={['#155DFC', '#7F22FE']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={Styles.gradientButtonSmall}
                                >
                                    <Text style={Styles.gradientButtonTextSmall}>Face Search</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ flex: 1 }}
                                activeOpacity={0.8}
                                onPress={() => navigation.navigate('Search', { screen: 'BibSearchScreen' })}
                            >
                                <LinearGradient
                                    colors={['#155DFC', '#7F22FE']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={Styles.gradientButtonSmall}
                                >
                                    <Text style={Styles.gradientButtonTextSmall}>BIB Search</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Overview */}
                <View style={Styles.sectionContainer}>
                    <View style={Styles.sectionHeader}>
                        <Text style={Styles.sectionTitle}>For you page</Text>
                    </View>
                    {isLoadingOverview ? (
                        <View style={{paddingVertical: 8}}>
                            <ActivityIndicator color={colors.primaryColor} />
                        </View>
                    ) : overviewError ? (
                        <Text style={[Styles.quickActionText, {color: '#FF3B30'}]}>{overviewError}</Text>
                    ) : (
                        <>
                            <NewsFeedCard
                                title={overviewVideo?.title ?? topVideos[0]?.title ?? 'Latest video'}
                                images={[
                                    getMediaThumb(overviewVideo) ||
                                        getMediaThumb(topVideos[0]) ||
                                        Images.photo1,
                                ]}
                                isVideo
                                videoUri={
                                    toAbsoluteUrl(
                                        overviewVideo?.hls_manifest_path ||
                                        overviewVideo?.preview_url ||
                                        overviewVideo?.original_url ||
                                        overviewVideo?.full_url ||
                                        overviewVideo?.raw_url ||
                                        topVideos[0]?.hls_manifest_path ||
                                        topVideos[0]?.preview_url ||
                                        topVideos[0]?.original_url ||
                                        topVideos[0]?.full_url ||
                                        topVideos[0]?.raw_url ||
                                        undefined,
                                    ) || undefined
                                }
                                onPress={() => buildMediaCardPress(overviewVideo ?? topVideos[0])}
                            />

                            <NewsFeedCard
                                title={overviewBlog?.post?.title ?? 'Latest blog'}
                                images={blogGalleryImages}
                                user={{
                                    name: overviewBlog?.author?.display_name ?? userName,
                                    avatar: overviewBlog?.author?.avatar_url
                                        ? {uri: toAbsoluteUrl(overviewBlog.author.avatar_url) as string}
                                        : Images.profile1,
                                    timeAgo: formatTimeAgo(overviewBlog?.post?.created_at) || '',
                                }}
                                description={overviewBlog?.post?.summary ?? overviewBlog?.post?.description ?? ''}
                                onViewBlog={() => {
                                    navigation.navigate('ViewUserBlogDetailsScreen', {
                                        post: {
                                            title: overviewBlog?.post?.title ?? 'Latest blog',
                                            date: overviewBlog?.post?.created_at
                                                ? new Date(overviewBlog.post.created_at).toLocaleDateString()
                                                : '',
                                            image: blogPrimaryImage,
                                            gallery: blogGalleryImages,
                                            galleryItems: blogGalleryItems,
                                            readCount: overviewBlog?.post?.reading_time_minutes
                                                ? `${overviewBlog.post.reading_time_minutes} min`
                                                : '1 min',
                                            writer: overviewBlog?.author?.display_name ?? userName,
                                            writerImage: overviewBlog?.author?.avatar_url
                                                ? {uri: toAbsoluteUrl(overviewBlog.author.avatar_url) as string}
                                                : Images.profile1,
                                            description: overviewBlog?.post?.description ?? overviewBlog?.post?.summary ?? '',
                                        },
                                    });
                                }}
                            />

                            <NewsFeedCard
                                title={overviewPhoto?.title ?? 'Latest photo'}
                                images={[
                                    getMediaThumb(overviewPhoto) ||
                                        getMediaThumb(topPhotos[0]) ||
                                        Images.photo4,
                                ]}
                                onPress={() => buildMediaCardPress(overviewPhoto ?? topPhotos[0])}
                            />
                        </>
                    )}
                </View>

            </View>
        ),
        [
            Styles.gradientButtonSmall,
            Styles.gradientButtonTextSmall,
            Styles.quickActionCard,
            Styles.quickActionContent,
            Styles.quickActionIconContainer,
            Styles.quickActionText,
            Styles.quickActionTextContainer,
            Styles.quickActionsGrid,
            Styles.quickActionsRow,
            Styles.scrollContent,
            Styles.sectionContainer,
            Styles.sectionHeader,
            Styles.sectionTitle,
            colors.primaryColor,
            colors.grayColor,
            isLoadingOverview,
            overviewError,
            overviewVideo?.media_id,
            overviewPhoto?.media_id,
            overviewBlog?.post?.id,
            toAbsoluteUrl,
            toHlsUrl,
            formatTimeAgo,
            buildMediaCardPress,
            blogPrimaryImage,
            blogExtraVideos,
            blogGalleryImages,
            blogGalleryItems,
            getMediaThumb,
            topVideos,
            topPhotos,
            navigation,
        ],
    );

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <Header
                userName={userName}
                profilePic={profilePic}
                onPressFeed={() => navigation.navigate('HubScreen')}
                onPressProfile={() => navigation.navigate('BottomTabBar', { screen: 'Profile' })}
            />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingBottom: insets.bottom > 0 ? insets.bottom + 20 : 40}}
            >
                {ListHeader}
            </ScrollView>
        </View>
    )
}

export default HomeScreen
