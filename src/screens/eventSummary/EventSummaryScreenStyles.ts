import { StyleSheet } from 'react-native';
import { ThemeColors, lightColors } from '../../constants/Theme';
import Fonts from '../../constants/Fonts';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.backgroundColor,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.btnBackgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...Fonts.medium18,
        color: colors.mainTextColor,
    },
    notificationButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.btnBackgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        paddingHorizontal: 20,
        flexGrow: 1,
    },
    sectionTitle: {
        ...Fonts.medium18,
        color: colors.mainTextColor,
    },
    detailsCard: {
        backgroundColor: colors.backgroundColor,
        borderRadius: 10,
        padding: 16,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        gap: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    detailLabel: {
        ...Fonts.regular14,
        color: colors.subTextColor,
    },
    detailValue: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
    },
    divider: {
        height: 1,
        backgroundColor: colors.lightGrayColor,
    },
    eventChipsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    eventChip: {
        backgroundColor: '#EBEBEB',
        borderRadius: 6,
        paddingHorizontal: 10,
        height: 32,
        width: 70,
        alignItems: 'center',
        justifyContent: 'center',
    },
    eventChipText: {
        ...Fonts.regular12,
        color: '#777777',
    },
    bottomButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
    },
    cancelButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.backgroundColor,
        borderRadius: 10,
        height: 54,
        gap: 8,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
    },
    cancelButtonText: {
        ...Fonts.medium16,
        color: colors.subTextColor,
    },
    confirmButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primaryColor,
        borderRadius: 10,
        height: 54,
        gap: 8,
    },
    confirmButtonText: {
        ...Fonts.medium16,
        color: colors.whiteColor,
    },
});

const Styles = createStyles(lightColors);
export default Styles;
