import { StyleSheet } from 'react-native';
import { ThemeColors, lightColors } from '../../constants/Theme';
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
        paddingVertical: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.lightGrayColor,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.btnBackgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...Fonts.medium16,
        fontSize: 18,
        color: colors.mainTextColor,
    },
    notificationButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.btnBackgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 100,
    },
    eventContainer: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        overflow: 'hidden',
    },
    eventThumbnail: {
        width: '100%',
        height: '100%',
    },
    eventInfo: {
        marginTop: 14,
        gap: 8,
    },
    eventInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    eventTitle: {
        ...Fonts.medium16,
        color: colors.mainTextColor,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationText: {
        ...Fonts.regular14,
        color: colors.subTextColor,
    },
    participantsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    participantsText: {
        ...Fonts.regular14,
        color: colors.subTextColor,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dateText: {
        ...Fonts.regular14,
        color: colors.subTextColor,
    },
    sectionTitle: {
        ...Fonts.medium16,
        fontSize: 18,
        color: colors.mainTextColor,
        marginTop: 16,
    },
    receivedLabel: {
        backgroundColor: '#F7FAFF',
        borderWidth: 0.5,
        borderColor: '#DAE8FF',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    receivedText: {
        ...Fonts.regular14,
        color: colors.subTextColor,
    },
    editRequestsGrid: {
        gap: 16,
    },
    editRequestsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    editRequestCard: {
        width: '48%',
        backgroundColor: colors.backgroundColor,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        padding: 16,
        gap: 8,
    },
    editRequestHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    receiptIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 6,
        backgroundColor: '#E0ECFE',
        alignItems: 'center',
        justifyContent: 'center',
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    editButtonText: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    editRequestContent: {
        gap: 6,
    },
    editRequestTitle: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
    },
    editRequestMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    fixedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        backgroundColor: '#E4FFEE',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 4,
        alignSelf: 'flex-start',
    },
    fixedBadgeText: {
        ...Fonts.regular12,
        color: '#00BD48',
    },
    pendingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        backgroundColor: '#FFEDDB',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 4,
        alignSelf: 'flex-start',
    },
    pendingBadgeText: {
        ...Fonts.regular12,
        color: '#FF8000',
    },
    primaryButton: {
        backgroundColor: colors.primaryColor,
        borderRadius: 10,
        height: 54,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    primaryButtonText: {
        ...Fonts.medium16,
        color: colors.whiteColor,
    },
});

const Styles = createStyles(lightColors);
export default Styles;
