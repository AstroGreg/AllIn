import { View, Text, TextInput } from 'react-native'
import React from 'react'
import { createStyles } from './CustomSearchStyles'
import Icons from '../../constants/Icons'
import { useTheme } from '../../context/ThemeContext';

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
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    return (
        <View style={Styles.searchContainer}>
            <Icons.Search height={20} width={20} />
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                style={Styles.searchBarText}
                placeholderTextColor={colors.subTextColor}
            />
        </View>
    )
}

export default CustomSearch
