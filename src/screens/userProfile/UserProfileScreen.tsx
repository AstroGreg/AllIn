import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native'
import React, { useState } from 'react'
import SizeBox from '../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FastImage from 'react-native-fast-image'
import Images from '../../constants/Images'
import Icons from '../../constants/Icons'
import Colors from '../../constants/Colors'
import Styles from './UserProfileStyles'
import { ArrowLeft2, User, Edit2, Trash, Global, Clock, ArrowRight, Location, Calendar, Camera, VideoPlay } from 'iconsax-react-nativejs'
import ManageSocialMediaModal from '../../components/manageSocialMediaModal/ManageSocialMediaModal'

const UserProfileScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState('photos');
    const [showSocialMediaModal, setShowSocialMediaModal] = useState(false);

    const { width } = Dimensions.get('window');
    const imageWidth = Math.floor((width - 40 - 24 - 30) / 4);

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

    const posts = [
        {
            id: 1,
            image: Images.photo1,
            title: 'IFAM Outdoor Oordegem',
            date: '09/08/2025',
            description: "Elias took part in the 800m and achieved a time close to his best 1'50\"99.\nFor Lode it was a disappointing first half of his match\nDNF in the 5000m",
        },
        {
            id: 2,
            image: Images.photo3,
            title: 'BK 10000m AC Duffel',
            date: '09/06/2025',
            description: 'This race meant everything to me. Running the European Championships on home soil, with my family and friends lining',
        },
    ];

    const events = [
        {
            id: 1,
            image: Images.photo1,
            title: 'City Run Marathon',
            location: 'Dhaka',
            date: '27/05/2025',
        },
        {
            id: 2,
            image: Images.photo3,
            title: 'City Run Marathon',
            location: 'Dhaka',
            date: '27/05/2025',
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
                    description: `The IFAM Outdoor Oordegem is an internationally renowned athletics meeting held annually in Oordegem, Belgium. Recognized by World Athletics, it attracts a diverse mix of elite and emerging athletes from across Europe and beyond who compete in a full range of track and field events, including sprints, middle- and long-distance races, hurdles, jumps, and throws. Known for its exceptionally fast track and well-organized schedule, the event has become a prime venue for athletes seeking personal bests or qualification standards for major championships.`,
                },
            });
        } else if (post.id === 2) {
            navigation.navigate('ViewUserBlogDetailsScreen', {
                post: {
                    title: post.title,
                    date: post.date,
                    image: post.image,
                    gallery: [Images.photo1, Images.photo3, Images.photo4, Images.photo5, Images.photo6],
                    readCount: '1k',
                    writer: 'James Ray',
                    writerImage: Images.profile1,
                    description: `This race meant everything to me. Running the European Championships on home soil, with my family and friends lining the track, was an incredible experience. The atmosphere was electric and the support from the crowd pushed me to give my absolute best performance.`,
                },
            });
        }
    };

    const renderPostCard = (post: any) => (
        <TouchableOpacity key={post.id} style={Styles.postCard} onPress={() => handlePostPress(post)}>
            <View style={Styles.postImageContainer}>
                <FastImage source={post.image} style={Styles.postImage} resizeMode="cover" />
            </View>
            <View style={Styles.postTitleContainer}>
                <Text style={Styles.postTitle}>{post.title}</Text>
                <Text style={Styles.postDate}>{post.date}</Text>
            </View>
            <Text style={Styles.postDescription}>{post.description}</Text>
            <View style={Styles.postActions}>
                <TouchableOpacity style={Styles.editButton}>
                    <Text style={Styles.editButtonText}>Edit</Text>
                    <Edit2 size={18} color={Colors.whiteColor} variant="Linear" />
                </TouchableOpacity>
                <TouchableOpacity style={Styles.deleteButton}>
                    <Text style={Styles.deleteButtonText}>Delete</Text>
                    <Trash size={18} color="#ED5454" variant="Linear" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const renderEventCard = (event: any) => (
        <View key={event.id} style={Styles.eventCard}>
            <View style={Styles.eventCardContent}>
                <View style={Styles.eventImageContainer}>
                    <FastImage source={event.image} style={Styles.eventImage} resizeMode="cover" />
                </View>
                <View style={Styles.eventDetails}>
                    <Text style={Styles.eventTitle}>{event.title}</Text>
                    <View style={Styles.eventInfoRow}>
                        <Text style={Styles.eventInfoLabel}>Location</Text>
                        <View style={Styles.eventInfoValue}>
                            <Location size={16} color="#9B9F9F" variant="Linear" />
                            <Text style={Styles.eventInfoValueText}>{event.location}</Text>
                        </View>
                    </View>
                    <View style={Styles.eventInfoRow}>
                        <Text style={Styles.eventInfoLabel}>Date</Text>
                        <View style={Styles.eventInfoValue}>
                            <Calendar size={16} color="#9B9F9F" variant="Linear" />
                            <Text style={Styles.eventInfoValueText}>{event.date}</Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={Styles.eventDivider} />
            <View style={Styles.eventActions}>
                <View style={Styles.eventActionButtons}>
                    <TouchableOpacity style={Styles.eventActionButton}>
                        <Text style={Styles.eventActionButtonText}>Photograph</Text>
                        <Camera size={18} color="#9B9F9F" variant="Linear" />
                    </TouchableOpacity>
                    <TouchableOpacity style={Styles.eventActionButton}>
                        <Text style={Styles.eventActionButtonText}>Videos</Text>
                        <VideoPlay size={18} color="#9B9F9F" variant="Linear" />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={Styles.eventEditButton}>
                    <Text style={Styles.eventEditButtonText}>Edit</Text>
                    <Edit2 size={18} color={Colors.whiteColor} variant="Linear" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={Colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Profile</Text>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.navigate('ProfileSettings')}>
                    <User size={24} color={Colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {/* Profile Card */}
                <View style={Styles.profileCard}>
                    {/* Edit Profile Button */}
                    <TouchableOpacity style={Styles.editProfileButton}>
                        <Text style={Styles.editProfileButtonText}>Edit</Text>
                        <Edit2 size={18} color="#9B9F9F" variant="Linear" />
                    </TouchableOpacity>

                    {/* Profile Image */}
                    <View style={Styles.profileImageContainer}>
                        <FastImage source={Images.profile1} style={Styles.profileImage} />
                    </View>

                    {/* Name and Username */}
                    <View style={Styles.nameContainer}>
                        <Text style={Styles.userName}>James Ray</Text>
                        <Icons.BlueTick width={16} height={16} />
                    </View>
                    <Text style={Styles.userHandle}>jamesray2@</Text>

                    {/* Stats */}
                    <View style={Styles.statsContainer}>
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
                            <View style={Styles.infoValueRow}>
                                <Text style={Styles.infoValue}>Belgium</Text>
                                <Text style={Styles.flagEmoji}>🇧🇪</Text>
                            </View>
                        </View>
                        <View style={Styles.infoDivider} />
                        <View style={Styles.infoItemCenter}>
                            <Text style={Styles.infoLabel}>Track and Field</Text>
                            <Text style={Styles.infoValue}>Boxing</Text>
                        </View>
                        <View style={Styles.infoDivider} />
                        <View style={Styles.infoItemEnd}>
                            <Text style={Styles.infoLabel}>Chest Number</Text>
                            <Text style={Styles.infoValue}>17</Text>
                        </View>
                    </View>

                    {/* Bio Section */}
                    <View style={Styles.bioSection}>
                        <View style={Styles.bioHeader}>
                            <Text style={Styles.bioTitle}>Bio</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('EditBioScreens')}>
                                <Edit2 size={16} color={Colors.mainTextColor} variant="Linear" />
                            </TouchableOpacity>
                        </View>
                        <Text style={Styles.bioText}>
                            Passionate photographer capturing life's most authentic moments through the lens.
                        </Text>
                        <View style={Styles.bioDivider} />
                    </View>

                    {/* Manage Social Media Button */}
                    <TouchableOpacity
                        style={Styles.manageSocialMediaButton}
                        onPress={() => setShowSocialMediaModal(true)}
                    >
                        <Text style={Styles.manageSocialMediaButtonText}>Manage Social Media</Text>
                        <ArrowRight size={18} color={Colors.whiteColor} variant="Linear" />
                    </TouchableOpacity>

                    <SizeBox height={10} />

                    {/* Link Section */}
                    <View style={Styles.linkSection}>
                        <View style={Styles.linkRow}>
                            <View style={Styles.linkContent}>
                                <Global size={16} color="#9B9F9F" variant="Linear" />
                                <Text style={Styles.linkText}>georgia.young@example.com</Text>
                            </View>
                            <View style={Styles.linkActions}>
                                <TouchableOpacity>
                                    <Trash size={16} color="#9B9F9F" variant="Linear" />
                                </TouchableOpacity>
                                <SizeBox width={8} />
                                <TouchableOpacity>
                                    <Edit2 size={16} color={Colors.mainTextColor} variant="Linear" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <View style={Styles.linkDivider} />
                </View>

                {/* Create New Post Button */}
                <TouchableOpacity style={Styles.createPostButton} onPress={() => navigation.navigate('CreateNewPostScreen')}>
                    <Text style={Styles.createPostButtonText}>Create New Post</Text>
                </TouchableOpacity>

                {/* Posts Section */}
                <View style={Styles.postsSection}>
                    <View style={Styles.sectionHeader}>
                        <Text style={Styles.sectionTitle}>Posts</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('ViewUserPostsViewAllScreen')}>
                            <Text style={Styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    <SizeBox height={16} />
                    {posts.map(renderPostCard)}
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
                    <SizeBox height={16} />

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

                    <SizeBox height={16} />

                    {/* Collections Grid */}
                    {activeTab === 'photos' ? (
                        <View style={Styles.collectionsCard}>
                            <View style={Styles.collectionsGrid}>
                                {collections.map((item, index) => (
                                    <FastImage
                                        key={index}
                                        source={item.imgUrl}
                                        style={[Styles.collectionImage, { width: imageWidth }]}
                                        resizeMode="cover"
                                    />
                                ))}
                            </View>
                        </View>
                    ) : (
                        <View style={Styles.videosGrid}>
                            {collectionVideos.map((video) => (
                                <View key={video.id} style={Styles.videoCard}>
                                    <View style={Styles.videoThumbnailContainer}>
                                        <FastImage source={video.thumbnail} style={Styles.videoThumbnail} resizeMode="cover" />
                                        <View style={Styles.videoPlayIconContainer}>
                                            <Icons.PlayBlue width={20} height={20} />
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
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* Edit Button */}
                <TouchableOpacity style={Styles.mainEditButton} onPress={() => {
                    if (activeTab === 'photos') {
                        navigation.navigate('EditPhotoCollectionsScreen');
                    } else {
                        navigation.navigate('EditVideoCollectionsScreen');
                    }
                }}>
                    <Text style={Styles.mainEditButtonText}>Edit</Text>
                    <Edit2 size={18} color={Colors.whiteColor} variant="Linear" />
                </TouchableOpacity>

                {/* Events Section */}
                <View style={Styles.eventsSection}>
                    <View style={Styles.eventsSectionHeader}>
                        <Text style={Styles.sectionTitle}>Events</Text>
                        <View style={Styles.eventsBadge}>
                            <Text style={Styles.eventsBadgeText}>430 Events Available</Text>
                        </View>
                    </View>
                    <View style={Styles.eventsCardsContainer}>
                        {events.map(renderEventCard)}
                    </View>
                    <TouchableOpacity style={Styles.eventsViewAllButton} onPress={() => navigation.navigate('EventsViewAllScreen')}>
                        <Text style={Styles.eventsViewAllButtonText}>View All</Text>
                        <ArrowRight size={18} color={Colors.whiteColor} variant="Linear" />
                    </TouchableOpacity>
                </View>

                {/* Downloads Section */}
                <View style={Styles.downloadsSection}>
                    <Text style={Styles.sectionTitle}>Downloads</Text>
                    <View style={Styles.downloadsCard}>
                        <View style={Styles.downloadsContent}>
                            <View style={Styles.downloadsIconContainer}>
                                <Icons.DownloadColorful width={24} height={24} />
                            </View>
                            <Text>
                                <Text style={Styles.downloadsText}>Total Downloads: </Text>
                                <Text style={Styles.downloadsTextBold}>346,456</Text>
                            </Text>
                        </View>
                        <TouchableOpacity style={Styles.downloadsDetailsButton} onPress={() => navigation.navigate('DownloadsDetailsScreen')}>
                            <Text style={Styles.downloadsDetailsButtonText}>Details</Text>
                            <ArrowRight size={18} color="#9B9F9F" variant="Linear" />
                        </TouchableOpacity>
                    </View>
                </View>

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>

            {/* Manage Social Media Modal */}
            <ManageSocialMediaModal
                visible={showSocialMediaModal}
                onClose={() => setShowSocialMediaModal(false)}
                onSave={() => {
                    // Handle save logic
                    setShowSocialMediaModal(false);
                }}
            />
        </View>
    );
};

export default UserProfileScreen;
