import {View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal} from 'react-native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import SizeBox from '../../../constants/SizeBox';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../../context/ThemeContext';
import {ArrowLeft2, SearchNormal1, Add, ArrowRight, CloseCircle} from 'iconsax-react-nativejs';
import { createStyles } from './FaceSearchScreenStyles';
import {useAuth} from '../../../context/AuthContext';
import {useFocusEffect} from '@react-navigation/native';
import {
  ApiError,
  getAuthMe,
  grantFaceRecognitionConsent,
  searchFaceByEnrollment,
  subscribeToEvent,
} from '../../../services/apiGateway';
import {useEvents} from '../../../context/EventsContext';
import {AI_GROUPS, AI_PEOPLE} from '../../../constants/AiFilterOptions';

type AiFilterState = {
  competition?: string;
  person?: string;
  group?: string;
  location?: string;
  competitionType?: string;
  timeRange?: {start: string; end: string} | null;
};

const FaceSearchScreen = ({navigation, route}: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const {apiAccessToken} = useAuth();
    const {events, eventNameById} = useEvents();
    const origin = route?.params?.origin;
    const filterState: AiFilterState | undefined = route?.params?.filterState;
    const [localFilters, setLocalFilters] = useState<AiFilterState>(filterState ?? {});
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [modalFilterKey, setModalFilterKey] = useState<keyof AiFilterState | null>(null);

    const [isLoadingMe, setIsLoadingMe] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [eventIdInput, setEventIdInput] = useState('');
    const [authMe, setAuthMe] = useState<any | null>(null);
    const [missingAngles, setMissingAngles] = useState<string[] | null>(null);
    const [needsConsent, setNeedsConsent] = useState(false);
    const [errorText, setErrorText] = useState<string | null>(null);
    const hasCompetition = Boolean(localFilters?.competition && String(localFilters.competition).trim());

    const refreshMe = useCallback(async () => {
        if (!apiAccessToken) return;
        setIsLoadingMe(true);
        setErrorText(null);
        try {
            const me = await getAuthMe(apiAccessToken);
            setAuthMe(me);
        } catch (e: any) {
            const message = e instanceof ApiError ? e.message : String(e?.message ?? e);
            setErrorText(message);
        } finally {
            setIsLoadingMe(false);
        }
    }, [apiAccessToken]);

    useFocusEffect(
        useCallback(() => {
            refreshMe();
        }, [refreshMe]),
    );

    const subscribedEventIds = useMemo<string[]>(() => {
        const ids: string[] = Array.isArray(authMe?.event_ids) ? authMe.event_ids.map((v: any) => String(v)) : [];
        const filtered = ids.map((s: string) => s.trim()).filter(Boolean);
        const unique: string[] = Array.from(new Set(filtered));
        if (!searchText.trim()) return unique;
        const q = searchText.trim().toLowerCase();
        return unique.filter((id: string) => id.toLowerCase().includes(q));
    }, [authMe?.event_ids, searchText]);

    const filteredEventIds = useMemo<string[]>(() => {
        const competitionQuery = String(localFilters?.competition ?? '').trim().toLowerCase();
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

        const allowedIds = new Set(
            events
                .filter((event) => {
                    const name = String(event.event_name || event.event_title || '').toLowerCase();
                    const nameOk = competitionQuery ? name.includes(competitionQuery) : true;
                    const dateOk = isWithinRange(event.event_date);
                    return nameOk && dateOk;
                })
                .map((event) => String(event.event_id)),
        );
        if (allowedIds.size === 0) return subscribedEventIds;

        const baseList = !competitionQuery && !rangeStart && !rangeEnd
            ? subscribedEventIds
            : subscribedEventIds.filter((id) => allowedIds.has(id));

        const textQuery = searchText.trim().toLowerCase();
        if (!textQuery) return baseList;
        return baseList.filter((id) => eventNameById(id).toLowerCase().includes(textQuery));
    }, [events, eventNameById, localFilters?.competition, localFilters?.timeRange, searchText, subscribedEventIds]);

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
    };

    const runSearch = useCallback(async () => {
        if (!apiAccessToken) {
            Alert.alert('Missing API token', 'Log in or set a Dev API token to use Face Search.');
            return;
        }

        if (!localFilters.competition || !String(localFilters.competition).trim()) {
            setErrorText('Select a competition first.');
            return;
        }

        setNeedsConsent(false);
        setMissingAngles(null);
        setErrorText(null);
        setIsSearching(true);
        try {
            const me = authMe ?? (await getAuthMe(apiAccessToken));
            setAuthMe(me);

            const hasFilterConstraints = Boolean(
                (localFilters?.competition && String(localFilters.competition).trim()) ||
                localFilters?.timeRange,
            );
            if (hasFilterConstraints && filteredEventIds.length === 0) {
                setErrorText('No events match the selected filters.');
                return;
            }
            const event_ids: string[] = filteredEventIds.length > 0
                ? filteredEventIds
                : (Array.isArray(me?.event_ids) ? me.event_ids.map((v: any) => String(v)) : []);
            if (event_ids.length === 0) {
                setErrorText('No subscribed events found for your profile. Subscribe to an event first.');
                return;
            }

            const res = await searchFaceByEnrollment(apiAccessToken, {
                event_ids,
                label: 'default',
                limit: 600,
                top: 100,
            });

            navigation.navigate('AISearchResultsScreen', {
                matchedCount: Array.isArray(res?.results) ? res.results.length : 0,
                results: res?.results ?? [],
                matchType: 'face',
            });
        } catch (e: any) {
            if (e instanceof ApiError) {
                const body = e.body ?? {};
                if (e.status === 403 && String(e.message).toLowerCase().includes('consent')) {
                    setNeedsConsent(true);
                    setErrorText('Face recognition consent is required.');
                    return;
                }
                if (e.status === 400 && Array.isArray(body?.missing_angles)) {
                    setMissingAngles(body.missing_angles.map(String));
                    setErrorText('Face Search is not set up yet. Please enroll your face first.');
                    return;
                }
                setErrorText(`${e.message}`);
            } else {
                setErrorText(String(e?.message ?? e));
            }
        } finally {
            setIsSearching(false);
        }
    }, [apiAccessToken, authMe, localFilters?.competition, localFilters?.timeRange, filteredEventIds, navigation]);

    const handleGrantConsent = useCallback(async () => {
        if (!apiAccessToken) return;
        setErrorText(null);
        try {
            await grantFaceRecognitionConsent(apiAccessToken);
            setNeedsConsent(false);
            await refreshMe();
            runSearch();
        } catch (e: any) {
            const message = e instanceof ApiError ? e.message : String(e?.message ?? e);
            setErrorText(message);
        }
    }, [apiAccessToken, refreshMe, runSearch]);

    const handleEnroll = useCallback(() => {
        navigation.navigate('SearchFaceCaptureScreen', {
            mode: 'enrolFace',
            afterEnroll: {
                screen: 'FaceSearchScreen',
                params: {autoSearch: true, ...(origin ? {origin} : {})},
            },
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

    useEffect(() => {
        if (route?.params?.autoSearch) {
            navigation.setParams({autoSearch: false});
            runSearch();
        }
    }, [navigation, route?.params?.autoSearch, runSearch]);

    const handleSubscribe = useCallback(async () => {
        if (!apiAccessToken) return;
        const eventId = eventIdInput.trim();
        if (!eventId) {
            Alert.alert('Missing event id', 'Paste an event UUID first.');
            return;
        }
        setErrorText(null);
        try {
            await subscribeToEvent(apiAccessToken, eventId);
            setEventIdInput('');
            await refreshMe();
        } catch (e: any) {
            const message = e instanceof ApiError ? e.message : String(e?.message ?? e);
            setErrorText(message);
        }
    }, [apiAccessToken, eventIdInput, refreshMe]);

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Faces</Text>
                <View style={{width: 44, height: 44}} />
            </View>

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <SizeBox height={24} />

                {/* Top row */}
                <View style={styles.searchLabelRow}>
                    <Text style={styles.searchLabel}>Face Search</Text>
                    <TouchableOpacity
                        style={styles.addFaceButton}
                        onPress={handleEnroll}
                    >
                        <Text style={styles.addFaceButtonText}>Enroll Face</Text>
                        <Add size={16} color="#FFFFFF" variant="Linear" />
                    </TouchableOpacity>
                </View>

                <SizeBox height={8} />

                <View style={styles.filtersSection}>
                    <Text style={styles.appliedLabel}>Filters</Text>
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

                <SizeBox height={8} />

                {/* Status */}
                <View style={styles.faceGroupCard}>
                    <Text style={styles.faceGroupName}>Find photos of you</Text>
                    <SizeBox height={8} />
                    <Text style={[styles.searchInput, {color: colors.grayColor}]}>
                        This uses the backend endpoint {'/ai/search/face'} and searches across competitions you are subscribed to.
                    </Text>
                    <SizeBox height={12} />
                    <Text style={[styles.searchInput, {color: colors.mainTextColor}]}>
                        Subscribed competitions: {isLoadingMe ? 'Loading…' : String(authMe?.event_ids?.length ?? 0)}
                    </Text>
                    {missingAngles && missingAngles.length > 0 && (
                        <>
                            <SizeBox height={12} />
                            <Text style={[styles.searchInput, {color: colors.mainTextColor}]}>
                                Missing enrollment angles: {missingAngles.join(', ')}
                            </Text>
                        </>
                    )}
                    {errorText && (
                        <>
                            <SizeBox height={12} />
                            <Text style={[styles.searchInput, {color: '#FF3B30'}]}>{errorText}</Text>
                        </>
                    )}
                </View>

                {/* Search filter input (for competition list) */}
                <View style={styles.searchInputContainer}>
                    <SearchNormal1 size={24} color={colors.grayColor} variant="Linear" />
                    <SizeBox width={6} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Filter competitions"
                        placeholderTextColor={colors.grayColor}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>

                <SizeBox height={24} />

                {/* Subscribed competition list */}
                {filteredEventIds.length > 0 ? (
                    <View style={styles.faceGroupCard}>
                        <Text style={styles.searchLabel}>Competitions to search</Text>
                        <SizeBox height={8} />
                        {filteredEventIds.slice(0, 10).map((id) => (
                            <Text key={id} style={[styles.searchInput, {color: colors.mainTextColor}]}>
                                {eventNameById(id)}
                            </Text>
                        ))}
                        {filteredEventIds.length > 10 && (
                            <Text style={[styles.searchInput, {color: colors.grayColor}]}>
                                …and {filteredEventIds.length - 10} more
                            </Text>
                        )}
                    </View>
                ) : (
                    <View style={styles.faceGroupCard}>
                        <Text style={styles.searchLabel}>No competitions found</Text>
                        <SizeBox height={8} />
                        <Text style={[styles.searchInput, {color: colors.grayColor}]}>
                            Your profile has no competition subscriptions yet. If you know an event UUID, paste it below to subscribe (advanced).
                        </Text>
                        <SizeBox height={12} />
                        <View style={styles.searchInputContainer}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Event UUID"
                                placeholderTextColor={colors.grayColor}
                                value={eventIdInput}
                                onChangeText={setEventIdInput}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                        <SizeBox height={12} />
                        <TouchableOpacity
                            style={[styles.selectButton, {alignSelf: 'flex-start'}]}
                            onPress={handleSubscribe}
                            disabled={!eventIdInput.trim()}
                        >
                            <Text style={styles.selectButtonText}>Subscribe</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <SizeBox height={100} />
            </ScrollView>

            {/* Continue Button */}
            <View style={[styles.bottomButtonContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
                <TouchableOpacity
                    style={[
                        styles.continueButton,
                        (isSearching || !hasCompetition) && styles.continueButtonDisabled,
                    ]}
                    onPress={needsConsent ? handleGrantConsent : runSearch}
                    disabled={isSearching || !hasCompetition}
                >
                    <Text style={styles.continueButtonText}>
                        {needsConsent ? 'Enable Face Recognition' : isSearching ? 'Searching…' : 'Find My Photos'}
                    </Text>
                    <ArrowRight size={24} color="#FFFFFF" variant="Linear" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default FaceSearchScreen;
