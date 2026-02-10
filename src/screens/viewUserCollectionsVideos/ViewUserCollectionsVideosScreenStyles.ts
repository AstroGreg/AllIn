import { StyleSheet, Dimensions } from 'react-native';
import Fonts from '../../constants/Fonts';
import { ThemeColors, lightColors } from '../../constants/Theme';

const { width } = Dimensions.get('window');
const cardWidth = (width - 40 - 16) / 2; // 2 columns with gap
const photoImageWidth = Math.floor((width - 40 - 24 - 30) / 4); // 4 columns: screen - scrollPadding(40) - cardPadding(24) - gaps(30)

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
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sectionTitle: {
        ...Fonts.medium18,
        color: colors.mainTextColor,
    },
    videosCountBadge: {
        backgroundColor: colors.btnBackgroundColor,
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    videosCountText: {
        ...Fonts.regular14,
        color: colors.subTextColor,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: colors.cardBackground,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.borderColor,
        padding: 8,
    },
    toggleButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
    },
    toggleButtonActive: {
        backgroundColor: 'rgba(60, 130, 246, 0.3)',
    },
    toggleText: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    toggleTextActive: {
        ...Fonts.regular12,
        color: colors.mainTextColor,
    },
    videosGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    videoCard: {
        width: cardWidth,
        backgroundColor: colors.cardBackground,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.borderColor,
        padding: 12,
    },
    thumbnailContainer: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
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
    videoTitle: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
        marginTop: 12,
    },
    videoMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    // Photo styles
    photosCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.borderColor,
        padding: 12,
    },
    photosGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    photoImage: {
        width: photoImageWidth,
        height: 126,
        borderRadius: 4,
    },
});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
