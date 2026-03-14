import { StyleSheet } from "react-native";
import Fonts from "../../../constants/Fonts";
import { lightColors } from "../../../constants/Theme";
export const createStyles = (colors) => StyleSheet.create({
    //OR Container
    orContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    grayLines: {
        flex: 2,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGrayColor
    },
    orText: Object.assign(Object.assign({ flex: 1 }, Fonts.regular14), { color: colors.grayColor, textAlign: 'center' }),
    //Social Login Buttons
    buttonContainer: {
        height: 54,
        borderRadius: 10,
        backgroundColor: colors.secondaryColor,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: colors.borderColor
    },
    btnText: Object.assign(Object.assign({}, Fonts.regular14), { color: colors.grayColor, fontWeight: '400' }),
    //Language Container
    languageContainer: {
        paddingHorizontal: 40,
        borderWidth: 1,
        borderColor: colors.borderColor,
        backgroundColor: colors.secondaryColor,
        borderRadius: 10,
    },
    lngText: Object.assign(Object.assign({}, Fonts.regular14), { color: colors.mainTextColor, textAlign: 'center' }),
});
// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
