import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../constants/Theme';
import Fonts from '../../constants/Fonts';

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
    headerButtonPlaceholder: {
        width: 44,
        height: 44,
    },
    headerTitle: {
        ...Fonts.medium18,
        color: colors.mainTextColor,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },

    // Search Bar
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
    },
    searchInputContainer: {
        flex: 1,
        height: 48,
        backgroundColor: colors.btnBackgroundColor,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        ...Fonts.regular14,
        color: colors.mainTextColor,
    },
    filterButton: {
        width: 48,
        height: 48,
        borderRadius: 10,
        backgroundColor: colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Section Header
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    sectionTitle: {
        ...Fonts.medium18,
        color: colors.mainTextColor,
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colors.primaryColor,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        height: 38,
    },
    viewAllText: {
        ...Fonts.regular14,
        color: colors.whiteColor,
    },

    // Events List
    eventsList: {
        gap: 16,
    },

    // Event Card
    eventCard: {
        backgroundColor: colors.backgroundColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        padding: 16,
    },
    eventCardContent: {
        gap: 12,
    },
    eventTopRow: {
        flexDirection: 'row',
        gap: 12,
    },
    eventImage: {
        width: 86,
        height: 86,
        borderRadius: 10,
    },
    eventInfo: {
        flex: 1,
        gap: 6,
    },
    eventTitle: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
    },
    eventDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    eventDetailLabel: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    eventDetailValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    eventDetailValue: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: colors.primaryColor,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        height: 38,
        alignSelf: 'flex-start',
    },
    addButtonText: {
        ...Fonts.regular14,
        color: colors.whiteColor,
    },

    // Join Team Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    joinModalContainer: {
        backgroundColor: colors.backgroundColor,
        borderRadius: 16,
        padding: 20,
        width: '85%',
        maxWidth: 380,
    },
    joinModalCloseButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1,
    },
    joinModalTitle: {
        ...Fonts.medium18,
        color: colors.mainTextColor,
        textAlign: 'center',
        marginBottom: 8,
    },
    joinModalSubtitle: {
        ...Fonts.regular14,
        color: colors.subTextColor,
        textAlign: 'center',
        marginBottom: 20,
    },
    joinModalOptions: {
        gap: 12,
        marginBottom: 20,
    },
    joinModalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 54,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        paddingHorizontal: 16,
    },
    joinModalOptionSelected: {
        backgroundColor: colors.primaryColor,
        borderColor: colors.primaryColor,
    },
    joinModalOptionText: {
        ...Fonts.regular14,
        color: colors.mainTextColor,
    },
    joinModalOptionTextSelected: {
        color: colors.whiteColor,
    },
    joinModalRadio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    joinModalRadioSelected: {
        borderColor: colors.whiteColor,
    },
    joinModalRadioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.backgroundColor,
    },
    joinModalMembersSection: {
        marginBottom: 20,
    },
    joinModalMembersTitle: {
        ...Fonts.regular14,
        color: colors.subTextColor,
        textAlign: 'center',
        marginBottom: 16,
    },
    joinModalMemberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 54,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    joinModalMemberName: {
        ...Fonts.regular14,
        color: colors.mainTextColor,
    },
    joinModalCheckbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    joinModalCheckboxSelected: {
        backgroundColor: colors.primaryColor,
    },
    joinModalCheckboxInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.backgroundColor,
    },
    joinModalConfirmButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 54,
        borderRadius: 10,
        backgroundColor: colors.primaryColor,
    },
    joinModalConfirmButtonText: {
        ...Fonts.medium16,
        color: colors.whiteColor,
    },
});


