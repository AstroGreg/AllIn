import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useState, useRef } from 'react';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { ArrowLeft2, Notification, ArrowRight, Timer1, } from 'iconsax-react-nativejs';
import { createStyles } from './VerificationCodeStyles';
import { useTranslation } from 'react-i18next';
const VerificationCode = ({ navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);
    const handleCodeChange = (text, index) => {
        var _a;
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);
        // Auto focus next input
        if (text && index < 5) {
            (_a = inputRefs.current[index + 1]) === null || _a === void 0 ? void 0 : _a.focus();
        }
    };
    const handleKeyPress = (e, index) => {
        var _a;
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            (_a = inputRefs.current[index - 1]) === null || _a === void 0 ? void 0 : _a.focus();
        }
    };
    return (_jsxs(View, Object.assign({ style: styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: styles.headerTitle }, { children: t('Enter verification code') })), _jsx(TouchableOpacity, Object.assign({ style: styles.headerButton }, { children: _jsx(Notification, { size: 24, color: colors.primaryColor, variant: "Linear" }) }))] })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, style: styles.container }, { children: [_jsx(SizeBox, { height: 49 }), _jsxs(View, Object.assign({ style: styles.titleSection }, { children: [_jsx(Text, Object.assign({ style: styles.title }, { children: t('Enter verification code') })), _jsx(SizeBox, { height: 6 }), _jsx(Text, Object.assign({ style: styles.description }, { children: t('Open your authenticator app and enter the 6-digit code.') }))] })), _jsx(SizeBox, { height: 32 }), _jsx(View, Object.assign({ style: styles.codeInputContainer }, { children: code.map((digit, index) => (_jsx(TextInput, { ref: (ref) => (inputRefs.current[index] = ref), style: styles.codeInput, value: digit, onChangeText: (text) => handleCodeChange(text.slice(-1), index), onKeyPress: (e) => handleKeyPress(e, index), keyboardType: "number-pad", maxLength: 1, selectTextOnFocus: true, placeholderTextColor: colors.grayColor }, index))) })), _jsx(SizeBox, { height: 16 }), _jsxs(View, Object.assign({ style: styles.timerContainer }, { children: [_jsx(Timer1, { size: 16, color: colors.grayColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: styles.timerText }, { children: t('Code refreshes every 30 seconds') }))] }))] })), _jsxs(View, Object.assign({ style: [styles.bottomContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }] }, { children: [_jsxs(TouchableOpacity, Object.assign({ style: styles.primaryButton }, { children: [_jsx(Text, Object.assign({ style: styles.primaryButtonText }, { children: t('Verify & Activate') })), _jsx(ArrowRight, { size: 24, color: colors.pureWhite, variant: "Linear" })] })), _jsx(SizeBox, { height: 18 }), _jsx(TouchableOpacity, Object.assign({ onPress: () => navigation.goBack() }, { children: _jsx(Text, Object.assign({ style: styles.linkTextBlue }, { children: t('Re-scan QR code') })) })), _jsx(SizeBox, { height: 8 }), _jsx(TouchableOpacity, Object.assign({ onPress: () => navigation.navigate('Authentication') }, { children: _jsx(Text, Object.assign({ style: styles.linkTextGray }, { children: t('Use different method') })) }))] }))] })));
};
export default VerificationCode;
