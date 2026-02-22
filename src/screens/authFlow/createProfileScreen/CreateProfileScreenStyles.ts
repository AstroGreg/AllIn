import { StyleSheet } from 'react-native';
import Fonts from '../../../constants/Fonts';
import { ThemeColors, lightColors } from '../../../constants/Theme';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.backgroundColor,
    },
    imageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerImage: {
        width: 163,
        height: 155,
    },
    contentContainer: {
        paddingHorizontal: 20,
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
    label: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
    },
    inputContainer: {
        minHeight: 58,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.lightGrayColor,
        backgroundColor: (colors as any).inputBackgroundColor ?? (colors as any).cardBackground ?? colors.backgroundColor,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
