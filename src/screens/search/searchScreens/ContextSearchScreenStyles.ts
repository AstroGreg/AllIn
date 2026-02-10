import { StyleSheet } from 'react-native';
import Fonts from '../../../constants/Fonts';

export const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundColor,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.cardBackground,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...Fonts.semibold18,
        color: colors.mainTextColor,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    title: {
        ...Fonts.bold24,
        color: colors.mainTextColor,
    },
    subtitle: {
        ...Fonts.regular14,
        color: colors.grayColor,
        marginTop: 8,
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
        borderColor: colors.borderColor,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: colors.cardBackground,
    },
    appliedChipText: {
        ...Fonts.regular12,
        color: colors.mainTextColor,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: colors.borderColor,
    },
    input: {
        flex: 1,
        ...Fonts.regular16,
        color: colors.mainTextColor,
        padding: 0,
    },
    filterSectionTitle: {
        ...Fonts.semibold16,
        color: colors.mainTextColor,
    },
    filterTabsContainer: {
        gap: 10,
    },
    filterTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: colors.cardBackground,
        borderWidth: 1,
        borderColor: colors.borderColor,
    },
    filterTabActive: {
        backgroundColor: colors.primaryColor,
        borderColor: colors.primaryColor,
    },
    filterTabText: {
        ...Fonts.regular14,
        color: colors.grayColor,
    },
    filterTabTextActive: {
        color: '#FFFFFF',
    },
    activeChipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    activeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primaryColor,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    activeChipText: {
        ...Fonts.regular12,
        color: '#FFFFFF',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    buttonText: {
        ...Fonts.semibold16,
        color: '#FFFFFF',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '85%',
        backgroundColor: colors.backgroundColor,
        borderRadius: 16,
        padding: 24,
    },
    modalTitle: {
        ...Fonts.semibold18,
        color: colors.mainTextColor,
    },
    modalList: {
        maxHeight: 360,
    },
    modalListContent: {
        paddingVertical: 4,
        gap: 8,
    },
    modalOption: {
        borderWidth: 1,
        borderColor: colors.lightGrayColor,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: colors.secondaryColor,
    },
    modalOptionText: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
    },
    modalOptionSubText: {
        ...Fonts.regular12,
        color: colors.subTextColor,
        marginTop: 2,
    },
    modalEmpty: {
        ...Fonts.regular12,
        color: colors.subTextColor,
        textAlign: 'center',
        paddingVertical: 16,
    },
});
