import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, TouchableOpacity } from 'react-native';
import { createStyles } from '../MenuStyles';
import Icons from '../../../constants/Icons';
import SizeBox from '../../../constants/SizeBox';
import CustomSwitch from '../../../components/customSwitch/CustomSwitch';
import { useTheme } from '../../../context/ThemeContext';
const MenuContainers = ({ title, icon, onPress, isNext = true, isSelected, isSwitch = false, isEnabled, toggleSwitch, testID }) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    return (_jsxs(TouchableOpacity, Object.assign({ activeOpacity: 0.7, onPress: isSwitch ? toggleSwitch : onPress, style: Styles.menuContainer, testID: testID }, { children: [_jsx(View, Object.assign({ style: Styles.iconCont }, { children: icon })), _jsx(SizeBox, { width: 20 }), _jsx(Text, Object.assign({ style: Styles.titlesText }, { children: title })), _jsx(View, Object.assign({ style: Styles.nextArrow }, { children: isSwitch ? _jsx(CustomSwitch, { isEnabled: isEnabled, toggleSwitch: toggleSwitch }) :
                    isNext ? _jsx(Icons.ArrowNext, { height: 24, width: 24 }) :
                        _jsx(View, Object.assign({ style: Styles.selectionContainer }, { children: isSelected && _jsx(View, { style: Styles.selected }) })) }))] })));
};
export default MenuContainers;
