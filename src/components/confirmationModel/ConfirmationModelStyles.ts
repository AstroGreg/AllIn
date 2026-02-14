import { StyleSheet } from "react-native";
import Fonts from "../../constants/Fonts";
import { ThemeColors } from "../../constants/Theme";

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {
        width: 340,
        borderRadius: 16,
        paddingVertical: 24,
        paddingHorizontal: 20,
        backgroundColor: colors.cardBackground,
        alignItems: 'center',
    },
    text: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
        textAlign: 'center',
        lineHeight: 20,
    },
    iconCont: {
        height: 64,
        width: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primaryColor,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    noBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.lightGrayColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noText: {
        ...Fonts.medium14,
        color: colors.subTextColor,
    },
    yesBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        backgroundColor: colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    yesText: {
        ...Fonts.medium14,
        color: colors.pureWhite,
    }
});
