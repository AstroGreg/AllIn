import { StyleSheet } from 'react-native';
import Fonts from '../../constants/Fonts';
import { ThemeColors, lightColors } from '../../constants/Theme';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContainer: {
        backgroundColor: colors.modalBackground,
        borderRadius: 24,
        padding: 24,
        width: '100%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        position: 'relative',
    },
    modalTitle: {
        ...Fonts.medium20,
        fontSize: 24,
        lineHeight: 32,
        color: colors.mainTextColor,
    },
    closeButton: {
        position: 'absolute',
        right: 0,
        top: 0,
    },
    copyLinkCard: {
        borderWidth: 0.5,
        borderColor: colors.borderColor,
        borderRadius: 10,
        padding: 16,
        marginBottom: 24,
    },
    copyLinkContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    copyLinkTitle: {
        ...Fonts.medium16,
        color: colors.mainTextColor,
    },
    copyLinkSubtitle: {
        ...Fonts.regular14,
        color: colors.subTextColor,
    },
    socialSection: {
        gap: 16,
    },
    socialTitle: {
        ...Fonts.regular14,
        color: colors.subTextColor,
    },
    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    socialButton: {
        backgroundColor: colors.btnBackgroundColor,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    socialButtonText: {
        ...Fonts.regular14,
        color: colors.mainTextColor,
    },
});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
