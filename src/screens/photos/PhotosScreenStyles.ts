import { StyleSheet, Dimensions } from 'react-native';
import Colors from '../../constants/Colors';
import Fonts from '../../constants/Fonts';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2; // 20px padding on each side + 20px gap

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
    videoButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
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
        gap: 6,
    },
    infoText: {
        flex: 1,
        ...Fonts.regular14,
        color: '#9B9F9F',
        lineHeight: 22,
    },
    photosGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 24,
    },
    photoCard: {
        width: cardWidth,
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        padding: 16,
    },
    photoThumbnail: {
        width: '100%',
        height: 104,
        borderRadius: 4,
    },
    photoInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    photoLeftInfo: {
        justifyContent: 'space-between',
        height: 50,
    },
    photoPrice: {
        ...Fonts.semibold12,
        color: Colors.mainTextColor,
    },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primaryColor,
        borderRadius: 8,
        paddingHorizontal: 9,
        paddingVertical: 5,
        gap: 3,
    },
    viewButtonText: {
        ...Fonts.regular12,
        color: Colors.whiteColor,
        fontSize: 8,
    },
    photoRightInfo: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 50,
    },
    photoResolution: {
        ...Fonts.regular12,
        color: Colors.mainTextColor,
    },
});

export default Styles;
