import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, TouchableOpacity } from 'react-native';
import { createStyles } from './CustomHeaderStyles';
import SizeBox from '../../constants/SizeBox';
import Icons from '../../constants/Icons';
import { useTheme } from '../../context/ThemeContext';
const CustomHeader = ({ title, onBackPress, isBack = true, onPressSetting, isSetting = true }) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    return (_jsxs(View, Object.assign({ style: Styles.headerContainer }, { children: [isBack && _jsx(TouchableOpacity, Object.assign({ style: [Styles.settingBtn, { left: 20 }], onPress: onBackPress }, { children: _jsx(Icons.BackArrow, { height: 24, width: 24 }) })), _jsx(SizeBox, { width: 10 }), _jsx(Text, Object.assign({ style: Styles.title }, { children: title })), isSetting && _jsx(TouchableOpacity, Object.assign({ style: Styles.settingBtn, onPress: onPressSetting }, { children: _jsx(Icons.Setting, { height: 24, width: 24 }) }))] })));
};
export default CustomHeader;
