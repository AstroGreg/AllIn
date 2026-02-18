import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { createStyles } from '../HomeStyles'
import FastImage from 'react-native-fast-image'
import Images from '../../../constants/Images'
import SizeBox from '../../../constants/SizeBox'
import { useTheme } from '../../../context/ThemeContext'
import Icons from '../../../constants/Icons'
import { useTranslation } from 'react-i18next'

interface HeaderProps {
    userName: string;
    profilePic?: string;
    notificationCount?: number;
    onPressFeed?: () => void;
    onPressProfile?: () => void;
    onPressNotifications?: () => void;
}

const Header = ({
    userName,
    profilePic,
    notificationCount = 0,
    onPressFeed,
    onPressProfile,
    onPressNotifications
}: HeaderProps) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const Styles = createStyles(colors);

    return (
        <View style={Styles.header}>
            <TouchableOpacity onPress={onPressProfile} style={Styles.profilePic}>
                <FastImage
                    source={profilePic ? { uri: profilePic } : Images.profilePic}
                    style={Styles.img}
                />
            </TouchableOpacity>
            <SizeBox width={10} />
            <View style={Styles.userInfoContainer}>
                <Text style={Styles.welcomeText}>{t('welcome')}</Text>
                <Text style={Styles.userNameText}>{userName}</Text>
            </View>

            <View style={Styles.headerIconsContainer}>
                <TouchableOpacity onPress={onPressFeed} style={Styles.headerIconBtn}>
                    <Icons.FeedBlue height={24} width={24} />
                </TouchableOpacity>
                <View style={Styles.notificationIconWrap}>
                    {notificationCount > 0 ? (
                        <View style={Styles.notificationCountBanner}>
                            <Text style={Styles.notificationCountText}>
                                {notificationCount > 99 ? '99+' : String(notificationCount)}
                            </Text>
                        </View>
                    ) : null}
                    <TouchableOpacity onPress={onPressNotifications} style={Styles.headerIconBtn}>
                        <Icons.NotificationBoldBlue height={24} width={24} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default Header
