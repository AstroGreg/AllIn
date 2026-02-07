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
    videoContainer: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        overflow: 'hidden',
        position: 'relative',
    },
    videoPlayer: {
        width: '100%',
        height: '100%',
    },
    playButtonOverlay: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -30,
        marginLeft: -30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    videoInfo: {
        marginTop: 14,
        gap: 8,
    },
    videoInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    videoTitle: {
        ...Fonts.medium16,
        color: Colors.mainTextColor,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationText: {
        ...Fonts.regular14,
        color: '#9B9F9F',
    },
    durationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    durationText: {
        ...Fonts.regular14,
        color: '#9B9F9F',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dateText: {
        ...Fonts.regular14,
        color: '#9B9F9F',
    },
    sectionTitle: {
        ...Fonts.medium16,
        fontSize: 18,
        color: Colors.mainTextColor,
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
        color: '#9B9F9F',
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
        backgroundColor: Colors.whiteColor,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
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
        color: '#9B9F9F',
    },
    editRequestContent: {
        gap: 6,
    },
    editRequestTitle: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
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
        color: '#9B9F9F',
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
        backgroundColor: Colors.primaryColor,
        borderRadius: 10,
        height: 54,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    primaryButtonText: {
        ...Fonts.medium16,
        color: Colors.whiteColor,
    },
});

export default Styles;
