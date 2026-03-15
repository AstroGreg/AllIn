import { StyleSheet } from 'react-native';
import Fonts from '../../constants/Fonts';
export const createStyles = (colors) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.backgroundColor,
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
        backgroundColor: colors.btnBackgroundColor,
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
    title: Object.assign(Object.assign({}, Fonts.medium22), { fontSize: 24, color: colors.mainTextColor, textAlign: 'center', lineHeight: 32 }),
    subtitle: Object.assign(Object.assign({}, Fonts.regular14), { color: colors.subTextColor, textAlign: 'center', marginTop: 8 }),
    // Form
    formContainer: {
        gap: 16,
    },
    reviewCard: {
        borderRadius: 14,
        borderWidth: 0.5,
        borderColor: colors.borderColor,
        backgroundColor: colors.cardBackground,
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
    },
    reviewRow: {
        gap: 4,
    },
    reviewLabel: Object.assign(Object.assign({}, Fonts.medium14), { color: colors.subTextColor }),
    reviewValue: Object.assign(Object.assign({}, Fonts.regular14), { color: colors.mainTextColor, lineHeight: 22 }),
    reviewHint: Object.assign(Object.assign({}, Fonts.regular14), { color: colors.subTextColor, lineHeight: 22 }),
    inputGroup: {
        gap: 8,
    },
    inputLabel: Object.assign(Object.assign({}, Fonts.medium14), { color: colors.mainTextColor }),
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.secondaryColor,
        borderWidth: 0.5,
        borderColor: colors.borderColor,
        borderRadius: 10,
        paddingHorizontal: 16,
        height: 54,
        gap: 10,
    },
    textInput: Object.assign(Object.assign({ flex: 1 }, Fonts.regular14), { color: colors.mainTextColor, height: '100%' }),
    dropdownText: Object.assign(Object.assign({ flex: 1 }, Fonts.regular14), { color: colors.mainTextColor }),
    placeholderText: {
        color: colors.grayColor,
    },
    // Bottom Container
    bottomContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 16,
        backgroundColor: colors.backgroundColor,
        gap: 16,
    },
    skipButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        paddingVertical: 16,
        height: 54,
    },
    skipButtonText: Object.assign(Object.assign({}, Fonts.medium16), { color: colors.subTextColor }),
    nextButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: colors.primaryColor,
        borderRadius: 10,
        paddingVertical: 16,
        height: 54,
    },
    nextButtonText: Object.assign(Object.assign({}, Fonts.medium16), { color: colors.pureWhite }),
});
