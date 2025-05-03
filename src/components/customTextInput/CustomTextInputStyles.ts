import { StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";

const Styles = StyleSheet.create({
    label: {
        ...Fonts.regular14,
        color: Colors.mainTextColor,
        fontWeight: '400'
    },
    subLabel: {
        ...Fonts.regular13,
        color: Colors.subTextColor,
    },
    inputContainer: {
        height: 54,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: Colors.borderColor,
        backgroundColor: Colors.secondaryColor,
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: 16,
        overflow: 'hidden',
    },
    inputTitle: {
        ...Fonts.regular14,
        color: Colors.grayColor,
    },
    input: {
        ...Fonts.regular14,
        color: Colors.mainTextColor,
    },
    inputBox: {
        flexDirection: 'column',
        width: '90%',
    },
    eyeIcon: {
        position: 'absolute',
        right: 16,
        zIndex: 1
    }
})

export default Styles;