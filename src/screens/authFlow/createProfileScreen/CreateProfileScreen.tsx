import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, TouchableOpacity, Modal, Pressable, TextInput, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { Calendar } from 'react-native-calendars';
import { useFocusEffect } from '@react-navigation/native';
import { createStyles } from './CreateProfileScreenStyles';
import SizeBox from '../../../constants/SizeBox';
import CustomTextInput from '../../../components/customTextInput/CustomTextInput';
import CustomButton from '../../../components/customButton/CustomButton';
import Icons from '../../../constants/Icons';
import Images from '../../../constants/Images';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { ApiError } from '../../../services/apiGateway';
import { ArrowDown2, ArrowLeft2, ArrowRight2, Calendar as CalendarIcon, Card } from 'iconsax-react-nativejs';
import { getNationalityOptions } from '../../../constants/Nationalities';
import { useTranslation } from 'react-i18next';

const CreateProfileScreen = ({ navigation }: any) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const { updateUserAccount, authBootstrap, refreshAuthBootstrap, user: authUser } = useAuth();

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
    const [nationalitySearch, setNationalitySearch] = useState('');
    const [calendarDate, setCalendarDate] = useState<string | null>(null);
    const [calendarViewDate, setCalendarViewDate] = useState<string | null>(null);
    const [showBirthYearDropdown, setShowBirthYearDropdown] = useState(false);

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
        const rawEmail = asText((bootstrapUser as any).email);
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

        const emailCandidate =
            looksLikeRealEmail(rawEmail)
                ? rawEmail
                : (looksLikeRealEmail(authEmail) ? authEmail : '');

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
        setEmail((prev) => {
            const current = String(prev || '').trim();
            if (current && looksLikeRealEmail(current)) return prev;
            return emailCandidate;
        });
        setNationality((prev) => prev || rawNationality);
        setBirthDate((prev) => prev || ((bootstrapUser as any).birthdate ? String((bootstrapUser as any).birthdate).slice(0, 10) : ''));
    }, [authBootstrap, authUser]);

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
    const filteredNationalityOptions = useMemo(() => {
        const query = nationalitySearch.trim().toLowerCase();
        if (!query) return nationalityOptions;
        return nationalityOptions.filter((option) => option.toLowerCase().includes(query));
    }, [nationalityOptions, nationalitySearch]);

    const openNationalityModal = () => {
        setNationalitySearch('');
        setShowNationalityModal(true);
    };

    const closeNationalityModal = () => {
        setShowNationalityModal(false);
        setNationalitySearch('');
    };

    const formatDateDisplay = (value?: string | null) => {
        if (!value) return t('Select date');
        const [year, month, day] = String(value).split('-').map(Number);
        if (!year || !month || !day) return String(value);
        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    };

    const toDateString = (date: Date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const yearOptions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years: number[] = [];
        for (let year = currentYear; year >= 1930; year -= 1) {
            years.push(year);
        }
        return years;
    }, []);

    const selectedCalendarYear = useMemo(() => {
        const source = calendarViewDate || calendarDate;
        const parsed = Number(String(source || '').split('-')[0]);
        return Number.isFinite(parsed) ? parsed : new Date().getFullYear();
    }, [calendarDate, calendarViewDate]);

    const calendarRenderKey = useMemo(() => {
        const source = String(calendarViewDate || calendarDate || '');
        const [year, month] = source.split('-');
        if (year && month) return `birth-cal-${year}-${month}`;
        return 'birth-cal-default';
    }, [calendarDate, calendarViewDate]);

    const openBirthdateModal = () => {
        const seedDate = birthDate ? new Date(`${birthDate}T00:00:00`) : new Date();
        const safe = Number.isNaN(seedDate.getTime()) ? new Date() : seedDate;
        const seed = toDateString(safe);
        setCalendarDate(seed);
        setCalendarViewDate(seed);
        setShowBirthYearDropdown(false);
        setShowBirthdateModal(true);
    };

    const applyBirthdateModal = () => {
        if (calendarDate) setBirthDate(calendarDate);
        setShowBirthYearDropdown(false);
        setShowBirthdateModal(false);
    };

    const handleSelectBirthYear = (year: number) => {
        const source = String(calendarViewDate || calendarDate || toDateString(new Date()));
        const [_, monthRaw, dayRaw] = source.split('-').map(Number);
        const month = Number.isFinite(monthRaw) && monthRaw >= 1 && monthRaw <= 12 ? monthRaw : 1;
        const day = Number.isFinite(dayRaw) && dayRaw >= 1 ? dayRaw : 1;
        const daysInMonth = new Date(year, month, 0).getDate();
        const safeDay = Math.min(day, daysInMonth);
        const nextDate = `${year}-${String(month).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`;
        setCalendarViewDate(nextDate);
        setCalendarDate(nextDate);
        setShowBirthYearDropdown(false);
    };

    const displayedCalendarMonthLabel = useMemo(() => {
        const source = String(calendarViewDate || calendarDate || toDateString(new Date()));
        const [yearRaw, monthRaw] = source.split('-').map(Number);
        const year = Number.isFinite(yearRaw) ? yearRaw : new Date().getFullYear();
        const month = Number.isFinite(monthRaw) && monthRaw >= 1 && monthRaw <= 12 ? monthRaw : 1;
        return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
            month: 'long',
            year: 'numeric',
        });
    }, [calendarDate, calendarViewDate]);

    const shiftBirthCalendarMonth = useCallback((delta: number) => {
        const source = String(calendarViewDate || calendarDate || toDateString(new Date()));
        const [yearRaw, monthRaw] = source.split('-').map(Number);
        const year = Number.isFinite(yearRaw) ? yearRaw : new Date().getFullYear();
        const month = Number.isFinite(monthRaw) && monthRaw >= 1 && monthRaw <= 12 ? monthRaw : 1;
        const nextMonth = new Date(year, month - 1 + delta, 1);
        setCalendarViewDate(toDateString(nextMonth));
        setShowBirthYearDropdown(false);
    }, [calendarDate, calendarViewDate]);

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
                handleBack();
                return true;
            };
            const subscription = BackHandler.addEventListener('hardwareBackPress', onHardwareBackPress);
            return () => {
                subscription.remove();
            };
        }, [handleBack]),
    );

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
                                style={[Styles.dateButton, { marginTop: 8 }]}
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
            </ScrollView>

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

            <Modal
                visible={showBirthdateModal}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    setShowBirthYearDropdown(false);
                    setShowBirthdateModal(false);
                }}
            >
                <View style={Styles.modalOverlay}>
                    <Pressable
                        style={Styles.modalBackdrop}
                        onPress={() => {
                            setShowBirthYearDropdown(false);
                            setShowBirthdateModal(false);
                        }}
                    />
                    <View style={Styles.dateModalContainer}>
                        <View style={Styles.dateModalHeaderRow}>
                            <Text style={Styles.dateModalTitle}>{t('Select date of birth')}</Text>
                            <TouchableOpacity
                                style={Styles.yearDropdownButton}
                                activeOpacity={0.85}
                                onPress={() => setShowBirthYearDropdown((prev) => !prev)}
                            >
                                <Text style={Styles.yearDropdownText}>{selectedCalendarYear}</Text>
                                <ArrowDown2 size={16} color={colors.subTextColor} variant="Linear" />
                            </TouchableOpacity>
                        </View>
                        {showBirthYearDropdown ? (
                            <View style={Styles.yearDropdownMenu}>
                                <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
                                    {yearOptions.map((year) => {
                                        const active = year === selectedCalendarYear;
                                        return (
                                            <TouchableOpacity
                                                key={`birth-year-${year}`}
                                                style={[Styles.yearDropdownItem, active && Styles.yearDropdownItemActive]}
                                                onPress={() => handleSelectBirthYear(year)}
                                            >
                                                <Text style={[Styles.yearDropdownItemText, active && Styles.yearDropdownItemTextActive]}>
                                                    {year}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </View>
                        ) : null}
                        <SizeBox height={10} />
                        <Calendar
                            key={calendarRenderKey}
                            current={(calendarViewDate || calendarDate) ?? undefined}
                            hideArrows
                            customHeaderTitle={
                                <View style={Styles.calendarMonthNav}>
                                    <TouchableOpacity
                                        style={Styles.calendarMonthArrowButton}
                                        onPress={() => shiftBirthCalendarMonth(-1)}
                                        activeOpacity={0.8}
                                    >
                                        <ArrowLeft2 size={18} color={colors.mainTextColor} variant="Linear" />
                                    </TouchableOpacity>
                                    <Text style={Styles.calendarMonthLabel}>{displayedCalendarMonthLabel}</Text>
                                    <TouchableOpacity
                                        style={Styles.calendarMonthArrowButton}
                                        onPress={() => shiftBirthCalendarMonth(1)}
                                        activeOpacity={0.8}
                                    >
                                        <ArrowRight2 size={18} color={colors.mainTextColor} variant="Linear" />
                                    </TouchableOpacity>
                                </View>
                            }
                            markedDates={calendarDate ? { [calendarDate]: { selected: true, selectedColor: colors.primaryColor } } : undefined}
                            onDayPress={(day) => {
                                setCalendarDate(day.dateString);
                                setCalendarViewDate(day.dateString);
                            }}
                            onMonthChange={(month) => {
                                if (month?.dateString) setCalendarViewDate(month.dateString);
                            }}
                            enableSwipeMonths
                            theme={{
                                calendarBackground: colors.cardBackground,
                                textSectionTitleColor: colors.grayColor,
                                dayTextColor: colors.mainTextColor,
                                monthTextColor: colors.mainTextColor,
                                arrowColor: colors.primaryColor,
                                selectedDayBackgroundColor: colors.primaryColor,
                                selectedDayTextColor: colors.pureWhite,
                                todayTextColor: colors.primaryColor,
                            }}
                            style={{ borderRadius: 12 }}
                        />
                        <TouchableOpacity style={Styles.modalDoneButton} onPress={applyBirthdateModal}>
                            <Text style={Styles.modalDoneButtonText}>{t('Done')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default CreateProfileScreen;
