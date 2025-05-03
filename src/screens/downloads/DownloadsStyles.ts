import { Dimensions, StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";

const windowWidth = Dimensions.get('window').width;
const spacing = 20; // Gap between items
const containerWidth = (windowWidth - (2 * spacing) - spacing) / 2;

const Styles = StyleSheet.create({
    mainContainers: {
        flex: 1,
        backgroundColor: Colors.whiteColor
    },
    rowCenter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headings: {
        ...Fonts.regular16,
        color: Colors.mainTextColor,
        marginHorizontal: 20
    },
    btnRight: {
        position: 'absolute',
        right: 16
    },
    eventSubText: {
        ...Fonts.regular12,
        color: Colors.grayColor,
        width: '70%',
    },
    downloadContainer: {
        borderWidth: 0.5,
        borderRadius: 10,
        borderColor: Colors.lightGrayColor,
        height: 223,
        width: containerWidth,
        marginBottom: spacing,
        marginRight: spacing,
        padding: 16
    },
    flatListContainer: {
        paddingHorizontal: spacing,
        // paddingTop: spacing,
    },
    contentContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    imgContainer: {
        height: 137,
        borderRadius: 10,
        overflow: 'hidden'
    },
    imges: {
        height: '100%',
        width: '100%'
    },
    requestSubText: {
        ...Fonts.regular10,
        color: Colors.grayColor,
    },
    eventTitle: {
        ...Fonts.regular14,
        color: Colors.mainTextColor,
        width: '85%'
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing,
        marginBottom: 12,
    },
    leftTitle: {
        ...Fonts.regular16,
        color: Colors.mainTextColor,
    },
    rightTitle: {
        ...Fonts.regular14,
        color: Colors.grayColor,
    },
});

export default Styles;