import { StyleSheet } from "react-native";
import Fonts from "../../constants/Fonts";
import { lightColors } from "../../constants/Theme";
export const createStyles = (colors) => StyleSheet.create({
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
    title: Object.assign(Object.assign({ textAlign: 'center' }, Fonts.regular18), { color: colors.mainTextColor, fontWeight: '500' })
});
// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
