import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Alert, ActivityIndicator, TouchableOpacity, Modal, Pressable, TextInput, BackHandler, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { useFocusEffect } from '@react-navigation/native';
import { createStyles } from './CreateProfileScreenStyles';
import SizeBox from '../../../constants/SizeBox';
import CustomButton from '../../../components/customButton/CustomButton';
import DatePickerModal from '../../../components/datePickerModal/DatePickerModal';
import KeyboardAvoidingContainer from '../../../components/KeyboardAvoidingContainer';
import Icons from '../../../constants/Icons';
import Images from '../../../constants/Images';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { ApiError, checkAccountAvailability } from '../../../services/apiGateway';
import { ArrowDown2, Calendar as CalendarIcon, Card } from 'iconsax-react-nativejs';
import { getNationalityOptions } from '../../../constants/Nationalities';
import { useTranslation } from 'react-i18next';
import { validateUsernameInput } from '../../../utils/accountAvailability';
import { getWizardStepLabel } from '../../../utils/profileSelections';

type AvailabilityState = {
    status: 'idle' | 'checking' | 'available' | 'taken' | 'invalid';
    message: string;
    valid: boolean;
    available: boolean;
    provider: null;
};

const neutralAvailabilityState = (): AvailabilityState => ({
    status: 'idle',
    message: '',
    valid: true,
    available: true,
    provider: null,
});

