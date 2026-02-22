import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import React, { useMemo, useState } from 'react';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Images from '../../constants/Images';
import { createStyles } from './CompleteAthleteDetailsStyles';
import { ArrowLeft2, ArrowRight, User, Global, Building } from 'iconsax-react-nativejs';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { updateProfileSummary } from '../../services/apiGateway';

const CompleteAthleteDetailsScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    const { userProfile, updateUserProfile, apiAccessToken } = useAuth();
    const [chestNumber, setChestNumber] = useState('');
    const [website, setWebsite] = useState('');
    const [runningClub, setRunningClub] = useState('');
    const [trackMainEvent, setTrackMainEvent] = useState('');
    const [roadMainEvent, setRoadMainEvent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const selectedEvents = useMemo(() => {
        const raw = route?.params?.selectedEvents ?? userProfile?.selectedEvents ?? [];
        const arr = Array.isArray(raw) ? raw : [];
        return arr.map((entry) => String(entry || '').trim().toLowerCase()).filter(Boolean);
    }, [route?.params?.selectedEvents, userProfile?.selectedEvents]);
    const hasTrackFocus = selectedEvents.some((entry) => entry.includes('track'));
    const hasRoadFocus = selectedEvents.some((entry) => entry.includes('road') || entry.includes('trail'));

    const onSave = async () => {
        setIsSaving(true);
        try {
            const trimmedChest = String(chestNumber || '').trim();
            const currentYear = String(new Date().getFullYear());
            const chestNumbersByYear =
                hasTrackFocus && trimmedChest.length > 0
                    ? { [currentYear]: trimmedChest }
                    : {};
            await updateUserProfile({
                website: String(website || '').trim(),
                chestNumbersByYear,
                trackFieldClub: String(runningClub || '').trim(),
                runningClub: String(runningClub || '').trim(),
                trackFieldMainEvent: String(trackMainEvent || '').trim(),
                roadTrailMainEvent: String(roadMainEvent || '').trim(),
            } as any);
            if (apiAccessToken) {
                await updateProfileSummary(apiAccessToken, {
                    chest_numbers_by_year: Object.entries(chestNumbersByYear).reduce((acc, [year, chest]) => {
                        const parsed = Number(chest);
                        if (/^\d{4}$/.test(String(year)) && Number.isInteger(parsed) && parsed >= 0) {
                            acc[String(year)] = parsed;
                        }
                        return acc;
                    }, {} as Record<string, number>),
                    track_field_club: String(runningClub || '').trim() || null,
                    track_field_main_event: String(trackMainEvent || '').trim() || null,
                    road_trail_main_event: String(roadMainEvent || '').trim() || null,
                });
            }
            navigation.goBack();
        } catch (e: any) {
            Alert.alert(t('Error'), String(e?.message ?? e));
        } finally {
            setIsSaving(false);
        }
    };

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
                    {hasTrackFocus ? (
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
                    ) : null}

                    {/* Website */}
                    <View style={Styles.inputGroup}>
                        <Text style={Styles.inputLabel}>{t('Website')}</Text>
                        <View style={Styles.inputContainer}>
                            <Global size={24} color={colors.primaryColor} variant="Linear" />
                            <TextInput
                                style={Styles.textInput}
                                placeholder={t('Enter website link (optional)')}
                                placeholderTextColor={colors.grayColor}
                                value={website}
                                onChangeText={setWebsite}
                                keyboardType="url"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    {hasTrackFocus ? (
                        <View style={Styles.inputGroup}>
                            <Text style={Styles.inputLabel}>{t('Track&Field main event')}</Text>
                            <View style={Styles.inputContainer}>
                                <User size={24} color={colors.primaryColor} variant="Linear" />
                                <TextInput
                                    style={Styles.textInput}
                                    placeholder={t('e.g. 800m')}
                                    placeholderTextColor={colors.grayColor}
                                    value={trackMainEvent}
                                    onChangeText={setTrackMainEvent}
                                />
                            </View>
                        </View>
                    ) : null}

                    {hasRoadFocus ? (
                        <View style={Styles.inputGroup}>
                            <Text style={Styles.inputLabel}>{t('Road&Trail main event')}</Text>
                            <View style={Styles.inputContainer}>
                                <User size={24} color={colors.primaryColor} variant="Linear" />
                                <TextInput
                                    style={Styles.textInput}
                                    placeholder={t('e.g. 5K')}
                                    placeholderTextColor={colors.grayColor}
                                    value={roadMainEvent}
                                    onChangeText={setRoadMainEvent}
                                />
                            </View>
                        </View>
                    ) : null}

                    {/* Club */}
                    <View style={Styles.inputGroup}>
                        <Text style={Styles.inputLabel}>{t('Running club')}</Text>
                        <View style={Styles.inputContainer}>
                            <Building size={24} color={colors.primaryColor} variant="Linear" />
                            <TextInput
                                style={Styles.textInput}
                                placeholder={t('Choose running club')}
                                placeholderTextColor={colors.grayColor}
                                value={runningClub}
                                onChangeText={setRunningClub}
                            />
                        </View>
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
                    onPress={onSave}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator size="small" color={colors.pureWhite} />
                    ) : (
                        <>
                            <Text style={Styles.nextButtonText}>{t('Save')}</Text>
                            <ArrowRight size={18} color={colors.pureWhite} variant="Linear" />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default CompleteAthleteDetailsScreen;
