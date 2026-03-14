var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { formatAccountProvider, validateEmailInput, validateUsernameInput } from '../../../utils/accountAvailability';
import { getWizardStepLabel } from '../../../utils/profileSelections';
const neutralAvailabilityState = () => ({
    status: 'idle',
    message: '',
    valid: true,
    available: true,
    provider: null,
});
const CreateProfileScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const { updateUserAccount, authBootstrap, refreshAuthBootstrap, user: authUser, accessToken } = useAuth();
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
    const [showStep1Validation, setShowStep1Validation] = useState(false);
    const [showStep2Validation, setShowStep2Validation] = useState(false);
    const [showStep3Validation, setShowStep3Validation] = useState(false);
    const [usernameAvailability, setUsernameAvailability] = useState(neutralAvailabilityState);
    const [emailAvailability, setEmailAvailability] = useState(neutralAvailabilityState);
    const lastNameRef = useRef(null);
    const usernameRef = useRef(null);
    const emailRef = useRef(null);
    useEffect(() => {
        let mounted = true;
        const ensureBootstrap = () => __awaiter(void 0, void 0, void 0, function* () {
            if (!authBootstrap) {
                setIsBootstrapping(true);
                try {
                    yield refreshAuthBootstrap();
                }
                finally {
                    if (mounted)
                        setIsBootstrapping(false);
                }
            }
        });
        ensureBootstrap();
        return () => {
            mounted = false;
        };
    }, [authBootstrap, refreshAuthBootstrap]);
    useEffect(() => {
        const user = authBootstrap === null || authBootstrap === void 0 ? void 0 : authBootstrap.user;
        if (!user && !authUser)
            return;
        const asText = (v) => (v == null ? '' : String(v));
        const looksLikeAuthSubject = (value) => {
            const v = String(value || '').trim().toLowerCase();
            if (!v)
                return false;
            return v.includes('|') || v.startsWith('google-oauth2') || v.startsWith('auth0') || v.startsWith('apple');
        };
        const normalizeSpaces = (value) => String(value || '').replace(/\s+/g, ' ').trim();
        const isPlaceholderName = (value) => {
            const v = normalizeSpaces(value).toLowerCase();
            if (!v)
                return true;
            if (looksLikeAuthSubject(v))
                return true;
            if (v.includes('@'))
                return true;
            // Avoid opaque machine-ish identifiers (long ids / mostly symbols+digits)
            const compact = v.replace(/[^a-z0-9]/g, '');
            if (!compact)
                return true;
            if (compact.length >= 12 && /^[a-z0-9]+$/.test(compact) && !/[aeiou]/.test(compact))
                return true;
            return false;
        };
        const looksLikeRealEmail = (value) => {
            const v = String(value || '').trim();
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && !v.endsWith('.auth@allin.local');
        };
        const cleanUsernameCandidate = (value) => {
            const v = normalizeSpaces(value);
            if (!v || looksLikeAuthSubject(v) || v.includes('@'))
                return '';
            const sanitized = v
                .toLowerCase()
                .replace(/[^a-z0-9._-]+/g, '_')
                .replace(/_+/g, '_')
                .replace(/^[_\-.]+|[_\-.]+$/g, '');
            if (!sanitized || looksLikeAuthSubject(sanitized))
                return '';
            return sanitized;
        };
        const splitName = (fullName) => {
            var _a, _b;
            const clean = normalizeSpaces(fullName);
            if (!clean || isPlaceholderName(clean))
                return { first: '', last: '' };
            const parts = clean.split(' ').filter(Boolean);
            if (parts.length === 0)
                return { first: '', last: '' };
            if (parts.length === 1)
                return { first: (_a = parts[0]) !== null && _a !== void 0 ? _a : '', last: '' };
            return {
                first: (_b = parts[0]) !== null && _b !== void 0 ? _b : '',
                last: parts.slice(1).join(' '),
            };
        };
        const bootstrapUser = user !== null && user !== void 0 ? user : {};
        const rawUsername = asText(bootstrapUser.username);
        const rawFirstName = asText(bootstrapUser.first_name);
        const rawLastName = asText(bootstrapUser.last_name);
        const rawEmail = asText(bootstrapUser.email);
        const rawNationality = asText(bootstrapUser.nationality);
        const authGiven = normalizeSpaces(asText(authUser === null || authUser === void 0 ? void 0 : authUser.givenName));
        const authFamily = normalizeSpaces(asText(authUser === null || authUser === void 0 ? void 0 : authUser.familyName));
        const authFull = normalizeSpaces(asText(authUser === null || authUser === void 0 ? void 0 : authUser.name));
        const authNick = normalizeSpaces(asText(authUser === null || authUser === void 0 ? void 0 : authUser.nickname));
        const authEmail = normalizeSpaces(asText(authUser === null || authUser === void 0 ? void 0 : authUser.email));
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
        const usernameCandidate = cleanUsernameCandidate(rawUsername) ||
            cleanUsernameCandidate(authNick) ||
            cleanUsernameCandidate(authGiven && authFamily ? `${authGiven}_${authFamily}` : '') ||
            cleanUsernameCandidate(splitFromFull.first && splitFromFull.last ? `${splitFromFull.first}_${splitFromFull.last}` : '') ||
            (looksLikeRealEmail(authEmail)
                ? cleanUsernameCandidate(String(authEmail).split('@')[0] || '')
                : '');
        const emailCandidate = looksLikeRealEmail(rawEmail)
            ? rawEmail
            : (looksLikeRealEmail(authEmail) ? authEmail : '');
        setUsername((prev) => {
            const current = String(prev || '').trim();
            if (current && !looksLikeAuthSubject(current))
                return prev;
            return usernameCandidate;
        });
        setFirstName((prev) => {
            const current = String(prev || '').trim();
            if (current && !isPlaceholderName(current))
                return prev;
            return firstCandidate;
        });
        setLastName((prev) => {
            const current = String(prev || '').trim();
            if (current && !isPlaceholderName(current))
                return prev;
            return lastCandidate;
        });
        setEmail((prev) => {
            const current = String(prev || '').trim();
            if (current && looksLikeRealEmail(current))
                return prev;
            return emailCandidate;
        });
        setNationality((prev) => prev || rawNationality);
        setBirthDate((prev) => prev || (bootstrapUser.birthdate ? String(bootstrapUser.birthdate).slice(0, 10) : ''));
    }, [authBootstrap, authUser]);
    const canContinueStep1 = useMemo(() => firstName.trim().length > 0 && lastName.trim().length > 0, [firstName, lastName]);
    const canContinueStep2 = useMemo(() => username.trim().length > 0 &&
        email.trim().length > 0 &&
        usernameAvailability.valid &&
        usernameAvailability.available &&
        emailAvailability.valid &&
        emailAvailability.available &&
        usernameAvailability.status !== 'checking' &&
        emailAvailability.status !== 'checking', [email, emailAvailability, username, usernameAvailability]);
    const canSubmitStep3 = useMemo(() => nationality.trim().length > 0 && birthDate.trim().length > 0, [nationality, birthDate]);
    const nationalityOptions = useMemo(() => getNationalityOptions(), []);
    const filteredNationalityOptions = useMemo(() => {
        const query = nationalitySearch.trim().toLowerCase();
        if (!query)
            return nationalityOptions;
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
    const formatDateDisplay = (value) => {
        if (!value)
            return t('Select date');
        const [year, month, day] = String(value).split('-').map(Number);
        if (!year || !month || !day)
            return String(value);
        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    };
    const openBirthdateModal = () => {
        setShowBirthdateModal(true);
    };
    const usernameReasonMessage = useCallback((reason) => {
        if (reason === 'required')
            return t('Username is required.');
        if (reason === 'too_short')
            return t('Use at least 2 characters.');
        if (reason === 'too_long')
            return t('Use 32 characters or fewer.');
        if (reason === 'invalid_format')
            return t('Use only letters, numbers, dots, underscores, or hyphens.');
        return t('This username is already in use.');
    }, [t]);
    const emailReasonMessage = useCallback((reason, provider) => {
        if (reason === 'required')
            return t('Email is required.');
        if (reason === 'invalid_format')
            return t('Enter a valid email address.');
        if (provider) {
            return t('This email is already linked to {{provider}}.', {
                provider: formatAccountProvider(provider),
            });
        }
        return t('This email is already in use.');
    }, [t]);
    useEffect(() => {
        if (step !== 2)
            return;
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
        const timer = setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            try {
                const res = yield checkAccountAvailability(accessToken, { username: value });
                if (cancelled)
                    return;
                const next = res.username;
                if (!next) {
                    setUsernameAvailability(neutralAvailabilityState());
                    return;
                }
                if (!next.valid) {
                    setUsernameAvailability({
                        status: 'invalid',
                        message: usernameReasonMessage((_a = next.reason) !== null && _a !== void 0 ? _a : null),
                        valid: false,
                        available: false,
                        provider: null,
                    });
                    return;
                }
                if (!next.available) {
                    setUsernameAvailability({
                        status: 'taken',
                        message: usernameReasonMessage((_b = next.reason) !== null && _b !== void 0 ? _b : 'taken'),
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
            }
            catch (_c) {
                if (!cancelled) {
                    setUsernameAvailability(neutralAvailabilityState());
                }
            }
        }), 350);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [accessToken, step, t, username, usernameReasonMessage]);
    useEffect(() => {
        if (step !== 2)
            return;
        const value = email.trim();
        if (!value) {
            setEmailAvailability(neutralAvailabilityState());
            return;
        }
        const reason = validateEmailInput(value);
        if (reason) {
            setEmailAvailability({
                status: 'invalid',
                message: emailReasonMessage(reason),
                valid: false,
                available: false,
                provider: null,
            });
            return;
        }
        if (!accessToken) {
            setEmailAvailability(neutralAvailabilityState());
            return;
        }
        let cancelled = false;
        setEmailAvailability({
            status: 'checking',
            message: t('Checking email...'),
            valid: true,
            available: false,
            provider: null,
        });
        const timer = setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            try {
                const res = yield checkAccountAvailability(accessToken, { email: value });
                if (cancelled)
                    return;
                const next = res.email;
                if (!next) {
                    setEmailAvailability(neutralAvailabilityState());
                    return;
                }
                if (!next.valid) {
                    setEmailAvailability({
                        status: 'invalid',
                        message: emailReasonMessage((_a = next.reason) !== null && _a !== void 0 ? _a : null, next.provider),
                        valid: false,
                        available: false,
                        provider: (_b = next.provider) !== null && _b !== void 0 ? _b : null,
                    });
                    return;
                }
                if (!next.available) {
                    setEmailAvailability({
                        status: 'taken',
                        message: emailReasonMessage((_c = next.reason) !== null && _c !== void 0 ? _c : 'taken', next.provider),
                        valid: true,
                        available: false,
                        provider: (_d = next.provider) !== null && _d !== void 0 ? _d : null,
                    });
                    return;
                }
                setEmailAvailability({
                    status: 'available',
                    message: t('Email is available.'),
                    valid: true,
                    available: true,
                    provider: null,
                });
            }
            catch (_e) {
                if (!cancelled) {
                    setEmailAvailability(neutralAvailabilityState());
                }
            }
        }), 350);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [accessToken, email, emailReasonMessage, step, t]);
    const handleContinue = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
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
            yield updateUserAccount({
                username,
                first_name: firstName,
                last_name: lastName,
                email,
                nationality,
                birthdate: birthDate,
            });
            navigation.navigate('CategorySelectionScreen');
        }
        catch (err) {
            if (err instanceof ApiError && err.status === 409) {
                const code = String((_b = (_a = err.body) === null || _a === void 0 ? void 0 : _a.error) !== null && _b !== void 0 ? _b : '');
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
        }
        finally {
            setIsLoading(false);
        }
    });
    const handleBack = useCallback(() => {
        var _a;
        if (step <= 1) {
            if ((_a = navigation.canGoBack) === null || _a === void 0 ? void 0 : _a.call(navigation)) {
                navigation.goBack();
            }
            else {
                navigation.navigate('LoginScreen');
            }
            return;
        }
        setStep((s) => Math.max(1, s - 1));
    }, [navigation, step]);
    useFocusEffect(useCallback(() => {
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
    }, [closeNationalityModal, handleBack, showBirthdateModal, showNationalityModal]));
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(KeyboardAvoidingContainer, Object.assign({ keyboardVerticalOffset: insets.top + 12 }, { children: [_jsx(SizeBox, { height: 30 }), _jsx(View, Object.assign({ style: Styles.imageContainer }, { children: _jsx(FastImage, { source: Images.signup2, style: Styles.headerImage, resizeMode: "contain" }) })), _jsx(SizeBox, { height: 30 }), _jsxs(View, Object.assign({ style: Styles.contentContainer }, { children: [_jsx(Text, Object.assign({ style: Styles.headingText }, { children: t('Complete your account') })), _jsx(SizeBox, { height: 8 }), _jsx(Text, Object.assign({ style: Styles.subHeadingText }, { children: t('Add your user details before creating profiles.') })), _jsx(SizeBox, { height: 8 }), _jsx(Text, Object.assign({ style: Styles.subHeadingText }, { children: getWizardStepLabel(step, 3, t) })), _jsx(SizeBox, { height: 24 }), step === 1 && (_jsxs(_Fragment, { children: [_jsx(Text, Object.assign({ style: Styles.label }, { children: t('First Name') })), _jsxs(View, Object.assign({ style: [
                                            Styles.inputContainer,
                                            Styles.nativeInputRow,
                                            { marginTop: 8 },
                                            showStep1Validation && firstName.trim().length === 0 ? { borderColor: colors.errorColor } : null,
                                        ] }, { children: [_jsx(Icons.User, { height: 16, width: 16 }), _jsx(SizeBox, { width: 10 }), _jsx(TextInput, { style: Styles.nativeInput, value: firstName, onChangeText: (value) => {
                                                    setFirstName(value);
                                                    if (showStep1Validation && value.trim().length > 0 && lastName.trim().length > 0) {
                                                        setShowStep1Validation(false);
                                                    }
                                                }, placeholder: t('Enter First Name'), placeholderTextColor: colors.grayColor, autoCapitalize: "words", autoCorrect: false, textContentType: "givenName", autoComplete: "name-given", returnKeyType: "next", blurOnSubmit: false, onSubmitEditing: () => { var _a; return (_a = lastNameRef.current) === null || _a === void 0 ? void 0 : _a.focus(); } })] })), _jsx(SizeBox, { height: 24 }), _jsx(Text, Object.assign({ style: Styles.label }, { children: t('Last Name') })), _jsxs(View, Object.assign({ style: [
                                            Styles.inputContainer,
                                            Styles.nativeInputRow,
                                            { marginTop: 8 },
                                            showStep1Validation && lastName.trim().length === 0 ? { borderColor: colors.errorColor } : null,
                                        ] }, { children: [_jsx(Icons.User, { height: 16, width: 16 }), _jsx(SizeBox, { width: 10 }), _jsx(TextInput, { ref: lastNameRef, style: Styles.nativeInput, value: lastName, onChangeText: (value) => {
                                                    setLastName(value);
                                                    if (showStep1Validation && firstName.trim().length > 0 && value.trim().length > 0) {
                                                        setShowStep1Validation(false);
                                                    }
                                                }, placeholder: t('Enter Last Name'), placeholderTextColor: colors.grayColor, autoCapitalize: "words", autoCorrect: false, textContentType: "familyName", autoComplete: "name-family", returnKeyType: "next", blurOnSubmit: false, onSubmitEditing: () => setStep(2) })] }))] })), step === 2 && (_jsxs(_Fragment, { children: [_jsx(Text, Object.assign({ style: Styles.label }, { children: t('Username') })), _jsxs(View, Object.assign({ style: [
                                            Styles.inputContainer,
                                            Styles.nativeInputRow,
                                            { marginTop: 8 },
                                            (showStep2Validation && username.trim().length === 0) ||
                                                usernameAvailability.status === 'invalid' ||
                                                usernameAvailability.status === 'taken'
                                                ? { borderColor: colors.errorColor }
                                                : null,
                                        ] }, { children: [_jsx(Icons.User, { height: 16, width: 16 }), _jsx(SizeBox, { width: 10 }), _jsx(TextInput, { ref: usernameRef, style: Styles.nativeInput, value: username, onChangeText: (value) => {
                                                    setUsername(value);
                                                    if (showStep2Validation && value.trim().length > 0 && email.trim().length > 0) {
                                                        setShowStep2Validation(false);
                                                    }
                                                }, placeholder: t('Enter Username'), placeholderTextColor: colors.grayColor, autoCapitalize: "none", autoCorrect: false, textContentType: "username", autoComplete: "username", returnKeyType: "next", blurOnSubmit: false, onSubmitEditing: () => { var _a; return (_a = emailRef.current) === null || _a === void 0 ? void 0 : _a.focus(); } })] })), usernameAvailability.status !== 'idle' ? (_jsx(Text, Object.assign({ style: [
                                            Styles.helperText,
                                            usernameAvailability.status === 'available'
                                                ? { color: colors.greenColor }
                                                : usernameAvailability.status === 'checking'
                                                    ? { color: colors.grayColor }
                                                    : { color: colors.errorColor },
                                        ] }, { children: usernameAvailability.message }))) : null, _jsx(SizeBox, { height: 24 }), _jsx(Text, Object.assign({ style: Styles.label }, { children: t('Email') })), _jsxs(View, Object.assign({ style: [
                                            Styles.inputContainer,
                                            Styles.nativeInputRow,
                                            { marginTop: 8 },
                                            (showStep2Validation && email.trim().length === 0) ||
                                                emailAvailability.status === 'invalid' ||
                                                emailAvailability.status === 'taken'
                                                ? { borderColor: colors.errorColor }
                                                : null,
                                        ] }, { children: [_jsx(Icons.User, { height: 16, width: 16 }), _jsx(SizeBox, { width: 10 }), _jsx(TextInput, { ref: emailRef, style: Styles.nativeInput, value: email, onChangeText: (value) => {
                                                    setEmail(value);
                                                    if (showStep2Validation && username.trim().length > 0 && value.trim().length > 0) {
                                                        setShowStep2Validation(false);
                                                    }
                                                }, placeholder: t('Enter Email'), placeholderTextColor: colors.grayColor, autoCapitalize: "none", autoCorrect: false, textContentType: "emailAddress", autoComplete: "email", keyboardType: "email-address", returnKeyType: "done" })] })), emailAvailability.status !== 'idle' ? (_jsx(Text, Object.assign({ style: [
                                            Styles.helperText,
                                            emailAvailability.status === 'available'
                                                ? { color: colors.greenColor }
                                                : emailAvailability.status === 'checking'
                                                    ? { color: colors.grayColor }
                                                    : { color: colors.errorColor },
                                        ] }, { children: emailAvailability.message }))) : null] })), step === 3 && (_jsxs(_Fragment, { children: [_jsx(Text, Object.assign({ style: Styles.label }, { children: t('Nationality') })), _jsxs(TouchableOpacity, Object.assign({ style: [
                                            Styles.inputContainer,
                                            { marginTop: 8 },
                                            showStep3Validation && nationality.trim().length === 0
                                                ? { borderColor: colors.errorColor }
                                                : null,
                                        ], onPress: openNationalityModal, activeOpacity: 0.8 }, { children: [_jsx(Card, { size: 16, color: colors.primaryColor, variant: "Linear" }), _jsx(SizeBox, { width: 10 }), _jsx(Text, Object.assign({ style: { flex: 1, color: nationality ? colors.mainTextColor : colors.grayColor, fontSize: 14 } }, { children: nationality || t('Select nationality') })), _jsx(ArrowDown2, { size: 18, color: colors.grayColor, variant: "Linear" })] })), _jsx(SizeBox, { height: 24 }), _jsx(Text, Object.assign({ style: Styles.label }, { children: t('Your Birth Date') })), _jsxs(TouchableOpacity, Object.assign({ style: [
                                            Styles.dateButton,
                                            { marginTop: 8 },
                                            showStep3Validation && birthDate.trim().length === 0
                                                ? { borderColor: colors.errorColor }
                                                : null,
                                        ], onPress: openBirthdateModal, activeOpacity: 0.8 }, { children: [_jsx(CalendarIcon, { size: 16, color: colors.primaryColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: [Styles.dateText, { flex: 1, color: birthDate ? colors.mainTextColor : colors.grayColor }] }, { children: birthDate ? formatDateDisplay(birthDate) : t('Select date of birth') }))] }))] })), _jsx(SizeBox, { height: 40 }), (isLoading || isBootstrapping) ? (_jsx(ActivityIndicator, { size: "large", color: colors.primaryColor })) : (_jsxs(_Fragment, { children: [_jsx(CustomButton, { title: t('Back'), onPress: handleBack, isBack: true }), _jsx(SizeBox, { height: 12 }), _jsx(CustomButton, { title: step < 3 ? t('Continue') : t('Save and continue'), onPress: handleContinue })] }))] })), _jsx(SizeBox, { height: 40 })] })), _jsx(Modal, Object.assign({ visible: showNationalityModal, transparent: true, animationType: "fade", onRequestClose: closeNationalityModal }, { children: _jsx(Pressable, Object.assign({ style: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 20 }, onPress: closeNationalityModal }, { children: _jsxs(Pressable, Object.assign({ style: { maxHeight: '70%', borderRadius: 16, backgroundColor: colors.modalBackground, borderWidth: 0.5, borderColor: colors.lightGrayColor, padding: 16 }, onPress: () => { } }, { children: [_jsx(Text, Object.assign({ style: { color: colors.mainTextColor, fontSize: 18, fontWeight: '700' } }, { children: t('Select nationality') })), _jsx(SizeBox, { height: 12 }), _jsx(TextInput, { value: nationalitySearch, onChangeText: setNationalitySearch, placeholder: t('Search nationality'), placeholderTextColor: colors.grayColor, autoCapitalize: "none", autoCorrect: false, style: {
                                    minHeight: 44,
                                    borderRadius: 10,
                                    borderWidth: 1,
                                    borderColor: colors.lightGrayColor,
                                    backgroundColor: colors.backgroundColor,
                                    color: colors.mainTextColor,
                                    paddingHorizontal: 12,
                                    marginBottom: 12,
                                } }), _jsx(ScrollView, Object.assign({ showsVerticalScrollIndicator: false }, { children: filteredNationalityOptions.length === 0 ? (_jsx(Text, Object.assign({ style: { color: colors.grayColor, fontSize: 14, paddingVertical: 8 } }, { children: t('No nationality found') }))) : (filteredNationalityOptions.map((option) => (_jsx(TouchableOpacity, Object.assign({ style: { paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: colors.lightGrayColor }, onPress: () => {
                                        setNationality(option);
                                        if (showStep3Validation && option.trim().length > 0 && birthDate.trim().length > 0) {
                                            setShowStep3Validation(false);
                                        }
                                        closeNationalityModal();
                                    } }, { children: _jsx(Text, Object.assign({ style: { color: colors.mainTextColor, fontSize: 16 } }, { children: option })) }), option)))) }))] })) })) })), _jsx(DatePickerModal, { visible: showBirthdateModal, value: birthDate || null, title: t('Select date of birth'), onClose: () => setShowBirthdateModal(false), onApply: (value) => {
                    setBirthDate(value || '');
                    if (showStep3Validation && nationality.trim().length > 0 && String(value || '').trim().length > 0) {
                        setShowStep3Validation(false);
                    }
                    setShowBirthdateModal(false);
                } })] })));
};
export default CreateProfileScreen;
