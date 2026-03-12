import React, { useEffect, useMemo, useState } from 'react';
import { CommonActions } from '@react-navigation/native';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Add, ArrowLeft2, CloseCircle, SearchNormal1 } from 'iconsax-react-nativejs';

import { createStyles } from '../completeAthleteDetails/CompleteAthleteDetailsScreenStyles';
import SearchPickerModal, { type SearchPickerOption } from '../../../components/profile/SearchPickerModal';
import SizeBox from '../../../constants/SizeBox';
import Icons from '../../../constants/Icons';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
    searchClubs,
    searchGroups,
    searchProfiles,
    type ClubSummary,
    type GroupSummary,
    type ProfileSearchResult,
} from '../../../services/apiGateway';
import {
    getOfficialClubFieldLabel,
    getOfficialClubHelperText,
    getOfficialClubModalTitle,
    getOfficialClubPlaceholder,
    getOfficialClubSearchFocuses,
    getSportFocusDefinitions,
    getSportFocusLabel,
    getTrainingGroupFieldLabel,
    getTrainingGroupModalTitle,
    getTrainingGroupPlaceholder,
    normalizeSelectedEvents,
    type SportFocusId,
} from '../../../utils/profileSelections';
import { buildBottomTabUserProfileReset } from '../../../utils/navigationResets';

const ROLES = ['Coach', 'Parent', 'Fysiotherapist', 'Fan'];

type SelectedClubItem = {
    code: string;
    name: string;
    subtitle?: string | null;
};

type SelectedGroupItem = {
    id: string;
    name: string;
    subtitle?: string | null;
};

type SelectedAthleteItem = {
    key: string;
    profileId?: string;
    name: string;
    isCustom: boolean;
};

