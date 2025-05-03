import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import Styles from './Styles'
import Icons from '../../../constants/Icons';
import SizeBox from '../../../constants/SizeBox';
import Colors from '../../../constants/Colors';

interface LanguageContainerProps {
    title: string;
    onPress: any;
    isSelected?: any;
}

const LanguageContainer = ({ title, onPress, isSelected }: LanguageContainerProps) => {
    return (
        <TouchableOpacity activeOpacity={0.7} style={[Styles.languageContainer, isSelected && { borderColor: Colors.primaryColor }]} onPress={onPress}>
            <SizeBox height={22} />
            {title === 'English' ? <Icons.English height={90} width={90} /> : <Icons.Dutch height={90} width={90} />}
            <SizeBox height={10} />
            <Text style={Styles.lngText}>{title}</Text>
            <SizeBox height={22} />
        </TouchableOpacity>
    )
}

export default LanguageContainer