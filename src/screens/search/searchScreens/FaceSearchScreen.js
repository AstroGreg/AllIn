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
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { ArrowLeft2, SearchNormal1, Add, ArrowRight, CloseCircle } from 'iconsax-react-nativejs';
import { createStyles } from './FaceSearchScreenStyles';
import { useAuth } from '../../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { ApiError, getAuthMe, grantFaceRecognitionConsent, searchFaceByEnrollment, subscribeToEvent, } from '../../../services/apiGateway';
import { useEvents } from '../../../context/EventsContext';
import { AI_GROUPS, AI_PEOPLE } from '../../../constants/AiFilterOptions';
import { useTranslation } from 'react-i18next';
import UnifiedSearchInput from '../../../components/unifiedSearchInput/UnifiedSearchInput';
import { buildSearchFilterChipLabel, formatSearchDateRangeLabel, getSearchFilterLabel, } from '../../../utils/searchLabels';
const FaceSearchScreen = ({ navigation, route }) => {
    var _a, _b, _c, _d, _e;
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const { apiAccessToken } = useAuth();
    const { events, eventNameById } = useEvents();
    const origin = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.origin;
    const filterState = (_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.filterState;
    const [localFilters, setLocalFilters] = useState(filterState !== null && filterState !== void 0 ? filterState : {});
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [modalFilterKey, setModalFilterKey] = useState(null);
    const [isLoadingMe, setIsLoadingMe] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [eventIdInput, setEventIdInput] = useState('');
    const [authMe, setAuthMe] = useState(null);
    const [missingAngles, setMissingAngles] = useState(null);
    const [needsConsent, setNeedsConsent] = useState(false);
    const [errorText, setErrorText] = useState(null);
    const hasCompetition = Boolean((localFilters === null || localFilters === void 0 ? void 0 : localFilters.competition) && String(localFilters.competition).trim());
    const refreshMe = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _f;
        if (!apiAccessToken)
            return;
        setIsLoadingMe(true);
        setErrorText(null);
        try {
            const me = yield getAuthMe(apiAccessToken);
            setAuthMe(me);
        }
        catch (e) {
            const message = e instanceof ApiError ? e.message : String((_f = e === null || e === void 0 ? void 0 : e.message) !== null && _f !== void 0 ? _f : e);
            setErrorText(message);
        }
        finally {
            setIsLoadingMe(false);
        }
    }), [apiAccessToken]);
    useFocusEffect(useCallback(() => {
        refreshMe();
    }, [refreshMe]));
    const subscribedEventIds = useMemo(() => {
        const ids = Array.isArray(authMe === null || authMe === void 0 ? void 0 : authMe.event_ids) ? authMe.event_ids.map((v) => String(v)) : [];
        const filtered = ids.map((s) => s.trim()).filter(Boolean);
        const unique = Array.from(new Set(filtered));
        if (!searchText.trim())
            return unique;
        const q = searchText.trim().toLowerCase();
        return unique.filter((id) => id.toLowerCase().includes(q));
    }, [authMe === null || authMe === void 0 ? void 0 : authMe.event_ids, searchText]);
    const filteredEventIds = useMemo(() => {
        var _a, _b;
        const competitionQuery = String((_a = localFilters === null || localFilters === void 0 ? void 0 : localFilters.competition) !== null && _a !== void 0 ? _a : '').trim().toLowerCase();
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
        const allowedIds = new Set(events
            .filter((event) => {
            const name = String(event.event_name || event.event_title || '').toLowerCase();
            const nameOk = competitionQuery ? name.includes(competitionQuery) : true;
            const dateOk = isWithinRange(event.event_date);
            return nameOk && dateOk;
        })
            .map((event) => String(event.event_id)));
        if (allowedIds.size === 0)
            return subscribedEventIds;
        const baseList = !competitionQuery && !rangeStart && !rangeEnd
            ? subscribedEventIds
            : subscribedEventIds.filter((id) => allowedIds.has(id));
        const textQuery = searchText.trim().toLowerCase();
        if (!textQuery)
            return baseList;
        return baseList.filter((id) => eventNameById(id).toLowerCase().includes(textQuery));
    }, [events, eventNameById, localFilters === null || localFilters === void 0 ? void 0 : localFilters.competition, localFilters === null || localFilters === void 0 ? void 0 : localFilters.timeRange, searchText, subscribedEventIds]);
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
    };
    const runSearch = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _g, _h, _j, _k, _l, _m, _o;
        if (!localFilters.competition || !String(localFilters.competition).trim()) {
            setErrorText(t('Select a competition first.'));
            return;
        }
        setNeedsConsent(false);
        setMissingAngles(null);
        setErrorText(null);
        setIsSearching(true);
        const requestAccessToken = apiAccessToken !== null && apiAccessToken !== void 0 ? apiAccessToken : '';
        try {
            const me = authMe !== null && authMe !== void 0 ? authMe : (yield getAuthMe(requestAccessToken));
            setAuthMe(me);
            const hasFilterConstraints = Boolean(((localFilters === null || localFilters === void 0 ? void 0 : localFilters.competition) && String(localFilters.competition).trim()) ||
                (localFilters === null || localFilters === void 0 ? void 0 : localFilters.timeRange));
            if (hasFilterConstraints && filteredEventIds.length === 0) {
                setErrorText(t('No events match the selected filters.'));
                return;
            }
            const event_ids = filteredEventIds.length > 0
                ? filteredEventIds
                : (Array.isArray(me === null || me === void 0 ? void 0 : me.event_ids) ? me.event_ids.map((v) => String(v)) : []);
            if (event_ids.length === 0) {
                setErrorText(t('No subscribed events found for your profile. Subscribe to an event first.'));
                return;
            }
            const res = yield searchFaceByEnrollment(requestAccessToken, {
                event_ids,
                label: 'default',
                limit: 600,
                top: 100,
            });
            navigation.navigate('AISearchResultsScreen', {
                matchedCount: Array.isArray(res === null || res === void 0 ? void 0 : res.results) ? res.results.length : 0,
                results: (_g = res === null || res === void 0 ? void 0 : res.results) !== null && _g !== void 0 ? _g : [],
                matchType: 'face',
                refineContext: {
                    date: ((_h = localFilters === null || localFilters === void 0 ? void 0 : localFilters.timeRange) === null || _h === void 0 ? void 0 : _h.start) || ((_j = localFilters === null || localFilters === void 0 ? void 0 : localFilters.timeRange) === null || _j === void 0 ? void 0 : _j.end)
                        ? [
                            ((_k = localFilters === null || localFilters === void 0 ? void 0 : localFilters.timeRange) === null || _k === void 0 ? void 0 : _k.start) ? new Date(localFilters.timeRange.start).toLocaleDateString() : null,
                            ((_l = localFilters === null || localFilters === void 0 ? void 0 : localFilters.timeRange) === null || _l === void 0 ? void 0 : _l.end) ? new Date(localFilters.timeRange.end).toLocaleDateString() : null,
                        ]
                            .filter(Boolean)
                            .join(' - ')
                        : undefined,
                },
                manualBrowse: filteredEventIds.length === 1
                    ? {
                        eventId: filteredEventIds[0],
                        competitionId: filteredEventIds[0],
                        eventName: localFilters === null || localFilters === void 0 ? void 0 : localFilters.competition,
                    }
                    : undefined,
            });
        }
        catch (e) {
            if (e instanceof ApiError) {
                const body = (_m = e.body) !== null && _m !== void 0 ? _m : {};
                if (e.status === 403 && String(e.message).toLowerCase().includes('consent')) {
                    setNeedsConsent(true);
                    setErrorText(t('Face recognition consent is required.'));
                    return;
                }
                if (e.status === 400 && Array.isArray(body === null || body === void 0 ? void 0 : body.missing_angles)) {
                    setMissingAngles(body.missing_angles.map(String));
                    setErrorText(t('Face Search is not set up yet. Please enroll your face first.'));
                    return;
                }
                setErrorText(`${e.message}`);
            }
            else {
                setErrorText(String((_o = e === null || e === void 0 ? void 0 : e.message) !== null && _o !== void 0 ? _o : e));
            }
        }
        finally {
            setIsSearching(false);
        }
    }), [apiAccessToken, authMe, filteredEventIds, localFilters === null || localFilters === void 0 ? void 0 : localFilters.competition, localFilters === null || localFilters === void 0 ? void 0 : localFilters.timeRange, navigation, t]);
    const handleGrantConsent = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _p;
        if (!apiAccessToken)
            return;
        setErrorText(null);
        try {
            yield grantFaceRecognitionConsent(apiAccessToken);
            setNeedsConsent(false);
            yield refreshMe();
            runSearch();
        }
        catch (e) {
            const message = e instanceof ApiError ? e.message : String((_p = e === null || e === void 0 ? void 0 : e.message) !== null && _p !== void 0 ? _p : e);
            setErrorText(message);
        }
    }), [apiAccessToken, refreshMe, runSearch]);
    const handleEnroll = useCallback(() => {
        navigation.navigate('SearchFaceCaptureScreen', {
            mode: 'enrolFace',
            afterEnroll: {
                screen: 'FaceSearchScreen',
                params: Object.assign({ autoSearch: true }, (origin ? { origin } : {})),
            },
        });
    }, [navigation, origin]);
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
    useEffect(() => {
        var _a;
        if ((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.autoSearch) {
            navigation.setParams({ autoSearch: false });
            runSearch();
        }
    }, [navigation, (_c = route === null || route === void 0 ? void 0 : route.params) === null || _c === void 0 ? void 0 : _c.autoSearch, runSearch]);
    const handleSubscribe = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _q;
        if (!apiAccessToken)
            return;
        const eventId = eventIdInput.trim();
        if (!eventId) {
            Alert.alert(t('Missing event id'), t('Paste an event UUID first.'));
            return;
        }
        setErrorText(null);
        try {
            yield subscribeToEvent(apiAccessToken, eventId);
            setEventIdInput('');
            yield refreshMe();
        }
        catch (e) {
            const message = e instanceof ApiError ? e.message : String((_q = e === null || e === void 0 ? void 0 : e.message) !== null && _q !== void 0 ? _q : e);
            setErrorText(message);
        }
    }), [apiAccessToken, eventIdInput, refreshMe, t]);
    return (_jsxs(View, Object.assign({ style: styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.headerButton, onPress: handleBack }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: styles.headerTitle }, { children: t('Faces') })), _jsx(View, { style: { width: 44, height: 44 } })] })), _jsxs(ScrollView, Object.assign({ style: styles.container, showsVerticalScrollIndicator: false, keyboardShouldPersistTaps: "handled" }, { children: [_jsx(SizeBox, { height: 24 }), _jsxs(View, Object.assign({ style: styles.searchLabelRow }, { children: [_jsx(Text, Object.assign({ style: styles.searchLabel }, { children: t('Face Search') })), _jsxs(TouchableOpacity, Object.assign({ style: styles.addFaceButton, onPress: handleEnroll }, { children: [_jsx(Text, Object.assign({ style: styles.addFaceButtonText }, { children: t('Enroll Face') })), _jsx(Add, { size: 16, color: "#FFFFFF", variant: "Linear" })] }))] })), _jsx(SizeBox, { height: 8 }), _jsxs(View, Object.assign({ style: styles.filtersSection }, { children: [_jsx(Text, Object.assign({ style: styles.appliedLabel }, { children: t('Filters') })), filterChips.length > 0 ? (_jsx(View, Object.assign({ style: styles.appliedChipsRow }, { children: filterChips.map((chip, index) => (_jsxs(View, Object.assign({ style: styles.appliedChip }, { children: [_jsx(Text, Object.assign({ style: styles.appliedChipText }, { children: chip.label })), _jsx(TouchableOpacity, Object.assign({ style: styles.appliedChipRemove, onPress: () => removeFilter(chip.key) }, { children: _jsx(CloseCircle, { size: 14, color: colors.subTextColor, variant: "Linear" }) }))] }), `${chip.key}-${index}`))) }))) : (_jsx(Text, Object.assign({ style: styles.filtersHelper }, { children: t('No filters applied') }))), _jsxs(View, Object.assign({ style: styles.filterButtonsRow }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.filterButton, onPress: () => openFilterModal('competition') }, { children: _jsx(Text, Object.assign({ style: styles.filterButtonText }, { children: t('Competition') })) })), _jsx(TouchableOpacity, Object.assign({ style: styles.filterButton, onPress: () => openFilterModal('person') }, { children: _jsx(Text, Object.assign({ style: styles.filterButtonText }, { children: t('Person') })) })), _jsx(TouchableOpacity, Object.assign({ style: styles.filterButton, onPress: () => openFilterModal('group') }, { children: _jsx(Text, Object.assign({ style: styles.filterButtonText }, { children: t('Group') })) })), _jsx(TouchableOpacity, Object.assign({ style: styles.filterButton, onPress: () => openFilterModal('location') }, { children: _jsx(Text, Object.assign({ style: styles.filterButtonText }, { children: t('Location') })) }))] }))] })), _jsx(Modal, Object.assign({ visible: showFilterModal, transparent: true, animationType: "fade", onRequestClose: () => setShowFilterModal(false) }, { children: _jsx(TouchableOpacity, Object.assign({ style: styles.filterModalOverlay, activeOpacity: 1, onPress: () => setShowFilterModal(false) }, { children: _jsxs(TouchableOpacity, Object.assign({ style: styles.filterModalCard, activeOpacity: 1 }, { children: [_jsxs(Text, Object.assign({ style: styles.filterModalTitle }, { children: [t('Select'), " ", modalFilterKey ? getSearchFilterLabel(modalFilterKey.charAt(0).toUpperCase() + modalFilterKey.slice(1), t) : t('filter')] })), _jsxs(ScrollView, Object.assign({ style: styles.filterModalList, contentContainerStyle: styles.filterModalListContent }, { children: [(modalFilterKey ? filterOptions[modalFilterKey] : []).map((option) => (_jsxs(TouchableOpacity, Object.assign({ style: styles.filterModalOption, onPress: () => handleSelectFilter(option) }, { children: [_jsx(Text, Object.assign({ style: styles.filterModalOptionText }, { children: option.label })), !!option.sublabel && (_jsx(Text, Object.assign({ style: styles.filterModalOptionSubText }, { children: option.sublabel })))] }), option.id))), (modalFilterKey ? filterOptions[modalFilterKey] : []).length === 0 && (_jsx(Text, Object.assign({ style: styles.filterModalEmpty }, { children: t('No options available.') })))] }))] })) })) })), _jsx(SizeBox, { height: 8 }), _jsxs(View, Object.assign({ style: styles.faceGroupCard }, { children: [_jsx(Text, Object.assign({ style: styles.faceGroupName }, { children: t('Find photos of you') })), _jsx(SizeBox, { height: 8 }), _jsxs(Text, Object.assign({ style: [styles.searchInput, { color: colors.grayColor }] }, { children: [t('This uses the backend endpoint'), " ", '/ai/faces/search', " ", t('and searches across competitions you are subscribed to.')] })), _jsx(SizeBox, { height: 12 }), _jsxs(Text, Object.assign({ style: [styles.searchInput, { color: colors.mainTextColor }] }, { children: [t('Subscribed competitions'), ": ", isLoadingMe ? t('Loading…') : String((_e = (_d = authMe === null || authMe === void 0 ? void 0 : authMe.event_ids) === null || _d === void 0 ? void 0 : _d.length) !== null && _e !== void 0 ? _e : 0)] })), missingAngles && missingAngles.length > 0 && (_jsxs(_Fragment, { children: [_jsx(SizeBox, { height: 12 }), _jsxs(Text, Object.assign({ style: [styles.searchInput, { color: colors.mainTextColor }] }, { children: [t('Missing enrollment angles'), ": ", missingAngles.join(', ')] }))] })), errorText && (_jsxs(_Fragment, { children: [_jsx(SizeBox, { height: 12 }), _jsx(Text, Object.assign({ style: [styles.searchInput, { color: '#FF3B30' }] }, { children: errorText }))] }))] })), _jsx(UnifiedSearchInput, { containerStyle: styles.searchInputContainer, left: _jsx(SearchNormal1, { size: 24, color: colors.grayColor, variant: "Linear" }), inputStyle: styles.searchInput, placeholder: t('Filter competitions'), value: searchText, onChangeText: setSearchText }), _jsx(SizeBox, { height: 24 }), filteredEventIds.length > 0 ? (_jsxs(View, Object.assign({ style: styles.faceGroupCard }, { children: [_jsx(Text, Object.assign({ style: styles.searchLabel }, { children: t('Competitions to search') })), _jsx(SizeBox, { height: 8 }), filteredEventIds.slice(0, 10).map((id) => (_jsx(Text, Object.assign({ style: [styles.searchInput, { color: colors.mainTextColor }] }, { children: eventNameById(id) }), id))), filteredEventIds.length > 10 && (_jsxs(Text, Object.assign({ style: [styles.searchInput, { color: colors.grayColor }] }, { children: [t('…and'), " ", filteredEventIds.length - 10, " ", t('more')] })))] }))) : (_jsxs(View, Object.assign({ style: styles.faceGroupCard }, { children: [_jsx(Text, Object.assign({ style: styles.searchLabel }, { children: t('No competitions found') })), _jsx(SizeBox, { height: 8 }), _jsx(Text, Object.assign({ style: [styles.searchInput, { color: colors.grayColor }] }, { children: t('Your profile has no competition subscriptions yet. If you know an event UUID, paste it below to subscribe (advanced).') })), _jsx(SizeBox, { height: 12 }), _jsx(UnifiedSearchInput, { containerStyle: styles.searchInputContainer, inputStyle: styles.searchInput, placeholder: t('Event UUID'), value: eventIdInput, onChangeText: setEventIdInput, autoCapitalize: "none", autoCorrect: false }), _jsx(SizeBox, { height: 12 }), _jsx(TouchableOpacity, Object.assign({ style: [styles.selectButton, { alignSelf: 'flex-start' }], onPress: handleSubscribe, disabled: !eventIdInput.trim() }, { children: _jsx(Text, Object.assign({ style: styles.selectButtonText }, { children: t('Subscribe') })) }))] }))), _jsx(SizeBox, { height: 100 })] })), _jsx(View, Object.assign({ style: [styles.bottomButtonContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }] }, { children: _jsxs(TouchableOpacity, Object.assign({ style: [
                        styles.continueButton,
                        (isSearching || !hasCompetition) && styles.continueButtonDisabled,
                    ], onPress: needsConsent ? handleGrantConsent : runSearch, disabled: isSearching || !hasCompetition }, { children: [_jsx(Text, Object.assign({ style: styles.continueButtonText }, { children: needsConsent ? t('Enable Face Recognition') : isSearching ? t('Searching…') : t('Find My Photos') })), _jsx(ArrowRight, { size: 24, color: "#FFFFFF", variant: "Linear" })] })) }))] })));
};
export default FaceSearchScreen;
