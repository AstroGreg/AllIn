import {Dimensions, StyleSheet} from 'react-native';
import Fonts from '../../constants/Fonts';
import type {ThemeColors} from '../../constants/Theme';

const {width} = Dimensions.get('window');
const cardWidth = (width - 40 - 12) / 2; // 40 = horizontal padding, 12 = gap

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: colors.backgroundColor,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
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
    headerCountBadge: {
      minWidth: 44,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.btnBackgroundColor,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 10,
    },
    headerCountText: {
      ...Fonts.regular12,
      color: colors.grayColor,
    },

    listContent: {
      paddingTop: 24,
      paddingBottom: 24,
    },
    sectionTitle: {
      ...Fonts.medium18,
      color: colors.mainTextColor,
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    listHeader: {
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    searchBar: {
      marginTop: 12,
      borderWidth: 1,
      borderColor: colors.lightGrayColor,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: colors.btnBackgroundColor,
    },
    searchInput: {
      ...Fonts.regular14,
      color: colors.mainTextColor,
    },
    gridRow: {
      paddingHorizontal: 20,
      gap: 12,
      marginBottom: 12,
    },
    card: {
      width: cardWidth,
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      borderWidth: 0.5,
      borderColor: colors.lightGrayColor,
      padding: 12,
    },
    cardImage: {
      width: '100%',
      height: 110,
      borderRadius: 8,
    },
    cardMetaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10,
      gap: 10,
    },
    cardMetaText: {
      ...Fonts.regular12,
      color: colors.grayColor,
      flex: 1,
    },
    viewButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.primaryColor,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    viewButtonText: {
      ...Fonts.medium14,
      fontSize: 12,
      color: colors.pureWhite,
    },
    emptyText: {
      ...Fonts.regular14,
      color: colors.grayColor,
      textAlign: 'center',
      paddingHorizontal: 20,
      marginTop: 16,
    },
    errorText: {
      ...Fonts.regular14,
      color: '#FF3B30',
      textAlign: 'center',
      paddingHorizontal: 20,
      marginTop: 16,
    },
    profitCard: {
      marginHorizontal: 20,
      marginBottom: 12,
      padding: 14,
      borderRadius: 12,
      borderWidth: 0.5,
      borderColor: colors.lightGrayColor,
      backgroundColor: colors.cardBackground,
    },
    profitTitle: {
      ...Fonts.medium14,
      color: colors.mainTextColor,
      marginBottom: 8,
    },
    profitRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    profitMeta: {
      ...Fonts.regular12,
      color: colors.grayColor,
      flex: 1,
    },
    profitAmount: {
      ...Fonts.medium14,
      color: colors.primaryColor,
    },
    competitionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      marginHorizontal: 20,
      marginBottom: 12,
      padding: 14,
      borderRadius: 12,
      borderWidth: 0.5,
      borderColor: colors.lightGrayColor,
      backgroundColor: colors.cardBackground,
    },
    competitionRowInfo: {
      flex: 1,
      gap: 4,
    },
    competitionRowTitle: {
      ...Fonts.medium14,
      color: colors.mainTextColor,
    },
    competitionRowMeta: {
      ...Fonts.regular12,
      color: colors.subTextColor,
    },
    competitionRowMetaSecondary: {
      ...Fonts.regular12,
      color: colors.grayColor,
    },
    competitionBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      backgroundColor: colors.btnBackgroundColor,
      borderWidth: 1,
      borderColor: colors.lightGrayColor,
    },
    competitionBadgeText: {
      ...Fonts.medium12,
      color: colors.primaryColor,
    },
    mediaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginHorizontal: 20,
      marginBottom: 12,
      padding: 12,
      borderRadius: 12,
      borderWidth: 0.5,
      borderColor: colors.lightGrayColor,
      backgroundColor: colors.cardBackground,
    },
    mediaThumb: {
      width: 64,
      height: 64,
      borderRadius: 10,
    },
    mediaThumbPlaceholder: {
      width: 64,
      height: 64,
      borderRadius: 10,
      backgroundColor: colors.btnBackgroundColor,
    },
    mediaInfo: {
      flex: 1,
      gap: 4,
    },
    mediaTitle: {
      ...Fonts.medium14,
      color: colors.mainTextColor,
    },
    mediaMeta: {
      ...Fonts.regular12,
      color: colors.grayColor,
    },
  });
