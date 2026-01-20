import { StyleSheet, Dimensions } from 'react-native';
import Colors from '../../constants/Colors';
import Fonts from '../../constants/Fonts';

const { width } = Dimensions.get('window');
const cardWidth = (width - 40 - 16) / 2; // 2 columns with gap
const photoImageWidth = Math.floor((width - 40 - 24 - 30) / 4); // 4 columns: screen - scrollPadding(40) - cardPadding(24) - gaps(30)

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
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...Fonts.medium18,
        color: Colors.mainTextColor,
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
        color: Colors.mainTextColor,
    },
    videosCountBadge: {
        backgroundColor: '#F5F5F5',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    videosCountText: {
        ...Fonts.regular14,
        color: '#9B9F9F',
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
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
        color: '#9B9F9F',
    },
    toggleTextActive: {
        ...Fonts.regular12,
        color: Colors.mainTextColor,
    },
    videosGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    videoCard: {
        width: cardWidth,
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
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
        transform: [{ translateX: -22 }, { translateY: -22 }],
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    videoTitle: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
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
        color: '#9B9F9F',
    },
    // Photo styles
    photosCard: {
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
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

export default Styles;
