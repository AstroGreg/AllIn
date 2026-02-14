import { StyleSheet, Dimensions } from 'react-native';
import Fonts from '../../constants/Fonts';
import { ThemeColors, lightColors } from '../../constants/Theme';

const { width } = Dimensions.get('window');

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
    headerCard: {
        backgroundColor: 'transparent',
        paddingVertical: 4,
        paddingHorizontal: 0,
        gap: 8,
    },
    blogImage: {
        width: '100%',
        height: 230,
        borderRadius: 10,
        overflow: 'hidden',
    },
    playOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    galleryContainer: {
        gap: 4,
    },
    galleryImage: {
        width: '100%',
        height: '100%',
        borderRadius: 16,
    },
    galleryImageSelected: {
        borderWidth: 2,
        borderColor: colors.primaryColor,
    },
    blogTitle: {
        ...Fonts.semibold22,
        color: colors.mainTextColor,
        lineHeight: 28,
    },
    metaInline: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    writerImage: {
        width: 28,
        height: 28,
        borderRadius: 14,
    },
    writerName: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
    },
    description: {
        ...Fonts.regular12,
        color: colors.subTextColor,
        lineHeight: 20,
        backgroundColor: 'transparent',
        paddingHorizontal: 0,
        paddingVertical: 0,
    },
    translateToggle: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 0.5,
        borderColor: colors.borderColor,
        backgroundColor: colors.secondaryColor,
        marginBottom: 6,
    },
    translateToggleText: {
        ...Fonts.medium12,
        color: colors.primaryColor,
    },
    sectionLabel: {
        ...Fonts.medium16,
        color: colors.mainTextColor,
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primaryColor,
        borderRadius: 10,
        paddingVertical: 16,
        gap: 8,
    },
    galleryThumbWrap: {
        width: 132,
        height: 132,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: 'transparent',
    },
    galleryPlayOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    galleryPlayButton: {
        backgroundColor: 'rgba(0,0,0,0.25)',
        borderRadius: 20,
        padding: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    shareButtonText: {
        ...Fonts.medium16,
        color: colors.pureWhite,
    },
});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
