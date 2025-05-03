import { StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";

const Styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.whiteColor
    },
    searchContainer: {
        position: 'absolute',
        top: 10,
        left: 10,
        right: 10,
        zIndex: 1,
    },
    map: {
        flex: 1,
    },
    container: {
        paddingHorizontal: 20
    },
    icons: {
        height: 22,
        width: 22
    },
    titlesText: {
        ...Fonts.regular14,
        fontWeight: '400',
        color: Colors.mainTextColor
    },
    talentContainer: {
        borderRadius: 10,
        paddingHorizontal: 16,
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
    },
    containerTitle: {
        ...Fonts.regular16,
        color: Colors.mainTextColor,
        fontWeight: '500',
    },
    talentList: {
        marginLeft: 12
    },
    talentTypeTitle: {
        ...Fonts.regular12,
        color: Colors.subTextColor,
        fontWeight: '400',
    },
    separator: {
        height: 0.5,
        backgroundColor: Colors.lightGrayColor,
    },
    selectionContainer: {
        height: 16,
        width: 16,
        borderRadius: 8,
        borderWidth: 0.5,
        borderColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center'
    },
    selected: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: Colors.primaryColor
    },
    socialLinks: {
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 1
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    borderBtn: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 6,
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
        position: 'absolute',
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
    },
    btnText: {
        textAlign: 'center',
        ...Fonts.regular12,
        color: Colors.subTextColor
    },

    //Menu container
    menuContainer: {
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 13,
        paddingHorizontal: 16
    },
    iconCont: {
        height: 40,
        width: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.secondaryBlueColor,
    },
    nextArrow: {
        position: 'absolute',
        right: 12
    },

    //Payment
    paymentIcons: {
        height: 24,
        width: 40
    },

    //Add Card TextInput Container
    textInputContainer: {

    },
    textInput: {
        borderBottomWidth: 0.5,
        borderBottomColor: Colors.subTextColor,
        paddingVertical: 5,
        marginTop: 6,
        ...Fonts.regular16,
        color: Colors.mainTextColor,
    },

    // Profile Settings
    profilePicContainer: {
        height: 90,
        width: 90,
        borderRadius: 45,
        alignSelf: 'center'
    },
    profileImg: {
        height: '100%',
        width: '100%',
        borderRadius: 45,
    },
    editIcon: {
        position: 'absolute',
        zIndex: 1,
        bottom: 0,
        right: 5
    },
    profileLabel: {
        ...Fonts.regular14,
        color: Colors.subTextColor
    },
    linksIcon: {
        height: 20,
        width: 20
    },

    // modal
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContaint: {
        marginHorizontal: 20,
        borderRadius: 10,
        padding: 16,
        backgroundColor: Colors.whiteColor,
    },
    noBtn: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor
    },
    noText: {
        textAlign: 'center',
        ...Fonts.regular12,
        color: Colors.subTextColor
    },
    yesBtn: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: Colors.primaryColor
    },
    yesText: {
        textAlign: 'center',
        ...Fonts.regular12,
        color: Colors.whiteColor
    }
});

export default Styles;