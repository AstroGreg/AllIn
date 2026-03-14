var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gallery, Profile2User, User, ArrowLeft2, ArrowRight, TickCircle } from 'iconsax-react-nativejs';
import { createStyles } from './CategorySelectionScreenStyles';
import SizeBox from '../../constants/SizeBox';
import CustomButton from '../../components/customButton/CustomButton';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { getSportFocusDefinitions, normalizeSelectedEvents } from '../../utils/profileSelections';
const CategorySelectionScreen = ({ navigation, route }) => {
    var _a;
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const { userProfile } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState('find');
    const [isLoading, setIsLoading] = useState(false);
    const fromAddFlow = Boolean((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.fromAddFlow);
    const linkedFocuses = useMemo(() => { var _a; return normalizeSelectedEvents((_a = userProfile === null || userProfile === void 0 ? void 0 : userProfile.selectedEvents) !== null && _a !== void 0 ? _a : []); }, [userProfile === null || userProfile === void 0 ? void 0 : userProfile.selectedEvents]);
    const hasSupportProfile = useMemo(() => {
        var _a;
        return (String((_a = userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportRole) !== null && _a !== void 0 ? _a : '').trim().length > 0 ||
            (Array.isArray(userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportClubCodes) && userProfile.supportClubCodes.length > 0) ||
            (Array.isArray(userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportGroupIds) && userProfile.supportGroupIds.length > 0) ||
            (Array.isArray(userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportAthletes) && userProfile.supportAthletes.length > 0) ||
            (Array.isArray(userProfile === null || userProfile === void 0 ? void 0 : userProfile.supportFocuses) && userProfile.supportFocuses.length > 0) ||
            (userProfile === null || userProfile === void 0 ? void 0 : userProfile.category) === 'support');
    }, [userProfile]);
    const canAddAthleteProfile = useMemo(() => {
        return getSportFocusDefinitions().some((focus) => !linkedFocuses.includes(focus.id));
    }, [linkedFocuses]);
    const categories = useMemo(() => [
        {
            id: 'find',
            title: t('Athlete'),
            subtitle: t('Athlete profile'),
            description: t('Set up a personal profile to manage your sports focus, results, and media.'),
            icon: _jsx(Gallery, { size: 24, color: colors.grayColor }),
            iconSelected: _jsx(Gallery, { size: 24, color: colors.primaryColor }),
        },
        {
            id: 'manage',
            title: t('Manage a club/event'),
            subtitle: t('Club/Admin'),
            description: t('Set up a group profile to manage members, competitions, blogs, and collections.'),
            icon: _jsx(Profile2User, { size: 24, color: colors.grayColor }),
            iconSelected: _jsx(Profile2User, { size: 24, color: colors.primaryColor }),
        },
        {
            id: 'support',
            title: t('Coach / Parent / Physio / Fan'),
            subtitle: t('Support Profile'),
            description: t('Follow athletes, save collections, and add your support role without athlete-only setup.'),
            icon: _jsx(User, { size: 24, color: colors.grayColor }),
            iconSelected: _jsx(User, { size: 24, color: colors.primaryColor }),
        },
    ], [colors.grayColor, colors.primaryColor, t]);
    const visibleCategories = useMemo(() => {
        if (!fromAddFlow)
            return categories;
        return categories.filter((category) => {
            if (category.id === 'find')
                return canAddAthleteProfile;
            if (category.id === 'support')
                return !hasSupportProfile;
            return true;
        });
    }, [canAddAthleteProfile, categories, fromAddFlow, hasSupportProfile]);
    useEffect(() => {
        var _a;
        if (visibleCategories.some((category) => category.id === selectedCategory))
            return;
        const fallback = (_a = visibleCategories[0]) === null || _a === void 0 ? void 0 : _a.id;
        if (fallback === 'find' || fallback === 'manage' || fallback === 'support') {
            setSelectedCategory(fallback);
        }
    }, [selectedCategory, visibleCategories]);
    const nextStepLabel = selectedCategory === 'find'
        ? t('Next: Complete athlete profile')
        : selectedCategory === 'manage'
            ? t('Next: Complete group/admin profile')
            : t('Next: Complete support profile');
    const handleContinue = () => __awaiter(void 0, void 0, void 0, function* () {
        setIsLoading(true);
        navigation.navigate('SelectEventScreen', { selectedCategory, fromAddFlow });
        setIsLoading(false);
    });
    const handleGuestLogin = () => {
        navigation.navigate('BottomTabBar');
    };
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer, testID: "category-selection-screen" }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.contentShell }, { children: [fromAddFlow ? (_jsxs(_Fragment, { children: [_jsx(View, Object.assign({ style: { width: '100%', alignItems: 'flex-start' } }, { children: _jsx(TouchableOpacity, Object.assign({ activeOpacity: 0.8, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 22, color: colors.primaryColor }) })) })), _jsx(SizeBox, { height: 8 })] })) : null, _jsxs(View, Object.assign({ style: Styles.headerContainer }, { children: [_jsx(Text, Object.assign({ style: Styles.headingText }, { children: fromAddFlow ? t('What would you like to add?') : t('Do you want to set up your profile?') })), _jsx(Text, Object.assign({ style: Styles.subHeadingText }, { children: fromAddFlow ? t('Choose profile type to continue.') : t('Choose what you want to set up first.') }))] })), _jsx(View, Object.assign({ style: Styles.optionsSection }, { children: _jsx(ScrollView, Object.assign({ style: Styles.optionsScroll, contentContainerStyle: Styles.optionsContainer, showsVerticalScrollIndicator: false }, { children: visibleCategories.map((category) => {
                                const isSelected = selectedCategory === category.id;
                                return (_jsxs(TouchableOpacity, Object.assign({ testID: `category-option-${category.id}`, style: [
                                        Styles.optionCard,
                                        isSelected && Styles.optionCardSelected,
                                    ], activeOpacity: 0.7, onPress: () => setSelectedCategory(category.id) }, { children: [_jsxs(View, Object.assign({ style: Styles.optionContent }, { children: [_jsxs(View, Object.assign({ style: Styles.optionHeader }, { children: [_jsx(View, Object.assign({ style: [
                                                                Styles.iconContainer,
                                                                isSelected && Styles.iconContainerSelected,
                                                            ] }, { children: isSelected ? category.iconSelected : category.icon })), _jsxs(View, Object.assign({ style: Styles.optionTextContainer }, { children: [_jsx(Text, Object.assign({ style: Styles.optionTitle, numberOfLines: 1 }, { children: category.title })), _jsx(Text, Object.assign({ style: Styles.optionSubtitle }, { children: category.subtitle }))] }))] })), _jsx(Text, Object.assign({ style: Styles.optionDescription, numberOfLines: 2 }, { children: category.description }))] })), isSelected ? (_jsx(TickCircle, { size: 24, color: colors.greenColor, variant: "Bold" })) : (_jsx(View, Object.assign({ style: Styles.arrowContainer }, { children: _jsx(ArrowRight, { size: 20, color: colors.grayColor }) })))] }), category.id));
                            }) })) }))] })), _jsxs(View, Object.assign({ style: [Styles.buttonContainer, { paddingBottom: insets.bottom + 20 }] }, { children: [!fromAddFlow && _jsx(Text, Object.assign({ style: Styles.nextStepText }, { children: nextStepLabel })), !fromAddFlow && (_jsx(TouchableOpacity, Object.assign({ style: Styles.guestButton, activeOpacity: 0.7, onPress: handleGuestLogin }, { children: _jsx(Text, Object.assign({ style: Styles.guestButtonText }, { children: t('Continue as guest (set up later)') })) }))), isLoading ? (_jsx(ActivityIndicator, { size: "large", color: colors.primaryColor })) : (_jsx(CustomButton, { title: t('Continue'), onPress: handleContinue, testID: "category-continue-button" }))] }))] })));
};
export default CategorySelectionScreen;
