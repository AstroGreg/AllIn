import { StyleSheet } from "react-native";
import Fonts from "../../../constants/Fonts";
import { ThemeColors } from "../../../constants/Theme";

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center'
    },
    modalContent: {
        backgroundColor: colors.cardBackground,
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
        color: colors.mainTextColor
    },
    subTitleText: {
        ...Fonts.regular14,
        color: colors.mainTextColor
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGrayColor
    },
    container: {
        gap: 10
    },
    checkBox: {
        height: 18,
        width: 18,
        borderRadius: 9,
        borderWidth: 1,
        borderColor: colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center'
    },
    selectedDot: {
        height: 12,
        width: 12,
        borderRadius: 6,
        backgroundColor: colors.primaryColor
    },
    selectionText: {
        ...Fonts.regular14,
        color: colors.subTextColor
    },
    btn: {
        alignSelf: 'flex-end'
    },
    btnContianer: {
        paddingHorizontal: 16,
        backgroundColor: colors.primaryColor,
        borderRadius: 8,
        alignSelf: 'center',
        height: 38,
        alignItems: 'center',
        justifyContent: 'center'
    },
    btnText: {
        ...Fonts.regular14,
        color: colors.pureWhite
    },

    // second modal
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
        ...Fonts.regular14,
        minHeight: 65,
        maxHeight: 100,
        textAlignVertical: 'top', // Important for Android to start at the top-left
    },

});
