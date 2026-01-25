import { StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';
import Fonts from '../../constants/Fonts';

const Styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(17, 17, 17, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: Colors.whiteColor,
        borderRadius: 16,
        padding: 16,
        width: '90%',
        maxWidth: 390,
    },
    closeButton: {
        alignSelf: 'flex-end',
    },
    inputContainer: {
        marginTop: 8,
        width: '100%',
    },
    inputLabel: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
        marginBottom: 8,
    },
    selectInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F7FAFF',
        borderWidth: 0.5,
        borderColor: '#E0ECFE',
        borderRadius: 10,
        paddingHorizontal: 16,
        height: 54,
    },
    selectInputContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    selectInputText: {
        ...Fonts.regular14,
        color: '#777777',
    },
    buttonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 16,
        gap: 16,
    },
    addMoreButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        borderRadius: 10,
        height: 54,
        gap: 8,
    },
    addMoreButtonText: {
        ...Fonts.medium16,
        color: '#9B9F9F',
    },
    saveButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primaryColor,
        borderRadius: 10,
        height: 54,
        gap: 8,
    },
    saveButtonText: {
        ...Fonts.medium16,
        color: Colors.whiteColor,
    },
});

export default Styles;
