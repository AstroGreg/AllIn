import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Alert, Modal, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import SizeBox from '../../../constants/SizeBox';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../../context/ThemeContext';
import {ArrowLeft2, ArrowRight, CloseCircle, SearchNormal1} from 'iconsax-react-nativejs';
import KeyboardAvoidingContainer from '../../../components/KeyboardAvoidingContainer';
import {useAuth} from '../../../context/AuthContext';
import {ApiError, getProfileSummary, searchMediaByBib} from '../../../services/apiGateway';
import {createStyles} from './BibSearchScreenStyles';
import {useEvents} from '../../../context/EventsContext';
import {useRoute} from '@react-navigation/native';
import {AI_GROUPS, AI_PEOPLE} from '../../../constants/AiFilterOptions';
import { useTranslation } from 'react-i18next'
import UnifiedSearchInput from '../../../components/unifiedSearchInput/UnifiedSearchInput';
import {
  buildSearchFilterChipLabel,
  formatSearchDateRangeLabel,
  getSearchFilterLabel,
  type SearchFilterKey,
} from '../../../utils/searchLabels';

type AiFilterState = {
  competition?: string;
  person?: string;
  group?: string;
  location?: string;
  competitionType?: string;
  timeRange?: {start: string; end: string} | null;
};

const BibSearchScreen = ({navigation}: any) => {
    const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();
  const styles = createStyles(colors);
  const {apiAccessToken, userProfile} = useAuth();
  const {events, isLoading: isLoadingEvents, error: eventsError} = useEvents();
  const route = useRoute<any>();
  const origin = route?.params?.origin;
  const filterState: AiFilterState | undefined = route?.params?.filterState;
  const [localFilters, setLocalFilters] = useState<AiFilterState>(filterState ?? {});
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [modalFilterKey, setModalFilterKey] = useState<keyof AiFilterState | null>(null);

  const [bib, setBib] = useState('');
  const [useDefaultBib, setUseDefaultBib] = useState(false);
  const [profileChestByYear, setProfileChestByYear] = useState<Record<string, string>>({});
  const [selectedEventId, setSelectedEventId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

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

  const getYearFromDateLike = useCallback((value?: string | null) => {
    const raw = String(value ?? '').trim();
    if (!raw) return null;
    const dt = new Date(raw);
    if (!Number.isNaN(dt.getTime())) return String(dt.getFullYear());
    const m = raw.match(/\b(19|20)\d{2}\b/);
    return m ? m[0] : null;
  }, []);

  const resolveDefaultBib = useCallback(
    (eventLike?: {event_date?: string | null; event_name?: string | null; event_location?: string | null} | null) => {
      const byYear = {
        ...normalizeChestByYear(userProfile?.chestNumbersByYear ?? {}),
        ...profileChestByYear,
      };

      const eventYear =
        getYearFromDateLike(eventLike?.event_date ?? null) ||
        getYearFromDateLike(eventLike?.event_name ?? null) ||
        getYearFromDateLike(eventLike?.event_location ?? null);
      if (eventYear && byYear[eventYear] != null && String(byYear[eventYear]).trim().length > 0) {
        return String(byYear[eventYear]).trim();
      }

      const currentYear = String(new Date().getFullYear());
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
    [getYearFromDateLike, normalizeChestByYear, profileChestByYear, userProfile?.chestNumbersByYear],
  );

  useEffect(() => {
    if (!apiAccessToken) return;
    let active = true;
    (async () => {
      try {
        const summary = await getProfileSummary(apiAccessToken);
        if (!active) return;
        setProfileChestByYear(normalizeChestByYear(summary?.profile?.chest_numbers_by_year ?? {}));
      } catch {
        // local profile fallback is handled by resolver
      }
    })();
    return () => {
      active = false;
    };
  }, [apiAccessToken, normalizeChestByYear]);

  useEffect(() => {
    if (!selectedEventId && events.length === 1) {
      setSelectedEventId(String(events[0].event_id));
    }
  }, [events, selectedEventId]);

  useEffect(() => {
    const query = String(localFilters?.competition ?? '').trim().toLowerCase();
    if (!query || selectedEventId || events.length === 0) return;
    const match = events.find((event) => {
      const name = String(event.event_name || event.event_title || '').toLowerCase();
      return name.includes(query);
    });
    if (match) {
      setSelectedEventId(String(match.event_id));
    }
  }, [events, localFilters?.competition, selectedEventId]);

  const selectedEvent = useMemo(
    () => events.find((event) => String(event.event_id) === String(selectedEventId)),
    [events, selectedEventId],
  );

  const defaultBib = useMemo(() => resolveDefaultBib(selectedEvent ?? null), [resolveDefaultBib, selectedEvent]);
  const activeBib = useMemo(
    () => String((useDefaultBib ? defaultBib : bib) ?? '').trim(),
    [bib, defaultBib, useDefaultBib],
  );

  useEffect(() => {
    if (!defaultBib && useDefaultBib) {
      setUseDefaultBib(false);
    }
  }, [defaultBib, useDefaultBib]);

  const filteredEvents = useMemo(() => {
    const query = String(localFilters?.competition ?? '').trim().toLowerCase();
    const range = localFilters?.timeRange ?? null;
    const rangeStart = range?.start ? new Date(range.start) : null;
    const rangeEnd = range?.end ? new Date(range.end) : null;
    const isWithinRange = (dateValue?: string | null) => {
      if (!rangeStart && !rangeEnd) return true;
      if (!dateValue) return false;
      const date = new Date(dateValue);
      if (Number.isNaN(date.getTime())) return false;
      if (rangeStart && rangeEnd) return date >= rangeStart && date <= rangeEnd;
      if (rangeStart) return date >= rangeStart;
      if (rangeEnd) return date <= rangeEnd;
      return true;
    };

    if (!query && !rangeStart && !rangeEnd) return events;
    return events.filter((event) => {
      const name = String(event.event_name || event.event_title || '').toLowerCase();
      const nameOk = query ? name.includes(query) : true;
      const dateOk = isWithinRange(event.event_date);
      return nameOk && dateOk;
    });
  }, [events, localFilters?.competition, localFilters?.timeRange]);

  const filterChips = useMemo(() => {
    const chips: Array<{key: keyof AiFilterState; label: string}> = [];
    if (localFilters.competition) chips.push({key: 'competition', label: buildSearchFilterChipLabel('Competition', String(localFilters.competition), t)});
    if (localFilters.person) chips.push({key: 'person', label: buildSearchFilterChipLabel('Person', String(localFilters.person), t)});
    if (localFilters.group) chips.push({key: 'group', label: buildSearchFilterChipLabel('Group', String(localFilters.group), t)});
    if (localFilters.location) chips.push({key: 'location', label: buildSearchFilterChipLabel('Location', String(localFilters.location), t)});
    if (localFilters.timeRange?.start || localFilters.timeRange?.end) {
      const start = localFilters.timeRange?.start
        ? new Date(localFilters.timeRange.start).toLocaleDateString()
        : '';
      const end = localFilters.timeRange?.end ? new Date(localFilters.timeRange.end).toLocaleDateString() : '';
      const rangeLabel = formatSearchDateRangeLabel(t, start, end);
      chips.push({key: 'timeRange', label: `${t('Date')}: ${rangeLabel}`});
    }
    return chips;
  }, [localFilters, t]);

  type FilterOption = {id: string; label: string; sublabel?: string};

  const locationOptions = useMemo(() => {
    const fromEvents = events
      .map((event) => String(event.event_location || '').trim())
      .filter(Boolean);
    const fromPeople = AI_PEOPLE.map((p) => p.location || '').filter(Boolean);
    const fromGroups = AI_GROUPS.map((g) => g.location || '').filter(Boolean);
    const unique = Array.from(new Set([...fromEvents, ...fromPeople, ...fromGroups]));
    return unique.map((loc) => ({id: loc, label: loc}));
  }, [events]);

  const filterOptions = useMemo<Record<keyof AiFilterState, FilterOption[]>>(() => {
    const competitions = events.map((event) => {
      const name = String(event.event_name || event.event_title || t('Competition'));
      const date = event.event_date ? new Date(event.event_date).toLocaleDateString() : '';
      const location = event.event_location ? String(event.event_location) : '';
      const sublabel = [date, location].filter(Boolean).join(' • ');
      return {id: String(event.event_id), label: name, sublabel};
    });
    const people = AI_PEOPLE.map((p) => ({id: p.name, label: p.name}));
    const groups = AI_GROUPS.map((g) => ({id: g.name, label: g.name}));
    return {
      competition: competitions,
      person: people,
      group: groups,
      location: locationOptions,
      competitionType: [],
      timeRange: [],
    };
  }, [events, locationOptions, t]);

  const openFilterModal = (key: keyof AiFilterState) => {
    setModalFilterKey(key);
    setShowFilterModal(true);
  };

  const handleSelectFilter = (option: FilterOption) => {
    if (!modalFilterKey) return;
    if (modalFilterKey === 'competition') {
      setSelectedEventId(option.id);
      setLocalFilters((prev) => ({...prev, competition: option.label}));
    } else {
      setLocalFilters((prev) => ({...prev, [modalFilterKey]: option.label}));
    }
    setShowFilterModal(false);
    setModalFilterKey(null);
  };

  const removeFilter = (key: keyof AiFilterState) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: key === 'timeRange' ? null : undefined,
    }));
    if (key === 'competition') {
      setSelectedEventId('');
    }
  };

  const handleSelectEvent = (event: any) => {
    const displayName = event.event_name || event.event_title || '';
    setSelectedEventId(String(event.event_id));
    if (displayName) {
      setLocalFilters((prev) => ({...prev, competition: String(displayName)}));
    }
  };

  const canSearch = activeBib.length > 0 && selectedEventId.trim().length > 0 && !isSearching;

  const runSearch = useCallback(async () => {
    if (!apiAccessToken) {
      Alert.alert(t('Missing API token'), t('Log in or set a Dev API token to use Chest Number Search.'));
      return;
    }

    const safeBib = activeBib;
    const safeEventId = selectedEventId.trim();
    if (!safeBib || !safeEventId) {
      Alert.alert(t('Missing info'), t('Please enter a chest number and select a competition.'));
      return;
    }

    setIsSearching(true);
    setErrorText(null);
    try {
      const res = await searchMediaByBib(apiAccessToken, {event_id: safeEventId, bib: safeBib});
      const results = Array.isArray(res?.results) ? res.results : [];

      navigation.navigate('AISearchResultsScreen', {
        matchedCount: results.length,
        results: results.map((r) => ({...r, event_id: safeEventId})),
        matchType: 'bib',
        refineContext: {
          bib: safeBib,
          date: localFilters?.timeRange?.start || localFilters?.timeRange?.end
            ? [
                localFilters?.timeRange?.start ? new Date(localFilters.timeRange.start).toLocaleDateString() : null,
                localFilters?.timeRange?.end ? new Date(localFilters.timeRange.end).toLocaleDateString() : null,
              ]
                .filter(Boolean)
                .join(' - ')
            : undefined,
        },
        manualBrowse: {
          eventId: safeEventId,
          competitionId: safeEventId,
          eventName: selectedEvent?.event_name || selectedEvent?.event_title || localFilters?.competition,
          eventDate: selectedEvent?.event_date,
        },
      });
    } catch (e: any) {
      if (e instanceof ApiError && e.status === 402) {
        setErrorText('Insufficient AI tokens to run this search.');
        return;
      }
      const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
      setErrorText(msg);
    } finally {
      setIsSearching(false);
    }
  }, [activeBib, apiAccessToken, localFilters?.competition, localFilters?.timeRange?.end, localFilters?.timeRange?.start, navigation, selectedEvent?.event_date, selectedEvent?.event_name, selectedEvent?.event_title, selectedEventId, t]);

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

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Chest number')}</Text>
        <View style={{width: 44, height: 44}} />
      </View>

      <KeyboardAvoidingContainer>
        <View style={styles.container}>
          <SizeBox height={18} />
          <Text style={styles.title}>{t('Find your photos by chest number')}</Text>
          <SizeBox height={6} />
          <Text style={styles.subtitle}>
            Enter the chest number from your bib. Choose the competition you participated in.
          </Text>

          <View style={styles.filtersSection}>
            <Text style={styles.filtersTitle}>{t('Filters')}</Text>
            {filterChips.length > 0 ? (
              <View style={styles.appliedChipsRow}>
                {filterChips.map((chip, index) => (
                  <View key={`${chip.key}-${index}`} style={styles.appliedChip}>
                    <Text style={styles.appliedChipText}>{chip.label}</Text>
                    <TouchableOpacity
                      style={styles.appliedChipRemove}
                      onPress={() => removeFilter(chip.key)}
                    >
                      <CloseCircle size={14} color={colors.subTextColor} variant="Linear" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.filtersHelper}>{t('No filters applied')}</Text>
            )}

            <View style={styles.filterButtonsRow}>
              <TouchableOpacity style={styles.filterButton} onPress={() => openFilterModal('competition')}>
                <Text style={styles.filterButtonText}>{getSearchFilterLabel('Competition', t)}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterButton} onPress={() => openFilterModal('person')}>
                <Text style={styles.filterButtonText}>{getSearchFilterLabel('Person', t)}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterButton} onPress={() => openFilterModal('group')}>
                <Text style={styles.filterButtonText}>{getSearchFilterLabel('Group', t)}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterButton} onPress={() => openFilterModal('location')}>
                <Text style={styles.filterButtonText}>{getSearchFilterLabel('Location', t)}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/*
            Filters modal
          */}
          <Modal
            visible={showFilterModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowFilterModal(false)}
          >
            <TouchableOpacity style={styles.filterModalOverlay} activeOpacity={1} onPress={() => setShowFilterModal(false)}>
              <TouchableOpacity style={styles.filterModalCard} activeOpacity={1}>
                <Text style={styles.filterModalTitle}>{t('Select')} {modalFilterKey ? getSearchFilterLabel(modalFilterKey.charAt(0).toUpperCase() + modalFilterKey.slice(1) as SearchFilterKey, t) : t('filter')}</Text>
                <ScrollView style={styles.filterModalList} contentContainerStyle={styles.filterModalListContent}>
                  {(modalFilterKey ? filterOptions[modalFilterKey] : []).map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={styles.filterModalOption}
                      onPress={() => handleSelectFilter(option)}
                    >
                      <Text style={styles.filterModalOptionText}>{option.label}</Text>
                      {!!option.sublabel && (
                        <Text style={styles.filterModalOptionSubText}>{option.sublabel}</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                  {(modalFilterKey ? filterOptions[modalFilterKey] : []).length === 0 && (
                    <Text style={styles.filterModalEmpty}>{t('No options available.')}</Text>
                  )}
                </ScrollView>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
          <SizeBox height={18} />

          <SizeBox height={22} />

          <Text style={styles.inputLabel}>{t('Chest number')}</Text>
          {!useDefaultBib || !defaultBib ? (
            <UnifiedSearchInput
              containerStyle={styles.inputContainer}
              left={<SearchNormal1 size={20} color={colors.grayColor} variant="Linear" />}
              inputStyle={styles.input}
              placeholder={t('e.g. 1234')}
              value={bib}
              onChangeText={setBib}
              keyboardType="number-pad"
              returnKeyType="next"
            />
          ) : null}
          <TouchableOpacity
            style={styles.defaultChestRow}
            onPress={() => {
              if (!defaultBib) return;
              setUseDefaultBib((prev) => !prev);
            }}
            activeOpacity={0.85}
          >
            <View style={[styles.defaultChestBox, useDefaultBib && styles.defaultChestBoxActive]}>
              {useDefaultBib ? <Text style={styles.defaultChestCheck}>{t('✓')}</Text> : null}
            </View>
            <Text style={styles.defaultChestText}>
              {defaultBib
                ? `${t('Use saved chest number')} (${defaultBib})`
                : t('No saved chest number yet. Enter the chest number for this competition below.')}
            </Text>
          </TouchableOpacity>

          <SizeBox height={18} />

          <Text style={styles.inputLabel}>{t('Competition')}</Text>
          <View style={styles.card}>
            {isLoadingEvents ? (
              <Text style={styles.subtitle}>{t('Loading your competitions…')}</Text>
            ) : filteredEvents.length > 0 ? (
              <>
                <Text style={styles.subtitle}>{t('Tap to select a competition')}</Text>
                <View style={styles.chipRow}>
                  {filteredEvents.slice(0, 12).map((event, idx) => {
                    const isActive = String(event.event_id) === String(selectedEventId);
                    const displayName = event.event_name || event.event_title || `${t('Competition')} ${idx + 1}`;
                    return (
                      <TouchableOpacity
                        key={String(event.event_id)}
                        onPress={() => handleSelectEvent(event)}
                        style={[styles.chip, isActive && styles.chipActive]}
                        activeOpacity={0.85}>
                        <Text style={styles.chipText} numberOfLines={1}>
                          {displayName}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            ) : (
              <Text style={styles.subtitle}>
                {events.length === 0
                  ? t('No subscribed competitions yet. Subscribe to a competition first.')
                  : t('No competitions match the selected filters.')}
              </Text>
            )}
          </View>

          {!!selectedEvent && (
            <>
              <SizeBox height={12} />
              <Text style={styles.subtitle}>{t('Selected competition')}: {selectedEvent.event_name || selectedEvent.event_title || t('Competition')}</Text>
            </>
          )}

          {!!eventsError && <Text style={styles.errorText}>{eventsError}</Text>}
          {!!errorText && <Text style={styles.errorText}>{errorText}</Text>}

          <SizeBox height={22} />

          <TouchableOpacity
            style={[styles.primaryButton, !canSearch && styles.primaryButtonDisabled]}
            onPress={runSearch}
            disabled={!canSearch}>
            <Text style={styles.primaryButtonText}>{isSearching ? t('Searching…') : t('Search')}</Text>
            <ArrowRight size={22} color={colors.pureWhite} variant="Linear" />
          </TouchableOpacity>

          <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
        </View>
      </KeyboardAvoidingContainer>
    </View>
  );
};

export default BibSearchScreen;
