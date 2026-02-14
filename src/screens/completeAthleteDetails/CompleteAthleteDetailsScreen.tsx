import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import React, { useState } from 'react';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Images from '../../constants/Images';
import { createStyles } from './CompleteAthleteDetailsStyles';
import { ArrowLeft2, ArrowRight, User, Global, Building, ArrowDown2 } from 'iconsax-react-nativejs';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const CompleteAthleteDetailsScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    const [chestNumber, setChestNumber] = useState('');
    const [website, setWebsite] = useState('');
    const [runningClub, setRunningClub] = useState('');

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {/* Illustration */}
                <View style={Styles.illustrationContainer}>
                    <FastImage source={Images.signup4} style={Styles.illustration} resizeMode="contain" />
                </View>

                {/* Title Section */}
                <View style={Styles.titleSection}>
                    <Text style={Styles.title}>{t('Complete your athlete details')}</Text>
                    <Text style={Styles.subtitle}>{t('Add your information and club details')}</Text>
                </View>

                {/* Form Fields */}
                <View style={Styles.formContainer}>
                    {/* Chest Number */}
                    <View style={Styles.inputGroup}>
                        <Text style={Styles.inputLabel}>{t('Chest number')}</Text>
                        <View style={Styles.inputContainer}>
                            <User size={24} color={colors.primaryColor} variant="Linear" />
                            <TextInput
                                style={Styles.textInput}
                                placeholder={t('Enter chest number')}
                                placeholderTextColor={colors.grayColor}
                                value={chestNumber}
                                onChangeText={setChestNumber}
                            />
                        </View>
                    </View>

                    {/* Website */}
                    <View style={Styles.inputGroup}>
                        <Text style={Styles.inputLabel}>{t('Website')}</Text>
                        <View style={Styles.inputContainer}>
                            <Global size={24} color={colors.primaryColor} variant="Linear" />
                            <TextInput
                                style={Styles.textInput}
                                placeholder={t('Enter website link')}
                                placeholderTextColor={colors.grayColor}
                                value={website}
                                onChangeText={setWebsite}
                                keyboardType="url"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    {/* Running Club */}
                    <View style={Styles.inputGroup}>
                        <Text style={Styles.inputLabel}>{t('Running club')}</Text>
                        <TouchableOpacity style={Styles.inputContainer}>
                            <Building size={24} color={colors.primaryColor} variant="Linear" />
                            <Text style={[Styles.dropdownText, !runningClub && Styles.placeholderText]}>
                                {runningClub || t('Choose running club')}
                            </Text>
                            <ArrowDown2 size={24} color={colors.grayColor} variant="Linear" />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Buttons */}
            <View style={[Styles.bottomContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
                <TouchableOpacity
                    style={Styles.skipButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={Styles.skipButtonText}>{t('Skip')}</Text>
                    <ArrowRight size={18} color={colors.subTextColor} variant="Linear" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={Styles.nextButton}
                    onPress={() => {
                        // Handle next action - go back to events for now
                        navigation.navigate('EventsViewAllScreen');
                    }}
                >
                    <Text style={Styles.nextButtonText}>{t('Next')}</Text>
                    <ArrowRight size={18} color={colors.pureWhite} variant="Linear" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default CompleteAthleteDetailsScreen;
