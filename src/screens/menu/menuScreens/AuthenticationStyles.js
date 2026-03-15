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
    titleSection: {},
    title: Object.assign(Object.assign({}, Fonts.semibold24), { color: colors.mainTextColor, lineHeight: 32 }),
    description: Object.assign(Object.assign({}, Fonts.regular14), { color: colors.grayColor, lineHeight: 22 }),
    optionsContainer: {},
    optionCard: {
        backgroundColor: colors.cardBackground,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
    },
    optionIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.secondaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionContent: {
        flex: 1,
        gap: 4,
    },
    optionTitle: Object.assign(Object.assign({}, Fonts.medium16), { color: colors.mainTextColor }),
    optionDescription: Object.assign(Object.assign({}, Fonts.regular12), { color: colors.grayColor, lineHeight: 20 }),
    radioContainer: {
        marginTop: 2,
    },
    radioUnselected: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: colors.lightGrayColor,
    },
    radioSelected: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primaryColor,
    },
    bottomContainer: {
        paddingHorizontal: 20,
        paddingTop: 16,
        backgroundColor: colors.backgroundColor,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 54,
        backgroundColor: colors.primaryColor,
        borderRadius: 10,
    },
    primaryButtonText: Object.assign(Object.assign({}, Fonts.medium16), { color: colors.pureWhite }),
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 54,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
    },
    secondaryButtonText: Object.assign(Object.assign({}, Fonts.medium16), { color: colors.grayColor }),
});
// Backward compatibility
const styles = createStyles(lightColors);
export default styles;
