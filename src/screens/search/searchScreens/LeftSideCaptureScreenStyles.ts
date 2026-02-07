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
        paddingTop: 16,
    },
    instructionText: {
        ...Fonts.regular14,
        color: colors.grayColor,
        textAlign: 'center',
    },
    capturedImage: {
        width: '100%',
        height: '100%',
    },
    cameraPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.secondaryColor,
    },
    tapToCapture: {
        ...Fonts.regular14,
        color: colors.grayColor,
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    outlineButton: {
        width: 100,
        height: 54,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    outlineButtonDisabled: {
        borderColor: colors.secondaryColor,
    },
    outlineButtonText: {
        ...Fonts.medium16,
        color: colors.grayColor,
    },
    outlineButtonTextDisabled: {
        color: colors.lightGrayColor,
    },
    captureButton: {
        width: 140,
        height: 54,
        borderRadius: 10,
        backgroundColor: colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    captureButtonText: {
        ...Fonts.medium16,
        color: '#FFFFFF',
    },
});

// Backward compatibility
const styles = createStyles(lightColors);
export default styles;
