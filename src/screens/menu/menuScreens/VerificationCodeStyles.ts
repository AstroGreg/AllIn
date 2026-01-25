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
        paddingVertical: 10,
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
    headerTitle: {
        ...Fonts.medium18,
        color: Colors.mainTextColor,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    titleSection: {
        alignItems: 'center',
    },
    title: {
        ...Fonts.semibold24,
        color: Colors.mainTextColor,
        lineHeight: 32,
        textAlign: 'center',
    },
    description: {
        ...Fonts.regular14,
        color: '#9B9F9F',
        lineHeight: 22,
        textAlign: 'center',
    },
    codeInputContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    codeInput: {
        width: 50,
        height: 56,
        borderRadius: 10,
        backgroundColor: '#F7FAFF',
        textAlign: 'center',
        ...Fonts.semibold24,
        color: Colors.mainTextColor,
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    timerText: {
        ...Fonts.regular14,
        color: '#9B9F9F',
    },
    bottomContainer: {
        paddingHorizontal: 20,
        paddingTop: 16,
        backgroundColor: Colors.whiteColor,
        alignItems: 'center',
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 54,
        backgroundColor: Colors.primaryColor,
        borderRadius: 10,
        width: '100%',
    },
    primaryButtonText: {
        ...Fonts.medium16,
        color: Colors.whiteColor,
    },
    linkTextBlue: {
        ...Fonts.regular14,
        color: Colors.primaryColor,
        textAlign: 'center',
    },
    linkTextGray: {
        ...Fonts.regular14,
        color: '#9B9F9F',
        textAlign: 'center',
    },
});

export default styles;
