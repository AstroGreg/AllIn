import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native'
import React from 'react'
import { createStyles } from './LoginStyles'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Images from '../../../constants/Images'
import CustomButton from '../../../components/customButton/CustomButton'
import OrContainer from '../components/OrContainer'
import SocialBtn from '../components/SocialBtn'
import FastImage from 'react-native-fast-image'
import { useTheme } from '../../../context/ThemeContext'
import { useAuth } from '../../../context/AuthContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTranslation } from 'react-i18next'

const LoginScreen = ({ navigation }: any) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const { login, signup, isLoading, isAuthenticated } = useAuth();

    // Debug: Clear all stored auth data
    const handleClearAuth = async () => {
        await AsyncStorage.removeItem('@auth_credentials');
        await AsyncStorage.removeItem('@user_profile');
        console.log('[LoginScreen] Cleared all auth data');
        Alert.alert(t('Debug'), t('Auth data cleared. Please restart the app.'));
    };

    console.log('[LoginScreen] Rendered, isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

    const handleLogin = async () => {
        console.log('[LoginScreen] Sign In button pressed');
        try {
            await login();
            console.log('[LoginScreen] Login successful, navigating to CategorySelectionScreen');
            navigation.reset({
                index: 0,
                routes: [{ name: 'CategorySelectionScreen' }],
            });
        } catch (err: any) {
            console.log('[LoginScreen] Login error:', err.message);
            if (err.message !== 'User cancelled the Auth') {
                Alert.alert(t('Login Failed'), err.message || t('Please try again'));
            }
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await login('google-oauth2');
            navigation.reset({
                index: 0,
                routes: [{ name: 'CategorySelectionScreen' }],
            });
        } catch (err: any) {
            if (err.message !== 'User cancelled the Auth') {
                Alert.alert(t('Login Failed'), err.message || t('Google login failed'));
            }
        }
    };

    const handleAppleLogin = async () => {
        try {
            await login('apple');
            navigation.reset({
                index: 0,
                routes: [{ name: 'CategorySelectionScreen' }],
            });
        } catch (err: any) {
            if (err.message !== 'User cancelled the Auth') {
                Alert.alert(t('Login Failed'), err.message || t('Apple login failed'));
            }
        }
    };

    const handleSignup = async () => {
        try {
            await signup();
            navigation.reset({
                index: 0,
                routes: [{ name: 'CategorySelectionScreen' }],
            });
        } catch (err: any) {
            if (err.message !== 'User cancelled the Auth') {
                Alert.alert(t('Signup Failed'), err.message || t('Please try again'));
            }
        }
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <ScrollView showsVerticalScrollIndicator={false}>
                <SizeBox height={30} />
                <View style={{ height: 130, width: 130, alignSelf: 'center' }}>
                    <FastImage source={Images.loginImg} style={{ height: '100%', width: '100%' }} />
                </View>
                <SizeBox height={30} />
                <View style={Styles.contentContainer}>

                    <Text style={Styles.headingText}>{t('Sign In to Your Account')}</Text>

                    <SizeBox height={8} />
                    <Text style={Styles.subHeadingText}>{t('Access your account and stay connected.')}</Text>

                    <SizeBox height={40} />
                    {isLoading ? (
                        <ActivityIndicator size="large" color={colors.primaryColor} />
                    ) : (
                        <CustomButton title={t('Email Sign In')} onPress={handleLogin} />
                    )}

                    <SizeBox height={16} />
                    <OrContainer />

                    <SizeBox height={16} />
                    <SocialBtn
                        title={t('Continue with Google')}
                        onPress={handleGoogleLogin}
                        isGoogle={true}
                        disabled={isLoading}
                    />
                    <SizeBox height={20} />
                    <SocialBtn
                        title={t('Continue with Apple')}
                        onPress={handleAppleLogin}
                        isGoogle={false}
                        disabled={isLoading}
                    />

                    <SizeBox height={20} />
                    <View style={Styles.signUpContainer}>
                        <Text style={Styles.rememberMeText}>{t("Don't have an account?")}</Text>
                        <SizeBox width={3} />
                        <TouchableOpacity onPress={handleSignup}>
                            <Text style={[Styles.rememberMeText, { color: colors.primaryColor }]}>{t('Sign Up')}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Debug button - remove in production */}
                    <SizeBox height={30} />
                    <TouchableOpacity onPress={handleClearAuth} style={{ padding: 10, alignItems: 'center' }}>
                        <Text style={{ color: colors.grayColor, fontSize: 12 }}>{t('[Debug] Clear Auth Data')}</Text>
                    </TouchableOpacity>

                </View>
                <SizeBox height={40} />
            </ScrollView>
        </View>
    )
}

export default LoginScreen
