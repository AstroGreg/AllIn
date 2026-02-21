import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import SizeBox from '../../../constants/SizeBox';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../../context/ThemeContext';
import {AddCircle, ArrowLeft2, CloseCircle, SearchNormal1, TickCircle} from 'iconsax-react-nativejs';
import KeyboardAvoidingContainer from '../../../components/KeyboardAvoidingContainer';
import CustomSwitch from '../../../components/customSwitch/CustomSwitch';
import {useAuth} from '../../../context/AuthContext';
import {
  ApiError,
  getAuthMe,
  getProfileSummary,
  grantFaceRecognitionConsent,
  searchFaceByEnrollment,
  searchMediaByBib,
  searchObject,
  searchEvents,
} from '../../../services/apiGateway';
import {createStyles} from './CombinedSearchScreenStyles';
import {useFocusEffect, useRoute} from '@react-navigation/native';
import { useTranslation } from 'react-i18next'

interface EventOption {
  id: string;
  name: string;
  location?: string | null;
  date?: string | null;
}

interface ResumeCombinedSearchPayload {
  selectedEvents?: Array<Partial<EventOption>>;
  bib?: string;
  contextText?: string;
  includeFace?: boolean;
  autoRun?: boolean;
}

const CombinedSearchScreen = ({navigation}: any) => {
    const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();
  const styles = createStyles(colors);
  const {apiAccessToken, userProfile} = useAuth();
  const route = useRoute<any>();
  const origin = route?.params?.origin;
  const preselectedEventsParam = useMemo(
    () => (Array.isArray(route?.params?.preselectedEvents) ? route?.params?.preselectedEvents : []),
    [route?.params?.preselectedEvents],
  );
  const prefillCompetitionName = route?.params?.prefillCompetitionName;
  const autoCompare = Boolean(route?.params?.autoCompare);
  const resumeCombinedSearch = route?.params?.resumeCombinedSearch as
    | ResumeCombinedSearchPayload
    | undefined;

  const [bib, setBib] = useState('');
  const [contextText, setContextText] = useState('');
  const [includeFace, setIncludeFace] = useState(true);

  const [selectedEvents, setSelectedEvents] = useState<EventOption[]>([]);
  const [showCompetitionModal, setShowCompetitionModal] = useState(false);
  const [competitionQuery, setCompetitionQuery] = useState('');
  const [eventOptions, setEventOptions] = useState<EventOption[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  const [isSearching, setIsSearching] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [needsConsent, setNeedsConsent] = useState(false);
  const [missingAngles, setMissingAngles] = useState<string[] | null>(null);
  const [authMe, setAuthMe] = useState<any | null>(null);
  const [showAutoCompareModal, setShowAutoCompareModal] = useState(false);
  const [pendingAutoRun, setPendingAutoRun] = useState(false);
  const [profileChestByYear, setProfileChestByYear] = useState<Record<string, string>>({});
  const [competitionRequiredError, setCompetitionRequiredError] = useState(false);

  const normalizeChestByYear = useCallback((raw: any): Record<string, string> => {
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
  }, []);

  const normalizeEventOptions = useCallback((events: any[]): EventOption[] => {
    return events
      .map((event: any) => ({
        id: String(event.id ?? event.event_id ?? ''),
        name: String(event.name ?? event.event_name ?? event.event_title ?? ''),
        location: event.location ?? event.event_location ?? null,
        date: event.date ?? event.event_date ?? null,
      }))
      .filter((event: EventOption) => Boolean(event.id && event.name));
  }, []);

  const selectedEventIds = useMemo(() => selectedEvents.map((event) => event.id), [selectedEvents]);
  const hasCompetition = selectedEventIds.length > 0;
  const getYearFromDateLike = useCallback((value?: string | null) => {
    const raw = String(value ?? '').trim();
    if (!raw) return null;
    const dt = new Date(raw);
    if (!Number.isNaN(dt.getTime())) return String(dt.getFullYear());
    const m = raw.match(/\b(19|20)\d{2}\b/);
    return m ? m[0] : null;
  }, []);
  const getYearFromEvent = useCallback(
    (event: EventOption) =>
      getYearFromDateLike(event.date ?? null) ||
      getYearFromDateLike(event.name ?? null) ||
      getYearFromDateLike(event.location ?? null),
    [getYearFromDateLike],
  );
  const resolveDefaultChestForEvents = useCallback(
    (events: EventOption[]) => {
      const byYear = {
        ...normalizeChestByYear(userProfile?.chestNumbersByYear ?? {}),
        ...profileChestByYear,
      };
      for (const event of events) {
        const year = getYearFromEvent(event);
        if (year && byYear[year] != null && String(byYear[year]).trim().length > 0) {
          return String(byYear[year]).trim();
        }
      }
      return '';
    },
    [getYearFromEvent, normalizeChestByYear, profileChestByYear, userProfile?.chestNumbersByYear],
  );

  const refreshMe = useCallback(async () => {
    if (!apiAccessToken) return;
    try {
      const me = await getAuthMe(apiAccessToken);
      setAuthMe(me);
      try {
        const summary = await getProfileSummary(apiAccessToken);
        setProfileChestByYear(normalizeChestByYear(summary?.profile?.chest_numbers_by_year ?? {}));
      } catch {
        // keep local fallback from userProfile
      }
    } catch (e: any) {
      const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
      setErrorText(msg);
    }
  }, [apiAccessToken, normalizeChestByYear]);

  useFocusEffect(
    useCallback(() => {
      refreshMe();
    }, [refreshMe]),
  );

  const fetchEvents = useCallback(
    async (query: string) => {
      if (!apiAccessToken) {
        setEventsError('Missing API token.');
        return;
      }
      setIsLoadingEvents(true);
      setEventsError(null);
      try {
        const res = await searchEvents(apiAccessToken, {q: query, limit: 60});
        const list = Array.isArray(res?.events) ? res.events : [];
        setEventOptions(
          list.map((event) => ({
            id: String(event.event_id),
            name: String(event.event_name || event.event_title || 'Competition'),
            location: event.event_location ?? null,
            date: event.event_date ?? null,
          })),
        );
      } catch (e: any) {
        const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
        setEventsError(msg);
      } finally {
        setIsLoadingEvents(false);
      }
    },
    [apiAccessToken],
  );

  useEffect(() => {
    if (!showCompetitionModal) return;
    const handle = setTimeout(() => {
      fetchEvents(competitionQuery.trim());
    }, 250);
    return () => clearTimeout(handle);
  }, [competitionQuery, fetchEvents, showCompetitionModal]);

  useEffect(() => {
    if (!showCompetitionModal) {
      setCompetitionQuery('');
      setEventsError(null);
    }
  }, [showCompetitionModal]);

  useEffect(() => {
    if (selectedEvents.length > 0) return;
    if (preselectedEventsParam.length > 0) {
      const normalized = normalizeEventOptions(preselectedEventsParam);
      if (normalized.length > 0) {
        setSelectedEvents(normalized);
      }
    } else if (prefillCompetitionName) {
      setCompetitionQuery(String(prefillCompetitionName));
      setShowCompetitionModal(true);
    }
  }, [normalizeEventOptions, prefillCompetitionName, preselectedEventsParam, selectedEvents.length]);

  useEffect(() => {
    if (!resumeCombinedSearch) return;

    const restoredEvents = Array.isArray(resumeCombinedSearch.selectedEvents)
      ? normalizeEventOptions(resumeCombinedSearch.selectedEvents)
      : [];
    if (restoredEvents.length > 0) {
      setSelectedEvents(restoredEvents);
    }

    if (typeof resumeCombinedSearch.bib === 'string') {
      setBib(resumeCombinedSearch.bib);
    }
    if (typeof resumeCombinedSearch.contextText === 'string') {
      setContextText(resumeCombinedSearch.contextText);
    }
    if (typeof resumeCombinedSearch.includeFace === 'boolean') {
      setIncludeFace(resumeCombinedSearch.includeFace);
    }
    if (resumeCombinedSearch.autoRun) {
      setPendingAutoRun(true);
    }

    navigation.setParams({resumeCombinedSearch: undefined});
  }, [navigation, normalizeEventOptions, resumeCombinedSearch]);

  useEffect(() => {
    if (autoCompare) {
      setShowAutoCompareModal(true);
    }
  }, [autoCompare]);

  useEffect(() => {
    if (!pendingAutoRun) return;
    if (!hasCompetition) return;
    if (!bib.trim() && !contextText.trim() && !includeFace) return;
    setPendingAutoRun(false);
    runCombinedSearch();
  }, [bib, contextText, hasCompetition, includeFace, pendingAutoRun, runCombinedSearch]);

  useEffect(() => {
    if (selectedEvents.length === 0) return;
    const chestNumber = resolveDefaultChestForEvents(selectedEvents);
    if (chestNumber) {
      setBib(chestNumber);
    }
  }, [resolveDefaultChestForEvents, selectedEvents]);

  const toggleEvent = (option: EventOption) => {
    setSelectedEvents((prev) => {
      const exists = prev.some((event) => event.id === option.id);
      if (exists) {
        return prev.filter((event) => event.id !== option.id);
      }
      setCompetitionRequiredError(false);
      return [...prev, option];
    });
  };

  const removeEvent = (id: string) => {
    setSelectedEvents((prev) => prev.filter((event) => event.id !== id));
  };

  const applyAutoCompare = () => {
    setShowAutoCompareModal(false);
    setIncludeFace(true);
    const chestNumber = resolveDefaultChestForEvents(selectedEvents);
    if (chestNumber) {
      setBib(chestNumber);
    }
    setPendingAutoRun(true);
  };

  const startFaceRegistrationGovIdFlow = useCallback(() => {
    const resumePayload: ResumeCombinedSearchPayload = {
      selectedEvents,
      bib,
      contextText,
      includeFace,
      autoRun: true,
    };
    const targetParams = {
      screen: 'Search',
      params: {
        screen: 'SearchFaceCaptureScreen',
        params: {
          mode: 'enrolFace',
          afterEnroll: {
            screen: 'AISearchScreen',
            params: {
              ...(origin ? {origin} : {}),
              resumeCombinedSearch: resumePayload,
            },
          },
        },
      },
    };
    const rootNav = navigation.getParent?.()?.getParent?.();
    if (rootNav) {
      rootNav.navigate('DocumentUploadScreen', {
        afterVerification: {
          screen: 'BottomTabBar',
          params: targetParams,
        },
      });
      return;
    }
    navigation.navigate('SearchFaceCaptureScreen', {
      mode: 'enrolFace',
      afterEnroll: {
        screen: 'AISearchScreen',
        params: {
          ...(origin ? {origin} : {}),
          resumeCombinedSearch: resumePayload,
        },
      },
    });
  }, [bib, contextText, includeFace, navigation, origin, selectedEvents]);

  const runCombinedSearch = useCallback(async () => {
    if (!apiAccessToken) {
      Alert.alert(t('Missing API token'), t('Log in to use AI Search.'));
      return;
    }

    if (selectedEventIds.length === 0) {
      setCompetitionRequiredError(true);
      return;
    }
    setCompetitionRequiredError(false);

    const wantsBib = bib.trim().length > 0;
    const wantsContext = contextText.trim().length > 0;
    const wantsFace = includeFace;

    if (!wantsBib && !wantsContext && !wantsFace) {
      setErrorText('Add a chest number, context, or enable face search.');
      return;
    }

    setIsSearching(true);
    setErrorText(null);
    setNeedsConsent(false);
    setMissingAngles(null);

    const collected: any[] = [];
    const seen = new Set<string>();
    const eventNameLookup = new Map(selectedEvents.map((event) => [event.id, event.name]));
    const addResults = (items: any[], matchType: string) => {
      for (const item of items) {
        const id = String(item.media_id ?? item.id ?? '');
        if (!id || seen.has(id)) continue;
        seen.add(id);
        const eventId = String(item.event_id ?? '').trim();
        collected.push({
          ...item,
          match_type: matchType,
          event_name: item.event_name ?? eventNameLookup.get(eventId),
        });
      }
    };

    const errors: string[] = [];

    try {
      if (wantsBib) {
        for (const eventId of selectedEventIds) {
          try {
            const res = await searchMediaByBib(apiAccessToken, {
              event_id: eventId,
              bib: bib.trim(),
            });
            const results = Array.isArray(res?.results) ? res.results : [];
            addResults(
              results.map((r: any) => ({
                ...r,
                event_id: eventId,
                event_name: eventNameLookup.get(eventId),
              })),
              'bib',
            );
          } catch (e: any) {
            const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
            errors.push(`Chest number: ${msg}`);
          }
        }
      }

      if (wantsContext) {
        for (const eventId of selectedEventIds) {
          try {
            const results = await searchObject(apiAccessToken, {
              q: contextText.trim(),
              top: 150,
              event_id: eventId,
            });
            const list = Array.isArray(results) ? results : [];
            addResults(
              list.map((r: any) => ({
                ...r,
                event_id: eventId,
                event_name: eventNameLookup.get(eventId),
              })),
              'context',
            );
          } catch (e: any) {
            const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
            errors.push(`Context: ${msg}`);
          }
        }
      }

      if (wantsFace) {
        try {
          const me = authMe ?? (await getAuthMe(apiAccessToken));
          setAuthMe(me);
          const subscribedIds = new Set(
            Array.isArray(me?.event_ids) ? me.event_ids.map((v: any) => String(v)) : [],
          );
          const faceEventIds = selectedEventIds.filter((id) => subscribedIds.has(id));
          if (faceEventIds.length === 0) {
            errors.push('Face: subscribe to the selected competitions to enable face search.');
          } else {
            const res = await searchFaceByEnrollment(apiAccessToken, {
              event_ids: faceEventIds,
              label: 'default',
              limit: 600,
              top: 100,
              save: true,
            });
            const results = Array.isArray(res?.results) ? res.results : [];
            addResults(
              results.map((r: any) => ({
                ...r,
                event_name: r.event_name ?? eventNameLookup.get(String(r.event_id ?? '').trim()),
              })),
              'face',
            );
          }
        } catch (e: any) {
          if (e instanceof ApiError) {
            const body = e.body ?? {};
            if (e.status === 403 && String(e.message).toLowerCase().includes('consent')) {
              setNeedsConsent(true);
              errors.push('Face: consent required.');
            } else if (e.status === 400 && Array.isArray(body?.missing_angles)) {
              setMissingAngles(body.missing_angles.map(String));
              errors.push('Face: enrollment required.');
              startFaceRegistrationGovIdFlow();
              return;
            } else {
              errors.push(`Face: ${e.message}`);
            }
          } else {
            errors.push(`Face: ${String(e?.message ?? e)}`);
          }
        }
      }

      if (collected.length === 0) {
        setErrorText(errors[0] ?? 'No matches found. Try adjusting your inputs.');
        return;
      }

      if (errors.length > 0) {
        setErrorText(errors[0]);
      }

      navigation.navigate('AISearchResultsScreen', {
        matchedCount: collected.length,
        results: collected,
        matchType: 'combined',
      });
    } finally {
      setIsSearching(false);
    }
  }, [
    apiAccessToken,
    authMe,
    bib,
    contextText,
    includeFace,
    navigation,
    startFaceRegistrationGovIdFlow,
    t,
    selectedEvents,
    selectedEventIds,
  ]);

  const handleGrantConsent = useCallback(async () => {
    if (!apiAccessToken) return;
    setErrorText(null);
    try {
      await grantFaceRecognitionConsent(apiAccessToken);
      setNeedsConsent(false);
      await refreshMe();
    } catch (e: any) {
      const message = e instanceof ApiError ? e.message : String(e?.message ?? e);
      setErrorText(message);
    }
  }, [apiAccessToken, refreshMe]);

  const handleEnroll = useCallback(() => {
    navigation.navigate('SearchFaceCaptureScreen', {
      mode: 'enrolFace',
      afterEnroll: {screen: 'AISearchScreen', params: origin ? {origin} : undefined},
    });
  }, [navigation, origin]);

  const handleBack = useCallback(() => {
    const parent = navigation.getParent?.();
    if (origin === 'home' && parent) {
      parent.navigate('Home');
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    if (parent) {
      parent.navigate('Search');
      return;
    }
    navigation.navigate('SearchScreen');
  }, [navigation, origin]);

  return (
    <View style={styles.mainContainer}>
      <SizeBox height={insets.top} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('AI Search')}</Text>
        <View style={{width: 44, height: 44}} />
      </View>

      <KeyboardAvoidingContainer>
        <View style={styles.container}>
          <SizeBox height={18} />
          <Text style={styles.title}>{t('Search by chest, face, and context')}</Text>
          <SizeBox height={6} />

          <View style={styles.competitionSection}>
            <Text style={styles.sectionTitle}>{t('Competitions')}</Text>

            {selectedEvents.length > 0 ? (
              <View style={styles.selectedCompetitionsRow}>
                <View style={styles.competitionChipsWrap}>
                  {selectedEvents.map((event) => (
                    <View key={event.id} style={styles.competitionChip}>
                      <Text style={styles.competitionChipText} numberOfLines={1}>
                        {event.name}
                      </Text>
                      <TouchableOpacity
                        style={styles.competitionChipRemove}
                        onPress={() => removeEvent(event.id)}
                      >
                        <CloseCircle size={14} color={colors.subTextColor} variant="Linear" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
                <TouchableOpacity
                  style={[styles.sectionAction, styles.inlineEditAction]}
                  onPress={() => setShowCompetitionModal(true)}
                >
                  <Text style={styles.sectionActionText}>Edit</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.emptyCompetitionCard,
                  competitionRequiredError && styles.emptyCompetitionCardError,
                ]}
                onPress={() => setShowCompetitionModal(true)}
              >
                <Text style={styles.emptyCompetitionText}>{t('Select competitions')}</Text>
              </TouchableOpacity>
            )}
          </View>

          <Modal
            visible={showCompetitionModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowCompetitionModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Choose one or more</Text>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setShowCompetitionModal(false)}
                  >
                    <CloseCircle size={22} color={colors.subTextColor} variant="Linear" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalSearchRow}>
                  <SearchNormal1 size={18} color={colors.subTextColor} variant="Linear" />
                  <TextInput
                    style={styles.modalSearchInput}
                    placeholder={t('Search competitions')}
                    placeholderTextColor={colors.subTextColor}
                    value={competitionQuery}
                    onChangeText={setCompetitionQuery}
                  />
                </View>

                {eventsError && <Text style={styles.modalErrorText}>{eventsError}</Text>}

                <ScrollView style={styles.modalList} contentContainerStyle={styles.modalListContent}>
                  {isLoadingEvents ? (
                    <View style={styles.modalLoadingRow}>
                      <ActivityIndicator color={colors.primaryColor} />
                    </View>
                  ) : eventOptions.length > 0 ? (
                    eventOptions.map((event) => {
                      const selected = selectedEventIds.includes(event.id);
                      const meta = [event.date ? new Date(event.date).toLocaleDateString() : null, event.location]
                        .filter(Boolean)
                        .join(' • ');
                      return (
                        <TouchableOpacity
                          key={event.id}
                          style={[styles.modalOption, selected && styles.modalOptionSelected]}
                          onPress={() => toggleEvent(event)}
                        >
                          <View style={styles.modalOptionTextWrap}>
                            <Text style={styles.modalOptionTitle}>{event.name}</Text>
                            {!!meta && <Text style={styles.modalOptionSubtext}>{meta}</Text>}
                          </View>
                          {selected && (
                            <TickCircle size={22} color={colors.primaryColor} variant="Bold" />
                          )}
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    <Text style={styles.modalEmptyText}>{t('No competitions found.')}</Text>
                  )}
                </ScrollView>

                <TouchableOpacity
                  style={styles.modalDoneButton}
                  onPress={() => setShowCompetitionModal(false)}
                >
                  <Text style={styles.modalDoneButtonText}>
                    Done ({selectedEventIds.length} selected)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Modal
            visible={showAutoCompareModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowAutoCompareModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{t('AI quick compare')}</Text>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setShowAutoCompareModal(false)}
                  >
                    <CloseCircle size={22} color={colors.subTextColor} variant="Linear" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.helperText}>
                  We will compare your saved face and chest number to quickly find results in these competitions.
                </Text>
                <SizeBox height={16} />
                <TouchableOpacity style={styles.modalDoneButton} onPress={applyAutoCompare}>
                  <Text style={styles.modalDoneButtonText}>{t('Compare now')}</Text>
                </TouchableOpacity>
                <SizeBox height={10} />
                <TouchableOpacity
                  style={styles.modalSecondaryButton}
                  onPress={() => setShowAutoCompareModal(false)}
                >
                  <Text style={styles.modalSecondaryButtonText}>{t('Not now')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <SizeBox height={22} />
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.faceSectionTitle}>{t('Face search')}</Text>
              <Text style={styles.helperText}>{t('Use your enrolled face to match photos.')}</Text>
            </View>
            <View style={styles.faceActions}>
              <TouchableOpacity style={styles.redoFaceButton} onPress={handleEnroll}>
                <AddCircle size={20} color={colors.primaryColor} variant="Bold" />
                <Text style={styles.redoFaceText}>{t('Redo face')}</Text>
              </TouchableOpacity>
              <CustomSwitch isEnabled={includeFace} toggleSwitch={() => setIncludeFace((prev) => !prev)} />
            </View>
          </View>

          {needsConsent && (
            <TouchableOpacity style={styles.secondaryButton} onPress={handleGrantConsent}>
              <Text style={styles.secondaryButtonText}>{t('Grant face consent')}</Text>
            </TouchableOpacity>
          )}

          {missingAngles && (
            <TouchableOpacity style={styles.secondaryButton} onPress={handleEnroll}>
              <Text style={styles.secondaryButtonText}>{t('Enroll your face')}</Text>
            </TouchableOpacity>
          )}

          <SizeBox height={20} />
          <Text style={styles.sectionTitle}>{t('Chest number')}</Text>
          <View style={styles.inputContainer}>
            <SearchNormal1 size={20} color={colors.grayColor} variant="Linear" />
            <SizeBox width={10} />
            <TextInput
              style={styles.input}
              placeholder={t('e.g. 1234')}
              placeholderTextColor={colors.grayColor}
              value={bib}
              onChangeText={setBib}
              keyboardType="number-pad"
              returnKeyType="next"
            />
          </View>

          <SizeBox height={20} />
          <Text style={styles.sectionTitle}>{t('Context')}</Text>
          <View style={styles.inputContainer}>
            <SearchNormal1 size={20} color={colors.grayColor} variant="Linear" />
            <SizeBox width={10} />
            <TextInput
              style={styles.input}
              placeholder={t('e.g. finish line, podium, medal')}
              placeholderTextColor={colors.grayColor}
              value={contextText}
              onChangeText={setContextText}
              returnKeyType="done"
            />
          </View>

          {errorText && <Text style={styles.errorText}>{errorText}</Text>}

          <SizeBox height={20} />
          <TouchableOpacity
            style={[styles.primaryButton, (!hasCompetition || isSearching) && styles.primaryButtonDisabled]}
            onPress={runCombinedSearch}
            disabled={!hasCompetition || isSearching}
          >
                        <Text style={styles.primaryButtonText}>{isSearching ? t('Searching…') : t('Run AI search')}</Text>
          </TouchableOpacity>

          <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
        </View>
      </KeyboardAvoidingContainer>
    </View>
  );
};

export default CombinedSearchScreen;
