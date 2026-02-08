import {StyleSheet} from 'react-native';
import Fonts from '../../constants/Fonts';
import type {ThemeColors} from '../../constants/Theme';

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
      paddingVertical: 15,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.lightGrayColor,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.btnBackgroundColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      ...Fonts.medium16,
      fontSize: 18,
      color: colors.mainTextColor,
    },
    notificationButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.btnBackgroundColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 100,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      ...Fonts.medium16,
      fontSize: 18,
      color: colors.mainTextColor,
    },
    viewAllText: {
      ...Fonts.regular14,
      color: colors.grayColor,
    },

    // Shared card styles
    appearanceCard: {
      backgroundColor: colors.cardBackground,
      borderWidth: 0.5,
      borderColor: colors.lightGrayColor,
      borderRadius: 10,
      padding: 16,
      marginBottom: 16,
    },
    myEventCard: {
      backgroundColor: colors.cardBackground,
      borderWidth: 0.5,
      borderColor: colors.lightGrayColor,
      borderRadius: 10,
      padding: 16,
      marginBottom: 16,
      flexDirection: 'row',
    },
    cardRow: {
      flexDirection: 'row',
    },
    squareThumbnail: {
      width: 86,
      height: 86,
      borderRadius: 10,
    },
    cardInfo: {
      flex: 1,
      marginLeft: 12,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    playIconCircle: {
      width: 20,
      height: 20,
      borderRadius: 12,
      backgroundColor: colors.primaryColor,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 6,
    },
    cardTitle: {
      ...Fonts.medium14,
      color: colors.mainTextColor,
    },
    eventTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    videosCount: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    detailLabel: {
      ...Fonts.regular12,
      color: colors.grayColor,
    },
    detailValue: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    detailText: {
      ...Fonts.regular12,
      color: colors.grayColor,
    },
    divider: {
      height: 0.5,
      backgroundColor: colors.lightGrayColor,
      marginVertical: 12,
    },
    viewButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primaryColor,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      alignSelf: 'flex-start',
      height: 36,
    },
    viewButtonText: {
      ...Fonts.regular14,
      color: colors.pureWhite,
      marginRight: 6,
    },

    // Primary Button
    primaryButton: {
      backgroundColor: colors.primaryColor,
      borderRadius: 10,
      height: 54,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
    },
    primaryButtonText: {
      ...Fonts.medium16,
      color: colors.pureWhite,
      marginRight: 8,
    },

    // Downloads Section
    downloadsCard: {
      backgroundColor: colors.cardBackground,
      borderWidth: 0.5,
      borderColor: colors.lightGrayColor,
      borderRadius: 10,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    downloadsInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    downloadsText: {
      ...Fonts.regular14,
      color: colors.mainTextColor,
      marginLeft: 10,
    },
    downloadsNumber: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.mainTextColor,
    },
    detailsButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.lightGrayColor,
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    detailsButtonText: {
      ...Fonts.regular14,
      color: colors.subTextColor,
      marginRight: 4,
    },

    // Created Events Card with Badge
    createdEventCard: {
      backgroundColor: colors.cardBackground,
      borderWidth: 0.5,
      borderColor: colors.lightGrayColor,
      borderRadius: 10,
      overflow: 'hidden',
      marginBottom: 16,
    },
    requestBadge: {
      backgroundColor: '#FFF7E3',
      paddingHorizontal: 12,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    requestBadgeSmall: {
      backgroundColor: '#FFF7E3',
      paddingHorizontal: 6,
      paddingVertical: 6,
      borderRadius: 6,
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      marginBottom: 8,
    },
    requestBadgeText: {
      ...Fonts.regular12,
      color: colors.grayColor,
      marginLeft: 4,
    },
    createdEventContent: {
      padding: 16,
      flexDirection: 'row',
    },

    // Video Card - Horizontal layout
    videoCard: {
      backgroundColor: colors.cardBackground,
      borderWidth: 0.5,
      borderColor: colors.lightGrayColor,
      borderRadius: 10,
      padding: 16,
      flexDirection: 'row',
      marginBottom: 16,
    },
    videoThumbnailWrapper: {
      width: 109,
      height: 140,
      borderRadius: 6,
      overflow: 'hidden',
      position: 'relative',
    },
    videoThumbnail: {
      width: '100%',
      height: '100%',
    },
    videoPlayButton: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: -20,
      marginLeft: -20,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.secondaryBlueColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
    videoInfo: {
      flex: 1,
      marginLeft: 12,
    },
    videoTitle: {
      ...Fonts.medium14,
      color: colors.mainTextColor,
      marginBottom: 8,
    },
    videoMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    videoMetaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    videoMetaDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.grayColor,
      marginHorizontal: 8,
    },
    downloadButton: {
      backgroundColor: colors.primaryColor,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      height: 38,
    },
    downloadButtonText: {
      ...Fonts.regular14,
      color: colors.pureWhite,
      marginRight: 6,
    },
  });

