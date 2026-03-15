import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, TextInput } from 'react-native';
import { createStyles } from '../MenuStyles';
import { useTheme } from '../../../context/ThemeContext';
const AddCardTextInput = ({ placeholder, value, onChangeText, label, keyboardType = 'default', isCVV = false, isHalf = false, maxLength }) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    return (_jsxs(View, Object.assign({ style: [Styles.textInputContainer, isHalf && { flex: 0.484 }] }, { children: [_jsx(Text, Object.assign({ style: [Styles.btnText, { textAlign: isCVV ? 'right' : 'left', }] }, { children: label })), _jsx(TextInput, { style: [Styles.textInput, isCVV && { textAlign: 'right', }], placeholder: placeholder, value: value, onChangeText: onChangeText, placeholderTextColor: colors.grayColor, keyboardType: keyboardType ? keyboardType : 'default', secureTextEntry: isCVV ? true : false, maxLength: maxLength })] })));
};
export default AddCardTextInput;
