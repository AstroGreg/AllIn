import { View, ScrollView, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { createStyles } from './HomeStyles'
import Header from './components/Header'
import SizeBox from '../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import NewsFeedCard from './components/NewsFeedCard'
import Images from '../../constants/Images'
import Icons from '../../constants/Icons'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import LinearGradient from 'react-native-linear-gradient'
import { UserAdd, ArrowRight } from 'iconsax-react-nativejs'
import { fetchAllMedia, MediaView } from '../../services/api'

const HomeScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { user, userProfile, accessToken } = useAuth();

    const displayName = userProfile?.firstName || 'User';

    const [mediaItems, setMediaItems] = useState<MediaView[]>([]);
    const [isLoadingMedia, setIsLoadingMedia] = useState(false);

    const loadMedia = useCallback(async () => {
        if (!accessToken) return;
        setIsLoadingMedia(true);
        try {
            const data = await fetchAllMedia(accessToken);
            setMediaItems(data);
            console.log('[Home] Loaded', data.length, 'media items');
        } catch (err: any) {
            console.log('[Home] Failed to load media:', err.message);
        } finally {
            setIsLoadingMedia(false);
        }
    }, [accessToken]);

    useEffect(() => {
        loadMedia();
    }, [loadMedia]);

    const imageItems = mediaItems.filter(m => m.type === 'image');
    const videoItems = mediaItems.filter(m => m.type === 'video');

    const getImageSource = (item: MediaView) => {
        const url = item.thumbnail_url || item.preview_url || item.original_url;
        return url ? { uri: url } : Images.photo1;
    };

    const getFullImageUrl = (item: MediaView) => {
        return item.original_url || item.preview_url || item.thumbnail_url || '';
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <Header
                userName={displayName}
                profilePic={user?.picture}
                onPressFeed={() => navigation.navigate('HubScreen')}
                onPressNotification={() => navigation.navigate('NotificationsScreen')}
                onPressProfile={() => navigation.navigate('BottomTabBar', { screen: 'Profile' })}
            />

            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled={true} contentContainerStyle={Styles.scrollContent}>
                <SizeBox height={24} />

                {/* AI Smart Search Card */}
                <View style={Styles.aiSearchCard}>
                    <Text style={Styles.aiSearchTitle}>AI Smart Search</Text>
                    <Text style={Styles.aiSearchDescription}>
                        Try our fast AI Search by face and get pictures and video's of you in seconds.
                    </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Search', { screen: 'FaceSearchScreen' })}>
                        <LinearGradient
                            colors={['#155DFC', '#7F22FE']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={Styles.tryAiButton}
                        >
                            <Text style={Styles.tryAiButtonText}>Try Face Search</Text>
                            <ArrowRight size={24} color="#FFFFFF" variant="Linear" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Quick Actions Section */}
                <View style={Styles.sectionContainer}>
                    <View style={Styles.sectionHeader}>
                        <Text style={Styles.sectionTitle}>Quick Actions</Text>
                    </View>
                    <View style={Styles.quickActionsGrid}>
                        {/* First Row - Add myself & My downloads */}
                        <View style={Styles.quickActionsRow}>
                            <TouchableOpacity style={Styles.quickActionCard} onPress={() => navigation.navigate('AvailableEventsScreen')}>
                                <View style={Styles.quickActionContent}>
                                    <View style={Styles.quickActionIconContainer}>
                                        <UserAdd size={20} color={colors.primaryColor} variant="Linear" />
                                    </View>
                                    <View style={Styles.quickActionTextContainer}>
                                        <Text style={Styles.quickActionText}>Add myself</Text>
                                        <ArrowRight size={16} color={colors.primaryColor} variant="Linear" />
                                    </View>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={Styles.quickActionCard} onPress={() => navigation.navigate('DownloadsDetailsScreen')}>
                                <View style={Styles.quickActionContent}>
                                    <View style={Styles.quickActionIconContainer}>
                                        <Icons.DownloadBlue width={20} height={20} />
                                    </View>
                                    <View style={Styles.quickActionTextContainer}>
                                        <Text style={Styles.quickActionText}>My downloads</Text>
                                        <ArrowRight size={16} color={colors.primaryColor} variant="Linear" />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Second Row - Context Search, Face Search & BIB Search */}
                        <View style={Styles.quickActionsRow}>
                            <TouchableOpacity
                                style={{ flex: 1 }}
                                activeOpacity={0.8}
                                onPress={() => navigation.navigate('Subscription', { redirectTo: 'ContextSearch' })}
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
                                onPress={() => navigation.navigate('Subscription', { redirectTo: 'FaceSearch' })}
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
                                onPress={() => navigation.navigate('Subscription', { redirectTo: 'BIBSearch' })}
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

                {/* New for you Section */}
                <View style={Styles.sectionContainer}>
                    <View style={Styles.newForYouHeader}>
                        <Text style={Styles.newForYouTitle}>New for you</Text>
                        <Text style={Styles.newForYouDescription}>
                            {mediaItems.length > 0
                                ? `${imageItems.length} photos and ${videoItems.length} videos available`
                                : ''}
                        </Text>
                    </View>

                    {isLoadingMedia ? (
                        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                            <ActivityIndicator size="large" color={colors.primaryColor} />
                        </View>
                    ) : mediaItems.length > 0 ? (
                        <>
                            {/* Photos carousel */}
                            {imageItems.length > 0 && (
                                <NewsFeedCard
                                    title={`Photos (${imageItems.length})`}
                                    images={imageItems.map(getImageSource)}
                                    hasBorder={true}
                                    onImagePress={(index) => navigation.navigate('FullPageImageViewerScreen', {
                                        images: imageItems.map(item => ({ uri: getFullImageUrl(item) })),
                                        initialIndex: index,
                                        title: 'Media Gallery',
                                    })}
                                />
                            )}

                            {/* Video cards */}
                            {videoItems.map((video) => (
                                <NewsFeedCard
                                    key={video.media_id}
                                    title="Video"
                                    images={[getImageSource(video)]}
                                    hasBorder={true}
                                    isVideo={true}
                                    videoUri={video.full_url || video.raw_url || video.original_url || undefined}
                                />
                            ))}
                        </>
                    ) : (
                        <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                            <Text style={{ color: colors.grayColor, fontSize: 14 }}>
                                No media available yet
                            </Text>
                        </View>
                    )}
                </View>

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    )
}

export default HomeScreen
