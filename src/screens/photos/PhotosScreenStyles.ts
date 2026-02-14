import { StyleSheet } from 'react-native';
import Fonts from '../../constants/Fonts';
import { ThemeColors } from '../../constants/Theme';

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
    headerSpacer: {
        width: 44,
        height: 44,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    walletRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    walletInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    walletLabel: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
    },
    walletBalance: {
        ...Fonts.semibold18,
        color: colors.mainTextColor,
    },
    rechargeButton: {
        backgroundColor: colors.primaryColor,
        borderRadius: 7,
        paddingHorizontal: 11,
        paddingVertical: 4,
        width: 109,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rechargeButtonText: {
        ...Fonts.regular14,
        color: colors.pureWhite,
    },
    photosHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    photosLabel: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
    },
    downloadAllButton: {
        borderWidth: 0.5,
        borderColor: colors.primaryColor,
        borderRadius: 7,
        paddingHorizontal: 11,
        paddingVertical: 4,
    },
    downloadAllText: {
        ...Fonts.regular14,
        color: colors.primaryColor,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    lampIconContainer: {
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoText: {
        flex: 1,
        ...Fonts.regular14,
        color: colors.subTextColor,
        lineHeight: 22,
    },
    mediaCard: {
        width: '100%',
        backgroundColor: colors.cardBackground,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        padding: 12,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    mediaThumbnail: {
        width: 86,
        height: 86,
        borderRadius: 10,
    },
    mediaThumbnailPlaceholder: {
        width: 86,
        height: 86,
        borderRadius: 10,
        backgroundColor: colors.btnBackgroundColor,
    },
    mediaInfo: {
        flex: 1,
        marginLeft: 12,
    },
    mediaTitle: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
    },
    mediaMeta: {
        ...Fonts.regular12,
        color: colors.grayColor,
        marginTop: 6,
    },
});
