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
        paddingHorizontal: 20,
    },
    topBar: {
        paddingTop: 12,
        alignItems: 'flex-start',
    },
    backIconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.secondaryColor,
    },
    heroSection: {
        paddingTop: 8,
    },
    imageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroImage: {
        width: 190,
        height: 136,
    },
    contentContainer: {
        alignItems: 'center',
    },
    headingText: Object.assign(Object.assign({}, Fonts.medium22), { fontSize: 24, lineHeight: 32, color: colors.mainTextColor, textAlign: 'center' }),
    subHeadingText: Object.assign(Object.assign({}, Fonts.regular14), { lineHeight: 22, color: colors.grayColor, textAlign: 'center' }),
    selectionSection: {
        flex: 1,
        paddingTop: 24,
        minHeight: 0,
    },
    focusList: {
        flex: 1,
        minHeight: 0,
    },
    focusListContent: {
        gap: 10,
        paddingBottom: 8,
    },
    focusCard: {
        minHeight: 74,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.borderColor,
        backgroundColor: colors.secondaryColor,
        paddingHorizontal: 14,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },
    focusCardSelected: {
        borderColor: colors.primaryColor,
        backgroundColor: colors.secondaryBlueColor,
    },
    focusCardLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    focusIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.backgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    focusTextWrap: {
        flex: 1,
        gap: 2,
    },
    focusCardTitle: Object.assign(Object.assign({}, Fonts.medium15), { color: colors.mainTextColor }),
    focusCardSubtitle: Object.assign(Object.assign({}, Fonts.regular11), { color: colors.grayColor, lineHeight: 15 }),
    selectedSummaryCard: {
        marginTop: 8,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.borderColor,
        backgroundColor: colors.cardBackground,
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 6,
    },
    selectedSummaryLabel: Object.assign(Object.assign({}, Fonts.medium12), { color: colors.subTextColor, textTransform: 'uppercase', letterSpacing: 0.6 }),
    selectedSummaryValue: Object.assign(Object.assign({}, Fonts.medium15), { color: colors.mainTextColor, lineHeight: 22 }),
    buttonContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 16,
        paddingTop: 16,
        paddingBottom: 14,
        backgroundColor: colors.backgroundColor,
    },
    backButton: {
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
    backButtonText: Object.assign(Object.assign({}, Fonts.medium16), { lineHeight: 24, color: colors.grayColor }),
    nextButton: {
        flex: 1,
        height: 54,
        borderRadius: 10,
        backgroundColor: colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    nextButtonDisabled: {
        backgroundColor: colors.lightGrayColor,
    },
    nextButtonText: Object.assign(Object.assign({}, Fonts.medium16), { lineHeight: 24, color: '#FFFFFF' }),
});
const Styles = createStyles(lightColors);
export default Styles;
