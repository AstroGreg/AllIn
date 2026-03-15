import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import { ArrowLeft2, Buildings, CloseCircle, Global, Profile2User, User } from 'iconsax-react-nativejs';

import { createStyles } from './CompleteAthleteDetailsScreenStyles';
import SizeBox from '../../../constants/SizeBox';
import Images from '../../../constants/Images';
import Icons from '../../../constants/Icons';
import ChestNumbersByYearField from '../../../components/profile/ChestNumbersByYearField';
import SearchPickerModal, { type SearchPickerOption } from '../../../components/profile/SearchPickerModal';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
    ApiError,
    getGroup,
    searchClubs,
} from '../../../services/apiGateway';
import {
    buildDisciplineSearchOptions,
    focusUsesChestNumbers,
    getChestNumberFieldLabel,
    getDisciplineLabel,
    getFocusDisciplineModalTitle,
    getFocusMainDisciplineLabel,
    getOfficialClubFieldLabel,
    getOfficialClubHelperText,
    getOfficialClubModalTitle,
    getOfficialClubPlaceholder,
    getOfficialClubSearchFocuses,
    getSportFocusLabel,
    getTrainingGroupFieldLabel,
    getTrainingGroupHelperText,
    getTrainingGroupPlaceholder,
    normalizeMainDisciplines,
    normalizeSelectedEvents,
    type SportFocusId,
} from '../../../utils/profileSelections';
import { buildBottomTabUserProfileReset } from '../../../utils/navigationResets';

