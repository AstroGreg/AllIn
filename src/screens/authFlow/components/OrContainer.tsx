import { View, Text } from 'react-native'
import React from 'react'
import { createStyles } from './Styles'
import { useTheme } from '../../../context/ThemeContext'
import { useTranslation } from 'react-i18next'

const OrContainer = () => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    return (
        <View style={Styles.orContainer}>
            <View style={Styles.grayLines} />
            <Text style={Styles.orText}>{t('Or')}</Text>
            <View style={Styles.grayLines} />
        </View>
    )
}

export default OrContainer