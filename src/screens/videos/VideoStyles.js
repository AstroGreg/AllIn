import { Dimensions, StyleSheet } from "react-native";
import Fonts from "../../constants/Fonts";
const { width, height } = Dimensions.get('window');
export const createStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundColor,
    },
    video: {
        width: '100%',
        height: '100%',
    },
    topHeader: {
        height: 52,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: Object.assign(Object.assign({}, Fonts.regular16), { color: colors.mainTextColor, fontWeight: '500' }),
    subtitle: Object.assign(Object.assign({}, Fonts.regular12), { color: colors.mainTextColor, fontWeight: '400' }),
    rightActions: {
        position: 'absolute',
        right: 20,
        top: '35%',
        alignItems: 'center',
    },
    actionButton: {
        marginVertical: 12,
        backgroundColor: colors.secondaryColor,
        padding: 10,
        borderRadius: 30,
    },
    bottomControls: {
        position: 'absolute',
        bottom: 60,
        width: width,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    playButton: {
        backgroundColor: 'rgba(0,0,0,0.25)',
        borderRadius: 48,
        padding: 10,
    },
    progressContainer: {
        position: 'absolute',
        bottom: 140,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    progressBar: {
        flex: 1,
        marginHorizontal: 0,
        height: 40,
    },
    timeText: Object.assign({ color: colors.mainTextColor }, Fonts.regular12),
});
