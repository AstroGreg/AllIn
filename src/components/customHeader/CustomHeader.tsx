import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { createStyles } from './CustomHeaderStyles'
import SizeBox from '../../constants/SizeBox'
import Icons from '../../constants/Icons'
import { useTheme } from '../../context/ThemeContext'

interface CustomHeaderProps {
    title?: string;
    onBackPress?: any;
    isBack?: boolean;
    onPressSetting?: any;
    isSetting?: any;
}

const CustomHeader = ({ title, onBackPress, isBack = true, onPressSetting, isSetting = true }: CustomHeaderProps) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);

    return (
        <View style={Styles.headerContainer}>
            {isBack && <TouchableOpacity style={[Styles.settingBtn, { left: 20 }]} onPress={onBackPress}>
                <Icons.BackArrow height={24} width={24} />
            </TouchableOpacity>}
            <SizeBox width={10} />

            <Text style={Styles.title}>{title}</Text>


            {isSetting && <TouchableOpacity style={Styles.settingBtn} onPress={onPressSetting}>
                <Icons.Setting height={24} width={24} />
            </TouchableOpacity>}
        </View>
    )
}

export default CustomHeader
