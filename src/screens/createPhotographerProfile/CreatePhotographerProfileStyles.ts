import { StyleSheet } from 'react-native';
import { ThemeColors, lightColors } from '../../constants/Theme';
import Fonts from '../../constants/Fonts';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.whiteColor,
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
        color: colors.mainTextColor,
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
        color: colors.mainTextColor,
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
        color: colors.mainTextColor,
        height: '100%',
    },

    // Continue Button
    continueButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: colors.primaryColor,
        borderRadius: 10,
        paddingVertical: 16,
        height: 54,
        marginTop: 24,
    },
    continueButtonText: {
        ...Fonts.medium16,
        color: colors.whiteColor,
    },
});

const Styles = createStyles(lightColors);

export default Styles;
