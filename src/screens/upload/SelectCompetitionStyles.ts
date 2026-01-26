import { StyleSheet } from "react-native";
import Fonts from "../../constants/Fonts";
import { ThemeColors, lightColors } from "../../constants/Theme";

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
        borderBottomWidth: 0.3,
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
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    tipCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        padding: 16,
        alignItems: 'center',
    },
    tipText: {
        ...Fonts.regular14,
        color: colors.grayColor,
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
        backgroundColor: colors.secondaryColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.borderColor,
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 6,
    },
    searchInput: {
        flex: 1,
        ...Fonts.regular14,
        color: colors.mainTextColor,
        padding: 0,
    },
    filterButton: {
        width: 54,
        height: 54,
        borderRadius: 10,
        backgroundColor: colors.primaryColor,
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
        backgroundColor: colors.btnBackgroundColor,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterTabActive: {
        backgroundColor: colors.primaryColor,
    },
    filterTabText: {
        ...Fonts.regular12,
        color: colors.grayColor,
    },
    filterTabTextActive: {
        color: colors.pureWhite,
    },
    activeFiltersRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    activeFilterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primaryColor,
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        height: 32,
        gap: 4,
    },
    activeFilterText: {
        ...Fonts.regular12,
        color: colors.pureWhite,
    },
    timeRangeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        borderRadius: 6,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        paddingHorizontal: 10,
        paddingVertical: 6,
        height: 32,
        gap: 4,
    },
    timeRangeText: {
        ...Fonts.regular12,
        color: colors.grayColor,
    },
    resultsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    resultsTitle: {
        ...Fonts.medium18,
        color: colors.mainTextColor,
    },
    resultsCountBadge: {
        backgroundColor: colors.btnBackgroundColor,
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    resultsCountText: {
        ...Fonts.regular14,
        color: colors.grayColor,
    },
    competitionCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
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
        color: colors.mainTextColor,
    },
    videoCountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    videoCountText: {
        ...Fonts.regular12,
        color: colors.grayColor,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    infoLabel: {
        ...Fonts.regular12,
        color: colors.grayColor,
    },
    infoValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    infoValue: {
        ...Fonts.regular12,
        color: colors.grayColor,
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primaryColor,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginTop: 12,
        alignSelf: 'flex-start',
        gap: 6,
    },
    uploadButtonText: {
        ...Fonts.regular14,
        color: colors.pureWhite,
    },
});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
