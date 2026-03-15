import { StyleSheet } from "react-native";
import Fonts from "../../constants/Fonts";
import { lightColors } from "../../constants/Theme";
export const createStyles = (colors) => StyleSheet.create({
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
        borderBottomWidth: 0.3,
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
    headerTitle: Object.assign(Object.assign({}, Fonts.medium18), { color: colors.mainTextColor }),
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        marginHorizontal: 20,
        paddingTop: 24,
    },
    titleText: Object.assign(Object.assign({}, Fonts.regular14), { color: colors.mainTextColor, fontWeight: '500' }),
    uploadContainer: {
        height: 68,
        borderRadius: 10,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: colors.primaryColor,
        backgroundColor: colors.secondaryColor,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'
    },
    uploadContainerDisabled: {
        opacity: 0.65,
    },
    uploadText: Object.assign(Object.assign({}, Fonts.regular14), { fontWeight: '500', color: colors.primaryColor }),
    row: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    subText: Object.assign(Object.assign({}, Fonts.regular14), { fontWeight: '400', color: colors.grayColor }),
    btnContianer: {
        paddingHorizontal: 16,
        backgroundColor: colors.primaryColor,
        borderRadius: 8,
        height: 38,
        alignItems: 'center',
        justifyContent: 'center'
    },
    btnText: Object.assign(Object.assign({}, Fonts.regular14), { color: colors.pureWhite }),
    selectedImagesContainer: {
        marginTop: 12,
        padding: 8,
        backgroundColor: colors.secondaryColor,
        borderRadius: 8,
    },
    bulkPriceCard: {
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        padding: 12,
        backgroundColor: colors.cardBackground,
    },
    bulkPriceTitle: Object.assign(Object.assign({}, Fonts.regular14), { color: colors.mainTextColor, fontWeight: '600', marginBottom: 10 }),
    bulkPriceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    bulkPriceInput: {
        flex: 1,
        height: 40,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 8,
        paddingHorizontal: 10,
        color: colors.mainTextColor,
        backgroundColor: colors.secondaryColor,
    },
    bulkPriceButton: {
        height: 40,
        borderRadius: 8,
        backgroundColor: colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    bulkPriceButtonText: Object.assign(Object.assign({}, Fonts.regular12), { color: colors.pureWhite }),
    bulkPriceHint: Object.assign(Object.assign({}, Fonts.regular12), { color: colors.grayColor, marginBottom: 10 }),
    videoTitleCard: {
        marginTop: 10,
        gap: 8,
    },
    videoTitleLabel: Object.assign(Object.assign({}, Fonts.regular12), { color: colors.mainTextColor, fontWeight: '500' }),
    bottomBtn: {
        height: 90, position: 'absolute', bottom: 10, width: '100%', paddingHorizontal: 20
    },
    imgContainer: {
        height: 220,
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 15,
        marginHorizontal: 15
    },
    box: {
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        padding: 16
    },
    selectedVideoContainer: {
        marginTop: 12,
        padding: 12,
        backgroundColor: colors.secondaryColor,
        borderRadius: 8,
    },
    videoDetails: {
        color: colors.grayColor,
        fontSize: 12,
        marginTop: 4,
    },
    disabledUpload: {
        opacity: 0.5,
    },
    preparingOverlay: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: 'rgba(0,0,0,0.28)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    preparingCard: {
        minWidth: 220,
        borderRadius: 16,
        paddingHorizontal: 22,
        paddingVertical: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.cardBackground,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
    },
    preparingTitle: Object.assign(Object.assign({}, Fonts.medium16), { color: colors.mainTextColor }),
    preparingText: Object.assign(Object.assign({}, Fonts.regular13), { color: colors.grayColor, textAlign: 'center' }),
});
// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
