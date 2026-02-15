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
        readonlyField: {
            borderWidth: 1,
            borderColor: colors.lightGrayColor,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 12,
            backgroundColor: colors.btnBackgroundColor,
        },
        readonlyText: {
            ...Fonts.regular14,
            color: colors.mainTextColor,
        },
        fieldTextarea: {
            minHeight: 120,
            textAlignVertical: 'top',
        },
        mediaHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
        },
        mediaAddButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: colors.primaryColor,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 8,
        },
        mediaAddText: {
            ...Fonts.regular12,
            color: colors.pureWhite,
        },
        mediaGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
            marginBottom: 16,
        },
        mediaTile: {
            width: 88,
            height: 88,
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: colors.btnBackgroundColor,
        },
        mediaImage: {
            width: '100%',
            height: '100%',
        },
        mediaBadge: {
            position: 'absolute',
            bottom: 6,
            right: 6,
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 6,
            backgroundColor: 'rgba(0,0,0,0.55)',
        },
        mediaBadgeText: {
            ...Fonts.regular10,
            color: colors.pureWhite,
        },
        mediaEmptyText: {
            ...Fonts.regular12,
            color: colors.grayColor,
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
