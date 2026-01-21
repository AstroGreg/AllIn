import { StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";

const Styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.whiteColor,
    },
    container: {
        // alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        marginHorizontal: 20
    },
    titleText: {
        ...Fonts.regular14,
        color: Colors.mainTextColor,
        fontWeight: '500'
    },
    uploadContainer: {
        height: 68,
        borderRadius: 10,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: Colors.primaryColor,
        backgroundColor: Colors.secondaryColor,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'
    },
    uploadText: {
        ...Fonts.regular14,
        fontWeight: '500',
        color: Colors.primaryColor
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    subText: {
        ...Fonts.regular14,
        fontWeight: '400',
        color: Colors.grayColor
    },
    btnContianer: {
        paddingHorizontal: 16,
        backgroundColor: Colors.primaryColor,
        borderRadius: 8,
        height: 38,
        alignItems: 'center',
        justifyContent: 'center'
    },
    btnText: {
        ...Fonts.regular14,
        color: Colors.whiteColor
    },
    selectedImagesContainer: {
        marginTop: 12,
        padding: 8,
        backgroundColor: Colors.secondaryColor,
        borderRadius: 8,
    },
    bottomBtn: {
        height: 90, position: 'absolute', bottom: 10, width: '100%', paddingHorizontal: 20
    },
    imgContainer: {
        height: 220,
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 15,
        marginHorizontal: 15
    },
    box: {
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
        borderRadius: 10,
        padding: 16
    },
    selectedVideoContainer: {
        marginTop: 12,
        padding: 12,
        backgroundColor: Colors.secondaryColor,
        borderRadius: 8,
    },

    videoDetails: {
        color: Colors.grayColor,
        fontSize: 12,
        marginTop: 4,
    },

    disabledUpload: {
        opacity: 0.5,
    },
});

export default Styles;