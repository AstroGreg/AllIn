import { StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";

const Styles = StyleSheet.create({
    container: {
        borderWidth: 0.5,
        borderRadius: 6,
        borderColor: Colors.lightGrayColor,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
        height: 38,
        gap: 6,
        flexDirection: 'row',
        position: 'absolute',
        right: 16
    },
    text: {
        ...Fonts.regular12,
        color: Colors.greenColor
    }
})

export default Styles;