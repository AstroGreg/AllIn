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
        paddingTop: 16,
    },
    instructionText: {
        ...Fonts.regular14,
        color: '#777777',
        textAlign: 'center',
    },
    capturedImage: {
        width: '100%',
        height: '100%',
    },
    cameraPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E8E8E8',
    },
    tapToCapture: {
        ...Fonts.regular14,
        color: '#777777',
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    outlineButton: {
        width: 120,
        height: 54,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        alignItems: 'center',
        justifyContent: 'center',
    },
    outlineButtonDisabled: {
        borderColor: '#E8E8E8',
    },
    outlineButtonText: {
        ...Fonts.medium16,
        color: '#9B9F9F',
    },
    outlineButtonTextDisabled: {
        color: '#D0D0D0',
    },
    cameraButton: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default styles;
