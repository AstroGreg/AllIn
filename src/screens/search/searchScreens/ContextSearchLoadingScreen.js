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
import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import Icons from '../../../constants/Icons';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
import { createStyles } from './ContextSearchLoadingScreenStyles';
import { useAuth } from '../../../context/AuthContext';
import { ApiError, searchObject } from '../../../services/apiGateway';
import { useEvents } from '../../../context/EventsContext';
import { useTranslation } from 'react-i18next';
const ContextSearchLoadingScreen = ({ navigation, route }) => {
    var _a, _b, _c, _d, _e;
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const { apiAccessToken } = useAuth();
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const [matchedCount, setMatchedCount] = useState(null);
    const [errorText, setErrorText] = useState(null);
    const contextSearch = ((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.contextSearch) || '';
    const rawFilters = (_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.filters;
    const filters = useMemo(() => rawFilters !== null && rawFilters !== void 0 ? rawFilters : [], [rawFilters]);
    const filterState = (_c = route === null || route === void 0 ? void 0 : route.params) === null || _c === void 0 ? void 0 : _c.filterState;
    const { events } = useEvents();
    const eventIdFromFilters = useMemo(() => {
        var _a, _b;
        const competitionQuery = String((_a = filterState === null || filterState === void 0 ? void 0 : filterState.competition) !== null && _a !== void 0 ? _a : '').trim().toLowerCase();
        const range = (_b = filterState === null || filterState === void 0 ? void 0 : filterState.timeRange) !== null && _b !== void 0 ? _b : null;
        const rangeStart = (range === null || range === void 0 ? void 0 : range.start) ? new Date(range.start) : null;
        const rangeEnd = (range === null || range === void 0 ? void 0 : range.end) ? new Date(range.end) : null;
        const hasConstraints = Boolean(competitionQuery || rangeStart || rangeEnd);
        if (!hasConstraints)
            return null;
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
        const matches = events.filter((event) => {
            const name = String(event.event_name || event.event_title || '').toLowerCase();
            const nameOk = competitionQuery ? name.includes(competitionQuery) : true;
            const dateOk = isWithinRange(event.event_date);
            return nameOk && dateOk;
        });
        if (matches.length === 1)
            return String(matches[0].event_id);
        return null;
    }, [events, filterState === null || filterState === void 0 ? void 0 : filterState.competition, filterState === null || filterState === void 0 ? void 0 : filterState.timeRange]);
    const queryText = useMemo(() => {
        const base = String(contextSearch || '').trim();
        const parts = [];
        if (Array.isArray(filters)) {
            for (const f of filters) {
                const v = String(f || '').trim();
                if (v)
                    parts.push(v);
            }
        }
        else if (filters && typeof filters === 'object') {
            for (const [k, v0] of Object.entries(filters)) {
                const v = String(v0 || '').trim();
                if (!v)
                    continue;
                parts.push(`${String(k).trim()} ${v}`.trim());
            }
        }
        return [base, ...parts].filter(Boolean).join(' ').trim();
    }, [contextSearch, filters]);
    // Rotation animation for loading spinner
    useEffect(() => {
        const rotateAnimation = Animated.loop(Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.linear,
            useNativeDriver: true,
        }));
        rotateAnimation.start();
        return () => rotateAnimation.stop();
    }, [rotateAnim]);
    useEffect(() => {
        let cancelled = false;
        const run = () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const q = queryText;
            if (!q) {
                setErrorText(t('Missing query. Please go back and enter a search phrase.'));
                return;
            }
            setErrorText(null);
            setMatchedCount(null);
            const requestAccessToken = apiAccessToken !== null && apiAccessToken !== void 0 ? apiAccessToken : '';
            try {
                const results = yield searchObject(requestAccessToken, { q, top: 150, event_id: eventIdFromFilters !== null && eventIdFromFilters !== void 0 ? eventIdFromFilters : undefined });
                if (cancelled)
                    return;
                setMatchedCount(results.length);
                navigation.replace('AISearchResultsScreen', {
                    matchedCount: results.length,
                    results,
                    refineContext: {
                        date: ((_a = filterState === null || filterState === void 0 ? void 0 : filterState.timeRange) === null || _a === void 0 ? void 0 : _a.start) || ((_b = filterState === null || filterState === void 0 ? void 0 : filterState.timeRange) === null || _b === void 0 ? void 0 : _b.end)
                            ? [
                                ((_c = filterState === null || filterState === void 0 ? void 0 : filterState.timeRange) === null || _c === void 0 ? void 0 : _c.start) ? new Date(filterState.timeRange.start).toLocaleDateString() : null,
                                ((_d = filterState === null || filterState === void 0 ? void 0 : filterState.timeRange) === null || _d === void 0 ? void 0 : _d.end) ? new Date(filterState.timeRange.end).toLocaleDateString() : null,
                            ]
                                .filter(Boolean)
                                .join(' - ')
                            : undefined,
                    },
                    manualBrowse: eventIdFromFilters
                        ? {
                            eventId: eventIdFromFilters,
                            competitionId: eventIdFromFilters,
                            eventName: filterState === null || filterState === void 0 ? void 0 : filterState.competition,
                        }
                        : undefined,
                });
            }
            catch (e) {
                if (cancelled)
                    return;
                const msg = e instanceof ApiError ? e.message : String((_e = e === null || e === void 0 ? void 0 : e.message) !== null && _e !== void 0 ? _e : e);
                setErrorText(msg);
            }
        });
        run();
        return () => {
            cancelled = true;
        };
    }, [apiAccessToken, eventIdFromFilters, filterState === null || filterState === void 0 ? void 0 : filterState.competition, (_d = filterState === null || filterState === void 0 ? void 0 : filterState.timeRange) === null || _d === void 0 ? void 0 : _d.end, (_e = filterState === null || filterState === void 0 ? void 0 : filterState.timeRange) === null || _e === void 0 ? void 0 : _e.start, navigation, queryText, t]);
    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });
    return (_jsxs(View, Object.assign({ style: styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(View, { style: { width: 44 } }), _jsx(View, { style: { width: 44 } })] })), _jsxs(View, Object.assign({ style: styles.centerContent }, { children: [_jsx(Animated.View, Object.assign({ style: [styles.spinnerContainer, { transform: [{ rotate: spin }] }] }, { children: _jsx(Icons.LoadingGradient, { width: 131, height: 131 }) })), _jsx(SizeBox, { height: 28 }), _jsxs(View, Object.assign({ style: styles.statusBox }, { children: [_jsx(Text, Object.assign({ style: styles.scannedText }, { children: errorText ? t('Error') : t('Searching') })), _jsx(MaskedView, Object.assign({ style: styles.maskedView, maskElement: _jsx(Text, Object.assign({ style: styles.matchedText }, { children: errorText ? errorText : `${t('Matched')} ${matchedCount !== null && matchedCount !== void 0 ? matchedCount : '…'}` })) }, { children: _jsx(LinearGradient, Object.assign({ colors: ['#155DFC', '#7F22FE'], start: { x: 0, y: 0 }, end: { x: 1, y: 0 }, style: styles.gradientText }, { children: _jsx(Text, Object.assign({ style: [styles.matchedText, { opacity: 0 }] }, { children: errorText ? errorText : `${t('Matched')} ${matchedCount !== null && matchedCount !== void 0 ? matchedCount : '…'}` })) })) }))] }))] }))] })));
};
export default ContextSearchLoadingScreen;
