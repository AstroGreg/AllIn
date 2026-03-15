import { StyleSheet } from 'react-native';
import Fonts from '../../constants/Fonts';
import { lightColors } from '../../constants/Theme';
export const createStyles = (colors) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(17, 17, 17, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: colors.modalBackground,
        borderRadius: 16,
        padding: 16,
        width: '90%',
        maxWidth: 390,
    },
    closeButton: {
        alignSelf: 'flex-end',
    },
    inputContainer: {
        marginTop: 8,
        width: '100%',
    },
    inputLabel: Object.assign(Object.assign({}, Fonts.medium14), { color: colors.mainTextColor, marginBottom: 8 }),
    selectInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.secondaryColor,
        borderWidth: 0.5,
        borderColor: colors.borderColor,
        borderRadius: 10,
        paddingHorizontal: 16,
        height: 54,
    },
    selectInputContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    selectInputText: Object.assign(Object.assign({}, Fonts.regular14), { color: colors.grayColor }),
    buttonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 16,
        gap: 16,
    },
    addMoreButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.5,
        borderColor: colors.borderColor,
        borderRadius: 10,
        height: 54,
        gap: 8,
    },
    addMoreButtonText: Object.assign(Object.assign({}, Fonts.medium16), { color: colors.subTextColor }),
    saveButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primaryColor,
        borderRadius: 10,
        height: 54,
        gap: 8,
    },
    saveButtonText: Object.assign(Object.assign({}, Fonts.medium16), { color: colors.pureWhite }),
});
// Backward compatibility
const Styles = createStyles(lightColors);
export default Styles;
