var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { ArrowLeft2, ArrowRight, CloseCircle, SearchNormal1 } from 'iconsax-react-nativejs';
import KeyboardAvoidingContainer from '../../../components/KeyboardAvoidingContainer';
import { useAuth } from '../../../context/AuthContext';
import { ApiError, getProfileSummary, searchMediaByBib } from '../../../services/apiGateway';
import { createStyles } from './BibSearchScreenStyles';
import { useEvents } from '../../../context/EventsContext';
import { useRoute } from '@react-navigation/native';
import { AI_GROUPS, AI_PEOPLE } from '../../../constants/AiFilterOptions';
import { useTranslation } from 'react-i18next';
import UnifiedSearchInput from '../../../components/unifiedSearchInput/UnifiedSearchInput';
import { buildSearchFilterChipLabel, formatSearchDateRangeLabel, getSearchFilterLabel, } from '../../../utils/searchLabels';
const BibSearchScreen = ({ navigation }) => {
    var _a, _b, _c, _d;
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const { apiAccessToken, userProfile } = useAuth();
    const { events, isLoading: isLoadingEvents, error: eventsError } = useEvents();
    const route = useRoute();
    const origin = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.origin;
    const filterState = (_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.filterState;
    const [localFilters, setLocalFilters] = useState(filterState !== null && filterState !== void 0 ? filterState : {});
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [modalFilterKey, setModalFilterKey] = useState(null);
    const [bib, setBib] = useState('');
    const [useDefaultBib, setUseDefaultBib] = useState(false);
    const [profileChestByYear, setProfileChestByYear] = useState({});
    const [selectedEventId, setSelectedEventId] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [errorText, setErrorText] = useState(null);
    const normalizeChestByYear = useCallback((raw) => {
        if (!raw || typeof raw !== 'object' || Array.isArray(raw))
            return {};
        const out = {};
        for (const [year, chest] of Object.entries(raw)) {
            const safeYear = String(year !== null && year !== void 0 ? year : '').trim();
            if (!/^\d{4}$/.test(safeYear))
                continue;
            const safeChest = String(chest !== null && chest !== void 0 ? chest : '').trim();
            if (!/^\d+$/.test(safeChest))
                continue;
            out[safeYear] = safeChest;
        }
        return out;
    }, []);
    const getYearFromDateLike = useCallback((value) => {
        const raw = String(value !== null && value !== void 0 ? value : '').trim();
        if (!raw)
            return null;
        const dt = new Date(raw);
        if (!Number.isNaN(dt.getTime()))
            return String(dt.getFullYear());
        const m = raw.match(/\b(19|20)\d{2}\b/);
        return m ? m[0] : null;
    }, []);
    const resolveDefaultBib = useCallback((eventLike) => {
        var _a, _b, _c, _d;
        const byYear = Object.assign(Object.assign({}, normalizeChestByYear((_a = userProfile === null || userProfile === void 0 ? void 0 : userProfile.chestNumbersByYear) !== null && _a !== void 0 ? _a : {})), profileChestByYear);
        const eventYear = getYearFromDateLike((_b = eventLike === null || eventLike === void 0 ? void 0 : eventLike.event_date) !== null && _b !== void 0 ? _b : null) ||
            getYearFromDateLike((_c = eventLike === null || eventLike === void 0 ? void 0 : eventLike.event_name) !== null && _c !== void 0 ? _c : null) ||
            getYearFromDateLike((_d = eventLike === null || eventLike === void 0 ? void 0 : eventLike.event_location) !== null && _d !== void 0 ? _d : null);
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
    }, [getYearFromDateLike, normalizeChestByYear, profileChestByYear, userProfile === null || userProfile === void 0 ? void 0 : userProfile.chestNumbersByYear]);
    useEffect(() => {
        if (!apiAccessToken)
            return;
        let active = true;
        (() => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            try {
                const summary = yield getProfileSummary(apiAccessToken);
                if (!active)
                    return;
                setProfileChestByYear(normalizeChestByYear((_b = (_a = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _a === void 0 ? void 0 : _a.chest_numbers_by_year) !== null && _b !== void 0 ? _b : {}));
            }
            catch (_c) {
                // local profile fallback is handled by resolver
            }
        }))();
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
        var _a;
        const query = String((_a = localFilters === null || localFilters === void 0 ? void 0 : localFilters.competition) !== null && _a !== void 0 ? _a : '').trim().toLowerCase();
        if (!query || selectedEventId || events.length === 0)
            return;
        const match = events.find((event) => {
            const name = String(event.event_name || event.event_title || '').toLowerCase();
            return name.includes(query);
        });
        if (match) {
            setSelectedEventId(String(match.event_id));
        }
    }, [events, localFilters === null || localFilters === void 0 ? void 0 : localFilters.competition, selectedEventId]);
    const selectedEvent = useMemo(() => events.find((event) => String(event.event_id) === String(selectedEventId)), [events, selectedEventId]);
    const defaultBib = useMemo(() => resolveDefaultBib(selectedEvent !== null && selectedEvent !== void 0 ? selectedEvent : null), [resolveDefaultBib, selectedEvent]);
    const activeBib = useMemo(() => { var _a; return String((_a = (useDefaultBib ? defaultBib : bib)) !== null && _a !== void 0 ? _a : '').trim(); }, [bib, defaultBib, useDefaultBib]);
    useEffect(() => {
        if (!defaultBib && useDefaultBib) {
            setUseDefaultBib(false);
        }
    }, [defaultBib, useDefaultBib]);
    const filteredEvents = useMemo(() => {
        var _a, _b;
        const query = String((_a = localFilters === null || localFilters === void 0 ? void 0 : localFilters.competition) !== null && _a !== void 0 ? _a : '').trim().toLowerCase();
        const range = (_b = localFilters === null || localFilters === void 0 ? void 0 : localFilters.timeRange) !== null && _b !== void 0 ? _b : null;
        const rangeStart = (range === null || range === void 0 ? void 0 : range.start) ? new Date(range.start) : null;
        const rangeEnd = (range === null || range === void 0 ? void 0 : range.end) ? new Date(range.end) : null;
        const isWithinRange = (dateValue) => {
            if (!rangeStart && !rangeEnd)
                return true;
            if (!dateValue)
                return false;
            const date = new Date(dateValue);
            if (Number.isNaN(date.getTime()))
                return false;
            if (rangeStart && rangeEnd)
                return date >= rangeStart && date <= rangeEnd;
            if (rangeStart)
                return date >= rangeStart;
            if (rangeEnd)
                return date <= rangeEnd;
            return true;
        };
        if (!query && !rangeStart && !rangeEnd)
            return events;
        return events.filter((event) => {
            const name = String(event.event_name || event.event_title || '').toLowerCase();
            const nameOk = query ? name.includes(query) : true;
            const dateOk = isWithinRange(event.event_date);
            return nameOk && dateOk;
        });
    }, [events, localFilters === null || localFilters === void 0 ? void 0 : localFilters.competition, localFilters === null || localFilters === void 0 ? void 0 : localFilters.timeRange]);
    const filterChips = useMemo(() => {
        var _a, _b, _c, _d;
        const chips = [];
        if (localFilters.competition)
            chips.push({ key: 'competition', label: buildSearchFilterChipLabel('Competition', String(localFilters.competition), t) });
        if (localFilters.person)
            chips.push({ key: 'person', label: buildSearchFilterChipLabel('Person', String(localFilters.person), t) });
        if (localFilters.group)
            chips.push({ key: 'group', label: buildSearchFilterChipLabel('Group', String(localFilters.group), t) });
        if (localFilters.location)
            chips.push({ key: 'location', label: buildSearchFilterChipLabel('Location', String(localFilters.location), t) });
        if (((_a = localFilters.timeRange) === null || _a === void 0 ? void 0 : _a.start) || ((_b = localFilters.timeRange) === null || _b === void 0 ? void 0 : _b.end)) {
            const start = ((_c = localFilters.timeRange) === null || _c === void 0 ? void 0 : _c.start)
                ? new Date(localFilters.timeRange.start).toLocaleDateString()
                : '';
            const end = ((_d = localFilters.timeRange) === null || _d === void 0 ? void 0 : _d.end) ? new Date(localFilters.timeRange.end).toLocaleDateString() : '';
            const rangeLabel = formatSearchDateRangeLabel(t, start, end);
            chips.push({ key: 'timeRange', label: `${t('Date')}: ${rangeLabel}` });
        }
        return chips;
    }, [localFilters, t]);
    const locationOptions = useMemo(() => {
        const fromEvents = events
            .map((event) => String(event.event_location || '').trim())
            .filter(Boolean);
        const fromPeople = AI_PEOPLE.map((p) => p.location || '').filter(Boolean);
        const fromGroups = AI_GROUPS.map((g) => g.location || '').filter(Boolean);
        const unique = Array.from(new Set([...fromEvents, ...fromPeople, ...fromGroups]));
        return unique.map((loc) => ({ id: loc, label: loc }));
    }, [events]);
    const filterOptions = useMemo(() => {
        const competitions = events.map((event) => {
            const name = String(event.event_name || event.event_title || t('Competition'));
            const date = event.event_date ? new Date(event.event_date).toLocaleDateString() : '';
            const location = event.event_location ? String(event.event_location) : '';
            const sublabel = [date, location].filter(Boolean).join(' • ');
            return { id: String(event.event_id), label: name, sublabel };
        });
        const people = AI_PEOPLE.map((p) => ({ id: p.name, label: p.name }));
        const groups = AI_GROUPS.map((g) => ({ id: g.name, label: g.name }));
        return {
            competition: competitions,
            person: people,
            group: groups,
            location: locationOptions,
            competitionType: [],
            timeRange: [],
        };
    }, [events, locationOptions, t]);
    const openFilterModal = (key) => {
        setModalFilterKey(key);
        setShowFilterModal(true);
    };
    const handleSelectFilter = (option) => {
        if (!modalFilterKey)
            return;
        if (modalFilterKey === 'competition') {
            setSelectedEventId(option.id);
            setLocalFilters((prev) => (Object.assign(Object.assign({}, prev), { competition: option.label })));
        }
        else {
            setLocalFilters((prev) => (Object.assign(Object.assign({}, prev), { [modalFilterKey]: option.label })));
        }
        setShowFilterModal(false);
        setModalFilterKey(null);
    };
    const removeFilter = (key) => {
        setLocalFilters((prev) => (Object.assign(Object.assign({}, prev), { [key]: key === 'timeRange' ? null : undefined })));
        if (key === 'competition') {
            setSelectedEventId('');
        }
    };
    const handleSelectEvent = (event) => {
        const displayName = event.event_name || event.event_title || '';
        setSelectedEventId(String(event.event_id));
        if (displayName) {
            setLocalFilters((prev) => (Object.assign(Object.assign({}, prev), { competition: String(displayName) })));
        }
    };
    const canSearch = activeBib.length > 0 && selectedEventId.trim().length > 0 && !isSearching;
    const runSearch = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _e, _f, _g, _h, _j;
        const safeBib = activeBib;
        const safeEventId = selectedEventId.trim();
        if (!safeBib || !safeEventId) {
            Alert.alert(t('Missing info'), t('Please enter a chest number and select a competition.'));
            return;
        }
        setIsSearching(true);
        setErrorText(null);
        const requestAccessToken = apiAccessToken !== null && apiAccessToken !== void 0 ? apiAccessToken : '';
        try {
            const res = yield searchMediaByBib(requestAccessToken, { event_id: safeEventId, bib: safeBib });
            const results = Array.isArray(res === null || res === void 0 ? void 0 : res.results) ? res.results : [];
            navigation.navigate('AISearchResultsScreen', {
                matchedCount: results.length,
                results: results.map((r) => (Object.assign(Object.assign({}, r), { event_id: safeEventId }))),
                matchType: 'bib',
                refineContext: {
                    bib: safeBib,
                    date: ((_e = localFilters === null || localFilters === void 0 ? void 0 : localFilters.timeRange) === null || _e === void 0 ? void 0 : _e.start) || ((_f = localFilters === null || localFilters === void 0 ? void 0 : localFilters.timeRange) === null || _f === void 0 ? void 0 : _f.end)
                        ? [
                            ((_g = localFilters === null || localFilters === void 0 ? void 0 : localFilters.timeRange) === null || _g === void 0 ? void 0 : _g.start) ? new Date(localFilters.timeRange.start).toLocaleDateString() : null,
                            ((_h = localFilters === null || localFilters === void 0 ? void 0 : localFilters.timeRange) === null || _h === void 0 ? void 0 : _h.end) ? new Date(localFilters.timeRange.end).toLocaleDateString() : null,
                        ]
                            .filter(Boolean)
                            .join(' - ')
                        : undefined,
                },
                manualBrowse: {
                    eventId: safeEventId,
                    competitionId: safeEventId,
                    eventName: (selectedEvent === null || selectedEvent === void 0 ? void 0 : selectedEvent.event_name) || (selectedEvent === null || selectedEvent === void 0 ? void 0 : selectedEvent.event_title) || (localFilters === null || localFilters === void 0 ? void 0 : localFilters.competition),
                    eventDate: selectedEvent === null || selectedEvent === void 0 ? void 0 : selectedEvent.event_date,
                },
            });
        }
        catch (e) {
            const msg = e instanceof ApiError ? e.message : String((_j = e === null || e === void 0 ? void 0 : e.message) !== null && _j !== void 0 ? _j : e);
            setErrorText(msg);
        }
        finally {
            setIsSearching(false);
        }
    }), [activeBib, apiAccessToken, localFilters === null || localFilters === void 0 ? void 0 : localFilters.competition, (_c = localFilters === null || localFilters === void 0 ? void 0 : localFilters.timeRange) === null || _c === void 0 ? void 0 : _c.end, (_d = localFilters === null || localFilters === void 0 ? void 0 : localFilters.timeRange) === null || _d === void 0 ? void 0 : _d.start, navigation, selectedEvent === null || selectedEvent === void 0 ? void 0 : selectedEvent.event_date, selectedEvent === null || selectedEvent === void 0 ? void 0 : selectedEvent.event_name, selectedEvent === null || selectedEvent === void 0 ? void 0 : selectedEvent.event_title, selectedEventId, t]);
    const handleBack = useCallback(() => {
        var _a;
        const parent = (_a = navigation.getParent) === null || _a === void 0 ? void 0 : _a.call(navigation);
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
    return (_jsxs(View, Object.assign({ style: styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.headerButton, onPress: handleBack }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: styles.headerTitle }, { children: t('Chest number') })), _jsx(View, { style: { width: 44, height: 44 } })] })), _jsx(KeyboardAvoidingContainer, { children: _jsxs(View, Object.assign({ style: styles.container }, { children: [_jsx(SizeBox, { height: 18 }), _jsx(Text, Object.assign({ style: styles.title }, { children: t('Find your photos by chest number') })), _jsx(SizeBox, { height: 6 }), _jsx(Text, Object.assign({ style: styles.subtitle }, { children: "Enter the chest number from your bib. Choose the competition you participated in." })), _jsxs(View, Object.assign({ style: styles.filtersSection }, { children: [_jsx(Text, Object.assign({ style: styles.filtersTitle }, { children: t('Filters') })), filterChips.length > 0 ? (_jsx(View, Object.assign({ style: styles.appliedChipsRow }, { children: filterChips.map((chip, index) => (_jsxs(View, Object.assign({ style: styles.appliedChip }, { children: [_jsx(Text, Object.assign({ style: styles.appliedChipText }, { children: chip.label })), _jsx(TouchableOpacity, Object.assign({ style: styles.appliedChipRemove, onPress: () => removeFilter(chip.key) }, { children: _jsx(CloseCircle, { size: 14, color: colors.subTextColor, variant: "Linear" }) }))] }), `${chip.key}-${index}`))) }))) : (_jsx(Text, Object.assign({ style: styles.filtersHelper }, { children: t('No filters applied') }))), _jsxs(View, Object.assign({ style: styles.filterButtonsRow }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.filterButton, onPress: () => openFilterModal('competition') }, { children: _jsx(Text, Object.assign({ style: styles.filterButtonText }, { children: getSearchFilterLabel('Competition', t) })) })), _jsx(TouchableOpacity, Object.assign({ style: styles.filterButton, onPress: () => openFilterModal('person') }, { children: _jsx(Text, Object.assign({ style: styles.filterButtonText }, { children: getSearchFilterLabel('Person', t) })) })), _jsx(TouchableOpacity, Object.assign({ style: styles.filterButton, onPress: () => openFilterModal('group') }, { children: _jsx(Text, Object.assign({ style: styles.filterButtonText }, { children: getSearchFilterLabel('Group', t) })) })), _jsx(TouchableOpacity, Object.assign({ style: styles.filterButton, onPress: () => openFilterModal('location') }, { children: _jsx(Text, Object.assign({ style: styles.filterButtonText }, { children: getSearchFilterLabel('Location', t) })) }))] }))] })), _jsx(Modal, Object.assign({ visible: showFilterModal, transparent: true, animationType: "fade", onRequestClose: () => setShowFilterModal(false) }, { children: _jsx(TouchableOpacity, Object.assign({ style: styles.filterModalOverlay, activeOpacity: 1, onPress: () => setShowFilterModal(false) }, { children: _jsxs(TouchableOpacity, Object.assign({ style: styles.filterModalCard, activeOpacity: 1 }, { children: [_jsxs(Text, Object.assign({ style: styles.filterModalTitle }, { children: [t('Select'), " ", modalFilterKey ? getSearchFilterLabel(modalFilterKey.charAt(0).toUpperCase() + modalFilterKey.slice(1), t) : t('filter')] })), _jsxs(ScrollView, Object.assign({ style: styles.filterModalList, contentContainerStyle: styles.filterModalListContent }, { children: [(modalFilterKey ? filterOptions[modalFilterKey] : []).map((option) => (_jsxs(TouchableOpacity, Object.assign({ style: styles.filterModalOption, onPress: () => handleSelectFilter(option) }, { children: [_jsx(Text, Object.assign({ style: styles.filterModalOptionText }, { children: option.label })), !!option.sublabel && (_jsx(Text, Object.assign({ style: styles.filterModalOptionSubText }, { children: option.sublabel })))] }), option.id))), (modalFilterKey ? filterOptions[modalFilterKey] : []).length === 0 && (_jsx(Text, Object.assign({ style: styles.filterModalEmpty }, { children: t('No options available.') })))] }))] })) })) })), _jsx(SizeBox, { height: 18 }), _jsx(SizeBox, { height: 22 }), _jsx(Text, Object.assign({ style: styles.inputLabel }, { children: t('Chest number') })), !useDefaultBib || !defaultBib ? (_jsx(UnifiedSearchInput, { containerStyle: styles.inputContainer, left: _jsx(SearchNormal1, { size: 20, color: colors.grayColor, variant: "Linear" }), inputStyle: styles.input, placeholder: t('e.g. 1234'), value: bib, onChangeText: setBib, keyboardType: "number-pad", returnKeyType: "next" })) : null, _jsxs(TouchableOpacity, Object.assign({ style: styles.defaultChestRow, onPress: () => {
                                if (!defaultBib)
                                    return;
                                setUseDefaultBib((prev) => !prev);
                            }, activeOpacity: 0.85 }, { children: [_jsx(View, Object.assign({ style: [styles.defaultChestBox, useDefaultBib && styles.defaultChestBoxActive] }, { children: useDefaultBib ? _jsx(Text, Object.assign({ style: styles.defaultChestCheck }, { children: t('✓') })) : null })), _jsx(Text, Object.assign({ style: styles.defaultChestText }, { children: defaultBib
                                        ? `${t('Use saved chest number')} (${defaultBib})`
                                        : t('No saved chest number yet. Enter the chest number for this competition below.') }))] })), _jsx(SizeBox, { height: 18 }), _jsx(Text, Object.assign({ style: styles.inputLabel }, { children: t('Competition') })), _jsx(View, Object.assign({ style: styles.card }, { children: isLoadingEvents ? (_jsx(Text, Object.assign({ style: styles.subtitle }, { children: t('Loading your competitions…') }))) : filteredEvents.length > 0 ? (_jsxs(_Fragment, { children: [_jsx(Text, Object.assign({ style: styles.subtitle }, { children: t('Tap to select a competition') })), _jsx(View, Object.assign({ style: styles.chipRow }, { children: filteredEvents.slice(0, 12).map((event, idx) => {
                                            const isActive = String(event.event_id) === String(selectedEventId);
                                            const displayName = event.event_name || event.event_title || `${t('Competition')} ${idx + 1}`;
                                            return (_jsx(TouchableOpacity, Object.assign({ onPress: () => handleSelectEvent(event), style: [styles.chip, isActive && styles.chipActive], activeOpacity: 0.85 }, { children: _jsx(Text, Object.assign({ style: styles.chipText, numberOfLines: 1 }, { children: displayName })) }), String(event.event_id)));
                                        }) }))] })) : (_jsx(Text, Object.assign({ style: styles.subtitle }, { children: events.length === 0
                                    ? t('No subscribed competitions yet. Subscribe to a competition first.')
                                    : t('No competitions match the selected filters.') }))) })), !!selectedEvent && (_jsxs(_Fragment, { children: [_jsx(SizeBox, { height: 12 }), _jsxs(Text, Object.assign({ style: styles.subtitle }, { children: [t('Selected competition'), ": ", selectedEvent.event_name || selectedEvent.event_title || t('Competition')] }))] })), !!eventsError && _jsx(Text, Object.assign({ style: styles.errorText }, { children: eventsError })), !!errorText && _jsx(Text, Object.assign({ style: styles.errorText }, { children: errorText })), _jsx(SizeBox, { height: 22 }), _jsxs(TouchableOpacity, Object.assign({ style: [styles.primaryButton, !canSearch && styles.primaryButtonDisabled], onPress: runSearch, disabled: !canSearch }, { children: [_jsx(Text, Object.assign({ style: styles.primaryButtonText }, { children: isSearching ? t('Searching…') : t('Search') })), _jsx(ArrowRight, { size: 22, color: colors.pureWhite, variant: "Linear" })] })), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] })) })] })));
};
export default BibSearchScreen;
