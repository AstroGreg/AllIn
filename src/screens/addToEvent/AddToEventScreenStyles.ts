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
    eventDetailsCard: {
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
    descriptionText: {
        ...Fonts.regular13,
        color: '#9B9F9F',
        lineHeight: 20,
    },
    inputLabel: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
    },
    inputLabelBold: {
        ...Fonts.semibold14,
        color: Colors.mainTextColor,
    },
    eventsInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F7FAFF',
        borderRadius: 10,
        paddingHorizontal: 16,
        height: 54,
        borderWidth: 0.5,
        borderColor: '#E0ECFE',
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
    chestNumberInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7FAFF',
        borderRadius: 10,
        paddingHorizontal: 16,
        height: 54,
        borderWidth: 0.5,
        borderColor: '#E0ECFE',
        gap: 10,
    },
    textInput: {
        flex: 1,
        ...Fonts.regular14,
        color: Colors.mainTextColor,
        padding: 0,
    },
    bottomContainer: {
        paddingHorizontal: 20,
    },
    confirmButton: {
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
