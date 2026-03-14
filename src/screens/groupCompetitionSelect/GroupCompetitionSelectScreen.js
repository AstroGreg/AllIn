var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft2, SearchNormal1 } from 'iconsax-react-nativejs';
import SizeBox from '../../constants/SizeBox';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { searchEvents } from '../../services/apiGateway';
const GroupCompetitionSelectScreen = ({ navigation, route }) => {
    var _a;
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const { apiAccessToken } = useAuth();
    const groupId = String(((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.groupId) || '').trim();
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState(null);
    useEffect(() => {
        let mounted = true;
        if (!apiAccessToken)
            return () => { };
        const timer = setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            const trimmed = query.trim();
            if (!trimmed) {
                if (mounted) {
                    setEvents([]);
                    setLoading(false);
                }
                return;
            }
            setLoading(true);
            try {
                const resp = yield searchEvents(apiAccessToken, { q: trimmed, limit: 30 });
                if (!mounted)
                    return;
                setEvents(Array.isArray(resp === null || resp === void 0 ? void 0 : resp.events) ? resp.events : []);
            }
            catch (_a) {
                if (mounted)
                    setEvents([]);
            }
            finally {
                if (mounted)
                    setLoading(false);
            }
        }), 250);
        return () => {
            mounted = false;
            clearTimeout(timer);
        };
    }, [apiAccessToken, query]);
    const selectedEvent = useMemo(() => events.find((event) => String(event.event_id || '') === String(selectedEventId || '')), [events, selectedEventId]);
    const styles = useMemo(() => StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.backgroundColor },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 0.5,
            borderBottomColor: colors.lightGrayColor,
        },
        headerButton: {
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.btnBackgroundColor,
            borderWidth: 1,
            borderColor: colors.borderColor,
            alignItems: 'center',
            justifyContent: 'center',
        },
        headerTitle: { fontSize: 18, color: colors.mainTextColor },
        card: {
            marginHorizontal: 20,
            marginTop: 16,
            borderWidth: 1,
            borderColor: colors.borderColor,
            borderRadius: 12,
            backgroundColor: colors.cardBackground,
            padding: 12,
        },
        title: { fontSize: 13, color: colors.mainTextColor, marginBottom: 8 },
        searchInputWrap: {
            height: 44,
            borderWidth: 1,
            borderColor: colors.borderColor,
            borderRadius: 10,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 10,
            backgroundColor: colors.cardBackground,
        },
        searchInput: { flex: 1, fontSize: 13, color: colors.mainTextColor, marginLeft: 8 },
        eventRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 10,
            borderBottomWidth: 0.5,
            borderBottomColor: colors.lightGrayColor,
        },
        eventTitle: { fontSize: 13, color: colors.mainTextColor },
        eventMeta: { marginTop: 2, fontSize: 11, color: colors.subTextColor },
        badge: {
            borderWidth: 1,
            borderColor: colors.primaryColor,
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 6,
            backgroundColor: colors.secondaryBlueColor,
        },
        badgeText: { fontSize: 11, color: colors.primaryColor },
        actionButton: {
            marginTop: 12,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.primaryColor,
            backgroundColor: colors.secondaryBlueColor,
            paddingVertical: 11,
            alignItems: 'center',
            justifyContent: 'center',
        },
        actionButtonDisabled: { opacity: 0.45 },
        actionButtonText: { fontSize: 13, color: colors.primaryColor },
        empty: { paddingVertical: 18, alignItems: 'center' },
        emptyText: { fontSize: 12, color: colors.subTextColor },
    }), [colors]);
    return (_jsxs(View, Object.assign({ style: styles.container }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: styles.headerTitle }, { children: t('Select competition') })), _jsx(View, { style: { width: 44, height: 44 } })] })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false }, { children: [_jsxs(View, Object.assign({ style: styles.card }, { children: [_jsx(Text, Object.assign({ style: styles.title }, { children: t('Choose one competition') })), _jsxs(View, Object.assign({ style: styles.searchInputWrap }, { children: [_jsx(SearchNormal1, { size: 18, color: colors.primaryColor, variant: "Linear" }), _jsx(TextInput, { style: styles.searchInput, placeholder: t('Search competitions'), placeholderTextColor: colors.subTextColor, value: query, onChangeText: setQuery })] })), !query.trim() ? (_jsx(View, Object.assign({ style: styles.empty }, { children: _jsx(Text, Object.assign({ style: styles.emptyText }, { children: t('Type to search competitions') })) }))) : loading ? (_jsx(View, Object.assign({ style: styles.empty }, { children: _jsx(ActivityIndicator, { size: "small", color: colors.primaryColor }) }))) : events.length === 0 ? (_jsx(View, Object.assign({ style: styles.empty }, { children: _jsx(Text, Object.assign({ style: styles.emptyText }, { children: t('No competitions found') })) }))) : (events.map((event) => {
                                const eventId = String(event.event_id || '');
                                const selected = selectedEventId === eventId;
                                const eventName = String(event.event_name || event.event_title || t('Competition'));
                                const eventMeta = [event.event_location, event.event_date].filter(Boolean).join(' · ');
                                return (_jsxs(TouchableOpacity, Object.assign({ style: styles.eventRow, onPress: () => setSelectedEventId(eventId) }, { children: [_jsxs(View, Object.assign({ style: { flex: 1, paddingRight: 10 } }, { children: [_jsx(Text, Object.assign({ style: styles.eventTitle }, { children: eventName })), eventMeta ? _jsx(Text, Object.assign({ style: styles.eventMeta }, { children: eventMeta })) : null] })), _jsx(View, Object.assign({ style: styles.badge }, { children: _jsx(Text, Object.assign({ style: styles.badgeText }, { children: selected ? t('Selected') : t('Select') })) }))] }), eventId));
                            })), _jsx(TouchableOpacity, Object.assign({ style: [styles.actionButton, !selectedEvent && styles.actionButtonDisabled], disabled: !selectedEvent, onPress: () => {
                                    if (!selectedEvent)
                                        return;
                                    navigation.navigate('GroupCompetitionAssignScreen', {
                                        groupId,
                                        eventId: String(selectedEvent.event_id || ''),
                                        eventName: String(selectedEvent.event_name || selectedEvent.event_title || t('Competition')),
                                    });
                                } }, { children: _jsx(Text, Object.assign({ style: styles.actionButtonText }, { children: t('Continue') })) }))] })), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] }))] })));
};
export default GroupCompetitionSelectScreen;
