import { StyleSheet, Dimensions } from "react-native";
import Fonts from "../../constants/Fonts";
import { ThemeColors, lightColors } from "../../constants/Theme";

const { height } = Dimensions.get('window');

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: colors.modalBackground,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: height * 0.9,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        ...Fonts.semibold20,
        color: colors.mainTextColor,
    },
    closeButton: {
        padding: 4,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: colors.btnBackgroundColor,
        borderRadius: 10,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: colors.primaryColor,
    },
    tabText: {
        ...Fonts.medium14,
        color: colors.subTextColor,
    },
    activeTabText: {
        color: colors.pureWhite,
    },
    plansContainer: {
        paddingBottom: 20,
    },
    planCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borderColor,
        padding: 20,
        marginBottom: 16,
    },
    popularPlanCard: {
        borderColor: colors.primaryColor,
        borderWidth: 2,
    },
    popularBadge: {
        position: 'absolute',
        top: -12,
        right: 20,
        backgroundColor: colors.primaryColor,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    popularBadgeText: {
        ...Fonts.medium12,
        color: colors.pureWhite,
    },
    planName: {
        ...Fonts.semibold18,
        color: colors.mainTextColor,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: 8,
    },
    planPrice: {
        ...Fonts.bold28,
        color: colors.mainTextColor,
    },
    planPeriod: {
        ...Fonts.regular14,
        color: colors.subTextColor,
        marginLeft: 4,
    },
    planCredits: {
        ...Fonts.regular12,
        color: colors.primaryColor,
        marginTop: 4,
    },
    featuresContainer: {
        marginTop: 16,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    featureText: {
        ...Fonts.regular14,
        color: colors.grayColor,
        marginLeft: 10,
        flex: 1,
    },
    getStartedButton: {
        backgroundColor: colors.cardBackground,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.primaryColor,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 16,
    },
    popularGetStartedButton: {
        backgroundColor: colors.primaryColor,
        borderColor: colors.primaryColor,
    },
    getStartedButtonText: {
        ...Fonts.medium14,
        color: colors.primaryColor,
    },
    popularGetStartedButtonText: {
        color: colors.pureWhite,
    },
});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
