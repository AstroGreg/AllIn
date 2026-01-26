import { StyleSheet } from 'react-native';
import Fonts from '../../../constants/Fonts';
import { ThemeColors, lightColors } from '../../../constants/Theme';

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
    headerTitle: {
        ...Fonts.medium18,
        color: colors.mainTextColor,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    titleSection: {
        alignItems: 'center',
    },
    title: {
        ...Fonts.semibold24,
        color: colors.mainTextColor,
        lineHeight: 32,
        textAlign: 'center',
    },
    description: {
        ...Fonts.regular14,
        color: colors.grayColor,
        lineHeight: 22,
        textAlign: 'center',
    },
    qrContainer: {
        alignItems: 'center',
    },
    qrCode: {
        width: 180,
        height: 180,
        borderRadius: 16,
        backgroundColor: colors.secondaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    orText: {
        ...Fonts.regular14,
        color: colors.grayColor,
        textAlign: 'center',
    },
    codeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.secondaryColor,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    codeText: {
        ...Fonts.medium16,
        color: colors.mainTextColor,
    },
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
    primaryButtonText: {
        ...Fonts.medium16,
        color: colors.pureWhite,
    },
    linkText: {
        ...Fonts.regular14,
        color: colors.grayColor,
        textAlign: 'center',
    },
});

// Backward compatibility
const styles = createStyles(lightColors);
export default styles;
