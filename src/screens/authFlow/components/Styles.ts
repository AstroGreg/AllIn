import { StyleSheet } from "react-native";
import Colors from "../../../constants/Colors";
import Fonts from "../../../constants/Fonts";

const Styles = StyleSheet.create({

    //OR Container
    orContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    grayLines: {
        flex: 2,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGrayColor
    },
    orText: {
        flex: 1,
        ...Fonts.regular14,
        color: Colors.grayColor,
        textAlign: 'center'
    },

    //Social Login Buttons
    buttonContainer: {
        height: 54,
        borderRadius: 10,
        backgroundColor: Colors.secondaryColor,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: Colors.borderColor
    },
    btnText: {
        ...Fonts.regular14,
        color: Colors.grayColor,
        fontWeight: '400',
    },

    //Language Container
    languageContainer: {
        paddingHorizontal: 40,
        borderWidth: 1,
        borderColor: Colors.borderColor,
        backgroundColor: Colors.secondaryColor,
        borderRadius: 10,
    },
    lngText: {
        ...Fonts.regular14,
        color: Colors.mainTextColor,
        textAlign: 'center'
    },

})

export default Styles;