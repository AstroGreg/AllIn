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
    headerButtonPlaceholder: {
        width: 44,
        height: 44,
    },
    headerTitle: {
        ...Fonts.medium18,
        color: Colors.mainTextColor,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },

    // Profile Card
    profileCard: {
        backgroundColor: Colors.whiteColor,
        borderRadius: 16,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        padding: 20,
        alignItems: 'center',
        marginBottom: 20,
    },
    shareButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
    },
    shareButtonText: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    profileImageContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        overflow: 'hidden',
        marginBottom: 12,
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    userName: {
        ...Fonts.semibold18,
        color: Colors.mainTextColor,
    },
    userHandle: {
        ...Fonts.regular14,
        color: '#9B9F9F',
        marginBottom: 16,
    },

    // Stats Row
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    statValue: {
        ...Fonts.semibold18,
        color: Colors.mainTextColor,
    },
    statLabel: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#DEDEDE',
    },

    // Categories
    categoriesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    categoryText: {
        ...Fonts.regular14,
        color: Colors.primaryColor,
    },
    categorySeparator: {
        ...Fonts.regular14,
        color: '#9B9F9F',
        marginHorizontal: 8,
    },

    // Additional Stats
    additionalStatsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 16,
        paddingVertical: 12,
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
    },
    additionalStatItem: {
        alignItems: 'center',
    },
    additionalStatValue: {
        ...Fonts.semibold16,
        color: Colors.mainTextColor,
    },
    additionalStatLabel: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },

    // Bio Section
    bioSection: {
        width: '100%',
        marginBottom: 16,
    },
    bioTitle: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
        marginBottom: 8,
    },
    bioText: {
        ...Fonts.regular14,
        color: '#9B9F9F',
        lineHeight: 20,
    },

    separator: {
        width: '100%',
        height: 1,
        backgroundColor: '#DEDEDE',
        marginVertical: 16,
    },

    // Links Section
    linksSection: {
        width: '100%',
    },
    linkRow: {
        flexDirection: 'row',
        gap: 12,
    },
    linkChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
    },
    linkText: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },

    // Toggle Container
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        padding: 4,
        marginBottom: 20,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8,
    },
    toggleButtonActive: {
        backgroundColor: Colors.primaryColor,
    },
    toggleText: {
        ...Fonts.medium14,
        color: '#9B9F9F',
    },
    toggleTextActive: {
        ...Fonts.medium14,
        color: Colors.whiteColor,
    },

    // Tab Content
    tabContent: {
        marginBottom: 20,
    },

    // Section Header
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    sectionTitle: {
        ...Fonts.medium16,
        color: Colors.mainTextColor,
    },
    viewAllText: {
        ...Fonts.regular14,
        color: Colors.primaryColor,
    },

    // Athlete Count Badge
    athleteCountBadge: {
        backgroundColor: Colors.secondaryBlueColor,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    athleteCountText: {
        ...Fonts.regular12,
        color: Colors.primaryColor,
    },

    // Athletes List
    athletesList: {
        gap: 12,
    },
    clubAthleteCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
    },
    clubAthleteAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
    },
    clubAthleteInfo: {
        flex: 1,
    },
    clubAthleteName: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
    },
    clubAthleteUsername: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    followButton: {
        backgroundColor: Colors.primaryColor,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    followingButton: {
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: Colors.primaryColor,
    },
    followButtonText: {
        ...Fonts.medium14,
        color: Colors.whiteColor,
    },
    followingButtonText: {
        color: Colors.primaryColor,
    },

    // Coaches List
    coachesList: {
        gap: 12,
    },
    coachCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
    },
    coachAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
    },
    coachInfo: {
        flex: 1,
    },
    coachName: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
    },
    coachSpecialty: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },

    // Events List
    eventsList: {
        gap: 12,
    },
    eventCard: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
    },
    eventImage: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginRight: 12,
    },
    eventInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    eventTitle: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
        marginBottom: 8,
    },
    eventDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    eventDetailText: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },

    // Posts Section
    postsSection: {
        marginBottom: 20,
    },
    postsList: {
        gap: 16,
    },
    postCard: {
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        overflow: 'hidden',
    },
    postImageContainer: {
        width: '100%',
        height: 160,
    },
    postImage: {
        width: '100%',
        height: '100%',
    },
    postInfoBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    postTitle: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
    },
    postDate: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    postDescription: {
        ...Fonts.regular14,
        color: '#9B9F9F',
        paddingHorizontal: 16,
        lineHeight: 20,
    },
    sharePostButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        margin: 16,
        paddingVertical: 12,
        backgroundColor: Colors.primaryColor,
        borderRadius: 8,
    },
    sharePostButtonText: {
        ...Fonts.medium14,
        color: Colors.whiteColor,
    },
});

export default Styles;
