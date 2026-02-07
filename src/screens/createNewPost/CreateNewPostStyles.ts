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
        borderBottomColor: colors.borderColor,
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.btnBackgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerButtonPlaceholder: {
        width: 44,
        height: 44,
    },
    headerTitle: {
        ...Fonts.medium18,
        color: colors.mainTextColor,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    sectionTitle: {
        ...Fonts.medium18,
        color: colors.mainTextColor,
    },
    inputContainer: {
        width: '100%',
    },
    inputLabel: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
    },
    uploadContainer: {
        backgroundColor: colors.secondaryColor,
        borderWidth: 1,
        borderColor: colors.primaryColor,
        borderStyle: 'dashed',
        borderRadius: 10,
        paddingVertical: 32,
        paddingHorizontal: 87,
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadText: {
        ...Fonts.regular14,
        color: colors.grayColor,
    },
    uploadOrText: {
        ...Fonts.regular14,
        color: colors.grayColor,
    },
    browseButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    browseButtonText: {
        ...Fonts.medium14,
        color: colors.primaryColor,
    },
    textInputContainer: {
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
    textInput: {
        flex: 1,
        ...Fonts.regular14,
        color: colors.mainTextColor,
        height: '100%',
    },
    textAreaContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: colors.secondaryColor,
        borderWidth: 0.5,
        borderColor: colors.borderColor,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 16,
        height: 180,
        gap: 6,
    },
    textArea: {
        flex: 1,
        ...Fonts.regular14,
        color: colors.mainTextColor,
        height: '100%',
    },
    buttonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cancelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.5,
        borderColor: colors.borderColor,
        borderRadius: 10,
        height: 54,
        width: '47%',
        gap: 8,
    },
    cancelButtonText: {
        ...Fonts.medium16,
        color: colors.subTextColor,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primaryColor,
        borderRadius: 10,
        height: 54,
        width: '47%',
        gap: 8,
    },
    createButtonText: {
        ...Fonts.medium16,
        color: colors.pureWhite,
    },
});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
