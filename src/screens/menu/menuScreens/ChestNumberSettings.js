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
import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createStyles } from '../MenuStyles';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { ArrowDown2, ArrowLeft2 } from 'iconsax-react-nativejs';
import { useAuth } from '../../../context/AuthContext';
import { ApiError, getProfileSummary, updateProfileSummary } from '../../../services/apiGateway';
import { useTranslation } from 'react-i18next';
const ChestNumberSettings = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const Styles = createStyles(colors);
    const { apiAccessToken, userProfile, updateUserProfile } = useAuth();
    const currentYear = useMemo(() => new Date().getFullYear(), []);
    const currentYearString = useMemo(() => String(currentYear), [currentYear]);
    const [selectedYear, setSelectedYear] = useState(currentYearString);
    const [showYearPicker, setShowYearPicker] = useState(false);
    const [chestByYear, setChestByYear] = useState({});
    const [chestInput, setChestInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const yearOptions = useMemo(() => {
        const out = [];
        for (let y = currentYear; y >= 2000; y -= 1)
            out.push(String(y));
        return out;
    }, [currentYear]);
    const normalizeChestByYear = useCallback((raw) => {
        if (!raw || typeof raw !== 'object' || Array.isArray(raw))
            return {};
        const out = {};
        for (const [year, chest] of Object.entries(raw)) {
            const safeYear = String(year !== null && year !== void 0 ? year : '').trim();
            if (!/^\d{4}$/.test(safeYear))
                continue;
            const parsed = Number(chest);
            if (!Number.isInteger(parsed) || parsed < 0)
                continue;
            out[safeYear] = String(parsed);
        }
        return out;
    }, []);
    useEffect(() => {
        var _a;
        let active = true;
        const local = normalizeChestByYear((_a = userProfile === null || userProfile === void 0 ? void 0 : userProfile.chestNumbersByYear) !== null && _a !== void 0 ? _a : {});
        setChestByYear(local);
        setIsLoading(Boolean(apiAccessToken));
        (() => __awaiter(void 0, void 0, void 0, function* () {
            var _b, _c;
            if (!apiAccessToken)
                return;
            try {
                const summary = yield getProfileSummary(apiAccessToken);
                if (!active)
                    return;
                const server = normalizeChestByYear((_c = (_b = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _b === void 0 ? void 0 : _b.chest_numbers_by_year) !== null && _c !== void 0 ? _c : {});
                setChestByYear(server);
                yield updateUserProfile({ chestNumbersByYear: server }, { persistLocally: false });
            }
            catch (_d) {
                // keep local fallback
            }
            finally {
                if (active)
                    setIsLoading(false);
            }
        }))();
        return () => {
            active = false;
        };
    }, [apiAccessToken, normalizeChestByYear, updateUserProfile]);
    useEffect(() => {
        var _a;
        setChestInput(String((_a = chestByYear[selectedYear]) !== null && _a !== void 0 ? _a : ''));
    }, [chestByYear, selectedYear]);
    const currentChest = useMemo(() => {
        var _a;
        const thisYear = String((_a = chestByYear[currentYearString]) !== null && _a !== void 0 ? _a : '').trim();
        if (thisYear.length > 0)
            return thisYear;
        const latestYear = Object.keys(chestByYear)
            .filter((year) => /^\d{4}$/.test(String(year)))
            .sort((a, b) => Number(b) - Number(a))
            .find((year) => { var _a; return String((_a = chestByYear[year]) !== null && _a !== void 0 ? _a : '').trim().length > 0; });
        return latestYear ? String(chestByYear[latestYear]).trim() : '';
    }, [chestByYear, currentYearString]);
    const canSave = useMemo(() => {
        var _a;
        if (isSaving || isLoading)
            return false;
        const normalizedInput = String(chestInput !== null && chestInput !== void 0 ? chestInput : '').replace(/[^0-9]/g, '').trim();
        const stored = String((_a = chestByYear[selectedYear]) !== null && _a !== void 0 ? _a : '').trim();
        return normalizedInput !== stored;
    }, [chestByYear, chestInput, isLoading, isSaving, selectedYear]);
    const handleCancelEdit = () => {
        var _a;
        setChestInput(String((_a = chestByYear[selectedYear]) !== null && _a !== void 0 ? _a : ''));
    };
    const handleSave = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        if (!/^\d{4}$/.test(String(selectedYear)))
            return;
        const normalizedInput = String(chestInput !== null && chestInput !== void 0 ? chestInput : '').replace(/[^0-9]/g, '').trim();
        const nextByYear = Object.assign({}, chestByYear);
        if (!normalizedInput) {
            delete nextByYear[selectedYear];
        }
        else {
            const parsed = Number(normalizedInput);
            if (!Number.isInteger(parsed) || parsed < 0) {
                Alert.alert(t('Save failed'), t('Please try again'));
                return;
            }
            nextByYear[selectedYear] = String(parsed);
        }
        const payload = Object.entries(nextByYear).reduce((acc, [year, chest]) => {
            const parsed = Number(chest);
            if (/^\d{4}$/.test(String(year)) && Number.isInteger(parsed) && parsed >= 0) {
                acc[String(year)] = parsed;
            }
            return acc;
        }, {});
        setIsSaving(true);
        try {
            if (apiAccessToken) {
                const updated = yield updateProfileSummary(apiAccessToken, { chest_numbers_by_year: payload });
                const stored = normalizeChestByYear((_b = (_a = updated === null || updated === void 0 ? void 0 : updated.profile) === null || _a === void 0 ? void 0 : _a.chest_numbers_by_year) !== null && _b !== void 0 ? _b : payload);
                setChestByYear(stored);
                yield updateUserProfile({ chestNumbersByYear: stored });
            }
            else {
                setChestByYear(nextByYear);
                yield updateUserProfile({ chestNumbersByYear: nextByYear });
            }
        }
        catch (e) {
            const message = e instanceof ApiError ? e.message : String((_c = e === null || e === void 0 ? void 0 : e.message) !== null && _c !== void 0 ? _c : e);
            Alert.alert(t('Save failed'), message || t('Please try again'));
        }
        finally {
            setIsSaving(false);
        }
    });
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer, testID: "chest-number-settings-screen" }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('Chest number by year') })), _jsx(View, { style: Styles.headerSpacer })] })), _jsxs(ScrollView, Object.assign({ style: Styles.container, showsVerticalScrollIndicator: false }, { children: [_jsx(SizeBox, { height: 24 }), _jsx(Text, Object.assign({ style: Styles.changePasswordTitle }, { children: t('Chest number by year') })), _jsx(SizeBox, { height: 16 }), _jsx(View, Object.assign({ style: Styles.currentValueCard }, { children: _jsxs(View, { children: [_jsx(Text, Object.assign({ style: Styles.currentValueLabel }, { children: t('Current chest number') })), _jsx(Text, Object.assign({ style: Styles.currentValueText }, { children: currentChest || t('Not set') }))] }) })), _jsx(SizeBox, { height: 24 }), isLoading ? (_jsx(View, Object.assign({ style: { paddingVertical: 20 } }, { children: _jsx(ActivityIndicator, { color: colors.primaryColor }) }))) : (_jsxs(_Fragment, { children: [_jsxs(View, Object.assign({ style: Styles.addCardInputGroup }, { children: [_jsx(Text, Object.assign({ style: Styles.addCardLabel }, { children: t('year') })), _jsx(SizeBox, { height: 8 }), _jsxs(TouchableOpacity, Object.assign({ style: Styles.addCardInputContainer, onPress: () => setShowYearPicker(true) }, { children: [_jsx(Text, Object.assign({ style: Styles.addCardInputText }, { children: selectedYear })), _jsx(ArrowDown2, { size: 18, color: colors.grayColor, variant: "Linear" })] }))] })), _jsx(SizeBox, { height: 16 }), _jsxs(View, Object.assign({ style: Styles.addCardInputGroup }, { children: [_jsx(Text, Object.assign({ style: Styles.addCardLabel }, { children: t('chestNumber') })), _jsx(SizeBox, { height: 8 }), _jsx(View, Object.assign({ style: Styles.addCardInputContainer }, { children: _jsx(TextInput, { style: Styles.addCardInput, placeholder: t('chestNumber'), placeholderTextColor: colors.grayColor, keyboardType: "number-pad", value: chestInput, onChangeText: (value) => setChestInput(String(value || '').replace(/[^0-9]/g, '')), editable: !isSaving, returnKeyType: "done", onSubmitEditing: handleSave, testID: "chest-number-input" }) }))] })), _jsxs(View, Object.assign({ style: Styles.editActionsRow }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.cancelButton, disabled: isSaving, onPress: handleCancelEdit }, { children: _jsx(Text, Object.assign({ style: Styles.cancelButtonText }, { children: t('cancel') })) })), _jsx(TouchableOpacity, Object.assign({ style: [Styles.saveButton, !canSave && { opacity: 0.6 }], disabled: !canSave, onPress: handleSave, testID: "chest-number-save" }, { children: isSaving ? (_jsx(ActivityIndicator, { size: "small", color: colors.pureWhite })) : (_jsx(Text, Object.assign({ style: Styles.saveButtonText }, { children: t('save') }))) }))] }))] })), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] })), _jsx(Modal, Object.assign({ visible: showYearPicker, transparent: true, animationType: "fade", onRequestClose: () => setShowYearPicker(false) }, { children: _jsxs(View, Object.assign({ style: Styles.selectionModalOverlay }, { children: [_jsx(Pressable, { style: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }, onPress: () => setShowYearPicker(false) }), _jsxs(View, Object.assign({ style: Styles.selectionModalCard }, { children: [_jsx(Text, Object.assign({ style: Styles.selectionModalTitle }, { children: t('year') })), _jsx(ScrollView, { children: yearOptions.map((year) => (_jsx(TouchableOpacity, Object.assign({ style: Styles.selectionOption, onPress: () => {
                                            setSelectedYear(year);
                                            setShowYearPicker(false);
                                        } }, { children: _jsx(Text, Object.assign({ style: Styles.selectionOptionText }, { children: year })) }), `chest-year-${year}`))) })] }))] })) }))] })));
};
export default ChestNumberSettings;
