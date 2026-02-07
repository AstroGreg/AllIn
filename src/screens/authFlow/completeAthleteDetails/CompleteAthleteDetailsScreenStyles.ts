import { StyleSheet } from 'react-native';
import Fonts from '../../../constants/Fonts';
import { ThemeColors, lightColors } from '../../../constants/Theme';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.backgroundColor,
    },
    scrollContent: {
        flexGrow: 1,
    },
    imageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerImage: {
        width: 235.3,
        height: 141.59,
    },
    contentContainer: {
        paddingHorizontal: 20,
        flex: 1,
    },
    headingText: {
        ...Fonts.medium22,
        fontSize: 24,
        lineHeight: 32,
        color: colors.mainTextColor,
        textAlign: 'center',
    },
    subHeadingText: {
        ...Fonts.regular14,
        lineHeight: 22,
        color: colors.grayColor,
        textAlign: 'center',
    },
    formContainer: {
        gap: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 16,
        marginTop: 'auto',
        paddingTop: 40,
    },
    skipButton: {
        flex: 1,
        height: 54,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
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
    finishButton: {
        flex: 1,
        height: 54,
        borderRadius: 10,
        backgroundColor: colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    finishButtonText: {
        ...Fonts.medium16,
        lineHeight: 24,
        color: '#FFFFFF',
    },
});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
