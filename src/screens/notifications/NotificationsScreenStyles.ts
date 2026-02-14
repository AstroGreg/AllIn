import { StyleSheet } from 'react-native';
import Fonts from '../../constants/Fonts';
import { ThemeColors, lightColors } from '../../constants/Theme';

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
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sectionTitle: {
        ...Fonts.medium16,
        fontSize: 18,
        color: colors.mainTextColor,
    },
    viewAllText: {
        ...Fonts.regular14,
        color: colors.subTextColor,
    },
    notificationsList: {
        gap: 24,
    },
    notificationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.cardBackground,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        padding: 16,
        minHeight: 78,
    },
    notificationLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 6,
        backgroundColor: colors.secondaryBlueColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationContent: {
        flex: 1,
        gap: 4,
    },
    notificationTitle: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
    },
    notificationDescription: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    notificationRight: {
        alignItems: 'center',
        gap: 6,
        width: 70,
    },
    newBadge: {
        backgroundColor: colors.secondaryBlueColor,
        borderRadius: 4,
        paddingHorizontal: 18,
        paddingVertical: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    newBadgeText: {
        fontFamily: 'Inter-Regular',
        fontSize: 10,
        lineHeight: 18,
        color: colors.primaryColor,
    },
    dateText: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    detailsLink: {
        fontFamily: 'Inter-Regular',
        fontSize: 10,
        lineHeight: 18,
        color: colors.primaryColor,
        textDecorationLine: 'underline',
        textAlign: 'center',
    },
});

const Styles = createStyles(lightColors);
export default Styles;
