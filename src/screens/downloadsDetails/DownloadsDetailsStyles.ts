import { StyleSheet, Dimensions } from 'react-native';
import Colors from '../../constants/Colors';
import Fonts from '../../constants/Fonts';

const { width } = Dimensions.get('window');
const cardWidth = (width - 40 - 16) / 2; // 40 = horizontal padding, 16 = gap between cards

const Styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.whiteColor,
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
    headerTitle: {
        ...Fonts.medium18,
        color: Colors.mainTextColor,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },

    // Total Profit Card
    totalProfitCard: {
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        padding: 12,
    },
    totalProfitHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    totalProfitLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    iconCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: Colors.whiteColor,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        alignItems: 'center',
        justifyContent: 'center',
    },
    totalProfitLabel: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        borderRadius: 6,
        paddingHorizontal: 16,
        paddingVertical: 6,
        height: 32,
    },
    downloadButtonText: {
        ...Fonts.regular14,
        color: '#9B9F9F',
    },
    totalProfitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    totalProfitAmount: {
        ...Fonts.medium16,
        color: Colors.mainTextColor,
    },
    downloadsStatsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    downloadsCountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    downloadsCountLabel: {
        fontSize: 10,
        fontFamily: 'Inter-Regular',
        color: '#9B9F9F',
        lineHeight: 18,
    },
    downloadsCountValue: {
        ...Fonts.medium16,
        color: Colors.mainTextColor,
    },
    percentageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    percentageText: {
        fontSize: 10,
        fontFamily: 'Inter-Regular',
        color: '#9B9F9F',
        lineHeight: 18,
    },

    // Stats Cards Row
    statsCardsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
        gap: 22,
    },
    statsCard: {
        flex: 1,
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        padding: 12,
    },
    statsCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statsCardTitle: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    statsCardContent: {
        marginTop: 8,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statsColumn: {
        gap: 4,
    },
    statsColumnEnd: {
        gap: 4,
        alignItems: 'flex-end',
    },
    statsLabel: {
        fontSize: 10,
        fontFamily: 'Inter-Regular',
        color: '#9B9F9F',
        lineHeight: 18,
    },
    statsValue: {
        ...Fonts.medium16,
        color: Colors.mainTextColor,
    },
    totalEarningsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },

    // Recent Downloads Section
    recentDownloadsSection: {
        marginTop: 24,
    },
    recentDownloadsTitle: {
        ...Fonts.medium18,
        color: Colors.mainTextColor,
    },
    downloadCardsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 16,
        rowGap: 16,
    },
    downloadCard: {
        width: cardWidth,
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        padding: 16,
    },
    downloadCardImage: {
        width: '100%',
        height: 104,
        borderRadius: 4,
    },
    downloadCardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    downloadCardLeft: {
        justifyContent: 'space-between',
        height: 50,
    },
    downloadCardRight: {
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 50,
    },
    downloadCardPrice: {
        fontSize: 12,
        fontFamily: 'Inter-SemiBold',
        fontWeight: '600',
        color: Colors.mainTextColor,
        lineHeight: 20,
    },
    downloadCardResolution: {
        ...Fonts.regular12,
        color: Colors.mainTextColor,
    },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: Colors.primaryColor,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    viewButtonText: {
        fontSize: 8,
        fontFamily: 'Inter-Regular',
        color: Colors.whiteColor,
        lineHeight: 12,
    },
    downloadIconButton: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default Styles;
