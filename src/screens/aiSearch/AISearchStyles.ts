import { StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';
import Fonts from '../../constants/Fonts';

const Styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.whiteColor,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: '#DEDEDE',
        backgroundColor: Colors.whiteColor,
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...Fonts.medium18,
        color: Colors.mainTextColor,
    },

    // Top Section with Gradient
    topSection: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderBottomWidth: 1,
        borderBottomColor: '#EDE9FE',
    },
    titleSection: {
        marginBottom: 0,
    },
    mainTitle: {
        ...Fonts.bold36,
        fontSize: 36,
        lineHeight: 45,
        color: '#101828',
        letterSpacing: -0.53,
    },
    subtitle: {
        ...Fonts.regular14,
        fontSize: 18,
        lineHeight: 29,
        color: '#4A5565',
        letterSpacing: -0.44,
    },

    // Options Container
    optionsContainer: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    optionsContent: {
        paddingHorizontal: 20,
        paddingTop: 32,
        gap: 16,
    },

    // Search Option Card
    searchOptionCard: {
        backgroundColor: Colors.whiteColor,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: '#DEDEDE',
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
        color: '#101828',
        letterSpacing: -0.45,
        marginBottom: 8,
    },
    optionDescription: {
        ...Fonts.regular14,
        fontSize: 16,
        lineHeight: 26,
        color: '#4A5565',
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
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 18,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
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
        color: '#101828',
        letterSpacing: -0.35,
    },
    modalTitle: {
        ...Fonts.bold24,
        fontSize: 25,
        lineHeight: 36,
        color: '#101828',
        letterSpacing: -0.35,
    },
    modalDescription: {
        ...Fonts.regular14,
        fontSize: 16,
        lineHeight: 24,
        color: '#4A5565',
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
    },
    subscribeButtonText: {
        ...Fonts.bold16,
        fontSize: 18,
        color: Colors.whiteColor,
        letterSpacing: -0.44,
    },
});

export default Styles;
