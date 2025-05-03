import { StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";

const Styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.whiteColor
    },
    borderBox: {
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
        borderRadius: 10,
        padding: 16,
        marginHorizontal: 20
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    spaceBetween: {
        justifyContent: 'space-between'
    },
    subText: {
        ...Fonts.regular14,
        color: Colors.grayColor
    },
    separator: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGrayColor
    },
    filterCont: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: Colors.btnBackgroundColor,
        marginRight: 16
    },
    selectedFilterCont: {
        backgroundColor: Colors.primaryColor,
    },
    filterText: {
        ...Fonts.regular12,
        color: Colors.grayColor
    },
    selectedFilterText: {
        color: Colors.whiteColor
    },
    titleText: {
        ...Fonts.regular16,
        color: Colors.mainTextColor
    },
    iconContainer: {
        height: 40,
        width: 40,
        backgroundColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        overflow: 'hidden'
    },
    resultText: {
        ...Fonts.regular14,
        color: Colors.mainTextColor
    },
    dot: {
        height: 6,
        width: 6,
        borderRadius: 3,
        backgroundColor: Colors.grayColor
    },
    eventbtns: {
        paddingVertical: 8,
        paddingHorizontal: 9,
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
        borderRadius: 6
    },
    eventBtnText: {
        ...Fonts.regular14,
        color: Colors.subTextColor
    },
    btn: {
        position: 'absolute',
        bottom: 30,
        width: '100%',
        paddingHorizontal: 20,
    },

    playIcon: {
        position: 'absolute',
        right: 20,
        top: 15
    },

    //Photo Container
    photoImgCont: {
        height: 87,
        overflow: 'hidden',
        borderRadius: 6
    },
    downloadCount: {
        ...Fonts.regular14,
        fontWeight: '500',
        color: Colors.mainTextColor,
    },
    btnRight: {
        position: 'absolute',
        right: 16
    },

});

export default Styles;