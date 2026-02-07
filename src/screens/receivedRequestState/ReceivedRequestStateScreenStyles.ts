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
    sectionTitle: {
        ...Fonts.medium16,
        fontSize: 18,
        color: Colors.mainTextColor,
    },
    summaryCard: {
        backgroundColor: Colors.whiteColor,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        borderRadius: 10,
        padding: 16,
        gap: 6,
    },
    summaryTitle: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
    },
    summaryMeta: {
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
    inputLabel: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
    },
    textAreaContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#F7FAFF',
        borderWidth: 0.5,
        borderColor: '#E0ECFE',
        borderRadius: 10,
        height: 180,
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 6,
    },
    textArea: {
        flex: 1,
        ...Fonts.regular14,
        color: Colors.mainTextColor,
        height: '100%',
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statusOption: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.whiteColor,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        borderRadius: 6,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    statusText: {
        ...Fonts.regular14,
        color: Colors.mainTextColor,
    },
    checkbox: {
        width: 16,
        height: 16,
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: '#3C82F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        borderWidth: 0,
    },
    bottomActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cancelButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 44,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        borderRadius: 6,
        gap: 6,
        marginRight: 8,
    },
    cancelButtonText: {
        ...Fonts.regular14,
        color: '#9B9F9F',
    },
    updateButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 44,
        backgroundColor: Colors.primaryColor,
        borderRadius: 8,
        gap: 6,
        marginLeft: 8,
    },
    updateButtonText: {
        ...Fonts.regular14,
        color: Colors.whiteColor,
    },
});

export default Styles;
