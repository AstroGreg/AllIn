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
    titleSection: {},
    title: {
        ...Fonts.semibold24,
        color: Colors.mainTextColor,
        lineHeight: 32,
    },
    description: {
        ...Fonts.regular14,
        color: '#9B9F9F',
        lineHeight: 22,
    },
    optionsContainer: {},
    optionCard: {
        backgroundColor: Colors.whiteColor,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        borderRadius: 10,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
    },
    optionIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E0ECFE',
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionContent: {
        flex: 1,
        gap: 4,
    },
    optionTitle: {
        ...Fonts.medium16,
        color: Colors.mainTextColor,
    },
    optionDescription: {
        ...Fonts.regular12,
        color: '#9B9F9F',
        lineHeight: 20,
    },
    radioContainer: {
        marginTop: 2,
    },
    radioUnselected: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#DEDEDE',
    },
    radioSelected: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.primaryColor,
    },
    bottomContainer: {
        paddingHorizontal: 20,
        paddingTop: 16,
        backgroundColor: Colors.whiteColor,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 54,
        backgroundColor: Colors.primaryColor,
        borderRadius: 10,
    },
    primaryButtonText: {
        ...Fonts.medium16,
        color: Colors.whiteColor,
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 54,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        borderRadius: 10,
    },
    secondaryButtonText: {
        ...Fonts.medium16,
        color: '#9B9F9F',
    },
});

export default styles;
