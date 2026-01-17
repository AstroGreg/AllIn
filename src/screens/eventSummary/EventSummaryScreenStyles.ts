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
        paddingVertical: 16,
    },
    backButton: {
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
    notificationButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        paddingHorizontal: 20,
        flexGrow: 1,
    },
    sectionTitle: {
        ...Fonts.medium18,
        color: Colors.mainTextColor,
    },
    detailsCard: {
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        padding: 16,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        gap: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    detailLabel: {
        ...Fonts.regular14,
        color: '#9B9F9F',
    },
    detailValue: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
    },
    divider: {
        height: 1,
        backgroundColor: '#DEDEDE',
    },
    eventChipsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    eventChip: {
        backgroundColor: '#EBEBEB',
        borderRadius: 6,
        paddingHorizontal: 10,
        height: 32,
        width: 70,
        alignItems: 'center',
        justifyContent: 'center',
    },
    eventChipText: {
        ...Fonts.regular12,
        color: '#777777',
    },
    bottomButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
    },
    cancelButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        height: 54,
        gap: 8,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
    },
    cancelButtonText: {
        ...Fonts.medium16,
        color: '#9B9F9F',
    },
    confirmButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primaryColor,
        borderRadius: 10,
        height: 54,
        gap: 8,
    },
    confirmButtonText: {
        ...Fonts.medium16,
        color: Colors.whiteColor,
    },
});

export default Styles;
