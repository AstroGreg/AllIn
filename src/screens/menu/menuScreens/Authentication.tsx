import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import {
    ArrowLeft2,
    Notification,
    Message,
    SecuritySafe,
    ArrowRight,
} from 'iconsax-react-nativejs';
import { createStyles } from './AuthenticationStyles';

type AuthMethod = '2fa' | 'authenticator' | null;

const Authentication = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [selectedMethod, setSelectedMethod] = useState<AuthMethod>('authenticator');

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Authentication</Text>
                <TouchableOpacity style={styles.headerButton}>
                    <Notification size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
                <SizeBox height={49} />

                {/* Title Section */}
                <View style={styles.titleSection}>
                    <Text style={styles.title}>Protect your account</Text>
                    <SizeBox height={6} />
                    <Text style={styles.description}>
                        Add an extra layer of security to prevent unauthorized access to your donations and payment methods.
                    </Text>
                </View>

                <SizeBox height={24} />

                {/* Authentication Options */}
                <View style={styles.optionsContainer}>
                    {/* 2-Factor Authentication */}
                    <TouchableOpacity
                        style={styles.optionCard}
                        onPress={() => setSelectedMethod('2fa')}
                    >
                        <View style={styles.optionIconContainer}>
                            <Message size={24} color={colors.primaryColor} variant="Bold" />
                        </View>
                        <View style={styles.optionContent}>
                            <Text style={styles.optionTitle}>2- Factor Authentication</Text>
                            <Text style={styles.optionDescription}>
                                Receive a unique code via text message to verify it's you.
                            </Text>
                        </View>
                        <View style={styles.radioContainer}>
                            {selectedMethod === '2fa' ? (
                                <View style={styles.radioSelected}>
                                    <View style={styles.radioInner} />
                                </View>
                            ) : (
                                <View style={styles.radioUnselected} />
                            )}
                        </View>
                    </TouchableOpacity>

                    <SizeBox height={18} />

                    {/* Authenticator App */}
                    <TouchableOpacity
                        style={styles.optionCard}
                        onPress={() => setSelectedMethod('authenticator')}
                    >
                        <View style={styles.optionIconContainer}>
                            <SecuritySafe size={24} color={colors.primaryColor} variant="Bold" />
                        </View>
                        <View style={styles.optionContent}>
                            <Text style={styles.optionTitle}>Authenticator App</Text>
                            <Text style={styles.optionDescription}>
                                Use Google Authenticator or Authy to generate secure codes.
                            </Text>
                        </View>
                        <View style={styles.radioContainer}>
                            {selectedMethod === 'authenticator' ? (
                                <View style={styles.radioSelected}>
                                    <View style={styles.radioInner} />
                                </View>
                            ) : (
                                <View style={styles.radioUnselected} />
                            )}
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Bottom Buttons */}
            <View style={[styles.bottomContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => navigation.navigate('AuthenticatorSetup')}
                >
                    <Text style={styles.primaryButtonText}>Set Up Now</Text>
                    <ArrowRight size={24} color={colors.pureWhite} variant="Linear" />
                </TouchableOpacity>

                <SizeBox height={18} />

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.secondaryButtonText}>Skip For now</Text>
                    <ArrowRight size={24} color={colors.grayColor} variant="Linear" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Authentication;
