import { Image, View } from 'react-native';
import { createStyles } from './SplashStyles';
import Images from '../../constants/Images';
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { resolvePostAuthRoute } from '../../utils/onboardingRoute';

const SplashScreen = ({ navigation }: any) => {
    const { isAuthenticated, isLoading, authBootstrap, refreshAuthBootstrap, userProfile, getUserProfile } = useAuth();
    const { colors } = useTheme();
    const styles = createStyles(colors);

    useEffect(() => {
        // Wait for auth check to complete
        if (isLoading) return;

        const timer = setTimeout(async () => {
            if (isAuthenticated) {
                let bootstrap = authBootstrap;
                if (!bootstrap) {
                    bootstrap = await refreshAuthBootstrap().catch(() => null);
                }
                const resolvedProfile = userProfile ?? (await getUserProfile().catch(() => null));
                const target = resolvePostAuthRoute(bootstrap, resolvedProfile);
                const usedBootstrap = Boolean(bootstrap);
                console.log('[SplashScreen] Post-auth route resolved', {
                    source: usedBootstrap ? 'bootstrap' : 'local_fallback',
                    target: target.name,
                    params: target.params ?? null,
                    has_profiles: bootstrap?.has_profiles ?? null,
                    needs_user_onboarding: bootstrap?.needs_user_onboarding ?? null,
                    has_local_category: Boolean(String(resolvedProfile?.category ?? '').trim()),
                    has_local_selected_events: Array.isArray(resolvedProfile?.selectedEvents) && resolvedProfile.selectedEvents.length > 0,
                });
                navigation.reset({
                    index: 0,
                    routes: [target],
                });
            } else {
                // User not logged in, show onboarding/login flow
                console.log('[SplashScreen] User not authenticated, navigating to SelectLanguageScreen');
                navigation.navigate('SelectLanguageScreen');
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [navigation, isAuthenticated, isLoading, authBootstrap, refreshAuthBootstrap, userProfile, getUserProfile]);

    return (
        <View style={styles.mainContainer}>
            <Image
                source={Images.logo}
                style={{ width: 150, height: 163 }}
            />
        </View>
    );
};

export default SplashScreen;
