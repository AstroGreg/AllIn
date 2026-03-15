import { StyleSheet } from "react-native";
import { lightColors } from '../../constants/Theme';
import Fonts from "../../constants/Fonts";
export const createStyles = (colors) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.whiteColor
    },
    screenHeader: Object.assign(Object.assign({}, Fonts.regular16), { fontWeight: '500', color: colors.mainTextColor }),
    subText: Object.assign(Object.assign({}, Fonts.regular12), { fontWeight: '400', color: colors.subTextColor }),
    container: {
        paddingHorizontal: 20
    }
});
const Styles = createStyles(lightColors);
export default Styles;
