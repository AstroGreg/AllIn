import { StyleSheet } from 'react-native';
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
        paddingVertical: 16,
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
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    spinnerContainer: {
        width: 131,
        height: 131,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusBox: {
        backgroundColor: 'rgba(21, 93, 252, 0.1)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#155DFC',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
        paddingVertical: 12,
    },
    scannedText: {
        fontFamily: 'Inter-Medium',
        fontSize: 13,
        fontWeight: '500',
        color: colors.mainTextColor,
        lineHeight: 26,
        textAlign: 'center',
    },
    matchedText: {
        fontFamily: 'Inter-Medium',
        fontSize: 18,
        fontWeight: '500',
        lineHeight: 26,
        textAlign: 'center',
        color: colors.mainTextColor,
    },
    maskedView: {
        flexDirection: 'row',
    },
    gradientText: {
        flexDirection: 'row',
    },
});

// Backward compatibility
const styles = createStyles(lightColors);
export default styles;
