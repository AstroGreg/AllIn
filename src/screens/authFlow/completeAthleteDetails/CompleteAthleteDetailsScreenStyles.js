import { StyleSheet } from 'react-native';
import Fonts from '../../../constants/Fonts';
import { lightColors } from '../../../constants/Theme';
export const createStyles = (colors) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.backgroundColor,
    },
    screenContent: {
        flex: 1,
        minHeight: 0,
    },
    topBar: {
        paddingHorizontal: 20,
        paddingTop: 12,
        alignItems: 'flex-start',
    },
    backButtonCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.secondaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroSection: {
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    imageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerImage: {
        width: 210,
        height: 126,
    },
    contentContainer: {
        alignItems: 'center',
    },
    headingText: Object.assign(Object.assign({}, Fonts.medium22), { fontSize: 24, lineHeight: 32, color: colors.mainTextColor, textAlign: 'center' }),
    subHeadingText: Object.assign(Object.assign({}, Fonts.regular14), { lineHeight: 22, color: colors.grayColor, textAlign: 'center' }),
    helperTextLeft: Object.assign(Object.assign({}, Fonts.regular14), { lineHeight: 22, color: colors.grayColor, textAlign: 'left' }),
    formViewport: {
        flex: 1,
        minHeight: 0,
        paddingTop: 20,
    },
    formScroll: {
        flex: 1,
    },
    formContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    formContainer: {
        gap: 16,
    },
    reviewCard: {
        borderWidth: 1,
        borderColor: colors.borderColor,
        borderRadius: 14,
        backgroundColor: colors.secondaryColor,
        padding: 18,
        gap: 14,
    },
    reviewRow: {
        gap: 6,
    },
    reviewLabel: Object.assign(Object.assign({}, Fonts.regular12), { color: colors.grayColor }),
    reviewValue: Object.assign(Object.assign({}, Fonts.medium14), { lineHeight: 22, color: colors.mainTextColor }),
    reviewHint: Object.assign(Object.assign({}, Fonts.regular14), { lineHeight: 22, color: colors.grayColor }),
    clubFieldLabel: Object.assign(Object.assign({}, Fonts.regular14), { color: colors.mainTextColor, fontWeight: '400' }),
    clubFieldContainer: {
        height: 54,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: colors.borderColor,
        backgroundColor: colors.secondaryColor,
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: 16,
    },
    clubFieldTapArea: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    clubFieldLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    clubFieldText: Object.assign(Object.assign({}, Fonts.regular14), { color: colors.mainTextColor }),
    clubFieldPlaceholder: Object.assign(Object.assign({}, Fonts.regular14), { color: colors.grayColor }),
    clubClearButton: {
        marginLeft: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    websiteInput: {
        flex: 1,
        color: colors.mainTextColor,
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
    modalTitle: Object.assign(Object.assign({}, Fonts.medium16), { color: colors.mainTextColor }),
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
        borderRadius: 10,
        paddingHorizontal: 10,
    },
    groupItemSelected: {
        backgroundColor: colors.secondaryColor,
    },
    groupItemText: Object.assign(Object.assign({}, Fonts.regular14), { color: colors.mainTextColor }),
    groupItemTextSelected: {
        color: colors.primaryColor,
        fontWeight: '600',
    },
    emptyText: Object.assign(Object.assign({}, Fonts.regular14), { color: colors.grayColor, textAlign: 'center', paddingVertical: 20 }),
    buttonContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 16,
        paddingTop: 16,
        paddingBottom: 14,
        backgroundColor: colors.backgroundColor,
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
    skipButtonText: Object.assign(Object.assign({}, Fonts.medium16), { lineHeight: 24, color: colors.grayColor }),
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
    finishButtonText: Object.assign(Object.assign({}, Fonts.medium16), { lineHeight: 24, color: '#FFFFFF' }),
});
// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
