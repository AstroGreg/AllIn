import { StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';
import Fonts from '../../constants/Fonts';

const Styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.whiteColor,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: '#DEDEDE',
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...Fonts.medium18,
        color: Colors.mainTextColor,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },

    // Profile Card
    profileCard: {
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        padding: 16,
    },

    // Share Button
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-end',
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        borderRadius: 6,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    shareButtonText: {
        ...Fonts.regular14,
        color: '#9B9F9F',
    },

    // Profile Info
    profileInfoContainer: {
        alignItems: 'center',
        marginTop: 8,
    },
    profileAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    profileNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 8,
    },
    profileName: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
    },
    profileUsername: {
        ...Fonts.regular12,
        color: '#9B9F9F',
        marginTop: 6,
        textAlign: 'center',
    },

    // Stats Row
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 17,
        width: 240,
        alignSelf: 'center',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        ...Fonts.medium16,
        color: Colors.mainTextColor,
    },
    statLabel: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    statDivider: {
        width: 1,
        height: 24,
        backgroundColor: '#DEDEDE',
    },

    // Categories
    categoriesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 17,
    },
    categoryText: {
        ...Fonts.medium14,
        color: '#9B9F9F',
    },
    categoryDivider: {
        width: 1,
        height: 16,
        backgroundColor: '#DEDEDE',
    },

    // Additional Stats
    additionalStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginTop: 17,
    },
    additionalStatItem: {
        alignItems: 'flex-start',
    },
    additionalStatItemCenter: {
        alignItems: 'center',
    },
    additionalStatItemEnd: {
        alignItems: 'flex-end',
    },
    additionalStatLabel: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    additionalStatValue: {
        ...Fonts.medium16,
        color: Colors.mainTextColor,
        marginTop: 4,
    },

    // Bio Section
    bioSection: {
        marginTop: 16,
    },
    bioHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bioTitle: {
        ...Fonts.medium16,
        color: Colors.mainTextColor,
    },
    bioText: {
        ...Fonts.regular12,
        color: '#777777',
        lineHeight: 20,
        marginTop: 8,
    },
    bioDivider: {
        height: 0.5,
        backgroundColor: '#DEDEDE',
        marginTop: 8,
    },

    // Website Container
    websiteContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginTop: 14,
        gap: 6,
    },
    websiteText: {
        flex: 1,
        ...Fonts.medium12,
        color: '#9B9F9F',
    },
    websiteActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionDivider: {
        height: 0.5,
        backgroundColor: '#DEDEDE',
        marginTop: 14,
    },

    // Toggle Tab Bar
    toggleTabBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        padding: 8,
        marginTop: 24,
    },
    toggleTab: {
        flex: 1,
        height: 39,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
    toggleTabActive: {
        backgroundColor: 'rgba(60, 130, 246, 0.3)',
    },
    toggleTabText: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    toggleTabTextActive: {
        ...Fonts.regular12,
        color: Colors.mainTextColor,
    },

    // Club Athletes Section
    clubAthletesSection: {
        marginTop: 24,
    },
    clubAthletesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    clubAthletesTitle: {
        ...Fonts.medium18,
        color: Colors.mainTextColor,
    },
    addAthleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: Colors.primaryColor,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        height: 38,
    },
    addAthleteText: {
        ...Fonts.regular14,
        color: Colors.whiteColor,
    },

    // Athletes List
    athletesList: {
        marginTop: 16,
        gap: 24,
    },

    // Athlete Card
    athleteCard: {
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        padding: 16,
    },
    athleteCardContent: {
        gap: 10,
    },
    athleteTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    athleteAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    athleteInfo: {
        flex: 1,
        gap: 2,
    },
    athleteNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    athleteName: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
    },
    athleteTypeBadge: {
        backgroundColor: '#F5F5F5',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    athleteTypeText: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    athleteDetailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    athleteCategoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    athleteCategory: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    athleteLocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    athleteLocation: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    athleteBottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    deleteButton: {
        backgroundColor: '#FDCCCC',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        height: 38,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteButtonText: {
        ...Fonts.regular14,
        color: '#FF0000',
    },
    socialIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    socialIcon: {
        width: 36,
        height: 36,
        borderRadius: 6,
    },

    // Coach Card specific styles
    coachClubRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    coachClubLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    coachClubLabel: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    coachClubValue: {
        ...Fonts.regular12,
        color: Colors.mainTextColor,
    },
    coachButtonsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    emailButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        borderWidth: 1,
        borderColor: '#DEDEDE',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        height: 36,
        width: 83,
    },
    emailButtonText: {
        ...Fonts.regular14,
        color: '#9B9F9F',
    },
    coachDeleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#FDCCCC',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        height: 38,
    },
    coachDeleteButtonText: {
        ...Fonts.regular14,
        color: '#FF0000',
    },

    // Event Card styles
    eventCard: {
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        padding: 16,
    },
    eventCardContent: {
        gap: 12,
    },
    eventTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    eventImage: {
        width: 86,
        height: 86,
        borderRadius: 10,
    },
    eventInfo: {
        flex: 1,
        gap: 6,
    },
    eventTitle: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
    },
    eventDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    eventDetailLabel: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    eventDetailValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    eventDetailValue: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    eventDivider: {
        height: 0.5,
        backgroundColor: '#DEDEDE',
        marginTop: 10,
    },
    eventDeleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FDCCCC',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        height: 38,
        alignSelf: 'flex-start',
    },
    eventDeleteButtonText: {
        ...Fonts.regular14,
        color: '#FF0000',
    },

    // View All Button
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: Colors.primaryColor,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginTop: 16,
        alignSelf: 'center',
        height: 38,
    },
    viewAllText: {
        ...Fonts.regular14,
        color: Colors.whiteColor,
    },

    // Email Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emailModalContainer: {
        backgroundColor: Colors.whiteColor,
        borderRadius: 16,
        padding: 20,
        width: '85%',
        maxWidth: 350,
    },
    emailModalTitle: {
        ...Fonts.medium16,
        color: Colors.mainTextColor,
        textAlign: 'center',
        marginBottom: 20,
    },
    emailModalInputGroup: {
        marginBottom: 20,
    },
    emailModalInputLabel: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
    },
    emailModalInputContainer: {
        height: 54,
        backgroundColor: '#F7FAFF',
        borderWidth: 0.5,
        borderColor: '#E0ECFE',
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    emailModalInput: {
        flex: 1,
        ...Fonts.regular14,
        color: Colors.mainTextColor,
    },
    emailModalButtonsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    emailModalCancelButton: {
        flex: 1,
        height: 48,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emailModalCancelButtonText: {
        ...Fonts.medium14,
        color: '#9B9F9F',
    },
    emailModalSaveButton: {
        flex: 1,
        height: 48,
        borderRadius: 10,
        backgroundColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emailModalSaveButtonText: {
        ...Fonts.medium14,
        color: Colors.whiteColor,
    },

    // Coach Details Modal Styles
    coachModalContainer: {
        backgroundColor: Colors.whiteColor,
        borderRadius: 16,
        padding: 20,
        width: '85%',
        maxWidth: 380,
    },
    coachModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    coachModalAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    coachModalInfo: {
        flex: 1,
        marginLeft: 12,
    },
    coachModalName: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
    },
    coachModalLocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    coachModalLocation: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    coachModalCategoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    coachModalCategory: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    coachModalAthletesSection: {
        marginBottom: 20,
    },
    coachModalAthletesTitle: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
        marginBottom: 16,
    },
    coachModalAthleteRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    coachModalAthleteInfo: {
        flex: 1,
    },
    coachModalAthleteName: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
    },
    coachModalAthleteEvent: {
        ...Fonts.regular12,
        color: '#9B9F9F',
        marginTop: 2,
    },
    coachModalAthletePB: {
        alignItems: 'flex-end',
    },
    coachModalAthletePBLabel: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    coachModalAthletePBValue: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
        marginTop: 2,
    },
    coachModalCloseButton: {
        height: 48,
        borderRadius: 10,
        backgroundColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    coachModalCloseButtonText: {
        ...Fonts.medium14,
        color: Colors.whiteColor,
    },
});

export default Styles;
