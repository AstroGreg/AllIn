import { StyleSheet } from "react-native";
import { ThemeColors, lightColors } from '../../constants/Theme';
import Fonts from "../../constants/Fonts";

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.whiteColor,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20
    },
    imageContainer: {
        height: 245,
        width: 256
    },
    img: {
        height: '100%',
        width: '100%'
    },
    screenHeader: {
        ...Fonts.regular24,
        fontWeight: '500',
        color: colors.mainTextColor,
        textAlign: 'center'
    },
    subText: {
        ...Fonts.regular16,
        fontWeight: '400',
        color: colors.subTextColor,
        textAlign: 'center',
        marginHorizontal: 25
    },
})

const Styles = createStyles(lightColors);

export default Styles;