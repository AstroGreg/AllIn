import { View, Text, ScrollView, TouchableOpacity, Modal, Pressable, Alert } from 'react-native'
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
import AsyncStorage from '@react-native-async-storage/async-storage'

const MenuScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { mode, colors, setTheme } = useTheme();
    const Styles = createStyles(colors);
    const { logout, isAuthenticated } = useAuth();
    const [pushNotifications, setPushNotifications] = useState(true);
    const [ghostMode, setGhostMode] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const { t } = useTranslation();

    const handleClearAuth = async () => {
        await AsyncStorage.removeItem('@auth_credentials');
        await AsyncStorage.removeItem('@user_profile');
        console.log('[MenuScreen] Cleared all auth data');
        Alert.alert(t('Debug'), t('Auth data cleared. Please restart the app.'));
    };

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
                {isAuthenticated && (
                    <>
                        <SizeBox height={12} />
                        <MenuContainers
                            icon={<SecurityUser size={20} color={colors.primaryColor} variant="Linear" />}
                            title="Admin Pane"
                            onPress={() => navigation.navigate('AdminPane')}
                        />
                    </>
                )}

                <SizeBox height={24} />

                {/* Other */}
                <Text style={Styles.sectionTitle}>{t('other')}</Text>
                <SizeBox height={16} />
                <MenuContainers
                    icon={<Icons.PaymentMethod height={20} width={20} />}
                    title={t('paymentMethod')}
                    onPress={() => navigation.navigate('PaymentMethod')}
                />
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
                      title={t('Log out')}
                      onPress={() => setShowLogoutModal(true)}
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
                    <Text style={Styles.privacySubtitle}>{t('When Ghost Mode is active:')}</Text>
                    <SizeBox height={4} />
                    <Text style={Styles.privacyDescription}>{t('• Your profile won\'t appear in search results.')}</Text>
                    <Text style={Styles.privacyDescription}>{t('• You won\'t show up in \"People you may know\".')}</Text>
                    <Text style={Styles.privacyDescription}>{t('• Existing friends can still see your profile.')}</Text>
                    <Text style={Styles.privacyDescription}>{t('• You can still browse and interact normally.')}</Text>
                </View>

                <SizeBox height={24} />
                <TouchableOpacity onPress={handleClearAuth} style={{ padding: 10, alignItems: 'center' }}>
                    <Text style={{ color: colors.grayColor, fontSize: 12 }}>{t('[Debug] Clear Auth Data')}</Text>
                </TouchableOpacity>

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>

            <Modal
                visible={showLogoutModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowLogoutModal(false)}
            >
                <View style={Styles.modalContainer}>
                    <Pressable
                        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
                        onPress={() => setShowLogoutModal(false)}
                    />
                    <View style={[Styles.modalContaint, { width: '90%', maxWidth: 420, backgroundColor: colors.modalBackground, borderWidth: 0.5, borderColor: colors.lightGrayColor, borderRadius: 16 }]}>
                        <Text style={[Styles.sectionTitle, { textAlign: 'center' }]}>{t('Log out')}</Text>
                        <SizeBox height={10} />
                        <Text style={[Styles.titlesText, { textAlign: 'center', color: colors.subTextColor }]}>
                            {t('Do you want to log out?')}
                        </Text>
                        <SizeBox height={14} />
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity
                                style={[Styles.yesBtn, { flex: 1, backgroundColor: colors.primaryColor, paddingHorizontal: 10 }]}
                                onPress={() => setShowLogoutModal(false)}
                            >
                                <Text style={[Styles.yesText, { color: '#FFFFFF' }]}>{t('Cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 }}
                                onPress={async () => {
                                    setShowLogoutModal(false);
                                    await logout();
                                    const rootNav = navigation?.getParent?.()?.getParent?.() ?? navigation?.getParent?.() ?? navigation;
                                    rootNav.reset({
                                        index: 0,
                                        routes: [{ name: 'LoginScreen' }],
                                    });
                                }}
                            >
                                <Text style={[Styles.noText, { color: colors.errorColor || '#D32F2F' }]}>{t('Log out')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default MenuScreen
