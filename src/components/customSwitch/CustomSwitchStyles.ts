import { StyleSheet } from "react-native";
import { ThemeColors } from "../../constants/Theme";

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    switchBase: {
        width: 35,
        height: 18,
        borderRadius: 15,
        justifyContent: "center",
        padding: 3,
    },
    switchOn: {
        backgroundColor: colors.primaryColor,
    },
    switchOff: {
        backgroundColor: colors.lightGrayColor,
    },
    switchThumb: {
        width: 14,
        height: 14,
        borderRadius: 11,
        backgroundColor: colors.pureWhite,
        position: "absolute",
        top: 2,
    },
});
