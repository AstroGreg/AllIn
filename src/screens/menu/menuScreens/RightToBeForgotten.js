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
import { ActivityIndicator, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useCallback, useMemo, useState } from 'react';
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { ArrowLeft2, Notification, ShieldSecurity, Trash } from 'iconsax-react-nativejs';
import { createStyles } from './RightToBeForgottenStyles';
import { useTranslation } from 'react-i18next';
import { deleteRightToBeForgotten, getPrivacySummary } from '../../../services/apiGateway';
import { useAuth } from '../../../context/AuthContext';
const RightToBeForgotten = ({ navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const { apiAccessToken, logout } = useAuth();
    const [summary, setSummary] = useState(null);
    const [warnings, setWarnings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const loadSummary = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        if (!apiAccessToken) {
            setError(t('privacyAuthRequired'));
            setSummary(null);
            setWarnings([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = yield getPrivacySummary(apiAccessToken);
            setSummary((_a = response.summary) !== null && _a !== void 0 ? _a : null);
            setWarnings(Array.isArray(response.warnings) ? response.warnings : []);
        }
        catch (err) {
            setError(String((_b = err === null || err === void 0 ? void 0 : err.message) !== null && _b !== void 0 ? _b : t('privacySummaryFailed')));
        }
        finally {
            setLoading(false);
        }
    }), [apiAccessToken, t]);
    useFocusEffect(useCallback(() => {
        void loadSummary();
    }, [loadSummary]));
    const stats = useMemo(() => {
        var _a, _b, _c, _d;
        if (!summary)
            return [];
        return [
            { key: 'records', label: t('privacyTotalRecords'), value: String((_a = summary.total_records) !== null && _a !== void 0 ? _a : 0) },
            { key: 'profiles', label: t('privacyProfiles'), value: String((_b = summary.profile_records) !== null && _b !== void 0 ? _b : 0) },
            { key: 'uploads', label: t('privacyUploads'), value: String((_c = summary.uploaded_media) !== null && _c !== void 0 ? _c : 0) },
            { key: 'faces', label: t('privacyFaces'), value: String((_d = summary.face_templates) !== null && _d !== void 0 ? _d : 0) },
        ];
    }, [summary, t]);
    const sections = useMemo(() => {
        if (!summary)
            return [];
        return [
            {
                key: 'identity',
                title: t('privacyIdentityTitle'),
                description: t('privacyIdentityDescription'),
                value: summary.user_records + summary.profile_records,
            },
            {
                key: 'face',
                title: t('privacyFaceTitle'),
                description: t('privacyFaceDescription'),
                value: summary.face_templates + summary.appearances + summary.consent_records,
            },
            {
                key: 'content',
                title: t('privacyContentTitle'),
                description: t('privacyContentDescription'),
                value: summary.uploaded_media + summary.posts + summary.timeline_entries,
            },
            {
                key: 'connections',
                title: t('privacyConnectionsTitle'),
                description: t('privacyConnectionsDescription'),
                value: summary.groups_owned + summary.group_memberships + summary.follow_edges,
            },
        ];
    }, [summary, t]);
    const canConfirmDelete = confirmText.trim().toUpperCase() === 'DELETE';
    const handleDelete = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _c, _d, _e, _f, _g;
        if (!apiAccessToken || deleting || !canConfirmDelete)
            return;
        setDeleting(true);
        setError(null);
        try {
            yield deleteRightToBeForgotten(apiAccessToken, { confirmation: 'DELETE' });
            setConfirmVisible(false);
            setConfirmText('');
            yield logout();
            const rootNav = (_f = (_e = (_d = (_c = navigation.getParent) === null || _c === void 0 ? void 0 : _c.call(navigation)) === null || _d === void 0 ? void 0 : _d.getParent) === null || _e === void 0 ? void 0 : _e.call(_d)) !== null && _f !== void 0 ? _f : navigation;
            rootNav.dispatch(CommonActions.reset({
                index: 0,
                routes: [{ name: 'LoginScreen' }],
            }));
        }
        catch (err) {
            setError(String((_g = err === null || err === void 0 ? void 0 : err.message) !== null && _g !== void 0 ? _g : t('privacyDeleteFailed')));
        }
        finally {
            setDeleting(false);
        }
    }), [apiAccessToken, canConfirmDelete, deleting, logout, navigation, t]);
    return (_jsxs(View, Object.assign({ style: styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: styles.headerTitle }, { children: t('rightToBeForgotten') })), _jsx(TouchableOpacity, Object.assign({ style: styles.headerButton }, { children: _jsx(Notification, { size: 24, color: colors.primaryColor, variant: "Linear" }) }))] })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, style: styles.container, contentContainerStyle: styles.scrollContent }, { children: [_jsxs(View, Object.assign({ style: styles.infoCard }, { children: [_jsxs(View, Object.assign({ style: styles.infoHeader }, { children: [_jsx(View, Object.assign({ style: styles.infoIconContainer }, { children: _jsx(ShieldSecurity, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: styles.infoTitle }, { children: t('privacySensitiveDataTitle') }))] })), _jsx(Text, Object.assign({ style: styles.infoDescription }, { children: t('privacySensitiveDataDescription') }))] })), _jsx(SizeBox, { height: 16 }), loading ? (_jsxs(View, Object.assign({ style: styles.loadingCard }, { children: [_jsx(ActivityIndicator, { color: colors.primaryColor }), _jsx(Text, Object.assign({ style: styles.loadingText }, { children: t('privacyLoading') }))] }))) : null, error ? (_jsxs(View, Object.assign({ style: styles.errorCard }, { children: [_jsx(Text, Object.assign({ style: styles.errorTitle }, { children: t('privacySummaryFailed') })), _jsx(Text, Object.assign({ style: styles.errorText }, { children: error }))] }))) : null, stats.length > 0 ? (_jsx(View, Object.assign({ style: styles.statsGrid }, { children: stats.map((item) => (_jsxs(View, Object.assign({ style: styles.statCard }, { children: [_jsx(Text, Object.assign({ style: styles.statValue }, { children: item.value })), _jsx(Text, Object.assign({ style: styles.statLabel }, { children: item.label }))] }), item.key))) }))) : null, sections.map((section) => (_jsxs(View, Object.assign({ style: styles.sectionCard }, { children: [_jsxs(View, Object.assign({ style: styles.sectionHeaderRow }, { children: [_jsx(Text, Object.assign({ style: styles.sectionTitle }, { children: section.title })), _jsx(Text, Object.assign({ style: styles.sectionCount }, { children: section.value }))] })), _jsx(Text, Object.assign({ style: styles.sectionDescription }, { children: section.description }))] }), section.key))), warnings.map((warning, index) => (_jsx(View, Object.assign({ style: styles.warningCard }, { children: _jsx(Text, Object.assign({ style: styles.warningText }, { children: warning })) }), `${warning}-${index}`))), _jsx(TouchableOpacity, Object.assign({ style: styles.secondaryButton, onPress: () => void loadSummary(), disabled: loading || deleting }, { children: _jsx(Text, Object.assign({ style: styles.secondaryButtonText }, { children: t('privacyReloadSummary') })) })), _jsx(SizeBox, { height: 12 }), _jsxs(TouchableOpacity, Object.assign({ style: styles.dangerButton, onPress: () => setConfirmVisible(true), disabled: loading || deleting || !summary }, { children: [_jsx(Trash, { size: 20, color: colors.pureWhite, variant: "Linear" }), _jsx(Text, Object.assign({ style: styles.dangerButtonText }, { children: t('privacyDeleteButton') }))] }))] })), _jsx(Modal, Object.assign({ visible: confirmVisible, transparent: true, animationType: "fade", onRequestClose: () => setConfirmVisible(false) }, { children: _jsx(View, Object.assign({ style: styles.modalOverlay }, { children: _jsxs(View, Object.assign({ style: styles.modalCard }, { children: [_jsx(Text, Object.assign({ style: styles.modalTitle }, { children: t('privacyDeleteConfirmTitle') })), _jsx(Text, Object.assign({ style: styles.modalDescription }, { children: t('privacyDeleteConfirmDescription') })), _jsx(Text, Object.assign({ style: styles.modalHint }, { children: t('privacyTypeDeleteHint') })), _jsx(TextInput, { value: confirmText, onChangeText: setConfirmText, autoCapitalize: "characters", autoCorrect: false, placeholder: "DELETE", placeholderTextColor: colors.grayColor, style: styles.confirmInput }), _jsxs(View, Object.assign({ style: styles.modalActions }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.modalSecondaryButton, onPress: () => {
                                            if (deleting)
                                                return;
                                            setConfirmVisible(false);
                                            setConfirmText('');
                                        } }, { children: _jsx(Text, Object.assign({ style: styles.modalSecondaryButtonText }, { children: t('Cancel') })) })), _jsx(TouchableOpacity, Object.assign({ style: [styles.modalDangerButton, !canConfirmDelete && styles.modalDangerButtonDisabled], onPress: () => void handleDelete(), disabled: !canConfirmDelete || deleting }, { children: _jsx(Text, Object.assign({ style: styles.modalDangerButtonText }, { children: deleting ? t('privacyDeleting') : t('privacyDeletePermanently') })) }))] }))] })) })) }))] })));
};
export default RightToBeForgotten;
