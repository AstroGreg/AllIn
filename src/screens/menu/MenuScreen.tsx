import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import Styles from './MenuStyles'
import CustomHeader from '../../components/customHeader/CustomHeader'
import SizeBox from '../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import MenuContainers from './components/MenuContainers'
import Icons from '../../constants/Icons'
import CustomButton from '../../components/customButton/CustomButton'
import FastImage from 'react-native-fast-image'

const MenuScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [mode, setMode] = useState('light');
    const [isEnabled, setIsEnabled] = useState(true);
    const toggleSwitch = () => {
        setIsEnabled(prev => !prev);
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <CustomHeader title='Menu' isBack={false} isSetting={false} />

            <ScrollView showsVerticalScrollIndicator={false} style={Styles.container} >
                <SizeBox height={24} />
                <MenuContainers
                    icon={<Icons.ProfileSetting height={20} width={20} />}
                    title='Profile Settings'
                    onPress={() => navigation.navigate('ProfileSettings')}
                />

                <SizeBox height={24} />
                <View style={Styles.talentContainer}>
                    <SizeBox height={16} />
                    <Text style={Styles.containerTitle}>Talents</Text>
                    <SizeBox height={10} />
                    <View style={Styles.talentList}>
                        <Text style={Styles.talentTypeTitle}>Performer</Text>
                        <SizeBox height={16} />
                        <CustomButton title='Add Talent' onPress={() => navigation.navigate('SelecteTalent')} isAdd={true} isSmall={true} />
                    </View>
                    <SizeBox height={24} />
                    <View style={Styles.separator} />
                    <SizeBox height={10} />
                    <View style={Styles.talentList}>
                        <Text style={Styles.talentTypeTitle}>Creater</Text>
                        <SizeBox height={16} />
                        <CustomButton title='Add Talent' onPress={() => navigation.navigate('TalenetForPhotograph')} isAdd={true} isSmall={true} />
                    </View>
                    <SizeBox height={24} />
                    <View style={Styles.separator} />
                </View>

                <SizeBox height={24} />
                <Text style={Styles.containerTitle}>Social links</Text>
                <SizeBox height={16} />
                <View style={Styles.talentContainer}>
                    <SizeBox height={16} />
                    <TouchableOpacity style={Styles.socialLinks}>
                        <FastImage source={Icons.Strava} style={Styles.icons} />
                        <SizeBox width={12} />
                        <Text style={Styles.titlesText}>Connect with Strava</Text>
                        <View style={[Styles.nextArrow, { right: 0 }]}>
                            <Icons.ArrowNext height={24} width={24} />
                        </View>
                    </TouchableOpacity>
                    <SizeBox height={14} />
                    <View style={Styles.separator} />
                    <SizeBox height={14} />
                    <TouchableOpacity style={Styles.socialLinks}>
                        <FastImage source={Icons.Facebook} style={Styles.icons} />
                        <SizeBox width={12} />
                        <Text style={Styles.titlesText}>Connect with Facebook</Text>
                        <View style={[Styles.nextArrow, { right: 0 }]}>
                            <Icons.ArrowNext height={24} width={24} />
                        </View>
                    </TouchableOpacity>
                    <SizeBox height={14} />
                    <View style={Styles.separator} />
                    <SizeBox height={14} />
                    <TouchableOpacity style={Styles.socialLinks}>
                        <FastImage source={Icons.Instagram} style={Styles.icons} />
                        <SizeBox width={12} />
                        <Text style={Styles.titlesText}>Connect with Instagram</Text>
                        <View style={[Styles.nextArrow, { right: 0 }]}>
                            <Icons.ArrowNext height={24} width={24} />
                        </View>
                    </TouchableOpacity>
                    <SizeBox height={16} />
                </View>

                <SizeBox height={24} />
                <Text style={Styles.containerTitle}>Appearance</Text>
                <SizeBox height={16} />
                <MenuContainers
                    icon={<Icons.LightMode height={20} width={20} />}
                    title='Light mode'
                    onPress={() => setMode('light')}
                    isNext={false}
                    isSelected={mode === 'light'}
                />
                <SizeBox height={16} />
                <MenuContainers
                    icon={<Icons.DarkMode height={20} width={20} />}
                    title='Dark mode'
                    onPress={() => setMode('dark')}
                    isNext={false}
                    isSelected={mode === 'dark'}
                />

                <SizeBox height={24} />
                <Text style={Styles.containerTitle}>Settings</Text>
                <SizeBox height={16} />
                <MenuContainers
                    icon={<Icons.Notification height={20} width={20} />}
                    title='Notifications'
                    onPress={() => { }}
                    isSwitch={true}
                    isNext={false}
                    toggleSwitch={toggleSwitch}
                    isEnabled={isEnabled}
                />
                <SizeBox height={16} />
                <MenuContainers
                    icon={<Icons.LanguageSetting height={20} width={20} />}
                    title='Language'
                    onPress={() => navigation.navigate('Language')}
                />
                <SizeBox height={16} />
                <MenuContainers
                    icon={<Icons.LocationSetting height={20} width={20} />}
                    title='Location'
                    onPress={() => navigation.navigate('Location')}
                />

                <SizeBox height={24} />
                <Text style={Styles.containerTitle}>Other</Text>
                <SizeBox height={16} />
                <MenuContainers
                    icon={<Icons.PaymentMethod height={20} width={20} />}
                    title='Payment Method'
                    onPress={() => navigation.navigate('PaymentMethod')}
                />
                <SizeBox height={16} />
                <MenuContainers
                    icon={<Icons.Terms height={20} width={20} />}
                    title='Terms of Service'
                    onPress={() => { }}
                />
                <SizeBox height={16} />
                <MenuContainers
                    icon={<Icons.DeleteAccount height={20} width={20} />}
                    title='Delete/Pause your account'
                    onPress={() => navigation.navigate('DeleteAndPause')}
                />

                <SizeBox height={16} />

            </ScrollView>
        </View>
    )
}

export default MenuScreen