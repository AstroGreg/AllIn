import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import SizeBox from '../../../constants/SizeBox'
import { createStyles } from './Styles'
import Icons from '../../../constants/Icons';
import { useTheme } from '../../../context/ThemeContext'

interface SocialBtnProps {
    title: string;
    onPress: any;
    isGoogle: boolean;
    disabled?: boolean;
}

const SocialBtn = ({ title, onPress, isGoogle, disabled = false }: SocialBtnProps) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    return (
        <TouchableOpacity style={[Styles.buttonContainer, disabled && { opacity: 0.5 }]} onPress={onPress} activeOpacity={0.7} disabled={disabled}>
            {isGoogle ?
                <Image source={Icons.GoogleIcon} style={{ height: 20, width: 20 }} />
                : <Image source={Icons.AppleIcon} style={{ height: 20, width: 20 }} />
            }
            <SizeBox width={8} />
            <Text style={Styles.btnText}>{title}</Text>

        </TouchableOpacity>
    )
}

export default SocialBtn;