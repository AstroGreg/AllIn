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
  });

