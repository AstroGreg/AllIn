import { StyleSheet } from "react-native";
export const createStyles = (colors) => StyleSheet.create({
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
