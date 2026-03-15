var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { createStyles } from '../ViewUserProfileStyles';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomButton from '../../../components/customButton/CustomButton';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { getProfileSummary, updateProfileSummary } from '../../../services/apiGateway';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
import { useTranslation } from 'react-i18next';
const EditBioScreens = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const { apiAccessToken, updateUserProfile, userProfile } = useAuth();
    const [bio, setBio] = useState('');
    const bioRef = useRef('');
    const [hasEditedBio, setHasEditedBio] = useState(false);
    useEffect(() => {
        let mounted = true;
        const load = () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            if (!apiAccessToken) {
                if (mounted) {
                    const nextBio = String((_a = userProfile === null || userProfile === void 0 ? void 0 : userProfile.bio) !== null && _a !== void 0 ? _a : '');
                    bioRef.current = nextBio;
                    setBio(nextBio);
                }
                return;
            }
            try {
                const summary = yield getProfileSummary(apiAccessToken);
                if (!mounted)
                    return;
                if (hasEditedBio)
                    return;
                if (((_b = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _b === void 0 ? void 0 : _b.bio) != null) {
                    const nextBio = String(summary.profile.bio || '');
                    bioRef.current = nextBio;
                    setBio(nextBio);
                }
            }
            catch (_c) {
                // ignore
            }
        });
        load();
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, hasEditedBio, userProfile === null || userProfile === void 0 ? void 0 : userProfile.bio]);
    const handleSave = () => __awaiter(void 0, void 0, void 0, function* () {
        const nextBio = bioRef.current;
        if (!apiAccessToken) {
            yield updateUserProfile({ bio: nextBio });
            navigation.goBack();
            return;
        }
        try {
            yield updateProfileSummary(apiAccessToken, { bio: nextBio });
            yield updateUserProfile({ bio: nextBio }, { persistLocally: false });
            navigation.goBack();
        }
        catch (_a) {
            // keep user on screen if save fails
        }
    });
    return (_jsxs(View, Object.assign({ style: styles.mainContainer, testID: "edit-bio-screen" }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: styles.headerTitle }, { children: t('Bio') })), _jsx(View, { style: { width: 44, height: 44 } })] })), _jsx(ScrollView, Object.assign({ showsVerticalScrollIndicator: false }, { children: _jsxs(View, Object.assign({ style: styles.container }, { children: [_jsx(SizeBox, { height: 42 }), _jsx(Text, Object.assign({ style: styles.titleText }, { children: t('Bio') })), _jsx(SizeBox, { height: 8 }), _jsx(View, Object.assign({ style: styles.bioContainer }, { children: _jsx(TextInput, { testID: "edit-bio-input", style: styles.textInput, placeholder: t('Write your bio...'), placeholderTextColor: colors.subTextColor, multiline: true, value: bio, onChangeText: (value) => {
                                    setHasEditedBio(true);
                                    bioRef.current = value;
                                    setBio(value);
                                } }) })), _jsx(SizeBox, { height: 16 }), _jsxs(View, Object.assign({ style: [styles.row, styles.spaceBetween, { flex: 1 }] }, { children: [_jsx(TouchableOpacity, Object.assign({ style: [styles.cancelBtn, { flex: 0.484 }], activeOpacity: 0.7, onPress: () => navigation.goBack() }, { children: _jsx(Text, Object.assign({ style: styles.eventBtnText }, { children: t('Cancel') })) })), _jsx(View, Object.assign({ style: { flex: 0.484 } }, { children: _jsx(CustomButton, { title: t('Save'), onPress: handleSave, isSmall: true, testID: "edit-bio-save" }) }))] })), _jsx(SizeBox, { height: 16 })] })) }))] })));
};
export default EditBioScreens;
