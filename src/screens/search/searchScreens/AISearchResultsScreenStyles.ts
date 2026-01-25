import {StyleSheet, Dimensions} from 'react-native';
import Colors from '../../../constants/Colors';
import Fonts from '../../../constants/Fonts';

const {width} = Dimensions.get('window');
export const CARD_WIDTH = (width - 40 - 16 - 32) / 2;

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
    paddingVertical: 16,
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
    color: '#171717',
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
    color: '#171717',
  },
  resultsBadge: {
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  resultsBadgeText: {
    ...Fonts.regular14,
    color: '#000000',
  },
  resultsBadgeTextHidden: {
    ...Fonts.regular14,
    color: '#000000',
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
    backgroundColor: Colors.whiteColor,
  },
  photoGroupRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  photoCard: {
    width: CARD_WIDTH,
    backgroundColor: Colors.whiteColor,
    borderWidth: 0.5,
    borderColor: '#DEDEDE',
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
    color: '#171717',
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
    color: Colors.whiteColor,
  },
  photoRightInfo: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  resolutionText: {
    ...Fonts.regular12,
    color: '#171717',
  },
  downloadButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default styles;
