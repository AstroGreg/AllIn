import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { ArrowLeft2, ArrowRight, Buildings, CloseCircle, Global, User } from 'iconsax-react-nativejs';

import SizeBox from '../../constants/SizeBox';
import Images from '../../constants/Images';
import { createStyles } from './CompleteAthleteDetailsStyles';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import ChestNumbersByYearField from '../../components/profile/ChestNumbersByYearField';
import SearchPickerModal, { type SearchPickerOption } from '../../components/profile/SearchPickerModal';
import { ApiError, searchClubs } from '../../services/apiGateway';
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
    normalizeMainDisciplines,
    normalizeSelectedEvents,
    type SportFocusId,
} from '../../utils/profileSelections';

const normalizeChestNumbersByYear = (raw: any): Record<string, string> => {
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
};

const CompleteAthleteDetailsScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    const { userProfile, updateUserProfile, apiAccessToken } = useAuth();

    const persistedSelectedFocuses = useMemo(
        () => normalizeSelectedEvents(route?.params?.selectedEvents ?? userProfile?.selectedEvents ?? []),
        [route?.params?.selectedEvents, userProfile?.selectedEvents],
    );
    const flowSelectedFocuses = useMemo(
        () => normalizeSelectedEvents(route?.params?.flowSelectedEvents ?? route?.params?.selectedEvents ?? []),
        [route?.params?.flowSelectedEvents, route?.params?.selectedEvents],
    );
    const selectedFocuses = flowSelectedFocuses.length > 0 ? flowSelectedFocuses : persistedSelectedFocuses;
    const existingSelectedFocuses = useMemo(
        () => normalizeSelectedEvents(userProfile?.selectedEvents ?? []),
        [userProfile?.selectedEvents],
    );
    const currentYear = useMemo(() => String(new Date().getFullYear()), []);
    const showsChestNumbers = useMemo(
        () => selectedFocuses.some((focusId) => focusUsesChestNumbers(focusId)),
        [selectedFocuses],
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
    const initialMainDisciplines = useMemo(
        () => normalizeMainDisciplines((userProfile as any)?.mainDisciplines ?? {}, {
            trackFieldMainEvent: (userProfile as any)?.trackFieldMainEvent ?? null,
            roadTrailMainEvent: (userProfile as any)?.roadTrailMainEvent ?? null,
        }),
        [userProfile],
    );

    const [chestNumbersByYear, setChestNumbersByYear] = useState<Record<string, string>>(
        normalizeChestNumbersByYear(userProfile?.chestNumbersByYear ?? {}),
    );
    const [website, setWebsite] = useState(String((userProfile as any)?.website ?? ''));
    const [clubName, setClubName] = useState(String((userProfile as any)?.trackFieldClub ?? (userProfile as any)?.runningClub ?? ''));
    const [clubId, setClubId] = useState('');
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
        if (!apiAccessToken || clubSearchFocuses.length === 0) return;
        const cacheKey = getClubCacheKey('');
        if (clubOptionsCacheRef.current[cacheKey]) return;
        let mounted = true;
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
                const message = e instanceof ApiError ? e.message : String(e?.message ?? e);
                setClubsError(message);
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
    }, [chestNumbersByYear, clubName, mainDisciplines, selectedFocuses, showsChestNumbers, t, website]);

    const onSave = async () => {
        if (!isReviewing) {
            setIsReviewing(true);
            return;
        }
        setIsSaving(true);
        try {
            const normalizedChest = Object.entries(chestNumbersByYear).reduce((acc, [year, chest]) => {
                const parsed = Number(chest);
                if (/^\d{4}$/.test(String(year)) && Number.isInteger(parsed) && parsed >= 0) {
                    acc[String(year)] = String(parsed);
                }
                return acc;
            }, {} as Record<string, string>);
            const normalizedFocusDisciplines = Object.entries(mainDisciplines).reduce((acc, [focusId, discipline]) => {
                const safeFocus = String(focusId || '').trim();
                const safeDiscipline = String(discipline || '').trim();
                if (!safeFocus || !safeDiscipline) return acc;
                acc[safeFocus] = safeDiscipline;
                return acc;
            }, {} as Record<string, string>);
            const nextSelectedEvents = Array.from(
                new Set<SportFocusId>([...existingSelectedFocuses, ...selectedFocuses]),
            );

            await updateUserProfile({
                category: 'find',
                selectedEvents: nextSelectedEvents,
                website: String(website || '').trim(),
                chestNumbersByYear: normalizedChest,
                trackFieldClub: String(clubName || '').trim(),
                runningClub: String(clubName || '').trim(),
                runningClubGroupId: String(runningGroupId || '').trim(),
                trackFieldMainEvent: String(normalizedFocusDisciplines['track-field'] || '').trim(),
                roadTrailMainEvent: String(normalizedFocusDisciplines['road-events'] || '').trim(),
                mainDisciplines: normalizedFocusDisciplines,
            } as any);

            navigation.goBack();
        } catch (e: any) {
            Alert.alert(t('Error'), String(e?.message ?? e));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={Styles.mainContainer} testID="profile-complete-athlete-details-screen">
            <SizeBox height={insets.top} />

            <View style={Styles.header}>
                <TouchableOpacity
                    style={Styles.headerButton}
                    onPress={() => {
                        if (isReviewing) {
                            setIsReviewing(false);
                            return;
                        }
                        navigation.goBack();
                    }}
                >
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView
                testID="profile-complete-athlete-details-scroll"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={Styles.scrollContent}
            >
                <View style={Styles.illustrationContainer}>
                    <FastImage source={Images.signup4} style={Styles.illustration} resizeMode="contain" />
                </View>

                <View style={Styles.titleSection}>
                    <Text style={Styles.title}>{isReviewing ? t('Review your athlete profile') : t('Complete your athlete details')}</Text>
                    <Text style={Styles.subtitle}>
                        {isReviewing
                            ? t('Check the final details once before saving this athlete focus.')
                            : t('Choose the club and profile details you want to show.')}
                    </Text>
                </View>

                {isReviewing ? (
                    <View style={Styles.formContainer}>
                        <View style={Styles.reviewCard} testID="profile-athlete-review-card">
                            {reviewRows.length > 0 ? (
                                reviewRows.map((row) => (
                                    <View key={`${row.label}-${row.value}`} style={Styles.reviewRow}>
                                        <Text style={Styles.reviewLabel}>{row.label}</Text>
                                        <Text style={Styles.reviewValue}>{row.value}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={Styles.reviewHint}>{t('No optional details were added. You can still save this athlete focus now.')}</Text>
                            )}
                        </View>
                    </View>
                ) : (
                    <View style={Styles.formContainer}>
                        {showsChestNumbers ? (
                            <ChestNumbersByYearField
                                currentYear={currentYear}
                                values={chestNumbersByYear}
                                onChange={setChestNumbersByYear}
                                label={getChestNumberFieldLabel(currentYear, t)}
                                helperText={t('Add your bib for this year first, then add other years whenever you need them.')}
                                addYearLabel={t('Add year')}
                                moreYearsLabel={t('More years')}
                                inputPlaceholder={t('Enter chest number')}
                            />
                        ) : null}

                        {showOfficialClubField ? (
                            <View style={Styles.inputGroup}>
                                <Text style={Styles.inputLabel}>{getOfficialClubFieldLabel(selectedFocuses, t)}</Text>
                                <View style={Styles.inputContainer}>
                                    <TouchableOpacity
                                        testID="profile-athlete-club-picker-open"
                                        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}
                                        activeOpacity={0.85}
                                        onPress={() => setClubModalVisible(true)}
                                    >
                                        <Buildings size={24} color={colors.primaryColor} variant="Linear" />
                                        <Text style={[Styles.dropdownText, !clubName ? Styles.placeholderText : null]}>
                                            {clubName || getOfficialClubPlaceholder(selectedFocuses, t)}
                                        </Text>
                                    </TouchableOpacity>
                                    {clubName ? (
                                        <TouchableOpacity onPress={() => { setClubName(''); setClubId(''); }}>
                                            <CloseCircle size={18} color={colors.grayColor} />
                                        </TouchableOpacity>
                                    ) : null}
                                </View>
                            </View>
                        ) : officialClubHelperText ? (
                            <Text style={[Styles.subtitle, { textAlign: 'left', marginTop: 0 }]}>{officialClubHelperText}</Text>
                        ) : null}

                        {selectedFocuses.map((focusId) => {
                            const selectedDiscipline = String(mainDisciplines[focusId] || '').trim();
                            return (
                                <View key={focusId} style={Styles.inputGroup}>
                                    <Text style={Styles.inputLabel}>{getFocusMainDisciplineLabel(focusId, t)}</Text>
                                    <View style={Styles.inputContainer}>
                                        <TouchableOpacity
                                            testID={`profile-athlete-discipline-picker-open-${focusId}`}
                                            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}
                                            activeOpacity={0.85}
                                            onPress={() => {
                                                setDisciplineFocusId(focusId);
                                                setDisciplineQuery('');
                                                setDisciplineModalVisible(true);
                                            }}
                                        >
                                            <User size={24} color={colors.primaryColor} variant="Linear" />
                                            <Text style={[Styles.dropdownText, !selectedDiscipline ? Styles.placeholderText : null]}>
                                                {selectedDiscipline ? getDisciplineLabel(focusId, selectedDiscipline, t) : t('Choose main discipline')}
                                            </Text>
                                        </TouchableOpacity>
                                        {selectedDiscipline ? (
                                            <TouchableOpacity onPress={() => setMainDisciplines((prev) => {
                                                const next = { ...prev };
                                                delete next[focusId];
                                                return next;
                                            })}>
                                                <CloseCircle size={18} color={colors.grayColor} />
                                            </TouchableOpacity>
                                        ) : null}
                                    </View>
                                </View>
                            );
                        })}

                        <View style={Styles.inputGroup}>
                            <Text style={Styles.inputLabel}>{t('Website (optional)')}</Text>
                            <View style={Styles.inputContainer}>
                                <Global size={24} color={colors.primaryColor} variant="Linear" />
                                <TextInput
                                    style={Styles.textInput}
                                    placeholder={t('Add website')}
                                    placeholderTextColor={colors.grayColor}
                                    value={website}
                                    onChangeText={setWebsite}
                                    keyboardType="url"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>

            <View style={[Styles.bottomContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}> 
                <TouchableOpacity
                    style={Styles.skipButton}
                    onPress={() => {
                        if (isReviewing) {
                            setIsReviewing(false);
                            return;
                        }
                        navigation.goBack();
                    }}
                >
                    <Text style={Styles.skipButtonText}>{isReviewing ? t('Back') : t('Cancel')}</Text>
                    <ArrowRight size={18} color={colors.subTextColor} variant="Linear" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={Styles.nextButton}
                    onPress={onSave}
                    disabled={isSaving}
                    testID={isReviewing ? 'profile-athlete-save-button' : 'profile-athlete-review-button'}
                >
                    {isSaving ? (
                        <ActivityIndicator size="small" color={colors.pureWhite} />
                    ) : (
                        <>
                            <Text style={Styles.nextButtonText}>{isReviewing ? t('Save') : t('Review')}</Text>
                            <ArrowRight size={18} color={colors.pureWhite} variant="Linear" />
                        </>
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
