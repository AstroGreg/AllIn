import { StyleSheet } from "react-native";
import Fonts from "../../constants/Fonts";
import { ThemeColors, lightColors } from "../../constants/Theme";

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    //Header
    header: {
        paddingVertical: 14,
        backgroundColor: colors.backgroundColor,
        paddingHorizontal: 20,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.lightGrayColor,
        flexDirection: 'row',
        alignItems: 'center',
    },
    profilePic: {
        height: 44,
        width: 44,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: colors.primaryColor,
        overflow: 'hidden',
    },
    img: {
        height: '100%',
        width: '100%',
    },
    welcomeText: {
        ...Fonts.regular12,
        color: colors.subTextColor,
        marginBottom: 2
    },
    userNameText: {
        ...Fonts.medium18,
        color: colors.mainTextColor,
    },
    userInfoContainer: {
        flex: 1,
    },
    headerIconsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerIconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.btnBackgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
    },
    notificationIconWrap: {
        position: 'relative',
    },
    notificationCountBanner: {
        position: 'absolute',
        top: -10,
        alignSelf: 'center',
        minWidth: 22,
        height: 18,
        borderRadius: 9,
        paddingHorizontal: 6,
        backgroundColor: '#ED5454',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3,
    },
    notificationCountText: {
        ...Fonts.medium12,
        color: colors.pureWhite,
        fontSize: 10,
        lineHeight: 12,
    },
    headerTextButton: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 14,
        backgroundColor: colors.btnBackgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
    },
    headerTextButtonLabel: {
        ...Fonts.medium14,
        color: colors.primaryColor,
    },

    //Home screen
    mainContainer: {
        flex: 1,
        backgroundColor: colors.backgroundColor,
    },
    scrollContent: {
        paddingHorizontal: 0,
    },

    // Wallet Balance Card
    walletCard: {
        backgroundColor: colors.cardBackground,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        padding: 16,
        marginBottom: 24,
    },
    walletCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    walletLeftSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    walletIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 6,
        backgroundColor: colors.secondaryBlueColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    walletInfoContainer: {
        gap: 8,
    },
    walletTitle: {
        ...Fonts.medium16,
        color: colors.mainTextColor,
    },
    walletBalance: {
        ...Fonts.medium14,
        color: colors.grayColor,
    },
    planBadge: {
        backgroundColor: '#E4FFEE',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 6,
    },
    planBadgeText: {
        ...Fonts.regular12,
        color: colors.greenColor,
    },
    rechargeButton: {
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 6,
        paddingHorizontal: 16,
        paddingVertical: 10,
        height: 38,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.btnBackgroundColor,
    },
    rechargeButtonText: {
        ...Fonts.regular14,
        color: colors.subTextColor,
    },

    // AI Smart Search Card
    aiSearchCard: {
        backgroundColor: colors.cardBackground,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 18,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#DDD6FF',
        shadowOffset: { width: 0, height: 25 },
        shadowOpacity: 0.5,
        shadowRadius: 50,
        elevation: 10,
        overflow: 'hidden',
    },
    aiSearchTitle: {
        ...Fonts.bold36,
        fontSize: 30,
        lineHeight: 36,
        letterSpacing: -0.35,
        color: colors.mainTextColor,
        marginTop: 20,
        marginBottom: 12,
    },
    aiSearchDescription: {
        ...Fonts.regular14,
        fontSize: 18,
        lineHeight: 29,
        color: colors.subTextColor,
        marginBottom: 24,
        letterSpacing: -0.44,
    },
    tryAiButton: {
        height: 57,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
        shadowColor: '#C4B4FF',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 8,
    },
    tryAiButtonText: {
        ...Fonts.bold16,
        fontSize: 18,
        color: colors.pureWhite,
        letterSpacing: -0.44,
    },

    // Quick Actions Section
    sectionQuickActions: {
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    sectionOverview: {
        marginBottom: 24,
        backgroundColor: 'transparent',
    },
    sectionOverviewActive: {
        backgroundColor: colors.backgroundColor,
    },
    sectionOverviewEmpty: {
        backgroundColor: 'transparent',
        paddingVertical: 0,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16
    },
    sectionHeaderCentered: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        ...Fonts.medium18,
        color: colors.mainTextColor,
    },
    sectionTitleCentered: {
        ...Fonts.medium18,
        color: colors.mainTextColor,
        textAlign: 'center',
    },
    timelineDivider: {
        height: 1,
        backgroundColor: colors.borderColor,
        marginVertical: 8,
    },
    seeAllText: {
        ...Fonts.regular14,
        color: colors.grayColor,
    },
    quickActionsGrid: {
        gap: 12,
    },
    quickActionsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    quickActionCard: {
        flex: 1,
        backgroundColor: colors.primaryColor,
        borderWidth: 0,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    aiSearchFocusCard: {
        position: 'relative',
        zIndex: 30,
        elevation: 30,
    },
    quickActionCardFull: {
        flex: 1,
    },
    quickActionText: {
        ...Fonts.medium14,
        color: colors.pureWhite,
        textAlign: 'center',
    },
    gradientButton: {
        flex: 1,
        height: 54,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 6,
        shadowColor: '#C4B4FF',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 8,
    },
    gradientButtonText: {
        ...Fonts.medium14,
        color: colors.pureWhite,
    },
    gradientButtonSmall: {
        height: 54,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#C4B4FF',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 8,
    },
    gradientButtonTextSmall: {
        ...Fonts.medium14,
        fontSize: 12,
        color: colors.pureWhite,
    },

    // Feed grid (media/view_all)
    feedColumnWrapper: {
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 12,
    },
    feedItemCard: {
        flex: 1,
        backgroundColor: colors.cardBackground,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 12,
        overflow: 'hidden',
    },
    feedItemImage: {
        width: '100%',
        height: 160,
    },
    feedVideoBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    feedVideoBadgeText: {
        ...Fonts.medium14,
        fontSize: 10,
        color: colors.pureWhite,
        letterSpacing: 0.4,
    },
    // Context Search Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '85%',
        backgroundColor: colors.modalBackground,
        borderRadius: 20,
        padding: 24,
    },
    modalTitle: {
        fontFamily: 'Inter-Bold',
        fontSize: 18,
        fontWeight: '700',
        color: colors.mainTextColor,
        textAlign: 'center',
    },
    contextInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.secondaryColor,
        borderWidth: 1,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        paddingHorizontal: 16,
        height: 50,
    },
    contextInput: {
        flex: 1,
        ...Fonts.regular14,
        color: colors.mainTextColor,
    },
    modalButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        borderRadius: 10,
        gap: 8,
    },
    modalButtonText: {
        ...Fonts.medium16,
        color: '#FFFFFF',
    },
    filterOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.secondaryColor,
        borderWidth: 1,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        paddingHorizontal: 16,
        height: 54,
        marginBottom: 12,
    },
    filterLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    filterLabel: {
        ...Fonts.regular16,
        color: colors.mainTextColor,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: colors.lightGrayColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        borderWidth: 0,
    },

    // New For You Section
    newForYouHeader: {
        marginBottom: 16,
    },
    newForYouTitle: {
        ...Fonts.medium18,
        color: colors.mainTextColor,
        marginBottom: 6,
    },
    newForYouDescription: {
        ...Fonts.regular14,
        color: colors.subTextColor,
        lineHeight: 22,
    },

    // News Feed Card
    newsFeedCard: {
        backgroundColor: colors.backgroundColor,
        marginBottom: 0,
        marginHorizontal: 0,
        borderRadius: 0,
        borderWidth: 0,
        borderBottomWidth: 6,
        borderBottomColor: colors.btnBackgroundColor,
        overflow: 'hidden',
    },
    newsFeedCardFull: {
        marginHorizontal: 0,
    },
    newsFeedCardNoBorder: {
        backgroundColor: colors.backgroundColor,
        marginBottom: 0,
        marginHorizontal: 0,
        borderRadius: 0,
        borderWidth: 0,
        borderBottomWidth: 6,
        borderBottomColor: colors.btnBackgroundColor,
        overflow: 'hidden',
    },
    newsFeedTitle: {
        ...Fonts.semibold16,
        fontSize: 16,
        lineHeight: 20,
        color: colors.mainTextColor,
        marginBottom: 4,
    },
    feedPadding: {
        paddingHorizontal: 10,
        paddingVertical: 12,
    },
    newsFeedImageContainer: {
        width: '100%',
        height: 360,
        borderRadius: 0,
        overflow: 'hidden',
        backgroundColor: colors.cardBackground,
    },
    mediaWrapper: {
        width: '100%',
        alignSelf: 'center',
        backgroundColor: 'transparent',
        overflow: 'hidden',
        position: 'relative',
    },
    textSlideContainer: {
        backgroundColor: '#0F172A',
    },
    textSlideContent: {
        flex: 1,
        paddingHorizontal: 24,
        paddingVertical: 24,
        justifyContent: 'center',
    },
    textSlideTitle: {
        ...Fonts.semibold22,
        color: colors.pureWhite,
        lineHeight: 28,
        marginBottom: 12,
    },
    textSlideDescription: {
        ...Fonts.regular14,
        color: 'rgba(255,255,255,0.85)',
        lineHeight: 22,
    },
    redditTextCard: {
        marginHorizontal: 12,
        marginTop: 4,
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        backgroundColor: colors.cardBackground,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    redditTextTitle: {
        ...Fonts.semibold16,
        color: colors.mainTextColor,
        lineHeight: 22,
        marginBottom: 8,
    },
    redditTextBody: {
        ...Fonts.regular14,
        color: colors.subTextColor,
        lineHeight: 21,
    },
    newsFeedImage: {
        width: '100%',
        height: '100%',
    },
    newsFeedVideoLayer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 2,
    },
    newsFeedSkeleton: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.cardBackground,
        zIndex: 1,
    },
    paginationBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: colors.mainTextColor,
        borderRadius: 50,
        paddingHorizontal: 16,
        paddingVertical: 6,
    },
    paginationText: {
        ...Fonts.regular14,
        color: colors.pureWhite,
    },
    paginationDotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        gap: 6,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.lightGrayColor,
    },
    paginationDotActive: {
        backgroundColor: colors.primaryColor,
        width: 24,
    },

    // User Post Card
    userPostHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
        
    },
    userPostHeaderSeparated: {

        borderBottomWidth: 0,
    },
    userPostHeaderLeft: {
        flex: 1,
        minWidth: 0,
    },
    userPostHeaderLeftRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        width: '100%',
    },
    userPostInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        alignSelf: 'flex-start',
        maxWidth: '100%',
    },
    userPostHeaderSpacerTap: {
        flex: 1,
        minHeight: 36,
    },
    userPostTextBlock: {
        justifyContent: 'flex-start',
        paddingTop: 1,
        paddingBottom: 4,
    },
    userPostAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    userPostName: {
        ...Fonts.medium14,
        fontSize: 14,
        lineHeight: 18,
        color: colors.mainTextColor,
        flexShrink: 1,
    },
    userPostTime: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    followButton: {
        backgroundColor: colors.primaryColor,
        borderRadius: 50,
        paddingHorizontal: 16,
        paddingVertical: 8,
        width: 94,
        alignItems: 'center',
    },
    followButtonText: {
        ...Fonts.regular12,
        color: colors.pureWhite,
    },
    userPostDescription: {
        ...Fonts.regular14,
        color: colors.subTextColor,
        lineHeight: 20,
        marginBottom: 6,
    },
    feedLikeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 0,
        paddingVertical: 0,
        borderRadius: 0,
        backgroundColor: 'transparent',
    },
    feedLikeText: {
        ...Fonts.regular14,
        color: colors.subTextColor,
    },
    feedMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 14,
        borderTopWidth: 0,
    },
    feedActionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    feedActionButton: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: colors.btnBackgroundColor,
        borderWidth: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    feedActionTextButton: {
        paddingHorizontal: 14,
        height: 34,
        borderRadius: 17,
        backgroundColor: colors.btnBackgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    feedActionText: {
        ...Fonts.medium14,
        color: colors.primaryColor,
    },
    likePulse: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -60,
        marginTop: -60,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(0,0,0,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 6,
    },
    feedActionIcon: {
        width: 14,
        height: 14,
        tintColor: colors.primaryColor,
    },
    // Instant video overlay
    videoOverlayContainer: {
        flex: 1,
        backgroundColor: colors.backgroundColor,
    },
    videoOverlayHeader: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 0.5,
        borderBottomColor: colors.borderColor,
    },
    videoOverlayBack: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.btnBackgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    videoOverlayTitle: {
        ...Fonts.medium16,
        color: colors.mainTextColor,
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 10,
    },
    videoOverlayActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    videoOverlayActionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.btnBackgroundColor,
    },
    videoOverlayActionIcon: {
        width: 18,
        height: 18,
        tintColor: colors.primaryColor,
    },
    videoOverlayPlayer: {
        flex: 1,
        backgroundColor: '#000000',
        position: 'relative',
    },
    videoOverlayVideo: {
        width: '100%',
        height: '100%',
    },
    videoOverlaySkeleton: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.cardBackground,
        zIndex: 2,
    },
    videoOverlayPlayBadge: {
        position: 'absolute',
        alignSelf: 'center',
        top: '45%',
        width: 68,
        height: 68,
        borderRadius: 34,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.35)',
    },
    videoOverlayTap: {
        ...StyleSheet.absoluteFillObject,
    },
    videoOverlayControls: {
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderTopWidth: 0.5,
        borderTopColor: colors.borderColor,
        backgroundColor: colors.backgroundColor,
    },
    videoOverlayTime: {
        ...Fonts.regular12,
        color: colors.subTextColor,
        marginBottom: 8,
    },
    videoOverlaySlider: {
        width: '100%',
        height: 24,
    },
    sharedVideoLayer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 5,
        elevation: 5,
    },
    sharedVideoWrapper: {
        position: 'absolute',
        overflow: 'hidden',
        backgroundColor: '#000000',
    },
    sharedVideoFullscreen: {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
    },
    sharedVideo: {
        width: '100%',
        height: '100%',
    },
    sharedVideoTap: {
        ...StyleSheet.absoluteFillObject,
    },
    sharedVideoChrome: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 3,
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
    },
    feedTag: {
        paddingHorizontal: 0,
        paddingVertical: 0,
        borderRadius: 0,
        backgroundColor: 'transparent',
        borderWidth: 0,
    },
    feedTagText: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    feedHeaderActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    feedMoreButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        borderWidth: 0,
    },
    feedMoreDots: {
        ...Fonts.regular16,
        color: colors.subTextColor,
        lineHeight: 16,
        textAlign: 'center',
        includeFontPadding: false,
        marginTop: -2,
    },
    viewBlogButton: {
        backgroundColor: colors.primaryColor,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        marginTop: 16,
    },
    viewBlogButtonOutlined: {
        backgroundColor: 'transparent',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.primaryColor,
        paddingHorizontal: 16,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        marginTop: 16,
    },
    viewBlogButtonText: {
        ...Fonts.regular14,
        color: colors.pureWhite,
    },
    viewBlogButtonTextOutlined: {
        ...Fonts.regular14,
        color: colors.primaryColor,
    },

    // Video Card with Play Button
    videoOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 4,
    },
    videoMuteButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        minWidth: 74,
        borderRadius: 16,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: 'rgba(0,0,0,0.55)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
    },
    videoMuteButtonText: {
        ...Fonts.medium12,
        color: '#FFFFFF',
    },
    playButtonLarge: {
        backgroundColor: 'rgba(0,0,0,0.25)',
        borderRadius: 30,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    downloadOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
    },
    downloadCard: {
        width: '78%',
        backgroundColor: colors.pureWhite,
        borderRadius: 18,
        paddingHorizontal: 20,
        paddingVertical: 18,
        alignItems: 'center',
        gap: 12,
    },
    downloadTitle: {
        ...Fonts.semibold16,
        color: colors.mainTextColor,
    },
    downloadProgressTrack: {
        width: '100%',
        height: 8,
        borderRadius: 8,
        backgroundColor: '#E5E7EB',
        overflow: 'hidden',
    },
    downloadProgressFill: {
        height: '100%',
        backgroundColor: colors.primaryColor,
        borderRadius: 8,
    },
    downloadProgressLabel: {
        ...Fonts.regular12,
        color: colors.textSecondary,
    },

    rowCenter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tabText: {
        ...Fonts.regular14,
        fontWeight: '400',
        paddingBottom: 12,
        color: colors.primaryColor,
        borderBottomWidth: 3,
        borderBottomColor: colors.primaryColor,
        alignSelf: 'flex-start',
        marginLeft: 20
    },
    container: {
        paddingHorizontal: 20
    },
    headings: {
        ...Fonts.regular16,
        color: colors.mainTextColor,
        marginHorizontal: 20
    },
    downloadContainer: {
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        padding: 16,
        alignItems: 'center',
        flexDirection: 'row',
        marginHorizontal: 20
    },
    downloadText: {
        ...Fonts.regular14,
        color: colors.subTextColor,
        fontWeight: '400',
        marginLeft: 10,
        marginRight: 5
    },
    downloadCount: {
        ...Fonts.regular14,
        fontWeight: '500',
        color: colors.mainTextColor,
    },
    btnRight: {
        position: 'absolute',
        right: 16
    },
    bottomAddEventBtn: {
        position: 'absolute',
        bottom: 0,
        zIndex: 1,
        backgroundColor: colors.backgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 10,
        width: '100%',
        paddingTop: 5,
        paddingHorizontal: 20
    },

    //Event Container
    CompetitionContainer: {
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        padding: 16,
        marginRight: 20,
        maxWidth: 175,
        marginBottom: 16,
    },
    VideoContainer: {
        height: 120,
        width: 143,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        overflow: 'hidden',
    },
    videoWrapper: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    playButtonOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButton: {
        backgroundColor: 'rgba(0,0,0,0.25)',
        borderRadius: 24,
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    eventTitle: {
        ...Fonts.regular14,
        color: colors.mainTextColor,
        width: '90%'
    },
    eventSubText: {
        ...Fonts.regular12,
        color: colors.grayColor,
        width: '70%',
    },

    // requestContainer
    requestContainer: {
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20
    },
    iconContainer: {
        height: 40,
        width: 40,
        borderRadius: 6,
        backgroundColor: colors.secondaryColor,
        alignItems: 'center',
        justifyContent: 'center'
    },
    requestSubText: {
        ...Fonts.regular10,
        color: colors.grayColor,
    },
    dot: {
        height: 5,
        width: 5,
        borderRadius: 5,
        backgroundColor: colors.subTextColor,
        marginHorizontal: 4
    },

    //Action Btns
    btnContainre: {
        paddingHorizontal: 7,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 6,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'
    },
    btnText: {
        ...Fonts.regular14,
        color: colors.subTextColor
    },
    aiSearchIntroOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 20,
    },
    aiSearchIntroDimmer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.35)',
    },
    aiSearchIntroPopup: {
        position: 'absolute',
        width: 200,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 12,
    },
    aiSearchIntroSpotlight: {
        position: 'absolute',
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.14)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.35)',
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 8,
    },
    aiSearchIntroText: {
        ...Fonts.medium14,
        color: '#101828',
    },
    aiSearchIntroNextButton: {
        alignSelf: 'flex-end',
        backgroundColor: colors.primaryColor,
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    aiSearchIntroNextText: {
        ...Fonts.medium14,
        color: colors.pureWhite,
    },
    feedMenuOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    feedMenuBackdrop: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    feedMenuContainer: {
        width: '100%',
        maxWidth: 420,
        backgroundColor: colors.modalBackground,
        borderRadius: 16,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        padding: 14,
    },
    feedMenuTitle: {
        ...Fonts.medium16,
        color: colors.mainTextColor,
        marginBottom: 8,
    },
    feedMenuDivider: {
        height: 1,
        backgroundColor: colors.lightGrayColor,
        marginBottom: 8,
    },
    feedMenuAction: {
        backgroundColor: colors.secondaryColor,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
        marginBottom: 8,
    },
    feedMenuActionText: {
        ...Fonts.regular14,
        color: colors.mainTextColor,
    },
    feedMenuCancel: {
        marginTop: 4,
        borderWidth: 1,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: colors.btnBackgroundColor,
    },
    feedMenuCancelText: {
        ...Fonts.medium14,
        color: colors.grayColor,
    },
    feedInfoModalContainer: {
        width: '100%',
        maxWidth: 420,
        backgroundColor: colors.modalBackground,
        borderRadius: 16,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        padding: 16,
        gap: 10,
    },
    feedInfoModalTitle: {
        ...Fonts.medium16,
        color: colors.mainTextColor,
    },
    feedInfoModalText: {
        ...Fonts.regular14,
        color: colors.subTextColor,
    },
    feedInfoModalButton: {
        alignSelf: 'flex-end',
        backgroundColor: colors.primaryColor,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    feedInfoModalButtonText: {
        ...Fonts.medium14,
        color: colors.pureWhite,
    },
});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
