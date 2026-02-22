import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../constants/Theme';
import Fonts from '../../constants/Fonts';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: colors.whiteColor,
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
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.lightGrayColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      ...Fonts.medium18,
      color: colors.mainTextColor,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    title: {
      ...Fonts.medium18,
      color: colors.mainTextColor,
    },
    subtitle: {
      ...Fonts.regular12,
      color: colors.subTextColor,
      marginTop: 6,
    },
    actionMenu: {
      marginTop: 16,
      gap: 10,
    },
    actionMenuButton: {
      minHeight: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.primaryColor,
      backgroundColor: colors.secondaryBlueColor,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 14,
    },
    actionMenuButtonText: {
      ...Fonts.medium14,
      color: colors.primaryColor,
    },
    confirmButton: {
      marginTop: 14,
      height: 44,
      borderRadius: 12,
      backgroundColor: colors.primaryColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
    confirmButtonDisabled: {
      opacity: 0.6,
    },
    confirmButtonText: {
      ...Fonts.medium14,
      color: colors.pureWhite,
    },
    photosContainer: {
      marginTop: 16,
      borderWidth: 1,
      borderColor: colors.lightGrayColor,
      borderRadius: 18,
      padding: 12,
      backgroundColor: colors.cardBackground,
    },
    photosGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    photoImageContainer: {
      height: 126,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'transparent',
      overflow: 'hidden',
    },
    photoImageContainerSelected: {
      borderColor: colors.primaryColor,
      borderWidth: 2,
    },
    photoImage: {
      height: 124,
      borderRadius: 10,
    },
    selectionBadge: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.primaryColor,
      borderWidth: 1,
      borderColor: colors.pureWhite,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectionBadgeText: {
      fontSize: 11,
      color: colors.pureWhite,
      fontWeight: '600',
    },
    emptyState: {
      paddingVertical: 24,
      alignItems: 'center',
    },
    emptyText: {
      ...Fonts.regular12,
      color: colors.subTextColor,
    },
  });
