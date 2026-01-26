import { StyleSheet } from "react-native";
import Fonts from "../../../constants/Fonts";
import { ThemeColors, lightColors } from "../../../constants/Theme";

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.backgroundColor,
    },
    contentContainer: {
        paddingHorizontal: 20
    },
    headingText: {
        ...Fonts.medium22,
        fontSize: 24,
        lineHeight: 32,
        color: colors.mainTextColor,
        textAlign: 'center'
    },
    subHeadingText: {
        ...Fonts.regular14,
        lineHeight: 22,
        color: colors.grayColor,
        textAlign: 'center'
    },
    checkBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        width: '100%',
    },
    checkboxIcon: {
        marginTop: 3,
    },
    rememberMeText: {
        ...Fonts.regular14,
        lineHeight: 22,
        color: colors.mainTextColor,
        flexWrap: 'wrap',
    },
    termsTextContainer: {
        flex: 1,
        paddingRight: 10,
    },
    linkText: {
        ...Fonts.regular14,
        lineHeight: 22,
        color: colors.primaryColor,
        textDecorationLine: 'underline',
    },
    forgotPass: {
        ...Fonts.regular14,
        color: colors.errorColor,
        fontWeight: '400',
    },
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    }
});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
