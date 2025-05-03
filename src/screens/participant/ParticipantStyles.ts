import { StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";

const Styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.whiteColor
    },
    container: {
        paddingHorizontal: 20
    },
    rowCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },


    //Participant Container
    participantCont: {
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16
    },
    imgContainer: {
        height: 36,
        width: 36,
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 0.5,
        borderColor: Colors.primaryColor
    },
    img: {
        height: '100%',
        width: '100%'
    },
    userNameText: {
        ...Fonts.regular14,
        fontWeight: '500',
        color: Colors.mainTextColor
    },
    viewProfileBtn: {
        position: 'absolute',
        right: 16,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    btnText: {
        ...Fonts.regular12,
        fontWeight: '400',
        color: Colors.primaryColor
    },
    sportsName: {
        ...Fonts.regular16,
        fontWeight: '500',
        color: Colors.mainTextColor
    },
    subSportsName: {
        ...Fonts.regular12,
        fontWeight: '400',
        color: Colors.grayColor
    }
})

export default Styles;