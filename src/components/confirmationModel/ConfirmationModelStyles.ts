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
        width: 340,
        borderRadius: 16,
        paddingVertical: 24,
        paddingHorizontal: 20,
        backgroundColor: Colors.whiteColor,
        alignItems: 'center',
    },
    text: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
        textAlign: 'center',
        lineHeight: 20,
    },
    iconCont: {
        height: 64,
        width: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primaryColor,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    noBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#DEDEDE',
        alignItems: 'center',
        justifyContent: 'center',
    },
    noText: {
        ...Fonts.medium14,
        color: Colors.subTextColor,
    },
    yesBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        backgroundColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    yesText: {
        ...Fonts.medium14,
        color: Colors.whiteColor,
    }
});

export default Styles;
