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
      lineHeight: 20,
    },
    inputLabel: {
      ...Fonts.semibold14,
      color: colors.mainTextColor,
      marginBottom: 8,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.secondaryColor,
      borderWidth: 1,
      borderColor: colors.lightGrayColor,
      borderRadius: 10,
      paddingHorizontal: 16,
      height: 54,
    },
    input: {
      flex: 1,
      ...Fonts.regular14,
      color: colors.mainTextColor,
    },
    card: {
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.lightGrayColor,
      borderRadius: 12,
      padding: 14,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 10,
    },
    chip: {
      borderWidth: 1,
      borderColor: colors.lightGrayColor,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.secondaryColor,
    },
    chipActive: {
      borderColor: colors.primaryColor,
      backgroundColor: colors.secondaryBlueColor,
    },
    chipText: {
      ...Fonts.regular12,
      color: colors.mainTextColor,
    },
    errorText: {
      ...Fonts.regular14,
      color: '#FF3B30',
      marginTop: 12,
    },
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryColor,
      height: 54,
      borderRadius: 10,
      gap: 8,
    },
    primaryButtonDisabled: {
      opacity: 0.6,
    },
    primaryButtonText: {
      ...Fonts.medium16,
      color: colors.pureWhite,
    },
  });

// Backward compatibility (some screens still import default)
const styles = createStyles(lightColors);
export default styles;