const CompleteAthleteDetailsScreen = ({ navigation, route }: any) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const { updateUserProfile, apiAccessToken, userProfile } = useAuth();

    const persistedSelectedFocuses = useMemo(
        () => normalizeSelectedEvents(route?.params?.selectedEvents ?? []),
        [route?.params?.selectedEvents],
    );
    const existingSelectedFocuses = useMemo(
        () => normalizeSelectedEvents(userProfile?.selectedEvents ?? []),
        [userProfile?.selectedEvents],
    );
    const flowSelectedFocuses = useMemo(
        () => normalizeSelectedEvents(route?.params?.flowSelectedEvents ?? route?.params?.selectedEvents ?? []),
        [route?.params?.flowSelectedEvents, route?.params?.selectedEvents],
    );
    const selectedFocuses = flowSelectedFocuses.length > 0 ? flowSelectedFocuses : persistedSelectedFocuses;
    const currentYear = useMemo(() => String(new Date().getFullYear()), []);
    const showsChestNumbers = useMemo(
        () => selectedFocuses.some((focusId) => focusUsesChestNumbers(focusId)),
        [selectedFocuses],
    );
    const initialMainDisciplines = useMemo(
        () => normalizeMainDisciplines((userProfile as any)?.mainDisciplines ?? {}, {
            trackFieldMainEvent: (userProfile as any)?.trackFieldMainEvent ?? null,
            roadTrailMainEvent: (userProfile as any)?.roadTrailMainEvent ?? null,
        }),
        [userProfile],
    );
    const clubSearchFocuses = useMemo(
        () => getOfficialClubSearchFocuses(selectedFocuses),
        [selectedFocuses],
    );
    const showOfficialClubField = clubSearchFocuses.length > 0;
    const officialClubHelperText = useMemo(
        () => getOfficialClubHelperText(selectedFocuses, t),
        [selectedFocuses, t],
    );

    const [chestNumbersByYear, setChestNumbersByYear] = useState<Record<string, string>>(
        (() => {
            const raw = (userProfile as any)?.chestNumbersByYear;
            if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
            const out: Record<string, string> = {};
            Object.entries(raw).forEach(([year, chest]) => {
                const safeYear = String(year || '').trim();
                if (!/^\d{4}$/.test(safeYear)) return;
                const parsed = Number(chest);
                if (!Number.isInteger(parsed) || parsed < 0) return;
                out[safeYear] = String(parsed);
            });
            return out;
        })(),
    );
    const [website, setWebsite] = useState(String((userProfile as any)?.website ?? ''));
    const [clubName, setClubName] = useState(String((userProfile as any)?.trackFieldClub ?? (userProfile as any)?.runningClub ?? ''));
    const [clubId, setClubId] = useState('');
    const [runningGroupName, setRunningGroupName] = useState('');
    const [runningGroupId, setRunningGroupId] = useState(String((userProfile as any)?.runningClubGroupId ?? ''));
    const [mainDisciplines, setMainDisciplines] = useState<Record<string, string>>(initialMainDisciplines);
    const [isSaving, setIsSaving] = useState(false);
    const [isReviewing, setIsReviewing] = useState(false);

    const [clubModalVisible, setClubModalVisible] = useState(false);
    const [clubQuery, setClubQuery] = useState('');
    const [clubOptions, setClubOptions] = useState<SearchPickerOption[]>([]);
    const [clubsLoading, setClubsLoading] = useState(false);
    const [clubsError, setClubsError] = useState<string | null>(null);

    const [disciplineModalVisible, setDisciplineModalVisible] = useState(false);
    const [disciplineFocusId, setDisciplineFocusId] = useState<SportFocusId | null>(null);
    const [disciplineQuery, setDisciplineQuery] = useState('');
    const clubOptionsCacheRef = useRef<Record<string, SearchPickerOption[]>>({});
    const clubOptionsPromiseCacheRef = useRef<Record<string, Promise<SearchPickerOption[]>>>({});

    const getClubCacheKey = (queryValue: string) =>
        JSON.stringify({
            q: String(queryValue || '').trim().toLowerCase(),
            focuses: [...clubSearchFocuses].sort(),
        });
    const mapClubOptions = (clubs: any[] = []) =>
        clubs.map((club) => ({
            id: String(club.club_id || ''),
            title: String(club.name || club.code || '').trim(),
            subtitle: String(club.city || club.federation || club.code || '').trim() || null,
        })).filter((club) => club.id && club.title);

    const fetchClubOptions = async (queryValue: string, limit = 50) => {
        const normalizedQuery = String(queryValue || '').trim();
        const cacheKey = getClubCacheKey(normalizedQuery);
        const cached = clubOptionsCacheRef.current[cacheKey];
        if (cached) return cached;
        const inFlight = clubOptionsPromiseCacheRef.current[cacheKey];
        if (inFlight) return inFlight;
        const pending = searchClubs(apiAccessToken!, {
            q: normalizedQuery || undefined,
            focuses: clubSearchFocuses,
            limit,
        })
            .then((res) => {
                const mapped = mapClubOptions(res.clubs || []);
                clubOptionsCacheRef.current[cacheKey] = mapped;
                return mapped;
            })
            .finally(() => {
                delete clubOptionsPromiseCacheRef.current[cacheKey];
            });
        clubOptionsPromiseCacheRef.current[cacheKey] = pending;
        return pending;
    };

    useEffect(() => {
        if (!apiAccessToken || !runningGroupId) return;
        let mounted = true;
        getGroup(apiAccessToken, runningGroupId)
            .then((response) => {
                if (mounted) setRunningGroupName(String(response?.group?.name ?? ''));
            })
            .catch(() => {
                if (mounted) setRunningGroupName('');
            });
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, runningGroupId]);

    useEffect(() => {
        if (!apiAccessToken || clubSearchFocuses.length === 0) return;
        let mounted = true;
        const cacheKey = getClubCacheKey('');
        if (clubOptionsCacheRef.current[cacheKey]) return;
        fetchClubOptions('', 50)
            .then((mapped) => {
                if (!mounted) return;
                if (!clubModalVisible && !clubQuery.trim()) setClubOptions(mapped);
            })
            .catch(() => {
                // Best-effort prefetch only.
            });
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, clubModalVisible, clubQuery, clubSearchFocuses]);

    useEffect(() => {
        if (!clubModalVisible || !apiAccessToken) return;
        const normalizedQuery = clubQuery.trim();
        const cacheKey = getClubCacheKey(normalizedQuery);
        const cached = clubOptionsCacheRef.current[cacheKey];
        if (cached) {
            setClubOptions(cached);
            setClubsError(null);
            setClubsLoading(false);
            return;
        }
        let mounted = true;
        const timeout = setTimeout(async () => {
            setClubsLoading(true);
            setClubsError(null);
            try {
                const mapped = await fetchClubOptions(normalizedQuery, 50);
                if (!mounted) return;
                setClubOptions(mapped);
            } catch (e: any) {
                if (!mounted) return;
                const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
                setClubsError(msg);
                setClubOptions([]);
            } finally {
                if (mounted) setClubsLoading(false);
            }
        }, normalizedQuery ? 120 : 0);

        return () => {
            mounted = false;
            clearTimeout(timeout);
        };
    }, [apiAccessToken, clubModalVisible, clubQuery, clubSearchFocuses]);

    const disciplineOptionsByFocus = useMemo(() => {
        return selectedFocuses.reduce((acc, focusId) => {
            acc[focusId] = buildDisciplineSearchOptions(focusId, t);
            return acc;
        }, {} as Record<string, SearchPickerOption[]>);
    }, [selectedFocuses, t]);

    const disciplineOptions = useMemo(() => {
        if (!disciplineFocusId) return [];
        const normalizedQuery = disciplineQuery.trim().toLowerCase();
        return (disciplineOptionsByFocus[disciplineFocusId] || []).filter((option) => {
            if (!normalizedQuery) return true;
            return `${option.title} ${option.subtitle ?? ''}`.toLowerCase().includes(normalizedQuery);
        });
    }, [disciplineFocusId, disciplineOptionsByFocus, disciplineQuery]);

    const reviewRows = useMemo(() => {
        const rows: Array<{ label: string; value: string }> = [];
        const focusValue = selectedFocuses.map((focusId) => getSportFocusLabel(focusId, t)).join(', ');
        if (focusValue) rows.push({ label: t('Sport focus'), value: focusValue });
        if (showsChestNumbers) {
            const chestValue = Object.entries(chestNumbersByYear)
                .sort(([a], [b]) => Number(b) - Number(a))
                .map(([year, chest]) => `${year}: ${chest}`)
                .join(' • ');
            if (chestValue) rows.push({ label: t('Chest number'), value: chestValue });
        }
        if (clubName.trim()) rows.push({ label: getOfficialClubFieldLabel(selectedFocuses, t), value: clubName.trim() });
        if (runningGroupName.trim()) rows.push({ label: getTrainingGroupFieldLabel(selectedFocuses, t), value: runningGroupName.trim() });
        selectedFocuses.forEach((focusId) => {
            const selectedDiscipline = String(mainDisciplines[focusId] || '').trim();
            if (!selectedDiscipline) return;
            rows.push({
                label: getFocusMainDisciplineLabel(focusId, t),
                value: getDisciplineLabel(focusId, selectedDiscipline, t),
            });
        });
        if (website.trim()) rows.push({ label: t('Website'), value: website.trim() });
        return rows;
    }, [chestNumbersByYear, clubName, mainDisciplines, runningGroupName, selectedFocuses, showsChestNumbers, t, website]);

    const handleSkip = () => {
        setIsReviewing(true);
    };

    const handleFinish = async () => {
        if (!isReviewing) {
            setIsReviewing(true);
            return;
        }
        setIsSaving(true);
        try {
            const nextSelectedEvents = Array.from(
                new Set([
                    ...existingSelectedFocuses,
                    ...persistedSelectedFocuses,
                    ...flowSelectedFocuses,
                ]),
            );
            const normalizedChest = Object.entries(chestNumbersByYear).reduce((acc, [year, chest]) => {
                const parsed = Number(chest);
                if (/^\d{4}$/.test(String(year)) && Number.isInteger(parsed) && parsed >= 0) {
                    acc[String(year)] = String(parsed);
                }
                return acc;
            }, {} as Record<string, string>);
            const normalizedMainDisciplines = Object.entries(mainDisciplines).reduce((acc, [focusId, discipline]) => {
                const safeFocus = String(focusId || '').trim();
                const safeDiscipline = String(discipline || '').trim();
                if (!safeFocus || !safeDiscipline) return acc;
                acc[safeFocus] = safeDiscipline;
                return acc;
            }, {} as Record<string, string>);

            await updateUserProfile({
                category: 'find',
                selectedEvents: nextSelectedEvents,
                chestNumbersByYear: normalizedChest,
                website: String(website || '').trim(),
                runningClub: String(clubName || '').trim(),
                trackFieldClub: String(clubName || '').trim(),
                runningClubGroupId: String(runningGroupId || '').trim(),
                trackFieldMainEvent: String(normalizedMainDisciplines['track-field'] || '').trim(),
                roadTrailMainEvent: String(normalizedMainDisciplines['road-events'] || '').trim(),
                mainDisciplines: normalizedMainDisciplines,
            }, { persistLocally: false });

            const targetFocus = flowSelectedFocuses[0] ?? persistedSelectedFocuses[0] ?? nextSelectedEvents[0] ?? null;
            navigation.dispatch(
                CommonActions.reset(
                    buildBottomTabUserProfileReset(
                        targetFocus ? { forceProfileCategory: targetFocus } : undefined,
                    ),
                ),
            );
        } catch (e: any) {
            Alert.alert(t('Error'), String(e?.message ?? t('Failed to save details. Please try again.')));
        } finally {
            setIsSaving(false);
        }
    };

    const clearClub = () => {
        setClubName('');
        setClubId('');
    };

    return (
        <View style={Styles.mainContainer} testID="profile-complete-athlete-details-screen">
            <SizeBox height={insets.top} />
            <View style={Styles.screenContent}>
                <View style={Styles.topBar}>
                    <TouchableOpacity
                        testID="complete-athlete-back-button"
                        style={Styles.backButtonCircle}
                        activeOpacity={0.8}
                        onPress={() => {
                            if (isReviewing) {
                                setIsReviewing(false);
                                return;
                            }
                            navigation.goBack();
                        }}
                    >
                        <ArrowLeft2 size={22} color={colors.primaryColor} variant="Linear" />
                    </TouchableOpacity>
                </View>

                <View style={Styles.heroSection}>
                    <View style={Styles.imageContainer}>
                        <FastImage source={Images.signup4} style={Styles.headerImage} resizeMode="contain" />
                    </View>

                    <SizeBox height={18} />

                    <View style={Styles.contentContainer}>
                        <Text style={Styles.headingText}>{isReviewing ? t('Review your athlete profile') : t('Complete Your Athlete Details')}</Text>
                        <SizeBox height={8} />
                        <Text style={Styles.subHeadingText}>
                            {isReviewing
                                ? t('Check the final details once before creating this athlete profile.')
                                : t('Add the optional details you want on your athlete profile.')}
                        </Text>
                    </View>
                </View>

                <View style={Styles.formViewport}>
                    {isReviewing ? (
                        <ScrollView
                            testID="profile-complete-athlete-details-scroll"
                            style={Styles.formScroll}
                            contentContainerStyle={Styles.formContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={Styles.formContainer}>
                                <View style={Styles.reviewCard} testID="athlete-review-card">
                                    {reviewRows.length > 0 ? (
                                        reviewRows.map((row) => (
                                            <View key={`${row.label}-${row.value}`} style={Styles.reviewRow}>
                                                <Text style={Styles.reviewLabel}>{row.label}</Text>
                                                <Text style={Styles.reviewValue}>{row.value}</Text>
                                            </View>
                                        ))
                                    ) : (
                                        <Text style={Styles.reviewHint}>{t('No optional details were added. You can still create this athlete profile now.')}</Text>
                                    )}
                                </View>
                            </View>
                        </ScrollView>
                    ) : (
                        <ScrollView
                            testID="profile-complete-athlete-details-scroll"
                            style={Styles.formScroll}
                            contentContainerStyle={Styles.formContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={Styles.formContainer}>
                            {showsChestNumbers ? (
                                <ChestNumbersByYearField
                                    currentYear={currentYear}
                                    values={chestNumbersByYear}
                                    onChange={setChestNumbersByYear}
                                    label={getChestNumberFieldLabel(currentYear, t)}
                                    helperText={t('Add your current bib now, then add other years if you want to keep the history complete.')}
                                    addYearLabel={t('Add year')}
                                    moreYearsLabel={t('More years')}
                                    inputPlaceholder={t('Enter chest number')}
                                />
                            ) : null}

                            {showOfficialClubField ? (
                                <>
                                    <Text style={Styles.clubFieldLabel}>{getOfficialClubFieldLabel(selectedFocuses, t)}</Text>
                                    <View style={Styles.clubFieldContainer}>
                                        <TouchableOpacity
                                            testID="profile-athlete-club-picker-open"
                                            style={Styles.clubFieldTapArea}
                                            activeOpacity={0.8}
                                            onPress={() => setClubModalVisible(true)}
                                        >
                                            <View style={Styles.clubFieldLeft}>
                                                <Buildings size={16} color={colors.primaryColor} />
                                                <SizeBox width={10} />
                                                <Text style={clubName ? Styles.clubFieldText : Styles.clubFieldPlaceholder}>
                                                    {clubName || getOfficialClubPlaceholder(selectedFocuses, t)}
                                                </Text>
                                            </View>
                                            <Icons.Dropdown height={20} width={20} />
                                        </TouchableOpacity>
                                        {clubName ? (
                                            <TouchableOpacity style={Styles.clubClearButton} activeOpacity={0.8} onPress={clearClub}>
                                                <CloseCircle size={18} color={colors.grayColor} />
                                            </TouchableOpacity>
                                        ) : null}
                                    </View>
                                </>
                            ) : officialClubHelperText ? (
                                <Text style={Styles.helperTextLeft}>{officialClubHelperText}</Text>
                            ) : null}

                            <Text style={Styles.clubFieldLabel}>{getTrainingGroupFieldLabel(selectedFocuses, t)}</Text>
                            <View testID="profile-athlete-group-invite-only" style={Styles.clubFieldContainer}>
                                <View style={Styles.clubFieldTapArea}>
                                    <View style={Styles.clubFieldLeft}>
                                        <Profile2User size={16} color={colors.primaryColor} />
                                        <SizeBox width={10} />
                                        <Text style={runningGroupName ? Styles.clubFieldText : Styles.clubFieldPlaceholder}>
                                            {runningGroupName || getTrainingGroupPlaceholder(selectedFocuses, t)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <Text style={[Styles.helperTextLeft, { marginTop: 8 }]}>{getTrainingGroupHelperText(selectedFocuses, t)}</Text>

                            {selectedFocuses.map((focusId) => {
                                const selectedDiscipline = String(mainDisciplines[focusId] || '').trim();
                                return (
                                    <View key={focusId}>
                                        <Text style={Styles.clubFieldLabel}>{getFocusMainDisciplineLabel(focusId, t)}</Text>
                                        <View style={Styles.clubFieldContainer}>
                                            <TouchableOpacity
                                                testID={`profile-athlete-discipline-picker-open-${focusId}`}
                                                style={Styles.clubFieldTapArea}
                                                activeOpacity={0.8}
                                                onPress={() => {
                                                    setDisciplineFocusId(focusId);
                                                    setDisciplineQuery('');
                                                    setDisciplineModalVisible(true);
                                                }}
                                            >
                                                <View style={Styles.clubFieldLeft}>
                                                    <User size={16} color={colors.primaryColor} />
                                                    <SizeBox width={10} />
                                                    <Text style={selectedDiscipline ? Styles.clubFieldText : Styles.clubFieldPlaceholder}>
                                                        {selectedDiscipline ? getDisciplineLabel(focusId, selectedDiscipline, t) : t('Choose main discipline')}
                                                    </Text>
                                                </View>
                                                <Icons.Dropdown height={20} width={20} />
                                            </TouchableOpacity>
                                            {selectedDiscipline ? (
                                                <TouchableOpacity
                                                    style={Styles.clubClearButton}
                                                    activeOpacity={0.8}
                                                    onPress={() => setMainDisciplines((prev) => {
                                                        const next = { ...prev };
                                                        delete next[focusId];
                                                        return next;
                                                    })}
                                                >
                                                    <CloseCircle size={18} color={colors.grayColor} />
                                                </TouchableOpacity>
                                            ) : null}
                                        </View>
                                    </View>
                                );
                            })}

                            <Text style={Styles.clubFieldLabel}>{t('Website (optional)')}</Text>
                            <View style={Styles.clubFieldContainer}>
                                <Global size={16} color={colors.primaryColor} />
                                <SizeBox width={10} />
                                <TextInput
                                    testID="athlete-website-input"
                                    style={Styles.websiteInput}
                                    value={website}
                                    onChangeText={setWebsite}
                                    placeholder={t('Add website')}
                                    placeholderTextColor={colors.grayColor}
                                    keyboardType="url"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>
                            <Text style={Styles.helperTextLeft}>{t('Website appears at the bottom of the profile and stays optional.')}</Text>
                            </View>
                        </ScrollView>
                    )}
                </View>
            </View>

            <View style={[Styles.buttonContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}> 
                <TouchableOpacity
                    testID={isReviewing ? 'athlete-review-back-button' : 'athlete-skip-button'}
                    style={Styles.skipButton}
                    onPress={isReviewing ? () => setIsReviewing(false) : handleSkip}
                >
                    <Text style={Styles.skipButtonText}>{isReviewing ? t('Back') : t('Skip')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    testID={isReviewing ? 'athlete-create-profile-button' : 'athlete-finish-button'}
                    style={Styles.finishButton}
                    onPress={handleFinish}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator size="small" color={colors.pureWhite} />
                    ) : (
                        <Text style={Styles.finishButtonText}>{isReviewing ? t('Create profile') : t('Review')}</Text>
                    )}
                </TouchableOpacity>
            </View>

            {clubModalVisible && !clubsLoading && (clubOptions.length > 0 || Boolean(clubsError)) ? (
                <View testID="profile-athlete-club-picker-ready" style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }} />
            ) : null}
            {!clubModalVisible && !clubsLoading && clubOptions.length > 0 ? (
                <View testID="profile-athlete-club-prefetch-ready" style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }} />
            ) : null}

            {disciplineModalVisible && disciplineOptions.length > 0 ? (
                <View testID="profile-athlete-discipline-picker-ready" style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }} />
            ) : null}
            {!disciplineModalVisible && Object.keys(disciplineOptionsByFocus).length > 0 ? (
                <View testID="profile-athlete-discipline-prefetch-ready" style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }} />
            ) : null}

            <SearchPickerModal
                visible={clubModalVisible}
                title={getOfficialClubModalTitle(selectedFocuses, t)}
                placeholder={getOfficialClubPlaceholder(selectedFocuses, t)}
                testIDPrefix="profile-athlete-club-picker"
                query={clubQuery}
                onChangeQuery={setClubQuery}
                onClose={() => setClubModalVisible(false)}
                options={clubOptions}
                loading={clubsLoading}
                error={clubsError}
                emptyText={t('No clubs found.')}
                selectedId={clubId}
                onSelect={(option) => {
                    setClubId(option.id);
                    setClubName(option.title);
                    setClubModalVisible(false);
                }}
            />

            <SearchPickerModal
                visible={disciplineModalVisible}
                title={disciplineFocusId ? getFocusDisciplineModalTitle(disciplineFocusId, t) : t('Disciplines')}
                placeholder={t('Search discipline')}
                testIDPrefix="profile-athlete-discipline-picker"
                query={disciplineQuery}
                onChangeQuery={setDisciplineQuery}
                onClose={() => setDisciplineModalVisible(false)}
                options={disciplineOptions}
                loading={false}
                emptyText={t('No disciplines found.')}
                selectedId={disciplineFocusId ? String(mainDisciplines[disciplineFocusId] || '') : ''}
                onSelect={(option) => {
                    if (disciplineFocusId) {
                        setMainDisciplines((prev) => ({
                            ...prev,
                            [disciplineFocusId]: option.id,
                        }));
                    }
                    setDisciplineModalVisible(false);
                }}
            />
        </View>
    );
};

export default CompleteAthleteDetailsScreen;
