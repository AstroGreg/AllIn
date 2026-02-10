import {StyleSheet} from 'react-native';
import Fonts from '../../../constants/Fonts';
import {ThemeColors, lightColors} from '../../../constants/Theme';

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
    title: {
      ...Fonts.semibold18,
      color: colors.mainTextColor,
    },
    subtitle: {
      ...Fonts.regular14,
      color: colors.subTextColor,
      marginTop: 6,
    },
    sectionTitle: {
      ...Fonts.semibold14,
      color: colors.mainTextColor,
      marginBottom: 10,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      borderWidth: 1,
      borderColor: colors.lightGrayColor,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 8,
      backgroundColor: colors.secondaryColor,
    },
    chipActive: {
      borderColor: colors.primaryColor,
      backgroundColor: colors.primaryColor,
    },
    chipText: {
      ...Fonts.regular12,
      color: colors.mainTextColor,
    },
    chipTextActive: {
      color: colors.pureWhite,
      fontWeight: '600',
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 24,
    },
    primaryButton: {
      flex: 1,
      height: 50,
      borderRadius: 12,
      backgroundColor: colors.primaryColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButtonText: {
      ...Fonts.semibold14,
      color: colors.pureWhite,
    },
    secondaryButton: {
      flex: 1,
      height: 50,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.primaryColor,
      backgroundColor: colors.cardBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryButtonText: {
      ...Fonts.semibold14,
      color: colors.primaryColor,
    },
  });

const styles = createStyles(lightColors);
export default styles;
