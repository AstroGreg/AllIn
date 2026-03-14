var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { View, Text, ScrollView, TouchableOpacity, Modal, Pressable, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { createStyles } from './MenuStyles';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MenuContainers from './components/MenuContainers';
import Icons from '../../constants/Icons';
import { useTheme } from '../../context/ThemeContext';
import { ArrowLeft2, Money3, UserOctagon, Eye, Copy, SecurityUser } from 'iconsax-react-nativejs';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
const MenuScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { mode, colors, setTheme } = useTheme();
    const Styles = createStyles(colors);
    const { logout, isAuthenticated } = useAuth();
    const [pushNotifications, setPushNotifications] = useState(true);
    const [ghostMode, setGhostMode] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const { t } = useTranslation();
    const pushPrefKey = '@push_notifications_enabled';
    useEffect(() => {
        let mounted = true;
        AsyncStorage.getItem(pushPrefKey)
            .then((value) => {
            if (!mounted)
                return;
            if (value === '0')
                setPushNotifications(false);
            if (value === '1')
                setPushNotifications(true);
        })
            .catch(() => { });
        return () => {
            mounted = false;
        };
    }, []);
    const togglePushNotifications = () => __awaiter(void 0, void 0, void 0, function* () {
        const next = !pushNotifications;
        setPushNotifications(next);
        try {
            yield AsyncStorage.setItem(pushPrefKey, next ? '1' : '0');
        }
        catch (_a) {
            // ignore persistence failures for now
        }
    });
    const handleClearAuth = () => __awaiter(void 0, void 0, void 0, function* () {
        yield AsyncStorage.removeItem('@auth_credentials');
        yield AsyncStorage.removeItem('@user_profile');
        console.log('[MenuScreen] Cleared all auth data');
        Alert.alert(t('Debug'), t('Auth data cleared. Please restart the app.'));
    });
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer, testID: "menu-screen" }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('settings') })), _jsx(View, { style: Styles.headerSpacer })] })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, style: Styles.container }, { children: [_jsx(SizeBox, { height: 24 }), _jsx(Text, Object.assign({ style: Styles.sectionTitle }, { children: t('appearance') })), _jsx(SizeBox, { height: 16 }), _jsx(MenuContainers, { icon: _jsx(Icons.LightMode, { height: 20, width: 20 }), title: t('lightMode'), onPress: () => setTheme('light'), isNext: false, isSelected: mode === 'light', testID: "menu-light-mode" }), _jsx(SizeBox, { height: 12 }), _jsx(MenuContainers, { icon: _jsx(Icons.DarkMode, { height: 20, width: 20 }), title: t('darkMode'), onPress: () => setTheme('dark'), isNext: false, isSelected: mode === 'dark', testID: "menu-dark-mode" }), _jsx(SizeBox, { height: 24 }), _jsx(Text, Object.assign({ style: Styles.sectionTitle }, { children: t('settingsSection') })), _jsx(SizeBox, { height: 16 }), _jsx(MenuContainers, { icon: _jsx(Icons.Notification, { height: 20, width: 20 }), title: t('pushNotifications'), onPress: () => { }, isSwitch: true, isNext: false, toggleSwitch: togglePushNotifications, isEnabled: pushNotifications, testID: "menu-push-notifications-toggle" }), _jsx(SizeBox, { height: 12 }), _jsx(MenuContainers, { icon: _jsx(Icons.LanguageSetting, { height: 20, width: 20 }), title: t('language'), onPress: () => navigation.navigate('Language') }), _jsx(SizeBox, { height: 12 }), _jsx(MenuContainers, { icon: _jsx(Icons.ProfileSetting, { height: 20, width: 20 }), title: t('account'), onPress: () => navigation.navigate('ProfileSettings') }), _jsx(SizeBox, { height: 12 }), _jsx(MenuContainers, { icon: _jsx(SecurityUser, { size: 20, color: colors.primaryColor, variant: "Linear" }), title: t('authentication'), onPress: () => navigation.navigate('Authentication') }), isAuthenticated && (_jsxs(_Fragment, { children: [_jsx(SizeBox, { height: 12 }), _jsx(MenuContainers, { icon: _jsx(SecurityUser, { size: 20, color: colors.primaryColor, variant: "Linear" }), title: t('Admin Pane'), onPress: () => navigation.navigate('AdminPane') })] })), _jsx(SizeBox, { height: 24 }), _jsx(Text, Object.assign({ style: Styles.sectionTitle }, { children: t('other') })), _jsx(SizeBox, { height: 16 }), _jsx(MenuContainers, { icon: _jsx(Icons.PaymentMethod, { height: 20, width: 20 }), title: t('paymentMethod'), onPress: () => navigation.navigate('PaymentMethod') }), _jsx(SizeBox, { height: 12 }), _jsx(MenuContainers, { icon: _jsx(Money3, { size: 20, color: colors.primaryColor, variant: "Linear" }), title: t('subscription'), onPress: () => navigation.navigate('Subscription') }), _jsx(SizeBox, { height: 12 }), _jsx(MenuContainers, { icon: _jsx(Icons.Terms, { height: 20, width: 20 }), title: t('termsOfService'), onPress: () => navigation.navigate('TermsOfService') }), _jsx(SizeBox, { height: 12 }), _jsx(MenuContainers, { icon: _jsx(UserOctagon, { size: 20, color: colors.primaryColor, variant: "Linear" }), title: t('help'), onPress: () => navigation.navigate('Help') }), _jsx(SizeBox, { height: 12 }), _jsx(MenuContainers, { icon: _jsx(Icons.DeleteAccount, { height: 20, width: 20 }), title: t('deletePauseAccount'), onPress: () => navigation.navigate('DeleteAndPause') }), _jsx(SizeBox, { height: 12 }), _jsx(MenuContainers, { icon: _jsx(Copy, { size: 20, color: colors.primaryColor, variant: "Linear" }), title: t('rightToBeForgotten'), onPress: () => navigation.navigate('RightToBeForgotten') }), isAuthenticated && (_jsxs(_Fragment, { children: [_jsx(SizeBox, { height: 12 }), _jsx(MenuContainers, { icon: _jsx(SecurityUser, { size: 20, color: colors.primaryColor, variant: "Linear" }), title: t('Log out'), onPress: () => setShowLogoutModal(true) })] })), _jsx(SizeBox, { height: 24 }), _jsx(Text, Object.assign({ style: Styles.sectionTitle }, { children: t('privacySettings') })), _jsx(SizeBox, { height: 16 }), _jsxs(View, Object.assign({ style: Styles.privacyCard }, { children: [_jsxs(View, Object.assign({ style: Styles.privacyHeader }, { children: [_jsx(View, Object.assign({ style: Styles.privacyIconContainer }, { children: _jsx(Eye, { size: 20, color: colors.primaryColor, variant: "Linear" }) })), _jsx(SizeBox, { width: 16 }), _jsx(Text, Object.assign({ style: Styles.privacyTitle }, { children: t('ghostMode') })), _jsx(View, Object.assign({ style: Styles.privacySwitch }, { children: _jsx(TouchableOpacity, Object.assign({ style: [Styles.switchTrack, ghostMode && Styles.switchTrackActive], onPress: () => setGhostMode(prev => !prev) }, { children: _jsx(View, { style: [Styles.switchThumb, ghostMode && Styles.switchThumbActive] }) })) }))] })), _jsx(SizeBox, { height: 12 }), _jsx(Text, Object.assign({ style: Styles.privacySubtitle }, { children: t('When Ghost Mode is active:') })), _jsx(SizeBox, { height: 4 }), _jsx(Text, Object.assign({ style: Styles.privacyDescription }, { children: t('• Your profile won\'t appear in search results.') })), _jsx(Text, Object.assign({ style: Styles.privacyDescription }, { children: t('• You won\'t show up in \"People you may know\".') })), _jsx(Text, Object.assign({ style: Styles.privacyDescription }, { children: t('• Existing friends can still see your profile.') })), _jsx(Text, Object.assign({ style: Styles.privacyDescription }, { children: t('• You can still browse and interact normally.') }))] })), _jsx(SizeBox, { height: 24 }), _jsx(TouchableOpacity, Object.assign({ onPress: handleClearAuth, style: { padding: 10, alignItems: 'center' } }, { children: _jsx(Text, Object.assign({ style: { color: colors.grayColor, fontSize: 12 } }, { children: t('[Debug] Clear Auth Data') })) })), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] })), _jsx(Modal, Object.assign({ visible: showLogoutModal, transparent: true, animationType: "fade", onRequestClose: () => setShowLogoutModal(false) }, { children: _jsxs(View, Object.assign({ style: Styles.modalContainer }, { children: [_jsx(Pressable, { style: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }, onPress: () => setShowLogoutModal(false) }), _jsxs(View, Object.assign({ style: [Styles.modalContaint, { width: '90%', maxWidth: 420, backgroundColor: colors.modalBackground, borderWidth: 0.5, borderColor: colors.lightGrayColor, borderRadius: 16 }] }, { children: [_jsx(Text, Object.assign({ style: [Styles.sectionTitle, { textAlign: 'center' }] }, { children: t('Log out') })), _jsx(SizeBox, { height: 10 }), _jsx(Text, Object.assign({ style: [Styles.titlesText, { textAlign: 'center', color: colors.subTextColor }] }, { children: t('Do you want to log out?') })), _jsx(SizeBox, { height: 14 }), _jsxs(View, Object.assign({ style: { flexDirection: 'row', gap: 12 } }, { children: [_jsx(TouchableOpacity, Object.assign({ style: [Styles.yesBtn, { flex: 1, backgroundColor: colors.primaryColor, paddingHorizontal: 10 }], onPress: () => setShowLogoutModal(false) }, { children: _jsx(Text, Object.assign({ style: [Styles.yesText, { color: '#FFFFFF' }] }, { children: t('Cancel') })) })), _jsx(TouchableOpacity, Object.assign({ style: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 }, onPress: () => __awaiter(void 0, void 0, void 0, function* () {
                                                var _b, _c, _d, _e, _f, _g;
                                                setShowLogoutModal(false);
                                                yield logout();
                                                const rootNav = (_g = (_e = (_d = (_c = (_b = navigation === null || navigation === void 0 ? void 0 : navigation.getParent) === null || _b === void 0 ? void 0 : _b.call(navigation)) === null || _c === void 0 ? void 0 : _c.getParent) === null || _d === void 0 ? void 0 : _d.call(_c)) !== null && _e !== void 0 ? _e : (_f = navigation === null || navigation === void 0 ? void 0 : navigation.getParent) === null || _f === void 0 ? void 0 : _f.call(navigation)) !== null && _g !== void 0 ? _g : navigation;
                                                rootNav.reset({
                                                    index: 0,
                                                    routes: [{ name: 'LoginScreen' }],
                                                });
                                            }) }, { children: _jsx(Text, Object.assign({ style: [Styles.noText, { color: colors.errorColor || '#D32F2F' }] }, { children: t('Log out') })) }))] }))] }))] })) }))] })));
};
export default MenuScreen;