const CompleteSupportDetailsScreen = ({ navigation, route }: any) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const { updateUserProfile, apiAccessToken, userProfile } = useAuth();
    const editMode = Boolean(route?.params?.editMode);

    const initialSupportFocuses = useMemo<SportFocusId[]>(() => {
        const fromRoute = normalizeSelectedEvents(route?.params?.supportFocuses ?? route?.params?.selectedEvents ?? []);
        if (fromRoute.length > 0) return fromRoute;
        return normalizeSelectedEvents((userProfile as any)?.supportFocuses ?? []);
    }, [route?.params?.selectedEvents, route?.params?.supportFocuses, userProfile]);

    const initialSelectedClubs = useMemo<SelectedClubItem[]>(() => {
        const hydrated = Array.isArray((userProfile as any)?.supportClubs) ? (userProfile as any).supportClubs as ClubSummary[] : [];
        if (hydrated.length > 0) {
            return hydrated.reduce<SelectedClubItem[]>((acc, club) => {
                const code = String(club?.code ?? '').trim().toUpperCase();
                const name = String(club?.name ?? '').trim();
                if (!code || !name) return acc;
                const subtitle = [String(club?.city ?? '').trim(), String(club?.federation ?? '').trim()].filter(Boolean).join(' · ');
                acc.push({
                    code,
                    name,
                    subtitle: subtitle || null,
                });
                return acc;
            }, []);
        }
        const codes = Array.isArray((userProfile as any)?.supportClubCodes)
            ? (userProfile as any).supportClubCodes.map((entry: any) => String(entry ?? '').trim().toUpperCase()).filter(Boolean)
            : [];
        return codes.map((code: string) => ({ code, name: code }));
    }, [userProfile]);

    const initialSelectedGroups = useMemo<SelectedGroupItem[]>(() => {
        const hydrated: any[] = Array.isArray((userProfile as any)?.supportGroups) ? (userProfile as any).supportGroups : [];
        if (hydrated.length > 0) {
            return hydrated.reduce<SelectedGroupItem[]>((acc, group: any) => {
                const id = String(group?.group_id ?? '').trim();
                const name = String(group?.name ?? '').trim();
                if (!id || !name) return acc;
                const subtitle = [String(group?.role ?? '').trim(), String(group?.location ?? '').trim()].filter(Boolean).join(' · ');
                acc.push({
                    id,
                    name,
                    subtitle: subtitle || null,
                });
                return acc;
            }, []);
        }
        const ids = Array.isArray((userProfile as any)?.supportGroupIds)
            ? (userProfile as any).supportGroupIds.map((entry: any) => String(entry ?? '').trim()).filter(Boolean)
            : [];
        return ids.map((id: string) => ({ id, name: id }));
    }, [userProfile]);

    const initialSelectedAthletes = useMemo<SelectedAthleteItem[]>(() => {
        const names = Array.isArray((userProfile as any)?.supportAthletes)
            ? (userProfile as any).supportAthletes.map((entry: any) => String(entry ?? '').trim()).filter(Boolean)
            : [];
        const profileIds = Array.isArray((userProfile as any)?.supportAthleteProfileIds)
            ? (userProfile as any).supportAthleteProfileIds.map((entry: any) => String(entry ?? '').trim()).filter(Boolean)
            : [];
        return names.map((name: string, index: number) => {
            const profileId = profileIds[index];
            return {
                key: profileId ? `db:${profileId}` : `custom:${name.toLowerCase()}`,
                profileId,
                name,
                isCustom: !profileId,
            } satisfies SelectedAthleteItem;
        });
    }, [userProfile]);

    const [supportRole, setSupportRole] = useState<string>(String((userProfile as any)?.supportRole ?? 'Coach') || 'Coach');
    const supportFocuses = initialSupportFocuses;
    const [selectedClubs, setSelectedClubs] = useState<SelectedClubItem[]>(initialSelectedClubs);
    const [selectedGroups, setSelectedGroups] = useState<SelectedGroupItem[]>(initialSelectedGroups);
    const [selectedAthletes, setSelectedAthletes] = useState<SelectedAthleteItem[]>(initialSelectedAthletes);
    const [clubPickerVisible, setClubPickerVisible] = useState(false);
    const [groupPickerVisible, setGroupPickerVisible] = useState(false);
    const [clubQuery, setClubQuery] = useState('');
    const [groupQuery, setGroupQuery] = useState('');
    const [clubOptions, setClubOptions] = useState<SearchPickerOption[]>([]);
    const [groupOptions, setGroupOptions] = useState<SearchPickerOption[]>([]);
    const [clubsLoading, setClubsLoading] = useState(false);
    const [groupsLoading, setGroupsLoading] = useState(false);
    const [clubsError, setClubsError] = useState<string | null>(null);
    const [groupsError, setGroupsError] = useState<string | null>(null);
    const [athleteQuery, setAthleteQuery] = useState('');
    const [athleteResults, setAthleteResults] = useState<ProfileSearchResult[]>([]);
    const [isSearchingAthletes, setIsSearchingAthletes] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const clubSearchFocuses = useMemo(() => getOfficialClubSearchFocuses(supportFocuses), [supportFocuses]);
    const supportFocusLabel = useMemo(
        () => supportFocuses.map((focusId) => getSportFocusLabel(focusId, t)).join(' · '),
        [supportFocuses, t],
    );
    const clubLabel = useMemo(() => getOfficialClubFieldLabel(supportFocuses, t), [supportFocuses, t]);
    const clubPlaceholder = useMemo(() => getOfficialClubPlaceholder(supportFocuses, t), [supportFocuses, t]);
    const clubModalTitle = useMemo(() => getOfficialClubModalTitle(supportFocuses, t), [supportFocuses, t]);
    const clubHelperText = useMemo(() => getOfficialClubHelperText(supportFocuses, t), [supportFocuses, t]);
    const groupLabel = useMemo(() => getTrainingGroupFieldLabel(supportFocuses, t), [supportFocuses, t]);
    const groupPlaceholder = useMemo(() => getTrainingGroupPlaceholder(supportFocuses, t), [supportFocuses, t]);
    const groupModalTitle = useMemo(() => getTrainingGroupModalTitle(supportFocuses, t), [supportFocuses, t]);
    const selectedClubCodes = useMemo(() => new Set(selectedClubs.map((entry) => entry.code)), [selectedClubs]);
    const selectedGroupIds = useMemo(() => new Set(selectedGroups.map((entry) => entry.id)), [selectedGroups]);
    const normalizedSelectedAthleteNames = useMemo(
        () => new Set(selectedAthletes.map((entry) => entry.name.trim().toLowerCase()).filter(Boolean)),
        [selectedAthletes],
    );

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
        focusWrap: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
        },
        focusButton: {
            borderWidth: 1,
            borderColor: colors.borderColor,
            backgroundColor: colors.secondaryColor,
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 999,
        },
        focusButtonSelected: {
            borderColor: colors.primaryColor,
            backgroundColor: colors.secondaryBlueColor,
        },
        focusButtonText: {
            color: colors.mainTextColor,
            fontSize: 13,
        },
        focusButtonTextSelected: {
            color: colors.primaryColor,
            fontWeight: '600',
        },
        helperText: {
            color: colors.grayColor,
            fontSize: 12,
            lineHeight: 18,
        },
        selectorButton: {
            minHeight: 54,
            borderWidth: 1,
            borderRadius: 10,
            borderColor: colors.borderColor,
            backgroundColor: colors.secondaryColor,
            paddingHorizontal: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
        },
        selectorButtonDisabled: {
            opacity: 0.45,
        },
        selectorButtonTextWrap: {
            flex: 1,
            gap: 4,
        },
        selectorButtonTitle: {
            color: colors.mainTextColor,
            fontSize: 14,
        },
        selectorButtonSubtitle: {
            color: colors.grayColor,
            fontSize: 12,
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
        chipTextWrap: {
            maxWidth: '92%',
        },
        chipText: {
            color: colors.primaryColor,
            fontSize: 12,
            fontWeight: '600',
        },
        chipSubText: {
            color: colors.primaryColor,
            fontSize: 10,
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
        if (!clubPickerVisible || !apiAccessToken || clubSearchFocuses.length === 0) {
            setClubOptions([]);
            setClubsLoading(false);
            setClubsError(null);
            return;
        }

        let active = true;
        const handle = setTimeout(async () => {
            setClubsLoading(true);
            setClubsError(null);
            try {
                const response = await searchClubs(apiAccessToken, {
                    q: clubQuery.trim() || undefined,
                    limit: 30,
                    focuses: clubSearchFocuses,
                });
                if (!active) return;
                const options = (Array.isArray(response?.clubs) ? response.clubs : []).reduce<SearchPickerOption[]>((acc, club) => {
                        const code = String(club?.code ?? '').trim().toUpperCase();
                        const name = String(club?.name ?? '').trim();
                        if (!code || !name || selectedClubCodes.has(code)) return acc;
                        const subtitle = [String(club?.city ?? '').trim(), String(club?.federation ?? '').trim()].filter(Boolean).join(' · ');
                        acc.push({
                            id: code,
                            title: name,
                            subtitle: subtitle || code,
                        });
                        return acc;
                    }, []);
                setClubOptions(options);
            } catch {
                if (!active) return;
                setClubOptions([]);
                setClubsError(t('Could not load clubs right now.'));
            } finally {
                if (active) setClubsLoading(false);
            }
        }, 220);

        return () => {
            active = false;
            clearTimeout(handle);
        };
    }, [apiAccessToken, clubPickerVisible, clubQuery, clubSearchFocuses, selectedClubCodes, t]);

    useEffect(() => {
        if (!groupPickerVisible || !apiAccessToken) {
            setGroupOptions([]);
            setGroupsLoading(false);
            setGroupsError(null);
            return;
        }

        let active = true;
        const handle = setTimeout(async () => {
            setGroupsLoading(true);
            setGroupsError(null);
            try {
                const response = await searchGroups(apiAccessToken, {
                    q: groupQuery.trim() || undefined,
                    limit: 30,
                });
                if (!active) return;
                const options = (Array.isArray(response?.groups) ? response.groups : []).reduce<SearchPickerOption[]>((acc, group: GroupSummary) => {
                        const id = String(group?.group_id ?? '').trim();
                        const name = String(group?.name ?? '').trim();
                        if (!id || !name || selectedGroupIds.has(id)) return acc;
                        const subtitle = [String(group?.location ?? '').trim(), String(group?.my_role ?? '').trim()].filter(Boolean).join(' · ');
                        acc.push({
                            id,
                            title: name,
                            subtitle: subtitle || null,
                        });
                        return acc;
                    }, []);
                setGroupOptions(options);
            } catch {
                if (!active) return;
                setGroupOptions([]);
                setGroupsError(t('Could not load groups right now.'));
            } finally {
                if (active) setGroupsLoading(false);
            }
        }, 220);

        return () => {
            active = false;
            clearTimeout(handle);
        };
    }, [apiAccessToken, groupPickerVisible, groupQuery, selectedGroupIds, t]);

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
                const response = await searchProfiles(apiAccessToken, { q: term, limit: 8 });
                if (!active) return;
                const list = Array.isArray(response?.profiles) ? response.profiles : [];
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

    const addClub = (option: SearchPickerOption) => {
        const code = String(option.id ?? '').trim().toUpperCase();
        if (!code || selectedClubCodes.has(code)) return;
        setSelectedClubs((prev) => [...prev, { code, name: option.title, subtitle: option.subtitle ?? null }]);
        setClubPickerVisible(false);
        setClubQuery('');
    };

    const addGroup = (option: SearchPickerOption) => {
        const id = String(option.id ?? '').trim();
        if (!id || selectedGroupIds.has(id)) return;
        setSelectedGroups((prev) => [...prev, { id, name: option.title, subtitle: option.subtitle ?? null }]);
        setGroupPickerVisible(false);
        setGroupQuery('');
    };

    const removeClub = (code: string) => {
        setSelectedClubs((prev) => prev.filter((entry) => entry.code !== code));
    };

    const removeGroup = (id: string) => {
        setSelectedGroups((prev) => prev.filter((entry) => entry.id !== id));
    };

    const addAthleteFromProfile = (profile: ProfileSearchResult) => {
        const profileId = String(profile.profile_id || '').trim();
        const name = String(profile.display_name || '').trim();
        if (!profileId || !name) return;
        const normalized = name.toLowerCase();
        if (normalizedSelectedAthleteNames.has(normalized)) return;
        setSelectedAthletes((prev) => [...prev, { key: `db:${profileId}`, profileId, name, isCustom: false }]);
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
        setSelectedAthletes((prev) => [...prev, { key: `custom:${normalized}`, name, isCustom: true }]);
        setAthleteQuery('');
        setAthleteResults([]);
    };

    const removeAthlete = (key: string) => {
        setSelectedAthletes((prev) => prev.filter((entry) => entry.key !== key));
    };

    const handleSkip = () => {
        void handleFinish();
    };

    const handleFinish = async () => {
        if (supportFocuses.length === 0) {
            Alert.alert(t('Missing sport focus'), t('Choose at least one sport focus.'));
            return;
        }

        setIsLoading(true);
        try {
            const linkedAthletes = selectedAthletes.map((entry) => entry.name.trim()).filter(Boolean);
            const linkedAthleteProfileIds = selectedAthletes.map((entry) => String(entry.profileId || '').trim()).filter(Boolean);
            await updateUserProfile({
                category: 'support',
                supportRole,
                supportOrganization: '',
                supportBaseLocation: '',
                supportAthletes: linkedAthletes,
                supportAthleteProfileIds: linkedAthleteProfileIds,
                supportClubCodes: selectedClubs.map((entry) => entry.code),
                supportGroupIds: selectedGroups.map((entry) => entry.id),
                supportFocuses,
            });
            if (editMode) {
                navigation.goBack();
                return;
            }
            navigation.dispatch(
                CommonActions.reset(
                    buildBottomTabUserProfileReset({ forceProfileCategory: 'support' }),
                ),
            );
        } catch {
            Alert.alert(t('Error'), t('Failed to save details. Please try again.'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <View style={Styles.topBar}>
                <TouchableOpacity
                    style={Styles.backButtonCircle}
                    activeOpacity={0.8}
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft2 size={22} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>
            <View style={Styles.heroSection}>
                <Text style={Styles.headingText}>{t(editMode ? 'Edit Support Profile' : 'Complete Your Support Profile')}</Text>
                <SizeBox height={8} />
                <Text style={Styles.subHeadingText}>
                    {t('Your supported sports are already set. Add the role, clubs, groups, and athletes you want visible.')}
                </Text>
            </View>

            <View style={Styles.formViewport}>
                <ScrollView
                    style={Styles.formScroll}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={Styles.formContent}
                >
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

                        <Text style={Styles.clubFieldLabel}>{t('Sports you support')}</Text>
                        {supportFocusLabel.length > 0 ? (
                            <Text style={localStyles.helperText}>{supportFocusLabel}</Text>
                        ) : null}
                        <View style={localStyles.focusWrap}>
                            {getSportFocusDefinitions()
                                .filter((focus) => supportFocuses.includes(focus.id))
                                .map((focus) => (
                                    <View
                                        key={focus.id}
                                        style={[localStyles.focusButton, localStyles.focusButtonSelected]}
                                    >
                                        <Text style={localStyles.focusButtonTextSelected}>
                                            {getSportFocusLabel(focus.id, t)}
                                        </Text>
                                    </View>
                                ))}
                        </View>

                        <Text style={Styles.clubFieldLabel}>{clubLabel}</Text>
                        {clubHelperText ? <Text style={localStyles.helperText}>{clubHelperText}</Text> : null}
                        <TouchableOpacity
                            style={[localStyles.selectorButton, clubSearchFocuses.length === 0 && localStyles.selectorButtonDisabled]}
                            activeOpacity={0.85}
                            disabled={clubSearchFocuses.length === 0}
                            onPress={() => setClubPickerVisible(true)}
                        >
                            <View style={localStyles.selectorButtonTextWrap}>
                                <Text style={localStyles.selectorButtonTitle}>{t('Add official club')}</Text>
                                <Text style={localStyles.selectorButtonSubtitle}>{clubPlaceholder}</Text>
                            </View>
                            <Add size={18} color={colors.primaryColor} />
                        </TouchableOpacity>
                        {selectedClubs.length > 0 ? (
                            <View style={localStyles.chipsWrap}>
                                {selectedClubs.map((club) => (
                                    <TouchableOpacity key={club.code} style={localStyles.chip} onPress={() => removeClub(club.code)}>
                                        <View style={localStyles.chipTextWrap}>
                                            <Text style={localStyles.chipText} numberOfLines={1}>{club.name}</Text>
                                            {club.subtitle ? <Text style={localStyles.chipSubText} numberOfLines={1}>{club.subtitle}</Text> : null}
                                        </View>
                                        <CloseCircle size={14} color={colors.primaryColor} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : null}

                        <Text style={Styles.clubFieldLabel}>{groupLabel}</Text>
                        <TouchableOpacity
                            style={localStyles.selectorButton}
                            activeOpacity={0.85}
                            onPress={() => setGroupPickerVisible(true)}
                        >
                            <View style={localStyles.selectorButtonTextWrap}>
                                <Text style={localStyles.selectorButtonTitle}>{t('Add group')}</Text>
                                <Text style={localStyles.selectorButtonSubtitle}>{groupPlaceholder}</Text>
                            </View>
                            <Add size={18} color={colors.primaryColor} />
                        </TouchableOpacity>
                        {selectedGroups.length > 0 ? (
                            <View style={localStyles.chipsWrap}>
                                {selectedGroups.map((group) => (
                                    <TouchableOpacity key={group.id} style={localStyles.chip} onPress={() => removeGroup(group.id)}>
                                        <View style={localStyles.chipTextWrap}>
                                            <Text style={localStyles.chipText} numberOfLines={1}>{group.name}</Text>
                                            {group.subtitle ? <Text style={localStyles.chipSubText} numberOfLines={1}>{group.subtitle}</Text> : null}
                                        </View>
                                        <CloseCircle size={14} color={colors.primaryColor} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : null}

                        <Text style={Styles.clubFieldLabel}>{t('Athletes you support')}</Text>
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
                        {selectedAthletes.length > 0 ? (
                            <View style={localStyles.chipsWrap}>
                                {selectedAthletes.map((entry) => (
                                    <TouchableOpacity key={entry.key} style={localStyles.chip} onPress={() => removeAthlete(entry.key)}>
                                        <Text style={localStyles.chipText} numberOfLines={1}>{entry.name}</Text>
                                        <CloseCircle size={14} color={colors.primaryColor} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : null}
                    </View>
                    <SizeBox height={20} />
                </ScrollView>
            </View>

            <View style={[Styles.buttonContainer, {
                marginTop: 0,
                paddingTop: 12,
                paddingBottom: Math.max(insets.bottom, 14),
                backgroundColor: colors.backgroundColor,
            }]}> 
                {editMode ? (
                    <TouchableOpacity style={Styles.skipButton} activeOpacity={0.7} onPress={() => navigation.goBack()}>
                        <Text style={Styles.skipButtonText}>{t('Cancel')}</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={Styles.skipButton} activeOpacity={0.7} onPress={handleSkip}>
                        <Text style={Styles.skipButtonText}>{t('Skip')}</Text>
                        <Icons.RightBtnIconGrey height={18} width={18} />
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={[Styles.finishButton, (isLoading || supportFocuses.length === 0) && { opacity: 0.5 }]}
                    activeOpacity={0.7}
                    onPress={handleFinish}
                    disabled={isLoading || supportFocuses.length === 0}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <>
                            <Text style={Styles.finishButtonText}>{t(editMode ? 'Save' : 'Finish')}</Text>
                            <Icons.RightBtnIcon height={18} width={18} />
                        </>
                    )}
                </TouchableOpacity>
            </View>

            <SearchPickerModal
                visible={clubPickerVisible}
                title={clubModalTitle}
                placeholder={clubPlaceholder}
                query={clubQuery}
                onChangeQuery={setClubQuery}
                onClose={() => {
                    setClubPickerVisible(false);
                    setClubQuery('');
                }}
                options={clubOptions}
                loading={clubsLoading}
                error={clubsError}
                emptyText={t('No clubs found.')}
                onSelect={addClub}
            />

            <SearchPickerModal
                visible={groupPickerVisible}
                title={groupModalTitle}
                placeholder={groupPlaceholder}
                query={groupQuery}
                onChangeQuery={setGroupQuery}
                onClose={() => {
                    setGroupPickerVisible(false);
                    setGroupQuery('');
                }}
                options={groupOptions}
                loading={groupsLoading}
                error={groupsError}
                emptyText={t('No groups found.')}
                onSelect={addGroup}
            />
        </View>
    );
};

export default CompleteSupportDetailsScreen;
