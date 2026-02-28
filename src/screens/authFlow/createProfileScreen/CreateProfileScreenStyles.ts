import { StyleSheet } from 'react-native';
import Fonts from '../../../constants/Fonts';
import { ThemeColors, lightColors } from '../../../constants/Theme';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
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
    headingText: {
        ...Fonts.medium22,
        fontSize: 24,
        lineHeight: 32,
        color: colors.mainTextColor,
        textAlign: 'center',
    },
    subHeadingText: {
        ...Fonts.regular14,
        lineHeight: 22,
        color: colors.grayColor,
        textAlign: 'center',
    },
    label: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
    },
    inputContainer: {
        minHeight: 58,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.lightGrayColor,
        backgroundColor: (colors as any).inputBackgroundColor ?? (colors as any).cardBackground ?? colors.backgroundColor,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
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
    dateText: {
        ...Fonts.regular14,
        color: colors.mainTextColor,
    },
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
    dateModalTitle: {
        ...Fonts.semibold16,
        color: colors.mainTextColor,
    },
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
    yearDropdownText: {
        ...Fonts.medium13,
        color: colors.mainTextColor,
    },
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
    yearDropdownItemText: {
        ...Fonts.regular13,
        color: colors.mainTextColor,
    },
    yearDropdownItemTextActive: {
        ...Fonts.medium13,
        color: colors.primaryColor,
    },
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
    calendarMonthLabel: {
        ...Fonts.semibold15,
        color: colors.mainTextColor,
        textTransform: 'capitalize',
    },
    modalDoneButton: {
        marginTop: 12,
        borderRadius: 12,
        backgroundColor: colors.primaryColor,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalDoneButtonText: {
        ...Fonts.semibold13,
        color: colors.pureWhite,
    },
});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
