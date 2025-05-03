import { StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";

const Styles = StyleSheet.create({
    headerContainer: {
        paddingVertical: 20,
        backgroundColor: Colors.whiteColor,
        paddingHorizontal: 20,
        borderBottomWidth: 0.5,
        borderBottomColor: Colors.lightGrayColor,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    settingBtn: {
        height: 44,
        width: 44,
        borderRadius: 22,
        position: 'absolute',
        right: 20,
        backgroundColor: Colors.btnBackgroundColor,
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        textAlign: 'center',
        ...Fonts.regular18,
        color: Colors.mainTextColor,
        fontWeight: '500'
    }
});

export default Styles;