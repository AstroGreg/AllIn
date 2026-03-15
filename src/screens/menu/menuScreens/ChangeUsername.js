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
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { createStyles } from '../MenuStyles';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { ArrowLeft2, User } from 'iconsax-react-nativejs';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { checkAccountAvailability } from '../../../services/apiGateway';
import { validateUsernameInput } from '../../../utils/accountAvailability';
const neutralAvailabilityState = () => ({
    status: 'idle',
    message: '',
    valid: true,
    available: true,
});
const ChangeUsername = ({ navigation }) => {
    var _a;
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { userProfile, user, authBootstrap, updateUserAccount, accessToken } = useAuth();
    const [newUsername, setNewUsername] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [availability, setAvailability] = useState(neutralAvailabilityState);
    const looksLikeSystemIdentity = useCallback((value) => {
        const normalized = String(value !== null && value !== void 0 ? value : '').trim().toLowerCase();
        if (!normalized)
            return false;
        if (normalized.includes('|'))
            return true;
        return /^(google-oauth2|auth0|apple)[._:-]/.test(normalized);
    }, []);
    const sanitizeUsername = useCallback((value) => {
        const normalized = String(value !== null && value !== void 0 ? value : '').trim();
        if (!normalized || looksLikeSystemIdentity(normalized))
            return '';
        return normalized;
    }, [looksLikeSystemIdentity]);
    const currentUsername = sanitizeUsername(userProfile === null || userProfile === void 0 ? void 0 : userProfile.username) ||
        sanitizeUsername((_a = authBootstrap === null || authBootstrap === void 0 ? void 0 : authBootstrap.user) === null || _a === void 0 ? void 0 : _a.username) ||
        sanitizeUsername(user === null || user === void 0 ? void 0 : user.nickname) ||
        'Not set';
    useEffect(() => {
        if (!isEditing) {
            setAvailability(neutralAvailabilityState());
            return;
        }
        const value = newUsername.trim();
        if (!value || value === currentUsername) {
            setAvailability(neutralAvailabilityState());
            return;
        }
        if (looksLikeSystemIdentity(value)) {
            setAvailability({
                status: 'invalid',
                message: t('Please choose a custom username.'),
                valid: false,
                available: false,
            });
            return;
        }
        const reason = validateUsernameInput(value);
        if (reason) {
            const message = reason === 'too_short'
                ? t('Use at least 2 characters.')
                : reason === 'too_long'
                    ? t('Use 32 characters or fewer.')
                    : reason === 'invalid_format'
                        ? t('Use only letters, numbers, dots, underscores, or hyphens.')
                        : t('Username is required.');
            setAvailability({
                status: 'invalid',
                message,
                valid: false,
                available: false,
            });
            return;
        }
        if (!accessToken) {
            setAvailability(neutralAvailabilityState());
            return;
        }
        let cancelled = false;
        setAvailability({
            status: 'checking',
            message: t('Checking username...'),
            valid: true,
            available: false,
        });
        const timer = setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const res = yield checkAccountAvailability(accessToken, { username: value });
                if (cancelled)
                    return;
                if (!res.username) {
                    setAvailability(neutralAvailabilityState());
                    return;
                }
                if (!res.username.valid) {
                    setAvailability({
                        status: 'invalid',
                        message: t('Please choose a valid username.'),
                        valid: false,
                        available: false,
                    });
                    return;
                }
                if (!res.username.available) {
                    setAvailability({
                        status: 'taken',
                        message: t('This username is already in use.'),
                        valid: true,
                        available: false,
                    });
                    return;
                }
                setAvailability({
                    status: 'available',
                    message: t('Username is available.'),
                    valid: true,
                    available: true,
                });
            }
            catch (_a) {
                if (!cancelled) {
                    setAvailability(neutralAvailabilityState());
                }
            }
        }), 350);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [accessToken, currentUsername, isEditing, looksLikeSystemIdentity, newUsername, t]);
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('Change Username') })), _jsx(View, { style: Styles.headerSpacer })] })), _jsxs(ScrollView, Object.assign({ style: Styles.container, showsVerticalScrollIndicator: false }, { children: [_jsx(SizeBox, { height: 24 }), _jsx(Text, Object.assign({ style: Styles.changePasswordTitle }, { children: t('Change Username') })), _jsx(SizeBox, { height: 16 }), _jsxs(View, Object.assign({ style: Styles.currentValueCard }, { children: [_jsxs(View, { children: [_jsx(Text, Object.assign({ style: Styles.currentValueLabel }, { children: t('Current username') })), _jsx(Text, Object.assign({ style: Styles.currentValueText }, { children: currentUsername }))] }), _jsx(TouchableOpacity, Object.assign({ style: Styles.editActionButton, onPress: () => {
                                    setNewUsername(currentUsername === 'Not set' ? '' : String(currentUsername));
                                    setIsEditing(true);
                                } }, { children: _jsx(Text, Object.assign({ style: Styles.editActionText }, { children: t('Edit') })) }))] })), isEditing && (_jsxs(_Fragment, { children: [_jsx(SizeBox, { height: 24 }), _jsxs(View, Object.assign({ style: Styles.addCardInputGroup }, { children: [_jsx(Text, Object.assign({ style: Styles.addCardLabel }, { children: t('Username') })), _jsx(SizeBox, { height: 8 }), _jsxs(View, Object.assign({ style: Styles.addCardInputContainer }, { children: [_jsx(User, { size: 16, color: colors.primaryColor, variant: "Linear" }), _jsx(SizeBox, { width: 10 }), _jsx(TextInput, { style: Styles.addCardInput, placeholder: t('Enter username'), placeholderTextColor: colors.grayColor, value: newUsername, onChangeText: setNewUsername })] })), availability.status !== 'idle' ? (_jsx(Text, Object.assign({ style: [
                                            Styles.inlineHelperText,
                                            availability.status === 'available'
                                                ? { color: colors.greenColor }
                                                : availability.status === 'checking'
                                                    ? { color: colors.grayColor }
                                                    : { color: colors.errorColor },
                                        ] }, { children: availability.message }))) : null] })), _jsxs(View, Object.assign({ style: Styles.editActionsRow }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.cancelButton, onPress: () => setIsEditing(false) }, { children: _jsx(Text, Object.assign({ style: Styles.cancelButtonText }, { children: t('Cancel') })) })), _jsx(TouchableOpacity, Object.assign({ style: Styles.saveButton, onPress: () => __awaiter(void 0, void 0, void 0, function* () {
                                            if (!newUsername.trim())
                                                return;
                                            const nextUsername = newUsername.trim();
                                            if (looksLikeSystemIdentity(nextUsername)) {
                                                Alert.alert(t('Invalid username'), t('Please choose a custom username.'));
                                                return;
                                            }
                                            if (!availability.valid || !availability.available || availability.status === 'checking') {
                                                Alert.alert(t('Invalid username'), availability.message || t('Please choose an available username.'));
                                                return;
                                            }
                                            try {
                                                yield updateUserAccount({ username: nextUsername });
                                                setIsEditing(false);
                                            }
                                            catch (_b) {
                                                Alert.alert(t('Error'), t('Failed to save. Please try again.'));
                                            }
                                        }) }, { children: _jsx(Text, Object.assign({ style: Styles.saveButtonText }, { children: t('Save') })) }))] }))] })), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] }))] })));
};
export default ChangeUsername;
