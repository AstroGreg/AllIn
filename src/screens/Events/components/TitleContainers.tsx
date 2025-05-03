import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import Styles from '../EventsStyles';

interface TitleContainersProps {
    title?: string;
    onActionPress?: any;
}

const TitleContainers = ({ title, onActionPress }: TitleContainersProps) => {
    return (
        <View style={[Styles.rowCenter, { paddingHorizontal: 20 }]}>
            <Text style={Styles.titleText}>{title}</Text>
            <TouchableOpacity onPress={onActionPress}>
                <Text style={Styles.actionText}>View all</Text>
            </TouchableOpacity>
        </View>
    )
}

export default TitleContainers