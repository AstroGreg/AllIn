import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import Styles from './CustomButtonStyle'
import Icons from '../../constants/Icons'
import SizeBox from '../../constants/SizeBox'

interface CustomButtonProps {
    title: string;
    onPress: any;
    isSmall?: boolean;
    isAdd?: boolean;
}

const CustomButton = ({
    title,
    onPress,
    isSmall = false,
    isAdd = false
}: CustomButtonProps) => {
    return (
        <TouchableOpacity style={[Styles.buttonContainer, isSmall && { height: 48 }]} activeOpacity={0.7} onPress={onPress}>
            <Text style={Styles.btnText}>{title}</Text>
            <SizeBox width={8} />
            {isAdd ? <Icons.AddWhite height={20} width={20} />
                : <Icons.RightBtnIcon height={20} width={20} />}
        </TouchableOpacity>
    )
}

export default CustomButton