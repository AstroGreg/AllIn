import { StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";

const Styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.whiteColor
    },
    moreActionIcon: {
        position: 'absolute',
        right: 14,
        top: 12
    },
    views: {
        position: 'absolute',
        left: 18,
        top: 12,
        flexDirection: 'row',
        alignItems: 'center'
    },
    viewCount: {
        ...Fonts.regular16,
        color: Colors.whiteColor
    },
    imgText: {
        position: 'absolute',
        bottom: 27,
        left: 14,
        fontWeight: "500",
        textShadowColor: '#000000',
        textShadowOffset: { width: 5, height: 5 },
        textShadowRadius: 10,
    },
    downBtn: {
        height: 38,
        paddingHorizontal: 16,
        backgroundColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        position: 'absolute',
        bottom: 20,
        right: 14
    },


    //Action Modal
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.1)', // optional dark background
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 20,
        width: 120,
        alignItems: 'flex-start',
        position: 'absolute',
        right: 30,
        top: 190
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        width: '100%',
    },
    actionText: {
        marginLeft: 10,
        ...Fonts.regular12,
        color: Colors.grayColor,
        fontWeight: '500'
    },
});

export default Styles;