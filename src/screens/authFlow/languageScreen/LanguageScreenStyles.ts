import { StyleSheet } from "react-native";
import Colors from "../../../constants/Colors";
import Fonts from "../../../constants/Fonts";

const Styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.whiteColor,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'center'
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

})

export default Styles;