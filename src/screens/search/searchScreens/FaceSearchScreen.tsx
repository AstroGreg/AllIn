import {View, Text, ScrollView, TouchableOpacity, TextInput, Alert} from 'react-native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import SizeBox from '../../../constants/SizeBox';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../../context/ThemeContext';
import {ArrowLeft2, SearchNormal1, Add, ArrowRight} from 'iconsax-react-nativejs';
import { createStyles } from './FaceSearchScreenStyles';
import {useAuth} from '../../../context/AuthContext';
import {useFocusEffect} from '@react-navigation/native';
import {
  ApiError,
  getAuthMe,
  grantFaceRecognitionConsent,
  searchFaceByEnrollment,
  subscribeToEvent,
} from '../../../services/apiGateway';

const FaceSearchScreen = ({navigation, route}: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const {apiAccessToken} = useAuth();

    const [isLoadingMe, setIsLoadingMe] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [eventIdInput, setEventIdInput] = useState('');
    const [authMe, setAuthMe] = useState<any | null>(null);
    const [missingAngles, setMissingAngles] = useState<string[] | null>(null);
    const [needsConsent, setNeedsConsent] = useState(false);
    const [errorText, setErrorText] = useState<string | null>(null);

    const refreshMe = useCallback(async () => {
        if (!apiAccessToken) return;
        setIsLoadingMe(true);
        setErrorText(null);
        try {
            const me = await getAuthMe(apiAccessToken);
            setAuthMe(me);
        } catch (e: any) {
            const message = e instanceof ApiError ? e.message : String(e?.message ?? e);
            setErrorText(message);
        } finally {
            setIsLoadingMe(false);
        }
    }, [apiAccessToken]);

    useFocusEffect(
        useCallback(() => {
            refreshMe();
        }, [refreshMe]),
    );

    const subscribedEventIds = useMemo<string[]>(() => {
        const ids: string[] = Array.isArray(authMe?.event_ids) ? authMe.event_ids.map((v: any) => String(v)) : [];
        const filtered = ids.map((s: string) => s.trim()).filter(Boolean);
        const unique: string[] = Array.from(new Set(filtered));
        if (!searchText.trim()) return unique;
        const q = searchText.trim().toLowerCase();
        return unique.filter((id: string) => id.toLowerCase().includes(q));
    }, [authMe?.event_ids, searchText]);

    const runSearch = useCallback(async () => {
        if (!apiAccessToken) {
            Alert.alert('Missing API token', 'Log in or set a Dev API token to use Face Search.');
            return;
        }

        setNeedsConsent(false);
        setMissingAngles(null);
        setErrorText(null);
        setIsSearching(true);
        try {
            const me = authMe ?? (await getAuthMe(apiAccessToken));
            setAuthMe(me);

            const event_ids: string[] = Array.isArray(me?.event_ids) ? me.event_ids.map((v: any) => String(v)) : [];
            if (event_ids.length === 0) {
                setErrorText('No subscribed events found for your profile. Subscribe to an event first.');
                return;
            }

            const res = await searchFaceByEnrollment(apiAccessToken, {
                event_ids,
                label: 'default',
                limit: 600,
                top: 100,
            });

            navigation.navigate('AISearchResultsScreen', {
                matchedCount: Array.isArray(res?.results) ? res.results.length : 0,
                results: res?.results ?? [],
                matchType: 'face',
            });
        } catch (e: any) {
            if (e instanceof ApiError) {
                const body = e.body ?? {};
                if (e.status === 403 && String(e.message).toLowerCase().includes('consent')) {
                    setNeedsConsent(true);
                    setErrorText('Face recognition consent is required.');
                    return;
                }
                if (e.status === 400 && Array.isArray(body?.missing_angles)) {
                    setMissingAngles(body.missing_angles.map(String));
                    setErrorText('Face Search is not set up yet. Please enroll your face first.');
                    return;
                }
                setErrorText(`${e.message}`);
            } else {
                setErrorText(String(e?.message ?? e));
            }
        } finally {
            setIsSearching(false);
        }
    }, [apiAccessToken, authMe, navigation]);

    const handleGrantConsent = useCallback(async () => {
        if (!apiAccessToken) return;
        setErrorText(null);
        try {
            await grantFaceRecognitionConsent(apiAccessToken);
            setNeedsConsent(false);
            await refreshMe();
            runSearch();
        } catch (e: any) {
            const message = e instanceof ApiError ? e.message : String(e?.message ?? e);
            setErrorText(message);
        }
    }, [apiAccessToken, refreshMe, runSearch]);

    const handleEnroll = useCallback(() => {
        navigation.navigate('SearchFaceCaptureScreen', {
            mode: 'enrolFace',
            afterEnroll: {screen: 'FaceSearchScreen', params: {autoSearch: true}},
        });
    }, [navigation]);

    useEffect(() => {
        if (route?.params?.autoSearch) {
            navigation.setParams({autoSearch: false});
            runSearch();
        }
    }, [navigation, route?.params?.autoSearch, runSearch]);

    const handleSubscribe = useCallback(async () => {
        if (!apiAccessToken) return;
        const eventId = eventIdInput.trim();
        if (!eventId) {
            Alert.alert('Missing event id', 'Paste an event UUID first.');
            return;
        }
        setErrorText(null);
        try {
            await subscribeToEvent(apiAccessToken, eventId);
            setEventIdInput('');
            await refreshMe();
        } catch (e: any) {
            const message = e instanceof ApiError ? e.message : String(e?.message ?? e);
            setErrorText(message);
        }
    }, [apiAccessToken, eventIdInput, refreshMe]);

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Faces</Text>
                <View style={{width: 44, height: 44}} />
            </View>

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <SizeBox height={24} />

                {/* Top row */}
                <View style={styles.searchLabelRow}>
                    <Text style={styles.searchLabel}>Face Search</Text>
                    <TouchableOpacity
                        style={styles.addFaceButton}
                        onPress={handleEnroll}
                    >
                        <Text style={styles.addFaceButtonText}>Enroll Face</Text>
                        <Add size={16} color="#FFFFFF" variant="Linear" />
                    </TouchableOpacity>
                </View>

                <SizeBox height={8} />

                {/* Status */}
                <View style={styles.faceGroupCard}>
                    <Text style={styles.faceGroupName}>Find photos of you</Text>
                    <SizeBox height={8} />
                    <Text style={[styles.searchInput, {color: colors.grayColor}]}>
                        This uses the backend endpoint {'/ai/search/face'} and searches across the events your profile is subscribed to.
                    </Text>
                    <SizeBox height={12} />
                    <Text style={[styles.searchInput, {color: colors.mainTextColor}]}>
                        Subscribed events: {isLoadingMe ? 'Loading…' : String(authMe?.event_ids?.length ?? 0)}
                    </Text>
                    {missingAngles && missingAngles.length > 0 && (
                        <>
                            <SizeBox height={12} />
                            <Text style={[styles.searchInput, {color: colors.mainTextColor}]}>
                                Missing enrollment angles: {missingAngles.join(', ')}
                            </Text>
                        </>
                    )}
                    {errorText && (
                        <>
                            <SizeBox height={12} />
                            <Text style={[styles.searchInput, {color: '#FF3B30'}]}>{errorText}</Text>
                        </>
                    )}
                </View>

                {/* Search filter input (for event id list) */}
                <View style={styles.searchInputContainer}>
                    <SearchNormal1 size={24} color={colors.grayColor} variant="Linear" />
                    <SizeBox width={6} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Filter subscribed event IDs"
                        placeholderTextColor={colors.grayColor}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>

                <SizeBox height={24} />

                {/* Subscribed event list */}
                {subscribedEventIds.length > 0 ? (
                    <View style={styles.faceGroupCard}>
                        <Text style={styles.searchLabel}>Events to search</Text>
                        <SizeBox height={8} />
                        {subscribedEventIds.slice(0, 10).map((id) => (
                            <Text key={id} style={[styles.searchInput, {color: colors.mainTextColor}]}>
                                {id}
                            </Text>
                        ))}
                        {subscribedEventIds.length > 10 && (
                            <Text style={[styles.searchInput, {color: colors.grayColor}]}>
                                …and {subscribedEventIds.length - 10} more
                            </Text>
                        )}
                    </View>
                ) : (
                    <View style={styles.faceGroupCard}>
                        <Text style={styles.searchLabel}>No events found</Text>
                        <SizeBox height={8} />
                        <Text style={[styles.searchInput, {color: colors.grayColor}]}>
                            Your profile has no event subscriptions yet. If you know an event UUID, paste it below to subscribe (advanced).
                        </Text>
                        <SizeBox height={12} />
                        <View style={styles.searchInputContainer}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Event UUID"
                                placeholderTextColor={colors.grayColor}
                                value={eventIdInput}
                                onChangeText={setEventIdInput}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                        <SizeBox height={12} />
                        <TouchableOpacity
                            style={[styles.selectButton, {alignSelf: 'flex-start'}]}
                            onPress={handleSubscribe}
                            disabled={!eventIdInput.trim()}
                        >
                            <Text style={styles.selectButtonText}>Subscribe</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <SizeBox height={100} />
            </ScrollView>

            {/* Continue Button */}
            <View style={[styles.bottomButtonContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
                <TouchableOpacity
                    style={[styles.continueButton, isSearching && styles.continueButtonDisabled]}
                    onPress={needsConsent ? handleGrantConsent : runSearch}
                    disabled={isSearching}
                >
                    <Text style={styles.continueButtonText}>
                        {needsConsent ? 'Enable Face Recognition' : isSearching ? 'Searching…' : 'Find My Photos'}
                    </Text>
                    <ArrowRight size={24} color="#FFFFFF" variant="Linear" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default FaceSearchScreen;
