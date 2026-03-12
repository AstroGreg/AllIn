import { StyleSheet } from 'react-native';
import Fonts from '../../constants/Fonts';
import { ThemeColors, lightColors } from '../../constants/Theme';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.backgroundColor,
    },
    contentShell: {
        flex: 1,
        minHeight: 0,
        paddingHorizontal: 20,
    },
    headerContainer: {
        alignItems: 'center',
    },
    headingText: {
        ...Fonts.medium22,
        fontSize: 22,
        lineHeight: 28,
        color: colors.mainTextColor,
        textAlign: 'center',
    },
    subHeadingText: {
        ...Fonts.regular14,
        lineHeight: 20,
        color: colors.grayColor,
        textAlign: 'center',
        marginTop: 8,
    },
    optionsSection: {
        flex: 1,
        minHeight: 0,
        marginTop: 12,
    },
    optionsScroll: {
        flex: 1,
    },
    optionsContainer: {
        gap: 12,
        paddingBottom: 8,
    },
    optionCard: {
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        backgroundColor: colors.cardBackground,
        paddingHorizontal: 14,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    optionCardSelected: {
        backgroundColor: colors.secondaryBlueColor,
        borderColor: colors.primaryColor,
    },
    optionContent: {
        flex: 1,
        gap: 4,
    },
    optionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: colors.btnBackgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainerSelected: {
        backgroundColor: colors.secondaryBlueColor,
    },
    optionTextContainer: {
        flex: 1,
        gap: 2,
    },
    optionTitle: {
        ...Fonts.medium16,
        lineHeight: 22,
        color: colors.mainTextColor,
    },
    optionSubtitle: {
        ...Fonts.regular13,
        lineHeight: 18,
        color: colors.grayColor,
    },
    optionDescription: {
        ...Fonts.regular13,
        lineHeight: 19,
        color: colors.grayColor,
    },
    arrowContainer: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: colors.btnBackgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonContainer: {
        paddingHorizontal: 20,
        paddingBottom: 14,
        paddingTop: 16,
        gap: 10,
        backgroundColor: colors.backgroundColor,
    },
    nextStepText: {
        ...Fonts.regular14,
        lineHeight: 22,
        color: colors.grayColor,
        textAlign: 'center',
    },
    guestButton: {
        height: 54,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.primaryColor,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    guestButtonText: {
        ...Fonts.medium16,
        lineHeight: 24,
        color: colors.primaryColor,
    },
});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
