import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { createStyles } from './CreateProfileScreenStyles';
import SizeBox from '../../../constants/SizeBox';
import CustomTextInput from '../../../components/customTextInput/CustomTextInput';
import CustomButton from '../../../components/customButton/CustomButton';
import BirthDatePickerModal from '../../../components/birthDatePickerModal/BirthDatePickerModal';
import Icons from '../../../constants/Icons';
import Images from '../../../constants/Images';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { ApiError } from '../../../services/apiGateway';
import { ArrowDown2, Calendar as CalendarIcon, Card } from 'iconsax-react-nativejs';
import { getNationalityOptions } from '../../../constants/Nationalities';
import { useTranslation } from 'react-i18next';

const CreateProfileScreen = ({ navigation }: any) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const { updateUserAccount, authBootstrap, refreshAuthBootstrap } = useAuth();

    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [nationality, setNationality] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isBootstrapping, setIsBootstrapping] = useState(false);
    const [showNationalityModal, setShowNationalityModal] = useState(false);
    const [showBirthdateModal, setShowBirthdateModal] = useState(false);

    useEffect(() => {
        let mounted = true;
        const ensureBootstrap = async () => {
            if (!authBootstrap) {
                setIsBootstrapping(true);
                try {
                    await refreshAuthBootstrap();
                } finally {
                    if (mounted) setIsBootstrapping(false);
                }
            }
        };
        ensureBootstrap();
        return () => {
            mounted = false;
        };
    }, [authBootstrap, refreshAuthBootstrap]);

    useEffect(() => {
        const user = authBootstrap?.user;
        if (!user) return;
        const asText = (v: any) => (v == null ? '' : String(v));
        const looksLikeAuthSubject = (value: string) => {
            const v = String(value || '').trim().toLowerCase();
            if (!v) return false;
            return v.includes('|') || v.startsWith('google-oauth2') || v.startsWith('auth0') || v.startsWith('apple');
        };
        const looksLikeRealEmail = (value: string) => {
            const v = String(value || '').trim();
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && !v.endsWith('.auth@allin.local');
        };

        const rawUsername = asText(user.username);
        const rawFirstName = asText(user.first_name);
        const rawLastName = asText(user.last_name);
        const rawEmail = asText(user.email);
        const rawNationality = asText(user.nationality);

        setUsername((prev) => prev || (looksLikeAuthSubject(rawUsername) ? '' : rawUsername));
        setFirstName((prev) => prev || rawFirstName);
        setLastName((prev) => prev || rawLastName);
        setEmail((prev) => prev || (looksLikeRealEmail(rawEmail) ? rawEmail : ''));
        setNationality((prev) => prev || rawNationality);
        setBirthDate((prev) => prev || (user.birthdate ? String(user.birthdate).slice(0, 10) : ''));
    }, [authBootstrap]);

    const canContinueStep1 = useMemo(
        () => firstName.trim().length > 0 && lastName.trim().length > 0,
        [firstName, lastName]
    );
    const canContinueStep2 = useMemo(
        () => username.trim().length > 0 && email.trim().length > 0,
        [username, email]
    );
    const canSubmitStep3 = useMemo(
        () => nationality.trim().length > 0 && birthDate.trim().length > 0,
        [nationality, birthDate]
    );
    const nationalityOptions = useMemo(() => getNationalityOptions(), []);

    const formatDateDisplay = (value?: string | null) => {
        if (!value) return t('Select date');
        const [year, month, day] = String(value).split('-').map(Number);
        if (!year || !month || !day) return String(value);
        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    };

    const handleContinue = async () => {
        if (step === 1) {
            if (!canContinueStep1) {
                Alert.alert(t('Error'), t('Please fill in all required fields'));
                return;
            }
            setStep(2);
            return;
        }
        if (step === 2) {
            if (!canContinueStep2) {
                Alert.alert(t('Error'), t('Please fill in all required fields'));
                return;
            }
            setStep(3);
            return;
        }
        if (!canSubmitStep3) {
            Alert.alert(t('Error'), t('Please fill in all required fields'));
            return;
        }

        setIsLoading(true);
        try {
            await updateUserAccount({
                username,
                first_name: firstName,
                last_name: lastName,
                email,
                nationality,
                birthdate: birthDate,
            });
            navigation.navigate('CategorySelectionScreen');
        } catch (err: any) {
            if (err instanceof ApiError && err.status === 409) {
                const code = String(err.body?.error ?? '');
                if (code === 'username_taken') {
                    setStep(2);
                    Alert.alert(t('Username unavailable'), t('This username is already in use.'));
                    return;
                }
                if (code === 'email_taken') {
                    setStep(2);
                    Alert.alert(t('Email unavailable'), t('This email is already in use.'));
                    return;
                }
            }
            Alert.alert(t('Error'), t('Failed to save account. Please try again.'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <ScrollView showsVerticalScrollIndicator={false}>
                <SizeBox height={30} />

                <View style={Styles.imageContainer}>
                    <FastImage
                        source={Images.signup2}
                        style={Styles.headerImage}
                        resizeMode="contain"
                    />
                </View>

                <SizeBox height={30} />

                <View style={Styles.contentContainer}>
                    <Text style={Styles.headingText}>{t('Complete your account')}</Text>
                    <SizeBox height={8} />
                    <Text style={Styles.subHeadingText}>{t('Add your user details before creating profiles.')}</Text>
                    <SizeBox height={8} />
                    <Text style={Styles.subHeadingText}>{t(`Step ${step} of 3`)}</Text>

                    <SizeBox height={24} />

                    {step === 1 && (
                        <>
                            <CustomTextInput
                                label={t('First Name')}
                                placeholder={t('Enter First Name')}
                                icon={<Icons.User height={16} width={16} />}
                                value={firstName}
                                onChangeText={setFirstName}
                            />
                            <SizeBox height={24} />
                            <CustomTextInput
                                label={t('Last Name')}
                                placeholder={t('Enter Last Name')}
                                icon={<Icons.User height={16} width={16} />}
                                value={lastName}
                                onChangeText={setLastName}
                            />
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <CustomTextInput
                                label={t('Username')}
                                placeholder={t('Enter Username')}
                                icon={<Icons.User height={16} width={16} />}
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                            />
                            <SizeBox height={24} />
                            <CustomTextInput
                                label={t('Email')}
                                placeholder={t('Enter Email')}
                                icon={<Icons.User height={16} width={16} />}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <Text style={Styles.label}>{t('Nationality')}</Text>
                            <TouchableOpacity
                                style={[Styles.inputContainer, { marginTop: 8 }]}
                                onPress={() => setShowNationalityModal(true)}
                                activeOpacity={0.8}
                            >
                                <Card size={16} color={colors.primaryColor} variant="Linear" />
                                <SizeBox width={10} />
                                <Text style={{ flex: 1, color: nationality ? colors.mainTextColor : colors.grayColor, fontSize: 14 }}>
                                    {nationality || t('Select nationality')}
                                </Text>
                                <ArrowDown2 size={18} color={colors.grayColor} variant="Linear" />
                            </TouchableOpacity>

                            <SizeBox height={24} />

                            <Text style={Styles.label}>{t('Your Birth Date')}</Text>
                            <TouchableOpacity
                                style={[Styles.inputContainer, { marginTop: 8 }]}
                                onPress={() => setShowBirthdateModal(true)}
                                activeOpacity={0.8}
                            >
                                <CalendarIcon size={16} color={colors.primaryColor} variant="Linear" />
                                <SizeBox width={10} />
                                <Text style={{ flex: 1, color: birthDate ? colors.mainTextColor : colors.grayColor, fontSize: 14 }}>
                                    {birthDate ? formatDateDisplay(birthDate) : t('Select date of birth')}
                                </Text>
                                <ArrowDown2 size={18} color={colors.grayColor} variant="Linear" />
                            </TouchableOpacity>
                        </>
                    )}

                    <SizeBox height={40} />

                    {(isLoading || isBootstrapping) ? (
                        <ActivityIndicator size="large" color={colors.primaryColor} />
                    ) : (
                        <>
                            {step > 1 && (
                                <>
                                    <CustomButton title={t('Back')} onPress={() => setStep((s) => Math.max(1, s - 1))} />
                                    <SizeBox height={12} />
                                </>
                            )}
                            <CustomButton title={step < 3 ? t('Continue') : t('Save and continue')} onPress={handleContinue} />
                        </>
                    )}
                </View>

                <SizeBox height={40} />
            </ScrollView>

            <Modal visible={showNationalityModal} transparent animationType="fade" onRequestClose={() => setShowNationalityModal(false)}>
                <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 20 }} onPress={() => setShowNationalityModal(false)}>
                    <Pressable style={{ maxHeight: '70%', borderRadius: 16, backgroundColor: colors.modalBackground, borderWidth: 0.5, borderColor: colors.lightGrayColor, padding: 16 }} onPress={() => {}}>
                        <Text style={{ color: colors.mainTextColor, fontSize: 18, fontWeight: '700' }}>{t('Select nationality')}</Text>
                        <SizeBox height={12} />
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {nationalityOptions.map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={{ paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: colors.lightGrayColor }}
                                    onPress={() => {
                                        setNationality(option);
                                        setShowNationalityModal(false);
                                    }}
                                >
                                    <Text style={{ color: colors.mainTextColor, fontSize: 16 }}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>

            <BirthDatePickerModal
                visible={showBirthdateModal}
                value={birthDate || null}
                onClose={() => setShowBirthdateModal(false)}
                onApply={(date) => {
                    if (date) setBirthDate(date);
                    setShowBirthdateModal(false);
                }}
                title={t('Select date of birth')}
            />
        </View>
    );
};

export default CreateProfileScreen;
