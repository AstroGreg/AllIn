import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

import { createStyles } from './StatusContainerStyles'
import Icons from '../../constants/Icons'
import { useTheme } from '../../context/ThemeContext';

interface StatusContainerProps {
    text?: string;
    isFixed?: boolean;
}

const StatusContainer = ({
    text,
    isFixed
}: StatusContainerProps) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    return (
        <View style={Styles.container}>
            <Text style={[Styles.text, !isFixed && { color: colors.pendingColor }]}>{text}</Text>
            {isFixed ? <Icons.GreenTick height={16} width={16} /> : <Icons.Pending height={16} width={16} />}
        </View>
    )
}


export default StatusContainer
