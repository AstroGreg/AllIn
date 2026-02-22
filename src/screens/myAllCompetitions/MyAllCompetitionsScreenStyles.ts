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
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
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
    myEventCard: {
        backgroundColor: colors.backgroundColor,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
    },
    squareThumbnail: {
        width: 86,
        height: 86,
        borderRadius: 10,
    },
    cardInfo: {
        flex: 1,
        marginLeft: 12,
    },
    eventTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    cardTitle: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
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
        marginBottom: 6,
    },
    detailLabel: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    detailValue: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailText: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    primaryButton: {
        backgroundColor: colors.primaryColor,
        borderRadius: 10,
        height: 54,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    primaryButtonText: {
        ...Fonts.medium16,
        color: colors.whiteColor,
        marginRight: 8,
    },
});

const Styles = createStyles(lightColors);
export default Styles;
