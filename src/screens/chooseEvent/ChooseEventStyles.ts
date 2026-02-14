import { StyleSheet } from "react-native";
import { ThemeColors, lightColors } from '../../constants/Theme';
import Fonts from "../../constants/Fonts";

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.whiteColor
    },
    screenHeader: {
        ...Fonts.regular16,
        fontWeight: '500',
        color: colors.mainTextColor
    },
    subText: {
        ...Fonts.regular12,
        fontWeight: '400',
        color: colors.subTextColor
    },
    container: {
        paddingHorizontal: 20
    }
});

const Styles = createStyles(lightColors);

export default Styles;