import { StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";

const Styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.whiteColor,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: '#DEDEDE',
        alignItems: 'center',
    },
    headerTitle: {
        ...Fonts.medium18,
        color: Colors.mainTextColor,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    tipCard: {
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        padding: 16,
        alignItems: 'center',
    },
    tipText: {
        ...Fonts.regular14,
        color: '#9B9F9F',
        textAlign: 'center',
    },
    accountCard: {
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    accountInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    accountDetails: {
        marginLeft: 8,
        flex: 1,
    },
    accountName: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
    },
    sportRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
        gap: 4,
    },
    sportText: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    selectButton: {
        backgroundColor: Colors.primaryColor,
        borderRadius: 5,
        paddingHorizontal: 16,
        paddingVertical: 10,
        height: 38,
        width: 88,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectButtonText: {
        ...Fonts.medium12,
        color: Colors.whiteColor,
    },
    createAccountButton: {
        backgroundColor: Colors.primaryColor,
        borderRadius: 10,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    createAccountButtonText: {
        ...Fonts.medium16,
        color: Colors.whiteColor,
    },
    anonymousButton: {
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    anonymousButtonText: {
        ...Fonts.medium16,
        color: Colors.primaryColor,
    },
});

export default Styles;
