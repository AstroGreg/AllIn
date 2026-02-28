import { StyleSheet } from "react-native";
import Fonts from "../../constants/Fonts";
import { ThemeColors } from "../../constants/Theme";

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    buttonContainer: {
        height: 54,
        borderRadius: 10,
        backgroundColor: colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        width: '100%'
    },
    secondaryButtonContainer: {
        backgroundColor: colors.backgroundColor,
        borderWidth: 1,
        borderColor: colors.primaryColor,
    },
    btnText: {
        ...Fonts.regular16,
        color: colors.pureWhite,
        fontWeight: '500',
    },
    secondaryBtnText: {
        color: colors.primaryColor,
    },
    backIconRotate: {
        transform: [{ rotate: '180deg' }],
    },
});
