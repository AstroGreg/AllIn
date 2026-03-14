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
import { View, Text, ScrollView, TouchableOpacity, Modal, Pressable, Platform, ActivityIndicator } from 'react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createStyles } from './SearchStyles';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import Icons from '../../constants/Icons';
import Images from '../../constants/Images';
import FastImage from 'react-native-fast-image';
import { SearchNormal1, Calendar, Location, CloseCircle, Clock, ArrowDown2, Camera } from 'iconsax-react-nativejs';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { ApiError, followProfile, getGroupMembers, getProfileSummary, getProfileSummaryById, searchEvents, searchGroups, searchProfiles, unfollowProfile } from '../../services/apiGateway';
import SportFocusIcon from '../../components/profile/SportFocusIcon';
import UnifiedSearchInput from '../../components/unifiedSearchInput/UnifiedSearchInput';
import { getApiBaseUrl } from '../../constants/RuntimeConfig';
import { getSportFocusLabel, normalizeSelectedEvents, resolveCompetitionFocusId } from '../../utils/profileSelections';
import E2EPerfReady from '../../components/e2e/E2EPerfReady';
const FILTERS = ['Competition', 'Person', 'Group', 'Location'];
const DEFAULT_COMPETITIONS_INITIAL_LIMIT = 10;
const SEARCH_RESULTS_INITIAL_LIMIT = 20;
const SCROLL_LOAD_THRESHOLD_PX = 220;
const COMPETITION_FILTER_IDS = [
    'track-field',
    'road-events',
    'triathlon',
    'ironman',
    'cycling',
    'hyrox',
];
const filterToSection = (filter) => {
    if (filter === 'Group')
        return 'groups';
    if (filter === 'Person')
        return 'people';
    return 'events';
};
const SearchScreen = ({ navigation }) => {
    var _a;
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const { apiAccessToken, user } = useAuth();
    const perfStartedAtRef = useRef(Date.now());
    const Styles = createStyles(colors);
    const isLightTheme = String(colors.backgroundColor || '').toLowerCase() === '#ffffff';
    const pickerVisualProps = useMemo(() => (Platform.OS === 'ios'
        ? {
            themeVariant: isLightTheme ? 'light' : 'dark',
            textColor: isLightTheme ? '#0B1220' : '#F8FAFC',
            accentColor: colors.primaryColor,
        }
        : {}), [colors.primaryColor, isLightTheme]);
    const [ownProfileId, setOwnProfileId] = useState(null);
    const searchInputRef = useRef(null);
    const [activeFilter, setActiveFilter] = useState('Competition');
    const [filterOrder, setFilterOrder] = useState([]);
    const [filterValues, setFilterValues] = useState({
        Competition: '',
        Person: '',
        Group: '',
        Location: '',
    });
    const [debouncedFilterValues, setDebouncedFilterValues] = useState({
        Competition: '',
        Person: '',
        Group: '',
        Location: '',
    });
    const [competitionTypeFilter, setCompetitionTypeFilter] = useState('all');
    const [timeRange, setTimeRange] = useState({
        start: null,
        end: null,
    });
    const [showIosPicker, setShowIosPicker] = useState(false);
    const [calendarStart, setCalendarStart] = useState(null);
    const [calendarEnd, setCalendarEnd] = useState(null);
    const [nativePickerVisible, setNativePickerVisible] = useState(false);
    const [nativePickerDate, setNativePickerDate] = useState(new Date());
    const [activeDateField, setActiveDateField] = useState(null);
    const [eventResults, setEventResults] = useState([]);
    const [eventsError, setEventsError] = useState(null);
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);
    const [groupResults, setGroupResults] = useState([]);
    const [groupsError, setGroupsError] = useState(null);
    const [peopleResults, setPeopleResults] = useState([]);
    const [peopleError, setPeopleError] = useState(null);
    const [groupLinkedPeople, setGroupLinkedPeople] = useState([]);
    const [resolvedPersonAvatars, setResolvedPersonAvatars] = useState({});
    const [followBusyProfileId, setFollowBusyProfileId] = useState(null);
    const [defaultVisibleCount, setDefaultVisibleCount] = useState(DEFAULT_COMPETITIONS_INITIAL_LIMIT);
    const [searchVisibleCount, setSearchVisibleCount] = useState(SEARCH_RESULTS_INITIAL_LIMIT);
    const loadMoreLockedRef = useRef(false);
    const authPicture = String((user === null || user === void 0 ? void 0 : user.picture) || '').trim();
    const toAbsoluteUrl = useCallback((value) => {
        const raw = String(value || '').trim();
        if (!raw)
            return null;
        if (/^https?:\/\//i.test(raw))
            return raw;
        const base = getApiBaseUrl();
        return `${base.replace(/\/$/, '')}/${raw.replace(/^\//, '')}`;
    }, []);
    const withAccessToken = useCallback((value) => {
        const raw = String(value || '').trim();
        const token = String(apiAccessToken || '').trim();
        if (!raw)
            return null;
        if (!token)
            return raw;
        const separator = raw.includes('?') ? '&' : '?';
        return `${raw}${separator}access_token=${encodeURIComponent(token)}`;
    }, [apiAccessToken]);
    const resolveAvatarUrl = useCallback((value) => {
        const absolute = toAbsoluteUrl(value);
        return withAccessToken(absolute) || absolute;
    }, [toAbsoluteUrl, withAccessToken]);
    useEffect(() => {
        const handle = setTimeout(() => {
            setDebouncedFilterValues(filterValues);
        }, 120);
        return () => clearTimeout(handle);
    }, [filterValues]);
    const competitionTypeFilters = useMemo(() => ([
        { key: 'all', label: t('all') },
        ...COMPETITION_FILTER_IDS.map((focusId) => ({
            key: focusId,
            label: getSportFocusLabel(focusId, t),
        })),
    ]), [t]);
    const activeValue = (_a = filterValues[activeFilter]) !== null && _a !== void 0 ? _a : '';
    const perfReady = !isLoadingEvents && (eventResults.length > 0 || eventsError !== null);
    const formatEventDate = useCallback((value) => {
        if (!value)
            return '';
        const d = new Date(String(value));
        if (Number.isNaN(d.getTime()))
            return String(value);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    }, []);
    const resolveCompetitionType = useCallback((params) => {
        return resolveCompetitionFocusId(params);
    }, []);
    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken) {
            setEventResults([]);
            setEventsError(null);
            setIsLoadingEvents(false);
            return () => { };
        }
        setEventsError(null);
        setIsLoadingEvents(true);
        searchEvents(apiAccessToken, { q: '', limit: 200 })
            .then((res) => {
            if (!mounted)
                return;
            const list = Array.isArray(res === null || res === void 0 ? void 0 : res.events) ? res.events : [];
            setEventResults(list.map((event) => ({
                id: String(event.event_id),
                name: String(event.event_name || event.event_title || t('Competition')),
                date: formatEventDate(event.event_date),
                location: String(event.event_location || ''),
                competitionType: resolveCompetitionType({
                    type: event.competition_type,
                    name: event.event_name || event.event_title,
                    location: event.event_location,
                    organizer: event.organizing_club,
                }),
                organizingClub: String(event.organizing_club
                    || event.organizer_club
                    || event.competition_organizing_club
                    || event.competition_organizer_name
                    || '').trim(),
            })));
            setIsLoadingEvents(false);
        })
            .catch((e) => {
            var _a;
            if (!mounted)
                return;
            const msg = e instanceof ApiError ? e.message : String((_a = e === null || e === void 0 ? void 0 : e.message) !== null && _a !== void 0 ? _a : e);
            setEventsError(msg);
            setEventResults([]);
            setIsLoadingEvents(false);
        });
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, formatEventDate, resolveCompetitionType, t]);
    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken) {
            setOwnProfileId(null);
            return () => { };
        }
        getProfileSummary(apiAccessToken)
            .then((resp) => {
            if (!mounted)
                return;
            const id = (resp === null || resp === void 0 ? void 0 : resp.profile_id) ? String(resp.profile_id) : null;
            setOwnProfileId(id);
        })
            .catch(() => {
            if (!mounted)
                return;
            setOwnProfileId(null);
        });
        return () => {
            mounted = false;
        };
    }, [apiAccessToken]);
    const openProfileFromSearch = useCallback((profileIdLike) => {
        const safeProfileId = String(profileIdLike !== null && profileIdLike !== void 0 ? profileIdLike : '').trim();
        const own = String(ownProfileId || '').trim();
        if (!safeProfileId) {
            return;
        }
        if (own && own === safeProfileId) {
            navigation.navigate('UserProfileScreen', { showBackButton: true, origin: 'search' });
            return;
        }
        navigation.navigate('ViewUserProfileScreen', { profileId: safeProfileId });
    }, [navigation, ownProfileId]);
    const openGroupFromSearch = useCallback((groupIdLike) => {
        const safeGroupId = String(groupIdLike !== null && groupIdLike !== void 0 ? groupIdLike : '').trim();
        if (safeGroupId) {
            navigation.navigate('GroupProfileScreen', { groupId: safeGroupId, showBackButton: true, origin: 'search' });
            return;
        }
        navigation.navigate('GroupProfileScreen', { showBackButton: true, origin: 'search' });
    }, [navigation]);
    const competitionQuery = debouncedFilterValues.Competition.trim().toLowerCase();
    const personQuery = debouncedFilterValues.Person.trim().toLowerCase();
    const groupQuery = debouncedFilterValues.Group.trim().toLowerCase();
    const locationQuery = debouncedFilterValues.Location.trim().toLowerCase();
    const hasTypedQuery = Object.values(filterValues).some((value) => value.trim().length > 0);
    const hasActiveFilters = hasTypedQuery ||
        !!timeRange.start ||
        !!timeRange.end ||
        competitionTypeFilter !== 'all';
    const activeFilters = useMemo(() => {
        const ordered = filterOrder.filter((filter) => filterValues[filter].trim().length > 0);
        const missing = FILTERS.filter((filter) => filterValues[filter].trim().length > 0 && !ordered.includes(filter));
        return [...ordered, ...missing];
    }, [filterOrder, filterValues]);
    const matchValue = (value, q) => (q ? value.toLowerCase().includes(q) : true);
    const shouldShowPeople = hasTypedQuery && (personQuery.length > 0 || locationQuery.length > 0);
    const shouldShowGroups = hasTypedQuery && groupQuery.length > 0;
    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken || !hasTypedQuery || !shouldShowGroups) {
            setGroupResults([]);
            setGroupsError(null);
            return () => { };
        }
        setGroupsError(null);
        const query = debouncedFilterValues.Group.trim();
        searchGroups(apiAccessToken, { q: query || '', limit: 20, offset: 0 })
            .then((res) => {
            if (!mounted)
                return;
            const rows = Array.isArray(res === null || res === void 0 ? void 0 : res.groups) ? res.groups : [];
            setGroupResults(rows.map((group) => {
                var _a;
                return ({
                    id: String(group.group_id),
                    group_id: String(group.group_id),
                    name: String(group.name || t('Group')),
                    activity: `${Number((_a = group.member_count) !== null && _a !== void 0 ? _a : 0)} ${t('Members')}`,
                    location: (function () {
                        const candidates = [
                            String((group === null || group === void 0 ? void 0 : group.city) || '').trim(),
                            String((group === null || group === void 0 ? void 0 : group.base_location) || '').trim(),
                            String((group === null || group === void 0 ? void 0 : group.location) || '').trim(),
                        ].filter(Boolean);
                        return candidates.find((value) => value.length <= 48 && !/[.!?]/.test(value))
                            || candidates[0]
                            || '';
                    })(),
                    images: [
                        String(group.avatar_url || group.group_avatar_url || group.owner_avatar_url || '').trim(),
                    ].filter(Boolean),
                });
            }));
        })
            .catch((e) => {
            var _a;
            if (!mounted)
                return;
            const msg = e instanceof ApiError ? e.message : String((_a = e === null || e === void 0 ? void 0 : e.message) !== null && _a !== void 0 ? _a : e);
            setGroupsError(msg);
            setGroupResults([]);
        });
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, debouncedFilterValues.Group, hasTypedQuery, shouldShowGroups, t]);
    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken || !hasTypedQuery || !shouldShowPeople) {
            setPeopleResults([]);
            setPeopleError(null);
            return () => { };
        }
        setPeopleError(null);
        const q = (personQuery || locationQuery || groupQuery).trim();
        if (!q) {
            setPeopleResults([]);
            return () => { };
        }
        searchProfiles(apiAccessToken, { q, limit: 20, offset: 0 })
            .then((res) => {
            if (!mounted)
                return;
            const rows = Array.isArray(res === null || res === void 0 ? void 0 : res.profiles) ? res.profiles : [];
            setPeopleResults(rows.map((profile, idx) => {
                var _a;
                return (Object.assign(Object.assign({}, (function () {
                    var _a;
                    const selectedEventsNormalized = Array.isArray(profile.selected_events)
                        ? profile.selected_events
                            .map((entry) => String(entry || '').trim().toLowerCase())
                            .filter(Boolean)
                        : [];
                    const trackFieldMainEvent = String(profile.track_field_main_event || '').trim();
                    const roadTrailMainEvent = String(profile.road_trail_main_event || '').trim();
                    const trackFieldClub = String(profile.track_field_club || '').trim();
                    const selectedFocuses = normalizeSelectedEvents(selectedEventsNormalized);
                    const sportFocusId = (_a = selectedFocuses[0]) !== null && _a !== void 0 ? _a : (roadTrailMainEvent ? 'road-events' : (trackFieldMainEvent || trackFieldClub) ? 'track-field' : null);
                    const sportLabel = sportFocusId ? getSportFocusLabel(sportFocusId, t) : '';
                    return {
                        trackFieldMainEvent,
                        roadTrailMainEvent,
                        trackFieldClub,
                        sportFocusId,
                        sportLabel,
                    };
                })()), { id: idx + 1, profile_id: String(profile.profile_id || ''), name: String(profile.display_name || t('User')), avatar_url: (_a = profile.avatar_url) !== null && _a !== void 0 ? _a : null, role: 'Athlete', activity: '', location: String((profile === null || profile === void 0 ? void 0 : profile.location) || '').trim(), runningClub: String(String(profile.track_field_club || '').trim() ||
                        (profile === null || profile === void 0 ? void 0 : profile.running_club) ||
                        (profile === null || profile === void 0 ? void 0 : profile.athletics_club) ||
                        '').trim() }));
            }));
        })
            .catch((e) => {
            var _a;
            if (!mounted)
                return;
            const msg = e instanceof ApiError ? e.message : String((_a = e === null || e === void 0 ? void 0 : e.message) !== null && _a !== void 0 ? _a : e);
            setPeopleError(msg);
            setPeopleResults([]);
        });
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, groupQuery, hasTypedQuery, locationQuery, personQuery, shouldShowPeople, t]);
    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken || !hasTypedQuery || !groupQuery || groupResults.length === 0) {
            setGroupLinkedPeople([]);
            return () => { };
        }
        const load = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const topGroups = groupResults.slice(0, 6);
                const responses = yield Promise.all(topGroups.map((group) => __awaiter(void 0, void 0, void 0, function* () {
                    try {
                        return yield getGroupMembers(apiAccessToken, String(group.group_id));
                    }
                    catch (_b) {
                        return null;
                    }
                })));
                if (!mounted)
                    return;
                const dedupe = new Set();
                const members = [];
                responses.forEach((resp) => {
                    var _a;
                    const list = Array.isArray(resp === null || resp === void 0 ? void 0 : resp.members) ? (_a = resp === null || resp === void 0 ? void 0 : resp.members) !== null && _a !== void 0 ? _a : [] : [];
                    list.forEach((member) => {
                        var _a;
                        const profileId = String(member.profile_id || '').trim();
                        if (!profileId || dedupe.has(profileId))
                            return;
                        dedupe.add(profileId);
                        members.push({
                            id: members.length + 1,
                            profile_id: profileId,
                            name: String(member.display_name || t('User')),
                            avatar_url: (_a = member.avatar_url) !== null && _a !== void 0 ? _a : null,
                            role: 'Athlete',
                            activity: '',
                            sportLabel: '',
                            sportFocusId: null,
                            location: '',
                        });
                    });
                });
                setGroupLinkedPeople(members);
            }
            catch (_a) {
                if (!mounted)
                    return;
                setGroupLinkedPeople([]);
            }
        });
        load();
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, groupQuery, groupResults, hasTypedQuery, t]);
    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken) {
            setResolvedPersonAvatars({});
            return () => { };
        }
        const rows = [...peopleResults, ...groupLinkedPeople];
        const missingIds = Array.from(new Set(rows
            .filter((person) => !String(person.avatar_url || '').trim())
            .map((person) => String(person.profile_id || '').trim())
            .filter(Boolean))).slice(0, 20);
        if (missingIds.length === 0) {
            setResolvedPersonAvatars({});
            return () => { };
        }
        const loadFallbackAvatars = () => __awaiter(void 0, void 0, void 0, function* () {
            const entries = yield Promise.all(missingIds.map((profileId) => __awaiter(void 0, void 0, void 0, function* () {
                var _a, _b, _c;
                try {
                    const summary = yield getProfileSummaryById(apiAccessToken, profileId);
                    const avatarMedia = (_b = (_a = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _a === void 0 ? void 0 : _a.avatar_media) !== null && _b !== void 0 ? _b : null;
                    const avatarCandidate = (avatarMedia === null || avatarMedia === void 0 ? void 0 : avatarMedia.thumbnail_url) ||
                        (avatarMedia === null || avatarMedia === void 0 ? void 0 : avatarMedia.preview_url) ||
                        (avatarMedia === null || avatarMedia === void 0 ? void 0 : avatarMedia.full_url) ||
                        (avatarMedia === null || avatarMedia === void 0 ? void 0 : avatarMedia.raw_url) ||
                        (avatarMedia === null || avatarMedia === void 0 ? void 0 : avatarMedia.original_url) ||
                        ((_c = summary === null || summary === void 0 ? void 0 : summary.profile) === null || _c === void 0 ? void 0 : _c.avatar_url) ||
                        null;
                    const safeUrl = String(avatarCandidate || '').trim();
                    return safeUrl ? [profileId, safeUrl] : null;
                }
                catch (_d) {
                    return null;
                }
            })));
            if (!mounted)
                return;
            const nextMap = {};
            entries.forEach((entry) => {
                if (!entry)
                    return;
                nextMap[entry[0]] = entry[1];
            });
            setResolvedPersonAvatars(nextMap);
        });
        loadFallbackAvatars();
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, groupLinkedPeople, peopleResults]);
    const parseEventDate = (value) => {
        const [day, month, year] = value.split('/').map(Number);
        if (!day || !month || !year)
            return null;
        return new Date(year, month - 1, day, 12, 0, 0, 0);
    };
    const toDateString = useCallback((date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }, []);
    const fromDateString = (value, isEnd) => {
        const [year, month, day] = value.split('-').map(Number);
        if (!year || !month || !day)
            return null;
        if (isEnd) {
            return new Date(year, month - 1, day, 23, 59, 59, 999);
        }
        return new Date(year, month - 1, day, 0, 0, 0, 0);
    };
    const isWithinRange = useCallback((date) => {
        if (!date)
            return false;
        const start = timeRange.start;
        const end = timeRange.end;
        if (start && end)
            return date >= start && date <= end;
        if (start)
            return date >= start;
        if (end)
            return date <= end;
        return true;
    }, [timeRange.end, timeRange.start]);
    const shouldShowEvents = useMemo(() => {
        var _a;
        if (!hasTypedQuery)
            return true;
        const activeFilterValue = String((_a = filterValues[activeFilter]) !== null && _a !== void 0 ? _a : '').trim();
        if (!activeFilterValue)
            return false;
        if (activeFilter === 'Competition' || activeFilter === 'Location')
            return true;
        if (competitionQuery.length > 0 || locationQuery.length > 0)
            return true;
        return false;
    }, [activeFilter, competitionQuery, filterValues, hasTypedQuery, locationQuery]);
    const filteredEvents = useMemo(() => {
        if (hasTypedQuery && !shouldShowEvents)
            return [];
        return eventResults.filter((event) => {
            const eventDate = parseEventDate(event.date);
            const rangeOk = timeRange.start || timeRange.end ? isWithinRange(eventDate) : true;
            const typeOk = competitionTypeFilter === 'all' ? true : event.competitionType === competitionTypeFilter;
            return (matchValue(event.name, competitionQuery) &&
                matchValue(event.location, locationQuery) &&
                rangeOk &&
                typeOk);
        });
    }, [competitionQuery, competitionTypeFilter, eventResults, hasTypedQuery, isWithinRange, locationQuery, shouldShowEvents, timeRange.end, timeRange.start]);
    const filteredPeople = useMemo(() => {
        if (!hasTypedQuery || !shouldShowPeople)
            return [];
        const mergedPeople = [...peopleResults, ...groupLinkedPeople];
        const seenProfiles = new Set();
        return mergedPeople.filter((person) => {
            const pid = String(person.profile_id || '').trim();
            if (pid) {
                if (seenProfiles.has(pid))
                    return false;
                seenProfiles.add(pid);
            }
            return (matchValue(person.name, personQuery) &&
                matchValue(person.location, locationQuery));
        });
    }, [
        hasTypedQuery,
        groupLinkedPeople,
        locationQuery,
        personQuery,
        peopleResults,
        shouldShowPeople,
    ]);
    const filteredGroups = useMemo(() => {
        if (!hasTypedQuery || !shouldShowGroups)
            return [];
        return groupResults.filter((group) => {
            return (matchValue(group.name, groupQuery) &&
                matchValue(`${group.location} ${group.activity}`, locationQuery));
        });
    }, [
        hasTypedQuery,
        groupQuery,
        groupResults,
        locationQuery,
        shouldShowGroups,
    ]);
    const totalCount = useMemo(() => (filteredEvents.length + filteredPeople.length + filteredGroups.length), [filteredEvents.length, filteredGroups.length, filteredPeople.length]);
    const hasAnyResults = totalCount > 0;
    const handleFilterPress = (filter) => {
        setActiveFilter(filter);
        requestAnimationFrame(() => {
            var _a;
            (_a = searchInputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        });
    };
    const handleSearchChange = (text) => {
        const trimmedNext = text.trim();
        setFilterValues(prev => (Object.assign(Object.assign({}, prev), { [activeFilter]: text })));
        setFilterOrder((prev) => {
            var _a;
            const currentValue = String((_a = filterValues[activeFilter]) !== null && _a !== void 0 ? _a : '').trim();
            if (!currentValue && trimmedNext) {
                return prev.includes(activeFilter) ? prev : [...prev, activeFilter];
            }
            if (currentValue && !trimmedNext) {
                return prev.filter((filter) => filter !== activeFilter);
            }
            return prev;
        });
    };
    const clearFilterValue = (filter) => {
        setFilterValues(prev => (Object.assign(Object.assign({}, prev), { [filter]: '' })));
        setFilterOrder((prev) => prev.filter((entry) => entry !== filter));
    };
    const preferredSection = useMemo(() => filterToSection(activeFilter), [activeFilter]);
    const orderedResultSections = useMemo(() => {
        const defaultOrder = ['events', 'people', 'groups'];
        const merged = [
            preferredSection,
            ...defaultOrder.filter((key) => key !== preferredSection),
        ];
        return merged.filter((key) => {
            if (key === 'events')
                return filteredEvents.length > 0;
            if (key === 'people')
                return filteredPeople.length > 0;
            return filteredGroups.length > 0;
        });
    }, [filteredEvents.length, filteredGroups.length, filteredPeople.length, preferredSection]);
    const latestCompetitions = useMemo(() => {
        const sorted = [...filteredEvents].sort((a, b) => {
            const ad = parseEventDate(a.date);
            const bd = parseEventDate(b.date);
            if (ad && bd)
                return bd.getTime() - ad.getTime();
            if (bd)
                return 1;
            if (ad)
                return -1;
            return String(a.name).localeCompare(String(b.name));
        });
        return sorted;
    }, [filteredEvents]);
    const visibleLatestCompetitions = useMemo(() => latestCompetitions.slice(0, defaultVisibleCount), [defaultVisibleCount, latestCompetitions]);
    const visibleFilteredEvents = useMemo(() => filteredEvents.slice(0, searchVisibleCount), [filteredEvents, searchVisibleCount]);
    const visibleFilteredPeople = useMemo(() => filteredPeople.slice(0, searchVisibleCount), [filteredPeople, searchVisibleCount]);
    const visibleFilteredGroups = useMemo(() => filteredGroups.slice(0, searchVisibleCount), [filteredGroups, searchVisibleCount]);
    const maxSearchSectionLength = useMemo(() => Math.max(filteredEvents.length, filteredPeople.length, filteredGroups.length), [filteredEvents.length, filteredGroups.length, filteredPeople.length]);
    const hasMoreDefaultCompetitions = visibleLatestCompetitions.length < latestCompetitions.length;
    const hasMoreSearchResults = searchVisibleCount < maxSearchSectionLength;
    useEffect(() => {
        loadMoreLockedRef.current = false;
        if (!hasTypedQuery) {
            setDefaultVisibleCount(DEFAULT_COMPETITIONS_INITIAL_LIMIT);
            return;
        }
        setSearchVisibleCount(SEARCH_RESULTS_INITIAL_LIMIT);
    }, [
        hasTypedQuery,
        activeFilter,
        competitionQuery,
        groupQuery,
        locationQuery,
        personQuery,
        competitionTypeFilter,
        timeRange.start,
        timeRange.end,
    ]);
    const handleMainScroll = useCallback((event) => {
        const native = event === null || event === void 0 ? void 0 : event.nativeEvent;
        if (!native)
            return;
        const { contentOffset, contentSize, layoutMeasurement } = native;
        const distanceToBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
        if (distanceToBottom > SCROLL_LOAD_THRESHOLD_PX) {
            loadMoreLockedRef.current = false;
            return;
        }
        if (loadMoreLockedRef.current)
            return;
        if (!hasTypedQuery && !hasMoreDefaultCompetitions)
            return;
        if (hasTypedQuery && (!hasActiveFilters || !hasMoreSearchResults))
            return;
        loadMoreLockedRef.current = true;
        if (!hasTypedQuery) {
            setDefaultVisibleCount((prev) => Math.min(prev + DEFAULT_COMPETITIONS_INITIAL_LIMIT, latestCompetitions.length));
            return;
        }
        setSearchVisibleCount((prev) => Math.min(prev + SEARCH_RESULTS_INITIAL_LIMIT, maxSearchSectionLength));
    }, [
        hasTypedQuery,
        hasMoreDefaultCompetitions,
        hasActiveFilters,
        hasMoreSearchResults,
        latestCompetitions.length,
        maxSearchSectionLength,
    ]);
    const getCompetitionTypeLabel = (type) => {
        return getSportFocusLabel(type, t);
    };
    const renderEventCard = (event) => (_jsxs(TouchableOpacity, Object.assign({ testID: `search-event-card-${event.id}`, style: Styles.eventCard, onPress: () => navigation.navigate('CompetitionDetailsScreen', {
            eventId: event.id,
            name: event.name,
            location: event.location,
            date: event.date,
            competitionType: event.competitionType,
            organizingClub: event.organizingClub,
        }) }, { children: [_jsx(View, Object.assign({ style: Styles.eventIconContainer }, { children: _jsx(Calendar, { size: 20, color: colors.primaryColor, variant: "Linear" }) })), _jsx(SizeBox, { width: 16 }), _jsxs(View, Object.assign({ style: Styles.eventContent }, { children: [_jsxs(View, Object.assign({ style: Styles.eventNameRow }, { children: [_jsx(Text, Object.assign({ style: Styles.eventName }, { children: event.name })), _jsx(View, Object.assign({ style: Styles.eventTypeBadge }, { children: _jsx(Text, Object.assign({ style: Styles.eventTypeBadgeText }, { children: getCompetitionTypeLabel(event.competitionType) })) }))] })), _jsx(SizeBox, { height: 4 }), _jsxs(View, Object.assign({ style: Styles.eventDetails }, { children: [event.date ? (_jsxs(View, Object.assign({ style: Styles.eventDetailItem }, { children: [_jsx(Calendar, { size: 14, color: "#9B9F9F", variant: "Linear" }), _jsx(SizeBox, { width: 4 }), _jsx(Text, Object.assign({ style: Styles.eventDetailText }, { children: event.date }))] }))) : null, event.location ? (_jsxs(View, Object.assign({ style: Styles.eventDetailItem }, { children: [_jsx(Location, { size: 14, color: "#9B9F9F", variant: "Linear" }), _jsx(SizeBox, { width: 4 }), _jsx(Text, Object.assign({ style: Styles.eventDetailText }, { children: event.location }))] }))) : null] })), event.organizingClub ? (_jsxs(_Fragment, { children: [_jsx(SizeBox, { height: 4 }), _jsx(Text, Object.assign({ style: Styles.eventMetaText, numberOfLines: 1 }, { children: event.organizingClub }))] })) : null] }))] }), event.id));
    const renderPersonCard = (person) => {
        var _a, _b;
        const profileIdKey = String(person.profile_id || '').trim();
        const fallbackAvatar = profileIdKey ? resolvedPersonAvatars[profileIdKey] : null;
        const avatarUrl = resolveAvatarUrl(person.avatar_url || fallbackAvatar);
        const isOwnSearchResult = String(person.profile_id || '').trim().length > 0 &&
            String(person.profile_id || '').trim() === String(ownProfileId || '').trim();
        const clubOrLocation = String(person.runningClub || person.location || '').trim();
        const avatarSource = avatarUrl
            ? { uri: avatarUrl }
            : isOwnSearchResult && authPicture
                ? { uri: authPicture }
                : Images.profilePic;
        return (_jsx(TouchableOpacity, Object.assign({ testID: `search-person-card-${String((_a = person.profile_id) !== null && _a !== void 0 ? _a : person.id)}`, style: Styles.userCard, onPress: () => { var _a; return openProfileFromSearch((_a = person.profile_id) !== null && _a !== void 0 ? _a : null); } }, { children: _jsx(View, Object.assign({ style: Styles.userCardContent }, { children: _jsxs(View, Object.assign({ style: Styles.userHeader }, { children: [_jsx(FastImage, { source: avatarSource, style: Styles.userAvatar, resizeMode: "cover" }), _jsx(SizeBox, { width: 8 }), _jsxs(View, Object.assign({ style: Styles.userInfo }, { children: [_jsx(View, Object.assign({ style: Styles.userNameRow }, { children: _jsx(Text, Object.assign({ style: Styles.userName }, { children: person.name })) })), _jsxs(View, Object.assign({ style: Styles.userDetailsStack }, { children: [String(person.sportLabel || '').trim().length > 0 ? (_jsxs(View, Object.assign({ style: Styles.userDetailItem }, { children: [person.sportFocusId ? (_jsx(SportFocusIcon, { focusId: person.sportFocusId, size: 16, color: colors.primaryColor })) : person.role === 'Athlete' ? (_jsx(Icons.Run, { height: 16, width: 16 })) : (_jsx(Camera, { size: 16, color: "#9B9F9F", variant: "Linear" })), _jsx(SizeBox, { width: 4 }), _jsx(Text, Object.assign({ style: Styles.userDetailText }, { children: person.sportLabel }))] }))) : null, clubOrLocation.length > 0 ? (_jsx(View, Object.assign({ style: Styles.userClubDetailItem }, { children: _jsx(Text, Object.assign({ style: Styles.userDetailText, numberOfLines: 1 }, { children: clubOrLocation })) }))) : null] }))] })), person.role === 'Athlete' && !isOwnSearchResult ? (_jsx(TouchableOpacity, Object.assign({ style: Styles.followBtn, disabled: !apiAccessToken || !person.profile_id || followBusyProfileId === String(person.profile_id), onPress: (e) => __awaiter(void 0, void 0, void 0, function* () {
                                var _c;
                                (_c = e.stopPropagation) === null || _c === void 0 ? void 0 : _c.call(e);
                                const targetId = String(person.profile_id || '').trim();
                                if (!apiAccessToken || !targetId)
                                    return;
                                try {
                                    setFollowBusyProfileId(targetId);
                                    if (person.isFollowing) {
                                        yield unfollowProfile(apiAccessToken, targetId);
                                    }
                                    else {
                                        yield followProfile(apiAccessToken, targetId);
                                    }
                                    setPeopleResults((prev) => prev.map((p) => String(p.profile_id || '') === targetId
                                        ? Object.assign(Object.assign({}, p), { isFollowing: !Boolean(p.isFollowing) }) : p));
                                }
                                finally {
                                    setFollowBusyProfileId((current) => (current === targetId ? null : current));
                                }
                            }) }, { children: _jsx(Text, Object.assign({ style: Styles.followBtnText }, { children: person.isFollowing ? t('Following') : t('Follow') })) }))) : null] })) })) }), (_b = person.profile_id) !== null && _b !== void 0 ? _b : String(person.id)));
    };
    const renderGroupAvatarCell = (uri, style) => (uri ? (_jsx(FastImage, { source: { uri }, style: style, resizeMode: "cover" })) : (_jsx(View, { style: [style, Styles.groupAvatarPlaceholder] })));
    const renderGroupCard = (group) => (_jsx(TouchableOpacity, Object.assign({ testID: `search-group-card-${String(group.group_id || group.id)}`, style: Styles.userCard, onPress: () => openGroupFromSearch(group.group_id) }, { children: _jsx(View, Object.assign({ style: Styles.userCardContent }, { children: _jsxs(View, Object.assign({ style: Styles.userHeader }, { children: [_jsxs(View, Object.assign({ style: Styles.groupAvatarGrid }, { children: [_jsxs(View, Object.assign({ style: Styles.groupAvatarRow }, { children: [renderGroupAvatarCell(group.images[0], Styles.groupAvatarTopLeft), renderGroupAvatarCell(group.images[1], Styles.groupAvatarTopRight)] })), _jsxs(View, Object.assign({ style: Styles.groupAvatarRow }, { children: [renderGroupAvatarCell(group.images[2], Styles.groupAvatarBottomLeft), renderGroupAvatarCell(group.images[3], Styles.groupAvatarBottomRight)] }))] })), _jsx(SizeBox, { width: 8 }), _jsxs(View, Object.assign({ style: Styles.userInfo }, { children: [_jsxs(View, Object.assign({ style: Styles.userNameRow }, { children: [_jsx(Text, Object.assign({ style: Styles.userName }, { children: group.name })), _jsx(View, Object.assign({ style: Styles.userTypeBadge }, { children: _jsx(Text, Object.assign({ style: Styles.userTypeText }, { children: t('Group') })) }))] })), _jsxs(View, Object.assign({ style: Styles.userDetails }, { children: [_jsxs(View, Object.assign({ style: Styles.userDetailItem }, { children: [_jsx(Camera, { size: 16, color: "#9B9F9F", variant: "Linear" }), _jsx(SizeBox, { width: 4 }), _jsx(Text, Object.assign({ style: Styles.userDetailText }, { children: group.activity }))] })), group.location ? (_jsxs(View, Object.assign({ style: Styles.userDetailItem }, { children: [_jsx(Location, { size: 16, color: "#9B9F9F", variant: "Linear" }), _jsx(SizeBox, { width: 4 }), _jsx(Text, Object.assign({ style: Styles.userDetailText }, { children: group.location }))] }))) : null] }))] }))] })) })) }), group.id));
    const renderNoResults = (label) => (_jsx(View, Object.assign({ style: Styles.noResultsContainer }, { children: _jsx(Text, Object.assign({ style: Styles.noResultsText }, { children: label })) })));
    const renderLoadingSpinner = () => (_jsx(View, Object.assign({ style: Styles.loadingSpinnerWrap }, { children: _jsx(ActivityIndicator, { size: "small", color: colors.primaryColor }) })));
    const openDateTimePicker = () => {
        const todaySeed = toDateString(new Date());
        const startSeed = timeRange.start ? toDateString(timeRange.start) : todaySeed;
        const endSeed = timeRange.end ? toDateString(timeRange.end) : null;
        setCalendarStart(startSeed);
        setCalendarEnd(endSeed);
        setNativePickerVisible(false);
        setActiveDateField(null);
        setShowIosPicker(true);
    };
    const setQuickRange = (preset) => {
        const today = new Date();
        if (preset === 'week') {
            const day = today.getDay(); // 0 (Sun) - 6 (Sat)
            const diffToMonday = (day + 6) % 7;
            const start = new Date(today);
            start.setDate(today.getDate() - diffToMonday);
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            setCalendarStart(toDateString(start));
            setCalendarEnd(toDateString(end));
            return;
        }
        if (preset === 'month') {
            const start = new Date(today.getFullYear(), today.getMonth(), 1);
            const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            setCalendarStart(toDateString(start));
            setCalendarEnd(toDateString(end));
            return;
        }
        const start = new Date(today.getFullYear(), 0, 1);
        const end = new Date(today.getFullYear(), 11, 31);
        setCalendarStart(toDateString(start));
        setCalendarEnd(toDateString(end));
    };
    const applyIosDateTime = () => {
        if (!calendarStart) {
            setShowIosPicker(false);
            return;
        }
        const start = fromDateString(calendarStart, false);
        const endSeed = calendarEnd !== null && calendarEnd !== void 0 ? calendarEnd : calendarStart;
        const end = fromDateString(endSeed, true);
        if (!start || !end) {
            setShowIosPicker(false);
            return;
        }
        const finalEnd = end < start ? new Date(start.getTime()) : end;
        setTimeRange({ start, end: finalEnd });
        setShowIosPicker(false);
    };
    const formatDateRange = (start, end) => {
        const sameDay = start.toDateString() === end.toDateString();
        const startText = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        if (sameDay)
            return startText;
        const endText = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return `${startText} → ${endText}`;
    };
    const closeNativePicker = useCallback(() => {
        setActiveDateField(null);
        setNativePickerVisible(false);
    }, []);
    const openRangeFieldPicker = useCallback((field) => {
        var _a, _b, _c;
        const fallback = toDateString(new Date());
        const seedValue = field === 'start'
            ? ((_a = calendarStart !== null && calendarStart !== void 0 ? calendarStart : calendarEnd) !== null && _a !== void 0 ? _a : fallback)
            : ((_b = calendarEnd !== null && calendarEnd !== void 0 ? calendarEnd : calendarStart) !== null && _b !== void 0 ? _b : fallback);
        const seed = (_c = fromDateString(seedValue, field === 'end')) !== null && _c !== void 0 ? _c : new Date();
        setActiveDateField(field);
        setNativePickerDate(seed);
        setNativePickerVisible(true);
    }, [calendarEnd, calendarStart, toDateString]);
    const applyPickedDateToField = useCallback((pickedDate, field) => {
        const selectedDay = toDateString(pickedDate);
        if (field === 'start') {
            setCalendarStart(selectedDay);
            if (calendarEnd && selectedDay > calendarEnd) {
                setCalendarEnd(selectedDay);
            }
            return;
        }
        if (!calendarStart || selectedDay < calendarStart) {
            setCalendarStart(selectedDay);
            setCalendarEnd(selectedDay);
            return;
        }
        setCalendarEnd(selectedDay);
    }, [calendarEnd, calendarStart, toDateString]);
    const onNativePickerChange = useCallback((event, selectedDate) => {
        if ((event === null || event === void 0 ? void 0 : event.type) === 'dismissed') {
            closeNativePicker();
            return;
        }
        const pickedDate = selectedDate !== null && selectedDate !== void 0 ? selectedDate : nativePickerDate;
        setNativePickerDate(pickedDate);
        if (Platform.OS === 'android' && activeDateField) {
            applyPickedDateToField(pickedDate, activeDateField);
            closeNativePicker();
        }
    }, [activeDateField, applyPickedDateToField, closeNativePicker, nativePickerDate]);
    const applyNativePickerSelection = useCallback(() => {
        if (!activeDateField) {
            closeNativePicker();
            return;
        }
        applyPickedDateToField(nativePickerDate, activeDateField);
        closeNativePicker();
    }, [activeDateField, applyPickedDateToField, closeNativePicker, nativePickerDate]);
    const searchPlaceholder = (() => {
        if (activeFilter === 'Competition')
            return t('Competition');
        if (activeFilter === 'Person')
            return t('Name');
        if (activeFilter === 'Group')
            return t('Group name');
        return t('Location');
    })();
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer, testID: "search-screen" }, { children: [_jsx(E2EPerfReady, { screen: "search", ready: perfReady, startedAtMs: perfStartedAtRef.current }), _jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(View, { style: Styles.headerSpacer }), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('Search') })), _jsx(View, { style: Styles.headerSpacer })] })), _jsxs(ScrollView, Object.assign({ style: Styles.container, showsVerticalScrollIndicator: false, keyboardShouldPersistTaps: "always", onScroll: handleMainScroll, scrollEventThrottle: 16 }, { children: [_jsx(SizeBox, { height: 24 }), _jsxs(View, Object.assign({ style: Styles.searchRow }, { children: [_jsx(UnifiedSearchInput, { testID: "search-input", ref: searchInputRef, containerStyle: Styles.searchInputContainer, contentStyle: { gap: 8 }, left: _jsxs(View, Object.assign({ style: { flexDirection: 'row', alignItems: 'center', marginRight: 8 } }, { children: [_jsx(SearchNormal1, { size: 16, color: "#9B9F9F", variant: "Linear" }), _jsx(SizeBox, { width: 8 }), _jsx(View, Object.assign({ style: Styles.searchInputPill }, { children: _jsxs(Text, Object.assign({ style: Styles.searchInputPillText }, { children: [t(activeFilter), ":"] })) }))] })), inputStyle: Styles.searchInput, placeholder: searchPlaceholder, value: activeValue, onChangeText: handleSearchChange, returnKeyType: "search" }), _jsx(TouchableOpacity, Object.assign({ onPress: () => navigation.navigate('AISearchScreen') }, { children: _jsx(View, Object.assign({ style: Styles.aiButton }, { children: _jsx(Icons.AiBlueBordered, { width: 24, height: 24 }) })) }))] })), _jsx(SizeBox, { height: 16 }), _jsx(View, Object.assign({ style: Styles.filterTabsContainer }, { children: _jsx(ScrollView, Object.assign({ horizontal: true, showsHorizontalScrollIndicator: false, keyboardShouldPersistTaps: "always" }, { children: FILTERS.map((filter) => (_jsx(TouchableOpacity, Object.assign({ testID: `search-filter-${String(filter).toLowerCase()}`, style: [
                                    Styles.filterTab,
                                    activeFilter === filter && Styles.filterTabActive
                                ], onPress: () => handleFilterPress(filter) }, { children: _jsx(Text, Object.assign({ style: [
                                        Styles.filterTabText,
                                        activeFilter === filter && Styles.filterTabTextActive
                                    ] }, { children: t(filter) })) }), filter))) })) })), _jsx(SizeBox, { height: 16 }), _jsxs(View, Object.assign({ style: Styles.typeFilterRow }, { children: [_jsx(Text, Object.assign({ style: Styles.typeFilterLabel }, { children: t('competitionType') })), _jsx(View, Object.assign({ style: Styles.typeFilterChips }, { children: competitionTypeFilters.map((option) => (_jsx(TouchableOpacity, Object.assign({ style: [
                                        Styles.typeFilterChip,
                                        competitionTypeFilter === option.key && Styles.typeFilterChipActive,
                                    ], onPress: () => setCompetitionTypeFilter(option.key) }, { children: _jsx(Text, Object.assign({ style: [
                                            Styles.typeFilterChipText,
                                            competitionTypeFilter === option.key && Styles.typeFilterChipTextActive,
                                        ] }, { children: option.label })) }), option.key))) }))] })), _jsx(SizeBox, { height: 12 }), _jsxs(View, Object.assign({ style: Styles.activeChipsContainer }, { children: [activeFilters.map((filter) => (_jsxs(TouchableOpacity, Object.assign({ style: Styles.activeChip, onPress: () => clearFilterValue(filter) }, { children: [_jsxs(Text, Object.assign({ style: Styles.activeChipText }, { children: [t(filter), ": ", filterValues[filter]] })), _jsx(CloseCircle, { size: 16, color: colors.pureWhite, variant: "Linear" })] }), filter))), timeRange.start && timeRange.end ? (_jsxs(TouchableOpacity, Object.assign({ style: Styles.timeRangeChipActive, onPress: openDateTimePicker }, { children: [_jsx(Clock, { size: 14, color: colors.primaryColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: Styles.timeRangeTextActive }, { children: formatDateRange(timeRange.start, timeRange.end) })), _jsx(TouchableOpacity, Object.assign({ onPress: () => setTimeRange({ start: null, end: null }) }, { children: _jsx(CloseCircle, { size: 16, color: colors.primaryColor, variant: "Linear" }) }))] }))) : (_jsxs(TouchableOpacity, Object.assign({ style: Styles.timeRangeChip, onPress: openDateTimePicker }, { children: [_jsx(Clock, { size: 14, color: "#9B9F9F", variant: "Linear" }), _jsx(SizeBox, { width: 4 }), _jsx(Text, Object.assign({ style: Styles.timeRangeText }, { children: t('selectDateRange') })), _jsx(SizeBox, { width: 4 }), _jsx(ArrowDown2, { size: 14, color: "#9B9F9F", variant: "Linear" })] })))] })), _jsx(SizeBox, { height: 24 }), !hasTypedQuery && (_jsxs(_Fragment, { children: [_jsxs(View, Object.assign({ style: Styles.resultsHeader }, { children: [_jsx(Text, Object.assign({ style: Styles.resultsTitle }, { children: t('Latest competitions') })), _jsx(View, Object.assign({ style: Styles.resultsBadge }, { children: _jsxs(Text, Object.assign({ style: Styles.resultsBadgeText }, { children: [latestCompetitions.length, " ", t('competitions')] })) }))] })), _jsx(SizeBox, { height: 16 }), eventsError ? (_jsx(Text, Object.assign({ style: Styles.noResultsText }, { children: eventsError }))) : isLoadingEvents ? (renderLoadingSpinner()) : latestCompetitions.length > 0 ? (visibleLatestCompetitions.map(renderEventCard)) : (renderNoResults(t('No competitions found')))] })), hasTypedQuery && hasActiveFilters && (_jsxs(_Fragment, { children: [_jsxs(View, Object.assign({ style: Styles.resultsHeader }, { children: [_jsx(Text, Object.assign({ style: Styles.resultsTitle }, { children: t('Results') })), _jsx(View, Object.assign({ style: Styles.resultsBadge }, { children: _jsxs(Text, Object.assign({ style: Styles.resultsBadgeText }, { children: [totalCount, " ", t('found')] })) }))] })), _jsx(SizeBox, { height: 16 }), !hasAnyResults ? (renderNoResults(t('No results found'))) : (_jsxs(_Fragment, { children: [eventsError ? (_jsxs(_Fragment, { children: [_jsx(Text, Object.assign({ style: Styles.noResultsText }, { children: eventsError })), _jsx(SizeBox, { height: 10 })] })) : null, groupsError ? (_jsxs(_Fragment, { children: [_jsx(Text, Object.assign({ style: Styles.noResultsText }, { children: groupsError })), _jsx(SizeBox, { height: 10 })] })) : null, peopleError ? (_jsxs(_Fragment, { children: [_jsx(Text, Object.assign({ style: Styles.noResultsText }, { children: peopleError })), _jsx(SizeBox, { height: 10 })] })) : null, orderedResultSections.map((sectionKey, index) => {
                                        const isLast = index === orderedResultSections.length - 1;
                                        if (sectionKey === 'events') {
                                            return (_jsxs(React.Fragment, { children: [_jsx(Text, Object.assign({ style: Styles.sectionTitle }, { children: t('Competitions') })), _jsx(SizeBox, { height: 10 }), visibleFilteredEvents.map(renderEventCard), !isLast ? _jsx(SizeBox, { height: 20 }) : null] }, "results-events"));
                                        }
                                        if (sectionKey === 'people') {
                                            return (_jsxs(React.Fragment, { children: [_jsx(Text, Object.assign({ style: Styles.sectionTitle }, { children: t('People') })), _jsx(SizeBox, { height: 10 }), visibleFilteredPeople.map(renderPersonCard), !isLast ? _jsx(SizeBox, { height: 20 }) : null] }, "results-people"));
                                        }
                                        return (_jsxs(React.Fragment, { children: [_jsx(Text, Object.assign({ style: Styles.sectionTitle }, { children: t('Groups') })), _jsx(SizeBox, { height: 10 }), visibleFilteredGroups.map(renderGroupCard), !isLast ? _jsx(SizeBox, { height: 20 }) : null] }, "results-groups"));
                                    })] }))] })), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 100 : 120 })] })), _jsx(Modal, Object.assign({ visible: showIosPicker, transparent: true, animationType: "fade", onRequestClose: () => {
                    setShowIosPicker(false);
                    closeNativePicker();
                } }, { children: _jsxs(View, Object.assign({ style: Styles.modalOverlay }, { children: [_jsx(Pressable, { style: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }, onPress: () => {
                                setShowIosPicker(false);
                                closeNativePicker();
                            } }), _jsxs(View, Object.assign({ style: Styles.dateModalContainer }, { children: [_jsx(Text, Object.assign({ style: Styles.dateModalTitle }, { children: t('selectDateRange') })), _jsx(SizeBox, { height: 10 }), _jsxs(View, Object.assign({ style: Styles.quickRangeRow }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.quickRangeChip, onPress: () => setQuickRange('week') }, { children: _jsx(Text, Object.assign({ style: Styles.quickRangeChipText }, { children: t('thisWeek') })) })), _jsx(TouchableOpacity, Object.assign({ style: Styles.quickRangeChip, onPress: () => setQuickRange('month') }, { children: _jsx(Text, Object.assign({ style: Styles.quickRangeChipText }, { children: t('thisMonth') })) })), _jsx(TouchableOpacity, Object.assign({ style: Styles.quickRangeChip, onPress: () => setQuickRange('year') }, { children: _jsx(Text, Object.assign({ style: Styles.quickRangeChipText }, { children: t('thisYear') })) }))] })), _jsx(SizeBox, { height: 8 }), _jsxs(View, Object.assign({ style: Styles.rangeHeaderRow }, { children: [_jsxs(TouchableOpacity, Object.assign({ style: Styles.rangePill, onPress: () => openRangeFieldPicker('start'), activeOpacity: 0.8 }, { children: [_jsx(Text, Object.assign({ style: Styles.rangePillLabel }, { children: t('start') })), _jsx(Text, Object.assign({ style: Styles.rangePillValue }, { children: calendarStart !== null && calendarStart !== void 0 ? calendarStart : t('selectDate') }))] })), _jsxs(TouchableOpacity, Object.assign({ style: Styles.rangePill, onPress: () => openRangeFieldPicker('end'), activeOpacity: 0.8 }, { children: [_jsx(Text, Object.assign({ style: Styles.rangePillLabel }, { children: t('end') })), _jsx(Text, Object.assign({ style: Styles.rangePillValue }, { children: calendarEnd !== null && calendarEnd !== void 0 ? calendarEnd : t('selectDate') }))] }))] })), _jsx(SizeBox, { height: 12 }), _jsxs(View, Object.assign({ style: Styles.modalButtonRow }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.modalCancelButton, onPress: () => {
                                                setShowIosPicker(false);
                                                closeNativePicker();
                                            } }, { children: _jsx(Text, Object.assign({ style: Styles.modalCancelText }, { children: t('cancel') })) })), _jsx(TouchableOpacity, Object.assign({ style: [Styles.modalSubmitButton, !calendarStart && Styles.modalSubmitButtonDisabled], onPress: applyIosDateTime, disabled: !calendarStart }, { children: _jsx(Text, Object.assign({ style: Styles.modalSubmitText }, { children: t('apply') })) }))] }))] })), Platform.OS === 'ios' && nativePickerVisible && activeDateField ? (_jsxs(View, Object.assign({ style: Styles.nativePickerOverlay }, { children: [_jsx(Pressable, { style: Styles.nativePickerBackdrop, onPress: closeNativePicker }), _jsxs(View, Object.assign({ style: Styles.nativePickerSheet }, { children: [_jsxs(View, Object.assign({ style: Styles.nativePickerToolbar }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.nativePickerAction, onPress: closeNativePicker }, { children: _jsx(Text, Object.assign({ style: Styles.nativePickerActionText }, { children: t('cancel') })) })), _jsx(TouchableOpacity, Object.assign({ style: Styles.nativePickerAction, onPress: applyNativePickerSelection }, { children: _jsx(Text, Object.assign({ style: Styles.nativePickerActionText }, { children: t('apply') })) }))] })), _jsx(DateTimePicker, Object.assign({}, pickerVisualProps, { value: nativePickerDate, mode: "date", display: "spinner", onChange: onNativePickerChange }))] }))] }))) : null] })) })), nativePickerVisible && activeDateField && Platform.OS === 'android' ? (_jsx(DateTimePicker, Object.assign({}, pickerVisualProps, { value: nativePickerDate, mode: "date", display: "default", onChange: onNativePickerChange }))) : null] })));
};
export default SearchScreen;
