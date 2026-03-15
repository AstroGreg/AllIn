import { StyleSheet } from 'react-native';
import Fonts from '../../../constants/Fonts';
import { lightColors } from '../../../constants/Theme';
export const createStyles = (colors) => {
    var _a, _b;
    return StyleSheet.create({
        mainContainer: {
            flex: 1,
            backgroundColor: colors.backgroundColor,
        },
        imageContainer: {
            alignItems: 'center',
            justifyContent: 'center',
        },
        headerImage: {
            width: 163,
            height: 155,
        },
        contentContainer: {
            paddingHorizontal: 20,
        },
        headingText: Object.assign(Object.assign({}, Fonts.medium22), { fontSize: 24, lineHeight: 32, color: colors.mainTextColor, textAlign: 'center' }),
        subHeadingText: Object.assign(Object.assign({}, Fonts.regular14), { lineHeight: 22, color: colors.grayColor, textAlign: 'center' }),
        helperText: Object.assign(Object.assign({}, Fonts.regular12), { color: colors.subTextColor, marginTop: 8, marginLeft: 4 }),
        label: Object.assign(Object.assign({}, Fonts.medium14), { color: colors.mainTextColor }),
        inputContainer: {
            minHeight: 58,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.lightGrayColor,
            backgroundColor: (_b = (_a = colors.inputBackgroundColor) !== null && _a !== void 0 ? _a : colors.cardBackground) !== null && _b !== void 0 ? _b : colors.backgroundColor,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
        },
        nativeInputRow: {
            minHeight: 58,
        },
        nativeInput: {
            flex: 1,
            paddingVertical: 0,
            color: colors.mainTextColor,
            fontSize: 16,
        },
        dateButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            borderWidth: 1,
            borderColor: colors.lightGrayColor,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 12,
            backgroundColor: colors.btnBackgroundColor,
        },
        dateText: Object.assign(Object.assign({}, Fonts.regular14), { color: colors.mainTextColor }),
        modalOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.45)',
            justifyContent: 'center',
            paddingHorizontal: 20,
        },
        modalBackdrop: {
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
        },
        dateModalContainer: {
            backgroundColor: colors.cardBackground,
            borderRadius: 18,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.lightGrayColor,
        },
        dateModalTitle: Object.assign(Object.assign({}, Fonts.semibold16), { color: colors.mainTextColor }),
        dateModalHeaderRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
        },
        yearDropdownButton: {
            minHeight: 34,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.lightGrayColor,
            backgroundColor: colors.btnBackgroundColor,
            paddingHorizontal: 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        yearDropdownText: Object.assign(Object.assign({}, Fonts.medium13), { color: colors.mainTextColor }),
        yearDropdownMenu: {
            marginTop: 8,
            maxHeight: 180,
            borderWidth: 1,
            borderColor: colors.lightGrayColor,
            borderRadius: 10,
            backgroundColor: colors.btnBackgroundColor,
            overflow: 'hidden',
        },
        yearDropdownItem: {
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderBottomWidth: 0.5,
            borderBottomColor: colors.lightGrayColor,
        },
        yearDropdownItemActive: {
            backgroundColor: colors.secondaryBlueColor,
        },
        yearDropdownItemText: Object.assign(Object.assign({}, Fonts.regular13), { color: colors.mainTextColor }),
        yearDropdownItemTextActive: Object.assign(Object.assign({}, Fonts.medium13), { color: colors.primaryColor }),
        calendarMonthNav: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
        },
        calendarMonthArrowButton: {
            width: 28,
            height: 28,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.btnBackgroundColor,
        },
        calendarMonthLabel: Object.assign(Object.assign({}, Fonts.semibold15), { color: colors.mainTextColor, textTransform: 'capitalize' }),
        modalDoneButton: {
            marginTop: 12,
            borderRadius: 12,
            backgroundColor: colors.primaryColor,
            paddingVertical: 12,
            alignItems: 'center',
            justifyContent: 'center',
        },
        modalDoneButtonText: Object.assign(Object.assign({}, Fonts.semibold13), { color: colors.pureWhite }),
    });
};
// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
