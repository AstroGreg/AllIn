import { StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";

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
        borderBottomWidth: 0.3,
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
    headerTitle: {
        ...Fonts.medium18,
        color: Colors.mainTextColor,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    tipCard: {
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        padding: 16,
        alignItems: 'center',
    },
    tipText: {
        ...Fonts.regular14,
        color: '#9B9F9F',
        textAlign: 'center',
        lineHeight: 22,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7FAFF',
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#E0ECFE',
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 6,
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
    filterTabsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    filterTab: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: '#F5F5F5',
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterTabActive: {
        backgroundColor: Colors.primaryColor,
    },
    filterTabText: {
        ...Fonts.regular12,
        color: '#777777',
    },
    filterTabTextActive: {
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
        paddingVertical: 6,
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
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        paddingHorizontal: 10,
        paddingVertical: 6,
        height: 32,
        gap: 4,
    },
    timeRangeText: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    resultsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    resultsTitle: {
        ...Fonts.medium18,
        color: Colors.mainTextColor,
    },
    resultsCountBadge: {
        backgroundColor: '#F5F5F5',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    resultsCountText: {
        ...Fonts.regular14,
        color: '#9B9F9F',
    },
    competitionCard: {
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        padding: 16,
        marginBottom: 24,
    },
    competitionContent: {
        flexDirection: 'row',
        gap: 12,
    },
    thumbnailContainer: {
        width: 86,
        height: 86,
        borderRadius: 10,
        overflow: 'hidden',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    competitionInfo: {
        flex: 1,
        gap: 6,
    },
    competitionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    competitionName: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
    },
    videoCountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    videoCountText: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    infoLabel: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    infoValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    infoValue: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primaryColor,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginTop: 12,
        alignSelf: 'flex-start',
        gap: 6,
    },
    uploadButtonText: {
        ...Fonts.regular14,
        color: Colors.whiteColor,
    },
});

export default Styles;
