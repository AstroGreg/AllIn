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
    uploadArea: {
        backgroundColor: colors.secondaryColor,
        borderWidth: 1,
        borderColor: colors.borderColor,
        borderStyle: 'dashed',
        borderRadius: 10,
        paddingHorizontal: 30,
        paddingVertical: 24,
        alignItems: 'center',
        justifyContent: 'center',
        height: 192,
    },
    maxSizeText: {
        ...Fonts.regular14,
        color: colors.grayColor,
        position: 'absolute',
        top: 12,
        right: 16,
    },
    chooseFileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    chooseFileButton: {
        backgroundColor: colors.grayColor,
        borderRadius: 6,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    chooseFileButtonText: {
        ...Fonts.regular12,
        color: colors.pureWhite,
    },
    noFileText: {
        ...Fonts.regular12,
        color: colors.mainTextColor,
    },
    radioOptionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.cardBackground,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        padding: 16,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    radioLabel: {
        ...Fonts.regular12,
        color: colors.grayColor,
    },
    radioOuter: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioOuterSelected: {
        borderWidth: 1,
        borderColor: colors.primaryColor,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primaryColor,
    },
    savedWatermarksHeader: {
        gap: 6,
    },
    savedWatermarksTitle: {
        ...Fonts.medium16,
        color: colors.mainTextColor,
    },
    savedWatermarksSubtitle: {
        ...Fonts.regular14,
        color: colors.grayColor,
    },
    watermarksRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    watermarkCard: {
        width: 122,
        backgroundColor: colors.cardBackground,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        alignItems: 'center',
        gap: 8,
    },
    watermarkCardSelected: {
        borderColor: colors.primaryColor,
    },
    watermarkThumbnail: {
        width: '100%',
        height: 85,
        borderRadius: 10,
        overflow: 'hidden',
    },
    watermarkImage: {
        width: '100%',
        height: '100%',
    },
    watermarkName: {
        ...Fonts.regular14,
        color: colors.grayColor,
        textAlign: 'center',
    },
    watermarkNameSelected: {
        color: colors.mainTextColor,
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
});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
