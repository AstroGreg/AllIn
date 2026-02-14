import { StyleSheet } from "react-native";
import Fonts from "../../constants/Fonts";
import { ThemeColors } from "../../constants/Theme";

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    label: {
        ...Fonts.regular14,
        color: colors.mainTextColor,
        fontWeight: '400'
    },
    subLabel: {
        ...Fonts.regular13,
        color: colors.subTextColor,
    },
    inputContainer: {
        height: 54,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: colors.borderColor,
        backgroundColor: colors.secondaryColor,
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: 16,
        overflow: 'hidden',
    },
    inputTitle: {
        ...Fonts.regular14,
        color: colors.grayColor,
    },
    input: {
        ...Fonts.regular14,
        color: colors.mainTextColor,
    },
    inputBox: {
        flexDirection: 'column',
        width: '90%',
    },
    eyeIcon: {
        position: 'absolute',
        right: 16,
        zIndex: 1
    }
});
