import { jsx as _jsx } from "react/jsx-runtime";
import { TouchableOpacity } from 'react-native';
import React from 'react';
import { createStyles } from './CheckBoxStyle';
import Icons from '../../constants/Icons';
import { useTheme } from '../../context/ThemeContext';
const CheckBox = ({ onPressCheckBox, isChecked }) => {
    const [internalChecked, setInternalChecked] = React.useState(false);
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    // Use external isChecked if provided, otherwise use internal state
    const checked = isChecked !== undefined ? isChecked : internalChecked;
    const handlePress = () => {
        if (isChecked === undefined) {
            setInternalChecked(!internalChecked);
        }
        onPressCheckBox(!checked);
    };
    return (_jsx(TouchableOpacity, Object.assign({ style: Styles.checkBoxContainer, onPress: handlePress }, { children: checked && _jsx(Icons.CheckBox, { height: 15, width: 15 }) })));
};
export default CheckBox;
