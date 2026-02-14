import { StyleSheet } from "react-native";
import Fonts from "../../constants/Fonts";
import { ThemeColors } from "../../constants/Theme";

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    searchContainer: {
        height: 54,
        borderWidth: 1,
        borderColor: colors.borderColor,
        borderRadius: 10,
        backgroundColor: colors.secondaryColor,
        alignItems: 'center',
        paddingHorizontal: 16,
        flexDirection: 'row',
        gap: 6,
        overflow: 'hidden',
        marginHorizontal: 20
    },
    searchBarText: {
        height: '100%',
        ...Fonts.regular14,
        color: colors.mainTextColor,
        width: '90%'
    }
});
