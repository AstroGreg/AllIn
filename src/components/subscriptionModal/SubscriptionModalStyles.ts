import { StyleSheet, Dimensions } from "react-native";
import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";

const { height } = Dimensions.get('window');

const Styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: Colors.whiteColor,
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
        color: Colors.mainTextColor,
    },
    closeButton: {
        padding: 4,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
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
        backgroundColor: Colors.primaryColor,
    },
    tabText: {
        ...Fonts.medium14,
        color: '#9B9F9F',
    },
    activeTabText: {
        color: Colors.whiteColor,
    },
    plansContainer: {
        paddingBottom: 20,
    },
    planCard: {
        backgroundColor: Colors.whiteColor,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#DEDEDE',
        padding: 20,
        marginBottom: 16,
    },
    popularPlanCard: {
        borderColor: Colors.primaryColor,
        borderWidth: 2,
    },
    popularBadge: {
        position: 'absolute',
        top: -12,
        right: 20,
        backgroundColor: Colors.primaryColor,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    popularBadgeText: {
        ...Fonts.medium12,
        color: Colors.whiteColor,
    },
    planName: {
        ...Fonts.semibold18,
        color: Colors.mainTextColor,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: 8,
    },
    planPrice: {
        ...Fonts.bold28,
        color: Colors.mainTextColor,
    },
    planPeriod: {
        ...Fonts.regular14,
        color: '#9B9F9F',
        marginLeft: 4,
    },
    planCredits: {
        ...Fonts.regular12,
        color: Colors.primaryColor,
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
        color: '#777777',
        marginLeft: 10,
        flex: 1,
    },
    getStartedButton: {
        backgroundColor: Colors.whiteColor,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.primaryColor,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 16,
    },
    popularGetStartedButton: {
        backgroundColor: Colors.primaryColor,
        borderColor: Colors.primaryColor,
    },
    getStartedButtonText: {
        ...Fonts.medium14,
        color: Colors.primaryColor,
    },
    popularGetStartedButtonText: {
        color: Colors.whiteColor,
    },
});

export default Styles;
