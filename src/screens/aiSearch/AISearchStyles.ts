import { StyleSheet } from 'react-native';
import Fonts from '../../constants/Fonts';
import { ThemeColors, lightColors } from '../../constants/Theme';

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
        borderBottomWidth: 0.5,
        borderBottomColor: colors.lightGrayColor,
        backgroundColor: colors.backgroundColor,
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

    // Top Section with Gradient
    topSection: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 32,
    },
    titleSection: {
        marginBottom: 0,
    },
    mainTitle: {
        ...Fonts.bold36,
        fontSize: 36,
        lineHeight: 45,
        color: colors.mainTextColor,
        letterSpacing: -0.53,
    },
    subtitle: {
        ...Fonts.regular14,
        fontSize: 18,
        lineHeight: 29,
        color: colors.grayColor,
        letterSpacing: -0.44,
    },

    // Options Container
    optionsContainer: {
        flex: 1,
        backgroundColor: colors.backgroundColor,
    },
    optionsContent: {
        paddingHorizontal: 20,
        paddingTop: 32,
        gap: 16,
    },
    searchByLabel: {
        ...Fonts.semibold12,
        color: colors.subTextColor,
    },
    optionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    optionButton: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.lightGrayColor,
        backgroundColor: colors.cardBackground,
        minWidth: 120,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionButtonActive: {
        borderColor: colors.primaryColor,
        backgroundColor: colors.secondaryBlueColor,
    },
    optionButtonText: {
        ...Fonts.medium14,
        fontSize: 13,
        color: colors.mainTextColor,
    },
    optionButtonTextActive: {
        color: colors.primaryColor,
    },

    // Search Option Card
    searchOptionCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: colors.lightGrayColor,
        padding: 25,
        marginBottom: 16,
        overflow: 'hidden',
    },
    searchOptionCardSelected: {
        borderWidth: 2,
        borderColor: '#A684FF',
        shadowColor: '#DDD6FF',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.5,
        shadowRadius: 25,
        elevation: 10,
    },
    searchOptionContent: {
        flexDirection: 'row',
        gap: 20,
    },

    // Icon Container
    iconContainerWrapper: {
        position: 'relative',
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 8,
        zIndex: 2,
    },
    iconGlow: {
        position: 'absolute',
        top: -6,
        left: -6,
        width: 76,
        height: 76,
        borderRadius: 16,
        backgroundColor: '#A684FF',
        opacity: 0.51,
        zIndex: 1,
    },
    iconBlurEffect: {
        position: 'absolute',
        top: 4,
        left: 4,
        width: 56,
        height: 56,
        borderRadius: 14,
        backgroundColor: '#7F22FE',
        opacity: 0.4,
        zIndex: 0,
        shadowColor: '#7F22FE',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 16,
        elevation: 12,
    },

    // Text Container
    textContainer: {
        flex: 1,
    },
    optionTitle: {
        ...Fonts.bold20,
        fontSize: 20,
        lineHeight: 25,
        color: colors.mainTextColor,
        letterSpacing: -0.45,
        marginBottom: 8,
    },
    optionDescription: {
        ...Fonts.regular14,
        fontSize: 16,
        lineHeight: 26,
        color: colors.grayColor,
        letterSpacing: -0.31,
        marginBottom: 16,
    },

    // Badge
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 100,
        borderWidth: 1,
        gap: 6,
    },
    badgeText: {
        ...Fonts.semibold14,
        lineHeight: 20,
        letterSpacing: -0.15,
    },

    // Progress Bar
    progressBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 6,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContainer: {
        backgroundColor: colors.modalBackground,
        borderRadius: 18,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        padding: 20,
        width: '100%',
        shadowColor: '#DDD6FF',
        shadowOffset: { width: 0, height: 25 },
        shadowOpacity: 0.5,
        shadowRadius: 50,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    modalPrice: {
        ...Fonts.bold24,
        color: colors.mainTextColor,
        letterSpacing: -0.35,
    },
    modalTitle: {
        ...Fonts.bold24,
        fontSize: 25,
        lineHeight: 36,
        color: colors.mainTextColor,
        letterSpacing: -0.35,
    },
    modalDescription: {
        ...Fonts.regular14,
        fontSize: 16,
        lineHeight: 24,
        color: colors.grayColor,
        letterSpacing: -0.44,
        marginTop: 16,
        marginBottom: 24,
    },
    subscribeButton: {
        height: 57,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
        shadowColor: '#C4B4FF',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 8,
        backgroundColor: colors.primaryColor,
    },
    subscribeButtonText: {
        ...Fonts.bold16,
        fontSize: 18,
        color: '#FFFFFF',
        letterSpacing: -0.44,
    },
});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
