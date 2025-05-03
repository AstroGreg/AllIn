import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import SizeBox from '../../../constants/SizeBox'
import Styles from './Styles'
import Icons from '../../../constants/Icons';

interface SocialBtnProps {
    title: string;
    onPress: any;
    isGoogle: boolean;
}

const SocialBtn = ({ title, onPress, isGoogle }: SocialBtnProps) => {
    return (
        <TouchableOpacity style={Styles.buttonContainer} onPress={onPress} activeOpacity={0.7}>
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