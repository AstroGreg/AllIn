import { StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';
import Fonts from '../../constants/Fonts';

const Styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.whiteColor,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        alignItems: 'center',
        width: '100%',
    },
    title: {
        ...Fonts.semibold24,
        color: Colors.mainTextColor,
        textAlign: 'center',
    },
    subtitle: {
        ...Fonts.regular16,
        color: '#9B9F9F',
        textAlign: 'center',
    },
    backHomeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primaryColor,
        borderRadius: 10,
        height: 54,
        width: '100%',
        gap: 8,
    },
    backHomeButtonText: {
        ...Fonts.medium16,
        color: Colors.whiteColor,
    },
});

export default Styles;
