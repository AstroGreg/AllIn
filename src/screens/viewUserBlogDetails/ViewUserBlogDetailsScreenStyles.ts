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
        paddingTop: 24,
    },
    blogImage: {
        width: '100%',
        height: 230,
        borderRadius: 10,
    },
    galleryContainer: {
        gap: 8,
    },
    galleryImage: {
        width: 64,
        height: 64,
        borderRadius: 6,
    },
    galleryImageSelected: {
        borderWidth: 2,
        borderColor: colors.primaryColor,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    blogTitle: {
        ...Fonts.medium16,
        color: colors.mainTextColor,
        flex: 1,
    },
    blogDate: {
        ...Fonts.regular14,
        color: colors.subTextColor,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    readCountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    readCountText: {
        ...Fonts.regular14,
        color: colors.grayColor,
    },
    writerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
    },
    writerLabel: {
        ...Fonts.regular14,
        color: colors.grayColor,
    },
    writerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    writerImage: {
        width: 24,
        height: 24,
        borderRadius: 12,
    },
    writerName: {
        ...Fonts.medium14,
        color: colors.mainTextColor,
    },
    description: {
        ...Fonts.regular12,
        color: colors.subTextColor,
        lineHeight: 20,
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primaryColor,
        borderRadius: 10,
        paddingVertical: 16,
        gap: 8,
    },
    shareButtonText: {
        ...Fonts.medium16,
        color: colors.pureWhite,
    },
});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