const CreateProfileScreen = ({ navigation }: any) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const { updateUserAccount, authBootstrap, refreshAuthBootstrap, user: authUser, accessToken } = useAuth();

    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [nationality, setNationality] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isBootstrapping, setIsBootstrapping] = useState(false);
    const [showNationalityModal, setShowNationalityModal] = useState(false);
    const [showBirthdateModal, setShowBirthdateModal] = useState(false);
    const [nationalitySearch, setNationalitySearch] = useState('');
    const [showStep1Validation, setShowStep1Validation] = useState(false);
    const [showStep2Validation, setShowStep2Validation] = useState(false);
    const [showStep3Validation, setShowStep3Validation] = useState(false);
    const [usernameAvailability, setUsernameAvailability] = useState<AvailabilityState>(neutralAvailabilityState);
    const lastNameRef = useRef<TextInput | null>(null);
    const usernameRef = useRef<TextInput | null>(null);

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
        if (!user && !authUser) return;
        const asText = (v: any) => (v == null ? '' : String(v));
        const looksLikeAuthSubject = (value: string) => {
            const v = String(value || '').trim().toLowerCase();
            if (!v) return false;
            return v.includes('|') || v.startsWith('google-oauth2') || v.startsWith('auth0') || v.startsWith('apple');
        };
        const normalizeSpaces = (value: string) => String(value || '').replace(/\s+/g, ' ').trim();
        const isPlaceholderName = (value: string) => {
            const v = normalizeSpaces(value).toLowerCase();
            if (!v) return true;
            if (looksLikeAuthSubject(v)) return true;
            if (v.includes('@')) return true;
            // Avoid opaque machine-ish identifiers (long ids / mostly symbols+digits)
            const compact = v.replace(/[^a-z0-9]/g, '');
            if (!compact) return true;
            if (compact.length >= 12 && /^[a-z0-9]+$/.test(compact) && !/[aeiou]/.test(compact)) return true;
            return false;
        };
        const looksLikeRealEmail = (value: string) => {
            const v = String(value || '').trim();
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && !v.endsWith('.auth@allin.local');
        };
        const cleanUsernameCandidate = (value: string) => {
            const v = normalizeSpaces(value);
            if (!v || looksLikeAuthSubject(v) || v.includes('@')) return '';
            const sanitized = v
                .toLowerCase()
                .replace(/[^a-z0-9._-]+/g, '_')
                .replace(/_+/g, '_')
                .replace(/^[_\-.]+|[_\-.]+$/g, '');
            if (!sanitized || looksLikeAuthSubject(sanitized)) return '';
            return sanitized;
        };
        const splitName = (fullName: string): { first: string; last: string } => {
            const clean = normalizeSpaces(fullName);
            if (!clean || isPlaceholderName(clean)) return { first: '', last: '' };
            const parts = clean.split(' ').filter(Boolean);
            if (parts.length === 0) return { first: '', last: '' };
            if (parts.length === 1) return { first: parts[0] ?? '', last: '' };
            return {
                first: parts[0] ?? '',
                last: parts.slice(1).join(' '),
            };
        };

        const bootstrapUser = user ?? {};
        const rawUsername = asText((bootstrapUser as any).username);
        const rawFirstName = asText((bootstrapUser as any).first_name);
        const rawLastName = asText((bootstrapUser as any).last_name);
        const rawNationality = asText((bootstrapUser as any).nationality);

        const authGiven = normalizeSpaces(asText(authUser?.givenName));
        const authFamily = normalizeSpaces(asText(authUser?.familyName));
        const authFull = normalizeSpaces(asText(authUser?.name));
        const authNick = normalizeSpaces(asText(authUser?.nickname));
        const authEmail = normalizeSpaces(asText(authUser?.email));

        const splitFromFull = splitName(authFull);
        const firstCandidate = !isPlaceholderName(rawFirstName)
            ? normalizeSpaces(rawFirstName)
            : !isPlaceholderName(authGiven)
                ? authGiven
                : splitFromFull.first;
        const lastCandidate = !isPlaceholderName(rawLastName)
            ? normalizeSpaces(rawLastName)
            : !isPlaceholderName(authFamily)
                ? authFamily
                : splitFromFull.last;

        const usernameCandidate =
            cleanUsernameCandidate(rawUsername) ||
            cleanUsernameCandidate(authNick) ||
            cleanUsernameCandidate(authGiven && authFamily ? `${authGiven}_${authFamily}` : '') ||
            cleanUsernameCandidate(splitFromFull.first && splitFromFull.last ? `${splitFromFull.first}_${splitFromFull.last}` : '') ||
            (looksLikeRealEmail(authEmail)
                ? cleanUsernameCandidate(String(authEmail).split('@')[0] || '')
                : '');

        setUsername((prev) => {
            const current = String(prev || '').trim();
            if (current && !looksLikeAuthSubject(current)) return prev;
            return usernameCandidate;
        });
        setFirstName((prev) => {
            const current = String(prev || '').trim();
            if (current && !isPlaceholderName(current)) return prev;
            return firstCandidate;
        });
        setLastName((prev) => {
            const current = String(prev || '').trim();
            if (current && !isPlaceholderName(current)) return prev;
            return lastCandidate;
        });
        setNationality((prev) => prev || rawNationality);
        setBirthDate((prev) => prev || ((bootstrapUser as any).birthdate ? String((bootstrapUser as any).birthdate).slice(0, 10) : ''));
    }, [authBootstrap, authUser]);

    const canContinueStep1 = useMemo(
        () => firstName.trim().length > 0 && lastName.trim().length > 0,
        [firstName, lastName]
    );
    const canContinueStep2 = useMemo(
        () =>
            username.trim().length > 0 &&
            usernameAvailability.valid &&
            usernameAvailability.available &&
            usernameAvailability.status !== 'checking',
        [username, usernameAvailability]
    );
    const canSubmitStep3 = useMemo(
        () => nationality.trim().length > 0 && birthDate.trim().length > 0,
        [nationality, birthDate]
    );
    const nationalityOptions = useMemo(() => getNationalityOptions(), []);
    const filteredNationalityOptions = useMemo(() => {
        const query = nationalitySearch.trim().toLowerCase();
        if (!query) return nationalityOptions;
        return nationalityOptions.filter((option) => option.toLowerCase().includes(query));
    }, [nationalityOptions, nationalitySearch]);

    const openNationalityModal = useCallback(() => {
        setNationalitySearch('');
        setShowNationalityModal(true);
    }, []);

    const closeNationalityModal = useCallback(() => {
        setShowNationalityModal(false);
        setNationalitySearch('');
    }, []);

    const formatDateDisplay = (value?: string | null) => {
        if (!value) return t('Select date');
        const [year, month, day] = String(value).split('-').map(Number);
        if (!year || !month || !day) return String(value);
        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    };

    const openBirthdateModal = () => {
        setShowBirthdateModal(true);
    };

    const usernameReasonMessage = useCallback((reason: string | null) => {
        if (reason === 'required') return t('Username is required.');
        if (reason === 'too_short') return t('Use at least 2 characters.');
        if (reason === 'too_long') return t('Use 32 characters or fewer.');
        if (reason === 'invalid_format') return t('Use only letters, numbers, dots, underscores, or hyphens.');
        return t('This username is already in use.');
    }, [t]);

    useEffect(() => {
        if (step !== 2) return;
        const value = username.trim();
        if (!value) {
            setUsernameAvailability(neutralAvailabilityState());
            return;
        }
        const reason = validateUsernameInput(value);
        if (reason) {
            setUsernameAvailability({
                status: 'invalid',
                message: usernameReasonMessage(reason),
                valid: false,
                available: false,
                provider: null,
            });
            return;
        }
        if (!accessToken) {
            setUsernameAvailability(neutralAvailabilityState());
            return;
        }

        let cancelled = false;
        setUsernameAvailability({
            status: 'checking',
            message: t('Checking username...'),
            valid: true,
            available: false,
            provider: null,
        });

        const timer = setTimeout(async () => {
            try {
                const res = await checkAccountAvailability(accessToken, { username: value });
                if (cancelled) return;
                const next = res.username;
                if (!next) {
                    setUsernameAvailability(neutralAvailabilityState());
                    return;
                }
                if (!next.valid) {
                    setUsernameAvailability({
                        status: 'invalid',
                        message: usernameReasonMessage(next.reason ?? null),
                        valid: false,
                        available: false,
                        provider: null,
                    });
                    return;
                }
                if (!next.available) {
                    setUsernameAvailability({
                        status: 'taken',
                        message: usernameReasonMessage(next.reason ?? 'taken'),
                        valid: true,
                        available: false,
                        provider: null,
                    });
                    return;
                }
                setUsernameAvailability({
                    status: 'available',
                    message: t('Username is available.'),
                    valid: true,
                    available: true,
                    provider: null,
                });
            } catch {
                if (!cancelled) {
                    setUsernameAvailability(neutralAvailabilityState());
                }
            }
        }, 350);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [accessToken, step, t, username, usernameReasonMessage]);

    const handleContinue = async () => {
        if (step === 1) {
            if (!canContinueStep1) {
                setShowStep1Validation(true);
                return;
            }
            setShowStep1Validation(false);
            setStep(2);
            return;
        }
        if (step === 2) {
            if (!canContinueStep2) {
                setShowStep2Validation(true);
                return;
            }
            setShowStep2Validation(false);
            setStep(3);
            return;
        }
        if (!canSubmitStep3) {
            setShowStep3Validation(true);
            return;
        }
        setShowStep3Validation(false);

        setIsLoading(true);
        try {
            await updateUserAccount({
                username,
                first_name: firstName,
                last_name: lastName,
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
            }
            Alert.alert(t('Error'), t('Failed to save account. Please try again.'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = useCallback(() => {
        if (step <= 1) {
            if (navigation.canGoBack?.()) {
                navigation.goBack();
            } else {
                navigation.navigate('LoginScreen');
            }
            return;
        }
        setStep((s) => Math.max(1, s - 1));
    }, [navigation, step]);

    useFocusEffect(
        useCallback(() => {
            const onHardwareBackPress = () => {
                if (showBirthdateModal) {
                    setShowBirthdateModal(false);
                    return true;
                }
                if (showNationalityModal) {
                    closeNationalityModal();
                    return true;
                }
                handleBack();
                return true;
            };
            const subscription = BackHandler.addEventListener('hardwareBackPress', onHardwareBackPress);
            return () => {
                subscription.remove();
            };
        }, [closeNationalityModal, handleBack, showBirthdateModal, showNationalityModal]),
    );

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <KeyboardAvoidingContainer keyboardVerticalOffset={insets.top + 12}>
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
                    <Text style={Styles.subHeadingText}>{getWizardStepLabel(step, 3, t)}</Text>

                    <SizeBox height={24} />

                    {step === 1 && (
                        <>
                            <Text style={Styles.label}>{t('First Name')}</Text>
                            <View
                                style={[
                                    Styles.inputContainer,
                                    Styles.nativeInputRow,
                                    { marginTop: 8 },
                                    showStep1Validation && firstName.trim().length === 0 ? { borderColor: colors.errorColor } : null,
                                ]}
                            >
                                <Icons.User height={16} width={16} />
                                <SizeBox width={10} />
                                <TextInput
                                    style={Styles.nativeInput}
                                    value={firstName}
                                    onChangeText={(value) => {
                                        setFirstName(value);
                                        if (showStep1Validation && value.trim().length > 0 && lastName.trim().length > 0) {
                                            setShowStep1Validation(false);
                                        }
                                    }}
                                    placeholder={t('Enter First Name')}
                                    placeholderTextColor={colors.grayColor}
                                    autoCapitalize="words"
                                    autoCorrect={false}
                                    textContentType="givenName"
                                    autoComplete="name-given"
                                    returnKeyType="next"
                                    blurOnSubmit={false}
                                    onSubmitEditing={() => lastNameRef.current?.focus()}
                                />
                            </View>
                            <SizeBox height={24} />
                            <Text style={Styles.label}>{t('Last Name')}</Text>
                            <View
                                style={[
                                    Styles.inputContainer,
                                    Styles.nativeInputRow,
                                    { marginTop: 8 },
                                    showStep1Validation && lastName.trim().length === 0 ? { borderColor: colors.errorColor } : null,
                                ]}
                            >
                                <Icons.User height={16} width={16} />
                                <SizeBox width={10} />
                                <TextInput
                                    ref={lastNameRef}
                                    style={Styles.nativeInput}
                                    value={lastName}
                                    onChangeText={(value) => {
                                        setLastName(value);
                                        if (showStep1Validation && firstName.trim().length > 0 && value.trim().length > 0) {
                                            setShowStep1Validation(false);
                                        }
                                    }}
                                    placeholder={t('Enter Last Name')}
                                    placeholderTextColor={colors.grayColor}
                                    autoCapitalize="words"
                                    autoCorrect={false}
                                    textContentType="familyName"
                                    autoComplete="name-family"
                                    returnKeyType="next"
                                    blurOnSubmit={false}
                                    onSubmitEditing={() => setStep(2)}
                                />
                            </View>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <Text style={Styles.label}>{t('Username')}</Text>
                            <View
                                style={[
                                    Styles.inputContainer,
                                    Styles.nativeInputRow,
                                    { marginTop: 8 },
                                    (showStep2Validation && username.trim().length === 0) ||
                                    usernameAvailability.status === 'invalid' ||
                                    usernameAvailability.status === 'taken'
                                        ? { borderColor: colors.errorColor }
                                        : null,
                                ]}
                            >
                                <Icons.User height={16} width={16} />
                                <SizeBox width={10} />
                                <TextInput
                                    ref={usernameRef}
                                    style={Styles.nativeInput}
                                    value={username}
                                    onChangeText={(value) => {
                                        setUsername(value);
                                        if (showStep2Validation && value.trim().length > 0) {
                                            setShowStep2Validation(false);
                                        }
                                    }}
                                    placeholder={t('Enter Username')}
                                    placeholderTextColor={colors.grayColor}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    textContentType="username"
                                    autoComplete="username"
                                    returnKeyType="done"
                                />
                            </View>
                            {usernameAvailability.status !== 'idle' ? (
                                <Text
                                    style={[
                                        Styles.helperText,
                                        usernameAvailability.status === 'available'
                                            ? { color: colors.greenColor }
                                            : usernameAvailability.status === 'checking'
                                                ? { color: colors.grayColor }
                                                : { color: colors.errorColor },
                                    ]}
                                >
                                    {usernameAvailability.message}
                                </Text>
                            ) : null}
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <Text style={Styles.label}>{t('Nationality')}</Text>
                            <TouchableOpacity
                                style={[
                                    Styles.inputContainer,
                                    { marginTop: 8 },
                                    showStep3Validation && nationality.trim().length === 0
                                        ? { borderColor: colors.errorColor }
                                        : null,
                                ]}
                                onPress={openNationalityModal}
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
                                style={[
                                    Styles.dateButton,
                                    { marginTop: 8 },
                                    showStep3Validation && birthDate.trim().length === 0
                                        ? { borderColor: colors.errorColor }
                                        : null,
                                ]}
                                onPress={openBirthdateModal}
                                activeOpacity={0.8}
                            >
                                <CalendarIcon size={16} color={colors.primaryColor} variant="Linear" />
                                <Text style={[Styles.dateText, { flex: 1, color: birthDate ? colors.mainTextColor : colors.grayColor }]}>
                                    {birthDate ? formatDateDisplay(birthDate) : t('Select date of birth')}
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}

                    <SizeBox height={40} />

                    {(isLoading || isBootstrapping) ? (
                        <ActivityIndicator size="large" color={colors.primaryColor} />
                    ) : (
                        <>
                            <CustomButton
                                title={t('Back')}
                                onPress={handleBack}
                                isBack
                            />
                            <SizeBox height={12} />
                            <CustomButton title={step < 3 ? t('Continue') : t('Save and continue')} onPress={handleContinue} />
                        </>
                    )}
                </View>

                <SizeBox height={40} />
            </KeyboardAvoidingContainer>

            <Modal visible={showNationalityModal} transparent animationType="fade" onRequestClose={closeNationalityModal}>
                <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 20 }} onPress={closeNationalityModal}>
                    <Pressable style={{ maxHeight: '70%', borderRadius: 16, backgroundColor: colors.modalBackground, borderWidth: 0.5, borderColor: colors.lightGrayColor, padding: 16 }} onPress={() => {}}>
                        <Text style={{ color: colors.mainTextColor, fontSize: 18, fontWeight: '700' }}>{t('Select nationality')}</Text>
                        <SizeBox height={12} />
                        <TextInput
                            value={nationalitySearch}
                            onChangeText={setNationalitySearch}
                            placeholder={t('Search nationality')}
                            placeholderTextColor={colors.grayColor}
                            autoCapitalize="none"
                            autoCorrect={false}
                            style={{
                                minHeight: 44,
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: colors.lightGrayColor,
                                backgroundColor: colors.backgroundColor,
                                color: colors.mainTextColor,
                                paddingHorizontal: 12,
                                marginBottom: 12,
                            }}
                        />
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {filteredNationalityOptions.length === 0 ? (
                                <Text style={{ color: colors.grayColor, fontSize: 14, paddingVertical: 8 }}>
                                    {t('No nationality found')}
                                </Text>
                            ) : (
                                filteredNationalityOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={{ paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: colors.lightGrayColor }}
                                        onPress={() => {
                                            setNationality(option);
                                            if (showStep3Validation && option.trim().length > 0 && birthDate.trim().length > 0) {
                                                setShowStep3Validation(false);
                                            }
                                            closeNationalityModal();
                                        }}
                                    >
                                        <Text style={{ color: colors.mainTextColor, fontSize: 16 }}>{option}</Text>
                                    </TouchableOpacity>
                                ))
                            )}
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>

            <DatePickerModal
                visible={showBirthdateModal}
                value={birthDate || null}
                title={t('Select date of birth')}
                onClose={() => setShowBirthdateModal(false)}
                onApply={(value) => {
                    setBirthDate(value || '');
                    if (showStep3Validation && nationality.trim().length > 0 && String(value || '').trim().length > 0) {
                        setShowStep3Validation(false);
                    }
                    setShowBirthdateModal(false);
                }}
            />
        </View>
    );
};

export default CreateProfileScreen;
