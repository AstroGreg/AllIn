import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import Styles from './BorderButtonStyles'
import Icons from '../../constants/Icons'
import SizeBox from '../../constants/SizeBox'
import Colors from '../../constants/Colors'

interface BtnProps {
    title?: string;
    onPress?: any;
    isFilled?: boolean;
}

const BorderButton = ({ title, onPress, isFilled = false }: BtnProps) => {
    return (
        <TouchableOpacity activeOpacity={0.4} style={[Styles.btnContainre, isFilled && { backgroundColor: Colors.primaryColor, borderRadius: 8 }]} onPress={onPress}>
            <Text style={[Styles.btnText, isFilled && { color: Colors.whiteColor }]}>{title}</Text>
            <SizeBox width={6} />
            {
                isFilled ? <Icons.RightBtnIcon height={18} width={18} /> :
                    <Icons.RightBtnIconGrey height={18} width={18} />
            }
        </TouchableOpacity>
    )
}

export default BorderButton