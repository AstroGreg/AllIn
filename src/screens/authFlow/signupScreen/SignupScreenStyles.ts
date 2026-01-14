import { StyleSheet } from "react-native";
import Colors from "../../../constants/Colors";
import Fonts from "../../../constants/Fonts";

const Styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.whiteColor,
    },
    contentContainer: {
        paddingHorizontal: 20
    },
    headingText: {
        ...Fonts.medium22,
        fontSize: 24,
        lineHeight: 32,
        color: Colors.mainTextColor,
        textAlign: 'center'
    },
    subHeadingText: {
        ...Fonts.regular14,
        lineHeight: 22,
        color: '#9B9F9F',
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
        color: Colors.mainTextColor,
        flexWrap: 'wrap',
    },
    termsTextContainer: {
        flex: 1,
        paddingRight: 10,
    },
    linkText: {
        ...Fonts.regular14,
        lineHeight: 22,
        color: Colors.primaryColor,
        textDecorationLine: 'underline',
    },
    forgotPass: {
        ...Fonts.regular14,
        color: Colors.errorColor,
        fontWeight: '400',
    },
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    }
})

export default Styles;