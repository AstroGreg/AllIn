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
    headerSpacer: {
        width: 44,
        height: 44,
    },
    headerGhost: {
        width: 44,
        height: 44,
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
    uploadModeBanner: {
        alignSelf: 'flex-start',
        backgroundColor: colors.secondaryBlueColor,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: colors.borderColor,
    },
    uploadModeText: {
        ...Fonts.regular12,
        color: colors.primaryColor,
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
    searchInputPill: {
        backgroundColor: colors.secondaryBlueColor,
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    searchInputPillText: {
        ...Fonts.regular12,
        color: colors.primaryColor,
    },
    searchInput: {
        flex: 1,
        ...Fonts.regular14,
        color: colors.mainTextColor,
        padding: 0,
    },
    filterTabsContainer: {
        flexDirection: 'row',
    },
    filterTab: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: colors.btnBackgroundColor,
        marginRight: 8,
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
    typeFilterRow: {
        gap: 8,
    },
    typeFilterLabel: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    typeFilterChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    typeFilterChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        backgroundColor: colors.whiteColor,
    },
    typeFilterChipActive: {
        backgroundColor: colors.primaryColor,
        borderColor: colors.primaryColor,
    },
    typeFilterChipText: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    typeFilterChipTextActive: {
        color: colors.pureWhite,
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
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        height: 32,
        gap: 6,
    },
    activeChipText: {
        ...Fonts.regular12,
        color: colors.pureWhite,
        marginRight: 4,
    },
    timeRangeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.whiteColor,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        paddingHorizontal: 10,
        paddingRight: 14,
        paddingVertical: 6,
        height: 32,
        borderRadius: 6,
        gap: 8,
    },
    timeRangeChipActive: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.secondaryBlueColor,
        borderWidth: 0.5,
        borderColor: colors.primaryColor,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        gap: 6,
    },
    timeRangeText: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    timeRangeTextActive: {
        ...Fonts.regular12,
        color: colors.primaryColor,
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
    thumbnailPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: colors.btnBackgroundColor,
    },
    competitionInfo: {
        flex: 1,
        gap: 8,
    },
    competitionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    competitionName: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
        flex: 1,
        minWidth: 0,
    },
    typeBadge: {
        backgroundColor: colors.secondaryBlueColor,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: colors.borderColor,
    },
    typeBadgeText: {
        ...Fonts.regular12,
        color: colors.primaryColor,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        flexWrap: 'wrap',
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
        maxWidth: 120,
        flexShrink: 1,
    },
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 12,
    },
    loadingText: {
        ...Fonts.regular14,
        color: colors.grayColor,
    },
    errorText: {
        ...Fonts.regular14,
        color: '#ED5454',
        marginBottom: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    dateModalContainer: {
        width: '100%',
        maxWidth: 420,
        backgroundColor: colors.modalBackground,
        borderRadius: 16,
        padding: 16,
    },
    dateModalTitle: {
        ...Fonts.medium16,
        color: colors.mainTextColor,
    },
    quickRangeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    quickRangeChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        backgroundColor: colors.secondaryColor,
    },
    quickRangeChipText: {
        ...Fonts.regular12,
        color: colors.mainTextColor,
    },
    rangeHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    rangePill: {
        flex: 1,
        backgroundColor: colors.secondaryColor,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
    },
    rangePillLabel: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    rangePillValue: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
        marginTop: 2,
    },
    calendarContainer: {
        height: 320,
        alignSelf: 'center',
    },
    modalButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    modalCancelButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        alignItems: 'center',
        paddingVertical: 12,
    },
    modalCancelText: {
        ...Fonts.medium14,
        color: colors.grayColor,
    },
    modalSubmitButton: {
        flex: 1,
        backgroundColor: colors.primaryColor,
        borderRadius: 10,
        alignItems: 'center',
        paddingVertical: 12,
    },
    modalSubmitButtonDisabled: {
        opacity: 0.4,
    },
    modalSubmitText: {
        ...Fonts.medium14,
        color: colors.pureWhite,
    },
});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
