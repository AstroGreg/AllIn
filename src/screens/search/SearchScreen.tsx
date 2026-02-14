import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Modal, Pressable, useWindowDimensions } from 'react-native'
import React, { useMemo, useState } from 'react'
import { CalendarList } from 'react-native-calendars'
import { createStyles } from './SearchStyles'
import SizeBox from '../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../../context/ThemeContext'
import Icons from '../../constants/Icons'
import Images from '../../constants/Images'
import FastImage from 'react-native-fast-image'
import { SearchNormal1, Calendar, Location, CloseCircle, Clock, ArrowDown2, Camera } from 'iconsax-react-nativejs'
 

const FILTERS = ['Competition', 'Person', 'Group', 'Location'] as const
const COMPETITION_TYPE_FILTERS: Array<{ key: CompetitionTypeFilter; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'track', label: 'Track&Field' },
    { key: 'marathon', label: 'Road&Trail' },
];

type FilterKey = typeof FILTERS[number]

type CompetitionType = 'track' | 'marathon'
type CompetitionTypeFilter = 'all' | CompetitionType

interface EventResult {
    id: number;
    name: string;
    date: string;
    location: string;
    competitionType: CompetitionType;
}

interface PersonResult {
    id: number;
    name: string;
    role: 'Athlete' | 'Photographer';
    activity: string;
    location: string;
    isFollowing?: boolean;
    events?: string[];
}

interface GroupResult {
    id: number;
    name: string;
    activity: string;
    location: string;
    images: string[];
    events?: string[];
}

const SearchScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { width: windowWidth } = useWindowDimensions();
    const Styles = createStyles(colors);

    const [activeFilter, setActiveFilter] = useState<FilterKey>('Competition');
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
 

    const activeValue = filterValues[activeFilter] ?? '';

    const eventResults: EventResult[] = [
        { id: 1, name: 'BK Studenten 23', date: '27/05/2025', location: 'Gent', competitionType: 'track' },
        { id: 2, name: 'Vlaams Kampioenschap', date: '27/05/2025', location: 'Hasselt', competitionType: 'track' },
        { id: 3, name: 'IFAM 2024', date: '27/05/2025', location: 'Brussels', competitionType: 'track' },
        { id: 4, name: 'KBC Nacht 2024', date: '27/05/2025', location: 'Hasselt', competitionType: 'track' },
        { id: 5, name: 'Brussels City Run 2026', date: '12/06/2026', location: 'Brussels', competitionType: 'marathon' },
    ];

    const peopleResults: PersonResult[] = [
        { id: 1, name: 'James Ray', role: 'Athlete', activity: 'Marathon', location: 'Dhaka', isFollowing: false, events: ['Brussels City Run 2026'] },
        { id: 2, name: 'Sofia Klein', role: 'Athlete', activity: '800m', location: 'Berlin', isFollowing: false, events: ['IFAM 2024'] },
        { id: 3, name: 'Liam Carter', role: 'Photographer', activity: 'Sports Events', location: 'Brussels', events: ['IFAM 2024', 'BK Studenten 23'] },
        { id: 4, name: 'Emma Novak', role: 'Photographer', activity: 'Track Events', location: 'Gent', events: ['BK Studenten 23'] },
        { id: 5, name: 'Greg Reynders', role: 'Athlete', activity: '1500m', location: 'Hasselt', events: ['IFAM 2024', 'BK Studenten 23'] },
    ];

    const groupResults: GroupResult[] = [
        {
            id: 1,
            name: 'Olympic Track Club',
            activity: 'Track & Field',
            location: 'Brussels',
            events: ['IFAM 2024', 'BK Studenten 23'],
            images: [
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
                'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100',
                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
            ]
        },
        {
            id: 2,
            name: 'Marathon Pacers',
            activity: 'Road Running',
            location: 'Gent',
            events: ['Brussels City Run 2026'],
            images: [
                'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100',
                'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100',
                'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=100',
                'https://images.unsplash.com/photo-1463453091185-61582044d556?w=100',
            ]
        },
    ];

    const competitionQuery = filterValues.Competition.trim().toLowerCase();
    const personQuery = filterValues.Person.trim().toLowerCase();
    const groupQuery = filterValues.Group.trim().toLowerCase();
    const locationQuery = filterValues.Location.trim().toLowerCase();
    const hasActiveFilters = Object.values(filterValues).some((value) => value.trim().length > 0) ||
        !!timeRange.start ||
        !!timeRange.end ||
        competitionTypeFilter !== 'all';
    const activeFilters = FILTERS.filter((filter) => filterValues[filter].trim().length > 0);

    const matchValue = (value: string, q: string) => (q ? value.toLowerCase().includes(q) : true);
    const matchAny = (values: string[] | undefined, q: string) =>
        q ? (values ?? []).some((value) => value.toLowerCase().includes(q)) : true;

    const shouldShowPeople = personQuery.length > 0 || locationQuery.length > 0;
    const shouldShowGroups = groupQuery.length > 0 || locationQuery.length > 0;

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

    const isWithinRange = (date: Date | null) => {
        if (!date) return false;
        const start = timeRange.start;
        const end = timeRange.end;
        if (start && end) return date >= start && date <= end;
        if (start) return date >= start;
        if (end) return date <= end;
        return true;
    };

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
    }, [competitionQuery, competitionTypeFilter, locationQuery, timeRange.end, timeRange.start]);

    const filteredPeople = useMemo(() => {
        if (!shouldShowPeople) return [];
        const competitionFilter = personQuery.length > 0 ? competitionQuery : '';
        const eventFilteredNames = new Set(filteredEvents.map((event) => event.name.toLowerCase()));
        const shouldApplyEventFilters = Boolean(timeRange.start || timeRange.end || competitionTypeFilter !== 'all');
        return peopleResults.filter((person) => {
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
        competitionTypeFilter,
        filteredEvents,
        locationQuery,
        personQuery,
        shouldShowPeople,
        timeRange.end,
        timeRange.start,
    ]);

    const filteredGroups = useMemo(() => {
        if (!shouldShowGroups) return [];
        const competitionFilter = groupQuery.length > 0 ? competitionQuery : '';
        const eventFilteredNames = new Set(filteredEvents.map((event) => event.name.toLowerCase()));
        const shouldApplyEventFilters = Boolean(timeRange.start || timeRange.end || competitionTypeFilter !== 'all');
        return groupResults.filter((group) => {
            const hasEventMatch = matchAny(group.events, competitionFilter);
            const withinEventFilters = !shouldApplyEventFilters
                ? true
                : (group.events ?? []).some((eventName) => eventFilteredNames.has(eventName.toLowerCase()));
            return (
                matchValue(group.name, groupQuery) &&
                matchValue(group.location, locationQuery) &&
                hasEventMatch &&
                withinEventFilters
            );
        });
    }, [
        competitionQuery,
        competitionTypeFilter,
        filteredEvents,
        groupQuery,
        locationQuery,
        shouldShowGroups,
        timeRange.end,
        timeRange.start,
    ]);

    const totalCount = useMemo(() => (
        filteredEvents.length + filteredPeople.length + filteredGroups.length
    ), [filteredEvents.length, filteredGroups.length, filteredPeople.length]);
    const hasAnyResults = totalCount > 0;

    const handleFilterPress = (filter: FilterKey) => {
        setActiveFilter(filter);
    };

    const handleSearchChange = (text: string) => {
        setFilterValues(prev => ({
            ...prev,
            [activeFilter]: text,
        }));
    };

    const clearFilterValue = (filter: FilterKey) => {
        setFilterValues(prev => ({ ...prev, [filter]: '' }));
    };

    const getCompetitionTypeLabel = (type: CompetitionType) => {
        if (type === 'marathon') return 'Road&Trail';
        return 'Track&Field';
    };

    const renderEventCard = (event: EventResult) => (
        <TouchableOpacity
            key={event.id}
            style={Styles.eventCard}
            onPress={() => navigation.navigate('CompetitionDetailsScreen', {
                name: event.name,
                description: `Competition held in ${event.location}`,
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
            key={person.id}
            style={Styles.userCard}
            onPress={() => navigation.navigate('ViewUserProfileScreen', { user: person })}
        >
            <View style={Styles.userCardContent}>
                <View style={Styles.userHeader}>
                    <FastImage
                        source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' }}
                        style={Styles.userAvatar}
                    />
                    <SizeBox width={8} />
                    <View style={Styles.userInfo}>
                        <View style={Styles.userNameRow}>
                            <Text style={Styles.userName}>{person.name}</Text>
                            <View style={Styles.userTypeBadge}>
                                <Text style={Styles.userTypeText}>{person.role}</Text>
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
                            onPress={() => navigation.navigate('ViewUserProfileScreen', { user: person })}
                        >
                            <Text style={Styles.followBtnText}>Follow</Text>
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
            onPress={() => navigation.navigate('GroupProfileScreen')}
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
                                <Text style={Styles.userTypeText}>Group</Text>
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

    const timeRangeLabel = timeRange.start && timeRange.end
        ? formatDateRange(timeRange.start, timeRange.end)
        : '';

 

    const searchPlaceholder = (() => {
        if (activeFilter === 'Competition') return 'Type competition name';
        if (activeFilter === 'Person') return 'Type person name';
        if (activeFilter === 'Group') return 'Type group name';
        return 'Search by location';
    })();

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            <View style={Styles.header}>
                <View style={Styles.headerSpacer} />
                <Text style={Styles.headerTitle}>Search</Text>
                <View style={Styles.headerSpacer} />
            </View>

            <ScrollView style={Styles.container} showsVerticalScrollIndicator={false}>
                <SizeBox height={24} />

                <View style={Styles.searchRow}>
                <View style={Styles.searchInputContainer}>
                        <SearchNormal1 size={16} color="#9B9F9F" variant="Linear" />
                        <SizeBox width={8} />
                        <View style={Styles.searchInputPill}>
                            <Text style={Styles.searchInputPillText}>{activeFilter}:</Text>
                        </View>
                        <TextInput
                            style={Styles.searchInput}
                            placeholder={searchPlaceholder}
                            placeholderTextColor="#9B9F9F"
                            value={activeValue}
                            onChangeText={handleSearchChange}
                            returnKeyType="search"
                        />
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('AISearchScreen')}>
                        <View style={Styles.aiButton}>
                            <Icons.AiBlueBordered width={24} height={24} />
                        </View>
                    </TouchableOpacity>
                </View>

                <SizeBox height={16} />

                <View style={Styles.filterTabsContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
                                    {filter}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <SizeBox height={16} />

                <View style={Styles.typeFilterRow}>
                    <Text style={Styles.typeFilterLabel}>Competition Type</Text>
                    <View style={Styles.typeFilterChips}>
                        {COMPETITION_TYPE_FILTERS.map((option) => (
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
                                    {option.label}
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
                            <Text style={Styles.activeChipText}>{filter}: {filterValues[filter]}</Text>
                            <CloseCircle size={16} color="#FFFFFF" variant="Linear" />
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
                            <Text style={Styles.timeRangeText}>Select date range</Text>
                            <SizeBox width={4} />
                            <ArrowDown2 size={14} color="#9B9F9F" variant="Linear" />
                        </TouchableOpacity>
                    )}
                </View>

                <SizeBox height={24} />

                <View style={Styles.resultsHeader}>
                    <Text style={Styles.resultsTitle}>Results</Text>
                    {hasActiveFilters && (
                        <View style={Styles.resultsBadge}>
                            <Text style={Styles.resultsBadgeText}>{totalCount} found</Text>
                        </View>
                    )}
                </View>

                <SizeBox height={16} />

                {!hasActiveFilters ? (
                    renderNoResults('Start typing to search')
                ) : !hasAnyResults ? (
                    renderNoResults('No results found')
                ) : (
                    <>
                        {filteredEvents.length > 0 && (
                            <>
                                <Text style={Styles.sectionTitle}>Competitions</Text>
                                <SizeBox height={10} />
                                {filteredEvents.map(renderEventCard)}
                                <SizeBox height={20} />
                            </>
                        )}

                        {filteredPeople.length > 0 && (
                            <>
                                <Text style={Styles.sectionTitle}>People</Text>
                                <SizeBox height={10} />
                                {filteredPeople.map(renderPersonCard)}
                                <SizeBox height={20} />
                            </>
                        )}

                        {filteredGroups.length > 0 && (
                            <>
                                <Text style={Styles.sectionTitle}>Groups</Text>
                                <SizeBox height={10} />
                                {filteredGroups.map(renderGroupCard)}
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
                        <Text style={Styles.dateModalTitle}>Select date range</Text>
                        <SizeBox height={10} />
                        <View style={Styles.quickRangeRow}>
                            <TouchableOpacity
                                style={Styles.quickRangeChip}
                                onPress={() => setQuickRange('week')}
                            >
                                <Text style={Styles.quickRangeChipText}>This week</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={Styles.quickRangeChip}
                                onPress={() => setQuickRange('month')}
                            >
                                <Text style={Styles.quickRangeChipText}>This month</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={Styles.quickRangeChip}
                                onPress={() => setQuickRange('year')}
                            >
                                <Text style={Styles.quickRangeChipText}>This year</Text>
                            </TouchableOpacity>
                        </View>
                        <SizeBox height={8} />
                        <View style={Styles.rangeHeaderRow}>
                            <View style={Styles.rangePill}>
                                <Text style={Styles.rangePillLabel}>Start</Text>
                                <Text style={Styles.rangePillValue}>{calendarStart ?? 'Select'}</Text>
                            </View>
                            <View style={Styles.rangePill}>
                                <Text style={Styles.rangePillLabel}>End</Text>
                                <Text style={Styles.rangePillValue}>{calendarEnd ?? 'Select'}</Text>
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
                                <Text style={Styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[Styles.modalSubmitButton, !calendarStart && Styles.modalSubmitButtonDisabled]}
                                onPress={applyIosDateTime}
                                disabled={!calendarStart}
                            >
                                <Text style={Styles.modalSubmitText}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </View>
    )
}

export default SearchScreen
