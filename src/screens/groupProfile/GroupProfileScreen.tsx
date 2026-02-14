import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import React, { useState } from 'react';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Images from '../../constants/Images';
import { createStyles } from './GroupProfileStyles';
import { ArrowLeft2, User, ArrowRight, Edit2, Trash, Add, Location, Note, Sms, Map, Calendar } from 'iconsax-react-nativejs';
import Icons from '../../constants/Icons';
import ShareModal from '../../components/shareModal/ShareModal';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const GroupProfileScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const [activeTab, setActiveTab] = useState<'athletes' | 'coaches' | 'events'>('athletes');
    const [emailModalVisible, setEmailModalVisible] = useState(false);
    const [emailInput, setEmailInput] = useState('');
    const [coachModalVisible, setCoachModalVisible] = useState(false);
    const [selectedCoach, setSelectedCoach] = useState<any>(null);
    const [showShareModal, setShowShareModal] = useState(false);

    const tabs: Array<'athletes' | 'coaches' | 'events'> = ['athletes', 'coaches', 'events'];

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
            style={styles.athleteCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AthleteProfileScreen', { athlete })}
        >
            <View style={styles.athleteCardContent}>
                {/* Top Row - Avatar and Info */}
                <View style={styles.athleteTopRow}>
                    <FastImage source={Images.profilePic} style={styles.athleteAvatar} resizeMode="cover" />
                    <View style={styles.athleteInfo}>
                        {/* Name and Type Badge */}
                        <View style={styles.athleteNameRow}>
                        <Text style={styles.athleteName}>{athlete.name}</Text>
                        <View style={styles.athleteTypeBadge}>
                            <Text style={styles.athleteTypeText}>{athlete.type}</Text>
                        </View>
                    </View>
                        {/* Category and Location */}
                        <View style={styles.athleteDetailsRow}>
                            <View style={styles.athleteCategoryRow}>
                                <Icons.Run width={16} height={16} />
                                <Text style={styles.athleteCategory}>{athlete.category}</Text>
                            </View>
                            <View style={styles.athleteLocationRow}>
                                <Location size={16} color={colors.subTextColor} variant="Linear" />
                                <Text style={styles.athleteLocation}>{athlete.location}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Bottom Row - Delete Button and Social Icons */}
                <View style={styles.athleteBottomRow}>
                    <TouchableOpacity style={styles.deleteButton} onPress={(e) => e.stopPropagation()}>
                        <Text style={styles.deleteButtonText}>{t('Delete')}</Text>
                    </TouchableOpacity>
                    <View style={styles.socialIcons}>
                        <TouchableOpacity onPress={(e) => e.stopPropagation()}>
                            <FastImage source={Icons.Strava} style={styles.socialIcon} resizeMode="cover" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={(e) => e.stopPropagation()}>
                            <FastImage source={Icons.Instagram} style={styles.socialIcon} resizeMode="cover" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderCoachCard = (coach: any) => (
        <TouchableOpacity
            key={coach.id}
            style={styles.athleteCard}
            activeOpacity={0.8}
            onPress={() => {
                setSelectedCoach(coach);
                setCoachModalVisible(true);
            }}
        >
            <View style={styles.athleteCardContent}>
                {/* Top Row - Avatar and Info */}
                <View style={styles.athleteTopRow}>
                    <FastImage source={Images.profilePic} style={styles.athleteAvatar} resizeMode="cover" />
                    <View style={styles.athleteInfo}>
                        {/* Name and Type Badge */}
                        <View style={styles.athleteNameRow}>
                            <Text style={styles.athleteName}>{coach.name}</Text>
                            <View style={styles.athleteTypeBadge}>
                                <Text style={styles.athleteTypeText}>{coach.type}</Text>
                            </View>
                        </View>
                        {/* Category and Location */}
                        <View style={styles.athleteDetailsRow}>
                            <View style={styles.athleteCategoryRow}>
                                <Icons.Run width={16} height={16} />
                                <Text style={styles.athleteCategory}>{coach.category}</Text>
                            </View>
                            <View style={styles.athleteLocationRow}>
                                <Location size={16} color={colors.subTextColor} variant="Linear" />
                                <Text style={styles.athleteLocation}>{coach.location}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Club Row */}
                <View style={styles.coachClubRow}>
                    <View style={styles.coachClubLabelRow}>
                        <Note size={16} color={colors.subTextColor} variant="Linear" />
                        <Text style={styles.coachClubLabel}>{t('Club')}:</Text>
                    </View>
                    <Text style={styles.coachClubValue}>{coach.club}</Text>
                </View>

                {/* Bottom Row - Email and Delete Buttons */}
                <View style={styles.coachButtonsRow}>
                    <TouchableOpacity style={styles.emailButton} onPress={(e) => { e.stopPropagation(); setEmailModalVisible(true); }}>
                        <Text style={styles.emailButtonText}>{t('Email')}</Text>
                        <Sms size={16} color={colors.subTextColor} variant="Linear" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.coachDeleteButton} onPress={(e) => e.stopPropagation()}>
                        <Text style={styles.coachDeleteButtonText}>{t('Delete')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderEventCard = (event: any) => (
        <TouchableOpacity
            key={event.id}
            style={styles.eventCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('EventAthletesScreen', { event })}
        >
            <View style={styles.eventCardContent}>
                {/* Top Row - Image and Info */}
                <View style={styles.eventTopRow}>
                    <FastImage source={event.image} style={styles.eventImage} resizeMode="cover" />
                    <View style={styles.eventInfo}>
                        {/* Title */}
                        <Text style={styles.eventTitle}>{event.title}</Text>

                        {/* Distance Row */}
                        <View style={styles.eventDetailRow}>
                            <Text style={styles.eventDetailLabel}>{t('Distance')}</Text>
                            <View style={styles.eventDetailValueRow}>
                                <Map size={16} color={colors.subTextColor} variant="Linear" />
                                <Text style={styles.eventDetailValue}>{event.distance}</Text>
                            </View>
                        </View>

                        {/* Location Row */}
                        <View style={styles.eventDetailRow}>
                            <Text style={styles.eventDetailLabel}>{t('Location')}</Text>
                            <View style={styles.eventDetailValueRow}>
                                <Location size={16} color={colors.subTextColor} variant="Linear" />
                                <Text style={styles.eventDetailValue}>{event.location}</Text>
                            </View>
                        </View>

                        {/* Date Row */}
                        <View style={styles.eventDetailRow}>
                            <Text style={styles.eventDetailLabel}>{t('Date')}</Text>
                            <View style={styles.eventDetailValueRow}>
                                <Calendar size={16} color={colors.subTextColor} variant="Linear" />
                                <Text style={styles.eventDetailValue}>{event.date}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.eventDivider} />

                {/* Delete Button */}
                <TouchableOpacity style={styles.eventDeleteButton} onPress={(e) => e.stopPropagation()}>
                    <Text style={styles.eventDeleteButtonText}>{t('Delete')}</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'athletes':
                return (
                    <View style={styles.clubAthletesSection}>
                        <View style={styles.clubAthletesHeader}>
                            <Text style={styles.clubAthletesTitle}>{t('Club Athletes')}</Text>
                            <TouchableOpacity style={styles.addAthleteButton} onPress={() => navigation.navigate('AddAthleteScreen')}>
                                <Text style={styles.addAthleteText}>{t('Add Athlete')}</Text>
                                <Add size={24} color={colors.pureWhite} variant="Linear" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.athletesList}>
                            {athletes.map(renderAthleteCard)}
                        </View>
                        <TouchableOpacity style={styles.viewAllButton}>
                            <Text style={styles.viewAllText}>{t('View All')}</Text>
                            <ArrowRight size={24} color={colors.pureWhite} variant="Linear" />
                        </TouchableOpacity>
                    </View>
                );
            case 'coaches':
                return (
                    <View style={styles.clubAthletesSection}>
                        <View style={styles.clubAthletesHeader}>
                            <Text style={styles.clubAthletesTitle}>{t('Club Coaches')}</Text>
                            <TouchableOpacity style={styles.addAthleteButton} onPress={() => navigation.navigate('AddCoachScreen')}>
                                <Text style={styles.addAthleteText}>{t('Add Coach')}</Text>
                                <Add size={24} color={colors.pureWhite} variant="Linear" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.athletesList}>
                            {coaches.map(renderCoachCard)}
                        </View>
                        <TouchableOpacity style={styles.viewAllButton}>
                            <Text style={styles.viewAllText}>{t('View All')}</Text>
                            <ArrowRight size={24} color={colors.pureWhite} variant="Linear" />
                        </TouchableOpacity>
                    </View>
                );
            case 'events':
                return (
                    <View style={styles.clubAthletesSection}>
                        <View style={styles.clubAthletesHeader}>
                            <Text style={styles.clubAthletesTitle}>{t('Events')}</Text>
                            <TouchableOpacity style={styles.addAthleteButton}>
                                <Text style={styles.addAthleteText}>{t('Add Event')}</Text>
                                <Add size={24} color={colors.pureWhite} variant="Linear" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.athletesList}>
                            {events.map(renderEventCard)}
                        </View>
                        <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate('GroupEventsViewAllScreen')}>
                            <Text style={styles.viewAllText}>{t('View All')}</Text>
                            <ArrowRight size={24} color={colors.pureWhite} variant="Linear" />
                        </TouchableOpacity>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Profile')}</Text>
                <TouchableOpacity style={styles.headerButton}>
                    <User size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    {/* Share Button */}
                    <TouchableOpacity style={styles.shareButton} onPress={() => setShowShareModal(true)}>
                        <Text style={styles.shareButtonText}>{t('Share')}</Text>
                        <ArrowRight size={24} color={colors.subTextColor} variant="Linear" />
                    </TouchableOpacity>

                    {/* Profile Info */}
                    <View style={styles.profileInfoContainer}>
                        <FastImage source={Images.profilePic} style={styles.profileAvatar} resizeMode="cover" />
                        <View style={styles.profileNameRow}>
                            <Text style={styles.profileName}>{t('James Ray')}</Text>
                            <Icons.BlueTick width={16} height={16} />
                        </View>
                        <Text style={styles.profileUsername}>jamesray2@</Text>
                    </View>

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
                    <View style={styles.categoriesRow}>
                        <Text style={styles.categoryText}>{t('Track and Field')}</Text>
                        <View style={styles.categoryDivider} />
                        <Text style={styles.categoryText}>{t('Boxing')}</Text>
                        <View style={styles.categoryDivider} />
                        <Text style={styles.categoryText}>{t('Cross Country')}</Text>
                    </View>

                    {/* Additional Stats */}
                    <View style={styles.additionalStatsRow}>
                        <View style={styles.additionalStatItem}>
                            <Text style={styles.additionalStatLabel}>{t('Coaches')}</Text>
                            <Text style={styles.additionalStatValue}>3</Text>
                        </View>
                        <View style={styles.additionalStatItemCenter}>
                            <Text style={styles.additionalStatLabel}>{t('Athletes')}</Text>
                            <Text style={styles.additionalStatValue}>17</Text>
                        </View>
                        <View style={styles.additionalStatItemEnd}>
                            <Text style={styles.additionalStatLabel}>{t('Upcoming Events')}</Text>
                            <Text style={styles.additionalStatValue}>4</Text>
                        </View>
                    </View>

                    {/* Bio Section */}
                    <View style={styles.bioSection}>
                        <View style={styles.bioHeader}>
                            <Text style={styles.bioTitle}>{t('Bio')}</Text>
                            <TouchableOpacity>
                                <Edit2 size={24} color={colors.subTextColor} variant="Linear" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.bioText}>
                            {t('Premier athletics club in Belgium, dedicated to developing world-class athletes through professional coaching, state-of-the-art facilities, and comprehensive training programs. Established in 2010.')}
                        </Text>
                        <View style={styles.bioDivider} />
                    </View>

                    {/* Website Link */}
                    <View style={styles.websiteContainer}>
                        <Icons.Website width={16} height={16} />
                        <Text style={styles.websiteText}>georgia.young@example.com</Text>
                        <View style={styles.websiteActions}>
                            <TouchableOpacity>
                                <Trash size={24} color={colors.subTextColor} variant="Linear" />
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Edit2 size={24} color={colors.subTextColor} variant="Linear" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.sectionDivider} />
                </View>

                {/* Toggle Tab Bar */}
                <View style={styles.toggleTabBar}>
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.toggleTab, activeTab === tab && styles.toggleTabActive]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[styles.toggleTabText, activeTab === tab && styles.toggleTabTextActive]}>
                                {t(tab === 'athletes' ? 'Athletes' : tab === 'coaches' ? 'Coaches' : 'Events')}
                            </Text>
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
                <View style={styles.modalOverlay}>
                    <View style={styles.emailModalContainer}>
                        <Text style={styles.emailModalTitle}>{t('Edit your Email')}</Text>

                        <View style={styles.emailModalInputGroup}>
                            <Text style={styles.emailModalInputLabel}>{t('Email')}</Text>
                            <SizeBox height={8} />
                            <View style={styles.emailModalInputContainer}>
                                <Sms size={24} color={colors.primaryColor} variant="Linear" />
                                <SizeBox width={10} />
                                <TextInput
                                    style={styles.emailModalInput}
                                    placeholder={t('Enter email')}
                                    placeholderTextColor={colors.grayColor}
                                    value={emailInput}
                                    onChangeText={setEmailInput}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        <View style={styles.emailModalButtonsRow}>
                            <TouchableOpacity
                                style={styles.emailModalCancelButton}
                                onPress={() => {
                                    setEmailModalVisible(false);
                                    setEmailInput('');
                                }}
                            >
                                <Text style={styles.emailModalCancelButtonText}>{t('Cancel')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.emailModalSaveButton}
                                onPress={() => {
                                    // Handle save email
                                    setEmailModalVisible(false);
                                    setEmailInput('');
                                }}
                            >
                                <Text style={styles.emailModalSaveButtonText}>{t('Save')}</Text>
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
                <View style={styles.modalOverlay}>
                    <View style={styles.coachModalContainer}>
                        {selectedCoach && (
                            <>
                                {/* Coach Header */}
                                <View style={styles.coachModalHeader}>
                                    <FastImage source={Images.profilePic} style={styles.coachModalAvatar} resizeMode="cover" />
                                    <View style={styles.coachModalInfo}>
                                        <Text style={styles.coachModalName}>{selectedCoach.name}</Text>
                                        <View style={styles.coachModalLocationRow}>
                                            <Location size={14} color={colors.subTextColor} variant="Linear" />
                                            <Text style={styles.coachModalLocation}>{selectedCoach.club}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.coachModalCategoryRow}>
                                        <Icons.Run width={16} height={16} />
                                        <Text style={styles.coachModalCategory}>{selectedCoach.category}</Text>
                                    </View>
                                </View>

                                {/* Athletes Section */}
                                <View style={styles.coachModalAthletesSection}>
                                    <Text style={styles.coachModalAthletesTitle}>
                                        {t('Athletes')} ({selectedCoach.athletes?.length || 0})
                                    </Text>

                                    {selectedCoach.athletes?.map((athlete: any, index: number) => (
                                        <View key={index} style={styles.coachModalAthleteRow}>
                                            <View style={styles.coachModalAthleteInfo}>
                                                <Text style={styles.coachModalAthleteName}>{athlete.name}</Text>
                                                <Text style={styles.coachModalAthleteEvent}>{athlete.event}</Text>
                                            </View>
                                            <View style={styles.coachModalAthletePB}>
                                                <Text style={styles.coachModalAthletePBLabel}>{t('Personal Best')}</Text>
                                                <Text style={styles.coachModalAthletePBValue}>{athlete.personalBest}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>

                                {/* Close Button */}
                                <TouchableOpacity
                                    style={styles.coachModalCloseButton}
                                    onPress={() => {
                                        setCoachModalVisible(false);
                                        setSelectedCoach(null);
                                    }}
                                >
                                    <Text style={styles.coachModalCloseButtonText}>{t('Close')}</Text>
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
