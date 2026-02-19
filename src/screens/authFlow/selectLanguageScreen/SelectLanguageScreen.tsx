import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
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
        await setAppLanguage(languageId);
    };

    const handleContinue = () => {
        navigation.navigate('LoginScreen');
    };

    const renderRadioButton = (isSelected: boolean) => (
        <View style={[Styles.radioOuter, isSelected && Styles.radioOuterSelected]}>
            {isSelected && <View style={Styles.radioInner} />}
        </View>
    );

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
                    {languages.map((language) => (
                        <React.Fragment key={language.id}>
                            <TouchableOpacity
                                style={Styles.languageItem}
                                activeOpacity={0.7}
                                onPress={() => {
                                    handleSelectLanguage(language.id);
                                }}
                            >
                                <View style={Styles.languageInfo}>
                                    <View style={Styles.flagContainer}>
                                        <Image source={language.flag} style={Styles.flagImage} />
                                    </View>
                                    <Text
                                        style={[
                                            Styles.languageName,
                                            selectedLanguage !== language.id && Styles.languageNameUnselected,
                                        ]}
                                    >
                                        {language.name}
                                    </Text>
                                </View>
                                {renderRadioButton(selectedLanguage === language.id)}
                            </TouchableOpacity>
                            {language.id !== languages[languages.length - 1].id && (
                                <SizeBox height={24} />
                            )}
                        </React.Fragment>
                    ))}
                </View>

                <SizeBox height={30} />

                <CustomButton title={t('continue')} onPress={handleContinue} />
            </ScrollView>
        </View>
    );
};

export default SelectLanguageScreen;
