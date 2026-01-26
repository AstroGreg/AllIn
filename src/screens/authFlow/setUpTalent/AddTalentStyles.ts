import { StyleSheet } from "react-native";
import Fonts from "../../../constants/Fonts";
import { ThemeColors, lightColors } from "../../../constants/Theme";

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.backgroundColor,
    },
    contentContainer: {
        paddingHorizontal: 20
    },
    headingText: {
        ...Fonts.regular24,
        color: colors.mainTextColor,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 32,
    },
    subHeadingText: {
        ...Fonts.regular14,
        color: colors.grayColor,
        fontWeight: '400',
        textAlign: 'center'
    },
    containerTitle: {
        ...Fonts.regular16,
        color: colors.mainTextColor,
        fontWeight: '500',
    },
    talentContainer: {
        borderRadius: 10,
        paddingHorizontal: 16,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        backgroundColor: colors.cardBackground,
    },
    talentList: {
        marginLeft: 12
    },
    talentTypeTitle: {
        ...Fonts.regular12,
        color: colors.grayColor,
        fontWeight: '400',
    },
    separator: {
        height: 0.5,
        backgroundColor: colors.lightGrayColor,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },


    // Performer styles
    searchResultsText: {
        ...Fonts.regular14,
        color: colors.grayColor,
        fontWeight: '400',
    },


    // SelectionContainer
    selectionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 16,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        paddingVertical: 16,
        borderRadius: 10,
        marginBottom: 16,
        gap: 12,
        backgroundColor: colors.cardBackground,
    },
    titleText: {
        ...Fonts.regular14,
        color: colors.mainTextColor,
        fontWeight: '400',
    },
    selectionBtn: {
        height: 16,
        width: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.primaryColor,
        position: 'absolute',
        right: 16,
        alignItems: 'center',
        justifyContent: 'center'
    },
    selectedBtn: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: colors.primaryColor,
    },
    deleteBtn: {
        position: 'absolute',
        right: 16,
    },

    // TabBar Styles
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 38,
        height: 35,
        gap: 20
    },
    tabs: {
        height: '100%',
        borderBottomWidth: 3,
        borderBottomColor: colors.primaryColor,
        flex: 2,
        alignItems: 'center',
    },
    tabText: {
        ...Fonts.regular14,
        color: colors.grayColor,
        fontWeight: '400',
    },

    //Photography container styles
    photographyDetailsContainer: {
        paddingHorizontal: 16,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        paddingVertical: 16,
        borderRadius: 10,
        marginBottom: 16,
        gap: 12,
        backgroundColor: colors.cardBackground,
    },
    actionIcons: {
        alignSelf: 'flex-end',
        gap: 6,
    }
});

// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
