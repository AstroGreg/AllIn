import { StyleSheet } from "react-native";
import Fonts from "../../constants/Fonts";
import { ThemeColors } from "../../constants/Theme";

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    btnContainre: {
        paddingHorizontal: 16,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 6,
        maxWidth: 128,
        height: 38,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'
    },
    btnText: {
        ...Fonts.regular14,
        color: colors.subTextColor
    }
});
