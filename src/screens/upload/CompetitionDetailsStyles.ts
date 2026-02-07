import { StyleSheet } from "react-native";
import Fonts from "../../constants/Fonts";
import { ThemeColors, lightColors } from "../../constants/Theme";

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.backgroundColor,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 0.3,
        borderBottomColor: colors.lightGrayColor,
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.btnBackgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...Fonts.medium18,
        color: colors.mainTextColor,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    tipCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        padding: 16,
        alignItems: 'center',
    },
    tipText: {
        ...Fonts.regular14,
        color: colors.grayColor,
        textAlign: 'center',
        lineHeight: 22,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: colors.btnBackgroundColor,
        borderRadius: 10,
        padding: 4,
    },
    toggleTab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
    toggleTabActive: {
        backgroundColor: colors.primaryColor,
    },
    toggleTabText: {
        ...Fonts.medium14,
        color: colors.grayColor,
    },
    toggleTabTextActive: {
        color: colors.pureWhite,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sectionTitle: {
        ...Fonts.medium18,
        color: colors.mainTextColor,
    },
    sectionFilterButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.cardBackground,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 10,
    },
    categoryName: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
    },
    uploadIconButton: {
        borderRadius: 8,
        backgroundColor: colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 29,
    },
    addCategoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primaryColor,
        borderRadius: 10,
        paddingVertical: 14,
        gap: 8,
    },
    addCategoryButtonText: {
        ...Fonts.medium14,
        color: colors.pureWhite,
    },
    unlabelledButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.cardBackground,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.primaryColor,
        paddingVertical: 14,
        gap: 8,
    },
    unlabelledButtonText: {
        ...Fonts.medium14,
        color: colors.primaryColor,
    },
    divider: {
        height: 1,
        backgroundColor: colors.lightGrayColor,
    },
    finishButton: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E34949',
        borderRadius: 10,
        paddingVertical: 16,
    },
    finishButtonText: {
        ...Fonts.medium16,
        color: colors.pureWhite,
    },
});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
