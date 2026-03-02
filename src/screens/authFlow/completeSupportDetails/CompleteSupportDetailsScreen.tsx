import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyles } from '../completeAthleteDetails/CompleteAthleteDetailsScreenStyles';
import SizeBox from '../../../constants/SizeBox';
import Icons from '../../../constants/Icons';
import CustomTextInput from '../../../components/customTextInput/CustomTextInput';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Add, CloseCircle, SearchNormal1 } from 'iconsax-react-nativejs';
import { ProfileSearchResult, searchProfiles } from '../../../services/apiGateway';
import { getFilteredCityOptions } from '../../../constants/locationSuggestions';

const ROLES = ['Coach', 'Parent', 'Fysiotherapist', 'Fan'];

const CompleteSupportDetailsScreen = ({ navigation }: any) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const { updateUserProfile, apiAccessToken } = useAuth();

    const [supportRole, setSupportRole] = useState<string>('Coach');
    const [organization, setOrganization] = useState('');
    const [baseLocation, setBaseLocation] = useState('');
    const [isBaseLocationFocused, setIsBaseLocationFocused] = useState(false);
    const [athleteQuery, setAthleteQuery] = useState('');
    const [athleteResults, setAthleteResults] = useState<ProfileSearchResult[]>([]);
    const [isSearchingAthletes, setIsSearchingAthletes] = useState(false);
    const [selectedAthletes, setSelectedAthletes] = useState<Array<{
        key: string;
        profileId?: string;
        name: string;
        isCustom: boolean;
    }>>([]);
    const [isLoading, setIsLoading] = useState(false);
    const normalizedSelectedAthleteNames = useMemo(
        () => new Set(selectedAthletes.map((entry) => entry.name.trim().toLowerCase()).filter(Boolean)),
        [selectedAthletes],
    );
    const filteredCityOptions = useMemo(() => {
        return getFilteredCityOptions(baseLocation);
    }, [baseLocation]);
    const showCitySuggestions = isBaseLocationFocused && filteredCityOptions.length > 0;

    const localStyles = useMemo(() => StyleSheet.create({
        roleRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
        },
        roleButton: {
            borderWidth: 1,
            borderColor: colors.borderColor,
            backgroundColor: colors.secondaryColor,
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 10,
        },
        roleButtonSelected: {
            borderColor: colors.primaryColor,
            backgroundColor: colors.secondaryBlueColor,
        },
        roleButtonText: {
            color: colors.mainTextColor,
        },
        roleButtonTextSelected: {
            color: colors.primaryColor,
        },
        athleteInputRow: {
            minHeight: 54,
            borderWidth: 1,
            borderRadius: 10,
            borderColor: colors.borderColor,
            backgroundColor: colors.secondaryColor,
            color: colors.mainTextColor,
            paddingHorizontal: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
        },
        athleteInput: {
            flex: 1,
            color: colors.mainTextColor,
            paddingVertical: 12,
        },
        locationFieldWrap: {
            gap: 8,
        },
        locationInputRow: {
            minHeight: 54,
            borderWidth: 1,
            borderRadius: 10,
            borderColor: colors.borderColor,
            backgroundColor: colors.secondaryColor,
            paddingHorizontal: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
        },
        locationInputRowFocused: {
            borderColor: colors.primaryColor,
        },
        locationInput: {
            flex: 1,
            color: colors.mainTextColor,
            paddingVertical: 12,
        },
        locationResultsDropdown: {
            borderWidth: 0.5,
            borderColor: colors.lightGrayColor,
            borderRadius: 10,
            backgroundColor: colors.cardBackground,
            maxHeight: 210,
            overflow: 'hidden',
        },
        locationResultRow: {
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderBottomWidth: 0.5,
            borderBottomColor: colors.lightGrayColor,
        },
        locationResultRowLast: {
            borderBottomWidth: 0,
        },
        locationResultText: {
            color: colors.mainTextColor,
            fontSize: 14,
        },
        customActionButton: {
            alignSelf: 'flex-start',
            marginTop: 8,
            height: 34,
            borderRadius: 17,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderColor: colors.primaryColor,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: colors.secondaryBlueColor,
        },
        customActionButtonDisabled: {
            opacity: 0.45,
        },
        customActionText: {
            color: colors.primaryColor,
            fontWeight: '600',
            fontSize: 12,
        },
        resultsDropdown: {
            marginTop: 8,
            borderWidth: 0.5,
            borderColor: colors.lightGrayColor,
            borderRadius: 10,
            backgroundColor: colors.cardBackground,
            maxHeight: 190,
        },
        resultRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 12,
            paddingVertical: 11,
            borderBottomWidth: 0.5,
            borderBottomColor: colors.lightGrayColor,
        },
        resultRowLast: {
            borderBottomWidth: 0,
        },
        resultName: {
            color: colors.mainTextColor,
            flexShrink: 1,
            marginRight: 10,
        },
        resultMeta: {
            color: colors.grayColor,
            fontSize: 12,
            marginTop: 2,
        },
        chipsWrap: {
            marginTop: 10,
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
        },
        chip: {
            borderWidth: 1,
            borderColor: colors.primaryColor,
            backgroundColor: colors.secondaryBlueColor,
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 6,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            maxWidth: '100%',
        },
        chipText: {
            color: colors.primaryColor,
            fontSize: 12,
            fontWeight: '600',
        },
        selectedHint: {
            color: colors.grayColor,
            fontSize: 12,
            marginTop: 8,
        },
        headerContainer: {
            paddingHorizontal: 20,
        },
    }), [colors]);

    useEffect(() => {
        if (!apiAccessToken) return;
        const term = athleteQuery.trim();
        if (term.length < 2) {
            setAthleteResults([]);
            setIsSearchingAthletes(false);
            return;
        }

        let active = true;
        const handle = setTimeout(async () => {
            setIsSearchingAthletes(true);
            try {
                const res = await searchProfiles(apiAccessToken, { q: term, limit: 8 });
                if (!active) return;
                const list = Array.isArray(res?.profiles) ? res.profiles : [];
                const filtered = list.filter((profile) => {
                    const profileId = String(profile.profile_id || '').trim();
                    const name = String(profile.display_name || '').trim().toLowerCase();
                    if (!profileId || !name) return false;
                    if (normalizedSelectedAthleteNames.has(name)) return false;
                    return !selectedAthletes.some((entry) => entry.profileId && entry.profileId === profileId);
                });
                setAthleteResults(filtered);
            } catch {
                if (!active) return;
                setAthleteResults([]);
            } finally {
                if (active) setIsSearchingAthletes(false);
            }
        }, 260);

        return () => {
            active = false;
            clearTimeout(handle);
        };
    }, [apiAccessToken, athleteQuery, normalizedSelectedAthleteNames, selectedAthletes]);

    const addAthleteFromProfile = (profile: ProfileSearchResult) => {
        const profileId = String(profile.profile_id || '').trim();
        const name = String(profile.display_name || '').trim();
        if (!profileId || !name) return;
        const normalized = name.toLowerCase();
        if (normalizedSelectedAthleteNames.has(normalized)) return;
        setSelectedAthletes((prev) => [
            ...prev,
            { key: `db:${profileId}`, profileId, name, isCustom: false },
        ]);
        setAthleteQuery('');
        setAthleteResults([]);
    };

    const addCustomAthlete = () => {
        const name = athleteQuery.trim();
        if (name.length < 2) return;
        const normalized = name.toLowerCase();
        if (normalizedSelectedAthleteNames.has(normalized)) {
            setAthleteQuery('');
            return;
        }
        setSelectedAthletes((prev) => [
            ...prev,
            { key: `custom:${normalized}`, name, isCustom: true },
        ]);
        setAthleteQuery('');
        setAthleteResults([]);
    };

    const removeAthlete = (key: string) => {
        setSelectedAthletes((prev) => prev.filter((entry) => entry.key !== key));
    };

    const handleSelectCity = (cityLabel: string) => {
        setBaseLocation(cityLabel);
        setIsBaseLocationFocused(false);
    };

    const handleSkip = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'BottomTabBar' }],
        });
    };

    const handleFinish = async () => {
        setIsLoading(true);
        try {
            const linkedAthletes = selectedAthletes
                .map((entry) => entry.name.trim())
                .filter(Boolean);
            const linkedAthleteProfileIds = selectedAthletes
                .map((entry) => String(entry.profileId || '').trim())
                .filter(Boolean);
            await updateUserProfile({
                supportRole,
                supportOrganization: organization.trim(),
                supportBaseLocation: baseLocation.trim(),
                supportAthletes: linkedAthletes,
                supportAthleteProfileIds: linkedAthleteProfileIds,
            });
            navigation.reset({
                index: 0,
                routes: [{ name: 'BottomTabBar' }],
            });
        } catch (err: any) {
            Alert.alert(t('Error'), t('Failed to save details. Please try again.'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={[Styles.scrollContent, { paddingBottom: 16 }]}
            >
                <SizeBox height={14} />
                <View style={localStyles.headerContainer}>
                    <Text style={Styles.headingText}>{t('Complete Your Support Profile')}</Text>
                    <SizeBox height={8} />
                    <Text style={Styles.subHeadingText}>
                        {t('Choose your role and optional details')}
                    </Text>
                </View>

                <SizeBox height={18} />
                <View style={Styles.contentContainer}>
                    <View style={Styles.formContainer}>
                        <Text style={Styles.clubFieldLabel}>{t('Support role')}</Text>
                        <View style={localStyles.roleRow}>
                            {ROLES.map((role) => {
                                const selected = supportRole === role;
                                return (
                                    <TouchableOpacity
                                        key={role}
                                        onPress={() => setSupportRole(role)}
                                        style={[localStyles.roleButton, selected && localStyles.roleButtonSelected]}
                                    >
                                        <Text style={selected ? localStyles.roleButtonTextSelected : localStyles.roleButtonText}>
                                            {role}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <CustomTextInput
                            label={t('Organization / Club')}
                            placeholder={t('Optional')}
                            icon={<Icons.User height={16} width={16} />}
                            value={organization}
                            onChangeText={setOrganization}
                        />

                        <View style={localStyles.locationFieldWrap}>
                            <Text style={Styles.clubFieldLabel}>{t('Based in')}</Text>
                            <View
                                style={[
                                    localStyles.locationInputRow,
                                    isBaseLocationFocused && localStyles.locationInputRowFocused,
                                ]}
                            >
                                <Icons.Location height={16} width={16} />
                                <TextInput
                                    value={baseLocation}
                                    onChangeText={setBaseLocation}
                                    placeholder={t('Optional')}
                                    placeholderTextColor={colors.grayColor}
                                    style={localStyles.locationInput}
                                    autoCapitalize="words"
                                    onFocus={() => setIsBaseLocationFocused(true)}
                                    onBlur={() => {
                                        setTimeout(() => setIsBaseLocationFocused(false), 120);
                                    }}
                                />
                            </View>
                            {showCitySuggestions && (
                                <View style={localStyles.locationResultsDropdown}>
                                    {filteredCityOptions.map(({ label }, index) => (
                                        <TouchableOpacity
                                            key={label}
                                            style={[
                                                localStyles.locationResultRow,
                                                index === filteredCityOptions.length - 1 && localStyles.locationResultRowLast,
                                            ]}
                                            activeOpacity={0.85}
                                            onPress={() => handleSelectCity(label)}
                                        >
                                            <Text style={localStyles.locationResultText}>{label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        <Text style={Styles.clubFieldLabel}>{t('Athletes you coach/support')}</Text>
                        <Text style={localStyles.selectedHint}>
                            {t('Search athlete profiles and add them one by one.')}
                        </Text>
                        <View style={localStyles.athleteInputRow}>
                            <SearchNormal1 size={18} color={colors.primaryColor} />
                            <TextInput
                                value={athleteQuery}
                                onChangeText={setAthleteQuery}
                                placeholder={t('Search athlete name')}
                                placeholderTextColor={colors.grayColor}
                                style={localStyles.athleteInput}
                                autoCapitalize="words"
                            />
                        </View>
                        <TouchableOpacity
                            style={[
                                localStyles.customActionButton,
                                athleteQuery.trim().length < 2 && localStyles.customActionButtonDisabled,
                            ]}
                            onPress={addCustomAthlete}
                            disabled={athleteQuery.trim().length < 2}
                        >
                            <Add size={14} color={colors.primaryColor} />
                            <Text style={localStyles.customActionText}>{t('Add custom athlete')}</Text>
                        </TouchableOpacity>
                        {(athleteQuery.trim().length >= 2 || athleteResults.length > 0) && (
                            <View style={localStyles.resultsDropdown}>
                                {isSearchingAthletes ? (
                                    <View style={[localStyles.resultRow, localStyles.resultRowLast]}>
                                        <Text style={localStyles.resultName}>{t('Searching athletes...')}</Text>
                                        <ActivityIndicator size="small" color={colors.primaryColor} />
                                    </View>
                                ) : athleteResults.length > 0 ? (
                                    athleteResults.map((profile, index) => (
                                        <TouchableOpacity
                                            key={profile.profile_id}
                                            style={[localStyles.resultRow, index === athleteResults.length - 1 && localStyles.resultRowLast]}
                                            onPress={() => addAthleteFromProfile(profile)}
                                        >
                                            <View style={{ flex: 1 }}>
                                                <Text style={localStyles.resultName}>{String(profile.display_name || t('Unnamed athlete'))}</Text>
                                                <Text style={localStyles.resultMeta}>{t('Athlete profile')}</Text>
                                            </View>
                                            <Add size={16} color={colors.primaryColor} />
                                        </TouchableOpacity>
                                    ))
                                ) : (
                                    <View style={[localStyles.resultRow, localStyles.resultRowLast]}>
                                        <Text style={localStyles.resultName}>{t('No athletes found. Use custom add.')}</Text>
                                    </View>
                                )}
                            </View>
                        )}
                        {selectedAthletes.length > 0 && (
                            <View style={localStyles.chipsWrap}>
                                {selectedAthletes.map((entry) => (
                                    <TouchableOpacity key={entry.key} style={localStyles.chip} onPress={() => removeAthlete(entry.key)}>
                                        <Text style={localStyles.chipText} numberOfLines={1}>
                                            {entry.name}
                                        </Text>
                                        <CloseCircle size={14} color={colors.primaryColor} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                </View>
                <SizeBox height={20} />
            </ScrollView>

            <View style={[Styles.buttonContainer, {
                marginTop: 0,
                paddingTop: 12,
                paddingBottom: Math.max(insets.bottom, 14),
                backgroundColor: colors.backgroundColor,
            }]}>
                    <TouchableOpacity style={Styles.skipButton} activeOpacity={0.7} onPress={handleSkip}>
                        <Text style={Styles.skipButtonText}>{t('Skip')}</Text>
                        <Icons.RightBtnIconGrey height={18} width={18} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[Styles.finishButton, isLoading && { opacity: 0.5 }]}
                        activeOpacity={0.7}
                        onPress={handleFinish}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Text style={Styles.finishButtonText}>{t('Finish')}</Text>
                                <Icons.RightBtnIcon height={18} width={18} />
                            </>
                        )}
                    </TouchableOpacity>
                </View>
        </View>
    );
};

export default CompleteSupportDetailsScreen;
