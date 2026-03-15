import { StyleSheet } from 'react-native';
import Fonts from '../../../constants/Fonts';
import { lightColors } from '../../../constants/Theme';
export const createStyles = (colors) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.backgroundColor,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.lightGrayColor,
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.btnBackgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: Object.assign(Object.assign({}, Fonts.medium18), { color: colors.mainTextColor }),
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    titleSection: {
        alignItems: 'center',
    },
    title: Object.assign(Object.assign({}, Fonts.semibold24), { color: colors.mainTextColor, lineHeight: 32, textAlign: 'center' }),
    description: Object.assign(Object.assign({}, Fonts.regular14), { color: colors.grayColor, lineHeight: 22, textAlign: 'center' }),
    codeInputContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    codeInput: Object.assign(Object.assign({ width: 50, height: 56, borderRadius: 10, backgroundColor: colors.secondaryColor, textAlign: 'center' }, Fonts.semibold24), { color: colors.mainTextColor }),
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    timerText: Object.assign(Object.assign({}, Fonts.regular14), { color: colors.grayColor }),
    bottomContainer: {
        paddingHorizontal: 20,
        paddingTop: 16,
        backgroundColor: colors.backgroundColor,
        alignItems: 'center',
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 54,
        backgroundColor: colors.primaryColor,
        borderRadius: 10,
        width: '100%',
    },
    primaryButtonText: Object.assign(Object.assign({}, Fonts.medium16), { color: colors.pureWhite }),
    linkTextBlue: Object.assign(Object.assign({}, Fonts.regular14), { color: colors.primaryColor, textAlign: 'center' }),
    linkTextGray: Object.assign(Object.assign({}, Fonts.regular14), { color: colors.grayColor, textAlign: 'center' }),
});
// Backward compatibility
const styles = createStyles(lightColors);
export default styles;
