import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { createStyles } from './SelectLanguageScreenStyles';
import SizeBox from '../../../constants/SizeBox';
import CustomButton from '../../../components/customButton/CustomButton';
import Images from '../../../constants/Images';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next'

interface LanguageOption {
    id: string;
    name: string;
    flag: any;
}

const languages: LanguageOption[] = [
    { id: 'en', name: 'English', flag: Images.englishFlag },
    { id: 'nl', name: 'Dutch', flag: Images.dutchFlag },
    { id: 'fr', name: 'French', flag: Images.franceFlag },
    { id: 'de', name: 'German', flag: Images.germanyFlag },
    { id: 'es', name: 'Spanish', flag: Images.spanishFlag },
    { id: 'it', name: 'Italian', flag: Images.italianFlag },
];

const SelectLanguageScreen = ({ navigation }: any) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const [selectedLanguage, setSelectedLanguage] = useState('en');

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
                    <Text style={Styles.headingText}>{t('Select Your Language')}</Text>
                    <SizeBox height={10} />
                    <Text style={Styles.subHeadingText}>
                        Please choose your preferred language{'\n'}to continue.
                    </Text>
                </View>

                <SizeBox height={24} />

                <View style={Styles.languageListContainer}>
                    {languages.map((language) => (
                        <React.Fragment key={language.id}>
                            <TouchableOpacity
                                style={Styles.languageItem}
                                activeOpacity={0.7}
                                onPress={() => setSelectedLanguage(language.id)}
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

                <CustomButton title={t('Continue')} onPress={handleContinue} />
            </ScrollView>
        </View>
    );
};

export default SelectLanguageScreen;