import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native'
import React, { useState } from 'react'
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
    Global,
    Clock,
} from 'iconsax-react-nativejs'
import ShareModal from '../../components/shareModal/ShareModal'

const ViewUserProfileScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const [activeTab, setActiveTab] = useState('photos');
    const [showShareModal, setShowShareModal] = useState(false);

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

    const renderPostCard = (post: any) => (
        <TouchableOpacity
            key={post.id}
            style={Styles.postCard}
            onPress={() => handlePostPress(post)}
            activeOpacity={post.id === 1 || post.id === 2 ? 0.7 : 1}
        >
            <View>
                <View style={Styles.postImageContainer}>
                    <FastImage source={post.image} style={Styles.postImage} resizeMode="cover" />
                </View>
                <View style={Styles.postInfoBar}>
                    <Text style={Styles.postTitle}>{post.title}</Text>
                    <Text style={Styles.postDate}>{post.date}</Text>
                </View>
            </View>
            <Text style={Styles.postDescription}>{post.description}</Text>
            <TouchableOpacity style={Styles.sharePostButton}>
                <Text style={Styles.sharePostButtonText}>Share</Text>
                <Image source={Icons.ShareBlue} style={{ width: 18, height: 18, tintColor: '#FFFFFF' }} />
            </TouchableOpacity>
        </TouchableOpacity>
    )

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

                        {/* Profile Image */}
                        <View style={Styles.profileImageContainer}>
                            <FastImage source={Images.profile1} style={Styles.profileImage} resizeMode="cover" />
                        </View>

                        {/* Name */}
                        <View style={Styles.nameContainer}>
                            <Text style={Styles.userName}>James Ray</Text>
                            <Icons.BlueTick width={16} height={16} />
                        </View>

                        {/* Handle */}
                        <Text style={Styles.userHandle}>jamesray2@</Text>
                    </View>

                    {/* Stats Row */}
                    <View style={Styles.statsRow}>
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

                    {/* Info Row */}
                    <View style={Styles.infoRow}>
                        <View style={Styles.infoItem}>
                            <Text style={Styles.infoLabel}>Born</Text>
                            <View style={Styles.infoValueContainer}>
                                <Text style={Styles.infoValue}>Belgium</Text>
                                <Icons.Dt width={16} height={16} />
                            </View>
                        </View>
                        <View style={Styles.statDivider} />
                        <View style={Styles.infoItemCenter}>
                            <Text style={Styles.infoLabel}>Track and Field</Text>
                        </View>
                        <View style={Styles.statDivider} />
                        <View style={Styles.infoItemEnd}>
                            <Text style={Styles.infoLabel}>Chest Number</Text>
                            <Text style={Styles.infoValue}>17</Text>
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

                    {/* Links Section */}
                    <View style={Styles.linksSection}>
                        <View style={Styles.linkRow}>
                            <View style={[Styles.linkChip, { flex: 1, marginRight: 10 }]}>
                                <FastImage source={Icons.Facebook} style={{ width: 16, height: 16 }} />
                                <Text style={Styles.linkText}>Facebook profile</Text>
                            </View>
                            <TouchableOpacity style={[Styles.linkChip, { flex: 1 }]}>
                                <Text style={Styles.linkTextUnderline}>+ 2 links</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={Styles.emailChip}>
                            <Global size={16} color="#9B9F9F" variant="Linear" />
                            <Text style={Styles.emailText}>georgia.young@example.com</Text>
                        </View>
                        <View style={Styles.separator} />
                    </View>
                </View>

                {/* Posts Section */}
                <View style={Styles.postsSection}>
                    <View style={Styles.sectionHeader}>
                        <Text style={Styles.sectionTitle}>Posts</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('ViewUserPostsViewAllScreen')}>
                            <Text style={Styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={Styles.postsContainer}>
                        {posts.map(renderPostCard)}
                    </View>
                </View>

                {/* Collections Section */}
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

                    {/* Toggle */}
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

                    {/* Collections Grid */}
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
