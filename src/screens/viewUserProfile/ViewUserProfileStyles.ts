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
    },
    // Search Card
    searchCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        paddingHorizontal: 16,
        paddingVertical: 24,
        gap: 24,
    },
    searchLabel: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
        textAlign: 'center',
    },
    searchInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.secondaryColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        paddingHorizontal: 16,
        paddingVertical: 15,
        gap: 14,
    },
    searchPlaceholder: {
        ...Fonts.regular16,
        color: colors.subTextColor,
    },
    // Profile Card
    profileCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        padding: 16,
    },
    profileHeader: {
        alignItems: 'center',
        gap: 8,
    },
    shareButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 6,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        gap: 6,
    },
    shareButtonText: {
        ...Fonts.regular14,
        color: colors.subTextColor,
    },
    profileImageContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        overflow: 'hidden',
    },
    profileImage: {
        width: '100%',
        height: '100%',
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
    userHandle: {
        ...Fonts.regular12,
        color: colors.subTextColor,
        textAlign: 'center',
    },
    // Stats Row
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
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
        gap: 4,
    },
    infoItemCenter: {
        alignItems: 'center',
        gap: 4,
    },
    infoItemEnd: {
        alignItems: 'flex-end',
        gap: 4,
    },
    infoLabel: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    infoValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoValue: {
        ...Fonts.medium16,
        color: colors.mainTextColor,
    },
    // Unfollow Button
    unfollowButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 6,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        marginTop: 16,
    },
    unfollowButtonText: {
        ...Fonts.regular14,
        color: colors.subTextColor,
    },
    // Bio Section
    bioSection: {
        marginTop: 14,
        gap: 8,
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
        lineHeight: 20,
    },
    separator: {
        height: 1,
        backgroundColor: colors.lightGrayColor,
        marginTop: 8,
    },
    // Links Section
    linksSection: {
        marginTop: 14,
        gap: 10,
    },
    linkRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    linkChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.btnBackgroundColor,
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        gap: 6,
    },
    linkText: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    linkTextUnderline: {
        ...Fonts.regular12,
        color: colors.subTextColor,
        textDecorationLine: 'underline',
    },
    emailChip: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.btnBackgroundColor,
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        gap: 6,
    },
    emailText: {
        ...Fonts.medium12,
        color: colors.subTextColor,
    },
    // Posts Section
    postsSection: {
        marginTop: 24,
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
    postsContainer: {
        marginTop: 24,
        gap: 24,
    },
    // Post Card
    postCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        padding: 16,
        gap: 16,
    },
    postImageContainer: {
        width: '100%',
        height: 230,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        overflow: 'hidden',
    },
    postImage: {
        width: '100%',
        height: '100%',
    },
    postInfoBar: {
        backgroundColor: colors.borderColor,
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 2,
    },
    postTitle: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
    },
    postDate: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    postDescription: {
        ...Fonts.regular12,
        color: colors.subTextColor,
        lineHeight: 20,
    },
    sharePostButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primaryColor,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 6,
        alignSelf: 'flex-start',
    },
    sharePostButtonText: {
        ...Fonts.regular14,
        color: colors.pureWhite,
    },
    // Collections Section
    collectionsSection: {
        marginTop: 24,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: colors.cardBackground,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        padding: 8,
        marginTop: 16,
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
    collectionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: colors.cardBackground,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        padding: 12,
        marginTop: 16,
    },
    collectionImage: {
        width: (width - 40 - 24 - 36) / 4,
        height: 126,
        borderRadius: 4,
    },
    // Video Card Styles
    videosGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: colors.cardBackground,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        padding: 12,
        marginTop: 16,
        gap: 12,
    },
    videoCard: {
        flex: 1,
    },
    videoThumbnailContainer: {
        width: '100%',
        height: 100,
        borderRadius: 6,
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
        ...Fonts.medium12,
        color: colors.mainTextColor,
        marginTop: 8,
    },
    videoCardMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 8,
    },
    videoMetaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    videoMetaText: {
        ...Fonts.regular10,
        color: colors.subTextColor,
    },

    // Legacy styles (kept for backward compatibility)
    container: {
        paddingHorizontal: 20
    },
    textCenter: {
        textAlign: 'center'
    },
    center: {
        alignSelf: 'center'
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    spaceBetween: {
        justifyContent: 'space-between'
    },
    dot: {
        height: 6,
        width: 6,
        borderRadius: 3,
        backgroundColor: colors.subTextColor
    },
    profileImgCont: {
        height: 110,
        width: 110,
        borderRadius: 55,
        borderWidth: 2,
        borderColor: colors.primaryColor,
        alignSelf: 'center'
    },
    profileImg: {
        height: '100%',
        width: '100%',
        borderRadius: 55,
    },
    userNameText: {
        ...Fonts.regular20,
        color: colors.mainTextColor,
        fontWeight: '500',
    },
    subText: {
        ...Fonts.regular12,
        color: colors.grayColor,
        fontWeight: '400',
    },
    followingCont: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 0.5,
        borderColor: colors.primaryColor
    },
    followersText: {
        ...Fonts.regular14,
        color: colors.primaryColor
    },
    unfollowCont: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 6,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor
    },
    unfollowText: {
        ...Fonts.regular14,
        color: colors.subTextColor
    },
    titleText: {
        ...Fonts.regular16,
        color: colors.mainTextColor
    },
    socialIcons: {
        height: 14,
        width: 14
    },
    collectionImgCont: {
        height: 126,
        borderRadius: 4,
        overflow: 'hidden'
    },
    collectionImg: {
        height: '100%',
        width: '100%'
    },
    editBtn: {
        height: 54,
        borderWidth: 1,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 20
    },
    btnText: {
        ...Fonts.regular16,
        color: colors.subTextColor
    },
    downloadContainer: {
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        paddingHorizontal: 16,
        paddingVertical: 23,
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
    CompetitionContainer: {
        padding: 16,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        marginRight: 20
    },
    eventImgCont: {
        height: 115,
        width: 224,
        borderRadius: 6,
        overflow: 'hidden'
    },
    eventImg: {
        height: '100%',
        width: '100%'
    },
    eventText: {
        ...Fonts.regular14,
        color: colors.mainTextColor
    },
    eventbtns: {
        paddingVertical: 8,
        paddingHorizontal: 9,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 6
    },
    eventBtnText: {
        ...Fonts.regular14,
        color: colors.subTextColor
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
    },
    socialLinks: {
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 1
    },
    talentContainer: {
        borderRadius: 10,
        paddingHorizontal: 16,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        backgroundColor: colors.cardBackground,
        marginHorizontal: 20
    },
    icons: {
        height: 22,
        width: 22
    },
    nextArrow: {
        position: 'absolute',
        right: 12
    },
    bioContainer: {
        backgroundColor: colors.secondaryColor,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.borderColor,
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    icon: {
        marginTop: 6,
        marginRight: 8,
    },
    textInput: {
        flex: 1,
        color: colors.mainTextColor,
        fontSize: 16,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    cancelBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 48,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 10
    },
    toggleBtnContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        height: 30,
        paddingHorizontal: 20
    },
    selectedTab: {
        borderBottomWidth: 3,
        borderBottomColor: colors.primaryColor,
    },
    selectedTabText: {
        color: colors.primaryColor,
    },
    photoImgCont: {
        height: 120,
        overflow: 'hidden',
        borderRadius: 6
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
});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
