import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { createStyles } from '../completeAthleteDetails/CompleteAthleteDetailsScreenStyles';
import SizeBox from '../../../constants/SizeBox';
import Images from '../../../constants/Images';
import Icons from '../../../constants/Icons';
import CustomTextInput from '../../../components/customTextInput/CustomTextInput';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const ROLES = ['Coach', 'Parent', 'Fysiotherapist', 'Fan'];

const CompleteSupportDetailsScreen = ({ navigation }: any) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const { updateUserProfile } = useAuth();

    const [supportRole, setSupportRole] = useState<string>('Coach');
    const [organization, setOrganization] = useState('');
    const [baseLocation, setBaseLocation] = useState('');
    const [athletes, setAthletes] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSkip = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'BottomTabBar' }],
        });
    };

    const handleFinish = async () => {
        setIsLoading(true);
        try {
            const linkedAthletes = String(athletes || '')
                .split(',')
                .map((entry) => entry.trim())
                .filter(Boolean);
            await updateUserProfile({
                supportRole,
                supportOrganization: organization.trim(),
                supportBaseLocation: baseLocation.trim(),
                supportAthletes: linkedAthletes,
            });
            navigation.reset({
                index: 0,
                routes: [{ name: 'BottomTabBar' }],
            });
        } catch (err: any) {
            Alert.alert(t('Error'), t('Failed to save details. Please try again.'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                <SizeBox height={30} />

                <View style={Styles.imageContainer}>
                    <FastImage
                        source={Images.signup4}
                        style={Styles.headerImage}
                        resizeMode="contain"
                    />
                </View>

                <SizeBox height={30} />

                <View style={Styles.contentContainer}>
                    <Text style={Styles.headingText}>{t('Complete Your Support Profile')}</Text>
                    <SizeBox height={8} />
                    <Text style={Styles.subHeadingText}>
                        {t('Choose your role and optional details')}
                    </Text>

                    <SizeBox height={24} />

                    <View style={Styles.formContainer}>
                        <Text style={Styles.clubFieldLabel}>{t('Support role')}</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                            {ROLES.map((role) => {
                                const selected = supportRole === role;
                                return (
                                    <TouchableOpacity
                                        key={role}
                                        onPress={() => setSupportRole(role)}
                                        style={{
                                            borderWidth: 1,
                                            borderColor: selected ? colors.primaryColor : colors.borderColor,
                                            backgroundColor: selected ? colors.secondaryBlueColor : colors.secondaryColor,
                                            paddingHorizontal: 14,
                                            paddingVertical: 10,
                                            borderRadius: 10,
                                        }}
                                    >
                                        <Text style={{ color: selected ? colors.primaryColor : colors.mainTextColor }}>
                                            {role}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <CustomTextInput
                            label={t('Organization / Club')}
                            placeholder={t('Optional')}
                            icon={<Icons.User height={16} width={16} />}
                            value={organization}
                            onChangeText={setOrganization}
                        />

                        <CustomTextInput
                            label={t('Based in')}
                            placeholder={t('Optional')}
                            icon={<Icons.Location height={16} width={16} />}
                            value={baseLocation}
                            onChangeText={setBaseLocation}
                        />

                        <Text style={Styles.clubFieldLabel}>{t('Athletes you coach/support')}</Text>
                        <TextInput
                            value={athletes}
                            onChangeText={setAthletes}
                            placeholder={t('Optional, comma separated names')}
                            placeholderTextColor={colors.grayColor}
                            style={{
                                minHeight: 54,
                                borderWidth: 1,
                                borderRadius: 10,
                                borderColor: colors.borderColor,
                                backgroundColor: colors.secondaryColor,
                                color: colors.mainTextColor,
                                paddingHorizontal: 16,
                                paddingVertical: 14,
                            }}
                        />
                    </View>
                </View>

                <View style={Styles.buttonContainer}>
                    <TouchableOpacity style={Styles.skipButton} activeOpacity={0.7} onPress={handleSkip}>
                        <Text style={Styles.skipButtonText}>{t('Skip')}</Text>
                        <Icons.RightBtnIconGrey height={18} width={18} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[Styles.finishButton, isLoading && { opacity: 0.5 }]}
                        activeOpacity={0.7}
                        onPress={handleFinish}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Text style={Styles.finishButtonText}>{t('Finish')}</Text>
                                <Icons.RightBtnIcon height={18} width={18} />
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <SizeBox height={40} />
            </ScrollView>
        </View>
    );
};

export default CompleteSupportDetailsScreen;
