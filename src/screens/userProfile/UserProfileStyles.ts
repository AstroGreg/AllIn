import { StyleSheet, Dimensions } from "react-native";
import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";
import { ThemeColors, lightColors } from "../../constants/Theme";

const { width } = Dimensions.get('window');

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.backgroundColor
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.lightGrayColor,
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.btnBackgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...Fonts.medium18,
        color: colors.mainTextColor,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },

    // Profile Card
    profileCard: {
        backgroundColor: colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        padding: 16,
    },
    editProfileButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 6,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        zIndex: 1,
    },
    editProfileButtonText: {
        ...Fonts.regular14,
        color: colors.subTextColor,
    },
    profileImageContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignSelf: 'center',
        overflow: 'hidden',
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        marginTop: 8,
    },
    userName: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
    },
    userHandle: {
        ...Fonts.regular12,
        color: colors.subTextColor,
        textAlign: 'center',
        marginTop: 6,
    },

    // Stats
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 17,
        gap: 24,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        ...Fonts.medium16,
        color: colors.mainTextColor,
    },
    statLabel: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    statDivider: {
        width: 1,
        height: 24,
        backgroundColor: colors.lightGrayColor,
    },

    // Info Row
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    infoItem: {
        alignItems: 'flex-start',
        flex: 1,
    },
    infoItemCenter: {
        alignItems: 'center',
        flex: 1,
    },
    infoItemEnd: {
        alignItems: 'flex-end',
        flex: 1,
    },
    infoLabel: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    infoValue: {
        ...Fonts.medium16,
        color: colors.mainTextColor,
    },
    infoValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    flagEmoji: {
        fontSize: 16,
    },
    infoDivider: {
        width: 1,
        height: 24,
        backgroundColor: colors.lightGrayColor,
    },

    // Bio Section
    bioSection: {
        marginTop: 14,
    },
    bioHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bioTitle: {
        ...Fonts.medium16,
        color: colors.mainTextColor,
    },
    bioText: {
        ...Fonts.regular12,
        color: colors.grayColor,
        marginTop: 8,
    },
    bioDivider: {
        height: 1,
        backgroundColor: colors.lightGrayColor,
        marginTop: 14,
    },

    // Manage Social Media Button
    manageSocialMediaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: colors.primaryColor,
        borderRadius: 10,
        height: 54,
        marginTop: 14,
    },
    manageSocialMediaButtonText: {
        ...Fonts.medium16,
        color: colors.pureWhite,
    },

    // Link Section
    linkSection: {
        marginTop: 14,
    },
    linkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.btnBackgroundColor,
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    linkContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    linkText: {
        ...Fonts.medium12,
        color: colors.subTextColor,
    },
    linkActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    linkDivider: {
        height: 1,
        backgroundColor: colors.lightGrayColor,
        marginTop: 14,
    },

    // Create Post Button
    createPostButton: {
        backgroundColor: colors.primaryColor,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        alignItems: 'center',
        alignSelf: 'flex-end',
        marginTop: 16,
    },
    createPostButtonText: {
        ...Fonts.regular14,
        color: colors.pureWhite,
    },

    // Posts Section
    postsSection: {
        marginTop: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sectionTitle: {
        ...Fonts.medium18,
        color: colors.mainTextColor,
    },
    viewAllText: {
        ...Fonts.regular14,
        color: colors.subTextColor,
    },

    // Post Card
    postCard: {
        backgroundColor: colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        padding: 16,
        marginBottom: 24,
    },
    postImageContainer: {
        width: '100%',
        height: 230,
        borderRadius: 10,
        overflow: 'hidden',
    },
    postImage: {
        width: '100%',
        height: '100%',
    },
    postTitleContainer: {
        backgroundColor: colors.borderColor,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginTop: -10,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    postTitle: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
    },
    postDate: {
        ...Fonts.regular12,
        color: colors.subTextColor,
        marginTop: 2,
    },
    postDescription: {
        ...Fonts.regular12,
        color: colors.subTextColor,
        marginTop: 16,
    },
    postActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 16,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colors.primaryColor,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    editButtonText: {
        ...Fonts.regular14,
        color: colors.pureWhite,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderRadius: 6,
        borderWidth: 0.5,
        borderColor: '#ED5454',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    deleteButtonText: {
        ...Fonts.regular14,
        color: '#ED5454',
    },

    // Collections Section
    collectionsSection: {
        marginTop: 30,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        padding: 8,
    },
    toggleButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
    },
    toggleButtonActive: {
        backgroundColor: 'rgba(60, 130, 246, 0.3)',
    },
    toggleText: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    toggleTextActive: {
        ...Fonts.regular12,
        color: colors.mainTextColor,
    },
    collectionsCard: {
        backgroundColor: colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        padding: 12,
    },
    collectionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    collectionImage: {
        height: 126,
        borderRadius: 4,
    },

    // Videos Grid
    videosGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    videoCard: {
        width: (width - 40 - 16) / 2,
        backgroundColor: colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        padding: 12,
    },
    videoThumbnailContainer: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
    },
    videoThumbnail: {
        width: '100%',
        height: '100%',
    },
    videoPlayIconContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -20 }, { translateY: -20 }],
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    videoCardTitle: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
        marginTop: 12,
    },
    videoCardMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 12,
    },
    videoMetaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    videoMetaText: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },

    // Main Edit Button
    mainEditButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: colors.primaryColor,
        borderRadius: 10,
        paddingVertical: 16,
        marginTop: 30,
    },
    mainEditButtonText: {
        ...Fonts.medium16,
        color: colors.pureWhite,
    },

    // Events Section
    eventsSection: {
        marginTop: 30,
    },
    eventsSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    eventsBadge: {
        backgroundColor: colors.btnBackgroundColor,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    eventsBadgeText: {
        ...Fonts.regular14,
        color: colors.subTextColor,
    },
    eventsCardsContainer: {
        marginTop: 16,
        gap: 24,
    },
    eventCard: {
        backgroundColor: colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        padding: 16,
    },
    eventCardContent: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    eventImageContainer: {
        width: 86,
        height: 86,
        borderRadius: 10,
        overflow: 'hidden',
    },
    eventImage: {
        width: '100%',
        height: '100%',
    },
    eventDetails: {
        flex: 1,
        gap: 6,
    },
    eventTitle: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
    },
    eventInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    eventInfoLabel: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    eventInfoValue: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    eventInfoValueText: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    eventDivider: {
        height: 1,
        backgroundColor: colors.lightGrayColor,
        marginTop: 10,
    },
    eventActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    eventActionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    eventActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 6,
        paddingHorizontal: 16,
        paddingVertical: 8,
        height: 36,
    },
    eventActionButtonText: {
        ...Fonts.regular14,
        color: colors.subTextColor,
    },
    eventEditButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colors.primaryColor,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        height: 36,
    },
    eventEditButtonText: {
        ...Fonts.regular14,
        color: colors.pureWhite,
    },
    eventsViewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: colors.primaryColor,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginTop: 16,
        alignSelf: 'center',
        height: 38,
    },
    eventsViewAllButtonText: {
        ...Fonts.regular14,
        color: colors.pureWhite,
    },

    // Downloads Section
    downloadsSection: {
        marginTop: 30,
    },
    downloadsCard: {
        backgroundColor: colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        padding: 16,
        marginTop: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 70,
    },
    downloadsContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    downloadsIconContainer: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    downloadsText: {
        ...Fonts.regular14,
        color: colors.subTextColor,
    },
    downloadsTextBold: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
    },
    downloadsDetailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 6,
        paddingHorizontal: 16,
        paddingVertical: 10,
        height: 38,
    },
    downloadsDetailsButtonText: {
        ...Fonts.regular14,
        color: colors.subTextColor,
    },
});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
