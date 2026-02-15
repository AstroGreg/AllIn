import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Pressable, useWindowDimensions } from 'react-native';
import { CalendarList } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ArrowLeft2,
    ArrowDown2,
    Calendar,
    Clock,
    CloseCircle,
    Location,
    SearchNormal1,
    User,
} from 'iconsax-react-nativejs';
import { createStyles } from './AvailableEventsScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Images from '../../constants/Images';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const EVENT_FILTERS = ['Competition', 'Location'] as const;
type EventFilterKey = typeof EVENT_FILTERS[number];
type CompetitionType = 'track' | 'marathon';
type CompetitionTypeFilter = 'all' | CompetitionType;
const COMPETITION_TYPE_FILTERS: Array<{ key: CompetitionTypeFilter; labelKey: string }> = [
    { key: 'all', labelKey: 'all' },
    { key: 'track', labelKey: 'trackAndField' },
    { key: 'marathon', labelKey: 'roadAndTrail' },
];

const AvailableEventsScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { width: windowWidth } = useWindowDimensions();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const Styles = createStyles(colors);
    const [activeFilter, setActiveFilter] = useState<EventFilterKey>('Competition');
    const [filterValues, setFilterValues] = useState<Record<EventFilterKey, string>>({
        Competition: '',
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
    const [showSubscribeModal, setShowSubscribeModal] = useState(false);
    const [modalEvent, setModalEvent] = useState<any | null>(null);
    const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
    const [chestNumber, setChestNumber] = useState('');
    const [useDefaultChest, setUseDefaultChest] = useState(true);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(['All']);
    const defaultChestNumber = '32';

    const activeValue = filterValues[activeFilter] ?? '';
    const searchPlaceholder = activeFilter === 'Competition' ? t('typeCompetition') : t('typeLocation');

    const suggestedEvents = useMemo(
        () => ['60m', '100m', '200m', '400m', '800m', '1500m', '5K', '10K', 'Long jump', 'Shot put'],
        []
    );
    const categoryOptions = useMemo(
        () => ['Men', 'Women', 'Junior', 'Cadet', 'Master', 'Senior'],
        []
    );

    const getCompetitionTypeLabel = (type: CompetitionType) => {
        if (type === 'marathon') return t('roadAndTrail');
        return t('trackAndField');
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

    const parseEventDate = (value: string) => {
        const [day, month, year] = value.split('/').map(Number);
        if (!day || !month || !year) return null;
        return new Date(year, month - 1, day, 12, 0, 0, 0);
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

    const openDateTimePicker = () => {
        const todaySeed = toDateString(new Date());
        const startSeed = timeRange.start ? toDateString(timeRange.start) : todaySeed;
        const endSeed = timeRange.end ? toDateString(timeRange.end) : null;
        setCalendarStart(startSeed);
        setCalendarEnd(endSeed);
        setShowIosPicker(true);
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

    const modalWidth = Math.min(windowWidth * 0.9, 420);
    const calendarWidth = Math.max(0, modalWidth - 40);

    const resetSubscribeForm = () => {
        setSelectedEvents([]);
        setSelectedCategories(['All']);
        setChestNumber('');
        setUseDefaultChest(true);
    };

    const openSubscribeModal = (event: any) => {
        resetSubscribeForm();
        setModalEvent(event);
        setShowSubscribeModal(true);
    };

    const closeSubscribeModal = () => {
        setShowSubscribeModal(false);
        setModalEvent(null);
        resetSubscribeForm();
    };

    const toggleEvent = (value: string) => {
        const cleaned = value.trim();
        if (!cleaned) return;
        setSelectedEvents((prev) =>
            prev.includes(cleaned) ? prev.filter((item) => item !== cleaned) : [...prev, cleaned]
        );
    };

    const toggleCategory = (value: string) => {
        setSelectedCategories((prev) => {
            if (prev.includes(value)) {
                const next = prev.filter((item) => item !== value);
                return next.length === 0 ? ['All'] : next;
            }
            const next = prev.filter((item) => item !== 'All');
            return [...next, value];
        });
    };

    const hasChestNumber = useDefaultChest
        ? Boolean(defaultChestNumber)
        : chestNumber.trim().length > 0;
    const canContinue = selectedEvents.length > 0 && hasChestNumber;

    const handleSubscribeContinue = () => {
        if (!modalEvent) return;
        setShowSubscribeModal(false);
        navigation.navigate('EventSummaryScreen', {
            event: {
                title: modalEvent.title,
                date: modalEvent.date,
                location: modalEvent.location,
            },
            personal: {
                name: 'James Ray',
                chestNumber: useDefaultChest ? defaultChestNumber : (chestNumber || defaultChestNumber),
                events: selectedEvents,
                categories: selectedCategories,
            },
        });
        resetSubscribeForm();
        setModalEvent(null);
    };

    const availableEvents: Array<{ id: number; title: string; videos: string; location: string; date: string; competitionType: CompetitionType; thumbnail: any; }> = [
        {
            id: 1,
            title: 'BK Studentent 23',
            videos: '254 Videos',
            location: 'Berlin, Germany',
            date: '27/05/2025',
            competitionType: 'track',
            thumbnail: Images.photo4,
        },
        {
            id: 2,
            title: 'Brussels City Run 2026',
            videos: '254 Videos',
            location: 'Berlin, Germany',
            date: '12/06/2026',
            competitionType: 'marathon',
            thumbnail: Images.photo5,
        },
        {
            id: 3,
            title: 'IFAM 2024',
            videos: '254 Videos',
            location: 'Berlin, Germany',
            date: '27/05/2025',
            competitionType: 'track',
            thumbnail: Images.photo4,
        },
        {
            id: 4,
            title: 'Sunrise 10K Community Run',
            videos: '254 Videos',
            location: 'Berlin, Germany',
            date: '04/02/2026',
            competitionType: 'marathon',
            thumbnail: Images.photo5,
        },
    ];

    const competitionQuery = filterValues.Competition.trim().toLowerCase();
    const locationQuery = filterValues.Location.trim().toLowerCase();
    const activeFilters = EVENT_FILTERS.filter((filter) => filterValues[filter].trim().length > 0);
    const hasActiveFilters = activeFilters.length > 0 || !!timeRange.start || !!timeRange.end || competitionTypeFilter !== 'all';
    const filteredEvents = useMemo(() => {
        return availableEvents.filter((event) => {
            const eventDate = parseEventDate(event.date);
            const rangeOk = timeRange.start || timeRange.end ? isWithinRange(eventDate) : true;
            const typeOk = competitionTypeFilter === 'all' ? true : event.competitionType === competitionTypeFilter;
            const competitionOk = competitionQuery ? event.title.toLowerCase().includes(competitionQuery) : true;
            const locationOk = locationQuery ? event.location.toLowerCase().includes(locationQuery) : true;
            return competitionOk && locationOk && rangeOk && typeOk;
        });
    }, [competitionQuery, competitionTypeFilter, locationQuery, timeRange.end, timeRange.start]);

    const handleSearchChange = (value: string) => {
        setFilterValues((prev) => ({
            ...prev,
            [activeFilter]: value,
        }));
    };

    const clearFilterValue = (filter: EventFilterKey) => {
        setFilterValues((prev) => ({
            ...prev,
            [filter]: '',
        }));
    };

    const renderEventCard = (item: any) => (
        <TouchableOpacity
            key={item.id}
            style={Styles.eventCard}
            activeOpacity={0.85}
            onPress={() => openSubscribeModal(item)}
        >
            <View style={Styles.eventIconContainer}>
                            <Calendar size={20} color={colors.primaryColor} variant="Linear" />
            </View>
            <SizeBox width={16} />
            <View style={Styles.eventContent}>
                <View style={Styles.eventNameRow}>
                    <Text style={Styles.eventName}>{item.title}</Text>
                    <View style={Styles.eventTypeBadge}>
                        <Text style={Styles.eventTypeBadgeText}>{getCompetitionTypeLabel(item.competitionType)}</Text>
                    </View>
                </View>
                <SizeBox height={6} />
                <View style={Styles.eventDetails}>
                    <View style={Styles.eventDetailItem}>
                        <Calendar size={14} color={colors.subTextColor} variant="Linear" />
                        <SizeBox width={4} />
                        <Text style={Styles.eventDetailText}>{item.date}</Text>
                    </View>
                    <View style={Styles.eventDetailItem}>
                        <Location size={14} color={colors.subTextColor} variant="Linear" />
                        <SizeBox width={4} />
                        <Text style={Styles.eventDetailText}>{item.location}</Text>
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
                <TouchableOpacity style={Styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={20} color={colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{t('events')}</Text>
                <View style={Styles.headerSpacer} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                <View style={Styles.searchRow}>
                    <View style={Styles.searchInputContainer}>
                        <SearchNormal1 size={16} color={colors.subTextColor} variant="Linear" />
                        <SizeBox width={8} />
                        <View style={Styles.searchInputPill}>
                            <Text style={Styles.searchInputPillText}>
                                {activeFilter === 'Competition' ? t('competition') : t('location')}:
                            </Text>
                        </View>
                        <TextInput
                            style={Styles.searchInput}
                            placeholder={searchPlaceholder}
                            placeholderTextColor={colors.subTextColor}
                            value={activeValue}
                            onChangeText={handleSearchChange}
                            returnKeyType="search"
                        />
                    </View>
                </View>

                <SizeBox height={16} />

                <View style={Styles.filterTabsContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {EVENT_FILTERS.map((filter) => (
                            <TouchableOpacity
                                key={filter}
                                style={[
                                    Styles.filterTab,
                                    activeFilter === filter && Styles.filterTabActive
                                ]}
                                onPress={() => setActiveFilter(filter)}
                            >
                                <Text style={[
                                    Styles.filterTabText,
                                    activeFilter === filter && Styles.filterTabTextActive
                                ]}>
                                    {filter === 'Competition' ? t('competition') : t('location')}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <SizeBox height={16} />

                <View style={Styles.typeFilterRow}>
                    <Text style={Styles.typeFilterLabel}>{t('competitionType')}</Text>
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
                                    {t(option.labelKey)}
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
                            <Text style={Styles.activeChipText}>
                                {(filter === 'Competition' ? t('competition') : t('location'))}: {filterValues[filter]}
                            </Text>
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
                            <Clock size={14} color={colors.subTextColor} variant="Linear" />
                            <SizeBox width={4} />
                            <Text style={Styles.timeRangeText}>{t('selectDateRange')}</Text>
                            <SizeBox width={4} />
                            <ArrowDown2 size={14} color={colors.subTextColor} variant="Linear" />
                        </TouchableOpacity>
                    )}
                </View>

                <SizeBox height={16} />

                {/* Available Events Section */}
                <View style={Styles.sectionHeader}>
                    <Text style={Styles.sectionTitle}>{t('availableEvents')}</Text>
                    <View style={Styles.eventsCountBadge}>
                        <Text style={Styles.eventsCountText}>{filteredEvents.length} {t('events').toLowerCase()}</Text>
                    </View>
                </View>

                {filteredEvents.map(renderEventCard)}

                <SizeBox height={20} />
            </ScrollView>

            <Modal
                visible={showSubscribeModal}
                transparent
                animationType="fade"
                onRequestClose={closeSubscribeModal}
            >
                <View style={Styles.modalBackdrop}>
                    <View style={Styles.modalCard}>
                        <View style={Styles.modalHeaderRow}>
                            <Text style={Styles.modalTitle}>{t('subscribeToEvent')}</Text>
                            <TouchableOpacity
                                style={Styles.modalHeaderAction}
                                onPress={() => {
                                    if (!modalEvent) return;
                                    setShowSubscribeModal(false);
                                    navigation.navigate('CompetitionDetailsScreen', {
                                        name: modalEvent.title,
                                        description: `Competition held in ${modalEvent.location}`,
                                        competitionType: modalEvent.competitionType,
                                    });
                                }}
                            >
                                <Text style={Styles.modalHeaderActionText}>{t('viewCompetition')}</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={Styles.modalSubtitle}>
                            {modalEvent?.title ?? t('selectDisciplineChest')}
                        </Text>

                        <Text style={Styles.modalSectionTitle}>{t('disciplines')}</Text>
                        <ScrollView contentContainerStyle={Styles.modalChipsGrid}>
                            {suggestedEvents.map((item) => {
                                const isSelected = selectedEvents.includes(item);
                                return (
                                    <TouchableOpacity
                                        key={`modal-${item}`}
                                        style={[Styles.modalChip, isSelected && Styles.modalChipActive]}
                                        onPress={() => toggleEvent(item)}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[Styles.modalChipText, isSelected && Styles.modalChipTextActive]}>
                                            {item}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        <Text style={Styles.modalSectionTitle}>{t('notificationsFor')}</Text>
                        <View style={Styles.modalChipsGrid}>
                            {selectedCategories.includes('All') && (
                                <View style={[Styles.modalChip, Styles.modalChipActive]}>
                                    <Text style={[Styles.modalChipText, Styles.modalChipTextActive]}>{t('all')}</Text>
                                </View>
                            )}
                            {categoryOptions.map((item) => {
                                const isSelected = selectedCategories.includes(item);
                                return (
                                    <TouchableOpacity
                                        key={`cat-${item}`}
                                        style={[Styles.modalChip, isSelected && Styles.modalChipActive]}
                                        onPress={() => toggleCategory(item)}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[Styles.modalChipText, isSelected && Styles.modalChipTextActive]}>
                                            {t(item.toLowerCase())}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <Text style={Styles.modalSectionTitle}>{t('chestNumber')}</Text>
                        <View style={Styles.modalChestInput}>
                            <User size={16} color={colors.subTextColor} variant="Linear" />
                            <TextInput
                                style={Styles.modalChestTextInput}
                                placeholder={t('enterChestNumber')}
                                placeholderTextColor={colors.subTextColor}
                                value={useDefaultChest ? defaultChestNumber : chestNumber}
                                onChangeText={setChestNumber}
                                editable={!useDefaultChest}
                            />
                        </View>
                        <TouchableOpacity
                            style={Styles.defaultChestRow}
                            onPress={() => setUseDefaultChest((prev) => !prev)}
                            activeOpacity={0.8}
                        >
                            <View style={[Styles.defaultChestBox, useDefaultChest && Styles.defaultChestBoxActive]}>
                                {useDefaultChest && <Text style={Styles.defaultChestCheck}>{t('✓')}</Text>}
                            </View>
                            <Text style={Styles.defaultChestText}>
                                {t('useDefaultNumber')} ({defaultChestNumber})
                            </Text>
                        </TouchableOpacity>

                        <View style={Styles.modalButtonsRow}>
                            <TouchableOpacity style={Styles.modalCancelButton} onPress={closeSubscribeModal}>
                                <Text style={Styles.modalCancelText}>{t('cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[Styles.modalConfirmButton, !canContinue && Styles.modalConfirmButtonDisabled]}
                                onPress={handleSubscribeContinue}
                                disabled={!canContinue}
                            >
                                <Text style={[Styles.modalConfirmText, !canContinue && Styles.modalConfirmTextDisabled]}>
                                    {t('continue')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={showIosPicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowIosPicker(false)}
            >
                <View style={Styles.dateModalOverlay}>
                    <Pressable
                        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
                        onPress={() => setShowIosPicker(false)}
                    />
                    <View style={[Styles.dateModalContainer, { width: modalWidth }]}>
                        <Text style={Styles.dateModalTitle}>{t('selectDateRange')}</Text>
                        <SizeBox height={10} />
                        <View style={Styles.quickRangeRow}>
                            <TouchableOpacity style={Styles.quickRangeChip} onPress={() => setQuickRange('week')}>
                                <Text style={Styles.quickRangeChipText}>{t('thisWeek')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={Styles.quickRangeChip} onPress={() => setQuickRange('month')}>
                                <Text style={Styles.quickRangeChipText}>{t('thisMonth')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={Styles.quickRangeChip} onPress={() => setQuickRange('year')}>
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
                        <View style={Styles.dateModalButtonRow}>
                            <TouchableOpacity style={Styles.dateModalCancelButton} onPress={() => setShowIosPicker(false)}>
                                <Text style={Styles.dateModalCancelText}>{t('cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[Styles.dateModalSubmitButton, !calendarStart && Styles.dateModalSubmitButtonDisabled]}
                                onPress={applyIosDateTime}
                                disabled={!calendarStart}
                            >
                                <Text style={Styles.dateModalSubmitText}>{t('apply')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default AvailableEventsScreen;