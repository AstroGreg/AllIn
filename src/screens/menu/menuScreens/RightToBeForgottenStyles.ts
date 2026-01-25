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
    infoCard: {
        backgroundColor: 'rgba(60, 130, 246, 0.08)',
        borderWidth: 0.5,
        borderColor: Colors.primaryColor,
        borderRadius: 10,
        padding: 16,
    },
    infoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 6,
    },
    infoIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 10,
        backgroundColor: '#EDF4FE',
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoTitle: {
        ...Fonts.medium18,
        color: Colors.mainTextColor,
        flex: 1,
    },
    infoDescription: {
        ...Fonts.regular14,
        color: '#9B9F9F',
        lineHeight: 22,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.whiteColor,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        borderRadius: 10,
        padding: 16,
    },
    statLabel: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    statValue: {
        ...Fonts.medium16,
        color: Colors.mainTextColor,
    },
    // Expanded category styles
    expandedCategoryContainer: {
        marginBottom: 16,
    },
    expandedCategoryCard: {
        backgroundColor: Colors.whiteColor,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomWidth: 0,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dataItemsContainer: {
        backgroundColor: Colors.whiteColor,
        borderWidth: 0.5,
        borderTopWidth: 0,
        borderColor: '#DEDEDE',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        padding: 16,
        gap: 16,
    },
    // Collapsed category styles
    categoryCard: {
        backgroundColor: Colors.whiteColor,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        borderRadius: 10,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    categoryIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 6,
        backgroundColor: 'rgba(60, 130, 246, 0.14)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryInfo: {
        flex: 1,
    },
    categoryTitle: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
    },
    categorySubtitle: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    categoryRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    markedText: {
        ...Fonts.regular12,
        color: Colors.primaryColor,
    },
    // Data item styles
    dataItemCard: {
        backgroundColor: Colors.whiteColor,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        borderRadius: 10,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dataItemContent: {
        flex: 1,
        gap: 4,
    },
    dataItemLabel: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
    },
    dataItemValue: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 54,
        borderWidth: 0.5,
        borderColor: '#ED5454',
        borderRadius: 10,
    },
    deleteButtonText: {
        ...Fonts.medium16,
        color: '#ED5454',
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 54,
        backgroundColor: Colors.primaryColor,
        borderRadius: 10,
    },
    downloadButtonText: {
        ...Fonts.medium16,
        color: Colors.whiteColor,
    },
    exportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 54,
        borderWidth: 0.5,
        borderColor: '#9B9F9F',
        borderRadius: 10,
    },
    exportButtonText: {
        ...Fonts.medium16,
        color: '#9B9F9F',
    },
});

export default styles;
