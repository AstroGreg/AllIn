import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { useState } from 'react';
import { createStyles } from './CustomTextInputStyles';
import SizeBox from '../../constants/SizeBox';
import Icons from '../../constants/Icons';
import { useTheme } from '../../context/ThemeContext';
const CustomTextInput = ({ label, subLabel, placeholder, icon, isPass = false, onChangeText, value, isIcon = true, keyboardType, isDown = false, autoCapitalize = 'sentences', hasError = false, showFloatingLabel = true, }) => {
    const [activeInput, setActiveInput] = useState(false);
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    return (_jsxs(_Fragment, { children: [_jsx(Text, Object.assign({ style: Styles.label }, { children: label })), subLabel && _jsx(SizeBox, { height: 4 }), subLabel && _jsx(Text, Object.assign({ style: Styles.subLabel }, { children: subLabel })), _jsxs(View, Object.assign({ style: [
                    Styles.inputContainer,
                    hasError && { borderColor: colors.errorColor },
                    activeInput && !hasError && { borderColor: colors.primaryColor },
                ] }, { children: [isIcon && icon, _jsx(SizeBox, { width: isIcon ? 10 : 0 }), _jsxs(View, Object.assign({ style: [Styles.inputBox, isPass && { width: '80%' }] }, { children: [activeInput && showFloatingLabel && _jsx(Text, Object.assign({ style: Styles.inputTitle }, { children: label })), _jsx(TextInput, { placeholder: activeInput ? '' : placeholder, placeholderTextColor: colors.grayColor, style: [Styles.input, (!activeInput || !showFloatingLabel) && { height: '100%' }], onFocus: () => setActiveInput(true), onBlur: () => setActiveInput(false), secureTextEntry: isPass ? secureTextEntry : false, value: value, onChangeText: onChangeText, keyboardType: keyboardType ? keyboardType : 'default', editable: isDown ? false : true, autoCapitalize: autoCapitalize })] })), isPass &&
                        _jsx(TouchableOpacity, Object.assign({ style: Styles.eyeIcon, onPress: () => setSecureTextEntry(!secureTextEntry) }, { children: secureTextEntry ?
                                _jsx(Icons.HidePassword, { height: 20, width: 20 }) :
                                _jsx(Image, { source: Icons.ShowPassword, style: { height: 20, width: 20 } }) })), isDown &&
                        _jsx(TouchableOpacity, Object.assign({ style: Styles.eyeIcon, onPress: () => { } }, { children: _jsx(Icons.Dropdown, { height: 20, width: 20 }) }))] }))] }));
};
export default CustomTextInput;
