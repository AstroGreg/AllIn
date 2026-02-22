import { StyleSheet, Dimensions } from "react-native";
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
    headerSpacer: {
        width: 44,
        height: 44,
    },
    headerTitle: {
        ...Fonts.medium18,
        color: colors.mainTextColor,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    emptyProfileContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    emptyProfileAddButton: {
        width: 86,
        height: 86,
        borderRadius: 43,
        borderWidth: 1,
        borderColor: colors.primaryColor,
        backgroundColor: colors.secondaryBlueColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyProfileAddPlus: {
        ...Fonts.bold36,
        color: colors.primaryColor,
        lineHeight: 44,
    },
    emptyProfileTitle: {
        ...Fonts.medium18,
        color: colors.mainTextColor,
        marginTop: 16,
    },
    emptyProfileSubtitle: {
        ...Fonts.regular12,
        color: colors.subTextColor,
        marginTop: 8,
        textAlign: 'center',
    },

    // Profile Card
    profileCard: {
        backgroundColor: colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        padding: 16,
    },
    profileTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    profileHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
        justifyContent: 'flex-start',
    },
    profileCategoryOnly: {
        alignItems: 'center',
        gap: 6,
        minWidth: 80,
    },
    profileCategoryText: {
        ...Fonts.medium14,
        color: colors.primaryColor,
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
        width: 84,
        height: 84,
        borderRadius: 42,
        overflow: 'visible',
        position: 'relative',
    },
    profileImageInner: {
        width: 84,
        height: 84,
        borderRadius: 42,
        overflow: 'hidden',
    },
    profileImageLoading: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.6)',
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    profileImageEditBadge: {
        position: 'absolute',
        right: -2,
        bottom: -2,
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colors.whiteColor,
        zIndex: 10,
        elevation: 6,
    },
    profileIdentityBlock: {
        marginTop: 14,
        alignItems: 'center',
    },
    profileIdentityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    userName: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
    },
    userHandleInline: {
        ...Fonts.medium12,
        color: colors.subTextColor,
        letterSpacing: 0.2,
    },
    profileIdentityHandleWrap: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
        marginRight: 8,
    },
    profileIdentityNameWrap: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'center',
        marginLeft: 8,
    },
    userHandlePill: {
        marginTop: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        backgroundColor: colors.btnBackgroundColor,
        alignSelf: 'flex-start',
    },
    userHandle: {
        ...Fonts.medium12,
        color: colors.subTextColor,
        letterSpacing: 0.2,
    },
    categoryRow: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    categoryLabel: {
        ...Fonts.regular12,
        color: colors.subTextColor,
        letterSpacing: 0.3,
    },
    categoryPill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: colors.secondaryBlueColor,
        borderWidth: 1,
        borderColor: colors.borderColor,
    },
    categoryValue: {
        ...Fonts.medium12,
        color: colors.primaryColor,
    },

    // Stats
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 17,
        gap: 24,
    },
    statsContainerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        flex: 1,
        gap: 10,
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
    athleteMetaSection: {
        marginTop: 14,
        gap: 8,
        width: '100%',
    },
    athleteMetaInlineBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        minHeight: 48,
        backgroundColor: colors.btnBackgroundColor,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    athleteMetaInlineText: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
        textAlign: 'center',
        width: '100%',
    },
    websiteInlineRow: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    websiteInlineLinkWrap: {
        flex: 1,
        minWidth: 0,
    },
    websiteInlineLinkText: {
        ...Fonts.medium13,
        color: colors.primaryColor,
        textDecorationLine: 'underline',
        textAlign: 'left',
    },
    websiteInlineEditButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
    },
    websiteInlineAddButton: {
        alignSelf: 'flex-start',
        paddingVertical: 2,
    },
    athleteMetaInlineValue: {
        ...Fonts.medium13,
        color: colors.mainTextColor,
    },
    athleteMetaInlineDot: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    athleteMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.btnBackgroundColor,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    athleteMetaLabel: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    athleteMetaValue: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
        maxWidth: '58%',
        textAlign: 'right',
    },
    chestNumberSection: {
        marginTop: 14,
    },
    chestNumberLabel: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
        marginBottom: 8,
    },
    chestNumberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    chestYearPickerButton: {
        width: 84,
        height: 42,
        borderWidth: 1,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 6,
        backgroundColor: colors.btnBackgroundColor,
    },
    chestYearPickerText: {
        ...Fonts.regular14,
        color: colors.mainTextColor,
        textAlign: 'center',
    },
    chestNumberInput: {
        flex: 1,
        height: 42,
        borderWidth: 1,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 0,
        ...Fonts.regular12,
        color: colors.mainTextColor,
        backgroundColor: colors.btnBackgroundColor,
    },
    chestNumberSaveButton: {
        minWidth: 72,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: colors.primaryColor,
    },
    chestNumberSaveButtonDisabled: {
        opacity: 0.6,
    },
    chestNumberSaveText: {
        ...Fonts.medium14,
        color: colors.pureWhite,
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

    // Profile tabs (Instagram-style)
    profileTabs: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        marginTop: 20,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGrayColor,
    },
    profileTab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
        gap: 4,
    },
    profileTabActive: {
        borderBottomColor: colors.primaryColor,
    },
    profileTabText: {
        ...Fonts.regular10,
        color: colors.subTextColor,
    },
    profileTabTextActive: {
        color: colors.primaryColor,
    },

    // Activity list (Blogs & Events)
    activitySection: {
        marginTop: 20,
    },
    activityEventCard: {
        backgroundColor: colors.whiteColor,
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        padding: 16,
        marginBottom: 16,
    },
    activityEventRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    activityEventThumb: {
        width: 86,
        height: 86,
        borderRadius: 10,
    },
    activityEventThumbPlaceholder: {
        width: 86,
        height: 86,
        borderRadius: 10,
        backgroundColor: colors.btnBackgroundColor,
    },
    activityEventInfo: {
        flex: 1,
        marginLeft: 12,
    },
    activityEventSubtitle: {
        ...Fonts.regular12,
        color: colors.grayColor,
        marginTop: 4,
        marginBottom: 6,
    },
    activityEventMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 6,
    },
    activityEventMetaText: {
        ...Fonts.regular12,
        color: colors.grayColor,
    },
    activityEventDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.grayColor,
    },
    activityStatusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
    },
    activityStatusActive: {
        backgroundColor: '#EAF7EF',
    },
    activityStatusDone: {
        backgroundColor: '#EAF1FF',
    },
    activityStatusText: {
        ...Fonts.regular12,
        color: colors.mainTextColor,
    },
    activityCard: {
        backgroundColor: colors.whiteColor,
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        padding: 12,
        marginBottom: 16,
    },
    activityCardRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
        gap: 12,
    },
    activityTextColumn: {
        flex: 1,
        minHeight: 96,
    },
    activityHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    activityHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    activityTitle: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
        flex: 1,
    },
    activityBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
    },
    activityBadgeBlog: {
        backgroundColor: colors.primaryColor,
    },
    activityBadgeEvent: {
        backgroundColor: colors.secondaryBlueColor,
        borderWidth: 1,
        borderColor: colors.primaryColor,
    },
    activityBadgeText: {
        ...Fonts.regular12,
        color: colors.primaryColor,
    },
    activityBadgeTextBlog: {
        ...Fonts.regular12,
        color: '#FFFFFF',
    },
    activityMeta: {
        ...Fonts.regular12,
        color: colors.grayColor,
        marginTop: 6,
    },
    activityDescription: {
        ...Fonts.regular12,
        color: colors.subTextColor,
        marginTop: 6,
    },
    activityThumbWrap: {
        width: 110,
        height: 96,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: colors.btnBackgroundColor,
    },
    activityThumb: {
        width: '100%',
        height: '100%',
    },
    activityThumbPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: colors.btnBackgroundColor,
    },
    activityActionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 12,
    },
    activityAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colors.primaryColor,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    activityActionText: {
        ...Fonts.regular12,
        color: colors.pureWhite,
    },
    activityDelete: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ED5454',
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    activityDeleteText: {
        ...Fonts.regular12,
        color: '#ED5454',
    },
    activityHint: {
        ...Fonts.regular12,
        color: colors.grayColor,
        marginTop: 10,
    },
    emptyStateCard: {
        backgroundColor: colors.btnBackgroundColor,
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyStateText: {
        ...Fonts.regular12,
        color: colors.grayColor,
        textAlign: 'center',
    },
    emptyText: {
        ...Fonts.regular12,
        color: colors.grayColor,
        textAlign: 'center',
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
    actionPill: {
        backgroundColor: colors.primaryColor,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 999,
    },
    actionPillText: {
        ...Fonts.regular12,
        color: '#FFFFFF',
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
    earningsRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    earningsCard: {
        flex: 1,
        backgroundColor: colors.whiteColor,
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        padding: 14,
    },
    earningsLabel: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    earningsValue: {
        ...Fonts.medium16,
        color: colors.mainTextColor,
        marginTop: 6,
    },
    downloadAnalyticsSection: {
        marginTop: 16,
    },
    downloadAnalyticsTitle: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
        marginBottom: 8,
    },
    downloadAnalyticsCard: {
        backgroundColor: colors.whiteColor,
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        padding: 12,
        marginBottom: 10,
    },
    downloadAnalyticsName: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
    },
    downloadAnalyticsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 6,
    },
    downloadAnalyticsMeta: {
        ...Fonts.regular12,
        color: colors.grayColor,
    },
    competitionSearch: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.lightGrayColor,
        backgroundColor: colors.btnBackgroundColor,
        marginBottom: 10,
    },
    competitionSearchInput: {
        flex: 1,
        ...Fonts.regular14,
        color: colors.mainTextColor,
    },
    competitionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        backgroundColor: colors.whiteColor,
        marginBottom: 10,
    },
    competitionThumb: {
        width: 56,
        height: 56,
        borderRadius: 10,
    },
    competitionThumbPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 10,
        backgroundColor: colors.btnBackgroundColor,
    },
    competitionInfo: {
        flex: 1,
        gap: 4,
    },
    competitionTitle: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
    },
    competitionMeta: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    competitionMetaSecondary: {
        ...Fonts.regular12,
        color: colors.grayColor,
    },
    categoryModalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    categoryModalCard: {
        backgroundColor: colors.whiteColor,
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 18,
    },
    categoryModalTitle: {
        ...Fonts.medium16,
        color: colors.mainTextColor,
        textAlign: 'center',
    },
    categoryOption: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    categoryOptionText: {
        ...Fonts.medium14,
        color: colors.primaryColor,
    },
    categoryOptionDivider: {
        height: 1,
        backgroundColor: colors.lightGrayColor,
    },
    profileSwitcherBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
    },
    profileSwitcherSheet: {
        backgroundColor: colors.whiteColor,
        borderTopLeftRadius: 26,
        borderTopRightRadius: 26,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 24,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
    },
    profileSwitcherHandle: {
        width: 48,
        height: 5,
        borderRadius: 999,
        backgroundColor: colors.lightGrayColor,
        alignSelf: 'center',
        marginBottom: 12,
    },
    profileSwitcherTitle: {
        ...Fonts.medium16,
        color: colors.mainTextColor,
        textAlign: 'center',
    },
    profileSwitcherRow: {
        minHeight: 58,
        borderRadius: 14,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        backgroundColor: colors.btnBackgroundColor,
        paddingHorizontal: 12,
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileSwitcherAvatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: colors.secondaryBlueColor,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
    },
    profileSwitcherLabel: {
        ...Fonts.medium16,
        color: colors.mainTextColor,
        flex: 1,
        marginLeft: 12,
    },
    profileSwitcherCheck: {
        ...Fonts.medium20,
        color: colors.primaryColor,
        minWidth: 20,
        textAlign: 'right',
    },
    profileSwitcherAddRow: {
        backgroundColor: colors.secondaryBlueColor,
        borderColor: colors.primaryColor,
    },
    profileSwitcherAvatarAdd: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: colors.whiteColor,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.primaryColor,
    },
    profileSwitcherPlus: {
        ...Fonts.medium20,
        color: colors.primaryColor,
        lineHeight: 24,
    },
    profileSwitcherAddLabel: {
        ...Fonts.medium16,
        color: colors.primaryColor,
        flex: 1,
        marginLeft: 12,
    },
    chestYearList: {
        maxHeight: 320,
    },
    chestYearOption: {
        paddingVertical: 10,
        alignItems: 'center',
    },
    chestYearOptionText: {
        ...Fonts.medium14,
        color: colors.subTextColor,
    },
    chestYearOptionTextActive: {
        color: colors.primaryColor,
    },

    // Timeline modal
    timelineModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    timelineModalCard: {
        width: '100%',
        backgroundColor: colors.whiteColor,
        borderRadius: 16,
        padding: 16,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
    },
    timelineModalTitle: {
        ...Fonts.medium16,
        color: colors.mainTextColor,
        marginBottom: 12,
    },
    timelineField: {
        marginBottom: 12,
    },
    timelineLabel: {
        ...Fonts.regular12,
        color: colors.grayColor,
        marginBottom: 6,
    },
    timelineInput: {
        borderWidth: 1,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        ...Fonts.regular14,
        color: colors.mainTextColor,
        backgroundColor: colors.btnBackgroundColor,
    },
    timelineTextarea: {
        minHeight: 90,
        textAlignVertical: 'top',
    },
    timelineButtonsRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
    },
    timelineCancelButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
    },
    timelineCancelText: {
        ...Fonts.medium14,
        color: colors.subTextColor,
    },
    timelineSaveButton: {
        flex: 1,
        backgroundColor: colors.primaryColor,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
    },
    timelineSaveText: {
        ...Fonts.medium14,
        color: colors.pureWhite,
    },
    timelineDeleteButton: {
        marginTop: 12,
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#FFECEC',
    },
    timelineDeleteText: {
        ...Fonts.medium14,
        color: '#ED5454',
    },
});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
