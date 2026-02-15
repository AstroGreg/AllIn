import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import Icons from '../../../constants/Icons';
import {
    ArrowLeft2,
    Notification,
    ArrowRight,
    Copy,
} from 'iconsax-react-nativejs';
import { createStyles } from './AuthenticatorSetupStyles';
import { useTranslation } from 'react-i18next'

const AuthenticatorSetup = ({ navigation }: any) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const setupCode = 'J4XW 4C3K L9MN 2P8Q';

    const handleCopyCode = () => {
        // Copy to clipboard functionality
    };

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Authenticator Setup')}</Text>
                <TouchableOpacity style={styles.headerButton}>
                    <Notification size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
                <SizeBox height={49} />

                {/* Title Section */}
                <View style={styles.titleSection}>
                    <Text style={styles.title}>{t('Set up authenticator app')}</Text>
                    <SizeBox height={6} />
                    <Text style={styles.description}>
                        Scan this QR code using Google Authenticator or Authy.
                    </Text>
                </View>

                <SizeBox height={32} />

                {/* QR Code */}
                <View style={styles.qrContainer}>
                    <View style={styles.qrCode}>
                        <Icons.QrBlack width={140} height={140} />
                    </View>
                </View>

                <SizeBox height={24} />

                {/* Manual Code Entry */}
                <Text style={styles.orText}>{t('Or enter code manually')}</Text>

                <SizeBox height={16} />

                {/* Code Box */}
                <TouchableOpacity style={styles.codeBox} onPress={handleCopyCode}>
                    <Text style={styles.codeText}>{setupCode}</Text>
                    <Copy size={20} color={colors.grayColor} variant="Linear" />
                </TouchableOpacity>

                <SizeBox height={24} />
            </ScrollView>

            {/* Bottom Section */}
            <View style={[styles.bottomContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => navigation.navigate('VerificationCode')}
                >
                    <Text style={styles.primaryButtonText}>{t("I've Scaned the code")}</Text>
                    <ArrowRight size={24} color={colors.pureWhite} variant="Linear" />
                </TouchableOpacity>

                <SizeBox height={18} />

                <TouchableOpacity>
                    <Text style={styles.linkText}>{t("Can't scan? Enter code manually")}</Text>
                </TouchableOpacity>

                <SizeBox height={8} />

                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.linkText}>{t('Use different method')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default AuthenticatorSetup;