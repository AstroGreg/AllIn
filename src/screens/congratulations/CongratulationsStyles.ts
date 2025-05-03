import { StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";

const Styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.whiteColor,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20
    },
    imageContainer: {
        height: 245,
        width: 256
    },
    img: {
        height: '100%',
        width: '100%'
    },
    screenHeader: {
        ...Fonts.regular24,
        fontWeight: '500',
        color: Colors.mainTextColor,
        textAlign: 'center'
    },
    subText: {
        ...Fonts.regular16,
        fontWeight: '400',
        color: Colors.subTextColor,
        textAlign: 'center',
        marginHorizontal: 25
    },
})

export default Styles;