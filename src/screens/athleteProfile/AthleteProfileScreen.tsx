import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import React, { useState } from 'react';
import { createStyles } from './AthleteProfileStyles';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Images from '../../constants/Images';
import Icons from '../../constants/Icons';
import {
    ArrowLeft2,
    User,
    Global,
    Location,
    Calendar,
} from 'iconsax-react-nativejs';
import ShareModal from '../../components/shareModal/ShareModal';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const AthleteProfileScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
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
        { id: 1, name: 'Coach Anderson', specialty: t('Track and Field'), avatar: Images.profile1 },
        { id: 2, name: 'Coach Williams', specialty: 'Boxing', avatar: Images.profile1 },
        { id: 3, name: 'Coach Martinez', specialty: t('Cross Country'), avatar: Images.profile1 },
    ];

    const events = [
        { id: 1, title: t('City Run Marathon'), distance: t('800m heat 1'), location: t('Dhaka'), date: '27/05/2025', image: Images.photo1 },
        { id: 2, title: 'National Championship', distance: '400m finals', location: 'New York', date: '15/06/2025', image: Images.photo1 },
    ];

    const posts = [
        {
            id: 1,
            title: t('IFAM Outdoor Oordegem'),
            date: '09/08/2025',
            description: t("Elias took part in the 800m and achieved a time close to his best 1'50\"99. For Lode it was a disappointing first half of his match DNF in the 5000m"),
            image: Images.photo1,
        },
        {
            id: 2,
            title: t('BK 10000m AC Duffel'),
            date: '09/06/2025',
            description: t('This race meant everything to me. Running the European Championships on home soil, with my family and friends lining'),
            image: Images.photo3,
        },
    ];

    const renderAthleteCard = (athleteItem: any) => (
        <View key={athleteItem.id} style={styles.clubAthleteCard}>
            <FastImage source={athleteItem.avatar} style={styles.clubAthleteAvatar} resizeMode="cover" />
            <View style={styles.clubAthleteInfo}>
                <Text style={styles.clubAthleteName}>{athleteItem.name}</Text>
                <Text style={styles.clubAthleteUsername}>{athleteItem.username}</Text>
            </View>
            <TouchableOpacity
                style={[
                    styles.followButton,
                    athleteItem.isFollowing && styles.followingButton
                ]}
            >
                <Text style={[
                    styles.followButtonText,
                    athleteItem.isFollowing && styles.followingButtonText
                ]}>
                    {athleteItem.isFollowing ? t('Following') : t('Follow')}
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderCoachCard = (coach: any) => (
        <View key={coach.id} style={styles.coachCard}>
            <FastImage source={coach.avatar} style={styles.coachAvatar} resizeMode="cover" />
            <View style={styles.coachInfo}>
                <Text style={styles.coachName}>{coach.name}</Text>
                <Text style={styles.coachSpecialty}>{coach.specialty}</Text>
            </View>
        </View>
    );

    const renderEventCard = (event: any) => (
        <View key={event.id} style={styles.eventCard}>
            <FastImage source={event.image} style={styles.eventImage} resizeMode="cover" />
            <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <View style={styles.eventDetailRow}>
                    <Icons.Map width={14} height={14} />
                    <Text style={styles.eventDetailText}>{event.distance}</Text>
                </View>
                <View style={styles.eventDetailRow}>
                    <Location size={14} color={colors.subTextColor} variant="Linear" />
                    <Text style={styles.eventDetailText}>{event.location}</Text>
                </View>
                <View style={styles.eventDetailRow}>
                    <Calendar size={14} color={colors.subTextColor} variant="Linear" />
                    <Text style={styles.eventDetailText}>{event.date}</Text>
                </View>
            </View>
        </View>
    );

    const renderPostCard = (post: any) => (
        <TouchableOpacity key={post.id} style={styles.postCard} activeOpacity={0.8}>
            <View style={styles.postImageContainer}>
                <FastImage source={post.image} style={styles.postImage} resizeMode="cover" />
            </View>
            <View style={styles.postInfoBar}>
                <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postDate}>{post.date}</Text>
        </View>
        <Text style={styles.postDescription} numberOfLines={3}>{post.description}</Text>
        <TouchableOpacity style={styles.sharePostButton}>
            <Text style={styles.sharePostButtonText}>{t('Share')}</Text>
            <Image source={Icons.ShareBlue} style={{ width: 18, height: 18, tintColor: colors.pureWhite }} />
        </TouchableOpacity>
    </TouchableOpacity>
    );

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Profile')}</Text>
                <View style={styles.headerButtonPlaceholder} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    {/* Share Button */}
                    <TouchableOpacity style={styles.shareButton} onPress={() => setShowShareModal(true)}>
                        <Text style={styles.shareButtonText}>{t('Share')}</Text>
                        <Image source={Icons.ShareGray} style={{ width: 18, height: 18 }} />
                    </TouchableOpacity>

                    {/* Profile Image */}
                    <View style={styles.profileImageContainer}>
                        <FastImage source={athlete?.avatar || Images.profile1} style={styles.profileImage} resizeMode="cover" />
                    </View>

                    {/* Name */}
                    <View style={styles.nameContainer}>
                        <Text style={styles.userName}>{athlete?.name || t('James Ray')}</Text>
                        <Icons.BlueTick width={16} height={16} />
                    </View>

                    {/* Handle */}
                    <Text style={styles.userHandle}>@{athlete?.username || 'jamesray2'}</Text>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>1.2K</Text>
                            <Text style={styles.statLabel}>{t('Posts')}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>45.8K</Text>
                            <Text style={styles.statLabel}>{t('Followers')}</Text>
                        </View>
                    </View>

                    {/* Categories */}
                    <View style={styles.categoriesContainer}>
                        <Text style={styles.categoryText}>{t('Track and Field')}</Text>
                        <Text style={styles.categorySeparator}>|</Text>
                        <Text style={styles.categoryText}>{t('Boxing')}</Text>
                        <Text style={styles.categorySeparator}>|</Text>
                        <Text style={styles.categoryText}>{t('Cross Country')}</Text>
                    </View>

                    {/* Additional Stats */}
                    <View style={styles.additionalStatsRow}>
                        <View style={styles.additionalStatItem}>
                            <Text style={styles.additionalStatValue}>3</Text>
                            <Text style={styles.additionalStatLabel}>{t('Coaches')}</Text>
                        </View>
                        <View style={styles.additionalStatItem}>
                            <Text style={styles.additionalStatValue}>17</Text>
                            <Text style={styles.additionalStatLabel}>{t('Athletes')}</Text>
                        </View>
                        <View style={styles.additionalStatItem}>
                            <Text style={styles.additionalStatValue}>4</Text>
                            <Text style={styles.additionalStatLabel}>{t('Upcoming Events')}</Text>
                        </View>
                    </View>

                    {/* Bio Section */}
                    <View style={styles.bioSection}>
                        <Text style={styles.bioTitle}>{t('Bio')}</Text>
                        <Text style={styles.bioText}>
                            {t('Passionate athlete dedicated to pushing limits and achieving excellence in track and field events.')}
                        </Text>
                    </View>

                    <View style={styles.separator} />

                    {/* Links Section */}
                    <View style={styles.linksSection}>
                        <View style={styles.linkRow}>
                            <View style={styles.linkChip}>
                                <FastImage source={Icons.Facebook} style={{ width: 16, height: 16 }} />
                                <Text style={styles.linkText}>{t('Facebook profile')}</Text>
                            </View>
                            <View style={styles.linkChip}>
                                <Global size={16} color={colors.subTextColor} variant="Linear" />
                                <Text style={styles.linkText}>{t('Website')}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Toggle Tab Bar */}
                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        style={[styles.toggleButton, activeTab === 'athletes' && styles.toggleButtonActive]}
                        onPress={() => setActiveTab('athletes')}
                    >
                        <Text style={activeTab === 'athletes' ? styles.toggleTextActive : styles.toggleText}>{t('Athletes')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleButton, activeTab === 'coaches' && styles.toggleButtonActive]}
                        onPress={() => setActiveTab('coaches')}
                    >
                        <Text style={activeTab === 'coaches' ? styles.toggleTextActive : styles.toggleText}>{t('Coaches')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleButton, activeTab === 'events' && styles.toggleButtonActive]}
                        onPress={() => setActiveTab('events')}
                    >
                        <Text style={activeTab === 'events' ? styles.toggleTextActive : styles.toggleText}>{t('Events')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Tab Content */}
                {activeTab === 'athletes' && (
                    <View style={styles.tabContent}>
                        {/* Club Athletes Header */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{t('Club Athletes')}</Text>
                            <View style={styles.athleteCountBadge}>
                                <Text style={styles.athleteCountText}>{t('430 Athletes Available')}</Text>
                            </View>
                        </View>

                        {/* Athletes List */}
                        <View style={styles.athletesList}>
                            {clubAthletes.map(renderAthleteCard)}
                        </View>
                    </View>
                )}

                {activeTab === 'coaches' && (
                    <View style={styles.tabContent}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{t('Coaches')}</Text>
                        </View>
                        <View style={styles.coachesList}>
                            {coaches.map(renderCoachCard)}
                        </View>
                    </View>
                )}

                {activeTab === 'events' && (
                    <View style={styles.tabContent}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{t('Upcoming Events')}</Text>
                        </View>
                        <View style={styles.eventsList}>
                            {events.map(renderEventCard)}
                        </View>
                    </View>
                )}

                {/* Posts Section */}
                <View style={styles.postsSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('Posts')}</Text>
                        <TouchableOpacity>
                            <Text style={styles.viewAllText}>{t('View All')}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.postsList}>
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
