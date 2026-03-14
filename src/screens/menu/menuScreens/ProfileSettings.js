import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import { createStyles } from '../MenuStyles';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { ArrowLeft2, Lock, User, Card, Calendar, ArrowRight2, Scan } from 'iconsax-react-nativejs';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import { normalizeSelectedEvents } from '../../../utils/profileSelections';
const ProfileSettings = ({ navigation }) => {
    var _a, _b, _c, _d;
    const { t } = useTranslation();
    const { userProfile, user, authBootstrap } = useAuth();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const selectedFocuses = normalizeSelectedEvents((_a = userProfile === null || userProfile === void 0 ? void 0 : userProfile.selectedEvents) !== null && _a !== void 0 ? _a : []);
    const hasAthleteProfile = selectedFocuses.length > 0;
    const hasSupportProfile = (String((_b = userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportRole) !== null && _b !== void 0 ? _b : '').trim().length > 0 ||
        (Array.isArray(userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportClubCodes) && userProfile.supportClubCodes.length > 0) ||
        (Array.isArray(userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportGroupIds) && userProfile.supportGroupIds.length > 0) ||
        (Array.isArray(userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportAthletes) && userProfile.supportAthletes.length > 0) ||
        (Array.isArray(userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportFocuses) && userProfile.supportFocuses.length > 0) ||
        (userProfile === null || userProfile === void 0 ? void 0 : userProfile.category) === 'support');
    const authSubject = String((_d = (_c = authBootstrap === null || authBootstrap === void 0 ? void 0 : authBootstrap.sub) !== null && _c !== void 0 ? _c : user === null || user === void 0 ? void 0 : user.sub) !== null && _d !== void 0 ? _d : '').trim().toLowerCase();
    const canChangePassword = !authSubject || authSubject.startsWith('auth0|');
    const settingsItems = [
        {
            icon: _jsx(User, { size: 20, color: colors.primaryColor, variant: "Linear" }),
            title: t('Name'),
            onPress: () => navigation.navigate('NameSettings'),
        },
        ...(canChangePassword ? [{
                icon: _jsx(Lock, { size: 20, color: colors.primaryColor, variant: "Linear" }),
                title: t('Change Password'),
                onPress: () => navigation.navigate('ChangePassword'),
            }] : []),
        {
            icon: _jsx(User, { size: 20, color: colors.primaryColor, variant: "Linear" }),
            title: t('Change Username'),
            onPress: () => navigation.navigate('ChangeUsername'),
        },
        {
            icon: _jsx(Card, { size: 20, color: colors.primaryColor, variant: "Linear" }),
            title: t('Change Nationality'),
            onPress: () => navigation.navigate('ChangeNationality'),
        },
        {
            icon: _jsx(Calendar, { size: 20, color: colors.primaryColor, variant: "Linear" }),
            title: t('Date of Birth'),
            onPress: () => navigation.navigate('DateOfBirth'),
        },
        ...(hasAthleteProfile ? [{
                icon: _jsx(Card, { size: 20, color: colors.primaryColor, variant: "Linear" }),
                title: t('Athlete details'),
                onPress: () => navigation.navigate('AthleteDetailsHub'),
            }] : []),
        ...(hasSupportProfile ? [{
                icon: _jsx(User, { size: 20, color: colors.primaryColor, variant: "Linear" }),
                title: t('Support details'),
                onPress: () => navigation.navigate('CompleteSupportDetailsScreen', { editMode: true }),
            }] : []),
        {
            icon: _jsx(Scan, { size: 20, color: colors.primaryColor, variant: "Linear" }),
            title: t('Facial Recognition'),
            onPress: () => navigation.navigate('FacialRecognitionSettings'),
        },
        {
            icon: _jsx(User, { size: 20, color: colors.primaryColor, variant: "Linear" }),
            title: t('Manage profiles'),
            onPress: () => navigation.navigate('ManageProfiles'),
        },
    ];
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer, testID: "profile-settings-screen" }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('Account Settings') })), _jsx(View, { style: Styles.headerSpacer })] })), _jsxs(ScrollView, Object.assign({ style: Styles.container, showsVerticalScrollIndicator: false }, { children: [_jsx(SizeBox, { height: 24 }), settingsItems.map((item, index) => (_jsxs(React.Fragment, { children: [_jsxs(TouchableOpacity, Object.assign({ style: Styles.accountSettingsCard, onPress: item.onPress }, { children: [_jsxs(View, Object.assign({ style: Styles.accountSettingsLeft }, { children: [_jsx(View, Object.assign({ style: Styles.accountSettingsIconContainer }, { children: item.icon })), _jsx(SizeBox, { width: 20 }), _jsx(View, Object.assign({ style: { flex: 1, minWidth: 0, paddingRight: 12 } }, { children: _jsx(Text, Object.assign({ style: Styles.accountSettingsTitle, numberOfLines: 2 }, { children: item.title })) }))] })), _jsx(View, Object.assign({ style: Styles.accountSettingsArrowWrap }, { children: _jsx(ArrowRight2, { size: 24, color: colors.grayColor, variant: "Linear" }) }))] })), index < settingsItems.length - 1 && _jsx(SizeBox, { height: 16 })] }, index))), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] }))] })));
};
export default ProfileSettings;
