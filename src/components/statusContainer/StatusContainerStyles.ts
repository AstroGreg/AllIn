import { StyleSheet } from "react-native";
import Fonts from "../../constants/Fonts";
import { ThemeColors } from "../../constants/Theme";

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        borderWidth: 0.5,
        borderRadius: 6,
        borderColor: colors.lightGrayColor,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
        height: 38,
        gap: 6,
        flexDirection: 'row',
        position: 'absolute',
        right: 16
    },
    text: {
        ...Fonts.regular12,
        color: colors.greenColor
    }
});
