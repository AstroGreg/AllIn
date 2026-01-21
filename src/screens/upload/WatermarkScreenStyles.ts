import { StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";

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
        color: Colors.mainTextColor,
    },
    sectionSubtitle: {
        ...Fonts.regular12,
        color: '#777777',
    },
    uploadArea: {
        backgroundColor: '#F7FAFF',
        borderWidth: 1,
        borderColor: '#E0ECFE',
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
        color: '#9B9F9F',
        position: 'absolute',
        top: 12,
        right: 16,
    },
    chooseFileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    chooseFileButton: {
        backgroundColor: '#9B9F9F',
        borderRadius: 6,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    chooseFileButtonText: {
        ...Fonts.regular12,
        color: Colors.whiteColor,
    },
    noFileText: {
        ...Fonts.regular12,
        color: Colors.mainTextColor,
    },
    radioOptionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.whiteColor,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
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
        color: '#9B9F9F',
    },
    radioOuter: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioOuterSelected: {
        borderWidth: 1,
        borderColor: Colors.primaryColor,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.primaryColor,
    },
    savedWatermarksHeader: {
        gap: 6,
    },
    savedWatermarksTitle: {
        ...Fonts.medium16,
        color: Colors.mainTextColor,
    },
    savedWatermarksSubtitle: {
        ...Fonts.regular14,
        color: '#9B9F9F',
    },
    watermarksRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    watermarkCard: {
        width: 122,
        backgroundColor: Colors.whiteColor,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        alignItems: 'center',
        gap: 8,
    },
    watermarkCardSelected: {
        borderColor: Colors.primaryColor,
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
        color: '#9B9F9F',
        textAlign: 'center',
    },
    watermarkNameSelected: {
        color: Colors.mainTextColor,
    },
    previewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primaryColor,
        borderRadius: 10,
        height: 54,
        gap: 8,
    },
    previewButtonText: {
        ...Fonts.medium16,
        color: Colors.whiteColor,
    },
});

export default Styles;
