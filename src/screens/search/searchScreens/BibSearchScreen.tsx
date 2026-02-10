import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import SizeBox from '../../../constants/SizeBox';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../../context/ThemeContext';
import {ArrowLeft2, ArrowRight, CloseCircle, SearchNormal1} from 'iconsax-react-nativejs';
import KeyboardAvoidingContainer from '../../../components/KeyboardAvoidingContainer';
import {useAuth} from '../../../context/AuthContext';
import {ApiError, searchMediaByBib} from '../../../services/apiGateway';
import {createStyles} from './BibSearchScreenStyles';
import {useEvents} from '../../../context/EventsContext';
import {useRoute} from '@react-navigation/native';
import {AI_GROUPS, AI_PEOPLE} from '../../../constants/AiFilterOptions';

type AiFilterState = {
  competition?: string;
  person?: string;
  group?: string;
  location?: string;
  competitionType?: string;
  timeRange?: {start: string; end: string} | null;
};

const BibSearchScreen = ({navigation}: any) => {
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();
  const styles = createStyles(colors);
  const {apiAccessToken} = useAuth();
  const {events, isLoading: isLoadingEvents, error: eventsError} = useEvents();
  const route = useRoute<any>();
  const origin = route?.params?.origin;
  const filterState: AiFilterState | undefined = route?.params?.filterState;
  const [localFilters, setLocalFilters] = useState<AiFilterState>(filterState ?? {});
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [modalFilterKey, setModalFilterKey] = useState<keyof AiFilterState | null>(null);

  const [bib, setBib] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

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
    if (localFilters.competition) chips.push({key: 'competition', label: `Competition: ${localFilters.competition}`});
    if (localFilters.person) chips.push({key: 'person', label: `Person: ${localFilters.person}`});
    if (localFilters.group) chips.push({key: 'group', label: `Group: ${localFilters.group}`});
    if (localFilters.location) chips.push({key: 'location', label: `Location: ${localFilters.location}`});
    if (localFilters.timeRange?.start || localFilters.timeRange?.end) {
      const start = localFilters.timeRange?.start
        ? new Date(localFilters.timeRange.start).toLocaleDateString()
        : '';
      const end = localFilters.timeRange?.end ? new Date(localFilters.timeRange.end).toLocaleDateString() : '';
      const rangeLabel = start && end ? `${start} – ${end}` : start ? `From ${start}` : `Until ${end}`;
      chips.push({key: 'timeRange', label: `Date: ${rangeLabel}`});
    }
    return chips;
  }, [localFilters]);

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
      const name = String(event.event_name || event.event_title || 'Competition');
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
  }, [events, locationOptions]);

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

  const canSearch = bib.trim().length > 0 && selectedEventId.trim().length > 0 && !isSearching;

  const runSearch = useCallback(async () => {
    if (!apiAccessToken) {
      Alert.alert('Missing API token', 'Log in or set a Dev API token to use Chest Number Search.');
      return;
    }

    const safeBib = bib.trim();
    const safeEventId = selectedEventId.trim();
    if (!safeBib || !safeEventId) {
      Alert.alert('Missing info', 'Please enter a chest number and select a competition.');
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
  }, [apiAccessToken, bib, navigation, selectedEventId]);

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
        <Text style={styles.headerTitle}>Chest number</Text>
        <View style={{width: 44, height: 44}} />
      </View>

      <KeyboardAvoidingContainer>
        <View style={styles.container}>
          <SizeBox height={18} />
          <Text style={styles.title}>Find your photos by chest number</Text>
          <SizeBox height={6} />
          <Text style={styles.subtitle}>
            Enter the chest number from your bib. Choose the competition you participated in.
          </Text>

          <View style={styles.filtersSection}>
            <Text style={styles.filtersTitle}>Filters</Text>
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
              <Text style={styles.filtersHelper}>No filters applied</Text>
            )}

            <View style={styles.filterButtonsRow}>
              <TouchableOpacity style={styles.filterButton} onPress={() => openFilterModal('competition')}>
                <Text style={styles.filterButtonText}>Competition</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterButton} onPress={() => openFilterModal('person')}>
                <Text style={styles.filterButtonText}>Person</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterButton} onPress={() => openFilterModal('group')}>
                <Text style={styles.filterButtonText}>Group</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterButton} onPress={() => openFilterModal('location')}>
                <Text style={styles.filterButtonText}>Location</Text>
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
                <Text style={styles.filterModalTitle}>Select {modalFilterKey ?? 'filter'}</Text>
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
                    <Text style={styles.filterModalEmpty}>No options available.</Text>
                  )}
                </ScrollView>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
          <SizeBox height={18} />

          <SizeBox height={22} />

          <Text style={styles.inputLabel}>Chest number</Text>
          <View style={styles.inputContainer}>
            <SearchNormal1 size={20} color={colors.grayColor} variant="Linear" />
            <SizeBox width={10} />
            <TextInput
              style={styles.input}
              placeholder="e.g. 1234"
              placeholderTextColor={colors.grayColor}
              value={bib}
              onChangeText={setBib}
              keyboardType="number-pad"
              returnKeyType="next"
            />
          </View>

          <SizeBox height={18} />

          <Text style={styles.inputLabel}>Competition</Text>
          <View style={styles.card}>
            {isLoadingEvents ? (
              <Text style={styles.subtitle}>Loading your competitions…</Text>
            ) : filteredEvents.length > 0 ? (
              <>
                <Text style={styles.subtitle}>Tap to select a competition</Text>
                <View style={styles.chipRow}>
                  {filteredEvents.slice(0, 12).map((event, idx) => {
                    const isActive = String(event.event_id) === String(selectedEventId);
                    const displayName = event.event_name || event.event_title || `Competition ${idx + 1}`;
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
                  ? 'No subscribed competitions yet. Subscribe to a competition first.'
                  : 'No competitions match the selected filters.'}
              </Text>
            )}
          </View>

          {!!selectedEvent && (
            <>
              <SizeBox height={12} />
              <Text style={styles.subtitle}>Selected competition: {selectedEvent.event_name || selectedEvent.event_title || 'Competition'}</Text>
            </>
          )}

          {!!eventsError && <Text style={styles.errorText}>{eventsError}</Text>}
          {!!errorText && <Text style={styles.errorText}>{errorText}</Text>}

          <SizeBox height={22} />

          <TouchableOpacity
            style={[styles.primaryButton, !canSearch && styles.primaryButtonDisabled]}
            onPress={runSearch}
            disabled={!canSearch}>
            <Text style={styles.primaryButtonText}>{isSearching ? 'Searching…' : 'Search'}</Text>
            <ArrowRight size={22} color={colors.pureWhite} variant="Linear" />
          </TouchableOpacity>

          <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
        </View>
      </KeyboardAvoidingContainer>
    </View>
  );
};

export default BibSearchScreen;
