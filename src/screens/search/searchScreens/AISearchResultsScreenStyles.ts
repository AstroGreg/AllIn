import {StyleSheet, Dimensions} from 'react-native';
import Fonts from '../../../constants/Fonts';
import { ThemeColors, lightColors } from '../../../constants/Theme';

const {width} = Dimensions.get('window');
export const CARD_WIDTH = (width - 40 - 16 - 32) / 2;

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
    ...Fonts.regular14,
    color: colors.mainTextColor,
  },
  resultsBadgeTextHidden: {
    ...Fonts.regular14,
    color: colors.mainTextColor,
    opacity: 0,
  },
  photoGroupWrapper: {
    marginBottom: 24,
    position: 'relative',
  },
  photoGroupGradientBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 10,
  },
  photoGroupCard: {
    margin: 1,
    borderRadius: 9,
    padding: 12,
    backgroundColor: colors.cardBackground,
  },
  photoGroupRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  photoCard: {
    width: CARD_WIDTH,
    backgroundColor: colors.cardBackground,
    borderWidth: 0.5,
    borderColor: colors.lightGrayColor,
    borderRadius: 10,
    padding: 16,
  },
  photoImage: {
    width: '100%',
    height: 104,
    borderRadius: 4,
  },
  photoInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  photoLeftInfo: {
    justifyContent: 'space-between',
  },
  priceText: {
    ...Fonts.semibold12,
    color: colors.mainTextColor,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    gap: 4,
    minWidth: 50,
    minHeight: 22,
  },
  viewButtonText: {
    fontFamily: 'Inter-Regular',
    fontSize: 8,
    color: '#FFFFFF',
  },
  photoRightInfo: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  resolutionText: {
    ...Fonts.regular12,
    color: colors.mainTextColor,
  },
  downloadButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// Backward compatibility
const styles = createStyles(lightColors);
export default styles;
