import {View, Text, TouchableOpacity, Animated, Easing} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import Icons from '../../../constants/Icons';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import {ArrowLeft2} from 'iconsax-react-nativejs';
import { createStyles } from './ContextSearchLoadingScreenStyles';
import {useAuth} from '../../../context/AuthContext';
import {ApiError, searchObject} from '../../../services/apiGateway';
import {useEvents} from '../../../context/EventsContext';

const ContextSearchLoadingScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const {apiAccessToken} = useAuth();
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const [matchedCount, setMatchedCount] = useState<number | null>(null);
    const [errorText, setErrorText] = useState<string | null>(null);

    const contextSearch = route?.params?.contextSearch || '';
    const filters = route?.params?.filters || [];
    const filterState = route?.params?.filterState;
    const {events} = useEvents();

    const eventIdFromFilters = useMemo(() => {
        const competitionQuery = String(filterState?.competition ?? '').trim().toLowerCase();
        const range = filterState?.timeRange ?? null;
        const rangeStart = range?.start ? new Date(range.start) : null;
        const rangeEnd = range?.end ? new Date(range.end) : null;
        const hasConstraints = Boolean(competitionQuery || rangeStart || rangeEnd);
        if (!hasConstraints) return null;
        const isWithinRange = (dateValue?: string | null) => {
            if (!rangeStart && !rangeEnd) return true;
            if (!dateValue) return false;
            const date = new Date(dateValue);
            if (Number.isNaN(date.getTime())) return false;
            if (rangeStart && rangeEnd) return date >= rangeStart && date <= rangeEnd;
            if (rangeStart) return date >= rangeStart;
            if (rangeEnd) return date <= rangeEnd;
            return true;
        };
        const matches = events.filter((event) => {
            const name = String(event.event_name || event.event_title || '').toLowerCase();
            const nameOk = competitionQuery ? name.includes(competitionQuery) : true;
            const dateOk = isWithinRange(event.event_date);
            return nameOk && dateOk;
        });
        if (matches.length === 1) return String(matches[0].event_id);
        return null;
    }, [events, filterState?.competition, filterState?.timeRange]);

    const queryText = useMemo(() => {
        const base = String(contextSearch || '').trim();
        const parts: string[] = [];

        if (Array.isArray(filters)) {
            for (const f of filters) {
                const v = String(f || '').trim();
                if (v) parts.push(v);
            }
        } else if (filters && typeof filters === 'object') {
            for (const [k, v0] of Object.entries(filters)) {
                const v = String(v0 || '').trim();
                if (!v) continue;
                parts.push(`${String(k).trim()} ${v}`.trim());
            }
        }

        return [base, ...parts].filter(Boolean).join(' ').trim();
    }, [contextSearch, filters]);

    // Rotation animation for loading spinner
    useEffect(() => {
        const rotateAnimation = Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 1500,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );
        rotateAnimation.start();

        return () => rotateAnimation.stop();
    }, [rotateAnim]);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            if (!apiAccessToken) {
                setErrorText('Missing API token. Log in or set a Dev API token to use Context Search.');
                return;
            }

            const q = queryText;
            if (!q) {
                setErrorText('Missing query. Please go back and enter a search phrase.');
                return;
            }

            setErrorText(null);
            setMatchedCount(null);
            try {
                const results = await searchObject(apiAccessToken, {q, top: 150, event_id: eventIdFromFilters ?? undefined});
                if (cancelled) return;
                setMatchedCount(results.length);
                navigation.replace('AISearchResultsScreen', {
                    matchedCount: results.length,
                    results,
                });
            } catch (e: any) {
                if (cancelled) return;
                if (e instanceof ApiError && e.status === 402) {
                    setErrorText('Insufficient AI tokens to run this search.');
                    return;
                }
                const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
                setErrorText(msg);
            }
        };

        run();
        return () => {
            cancelled = true;
        };
    }, [apiAccessToken, eventIdFromFilters, navigation, queryText]);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <View style={{width: 44}} />
                <View style={{width: 44}} />
            </View>

            {/* Center Content */}
            <View style={styles.centerContent}>
                {/* Loading Spinner */}
                <Animated.View style={[styles.spinnerContainer, { transform: [{ rotate: spin }] }]}>
                    <Icons.LoadingGradient width={131} height={131} />
                </Animated.View>

                <SizeBox height={28} />

                {/* Status Box */}
                <View style={styles.statusBox}>
                    <Text style={styles.scannedText}>{errorText ? 'Error' : 'Searching'}</Text>
                    <MaskedView
                        style={styles.maskedView}
                        maskElement={
                            <Text style={styles.matchedText}>
                                {errorText ? errorText : `Matched ${matchedCount ?? '…'}`}
                            </Text>
                        }>
                        <LinearGradient
                            colors={['#155DFC', '#7F22FE']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gradientText}>
                            <Text style={[styles.matchedText, { opacity: 0 }]}>
                                {errorText ? errorText : `Matched ${matchedCount ?? '…'}`}
                            </Text>
                        </LinearGradient>
                    </MaskedView>
                </View>
            </View>
        </View>
    );
};

export default ContextSearchLoadingScreen;
