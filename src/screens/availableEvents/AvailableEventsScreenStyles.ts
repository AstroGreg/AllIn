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
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...Fonts.medium18,
        color: Colors.mainTextColor,
    },
    notificationButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 24,
        gap: 10,
    },
    searchInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7FAFF',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 6,
        borderWidth: 0.5,
        borderColor: '#E0ECFE',
    },
    searchInput: {
        flex: 1,
        ...Fonts.regular14,
        color: Colors.mainTextColor,
        padding: 0,
    },
    filterButton: {
        width: 54,
        height: 54,
        borderRadius: 10,
        backgroundColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
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
    viewAllText: {
        ...Fonts.regular14,
        color: '#9B9F9F',
    },
    eventCard: {
        flexDirection: 'column',
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        padding: 16,
        marginBottom: 24,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
    },
    cardRow: {
        flexDirection: 'row',
        gap: 12,
    },
    squareThumbnail: {
        width: 86,
        height: 86,
        borderRadius: 10,
    },
    cardInfo: {
        flex: 1,
        gap: 6,
    },
    eventTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardTitle: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
    },
    videosCount: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    detailLabel: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    detailValue: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailText: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    cardActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 12,
    },
    addMyselfButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primaryColor,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        height: 36,
        gap: 6,
    },
    addMyselfButtonText: {
        ...Fonts.regular14,
        color: Colors.whiteColor,
    },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.whiteColor,
        borderRadius: 6,
        paddingVertical: 10,
        paddingHorizontal: 16,
        height: 36,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        gap: 6,
    },
    viewButtonText: {
        ...Fonts.regular14,
        color: '#9B9F9F',
    },
    // Filter styles
    filtersContainer: {
        paddingHorizontal: 20,
        marginBottom: 16,
        gap: 16,
    },
    filterChipsRow: {
        flexDirection: 'row',
        gap: 6,
    },
    filterChip: {
        backgroundColor: '#F5F5F5',
        borderRadius: 6,
        paddingHorizontal: 10,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterChipActive: {
        backgroundColor: Colors.primaryColor,
    },
    filterChipText: {
        ...Fonts.regular12,
        color: '#777777',
    },
    filterChipTextActive: {
        color: Colors.whiteColor,
    },
    activeFiltersRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    activeFilterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primaryColor,
        borderRadius: 6,
        paddingHorizontal: 10,
        height: 32,
        gap: 4,
    },
    activeFilterText: {
        ...Fonts.regular12,
        color: Colors.whiteColor,
    },
    timeRangeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.whiteColor,
        borderRadius: 6,
        paddingHorizontal: 10,
        height: 32,
        gap: 4,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
    },
    timeRangeText: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    eventsCountBadge: {
        backgroundColor: '#F5F5F5',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    eventsCountText: {
        ...Fonts.regular14,
        color: '#9B9F9F',
    },
});

export default Styles;
