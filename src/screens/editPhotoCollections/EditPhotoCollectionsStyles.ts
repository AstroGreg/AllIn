import { StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';
import Fonts from '../../constants/Fonts';

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
    headerSwitchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: '#EFF4FF',
    },
    headerSwitchText: {
        ...Fonts.regular14,
        color: Colors.primaryColor,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        ...Fonts.medium18,
        color: Colors.mainTextColor,
        flex: 1,
    },
    selectTopButton: {
        backgroundColor: Colors.primaryColor,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        height: 38,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectTopButtonText: {
        ...Fonts.regular14,
        color: Colors.whiteColor,
    },
    cancelButton: {
        backgroundColor: '#FDCCCC',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        height: 38,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        ...Fonts.regular14,
        color: '#FF0000',
    },
    addButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primaryColor,
        height: 54,
        borderRadius: 10,
        gap: 8,
    },
    addButtonText: {
        ...Fonts.medium16,
        color: Colors.whiteColor,
    },
    deleteButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FDCCCC',
        borderWidth: 1,
        borderColor: '#FFA2A2',
        height: 54,
        borderRadius: 10,
        gap: 8,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    deleteButtonText: {
        ...Fonts.medium16,
        color: '#FF0000',
    },
    photosContainer: {
        borderWidth: 0.5,
        borderColor: '#DEDEDE',
        borderRadius: 10,
        padding: 12,
    },
    photosGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    photoImage: {
        height: 124,
        borderRadius: 4,
    },
    photoImageContainer: {
        height: 126,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'transparent',
        overflow: 'hidden',
    },
    photoImageContainerSelected: {
        borderColor: Colors.primaryColor,
        borderWidth: 1,
    },
    photoImageContainerSelectedDelete: {
        borderColor: '#FF0000',
        borderWidth: 1,
    },
    selectionBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 16,
        height: 16,
        borderRadius: 4,
        backgroundColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectionBadgeDelete: {
        backgroundColor: '#FF0000',
    },
    selectionBadgeText: {
        fontSize: 11,
        color: Colors.whiteColor,
        fontWeight: '400',
    },
    confirmDeleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF0000',
        height: 54,
        borderRadius: 10,
        gap: 8,
    },
    confirmDeleteButtonText: {
        ...Fonts.medium16,
        color: Colors.whiteColor,
    },
    confirmTopButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primaryColor,
        height: 54,
        borderRadius: 10,
        gap: 8,
    },
    confirmTopButtonText: {
        ...Fonts.medium16,
        color: Colors.whiteColor,
    },
});

export default Styles;
