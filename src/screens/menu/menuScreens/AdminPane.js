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
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft2, ArrowRight2, DocumentText, Profile2User, Refresh, SearchNormal1, VideoSquare, } from 'iconsax-react-nativejs';
import SizeBox from '../../../constants/SizeBox';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { getAuthMe } from '../../../services/apiGateway';
import { createStyles } from '../MenuStyles';
import { useTranslation } from 'react-i18next';
const AdminPane = ({ navigation }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { apiAccessToken, authBootstrap, isAuthenticated, refreshAuthBootstrap, userProfile, } = useAuth();
    const [authMe, setAuthMe] = useState(null);
    const [bootstrapSnapshot, setBootstrapSnapshot] = useState(authBootstrap);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const normalizedSelectedEvents = useMemo(() => {
        const source = userProfile === null || userProfile === void 0 ? void 0 : userProfile.selectedEvents;
        if (!Array.isArray(source)) {
            return [];
        }
        return source
            .map((entry) => {
            var _a, _b, _c, _d;
            return String(typeof entry === 'string'
                ? entry
                : (_d = (_c = (_b = (_a = entry === null || entry === void 0 ? void 0 : entry.id) !== null && _a !== void 0 ? _a : entry === null || entry === void 0 ? void 0 : entry.value) !== null && _b !== void 0 ? _b : entry === null || entry === void 0 ? void 0 : entry.event_id) !== null && _c !== void 0 ? _c : entry === null || entry === void 0 ? void 0 : entry.name) !== null && _d !== void 0 ? _d : '').trim();
        })
            .filter(Boolean);
    }, [userProfile === null || userProfile === void 0 ? void 0 : userProfile.selectedEvents]);
    const loadAdminData = useCallback((silent = false) => __awaiter(void 0, void 0, void 0, function* () {
        var _k;
        if (!apiAccessToken) {
            setAuthMe(null);
            setBootstrapSnapshot(authBootstrap);
            setError(null);
            return;
        }
        if (silent) {
            setIsRefreshing(true);
        }
        else {
            setIsLoading(true);
        }
        try {
            setError(null);
            const [meResponse, bootstrapResponse] = yield Promise.all([
                getAuthMe(apiAccessToken),
                refreshAuthBootstrap(),
            ]);
            setAuthMe(meResponse);
            setBootstrapSnapshot(bootstrapResponse);
        }
        catch (err) {
            setError((_k = err === null || err === void 0 ? void 0 : err.message) !== null && _k !== void 0 ? _k : t('Failed to load admin data.'));
        }
        finally {
            if (silent) {
                setIsRefreshing(false);
            }
            else {
                setIsLoading(false);
            }
        }
    }), [apiAccessToken, authBootstrap, refreshAuthBootstrap, t]);
    useFocusEffect(useCallback(() => {
        loadAdminData();
    }, [loadAdminData]));
    const openTabScreen = useCallback((tabName, screen) => {
        var _a;
        const parentNavigation = (_a = navigation.getParent) === null || _a === void 0 ? void 0 : _a.call(navigation);
        if (parentNavigation) {
            parentNavigation.navigate(tabName, { screen });
            return;
        }
        navigation.navigate(screen);
    }, [navigation]);
    const actionItems = useMemo(() => [
        {
            icon: _jsx(DocumentText, { size: 20, color: colors.primaryColor, variant: "Linear" }),
            title: t('Hub'),
            subtitle: t('Operational dashboard and activity overview'),
            onPress: () => openTabScreen('Home', 'HubScreen'),
        },
        {
            icon: _jsx(Profile2User, { size: 20, color: colors.primaryColor, variant: "Linear" }),
            title: t('Manage Profiles'),
            subtitle: t('Open the profile management flow'),
            onPress: () => navigation.navigate('ManageProfiles'),
        },
        {
            icon: _jsx(VideoSquare, { size: 20, color: colors.primaryColor, variant: "Linear" }),
            title: t('Upload Activity'),
            subtitle: t('Review current and past uploads'),
            onPress: () => openTabScreen('Upload', 'UploadActivityScreen'),
        },
        {
            icon: _jsx(SearchNormal1, { size: 20, color: colors.primaryColor, variant: "Linear" }),
            title: t('AI Search'),
            subtitle: t('Jump into the search/admin workflow'),
            onPress: () => navigation.navigate('AISearchScreen'),
        },
    ], [colors.primaryColor, navigation, openTabScreen, t]);
    const activeBootstrap = bootstrapSnapshot !== null && bootstrapSnapshot !== void 0 ? bootstrapSnapshot : authBootstrap;
    const userSummary = (_a = activeBootstrap === null || activeBootstrap === void 0 ? void 0 : activeBootstrap.user) !== null && _a !== void 0 ? _a : null;
    const renderLabelValueRow = (label, value) => (_jsx(View, Object.assign({ style: Styles.helpRow }, { children: _jsxs(View, Object.assign({ style: { flex: 1 } }, { children: [_jsx(Text, Object.assign({ style: Styles.helpLabel }, { children: label })), _jsx(Text, Object.assign({ style: Styles.helpValue }, { children: value == null || value === '' ? t('Not available') : String(value) }))] })) })));
    const renderChipSection = (title, items) => (_jsxs(View, Object.assign({ style: Styles.helpCard }, { children: [_jsx(Text, Object.assign({ style: Styles.helpLabel }, { children: title })), _jsx(SizeBox, { height: 10 }), items.length ? (_jsx(View, Object.assign({ style: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 } }, { children: items.map((item) => (_jsx(View, Object.assign({ style: {
                        borderWidth: 0.5,
                        borderColor: colors.lightGrayColor,
                        borderRadius: 999,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        backgroundColor: colors.cardBackground,
                    } }, { children: _jsx(Text, Object.assign({ style: [Styles.titlesText, { fontSize: 12 }] }, { children: item })) }), `${title}-${item}`))) }))) : (_jsx(Text, Object.assign({ style: Styles.helpValue }, { children: t('Not available') })))] })));
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('Admin Pane') })), _jsx(View, { style: Styles.headerSpacer })] })), _jsxs(ScrollView, Object.assign({ style: Styles.container, showsVerticalScrollIndicator: false }, { children: [_jsx(SizeBox, { height: 24 }), _jsxs(View, Object.assign({ style: [Styles.helpCard, { gap: 12 }] }, { children: [_jsxs(View, Object.assign({ style: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' } }, { children: [_jsxs(View, Object.assign({ style: { flex: 1, paddingRight: 12 } }, { children: [_jsx(Text, Object.assign({ style: Styles.helpLabel }, { children: t('Session status') })), _jsx(Text, Object.assign({ style: Styles.helpValue }, { children: isAuthenticated ? t('Authenticated') : t('Not authenticated') }))] })), _jsx(TouchableOpacity, Object.assign({ style: [Styles.editActionButton, { minWidth: 108, flexDirection: 'row', gap: 6 }], onPress: () => loadAdminData(true), disabled: isRefreshing || isLoading }, { children: isRefreshing ? (_jsx(ActivityIndicator, { size: "small", color: colors.pureWhite })) : (_jsxs(_Fragment, { children: [_jsx(Refresh, { size: 14, color: colors.pureWhite, variant: "Linear" }), _jsx(Text, Object.assign({ style: Styles.editActionText }, { children: t('Refresh') }))] })) }))] })), _jsx(Text, Object.assign({ style: [Styles.titlesText, { color: colors.subTextColor, lineHeight: 20 }] }, { children: t('This pane is app-side only for now. If you want real admin access control, the backend still needs an explicit role or permission gate.') }))] })), error ? (_jsxs(_Fragment, { children: [_jsx(SizeBox, { height: 16 }), _jsxs(View, Object.assign({ style: [Styles.helpCard, { borderColor: colors.errorColor || '#D32F2F' }] }, { children: [_jsx(Text, Object.assign({ style: [Styles.helpLabel, { color: colors.errorColor || '#D32F2F' }] }, { children: t('Load error') })), _jsx(SizeBox, { height: 6 }), _jsx(Text, Object.assign({ style: Styles.helpValue }, { children: error }))] }))] })) : null, isLoading ? (_jsxs(_Fragment, { children: [_jsx(SizeBox, { height: 24 }), _jsxs(View, Object.assign({ style: [Styles.helpCard, { alignItems: 'center', justifyContent: 'center', minHeight: 120 }] }, { children: [_jsx(ActivityIndicator, { size: "small", color: colors.primaryColor }), _jsx(SizeBox, { height: 12 }), _jsx(Text, Object.assign({ style: Styles.helpLabel }, { children: t('Loading admin data...') }))] }))] })) : null, !isLoading && !isAuthenticated ? (_jsxs(_Fragment, { children: [_jsx(SizeBox, { height: 24 }), _jsxs(View, Object.assign({ style: Styles.helpCard }, { children: [_jsx(Text, Object.assign({ style: Styles.helpLabel }, { children: t('Access') })), _jsx(SizeBox, { height: 6 }), _jsx(Text, Object.assign({ style: Styles.helpValue }, { children: t('Sign in to use the admin pane.') }))] }))] })) : null, !isLoading && isAuthenticated ? (_jsxs(_Fragment, { children: [_jsx(SizeBox, { height: 24 }), _jsx(Text, Object.assign({ style: Styles.sectionTitle }, { children: t('Quick actions') })), _jsx(SizeBox, { height: 16 }), actionItems.map((item, index) => (_jsxs(React.Fragment, { children: [_jsxs(TouchableOpacity, Object.assign({ style: [Styles.accountSettingsCard, { height: 'auto', minHeight: 78 }], onPress: item.onPress }, { children: [_jsxs(View, Object.assign({ style: [Styles.accountSettingsLeft, { flex: 1, paddingRight: 16 }] }, { children: [_jsx(View, Object.assign({ style: Styles.accountSettingsIconContainer }, { children: item.icon })), _jsx(SizeBox, { width: 16 }), _jsxs(View, Object.assign({ style: { flex: 1 } }, { children: [_jsx(Text, Object.assign({ style: Styles.accountSettingsTitle }, { children: item.title })), _jsx(SizeBox, { height: 4 }), _jsx(Text, Object.assign({ style: [Styles.titlesText, { color: colors.subTextColor, fontSize: 12, lineHeight: 18 }] }, { children: item.subtitle }))] }))] })), _jsx(ArrowRight2, { size: 22, color: colors.grayColor, variant: "Linear" })] })), index < actionItems.length - 1 ? _jsx(SizeBox, { height: 16 }) : null] }, item.title))), _jsx(SizeBox, { height: 24 }), _jsx(Text, Object.assign({ style: Styles.sectionTitle }, { children: t('Access summary') })), _jsx(SizeBox, { height: 16 }), _jsxs(View, Object.assign({ style: Styles.helpCard }, { children: [renderLabelValueRow(t('Profile ID'), authMe === null || authMe === void 0 ? void 0 : authMe.profile_id), _jsx(SizeBox, { height: 12 }), _jsx(View, { style: Styles.helpDivider }), _jsx(SizeBox, { height: 12 }), renderLabelValueRow(t('Auth subject'), authMe === null || authMe === void 0 ? void 0 : authMe.sub), _jsx(SizeBox, { height: 12 }), _jsx(View, { style: Styles.helpDivider }), _jsx(SizeBox, { height: 12 }), renderLabelValueRow(t('Remaining AI tokens'), authMe === null || authMe === void 0 ? void 0 : authMe.remaining_tokens), _jsx(SizeBox, { height: 12 }), _jsx(View, { style: Styles.helpDivider }), _jsx(SizeBox, { height: 12 }), renderLabelValueRow(t('Permissions count'), (_c = (_b = authMe === null || authMe === void 0 ? void 0 : authMe.permissions) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0), _jsx(SizeBox, { height: 12 }), _jsx(View, { style: Styles.helpDivider }), _jsx(SizeBox, { height: 12 }), renderLabelValueRow(t('Event access count'), (_e = (_d = authMe === null || authMe === void 0 ? void 0 : authMe.event_ids) === null || _d === void 0 ? void 0 : _d.length) !== null && _e !== void 0 ? _e : 0)] })), _jsx(SizeBox, { height: 16 }), renderChipSection(t('Permissions'), (_f = authMe === null || authMe === void 0 ? void 0 : authMe.permissions) !== null && _f !== void 0 ? _f : []), _jsx(SizeBox, { height: 16 }), renderChipSection(t('Scopes'), (_g = authMe === null || authMe === void 0 ? void 0 : authMe.scopes) !== null && _g !== void 0 ? _g : []), _jsx(SizeBox, { height: 16 }), renderChipSection(t('Event IDs'), (_h = authMe === null || authMe === void 0 ? void 0 : authMe.event_ids) !== null && _h !== void 0 ? _h : []), _jsx(SizeBox, { height: 24 }), _jsx(Text, Object.assign({ style: Styles.sectionTitle }, { children: t('Bootstrap summary') })), _jsx(SizeBox, { height: 16 }), _jsxs(View, Object.assign({ style: Styles.helpCard }, { children: [renderLabelValueRow(t('Profiles count'), activeBootstrap === null || activeBootstrap === void 0 ? void 0 : activeBootstrap.profiles_count), _jsx(SizeBox, { height: 12 }), _jsx(View, { style: Styles.helpDivider }), _jsx(SizeBox, { height: 12 }), renderLabelValueRow(t('Needs onboarding'), (activeBootstrap === null || activeBootstrap === void 0 ? void 0 : activeBootstrap.needs_user_onboarding) ? t('Yes') : t('No')), _jsx(SizeBox, { height: 12 }), _jsx(View, { style: Styles.helpDivider }), _jsx(SizeBox, { height: 12 }), renderLabelValueRow(t('Username'), userSummary === null || userSummary === void 0 ? void 0 : userSummary.username), _jsx(SizeBox, { height: 12 }), _jsx(View, { style: Styles.helpDivider }), _jsx(SizeBox, { height: 12 }), renderLabelValueRow(t('Email'), userSummary === null || userSummary === void 0 ? void 0 : userSummary.email), _jsx(SizeBox, { height: 12 }), _jsx(View, { style: Styles.helpDivider }), _jsx(SizeBox, { height: 12 }), renderLabelValueRow(t('Full name'), userSummary === null || userSummary === void 0 ? void 0 : userSummary.full_name)] })), _jsx(SizeBox, { height: 16 }), renderChipSection(t('Missing fields'), (_j = activeBootstrap === null || activeBootstrap === void 0 ? void 0 : activeBootstrap.missing_user_fields) !== null && _j !== void 0 ? _j : []), _jsx(SizeBox, { height: 16 }), renderChipSection(t('Selected events'), normalizedSelectedEvents)] })) : null, _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] }))] })));
};
export default AdminPane;
