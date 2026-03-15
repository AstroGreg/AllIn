import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useState } from 'react';
import { createStyles } from '../MenuStyles';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { ArrowLeft2, Unlock } from 'iconsax-react-nativejs';
import { useTranslation } from 'react-i18next';
const ChangePassword = ({ navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('Change Password') })), _jsx(View, { style: Styles.headerSpacer })] })), _jsxs(ScrollView, Object.assign({ style: Styles.container, showsVerticalScrollIndicator: false }, { children: [_jsx(SizeBox, { height: 24 }), _jsx(Text, Object.assign({ style: Styles.changePasswordTitle }, { children: t('Change Password') })), _jsx(SizeBox, { height: 16 }), _jsxs(View, Object.assign({ style: Styles.currentValueCard }, { children: [_jsxs(View, { children: [_jsx(Text, Object.assign({ style: Styles.currentValueLabel }, { children: t('Current password') })), _jsx(Text, Object.assign({ style: Styles.currentValueText }, { children: t('••••••••') }))] }), _jsx(TouchableOpacity, Object.assign({ style: Styles.editActionButton, onPress: () => setIsEditing(true) }, { children: _jsx(Text, Object.assign({ style: Styles.editActionText }, { children: t('Edit') })) }))] })), isEditing && (_jsxs(_Fragment, { children: [_jsx(SizeBox, { height: 24 }), _jsxs(View, Object.assign({ style: Styles.addCardInputGroup }, { children: [_jsx(Text, Object.assign({ style: Styles.addCardLabel }, { children: t('Current password') })), _jsx(SizeBox, { height: 8 }), _jsxs(View, Object.assign({ style: Styles.addCardInputContainer }, { children: [_jsx(Unlock, { size: 16, color: colors.primaryColor, variant: "Linear" }), _jsx(SizeBox, { width: 10 }), _jsx(TextInput, { style: Styles.addCardInput, placeholder: t('Enter current password'), placeholderTextColor: colors.grayColor, value: currentPassword, onChangeText: setCurrentPassword, secureTextEntry: true })] }))] })), _jsx(SizeBox, { height: 20 }), _jsxs(View, Object.assign({ style: Styles.addCardInputGroup }, { children: [_jsx(Text, Object.assign({ style: Styles.addCardLabel }, { children: t('New password') })), _jsx(SizeBox, { height: 8 }), _jsxs(View, Object.assign({ style: Styles.addCardInputContainer }, { children: [_jsx(Unlock, { size: 16, color: colors.primaryColor, variant: "Linear" }), _jsx(SizeBox, { width: 10 }), _jsx(TextInput, { style: Styles.addCardInput, placeholder: t('Enter new password'), placeholderTextColor: colors.grayColor, value: newPassword, onChangeText: setNewPassword, secureTextEntry: true })] }))] })), _jsxs(View, Object.assign({ style: Styles.editActionsRow }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.cancelButton, onPress: () => setIsEditing(false) }, { children: _jsx(Text, Object.assign({ style: Styles.cancelButtonText }, { children: t('Cancel') })) })), _jsx(TouchableOpacity, Object.assign({ style: Styles.saveButton, onPress: () => {
                                            if (!currentPassword.trim() || !newPassword.trim())
                                                return;
                                            setIsEditing(false);
                                            navigation.goBack();
                                        } }, { children: _jsx(Text, Object.assign({ style: Styles.saveButtonText }, { children: t('Save') })) }))] }))] })), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] }))] })));
};
export default ChangePassword;
