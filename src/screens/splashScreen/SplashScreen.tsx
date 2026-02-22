import { Image, View } from 'react-native';
import { createStyles } from './SplashStyles';
import Images from '../../constants/Images';
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const SplashScreen = ({ navigation }: any) => {
    const { isAuthenticated, isLoading, authBootstrap, refreshAuthBootstrap } = useAuth();
    const { colors } = useTheme();
    const styles = createStyles(colors);

    useEffect(() => {
        // Wait for auth check to complete
        if (isLoading) return;

        const timer = setTimeout(async () => {
            if (isAuthenticated) {
                const bootstrap = authBootstrap ?? (await refreshAuthBootstrap());
                const target = bootstrap?.needs_user_onboarding ? 'CreateProfileScreen' : 'BottomTabBar';
                // User is already logged in, go directly to main app
                console.log('[SplashScreen] User authenticated, navigating to', target);
                navigation.reset({
                    index: 0,
                    routes: [{ name: target }],
                });
            } else {
                // User not logged in, show onboarding/login flow
                console.log('[SplashScreen] User not authenticated, navigating to SelectLanguageScreen');
                navigation.navigate('SelectLanguageScreen');
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [navigation, isAuthenticated, isLoading, authBootstrap, refreshAuthBootstrap]);

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
