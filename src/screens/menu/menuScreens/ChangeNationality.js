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
import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable, Alert } from 'react-native';
import { useMemo, useState } from 'react';
import { createStyles } from '../MenuStyles';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { ArrowLeft2, Card, ArrowDown2 } from 'iconsax-react-nativejs';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { getNationalityOptions } from '../../../constants/Nationalities';
const ChangeNationality = ({ navigation }) => {
    var _a, _b, _c;
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { userProfile, authBootstrap, updateUserAccount } = useAuth();
    const [newNationality, setNewNationality] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const bootstrapNationality = String((_b = (_a = authBootstrap === null || authBootstrap === void 0 ? void 0 : authBootstrap.user) === null || _a === void 0 ? void 0 : _a.nationality) !== null && _b !== void 0 ? _b : '').trim();
    const currentNationality = String((_c = userProfile === null || userProfile === void 0 ? void 0 : userProfile.nationality) !== null && _c !== void 0 ? _c : '').trim() || bootstrapNationality || 'Not set';
    const nationalityOptions = useMemo(() => getNationalityOptions(), []);
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('Change Nationality') })), _jsx(View, { style: Styles.headerSpacer })] })), _jsxs(ScrollView, Object.assign({ style: Styles.container, showsVerticalScrollIndicator: false }, { children: [_jsx(SizeBox, { height: 24 }), _jsx(Text, Object.assign({ style: Styles.changePasswordTitle }, { children: t('Change Nationality') })), _jsx(SizeBox, { height: 16 }), _jsxs(View, Object.assign({ style: Styles.currentValueCard }, { children: [_jsxs(View, { children: [_jsx(Text, Object.assign({ style: Styles.currentValueLabel }, { children: t('Current nationality') })), _jsx(Text, Object.assign({ style: Styles.currentValueText }, { children: currentNationality }))] }), _jsx(TouchableOpacity, Object.assign({ style: Styles.editActionButton, onPress: () => {
                                    setNewNationality(currentNationality === 'Not set' ? '' : String(currentNationality));
                                    setIsEditing(true);
                                } }, { children: _jsx(Text, Object.assign({ style: Styles.editActionText }, { children: t('Edit') })) }))] })), isEditing && (_jsxs(_Fragment, { children: [_jsx(SizeBox, { height: 24 }), _jsxs(View, Object.assign({ style: Styles.addCardInputGroup }, { children: [_jsx(Text, Object.assign({ style: Styles.addCardLabel }, { children: t('Nationality') })), _jsx(SizeBox, { height: 8 }), _jsxs(TouchableOpacity, Object.assign({ style: Styles.addCardInputContainer, onPress: () => setShowModal(true) }, { children: [_jsx(Card, { size: 16, color: colors.primaryColor, variant: "Linear" }), _jsx(SizeBox, { width: 10 }), _jsx(Text, Object.assign({ style: [Styles.addCardPlaceholder, newNationality && Styles.addCardInputText] }, { children: newNationality || 'Select nationality' })), _jsx(ArrowDown2, { size: 20, color: colors.grayColor, variant: "Linear" })] }))] })), _jsxs(View, Object.assign({ style: Styles.editActionsRow }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.cancelButton, onPress: () => setIsEditing(false) }, { children: _jsx(Text, Object.assign({ style: Styles.cancelButtonText }, { children: t('Cancel') })) })), _jsx(TouchableOpacity, Object.assign({ style: Styles.saveButton, onPress: () => __awaiter(void 0, void 0, void 0, function* () {
                                            if (!newNationality.trim())
                                                return;
                                            const nextNationality = newNationality.trim();
                                            try {
                                                yield updateUserAccount({ nationality: nextNationality });
                                                setIsEditing(false);
                                            }
                                            catch (_d) {
                                                Alert.alert(t('Error'), t('Failed to save. Please try again.'));
                                            }
                                        }) }, { children: _jsx(Text, Object.assign({ style: Styles.saveButtonText }, { children: t('Save') })) }))] }))] })), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] })), _jsx(Modal, Object.assign({ visible: showModal, transparent: true, animationType: "fade", onRequestClose: () => setShowModal(false) }, { children: _jsx(Pressable, Object.assign({ style: Styles.selectionModalOverlay, onPress: () => setShowModal(false) }, { children: _jsxs(Pressable, Object.assign({ style: Styles.selectionModalCard, onPress: () => { } }, { children: [_jsx(Text, Object.assign({ style: Styles.selectionModalTitle }, { children: t('Select nationality') })), _jsx(ScrollView, Object.assign({ showsVerticalScrollIndicator: false }, { children: nationalityOptions.map((option) => (_jsx(TouchableOpacity, Object.assign({ style: Styles.selectionOption, onPress: () => {
                                        setNewNationality(option);
                                        setShowModal(false);
                                    } }, { children: _jsx(Text, Object.assign({ style: Styles.selectionOptionText }, { children: option })) }), option))) }))] })) })) }))] })));
};
export default ChangeNationality;
