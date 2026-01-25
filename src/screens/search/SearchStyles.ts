import { StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";

const Styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.whiteColor
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
        backgroundColor: '#F7FAFF',
        borderWidth: 0.5,
        borderColor: '#E0ECFE',
        borderRadius: 10,
        paddingHorizontal: 16,
        height: 54,
    },
    searchInput: {
        flex: 1,
        ...Fonts.regular14,
        color: Colors.mainTextColor,
    },
    filterButton: {
        width: 54,
        height: 54,
        borderRadius: 10,
        backgroundColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    aiButton: {
        width: 54,
        height: 54,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
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
        backgroundColor: '#F5F5F5',
        marginRight: 8,
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

    // Active Filter Chips
    activeChipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    activeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primaryColor,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        height: 32,
    },
    activeChipText: {
        ...Fonts.regular12,
        color: Colors.whiteColor,
        marginRight: 4,
    },
    timeRangeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.whiteColor,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        height: 32,
    },
    timeRangeText: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },

    // Results Header
    resultsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    resultsTitle: {
        ...Fonts.medium18,
        color: Colors.mainTextColor,
    },
    resultsBadge: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    resultsBadgeText: {
        ...Fonts.regular14,
        color: '#9B9F9F',
    },

    // Event Card
    eventCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        borderRadius: 10,
        backgroundColor: Colors.whiteColor,
        marginBottom: 12,
    },
    eventIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.secondaryBlueColor,
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
        color: Colors.mainTextColor,
        flex: 1,
    },
    competitionBadge: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        marginLeft: 8,
    },
    competitionBadgeText: {
        ...Fonts.regular12,
        color: '#9B9F9F',
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
        color: '#9B9F9F',
    },

    // User Card
    userCard: {
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        borderRadius: 10,
        backgroundColor: Colors.whiteColor,
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
        color: Colors.mainTextColor,
    },
    userTypeBadge: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    userTypeText: {
        ...Fonts.regular12,
        color: '#9B9F9F',
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
        color: '#9B9F9F',
    },
    followBtn: {
        backgroundColor: Colors.primaryColor,
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
        color: Colors.whiteColor,
    },

    // Legacy styles (kept for compatibility)
    borderBox: {
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
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
        color: Colors.grayColor
    },
    separator: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGrayColor
    },
    filterCont: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: Colors.btnBackgroundColor,
        marginRight: 16
    },
    selectedFilterCont: {
        backgroundColor: Colors.primaryColor,
    },
    filterText: {
        ...Fonts.regular12,
        color: Colors.grayColor
    },
    selectedFilterText: {
        color: Colors.whiteColor
    },
    titleText: {
        ...Fonts.regular16,
        color: Colors.mainTextColor
    },
    iconContainer: {
        height: 40,
        width: 40,
        backgroundColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        overflow: 'hidden'
    },
    resultText: {
        ...Fonts.regular14,
        color: Colors.mainTextColor
    },
    dot: {
        height: 6,
        width: 6,
        borderRadius: 3,
        backgroundColor: Colors.grayColor
    },
    eventbtns: {
        paddingVertical: 8,
        paddingHorizontal: 9,
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
        borderRadius: 6
    },
    eventBtnText: {
        ...Fonts.regular14,
        color: Colors.subTextColor
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
        color: Colors.mainTextColor,
    },
    btnRight: {
        position: 'absolute',
        right: 16
    },

    // Face Saved Grid
    faceSavedContainer: {
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
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
        borderColor: Colors.primaryColor,
    },
    faceImageSelected: {
        borderWidth: 2,
        borderColor: Colors.primaryColor,
    },
    faceName: {
        ...Fonts.regular12,
        color: '#777777',
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
        backgroundColor: Colors.whiteColor,
        borderRadius: 16,
        padding: 24,
    },
    modalTitle: {
        ...Fonts.medium18,
        color: Colors.mainTextColor,
        textAlign: 'center',
    },
    modalInputContainer: {
        backgroundColor: '#F7FAFF',
        borderWidth: 0.5,
        borderColor: '#E0ECFE',
        borderRadius: 10,
        paddingHorizontal: 16,
        height: 54,
        justifyContent: 'center',
    },
    modalInput: {
        ...Fonts.regular14,
        color: Colors.mainTextColor,
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
        borderColor: '#DEDEDE',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalCancelText: {
        ...Fonts.medium14,
        color: '#9B9F9F',
    },
    modalSubmitButton: {
        flex: 1,
        height: 48,
        borderRadius: 10,
        backgroundColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalSubmitButtonDisabled: {
        backgroundColor: '#B0D4FF',
    },
    modalSubmitText: {
        ...Fonts.medium14,
        color: Colors.whiteColor,
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
        color: '#9B9F9F',
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
        borderColor: '#DEDEDE',
        borderRadius: 10,
        padding: 16,
        backgroundColor: Colors.whiteColor,
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
        color: '#171717',
    },
    contextTypeBadge: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    contextTypeBadgeText: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    contextBibRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    contextBibLabel: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    contextBibValue: {
        ...Fonts.regular12,
        color: '#9B9F9F',
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
        backgroundColor: Colors.primaryColor,
        height: 38,
        borderRadius: 8,
        paddingHorizontal: 16,
        gap: 6,
    },
    contextViewDetailsText: {
        ...Fonts.regular14,
        color: Colors.whiteColor,
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
        color: Colors.whiteColor,
    },

    // BIB Search Results
    bibResultCardWrapper: {
        marginBottom: 16,
    },
    bibResultCard: {
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        borderRadius: 10,
        padding: 16,
        backgroundColor: Colors.whiteColor,
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
        color: '#171717',
    },
    bibTypeBadge: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    bibTypeBadgeText: {
        ...Fonts.regular12,
        color: '#9B9F9F',
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
        color: '#9B9F9F',
    },
    bibBibValue: {
        ...Fonts.regular12,
        color: '#9B9F9F',
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
        color: '#9B9F9F',
    },
    bibCardFooter: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    bibViewDetailsButton: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primaryColor,
        height: 38,
        borderRadius: 8,
        paddingHorizontal: 16,
    },
    bibViewDetailsButtonText: {
        ...Fonts.regular14,
        color: Colors.whiteColor,
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
        color: Colors.whiteColor,
    },
});

export default Styles;
