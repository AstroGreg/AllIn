import {Dimensions, StyleSheet} from 'react-native';
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
    refineBar: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.lightGrayColor,
      backgroundColor: colors.backgroundColor,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    refinePillsRow: {
      gap: 8,
      paddingRight: 8,
    },
    refinePill: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: colors.btnBackgroundColor,
      borderWidth: 1,
      borderColor: colors.lightGrayColor,
    },
    refinePillText: {
      ...Fonts.regular12,
      color: colors.mainTextColor,
    },
    refinePillMuted: {
      paddingVertical: 8,
    },
    refinePillMutedText: {
      ...Fonts.regular12,
      color: colors.subTextColor,
    },
    refineButton: {
      minWidth: 82,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.primaryColor,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 14,
    },
    refineButtonText: {
      ...Fonts.medium12,
      color: colors.pureWhite,
    },
    container: {
      flex: 1,
      paddingHorizontal: 20,
    },
    resultsHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
    },
    resultsTitle: {
      ...Fonts.medium18,
      color: colors.mainTextColor,
    },
    resultsSubtitle: {
      ...Fonts.regular13,
      color: colors.subTextColor,
      marginTop: 6,
      lineHeight: 18,
      maxWidth: width - 152,
    },
    resultsBadge: {
      backgroundColor: colors.btnBackgroundColor,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: colors.lightGrayColor,
    },
    resultsBadgeText: {
      ...Fonts.medium12,
      color: colors.mainTextColor,
    },
    section: {
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 12,
    },
    sectionTitle: {
      ...Fonts.medium16,
      color: colors.mainTextColor,
    },
    sectionSubtitle: {
      ...Fonts.regular12,
      color: colors.subTextColor,
      marginTop: 4,
      lineHeight: 18,
      maxWidth: width - 120,
    },
    sectionCountBadge: {
      minWidth: 36,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.secondaryColor,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
    },
    sectionCountText: {
      ...Fonts.medium12,
      color: colors.mainTextColor,
    },
    emptySectionText: {
      ...Fonts.regular13,
      color: colors.subTextColor,
      paddingVertical: 12,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: CARD_GAP,
    },
    resultCard: {
      width: CARD_WIDTH,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.lightGrayColor,
      backgroundColor: colors.cardBackground,
      overflow: 'hidden',
      position: 'relative',
    },
    resultImage: {
      width: '100%',
      height: 128,
      backgroundColor: colors.btnBackgroundColor,
    },
    downloadButton: {
      position: 'absolute',
      right: 8,
      top: 8,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: 'rgba(255,255,255,0.92)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    resultBody: {
      paddingHorizontal: 10,
      paddingVertical: 10,
      gap: 6,
    },
    resultEventName: {
      ...Fonts.medium13,
      color: colors.mainTextColor,
    },
    resultChipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    sourceChip: {
      borderRadius: 999,
      backgroundColor: colors.secondaryColor,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    sourceChipText: {
      ...Fonts.medium10,
      color: colors.mainTextColor,
    },
    confidenceChip: {
      borderRadius: 999,
      backgroundColor: colors.secondaryBlueColor,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: colors.primaryColor,
    },
    confidenceChipText: {
      ...Fonts.medium10,
      color: colors.primaryColor,
    },
    resultMeta: {
      ...Fonts.regular11,
      color: colors.subTextColor,
    },
    manualBrowseCard: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.lightGrayColor,
      backgroundColor: colors.cardBackground,
      overflow: 'hidden',
    },
    manualBrowseAction: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.lightGrayColor,
    },
    manualBrowseActionCopy: {
      flex: 1,
      gap: 4,
    },
    manualBrowseActionTitle: {
      ...Fonts.medium14,
      color: colors.mainTextColor,
    },
    manualBrowseActionSubtitle: {
      ...Fonts.regular12,
      color: colors.subTextColor,
      lineHeight: 18,
    },
  });

const styles = createStyles(lightColors);
export default styles;
