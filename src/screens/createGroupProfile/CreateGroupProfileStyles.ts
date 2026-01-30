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
        width: 200,
        height: 150,
    },

    // Title Section
    titleSection: {
        alignItems: 'center',
        marginTop: 20,
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

    // Add More Athletes Button
    addMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        paddingHorizontal: 16,
        height: 38,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        borderRadius: 6,
        backgroundColor: Colors.whiteColor,
        alignSelf: 'flex-start',
    },
    addMoreText: {
        ...Fonts.regular14,
        color: '#898989',
    },

    // Continue Button
    continueButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: Colors.primaryColor,
        borderRadius: 10,
        paddingVertical: 16,
        height: 54,
        marginTop: 24,
    },
    continueButtonText: {
        ...Fonts.medium16,
        color: Colors.whiteColor,
    },
});

export default Styles;
