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

    // Shared card styles
    appearanceCard: {
        backgroundColor: Colors.whiteColor,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
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
    cardRow: {
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
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    playIconCircle: {
        width: 20,
        height: 20,
        borderRadius: 12,
        backgroundColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 6,
    },
    cardTitle: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
    },
    eventTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
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
    divider: {
        height: 0.5,
        backgroundColor: '#DEDEDE',
        marginVertical: 12,
    },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primaryColor,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        alignSelf: 'flex-start',
        height: 36,
    },
    viewButtonText: {
        ...Fonts.regular14,
        color: Colors.whiteColor,
        marginRight: 6,
    },

    // Primary Button
    primaryButton: {
        backgroundColor: Colors.primaryColor,
        borderRadius: 10,
        height: 54,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    primaryButtonText: {
        ...Fonts.medium16,
        color: Colors.whiteColor,
        marginRight: 8,
    },

    // Downloads Section
    downloadsCard: {
        backgroundColor: Colors.whiteColor,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        borderRadius: 10,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    downloadsInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    downloadsText: {
        ...Fonts.regular14,
        color: Colors.mainTextColor,
        marginLeft: 10,
    },
    downloadsNumber: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.mainTextColor,
    },
    detailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.whiteColor,
        borderWidth: 1,
        borderColor: '#DEDEDE',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    detailsButtonText: {
        ...Fonts.regular14,
        color: Colors.subTextColor,
        marginRight: 4,
    },

    // Created Events Card with Badge
    createdEventCard: {
        backgroundColor: Colors.whiteColor,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 16,
    },
    requestBadge: {
        backgroundColor: '#FFF7E3',
        paddingHorizontal: 12,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    requestBadgeSmall: {
        backgroundColor: '#FFF7E3',
        paddingHorizontal: 6,
        paddingVertical: 6,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    requestBadgeText: {
        ...Fonts.regular12,
        color: '#777777',
        marginLeft: 4,
    },
    createdEventContent: {
        padding: 16,
        flexDirection: 'row',
    },

    // Video Card - Horizontal layout
    videoCard: {
        backgroundColor: Colors.whiteColor,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        borderRadius: 10,
        padding: 16,
        flexDirection: 'row',
        marginBottom: 16,
    },
    videoThumbnailWrapper: {
        width: 109,
        height: 140,
        borderRadius: 6,
        overflow: 'hidden',
        position: 'relative',
    },
    videoThumbnail: {
        width: '100%',
        height: '100%',
    },
    videoPlayButton: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -20,
        marginLeft: -20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E0ECFE',
        alignItems: 'center',
        justifyContent: 'center',
    },
    videoInfo: {
        flex: 1,
        marginLeft: 12,
    },
    videoTitle: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
        marginBottom: 8,
    },
    videoMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    videoMetaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    videoMetaDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#9B9F9F',
        marginHorizontal: 8,
    },
    downloadButton: {
        backgroundColor: Colors.primaryColor,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        height: 38,
    },
    downloadButtonText: {
        ...Fonts.regular14,
        color: Colors.whiteColor,
        marginRight: 6,
    },
});

export default Styles;
