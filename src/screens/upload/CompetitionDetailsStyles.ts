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
    uploadNotice: {
        backgroundColor: colors.secondaryBlueColor,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.primaryColor,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginBottom: 16,
    },
    uploadNoticeText: {
        ...Fonts.medium12,
        color: colors.primaryColor,
    },
    infoCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        padding: 16,
    },
    infoTitle: {
        ...Fonts.medium16,
        color: colors.mainTextColor,
        marginBottom: 6,
    },
    infoSub: {
        ...Fonts.medium14,
        color: colors.grayColor,
    },
    infoMeta: {
        ...Fonts.regular12,
        color: colors.grayColor,
        marginTop: 6,
    },
    mapCard: {
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        backgroundColor: colors.cardBackground,
        height: 150,
    },
    mapImage: {
        width: '100%',
        height: '100%',
    },
    mapOverlay: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        backgroundColor: 'rgba(3,4,9,0.6)',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    mapTitle: {
        ...Fonts.medium12,
        color: colors.pureWhite,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: colors.btnBackgroundColor,
        borderRadius: 10,
        padding: 4,
    },
    toggleTab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
    toggleTabActive: {
        backgroundColor: colors.primaryColor,
    },
    toggleTabText: {
        ...Fonts.medium14,
        color: colors.grayColor,
    },
    toggleTabTextActive: {
        color: colors.pureWhite,
    },
    sectionTitle: {
        ...Fonts.medium18,
        color: colors.mainTextColor,
    },
    eventCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.cardBackground,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 10,
    },
    eventCardActive: {
        borderColor: colors.primaryColor,
        backgroundColor: colors.secondaryBlueColor,
    },
    eventText: {
        flex: 1,
        marginRight: 12,
    },
    eventName: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
    },
    eventMeta: {
        ...Fonts.regular12,
        color: colors.grayColor,
        marginTop: 4,
    },
    eventMetaActive: {
        color: colors.primaryColor,
    },
    disciplineLoadingState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
    },
    disciplineLoadingText: {
        ...Fonts.regular12,
        color: colors.grayColor,
    },
    disciplineEmptyState: {
        backgroundColor: colors.cardBackground,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    disciplineEmptyTitle: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
    },
    disciplineEmptySubtitle: {
        ...Fonts.regular12,
        color: colors.grayColor,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        padding: 20,
    },
    modalCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 16,
        padding: 18,
    },
    modalTitle: {
        ...Fonts.medium16,
        color: colors.mainTextColor,
    },
    modalSubtitle: {
        ...Fonts.regular12,
        color: colors.grayColor,
        marginTop: 4,
        marginBottom: 12,
    },
    modalSection: {
        marginBottom: 12,
    },
    modalLabel: {
        ...Fonts.medium12,
        color: colors.mainTextColor,
        marginBottom: 8,
    },
    choiceRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    choiceChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.lightGrayColor,
        backgroundColor: colors.btnBackgroundColor,
    },
    choiceChipActive: {
        backgroundColor: colors.primaryColor,
        borderColor: colors.primaryColor,
    },
    choiceChipText: {
        ...Fonts.regular12,
        color: colors.grayColor,
    },
    choiceChipTextActive: {
        color: colors.pureWhite,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    modalGhost: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        alignItems: 'center',
        paddingVertical: 12,
    },
    modalGhostText: {
        ...Fonts.medium14,
        color: colors.grayColor,
    },
    modalPrimary: {
        flex: 1,
        backgroundColor: colors.primaryColor,
        borderRadius: 10,
        alignItems: 'center',
        paddingVertical: 12,
    },
    modalPrimaryDisabled: {
        opacity: 0.4,
    },
    modalPrimaryText: {
        ...Fonts.medium14,
        color: colors.pureWhite,
    },
});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
