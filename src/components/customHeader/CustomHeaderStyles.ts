import { StyleSheet } from "react-native";
import Fonts from "../../constants/Fonts";
import { ThemeColors, lightColors } from "../../constants/Theme";

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    headerContainer: {
        paddingVertical: 20,
        backgroundColor: colors.backgroundColor,
        paddingHorizontal: 20,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.borderColor,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    settingBtn: {
        height: 44,
        width: 44,
        borderRadius: 22,
        position: 'absolute',
        right: 20,
        backgroundColor: colors.btnBackgroundColor,
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        textAlign: 'center',
        ...Fonts.regular18,
        color: colors.mainTextColor,
        fontWeight: '500'
    }
});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
