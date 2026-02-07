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

const LoginScreen = ({ navigation }: any) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const { login, isLoading } = useAuth();

    const handleLogin = async () => {
        console.log('[LoginScreen] Sign In button pressed');
        try {
            await login();
            console.log('[LoginScreen] Login successful, navigating to BottomTabBar');
            navigation.reset({
                index: 0,
                routes: [{ name: 'BottomTabBar' }],
            });
        } catch (err: any) {
            console.log('[LoginScreen] Login error:', err.message);
            if (err.message !== 'User cancelled the Auth') {
                Alert.alert('Login Failed', err.message || 'Please try again');
            }
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await login('google-oauth2');
            navigation.reset({
                index: 0,
                routes: [{ name: 'BottomTabBar' }],
            });
        } catch (err: any) {
            if (err.message !== 'User cancelled the Auth') {
                Alert.alert('Login Failed', err.message || 'Google login failed');
            }
        }
    };

    const handleAppleLogin = async () => {
        try {
            await login('apple');
            navigation.reset({
                index: 0,
                routes: [{ name: 'BottomTabBar' }],
            });
        } catch (err: any) {
            if (err.message !== 'User cancelled the Auth') {
                Alert.alert('Login Failed', err.message || 'Apple login failed');
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

                    <Text style={Styles.headingText}>Sign In to Your Account</Text>

                    <SizeBox height={8} />
                    <Text style={Styles.subHeadingText}>Access your account and stay connected.</Text>

                    <SizeBox height={40} />
                    {isLoading ? (
                        <ActivityIndicator size="large" color={colors.primaryColor} />
                    ) : (
                        <CustomButton title={'Sign In'} onPress={handleLogin} />
                    )}

                    <SizeBox height={16} />
                    <OrContainer />

                    <SizeBox height={16} />
                    <SocialBtn
                        title='Continue with Google'
                        onPress={handleGoogleLogin}
                        isGoogle={true}
                        disabled={isLoading}
                    />
                    <SizeBox height={20} />
                    <SocialBtn
                        title='Continue with Apple'
                        onPress={handleAppleLogin}
                        isGoogle={false}
                        disabled={isLoading}
                    />

                    <SizeBox height={20} />
                    <View style={Styles.signUpContainer}>
                        <Text style={Styles.rememberMeText}>Don't have an account?</Text>
                        <SizeBox width={3} />
                        <TouchableOpacity onPress={() => navigation.navigate('SignupScreen')}>
                            <Text style={[Styles.rememberMeText, { color: colors.primaryColor }]}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>

                </View>
                <SizeBox height={40} />
            </ScrollView>
        </View>
    )
}

export default LoginScreen
