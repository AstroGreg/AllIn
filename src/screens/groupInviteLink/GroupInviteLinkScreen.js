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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft2, TickCircle } from 'iconsax-react-nativejs';
import { useTranslation } from 'react-i18next';
import SizeBox from '../../constants/SizeBox';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { ApiError, getGroupInviteLink, redeemGroupInviteLink, } from '../../services/apiGateway';
const GroupInviteLinkScreen = ({ navigation, route }) => {
    var _a;
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const { apiAccessToken } = useAuth();
    const token = String(((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.token) || '').trim();
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [invite, setInvite] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.backgroundColor,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 0.5,
            borderBottomColor: colors.borderColor,
        },
        headerButton: {
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.btnBackgroundColor,
            borderWidth: 1,
            borderColor: colors.borderColor,
            alignItems: 'center',
            justifyContent: 'center',
        },
        headerTitle: {
            fontSize: 18,
            color: colors.mainTextColor,
            fontWeight: '600',
        },
        hero: {
            paddingHorizontal: 20,
            paddingTop: 22,
            paddingBottom: 10,
        },
        card: {
            marginHorizontal: 20,
            marginTop: 14,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.borderColor,
            backgroundColor: colors.cardBackground,
            padding: 18,
            gap: 10,
        },
        groupName: {
            fontSize: 24,
            fontWeight: '700',
            color: colors.mainTextColor,
        },
        meta: {
            fontSize: 14,
            color: colors.subTextColor,
        },
        badgeRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
        },
        badge: {
            borderRadius: 999,
            borderWidth: 1,
            borderColor: colors.primaryColor,
            backgroundColor: colors.secondaryBlueColor,
            paddingHorizontal: 10,
            paddingVertical: 6,
        },
        badgeText: {
            fontSize: 12,
            fontWeight: '600',
            color: colors.primaryColor,
        },
        bodyText: {
            fontSize: 14,
            lineHeight: 21,
            color: colors.mainTextColor,
        },
        footer: {
            paddingHorizontal: 20,
            paddingBottom: Math.max(insets.bottom, 20) + 16,
            paddingTop: 18,
            gap: 12,
        },
        primaryButton: {
            height: 52,
            borderRadius: 14,
            backgroundColor: colors.primaryColor,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: joining ? 0.7 : 1,
        },
        secondaryButton: {
            height: 52,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.borderColor,
            backgroundColor: colors.btnBackgroundColor,
            alignItems: 'center',
            justifyContent: 'center',
        },
        buttonText: {
            fontSize: 16,
            fontWeight: '700',
            color: colors.pureWhite,
        },
        secondaryButtonText: {
            fontSize: 15,
            fontWeight: '600',
            color: colors.mainTextColor,
        },
        centeredState: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 24,
        },
        stateTitle: {
            fontSize: 20,
            fontWeight: '700',
            color: colors.mainTextColor,
            textAlign: 'center',
        },
        stateMessage: {
            marginTop: 10,
            fontSize: 14,
            lineHeight: 21,
            color: colors.subTextColor,
            textAlign: 'center',
        },
    }), [colors, insets.bottom, joining]);
    const loadInvite = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _b, _c;
        if (!token) {
            setErrorMessage(t('Invalid invitation link'));
            setInvite(null);
            setLoading(false);
            return;
        }
        setLoading(true);
        setErrorMessage(null);
        try {
            const resp = yield getGroupInviteLink(token);
            setInvite((_b = resp === null || resp === void 0 ? void 0 : resp.invite_link) !== null && _b !== void 0 ? _b : null);
        }
        catch (error) {
            const message = error instanceof ApiError ? error.message : String((_c = error === null || error === void 0 ? void 0 : error.message) !== null && _c !== void 0 ? _c : error);
            setInvite(null);
            setErrorMessage(message || t('Unable to open invitation link.'));
        }
        finally {
            setLoading(false);
        }
    }), [t, token]);
    useEffect(() => {
        loadInvite();
    }, [loadInvite]);
    const openGroup = useCallback((groupId) => {
        const safeGroupId = String(groupId || '').trim();
        if (!safeGroupId)
            return;
        navigation.reset({
            index: 0,
            routes: [
                {
                    name: 'BottomTabBar',
                    params: {
                        screen: 'Profile',
                        params: {
                            screen: 'GroupProfileScreen',
                            params: {
                                groupId: safeGroupId,
                                showBackButton: true,
                                origin: 'invite-link',
                            },
                        },
                    },
                },
            ],
        });
    }, [navigation]);
    const handleRedeem = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _d;
        if (!token)
            return;
        if (!apiAccessToken) {
            navigation.navigate('LoginScreen');
            return;
        }
        setJoining(true);
        try {
            const resp = yield redeemGroupInviteLink(apiAccessToken, token);
            openGroup(resp.group_id);
        }
        catch (error) {
            const message = error instanceof ApiError ? error.message : String((_d = error === null || error === void 0 ? void 0 : error.message) !== null && _d !== void 0 ? _d : error);
            Alert.alert(t('Join failed'), message || t('Unable to join this group right now.'));
        }
        finally {
            setJoining(false);
        }
    }), [apiAccessToken, navigation, openGroup, t, token]);
    const status = String((invite === null || invite === void 0 ? void 0 : invite.status) || '').trim().toLowerCase();
    const inviteRoles = Array.isArray(invite === null || invite === void 0 ? void 0 : invite.public_roles) ? invite.public_roles.map(role => String(role || '').trim()).filter(Boolean) : [];
    const canJoin = status === 'active';
    return (_jsxs(View, Object.assign({ style: styles.container }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: styles.headerTitle }, { children: t('Join group') })), _jsx(View, { style: { width: 44, height: 44 } })] })), loading ? (_jsxs(View, Object.assign({ style: styles.centeredState }, { children: [_jsx(ActivityIndicator, { size: "small", color: colors.primaryColor }), _jsx(Text, Object.assign({ style: styles.stateMessage }, { children: t('Loading invitation...') }))] }))) : errorMessage ? (_jsxs(View, Object.assign({ style: styles.centeredState }, { children: [_jsx(Text, Object.assign({ style: styles.stateTitle }, { children: t('Invitation unavailable') })), _jsx(Text, Object.assign({ style: styles.stateMessage }, { children: errorMessage })), _jsx(TouchableOpacity, Object.assign({ style: [styles.secondaryButton, { marginTop: 18, width: '100%' }], onPress: loadInvite }, { children: _jsx(Text, Object.assign({ style: styles.secondaryButtonText }, { children: t('Try again') })) }))] }))) : (_jsxs(_Fragment, { children: [_jsxs(View, Object.assign({ style: styles.hero }, { children: [_jsx(Text, Object.assign({ style: styles.stateTitle }, { children: t('Group invitation') })), _jsx(Text, Object.assign({ style: styles.stateMessage }, { children: t('This link lets you join the shared group directly in the app.') }))] })), _jsxs(View, Object.assign({ style: styles.card }, { children: [_jsx(Text, Object.assign({ style: styles.groupName }, { children: (invite === null || invite === void 0 ? void 0 : invite.group_name) || t('Group') })), (invite === null || invite === void 0 ? void 0 : invite.group_location) ? _jsx(Text, Object.assign({ style: styles.meta }, { children: invite.group_location })) : null, (invite === null || invite === void 0 ? void 0 : invite.group_bio) ? _jsx(Text, Object.assign({ style: styles.bodyText }, { children: invite.group_bio })) : null, _jsxs(View, Object.assign({ style: styles.badgeRow }, { children: [_jsx(View, Object.assign({ style: styles.badge }, { children: _jsx(Text, Object.assign({ style: styles.badgeText }, { children: (invite === null || invite === void 0 ? void 0 : invite.permission_role) === 'admin' ? t('Admin access') : t('Member access') })) })), inviteRoles.map((role) => (_jsx(View, Object.assign({ style: styles.badge }, { children: _jsx(Text, Object.assign({ style: styles.badgeText }, { children: t(role === 'athlete' ? 'Athlete' : role === 'coach' ? 'Coach' : role === 'physio' ? 'Physio' : role) })) }), role))), status ? (_jsx(View, Object.assign({ style: styles.badge }, { children: _jsx(Text, Object.assign({ style: styles.badgeText }, { children: t(status === 'active' ? 'Active link' : status === 'expired' ? 'Expired link' : status === 'revoked' ? 'Revoked link' : 'Used link') })) }))) : null] }))] })), _jsxs(View, Object.assign({ style: styles.footer }, { children: [apiAccessToken ? (_jsx(TouchableOpacity, Object.assign({ style: styles.primaryButton, onPress: handleRedeem, disabled: !canJoin || joining }, { children: joining ? (_jsx(ActivityIndicator, { size: "small", color: colors.pureWhite })) : (_jsx(Text, Object.assign({ style: styles.buttonText }, { children: t('Join this group') }))) }))) : (_jsx(TouchableOpacity, Object.assign({ style: styles.primaryButton, onPress: () => navigation.navigate('LoginScreen') }, { children: _jsx(Text, Object.assign({ style: styles.buttonText }, { children: t('Sign in to join') })) }))), (invite === null || invite === void 0 ? void 0 : invite.group_id) ? (_jsx(TouchableOpacity, Object.assign({ style: styles.secondaryButton, onPress: () => openGroup(String(invite.group_id)) }, { children: _jsx(Text, Object.assign({ style: styles.secondaryButtonText }, { children: t('Open group') })) }))) : null, canJoin && apiAccessToken ? (_jsxs(View, Object.assign({ style: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 } }, { children: [_jsx(TickCircle, { size: 18, color: colors.primaryColor, variant: "Bold" }), _jsx(Text, Object.assign({ style: styles.meta }, { children: t('You can join directly from this screen.') }))] }))) : null] }))] }))] })));
};
export default GroupInviteLinkScreen;
