import { StyleSheet } from 'react-native';
import Colors from '../../../constants/Colors';
import Fonts from '../../../constants/Fonts';

const styles = StyleSheet.create({
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
        color: '#171717',
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    searchLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    searchLabel: {
        ...Fonts.semibold14,
        color: '#171717',
    },
    addFaceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0088FF',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        gap: 4,
    },
    addFaceButtonText: {
        ...Fonts.regular12,
        color: Colors.whiteColor,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7FAFF',
        borderWidth: 0.5,
        borderColor: '#E0ECFE',
        borderRadius: 10,
        paddingHorizontal: 16,
        height: 54,
    },
    searchInput: {
        flex: 1,
        ...Fonts.regular14,
        color: Colors.mainTextColor,
    },
    faceGroupCard: {
        borderWidth: 1,
        borderColor: '#F3EAEA',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 24,
    },
    faceGroupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    faceGroupName: {
        ...Fonts.semibold18,
        color: '#171717',
    },
    selectButton: {
        backgroundColor: Colors.primaryColor,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
    },
    selectButtonActive: {
        backgroundColor: '#0088FF',
    },
    selectButtonText: {
        ...Fonts.regular12,
        color: Colors.whiteColor,
    },
    faceImagesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    faceImageWrapper: {
        width: 58,
        height: 58,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.primaryColor,
        overflow: 'hidden',
    },
    faceImage: {
        width: '100%',
        height: '100%',
    },
    bottomButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingTop: 16,
        backgroundColor: Colors.whiteColor,
    },
    continueButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primaryColor,
        height: 54,
        borderRadius: 10,
        gap: 8,
    },
    continueButtonDisabled: {
        backgroundColor: '#B0D4FF',
    },
    continueButtonText: {
        ...Fonts.medium16,
        color: Colors.whiteColor,
    },
});

export default styles;
