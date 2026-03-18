import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft2, Buildings, CloseCircle, Global, Profile2User, User } from 'iconsax-react-nativejs';

import { createStyles } from '../MenuStyles';
import SizeBox from '../../../constants/SizeBox';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import {
  ApiError,
  getGroup,
  getProfileSummary,
  searchClubs,
} from '../../../services/apiGateway';
import { useTranslation } from 'react-i18next';
import ChestNumbersByYearField from '../../../components/profile/ChestNumbersByYearField';
import SearchPickerModal, { type SearchPickerOption } from '../../../components/profile/SearchPickerModal';
import {
  buildDisciplineSearchOptions,
  focusUsesChestNumbers,
  getChestNumberFieldLabel,
  getDisciplineLabel,
  getFocusDisciplineModalTitle,
  getFocusMainDisciplineLabel,
  getMainDisciplineForFocus,
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
  normalizeFocusId,
  normalizeSelectedEvents,
  type SportFocusId,
} from '../../../utils/profileSelections';

const normalizeChestByYear = (raw: any): Record<string, string> => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: Record<string, string> = {};
  for (const [year, chest] of Object.entries(raw as Record<string, unknown>)) {
    const safeYear = String(year ?? '').trim();
    if (!/^\d{4}$/.test(safeYear)) continue;
    const parsed = Number(chest);
    if (!Number.isInteger(parsed) || parsed < 0) continue;
    out[safeYear] = String(parsed);
  }
  return out;
};

