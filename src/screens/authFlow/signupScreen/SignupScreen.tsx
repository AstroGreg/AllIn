import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native'
import React from 'react'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Images from '../../../constants/Images'
import CustomButton from '../../../components/customButton/CustomButton'
import OrContainer from '../components/OrContainer'
import SocialBtn from '../components/SocialBtn'
import { createStyles } from './SignupScreenStyles'
import FastImage from 'react-native-fast-image'
import { useTheme } from '../../../context/ThemeContext'
import { useAuth } from '../../../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { shouldForceAccountCompletion } from '../../../utils/accountCompletion'

const SignupScreen = ({ navigation }: any) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const { signup, isLoading, refreshAuthBootstrap } = useAuth();

    const navigatePostAuth = async () => {
        const bootstrap = await refreshAuthBootstrap();
        console.log('[SignupScreen] auth/bootstrap result:', bootstrap ? {
            needs_user_onboarding: bootstrap.needs_user_onboarding,
            missing_user_fields: bootstrap.missing_user_fields,
            has_profiles: bootstrap.has_profiles,
        } : null);
        const target = shouldForceAccountCompletion(bootstrap) ? 'CreateProfileScreen' : 'CategorySelectionScreen';
        navigation.reset({
            index: 0,
            routes: [{ name: target }],
        });
    };

    const handleSignup = async () => {
        try {
            await signup();
            await navigatePostAuth();
        } catch (err: any) {
            if (err.message !== 'User cancelled the Auth') {
                Alert.alert(t('Signup Failed'), err.message || t('Please try again'));
            }
        }
    };

    const handleGoogleSignup = async () => {
        try {
            await signup('google-oauth2');
            await navigatePostAuth();
        } catch (err: any) {
            if (err.message !== 'User cancelled the Auth') {
                Alert.alert(t('Signup Failed'), err.message || t('Google signup failed'));
            }
        }
    };

    const handleAppleSignup = async () => {
        try {
            await signup('apple');
            await navigatePostAuth();
        } catch (err: any) {
            if (err.message !== 'User cancelled the Auth') {
                Alert.alert(t('Signup Failed'), err.message || t('Apple signup failed'));
            }
        }
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <ScrollView showsVerticalScrollIndicator={false}>
                <SizeBox height={30} />
                <View style={{ height: 130, width: 130, alignSelf: 'center' }}>
                    <FastImage source={Images.registerImg} style={{ height: '100%', width: '100%' }} />
                </View>
                <SizeBox height={30} />
                <View style={Styles.contentContainer}>

                    <Text style={Styles.headingText}>{t('Sign Up & Get Started')}</Text>

                    <SizeBox height={8} />
                    <Text style={Styles.subHeadingText}>{t('It only takes a minute to get started—join us now!')}</Text>

                    <SizeBox height={40} />
                    {isLoading ? (
                        <ActivityIndicator size="large" color={colors.primaryColor} />
                    ) : (
                        <CustomButton title={t('Sign Up')} onPress={handleSignup} />
                    )}

                    <SizeBox height={16} />
                    <OrContainer />

                    <SizeBox height={16} />
                    <SocialBtn
                        title={t('Continue with Google')}
                        onPress={handleGoogleSignup}
                        isGoogle={true}
                        disabled={isLoading}
                    />
                    <SizeBox height={20} />
                    <SocialBtn
                        title={t('Continue with Apple')}
                        onPress={handleAppleSignup}
                        isGoogle={false}
                        disabled={isLoading}
                    />

                    <SizeBox height={20} />
                    <View style={Styles.signUpContainer}>
                        <Text style={Styles.rememberMeText}>{t('Already have an Account?')}</Text>
                        <SizeBox width={3} />
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Text style={[Styles.rememberMeText, { color: colors.primaryColor }]}>{t('Sign In')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <SizeBox height={40} />
            </ScrollView>
        </View>
    )
}

export default SignupScreen
