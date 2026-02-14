import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { createStyles } from './BorderButtonStyles'
import Icons from '../../constants/Icons'
import SizeBox from '../../constants/SizeBox'
import { useTheme } from '../../context/ThemeContext'

interface BtnProps {
    title?: string;
    onPress?: any;
    isFilled?: boolean;
}

const BorderButton = ({ title, onPress, isFilled = false }: BtnProps) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    return (
        <TouchableOpacity activeOpacity={0.4} style={[Styles.btnContainre, isFilled && { backgroundColor: colors.primaryColor, borderRadius: 8 }]} onPress={onPress}>
            <Text style={[Styles.btnText, isFilled && { color: colors.pureWhite }]}>{title}</Text>
            <SizeBox width={6} />
            {
                isFilled ? <Icons.RightBtnIcon height={18} width={18} /> :
                    <Icons.RightBtnIconGrey height={18} width={18} />
            }
        </TouchableOpacity>
    )
}

export default BorderButton
