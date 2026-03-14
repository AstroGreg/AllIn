import { StyleSheet } from "react-native";
import { ThemeColors, lightColors } from '../../constants/Theme';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 300,
        height: 360,
    },
});

const Styles = createStyles(lightColors);

export default Styles;
