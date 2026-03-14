import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Text, TouchableOpacity } from 'react-native';
import { createStyles } from './Styles';
import Icons from '../../../constants/Icons';
import SizeBox from '../../../constants/SizeBox';
import { useTheme } from '../../../context/ThemeContext';
const LanguageContainer = ({ title, onPress, isSelected }) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    return (_jsxs(TouchableOpacity, Object.assign({ activeOpacity: 0.7, style: [Styles.languageContainer, isSelected && { borderColor: colors.primaryColor }], onPress: onPress }, { children: [_jsx(SizeBox, { height: 22 }), title === 'English' ? _jsx(Icons.English, { height: 90, width: 90 }) : _jsx(Icons.Dutch, { height: 90, width: 90 }), _jsx(SizeBox, { height: 10 }), _jsx(Text, Object.assign({ style: Styles.lngText }, { children: title })), _jsx(SizeBox, { height: 22 })] })));
};
export default LanguageContainer;
