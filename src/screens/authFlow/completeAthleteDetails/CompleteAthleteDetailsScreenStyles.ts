import { StyleSheet } from 'react-native';
import Fonts from '../../../constants/Fonts';
import { ThemeColors, lightColors } from '../../../constants/Theme';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.backgroundColor,
    },
    scrollContent: {
        flexGrow: 1,
    },
    imageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerImage: {
        width: 235.3,
        height: 141.59,
    },
    contentContainer: {
        paddingHorizontal: 20,
        flex: 1,
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
    },
    formContainer: {
        gap: 16,
    },
    clubFieldLabel: {
        ...Fonts.regular14,
        color: colors.mainTextColor,
        fontWeight: '400',
    },
    clubFieldContainer: {
        height: 54,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: colors.borderColor,
        backgroundColor: colors.secondaryColor,
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: 16,
        justifyContent: 'space-between',
    },
    clubFieldLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    clubFieldText: {
        ...Fonts.regular14,
        color: colors.mainTextColor,
    },
    clubFieldPlaceholder: {
        ...Fonts.regular14,
        color: colors.grayColor,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    modalCard: {
        borderRadius: 14,
        backgroundColor: colors.backgroundColor,
        padding: 16,
        maxHeight: '70%',
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    modalTitle: {
        ...Fonts.medium16,
        color: colors.mainTextColor,
    },
    searchInput: {
        height: 44,
        borderWidth: 1,
        borderColor: colors.borderColor,
        borderRadius: 10,
        paddingHorizontal: 12,
        color: colors.mainTextColor,
        backgroundColor: colors.secondaryColor,
    },
    groupItem: {
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.lightGrayColor,
    },
    groupItemText: {
        ...Fonts.regular14,
        color: colors.mainTextColor,
    },
    emptyText: {
        ...Fonts.regular14,
        color: colors.grayColor,
        textAlign: 'center',
        paddingVertical: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 16,
        marginTop: 'auto',
        paddingTop: 40,
    },
    skipButton: {
        flex: 1,
        height: 54,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    skipButtonText: {
        ...Fonts.medium16,
        lineHeight: 24,
        color: colors.grayColor,
    },
    finishButton: {
        flex: 1,
        height: 54,
        borderRadius: 10,
        backgroundColor: colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    finishButtonText: {
        ...Fonts.medium16,
        lineHeight: 24,
        color: '#FFFFFF',
    },
});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
