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
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 24,
    },
    sectionTitle: {
        ...Fonts.medium18,
        color: Colors.mainTextColor,
    },
    postsContainer: {
        gap: 24,
    },
    // Post Card
    postCard: {
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
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
        backgroundColor: '#E0ECFE',
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 2,
    },
    postTitle: {
        ...Fonts.medium14,
        color: Colors.mainTextColor,
    },
    postDate: {
        ...Fonts.regular12,
        color: '#9B9F9F',
    },
    postDescription: {
        ...Fonts.regular12,
        color: '#9B9F9F',
        lineHeight: 20,
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primaryColor,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 6,
        alignSelf: 'flex-start',
    },
    shareButtonText: {
        ...Fonts.regular14,
        color: Colors.whiteColor,
    },
});

export default Styles;
