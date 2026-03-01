import { View, Text, ScrollView, TouchableOpacity, Modal, Pressable, TextInput, Platform, ActivityIndicator } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import DateTimePicker from '@react-native-community/datetimepicker'
import { createStyles } from './SearchStyles'
import SizeBox from '../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../../context/ThemeContext'
import Icons from '../../constants/Icons'
import FastImage from 'react-native-fast-image'
import { SearchNormal1, Calendar, Location, CloseCircle, Clock, ArrowDown2, Camera } from 'iconsax-react-nativejs'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { ApiError, followProfile, getGroupMembers, getProfileSummary, searchEvents, searchGroups, searchProfiles, unfollowProfile } from '../../services/apiGateway'
import UnifiedSearchInput from '../../components/unifiedSearchInput/UnifiedSearchInput'
 

const FILTERS = ['Competition', 'Person', 'Group', 'Location'] as const
type FilterKey = typeof FILTERS[number]
type ResultSectionKey = 'events' | 'people' | 'groups'
const DEFAULT_COMPETITIONS_INITIAL_LIMIT = 10;
const SEARCH_RESULTS_INITIAL_LIMIT = 20;
const SCROLL_LOAD_THRESHOLD_PX = 220;

type CompetitionType = 'track' | 'road'
type CompetitionTypeFilter = 'all' | CompetitionType

interface EventResult {
    id: string;
    name: string;
    date: string;
    location: string;
    competitionType: CompetitionType;
    organizingClub?: string;
}

interface PersonResult {
    id: number;
    name: string;
    profile_id?: string;
    avatar_url?: string | null;
    role: 'Athlete' | 'Photographer';
    activity: string;
    location: string;
    runningClub?: string;
    isFollowing?: boolean;
    events?: string[];
}

interface GroupResult {
    id: string;
    group_id: string;
    name: string;
    activity: string;
    location: string;
    images: string[];
}

const filterToSection = (filter: FilterKey): ResultSectionKey => {
    if (filter === 'Group') return 'groups'
    if (filter === 'Person') return 'people'
    return 'events'
}

const SearchScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const { apiAccessToken } = useAuth();
    const Styles = createStyles(colors);
    const isLightTheme = String(colors.backgroundColor || '').toLowerCase() === '#ffffff';
    const pickerVisualProps = useMemo<any>(() => (
        Platform.OS === 'ios'
            ? {
                themeVariant: isLightTheme ? 'light' : 'dark',
                textColor: isLightTheme ? '#0B1220' : '#F8FAFC',
                accentColor: colors.primaryColor,
            }
            : {}
    ), [colors.primaryColor, isLightTheme]);
    const [ownProfileId, setOwnProfileId] = useState<string | null>(null);
    const searchInputRef = useRef<TextInput>(null);

    const [activeFilter, setActiveFilter] = useState<FilterKey>('Competition');
    const [filterOrder, setFilterOrder] = useState<FilterKey[]>([]);
    const [filterValues, setFilterValues] = useState<Record<FilterKey, string>>({
        Competition: '',
        Person: '',
        Group: '',
        Location: '',
    });
    const [competitionTypeFilter, setCompetitionTypeFilter] = useState<CompetitionTypeFilter>('all');
    const [timeRange, setTimeRange] = useState<{ start: Date | null; end: Date | null }>({
        start: null,
        end: null,
    });
    const [showIosPicker, setShowIosPicker] = useState(false);
    const [calendarStart, setCalendarStart] = useState<string | null>(null);
    const [calendarEnd, setCalendarEnd] = useState<string | null>(null);
    const [nativePickerVisible, setNativePickerVisible] = useState(false);
    const [nativePickerDate, setNativePickerDate] = useState<Date>(new Date());
    const [activeDateField, setActiveDateField] = useState<'start' | 'end' | null>(null);
    const [eventResults, setEventResults] = useState<EventResult[]>([]);
    const [eventsError, setEventsError] = useState<string | null>(null);
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);
    const [groupResults, setGroupResults] = useState<GroupResult[]>([]);
    const [groupsError, setGroupsError] = useState<string | null>(null);
    const [peopleResults, setPeopleResults] = useState<PersonResult[]>([]);
    const [peopleError, setPeopleError] = useState<string | null>(null);
    const [groupLinkedPeople, setGroupLinkedPeople] = useState<PersonResult[]>([]);
    const [followBusyProfileId, setFollowBusyProfileId] = useState<string | null>(null);
    const [defaultVisibleCount, setDefaultVisibleCount] = useState(DEFAULT_COMPETITIONS_INITIAL_LIMIT);
    const [searchVisibleCount, setSearchVisibleCount] = useState(SEARCH_RESULTS_INITIAL_LIMIT);
    const loadMoreLockedRef = useRef(false);
 
    const competitionTypeFilters = useMemo(
        () => ([
            { key: 'all' as const, label: 'all' },
            { key: 'track' as const, label: 'trackAndField' },
            { key: 'road' as const, label: 'roadAndTrail' },
        ]),
        [],
    );

    const activeValue = filterValues[activeFilter] ?? '';
    const formatEventDate = useCallback((value?: string | null) => {
        if (!value) return '';
        const d = new Date(String(value));
        if (Number.isNaN(d.getTime())) return String(value);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    }, []);
    const resolveCompetitionType = useCallback((params?: {
        type?: string | null;
        name?: string | null;
        location?: string | null;
    }) => {
        const token = `${params?.type || ''} ${params?.name || ''} ${params?.location || ''}`.toLowerCase();
        if (/road|trail|marathon|veldloop|veldlopen|cross|5k|10k|half|ultra|city\s*run/.test(token)) {
            return 'road' as const;
        }
        return 'track' as const;
    }, []);

    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken) {
            setEventResults([]);
            setEventsError(null);
            setIsLoadingEvents(false);
            return () => {};
        }
        setEventsError(null);
        setIsLoadingEvents(true);
        searchEvents(apiAccessToken, { q: '', limit: 200 })
            .then((res) => {
                if (!mounted) return;
                const list = Array.isArray(res?.events) ? res.events : [];
                setEventResults(
                    list.map((event: any) => ({
                        id: String(event.event_id),
                        name: String(event.event_name || event.event_title || t('Competition')),
                        date: formatEventDate(event.event_date),
                        location: String(event.event_location || ''),
                        competitionType: resolveCompetitionType({
                            type: event.competition_type,
                            name: event.event_name || event.event_title,
                            location: event.event_location,
                        }),
                        organizingClub: String(
                            event.organizing_club
                            || event.organizer_club
                            || event.competition_organizing_club
                            || event.competition_organizer_name
                            || '',
                        ).trim(),
                    })),
                );
                setIsLoadingEvents(false);
            })
            .catch((e: any) => {
                if (!mounted) return;
                const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
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
            return () => {};
        }
        getProfileSummary(apiAccessToken)
            .then((resp) => {
                if (!mounted) return;
                const id = resp?.profile_id ? String(resp.profile_id) : null;
                setOwnProfileId(id);
            })
            .catch(() => {
                if (!mounted) return;
                setOwnProfileId(null);
            });
        return () => {
            mounted = false;
        };
    }, [apiAccessToken]);

    const openProfileFromSearch = useCallback((profileIdLike?: string | number | null) => {
        const safeProfileId = String(profileIdLike ?? '').trim();
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

    const openGroupFromSearch = useCallback((groupIdLike?: string | number | null) => {
        const safeGroupId = String(groupIdLike ?? '').trim();
        if (safeGroupId) {
            navigation.navigate('GroupProfileScreen', { groupId: safeGroupId, showBackButton: true, origin: 'search' });
            return;
        }
        navigation.navigate('GroupProfileScreen', { showBackButton: true, origin: 'search' });
    }, [navigation]);

    const competitionQuery = filterValues.Competition.trim().toLowerCase();
    const personQuery = filterValues.Person.trim().toLowerCase();
    const groupQuery = filterValues.Group.trim().toLowerCase();
    const locationQuery = filterValues.Location.trim().toLowerCase();
    const hasTypedQuery = Object.values(filterValues).some((value) => value.trim().length > 0);
    const hasActiveFilters = hasTypedQuery ||
        !!timeRange.start ||
        !!timeRange.end ||
        competitionTypeFilter !== 'all';
    const activeFilters = useMemo(() => {
        const ordered = filterOrder.filter((filter) => filterValues[filter].trim().length > 0);
        const missing = FILTERS.filter(
            (filter) => filterValues[filter].trim().length > 0 && !ordered.includes(filter),
        );
        return [...ordered, ...missing];
    }, [filterOrder, filterValues]);

    const matchValue = (value: string, q: string) => (q ? value.toLowerCase().includes(q) : true);

    const shouldShowPeople = hasTypedQuery && (personQuery.length > 0 || locationQuery.length > 0 || groupQuery.length > 0);
    const shouldShowGroups = hasTypedQuery && groupQuery.length > 0;

    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken || !hasTypedQuery || !shouldShowGroups) {
            setGroupResults([]);
            setGroupsError(null);
            return () => {};
        }

        setGroupsError(null);
        const query = filterValues.Group.trim();
        searchGroups(apiAccessToken, { q: query || '', limit: 100, offset: 0 })
            .then((res) => {
                if (!mounted) return;
                const rows = Array.isArray(res?.groups) ? res.groups : [];
                setGroupResults(
                    rows.map((group) => ({
                        id: String(group.group_id),
                        group_id: String(group.group_id),
                        name: String(group.name || t('Group')),
                        activity: `${Number(group.member_count ?? 0)} ${t('Members')}`,
                        location: (function () {
                            const candidates = [
                                String((group as any)?.city || '').trim(),
                                String((group as any)?.base_location || '').trim(),
                                String((group as any)?.location || '').trim(),
                            ].filter(Boolean);
                            return candidates.find((value) => value.length <= 48 && !/[.!?]/.test(value))
                                || candidates[0]
                                || '';
                        })(),
                        images: [
                            String((group as any).avatar_url || (group as any).group_avatar_url || group.owner_avatar_url || '').trim(),
                        ].filter(Boolean),
                    })),
                );
            })
            .catch((e: unknown) => {
                if (!mounted) return;
                const msg = e instanceof ApiError ? e.message : String((e as any)?.message ?? e);
                setGroupsError(msg);
                setGroupResults([]);
            });

        return () => {
            mounted = false;
        };
    }, [apiAccessToken, filterValues.Group, hasTypedQuery, shouldShowGroups, t]);

    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken || !hasTypedQuery || !shouldShowPeople) {
            setPeopleResults([]);
            setPeopleError(null);
            return () => {};
        }
        setPeopleError(null);
        const q = (personQuery || locationQuery || groupQuery).trim();
        if (!q) {
            setPeopleResults([]);
            return () => {};
        }
        searchProfiles(apiAccessToken, { q, limit: 80, offset: 0 })
            .then((res) => {
                if (!mounted) return;
                const rows = Array.isArray(res?.profiles) ? res.profiles : [];
                setPeopleResults(
                    rows.map((profile, idx) => ({
                        id: idx + 1,
                        profile_id: String(profile.profile_id || ''),
                        name: String(profile.display_name || t('User')),
                        avatar_url: profile.avatar_url ?? null,
                        role: 'Athlete',
                        activity: t('Profile'),
                        location: String((profile as any)?.location || '').trim(),
                        runningClub: String(
                            (profile as any)?.track_field_club ||
                            (profile as any)?.running_club ||
                            (profile as any)?.athletics_club ||
                            '',
                        ).trim(),
                    })),
                );
            })
            .catch((e: unknown) => {
                if (!mounted) return;
                const msg = e instanceof ApiError ? e.message : String((e as any)?.message ?? e);
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
            return () => {};
        }
        const load = async () => {
            try {
                const topGroups = groupResults.slice(0, 6);
                const responses = await Promise.all(
                    topGroups.map(async (group) => {
                        try {
                            return await getGroupMembers(apiAccessToken, String(group.group_id));
                        } catch {
                            return null;
                        }
                    }),
                );
                if (!mounted) return;
                const dedupe = new Set<string>();
                const members: PersonResult[] = [];
                responses.forEach((resp) => {
                    const list = Array.isArray(resp?.members) ? resp?.members ?? [] : [];
                    list.forEach((member) => {
                        const profileId = String(member.profile_id || '').trim();
                        if (!profileId || dedupe.has(profileId)) return;
                        dedupe.add(profileId);
                        members.push({
                            id: members.length + 1,
                            profile_id: profileId,
                            name: String(member.display_name || t('User')),
                            avatar_url: member.avatar_url ?? null,
                            role: 'Athlete',
                            activity: t('Group member'),
                            location: '',
                        });
                    });
                });
                setGroupLinkedPeople(members);
            } catch {
                if (!mounted) return;
                setGroupLinkedPeople([]);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, groupQuery, groupResults, hasTypedQuery, t]);

    const parseEventDate = (value: string) => {
        const [day, month, year] = value.split('/').map(Number);
        if (!day || !month || !year) return null;
        return new Date(year, month - 1, day, 12, 0, 0, 0);
    };

    const toDateString = useCallback((date: Date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }, []);

    const fromDateString = (value: string, isEnd: boolean) => {
        const [year, month, day] = value.split('-').map(Number);
        if (!year || !month || !day) return null;
        if (isEnd) {
            return new Date(year, month - 1, day, 23, 59, 59, 999);
        }
        return new Date(year, month - 1, day, 0, 0, 0, 0);
    };

    const isWithinRange = useCallback((date: Date | null) => {
        if (!date) return false;
        const start = timeRange.start;
        const end = timeRange.end;
        if (start && end) return date >= start && date <= end;
        if (start) return date >= start;
        if (end) return date <= end;
        return true;
    }, [timeRange.end, timeRange.start]);

    const shouldShowEvents = useMemo(() => {
        if (!hasTypedQuery) return true;
        const activeFilterValue = String(filterValues[activeFilter] ?? '').trim();
        if (!activeFilterValue) return false;
        if (activeFilter === 'Competition' || activeFilter === 'Location') return true;
        if (competitionQuery.length > 0 || locationQuery.length > 0) return true;
        return false;
    }, [activeFilter, competitionQuery, filterValues, hasTypedQuery, locationQuery]);

    const filteredEvents = useMemo(() => {
        if (hasTypedQuery && !shouldShowEvents) return [];
        return eventResults.filter((event) => {
            const eventDate = parseEventDate(event.date);
            const rangeOk = timeRange.start || timeRange.end ? isWithinRange(eventDate) : true;
            const typeOk = competitionTypeFilter === 'all' ? true : event.competitionType === competitionTypeFilter;
            return (
                matchValue(event.name, competitionQuery) &&
                matchValue(event.location, locationQuery) &&
                rangeOk &&
                typeOk
            );
        });
    }, [competitionQuery, competitionTypeFilter, eventResults, hasTypedQuery, isWithinRange, locationQuery, shouldShowEvents, timeRange.end, timeRange.start]);

    const filteredPeople = useMemo(() => {
        if (!hasTypedQuery || !shouldShowPeople) return [];
        const mergedPeople = [...peopleResults, ...groupLinkedPeople];
        const seenProfiles = new Set<string>();
        return mergedPeople.filter((person) => {
            const pid = String(person.profile_id || '').trim();
            if (pid) {
                if (seenProfiles.has(pid)) return false;
                seenProfiles.add(pid);
            }
            return (
                matchValue(person.name, personQuery) &&
                matchValue(person.location, locationQuery)
            );
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
        if (!hasTypedQuery || !shouldShowGroups) return [];
        return groupResults.filter((group) => {
            return (
                matchValue(group.name, groupQuery) &&
                matchValue(`${group.location} ${group.activity}`, locationQuery)
            );
        });
    }, [
        hasTypedQuery,
        groupQuery,
        groupResults,
        locationQuery,
        shouldShowGroups,
    ]);

    const totalCount = useMemo(() => (
        filteredEvents.length + filteredPeople.length + filteredGroups.length
    ), [filteredEvents.length, filteredGroups.length, filteredPeople.length]);
    const hasAnyResults = totalCount > 0;

    const handleFilterPress = (filter: FilterKey) => {
        setActiveFilter(filter);
        requestAnimationFrame(() => {
            searchInputRef.current?.focus();
        });
    };

    const handleSearchChange = (text: string) => {
        const trimmedNext = text.trim();
        setFilterValues(prev => ({
            ...prev,
            [activeFilter]: text,
        }));
        setFilterOrder((prev) => {
            const currentValue = String(filterValues[activeFilter] ?? '').trim();
            if (!currentValue && trimmedNext) {
                return prev.includes(activeFilter) ? prev : [...prev, activeFilter];
            }
            if (currentValue && !trimmedNext) {
                return prev.filter((filter) => filter !== activeFilter);
            }
            return prev;
        });
    };

    const clearFilterValue = (filter: FilterKey) => {
        setFilterValues(prev => ({ ...prev, [filter]: '' }));
        setFilterOrder((prev) => prev.filter((entry) => entry !== filter));
    };

    const preferredSection = useMemo(() => filterToSection(activeFilter), [activeFilter])

    const orderedResultSections = useMemo(() => {
        const defaultOrder: ResultSectionKey[] = ['events', 'people', 'groups']
        const merged = [
            preferredSection,
            ...defaultOrder.filter((key) => key !== preferredSection),
        ]
        return merged.filter((key) => {
            if (key === 'events') return filteredEvents.length > 0
            if (key === 'people') return filteredPeople.length > 0
            return filteredGroups.length > 0
        })
    }, [filteredEvents.length, filteredGroups.length, filteredPeople.length, preferredSection])

    const latestCompetitions = useMemo(() => {
        const sorted = [...filteredEvents].sort((a, b) => {
            const ad = parseEventDate(a.date)
            const bd = parseEventDate(b.date)
            if (ad && bd) return bd.getTime() - ad.getTime()
            if (bd) return 1
            if (ad) return -1
            return String(a.name).localeCompare(String(b.name))
        })
        return sorted
    }, [filteredEvents])

    const visibleLatestCompetitions = useMemo(
        () => latestCompetitions.slice(0, defaultVisibleCount),
        [defaultVisibleCount, latestCompetitions],
    );
    const visibleFilteredEvents = useMemo(
        () => filteredEvents.slice(0, searchVisibleCount),
        [filteredEvents, searchVisibleCount],
    );
    const visibleFilteredPeople = useMemo(
        () => filteredPeople.slice(0, searchVisibleCount),
        [filteredPeople, searchVisibleCount],
    );
    const visibleFilteredGroups = useMemo(
        () => filteredGroups.slice(0, searchVisibleCount),
        [filteredGroups, searchVisibleCount],
    );
    const maxSearchSectionLength = useMemo(
        () => Math.max(filteredEvents.length, filteredPeople.length, filteredGroups.length),
        [filteredEvents.length, filteredGroups.length, filteredPeople.length],
    );
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

    const handleMainScroll = useCallback((event: any) => {
        const native = event?.nativeEvent;
        if (!native) return;
        const { contentOffset, contentSize, layoutMeasurement } = native;
        const distanceToBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
        if (distanceToBottom > SCROLL_LOAD_THRESHOLD_PX) {
            loadMoreLockedRef.current = false;
            return;
        }
        if (loadMoreLockedRef.current) return;
        if (!hasTypedQuery && !hasMoreDefaultCompetitions) return;
        if (hasTypedQuery && (!hasActiveFilters || !hasMoreSearchResults)) return;
        loadMoreLockedRef.current = true;
        if (!hasTypedQuery) {
            setDefaultVisibleCount((prev) =>
                Math.min(prev + DEFAULT_COMPETITIONS_INITIAL_LIMIT, latestCompetitions.length),
            );
            return;
        }
        setSearchVisibleCount((prev) =>
            Math.min(prev + SEARCH_RESULTS_INITIAL_LIMIT, maxSearchSectionLength),
        );
    }, [
        hasTypedQuery,
        hasMoreDefaultCompetitions,
        hasActiveFilters,
        hasMoreSearchResults,
        latestCompetitions.length,
        maxSearchSectionLength,
    ]);

    const getCompetitionTypeLabel = (type: CompetitionType) => {
        if (type === 'road') return t('roadAndTrail');
        return t('trackAndField');
    };

    const renderEventCard = (event: EventResult) => (
        <TouchableOpacity
            key={event.id}
            style={Styles.eventCard}
            onPress={() => navigation.navigate('CompetitionDetailsScreen', {
                eventId: event.id,
                name: event.name,
                location: event.location,
                date: event.date,
                competitionType: event.competitionType,
                organizingClub: event.organizingClub,
            })}
        >
            <View style={Styles.eventIconContainer}>
                <Calendar size={20} color={colors.primaryColor} variant="Linear" />
            </View>
            <SizeBox width={16} />
            <View style={Styles.eventContent}>
                <View style={Styles.eventNameRow}>
                    <Text style={Styles.eventName}>{event.name}</Text>
                    <View style={Styles.eventTypeBadge}>
                                <Text style={Styles.eventTypeBadgeText}>{getCompetitionTypeLabel(event.competitionType)}</Text>
                    </View>
                </View>
                <SizeBox height={4} />
                <View style={Styles.eventDetails}>
                    {event.date ? (
                        <View style={Styles.eventDetailItem}>
                            <Calendar size={14} color="#9B9F9F" variant="Linear" />
                            <SizeBox width={4} />
                            <Text style={Styles.eventDetailText}>{event.date}</Text>
                        </View>
                    ) : null}
                    {event.location ? (
                        <View style={Styles.eventDetailItem}>
                            <Location size={14} color="#9B9F9F" variant="Linear" />
                            <SizeBox width={4} />
                            <Text style={Styles.eventDetailText}>{event.location}</Text>
                        </View>
                    ) : null}
                </View>
                {event.organizingClub ? (
                    <>
                        <SizeBox height={4} />
                        <Text style={Styles.eventMetaText} numberOfLines={1}>
                            {event.organizingClub}
                        </Text>
                    </>
                ) : null}
            </View>
        </TouchableOpacity>
    );

    const renderPersonCard = (person: PersonResult) => (
        <TouchableOpacity
            key={person.profile_id ?? String(person.id)}
            style={Styles.userCard}
            onPress={() => openProfileFromSearch(person.profile_id ?? null)}
        >
            <View style={Styles.userCardContent}>
                <View style={Styles.userHeader}>
                    {person.avatar_url ? (
                        <FastImage
                            source={{ uri: person.avatar_url }}
                            style={Styles.userAvatar}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={Styles.userAvatarPlaceholder}>
                            <Text style={Styles.userAvatarPlaceholderText}>
                                {String(person.name || '').trim().charAt(0).toUpperCase() || '?'}
                            </Text>
                        </View>
                    )}
                    <SizeBox width={8} />
                    <View style={Styles.userInfo}>
                        <View style={Styles.userNameRow}>
                            <Text style={Styles.userName}>{person.name}</Text>
                            <View style={Styles.userTypeBadge}>
                                <Text style={Styles.userTypeText}>{t(person.role)}</Text>
                            </View>
                        </View>
                        <View style={Styles.userDetails}>
                            <View style={Styles.userDetailItem}>
                                {person.role === 'Athlete' ? (
                                    <Icons.Run height={16} width={16} />
                                ) : (
                                    <Camera size={16} color="#9B9F9F" variant="Linear" />
                                )}
                                <SizeBox width={4} />
                                <Text style={Styles.userDetailText}>{person.activity}</Text>
                            </View>
                            {(person.runningClub || person.location) ? (
                                <View style={Styles.userDetailItem}>
                                    <Text style={Styles.userDetailText}>
                                        {person.runningClub || person.location}
                                    </Text>
                                </View>
                            ) : null}
                        </View>
                    </View>
                </View>
                {person.role === 'Athlete' && (
                    <>
                        <SizeBox height={10} />
                        <TouchableOpacity
                            style={Styles.followBtn}
                            disabled={!apiAccessToken || !person.profile_id || followBusyProfileId === String(person.profile_id)}
                            onPress={async (e) => {
                                e.stopPropagation?.();
                                const targetId = String(person.profile_id || '').trim();
                                if (!apiAccessToken || !targetId) return;
                                try {
                                    setFollowBusyProfileId(targetId);
                                    if (person.isFollowing) {
                                        await unfollowProfile(apiAccessToken, targetId);
                                    } else {
                                        await followProfile(apiAccessToken, targetId);
                                    }
                                    setPeopleResults((prev) =>
                                        prev.map((p) =>
                                            String(p.profile_id || '') === targetId
                                                ? { ...p, isFollowing: !Boolean(p.isFollowing) }
                                                : p,
                                        ),
                                    );
                                } finally {
                                    setFollowBusyProfileId((current) => (current === targetId ? null : current));
                                }
                            }}
                        >
                            <Text style={Styles.followBtnText}>
                                {person.isFollowing ? t('Following') : t('Follow')}
                            </Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderGroupAvatarCell = (uri: string | undefined, style: any) => (
        uri ? (
            <FastImage
                source={{ uri }}
                style={style}
                resizeMode="cover"
            />
        ) : (
            <View style={[style, Styles.groupAvatarPlaceholder]} />
        )
    );

    const renderGroupCard = (group: GroupResult) => (
        <TouchableOpacity
            key={group.id}
            style={Styles.userCard}
            onPress={() => openGroupFromSearch(group.group_id)}
        >
            <View style={Styles.userCardContent}>
                <View style={Styles.userHeader}>
                    <View style={Styles.groupAvatarGrid}>
                        <View style={Styles.groupAvatarRow}>
                            {renderGroupAvatarCell(group.images[0], Styles.groupAvatarTopLeft)}
                            {renderGroupAvatarCell(group.images[1], Styles.groupAvatarTopRight)}
                        </View>
                        <View style={Styles.groupAvatarRow}>
                            {renderGroupAvatarCell(group.images[2], Styles.groupAvatarBottomLeft)}
                            {renderGroupAvatarCell(group.images[3], Styles.groupAvatarBottomRight)}
                        </View>
                    </View>
                    <SizeBox width={8} />
                    <View style={Styles.userInfo}>
                        <View style={Styles.userNameRow}>
                            <Text style={Styles.userName}>{group.name}</Text>
                            <View style={Styles.userTypeBadge}>
                                <Text style={Styles.userTypeText}>{t('Group')}</Text>
                            </View>
                        </View>
                        <View style={Styles.userDetails}>
                            <View style={Styles.userDetailItem}>
                                <Camera size={16} color="#9B9F9F" variant="Linear" />
                                <SizeBox width={4} />
                                <Text style={Styles.userDetailText}>{group.activity}</Text>
                            </View>
                            {group.location ? (
                                <View style={Styles.userDetailItem}>
                                    <Location size={16} color="#9B9F9F" variant="Linear" />
                                    <SizeBox width={4} />
                                    <Text style={Styles.userDetailText}>{group.location}</Text>
                                </View>
                            ) : null}
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderNoResults = (label: string) => (
        <View style={Styles.noResultsContainer}>
            <Text style={Styles.noResultsText}>{label}</Text>
        </View>
    );

    const renderLoadingSpinner = () => (
        <View style={Styles.loadingSpinnerWrap}>
            <ActivityIndicator size="small" color={colors.primaryColor} />
        </View>
    );

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

    const setQuickRange = (preset: 'week' | 'month' | 'year') => {
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
        const endSeed = calendarEnd ?? calendarStart;
        const end = fromDateString(endSeed, true);
        if (!start || !end) {
            setShowIosPicker(false);
            return;
        }
        const finalEnd = end < start ? new Date(start.getTime()) : end;
        setTimeRange({ start, end: finalEnd });
        setShowIosPicker(false);
    };

    const formatDateRange = (start: Date, end: Date) => {
        const sameDay = start.toDateString() === end.toDateString();
        const startText = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        if (sameDay) return startText;
        const endText = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return `${startText} → ${endText}`;
    };

    const closeNativePicker = useCallback(() => {
        setActiveDateField(null);
        setNativePickerVisible(false);
    }, []);

    const openRangeFieldPicker = useCallback((field: 'start' | 'end') => {
        const fallback = toDateString(new Date());
        const seedValue = field === 'start'
            ? (calendarStart ?? calendarEnd ?? fallback)
            : (calendarEnd ?? calendarStart ?? fallback);
        const seed = fromDateString(seedValue, field === 'end') ?? new Date();
        setActiveDateField(field);
        setNativePickerDate(seed);
        setNativePickerVisible(true);
    }, [calendarEnd, calendarStart, toDateString]);

    const applyPickedDateToField = useCallback((pickedDate: Date, field: 'start' | 'end') => {
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

    const onNativePickerChange = useCallback((event: any, selectedDate?: Date) => {
        if (event?.type === 'dismissed') {
            closeNativePicker();
            return;
        }
        const pickedDate = selectedDate ?? nativePickerDate;
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
        if (activeFilter === 'Competition') return t('Type competition name');
        if (activeFilter === 'Person') return t('Type person name');
        if (activeFilter === 'Group') return t('Type group name');
        return t('Search by location');
    })();

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            <View style={Styles.header}>
                <View style={Styles.headerSpacer} />
                <Text style={Styles.headerTitle}>{t('Search')}</Text>
                <View style={Styles.headerSpacer} />
            </View>

            <ScrollView
                style={Styles.container}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="always"
                onScroll={handleMainScroll}
                scrollEventThrottle={16}
            >
                <SizeBox height={24} />

                <View style={Styles.searchRow}>
                    <UnifiedSearchInput
                        ref={searchInputRef}
                        containerStyle={Styles.searchInputContainer}
                        contentStyle={{ gap: 8 }}
                        left={
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}>
                                <SearchNormal1 size={16} color="#9B9F9F" variant="Linear" />
                                <SizeBox width={8} />
                                <View style={Styles.searchInputPill}>
                                    <Text style={Styles.searchInputPillText}>{t(activeFilter)}:</Text>
                                </View>
                            </View>
                        }
                        inputStyle={Styles.searchInput}
                        placeholder={searchPlaceholder}
                        value={activeValue}
                        onChangeText={handleSearchChange}
                        returnKeyType="search"
                    />
                    <TouchableOpacity onPress={() => navigation.navigate('AISearchScreen')}>
                        <View style={Styles.aiButton}>
                            <Icons.AiBlueBordered width={24} height={24} />
                        </View>
                    </TouchableOpacity>
                </View>

                <SizeBox height={16} />

                <View style={Styles.filterTabsContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="always">
                        {FILTERS.map((filter) => (
                            <TouchableOpacity
                                key={filter}
                                style={[
                                    Styles.filterTab,
                                    activeFilter === filter && Styles.filterTabActive
                                ]}
                                onPress={() => handleFilterPress(filter)}
                            >
                                <Text style={[
                                    Styles.filterTabText,
                                    activeFilter === filter && Styles.filterTabTextActive
                                ]}>
                                    {t(filter)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <SizeBox height={16} />

                <View style={Styles.typeFilterRow}>
                    <Text style={Styles.typeFilterLabel}>{t('competitionType')}</Text>
                    <View style={Styles.typeFilterChips}>
                        {competitionTypeFilters.map((option) => (
                            <TouchableOpacity
                                key={option.key}
                                style={[
                                    Styles.typeFilterChip,
                                    competitionTypeFilter === option.key && Styles.typeFilterChipActive,
                                ]}
                                onPress={() => setCompetitionTypeFilter(option.key)}
                            >
                                <Text
                                    style={[
                                        Styles.typeFilterChipText,
                                        competitionTypeFilter === option.key && Styles.typeFilterChipTextActive,
                                    ]}
                                >
                                    {t(option.label)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <SizeBox height={12} />

                <View style={Styles.activeChipsContainer}>
                    {activeFilters.map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={Styles.activeChip}
                            onPress={() => clearFilterValue(filter)}
                        >
                            <Text style={Styles.activeChipText}>{t(filter)}: {filterValues[filter]}</Text>
                            <CloseCircle size={16} color={colors.pureWhite} variant="Linear" />
                        </TouchableOpacity>
                    ))}
                    {timeRange.start && timeRange.end ? (
                        <TouchableOpacity
                            style={Styles.timeRangeChipActive}
                            onPress={openDateTimePicker}
                        >
                            <Clock size={14} color={colors.primaryColor} variant="Linear" />
                            <Text style={Styles.timeRangeTextActive}>{formatDateRange(timeRange.start, timeRange.end)}</Text>
                            <TouchableOpacity onPress={() => setTimeRange({ start: null, end: null })}>
                                <CloseCircle size={16} color={colors.primaryColor} variant="Linear" />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={Styles.timeRangeChip} onPress={openDateTimePicker}>
                            <Clock size={14} color="#9B9F9F" variant="Linear" />
                            <SizeBox width={4} />
                            <Text style={Styles.timeRangeText}>{t('selectDateRange')}</Text>
                            <SizeBox width={4} />
                            <ArrowDown2 size={14} color="#9B9F9F" variant="Linear" />
                        </TouchableOpacity>
                    )}
                </View>

                <SizeBox height={24} />

                {!hasTypedQuery && (
                    <>
                        <View style={Styles.resultsHeader}>
                            <Text style={Styles.resultsTitle}>{t('Latest competitions')}</Text>
                            <View style={Styles.resultsBadge}>
                                <Text style={Styles.resultsBadgeText}>{latestCompetitions.length} {t('competitions')}</Text>
                            </View>
                        </View>
                        <SizeBox height={16} />
                        {eventsError ? (
                            <Text style={Styles.noResultsText}>{eventsError}</Text>
                        ) : isLoadingEvents ? (
                            renderLoadingSpinner()
                        ) : latestCompetitions.length > 0 ? (
                            visibleLatestCompetitions.map(renderEventCard)
                        ) : (
                            renderNoResults(t('No competitions found'))
                        )}
                    </>
                )}

                {hasTypedQuery && hasActiveFilters && (
                    <>
                        <View style={Styles.resultsHeader}>
                            <Text style={Styles.resultsTitle}>{t('Results')}</Text>
                            <View style={Styles.resultsBadge}>
                                <Text style={Styles.resultsBadgeText}>{totalCount} {t('found')}</Text>
                            </View>
                        </View>

                        <SizeBox height={16} />

                        {!hasAnyResults ? (
                            renderNoResults(t('No results found'))
                        ) : (
                            <>
                                {eventsError ? (
                                    <>
                                        <Text style={Styles.noResultsText}>{eventsError}</Text>
                                        <SizeBox height={10} />
                                    </>
                                ) : null}
                                {groupsError ? (
                                    <>
                                        <Text style={Styles.noResultsText}>{groupsError}</Text>
                                        <SizeBox height={10} />
                                    </>
                                ) : null}
                                {peopleError ? (
                                    <>
                                        <Text style={Styles.noResultsText}>{peopleError}</Text>
                                        <SizeBox height={10} />
                                    </>
                                ) : null}
                                {orderedResultSections.map((sectionKey, index) => {
                                    const isLast = index === orderedResultSections.length - 1;
                                    if (sectionKey === 'events') {
                                        return (
                                            <React.Fragment key="results-events">
                                                <Text style={Styles.sectionTitle}>{t('Competitions')}</Text>
                                                <SizeBox height={10} />
                                                {visibleFilteredEvents.map(renderEventCard)}
                                                {!isLast ? <SizeBox height={20} /> : null}
                                            </React.Fragment>
                                        );
                                    }
                                    if (sectionKey === 'people') {
                                        return (
                                            <React.Fragment key="results-people">
                                                <Text style={Styles.sectionTitle}>{t('People')}</Text>
                                                <SizeBox height={10} />
                                                {visibleFilteredPeople.map(renderPersonCard)}
                                                {!isLast ? <SizeBox height={20} /> : null}
                                            </React.Fragment>
                                        );
                                    }
                                    return (
                                        <React.Fragment key="results-groups">
                                            <Text style={Styles.sectionTitle}>{t('Groups')}</Text>
                                            <SizeBox height={10} />
                                            {visibleFilteredGroups.map(renderGroupCard)}
                                            {!isLast ? <SizeBox height={20} /> : null}
                                        </React.Fragment>
                                    );
                                })}
                            </>
                        )}
                    </>
                )}

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 100 : 120} />
            </ScrollView>

            <Modal
                visible={showIosPicker}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    setShowIosPicker(false);
                    closeNativePicker();
                }}
            >
                <View style={Styles.modalOverlay}>
                    <Pressable
                        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
                        onPress={() => {
                            setShowIosPicker(false);
                            closeNativePicker();
                        }}
                    />
                    <View style={Styles.dateModalContainer}>
                        <Text style={Styles.dateModalTitle}>{t('selectDateRange')}</Text>
                        <SizeBox height={10} />
                        <View style={Styles.quickRangeRow}>
                            <TouchableOpacity
                                style={Styles.quickRangeChip}
                                onPress={() => setQuickRange('week')}
                            >
                                <Text style={Styles.quickRangeChipText}>{t('thisWeek')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={Styles.quickRangeChip}
                                onPress={() => setQuickRange('month')}
                            >
                                <Text style={Styles.quickRangeChipText}>{t('thisMonth')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={Styles.quickRangeChip}
                                onPress={() => setQuickRange('year')}
                            >
                                <Text style={Styles.quickRangeChipText}>{t('thisYear')}</Text>
                            </TouchableOpacity>
                        </View>
                        <SizeBox height={8} />
                        <View style={Styles.rangeHeaderRow}>
                            <TouchableOpacity
                                style={Styles.rangePill}
                                onPress={() => openRangeFieldPicker('start')}
                                activeOpacity={0.8}
                            >
                                <Text style={Styles.rangePillLabel}>{t('start')}</Text>
                                <Text style={Styles.rangePillValue}>{calendarStart ?? t('selectDate')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={Styles.rangePill}
                                onPress={() => openRangeFieldPicker('end')}
                                activeOpacity={0.8}
                            >
                                <Text style={Styles.rangePillLabel}>{t('end')}</Text>
                                <Text style={Styles.rangePillValue}>{calendarEnd ?? t('selectDate')}</Text>
                            </TouchableOpacity>
                        </View>
                        <SizeBox height={12} />
                        <View style={Styles.modalButtonRow}>
                            <TouchableOpacity
                                style={Styles.modalCancelButton}
                                onPress={() => {
                                    setShowIosPicker(false);
                                    closeNativePicker();
                                }}
                            >
                                <Text style={Styles.modalCancelText}>{t('cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[Styles.modalSubmitButton, !calendarStart && Styles.modalSubmitButtonDisabled]}
                                onPress={applyIosDateTime}
                                disabled={!calendarStart}
                            >
                                <Text style={Styles.modalSubmitText}>{t('apply')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {Platform.OS === 'ios' && nativePickerVisible && activeDateField ? (
                        <View style={Styles.nativePickerOverlay}>
                            <Pressable style={Styles.nativePickerBackdrop} onPress={closeNativePicker} />
                            <View style={Styles.nativePickerSheet}>
                                <View style={Styles.nativePickerToolbar}>
                                    <TouchableOpacity style={Styles.nativePickerAction} onPress={closeNativePicker}>
                                        <Text style={Styles.nativePickerActionText}>{t('cancel')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={Styles.nativePickerAction} onPress={applyNativePickerSelection}>
                                        <Text style={Styles.nativePickerActionText}>{t('apply')}</Text>
                                    </TouchableOpacity>
                                </View>
                                <DateTimePicker
                                    {...pickerVisualProps}
                                    value={nativePickerDate}
                                    mode="date"
                                    display="spinner"
                                    onChange={onNativePickerChange}
                                />
                            </View>
                        </View>
                    ) : null}
                </View>
            </Modal>

            {nativePickerVisible && activeDateField && Platform.OS === 'android' ? (
                <DateTimePicker
                    {...pickerVisualProps}
                    value={nativePickerDate}
                    mode="date"
                    display="default"
                    onChange={onNativePickerChange}
                />
            ) : null}

        </View>
    )
}

export default SearchScreen
