import { View, Text, TextInput } from 'react-native'
import React from 'react'
import Styles from './CustomSearchStyles'
import Icons from '../../constants/Icons'
import Colors from '../../constants/Colors';

interface CustomSearchProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
}

const CustomSearch = ({
    value,
    onChangeText,
    placeholder
}: CustomSearchProps) => {
    return (
        <View style={Styles.searchContainer}>
            <Icons.Search height={20} width={20} />
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                style={Styles.searchBarText}
                placeholderTextColor={Colors.subTextColor}
            />
        </View>
    )
}

export default CustomSearch