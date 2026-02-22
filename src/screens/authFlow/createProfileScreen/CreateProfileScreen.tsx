import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { CalendarList } from 'react-native-calendars';
import { createStyles } from './CreateProfileScreenStyles';
import SizeBox from '../../../constants/SizeBox';
import CustomTextInput from '../../../components/customTextInput/CustomTextInput';
import CustomButton from '../../../components/customButton/CustomButton';
import Icons from '../../../constants/Icons';
import Images from '../../../constants/Images';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { ApiError } from '../../../services/apiGateway';
import { ArrowDown2, Calendar as CalendarIcon, Card } from 'iconsax-react-nativejs';
import { getNationalityOptions } from '../../../constants/Nationalities';
import { useTranslation } from 'react-i18next'

const CreateProfileScreen = ({ navigation }: any) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const { updateUserProfile, updateUserAccount, authBootstrap, refreshAuthBootstrap } = useAuth();

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
    const [calendarFocusDate, setCalendarFocusDate] = useState<string | null>(null);
    const [showYearModal, setShowYearModal] = useState(false);

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
    }, [authBootstrap]);

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
    const toDateString = (date: Date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };
    const formatDateDisplay = (value?: string | null) => {
        if (!value) return t('Select date');
        const [year, month, day] = String(value).split('-').map(Number);
        if (!year || !month || !day) return String(value);
        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    };
    const markedDates = useMemo(() => {
        if (!birthDate) return {};
        return {
            [birthDate]: {
                selected: true,
                selectedColor: colors.primaryColor,
                selectedTextColor: colors.pureWhite,
            },
        };
    }, [birthDate, colors.primaryColor, colors.pureWhite]);
    const selectedYear = useMemo(() => {
        if (calendarFocusDate) {
            const parsed = new Date(calendarFocusDate);
            if (!Number.isNaN(parsed.getTime())) return parsed.getFullYear();
        }
        if (birthDate) {
            const parsed = new Date(birthDate);
            if (!Number.isNaN(parsed.getTime())) return parsed.getFullYear();
        }
        return new Date().getFullYear();
    }, [calendarFocusDate, birthDate]);
    const birthYearOptions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years: number[] = [];
        for (let y = currentYear; y >= 1900; y -= 1) years.push(y);
        return years;
    }, []);
    const jumpToYear = (year: number) => {
        const baseDate = birthDate ? new Date(birthDate) : (calendarFocusDate ? new Date(calendarFocusDate) : new Date());
        const month = baseDate.getMonth();
        const day = baseDate.getDate();
        const maxDay = new Date(year, month + 1, 0).getDate();
        const nextDate = new Date(year, month, Math.min(day, maxDay));
        const nextString = toDateString(nextDate);
        setCalendarFocusDate(nextString);
        if (birthDate) setBirthDate(nextString);
        setShowYearModal(false);
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
            await updateUserProfile({
                username,
                firstName,
                lastName,
                birthDate,
                nationality,
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
                    <Text style={Styles.subHeadingText}>
                        {t('Add your user details before creating profiles.')}
                    </Text>
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
                                onPress={() => {
                                    setCalendarFocusDate(birthDate || toDateString(new Date()));
                                    setShowYearModal(false);
                                    setShowBirthdateModal(true);
                                }}
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

            <Modal visible={showBirthdateModal} transparent animationType="fade" onRequestClose={() => setShowBirthdateModal(false)}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 16 }}>
                    <Pressable
                        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
                        onPress={() => {
                            setShowYearModal(false);
                            setShowBirthdateModal(false);
                        }}
                    />
                    <View style={{ borderRadius: 16, backgroundColor: colors.modalBackground, borderWidth: 0.5, borderColor: colors.lightGrayColor, padding: 16, maxHeight: '72%' }}>
                        <Text style={{ color: colors.mainTextColor, fontSize: 18, fontWeight: '700' }}>{t('Select date of birth')}</Text>
                        <SizeBox height={12} />
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text style={{ color: colors.subTextColor, fontSize: 14, fontWeight: '600' }}>{t('Year')}</Text>
                            <TouchableOpacity
                                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: colors.lightGrayColor }}
                                onPress={() => setShowYearModal((prev) => !prev)}
                            >
                                <Text style={{ color: colors.mainTextColor, fontSize: 15, fontWeight: '600' }}>{selectedYear}</Text>
                                <ArrowDown2 size={16} color={colors.grayColor} variant="Linear" />
                            </TouchableOpacity>
                        </View>
                        {showYearModal && (
                            <>
                                <View style={{ borderRadius: 12, borderWidth: 1, borderColor: colors.lightGrayColor, backgroundColor: colors.modalBackground, marginBottom: 10 }}>
                                    <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                                        {birthYearOptions.map((year) => (
                                            <TouchableOpacity
                                                key={`inline-birth-year-${year}`}
                                                style={{ paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 0.5, borderBottomColor: colors.lightGrayColor }}
                                                onPress={() => jumpToYear(year)}
                                            >
                                                <Text style={{ color: year === selectedYear ? colors.primaryColor : colors.mainTextColor, fontSize: 15, fontWeight: year === selectedYear ? '700' : '500' }}>
                                                    {year}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            </>
                        )}
                        <CalendarList
                            style={{ maxHeight: 300 }}
                            current={calendarFocusDate ?? birthDate ?? toDateString(new Date())}
                            initialDate={calendarFocusDate ?? birthDate ?? toDateString(new Date())}
                            firstDay={1}
                            maxDate={toDateString(new Date())}
                            onDayPress={(day) => {
                                setBirthDate(day.dateString);
                                setCalendarFocusDate(day.dateString);
                            }}
                            markedDates={markedDates}
                            theme={{
                                calendarBackground: colors.modalBackground,
                                backgroundColor: colors.modalBackground,
                                dayTextColor: colors.mainTextColor,
                                monthTextColor: colors.mainTextColor,
                                textSectionTitleColor: colors.subTextColor,
                                selectedDayBackgroundColor: colors.primaryColor,
                                selectedDayTextColor: colors.pureWhite,
                                todayTextColor: colors.primaryColor,
                                weekVerticalMargin: 0,
                                textDayHeaderFontSize: 11,
                                textDayFontSize: 14,
                            }}
                            pastScrollRange={120}
                            futureScrollRange={0}
                            scrollEnabled
                            showScrollIndicator
                        />
                        <SizeBox height={12} />
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity style={{ flex: 1, minHeight: 46, borderRadius: 12, borderWidth: 1, borderColor: colors.lightGrayColor, alignItems: 'center', justifyContent: 'center' }} onPress={() => { setShowYearModal(false); setShowBirthdateModal(false); }}>
                                <Text style={{ color: colors.mainTextColor, fontWeight: '600' }}>{t('Cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flex: 1, minHeight: 46, borderRadius: 12, backgroundColor: colors.primaryColor, alignItems: 'center', justifyContent: 'center' }} onPress={() => { setShowYearModal(false); setShowBirthdateModal(false); }}>
                                <Text style={{ color: colors.pureWhite, fontWeight: '700' }}>{t('Apply')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default CreateProfileScreen;
