import { StyleSheet, Dimensions } from "react-native";
import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";

const { width } = Dimensions.get('window');

const Styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.whiteColor
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
    },
    // Search Card
    searchCard: {
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        paddingHorizontal: 16,
        paddingVertical: 24,
        gap: 24,
    },
    searchLabel: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
        textAlign: 'center',
    },
    searchInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7FAFF',
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        paddingHorizontal: 16,
        paddingVertical: 15,
        gap: 14,
    },
    searchPlaceholder: {
        ...Fonts.regular16,
        color: '#9B9F9F',
    },
    // Profile Card
    profileCard: {
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
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
        borderColor: '#DEDEDE',
        gap: 6,
    },
    shareButtonText: {
        ...Fonts.regular14,
        color: '#9B9F9F',
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
        color: Colors.mainTextColor,
    },
    userHandle: {
        ...Fonts.regular12,
        color: '#9B9F9F',
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
        color: '#9B9F9F',
    },
    infoValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoValue: {
        ...Fonts.medium16,
        color: Colors.mainTextColor,
    },
    // Unfollow Button
    unfollowButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 6,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        marginTop: 16,
    },
    unfollowButtonText: {
        ...Fonts.regular14,
        color: '#9B9F9F',
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
        color: Colors.mainTextColor,
    },
    bioText: {
        ...Fonts.regular12,
        color: '#777777',
        lineHeight: 20,
    },
    separator: {
        height: 1,
        backgroundColor: '#DEDEDE',
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
        backgroundColor: '#F5F5F5',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        gap: 6,
    },
    linkText: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    linkTextUnderline: {
        ...Fonts.regular12,
        color: '#9B9F9F',
        textDecorationLine: 'underline',
    },
    emailChip: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        gap: 6,
    },
    emailText: {
        ...Fonts.medium12,
        color: '#9B9F9F',
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
        color: Colors.mainTextColor,
    },
    viewAllText: {
        ...Fonts.regular14,
        color: '#9B9F9F',
    },
    postsContainer: {
        marginTop: 24,
        gap: 24,
    },
    // Post Card
    postCard: {
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
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
        backgroundColor: '#E0ECFE',
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 2,
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
        ...Fonts.regular12,
        color: '#9B9F9F',
        lineHeight: 20,
    },
    sharePostButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primaryColor,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 6,
        alignSelf: 'flex-start',
    },
    sharePostButtonText: {
        ...Fonts.regular14,
        color: Colors.whiteColor,
    },
    // Collections Section
    collectionsSection: {
        marginTop: 24,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
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
        color: '#9B9F9F',
    },
    toggleTextActive: {
        ...Fonts.regular12,
        color: Colors.mainTextColor,
    },
    collectionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
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
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
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
        transform: [{ translateX: -18 }, { translateY: -18 }],
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    videoCardTitle: {
        ...Fonts.medium12,
        color: Colors.mainTextColor,
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
        color: '#9B9F9F',
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
        backgroundColor: Colors.subTextColor
    },
    profileImgCont: {
        height: 110,
        width: 110,
        borderRadius: 55,
        borderWidth: 2,
        borderColor: Colors.primaryColor,
        alignSelf: 'center'
    },
    profileImg: {
        height: '100%',
        width: '100%',
        borderRadius: 55,
    },
    userNameText: {
        ...Fonts.regular20,
        color: Colors.mainTextColor,
        fontWeight: '500',
    },
    subText: {
        ...Fonts.regular12,
        color: Colors.grayColor,
        fontWeight: '400',
    },
    followingCont: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 0.5,
        borderColor: Colors.primaryColor
    },
    followersText: {
        ...Fonts.regular14,
        color: Colors.primaryColor
    },
    unfollowCont: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 6,
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor
    },
    unfollowText: {
        ...Fonts.regular14,
        color: Colors.subTextColor
    },
    titleText: {
        ...Fonts.regular16,
        color: Colors.mainTextColor
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
        borderColor: Colors.lightGrayColor,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 20
    },
    btnText: {
        ...Fonts.regular16,
        color: Colors.subTextColor
    },
    downloadContainer: {
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
        paddingHorizontal: 16,
        paddingVertical: 23,
        alignItems: 'center',
        flexDirection: 'row',
        marginHorizontal: 20
    },
    downloadText: {
        ...Fonts.regular14,
        color: Colors.subTextColor,
        fontWeight: '400',
        marginLeft: 10,
        marginRight: 5
    },
    downloadCount: {
        ...Fonts.regular14,
        fontWeight: '500',
        color: Colors.mainTextColor,
    },
    btnRight: {
        position: 'absolute',
        right: 16
    },
    CompetitionContainer: {
        padding: 16,
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
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
        color: Colors.mainTextColor
    },
    eventbtns: {
        paddingVertical: 8,
        paddingHorizontal: 9,
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
        borderRadius: 6
    },
    eventBtnText: {
        ...Fonts.regular14,
        color: Colors.subTextColor
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
        borderColor: Colors.lightGrayColor,
        backgroundColor: Colors.whiteColor,
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
        backgroundColor: '#F7FAFF',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: Colors.borderColor,
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
        color: Colors.mainTextColor,
        fontSize: 16,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    cancelBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 48,
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
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
        borderBottomColor: Colors.primaryColor,
    },
    selectedTabText: {
        color: Colors.primaryColor,
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
        width: 40,
        height: 40,
        borderRadius: 25,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
})

export default Styles;
