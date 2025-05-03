import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import SizeBox from '../../../constants/SizeBox';
import Icons from '../../../constants/Icons';
import Styles from '../HomeStyles';

interface ActionBtnProps {
    title?: string;
    onPress?: any;
    action?: string;
    icon?: any
}

const ActionBtn = ({ title, action, onPress, icon }: ActionBtnProps) => {
    return (
        <TouchableOpacity activeOpacity={0.4} style={Styles.btnContainre} onPress={onPress}>
            <Text style={Styles.btnText}>{title}</Text>
            <SizeBox width={6} />
            {icon}

        </TouchableOpacity>
    )
}

export default ActionBtn