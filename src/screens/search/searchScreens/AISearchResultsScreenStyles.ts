import {StyleSheet, Dimensions} from 'react-native';
import Fonts from '../../../constants/Fonts';
import {ThemeColors, lightColors} from '../../../constants/Theme';

const {width} = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_WIDTH = (width - 40 - CARD_GAP) / 2;

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
    container: {
      flex: 1,
      paddingHorizontal: 20,
    },
    resultsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    resultsTitle: {
      ...Fonts.medium18,
      color: colors.mainTextColor,
    },
    resultsBadge: {
      backgroundColor: colors.btnBackgroundColor,
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    resultsBadgeText: {
      ...Fonts.regular12,
      color: colors.mainTextColor,
    },
    groupSection: {
      marginBottom: 24,
    },
    groupHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    groupTitle: {
      ...Fonts.medium16,
      color: colors.mainTextColor,
    },
    groupCountBadge: {
      backgroundColor: colors.secondaryColor,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    groupCountText: {
      ...Fonts.semibold12,
      color: colors.mainTextColor,
    },
    groupGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: CARD_GAP,
    },
    resultCard: {
      width: CARD_WIDTH,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.lightGrayColor,
      backgroundColor: colors.cardBackground,
      overflow: 'hidden',
      position: 'relative',
    },
    resultImage: {
      width: '100%',
      height: 120,
      backgroundColor: colors.btnBackgroundColor,
    },
    resultInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 10,
      paddingVertical: 8,
      gap: 6,
    },
    matchChip: {
      borderRadius: 999,
      backgroundColor: colors.secondaryColor,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    matchChipText: {
      ...Fonts.semibold10,
      color: colors.mainTextColor,
      letterSpacing: 0.3,
    },
    mediaType: {
      ...Fonts.regular10,
      color: colors.subTextColor,
    },
    downloadButton: {
      position: 'absolute',
      right: 8,
      top: 8,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: 'rgba(255,255,255,0.85)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      ...Fonts.regular14,
      color: colors.grayColor,
      textAlign: 'center',
      paddingVertical: 24,
    },
  });

const styles = createStyles(lightColors);
export default styles;
