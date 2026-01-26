import { Dimensions, StyleSheet } from "react-native";
import Fonts from "../../constants/Fonts";
import { ThemeColors, lightColors } from "../../constants/Theme";

const windowWidth = Dimensions.get('window').width;
const spacing = 20; // Gap between items
const containerWidth = (windowWidth - (2 * spacing) - spacing) / 2;

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    mainContainers: {
        flex: 1,
        backgroundColor: colors.backgroundColor
    },
    rowCenter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headings: {
        ...Fonts.regular16,
        color: colors.mainTextColor,
        marginHorizontal: 20
    },
    btnRight: {
        position: 'absolute',
        right: 16
    },
    eventSubText: {
        ...Fonts.regular12,
        color: colors.grayColor,
        width: '70%',
    },
    downloadContainer: {
        borderWidth: 0.5,
        borderRadius: 10,
        borderColor: colors.borderColor,
        backgroundColor: colors.cardBackground,
        height: 223,
        width: containerWidth,
        marginBottom: spacing,
        marginRight: spacing,
        padding: 16
    },
    flatListContainer: {
        paddingHorizontal: spacing,
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
        color: colors.grayColor,
    },
    eventTitle: {
        ...Fonts.regular14,
        color: colors.mainTextColor,
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
        color: colors.mainTextColor,
    },
    rightTitle: {
        ...Fonts.regular14,
        color: colors.grayColor,
    },
});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
