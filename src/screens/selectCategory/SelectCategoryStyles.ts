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
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        paddingHorizontal: 20,
        flexGrow: 1,
    },

    // Title Section
    titleSection: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 24,
    },
    title: {
        ...Fonts.medium22,
        fontSize: 24,
        color: Colors.mainTextColor,
        textAlign: 'center',
    },
    subtitle: {
        ...Fonts.regular14,
        color: '#9B9F9F',
        textAlign: 'center',
        marginTop: 10,
        lineHeight: 22,
    },

    // Categories
    categoriesContainer: {
        gap: 24,
    },
    categoryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        padding: 16,
    },
    categoryCardSelected: {
        borderColor: Colors.primaryColor,
        borderWidth: 1,
    },
    categoryCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    categoryIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryDetails: {
        flex: 1,
        gap: 6,
    },
    categoryTitle: {
        ...Fonts.medium18,
        color: Colors.mainTextColor,
    },
    categoryDescription: {
        ...Fonts.regular14,
        color: '#9B9F9F',
        lineHeight: 22,
    },

    // Radio Button
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#DEDEDE',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
    radioButtonSelected: {
        borderColor: Colors.primaryColor,
    },
    radioButtonInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.primaryColor,
    },

    // Bottom Container
    bottomContainer: {
        paddingHorizontal: 20,
        paddingTop: 16,
        backgroundColor: Colors.whiteColor,
    },
    continueButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: Colors.primaryColor,
        borderRadius: 10,
        paddingVertical: 16,
        height: 54,
    },
    continueButtonDisabled: {
        opacity: 0.5,
    },
    continueButtonText: {
        ...Fonts.medium16,
        color: Colors.whiteColor,
    },
});

export default Styles;
