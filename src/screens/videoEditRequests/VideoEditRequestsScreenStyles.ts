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
        marginTop: -28,
        marginLeft: -28,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(0,0,0,0.25)',
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
    emptyStateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    emptyStateText: {
        ...Fonts.medium16,
        fontSize: 20,
        color: Colors.mainTextColor,
        textAlign: 'center',
    },
});

export default Styles;
