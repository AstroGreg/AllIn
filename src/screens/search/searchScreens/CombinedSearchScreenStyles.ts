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
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sectionTitle: {
      ...Fonts.semibold14,
      color: colors.mainTextColor,
      marginBottom: 8,
    },
    faceSectionTitle: {
      ...Fonts.semibold14,
      color: colors.mainTextColor,
      marginBottom: 8,
      fontSize: 15,
      lineHeight: 20,
    },
    sectionAction: {
      borderWidth: 1,
      borderColor: colors.lightGrayColor,
      backgroundColor: colors.btnBackgroundColor,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    sectionActionText: {
      ...Fonts.semibold12,
      color: colors.primaryColor,
    },
    competitionSection: {
      marginTop: 18,
    },
    helperText: {
      ...Fonts.regular12,
      color: colors.subTextColor,
      lineHeight: 16,
    },
    competitionChipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 12,
    },
    selectedCompetitionsRow: {
      marginTop: 12,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
    },
    competitionChipsWrap: {
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    inlineEditAction: {
      marginTop: 2,
    },
    competitionChip: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.lightGrayColor,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: colors.secondaryColor,
      gap: 6,
      maxWidth: '100%',
    },
    competitionChipText: {
      ...Fonts.regular12,
      color: colors.mainTextColor,
      maxWidth: 180,
    },
    competitionChipRemove: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyCompetitionCard: {
      marginTop: 12,
      borderWidth: 1,
      borderColor: colors.lightGrayColor,
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 16,
      backgroundColor: colors.cardBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyCompetitionCardError: {
      borderColor: colors.errorColor,
    },
    emptyCompetitionText: {
      ...Fonts.semibold14,
      color: colors.primaryColor,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.secondaryColor,
      borderWidth: 1,
      borderColor: colors.lightGrayColor,
      borderRadius: 12,
      paddingHorizontal: 16,
      height: 54,
    },
    input: {
      flex: 1,
      ...Fonts.regular14,
      color: colors.mainTextColor,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    toggleInfo: {
      flex: 1,
      paddingRight: 12,
    },
    faceActions: {
      alignItems: 'flex-end',
      gap: 8,
    },
    redoFaceButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.primaryColor,
      backgroundColor: colors.cardBackground,
    },
    redoFaceText: {
      ...Fonts.medium12,
      color: colors.primaryColor,
    },
    primaryButton: {
      height: 52,
      borderRadius: 14,
      backgroundColor: colors.primaryColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButtonDisabled: {
      opacity: 0.6,
    },
    primaryButtonText: {
      ...Fonts.semibold14,
      color: colors.pureWhite,
    },
    secondaryButton: {
      marginTop: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.primaryColor,
      paddingVertical: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryButtonText: {
      ...Fonts.semibold12,
      color: colors.primaryColor,
    },
    errorText: {
      ...Fonts.regular12,
      color: colors.errorColor,
      marginTop: 10,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'transparent',
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    modalCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.lightGrayColor,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    modalTitle: {
      ...Fonts.semibold16,
      color: colors.mainTextColor,
    },
    modalCloseButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    modalSearchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.lightGrayColor,
      borderRadius: 12,
      backgroundColor: colors.secondaryColor,
      paddingHorizontal: 12,
      height: 46,
      marginBottom: 10,
    },
    modalSearchInput: {
      flex: 1,
      ...Fonts.regular14,
      color: colors.mainTextColor,
      marginLeft: 8,
    },
    modalErrorText: {
      ...Fonts.regular12,
      color: colors.errorColor,
      marginBottom: 6,
    },
    modalList: {
      maxHeight: 360,
    },
    modalListContent: {
      paddingVertical: 4,
      gap: 8,
    },
    modalOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: colors.lightGrayColor,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: colors.secondaryColor,
    },
    modalOptionSelected: {
      borderColor: colors.primaryColor,
      backgroundColor: colors.cardBackground,
    },
    modalOptionTextWrap: {
      flex: 1,
      paddingRight: 12,
    },
    modalOptionTitle: {
      ...Fonts.medium14,
      color: colors.mainTextColor,
    },
    modalOptionSubtext: {
      ...Fonts.regular12,
      color: colors.subTextColor,
      marginTop: 2,
    },
    modalEmptyText: {
      ...Fonts.regular12,
      color: colors.subTextColor,
      textAlign: 'center',
      paddingVertical: 16,
    },
    modalLoadingRow: {
      paddingVertical: 16,
      alignItems: 'center',
    },
    modalDoneButton: {
      marginTop: 12,
      borderRadius: 12,
      backgroundColor: colors.primaryColor,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalDoneButtonText: {
      ...Fonts.semibold13,
      color: colors.pureWhite,
    },
    modalSecondaryButton: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.lightGrayColor,
      backgroundColor: colors.cardBackground,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalSecondaryButtonText: {
      ...Fonts.semibold13,
      color: colors.mainTextColor,
    },
  });

const Styles = createStyles(lightColors);
export default Styles;
