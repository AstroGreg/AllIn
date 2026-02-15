import {StyleSheet} from 'react-native';
import Fonts from '../../constants/Fonts';
import type {ThemeColors} from '../../constants/Theme';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    mainContainer: {flex: 1, backgroundColor: colors.backgroundColor},
    header: {
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.lightGrayColor,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerTitle: {...Fonts.medium18, color: colors.mainTextColor},
    headerBtn: {padding: 8},
    content: {paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24},
    card: {
      backgroundColor: colors.whiteColor,
      borderRadius: 14,
      borderWidth: 0.5,
      borderColor: colors.lightGrayColor,
      padding: 14,
      marginBottom: 12,
    },
    rowTop: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
    title: {...Fonts.medium16, color: colors.mainTextColor},
    meta: {...Fonts.regular12, color: colors.subTextColor, marginTop: 2},
    pill: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: colors.btnBackgroundColor,
    },
    pillText: {...Fonts.medium12, color: colors.primaryColor},
    barTrack: {
      height: 10,
      borderRadius: 999,
      backgroundColor: colors.btnBackgroundColor,
      overflow: 'hidden',
      marginTop: 12,
    },
    barFill: {height: 10, borderRadius: 999, backgroundColor: colors.primaryColor},
    actionsRow: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 12},
    actionText: {...Fonts.medium13, color: colors.primaryColor},
    emptyText: {...Fonts.regular14, color: colors.subTextColor, textAlign: 'center', marginTop: 40},
  });

