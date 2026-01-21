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
    categorySection: {
        marginBottom: 24,
    },
    categoryTitle: {
        ...Fonts.medium16,
        color: Colors.mainTextColor,
    },
    itemsRow: {
        flexDirection: 'row',
        gap: 16,
    },
    uploadItem: {
        flex: 1,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        borderRadius: 10,
        overflow: 'hidden',
    },
    thumbnailContainer: {
        width: '100%',
        height: 100,
        position: 'relative',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    playButton: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -16 }, { translateY: -16 }],
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(60, 130, 246, 0.9)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    priceText: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
    },
    resolutionText: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    confirmButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primaryColor,
        borderRadius: 10,
        height: 54,
        gap: 8,
    },
    confirmButtonText: {
        ...Fonts.medium16,
        color: Colors.whiteColor,
    },
});

export default Styles;
