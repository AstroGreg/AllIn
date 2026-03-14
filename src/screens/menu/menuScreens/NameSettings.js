var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useMemo, useState } from 'react';
import { createStyles } from '../MenuStyles';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { ArrowLeft2, User } from 'iconsax-react-nativejs';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from 'react-i18next';
const NameSettings = ({ navigation }) => {
    var _a, _b;
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    const { apiAccessToken, userProfile, updateUserProfile } = useAuth();
    const [firstName, setFirstName] = useState(String((_a = userProfile === null || userProfile === void 0 ? void 0 : userProfile.firstName) !== null && _a !== void 0 ? _a : ''));
    const [lastName, setLastName] = useState(String((_b = userProfile === null || userProfile === void 0 ? void 0 : userProfile.lastName) !== null && _b !== void 0 ? _b : ''));
    const [isSaving, setIsSaving] = useState(false);
    const canSave = useMemo(() => !isSaving &&
        Boolean(apiAccessToken) &&
        (firstName.trim().length > 0 || lastName.trim().length > 0), [apiAccessToken, firstName, isSaving, lastName]);
    const handleSave = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!apiAccessToken) {
            Alert.alert(t('Error'), t('Please sign in again.'));
            return;
        }
        if (!canSave) {
            return;
        }
        setIsSaving(true);
        try {
            const trimmedFirst = firstName.trim();
            const trimmedLast = lastName.trim();
            yield updateUserProfile({ firstName: trimmedFirst, lastName: trimmedLast });
            navigation.goBack();
        }
        catch (_c) {
            Alert.alert(t('Error'), t('Failed to save. Please try again.'));
        }
        finally {
            setIsSaving(false);
        }
    });
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('Name') })), _jsx(View, { style: Styles.headerSpacer })] })), _jsxs(ScrollView, Object.assign({ style: Styles.container, showsVerticalScrollIndicator: false }, { children: [_jsx(SizeBox, { height: 24 }), _jsxs(View, Object.assign({ style: Styles.addCardInputGroup }, { children: [_jsx(Text, Object.assign({ style: Styles.addCardLabel }, { children: t('First name') })), _jsx(SizeBox, { height: 8 }), _jsxs(View, Object.assign({ style: Styles.addCardInputContainer }, { children: [_jsx(User, { size: 16, color: colors.primaryColor, variant: "Linear" }), _jsx(SizeBox, { width: 10 }), _jsx(TextInput, { style: Styles.addCardInput, value: firstName, onChangeText: setFirstName, placeholder: t('First name'), placeholderTextColor: colors.grayColor })] }))] })), _jsx(SizeBox, { height: 14 }), _jsxs(View, Object.assign({ style: Styles.addCardInputGroup }, { children: [_jsx(Text, Object.assign({ style: Styles.addCardLabel }, { children: t('Last name') })), _jsx(SizeBox, { height: 8 }), _jsxs(View, Object.assign({ style: Styles.addCardInputContainer }, { children: [_jsx(User, { size: 16, color: colors.primaryColor, variant: "Linear" }), _jsx(SizeBox, { width: 10 }), _jsx(TextInput, { style: Styles.addCardInput, value: lastName, onChangeText: setLastName, placeholder: t('Last name'), placeholderTextColor: colors.grayColor })] }))] })), _jsxs(View, Object.assign({ style: Styles.editActionsRow }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.cancelButton, onPress: () => navigation.goBack(), disabled: isSaving }, { children: _jsx(Text, Object.assign({ style: Styles.cancelButtonText }, { children: t('Cancel') })) })), _jsx(TouchableOpacity, Object.assign({ style: [Styles.saveButton, !canSave && { opacity: 0.6 }], disabled: !canSave, onPress: handleSave }, { children: isSaving ? _jsx(ActivityIndicator, { size: "small", color: colors.pureWhite }) : _jsx(Text, Object.assign({ style: Styles.saveButtonText }, { children: t('save') })) }))] }))] }))] })));
};
export default NameSettings;
