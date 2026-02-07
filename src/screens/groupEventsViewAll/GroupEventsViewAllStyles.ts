import { StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';
import Fonts from '../../constants/Fonts';

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
    headerButtonPlaceholder: {
        width: 44,
        height: 44,
    },
    headerTitle: {
        ...Fonts.medium18,
        color: Colors.mainTextColor,
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
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        ...Fonts.regular14,
        color: Colors.mainTextColor,
    },
    filterButton: {
        width: 48,
        height: 48,
        borderRadius: 10,
        backgroundColor: Colors.primaryColor,
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
        color: Colors.mainTextColor,
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: Colors.primaryColor,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        height: 38,
    },
    viewAllText: {
        ...Fonts.regular14,
        color: Colors.whiteColor,
    },

    // Events List
    eventsList: {
        gap: 16,
    },

    // Event Card
    eventCard: {
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
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
        color: Colors.mainTextColor,
    },
    eventDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    eventDetailLabel: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    eventDetailValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    eventDetailValue: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: Colors.primaryColor,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        height: 38,
        alignSelf: 'flex-start',
    },
    addButtonText: {
        ...Fonts.regular14,
        color: Colors.whiteColor,
    },

    // Join Team Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    joinModalContainer: {
        backgroundColor: Colors.whiteColor,
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
        color: Colors.mainTextColor,
        textAlign: 'center',
        marginBottom: 8,
    },
    joinModalSubtitle: {
        ...Fonts.regular14,
        color: '#9B9F9F',
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
        borderColor: '#DEDEDE',
        paddingHorizontal: 16,
    },
    joinModalOptionSelected: {
        backgroundColor: Colors.primaryColor,
        borderColor: Colors.primaryColor,
    },
    joinModalOptionText: {
        ...Fonts.regular14,
        color: Colors.mainTextColor,
    },
    joinModalOptionTextSelected: {
        color: Colors.whiteColor,
    },
    joinModalRadio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    joinModalRadioSelected: {
        borderColor: Colors.whiteColor,
    },
    joinModalRadioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.whiteColor,
    },
    joinModalMembersSection: {
        marginBottom: 20,
    },
    joinModalMembersTitle: {
        ...Fonts.regular14,
        color: '#9B9F9F',
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
        borderColor: '#DEDEDE',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    joinModalMemberName: {
        ...Fonts.regular14,
        color: Colors.mainTextColor,
    },
    joinModalCheckbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    joinModalCheckboxSelected: {
        backgroundColor: Colors.primaryColor,
    },
    joinModalCheckboxInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.whiteColor,
    },
    joinModalConfirmButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 54,
        borderRadius: 10,
        backgroundColor: Colors.primaryColor,
    },
    joinModalConfirmButtonText: {
        ...Fonts.medium16,
        color: Colors.whiteColor,
    },
});

export default Styles;
