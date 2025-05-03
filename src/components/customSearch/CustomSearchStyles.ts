import { StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";


const Styles = StyleSheet.create({
    searchContainer: {
        height: 54,
        borderWidth: 1,
        borderColor: Colors.borderColor,
        borderRadius: 10,
        backgroundColor: Colors.secondaryColor,
        alignItems: 'center',
        paddingHorizontal: 16,
        flexDirection: 'row',
        gap: 6,
        overflow: 'hidden',
        marginHorizontal: 20
    },
    searchBarText: {
        height: '100%',
        ...Fonts.regular14,
        color: Colors.mainTextColor,
        width: '90%'
    }
});

export default Styles;