import { StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";

const Styles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        height: 45,
        gap: 20,
    },
    tabs: {
        height: '100%',
        flex: 2,
        alignItems: 'center',
        paddingTop: 15
    },
    tabText: {
        ...Fonts.regular14,
        color: Colors.subTextColor,
        fontWeight: '400',
        paddingBottom: 12
    },
})

export default Styles;