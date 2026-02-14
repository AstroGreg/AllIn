import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import { createStyles } from './MenuStyles'
import SizeBox from '../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import MenuContainers from './components/MenuContainers'
import Icons from '../../constants/Icons'
import { useTheme } from '../../context/ThemeContext'
import { ArrowLeft2, Money3, UserOctagon, Eye, Copy, SecurityUser } from 'iconsax-react-nativejs'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'

const MenuScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { mode, colors, setTheme } = useTheme();
    const Styles = createStyles(colors);
    const { logout, isAuthenticated } = useAuth();
    const [pushNotifications, setPushNotifications] = useState(true);
    const [ghostMode, setGhostMode] = useState(true);
    const { t } = useTranslation();

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{t('settings')}</Text>
                <View style={Styles.headerSpacer} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={Styles.container}>
                <SizeBox height={24} />

                {/* Appearance */}
                <Text style={Styles.sectionTitle}>{t('appearance')}</Text>
                <SizeBox height={16} />
                <MenuContainers
                    icon={<Icons.LightMode height={20} width={20} />}
                    title={t('lightMode')}
                    onPress={() => setTheme('light')}
                    isNext={false}
                    isSelected={mode === 'light'}
                />
                <SizeBox height={12} />
                <MenuContainers
                    icon={<Icons.DarkMode height={20} width={20} />}
                    title={t('darkMode')}
                    onPress={() => setTheme('dark')}
                    isNext={false}
                    isSelected={mode === 'dark'}
                />

                <SizeBox height={24} />

                {/* Settings */}
                <Text style={Styles.sectionTitle}>{t('settingsSection')}</Text>
                <SizeBox height={16} />
                <MenuContainers
                    icon={<Icons.Notification height={20} width={20} />}
                    title={t('pushNotifications')}
                    onPress={() => { }}
                    isSwitch={true}
                    isNext={false}
                    toggleSwitch={() => setPushNotifications(prev => !prev)}
                    isEnabled={pushNotifications}
                />
                <SizeBox height={12} />
                <MenuContainers
                    icon={<Icons.LanguageSetting height={20} width={20} />}
                    title={t('language')}
                    onPress={() => navigation.navigate('Language')}
                />
                <SizeBox height={12} />
                <MenuContainers
                    icon={<Icons.ProfileSetting height={20} width={20} />}
                    title={t('account')}
                    onPress={() => navigation.navigate('ProfileSettings')}
                />
                <SizeBox height={12} />
                <MenuContainers
                    icon={<SecurityUser size={20} color={colors.primaryColor} variant="Linear" />}
                    title={t('authentication')}
                    onPress={() => navigation.navigate('Authentication')}
                />

                <SizeBox height={24} />

                {/* Other */}
                <Text style={Styles.sectionTitle}>{t('other')}</Text>
                <SizeBox height={16} />
                <MenuContainers
                    icon={<Icons.PaymentMethod height={20} width={20} />}
                    title={t('paymentMethod')}
                    onPress={() => navigation.navigate('PaymentMethod')}
                />
                {__DEV__ && (
                  <>
                    <SizeBox height={12} />
                    <MenuContainers
                      icon={<SecurityUser size={20} color={colors.primaryColor} variant="Linear" />}
                      title='Dev API Token'
                      onPress={() => navigation.navigate('DevApiTokenScreen')}
                    />
                  </>
                )}
                <SizeBox height={12} />
                <MenuContainers
                    icon={<Money3 size={20} color={colors.primaryColor} variant="Linear" />}
                    title={t('subscription')}
                    onPress={() => navigation.navigate('Subscription')}
                />
                <SizeBox height={12} />
                <MenuContainers
                    icon={<Icons.Terms height={20} width={20} />}
                    title={t('termsOfService')}
                    onPress={() => navigation.navigate('TermsOfService')}
                />
                <SizeBox height={12} />
                <MenuContainers
                    icon={<UserOctagon size={20} color={colors.primaryColor} variant="Linear" />}
                    title={t('help')}
                    onPress={() => navigation.navigate('Help')}
                />
                <SizeBox height={12} />
                <MenuContainers
                    icon={<Icons.DeleteAccount height={20} width={20} />}
                    title={t('deletePauseAccount')}
                    onPress={() => navigation.navigate('DeleteAndPause')}
                />
                <SizeBox height={12} />
                <MenuContainers
                    icon={<Copy size={20} color={colors.primaryColor} variant="Linear" />}
                    title={t('rightToBeForgotten')}
                    onPress={() => navigation.navigate('RightToBeForgotten')}
                />
                {isAuthenticated && (
                  <>
                    <SizeBox height={12} />
                    <MenuContainers
                      icon={<SecurityUser size={20} color={colors.primaryColor} variant="Linear" />}
                      title='Log out'
                      onPress={() => {
                        Alert.alert('Log out', 'Do you want to log out?', [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Log out', style: 'destructive', onPress: () => logout() },
                        ]);
                      }}
                    />
                  </>
                )}

                <SizeBox height={24} />

                {/* Privacy Settings */}
                <Text style={Styles.sectionTitle}>{t('privacySettings')}</Text>
                <SizeBox height={16} />
                <View style={Styles.privacyCard}>
                    <View style={Styles.privacyHeader}>
                        <View style={Styles.privacyIconContainer}>
                            <Eye size={20} color={colors.primaryColor} variant="Linear" />
                        </View>
                        <SizeBox width={16} />
                        <Text style={Styles.privacyTitle}>{t('ghostMode')}</Text>
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

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    )
}

export default MenuScreen
