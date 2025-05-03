import { Dimensions, StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";

const { width, height } = Dimensions.get('window');

const Styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.whiteColor,
    },
    video: {
        width: '100%',
        height: '100%',
    },
    topHeader: {
        height: 52,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        ...Fonts.regular16,
        color: Colors.mainTextColor,
        fontWeight: '500'
    },
    subtitle: {
        ...Fonts.regular12,
        color: Colors.mainTextColor,
        fontWeight: '400'
    },
    rightActions: {
        position: 'absolute',
        right: 20,
        top: '35%',
        alignItems: 'center',
    },
    actionButton: {
        marginVertical: 12,
        backgroundColor: '#F7FAFF',
        padding: 10,
        borderRadius: 30,
    },
    bottomControls: {
        position: 'absolute',
        bottom: 60,
        width: width,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    progressContainer: {
        position: 'absolute',
        bottom: 140,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    progressBar: {
        flex: 1,
        marginHorizontal: 0,
        height: 40,
    },
    timeText: {
        color: Colors.balckColor,
        ...Fonts.regular12
    },
});

export default Styles;