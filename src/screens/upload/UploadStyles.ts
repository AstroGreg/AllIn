import { StyleSheet } from "react-native";
import Fonts from "../../constants/Fonts";
import { ThemeColors, lightColors } from "../../constants/Theme";

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.backgroundColor,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.lightGrayColor,
        alignItems: 'center',
    },
    headerTitle: {
        ...Fonts.medium18,
        color: colors.mainTextColor,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
        alignItems: 'center',
        flexGrow: 1,
        justifyContent: 'center',
    },
    tipCard: {
        width: '100%',
        backgroundColor: colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        padding: 16,
        alignItems: 'center',
    },
    tipText: {
        ...Fonts.regular14,
        color: colors.subTextColor,
        textAlign: 'center',
    },
    accountCard: {
        backgroundColor: colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    accountInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    accountDetails: {
        marginLeft: 8,
        flex: 1,
    },
    accountName: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
    },
    sportRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
        gap: 4,
    },
    sportText: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    selectButton: {
        backgroundColor: colors.primaryColor,
        borderRadius: 5,
        paddingHorizontal: 16,
        paddingVertical: 10,
        height: 38,
        width: 88,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectButtonText: {
        ...Fonts.medium12,
        color: colors.pureWhite,
    },
    createAccountButton: {
        width: '100%',
        backgroundColor: colors.primaryColor,
        borderRadius: 10,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    createAccountButtonText: {
        ...Fonts.medium16,
        color: colors.pureWhite,
    },
    anonymousButton: {
        width: '100%',
        backgroundColor: colors.btnBackgroundColor,
        borderRadius: 10,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    anonymousButtonText: {
        ...Fonts.medium16,
        color: colors.primaryColor,
    },
});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
