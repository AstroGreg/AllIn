import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Text, TouchableOpacity } from 'react-native';
import { createStyles } from './BorderButtonStyles';
import Icons from '../../constants/Icons';
import SizeBox from '../../constants/SizeBox';
import { useTheme } from '../../context/ThemeContext';
const BorderButton = ({ title, onPress, isFilled = false }) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    return (_jsxs(TouchableOpacity, Object.assign({ activeOpacity: 0.4, style: [Styles.btnContainre, isFilled && { backgroundColor: colors.primaryColor, borderRadius: 8 }], onPress: onPress }, { children: [_jsx(Text, Object.assign({ style: [Styles.btnText, isFilled && { color: colors.pureWhite }] }, { children: title })), _jsx(SizeBox, { width: 6 }), isFilled ? _jsx(Icons.RightBtnIcon, { height: 18, width: 18 }) :
                _jsx(Icons.RightBtnIconGrey, { height: 18, width: 18 })] })));
};
export default BorderButton;
