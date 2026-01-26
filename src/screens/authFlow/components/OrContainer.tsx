import { View, Text } from 'react-native'
import React from 'react'
import { createStyles } from './Styles'
import { useTheme } from '../../../context/ThemeContext'

const OrContainer = () => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    return (
        <View style={Styles.orContainer}>
            <View style={Styles.grayLines} />
            <Text style={Styles.orText}>Or</Text>
            <View style={Styles.grayLines} />
        </View>
    )
}

export default OrContainer