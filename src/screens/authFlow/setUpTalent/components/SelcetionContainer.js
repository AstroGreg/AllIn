import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, TouchableOpacity } from 'react-native';
import { createStyles } from '../AddTalentStyles';
import Icons from '../../../../constants/Icons';
import { useTheme } from '../../../../context/ThemeContext';
const SelcetionContainer = ({ title, icon, isSelected = false, onPress, isIcon = true, disabled = false, isRightAction = true, isDelete = false, onPressDelete }) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    return (_jsxs(TouchableOpacity, Object.assign({ disabled: disabled, onPress: onPress, activeOpacity: 0.7, style: [Styles.selectionContainer, isSelected && { borderColor: colors.primaryColor }] }, { children: [isIcon && icon, _jsx(Text, Object.assign({ style: Styles.titleText }, { children: title })), isRightAction && (isDelete ? (_jsx(TouchableOpacity, Object.assign({ onPress: onPressDelete, style: Styles.deleteBtn }, { children: _jsx(Icons.Trash, { height: 24, width: 24 }) }))) : (_jsx(View, Object.assign({ style: Styles.selectionBtn }, { children: isSelected && _jsx(View, { style: Styles.selectedBtn }) }))))] })));
};
export default SelcetionContainer;
