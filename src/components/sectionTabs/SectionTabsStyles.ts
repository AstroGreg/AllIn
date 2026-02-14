import { StyleSheet } from "react-native";
import Fonts from "../../constants/Fonts";
import { ThemeColors } from "../../constants/Theme";

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        height: 45,
        gap: 20,
    },
    tabs: {
        height: '100%',
        flex: 2,
        alignItems: 'center',
        paddingTop: 15
    },
    tabText: {
        ...Fonts.regular14,
        color: colors.subTextColor,
        fontWeight: '400',
        paddingBottom: 12
    },
});
