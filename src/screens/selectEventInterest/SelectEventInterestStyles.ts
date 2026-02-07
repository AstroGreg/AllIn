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
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        paddingHorizontal: 20,
        flexGrow: 1,
    },

    // Illustration
    illustrationContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    illustration: {
        width: 190,
        height: 140,
    },

    // Title Section
    titleSection: {
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 24,
    },
    title: {
        ...Fonts.medium22,
        fontSize: 24,
        color: Colors.mainTextColor,
        textAlign: 'center',
        lineHeight: 32,
    },
    subtitle: {
        ...Fonts.regular14,
        color: '#9B9F9F',
        textAlign: 'center',
        marginTop: 8,
    },

    // Options Card
    optionsCard: {
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        padding: 16,
        gap: 20,
    },

    // Event Option
    eventOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    eventOptionSelected: {
        backgroundColor: 'rgba(60, 130, 246, 0.14)',
        borderColor: Colors.primaryColor,
    },
    eventOptionDisabled: {
        backgroundColor: '#F5F5F5',
    },
    eventOptionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    eventIcon: {
        width: 22,
        height: 22,
    },
    eventOptionText: {
        ...Fonts.regular14,
        color: Colors.mainTextColor,
    },
    eventOptionTextDisabled: {
        color: '#9B9F9F',
    },

    // Bottom Container
    bottomContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 16,
        backgroundColor: Colors.whiteColor,
        gap: 16,
    },
    backButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        borderRadius: 10,
        paddingVertical: 16,
        height: 54,
    },
    backButtonText: {
        ...Fonts.medium16,
        color: '#9B9F9F',
    },
    nextButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: Colors.primaryColor,
        borderRadius: 10,
        paddingVertical: 16,
        height: 54,
    },
    nextButtonDisabled: {
        opacity: 0.5,
    },
    nextButtonText: {
        ...Fonts.medium16,
        color: Colors.whiteColor,
    },
});

export default Styles;
