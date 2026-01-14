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
        width: 190,
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
    cardContainer: {
        backgroundColor: Colors.whiteColor,
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
        borderRadius: 10,
        padding: 16,
        gap: 20,
    },
    eventItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: Colors.lightGrayColor,
        backgroundColor: '#F5F5F5',
    },
    eventItemSelected: {
        backgroundColor: 'rgba(60, 130, 246, 0.14)',
        borderColor: Colors.primaryColor,
    },
    eventItemDisabled: {
        backgroundColor: '#F5F5F5',
    },
    eventInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    eventIcon: {
        width: 22,
        height: 22,
    },
    eventName: {
        ...Fonts.regular14,
        lineHeight: 22,
        color: '#9B9F9F',
        flex: 1,
    },
    eventNameSelected: {
        color: Colors.mainTextColor,
    },
    eventNameDisabled: {
        color: '#9B9F9F',
    },
    lockIcon: {
        width: 16,
        height: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 16,
        marginTop: 'auto',
        paddingTop: 40,
    },
    backButton: {
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
    backButtonText: {
        ...Fonts.medium16,
        lineHeight: 24,
        color: '#9B9F9F',
    },
    nextButton: {
        flex: 1,
        height: 54,
        borderRadius: 10,
        backgroundColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    nextButtonText: {
        ...Fonts.medium16,
        lineHeight: 24,
        color: Colors.whiteColor,
    },
});

export default Styles;
