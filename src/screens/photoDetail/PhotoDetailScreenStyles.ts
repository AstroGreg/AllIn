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
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
    },
    placeholder: {
        width: 44,
        height: 44,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    questionCard: {
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        paddingHorizontal: 16,
        paddingVertical: 12,
        height: 115,
        alignItems: 'center',
        justifyContent: 'center',
    },
    questionText: {
        ...Fonts.regular14,
        color: '#9B9F9F',
        textAlign: 'center',
        marginBottom: 12,
    },
    buttonsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    noButton: {
        backgroundColor: '#ED5454',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        width: 112,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    yesButton: {
        backgroundColor: Colors.primaryColor,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        width: 112,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        ...Fonts.regular14,
        color: Colors.whiteColor,
        fontSize: 11,
        lineHeight: 17,
    },
    photoContainer: {
        flex: 1,
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 20,
        position: 'relative',
    },
    photoImage: {
        width: '100%',
        height: '100%',
    },
    topRow: {
        position: 'absolute',
        top: 12,
        left: 14,
        right: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    viewsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewsText: {
        ...Fonts.regular16,
        color: Colors.whiteColor,
    },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'flex-end',
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingBottom: 10,
    },
    photoTitle: {
        ...Fonts.medium16,
        color: Colors.whiteColor,
        flex: 1,
    },
    downloadButton: {
        backgroundColor: Colors.primaryColor,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        height: 38,
        alignItems: 'center',
        justifyContent: 'center',
    },
    downloadButtonText: {
        ...Fonts.regular14,
        color: Colors.whiteColor,
    },
    buyButton: {
        backgroundColor: Colors.primaryColor,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        width: 97,
        height: 38,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buyButtonText: {
        ...Fonts.regular14,
        color: Colors.whiteColor,
    },
});

export default Styles;
