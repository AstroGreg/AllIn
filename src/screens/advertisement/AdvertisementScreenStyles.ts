import { StyleSheet, Dimensions } from 'react-native';
import Fonts from '../../constants/Fonts';
import { ThemeColors, lightColors } from '../../constants/Theme';

const { width, height } = Dimensions.get('window');

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.backgroundColor,
    },
    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: width,
        height: height,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    adOverlay: {
        backgroundColor: 'rgba(83, 83, 83, 0.5)',
        borderRadius: 10,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    adText: {
        ...Fonts.medium22,
        fontSize: 24,
        lineHeight: 32,
        color: colors.pureWhite,
        textAlign: 'center',
        width: 324,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 60,
        left: 20,
        right: 20,
    },
    skipButton: {
        height: 54,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        backgroundColor: colors.backgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    skipButtonText: {
        ...Fonts.medium16,
        lineHeight: 24,
        color: colors.grayColor,
    },
});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
