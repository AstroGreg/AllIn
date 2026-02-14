import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import { createStyles } from './CustomTextInputStyles'
import SizeBox from '../../constants/SizeBox'
import Icons from '../../constants/Icons'
import { useTheme } from '../../context/ThemeContext'

interface CustomTextInputProps {
    label?: string;
    subLabel?: string;
    placeholder?: string;
    icon?: any;
    isPass?: boolean;
    onChangeText?: any;
    value?: string;
    isIcon?: boolean;
    isDown?: boolean;
    keyboardType?: any;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

const CustomTextInput = ({
    label,
    subLabel,
    placeholder,
    icon,
    isPass = false,
    onChangeText,
    value,
    isIcon = true,
    keyboardType,
    isDown = false,
    autoCapitalize = 'sentences'
}: CustomTextInputProps) => {
    const [activeInput, setActiveInput] = useState(false);
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const { colors } = useTheme();
    const Styles = createStyles(colors);

    return (
        <>
            <Text style={Styles.label}>{label}</Text>
            {subLabel && <SizeBox height={4} />}
            {subLabel && <Text style={Styles.subLabel}>{subLabel}</Text>}
            <View style={[Styles.inputContainer, activeInput && { borderColor: colors.primaryColor }]}>
                {isIcon && icon}
                <SizeBox width={isIcon ? 10 : 0} />
                <View style={[Styles.inputBox, isPass && { width: '80%' }]}>
                    {activeInput && <Text style={Styles.inputTitle}>{label}</Text>}
                    <TextInput
                        placeholder={activeInput ? '' : placeholder}
                        placeholderTextColor={colors.grayColor}
                        style={[Styles.input, !activeInput && { height: '100%' }]}
                        onFocus={() => setActiveInput(true)}
                        onBlur={() => setActiveInput(false)}
                        secureTextEntry={isPass ? secureTextEntry : false}
                        value={value}
                        onChangeText={onChangeText}
                        keyboardType={keyboardType ? keyboardType : 'default'}
                        editable={isDown ? false : true}
                        autoCapitalize={autoCapitalize}
                    />
                </View>
                {
                    isPass &&
                    <TouchableOpacity style={Styles.eyeIcon} onPress={() => setSecureTextEntry(!secureTextEntry)} >
                        {
                            secureTextEntry ?
                                <Icons.HidePassword height={20} width={20} /> :
                                <Image source={Icons.ShowPassword} style={{ height: 20, width: 20 }} />
                        }
                    </TouchableOpacity>
                }
                {
                    isDown &&
                    <TouchableOpacity style={Styles.eyeIcon} onPress={() => { }} >
                        <Icons.Dropdown height={20} width={20} />
                    </TouchableOpacity>
                }
            </View>
        </>
    )
}

export default CustomTextInput
