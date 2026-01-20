import { StyleSheet, Dimensions } from 'react-native';
import Colors from '../../constants/Colors';
import Fonts from '../../constants/Fonts';

const { width } = Dimensions.get('window');

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
        borderColor: Colors.primaryColor,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    blogTitle: {
        ...Fonts.medium16,
        color: Colors.mainTextColor,
        flex: 1,
    },
    blogDate: {
        ...Fonts.regular14,
        color: '#9B9F9F',
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
        color: '#777777',
    },
    writerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
    },
    writerLabel: {
        ...Fonts.regular14,
        color: '#777777',
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
        color: Colors.mainTextColor,
    },
    description: {
        ...Fonts.regular12,
        color: '#9B9F9F',
        lineHeight: 20,
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primaryColor,
        borderRadius: 10,
        paddingVertical: 16,
        gap: 8,
    },
    shareButtonText: {
        ...Fonts.medium16,
        color: Colors.whiteColor,
    },
});

export default Styles;
