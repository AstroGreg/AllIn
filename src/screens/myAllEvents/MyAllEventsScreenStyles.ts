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
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
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
    myEventCard: {
        backgroundColor: Colors.whiteColor,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
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
        color: Colors.mainTextColor,
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
        color: '#9B9F9F',
    },
    detailValue: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailText: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    primaryButton: {
        backgroundColor: Colors.primaryColor,
        borderRadius: 10,
        height: 54,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    primaryButtonText: {
        ...Fonts.medium16,
        color: Colors.whiteColor,
        marginRight: 8,
    },
});

export default Styles;
