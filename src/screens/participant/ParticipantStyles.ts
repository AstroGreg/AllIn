import { StyleSheet } from "react-native";
import { ThemeColors, lightColors } from '../../constants/Theme';
import Fonts from "../../constants/Fonts";

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.whiteColor
    },
    container: {
        paddingHorizontal: 20
    },
    rowCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },


    //Participant Container
    participantCont: {
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16
    },
    imgContainer: {
        height: 36,
        width: 36,
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 0.5,
        borderColor: colors.primaryColor
    },
    img: {
        height: '100%',
        width: '100%'
    },
    userNameText: {
        ...Fonts.regular14,
        fontWeight: '500',
        color: colors.mainTextColor
    },
    viewProfileBtn: {
        position: 'absolute',
        right: 16,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    btnText: {
        ...Fonts.regular12,
        fontWeight: '400',
        color: colors.primaryColor
    },
    sportsName: {
        ...Fonts.regular16,
        fontWeight: '500',
        color: colors.mainTextColor
    },
    subSportsName: {
        ...Fonts.regular12,
        fontWeight: '400',
        color: colors.grayColor
    }
})

const Styles = createStyles(lightColors);

export default Styles;