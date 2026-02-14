import { StyleSheet } from "react-native";
import { ThemeColors } from "../../constants/Theme";

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    checkBoxContainer: {
        height: 18,
        width: 18,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center'
    }
});
