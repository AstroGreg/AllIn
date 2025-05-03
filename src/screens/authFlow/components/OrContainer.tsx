import { View, Text } from 'react-native'
import React from 'react'
import Styles from './Styles'

const OrContainer = () => {
    return (
        <View style={Styles.orContainer}>
            <View style={Styles.grayLines} />
            <Text style={Styles.orText}>Or</Text>
            <View style={Styles.grayLines} />
        </View>
    )
}

export default OrContainer