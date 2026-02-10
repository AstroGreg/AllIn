import { StyleSheet } from 'react-native';
import Fonts from '../../../constants/Fonts';
import { ThemeColors, lightColors } from '../../../constants/Theme';

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
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    searchLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    searchLabel: {
        ...Fonts.semibold14,
        color: colors.mainTextColor,
    },
    appliedLabel: {
        ...Fonts.semibold12,
        color: colors.subTextColor,
    },
    appliedChipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    appliedChip: {
        borderWidth: 1,
        borderColor: colors.lightGrayColor,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: colors.secondaryColor,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    appliedChipText: {
        ...Fonts.regular12,
        color: colors.mainTextColor,
    },
    appliedChipRemove: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    filtersSection: {
        marginTop: 4,
        marginBottom: 6,
    },
    filtersHelper: {
        ...Fonts.regular12,
        color: colors.subTextColor,
        marginTop: 6,
    },
    filterButtonsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 10,
    },
    filterButton: {
        borderWidth: 1,
        borderColor: colors.lightGrayColor,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: colors.secondaryColor,
    },
    filterButtonText: {
        ...Fonts.regular12,
        color: colors.mainTextColor,
    },
    filterModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    filterModalCard: {
        width: '100%',
        backgroundColor: colors.cardBackground,
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.lightGrayColor,
    },
    filterModalTitle: {
        ...Fonts.medium16,
        color: colors.mainTextColor,
        marginBottom: 10,
    },
    filterModalList: {
        maxHeight: 320,
    },
    filterModalListContent: {
        paddingVertical: 4,
        gap: 8,
    },
    filterModalOption: {
        borderWidth: 1,
        borderColor: colors.lightGrayColor,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: colors.secondaryColor,
    },
    filterModalOptionText: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
    },
    filterModalOptionSubText: {
        ...Fonts.regular12,
        color: colors.subTextColor,
        marginTop: 2,
    },
    filterModalEmpty: {
        ...Fonts.regular12,
        color: colors.subTextColor,
        textAlign: 'center',
        paddingVertical: 16,
    },
    addFaceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0088FF',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        gap: 4,
    },
    addFaceButtonText: {
        ...Fonts.regular12,
        color: '#FFFFFF',
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.secondaryColor,
        borderWidth: 0.5,
        borderColor: colors.borderColor,
        borderRadius: 10,
        paddingHorizontal: 16,
        height: 54,
    },
    searchInput: {
        flex: 1,
        ...Fonts.regular14,
        color: colors.mainTextColor,
    },
    faceGroupCard: {
        borderWidth: 1,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 24,
        backgroundColor: colors.cardBackground,
    },
    faceGroupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    faceGroupName: {
        ...Fonts.semibold18,
        color: colors.mainTextColor,
    },
    selectButton: {
        backgroundColor: colors.primaryColor,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
    },
    selectButtonActive: {
        backgroundColor: '#0088FF',
    },
    selectButtonText: {
        ...Fonts.regular12,
        color: '#FFFFFF',
    },
    faceImagesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    faceImageWrapper: {
        width: 58,
        height: 58,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.primaryColor,
        overflow: 'hidden',
    },
    faceImage: {
        width: '100%',
        height: '100%',
    },
    bottomButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingTop: 16,
        backgroundColor: colors.backgroundColor,
    },
    continueButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primaryColor,
        height: 54,
        borderRadius: 10,
        gap: 8,
    },
    continueButtonDisabled: {
        backgroundColor: '#B0D4FF',
    },
    continueButtonText: {
        ...Fonts.medium16,
        color: '#FFFFFF',
    },
});

// Backward compatibility
const styles = createStyles(lightColors);
export default styles;
