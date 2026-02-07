import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { createStyles } from './Styles'
import Icons from '../../../constants/Icons';
import SizeBox from '../../../constants/SizeBox';
import { useTheme } from '../../../context/ThemeContext'

interface LanguageContainerProps {
    title: string;
    onPress: any;
    isSelected?: any;
}

const LanguageContainer = ({ title, onPress, isSelected }: LanguageContainerProps) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    return (
        <TouchableOpacity activeOpacity={0.7} style={[Styles.languageContainer, isSelected && { borderColor: colors.primaryColor }]} onPress={onPress}>
            <SizeBox height={22} />
            {title === 'English' ? <Icons.English height={90} width={90} /> : <Icons.Dutch height={90} width={90} />}
            <SizeBox height={10} />
            <Text style={Styles.lngText}>{title}</Text>
            <SizeBox height={22} />
        </TouchableOpacity>
    )
}

export default LanguageContainer