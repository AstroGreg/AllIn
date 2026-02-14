import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Images from '../../constants/Images';
import { createStyles } from './CreateGroupProfileStyles';
import { ArrowRight, User, People, Sms, Card, Add } from 'iconsax-react-nativejs';
import Icons from '../../constants/Icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const CreateGroupProfileScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { updateUserProfile } = useAuth();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const [groupName, setGroupName] = useState('');
    const [coachName, setCoachName] = useState('');
    const [coachEmail, setCoachEmail] = useState('');
    const [selectedAthlete, setSelectedAthlete] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleContinue = async () => {
        if (!groupName || !coachName || !coachEmail) {
            Alert.alert(t('Error'), t('Please fill in all required fields'));
            return;
        }

        setIsLoading(true);
        try {
            await updateUserProfile({
                groupName,
                coachName,
                coachEmail,
                athletes: selectedAthlete ? [selectedAthlete] : [],
            });
            navigation.navigate('DocumentUploadScreen');
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
                    <Text style={styles.title}>{t('Create Group Profile')}</Text>
                    <Text style={styles.subtitle}>{t('It only takes a minute to get started—join us now!')}</Text>
                </View>

                {/* Form Fields */}
                <View style={styles.formContainer}>
                    {/* Group Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>{t('Group Name')}</Text>
                        <View style={styles.inputContainer}>
                            <People size={24} color={colors.primaryColor} variant="Linear" />
                            <TextInput
                                style={styles.textInput}
                                placeholder={t('Enter Group Name')}
                                placeholderTextColor={colors.grayColor}
                                value={groupName}
                                onChangeText={setGroupName}
                            />
                        </View>
                    </View>

                    {/* Coach Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>{t('Coach Name')}</Text>
                        <View style={styles.inputContainer}>
                            <User size={24} color={colors.primaryColor} variant="Linear" />
                            <TextInput
                                style={styles.textInput}
                                placeholder={t('Enter Coach Name')}
                                placeholderTextColor={colors.grayColor}
                                value={coachName}
                                onChangeText={setCoachName}
                            />
                        </View>
                    </View>

                    {/* Coach Email */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>{t('Coach Email')}</Text>
                        <View style={styles.inputContainer}>
                            <Sms size={24} color={colors.primaryColor} variant="Linear" />
                            <TextInput
                                style={styles.textInput}
                                placeholder={t('Enter Coach Email')}
                                placeholderTextColor={colors.grayColor}
                                value={coachEmail}
                                onChangeText={setCoachEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    {/* Athlete */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>{t('Athlete')}</Text>
                        <TouchableOpacity style={styles.inputContainer}>
                            <Card size={24} color={colors.primaryColor} variant="Linear" />
                            <Text style={[styles.dropdownText, !selectedAthlete && styles.placeholderText]}>
                                {selectedAthlete || t('Select Athlete')}
                            </Text>
                            <Icons.Dropdown width={24} height={24} />
                        </TouchableOpacity>
                    </View>

                    {/* Add More Athletes */}
                    <TouchableOpacity style={styles.addMoreButton}>
                        <Text style={styles.addMoreText}>{t('Add More Athletes')}</Text>
                        <Add size={24} color="#898989" variant="Linear" />
                    </TouchableOpacity>
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

export default CreateGroupProfileScreen;
