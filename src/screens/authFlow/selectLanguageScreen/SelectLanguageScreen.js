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
import { useMemo, useRef, useState } from 'react';
import { Animated, Image, Modal, Pressable, ScrollView, Text, TouchableOpacity, View, useWindowDimensions, } from 'react-native';
import { createStyles } from './SelectLanguageScreenStyles';
import SizeBox from '../../../constants/SizeBox';
import CustomButton from '../../../components/customButton/CustomButton';
import Images from '../../../constants/Images';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { getLanguageOptions, setAppLanguage } from '../../../i18n';
const languageFlags = {
    en: Images.englishFlag,
    nl: Images.dutchFlag,
    fr: Images.franceFlag,
    de: Images.germanyFlag,
    es: Images.spanishFlag,
    it: Images.italianFlag,
    pt: Images.spanishFlag,
};
const SelectLanguageScreen = ({ navigation }) => {
    var _a, _b, _c, _d;
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const [selectedLanguage, setSelectedLanguage] = useState((_a = i18n.language) !== null && _a !== void 0 ? _a : 'en');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [dropdownAnchor, setDropdownAnchor] = useState(null);
    const dropdownAnim = useRef(new Animated.Value(0)).current;
    const dropdownTriggerRef = useRef(null);
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const languages = useMemo(() => getLanguageOptions().map((lang) => {
        var _a;
        return ({
            id: lang.code,
            name: lang.label,
            flag: (_a = languageFlags[lang.code]) !== null && _a !== void 0 ? _a : Images.englishFlag,
        });
    }), []);
    const handleSelectLanguage = (languageId) => __awaiter(void 0, void 0, void 0, function* () {
        setSelectedLanguage(languageId);
        closeDropdown();
        yield setAppLanguage(languageId);
    });
    const handleContinue = () => {
        navigation.navigate('LanguageScreen');
    };
    const renderRadioButton = (isSelected) => (_jsx(View, Object.assign({ style: [Styles.radioOuter, isSelected && Styles.radioOuterSelected] }, { children: isSelected && _jsx(View, { style: Styles.radioInner }) })));
    const openDropdown = () => {
        const triggerNode = dropdownTriggerRef.current;
        if (triggerNode === null || triggerNode === void 0 ? void 0 : triggerNode.measureInWindow) {
            triggerNode.measureInWindow((x, y, width, height) => {
                setDropdownAnchor({ x, y, width, height });
                dropdownAnim.stopAnimation();
                dropdownAnim.setValue(0);
                setIsDropdownOpen(true);
                Animated.timing(dropdownAnim, {
                    toValue: 1,
                    duration: 160,
                    useNativeDriver: true,
                }).start();
            });
            return;
        }
        dropdownAnim.stopAnimation();
        dropdownAnim.setValue(0);
        setIsDropdownOpen(true);
        Animated.timing(dropdownAnim, {
            toValue: 1,
            duration: 160,
            useNativeDriver: true,
        }).start();
    };
    const closeDropdown = () => {
        dropdownAnim.stopAnimation();
        Animated.timing(dropdownAnim, {
            toValue: 0,
            duration: 120,
            useNativeDriver: true,
        }).start(() => {
            setIsDropdownOpen(false);
        });
    };
    const selectedLanguageOption = (_b = languages.find((l) => l.id === selectedLanguage)) !== null && _b !== void 0 ? _b : languages[0];
    const estimatedMenuHeight = Math.min(languages.length * 54 + 16, 320);
    const anchor = dropdownAnchor !== null && dropdownAnchor !== void 0 ? dropdownAnchor : { x: 20, y: 180, width: windowWidth - 40, height: 60 };
    const menuWidth = Math.min(anchor.width, Math.max(220, windowWidth - 32));
    const menuLeft = Math.max(16, Math.min(anchor.x, windowWidth - menuWidth - 16));
    const canOpenBelow = anchor.y + anchor.height + 8 + estimatedMenuHeight <= windowHeight - 16;
    const menuTop = canOpenBelow
        ? anchor.y + anchor.height + 8
        : Math.max(16, anchor.y - estimatedMenuHeight - 8);
    const dropdownTranslateY = dropdownAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [canOpenBelow ? 8 : -8, 0],
    });
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, contentContainerStyle: Styles.contentContainer }, { children: [_jsxs(View, Object.assign({ style: Styles.headerContainer }, { children: [_jsx(Text, Object.assign({ style: Styles.headingText }, { children: t('chooseLanguage') })), _jsx(SizeBox, { height: 10 }), _jsx(Text, Object.assign({ style: Styles.subHeadingText }, { children: t('Please choose your preferred language to continue.') }))] })), _jsx(SizeBox, { height: 24 }), _jsxs(View, Object.assign({ style: Styles.languageListContainer }, { children: [_jsx(Text, Object.assign({ style: Styles.preferenceSectionTitle }, { children: t('language') })), _jsx(SizeBox, { height: 12 }), _jsx(View, Object.assign({ ref: dropdownTriggerRef, collapsable: false }, { children: _jsxs(TouchableOpacity, Object.assign({ style: Styles.dropdownTrigger, activeOpacity: 0.8, onPress: () => (isDropdownOpen ? closeDropdown() : openDropdown()) }, { children: [_jsxs(View, Object.assign({ style: Styles.dropdownSelectedContent }, { children: [_jsx(View, Object.assign({ style: Styles.flagContainerSmall }, { children: _jsx(Image, { source: (_c = selectedLanguageOption === null || selectedLanguageOption === void 0 ? void 0 : selectedLanguageOption.flag) !== null && _c !== void 0 ? _c : Images.englishFlag, style: Styles.flagImage }) })), _jsx(Text, Object.assign({ style: Styles.dropdownSelectedText }, { children: (_d = selectedLanguageOption === null || selectedLanguageOption === void 0 ? void 0 : selectedLanguageOption.name) !== null && _d !== void 0 ? _d : 'English' }))] })), _jsx(Text, Object.assign({ style: Styles.dropdownChevron }, { children: isDropdownOpen ? '▴' : '▾' }))] })) }))] })), _jsx(SizeBox, { height: 30 }), _jsx(CustomButton, { title: t('continue'), onPress: handleContinue })] })), _jsxs(Modal, Object.assign({ transparent: true, visible: isDropdownOpen, animationType: "none", onRequestClose: closeDropdown }, { children: [_jsx(Pressable, { style: Styles.dropdownBackdrop, onPress: closeDropdown }), _jsx(Animated.View, Object.assign({ style: [
                            Styles.dropdownMenuFloating,
                            {
                                top: menuTop,
                                left: menuLeft,
                                width: menuWidth,
                                opacity: dropdownAnim,
                                transform: [{ translateY: dropdownTranslateY }],
                            },
                        ] }, { children: _jsx(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, bounces: false, nestedScrollEnabled: true, style: Styles.dropdownMenuScroll }, { children: languages.map((language, index) => (_jsxs(TouchableOpacity, Object.assign({ style: [
                                    Styles.dropdownItem,
                                    selectedLanguage === language.id && Styles.dropdownItemSelected,
                                    index === languages.length - 1 && Styles.dropdownItemLast,
                                ], activeOpacity: 0.7, onPress: () => {
                                    handleSelectLanguage(language.id);
                                } }, { children: [_jsxs(View, Object.assign({ style: Styles.languageInfo }, { children: [_jsx(View, Object.assign({ style: Styles.flagContainerSmall }, { children: _jsx(Image, { source: language.flag, style: Styles.flagImage }) })), _jsx(Text, Object.assign({ style: [
                                                    Styles.dropdownItemText,
                                                    selectedLanguage !== language.id && Styles.languageNameUnselected,
                                                ] }, { children: language.name }))] })), renderRadioButton(selectedLanguage === language.id)] }), language.id))) })) }))] }))] })));
};
export default SelectLanguageScreen;
