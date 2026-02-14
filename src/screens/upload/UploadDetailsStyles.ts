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
    headerTitle: {
        ...Fonts.medium18,
        color: colors.mainTextColor,
    },
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        marginHorizontal: 20,
        paddingTop: 24,
    },
    titleText: {
        ...Fonts.regular14,
        color: colors.mainTextColor,
        fontWeight: '500'
    },
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
    uploadText: {
        ...Fonts.regular14,
        fontWeight: '500',
        color: colors.primaryColor
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    subText: {
        ...Fonts.regular14,
        fontWeight: '400',
        color: colors.grayColor
    },
    btnContianer: {
        paddingHorizontal: 16,
        backgroundColor: colors.primaryColor,
        borderRadius: 8,
        height: 38,
        alignItems: 'center',
        justifyContent: 'center'
    },
    btnText: {
        ...Fonts.regular14,
        color: colors.pureWhite
    },
    selectedImagesContainer: {
        marginTop: 12,
        padding: 8,
        backgroundColor: colors.secondaryColor,
        borderRadius: 8,
    },
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
});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
