import React, { useMemo, useRef, useState } from 'react';
import {
    Animated,
    Image,
    Modal,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';
import { createStyles } from './SelectLanguageScreenStyles';
import SizeBox from '../../../constants/SizeBox';
import CustomButton from '../../../components/customButton/CustomButton';
import Images from '../../../constants/Images';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next'
import i18n from '../../../i18n';
import { getLanguageOptions, setAppLanguage } from '../../../i18n';

interface LanguageOption {
    id: string;
    name: string;
    flag: any;
}

const languageFlags: Record<string, any> = {
    en: Images.englishFlag,
    nl: Images.dutchFlag,
    fr: Images.franceFlag,
    de: Images.germanyFlag,
    es: Images.spanishFlag,
    it: Images.italianFlag,
    pt: Images.spanishFlag,
};

const SelectLanguageScreen = ({ navigation }: any) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const [selectedLanguage, setSelectedLanguage] = useState(i18n.language ?? 'en');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [dropdownAnchor, setDropdownAnchor] = useState<{
        x: number;
        y: number;
        width: number;
        height: number;
    } | null>(null);
    const dropdownAnim = useRef(new Animated.Value(0)).current;
    const dropdownTriggerRef = useRef<any>(null);
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();

    const languages: LanguageOption[] = useMemo(
        () =>
            getLanguageOptions().map((lang) => ({
                id: lang.code,
                name: lang.label,
                flag: languageFlags[lang.code] ?? Images.englishFlag,
            })),
        [],
    );

    const handleSelectLanguage = async (languageId: string) => {
        setSelectedLanguage(languageId);
        closeDropdown();
        await setAppLanguage(languageId);
    };

    const handleContinue = () => {
        navigation.navigate('LanguageScreen');
    };

    const renderRadioButton = (isSelected: boolean) => (
        <View style={[Styles.radioOuter, isSelected && Styles.radioOuterSelected]}>
            {isSelected && <View style={Styles.radioInner} />}
        </View>
    );

    const openDropdown = () => {
        const triggerNode = dropdownTriggerRef.current;
        if (triggerNode?.measureInWindow) {
            triggerNode.measureInWindow((x: number, y: number, width: number, height: number) => {
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

    const selectedLanguageOption = languages.find((l) => l.id === selectedLanguage) ?? languages[0];
    const estimatedMenuHeight = Math.min(languages.length * 54 + 16, 320);
    const anchor = dropdownAnchor ?? { x: 20, y: 180, width: windowWidth - 40, height: 60 };
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

    return (
        <View style={Styles.mainContainer}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={Styles.contentContainer}
            >
                <View style={Styles.headerContainer}>
                    <Text style={Styles.headingText}>{t('chooseLanguage')}</Text>
                    <SizeBox height={10} />
                    <Text style={Styles.subHeadingText}>
                        {t('Please choose your preferred language to continue.')}
                    </Text>
                </View>

                <SizeBox height={24} />

                <View style={Styles.languageListContainer}>
                    <Text style={Styles.preferenceSectionTitle}>{t('language')}</Text>
                    <SizeBox height={12} />
                    <View ref={dropdownTriggerRef} collapsable={false}>
                        <TouchableOpacity
                            style={Styles.dropdownTrigger}
                            activeOpacity={0.8}
                            onPress={() => (isDropdownOpen ? closeDropdown() : openDropdown())}
                        >
                            <View style={Styles.dropdownSelectedContent}>
                                <View style={Styles.flagContainerSmall}>
                                    <Image
                                        source={selectedLanguageOption?.flag ?? Images.englishFlag}
                                        style={Styles.flagImage}
                                    />
                                </View>
                                <Text style={Styles.dropdownSelectedText}>
                                    {selectedLanguageOption?.name ?? 'English'}
                                </Text>
                            </View>
                            <Text style={Styles.dropdownChevron}>{isDropdownOpen ? '▴' : '▾'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <SizeBox height={30} />

                <CustomButton title={t('continue')} onPress={handleContinue} />
            </ScrollView>

            <Modal
                transparent
                visible={isDropdownOpen}
                animationType="none"
                onRequestClose={closeDropdown}
            >
                <Pressable style={Styles.dropdownBackdrop} onPress={closeDropdown} />
                <Animated.View
                    style={[
                        Styles.dropdownMenuFloating,
                        {
                            top: menuTop,
                            left: menuLeft,
                            width: menuWidth,
                            opacity: dropdownAnim,
                            transform: [{ translateY: dropdownTranslateY }],
                        },
                    ]}
                >
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                        nestedScrollEnabled
                        style={Styles.dropdownMenuScroll}
                    >
                        {languages.map((language, index) => (
                            <TouchableOpacity
                                key={language.id}
                                style={[
                                    Styles.dropdownItem,
                                    selectedLanguage === language.id && Styles.dropdownItemSelected,
                                    index === languages.length - 1 && Styles.dropdownItemLast,
                                ]}
                                activeOpacity={0.7}
                                onPress={() => {
                                    handleSelectLanguage(language.id);
                                }}
                            >
                                <View style={Styles.languageInfo}>
                                    <View style={Styles.flagContainerSmall}>
                                        <Image source={language.flag} style={Styles.flagImage} />
                                    </View>
                                    <Text
                                        style={[
                                            Styles.dropdownItemText,
                                            selectedLanguage !== language.id && Styles.languageNameUnselected,
                                        ]}
                                    >
                                        {language.name}
                                    </Text>
                                </View>
                                {renderRadioButton(selectedLanguage === language.id)}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </Animated.View>
            </Modal>
        </View>
    );
};

export default SelectLanguageScreen;
