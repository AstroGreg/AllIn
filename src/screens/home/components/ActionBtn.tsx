import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import SizeBox from '../../../constants/SizeBox';
import { createStyles } from '../HomeStyles';
import { useTheme } from '../../../context/ThemeContext';

interface ActionBtnProps {
    title?: string;
    onPress?: any;
    action?: string;
    icon?: any
}

const ActionBtn = ({ title, action, onPress, icon }: ActionBtnProps) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <TouchableOpacity activeOpacity={0.4} style={styles.btnContainre} onPress={onPress}>
            <Text style={styles.btnText}>{title}</Text>
            <SizeBox width={6} />
            {icon}

        </TouchableOpacity>
    )
}

export default ActionBtn
