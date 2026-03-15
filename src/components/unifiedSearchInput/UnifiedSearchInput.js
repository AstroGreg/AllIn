var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { TextInput, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { createStyles } from './UnifiedSearchInputStyles';
const UnifiedSearchInput = forwardRef((_a, ref) => {
    var { left, right, containerStyle, contentStyle, inputStyle, placeholderTextColor } = _a, rest = __rest(_a, ["left", "right", "containerStyle", "contentStyle", "inputStyle", "placeholderTextColor"]);
    const { colors } = useTheme();
    const styles = createStyles(colors);
    return (_jsxs(View, Object.assign({ style: [styles.container, containerStyle] }, { children: [_jsxs(View, Object.assign({ style: [styles.content, contentStyle] }, { children: [left, _jsx(TextInput, Object.assign({ ref: ref, style: [styles.input, inputStyle], placeholderTextColor: placeholderTextColor !== null && placeholderTextColor !== void 0 ? placeholderTextColor : colors.subTextColor, autoCorrect: false, autoCapitalize: "none" }, rest))] })), right] })));
});
UnifiedSearchInput.displayName = 'UnifiedSearchInput';
export default UnifiedSearchInput;
