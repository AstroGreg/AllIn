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
        width: 320,
        height: 320,
        // The logo asset has large transparent padding at the bottom.
        marginBottom: -80,
    },
    wordmark: {
        marginTop: 0,
        color: '#FFFFFF',
        fontSize: 40,
        fontWeight: '800',
        letterSpacing: 0.6,
    },
});

const Styles = createStyles(lightColors);

export default Styles;
