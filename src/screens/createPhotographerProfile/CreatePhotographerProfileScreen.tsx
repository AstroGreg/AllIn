import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Images from '../../constants/Images';
import { createStyles } from './CreatePhotographerProfileStyles';
import { ArrowRight, User, Global } from 'iconsax-react-nativejs';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const CreatePhotographerProfileScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { updateUserProfile } = useAuth();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const [photographerName, setPhotographerName] = useState('');
    const [website, setWebsite] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleContinue = async () => {
        if (!photographerName) {
            Alert.alert(t('Error'), t('Please enter your photographer name'));
            return;
        }

        setIsLoading(true);
        try {
            await updateUserProfile({
                photographerName,
                photographerWebsite: website,
            });
            navigation.reset({
                index: 0,
                routes: [{ name: 'BottomTabBar' }],
            });
        } catch (err: any) {
            Alert.alert(t('Error'), t('Failed to save profile. Please try again.'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Illustration */}
                <View style={styles.illustrationContainer}>
                    <FastImage source={Images.signup2} style={styles.illustration} resizeMode="contain" />
                </View>

                {/* Title Section */}
                <View style={styles.titleSection}>
                    <Text style={styles.title}>{t('Create Photographer Profile')}</Text>
                    <Text style={styles.subtitle}>{t('It only takes a minute to get started—join us now!')}</Text>
                </View>

                {/* Form Fields */}
                <View style={styles.formContainer}>
                    {/* Photographer Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>{t('Photographer Name')}</Text>
                        <View style={styles.inputContainer}>
                            <User size={24} color={colors.primaryColor} variant="Linear" />
                            <TextInput
                                style={styles.textInput}
                                placeholder={t('Enter Photographer Name')}
                                placeholderTextColor={colors.grayColor}
                                value={photographerName}
                                onChangeText={setPhotographerName}
                            />
                        </View>
                    </View>

                    {/* Website */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>{t('Website')}</Text>
                        <View style={styles.inputContainer}>
                            <Global size={24} color={colors.primaryColor} variant="Linear" />
                            <TextInput
                                style={styles.textInput}
                                placeholder={t('Enter website link')}
                                placeholderTextColor={colors.grayColor}
                                value={website}
                                onChangeText={setWebsite}
                                keyboardType="url"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>
                </View>

                {/* Continue Button */}
                <TouchableOpacity
                    style={[styles.continueButton, isLoading && { opacity: 0.5 }]}
                    onPress={handleContinue}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color={colors.pureWhite} />
                    ) : (
                        <>
                            <Text style={styles.continueButtonText}>{t('Continue')}</Text>
                            <ArrowRight size={18} color={colors.pureWhite} variant="Linear" />
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>

            <SizeBox height={insets.bottom > 0 ? insets.bottom : 20} />
        </View>
    );
};

export default CreatePhotographerProfileScreen;
