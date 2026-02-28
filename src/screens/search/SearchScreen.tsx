import { View, Text, ScrollView, TouchableOpacity, Image, Modal, Pressable, TextInput, useWindowDimensions } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CalendarList } from 'react-native-calendars'
import { createStyles } from './SearchStyles'
import SizeBox from '../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../../context/ThemeContext'
import Icons from '../../constants/Icons'
import Images from '../../constants/Images'
import FastImage from 'react-native-fast-image'
import { SearchNormal1, Calendar, Location, CloseCircle, Clock, ArrowDown2, Camera } from 'iconsax-react-nativejs'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { ApiError, followProfile, getGroupMembers, getProfileSummary, searchEvents, searchGroups, searchProfiles, unfollowProfile } from '../../services/apiGateway'
import UnifiedSearchInput from '../../components/unifiedSearchInput/UnifiedSearchInput'
 

const FILTERS = ['Competition', 'Person', 'Group', 'Location'] as const
type FilterKey = typeof FILTERS[number]
type ResultSectionKey = 'events' | 'people' | 'groups'

type CompetitionType = 'track' | 'marathon'
type CompetitionTypeFilter = 'all' | CompetitionType

interface EventResult {
    id: string;
    name: string;
    date: string;
    location: string;
    competitionType: CompetitionType;
}

interface PersonResult {
    id: number;
    name: string;
    profile_id?: string;
    avatar_url?: string | null;
    role: 'Athlete' | 'Photographer';
    activity: string;
    location: string;
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

const SearchScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const { apiAccessToken } = useAuth();
    const { width: windowWidth } = useWindowDimensions();
    const Styles = createStyles(colors);
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
    const [eventResults, setEventResults] = useState<EventResult[]>([]);
    const [eventsError, setEventsError] = useState<string | null>(null);
    const [groupResults, setGroupResults] = useState<GroupResult[]>([]);
    const [groupsError, setGroupsError] = useState<string | null>(null);
    const [peopleResults, setPeopleResults] = useState<PersonResult[]>([]);
    const [peopleError, setPeopleError] = useState<string | null>(null);
    const [groupLinkedPeople, setGroupLinkedPeople] = useState<PersonResult[]>([]);
    const [followBusyProfileId, setFollowBusyProfileId] = useState<string | null>(null);
 
