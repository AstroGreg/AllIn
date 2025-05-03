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
        ...Fonts.semibold22,
        color: Colors.mainTextColor,
        fontWeight: '500',
        textAlign: 'center'
    },
    subHeadingText: {
        ...Fonts.regular14,
        color: Colors.subTextColor,
        fontWeight: '400',
        textAlign: 'center'
    },
    checkBox: {
        flexDirection: 'row'
    },
    rememberMeText: {
        ...Fonts.regular14,
        color: Colors.mainTextColor,
        fontWeight: '400',
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