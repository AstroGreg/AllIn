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
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerIconButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.btnBackgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 16,
    },
    redditPostCard: {
        borderWidth: 1,
        borderColor: colors.borderColor,
        borderRadius: 14,
        backgroundColor: colors.secondaryColor,
        padding: 14,
    },
    redditMetaRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    redditMetaTextBlock: {
        flex: 1,
    },
    redditMetaName: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
        lineHeight: 18,
        paddingTop: 1,
    },
    redditMetaSubText: {
        ...Fonts.regular12,
        color: colors.subTextColor,
        marginTop: 2,
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
    heroImage: {
        width: '100%',
        height: 220,
        borderRadius: 16,
        backgroundColor: colors.btnBackgroundColor,
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
        lineHeight: 30,
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
        ...Fonts.regular15,
        color: colors.mainTextColor,
        lineHeight: 24,
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
    blogActionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderTopWidth: 1,
        borderTopColor: colors.borderColor,
        paddingTop: 10,
    },
    blogActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        borderWidth: 1,
        borderColor: colors.lightGrayColor,
        backgroundColor: colors.secondaryColor,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 40,
    },
    blogActionButtonCompact: {
        paddingHorizontal: 9,
        height: 34,
        borderRadius: 10,
    },
    blogActionLike: {
        paddingHorizontal: 14,
    },
    blogActionIcon: {
        width: 18,
        height: 18,
        tintColor: colors.primaryColor,
    },
    blogActionIconCompact: {
        width: 14,
        height: 14,
    },
    blogActionText: {
        ...Fonts.medium12,
        color: colors.mainTextColor,
    },
    blogActionTextCompact: {
        ...Fonts.medium11,
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
