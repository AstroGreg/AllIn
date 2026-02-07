import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import { createStyles } from './MenuStyles'
import SizeBox from '../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import MenuContainers from './components/MenuContainers'
import Icons from '../../constants/Icons'
import FastImage from 'react-native-fast-image'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { ArrowLeft2, Notification, Money3, UserOctagon, MainComponent, Eye, Copy, SecurityUser, Logout } from 'iconsax-react-nativejs'
import { CommonActions } from '@react-navigation/native'

interface SocialLink {
    platform: string;
    icon: any;
    isConnected: boolean;
    url?: string;
}

const MenuScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { mode, colors, setTheme } = useTheme();
    const { logout, isLoading } = useAuth();
    const Styles = createStyles(colors);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [aiPhotoRecognition, setAiPhotoRecognition] = useState(true);
    const [ghostMode, setGhostMode] = useState(true);

    const handleLogout = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout();
                            // Reset navigation to login screen
                            navigation.dispatch(
                                CommonActions.reset({
                                    index: 0,
                                    routes: [{ name: 'SelectLanguageScreen' }],
                                })
                            );
                        } catch (error) {
                            console.error('Logout error:', error);
                            Alert.alert('Error', 'Failed to sign out. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
        { platform: 'Strava', icon: Icons.Strava, isConnected: false, url: 'www.usertrava.com' },
        { platform: 'Facebook', icon: Icons.Facebook, isConnected: false, url: 'www.usertrava.com' },
        { platform: 'Instagram', icon: Icons.Instagram, isConnected: false, url: 'www.usertrava.com' },
    ]);

    const toggleSocialLink = (platform: string) => {
        setSocialLinks(prev => prev.map(link =>
            link.platform === platform
                ? { ...link, isConnected: !link.isConnected }
                : link
        ));
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Menu</Text>
                <TouchableOpacity style={Styles.headerButton}>
                    <Notification size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={Styles.container}>
                <SizeBox height={24} />

                {/* Social Links */}
                <Text style={Styles.sectionTitle}>Social links</Text>
                <SizeBox height={16} />
                <View style={Styles.socialLinksCard}>
                    {socialLinks.map((link, index) => (
                        <React.Fragment key={link.platform}>
                            <TouchableOpacity style={Styles.socialLinkRow} onPress={() => toggleSocialLink(link.platform)}>
                                <FastImage source={link.icon} style={Styles.socialIcon} />
                                {link.isConnected ? (
                                    <View style={Styles.connectedLinkContent}>
                                        <Text style={Styles.socialLinkPlatform}>{link.platform}</Text>
                                        <Icons.Links height={14} width={14} />
                                        <Text style={Styles.socialLinkUrl}>{link.url}</Text>
                                    </View>
                                ) : (
                                    <Text style={Styles.socialLinkText}>Connect with {link.platform}</Text>
                                )}
                                <Icons.ArrowNext height={20} width={20} />
                            </TouchableOpacity>
                            {index < socialLinks.length - 1 && <View style={Styles.socialLinkDivider} />}
                        </React.Fragment>
                    ))}
                </View>

                <SizeBox height={24} />

                {/* Appearance */}
                <Text style={Styles.sectionTitle}>Appearance</Text>
                <SizeBox height={16} />
                <MenuContainers
                    icon={<Icons.LightMode height={20} width={20} />}
                    title='Light mode'
                    onPress={() => setTheme('light')}
                    isNext={false}
                    isSelected={mode === 'light'}
                />
                <SizeBox height={12} />
                <MenuContainers
                    icon={<Icons.DarkMode height={20} width={20} />}
                    title='Dark mode'
                    onPress={() => setTheme('dark')}
                    isNext={false}
                    isSelected={mode === 'dark'}
                />

                <SizeBox height={24} />

                {/* Settings */}
                <Text style={Styles.sectionTitle}>Settings</Text>
                <SizeBox height={16} />
                <MenuContainers
                    icon={<Icons.Notification height={20} width={20} />}
                    title='Push Notifications'
                    onPress={() => { }}
                    isSwitch={true}
                    isNext={false}
                    toggleSwitch={() => setPushNotifications(prev => !prev)}
                    isEnabled={pushNotifications}
                />
                <SizeBox height={12} />
                <MenuContainers
                    icon={<Icons.LanguageSetting height={20} width={20} />}
                    title='Language'
                    onPress={() => navigation.navigate('Language')}
                />
                <SizeBox height={12} />
                <MenuContainers
                    icon={<Icons.LocationSetting height={20} width={20} />}
                    title='Location'
                    onPress={() => navigation.navigate('Location')}
                />
                <SizeBox height={12} />
                <MenuContainers
                    icon={<Icons.ProfileSetting height={20} width={20} />}
                    title='Account'
                    onPress={() => navigation.navigate('ProfileSettings')}
                />
                <SizeBox height={12} />
                <MenuContainers
                    icon={<SecurityUser size={20} color={colors.primaryColor} variant="Linear" />}
                    title='Authentication'
                    onPress={() => navigation.navigate('Authentication')}
                />

                <SizeBox height={24} />

                {/* Other */}
                <Text style={Styles.sectionTitle}>Other</Text>
                <SizeBox height={16} />
                <MenuContainers
                    icon={<Icons.PaymentMethod height={20} width={20} />}
                    title='Payment Method'
                    onPress={() => navigation.navigate('PaymentMethod')}
                />
                <SizeBox height={12} />
                <MenuContainers
                    icon={<Icons.AiBlueBordered height={20} width={20} />}
                    title='AI'
                    onPress={() => navigation.navigate('AISearchScreen')}
                />
                <SizeBox height={12} />
                <MenuContainers
                    icon={<Money3 size={20} color={colors.primaryColor} variant="Linear" />}
                    title='Subscription'
                    onPress={() => navigation.navigate('Subscription')}
                />
                <SizeBox height={12} />
                <MenuContainers
                    icon={<Icons.Terms height={20} width={20} />}
                    title='Terms of Service'
                    onPress={() => navigation.navigate('TermsOfService')}
                />
                <SizeBox height={12} />
                <MenuContainers
                    icon={<UserOctagon size={20} color={colors.primaryColor} variant="Linear" />}
                    title='Help'
                    onPress={() => navigation.navigate('Help')}
                />
                <SizeBox height={12} />
                <MenuContainers
                    icon={<Icons.DeleteAccount height={20} width={20} />}
                    title='Delete/Pause your account'
                    onPress={() => navigation.navigate('DeleteAndPause')}
                />
                <SizeBox height={12} />
                <MenuContainers
                    icon={<Copy size={20} color={colors.primaryColor} variant="Linear" />}
                    title='Right to be Forgotten'
                    onPress={() => navigation.navigate('RightToBeForgotten')}
                />

                <SizeBox height={24} />

                {/* Privacy Settings */}
                <Text style={Styles.sectionTitle}>Privacy Settings</Text>
                <SizeBox height={16} />
                <View style={Styles.privacyCard}>
                    <View style={Styles.privacyHeader}>
                        <View style={Styles.privacyIconContainer}>
                            <MainComponent size={20} color={colors.primaryColor} variant="Linear" />
                        </View>
                        <SizeBox width={16} />
                        <Text style={Styles.privacyTitle}>AI Photo Recognition</Text>
                        <View style={Styles.privacySwitch}>
                            <TouchableOpacity
                                style={[Styles.switchTrack, aiPhotoRecognition && Styles.switchTrackActive]}
                                onPress={() => setAiPhotoRecognition(prev => !prev)}
                            >
                                <View style={[Styles.switchThumb, aiPhotoRecognition && Styles.switchThumbActive]} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <SizeBox height={12} />
                    <Text style={Styles.privacySubtitle}>How it works:</Text>
                    <SizeBox height={4} />
                    <Text style={Styles.privacyDescription}>• AI scans newly uploaded photos for faces.</Text>
                    <Text style={Styles.privacyDescription}>• Automatically suggests tags when you're detected.</Text>
                    <Text style={Styles.privacyDescription}>• You'll receive notifications for photo suggestions.</Text>
                    <Text style={Styles.privacyDescription}>• You can always approve or reject tags.</Text>
                </View>

                <SizeBox height={16} />

                <View style={Styles.privacyCard}>
                    <View style={Styles.privacyHeader}>
                        <View style={Styles.privacyIconContainer}>
                            <Eye size={20} color={colors.primaryColor} variant="Linear" />
                        </View>
                        <SizeBox width={16} />
                        <Text style={Styles.privacyTitle}>Ghost Mode</Text>
                        <View style={Styles.privacySwitch}>
                            <TouchableOpacity
                                style={[Styles.switchTrack, ghostMode && Styles.switchTrackActive]}
                                onPress={() => setGhostMode(prev => !prev)}
                            >
                                <View style={[Styles.switchThumb, ghostMode && Styles.switchThumbActive]} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <SizeBox height={12} />
                    <Text style={Styles.privacySubtitle}>When Ghost Mode is active:</Text>
                    <SizeBox height={4} />
                    <Text style={Styles.privacyDescription}>• Your profile won't appear in search results.</Text>
                    <Text style={Styles.privacyDescription}>• You won't show up in "People you may know".</Text>
                    <Text style={Styles.privacyDescription}>• Existing friends can still see your profile.</Text>
                    <Text style={Styles.privacyDescription}>• You can still browse and interact normally.</Text>
                </View>

                <SizeBox height={24} />

                {/* Sign Out */}
                <MenuContainers
                    icon={<Logout size={20} color="#FF4444" variant="Linear" />}
                    title='Sign Out'
                    onPress={handleLogout}
                    isNext={false}
                    titleColor="#FF4444"
                />

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    )
}

export default MenuScreen
