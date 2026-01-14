import { StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";

const Styles = StyleSheet.create({
    //Header
    header: {
        paddingVertical: 15,
        backgroundColor: Colors.whiteColor,
        paddingHorizontal: 20,
        borderBottomWidth: 0.5,
        borderBottomColor: Colors.lightGrayColor,
        flexDirection: 'row',
        alignItems: 'center',
    },
    profilePic: {
        height: 44,
        width: 44,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: Colors.primaryColor,
        overflow: 'hidden',
    },
    img: {
        height: '100%',
        width: '100%',
    },
    welcomeText: {
        ...Fonts.regular12,
        color: Colors.subTextColor,
        marginBottom: 5
    },
    userNameText: {
        ...Fonts.regular18,
        color: Colors.mainTextColor,
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
        backgroundColor: Colors.btnBackgroundColor,
        alignItems: 'center',
        justifyContent: 'center'
    },

    // News Feed Card
    newsFeedCard: {
        backgroundColor: Colors.whiteColor,
        borderWidth: 0.5,
        borderColor: '#E0ECFE',
        borderRadius: 10,
        padding: 16,
        marginHorizontal: 20,
        marginBottom: 24,
    },
    newsFeedCardNoBorder: {
        backgroundColor: Colors.whiteColor,
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    newsFeedTitle: {
        ...Fonts.medium16,
        fontSize: 18,
        lineHeight: 22,
        color: '#0F0F0F',
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
        backgroundColor: '#0F0F0F',
        borderRadius: 50,
        paddingHorizontal: 16,
        paddingVertical: 6,
    },
    paginationText: {
        ...Fonts.regular14,
        color: Colors.whiteColor,
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
        backgroundColor: '#E0E0E0',
    },
    paginationDotActive: {
        backgroundColor: Colors.primaryColor,
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
        color: '#0F0F0F',
    },
    userPostTime: {
        ...Fonts.regular12,
        color: Colors.subTextColor,
    },
    followButton: {
        backgroundColor: Colors.primaryColor,
        borderRadius: 50,
        paddingHorizontal: 16,
        paddingVertical: 8,
        width: 94,
        alignItems: 'center',
    },
    followButtonText: {
        ...Fonts.regular12,
        color: Colors.whiteColor,
    },
    userPostDescription: {
        ...Fonts.medium14,
        color: '#0F0F0F',
        marginBottom: 10,
    },
    viewBlogButton: {
        backgroundColor: Colors.primaryColor,
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
        borderColor: Colors.primaryColor,
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
        color: Colors.whiteColor,
    },
    viewBlogButtonTextOutlined: {
        ...Fonts.regular14,
        color: Colors.primaryColor,
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
        backgroundColor: Colors.primaryColor,
        justifyContent: 'center',
        alignItems: 'center',
    },

    //Home screen
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.whiteColor,
    },
    rowCenter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tabText: {
        ...Fonts.regular14,
        fontWeight: '400',
        paddingBottom: 12,
        color: Colors.primaryColor,
        borderBottomWidth: 3,
        borderBottomColor: Colors.primaryColor,
        alignSelf: 'flex-start',
        marginLeft: 20
    },
    container: {
        paddingHorizontal: 20
    },
    headings: {
        ...Fonts.regular16,
        color: Colors.mainTextColor,
        marginHorizontal: 20
    },
    downloadContainer: {
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
        padding: 16,
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
    bottomAddEventBtn: {
        position: 'absolute',
        bottom: 0,
        zIndex: 1,
        backgroundColor: Colors.whiteColor,
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
        borderColor: Colors.lightGrayColor,
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
        borderColor: Colors.lightGrayColor,
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
        color: Colors.mainTextColor,
        width: '90%'
    },
    eventSubText: {
        ...Fonts.regular12,
        color: Colors.grayColor,
        width: '70%',
    },

    // requestContainer
    requestContainer: {
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
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
        backgroundColor: Colors.secondaryColor,
        alignItems: 'center',
        justifyContent: 'center'
    },
    requestSubText: {
        ...Fonts.regular10,
        color: Colors.grayColor,
    },
    dot: {
        height: 5,
        width: 5,
        borderRadius: 5,
        backgroundColor: Colors.subTextColor,
        marginHorizontal: 4
    },

    //Action Btns
    btnContainre: {
        paddingHorizontal: 7,
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
        borderRadius: 6,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'
    },
    btnText: {
        ...Fonts.regular14,
        color: Colors.subTextColor
    }
});

export default Styles;