import { StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';
import Fonts from '../../constants/Fonts';

const Styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.whiteColor,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: '#DEDEDE',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
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
        color: Colors.mainTextColor,
    },
    walletBalance: {
        ...Fonts.semibold18,
        color: Colors.mainTextColor,
    },
    rechargeButton: {
        backgroundColor: Colors.primaryColor,
        borderRadius: 7,
        paddingHorizontal: 11,
        paddingVertical: 4,
        width: 109,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rechargeButtonText: {
        ...Fonts.regular14,
        color: Colors.whiteColor,
    },
    photosHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    photosLabel: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
    },
    downloadAllButton: {
        borderWidth: 0.5,
        borderColor: Colors.primaryColor,
        borderRadius: 7,
        paddingHorizontal: 11,
        paddingVertical: 4,
    },
    downloadAllText: {
        ...Fonts.regular14,
        color: Colors.primaryColor,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
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
        color: '#9B9F9F',
        lineHeight: 22,
    },
    mediaCard: {
        width: '100%',
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
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
        backgroundColor: '#F2F4F7',
    },
    mediaInfo: {
        flex: 1,
        marginLeft: 12,
    },
    mediaTitle: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
    },
    mediaMeta: {
        ...Fonts.regular12,
        color: Colors.grayColor,
        marginTop: 6,
    },
});

export default Styles;
