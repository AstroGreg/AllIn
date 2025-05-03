import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import Styles from '../HomeStyles'
import FastImage from 'react-native-fast-image'
import Images from '../../../constants/Images'
import SizeBox from '../../../constants/SizeBox'
import Icons from '../../../constants/Icons'

interface HeaderProps {
    userName: string;
    profilePic?: string;
    onPressSetting?: any;
}

const Header = ({
    userName,
    profilePic,
    onPressSetting
}: HeaderProps) => {
    return (
        <View style={Styles.header}>
            <View style={Styles.profilePic}>
                <FastImage
                    source={Images.profilePic}
                    style={Styles.img}
                />
            </View>
            <SizeBox width={10} />
            <View>
                <Text style={Styles.welcomeText}>Welcome,</Text>
                <Text style={Styles.userNameText}>{userName}</Text>
            </View>

            <TouchableOpacity onPress={onPressSetting} style={Styles.settingBtn}>
                <Icons.Setting height={24} width={24} />
            </TouchableOpacity>
        </View>
    )
}

export default Header