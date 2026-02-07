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
        borderBottomWidth: 0.5,
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
    headerButtonPlaceholder: {
        width: 44,
        height: 44,
    },
    headerTitle: {
        ...Fonts.medium18,
        color: Colors.mainTextColor,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    sectionTitle: {
        ...Fonts.medium18,
        color: Colors.mainTextColor,
        marginBottom: 16,
    },

    // Input Group
    inputGroup: {
        marginBottom: 24,
    },
    inputLabel: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
    },
    inputContainer: {
        height: 54,
        backgroundColor: '#F7FAFF',
        borderWidth: 0.5,
        borderColor: '#E0ECFE',
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    textInput: {
        flex: 1,
        ...Fonts.regular14,
        color: Colors.mainTextColor,
    },
    placeholderText: {
        color: '#777777',
    },

    // Upload Container
    uploadContainer: {
        backgroundColor: '#F7FAFF',
        borderWidth: 1,
        borderColor: Colors.primaryColor,
        borderStyle: 'dashed',
        borderRadius: 10,
        paddingVertical: 32,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadText: {
        ...Fonts.regular14,
        color: '#777777',
    },
    uploadOrText: {
        ...Fonts.regular14,
        color: '#777777',
        marginVertical: 4,
    },
    browseFilesText: {
        ...Fonts.medium14,
        color: Colors.primaryColor,
    },

    // Bottom Container
    bottomContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 16,
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        height: 54,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    cancelButtonText: {
        ...Fonts.medium16,
        color: '#9B9F9F',
    },
    saveButton: {
        flex: 1,
        height: 54,
        borderRadius: 10,
        backgroundColor: Colors.primaryColor,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        ...Fonts.medium16,
        color: Colors.whiteColor,
    },
});

export default Styles;
