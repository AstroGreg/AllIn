import { StyleSheet } from 'react-native';
import Fonts from '../../constants/Fonts';
import { ThemeColors, lightColors } from '../../constants/Theme';

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
        borderBottomColor: colors.borderColor,
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
        ...Fonts.medium14,
        color: colors.mainTextColor,
    },
    placeholder: {
        width: 44,
        height: 44,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    questionCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.borderColor,
        paddingHorizontal: 16,
        paddingVertical: 12,
        height: 115,
        alignItems: 'center',
        justifyContent: 'center',
    },
    questionText: {
        ...Fonts.regular14,
        color: colors.subTextColor,
        textAlign: 'center',
        marginBottom: 12,
    },
    buttonsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    noButton: {
        backgroundColor: '#ED5454',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        width: 112,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    yesButton: {
        backgroundColor: colors.primaryColor,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        width: 112,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        ...Fonts.regular14,
        color: colors.pureWhite,
        fontSize: 11,
        lineHeight: 17,
    },
    photoContainer: {
        flex: 1,
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 20,
        position: 'relative',
    },
    photoImage: {
        width: '100%',
        height: '100%',
    },
    topRow: {
        position: 'absolute',
        top: 12,
        left: 14,
        right: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    viewsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewsText: {
        ...Fonts.regular16,
        color: colors.pureWhite,
    },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'flex-end',
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingBottom: 10,
    },
    photoTitle: {
        ...Fonts.medium16,
        color: colors.pureWhite,
        flex: 1,
    },
    downloadButton: {
        backgroundColor: colors.primaryColor,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        height: 38,
        alignItems: 'center',
        justifyContent: 'center',
    },
    downloadButtonText: {
        ...Fonts.regular14,
        color: colors.pureWhite,
    },
    buyButton: {
        backgroundColor: colors.primaryColor,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        width: 97,
        height: 38,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buyButtonText: {
        ...Fonts.regular14,
        color: colors.pureWhite,
    },
});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
