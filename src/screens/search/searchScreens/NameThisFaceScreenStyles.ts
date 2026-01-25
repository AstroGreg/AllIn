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
        paddingTop: 24,
    },
    sectionTitle: {
        ...Fonts.medium16,
        color: Colors.mainTextColor,
    },
    capturedViewsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    capturedImageContainer: {
        width: 60,
        height: 60,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.primaryColor,
        overflow: 'hidden',
    },
    capturedImage: {
        width: '100%',
        height: '100%',
    },
    inputLabel: {
        ...Fonts.regular14,
        color: Colors.mainTextColor,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7FAFF',
        borderWidth: 0.5,
        borderColor: '#E0ECFE',
        borderRadius: 10,
        paddingHorizontal: 16,
        height: 54,
    },
    textInput: {
        flex: 1,
        ...Fonts.regular14,
        color: Colors.mainTextColor,
    },
    bottomContainer: {
        paddingHorizontal: 20,
    },
    saveButton: {
        height: 54,
        borderRadius: 10,
        backgroundColor: Colors.primaryColor,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    saveButtonDisabled: {
        backgroundColor: '#B0D4FF',
    },
    saveButtonText: {
        ...Fonts.medium16,
        color: Colors.whiteColor,
    },
});

export default styles;
