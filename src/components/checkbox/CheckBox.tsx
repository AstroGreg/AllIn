import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { createStyles } from './CheckBoxStyle'
import Icons from '../../constants/Icons'
import { useTheme } from '../../context/ThemeContext'

interface CheckBoxProps {
    onPressCheckBox: (checked?: boolean) => void;
    isChecked?: boolean;
}

const CheckBox = ({ onPressCheckBox, isChecked }: CheckBoxProps) => {
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

    return (
        <TouchableOpacity style={Styles.checkBoxContainer} onPress={handlePress}>
            {checked && <Icons.CheckBox height={15} width={15} />}
        </TouchableOpacity>
    )
}

export default CheckBox
