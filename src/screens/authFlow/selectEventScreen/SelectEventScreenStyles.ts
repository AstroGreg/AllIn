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
        width: 190,
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
    cardContainer: {
        backgroundColor: colors.cardBackground,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        padding: 16,
        gap: 20,
    },
    eventItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        backgroundColor: colors.btnBackgroundColor,
    },
    eventItemSelected: {
        backgroundColor: 'rgba(60, 130, 246, 0.14)',
        borderColor: colors.primaryColor,
    },
    eventItemDisabled: {
        backgroundColor: colors.btnBackgroundColor,
    },
    eventInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    eventIcon: {
        width: 22,
        height: 22,
    },
    eventName: {
        ...Fonts.regular14,
        lineHeight: 22,
        color: colors.grayColor,
        flex: 1,
    },
    eventNameSelected: {
        color: colors.mainTextColor,
    },
    eventNameDisabled: {
        color: colors.grayColor,
    },
    lockIcon: {
        width: 16,
        height: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 16,
        marginTop: 'auto',
        paddingTop: 40,
    },
    backButton: {
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
    backButtonText: {
        ...Fonts.medium16,
        lineHeight: 24,
        color: colors.grayColor,
    },
    nextButton: {
        flex: 1,
        height: 54,
        borderRadius: 10,
        backgroundColor: colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    nextButtonText: {
        ...Fonts.medium16,
        lineHeight: 24,
        color: '#FFFFFF',
    },
});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
