import { StyleSheet } from 'react-native';
import { ThemeColors, lightColors } from '../../constants/Theme';
import Fonts from '../../constants/Fonts';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.whiteColor,
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
    settingsButton: {
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
    competitionInfo: {
        gap: 2,
    },
    competitionTitle: {
        ...Fonts.medium16,
        color: colors.mainTextColor,
    },
    competitionDescription: {
        ...Fonts.regular12,
        color: '#777777',
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: colors.whiteColor,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        borderRadius: 10,
        padding: 8,
        gap: 10,
    },
    toggleButton: {
        flex: 1,
        height: 39,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
    toggleButtonActive: {
        backgroundColor: 'rgba(60, 130, 246, 0.3)',
    },
    toggleText: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    toggleTextActive: {
        color: colors.mainTextColor,
    },
    sectionHeaderContainer: {
        zIndex: 10,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sectionTitle: {
        ...Fonts.medium16,
        color: colors.mainTextColor,
    },
    filterButton: {
        width: 36,
        height: 36,
        borderRadius: 6.67,
        backgroundColor: colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterPopup: {
        position: 'absolute',
        top: 44,
        right: 0,
        backgroundColor: colors.whiteColor,
        borderRadius: 20,
        paddingVertical: 24,
        paddingLeft: 16,
        paddingRight: 32,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 43,
        elevation: 10,
        zIndex: 100,
    },
    filterOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    filterOptionText: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    filterDivider: {
        height: 1,
        backgroundColor: '#DEDEDE',
        marginVertical: 16,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        borderWidth: 0,
    },
    eventsList: {
        gap: 24,
    },
    emptyStateText: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    eventCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.whiteColor,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        borderRadius: 10,
        padding: 16,
    },
    eventName: {
        ...Fonts.medium16,
        color: colors.mainTextColor,
    },
    eventRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badgesContainer: {
        flexDirection: 'row',
        gap: 11,
    },
    badge: {
        backgroundColor: '#EBEBEB',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        ...Fonts.regular12,
        color: '#777777',
    },
    photosTitle: {
        ...Fonts.medium16,
        color: colors.mainTextColor,
    },
    primaryButton: {
        backgroundColor: colors.primaryColor,
        borderRadius: 10,
        height: 54,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    primaryButtonText: {
        ...Fonts.medium16,
        color: colors.whiteColor,
    },
});

const Styles = createStyles(lightColors);

export default Styles;
