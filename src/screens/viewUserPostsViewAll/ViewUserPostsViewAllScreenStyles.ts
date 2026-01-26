import { StyleSheet, Dimensions } from 'react-native';
import Fonts from '../../constants/Fonts';
import { ThemeColors, lightColors } from '../../constants/Theme';

const { width } = Dimensions.get('window');

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
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
        borderBottomColor: colors.borderColor,
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
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 24,
    },
    sectionTitle: {
        ...Fonts.medium18,
        color: colors.mainTextColor,
    },
    postsContainer: {
        gap: 24,
    },
    // Post Card
    postCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.borderColor,
        padding: 16,
        gap: 16,
    },
    postImageContainer: {
        width: '100%',
        height: 230,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        overflow: 'hidden',
    },
    postImage: {
        width: '100%',
        height: '100%',
    },
    postGridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    postGridImage: {
        width: (width - 40 - 32 - 8) / 2,
        height: 175,
        borderRadius: 0,
    },
    postGridImageTopLeft: {
        borderTopLeftRadius: 10,
    },
    postGridImageTopRight: {
        borderTopRightRadius: 10,
    },
    postGridRow: {
        flexDirection: 'row',
        gap: 8,
    },
    postInfoBar: {
        backgroundColor: colors.borderColor,
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 2,
    },
    postTitle: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
    },
    postDate: {
        ...Fonts.regular12,
        color: colors.subTextColor,
    },
    postDescription: {
        ...Fonts.regular12,
        color: colors.subTextColor,
        lineHeight: 20,
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primaryColor,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 6,
        alignSelf: 'flex-start',
    },
    shareButtonText: {
        ...Fonts.regular14,
        color: colors.pureWhite,
    },
});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
