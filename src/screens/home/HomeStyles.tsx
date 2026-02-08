import { StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";
import { ThemeColors, lightColors } from "../../constants/Theme";

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    //Header
    header: {
        paddingVertical: 15,
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
    },
    headerIconBtn: {
        height: 44,
        width: 44,
        borderRadius: 22,
        backgroundColor: colors.btnBackgroundColor,
        alignItems: 'center',
        justifyContent: 'center'
    },

    //Home screen
    mainContainer: {
        flex: 1,
        backgroundColor: colors.backgroundColor,
    },
    scrollContent: {
        paddingHorizontal: 20,
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
    sectionContainer: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    sectionTitle: {
        ...Fonts.medium18,
        color: colors.mainTextColor,
    },
    seeAllText: {
        ...Fonts.regular14,
        color: colors.grayColor,
    },
    quickActionsGrid: {
        gap: 16,
    },
    quickActionsRow: {
        flexDirection: 'row',
        gap: 10,
    },
    quickActionCard: {
        flex: 1,
        backgroundColor: colors.cardBackground,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        padding: 12,
    },
    quickActionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    quickActionIconContainer: {
        width: 30,
        height: 30,
        borderRadius: 6,
        backgroundColor: colors.secondaryBlueColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickActionTextContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    quickActionChevronCircle: {
        width: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickActionText: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
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
        backgroundColor: colors.cardBackground,
        borderWidth: 0.5,
        borderColor: colors.borderColor,
        borderRadius: 10,
        padding: 16,
        marginBottom: 24,
    },
    newsFeedCardNoBorder: {
        backgroundColor: colors.cardBackground,
        marginBottom: 24,
    },
    newsFeedTitle: {
        ...Fonts.medium16,
        fontSize: 18,
        lineHeight: 22,
        color: colors.mainTextColor,
        marginBottom: 10,
    },
    newsFeedImageContainer: {
        width: '100%',
        height: 414,
        borderRadius: 10,
        overflow: 'hidden',
    },
    newsFeedImage: {
        width: '100%',
        height: '100%',
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
        marginTop: 16,
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
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    userPostInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    userPostAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    userPostName: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
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
        ...Fonts.medium14,
        color: colors.mainTextColor,
        marginBottom: 10,
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
    },
    playButtonLarge: {
        width: 74,
        height: 74,
        borderRadius: 37,
        backgroundColor: colors.primaryColor,
        justifyContent: 'center',
        alignItems: 'center',
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
        width: 40,
        height: 40,
        borderRadius: 25,
        overflow: 'hidden',
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
    }
});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
