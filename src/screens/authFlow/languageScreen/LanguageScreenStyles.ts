import { StyleSheet } from "react-native";
import Fonts from "../../../constants/Fonts";
import { ThemeColors, lightColors } from "../../../constants/Theme";

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.backgroundColor,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'center'
    },
    headingText: {
        ...Fonts.semibold22,
        color: colors.mainTextColor,
        fontWeight: '500',
        textAlign: 'center'
    },
    subHeadingText: {
        ...Fonts.regular14,
        color: colors.grayColor,
        fontWeight: '400',
        textAlign: 'center'
    },
    optionsContainer: {
        width: '100%',
    },
    optionItem: {
        minHeight: 60,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        backgroundColor: colors.cardBackground,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    optionItemSelected: {
        borderColor: colors.primaryColor,
    },
    optionText: {
        ...Fonts.medium16,
        color: colors.mainTextColor,
        flex: 1,
    },
    optionTextUnselected: {
        color: colors.grayColor,
    },
    radioOuter: {
        width: 18,
        height: 18,
        borderRadius: 9,
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
