import { StyleSheet } from "react-native";
import Fonts from "../../constants/Fonts";
import { lightColors } from "../../constants/Theme";
export const createStyles = (colors) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.backgroundColor,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.lightGrayColor,
        alignItems: 'center',
    },
    headerTitle: Object.assign(Object.assign({}, Fonts.medium18), { color: colors.mainTextColor }),
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    infoCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        padding: 16,
        alignItems: 'center',
        width: '100%',
    },
    infoText: Object.assign(Object.assign({}, Fonts.regular14), { color: colors.grayColor, textAlign: 'center', lineHeight: 22 }),
    bottomContainer: {
        paddingHorizontal: 20,
    },
    niceButton: {
        backgroundColor: colors.primaryColor,
        borderRadius: 10,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    niceButtonText: Object.assign(Object.assign({}, Fonts.medium16), { color: colors.pureWhite }),
});
// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