    const competitionTypeFilters = useMemo(
        () => ([
            { key: 'all' as const, label: 'all' },
            { key: 'track' as const, label: 'trackAndField' },
            { key: 'marathon' as const, label: 'roadAndTrail' },
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
    const resolveCompetitionType = useCallback((name?: string | null) => {
        const token = String(name || '').toLowerCase();
        if (/marathon|trail|road|run|5k|10k|half/.test(token)) return 'marathon' as const;
        return 'track' as const;
    }, []);

    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken) {
            setEventResults([]);
            setEventsError(null);
            return () => {};
        }
        setEventsError(null);
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
                        competitionType: resolveCompetitionType(event.event_name || event.event_title),
                    })),
                );
            })
            .catch((e: any) => {
                if (!mounted) return;
                const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
                setEventsError(msg);
                setEventResults([]);
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
    const matchAny = (values: string[] | undefined, q: string) =>
        q ? (values ?? []).some((value) => value.toLowerCase().includes(q)) : true;

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
                const placeholderImages = [
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
                    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100',
                    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
                ];
                setGroupResults(
                    rows.map((group) => ({
                        id: String(group.group_id),
                        group_id: String(group.group_id),
                        name: String(group.name || t('Group')),
                        activity: `${Number(group.member_count ?? 0)} ${t('Members')}`,
                        location: String(group.description || ''),
                        images: placeholderImages,
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
                        location: '',
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

    const toDateString = (date: Date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

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

    const filteredEvents = useMemo(() => {
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
    }, [competitionQuery, competitionTypeFilter, eventResults, isWithinRange, locationQuery, timeRange.end, timeRange.start]);

    const filteredPeople = useMemo(() => {
        if (!hasTypedQuery || !shouldShowPeople) return [];
        const competitionFilter = personQuery.length > 0 ? competitionQuery : '';
        const eventFilteredNames = new Set(filteredEvents.map((event) => event.name.toLowerCase()));
        const shouldApplyEventFilters = Boolean(timeRange.start || timeRange.end || competitionTypeFilter !== 'all');
        const mergedPeople = [...peopleResults, ...groupLinkedPeople];
        const seenProfiles = new Set<string>();
        return mergedPeople.filter((person) => {
            const pid = String(person.profile_id || '').trim();
            if (pid) {
                if (seenProfiles.has(pid)) return false;
                seenProfiles.add(pid);
            }
            const hasEventMatch = matchAny(person.events, competitionFilter);
            const withinEventFilters = !shouldApplyEventFilters
                ? true
                : (person.events ?? []).some((eventName) => eventFilteredNames.has(eventName.toLowerCase()));
            return (
                matchValue(person.name, personQuery) &&
                matchValue(person.location, locationQuery) &&
                hasEventMatch &&
                withinEventFilters
            );
        });
    }, [
        competitionQuery,
        hasTypedQuery,
        competitionTypeFilter,
        filteredEvents,
        groupLinkedPeople,
        locationQuery,
        personQuery,
        peopleResults,
        shouldShowPeople,
        timeRange.end,
        timeRange.start,
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

    const orderedResultSections = useMemo(() => {
        const mapped = activeFilters
            .map((filter): ResultSectionKey | null => {
                if (filter === 'Competition') return 'events';
                if (filter === 'Person') return 'people';
                if (filter === 'Group') return 'groups';
                return null;
            })
            .filter(Boolean) as ResultSectionKey[];

        const uniqueInOrder = Array.from(new Set(mapped));
        const defaultOrder: ResultSectionKey[] = ['events', 'people', 'groups'];
        const merged = [...uniqueInOrder, ...defaultOrder.filter((key) => !uniqueInOrder.includes(key))];

        return merged.filter((key) => {
            if (key === 'events') return filteredEvents.length > 0;
            if (key === 'people') return filteredPeople.length > 0;
            return filteredGroups.length > 0;
        });
    }, [activeFilters, filteredEvents.length, filteredGroups.length, filteredPeople.length]);

    const getCompetitionTypeLabel = (type: CompetitionType) => {
        if (type === 'marathon') return t('roadAndTrail');
        return t('trackAndField');
    };

    const renderEventCard = (event: EventResult) => (
        <TouchableOpacity
            key={event.id}
            style={Styles.eventCard}
            onPress={() => navigation.navigate('CompetitionDetailsScreen', {
                eventId: event.id,
                name: event.name,
                description: `${t('Competition held in')} ${event.location}`,
                competitionType: event.competitionType,
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
                    <View style={Styles.eventDetailItem}>
                        <Calendar size={14} color="#9B9F9F" variant="Linear" />
                        <SizeBox width={4} />
                        <Text style={Styles.eventDetailText}>{event.date}</Text>
                    </View>
                    <View style={Styles.eventDetailItem}>
                        <Location size={14} color="#9B9F9F" variant="Linear" />
                        <SizeBox width={4} />
                        <Text style={Styles.eventDetailText}>{event.location}</Text>
                    </View>
                </View>
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
                    <FastImage
                        source={person.avatar_url ? { uri: person.avatar_url } : Images.profilePic}
                        style={Styles.userAvatar}
                        resizeMode="cover"
                    />
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
                            <View style={Styles.userDetailItem}>
                                <Location size={16} color="#9B9F9F" variant="Linear" />
                                <SizeBox width={4} />
                                <Text style={Styles.userDetailText}>{person.location}</Text>
                            </View>
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
                            <FastImage
                                source={{ uri: group.images[0] }}
                                style={Styles.groupAvatarTopLeft}
                            />
                            <FastImage
                                source={{ uri: group.images[1] }}
                                style={Styles.groupAvatarTopRight}
                            />
                        </View>
                        <View style={Styles.groupAvatarRow}>
                            <FastImage
                                source={{ uri: group.images[2] }}
                                style={Styles.groupAvatarBottomLeft}
                            />
                            <FastImage
                                source={{ uri: group.images[3] }}
                                style={Styles.groupAvatarBottomRight}
                            />
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
                            <View style={Styles.userDetailItem}>
                                <Location size={16} color="#9B9F9F" variant="Linear" />
                                <SizeBox width={4} />
                                <Text style={Styles.userDetailText}>{group.location}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderNoResults = (label: string) => (
        <View style={Styles.noResultsContainer}>
            <Image
                source={Images.noResult}
                style={Styles.noResultsImage}
                resizeMode="cover"
            />
            <SizeBox height={14} />
            <Text style={Styles.noResultsText}>{label}</Text>
        </View>
    );

    const openDateTimePicker = () => {
        const todaySeed = toDateString(new Date());
        const startSeed = timeRange.start ? toDateString(timeRange.start) : todaySeed;
        const endSeed = timeRange.end ? toDateString(timeRange.end) : null;
        setCalendarStart(startSeed);
        setCalendarEnd(endSeed);
        setShowIosPicker(true);
    };

    const modalWidth = Math.min(windowWidth * 0.9, 420);
    const calendarWidth = Math.max(0, modalWidth - 40);

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

            <ScrollView style={Styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="always">
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
                                                {filteredEvents.map(renderEventCard)}
                                                {!isLast ? <SizeBox height={20} /> : null}
                                            </React.Fragment>
                                        );
                                    }
                                    if (sectionKey === 'people') {
                                        return (
                                            <React.Fragment key="results-people">
                                                <Text style={Styles.sectionTitle}>{t('People')}</Text>
                                                <SizeBox height={10} />
                                                {filteredPeople.map(renderPersonCard)}
                                                {!isLast ? <SizeBox height={20} /> : null}
                                            </React.Fragment>
                                        );
                                    }
                                    return (
                                        <React.Fragment key="results-groups">
                                            <Text style={Styles.sectionTitle}>{t('Groups')}</Text>
                                            <SizeBox height={10} />
                                            {filteredGroups.map(renderGroupCard)}
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
                onRequestClose={() => setShowIosPicker(false)}
            >
                <View style={Styles.modalOverlay}>
                    <Pressable
                        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
                        onPress={() => setShowIosPicker(false)}
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
                            <View style={Styles.rangePill}>
                                <Text style={Styles.rangePillLabel}>{t('start')}</Text>
                                <Text style={Styles.rangePillValue}>{calendarStart ?? t('selectDate')}</Text>
                            </View>
                            <View style={Styles.rangePill}>
                                <Text style={Styles.rangePillLabel}>{t('end')}</Text>
                                <Text style={Styles.rangePillValue}>{calendarEnd ?? t('selectDate')}</Text>
                            </View>
                        </View>
                        <SizeBox height={12} />
                        <CalendarList
                            style={Styles.calendarContainer}
                            current={calendarStart ?? toDateString(new Date())}
                            initialDate={calendarStart ?? toDateString(new Date())}
                            firstDay={1}
                            calendarWidth={calendarWidth}
                            onDayPress={(day) => {
                                const selected = day.dateString;
                                if (!calendarStart || (calendarStart && calendarEnd)) {
                                    setCalendarStart(selected);
                                    setCalendarEnd(null);
                                    return;
                                }
                                if (calendarStart && !calendarEnd) {
                                    if (selected < calendarStart) {
                                        setCalendarStart(selected);
                                        setCalendarEnd(null);
                                    } else {
                                        setCalendarEnd(selected);
                                    }
                                }
                            }}
                            markingType="period"
                            markedDates={(() => {
                                if (!calendarStart) return {};
                                const start = calendarStart;
                                const end = calendarEnd ?? calendarStart;
                                const marks: Record<string, any> = {};
                                let current = new Date(start);
                                const endDate = new Date(end);
                                while (current <= endDate) {
                                    const key = toDateString(current);
                                    const isStart = key === start;
                                    const isEnd = key === end;
                                    marks[key] = {
                                        startingDay: isStart,
                                        endingDay: isEnd,
                                        color: isStart || isEnd ? colors.primaryColor : colors.secondaryBlueColor,
                                        textColor: isStart || isEnd ? colors.pureWhite : colors.mainTextColor,
                                    };
                                    current.setDate(current.getDate() + 1);
                                }
                                return marks;
                            })()}
                            theme={{
                                calendarBackground: colors.modalBackground,
                                backgroundColor: colors.modalBackground,
                                dayTextColor: colors.mainTextColor,
                                monthTextColor: colors.mainTextColor,
                                textSectionTitleColor: colors.subTextColor,
                                selectedDayBackgroundColor: colors.primaryColor,
                                selectedDayTextColor: colors.pureWhite,
                                todayTextColor: colors.primaryColor,
                                weekVerticalMargin: 0,
                                textDayHeaderFontSize: 11,
                                textDayFontSize: 14,
                            }}
                            pastScrollRange={12}
                            futureScrollRange={12}
                            scrollEnabled
                            showScrollIndicator
                        />
                        <SizeBox height={12} />
                        <View style={Styles.modalButtonRow}>
                            <TouchableOpacity
                                style={Styles.modalCancelButton}
                                onPress={() => setShowIosPicker(false)}
                            >
                                <Text style={Styles.modalCancelText}>{t('Cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[Styles.modalSubmitButton, !calendarStart && Styles.modalSubmitButtonDisabled]}
                                onPress={applyIosDateTime}
                                disabled={!calendarStart}
                            >
                                <Text style={Styles.modalSubmitText}>{t('Apply')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </View>
    )
}

export default SearchScreen
