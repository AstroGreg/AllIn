import { StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";
import { ThemeColors, lightColors } from "../../constants/Theme";

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.backgroundColor
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
    headerSpacer: {
        width: 44,
        height: 44,
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
        paddingHorizontal: 20,
    },

    // Search Bar
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
        borderWidth: 0.5,
        borderColor: colors.borderColor,
        borderRadius: 10,
        paddingHorizontal: 16,
        height: 54,
    },
    searchInputPill: {
        backgroundColor: colors.secondaryBlueColor,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        marginRight: 8,
    },
    searchInputPillText: {
        ...Fonts.medium12,
        color: colors.primaryColor,
    },
    searchInput: {
        flex: 1,
        ...Fonts.regular14,
        color: colors.mainTextColor,
    },
    filterButton: {
        width: 54,
        height: 54,
        borderRadius: 10,
        backgroundColor: colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    aiButton: {
        width: 54,
        height: 54,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.lightGrayColor,
        backgroundColor: colors.cardBackground,
    },

    // Filter Tabs
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

    // Active Filter Chips
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
        paddingVertical: 6,
        borderRadius: 6,
        height: 32,
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

    // Results Header
    resultsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    resultsTitle: {
        ...Fonts.medium18,
        color: colors.mainTextColor,
    },
    resultsBadge: {
        backgroundColor: colors.btnBackgroundColor,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    resultsBadgeText: {
        ...Fonts.regular14,
        color: colors.subTextColor,
    },

    // Event Card
    eventCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        backgroundColor: colors.whiteColor,
        marginBottom: 12,
    },
    eventIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.secondaryBlueColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    eventContent: {
        flex: 1,
    },
    eventNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    eventName: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
        flex: 1,
    },
    eventTypeBadge: {
        backgroundColor: colors.btnBackgroundColor,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        marginLeft: 8,
    },
    eventTypeBadgeText: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    competitionBadge: {
        backgroundColor: colors.btnBackgroundColor,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        marginLeft: 8,
    },
    competitionBadgeText: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    eventDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    eventDetailItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    eventDetailText: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },

    // User Card
    userCard: {
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        backgroundColor: colors.whiteColor,
        padding: 16,
        marginBottom: 24,
    },
    userCardContent: {
        flex: 1,
    },
    userHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    userInfo: {
        flex: 1,
    },
    userNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    userName: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
    },
    userTypeBadge: {
        backgroundColor: colors.btnBackgroundColor,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    userTypeText: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    userDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 2,
    },
    userDetailItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userDetailText: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    followBtn: {
        backgroundColor: colors.primaryColor,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        width: 83,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    followBtnText: {
        ...Fonts.regular14,
        color: colors.pureWhite,
    },
    sectionTitle: {
        ...Fonts.medium16,
        color: colors.mainTextColor,
    },

    // Date/Time Modal
    dateModalContainer: {
        width: '90%',
        backgroundColor: colors.modalBackground,
        borderRadius: 16,
        padding: 20,
        maxHeight: '85%',
    },
    dateModalTitle: {
        ...Fonts.medium16,
        color: colors.mainTextColor,
        textAlign: 'center',
    },
    rangeHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
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

    // Legacy styles (kept for compatibility)
    borderBox: {
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        padding: 16,
        marginHorizontal: 20
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    spaceBetween: {
        justifyContent: 'space-between'
    },
    subText: {
        ...Fonts.regular14,
        color: colors.grayColor
    },
    separator: {
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGrayColor
    },
    filterCont: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: colors.btnBackgroundColor,
        marginRight: 16
    },
    selectedFilterCont: {
        backgroundColor: colors.primaryColor,
    },
    filterText: {
        ...Fonts.regular12,
        color: colors.grayColor
    },
    selectedFilterText: {
        color: colors.pureWhite
    },
    titleText: {
        ...Fonts.regular16,
        color: colors.mainTextColor
    },
    iconContainer: {
        height: 40,
        width: 40,
        backgroundColor: colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        overflow: 'hidden'
    },
    resultText: {
        ...Fonts.regular14,
        color: colors.mainTextColor
    },
    dot: {
        height: 6,
        width: 6,
        borderRadius: 3,
        backgroundColor: colors.grayColor
    },
    eventbtns: {
        paddingVertical: 8,
        paddingHorizontal: 9,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 6
    },
    eventBtnText: {
        ...Fonts.regular14,
        color: colors.subTextColor
    },
    btn: {
        position: 'absolute',
        bottom: 30,
        width: '100%',
        paddingHorizontal: 20,
    },
    playIcon: {
        position: 'absolute',
        right: 20,
        top: 15
    },
    photoImgCont: {
        height: 87,
        overflow: 'hidden',
        borderRadius: 6
    },
    downloadCount: {
        ...Fonts.regular14,
        fontWeight: '500',
        color: colors.mainTextColor,
    },
    btnRight: {
        position: 'absolute',
        right: 16
    },

    // Face Saved Grid
    faceSavedContainer: {
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        padding: 12,
    },
    faceSavedGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    faceItem: {
        alignItems: 'center',
        width: 84,
    },
    faceImage: {
        width: 84,
        height: 126,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.primaryColor,
    },
    faceImageSelected: {
        borderWidth: 2,
        borderColor: colors.primaryColor,
    },
    faceName: {
        ...Fonts.regular12,
        color: colors.grayColor,
        textAlign: 'center',
    },

    // Filter Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '85%',
        backgroundColor: colors.whiteColor,
        borderRadius: 16,
        padding: 24,
    },
    modalTitle: {
        ...Fonts.medium18,
        color: colors.mainTextColor,
        textAlign: 'center',
    },
    modalInputContainer: {
        backgroundColor: colors.secondaryColor,
        borderWidth: 0.5,
        borderColor: colors.borderColor,
        borderRadius: 10,
        paddingHorizontal: 16,
        height: 54,
        justifyContent: 'center',
    },
    modalInput: {
        ...Fonts.regular14,
        color: colors.mainTextColor,
    },
    modalButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    modalCancelButton: {
        flex: 1,
        height: 48,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalCancelText: {
        ...Fonts.medium14,
        color: colors.subTextColor,
    },
    modalSubmitButton: {
        flex: 1,
        height: 48,
        borderRadius: 10,
        backgroundColor: colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalSubmitButtonDisabled: {
        backgroundColor: '#B0D4FF',
    },
    modalSubmitText: {
        ...Fonts.medium14,
        color: colors.pureWhite,
    },

    // No Results
    noResultsContainer: {
        alignItems: 'center',
        width: '100%',
    },
    noResultsImage: {
        width: '100%',
        height: 250,
        borderRadius: 10,
    },
    noResultsText: {
        ...Fonts.medium14,
        color: colors.subTextColor,
        textAlign: 'center',
    },

    // Group Avatar Grid
    groupAvatarGrid: {
        width: 40,
        height: 40,
        flexDirection: 'column',
        borderRadius: 8,
        overflow: 'hidden',
    },
    groupAvatarRow: {
        flexDirection: 'row',
        flex: 1,
    },
    groupAvatarTopLeft: {
        width: 20,
        height: 20,
        borderTopLeftRadius: 8,
    },
    groupAvatarTopRight: {
        width: 20,
        height: 20,
        borderTopRightRadius: 8,
    },
    groupAvatarBottomLeft: {
        width: 20,
        height: 20,
        borderBottomLeftRadius: 8,
    },
    groupAvatarBottomRight: {
        width: 20,
        height: 20,
        borderBottomRightRadius: 8,
    },

    // Context Search Results
    contextResultCardWrapper: {
        marginBottom: 16,
    },
    contextResultCard: {
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        padding: 16,
        backgroundColor: colors.whiteColor,
    },
    contextResultCardAiSearched: {
        borderColor: '#155DFC',
        borderWidth: 0.5,
    },
    contextResultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    contextAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    contextResultInfo: {
        flex: 1,
    },
    contextResultNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    contextResultName: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
    },
    contextTypeBadge: {
        backgroundColor: colors.btnBackgroundColor,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    contextTypeBadgeText: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    contextBibRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    contextBibLabel: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    contextBibValue: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    contextCardFooter: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    contextViewDetailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primaryColor,
        height: 38,
        borderRadius: 8,
        paddingHorizontal: 16,
        gap: 6,
    },
    contextViewDetailsText: {
        ...Fonts.regular14,
        color: colors.pureWhite,
    },
    contextAiSearchedBadge: {
        borderRadius: 6,
        width: 80,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contextAiSearchedText: {
        fontFamily: 'Inter-Regular',
        fontSize: 11,
        fontWeight: '400',
        color: colors.pureWhite,
    },

    // BIB Search Results
    bibResultCardWrapper: {
        marginBottom: 16,
    },
    bibResultCard: {
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        padding: 16,
        backgroundColor: colors.whiteColor,
    },
    bibResultCardAiSearched: {
        borderColor: '#155DFC',
        borderWidth: 0.5,
    },
    bibResultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bibAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    bibResultInfo: {
        flex: 1,
    },
    bibResultNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bibResultName: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
    },
    bibTypeBadge: {
        backgroundColor: colors.btnBackgroundColor,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    bibTypeBadgeText: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    bibBibRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 2,
    },
    bibBibLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bibBibLabel: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    bibBibValue: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    bibDetailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 2,
    },
    bibDetailItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bibDetailText: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    bibCardFooter: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    bibViewDetailsButton: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primaryColor,
        height: 38,
        borderRadius: 8,
        paddingHorizontal: 16,
    },
    bibViewDetailsButtonText: {
        ...Fonts.regular14,
        color: colors.pureWhite,
    },
    bibAiSearchedBadge: {
        borderRadius: 6,
        width: 80,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bibAiSearchedText: {
        fontFamily: 'Inter-Regular',
        fontSize: 11,
        fontWeight: '400',
        color: colors.pureWhite,
    },
});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
