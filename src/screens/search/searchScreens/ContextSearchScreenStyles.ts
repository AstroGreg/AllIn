import { StyleSheet } from 'react-native';
import Fonts from '../../../constants/Fonts';

export const createStyles = (colors: any) => StyleSheet.create({
    container: {
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
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.cardBackground,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...Fonts.semiBold18,
        color: colors.mainTextColor,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    title: {
        ...Fonts.bold24,
        color: colors.mainTextColor,
    },
    subtitle: {
        ...Fonts.regular14,
        color: colors.grayColor,
        marginTop: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: colors.borderColor,
    },
    input: {
        flex: 1,
        ...Fonts.regular16,
        color: colors.mainTextColor,
        padding: 0,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    buttonText: {
        ...Fonts.semiBold16,
        color: '#FFFFFF',
    },
    filterOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderColor,
    },
    filterLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    filterLabel: {
        ...Fonts.medium16,
        color: colors.mainTextColor,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: colors.borderColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        borderColor: colors.primaryColor,
        backgroundColor: 'transparent',
    },
});
