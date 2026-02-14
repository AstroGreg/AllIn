import { StyleSheet } from 'react-native';
import { ThemeColors, lightColors } from '../../constants/Theme';
import Fonts from '../../constants/Fonts';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.whiteColor,
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
    headerTitle: {
        ...Fonts.medium18,
        color: colors.mainTextColor,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },

    // Section Header
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sectionTitle: {
        ...Fonts.medium18,
        color: colors.mainTextColor,
    },
    eventsBadge: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    eventsBadgeText: {
        ...Fonts.regular14,
        color: '#9B9F9F',
    },

    // Events List
    eventsListContainer: {
        marginTop: 16,
        gap: 24,
    },

    // Event Card
    eventCard: {
        backgroundColor: colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        padding: 16,
    },
    eventCardContent: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    eventImageContainer: {
        width: 86,
        height: 86,
        borderRadius: 10,
        overflow: 'hidden',
    },
    eventImage: {
        width: '100%',
        height: '100%',
    },
    eventDetails: {
        flex: 1,
        gap: 6,
    },
    eventTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    eventTitleIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    eventTitle: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
    },
    eventInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    eventInfoLabel: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    eventInfoValue: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    eventInfoValueText: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    eventDivider: {
        height: 1,
        backgroundColor: '#DEDEDE',
        marginTop: 10,
    },
    eventActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    eventActionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    eventActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        borderRadius: 6,
        paddingHorizontal: 16,
        paddingVertical: 10,
        height: 38,
    },
    eventActionButtonText: {
        ...Fonts.regular14,
        color: '#9B9F9F',
    },
    eventEditButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colors.primaryColor,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        height: 38,
    },
    eventEditButtonText: {
        ...Fonts.regular14,
        color: colors.whiteColor,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: colors.whiteColor,
        borderRadius: 16,
        padding: 24,
        width: '85%',
        maxWidth: 340,
    },
    modalCloseButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1,
    },
    modalOptionsContainer: {
        marginTop: 16,
        gap: 12,
    },
    modalOptionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#DEDEDE',
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    modalOptionText: {
        ...Fonts.medium16,
        color: colors.mainTextColor,
    },
    modalAddButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: colors.primaryColor,
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 16,
        marginTop: 8,
    },
    modalAddButtonText: {
        ...Fonts.medium16,
        color: colors.whiteColor,
    },
});

const Styles = createStyles(lightColors);

export default Styles;
