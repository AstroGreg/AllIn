import { StyleSheet } from "react-native";
import Fonts from "../../../constants/Fonts";
import { ThemeColors, lightColors } from "../../../constants/Theme";

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.backgroundColor,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'center'
    },
    headingText: {
        ...Fonts.semibold22,
        color: colors.mainTextColor,
        fontWeight: '500',
        textAlign: 'center'
    },
    subHeadingText: {
        ...Fonts.regular14,
        color: colors.grayColor,
        fontWeight: '400',
        textAlign: 'center'
    },

});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
