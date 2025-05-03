import { StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";


const Styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.whiteColor
    },
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
    separator: {
        borderBottomWidth: 0.7,
        borderBottomColor: Colors.lightGrayColor,
        marginHorizontal: 20
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


    //Event Container
    eventContainer: {
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

    //Social Links Modal
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


    //Edit Bio Screen
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
        textAlignVertical: 'top', // Important for Android to start at the top-left
    },
    cancelBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 48,
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
        borderRadius: 10
    },

    //Media Screen
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

    //Video Container
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