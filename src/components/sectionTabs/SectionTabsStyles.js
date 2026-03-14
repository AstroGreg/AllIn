import { StyleSheet } from "react-native";
import Fonts from "../../constants/Fonts";
export const createStyles = (colors) => StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        height: 45,
        gap: 20,
    },
    tabs: {
        height: '100%',
        flex: 2,
        alignItems: 'center',
        paddingTop: 15
    },
    tabText: Object.assign(Object.assign({}, Fonts.regular14), { color: colors.subTextColor, fontWeight: '400', paddingBottom: 12 }),
});
