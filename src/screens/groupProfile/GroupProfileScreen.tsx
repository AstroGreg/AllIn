import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import React, { useState } from 'react';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Images from '../../constants/Images';
import Colors from '../../constants/Colors';
import Styles from './GroupProfileStyles';
import { ArrowLeft2, User, ArrowRight, Edit2, Trash, Add, Location, Note, Sms, Map, Calendar } from 'iconsax-react-nativejs';
import Icons from '../../constants/Icons';
import ShareModal from '../../components/shareModal/ShareModal';

const GroupProfileScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState('Athletes');
    const [emailModalVisible, setEmailModalVisible] = useState(false);
    const [emailInput, setEmailInput] = useState('');
    const [coachModalVisible, setCoachModalVisible] = useState(false);
    const [selectedCoach, setSelectedCoach] = useState<any>(null);
    const [showShareModal, setShowShareModal] = useState(false);

    const tabs = ['Athletes', 'Coaches', 'Events'];

    const athletes = [
        { id: 1, name: 'James Ray', type: 'Athlete', category: 'Marathon', location: 'Dhaka' },
        { id: 2, name: 'James Ray', type: 'Athlete', category: 'Marathon', location: 'Dhaka' },
        { id: 3, name: 'James Ray', type: 'Athlete', category: 'Marathon', location: 'Dhaka' },
        { id: 4, name: 'James Ray', type: 'Athlete', category: 'Marathon', location: 'Dhaka' },
    ];

    const coaches = [
        {
            id: 1,
            name: 'James Ray',
            type: 'Athlete',
            category: 'Marathon',
            location: 'Dhaka',
            club: 'Olympic Training Center',
            athletes: [
                { name: 'Anna Peterson', event: '5000m', personalBest: '15:32.10' },
                { name: 'Anna Peterson', event: '5000m', personalBest: '15:32.10' },
                { name: 'Anna Peterson', event: '5000m', personalBest: '15:32.10' },
            ]
        },
        {
            id: 2,
            name: 'James Ray',
            type: 'Athlete',
            category: 'Marathon',
            location: 'Dhaka',
            club: 'Olympic Training Center',
            athletes: [
                { name: 'Anna Peterson', event: '5000m', personalBest: '15:32.10' },
                { name: 'Anna Peterson', event: '5000m', personalBest: '15:32.10' },
            ]
        },
        {
            id: 3,
            name: 'James Ray',
            type: 'Athlete',
            category: 'Marathon',
            location: 'Dhaka',
            club: 'Olympic Training Center',
            athletes: [
                { name: 'Anna Peterson', event: '5000m', personalBest: '15:32.10' },
            ]
        },
        {
            id: 4,
            name: 'James Ray',
            type: 'Athlete',
            category: 'Marathon',
            location: 'Dhaka',
            club: 'Olympic Training Center',
            athletes: []
        },
    ];

    const events = [
        { id: 1, title: 'City Run Marathon', distance: '800m heat 1', location: 'Dhaka', date: '27/05/2025', image: Images.photo1 },
        { id: 2, title: 'City Run Marathon', distance: '800m heat 1', location: 'Dhaka', date: '27/05/2025', image: Images.photo1 },
    ];

    const renderAthleteCard = (athlete: any) => (
        <TouchableOpacity
            key={athlete.id}
            style={Styles.athleteCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AthleteProfileScreen', { athlete })}
        >
            <View style={Styles.athleteCardContent}>
                {/* Top Row - Avatar and Info */}
                <View style={Styles.athleteTopRow}>
                    <FastImage source={Images.profilePic} style={Styles.athleteAvatar} resizeMode="cover" />
                    <View style={Styles.athleteInfo}>
                        {/* Name and Type Badge */}
                        <View style={Styles.athleteNameRow}>
                            <Text style={Styles.athleteName}>{athlete.name}</Text>
                            <View style={Styles.athleteTypeBadge}>
                                <Text style={Styles.athleteTypeText}>{athlete.type}</Text>
                            </View>
                        </View>
                        {/* Category and Location */}
                        <View style={Styles.athleteDetailsRow}>
                            <View style={Styles.athleteCategoryRow}>
                                <Icons.Run width={16} height={16} />
                                <Text style={Styles.athleteCategory}>{athlete.category}</Text>
                            </View>
                            <View style={Styles.athleteLocationRow}>
                                <Location size={16} color="#9B9F9F" variant="Linear" />
                                <Text style={Styles.athleteLocation}>{athlete.location}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Bottom Row - Delete Button and Social Icons */}
                <View style={Styles.athleteBottomRow}>
                    <TouchableOpacity style={Styles.deleteButton} onPress={(e) => e.stopPropagation()}>
                        <Text style={Styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                    <View style={Styles.socialIcons}>
                        <TouchableOpacity onPress={(e) => e.stopPropagation()}>
                            <FastImage source={Icons.Strava} style={Styles.socialIcon} resizeMode="cover" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={(e) => e.stopPropagation()}>
                            <FastImage source={Icons.Instagram} style={Styles.socialIcon} resizeMode="cover" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderCoachCard = (coach: any) => (
        <TouchableOpacity
            key={coach.id}
            style={Styles.athleteCard}
            activeOpacity={0.8}
            onPress={() => {
                setSelectedCoach(coach);
                setCoachModalVisible(true);
            }}
        >
            <View style={Styles.athleteCardContent}>
                {/* Top Row - Avatar and Info */}
                <View style={Styles.athleteTopRow}>
                    <FastImage source={Images.profilePic} style={Styles.athleteAvatar} resizeMode="cover" />
                    <View style={Styles.athleteInfo}>
                        {/* Name and Type Badge */}
                        <View style={Styles.athleteNameRow}>
                            <Text style={Styles.athleteName}>{coach.name}</Text>
                            <View style={Styles.athleteTypeBadge}>
                                <Text style={Styles.athleteTypeText}>{coach.type}</Text>
                            </View>
                        </View>
                        {/* Category and Location */}
                        <View style={Styles.athleteDetailsRow}>
                            <View style={Styles.athleteCategoryRow}>
                                <Icons.Run width={16} height={16} />
                                <Text style={Styles.athleteCategory}>{coach.category}</Text>
                            </View>
                            <View style={Styles.athleteLocationRow}>
                                <Location size={16} color="#9B9F9F" variant="Linear" />
                                <Text style={Styles.athleteLocation}>{coach.location}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Club Row */}
                <View style={Styles.coachClubRow}>
                    <View style={Styles.coachClubLabelRow}>
                        <Note size={16} color="#9B9F9F" variant="Linear" />
                        <Text style={Styles.coachClubLabel}>Club:</Text>
                    </View>
                    <Text style={Styles.coachClubValue}>{coach.club}</Text>
                </View>

                {/* Bottom Row - Email and Delete Buttons */}
                <View style={Styles.coachButtonsRow}>
                    <TouchableOpacity style={Styles.emailButton} onPress={(e) => { e.stopPropagation(); setEmailModalVisible(true); }}>
                        <Text style={Styles.emailButtonText}>Email</Text>
                        <Sms size={16} color="#9B9F9F" variant="Linear" />
                    </TouchableOpacity>
                    <TouchableOpacity style={Styles.coachDeleteButton} onPress={(e) => e.stopPropagation()}>
                        <Text style={Styles.coachDeleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderEventCard = (event: any) => (
        <TouchableOpacity
            key={event.id}
            style={Styles.eventCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('EventAthletesScreen', { event })}
        >
            <View style={Styles.eventCardContent}>
                {/* Top Row - Image and Info */}
                <View style={Styles.eventTopRow}>
                    <FastImage source={event.image} style={Styles.eventImage} resizeMode="cover" />
                    <View style={Styles.eventInfo}>
                        {/* Title */}
                        <Text style={Styles.eventTitle}>{event.title}</Text>

                        {/* Distance Row */}
                        <View style={Styles.eventDetailRow}>
                            <Text style={Styles.eventDetailLabel}>Distance</Text>
                            <View style={Styles.eventDetailValueRow}>
                                <Map size={16} color="#9B9F9F" variant="Linear" />
                                <Text style={Styles.eventDetailValue}>{event.distance}</Text>
                            </View>
                        </View>

                        {/* Location Row */}
                        <View style={Styles.eventDetailRow}>
                            <Text style={Styles.eventDetailLabel}>Location</Text>
                            <View style={Styles.eventDetailValueRow}>
                                <Location size={16} color="#9B9F9F" variant="Linear" />
                                <Text style={Styles.eventDetailValue}>{event.location}</Text>
                            </View>
                        </View>

                        {/* Date Row */}
                        <View style={Styles.eventDetailRow}>
                            <Text style={Styles.eventDetailLabel}>Date</Text>
                            <View style={Styles.eventDetailValueRow}>
                                <Calendar size={16} color="#9B9F9F" variant="Linear" />
                                <Text style={Styles.eventDetailValue}>{event.date}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={Styles.eventDivider} />

                {/* Delete Button */}
                <TouchableOpacity style={Styles.eventDeleteButton} onPress={(e) => e.stopPropagation()}>
                    <Text style={Styles.eventDeleteButtonText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Athletes':
                return (
                    <View style={Styles.clubAthletesSection}>
                        <View style={Styles.clubAthletesHeader}>
                            <Text style={Styles.clubAthletesTitle}>Club Athletes</Text>
                            <TouchableOpacity style={Styles.addAthleteButton} onPress={() => navigation.navigate('AddAthleteScreen')}>
                                <Text style={Styles.addAthleteText}>Add Athlete</Text>
                                <Add size={24} color={Colors.whiteColor} variant="Linear" />
                            </TouchableOpacity>
                        </View>
                        <View style={Styles.athletesList}>
                            {athletes.map(renderAthleteCard)}
                        </View>
                        <TouchableOpacity style={Styles.viewAllButton}>
                            <Text style={Styles.viewAllText}>View All</Text>
                            <ArrowRight size={24} color={Colors.whiteColor} variant="Linear" />
                        </TouchableOpacity>
                    </View>
                );
            case 'Coaches':
                return (
                    <View style={Styles.clubAthletesSection}>
                        <View style={Styles.clubAthletesHeader}>
                            <Text style={Styles.clubAthletesTitle}>Club Coaches</Text>
                            <TouchableOpacity style={Styles.addAthleteButton} onPress={() => navigation.navigate('AddCoachScreen')}>
                                <Text style={Styles.addAthleteText}>Add Coach</Text>
                                <Add size={24} color={Colors.whiteColor} variant="Linear" />
                            </TouchableOpacity>
                        </View>
                        <View style={Styles.athletesList}>
                            {coaches.map(renderCoachCard)}
                        </View>
                        <TouchableOpacity style={Styles.viewAllButton}>
                            <Text style={Styles.viewAllText}>View All</Text>
                            <ArrowRight size={24} color={Colors.whiteColor} variant="Linear" />
                        </TouchableOpacity>
                    </View>
                );
            case 'Events':
                return (
                    <View style={Styles.clubAthletesSection}>
                        <View style={Styles.clubAthletesHeader}>
                            <Text style={Styles.clubAthletesTitle}>Events</Text>
                            <TouchableOpacity style={Styles.addAthleteButton}>
                                <Text style={Styles.addAthleteText}>Add Event</Text>
                                <Add size={24} color={Colors.whiteColor} variant="Linear" />
                            </TouchableOpacity>
                        </View>
                        <View style={Styles.athletesList}>
                            {events.map(renderEventCard)}
                        </View>
                        <TouchableOpacity style={Styles.viewAllButton} onPress={() => navigation.navigate('GroupEventsViewAllScreen')}>
                            <Text style={Styles.viewAllText}>View All</Text>
                            <ArrowRight size={24} color={Colors.whiteColor} variant="Linear" />
                        </TouchableOpacity>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={Colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Profile</Text>
                <TouchableOpacity style={Styles.headerButton}>
                    <User size={24} color={Colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {/* Profile Card */}
                <View style={Styles.profileCard}>
                    {/* Share Button */}
                    <TouchableOpacity style={Styles.shareButton} onPress={() => setShowShareModal(true)}>
                        <Text style={Styles.shareButtonText}>Share</Text>
                        <ArrowRight size={24} color="#9B9F9F" variant="Linear" />
                    </TouchableOpacity>

                    {/* Profile Info */}
                    <View style={Styles.profileInfoContainer}>
                        <FastImage source={Images.profilePic} style={Styles.profileAvatar} resizeMode="cover" />
                        <View style={Styles.profileNameRow}>
                            <Text style={Styles.profileName}>James Ray</Text>
                            <Icons.BlueTick width={16} height={16} />
                        </View>
                        <Text style={Styles.profileUsername}>jamesray2@</Text>
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

                    {/* Categories */}
                    <View style={Styles.categoriesRow}>
                        <Text style={Styles.categoryText}>Track and Field</Text>
                        <View style={Styles.categoryDivider} />
                        <Text style={Styles.categoryText}>Boxing</Text>
                        <View style={Styles.categoryDivider} />
                        <Text style={Styles.categoryText}>Cross Country</Text>
                    </View>

                    {/* Additional Stats */}
                    <View style={Styles.additionalStatsRow}>
                        <View style={Styles.additionalStatItem}>
                            <Text style={Styles.additionalStatLabel}>Coaches</Text>
                            <Text style={Styles.additionalStatValue}>3</Text>
                        </View>
                        <View style={Styles.additionalStatItemCenter}>
                            <Text style={Styles.additionalStatLabel}>Athletes</Text>
                            <Text style={Styles.additionalStatValue}>17</Text>
                        </View>
                        <View style={Styles.additionalStatItemEnd}>
                            <Text style={Styles.additionalStatLabel}>Upcoming Events</Text>
                            <Text style={Styles.additionalStatValue}>4</Text>
                        </View>
                    </View>

                    {/* Bio Section */}
                    <View style={Styles.bioSection}>
                        <View style={Styles.bioHeader}>
                            <Text style={Styles.bioTitle}>Bio</Text>
                            <TouchableOpacity>
                                <Edit2 size={24} color="#9B9F9F" variant="Linear" />
                            </TouchableOpacity>
                        </View>
                        <Text style={Styles.bioText}>
                            Premier athletics club in Belgium, dedicated to developing world-class athletes through professional coaching, state-of-the-art facilities, and comprehensive training programs. Established in 2010.
                        </Text>
                        <View style={Styles.bioDivider} />
                    </View>

                    {/* Website Link */}
                    <View style={Styles.websiteContainer}>
                        <Icons.Website width={16} height={16} />
                        <Text style={Styles.websiteText}>georgia.young@example.com</Text>
                        <View style={Styles.websiteActions}>
                            <TouchableOpacity>
                                <Trash size={24} color="#9B9F9F" variant="Linear" />
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Edit2 size={24} color="#9B9F9F" variant="Linear" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={Styles.sectionDivider} />
                </View>

                {/* Toggle Tab Bar */}
                <View style={Styles.toggleTabBar}>
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[Styles.toggleTab, activeTab === tab && Styles.toggleTabActive]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[Styles.toggleTabText, activeTab === tab && Styles.toggleTabTextActive]}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Tab Content */}
                {renderTabContent()}

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>

            {/* Email Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={emailModalVisible}
                onRequestClose={() => setEmailModalVisible(false)}
            >
                <View style={Styles.modalOverlay}>
                    <View style={Styles.emailModalContainer}>
                        <Text style={Styles.emailModalTitle}>Edit your Email</Text>

                        <View style={Styles.emailModalInputGroup}>
                            <Text style={Styles.emailModalInputLabel}>Email</Text>
                            <SizeBox height={8} />
                            <View style={Styles.emailModalInputContainer}>
                                <Sms size={24} color={Colors.primaryColor} variant="Linear" />
                                <SizeBox width={10} />
                                <TextInput
                                    style={Styles.emailModalInput}
                                    placeholder="Enter email"
                                    placeholderTextColor="#777777"
                                    value={emailInput}
                                    onChangeText={setEmailInput}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        <View style={Styles.emailModalButtonsRow}>
                            <TouchableOpacity
                                style={Styles.emailModalCancelButton}
                                onPress={() => {
                                    setEmailModalVisible(false);
                                    setEmailInput('');
                                }}
                            >
                                <Text style={Styles.emailModalCancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={Styles.emailModalSaveButton}
                                onPress={() => {
                                    // Handle save email
                                    setEmailModalVisible(false);
                                    setEmailInput('');
                                }}
                            >
                                <Text style={Styles.emailModalSaveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Coach Details Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={coachModalVisible}
                onRequestClose={() => setCoachModalVisible(false)}
            >
                <View style={Styles.modalOverlay}>
                    <View style={Styles.coachModalContainer}>
                        {selectedCoach && (
                            <>
                                {/* Coach Header */}
                                <View style={Styles.coachModalHeader}>
                                    <FastImage source={Images.profilePic} style={Styles.coachModalAvatar} resizeMode="cover" />
                                    <View style={Styles.coachModalInfo}>
                                        <Text style={Styles.coachModalName}>{selectedCoach.name}</Text>
                                        <View style={Styles.coachModalLocationRow}>
                                            <Location size={14} color="#9B9F9F" variant="Linear" />
                                            <Text style={Styles.coachModalLocation}>{selectedCoach.club}</Text>
                                        </View>
                                    </View>
                                    <View style={Styles.coachModalCategoryRow}>
                                        <Icons.Run width={16} height={16} />
                                        <Text style={Styles.coachModalCategory}>{selectedCoach.category}</Text>
                                    </View>
                                </View>

                                {/* Athletes Section */}
                                <View style={Styles.coachModalAthletesSection}>
                                    <Text style={Styles.coachModalAthletesTitle}>
                                        Athletes ({selectedCoach.athletes?.length || 0})
                                    </Text>

                                    {selectedCoach.athletes?.map((athlete: any, index: number) => (
                                        <View key={index} style={Styles.coachModalAthleteRow}>
                                            <View style={Styles.coachModalAthleteInfo}>
                                                <Text style={Styles.coachModalAthleteName}>{athlete.name}</Text>
                                                <Text style={Styles.coachModalAthleteEvent}>{athlete.event}</Text>
                                            </View>
                                            <View style={Styles.coachModalAthletePB}>
                                                <Text style={Styles.coachModalAthletePBLabel}>Personal Best</Text>
                                                <Text style={Styles.coachModalAthletePBValue}>{athlete.personalBest}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>

                                {/* Close Button */}
                                <TouchableOpacity
                                    style={Styles.coachModalCloseButton}
                                    onPress={() => {
                                        setCoachModalVisible(false);
                                        setSelectedCoach(null);
                                    }}
                                >
                                    <Text style={Styles.coachModalCloseButtonText}>Close</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Share Modal */}
            <ShareModal
                visible={showShareModal}
                onClose={() => setShowShareModal(false)}
            />
        </View>
    );
};

export default GroupProfileScreen;
