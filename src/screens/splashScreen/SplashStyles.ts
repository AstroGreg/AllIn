import { StyleSheet } from "react-native";
import { ThemeColors, lightColors } from '../../constants/Theme';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    foreground: {
        width: 320,
        height: 372,
    },
});

const Styles = createStyles(lightColors);

export default Styles;
