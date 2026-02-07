import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { createStyles } from '../HomeStyles'
import FastImage from 'react-native-fast-image'
import Images from '../../../constants/Images'
import SizeBox from '../../../constants/SizeBox'
import Icons from '../../../constants/Icons'
import { useTheme } from '../../../context/ThemeContext'

interface HeaderProps {
    userName: string;
    profilePic?: string;
    onPressFeed?: () => void;
    onPressNotification?: () => void;
    onPressProfile?: () => void;
}

const Header = ({
    userName,
    profilePic,
    onPressFeed,
    onPressNotification,
    onPressProfile
}: HeaderProps) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);

    return (
        <View style={Styles.header}>
            <TouchableOpacity onPress={onPressProfile} style={Styles.profilePic}>
                <FastImage
                    source={Images.profilePic}
                    style={Styles.img}
                />
            </TouchableOpacity>
            <SizeBox width={10} />
            <View style={Styles.userInfoContainer}>
                <Text style={Styles.welcomeText}>Welcome,</Text>
                <Text style={Styles.userNameText}>{userName}</Text>
            </View>

            <View style={Styles.headerIconsContainer}>
                <TouchableOpacity onPress={onPressFeed} style={Styles.headerIconBtn}>
                    <Icons.FeedBlue height={24} width={24} />
                </TouchableOpacity>
                <SizeBox width={10} />
                <TouchableOpacity onPress={onPressNotification} style={Styles.headerIconBtn}>
                    <Icons.NotificationBoldBlue height={24} width={24} />
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default Header
