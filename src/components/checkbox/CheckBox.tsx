import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import Styles from './CheckBoxStyle'
import Icons from '../../constants/Icons'

const CheckBox = ({ onPressCheckBox }: any) => {
    const [checked, setChecked] = React.useState(false);

    return (
        <TouchableOpacity style={Styles.checkBoxContainer} onPress={() => { setChecked(!checked); onPressCheckBox(checked) }}>
            {checked && <Icons.CheckBox height={15} width={15} />}
        </TouchableOpacity>
    )
}

export default CheckBox