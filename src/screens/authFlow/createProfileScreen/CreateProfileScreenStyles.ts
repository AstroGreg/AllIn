import { StyleSheet } from 'react-native';
import Colors from '../../../constants/Colors';
import Fonts from '../../../constants/Fonts';

const Styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.whiteColor,
    },
    imageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerImage: {
        width: 163,
        height: 155,
    },
    contentContainer: {
        paddingHorizontal: 20,
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
});

export default Styles;
