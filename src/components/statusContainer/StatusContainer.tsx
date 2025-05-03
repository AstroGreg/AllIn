import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

import Styles from './StatusContainerStyles'
import Icons from '../../constants/Icons'
import Colors from '../../constants/Colors';

interface StatusContainerProps {
    text?: string;
    isFixed?: boolean;
}

const StatusContainer = ({
    text,
    isFixed
}: StatusContainerProps) => {
    return (
        <View style={Styles.container}>
            <Text style={[Styles.text, !isFixed && { color: Colors.pendingColor }]}>{text}</Text>
            {isFixed ? <Icons.GreenTick height={16} width={16} /> : <Icons.Pending height={16} width={16} />}
        </View>
    )
}


export default StatusContainer