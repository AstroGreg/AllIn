import { StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';
import Fonts from '../../constants/Fonts';

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
        paddingVertical: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: Colors.lightGrayColor,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.btnBackgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...Fonts.medium16,
        fontSize: 18,
        color: Colors.mainTextColor,
    },
    notificationButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.btnBackgroundColor,
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
        color: Colors.mainTextColor,
    },
    viewAllText: {
        ...Fonts.regular14,
        color: '#9B9F9F',
    },
    notificationsList: {
        gap: 24,
    },
    notificationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.whiteColor,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
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
        backgroundColor: 'rgba(60, 130, 246, 0.14)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationContent: {
        flex: 1,
        gap: 4,
    },
    notificationTitle: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
    },
    notificationDescription: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    notificationRight: {
        alignItems: 'center',
        gap: 6,
        width: 64,
    },
    newBadge: {
        backgroundColor: Colors.primaryColor,
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    newBadgeText: {
        fontFamily: 'Inter-Regular',
        fontSize: 10,
        lineHeight: 18,
        color: Colors.whiteColor,
    },
    dateText: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    detailsLink: {
        fontFamily: 'Inter-Regular',
        fontSize: 10,
        lineHeight: 18,
        color: '#9B9F9F',
        textDecorationLine: 'underline',
        textAlign: 'center',
    },
});

export default Styles;
