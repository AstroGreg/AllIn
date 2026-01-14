import { StyleSheet } from 'react-native';
import Colors from '../../../constants/Colors';
import Fonts from '../../../constants/Fonts';

const Styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.whiteColor,
    },
    scrollContent: {
        flexGrow: 1,
    },
    imageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerImage: {
        width: 235.3,
        height: 141.59,
    },
    contentContainer: {
        paddingHorizontal: 20,
        flex: 1,
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
    formContainer: {
        gap: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 16,
        marginTop: 'auto',
        paddingTop: 40,
    },
    skipButton: {
        flex: 1,
        height: 54,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    skipButtonText: {
        ...Fonts.medium16,
        lineHeight: 24,
        color: '#9B9F9F',
    },
    finishButton: {
        flex: 1,
        height: 54,
        borderRadius: 10,
        backgroundColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    finishButtonText: {
        ...Fonts.medium16,
        lineHeight: 24,
        color: Colors.whiteColor,
    },
});

export default Styles;
