import { StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";

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
        borderBottomWidth: 0.3,
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
        lineHeight: 22,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        padding: 4,
    },
    toggleTab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
    toggleTabActive: {
        backgroundColor: Colors.primaryColor,
    },
    toggleTabText: {
        ...Fonts.medium14,
        color: '#777777',
    },
    toggleTabTextActive: {
        color: Colors.whiteColor,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sectionTitle: {
        ...Fonts.medium18,
        color: Colors.mainTextColor,
    },
    sectionFilterButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 10,
    },
    categoryName: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
    },
    uploadIconButton: {
        borderRadius: 8,
        backgroundColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 29,
    },
    addCategoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primaryColor,
        borderRadius: 10,
        paddingVertical: 14,
        gap: 8,
    },
    addCategoryButtonText: {
        ...Fonts.medium14,
        color: Colors.whiteColor,
    },
    unlabelledButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.primaryColor,
        paddingVertical: 14,
        gap: 8,
    },
    unlabelledButtonText: {
        ...Fonts.medium14,
        color: Colors.primaryColor,
    },
    divider: {
        height: 1,
        backgroundColor: '#DEDEDE',
    },
    finishButton: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E34949',
        borderRadius: 10,
        paddingVertical: 16,
    },
    finishButtonText: {
        ...Fonts.medium16,
        color: Colors.whiteColor,
    },
});

export default Styles;
