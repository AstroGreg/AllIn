import { StyleSheet } from 'react-native';
import Fonts from '../../constants/Fonts';
import { ThemeColors, lightColors } from '../../constants/Theme';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.backgroundColor,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    contentContainer: {
        gap: 32,
        alignItems: 'center',
    },
    verificationSection: {
        gap: 30,
        alignItems: 'center',
        width: '100%',
    },
    imageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageWrapper: {
        width: 336,
        height: 427,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: colors.primaryColor,
        borderStyle: 'dashed',
        overflow: 'hidden',
        position: 'relative',
    },
    faceImage: {
        width: '100%',
        height: '100%',
        borderRadius: 14,
    },
    cameraPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    tapToCaptureText: {
        ...Fonts.regular14,
        lineHeight: 22,
        color: colors.grayColor,
        textAlign: 'center',
    },
    progressSection: {
        gap: 20,
        alignItems: 'center',
        width: '100%',
    },
    textSection: {
        gap: 14,
        alignItems: 'center',
        width: '100%',
    },
    titleText: {
        ...Fonts.medium16,
        fontSize: 18,
        lineHeight: 26,
        color: colors.mainTextColor,
        textAlign: 'center',
    },
    descriptionText: {
        ...Fonts.regular14,
        lineHeight: 22,
        color: colors.grayColor,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    buttonContainer: {
        width: '100%',
        gap: 24,
    },
    primaryButton: {
        height: 54,
        borderRadius: 10,
        backgroundColor: colors.primaryColor,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    primaryButtonText: {
        ...Fonts.medium16,
        lineHeight: 24,
        color: colors.pureWhite,
    },
    primaryButtonDisabled: {
        opacity: 0.5,
    },
    secondaryButton: {
        height: 54,
        borderRadius: 10,
        backgroundColor: colors.backgroundColor,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    secondaryButtonText: {
        ...Fonts.medium16,
        lineHeight: 24,
        color: colors.grayColor,
    },
});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
