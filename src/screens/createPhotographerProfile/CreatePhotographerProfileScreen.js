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
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Images from '../../constants/Images';
import { createStyles } from './CreatePhotographerProfileStyles';
import { ArrowRight, User, Global } from 'iconsax-react-nativejs';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const CreatePhotographerProfileScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { updateUserProfile } = useAuth();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const [photographerName, setPhotographerName] = useState('');
    const [website, setWebsite] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const handleContinue = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!photographerName) {
            Alert.alert(t('Error'), t('Please enter your photographer name'));
            return;
        }
        setIsLoading(true);
        try {
            yield updateUserProfile({
                photographerName,
                photographerWebsite: website,
            });
            navigation.reset({
                index: 0,
                routes: [{ name: 'BottomTabBar' }],
            });
        }
        catch (err) {
            Alert.alert(t('Error'), t('Failed to save profile. Please try again.'));
        }
        finally {
            setIsLoading(false);
        }
    });
    return (_jsxs(View, Object.assign({ style: styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, contentContainerStyle: styles.scrollContent }, { children: [_jsx(View, Object.assign({ style: styles.illustrationContainer }, { children: _jsx(FastImage, { source: Images.signup2, style: styles.illustration, resizeMode: "contain" }) })), _jsxs(View, Object.assign({ style: styles.titleSection }, { children: [_jsx(Text, Object.assign({ style: styles.title }, { children: t('Create Photographer Profile') })), _jsx(Text, Object.assign({ style: styles.subtitle }, { children: t('It only takes a minute to get started—join us now!') }))] })), _jsxs(View, Object.assign({ style: styles.formContainer }, { children: [_jsxs(View, Object.assign({ style: styles.inputGroup }, { children: [_jsx(Text, Object.assign({ style: styles.inputLabel }, { children: t('Photographer Name') })), _jsxs(View, Object.assign({ style: styles.inputContainer }, { children: [_jsx(User, { size: 24, color: colors.primaryColor, variant: "Linear" }), _jsx(TextInput, { style: styles.textInput, placeholder: t('Enter Photographer Name'), placeholderTextColor: colors.grayColor, value: photographerName, onChangeText: setPhotographerName })] }))] })), _jsxs(View, Object.assign({ style: styles.inputGroup }, { children: [_jsx(Text, Object.assign({ style: styles.inputLabel }, { children: t('Website') })), _jsxs(View, Object.assign({ style: styles.inputContainer }, { children: [_jsx(Global, { size: 24, color: colors.primaryColor, variant: "Linear" }), _jsx(TextInput, { style: styles.textInput, placeholder: t('Enter website link'), placeholderTextColor: colors.grayColor, value: website, onChangeText: setWebsite, keyboardType: "url", autoCapitalize: "none" })] }))] }))] })), _jsx(TouchableOpacity, Object.assign({ style: [styles.continueButton, isLoading && { opacity: 0.5 }], onPress: handleContinue, disabled: isLoading }, { children: isLoading ? (_jsx(ActivityIndicator, { size: "small", color: colors.pureWhite })) : (_jsxs(_Fragment, { children: [_jsx(Text, Object.assign({ style: styles.continueButtonText }, { children: t('Continue') })), _jsx(ArrowRight, { size: 18, color: colors.pureWhite, variant: "Linear" })] })) }))] })), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom : 20 })] })));
};
export default CreatePhotographerProfileScreen;
