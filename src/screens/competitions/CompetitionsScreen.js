import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft2, ArrowRight2, Setting5, TickSquare, } from 'iconsax-react-nativejs';
import { createStyles } from './CompetitionsScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Icons from '../../constants/Icons';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventsContext';
import { ApiError, getHubAppearances, searchEvents } from '../../services/apiGateway';
const CompetitionsScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const { apiAccessToken } = useAuth();
    const { events: subscribedEvents } = useEvents();
    const [activeTab, setActiveTab] = useState('track');
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [showSubscribedOnly, setShowSubscribedOnly] = useState(true);
    const [showWithVideosOnly, setShowWithVideosOnly] = useState(true);
    const [allEvents, setAllEvents] = useState([]);
    const [appearanceSummary, setAppearanceSummary] = useState([]);
    const [eventsError, setEventsError] = useState(null);
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);
    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken) {
            setAllEvents([]);
            return () => { };
        }
        setIsLoadingEvents(true);
        setEventsError(null);
        searchEvents(apiAccessToken, { q: '', limit: 200 })
            .then((res) => {
            if (!mounted)
                return;
            const list = Array.isArray(res === null || res === void 0 ? void 0 : res.events) ? res.events : [];
            setAllEvents(list);
        })
            .catch((e) => {
            var _a;
            if (!mounted)
                return;
            const msg = e instanceof ApiError ? e.message : String((_a = e === null || e === void 0 ? void 0 : e.message) !== null && _a !== void 0 ? _a : e);
            setEventsError(msg);
            setAllEvents([]);
        })
            .finally(() => {
            if (mounted)
                setIsLoadingEvents(false);
        });
        return () => {
            mounted = false;
        };
    }, [apiAccessToken]);
    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken) {
            setAppearanceSummary([]);
            return () => { };
        }
        getHubAppearances(apiAccessToken)
            .then((res) => {
            if (!mounted)
                return;
            setAppearanceSummary(Array.isArray(res === null || res === void 0 ? void 0 : res.appearances) ? res.appearances : []);
        })
            .catch(() => {
            if (!mounted)
                return;
            setAppearanceSummary([]);
        });
        return () => {
            mounted = false;
        };
    }, [apiAccessToken]);
    const appearanceByEvent = useMemo(() => {
        const map = new Map();
        appearanceSummary.forEach((item) => {
            if (!(item === null || item === void 0 ? void 0 : item.event_id))
                return;
            map.set(String(item.event_id), item);
        });
        return map;
    }, [appearanceSummary]);
    const subscribedIds = useMemo(() => new Set(subscribedEvents.map((event) => String(event.event_id))), [subscribedEvents]);
    const getEventTypeToken = useCallback((event) => {
        return `${event.competition_type || ''} ${event.event_type || ''} ${event.event_name || ''} ${event.event_title || ''}`.toLowerCase();
    }, []);
    const resolveEventType = useCallback((event) => {
        const name = getEventTypeToken(event);
        if (/javelin|discus|shot|hammer|pole|jump|field/.test(name))
            return 'field';
        if (/marathon|trail|road|run|5k|10k|half|relay/.test(name))
            return 'track';
        return 'track';
    }, [getEventTypeToken]);
    const resolveCompetitionType = useCallback((event) => {
        const name = getEventTypeToken(event);
        if (/marathon|trail|road|veldlopen|veldloop|cross|5k|10k|half/.test(name))
            return 'marathon';
        return 'track';
    }, [getEventTypeToken]);
    const combinedEvents = useMemo(() => {
        const map = new Map();
        allEvents.forEach((event) => {
            if (!(event === null || event === void 0 ? void 0 : event.event_id))
                return;
            map.set(String(event.event_id), event);
        });
        subscribedEvents.forEach((event) => {
            if (!(event === null || event === void 0 ? void 0 : event.event_id))
                return;
            if (!map.has(String(event.event_id))) {
                map.set(String(event.event_id), event);
            }
        });
        appearanceSummary.forEach((appearance) => {
            var _a, _b, _c;
            if (!(appearance === null || appearance === void 0 ? void 0 : appearance.event_id))
                return;
            if (!map.has(String(appearance.event_id))) {
                map.set(String(appearance.event_id), {
                    event_id: String(appearance.event_id),
                    event_name: (_a = appearance.event_name) !== null && _a !== void 0 ? _a : null,
                    event_location: (_b = appearance.event_location) !== null && _b !== void 0 ? _b : null,
                    event_date: (_c = appearance.event_date) !== null && _c !== void 0 ? _c : null,
                });
            }
        });
        return Array.from(map.values());
    }, [allEvents, appearanceSummary, subscribedEvents]);
    const filteredEvents = useMemo(() => {
        let list = combinedEvents;
        if (showSubscribedOnly) {
            list = list.filter((event) => subscribedIds.has(String(event.event_id)));
        }
        if (showWithVideosOnly) {
            list = list.filter((event) => {
                var _a;
                const appearance = appearanceByEvent.get(String(event.event_id));
                return Number((_a = appearance === null || appearance === void 0 ? void 0 : appearance.videos_count) !== null && _a !== void 0 ? _a : 0) > 0;
            });
        }
        list = list.filter((event) => resolveEventType(event) === activeTab);
        return list;
    }, [activeTab, appearanceByEvent, combinedEvents, resolveEventType, showSubscribedOnly, showWithVideosOnly, subscribedIds]);
    const renderEventCard = (item) => (_jsxs(TouchableOpacity, Object.assign({ style: styles.eventCard, activeOpacity: 0.7, onPress: () => {
            navigation.navigate('CompetitionDetailsScreen', {
                eventId: item.eventId,
                name: item.name,
                location: item.location,
                date: item.date,
                organizingClub: item.organizingClub,
                competitionType: item.competitionType,
            });
        } }, { children: [_jsx(Text, Object.assign({ style: styles.eventName }, { children: item.name })), _jsx(View, Object.assign({ style: styles.eventRight }, { children: item.badges.length > 0 ? (_jsx(View, Object.assign({ style: styles.badgesContainer }, { children: item.badges.map((badge, index) => (_jsx(View, Object.assign({ style: styles.badge }, { children: _jsx(Text, Object.assign({ style: styles.badgeText }, { children: t(badge) })) }), index))) }))) : (_jsx(ArrowRight2, { size: 24, color: colors.subTextColor, variant: "Linear" })) }))] }), item.id));
    return (_jsxs(View, Object.assign({ style: styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.backButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 20, color: colors.mainTextColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: styles.headerTitle }, { children: t('Competitions') })), _jsx(TouchableOpacity, Object.assign({ style: styles.settingsButton }, { children: _jsx(Icons.Setting, { height: 24, width: 24 }) }))] })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, contentContainerStyle: styles.scrollContent }, { children: [_jsxs(View, Object.assign({ style: styles.competitionInfo }, { children: [_jsx(Text, Object.assign({ style: styles.competitionTitle }, { children: t('Competitions') })), _jsx(Text, Object.assign({ style: styles.competitionDescription }, { children: isLoadingEvents ? t('Loading competitions…') : `${combinedEvents.length} ${t('competitions available')}` }))] })), _jsx(SizeBox, { height: 24 }), _jsxs(View, Object.assign({ style: styles.toggleContainer }, { children: [_jsx(TouchableOpacity, Object.assign({ style: [styles.toggleButton, activeTab === 'track' && styles.toggleButtonActive], onPress: () => setActiveTab('track') }, { children: _jsx(Text, Object.assign({ style: [styles.toggleText, activeTab === 'track' && styles.toggleTextActive] }, { children: t('Track Events') })) })), _jsx(TouchableOpacity, Object.assign({ style: [styles.toggleButton, activeTab === 'field' && styles.toggleButtonActive], onPress: () => setActiveTab('field') }, { children: _jsx(Text, Object.assign({ style: [styles.toggleText, activeTab === 'field' && styles.toggleTextActive] }, { children: t('Field Events') })) }))] })), _jsx(SizeBox, { height: 24 }), _jsxs(View, Object.assign({ style: styles.sectionHeaderContainer }, { children: [_jsxs(View, Object.assign({ style: styles.sectionHeader }, { children: [_jsx(Text, Object.assign({ style: styles.sectionTitle }, { children: t('Videos') })), _jsx(TouchableOpacity, Object.assign({ style: styles.filterButton, onPress: () => setShowFilterPopup(!showFilterPopup) }, { children: _jsx(Setting5, { size: 16, color: colors.pureWhite, variant: "Linear" }) }))] })), showFilterPopup && (_jsxs(View, Object.assign({ style: styles.filterPopup }, { children: [_jsxs(TouchableOpacity, Object.assign({ style: styles.filterOption, onPress: () => setShowSubscribedOnly(!showSubscribedOnly) }, { children: [_jsx(Text, Object.assign({ style: styles.filterOptionText }, { children: t('Show only subscribed events') })), _jsx(View, Object.assign({ style: [styles.checkbox, showSubscribedOnly && styles.checkboxChecked] }, { children: showSubscribedOnly && (_jsx(TickSquare, { size: 24, color: colors.primaryColor, variant: "Bold" })) }))] })), _jsx(View, { style: styles.filterDivider }), _jsxs(TouchableOpacity, Object.assign({ style: styles.filterOption, onPress: () => setShowWithVideosOnly(!showWithVideosOnly) }, { children: [_jsx(Text, Object.assign({ style: styles.filterOptionText }, { children: t('Show only events with videos of me') })), _jsx(View, Object.assign({ style: [styles.checkbox, showWithVideosOnly && styles.checkboxChecked] }, { children: showWithVideosOnly && (_jsx(TickSquare, { size: 24, color: colors.primaryColor, variant: "Bold" })) }))] }))] })))] })), _jsx(SizeBox, { height: 27 }), _jsx(View, Object.assign({ style: styles.eventsList }, { children: eventsError ? (_jsx(Text, Object.assign({ style: styles.emptyStateText }, { children: eventsError }))) : filteredEvents.length === 0 ? (_jsx(Text, Object.assign({ style: styles.emptyStateText }, { children: t('No competitions found yet.') }))) : (filteredEvents.map((event) => {
                            const eventId = String(event.event_id);
                            const appearance = appearanceByEvent.get(eventId);
                            const badges = [];
                            if (appearance)
                                badges.push('Found');
                            if (subscribedIds.has(eventId))
                                badges.push('Subscribed');
                            const location = event.event_location ? String(event.event_location) : '';
                            const date = event.event_date ? new Date(event.event_date).toLocaleDateString() : '';
                            return renderEventCard({
                                id: eventId,
                                eventId,
                                name: event.event_name || event.event_title || t('Competition'),
                                location,
                                date,
                                organizingClub: String((event === null || event === void 0 ? void 0 : event.organizing_club) || '').trim(),
                                badges,
                                competitionType: resolveCompetitionType(event),
                            });
                        })) })), _jsx(SizeBox, { height: 24 }), _jsx(Text, Object.assign({ style: styles.photosTitle }, { children: t('Photos') })), _jsx(SizeBox, { height: 24 }), _jsxs(TouchableOpacity, Object.assign({ style: styles.primaryButton, onPress: () => navigation.navigate('AllPhotosOfEvents', { eventName: t('All competitions') }) }, { children: [_jsx(Text, Object.assign({ style: styles.primaryButtonText }, { children: t('Show All Photos') })), _jsx(ArrowRight2, { size: 18, color: colors.pureWhite, variant: "Linear" })] })), _jsx(SizeBox, { height: 40 })] }))] })));
};
export default CompetitionsScreen;
