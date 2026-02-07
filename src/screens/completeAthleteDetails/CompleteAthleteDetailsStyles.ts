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
        marginTop: 10,
    },
    illustration: {
        width: 235,
        height: 145,
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

    // Form
    formContainer: {
        gap: 16,
    },
    inputGroup: {
        gap: 8,
    },
    inputLabel: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7FAFF',
        borderWidth: 0.5,
        borderColor: '#E0ECFE',
        borderRadius: 10,
        paddingHorizontal: 16,
        height: 54,
        gap: 10,
    },
    textInput: {
        flex: 1,
        ...Fonts.regular14,
        color: Colors.mainTextColor,
        height: '100%',
    },
    dropdownText: {
        flex: 1,
        ...Fonts.regular14,
        color: Colors.mainTextColor,
    },
    placeholderText: {
        color: '#777777',
    },

    // Bottom Container
    bottomContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 16,
        backgroundColor: Colors.whiteColor,
        gap: 16,
    },
    skipButton: {
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
    skipButtonText: {
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
    nextButtonText: {
        ...Fonts.medium16,
        color: Colors.whiteColor,
    },
});

export default Styles;
