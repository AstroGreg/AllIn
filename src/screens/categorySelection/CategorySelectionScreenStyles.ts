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
        marginTop: 10,
    },
    optionsContainer: {
        gap: 24,
        marginTop: 24,
    },
    optionCard: {
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        backgroundColor: colors.cardBackground,
        padding: 16,
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
        gap: 6,
    },
    optionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 50,
        height: 50,
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
        gap: 6,
    },
    optionTitle: {
        ...Fonts.medium18,
        lineHeight: 26,
        color: colors.mainTextColor,
    },
    optionSubtitle: {
        ...Fonts.regular14,
        lineHeight: 22,
        color: colors.grayColor,
    },
    optionDescription: {
        ...Fonts.regular14,
        lineHeight: 22,
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
        paddingBottom: 40,
        marginTop: 'auto',
    },
});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