const TrackFieldSettings = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const Styles = createStyles(colors);
  const { apiAccessToken, userProfile, updateUserProfile } = useAuth();
  const currentYear = useMemo(() => String(new Date().getFullYear()), []);

  const requestedFocusId = String(route?.params?.focusId || '').trim();
  const requestedFocus = useMemo(() => normalizeFocusId(requestedFocusId), [requestedFocusId]);
  const allSelectedFocuses = useMemo(
    () => normalizeSelectedEvents(userProfile?.selectedEvents ?? []),
    [userProfile?.selectedEvents],
  );
  const selectedFocuses = useMemo(() => {
    if (!requestedFocus) return allSelectedFocuses;
    return allSelectedFocuses.filter((focusId) => focusId === requestedFocus);
  }, [allSelectedFocuses, requestedFocus]);
  const focusToDelete = useMemo(() => {
    if (requestedFocus && allSelectedFocuses.includes(requestedFocus)) return requestedFocus;
    if (selectedFocuses.length === 1) return selectedFocuses[0];
    return null;
  }, [allSelectedFocuses, requestedFocus, selectedFocuses]);
  const screenTitle = useMemo(() => {
    if (selectedFocuses.length === 1) return getSportFocusLabel(selectedFocuses[0], t);
    return t('Athlete details');
  }, [selectedFocuses, t]);
  const clubSearchFocuses = useMemo(
    () => getOfficialClubSearchFocuses(selectedFocuses),
    [selectedFocuses],
  );
  const showOfficialClubField = clubSearchFocuses.length > 0;
  const officialClubHelperText = useMemo(
    () => getOfficialClubHelperText(selectedFocuses, t),
    [selectedFocuses, t],
  );

  const [chestByYear, setChestByYear] = useState<Record<string, string>>({});
  const [clubInput, setClubInput] = useState('');
  const [clubId, setClubId] = useState('');
  const [runningGroupName, setRunningGroupName] = useState('');
  const [runningGroupId, setRunningGroupId] = useState('');
  const [websiteInput, setWebsiteInput] = useState('');
  const [mainDisciplines, setMainDisciplines] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [clubModalVisible, setClubModalVisible] = useState(false);
  const [clubQuery, setClubQuery] = useState('');
  const [clubOptions, setClubOptions] = useState<SearchPickerOption[]>([]);
  const [clubsLoading, setClubsLoading] = useState(false);
  const [clubsError, setClubsError] = useState<string | null>(null);

  const [disciplineModalVisible, setDisciplineModalVisible] = useState(false);
  const [disciplineFocusId, setDisciplineFocusId] = useState<SportFocusId | null>(null);
  const [disciplineQuery, setDisciplineQuery] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      const fallbackMainDisciplines = normalizeMainDisciplines((userProfile as any)?.mainDisciplines ?? {}, {
        trackFieldMainEvent: (userProfile as any)?.trackFieldMainEvent ?? null,
        roadTrailMainEvent: (userProfile as any)?.roadTrailMainEvent ?? null,
      });
      if (!apiAccessToken) {
        if (!active) return;
        setChestByYear(normalizeChestByYear(userProfile?.chestNumbersByYear ?? {}));
        setClubInput(String((userProfile as any)?.trackFieldClub ?? (userProfile as any)?.runningClub ?? ''));
        setRunningGroupId(String((userProfile as any)?.runningClubGroupId ?? ''));
        setWebsiteInput(String((userProfile as any)?.website ?? ''));
        setMainDisciplines(fallbackMainDisciplines);
        setIsLoading(false);
        return;
      }
      try {
        const summary = await getProfileSummary(apiAccessToken);
        if (!active) return;
        setChestByYear(normalizeChestByYear(summary?.profile?.chest_numbers_by_year ?? {}));
        setClubInput(String(summary?.profile?.track_field_club ?? (userProfile as any)?.trackFieldClub ?? ''));
        setRunningGroupId(String(summary?.profile?.running_club_group_id ?? (userProfile as any)?.runningClubGroupId ?? ''));
        setWebsiteInput(String(summary?.profile?.website ?? (userProfile as any)?.website ?? ''));
        setMainDisciplines(normalizeMainDisciplines(summary?.profile?.main_disciplines ?? {}, {
          trackFieldMainEvent: summary?.profile?.track_field_main_event ?? null,
          roadTrailMainEvent: summary?.profile?.road_trail_main_event ?? null,
        }));
      } catch {
        if (!active) return;
        setChestByYear(normalizeChestByYear(userProfile?.chestNumbersByYear ?? {}));
        setClubInput(String((userProfile as any)?.trackFieldClub ?? (userProfile as any)?.runningClub ?? ''));
        setRunningGroupId(String((userProfile as any)?.runningClubGroupId ?? ''));
        setWebsiteInput(String((userProfile as any)?.website ?? ''));
        setMainDisciplines(fallbackMainDisciplines);
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [apiAccessToken, userProfile]);

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
    if (!clubModalVisible || !apiAccessToken) return;
    let mounted = true;
    const timeout = setTimeout(async () => {
      setClubsLoading(true);
      setClubsError(null);
      try {
        const res = await searchClubs(apiAccessToken, {
          q: clubQuery.trim() || undefined,
          focuses: clubSearchFocuses,
          limit: 200,
        });
        if (!mounted) return;
        const mapped = (res.clubs || []).map((club) => ({
          id: String(club.club_id || ''),
          title: String(club.name || club.code || '').trim(),
          subtitle: String(club.city || club.federation || club.code || '').trim() || null,
        })).filter((club) => club.id && club.title);
        setClubOptions(mapped);
      } catch (e: any) {
        if (!mounted) return;
        const message = e instanceof ApiError ? e.message : String(e?.message ?? e);
        setClubsError(message);
        setClubOptions([]);
      } finally {
        if (mounted) setClubsLoading(false);
      }
    }, 250);
    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [apiAccessToken, clubModalVisible, clubQuery, clubSearchFocuses]);

  const disciplineOptions = useMemo(() => {
    if (!disciplineFocusId) return [];
    const normalizedQuery = disciplineQuery.trim().toLowerCase();
    return buildDisciplineSearchOptions(disciplineFocusId, t).filter((option) => {
      if (!normalizedQuery) return true;
      const haystack = `${option.title} ${option.subtitle ?? ''}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [disciplineFocusId, disciplineQuery, t]);

  const handleSave = async () => {
    const payloadChest = Object.entries(chestByYear).reduce((acc, [year, chest]) => {
      const parsed = Number(chest);
      if (/^\d{4}$/.test(year) && Number.isInteger(parsed) && parsed >= 0) acc[year] = parsed;
      return acc;
    }, {} as Record<string, number>);
    const normalizedMainDisciplines = Object.entries(mainDisciplines).reduce((acc, [focusId, discipline]) => {
      const safeFocus = String(focusId || '').trim();
      const safeDiscipline = String(discipline || '').trim();
      if (!safeFocus || !safeDiscipline) return acc;
      acc[safeFocus] = safeDiscipline;
      return acc;
    }, {} as Record<string, string>);

    setIsSaving(true);
    try {
      await updateUserProfile({
        chestNumbersByYear: Object.entries(payloadChest).reduce((acc, [year, chest]) => {
          acc[year] = String(chest);
          return acc;
        }, {} as Record<string, string>),
        trackFieldClub: String(clubInput || '').trim(),
        runningClub: String(clubInput || '').trim(),
        runningClubGroupId: String(runningGroupId || '').trim(),
        trackFieldMainEvent: normalizedMainDisciplines['track-field'] || '',
        roadTrailMainEvent: normalizedMainDisciplines['road-events'] || '',
        mainDisciplines: normalizedMainDisciplines,
        website: String(websiteInput || '').trim(),
      } as any, { persistLocally: false });
      navigation.goBack();
    } catch (e: any) {
      const message = e instanceof ApiError ? e.message : String(e?.message ?? e);
      Alert.alert(t('Save failed'), message || t('Please try again'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFocus = () => {
    if (!focusToDelete || isDeleting || isSaving) return;
    const focusLabel = getSportFocusLabel(focusToDelete, t);
    Alert.alert(
      t('Delete sport focus'),
      t('Do you want to remove {{focus}} from your athlete profile?', { focus: focusLabel }),
      [
        { text: t('Cancel'), style: 'cancel' },
        {
          text: t('Delete'),
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              const nextSelectedFocuses = allSelectedFocuses.filter((focusId) => focusId !== focusToDelete);
              const nextMainDisciplines = Object.entries(mainDisciplines).reduce((acc, [focusId, discipline]) => {
                if (String(focusId).trim() === focusToDelete) return acc;
                const safeFocus = String(focusId || '').trim();
                const safeDiscipline = String(discipline || '').trim();
                if (!safeFocus || !safeDiscipline) return acc;
                acc[safeFocus] = safeDiscipline;
                return acc;
              }, {} as Record<string, string>);
              const nextChestByYear = nextSelectedFocuses.some((focusId) => focusUsesChestNumbers(focusId))
                ? chestByYear
                : {};

              await updateUserProfile({
                selectedEvents: nextSelectedFocuses,
                mainDisciplines: nextMainDisciplines,
                trackFieldMainEvent:
                  focusToDelete === 'track-field'
                    ? ''
                    : String(nextMainDisciplines['track-field'] || '').trim(),
                roadTrailMainEvent:
                  focusToDelete === 'road-events'
                    ? ''
                    : String(nextMainDisciplines['road-events'] || '').trim(),
                chestNumbersByYear: nextChestByYear,
              } as any);
              navigation.goBack();
            } catch (e: any) {
              const message = e instanceof ApiError ? e.message : String(e?.message ?? e);
              Alert.alert(t('Delete failed'), message || t('Please try again'));
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={Styles.mainContainer}>
      <SizeBox height={insets.top} />
      <View style={Styles.header}>
        <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
          <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
        </TouchableOpacity>
        <Text style={Styles.headerTitle}>{screenTitle}</Text>
        <View style={Styles.headerSpacer} />
      </View>

      <ScrollView style={Styles.container} showsVerticalScrollIndicator={false}>
        <SizeBox height={24} />
        {isLoading ? (
          <ActivityIndicator color={colors.primaryColor} />
        ) : (
          <>
            {selectedFocuses.length === 0 ? (
              <>
                <Text style={Styles.inlineHelperText}>{t('Add an athlete focus first to edit athlete details.')}</Text>
                <SizeBox height={14} />
              </>
            ) : null}
            {selectedFocuses.some((focusId) => focusUsesChestNumbers(focusId)) ? (
              <>
                <ChestNumbersByYearField
                  currentYear={currentYear}
                  values={chestByYear}
                  onChange={setChestByYear}
                  label={getChestNumberFieldLabel(currentYear, t)}
                  helperText={t('Keep the current year up to date and add older years only when you want them shown on the profile.')}
                  addYearLabel={t('Add year')}
                  moreYearsLabel={t('More years')}
                  inputPlaceholder={t('Enter chest number')}
                />
                <SizeBox height={14} />
              </>
            ) : null}

            {showOfficialClubField ? (
              <>
                <View style={Styles.addCardInputGroup}>
                  <Text style={Styles.addCardLabel}>{getOfficialClubFieldLabel(selectedFocuses, t)}</Text>
                  <SizeBox height={8} />
                  <View style={Styles.addCardInputContainer}>
                    <TouchableOpacity
                      style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}
                      activeOpacity={0.85}
                      onPress={() => setClubModalVisible(true)}
                    >
                      <Buildings size={20} color={colors.primaryColor} variant="Linear" />
                      <Text style={[Styles.addCardPlaceholder, clubInput ? Styles.addCardInputText : null]}>
                        {clubInput || getOfficialClubPlaceholder(selectedFocuses, t)}
                      </Text>
                    </TouchableOpacity>
                    {clubInput ? (
                      <TouchableOpacity onPress={() => { setClubInput(''); setClubId(''); }}>
                        <CloseCircle size={18} color={colors.grayColor} />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
                <SizeBox height={14} />
              </>
            ) : officialClubHelperText ? (
              <>
                <Text style={Styles.inlineHelperText}>{officialClubHelperText}</Text>
                <SizeBox height={14} />
              </>
            ) : null}

            <View style={Styles.addCardInputGroup}>
              <Text style={Styles.addCardLabel}>{getTrainingGroupFieldLabel(selectedFocuses, t)}</Text>
              <SizeBox height={8} />
              <View testID="track-field-group-invite-only" style={Styles.addCardInputContainer}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Profile2User size={20} color={colors.primaryColor} variant="Linear" />
                  <Text style={[Styles.addCardPlaceholder, runningGroupName ? Styles.addCardInputText : null]}>
                    {runningGroupName || getTrainingGroupPlaceholder(selectedFocuses, t)}
                  </Text>
                </View>
              </View>
              <Text style={Styles.inlineHelperText}>{getTrainingGroupHelperText(selectedFocuses, t)}</Text>
            </View>
            <SizeBox height={14} />

            {selectedFocuses.map((focusId) => {
              const currentDiscipline = getMainDisciplineForFocus(mainDisciplines, focusId, {
                trackFieldMainEvent: mainDisciplines['track-field'] ?? '',
                roadTrailMainEvent: mainDisciplines['road-events'] ?? '',
              });
              const currentDisciplineLabel = currentDiscipline
                ? getDisciplineLabel(focusId, currentDiscipline, t)
                : '';
              return (
                <React.Fragment key={focusId}>
                  <View style={Styles.addCardInputGroup}>
                    <Text style={Styles.addCardLabel}>{getFocusMainDisciplineLabel(focusId, t)}</Text>
                    <SizeBox height={8} />
                    <View style={Styles.addCardInputContainer}>
                      <TouchableOpacity
                        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}
                        activeOpacity={0.85}
                        onPress={() => {
                          setDisciplineFocusId(focusId);
                          setDisciplineQuery('');
                          setDisciplineModalVisible(true);
                        }}
                      >
                        <User size={20} color={colors.primaryColor} variant="Linear" />
                        <Text style={[Styles.addCardPlaceholder, currentDiscipline ? Styles.addCardInputText : null]}>
                          {currentDisciplineLabel || t('Choose main discipline')}
                        </Text>
                      </TouchableOpacity>
                      {currentDiscipline ? (
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
                  <SizeBox height={14} />
                </React.Fragment>
              );
            })}

            <View style={Styles.addCardInputGroup}>
              <Text style={Styles.addCardLabel}>{t('Website (optional)')}</Text>
              <SizeBox height={8} />
              <View style={Styles.addCardInputContainer}>
                <Global size={20} color={colors.primaryColor} variant="Linear" />
                <TextInput
                  style={Styles.addCardInput}
                  value={websiteInput}
                  onChangeText={setWebsiteInput}
                  placeholder={t('Add website')}
                  placeholderTextColor={colors.grayColor}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                />
              </View>
              <Text style={Styles.inlineHelperText}>{t('Website appears at the bottom of the profile and stays optional.')}</Text>
            </View>
          </>
        )}

        <SizeBox height={24} />
        <TouchableOpacity
          style={[Styles.continueBtn, isSaving && { opacity: 0.6 }]}
          disabled={isSaving || isDeleting}
          onPress={handleSave}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.pureWhite} />
          ) : (
            <Text style={Styles.continueBtnText}>{t('Save')}</Text>
          )}
        </TouchableOpacity>
        {focusToDelete ? (
          <>
            <SizeBox height={12} />
            <TouchableOpacity
              testID="delete-sport-focus-button"
              style={[Styles.continueBtn, { backgroundColor: colors.errorColor }, isDeleting && { opacity: 0.6 }]}
              disabled={isDeleting || isSaving}
              onPress={handleDeleteFocus}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color={colors.pureWhite} />
              ) : (
                <Text style={Styles.continueBtnText}>{t('Delete sport focus')}</Text>
              )}
            </TouchableOpacity>
          </>
        ) : null}
        <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
      </ScrollView>

      <SearchPickerModal
        visible={clubModalVisible}
        title={getOfficialClubModalTitle(selectedFocuses, t)}
        placeholder={getOfficialClubPlaceholder(selectedFocuses, t)}
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
          setClubInput(option.title);
          setClubModalVisible(false);
        }}
      />

      <SearchPickerModal
        visible={disciplineModalVisible}
        title={disciplineFocusId ? getFocusDisciplineModalTitle(disciplineFocusId, t) : t('Disciplines')}
        placeholder={t('Search discipline')}
        query={disciplineQuery}
        onChangeQuery={setDisciplineQuery}
        onClose={() => setDisciplineModalVisible(false)}
        options={disciplineOptions}
        loading={false}
        emptyText={t('No disciplines found.')}
        selectedId={disciplineFocusId ? getMainDisciplineForFocus(mainDisciplines, disciplineFocusId) : null}
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

export default TrackFieldSettings;
