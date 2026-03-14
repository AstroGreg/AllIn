import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Text, Image, TouchableOpacity } from 'react-native';
import SizeBox from '../../../constants/SizeBox';
import { createStyles } from './Styles';
import Icons from '../../../constants/Icons';
import { useTheme } from '../../../context/ThemeContext';
const SocialBtn = ({ title, onPress, isGoogle, disabled = false }) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    return (_jsxs(TouchableOpacity, Object.assign({ style: [Styles.buttonContainer, disabled && { opacity: 0.5 }], onPress: onPress, activeOpacity: 0.7, disabled: disabled }, { children: [isGoogle ?
                _jsx(Image, { source: Icons.GoogleIcon, style: { height: 20, width: 20 } })
                : _jsx(Image, { source: Icons.AppleIcon, style: { height: 20, width: 20 } }), _jsx(SizeBox, { width: 8 }), _jsx(Text, Object.assign({ style: Styles.btnText }, { children: title }))] })));
};
export default SocialBtn;
