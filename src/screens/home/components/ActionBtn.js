import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Text, TouchableOpacity } from 'react-native';
import SizeBox from '../../../constants/SizeBox';
import { createStyles } from '../HomeStyles';
import { useTheme } from '../../../context/ThemeContext';
const ActionBtn = ({ title, action, onPress, icon }) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    return (_jsxs(TouchableOpacity, Object.assign({ activeOpacity: 0.4, style: styles.btnContainre, onPress: onPress }, { children: [_jsx(Text, Object.assign({ style: styles.btnText }, { children: title })), _jsx(SizeBox, { width: 6 }), icon] })));
};
export default ActionBtn;
