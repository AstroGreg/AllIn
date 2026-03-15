import { StyleSheet } from "react-native";
import Fonts from "../../../constants/Fonts";
import { lightColors } from "../../../constants/Theme";
export const createStyles = (colors) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.backgroundColor,
    },
    contentContainer: {
        paddingHorizontal: 20
    },
    headingText: Object.assign(Object.assign({}, Fonts.semibold22), { color: colors.mainTextColor, fontWeight: '500', textAlign: 'center' }),
    subHeadingText: Object.assign(Object.assign({}, Fonts.regular14), { color: colors.grayColor, fontWeight: '400', textAlign: 'center' }),
    checkBox: {
        flexDirection: 'row'
    },
    rememberMeText: Object.assign(Object.assign({}, Fonts.regular14), { color: colors.mainTextColor, fontWeight: '400' }),
    forgotPass: Object.assign(Object.assign({}, Fonts.regular14), { color: colors.errorColor, fontWeight: '400' }),
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    }
});
// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
