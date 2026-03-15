var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx } from "react/jsx-runtime";
import { Image, View } from 'react-native';
import { createStyles } from './SplashStyles';
import Images from '../../constants/Images';
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { resolvePostAuthRoute } from '../../utils/onboardingRoute';
const SplashScreen = ({ navigation }) => {
    const { isAuthenticated, isLoading, authBootstrap, refreshAuthBootstrap, userProfile, getUserProfile } = useAuth();
    const { colors } = useTheme();
    const styles = createStyles(colors);
    useEffect(() => {
        // Wait for auth check to complete
        if (isLoading)
            return;
        const timer = setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            if (isAuthenticated) {
                let bootstrap = authBootstrap;
                if (!bootstrap) {
                    bootstrap = yield refreshAuthBootstrap().catch(() => null);
                }
                const resolvedProfile = userProfile !== null && userProfile !== void 0 ? userProfile : (yield getUserProfile().catch(() => null));
                const target = resolvePostAuthRoute(bootstrap, resolvedProfile);
                const usedBootstrap = Boolean(bootstrap);
                console.log('[SplashScreen] Post-auth route resolved', {
                    source: usedBootstrap ? 'bootstrap' : 'local_fallback',
                    target: target.name,
                    params: (_a = target.params) !== null && _a !== void 0 ? _a : null,
                    has_profiles: (_b = bootstrap === null || bootstrap === void 0 ? void 0 : bootstrap.has_profiles) !== null && _b !== void 0 ? _b : null,
                    needs_user_onboarding: (_c = bootstrap === null || bootstrap === void 0 ? void 0 : bootstrap.needs_user_onboarding) !== null && _c !== void 0 ? _c : null,
                    has_local_category: Boolean(String((_d = resolvedProfile === null || resolvedProfile === void 0 ? void 0 : resolvedProfile.category) !== null && _d !== void 0 ? _d : '').trim()),
                    has_local_selected_events: Array.isArray(resolvedProfile === null || resolvedProfile === void 0 ? void 0 : resolvedProfile.selectedEvents) && ((_f = (_e = resolvedProfile === null || resolvedProfile === void 0 ? void 0 : resolvedProfile.selectedEvents) === null || _e === void 0 ? void 0 : _e.length) !== null && _f !== void 0 ? _f : 0) > 0,
                });
                navigation.reset({
                    index: 0,
                    routes: [target],
                });
            }
            else {
                // User not logged in, show onboarding/login flow
                console.log('[SplashScreen] User not authenticated, navigating to SelectLanguageScreen');
                navigation.navigate('SelectLanguageScreen');
            }
        }), 2000);
        return () => clearTimeout(timer);
    }, [navigation, isAuthenticated, isLoading, authBootstrap, refreshAuthBootstrap, userProfile, getUserProfile]);
    return (_jsx(View, Object.assign({ style: styles.mainContainer }, { children: _jsx(Image, { source: Images.splashForeground, style: styles.logo, resizeMode: "contain" }) })));
};
export default SplashScreen;
