import { StyleSheet } from 'react-native';
import { lightColors } from '../../constants/Theme';
import Fonts from '../../constants/Fonts';
export const createStyles = (colors) => StyleSheet.create({
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
    headerTitle: Object.assign(Object.assign({}, Fonts.medium18), { color: colors.mainTextColor }),
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    competitionTitle: Object.assign(Object.assign({}, Fonts.medium18), { color: colors.mainTextColor, marginBottom: 16 }),
    athletesSectionTitle: Object.assign(Object.assign({}, Fonts.medium14), { color: colors.mainTextColor, marginBottom: 12 }),
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
    athleteName: Object.assign(Object.assign({ flex: 1 }, Fonts.medium14), { color: colors.mainTextColor }),
    athleteEventType: Object.assign(Object.assign({}, Fonts.regular12), { color: '#9B9F9F' }),
});
const Styles = createStyles(lightColors);
export default Styles;
