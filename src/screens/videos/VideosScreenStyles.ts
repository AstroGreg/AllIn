import { StyleSheet, Dimensions } from 'react-native';
import Colors from '../../constants/Colors';
import Fonts from '../../constants/Fonts';

const { width } = Dimensions.get('window');
// 20px padding on each side (40px) + 24px gap between cards = 64px
const cardWidth = (width - 64) / 2;

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
    imageButton: {
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
    videosHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    videosLabel: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
    },
    downloadAllButton: {
        backgroundColor: Colors.primaryColor,
        borderRadius: 7,
        paddingHorizontal: 11,
        paddingVertical: 4,
    },
    downloadAllText: {
        ...Fonts.regular14,
        color: Colors.whiteColor,
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
    videosGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 24,
    },
    videoCard: {
        width: cardWidth,
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        padding: 16,
    },
    videoThumbnailContainer: {
        width: '100%',
        height: 104,
        borderRadius: 4,
        position: 'relative',
    },
    videoThumbnail: {
        width: '100%',
        height: '100%',
        borderRadius: 4,
    },
    playIconContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -16 }, { translateY: -16 }],
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(224, 236, 254, 0.9)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    videoInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    videoLeftInfo: {
        justifyContent: 'space-between',
        height: 50,
    },
    videoPrice: {
        ...Fonts.semibold12,
        color: Colors.mainTextColor,
    },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primaryColor,
        borderRadius: 4.41,
        paddingHorizontal: 9,
        paddingVertical: 5.5,
        gap: 3,
    },
    viewButtonText: {
        fontSize: 8,
        fontFamily: 'Inter-Regular',
        color: Colors.whiteColor,
        lineHeight: 12,
    },
    videoRightInfo: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 50,
    },
    videoResolution: {
        ...Fonts.regular12,
        color: Colors.mainTextColor,
    },
});

export default Styles;
