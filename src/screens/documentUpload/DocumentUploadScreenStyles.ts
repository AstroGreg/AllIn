import { StyleSheet } from 'react-native';
import Fonts from '../../constants/Fonts';
import { ThemeColors, lightColors } from '../../constants/Theme';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.backgroundColor,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
    },
    imageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerImage: {
        width: 250,
        height: 180,
    },
    headerContainer: {
        alignItems: 'center',
    },
    headingText: {
        ...Fonts.medium22,
        fontSize: 24,
        lineHeight: 32,
        color: colors.mainTextColor,
        textAlign: 'center',
    },
    subHeadingText: {
        ...Fonts.regular14,
        lineHeight: 22,
        color: colors.grayColor,
        textAlign: 'center',
        marginTop: 8,
    },
    formContainer: {
        gap: 24,
    },
    sectionTitle: {
        ...Fonts.medium16,
        lineHeight: 24,
        color: colors.mainTextColor,
    },
    uploadContainer: {
        backgroundColor: colors.secondaryColor,
        borderWidth: 0.5,
        borderColor: colors.borderColor,
        borderStyle: 'dashed',
        borderRadius: 10,
        padding: 16,
        alignItems: 'center',
        gap: 16,
    },
    uploadIconContainer: {
        alignItems: 'center',
        gap: 8,
    },
    dragDropText: {
        ...Fonts.regular12,
        fontSize: 10,
        lineHeight: 18,
        color: colors.grayColor,
        textAlign: 'center',
    },
    maxSizeText: {
        ...Fonts.regular12,
        fontSize: 10,
        lineHeight: 18,
        color: colors.grayColor,
        position: 'absolute',
        top: 16,
        right: 16,
    },
    fileChooseContainer: {
        alignItems: 'center',
        gap: 8,
    },
    fileInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        borderWidth: 0.5,
        borderColor: colors.borderColor,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    chooseFileButton: {
        backgroundColor: colors.lightGrayColor,
        borderRadius: 6,
        paddingHorizontal: 16,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chooseFileText: {
        ...Fonts.regular12,
        lineHeight: 20,
        color: colors.grayColor,
    },
    noFileText: {
        ...Fonts.regular12,
        lineHeight: 20,
        color: colors.mainTextColor,
    },
    supportedText: {
        ...Fonts.regular12,
        fontSize: 10,
        lineHeight: 18,
        color: colors.grayColor,
        textAlign: 'center',
    },
    inputLabel: {
        ...Fonts.medium14,
        lineHeight: 22,
        color: colors.mainTextColor,
    },
    inputContainer: {
        backgroundColor: colors.secondaryColor,
        borderWidth: 0.5,
        borderColor: colors.borderColor,
        borderRadius: 10,
        height: 54,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 10,
    },
    inputText: {
        ...Fonts.regular14,
        lineHeight: 22,
        color: colors.grayColor,
        flex: 1,
    },
    buttonContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        marginTop: 'auto',
    },
});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
