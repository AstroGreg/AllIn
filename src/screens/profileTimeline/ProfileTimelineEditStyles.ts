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
        fieldBlock: {
            marginBottom: 16,
        },
        fieldLabel: {
            ...Fonts.regular12,
            color: colors.grayColor,
            marginBottom: 6,
        },
        inlineHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 6,
        },
        inlineAction: {
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 10,
            backgroundColor: colors.btnBackgroundColor,
        },
        inlineActionText: {
            ...Fonts.medium12,
            color: colors.primaryColor,
        },
        dateRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
        },
        dateButton: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            borderWidth: 1,
            borderColor: colors.lightGrayColor,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 12,
            backgroundColor: colors.btnBackgroundColor,
        },
        dateText: {
            ...Fonts.regular14,
            color: colors.mainTextColor,
        },
        useCurrentButton: {
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderRadius: 10,
            backgroundColor: colors.btnBackgroundColor,
            borderWidth: 1,
            borderColor: colors.lightGrayColor,
        },
        useCurrentText: {
            ...Fonts.medium12,
            color: colors.primaryColor,
        },
        fieldInput: {
            borderWidth: 1,
            borderColor: colors.lightGrayColor,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 12,
            ...Fonts.regular14,
            color: colors.mainTextColor,
            backgroundColor: colors.btnBackgroundColor,
        },
        fieldTextarea: {
            minHeight: 100,
            textAlignVertical: 'top',
        },
        helperText: {
            ...Fonts.regular12,
            color: colors.grayColor,
        },
        searchInput: {
            borderWidth: 1,
            borderColor: colors.lightGrayColor,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            ...Fonts.regular14,
            color: colors.mainTextColor,
            backgroundColor: colors.btnBackgroundColor,
            marginBottom: 10,
        },
        backgroundPreviewRow: {
            marginTop: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
        },
        backgroundPreview: {
            flex: 1,
            height: 120,
            borderRadius: 14,
            backgroundColor: colors.btnBackgroundColor,
        },
        photoRow: {
            marginTop: 8,
        },
        photoThumb: {
            width: 72,
            height: 72,
            borderRadius: 12,
            marginRight: 10,
            backgroundColor: colors.btnBackgroundColor,
        },
        choiceRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
        },
        choiceChip: {
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: colors.lightGrayColor,
            backgroundColor: colors.btnBackgroundColor,
        },
        choiceChipActive: {
            backgroundColor: colors.primaryColor,
            borderColor: colors.primaryColor,
        },
        choiceChipText: {
            ...Fonts.regular12,
            color: colors.grayColor,
        },
        choiceChipTextActive: {
            color: colors.pureWhite,
        },
        actionRow: {
            flexDirection: 'row',
            gap: 12,
            marginTop: 8,
        },
        cancelButton: {
            flex: 1,
            borderWidth: 1,
            borderColor: colors.lightGrayColor,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 12,
        },
        cancelText: {
            ...Fonts.medium14,
            color: colors.subTextColor,
        },
        saveButton: {
            flex: 1,
            backgroundColor: colors.primaryColor,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 12,
        },
        saveText: {
            ...Fonts.medium14,
            color: colors.pureWhite,
        },
        deleteButton: {
            marginTop: 16,
            borderRadius: 12,
            backgroundColor: '#FFECEC',
            paddingVertical: 12,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
        },
        deleteText: {
            ...Fonts.medium14,
            color: '#ED5454',
        },
    });
