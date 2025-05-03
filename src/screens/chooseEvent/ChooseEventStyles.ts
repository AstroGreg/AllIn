import { StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";

const Styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.whiteColor
    },
    screenHeader: {
        ...Fonts.regular16,
        fontWeight: '500',
        color: Colors.mainTextColor
    },
    subText: {
        ...Fonts.regular12,
        fontWeight: '400',
        color: Colors.subTextColor
    },
    container: {
        paddingHorizontal: 20
    }
});

export default Styles;