import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { createStyles } from '../MenuStyles'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../../../context/ThemeContext'
import { useAuth } from '../../../context/AuthContext'
import { ArrowLeft2, Notification, Unlock, ArrowRight2 } from 'iconsax-react-nativejs'

const AUTH0_DOMAIN = 'dev-lfzk0n81zjp0c3x3.us.auth0.com';
const AUTH0_CLIENT_ID = 'czlUtPo1WSw72XpcqHKSzO5MsuUzTV5P';

const ChangePassword = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const isSocialUser = user?.sub?.startsWith('google-oauth2|') || user?.sub?.startsWith('apple|');

    const handleResetPassword = async () => {
        if (!user?.email) {
            Alert.alert('Error', 'No email found for your account.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`https://${AUTH0_DOMAIN}/dbconnections/change_password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_id: AUTH0_CLIENT_ID,
                    email: user.email,
                    connection: 'Username-Password-Authentication',
                }),
            });

            if (response.ok) {
                Alert.alert(
                    'Email Sent',
                    'A password reset link has been sent to your email address.',
                    [{ text: 'OK', onPress: () => navigation.goBack() }],
                );
            } else {
                const err = await response.json().catch(() => ({}));
                Alert.alert('Error', err.message || 'Failed to send reset email.');
            }
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Something went wrong.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Change Password</Text>
                <TouchableOpacity style={Styles.headerButton}>
                    <Notification size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView style={Styles.container} showsVerticalScrollIndicator={false}>
                <SizeBox height={24} />

                <Text style={Styles.changePasswordTitle}>Change Password</Text>
                <SizeBox height={16} />

                {isSocialUser ? (
                    <Text style={{ fontSize: 14, color: colors.grayColor, lineHeight: 22 }}>
                        You signed in with a social account ({user?.sub?.split('|')[0]}). To set a password, we'll send a reset link to your email address.
                    </Text>
                ) : (
                    <Text style={{ fontSize: 14, color: colors.grayColor, lineHeight: 22 }}>
                        We'll send a password reset link to your email address ({user?.email}).
                    </Text>
                )}

                <SizeBox height={30} />

                {/* Send Reset Email Button */}
                <TouchableOpacity
                    style={Styles.continueBtn}
                    onPress={handleResetPassword}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color={colors.pureWhite} />
                    ) : (
                        <>
                            <Text style={Styles.continueBtnText}>Send Reset Email</Text>
                            <ArrowRight2 size={18} color={colors.pureWhite} variant="Linear" />
                        </>
                    )}
                </TouchableOpacity>

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    )
}

export default ChangePassword
