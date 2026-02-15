import { StyleSheet } from 'react-native';
import Fonts from '../../constants/Fonts';
import type { ThemeColors } from '../../constants/Theme';

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
        scrollContent: {
            paddingHorizontal: 20,
            paddingTop: 24,
        },
        ownerText: {
            ...Fonts.regular12,
            color: colors.grayColor,
            marginBottom: 12,
        },
        heroCard: {
            backgroundColor: colors.cardBackground,
            borderRadius: 18,
            padding: 20,
            borderWidth: 1,
            borderColor: colors.lightGrayColor,
        },
        yearBadge: {
            alignSelf: 'flex-start',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 999,
            backgroundColor: colors.btnBackgroundColor,
            ...Fonts.medium14,
            color: colors.mainTextColor,
        },
        titleText: {
            ...Fonts.medium18,
            color: colors.mainTextColor,
            marginTop: 14,
        },
        metaText: {
            ...Fonts.regular12,
            color: colors.subTextColor,
            marginTop: 6,
        },
        descriptionText: {
            ...Fonts.regular14,
            color: colors.grayColor,
            marginTop: 10,
            lineHeight: 22,
        },
        highlightChip: {
            alignSelf: 'flex-start',
            marginTop: 16,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 10,
            backgroundColor: '#E7F0FF',
        },
        highlightText: {
            ...Fonts.medium12,
            color: colors.primaryColor,
        },
        photoRow: {
            marginTop: 16,
        },
        photoThumb: {
            width: 90,
            height: 90,
            borderRadius: 14,
            marginRight: 12,
            backgroundColor: colors.btnBackgroundColor,
        },
        linkSection: {
            marginTop: 18,
            gap: 12,
        },
        linkGroup: {
            gap: 8,
        },
        linkTitle: {
            ...Fonts.medium14,
            color: colors.mainTextColor,
        },
        linkRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
        },
        linkChip: {
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 999,
            backgroundColor: colors.btnBackgroundColor,
        },
        linkChipText: {
            ...Fonts.regular12,
            color: colors.grayColor,
        },
    });
