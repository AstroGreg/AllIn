import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import React, { useState, useRef } from 'react';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import {
    ArrowLeft2,
    Notification,
    ArrowRight,
    Timer1,
} from 'iconsax-react-nativejs';
import { createStyles } from './VerificationCodeStyles';
import { useTranslation } from 'react-i18next'

const VerificationCode = ({ navigation }: any) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef<(TextInput | null)[]>([]);

    const handleCodeChange = (text: string, index: number) => {
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        // Auto focus next input
        if (text && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Enter verification code')}</Text>
                <TouchableOpacity style={styles.headerButton}>
                    <Notification size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
                <SizeBox height={49} />

                {/* Title Section */}
                <View style={styles.titleSection}>
                    <Text style={styles.title}>{t('Enter verification code')}</Text>
                    <SizeBox height={6} />
                    <Text style={styles.description}>
                        Open your authenticator app and enter the 6-digit code.
                    </Text>
                </View>

                <SizeBox height={32} />

                {/* Code Input */}
                <View style={styles.codeInputContainer}>
                    {code.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => (inputRefs.current[index] = ref)}
                            style={styles.codeInput}
                            value={digit}
                            onChangeText={(text) => handleCodeChange(text.slice(-1), index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            keyboardType="number-pad"
                            maxLength={1}
                            selectTextOnFocus
                            placeholderTextColor={colors.grayColor}
                        />
                    ))}
                </View>

                <SizeBox height={16} />

                {/* Timer */}
                <View style={styles.timerContainer}>
                    <Timer1 size={16} color={colors.grayColor} variant="Linear" />
                    <Text style={styles.timerText}>{t('Code refreshes every 30 seconds')}</Text>
                </View>
            </ScrollView>

            {/* Bottom Section */}
            <View style={[styles.bottomContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
                <TouchableOpacity style={styles.primaryButton}>
                    <Text style={styles.primaryButtonText}>{t('Verify & Activate')}</Text>
                    <ArrowRight size={24} color={colors.pureWhite} variant="Linear" />
                </TouchableOpacity>

                <SizeBox height={18} />

                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.linkTextBlue}>{t('Re-scan QR code')}</Text>
                </TouchableOpacity>

                <SizeBox height={8} />

                <TouchableOpacity onPress={() => navigation.navigate('Authentication')}>
                    <Text style={styles.linkTextGray}>{t('Use different method')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default VerificationCode;