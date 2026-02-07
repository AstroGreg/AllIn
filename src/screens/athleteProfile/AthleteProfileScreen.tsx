import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import React, { useState } from 'react';
import Styles from './AthleteProfileStyles';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Images from '../../constants/Images';
import Icons from '../../constants/Icons';
import Colors from '../../constants/Colors';
import {
    ArrowLeft2,
    User,
    Global,
    Location,
    Calendar,
} from 'iconsax-react-nativejs';
import ShareModal from '../../components/shareModal/ShareModal';

const AthleteProfileScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState('athletes');
    const [showShareModal, setShowShareModal] = useState(false);
    const athlete = route?.params?.athlete;

    const clubAthletes = [
        { id: 1, name: 'Thomas Smith', username: '@thomassmith', avatar: Images.profile1, isFollowing: false },
        { id: 2, name: 'Sarah Johnson', username: '@sarahj', avatar: Images.profile1, isFollowing: true },
        { id: 3, name: 'Mike Williams', username: '@mikew', avatar: Images.profile1, isFollowing: false },
        { id: 4, name: 'Emma Davis', username: '@emmad', avatar: Images.profile1, isFollowing: false },
    ];

    const coaches = [
        { id: 1, name: 'Coach Anderson', specialty: 'Track and Field', avatar: Images.profile1 },
        { id: 2, name: 'Coach Williams', specialty: 'Boxing', avatar: Images.profile1 },
        { id: 3, name: 'Coach Martinez', specialty: 'Cross Country', avatar: Images.profile1 },
    ];

    const events = [
        { id: 1, title: 'City Run Marathon', distance: '800m heat 1', location: 'Dhaka', date: '27/05/2025', image: Images.photo1 },
        { id: 2, title: 'National Championship', distance: '400m finals', location: 'New York', date: '15/06/2025', image: Images.photo1 },
    ];

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
    ];

    const renderAthleteCard = (athleteItem: any) => (
        <View key={athleteItem.id} style={Styles.clubAthleteCard}>
            <FastImage source={athleteItem.avatar} style={Styles.clubAthleteAvatar} resizeMode="cover" />
            <View style={Styles.clubAthleteInfo}>
                <Text style={Styles.clubAthleteName}>{athleteItem.name}</Text>
                <Text style={Styles.clubAthleteUsername}>{athleteItem.username}</Text>
            </View>
            <TouchableOpacity
                style={[
                    Styles.followButton,
                    athleteItem.isFollowing && Styles.followingButton
                ]}
            >
                <Text style={[
                    Styles.followButtonText,
                    athleteItem.isFollowing && Styles.followingButtonText
                ]}>
                    {athleteItem.isFollowing ? 'Following' : 'Follow'}
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderCoachCard = (coach: any) => (
        <View key={coach.id} style={Styles.coachCard}>
            <FastImage source={coach.avatar} style={Styles.coachAvatar} resizeMode="cover" />
            <View style={Styles.coachInfo}>
                <Text style={Styles.coachName}>{coach.name}</Text>
                <Text style={Styles.coachSpecialty}>{coach.specialty}</Text>
            </View>
        </View>
    );

    const renderEventCard = (event: any) => (
        <View key={event.id} style={Styles.eventCard}>
            <FastImage source={event.image} style={Styles.eventImage} resizeMode="cover" />
            <View style={Styles.eventInfo}>
                <Text style={Styles.eventTitle}>{event.title}</Text>
                <View style={Styles.eventDetailRow}>
                    <Icons.Map width={14} height={14} />
                    <Text style={Styles.eventDetailText}>{event.distance}</Text>
                </View>
                <View style={Styles.eventDetailRow}>
                    <Location size={14} color="#9B9F9F" variant="Linear" />
                    <Text style={Styles.eventDetailText}>{event.location}</Text>
                </View>
                <View style={Styles.eventDetailRow}>
                    <Calendar size={14} color="#9B9F9F" variant="Linear" />
                    <Text style={Styles.eventDetailText}>{event.date}</Text>
                </View>
            </View>
        </View>
    );

    const renderPostCard = (post: any) => (
        <TouchableOpacity key={post.id} style={Styles.postCard} activeOpacity={0.8}>
            <View style={Styles.postImageContainer}>
                <FastImage source={post.image} style={Styles.postImage} resizeMode="cover" />
            </View>
            <View style={Styles.postInfoBar}>
                <Text style={Styles.postTitle}>{post.title}</Text>
                <Text style={Styles.postDate}>{post.date}</Text>
            </View>
            <Text style={Styles.postDescription} numberOfLines={3}>{post.description}</Text>
            <TouchableOpacity style={Styles.sharePostButton}>
                <Text style={Styles.sharePostButtonText}>Share</Text>
                <Image source={Icons.ShareBlue} style={{ width: 18, height: 18, tintColor: Colors.whiteColor }} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={Colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Profile</Text>
                <View style={Styles.headerButtonPlaceholder} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {/* Profile Card */}
                <View style={Styles.profileCard}>
                    {/* Share Button */}
                    <TouchableOpacity style={Styles.shareButton} onPress={() => setShowShareModal(true)}>
                        <Text style={Styles.shareButtonText}>Share</Text>
                        <Image source={Icons.ShareGray} style={{ width: 18, height: 18 }} />
                    </TouchableOpacity>

                    {/* Profile Image */}
                    <View style={Styles.profileImageContainer}>
                        <FastImage source={athlete?.avatar || Images.profile1} style={Styles.profileImage} resizeMode="cover" />
                    </View>

                    {/* Name */}
                    <View style={Styles.nameContainer}>
                        <Text style={Styles.userName}>{athlete?.name || 'James Ray'}</Text>
                        <Icons.BlueTick width={16} height={16} />
                    </View>

                    {/* Handle */}
                    <Text style={Styles.userHandle}>@{athlete?.username || 'jamesray2'}</Text>

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

                    {/* Categories */}
                    <View style={Styles.categoriesContainer}>
                        <Text style={Styles.categoryText}>Track and Field</Text>
                        <Text style={Styles.categorySeparator}>|</Text>
                        <Text style={Styles.categoryText}>Boxing</Text>
                        <Text style={Styles.categorySeparator}>|</Text>
                        <Text style={Styles.categoryText}>Cross Country</Text>
                    </View>

                    {/* Additional Stats */}
                    <View style={Styles.additionalStatsRow}>
                        <View style={Styles.additionalStatItem}>
                            <Text style={Styles.additionalStatValue}>3</Text>
                            <Text style={Styles.additionalStatLabel}>Coaches</Text>
                        </View>
                        <View style={Styles.additionalStatItem}>
                            <Text style={Styles.additionalStatValue}>17</Text>
                            <Text style={Styles.additionalStatLabel}>Athletes</Text>
                        </View>
                        <View style={Styles.additionalStatItem}>
                            <Text style={Styles.additionalStatValue}>4</Text>
                            <Text style={Styles.additionalStatLabel}>Upcoming Events</Text>
                        </View>
                    </View>

                    {/* Bio Section */}
                    <View style={Styles.bioSection}>
                        <Text style={Styles.bioTitle}>Bio</Text>
                        <Text style={Styles.bioText}>
                            Passionate athlete dedicated to pushing limits and achieving excellence in track and field events.
                        </Text>
                    </View>

                    <View style={Styles.separator} />

                    {/* Links Section */}
                    <View style={Styles.linksSection}>
                        <View style={Styles.linkRow}>
                            <View style={Styles.linkChip}>
                                <FastImage source={Icons.Facebook} style={{ width: 16, height: 16 }} />
                                <Text style={Styles.linkText}>Facebook profile</Text>
                            </View>
                            <View style={Styles.linkChip}>
                                <Global size={16} color="#9B9F9F" variant="Linear" />
                                <Text style={Styles.linkText}>Website</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Toggle Tab Bar */}
                <View style={Styles.toggleContainer}>
                    <TouchableOpacity
                        style={[Styles.toggleButton, activeTab === 'athletes' && Styles.toggleButtonActive]}
                        onPress={() => setActiveTab('athletes')}
                    >
                        <Text style={activeTab === 'athletes' ? Styles.toggleTextActive : Styles.toggleText}>Athletes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[Styles.toggleButton, activeTab === 'coaches' && Styles.toggleButtonActive]}
                        onPress={() => setActiveTab('coaches')}
                    >
                        <Text style={activeTab === 'coaches' ? Styles.toggleTextActive : Styles.toggleText}>Coaches</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[Styles.toggleButton, activeTab === 'events' && Styles.toggleButtonActive]}
                        onPress={() => setActiveTab('events')}
                    >
                        <Text style={activeTab === 'events' ? Styles.toggleTextActive : Styles.toggleText}>Events</Text>
                    </TouchableOpacity>
                </View>

                {/* Tab Content */}
                {activeTab === 'athletes' && (
                    <View style={Styles.tabContent}>
                        {/* Club Athletes Header */}
                        <View style={Styles.sectionHeader}>
                            <Text style={Styles.sectionTitle}>Club Athletes</Text>
                            <View style={Styles.athleteCountBadge}>
                                <Text style={Styles.athleteCountText}>430 Athletes Available</Text>
                            </View>
                        </View>

                        {/* Athletes List */}
                        <View style={Styles.athletesList}>
                            {clubAthletes.map(renderAthleteCard)}
                        </View>
                    </View>
                )}

                {activeTab === 'coaches' && (
                    <View style={Styles.tabContent}>
                        <View style={Styles.sectionHeader}>
                            <Text style={Styles.sectionTitle}>Coaches</Text>
                        </View>
                        <View style={Styles.coachesList}>
                            {coaches.map(renderCoachCard)}
                        </View>
                    </View>
                )}

                {activeTab === 'events' && (
                    <View style={Styles.tabContent}>
                        <View style={Styles.sectionHeader}>
                            <Text style={Styles.sectionTitle}>Upcoming Events</Text>
                        </View>
                        <View style={Styles.eventsList}>
                            {events.map(renderEventCard)}
                        </View>
                    </View>
                )}

                {/* Posts Section */}
                <View style={Styles.postsSection}>
                    <View style={Styles.sectionHeader}>
                        <Text style={Styles.sectionTitle}>Posts</Text>
                        <TouchableOpacity>
                            <Text style={Styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={Styles.postsList}>
                        {posts.map(renderPostCard)}
                    </View>
                </View>

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>

            {/* Share Modal */}
            <ShareModal
                visible={showShareModal}
                onClose={() => setShowShareModal(false)}
            />
        </View>
    );
};

export default AthleteProfileScreen;
