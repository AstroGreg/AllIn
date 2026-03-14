import { StyleSheet } from 'react-native';
import Fonts from '../../constants/Fonts';
export const createStyles = (colors) => StyleSheet.create({
    container: {
        minHeight: 54,
        borderWidth: 1,
        borderColor: colors.borderColor,
        backgroundColor: colors.secondaryColor,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 52,
    },
    input: Object.assign(Object.assign({ flex: 1, minHeight: 52, color: colors.mainTextColor }, Fonts.regular14), { paddingVertical: 0, includeFontPadding: false }),
});
