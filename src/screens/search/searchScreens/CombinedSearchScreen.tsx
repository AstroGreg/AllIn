import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  InteractionManager,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import SizeBox from '../../../constants/SizeBox';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../../context/ThemeContext';
import {ArrowLeft2, CloseCircle, SearchNormal1, TickCircle} from 'iconsax-react-nativejs';
import KeyboardAvoidingContainer from '../../../components/KeyboardAvoidingContainer';
import CustomSwitch from '../../../components/customSwitch/CustomSwitch';
import {useAuth} from '../../../context/AuthContext';
import {
  ApiError,
  type FaceSearchGrade,
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
import UnifiedSearchInput from '../../../components/unifiedSearchInput/UnifiedSearchInput';

interface EventOption {
  id: string;
  name: string;
  location?: string | null;
  date?: string | null;
}

interface ResumeCombinedSearchPayload {
  selectedEvents?: Array<Partial<EventOption>>;
  bib?: string;
  useSavedBib?: boolean;
  contextText?: string;
  includeFace?: boolean;
  faceSearchGrade?: FaceSearchGrade;
  autoRun?: boolean;
}

const COMPETITION_AUTOLOAD_LIMIT = 3;
const COMPETITION_SEARCH_LIMIT = 60;

const CombinedSearchScreen = ({navigation}: any) => {
    const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();
  const styles = createStyles(colors);
  const {apiAccessToken, userProfile} = useAuth();
  const route = useRoute<any>();
  const origin = route?.params?.origin;
  const tutorialMode = Boolean(route?.params?.tutorialMode);
  const preselectedEventsParam = useMemo(
    () => (Array.isArray(route?.params?.preselectedEvents) ? route?.params?.preselectedEvents : []),
    [route?.params?.preselectedEvents],
  );
  const prefillCompetitionName = route?.params?.prefillCompetitionName;
  const autoCompare = Boolean(route?.params?.autoCompare);
  const resumeCombinedSearch = route?.params?.resumeCombinedSearch as
    | ResumeCombinedSearchPayload
    | undefined;
  const userHasSavedFace = Boolean((userProfile as any)?.faceVerified);
  const userFaceConsentGranted = Boolean((userProfile as any)?.faceConsentGranted);

  const [bib, setBib] = useState('');
  const [useDefaultBib, setUseDefaultBib] = useState(false);
  const [contextText, setContextText] = useState('');
  const [includeFace, setIncludeFace] = useState(userHasSavedFace);
  const [faceSearchGrade, setFaceSearchGrade] = useState<FaceSearchGrade>('hard');

  const [selectedEvents, setSelectedEvents] = useState<EventOption[]>([]);
  const [showCompetitionModal, setShowCompetitionModal] = useState(false);
  const [competitionQuery, setCompetitionQuery] = useState('');
  const [eventOptions, setEventOptions] = useState<EventOption[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [competitionPrefetchReady, setCompetitionPrefetchReady] = useState(false);
  const [screenInteractionReady, setScreenInteractionReady] = useState(false);

  const [isSearching, setIsSearching] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [needsConsent, setNeedsConsent] = useState(false);
  const [missingAngles, setMissingAngles] = useState<string[] | null>(null);
  const [faceEnrollmentStatus, setFaceEnrollmentStatus] = useState<'unknown' | 'ready' | 'missing'>(
    userHasSavedFace && userFaceConsentGranted
      ? 'ready'
      : 'unknown',
  );
  const [isCheckingFaceSetup, setIsCheckingFaceSetup] = useState(false);
  const [showAutoCompareModal, setShowAutoCompareModal] = useState(false);
  const [pendingAutoRun, setPendingAutoRun] = useState(false);
  const [profileChestByYear, setProfileChestByYear] = useState<Record<string, string>>({});
  const [profileFaceVerified, setProfileFaceVerified] = useState(userHasSavedFace);
  const [profileFaceConsentGranted, setProfileFaceConsentGranted] = useState(userFaceConsentGranted);
  const [competitionRequiredError, setCompetitionRequiredError] = useState(false);
  const [tutorialDemoRan, setTutorialDemoRan] = useState(false);
  const competitionOptionsCacheRef = useRef<Record<string, EventOption[]>>({});
  const competitionInflightRef = useRef<Record<string, Promise<EventOption[]>>>({});
  const bibPreferenceLockedRef = useRef(false);
  const facePreferenceLockedRef = useRef(false);

  const normalizeChestByYear = useCallback((raw: any): Record<string, string> => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
    const out: Record<string, string> = {};
    for (const [year, chest] of Object.entries(raw as Record<string, unknown>)) {
      const safeYear = String(year ?? '').trim();
      if (!/^\d{4}$/.test(safeYear)) continue;
      const safeChest = String(chest ?? '').trim();
      if (!/^\d+$/.test(safeChest)) continue;
      out[safeYear] = safeChest;
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

  const sameEventSelection = useCallback((left: EventOption[], right: EventOption[]) => {
    if (left.length !== right.length) return false;
    return left.every((event, index) => String(event.id) === String(right[index]?.id));
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

      const currentYear = String(new Date().getFullYear());
      for (const event of events) {
        const year = getYearFromEvent(event);
        if (year && byYear[year] != null && String(byYear[year]).trim().length > 0) {
          return String(byYear[year]).trim();
        }
      }

      if (byYear[currentYear] != null && String(byYear[currentYear]).trim().length > 0) {
        return String(byYear[currentYear]).trim();
      }

      const latestYear = Object.keys(byYear)
        .filter((year) => /^\d{4}$/.test(year) && String(byYear[year]).trim().length > 0)
        .sort((a, b) => Number(b) - Number(a))[0];
      if (latestYear) {
        return String(byYear[latestYear]).trim();
      }

      return '';
    },
    [getYearFromEvent, normalizeChestByYear, profileChestByYear, userProfile?.chestNumbersByYear],
  );
  const defaultBib = useMemo(() => resolveDefaultChestForEvents(selectedEvents), [resolveDefaultChestForEvents, selectedEvents]);
  const activeBib = useMemo(
    () => String((useDefaultBib ? defaultBib : bib) ?? '').trim(),
    [bib, defaultBib, useDefaultBib],
  );

  const refreshMe = useCallback(async () => {
    if (!apiAccessToken) return;
    try {
      const summary = await getProfileSummary(apiAccessToken);
      setProfileChestByYear(normalizeChestByYear(summary?.profile?.chest_numbers_by_year ?? {}));
      setProfileFaceVerified(Boolean(summary?.profile?.face_verified));
      setProfileFaceConsentGranted(Boolean((summary?.profile as any)?.face_consent_granted));
    } catch {
      // keep local fallback from userProfile
    }
  }, [apiAccessToken, normalizeChestByYear]);

  useEffect(() => {
    setProfileFaceVerified(userHasSavedFace);
  }, [userHasSavedFace]);

  useEffect(() => {
    setProfileFaceConsentGranted(userFaceConsentGranted);
  }, [userFaceConsentGranted]);

  useFocusEffect(
    useCallback(() => {
      refreshMe();
    }, [refreshMe]),
  );

  const fetchEvents = useCallback(
    async (query: string) => {
      const trimmedQuery = query.trim();
      const cacheKey = trimmedQuery.toLowerCase();
      const isAutoload = trimmedQuery.length === 0;
      const cached = competitionOptionsCacheRef.current[cacheKey];
      if (cached) {
        setEventsError(null);
        setEventOptions(cached);
        setIsLoadingEvents(false);
        if (cacheKey === '' && cached.length > 0) {
          setCompetitionPrefetchReady(true);
        }
        return;
      }

      setIsLoadingEvents(true);
      setEventsError(null);
      const requestAccessToken = apiAccessToken ?? '';
      try {
        let request = competitionInflightRef.current[cacheKey];
        if (!request) {
          request = searchEvents(requestAccessToken, {
            q: trimmedQuery,
            limit: isAutoload ? COMPETITION_AUTOLOAD_LIMIT : COMPETITION_SEARCH_LIMIT,
          }).then((res) => {
            const list = Array.isArray(res?.events) ? res.events : [];
            return list
              .slice(0, isAutoload ? COMPETITION_AUTOLOAD_LIMIT : undefined)
              .map((event) => ({
                id: String(event.event_id),
                name: String(event.event_name || event.event_title || t('Competition')),
                location: event.event_location ?? null,
                date: event.event_date ?? null,
              }));
          });
          competitionInflightRef.current[cacheKey] = request;
        }

        const options = await request;
        competitionOptionsCacheRef.current[cacheKey] = options;
        setEventOptions(options);
        if (cacheKey === '' && options.length > 0) {
          setCompetitionPrefetchReady(true);
        }
      } catch (e: any) {
        const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
        setEventsError(msg);
      } finally {
        delete competitionInflightRef.current[cacheKey];
        setIsLoadingEvents(false);
      }
    },
    [apiAccessToken, t],
  );

  useEffect(() => {
    fetchEvents('').catch(() => {
      // fall back to loading on modal open
    });
  }, [fetchEvents]);

  useEffect(() => {
    let cancelled = false;
    const task = InteractionManager.runAfterInteractions(() => {
      if (!cancelled) {
        setScreenInteractionReady(true);
      }
    });
    return () => {
      cancelled = true;
      setScreenInteractionReady(false);
      task.cancel?.();
    };
  }, []);

  useEffect(() => {
    if (!showCompetitionModal) return;
    const handle = setTimeout(() => {
      fetchEvents(competitionQuery.trim());
    }, competitionQuery.trim().length === 0 ? 0 : 120);
    return () => clearTimeout(handle);
  }, [competitionQuery, fetchEvents, showCompetitionModal]);

  useEffect(() => {
    if (!showCompetitionModal) {
      setCompetitionQuery('');
      setEventsError(null);
    }
  }, [showCompetitionModal]);

  useEffect(() => {
    if (preselectedEventsParam.length > 0) {
      const normalized = normalizeEventOptions(preselectedEventsParam);
      if (normalized.length > 0 && !sameEventSelection(selectedEvents, normalized)) {
        setSelectedEvents(normalized);
      }
    } else if (selectedEvents.length === 0 && prefillCompetitionName) {
      setCompetitionQuery(String(prefillCompetitionName));
      setShowCompetitionModal(true);
    }
  }, [normalizeEventOptions, prefillCompetitionName, preselectedEventsParam, sameEventSelection, selectedEvents]);

  useEffect(() => {
    if (!resumeCombinedSearch) return;

    const restoredEvents = Array.isArray(resumeCombinedSearch.selectedEvents)
      ? normalizeEventOptions(resumeCombinedSearch.selectedEvents)
      : [];
    if (restoredEvents.length > 0) {
      setSelectedEvents(restoredEvents);
    }

    if (typeof resumeCombinedSearch.bib === 'string') {
      if (resumeCombinedSearch.bib.trim().length > 0) {
        bibPreferenceLockedRef.current = true;
      }
      setBib(resumeCombinedSearch.bib);
    }
    if (typeof resumeCombinedSearch.useSavedBib === 'boolean') {
      bibPreferenceLockedRef.current = true;
      setUseDefaultBib(resumeCombinedSearch.useSavedBib);
    }
    if (typeof resumeCombinedSearch.contextText === 'string') {
      setContextText(resumeCombinedSearch.contextText);
    }
    if (typeof resumeCombinedSearch.includeFace === 'boolean') {
      facePreferenceLockedRef.current = true;
      setIncludeFace(resumeCombinedSearch.includeFace);
      if (resumeCombinedSearch.includeFace) {
        setFaceEnrollmentStatus('ready');
      }
    }
    if (resumeCombinedSearch.faceSearchGrade) {
      setFaceSearchGrade(resumeCombinedSearch.faceSearchGrade);
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
    if (!defaultBib) {
      if (useDefaultBib) {
        setUseDefaultBib(false);
      }
      return;
    }

    if (!bibPreferenceLockedRef.current) {
      setUseDefaultBib(true);
    }
  }, [defaultBib, useDefaultBib]);

  useEffect(() => {
    if (!profileFaceVerified) {
      setFaceEnrollmentStatus((prev) => (prev === 'missing' ? prev : 'unknown'));
      if (!facePreferenceLockedRef.current) {
        setIncludeFace(false);
      }
      return;
    }

    setFaceEnrollmentStatus(profileFaceConsentGranted ? 'ready' : 'unknown');

    if (!facePreferenceLockedRef.current) {
      setIncludeFace(true);
    }
  }, [profileFaceConsentGranted, profileFaceVerified]);

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
    facePreferenceLockedRef.current = true;
    setIncludeFace(true);
    if (defaultBib) {
      bibPreferenceLockedRef.current = true;
      setUseDefaultBib(true);
    }
    setPendingAutoRun(true);
  };

  const handleBibChange = useCallback((value: string) => {
    bibPreferenceLockedRef.current = true;
    if (useDefaultBib) {
      setUseDefaultBib(false);
    }
    setBib(value);
  }, [useDefaultBib]);

  const startFaceEnrollmentFlow = useCallback(() => {
    const resumePayload: ResumeCombinedSearchPayload = {
      selectedEvents,
      bib,
      useSavedBib: useDefaultBib,
      contextText,
      includeFace: true,
      faceSearchGrade,
      autoRun: true,
    };
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
  }, [bib, contextText, faceSearchGrade, navigation, origin, selectedEvents, useDefaultBib]);

  const verifyFaceSearchReady = useCallback(async (): Promise<'ready' | 'consent' | 'missing' | 'error'> => {
    if (!apiAccessToken || selectedEventIds.length === 0) {
      return 'error';
    }
    const requestAccessToken = apiAccessToken ?? '';
    try {
      await searchFaceByEnrollment(requestAccessToken, {
        event_ids: [selectedEventIds[0]],
        label: 'default',
        limit: 1,
        top: 1,
        save: false,
      });
      setNeedsConsent(false);
      setMissingAngles(null);
      setFaceEnrollmentStatus('ready');
      return 'ready';
    } catch (e: any) {
      if (e instanceof ApiError) {
        const body = e.body ?? {};
        if (e.status === 403 && String(e.message).toLowerCase().includes('consent')) {
          setNeedsConsent(true);
          setMissingAngles(null);
          return 'consent';
        }
        if (e.status === 400 && Array.isArray(body?.missing_angles)) {
          setMissingAngles(body.missing_angles.map(String));
          setFaceEnrollmentStatus('missing');
          setNeedsConsent(false);
          return 'missing';
        }
        setErrorText(e.message);
        return 'error';
      }
      setErrorText(String(e?.message ?? e));
      return 'error';
    }
  }, [apiAccessToken, selectedEventIds]);

  const runCombinedSearch = useCallback(async () => {
    if (selectedEventIds.length === 0) {
      setCompetitionRequiredError(true);
      return;
    }
    setCompetitionRequiredError(false);

    const wantsBib = activeBib.length > 0;
    const wantsContext = contextText.trim().length > 0;
    const wantsFace = includeFace;

    if (!wantsBib && !wantsContext && !wantsFace) {
      setErrorText(t('Add a chest number, context, or enable face search.'));
      return;
    }

    setIsSearching(true);
    setErrorText(null);
    setNeedsConsent(false);
    setMissingAngles(null);

    const collected: any[] = [];
    const seen = new Set<string>();
    const eventNameLookup = new Map(selectedEvents.map((event) => [event.id, event.name]));
    const requestAccessToken = apiAccessToken ?? '';
    const addResults = (items: any[], matchType: string) => {
      for (const item of items) {
        const id = String(item.media_id ?? item.id ?? '');
        if (!id || seen.has(id)) continue;
        seen.add(id);
        const eventId = String(item.event_id ?? '').trim();
        const matchTimeSeconds = Number(item.match_time_seconds);
        collected.push({
          media_id: id,
          event_id: eventId || undefined,
          match_type: matchType,
          event_name: item.event_name ?? eventNameLookup.get(eventId),
          type: item.type === 'video' ? 'video' : 'image',
          thumbnail_url: item.thumbnail_url ?? item.preview_url ?? item.original_url ?? '',
          preview_url: item.preview_url ?? item.thumbnail_url ?? item.original_url ?? '',
          original_url: item.original_url ?? '',
          bib_number: item.bib_number ?? undefined,
          match_time_seconds: Number.isFinite(matchTimeSeconds) ? matchTimeSeconds : undefined,
          created_at: item.created_at ?? undefined,
          confidence: item.confidence ?? undefined,
          match_percent: item.match_percent ?? undefined,
          score: item.score ?? undefined,
        });
      }
    };

    const errors: string[] = [];

    try {
      if (wantsBib) {
        const bibResponses = await Promise.all(
          selectedEventIds.map(async (eventId) => {
            try {
              const res = await searchMediaByBib(requestAccessToken, {
                event_id: eventId,
                bib: activeBib,
                include_original: false,
              });
              return {eventId, results: Array.isArray(res?.results) ? res.results : [], error: null};
            } catch (e: any) {
              const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
              return {eventId, results: [], error: `${t('Chest number')}: ${msg}`};
            }
          }),
        );
        for (const response of bibResponses) {
          if (response.error) {
            errors.push(response.error);
            continue;
          }
          addResults(
            response.results.map((r: any) => ({
              ...r,
              event_id: response.eventId,
              event_name: eventNameLookup.get(response.eventId),
            })),
            'bib',
          );
        }
      }

      if (wantsContext) {
        const contextResponses = await Promise.all(
          selectedEventIds.map(async (eventId) => {
            try {
              const results = await searchObject(requestAccessToken, {
                q: contextText.trim(),
                top: 150,
                event_id: eventId,
              });
              return {eventId, results: Array.isArray(results) ? results : [], error: null};
            } catch (e: any) {
              const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
              return {eventId, results: [], error: `${t('Context')}: ${msg}`};
            }
          }),
        );
        for (const response of contextResponses) {
          if (response.error) {
            errors.push(response.error);
            continue;
          }
          addResults(
            response.results.map((r: any) => ({
              ...r,
              event_id: response.eventId,
              event_name: eventNameLookup.get(response.eventId),
            })),
            'context',
          );
        }
      }

      if (wantsFace) {
        try {
          const res = await searchFaceByEnrollment(requestAccessToken, {
            event_ids: selectedEventIds,
            label: 'default',
            limit: 600,
            top: 100,
            save: true,
            grade: faceSearchGrade,
          });
          setFaceEnrollmentStatus('ready');
          const results = Array.isArray(res?.results) ? res.results : [];
          addResults(
            results.map((r: any) => ({
              ...r,
              event_name: r.event_name ?? eventNameLookup.get(String(r.event_id ?? '').trim()),
            })),
            'face',
          );
        } catch (e: any) {
          if (e instanceof ApiError) {
            const body = e.body ?? {};
            if (e.status === 403 && String(e.message).toLowerCase().includes('consent')) {
              setNeedsConsent(true);
              errors.push(t('Face: consent required.'));
            } else if (e.status === 400 && Array.isArray(body?.missing_angles)) {
              setMissingAngles(body.missing_angles.map(String));
              setFaceEnrollmentStatus('missing');
              setIncludeFace(false);
              errors.push(t('Face: enrollment required.'));
              setErrorText(t('Face: enrollment required.'));
              return;
            } else {
              errors.push(`${t('Face')}: ${e.message}`);
            }
          } else {
            errors.push(`${t('Face')}: ${String(e?.message ?? e)}`);
          }
        }
      }

      if (collected.length === 0) {
        setErrorText(errors[0] ?? t('No matches found. Try adjusting your inputs.'));
        return;
      }

      if (errors.length > 0) {
        setErrorText(errors[0]);
      }

      navigation.navigate('AISearchResultsScreen', {
        matchedCount: collected.length,
        results: collected,
        matchType: 'combined',
        refineContext: {
          bib: activeBib || undefined,
          date: selectedEvents.length === 1 ? selectedEvents[0]?.date ?? undefined : undefined,
        },
        manualBrowse: selectedEventIds.length === 1
          ? {
              eventId: selectedEventIds[0],
              competitionId: selectedEventIds[0],
              eventName: selectedEvents[0]?.name,
              eventDate: selectedEvents[0]?.date,
            }
          : undefined,
      });
    } finally {
      setIsSearching(false);
    }
  }, [
    apiAccessToken,
    activeBib,
    contextText,
    faceSearchGrade,
    includeFace,
    navigation,
    t,
    selectedEvents,
    selectedEventIds,
  ]);

  useEffect(() => {
    if (!pendingAutoRun) return;
    if (!hasCompetition) return;
    if (!activeBib && !contextText.trim() && !includeFace) return;
    setPendingAutoRun(false);
    runCombinedSearch();
  }, [activeBib, contextText, hasCompetition, includeFace, pendingAutoRun, runCombinedSearch]);

  const handleGrantConsent = useCallback(async () => {
    if (!apiAccessToken) return;
    setErrorText(null);
    try {
      await grantFaceRecognitionConsent(apiAccessToken);
      setNeedsConsent(false);
      setProfileFaceConsentGranted(true);
      await refreshMe();
      const status = await verifyFaceSearchReady();
      if (status === 'ready') {
        facePreferenceLockedRef.current = true;
        setIncludeFace(true);
        return;
      }
      if (status === 'missing') {
        Alert.alert(
          t('Face setup required'),
          t('Please enroll your face before enabling face search.'),
          [
            {text: t('Not now'), style: 'cancel'},
            {text: t('Set up face'), onPress: startFaceEnrollmentFlow},
          ],
        );
      }
    } catch (e: any) {
      const message = e instanceof ApiError ? e.message : String(e?.message ?? e);
      setErrorText(message);
    }
  }, [apiAccessToken, refreshMe, startFaceEnrollmentFlow, t, verifyFaceSearchReady]);

  const handleEnroll = useCallback(() => {
    facePreferenceLockedRef.current = true;
    setIncludeFace(false);
    setFaceEnrollmentStatus('unknown');
    startFaceEnrollmentFlow();
  }, [startFaceEnrollmentFlow]);

  const handleToggleFaceSearch = useCallback(async () => {
    if (includeFace) {
      facePreferenceLockedRef.current = true;
      setIncludeFace(false);
      return;
    }

    if (faceEnrollmentStatus === 'ready') {
      facePreferenceLockedRef.current = true;
      setIncludeFace(true);
      return;
    }

    if (faceEnrollmentStatus === 'missing') {
      Alert.alert(
        t('Face setup required'),
        t('Please enroll your face before enabling face search.'),
        [
          {text: t('Not now'), style: 'cancel'},
          {text: t('Set up face'), onPress: handleEnroll},
        ],
      );
      return;
    }

    if (selectedEventIds.length === 0) {
      setCompetitionRequiredError(true);
      Alert.alert(
        t('Select competitions'),
        t('Select at least one competition first, then enable face search.'),
        [
          {text: t('Cancel'), style: 'cancel'},
          {text: t('Select competitions'), onPress: () => setShowCompetitionModal(true)},
        ],
      );
      return;
    }

    setIsCheckingFaceSetup(true);
    setErrorText(null);
    setNeedsConsent(false);
    setMissingAngles(null);
    try {
      const status = await verifyFaceSearchReady();
      if (status === 'ready') {
        facePreferenceLockedRef.current = true;
        setIncludeFace(true);
        return;
      }
      if (status === 'consent') {
        Alert.alert(
          t('Face recognition consent'),
          t('Allow face recognition for AI search?'),
          [
            {text: t('Cancel'), style: 'cancel'},
            {
              text: t('Allow'),
              onPress: async () => {
                try {
                  await grantFaceRecognitionConsent(apiAccessToken ?? '');
                  setNeedsConsent(false);
                  setProfileFaceConsentGranted(true);
                  const retryStatus = await verifyFaceSearchReady();
                  if (retryStatus === 'ready') {
                    facePreferenceLockedRef.current = true;
                    setIncludeFace(true);
                    return;
                  }
                  if (retryStatus === 'missing') {
                    Alert.alert(
                      t('Face setup required'),
                      t('Please enroll your face before enabling face search.'),
                      [
                        {text: t('Not now'), style: 'cancel'},
                        {text: t('Set up face'), onPress: startFaceEnrollmentFlow},
                      ],
                    );
                  }
                } catch (consentError: any) {
                  const message = consentError instanceof ApiError ? consentError.message : String(consentError?.message ?? consentError);
                  setErrorText(message);
                }
              },
            },
          ],
        );
        return;
      }
      if (status === 'missing') {
        setIncludeFace(false);
        Alert.alert(
          t('Face setup required'),
          t('Please enroll your face before enabling face search.'),
          [
            {text: t('Not now'), style: 'cancel'},
            {text: t('Set up face'), onPress: startFaceEnrollmentFlow},
          ],
        );
      }
    } finally {
      setIsCheckingFaceSetup(false);
    }
  }, [
    apiAccessToken,
    faceEnrollmentStatus,
    handleEnroll,
    includeFace,
    selectedEventIds,
    startFaceEnrollmentFlow,
    t,
    verifyFaceSearchReady,
  ]);

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('SearchScreen');
  }, [navigation]);

  const runTutorialDemoSearch = useCallback(() => {
    const fakeResults = [
      {
        media_id: 'tutorial-face-1',
        event_id: 'tutorial-event',
        event_name: 'Tutorial Event',
        type: 'image',
        thumbnail_url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200&auto=format&fit=crop',
        preview_url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200&auto=format&fit=crop',
        match_type: 'face',
      },
      {
        media_id: 'tutorial-context-1',
        event_id: 'tutorial-event',
        event_name: 'Tutorial Event',
        type: 'image',
        thumbnail_url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1200&auto=format&fit=crop',
        preview_url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1200&auto=format&fit=crop',
        match_type: 'context',
      },
      {
        media_id: 'tutorial-bib-1',
        event_id: 'tutorial-event',
        event_name: 'Tutorial Event',
        type: 'image',
        bib_number: '4455',
        thumbnail_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop',
        preview_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop',
        match_type: 'bib',
      },
    ];
    setTutorialDemoRan(true);
    navigation.navigate('AISearchResultsScreen', {
      matchedCount: fakeResults.length,
      results: fakeResults,
      matchType: 'combined',
      refineContext: {
        bib: '4455',
      },
      manualBrowse: {
        eventId: 'tutorial-event',
        competitionId: 'tutorial-event',
        eventName: 'Tutorial Event',
      },
    });
  }, [navigation]);

  return (
    <View style={styles.mainContainer} testID="ai-search-screen">
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
          {tutorialMode && (
            <View
              style={{
                borderWidth: 1,
                borderColor: colors.lightGrayColor,
                borderRadius: 12,
                backgroundColor: colors.cardBackground,
                padding: 12,
                marginTop: 8,
                marginBottom: 10,
                gap: 8,
              }}
            >
              <Text style={{ fontWeight: '700', color: colors.mainTextColor, fontSize: 15 }}>
                {t('Tutorial: AI Search')}
              </Text>
              <Text style={{ color: colors.subTextColor, fontSize: 13, lineHeight: 18 }}>
                {t('Input 1: competitions. Input 2: chest number. Input 3: context text. Toggle face search to include face matching. Run the demo search to see face/context/chest matches.')}
              </Text>
              <TouchableOpacity
                style={{
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: colors.primaryColor,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={runTutorialDemoSearch}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>{t('Run tutorial search')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  height: 40,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: colors.lightGrayColor,
                  backgroundColor: tutorialDemoRan ? colors.primaryColor : colors.btnBackgroundColor,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                disabled={!tutorialDemoRan}
                onPress={() =>
                  navigation.navigate('AvailableEventsScreen', {
                    tutorialMode: true,
                    tutorialStep: 'subscribe-flow',
                  })
                }
              >
                <Text style={{ color: tutorialDemoRan ? '#fff' : colors.subTextColor, fontWeight: '700' }}>
                  {t('Continue to subscribe tutorial')}
                </Text>
              </TouchableOpacity>
            </View>
          )}

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
                  <Text style={styles.sectionActionText}>{t('Edit')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                testID="ai-search-open-competition-selector"
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
                  {t('We will compare your saved face and chest number to quickly find results in these competitions.')}
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
              <Text style={styles.helperText}>
                {isCheckingFaceSetup ? t('Checking face setup…') : t('Use your enrolled face to match photos.')}
              </Text>
            </View>
            <CustomSwitch isEnabled={includeFace} toggleSwitch={handleToggleFaceSearch} />
          </View>

          <SizeBox height={12} />
          <Text style={styles.sectionTitle}>{t('Face match grade')}</Text>
          <View style={styles.gradeRow}>
            {(['hard', 'medium', 'soft'] as FaceSearchGrade[]).map((grade) => {
              const active = faceSearchGrade === grade;
              return (
                <TouchableOpacity
                  key={grade}
                  style={[styles.gradeButton, active && styles.gradeButtonActive]}
                  onPress={() => setFaceSearchGrade(grade)}
                  testID={`ai-search-face-grade-${grade}`}
                >
                  <Text style={[styles.gradeButtonText, active && styles.gradeButtonTextActive]}>
                    {grade === 'hard' ? t('Hard · 90%') : grade === 'medium' ? t('Medium · 87%') : t('Soft · 85%')}
                  </Text>
                </TouchableOpacity>
              );
            })}
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
          {!useDefaultBib || !defaultBib ? (
            <UnifiedSearchInput
              testID="ai-search-bib-input"
              containerStyle={styles.inputContainer}
              left={<SearchNormal1 size={20} color={colors.grayColor} variant="Linear" />}
              inputStyle={styles.input}
              placeholder={t('e.g. 1234')}
              value={bib}
              onChangeText={handleBibChange}
              keyboardType="number-pad"
              returnKeyType="next"
            />
          ) : null}
          <SizeBox height={10} />
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.faceSectionTitle}>{t('Use saved chest number')}</Text>
              <Text style={styles.helperText}>
                {defaultBib
                  ? `${defaultBib}`
                  : t('No saved chest number yet. Enter the chest number for this competition below.')}
              </Text>
            </View>
            <CustomSwitch
              isEnabled={useDefaultBib}
              toggleSwitch={() => {
                if (!defaultBib) return;
                bibPreferenceLockedRef.current = true;
                setUseDefaultBib((prev) => !prev);
              }}
            />
          </View>

          <SizeBox height={20} />
          <Text style={styles.sectionTitle}>{t('Context')}</Text>
          <UnifiedSearchInput
            testID="ai-search-context-input"
            containerStyle={styles.inputContainer}
            left={<SearchNormal1 size={20} color={colors.grayColor} variant="Linear" />}
            inputStyle={styles.input}
            placeholder={t('e.g. finish line, podium, medal')}
            value={contextText}
            onChangeText={setContextText}
            returnKeyType="done"
          />

          {errorText && <Text style={styles.errorText}>{errorText}</Text>}

          <SizeBox height={20} />
          <TouchableOpacity
            testID="ai-search-run-button"
            style={[styles.primaryButton, (!hasCompetition || isSearching) && styles.primaryButtonDisabled]}
            onPress={runCombinedSearch}
            disabled={!hasCompetition || isSearching}
          >
                        <Text style={styles.primaryButtonText}>{isSearching ? t('Searching…') : t('Run AI search')}</Text>
          </TouchableOpacity>

          {!showCompetitionModal && competitionPrefetchReady ? (
            <View testID="ai-search-competition-prefetch-ready" style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }} />
          ) : null}
          {screenInteractionReady ? (
            <View testID="ai-search-screen-idle-ready" style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }} />
          ) : null}
          {showCompetitionModal && !isLoadingEvents && eventOptions.length > 0 ? (
            <View testID="ai-search-competition-modal-ready" style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }} />
          ) : null}

          <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
        </View>
      </KeyboardAvoidingContainer>
      <View
        pointerEvents={showCompetitionModal ? 'auto' : 'none'}
        style={[
          styles.modalOverlay,
          styles.modalOverlayAbsolute,
          !showCompetitionModal ? { opacity: 0 } : null,
        ]}
        testID="ai-search-competition-modal-overlay"
      >
          <View style={styles.modalCard} testID="ai-search-competition-modal-card">
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('Choose one or more')}</Text>
              <TouchableOpacity
                testID="ai-search-competition-modal-close"
                style={styles.modalCloseButton}
                onPress={() => setShowCompetitionModal(false)}
              >
                <CloseCircle size={22} color={colors.subTextColor} variant="Linear" />
              </TouchableOpacity>
            </View>

            <UnifiedSearchInput
              testID="ai-search-competition-modal-input"
              containerStyle={styles.modalSearchRow}
              inputStyle={styles.modalSearchInput}
              placeholder={t('Search competitions')}
              placeholderTextColor={colors.subTextColor}
              value={competitionQuery}
              onChangeText={setCompetitionQuery}
            />

            {eventsError && <Text style={styles.modalErrorText}>{eventsError}</Text>}

            {isLoadingEvents ? (
              <View style={styles.modalLoadingRow}>
                <ActivityIndicator color={colors.primaryColor} />
              </View>
            ) : (
              <FlatList
                data={eventOptions}
                keyExtractor={(item) => item.id}
                style={styles.modalList}
                contentContainerStyle={styles.modalListContent}
                keyboardShouldPersistTaps="handled"
                initialNumToRender={8}
                maxToRenderPerBatch={8}
                windowSize={4}
                removeClippedSubviews
                renderItem={({item: event}) => {
                  const selected = selectedEventIds.includes(event.id);
                  const meta = [event.date ? new Date(event.date).toLocaleDateString() : null, event.location]
                    .filter(Boolean)
                    .join(' • ');
                  return (
                    <TouchableOpacity
                      key={event.id}
                      testID={`ai-search-competition-option-${event.id}`}
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
                }}
                ListEmptyComponent={
                  <Text style={styles.modalEmptyText}>{t('No competitions found.')}</Text>
                }
              />
            )}

            <TouchableOpacity
              testID="ai-search-competition-modal-done"
              style={styles.modalDoneButton}
              onPress={() => setShowCompetitionModal(false)}
            >
              <Text style={styles.modalDoneButtonText}>
                {t('Done')} ({selectedEventIds.length} {t('selected')})
              </Text>
            </TouchableOpacity>
          </View>
      </View>
    </View>
  );
};

export default CombinedSearchScreen;
