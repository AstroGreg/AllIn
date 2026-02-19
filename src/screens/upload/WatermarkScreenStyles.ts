import { StyleSheet } from "react-native";
import Fonts from "../../constants/Fonts";
import { ThemeColors, lightColors } from "../../constants/Theme";

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
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.btnBackgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerSpacer: {
        width: 44,
        height: 44,
    },
    headerGhost: {
        width: 44,
        height: 44,
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
    defaultWatermarkContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    defaultWatermarkImage: {
        width: 193,
        height: 193,
    },
    sectionHeader: {
        gap: 2,
    },
    sectionTitle: {
        ...Fonts.medium16,
        color: colors.mainTextColor,
    },
    sectionSubtitle: {
        ...Fonts.regular12,
        color: colors.grayColor,
    },
    textInput: {
        borderWidth: 1,
        borderColor: colors.lightGrayColor,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 12,
        ...Fonts.regular14,
        color: colors.mainTextColor,
        backgroundColor: colors.btnBackgroundColor,
    },
    noWatermarkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    noWatermarkCheck: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: colors.lightGrayColor,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.whiteColor,
    },
    noWatermarkCheckActive: {
        backgroundColor: colors.primaryColor,
        borderColor: colors.primaryColor,
    },
    noWatermarkCheckMark: {
        ...Fonts.medium12,
        color: colors.pureWhite,
    },
    noWatermarkText: {
        ...Fonts.regular14,
        color: colors.mainTextColor,
    },
    previewCard: {
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        padding: 16,
        backgroundColor: colors.cardBackground,
    },
    previewLabel: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
        marginBottom: 10,
    },
    previewBox: {
        height: 120,
        borderRadius: 10,
        backgroundColor: colors.secondaryColor,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.borderColor,
        overflow: 'hidden',
    },
    previewImage: {
        ...StyleSheet.absoluteFillObject,
    },
    previewText: {
        ...Fonts.medium16,
        color: colors.primaryColor,
    },
    previewWatermarkOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-around',
        transform: [{ rotate: '-18deg' }],
        paddingVertical: 4,
    },
    previewWatermarkRow: {
        ...Fonts.medium12,
        color: colors.primaryColor,
        opacity: 0.48,
        letterSpacing: 0.5,
    },
    previewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primaryColor,
        borderRadius: 10,
        height: 54,
        gap: 8,
    },
    previewButtonText: {
        ...Fonts.medium16,
        color: colors.pureWhite,
    },
    previewModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    previewModalBackdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    previewModalContent: {
        width: '100%',
        height: '82%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewModalImage: {
        width: '100%',
        height: '100%',
    },
    previewModalCloseButton: {
        marginTop: 12,
        backgroundColor: colors.primaryColor,
        borderRadius: 10,
        paddingHorizontal: 18,
        paddingVertical: 10,
    },
    previewModalCloseText: {
        ...Fonts.medium14,
        color: colors.pureWhite,
    },
});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
