import { StyleSheet } from 'react-native';
import Fonts from '../../../constants/Fonts';
import { ThemeColors, lightColors } from '../../../constants/Theme';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.backgroundColor,
    },
    contentContainer: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 40,
    },
    headerContainer: {
        alignItems: 'center',
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
    languageListContainer: {
        width: '100%',
    },
    languageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        backgroundColor: colors.cardBackground,
    },
    languageInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    flagContainer: {
        width: 60,
        height: 60,
        borderRadius: 6,
        overflow: 'hidden',
    },
    flagImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    languageName: {
        ...Fonts.medium18,
        lineHeight: 26,
        color: colors.mainTextColor,
    },
    languageNameUnselected: {
        color: colors.grayColor,
    },
    radioOuter: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
    },
    radioOuterSelected: {
        borderWidth: 1,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primaryColor,
    },
});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
