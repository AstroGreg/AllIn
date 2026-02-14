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
        paddingVertical: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.lightGrayColor,
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
        ...Fonts.medium16,
        fontSize: 18,
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
        paddingTop: 20,
        paddingBottom: 100,
    },
    sectionTitle: {
        ...Fonts.medium16,
        fontSize: 18,
        color: colors.mainTextColor,
    },
    summaryCard: {
        backgroundColor: colors.backgroundColor,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        padding: 16,
        gap: 6,
    },
    summaryTitle: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
    },
    summaryMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    inputLabel: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7FAFF',
        borderWidth: 0.5,
        borderColor: '#E0ECFE',
        borderRadius: 10,
        height: 54,
        paddingHorizontal: 16,
        gap: 10,
    },
    textInput: {
        flex: 1,
        ...Fonts.regular14,
        color: colors.mainTextColor,
    },
    textAreaContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#F7FAFF',
        borderWidth: 0.5,
        borderColor: '#E0ECFE',
        borderRadius: 10,
        height: 180,
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 6,
    },
    textArea: {
        flex: 1,
        ...Fonts.regular14,
        color: colors.mainTextColor,
        height: '100%',
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statusOption: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.backgroundColor,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 6,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    statusText: {
        ...Fonts.regular14,
        color: colors.mainTextColor,
    },
    checkbox: {
        width: 16,
        height: 16,
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: '#3C82F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        borderWidth: 0,
    },
    bottomActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    deleteText: {
        ...Fonts.regular14,
        color: '#ED5454',
        textDecorationLine: 'underline',
    },
    rightActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    cancelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 38,
        paddingHorizontal: 16,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 6,
        gap: 6,
    },
    cancelButtonText: {
        ...Fonts.regular14,
        color: colors.subTextColor,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 38,
        paddingHorizontal: 16,
        backgroundColor: colors.primaryColor,
        borderRadius: 8,
        gap: 6,
    },
    submitButtonText: {
        ...Fonts.regular14,
        color: colors.whiteColor,
    },
});

const Styles = createStyles(lightColors);
export default Styles;
