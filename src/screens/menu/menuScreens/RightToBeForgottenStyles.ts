import { StyleSheet } from 'react-native';
import Fonts from '../../../constants/Fonts';
import { ThemeColors, lightColors } from '../../../constants/Theme';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.backgroundColor,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.lightGrayColor,
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.btnBackgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...Fonts.medium18,
        color: colors.mainTextColor,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    infoCard: {
        backgroundColor: 'rgba(60, 130, 246, 0.08)',
        borderWidth: 0.5,
        borderColor: colors.primaryColor,
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
        backgroundColor: colors.secondaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoTitle: {
        ...Fonts.medium18,
        color: colors.mainTextColor,
        flex: 1,
    },
    infoDescription: {
        ...Fonts.regular14,
        color: colors.grayColor,
        lineHeight: 22,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.cardBackground,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderRadius: 10,
        padding: 16,
    },
    statLabel: {
        ...Fonts.regular12,
        color: colors.grayColor,
    },
    statValue: {
        ...Fonts.medium16,
        color: colors.mainTextColor,
    },
    // Expanded category styles
    expandedCategoryContainer: {
        marginBottom: 16,
    },
    expandedCategoryCard: {
        backgroundColor: colors.cardBackground,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomWidth: 0,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dataItemsContainer: {
        backgroundColor: colors.cardBackground,
        borderWidth: 0.5,
        borderTopWidth: 0,
        borderColor: colors.lightGrayColor,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        padding: 16,
        gap: 16,
    },
    // Collapsed category styles
    categoryCard: {
        backgroundColor: colors.cardBackground,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
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
        color: colors.mainTextColor,
    },
    categorySubtitle: {
        ...Fonts.regular12,
        color: colors.grayColor,
    },
    categoryRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    markedText: {
        ...Fonts.regular12,
        color: colors.primaryColor,
    },
    // Data item styles
    dataItemCard: {
        backgroundColor: colors.cardBackground,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
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
        color: colors.mainTextColor,
    },
    dataItemValue: {
        ...Fonts.regular12,
        color: colors.grayColor,
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
        backgroundColor: colors.primaryColor,
        borderRadius: 10,
    },
    downloadButtonText: {
        ...Fonts.medium16,
        color: colors.pureWhite,
    },
    exportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 54,
        borderWidth: 0.5,
        borderColor: colors.grayColor,
        borderRadius: 10,
    },
    exportButtonText: {
        ...Fonts.medium16,
        color: colors.grayColor,
    },
});

// Backward compatibility
const styles = createStyles(lightColors);
export default styles;
