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
        paddingVertical: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: '#DEDEDE',
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerButtonPlaceholder: {
        width: 44,
        height: 44,
    },
    headerTitle: {
        ...Fonts.medium18,
        color: colors.mainTextColor,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    competitionTitle: {
        ...Fonts.medium18,
        color: colors.mainTextColor,
        marginBottom: 16,
    },
    athletesSectionTitle: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
        marginBottom: 12,
    },
    athletesCard: {
        backgroundColor: colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        padding: 16,
    },
    athleteRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: '#DEDEDE',
    },
    athleteAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    athleteName: {
        flex: 1,
        ...Fonts.medium14,
        color: colors.mainTextColor,
    },
    athleteEventType: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
});

const Styles = createStyles(lightColors);

export default Styles;
