import { StyleSheet } from "react-native";
import Colors from "../../../constants/Colors";
import Fonts from "../../../constants/Fonts";

const Styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.whiteColor,
    },
    contentContainer: {
        paddingHorizontal: 20
    },
    headingText: {
        ...Fonts.regular24,
        color: Colors.mainTextColor,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 32,
    },
    subHeadingText: {
        ...Fonts.regular14,
        color: Colors.subTextColor,
        fontWeight: '400',
        textAlign: 'center'
    },
    containerTitle: {
        ...Fonts.regular16,
        color: Colors.mainTextColor,
        fontWeight: '500',
    },
    talentContainer: {
        borderRadius: 10,
        paddingHorizontal: 16,
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
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
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },


    // Performer styles
    searchResultsText: {
        ...Fonts.regular14,
        color: Colors.grayColor,
        fontWeight: '400',
    },


    // SelectionContainer
    selectionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 16,
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
        paddingVertical: 16,
        borderRadius: 10,
        marginBottom: 16,
        gap: 12
    },
    titleText: {
        ...Fonts.regular14,
        color: Colors.mainTextColor,
        fontWeight: '400',
    },
    selectionBtn: {
        height: 16,
        width: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.primaryColor,
        position: 'absolute',
        right: 16,
        alignItems: 'center',
        justifyContent: 'center'
    },
    selectedBtn: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: Colors.primaryColor,
    },
    deleteBtn: {
        position: 'absolute',
        right: 16,
    },

    // TabBar Styles
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 38,
        height: 35,
        gap: 20
    },
    tabs: {
        height: '100%',
        borderBottomWidth: 3,
        borderBottomColor: Colors.primaryColor,
        flex: 2,
        alignItems: 'center',
    },
    tabText: {
        ...Fonts.regular14,
        color: Colors.subTextColor,
        fontWeight: '400',
    },

    //Photography container styles
    photographyDetailsContainer: {
        paddingHorizontal: 16,
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
        paddingVertical: 16,
        borderRadius: 10,
        marginBottom: 16,
        gap: 12
    },
    actionIcons: {
        alignSelf: 'flex-end',
        gap: 6,
    }
})

export default Styles;