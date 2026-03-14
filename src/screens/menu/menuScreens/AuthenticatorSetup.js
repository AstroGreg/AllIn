import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import Icons from '../../../constants/Icons';
import { ArrowLeft2, Notification, ArrowRight, Copy, } from 'iconsax-react-nativejs';
import { createStyles } from './AuthenticatorSetupStyles';
import { useTranslation } from 'react-i18next';
const AuthenticatorSetup = ({ navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const setupCode = 'J4XW 4C3K L9MN 2P8Q';
    const handleCopyCode = () => {
        // Copy to clipboard functionality
    };
    return (_jsxs(View, Object.assign({ style: styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: styles.headerTitle }, { children: t('Authenticator Setup') })), _jsx(TouchableOpacity, Object.assign({ style: styles.headerButton }, { children: _jsx(Notification, { size: 24, color: colors.primaryColor, variant: "Linear" }) }))] })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, style: styles.container }, { children: [_jsx(SizeBox, { height: 49 }), _jsxs(View, Object.assign({ style: styles.titleSection }, { children: [_jsx(Text, Object.assign({ style: styles.title }, { children: t('Set up authenticator app') })), _jsx(SizeBox, { height: 6 }), _jsx(Text, Object.assign({ style: styles.description }, { children: t('Scan this QR code using Google Authenticator or Authy.') }))] })), _jsx(SizeBox, { height: 32 }), _jsx(View, Object.assign({ style: styles.qrContainer }, { children: _jsx(View, Object.assign({ style: styles.qrCode }, { children: _jsx(Icons.QrBlack, { width: 140, height: 140 }) })) })), _jsx(SizeBox, { height: 24 }), _jsx(Text, Object.assign({ style: styles.orText }, { children: t('Or enter code manually') })), _jsx(SizeBox, { height: 16 }), _jsxs(TouchableOpacity, Object.assign({ style: styles.codeBox, onPress: handleCopyCode }, { children: [_jsx(Text, Object.assign({ style: styles.codeText }, { children: setupCode })), _jsx(Copy, { size: 20, color: colors.grayColor, variant: "Linear" })] })), _jsx(SizeBox, { height: 24 })] })), _jsxs(View, Object.assign({ style: [styles.bottomContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }] }, { children: [_jsxs(TouchableOpacity, Object.assign({ style: styles.primaryButton, onPress: () => navigation.navigate('VerificationCode') }, { children: [_jsx(Text, Object.assign({ style: styles.primaryButtonText }, { children: t("I've Scaned the code") })), _jsx(ArrowRight, { size: 24, color: colors.pureWhite, variant: "Linear" })] })), _jsx(SizeBox, { height: 18 }), _jsx(TouchableOpacity, { children: _jsx(Text, Object.assign({ style: styles.linkText }, { children: t("Can't scan? Enter code manually") })) }), _jsx(SizeBox, { height: 8 }), _jsx(TouchableOpacity, Object.assign({ onPress: () => navigation.goBack() }, { children: _jsx(Text, Object.assign({ style: styles.linkText }, { children: t('Use different method') })) }))] }))] })));
};
export default AuthenticatorSetup;
