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
    },
    inputContainer: {
        width: '100%',
    },
    inputLabel: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
    },
    uploadContainer: {
        backgroundColor: '#F7FAFF',
        borderWidth: 1,
        borderColor: Colors.primaryColor,
        borderStyle: 'dashed',
        borderRadius: 10,
        paddingVertical: 32,
        paddingHorizontal: 87,
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
    },
    browseButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    browseButtonText: {
        ...Fonts.medium14,
        color: Colors.primaryColor,
    },
    textInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7FAFF',
        borderWidth: 0.5,
        borderColor: '#E0ECFE',
        borderRadius: 10,
        paddingHorizontal: 16,
        height: 54,
        gap: 10,
    },
    textInput: {
        flex: 1,
        ...Fonts.regular14,
        color: Colors.mainTextColor,
        height: '100%',
    },
    textAreaContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#F7FAFF',
        borderWidth: 0.5,
        borderColor: '#E0ECFE',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 16,
        height: 180,
        gap: 6,
    },
    textArea: {
        flex: 1,
        ...Fonts.regular14,
        color: Colors.mainTextColor,
        height: '100%',
    },
    buttonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cancelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        borderRadius: 10,
        height: 54,
        width: '47%',
        gap: 8,
    },
    cancelButtonText: {
        ...Fonts.medium16,
        color: '#9B9F9F',
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primaryColor,
        borderRadius: 10,
        height: 54,
        width: '47%',
        gap: 8,
    },
    createButtonText: {
        ...Fonts.medium16,
        color: Colors.whiteColor,
    },
});

export default Styles;
