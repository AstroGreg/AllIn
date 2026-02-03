import { StyleSheet, Dimensions } from 'react-native';
import Fonts from '../../constants/Fonts';
import { ThemeColors, lightColors } from '../../constants/Theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAMERA_WIDTH = SCREEN_WIDTH - 54;
const CAMERA_HEIGHT = CAMERA_WIDTH * 1.27; // Aspect ratio from design

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.backgroundColor,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    cameraOuterContainer: {
        position: 'relative',
        width: CAMERA_WIDTH,
        height: CAMERA_HEIGHT,
    },
    cameraContainer: {
        width: '100%',
        height: '100%',
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: colors.secondaryColor,
    },
    // Custom dashed border elements
    borderCorner: {
        position: 'absolute',
        width: 24,
        height: 24,
        borderColor: colors.primaryColor,
        borderWidth: 3,
        zIndex: 10,
    },
    borderCornerTopLeft: {
        top: 0,
        left: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderTopLeftRadius: 14,
    },
    borderCornerTopRight: {
        top: 0,
        right: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
        borderTopRightRadius: 14,
    },
    borderCornerBottomLeft: {
        bottom: 0,
        left: 0,
        borderRightWidth: 0,
        borderTopWidth: 0,
        borderBottomLeftRadius: 14,
    },
    borderCornerBottomRight: {
        bottom: 0,
        right: 0,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderBottomRightRadius: 14,
    },
    borderDash: {
        position: 'absolute',
        backgroundColor: colors.primaryColor,
        zIndex: 10,
    },
    borderDashHorizontal: {
        width: 40,
        height: 3,
    },
    borderDashVertical: {
        width: 3,
        height: 40,
    },
    cameraWrapper: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    faceGuideOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    faceGuide: {
        width: CAMERA_WIDTH * 0.55,
        height: CAMERA_HEIGHT * 0.65,
        borderRadius: CAMERA_WIDTH * 0.275,
        borderWidth: 3,
        borderColor: colors.primaryColor,
        borderStyle: 'dashed',
    },
    countdownOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    countdownText: {
        fontSize: 80,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    capturedImage: {
        width: '100%',
        height: '100%',
    },
    progressBarContainer: {
        width: '100%',
        height: 16,
        position: 'relative',
        justifyContent: 'center',
    },
    progressBarTrack: {
        width: '100%',
        height: 4,
        backgroundColor: colors.lightGrayColor,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.primaryColor,
        borderRadius: 2,
    },
    progressIndicator: {
        position: 'absolute',
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: colors.primaryColor,
        marginLeft: -8,
        top: 0,
    },
    textSection: {
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 13,
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
        opacity: 0.6,
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
