import { StyleSheet } from "react-native";
import Fonts from "../../constants/Fonts";
export const createStyles = (colors) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.backgroundColor
    },
    container: {
    // paddingHorizontal: 20
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    right: {
        position: 'absolute',
        right: 16
    },
    // TitleContainers
    rowCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    titleText: Object.assign(Object.assign({}, Fonts.regular16), { fontWeight: '500', color: colors.mainTextColor }),
    actionText: Object.assign(Object.assign({}, Fonts.regular12), { fontWeight: '400', color: colors.subTextColor }),
    // Featured Events Container
    featuredEventsContinaer: {
        padding: 16,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        maxWidth: 253,
        marginRight: 20,
    },
    imgContainer: {
        height: 115,
        width: 221,
        borderRadius: 6,
        overflow: 'hidden'
    },
    images: {
        height: '100%',
        width: '100%'
    },
    CompetitionName: Object.assign(Object.assign({}, Fonts.regular14), { fontWeight: '500', color: colors.mainTextColor }),
    // SimilarEvents
    similarEvents: {
        padding: 16,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        marginBottom: 16,
        maxHeight: 106,
        flexDirection: 'row',
        marginHorizontal: 20,
        alignItems: 'center'
    },
    eventImg: {
        height: 74,
        width: 74,
        borderRadius: 4,
        overflow: 'hidden'
    },
});
