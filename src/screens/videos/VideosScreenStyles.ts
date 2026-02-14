import { StyleSheet, Dimensions } from 'react-native';
import Fonts from '../../constants/Fonts';
import { ThemeColors } from '../../constants/Theme';

const { width } = Dimensions.get('window');
// 20px padding on each side (40px) + 24px gap between cards = 64px
const cardWidth = (width - 64) / 2;

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
    imageButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.btnBackgroundColor,
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
        color: colors.mainTextColor,
    },
    downloadAllButton: {
        backgroundColor: colors.primaryColor,
        borderRadius: 7,
        paddingHorizontal: 11,
        paddingVertical: 4,
    },
    downloadAllText: {
        ...Fonts.regular14,
        color: colors.pureWhite,
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
        gap: 6,
    },
    infoText: {
        flex: 1,
        ...Fonts.regular14,
        color: colors.subTextColor,
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
        backgroundColor: colors.cardBackground,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
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
        transform: [{ translateX: -20 }, { translateY: -20 }],
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.25)',
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
        color: colors.mainTextColor,
    },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primaryColor,
        borderRadius: 4.41,
        paddingHorizontal: 9,
        paddingVertical: 5.5,
        gap: 3,
    },
    viewButtonText: {
        fontSize: 8,
        fontFamily: 'Inter-Regular',
        color: colors.pureWhite,
        lineHeight: 12,
    },
    videoRightInfo: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 50,
    },
    videoResolution: {
        ...Fonts.regular12,
        color: colors.mainTextColor,
    },
});
