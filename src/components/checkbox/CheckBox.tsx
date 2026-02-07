import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import Styles from './CheckBoxStyle'
import Icons from '../../constants/Icons'

interface CheckBoxProps {
    onPressCheckBox: (checked?: boolean) => void;
    isChecked?: boolean;
}

const CheckBox = ({ onPressCheckBox, isChecked }: CheckBoxProps) => {
    const [internalChecked, setInternalChecked] = React.useState(false);

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