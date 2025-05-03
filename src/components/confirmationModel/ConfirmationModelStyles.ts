import { StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";

const Styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {
        width: 220,
        borderRadius: 10,
        padding: 16,
        backgroundColor: Colors.whiteColor,
        alignItems: 'center',
        justifyContent: 'center'
    },
    text: {
        ...Fonts.regular12,
        color: Colors.mainTextColor,
        textAlign: 'center'
    },
    iconCont: {
        height: 44,
        width: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.secondaryBlueColor,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    noBtn: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor
    },
    noText: {
        textAlign: 'center',
        ...Fonts.regular12,
        color: Colors.subTextColor
    },
    yesBtn: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 4,
        backgroundColor: Colors.primaryColor
    },
    yesText: {
        textAlign: 'center',
        ...Fonts.regular12,
        color: Colors.whiteColor
    }
});

export default Styles;