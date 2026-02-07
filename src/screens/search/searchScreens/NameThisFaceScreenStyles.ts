import { StyleSheet } from 'react-native';
import Fonts from '../../../constants/Fonts';
import { ThemeColors, lightColors } from '../../../constants/Theme';

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
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    sectionTitle: {
        ...Fonts.medium16,
        color: colors.mainTextColor,
    },
    capturedViewsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    capturedImageContainer: {
        width: 60,
        height: 60,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.primaryColor,
        overflow: 'hidden',
    },
    capturedImage: {
        width: '100%',
        height: '100%',
    },
    inputLabel: {
        ...Fonts.regular14,
        color: colors.mainTextColor,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.secondaryColor,
        borderWidth: 0.5,
        borderColor: colors.borderColor,
        borderRadius: 10,
        paddingHorizontal: 16,
        height: 54,
    },
    textInput: {
        flex: 1,
        ...Fonts.regular14,
        color: colors.mainTextColor,
    },
    bottomContainer: {
        paddingHorizontal: 20,
    },
    saveButton: {
        height: 54,
        borderRadius: 10,
        backgroundColor: colors.primaryColor,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    saveButtonDisabled: {
        backgroundColor: '#B0D4FF',
    },
    saveButtonText: {
        ...Fonts.medium16,
        color: '#FFFFFF',
    },
});

// Backward compatibility
const styles = createStyles(lightColors);
export default styles;
