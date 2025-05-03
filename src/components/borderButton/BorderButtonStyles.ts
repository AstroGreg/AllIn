import { StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";

const Styles = StyleSheet.create({
    btnContainre: {
        paddingHorizontal: 16,
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
        borderRadius: 6,
        maxWidth: 128,
        height: 38,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'
    },
    btnText: {
        ...Fonts.regular14,
        color: Colors.subTextColor
    }
});

export default Styles;