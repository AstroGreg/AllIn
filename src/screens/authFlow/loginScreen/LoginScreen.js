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
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { createStyles } from './LoginStyles';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Images from '../../../constants/Images';
import CustomButton from '../../../components/customButton/CustomButton';
import OrContainer from '../components/OrContainer';
import SocialBtn from '../components/SocialBtn';
import FastImage from 'react-native-fast-image';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { resolvePostAuthRoute } from '../../../utils/onboardingRoute';
const LoginScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const { login, signup, isLoading, isAuthenticated, refreshAuthBootstrap, userProfile, getUserProfile } = useAuth();
    const navigatePostAuth = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const bootstrap = yield refreshAuthBootstrap();
        const resolvedProfile = userProfile !== null && userProfile !== void 0 ? userProfile : (yield getUserProfile().catch(() => null));
        console.log('[LoginScreen] auth/bootstrap result:', bootstrap ? {
            needs_user_onboarding: bootstrap.needs_user_onboarding,
            missing_user_fields: bootstrap.missing_user_fields,
            has_profiles: bootstrap.has_profiles,
        } : null);
        const target = resolvePostAuthRoute(bootstrap, resolvedProfile);
        console.log('[LoginScreen] Resolved post-auth route:', target.name, (_a = target.params) !== null && _a !== void 0 ? _a : {});
        navigation.reset({
            index: 0,
            routes: [target],
        });
    });
    // Debug: Clear all stored auth data
    const handleClearAuth = () => __awaiter(void 0, void 0, void 0, function* () {
        yield AsyncStorage.removeItem('@auth_credentials');
        yield AsyncStorage.removeItem('@user_profile');
        console.log('[LoginScreen] Cleared all auth data');
        Alert.alert(t('Debug'), t('Auth data cleared. Please restart the app.'));
    });
    console.log('[LoginScreen] Rendered, isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);
    const handleLogin = () => __awaiter(void 0, void 0, void 0, function* () {
        console.log('[LoginScreen] Sign In button pressed');
        try {
            yield login();
            console.log('[LoginScreen] Login successful, resolving onboarding route');
            yield navigatePostAuth();
        }
        catch (err) {
            console.log('[LoginScreen] Login error:', err.message);
            if (err.message !== 'User cancelled the Auth') {
                Alert.alert(t('Login Failed'), err.message || t('Please try again'));
            }
        }
    });
    const handleGoogleLogin = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield login('google-oauth2');
            yield navigatePostAuth();
        }
        catch (err) {
            if (err.message !== 'User cancelled the Auth') {
                Alert.alert(t('Login Failed'), err.message || t('Google login failed'));
            }
        }
    });
    const handleAppleLogin = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield login('apple');
            yield navigatePostAuth();
        }
        catch (err) {
            if (err.message !== 'User cancelled the Auth') {
                Alert.alert(t('Login Failed'), err.message || t('Apple login failed'));
            }
        }
    });
    const handleSignup = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield signup();
            yield navigatePostAuth();
        }
        catch (err) {
            if (err.message !== 'User cancelled the Auth') {
                Alert.alert(t('Signup Failed'), err.message || t('Please try again'));
            }
        }
    });
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false }, { children: [_jsx(SizeBox, { height: 30 }), _jsx(View, Object.assign({ style: { height: 130, width: 130, alignSelf: 'center' } }, { children: _jsx(FastImage, { source: Images.loginImg, style: { height: '100%', width: '100%' } }) })), _jsx(SizeBox, { height: 30 }), _jsxs(View, Object.assign({ style: Styles.contentContainer }, { children: [_jsx(Text, Object.assign({ style: Styles.headingText }, { children: t('Sign In to Your Account') })), _jsx(SizeBox, { height: 8 }), _jsx(Text, Object.assign({ style: Styles.subHeadingText }, { children: t('Access your account and stay connected.') })), _jsx(SizeBox, { height: 40 }), isLoading ? (_jsx(ActivityIndicator, { size: "large", color: colors.primaryColor })) : (_jsx(CustomButton, { title: t('Email Sign In'), onPress: handleLogin })), _jsx(SizeBox, { height: 16 }), _jsx(OrContainer, {}), _jsx(SizeBox, { height: 16 }), _jsx(SocialBtn, { title: t('Continue with Google'), onPress: handleGoogleLogin, isGoogle: true, disabled: isLoading }), _jsx(SizeBox, { height: 20 }), _jsx(SocialBtn, { title: t('Continue with Apple'), onPress: handleAppleLogin, isGoogle: false, disabled: isLoading }), _jsx(SizeBox, { height: 20 }), _jsxs(View, Object.assign({ style: Styles.signUpContainer }, { children: [_jsx(Text, Object.assign({ style: Styles.rememberMeText }, { children: t("Don't have an account?") })), _jsx(SizeBox, { width: 3 }), _jsx(TouchableOpacity, Object.assign({ onPress: handleSignup }, { children: _jsx(Text, Object.assign({ style: [Styles.rememberMeText, { color: colors.primaryColor }] }, { children: t('Sign Up') })) }))] })), _jsx(SizeBox, { height: 30 }), _jsx(TouchableOpacity, Object.assign({ onPress: handleClearAuth, style: { padding: 10, alignItems: 'center' } }, { children: _jsx(Text, Object.assign({ style: { color: colors.grayColor, fontSize: 12 } }, { children: t('[Debug] Clear Auth Data') })) }))] })), _jsx(SizeBox, { height: 40 })] }))] })));
};
export default LoginScreen;
