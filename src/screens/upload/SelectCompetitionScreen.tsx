import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Modal, Pressable } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FastImage from 'react-native-fast-image'
import { ArrowLeft2, SearchNormal1, Location, Calendar, VideoSquare, Ghost } from 'iconsax-react-nativejs'
import { createStyles } from './SelectCompetitionStyles'
import SizeBox from '../../constants/SizeBox'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { ApiError, getMediaViewAll, searchEvents, type MediaViewAllItem, type SubscribedEvent } from '../../services/apiGateway'
import { getApiBaseUrl } from '../../constants/RuntimeConfig'
import { CalendarList } from 'react-native-calendars'

interface Competition {
    id: string;
    name: string;
    videoCount: number;
    location: string;
    date: string;
    thumbnailUrl?: string | null;
    competitionType: 'track' | 'road';
}

const SelectCompetitionScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { apiAccessToken } = useAuth();
    const anonymous = route?.params?.anonymous;
    const isAnonymous = !!anonymous;

    const [activeFilter, setActiveFilter] = useState<'Competition' | 'Location'>('Competition');
    const [filterValues, setFilterValues] = useState<{ Competition: string; Location: string }>({
        Competition: '',
        Location: '',
    });
    const [eventTypeFilter, setEventTypeFilter] = useState<'all' | 'track' | 'road'>('all');
    const [timeRange, setTimeRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
    const [showCalendar, setShowCalendar] = useState(false);
    const [calendarStart, setCalendarStart] = useState<string | null>(null);
    const [calendarEnd, setCalendarEnd] = useState<string | null>(null);
    const [rawEvents, setRawEvents] = useState<SubscribedEvent[]>([]);
    const [mediaByEvent, setMediaByEvent] = useState<Record<string, { thumbUrl?: string; videoCount: number }>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [errorText, setErrorText] = useState<string | null>(null);

    const isSignedUrl = useCallback((value?: string | null) => {
        if (!value) return false;
        const lower = String(value).toLowerCase();
        return (
            lower.includes('x-amz-signature') ||
            lower.includes('x-amz-credential') ||
            lower.includes('x-amz-security-token') ||
            lower.includes('signature=') ||
            lower.includes('token=') ||
            lower.includes('expires=')
        );
    }, []);

    const withAccessToken = useCallback((value?: string | null) => {
        if (!value) return undefined;
        if (!apiAccessToken) return value;
        if (isSignedUrl(value)) return value;
        if (value.includes('access_token=')) return value;
        const sep = value.includes('?') ? '&' : '?';
        return `${value}${sep}access_token=${encodeURIComponent(apiAccessToken)}`;
    }, [apiAccessToken, isSignedUrl]);

    const toAbsoluteUrl = useCallback((value?: string | null) => {
        if (!value) return null;
        const raw = String(value);
        if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
        const base = getApiBaseUrl();
        if (!base) return raw;
        return `${base.replace(/\/$/, '')}/${raw.replace(/^\//, '')}`;
    }, []);

    const normalizeThumb = useCallback((item: MediaViewAllItem) => {
        const candidate = item.thumbnail_url || item.preview_url || item.full_url || item.raw_url || null;
        const resolved = candidate ? toAbsoluteUrl(String(candidate)) : null;
        return withAccessToken(resolved) || resolved || undefined;
    }, [toAbsoluteUrl, withAccessToken]);

    const toDateString = (date: Date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const fromDateString = (value: string, isEnd: boolean) => {
        const [year, month, day] = value.split('-').map(Number);
        if (!year || !month || !day) return null;
        if (isEnd) return new Date(year, month - 1, day, 23, 59, 59, 999);
        return new Date(year, month - 1, day, 0, 0, 0, 0);
    };

    const parseEventDate = (value?: string | null) => {
        if (!value) return null;
        const raw = String(value);
        const direct = new Date(raw);
        if (!Number.isNaN(direct.getTime())) return direct;
        if (raw.includes('/')) {
            const [day, month, year] = raw.split('/').map(Number);
            if (!day || !month || !year) return null;
            return new Date(year, month - 1, day, 12, 0, 0, 0);
        }
        return null;
    };

    const openDateTimePicker = () => {
        const todaySeed = toDateString(new Date());
        const startSeed = timeRange.start ? toDateString(timeRange.start) : todaySeed;
        const endSeed = timeRange.end ? toDateString(timeRange.end) : null;
        setCalendarStart(startSeed);
        setCalendarEnd(endSeed);
        setShowCalendar(true);
    };

    const setQuickRange = (preset: 'week' | 'month' | 'year') => {
        const today = new Date();
        if (preset === 'week') {
            const day = today.getDay();
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

    const applyDateRange = () => {
        if (!calendarStart) {
            setShowCalendar(false);
            return;
        }
        const start = fromDateString(calendarStart, false);
        const endSeed = calendarEnd ?? calendarStart;
        const end = fromDateString(endSeed, true);
        if (!start || !end) {
            setShowCalendar(false);
            return;
        }
        const finalEnd = end < start ? new Date(start.getTime()) : end;
        setTimeRange({ start, end: finalEnd });
        setShowCalendar(false);
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

    const handleDayPress = (day: any) => {
        if (!calendarStart || (calendarStart && calendarEnd)) {
            setCalendarStart(day.dateString);
            setCalendarEnd(null);
            return;
        }
        if (day.dateString < calendarStart) {
            setCalendarEnd(calendarStart);
            setCalendarStart(day.dateString);
        } else {
            setCalendarEnd(day.dateString);
        }
    };

    const clearDateRange = () => {
        setCalendarStart(null);
        setCalendarEnd(null);
        setTimeRange({ start: null, end: null });
    };

    const activeValue = filterValues[activeFilter];
    const handleSearchChange = (text: string) => {
        setFilterValues((prev) => ({ ...prev, [activeFilter]: text }));
    };

    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken) return () => {};
        getMediaViewAll(apiAccessToken)
            .then((items) => {
                if (!mounted) return;
                const map: Record<string, { thumbUrl?: string; videoCount: number }> = {};
                items.forEach((media) => {
                    const eventId = media.event_id ? String(media.event_id) : '';
                    if (!eventId) return;
                    const entry = map[eventId] || { videoCount: 0, thumbUrl: undefined };
                    if (!entry.thumbUrl) {
                        entry.thumbUrl = normalizeThumb(media);
                    }
                    if (String(media.type).toLowerCase() === 'video') {
                        entry.videoCount += 1;
                    }
                    map[eventId] = entry;
                });
                setMediaByEvent(map);
            })
            .catch(() => {});
        return () => {
            mounted = false;
        };
    }, [apiAccessToken, normalizeThumb]);

    const loadCompetitions = useCallback(async (query: string) => {
        if (!apiAccessToken) {
            setRawEvents([]);
            setErrorText('Log in to load competitions.');
            return;
        }
        setIsLoading(true);
        setErrorText(null);
        try {
            const res = await searchEvents(apiAccessToken, { q: query || undefined, limit: 100, offset: 0 });
            setRawEvents(Array.isArray(res?.events) ? res.events : []);
        } catch (e: any) {
            const message = e instanceof ApiError ? e.message : String(e?.message ?? e);
            setErrorText(message);
            setRawEvents([]);
        } finally {
            setIsLoading(false);
        }
    }, [apiAccessToken]);

    useEffect(() => {
        const handle = setTimeout(() => {
            const query = String(filterValues[activeFilter] ?? '').trim();
            loadCompetitions(query);
        }, 300);
        return () => clearTimeout(handle);
    }, [loadCompetitions, filterValues, activeFilter]);

    const competitions: Competition[] = useMemo(() => {
        return rawEvents.map((event) => {
            const eventId = String(event.event_id);
            const mediaInfo = mediaByEvent[eventId];
            const rawType = String((event as any).event_type || (event as any).competition_type || (event as any).event_category || '');
            const nameSource = event.event_name || event.event_title || '';
            const typeGuess = rawType || nameSource;
            const isRoad = /road|trail|marathon|city run/i.test(typeGuess);
            return {
                id: eventId,
                name: nameSource || 'Competition',
                location: event.event_location || '—',
                date: event.event_date || '—',
                videoCount: mediaInfo?.videoCount ?? 0,
                thumbnailUrl: mediaInfo?.thumbUrl ?? null,
                competitionType: isRoad ? 'road' : 'track',
            };
        });
    }, [mediaByEvent, rawEvents]);

    const formatDisplayDate = useCallback((value: string) => {
        if (!value) return '—';
        const parsed = parseEventDate(value);
        if (!parsed) return value;
        const day = String(parsed.getDate()).padStart(2, '0');
        const month = String(parsed.getMonth() + 1).padStart(2, '0');
        const year = parsed.getFullYear();
        return `${day}/${month}/${year}`;
    }, [parseEventDate]);

    const filteredCompetitions = useMemo(() => {
        const cFilter = filterValues.Competition.trim().toLowerCase();
        const lFilter = filterValues.Location.trim().toLowerCase();
        return competitions.filter((competition) => {
            const typeOk = eventTypeFilter === 'all' ? true : competition.competitionType === eventTypeFilter;
            const name = competition.name.toLowerCase();
            const location = competition.location.toLowerCase();
            const matchesCompetition = cFilter ? name.includes(cFilter) : true;
            const matchesLocation = lFilter ? location.includes(lFilter) : true;
            const eventDate = parseEventDate(competition.date);
            const inRange =
                timeRange.start || timeRange.end
                    ? !!eventDate &&
                      (!timeRange.start || eventDate >= timeRange.start) &&
                      (!timeRange.end || eventDate <= timeRange.end)
                    : true;
            return matchesCompetition && matchesLocation && typeOk && inRange;
        });
    }, [competitions, eventTypeFilter, filterValues.Competition, filterValues.Location, parseEventDate, timeRange.end, timeRange.start]);

    const handleUploadToCompetition = (competition: Competition) => {
        navigation.navigate('CompetitionDetailsScreen', {
            competition,
            anonymous,
            competitionType: competition.competitionType,
        });
    };

    const renderCompetitionCard = (competition: Competition) => (
        <TouchableOpacity
            key={competition.id}
            style={Styles.competitionCard}
            activeOpacity={0.85}
            onPress={() => handleUploadToCompetition(competition)}
        >
            <View style={Styles.competitionContent}>
                <View style={Styles.thumbnailContainer}>
                    {competition.thumbnailUrl ? (
                        <FastImage source={{ uri: competition.thumbnailUrl }} style={Styles.thumbnail} resizeMode="cover" />
                    ) : (
                        <View style={Styles.thumbnailPlaceholder} />
                    )}
                </View>
                <View style={Styles.competitionInfo}>
                    <View style={Styles.competitionHeader}>
                        <Text style={Styles.competitionName} numberOfLines={2}>{competition.name}</Text>
                        <View style={Styles.typeBadge}>
                            <Text style={Styles.typeBadgeText}>
                                {competition.competitionType === 'road' ? 'Road&Trail' : 'Track&Field'}
                            </Text>
                        </View>
                    </View>
                    <View style={Styles.metaRow}>
                        <View style={Styles.infoValueRow}>
                            <Location size={14} color={colors.grayColor} variant="Linear" />
                            <Text style={Styles.infoValue} numberOfLines={1}>{competition.location}</Text>
                        </View>
                        <View style={Styles.infoValueRow}>
                            <Calendar size={14} color={colors.grayColor} variant="Linear" />
                            <Text style={Styles.infoValue} numberOfLines={1}>
                                {formatDisplayDate(competition.date)}
                            </Text>
                        </View>
                    </View>
                    <View style={Styles.videoCountRow}>
                        <VideoSquare size={14} color={colors.grayColor} variant="Linear" />
                        <Text style={Styles.videoCountText}>{competition.videoCount} media</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Upload</Text>
                {isAnonymous ? (
                    <View style={Styles.headerGhost}>
                        <Ghost size={22} color={colors.primaryColor} variant="Linear" />
                    </View>
                ) : (
                    <View style={Styles.headerSpacer} />
                )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                <View style={Styles.uploadModeBanner}>
                    <Text style={Styles.uploadModeText}>
                        {isAnonymous ? 'Anonymous upload' : 'Upload to a competition'}
                    </Text>
                </View>

                <SizeBox height={12} />

                {/* Search Bar */}
                <View style={Styles.searchRow}>
                    <View style={Styles.searchInputContainer}>
                        <SearchNormal1 size={16} color={colors.grayColor} variant="Linear" />
                        <SizeBox width={8} />
                        <View style={Styles.searchInputPill}>
                            <Text style={Styles.searchInputPillText}>{activeFilter}:</Text>
                        </View>
                        <TextInput
                            style={Styles.searchInput}
                            placeholder={activeFilter === 'Competition' ? 'Search competitions to upload' : 'Search by location'}
                            placeholderTextColor={colors.grayColor}
                            value={activeValue}
                            onChangeText={handleSearchChange}
                        />
                    </View>
                </View>

                <SizeBox height={14} />

                <View style={Styles.filterTabsContainer}>
                    {['Competition', 'Location'].map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[Styles.filterTab, activeFilter === filter && Styles.filterTabActive]}
                            onPress={() => setActiveFilter(filter as 'Competition' | 'Location')}
                        >
                            <Text style={[Styles.filterTabText, activeFilter === filter && Styles.filterTabTextActive]}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <SizeBox height={12} />

                <View style={Styles.typeFilterRow}>
                    <Text style={Styles.typeFilterLabel}>Competition type</Text>
                    <View style={Styles.typeFilterChips}>
                        {[
                            { key: 'all', label: 'All' },
                            { key: 'track', label: 'Track&Field' },
                            { key: 'road', label: 'Road&Trail' },
                        ].map((tab) => (
                            <TouchableOpacity
                                key={tab.key}
                                style={[Styles.typeFilterChip, eventTypeFilter === tab.key && Styles.typeFilterChipActive]}
                                onPress={() => setEventTypeFilter(tab.key as any)}
                            >
                                <Text style={[Styles.typeFilterChipText, eventTypeFilter === tab.key && Styles.typeFilterChipTextActive]}>
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <SizeBox height={12} />

                <View style={Styles.activeChipsContainer}>
                    {filterValues.Competition.trim().length > 0 && (
                        <View style={Styles.activeChip}>
                            <Text style={Styles.activeChipText}>Competition: {filterValues.Competition}</Text>
                        </View>
                    )}
                    {filterValues.Location.trim().length > 0 && (
                        <View style={Styles.activeChip}>
                            <Text style={Styles.activeChipText}>Location: {filterValues.Location}</Text>
                        </View>
                    )}
                    <TouchableOpacity
                        style={[Styles.timeRangeChip, timeRange.start && timeRange.end && Styles.timeRangeChipActive]}
                        onPress={openDateTimePicker}
                    >
                        <Calendar size={14} color={timeRange.start ? colors.primaryColor : colors.grayColor} variant="Linear" />
                        <Text style={[Styles.timeRangeText, timeRange.start && Styles.timeRangeTextActive]}>
                            {timeRange.start && timeRange.end ? timeRangeLabel : 'Select date range'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Results Header */}
                <View style={Styles.resultsHeader}>
                    <Text style={Styles.resultsTitle}>Available Competitions</Text>
                    <View style={Styles.resultsCountBadge}>
                        <Text style={Styles.resultsCountText}>
                            {isLoading ? '...' : `${filteredCompetitions.length} competitions`}
                        </Text>
                    </View>
                </View>

                <SizeBox height={16} />

                {isLoading && filteredCompetitions.length === 0 && (
                    <View style={Styles.loadingRow}>
                        <ActivityIndicator color={colors.primaryColor} />
                        <Text style={Styles.loadingText}>Loading competitions...</Text>
                    </View>
                )}

                {!isLoading && errorText && (
                    <Text style={Styles.errorText}>{errorText}</Text>
                )}

                {/* Competition Cards */}
                {filteredCompetitions.map(renderCompetitionCard)}

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>

            <Modal visible={showCalendar} transparent animationType="fade" onRequestClose={() => setShowCalendar(false)}>
                <View style={Styles.modalOverlay}>
                    <Pressable
                        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
                        onPress={() => setShowCalendar(false)}
                    />
                    <View style={Styles.dateModalContainer}>
                        <Text style={Styles.dateModalTitle}>Select date range</Text>
                        <SizeBox height={10} />
                        <View style={Styles.quickRangeRow}>
                            <TouchableOpacity style={Styles.quickRangeChip} onPress={() => setQuickRange('week')}>
                                <Text style={Styles.quickRangeChipText}>This week</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={Styles.quickRangeChip} onPress={() => setQuickRange('month')}>
                                <Text style={Styles.quickRangeChipText}>This month</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={Styles.quickRangeChip} onPress={() => setQuickRange('year')}>
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
                            onDayPress={handleDayPress}
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
                            <TouchableOpacity style={Styles.modalCancelButton} onPress={() => setShowCalendar(false)}>
                                <Text style={Styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[Styles.modalSubmitButton, !calendarStart && Styles.modalSubmitButtonDisabled]}
                                onPress={applyDateRange}
                                disabled={!calendarStart}
                            >
                                <Text style={Styles.modalSubmitText}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default SelectCompetitionScreen;
