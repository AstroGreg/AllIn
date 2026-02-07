import { StyleSheet } from 'react-native';
import Colors from '../../../constants/Colors';
import Fonts from '../../../constants/Fonts';

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.whiteColor,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 0.3,
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
        color: Colors.mainTextColor,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    competitionName: {
        ...Fonts.medium18,
        color: Colors.mainTextColor,
    },
    competitionDescription: {
        ...Fonts.regular14,
        color: '#9B9F9F',
    },
    tabsContainer: {
        flexDirection: 'row',
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        borderRadius: 10,
        padding: 8,
        gap: 8,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        height: 39,
        gap: 8,
        backgroundColor: 'transparent',
        borderRadius: 8,
    },
    tabActive: {
        backgroundColor: 'rgba(60, 130, 246, 0.3)',
    },
    tabText: {
        ...Fonts.regular14,
        color: '#9B9F9F',
    },
    tabTextActive: {
        color: Colors.mainTextColor,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sectionTitle: {
        ...Fonts.medium16,
        color: Colors.mainTextColor,
    },
    sectionIcons: {
        flexDirection: 'row',
    },
    sectionIconButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    eventCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        borderRadius: 10,
        backgroundColor: Colors.whiteColor,
        marginBottom: 12,
    },
    eventCardName: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
    },
    eventCardRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    badge: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgeText: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    showAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 54,
        borderRadius: 10,
        backgroundColor: Colors.primaryColor,
        gap: 8,
    },
    showAllButtonText: {
        ...Fonts.medium16,
        color: Colors.whiteColor,
    },
    showAllPhotosButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 54,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.primaryColor,
        backgroundColor: Colors.whiteColor,
        gap: 8,
    },
    showAllPhotosButtonText: {
        ...Fonts.medium16,
        color: Colors.primaryColor,
    },
});

export default styles;
