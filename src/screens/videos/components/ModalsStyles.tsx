import { StyleSheet } from "react-native";
import Fonts from "../../../constants/Fonts";
import Colors from "../../../constants/Colors";

const Styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center'
    },
    modalContent: {
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginHorizontal: 20
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    titleText: {
        ...Fonts.regular16,
        color: Colors.mainTextColor
    },
    subTitleText: {
        ...Fonts.regular14,
        color: Colors.mainTextColor
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGrayColor
    },
    container: {
        gap: 10
    },
    checkBox: {
        height: 18,
        width: 18,
        borderRadius: 9,
        borderWidth: 1,
        borderColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center'
    },
    selectedDot: {
        height: 12,
        width: 12,
        borderRadius: 6,
        backgroundColor: Colors.primaryColor
    },
    selectionText: {
        ...Fonts.regular14,
        color: Colors.subTextColor
    },
    btn: {
        alignSelf: 'flex-end'
    },
    btnContianer: {
        paddingHorizontal: 16,
        backgroundColor: Colors.primaryColor,
        borderRadius: 8,
        alignSelf: 'center',
        height: 38,
        alignItems: 'center',
        justifyContent: 'center'
    },
    btnText: {
        ...Fonts.regular14,
        color: Colors.whiteColor
    },

    // second modal
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
        ...Fonts.regular14,
        minHeight: 65,
        maxHeight: 100,
        textAlignVertical: 'top', // Important for Android to start at the top-left
    },




})

export default Styles;