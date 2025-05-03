import { StyleSheet } from "react-native";
import Colors from "../../constants/Colors";

const Styles = StyleSheet.create({
    switchBase: {
        width: 35,
        height: 18,
        borderRadius: 15,
        justifyContent: "center",
        padding: 3,
    },
    switchOn: {
        backgroundColor: Colors.primaryColor,
    },
    switchOff: {
        backgroundColor: "#E5E5E5",
    },
    switchThumb: {
        width: 14,
        height: 14,
        borderRadius: 11,
        backgroundColor: "#FFFFFF",
        position: "absolute",
        top: 2,
    },
});

export default Styles;