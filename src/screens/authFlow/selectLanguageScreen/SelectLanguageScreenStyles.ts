import { StyleSheet } from 'react-native';
import Colors from '../../../constants/Colors';
import Fonts from '../../../constants/Fonts';

const Styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.whiteColor,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    headerContainer: {
        alignItems: 'center',
    },
    headingText: {
        ...Fonts.medium22,
        fontSize: 24,
        lineHeight: 32,
        color: Colors.mainTextColor,
        textAlign: 'center',
    },
    subHeadingText: {
        ...Fonts.regular14,
        lineHeight: 22,
        color: '#9B9F9F',
        textAlign: 'center',
    },
    languageListContainer: {
        width: '100%',
    },
    languageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
        borderRadius: 10,
        backgroundColor: Colors.whiteColor,
    },
    languageInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    flagContainer: {
        width: 60,
        height: 60,
        borderRadius: 6,
        overflow: 'hidden',
    },
    flagImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    languageName: {
        ...Fonts.medium18,
        lineHeight: 26,
        color: Colors.mainTextColor,
    },
    languageNameUnselected: {
        color: '#9B9F9F',
    },
    radioOuter: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
    },
    radioOuterSelected: {
        borderWidth: 1,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.primaryColor,
    },
});

export default Styles;
