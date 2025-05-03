import { View, Text, TextInput } from 'react-native'
import React from 'react'
import Styles from '../MenuStyles'
import Colors from '../../../constants/Colors';


interface AddCardTextInputProps {
    placeholder: string;
    value?: any;
    onChangeText?: any;
    label?: string;
    keyboardType?: any;
    maxLength?: any;
    isCVV?: boolean;
    isHalf?: boolean;
}

const AddCardTextInput = ({
    placeholder,
    value,
    onChangeText,
    label,
    keyboardType = 'default',
    isCVV = false,
    isHalf = false,
    maxLength
}: AddCardTextInputProps) => {
    return (
        <View style={[Styles.textInputContainer, isHalf && { flex: 0.484 }]}>
            <Text style={[Styles.btnText, { textAlign: isCVV ? 'right' : 'left', }]}>{label}</Text>
            <TextInput
                style={[Styles.textInput, isCVV && { textAlign: 'right', }]}
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                placeholderTextColor={Colors.grayColor}
                keyboardType={keyboardType ? keyboardType : 'default'}
                secureTextEntry={isCVV ? true : false}
                maxLength={maxLength}
            />
        </View>
    )
}

export default AddCardTextInput