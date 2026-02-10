import { View, Text, TouchableOpacity, ScrollView, Switch, Modal, Image, TextInput, ActivityIndicator } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Colors from '../../../constants/Colors'
import { ArrowLeft2, ArrowRight } from 'iconsax-react-nativejs'
import Icons from '../../../constants/Icons'
import Images from '../../../constants/Images'
import styles from './CompetitionDetailsScreenStyles'
import { useAuth } from '../../../context/AuthContext'
import { ApiError, CompetitionMapCheckpoint, CompetitionMapSummary, getCompetitionMapById, getCompetitionMaps, searchEvents, searchFaceByEnrollment, searchMediaByBib, grantFaceRecognitionConsent } from '../../../services/apiGateway'

interface EventCategory {
    id: number;
    name: string;
    badges?: string[];
    hasArrow?: boolean;
    thumbnail?: any;
}

interface Course {
    id: string;
    label: string;
    description: string;
    imageUrl?: string;
    checkpoints: Array<{ id: string; label: string }>;
}

const FALLBACK_COURSES: Course[] = [
    {
        id: 'course-5k',
        label: '5 km',
        description: 'Fast city loop',
        imageUrl: undefined,
        checkpoints: [
            { id: 'cp-1', label: '1 km' },
            { id: 'cp-2', label: '3 km' },
            { id: 'cp-3', label: '5 km' },
        ],
    },
    {
        id: 'course-10k',
        label: '10 km',
        description: 'Two-loop course',
        imageUrl: undefined,
        checkpoints: [
            { id: 'cp-4', label: '2.5 km' },
            { id: 'cp-5', label: '5 km' },
            { id: 'cp-6', label: '7.5 km' },
            { id: 'cp-7', label: '10 km' },
        ],
    },
    {
        id: 'course-15k',
        label: '15 km',
        description: 'River + park section',
        imageUrl: undefined,
        checkpoints: [
            { id: 'cp-8', label: '5 km' },
            { id: 'cp-9', label: '10 km' },
            { id: 'cp-10', label: '15 km' },
        ],
    },
];

const CompetitionDetailsScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { apiAccessToken, userProfile } = useAuth();
    const [selectedTab, setSelectedTab] = useState<'track' | 'field'>('track');
    const [showRelevantOnly, setShowRelevantOnly] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState('course-10k');
    const [checkpointModalVisible, setCheckpointModalVisible] = useState(false);
    const [selectedCheckpoint, setSelectedCheckpoint] = useState<{ id: string; label: string } | null>(null);
    const [courseOptions, setCourseOptions] = useState<Course[]>([]);
    const [mapError, setMapError] = useState<string | null>(null);
    const [aiCompareModalVisible, setAiCompareModalVisible] = useState(false);
    const [quickChestNumber, setQuickChestNumber] = useState('');
    const [quickSearchError, setQuickSearchError] = useState<string | null>(null);
    const [quickSearchLoading, setQuickSearchLoading] = useState(false);
    const [quickNeedsConsent, setQuickNeedsConsent] = useState(false);
    const [quickMissingAngles, setQuickMissingAngles] = useState<string[] | null>(null);

    const competitionName = route?.params?.name || 'BK Studentent 23';
    const competitionDescription = route?.params?.description || 'This is the Belgium Championship 2023';
    const competitionType: 'track' | 'marathon' = route?.params?.competitionType || 'track';
    const eventId = route?.params?.eventId as string | undefined;
    const competitionId = route?.params?.competitionId as string | undefined;

    useEffect(() => {
        const chest = String(userProfile?.chestNumber ?? '').trim();
        if (chest) setQuickChestNumber(chest);
    }, [userProfile?.chestNumber]);

    const trackEvents: EventCategory[] = [
        { id: 1, name: '100 Meters', badges: ['Found'], hasArrow: true, thumbnail: Images.photo1 },
        { id: 2, name: '200 Meters', badges: ['Found'], hasArrow: true, thumbnail: Images.photo3 },
        { id: 3, name: '400 Meters', hasArrow: true, thumbnail: Images.photo4 },
        { id: 4, name: '800 Meters', hasArrow: true, thumbnail: Images.photo5 },
        { id: 5, name: '1500 Meters', hasArrow: true, thumbnail: Images.photo6 },
        { id: 6, name: '5000 Meters', hasArrow: true, thumbnail: Images.photo7 },
    ];

    const fieldEvents: EventCategory[] = [
        { id: 1, name: 'Long Jump', badges: ['Found'], hasArrow: true, thumbnail: Images.photo8 },
        { id: 2, name: 'High Jump', hasArrow: true, thumbnail: Images.photo9 },
        { id: 3, name: 'Shot Put', hasArrow: true, thumbnail: Images.photo4 },
        { id: 4, name: 'Discus Throw', hasArrow: true, thumbnail: Images.photo5 },
    ];

    const currentEvents = selectedTab === 'track' ? trackEvents : fieldEvents;
    const filteredEvents = showRelevantOnly
        ? currentEvents.filter((event) => event.badges?.includes('Found'))
        : currentEvents;

    const selectedCourse = useMemo(() => {
        const list = courseOptions.length > 0 ? courseOptions : FALLBACK_COURSES;
        return list.find((course) => course.id === selectedCourseId) ?? list[0];
    }, [courseOptions, selectedCourseId]);

    const visibleCourses = courseOptions.length > 0 ? courseOptions : FALLBACK_COURSES;

    useEffect(() => {
        if (competitionType !== 'marathon') return;

        if (!apiAccessToken || (!eventId && !competitionId)) {
            if (courseOptions.length === 0) {
                setCourseOptions(FALLBACK_COURSES);
                setSelectedCourseId(FALLBACK_COURSES[0]?.id ?? 'course-10k');
            }
            return;
        }

        let isActive = true;
        const loadMaps = async () => {
            setMapError(null);
            try {
                const res = await getCompetitionMaps(apiAccessToken, {
                    event_id: eventId,
                    competition_id: competitionId,
                    include_checkpoints: true,
                });
                if (!isActive) return;
                const normalized = (res.maps || []).map((map: CompetitionMapSummary) => ({
                    id: map.id,
                    label: map.name ?? 'Course',
                    description: map.name ? 'Course map' : 'Course map',
                    imageUrl: map.image_url ?? undefined,
                    checkpoints: (map.checkpoints ?? []).map((cp: CompetitionMapCheckpoint) => ({
                        id: cp.id,
                        label: cp.label ?? `Checkpoint ${cp.checkpoint_index}`,
                    })),
                }));
                if (normalized.length > 0) {
                    setCourseOptions(normalized);
                    setSelectedCourseId((prev) =>
                        normalized.some((course) => course.id === prev) ? prev : normalized[0].id
                    );
                } else if (courseOptions.length === 0) {
                    setCourseOptions(FALLBACK_COURSES);
                }
            } catch (e: any) {
                if (!isActive) return;
                const message = e instanceof ApiError ? e.message : String(e?.message ?? e);
                setMapError(message);
                if (courseOptions.length === 0) {
                    setCourseOptions(FALLBACK_COURSES);
                }
            }
        };

        loadMaps();
        return () => {
            isActive = false;
        };
    }, [apiAccessToken, competitionId, competitionType, courseOptions.length, eventId]);

    useEffect(() => {
        if (competitionType !== 'marathon') return;
        if (!apiAccessToken) return;
        if (courseOptions.length === 0) return;

        const current = courseOptions.find((course) => course.id === selectedCourseId);
        if (!current || (current.checkpoints && current.checkpoints.length > 0)) return;

        let isActive = true;
        const loadCheckpoints = async () => {
            try {
                const res = await getCompetitionMapById(apiAccessToken, current.id);
                if (!isActive) return;
                setCourseOptions((prev) =>
                    prev.map((course) =>
                        course.id === current.id
                            ? {
                                ...course,
                                imageUrl: res.map.image_url ?? course.imageUrl,
                                checkpoints: (res.checkpoints ?? []).map((cp) => ({
                                    id: cp.id,
                                    label: cp.label ?? `Checkpoint ${cp.checkpoint_index}`,
                                })),
                            }
                            : course,
                    ),
                );
            } catch {
                // silent fallback
            }
        };

        loadCheckpoints();
        return () => {
            isActive = false;
        };
    }, [apiAccessToken, competitionType, courseOptions, selectedCourseId]);

    const renderEventCard = (event: EventCategory) => (
        <TouchableOpacity
            key={event.id}
            style={styles.eventCard}
            onPress={() => navigation.navigate('EventDivisionScreen', { eventName: event.name, competitionName })}
        >
            <View style={styles.eventCardLeft}>
                <Image source={event.thumbnail ?? Images.photo1} style={styles.eventThumbnail} />
                <Text style={styles.eventCardName}>{event.name}</Text>
            </View>
            <View style={styles.eventCardRight}>
                {event.badges?.map((badge, index) => (
                    <View key={index} style={styles.badge}>
                        <Text style={styles.badgeText}>{badge}</Text>
                    </View>
                ))}
                {event.hasArrow && (
                    <ArrowRight size={20} color="#9B9F9F" variant="Linear" />
                )}
            </View>
        </TouchableOpacity>
    );

    const handleCheckpointPress = (checkpoint: { id: string; label: string }) => {
        setSelectedCheckpoint(checkpoint);
        setCheckpointModalVisible(true);
    };

    const resolveEventId = useCallback(async () => {
        if (eventId) return String(eventId);
        if (!apiAccessToken) return null;
        try {
            const res = await searchEvents(apiAccessToken, { q: competitionName, limit: 1 });
            const first = Array.isArray(res?.events) ? res.events[0] : null;
            return first?.event_id ? String(first.event_id) : null;
        } catch {
            return null;
        }
    }, [apiAccessToken, competitionName, eventId]);

    const runQuickCompare = useCallback(async () => {
        if (!apiAccessToken) {
            setQuickSearchError('Missing API token. Please log in again.');
            return;
        }
        const resolvedId = await resolveEventId();
        if (!resolvedId) {
            setQuickSearchError('Could not resolve this competition.');
            return;
        }
        const bibValue = quickChestNumber.trim();
        if (!bibValue) {
            setQuickSearchError('Add a chest number to start the search.');
            return;
        }

        setQuickSearchLoading(true);
        setQuickSearchError(null);
        setQuickNeedsConsent(false);
        setQuickMissingAngles(null);

        const collected: any[] = [];
        const seen = new Set<string>();
        const addResults = (items: any[], matchType: string) => {
            for (const item of items) {
                const id = String(item.media_id ?? item.id ?? '');
                if (!id || seen.has(id)) continue;
                seen.add(id);
                collected.push({
                    ...item,
                    event_id: resolvedId,
                    event_name: competitionName,
                    match_type: matchType,
                });
            }
        };

        const errors: string[] = [];

        try {
            try {
                const res = await searchMediaByBib(apiAccessToken, { event_id: resolvedId, bib: bibValue });
                const results = Array.isArray(res?.results) ? res.results : [];
                addResults(results, 'bib');
            } catch (e: any) {
                const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
                errors.push(`Chest number: ${msg}`);
            }

            try {
                const res = await searchFaceByEnrollment(apiAccessToken, {
                    event_ids: [resolvedId],
                    label: 'default',
                    limit: 600,
                    top: 100,
                });
                const results = Array.isArray(res?.results) ? res.results : [];
                addResults(results, 'face');
            } catch (e: any) {
                if (e instanceof ApiError) {
                    const body = e.body ?? {};
                    if (e.status === 403 && String(e.message).toLowerCase().includes('consent')) {
                        setQuickNeedsConsent(true);
                        errors.push('Face: consent required.');
                    } else if (e.status === 400 && Array.isArray(body?.missing_angles)) {
                        setQuickMissingAngles(body.missing_angles.map(String));
                        errors.push('Face: enrollment required.');
                    } else {
                        errors.push(`Face: ${e.message}`);
                    }
                } else {
                    errors.push(`Face: ${String(e?.message ?? e)}`);
                }
            }

            if (collected.length === 0) {
                setQuickSearchError(errors[0] ?? 'No matches found.');
                return;
            }

            setAiCompareModalVisible(false);
            navigation.navigate('AISearchResultsScreen', {
                matchedCount: collected.length,
                results: collected,
                matchType: 'combined',
            });
        } finally {
            setQuickSearchLoading(false);
        }
    }, [apiAccessToken, competitionName, quickChestNumber, navigation, resolveEventId]);

    const handleGrantConsent = useCallback(async () => {
        if (!apiAccessToken) return;
        setQuickSearchError(null);
        try {
            await grantFaceRecognitionConsent(apiAccessToken);
            setQuickNeedsConsent(false);
        } catch (e: any) {
            const msg = e instanceof ApiError ? e.message : String(e?.message ?? e);
            setQuickSearchError(msg);
        }
    }, [apiAccessToken]);

    const handleEnroll = useCallback(() => {
        setAiCompareModalVisible(false);
        navigation.navigate('SearchFaceCaptureScreen', {
            mode: 'enrolFace',
            afterEnroll: { screen: 'AISearchScreen' },
        });
    }, [navigation]);

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={Colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Competitions</Text>
                <View style={{ width: 44, height: 44 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Competition Info */}
                <Text style={styles.competitionName}>{competitionName}</Text>
                <SizeBox height={4} />
                <Text style={styles.competitionDescription}>{competitionDescription}</Text>

                <SizeBox height={20} />

                {competitionType === 'marathon' ? (
                    <>
                        <Text style={styles.sectionTitle}>Courses</Text>
                        <SizeBox height={12} />
                        <View style={styles.courseList}>
                            {visibleCourses.map((course) => {
                                const isActive = course.id === selectedCourse?.id;
                                return (
                                    <TouchableOpacity
                                        key={course.id}
                                        style={[styles.courseCard, isActive && styles.courseCardActive]}
                                        onPress={() => setSelectedCourseId(course.id)}
                                    >
                                        <Text style={[styles.courseTitle, isActive && styles.courseTitleActive]}>{course.label}</Text>
                                        <Text style={[styles.courseDescription, isActive && styles.courseDescriptionActive]}>{course.description}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <SizeBox height={20} />

                        <Text style={styles.sectionTitle}>Course Map</Text>
                        <SizeBox height={12} />
                        <View style={styles.mapCard}>
                            <Image
                                source={selectedCourse?.imageUrl ? { uri: selectedCourse.imageUrl } : Images.map}
                                style={styles.mapImage}
                                resizeMode="cover"
                            />
                        </View>
                        {mapError && (
                            <>
                                <SizeBox height={8} />
                                <Text style={styles.helperText}>Map data unavailable. Showing placeholder map.</Text>
                            </>
                        )}

                        <SizeBox height={16} />

                        <Text style={styles.sectionTitle}>Checkpoints</Text>
                        <SizeBox height={10} />
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {selectedCourse?.checkpoints.map((checkpoint) => (
                                <TouchableOpacity
                                    key={checkpoint.id}
                                    style={styles.checkpointChip}
                                    onPress={() => handleCheckpointPress(checkpoint)}
                                >
                                    <Text style={styles.checkpointChipText}>{checkpoint.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <SizeBox height={8} />
                        <Text style={styles.helperText}>Tap a checkpoint to search photos, videos, or AI.</Text>

                        <SizeBox height={insets.bottom > 0 ? insets.bottom + 80 : 100} />
                    </>
                ) : (
                    <>
                        {/* Tabs */}
                        <View style={styles.tabsContainer}>
                            <TouchableOpacity
                                style={[styles.tab, selectedTab === 'track' && styles.tabActive]}
                                onPress={() => setSelectedTab('track')}
                            >
                                <Text style={[styles.tabText, selectedTab === 'track' && styles.tabTextActive]}>
                                    Track Events
                                </Text>
                                <ArrowRight
                                    size={16}
                                    color={selectedTab === 'track' ? Colors.mainTextColor : '#9B9F9F'}
                                    variant="Linear"
                                />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.tab, selectedTab === 'field' && styles.tabActive]}
                                onPress={() => setSelectedTab('field')}
                            >
                                <Text style={[styles.tabText, selectedTab === 'field' && styles.tabTextActive]}>
                                    Field Events
                                </Text>
                                <ArrowRight
                                    size={16}
                                    color={selectedTab === 'field' ? Colors.mainTextColor : '#9B9F9F'}
                                    variant="Linear"
                                />
                            </TouchableOpacity>
                        </View>

                        <SizeBox height={20} />

                        <View style={styles.toggleRow}>
                            <View>
                                <Text style={styles.toggleLabel}>Relevant</Text>
                                <Text style={styles.toggleHint}>Show events where we found you</Text>
                            </View>
                            <Switch
                                value={showRelevantOnly}
                                onValueChange={setShowRelevantOnly}
                                trackColor={{ false: '#E5E7EB', true: '#2563EB' }}
                                thumbColor={showRelevantOnly ? '#FFFFFF' : '#FFFFFF'}
                            />
                        </View>

                        <SizeBox height={16} />

                        {/* Videos Section */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Videos</Text>
                            <View style={styles.sectionIcons}>
                            <TouchableOpacity
                                style={styles.sectionIconButton}
                                onPress={() => {
                                    setQuickSearchError(null);
                                    setQuickNeedsConsent(false);
                                    setQuickMissingAngles(null);
                                    setAiCompareModalVisible(true);
                                }}
                            >
                                <Icons.AiWhiteBordered width={20} height={20} />
                            </TouchableOpacity>
                            </View>
                        </View>

                        <SizeBox height={16} />

                        {/* Event Categories */}
                        {filteredEvents.length > 0 ? filteredEvents.map(renderEventCard) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateText}>No events match this filter yet.</Text>
                            </View>
                        )}

                        <SizeBox height={16} />

                        {/* Show All Videos Button */}
                        <TouchableOpacity
                            style={styles.showAllButton}
                            onPress={() => navigation.navigate('AllVideosOfEvents', { eventName: competitionName })}
                        >
                            <Text style={styles.showAllButtonText}>Show All Videos</Text>
                            <ArrowRight size={18} color={Colors.whiteColor} variant="Linear" />
                        </TouchableOpacity>

                        <SizeBox height={24} />

                        {/* Photos Section */}
                        <Text style={styles.sectionTitle}>Photos</Text>

                        <SizeBox height={16} />

                        {/* Show All Photos Button */}
                        <TouchableOpacity
                            style={styles.showAllPhotosButton}
                            onPress={() => navigation.navigate('AllPhotosOfEvents', { eventName: competitionName })}
                        >
                            <Text style={styles.showAllPhotosButtonText}>Show All Photos</Text>
                            <ArrowRight size={18} color={Colors.primaryColor} variant="Linear" />
                        </TouchableOpacity>

                        <SizeBox height={insets.bottom > 0 ? insets.bottom + 100 : 120} />
                    </>
                )}
            </ScrollView>

            <Modal
                visible={checkpointModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setCheckpointModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setCheckpointModalVisible(false)}
                >
                    <TouchableOpacity style={styles.checkpointModal} activeOpacity={1}>
                        <Text style={styles.modalTitle}>Search {selectedCheckpoint?.label}</Text>
                        <SizeBox height={16} />
                        <TouchableOpacity
                            style={styles.modalPrimaryButton}
                            onPress={() => {
                                setCheckpointModalVisible(false);
                                navigation.navigate('AllPhotosOfEvents', { checkpoint: selectedCheckpoint });
                            }}
                        >
                            <Text style={styles.modalPrimaryButtonText}>Search Photos</Text>
                            <ArrowRight size={18} color={Colors.whiteColor} variant="Linear" />
                        </TouchableOpacity>
                        <SizeBox height={12} />
                        <TouchableOpacity
                            style={styles.modalSecondaryButton}
                            onPress={() => {
                                setCheckpointModalVisible(false);
                                navigation.navigate('VideosForEvent', { eventName: selectedCheckpoint?.label });
                            }}
                        >
                            <Text style={styles.modalSecondaryButtonText}>Search Videos</Text>
                            <ArrowRight size={18} color={Colors.primaryColor} variant="Linear" />
                        </TouchableOpacity>
                        <SizeBox height={12} />
                        <TouchableOpacity
                            style={styles.modalTertiaryButton}
                            onPress={() => {
                                setCheckpointModalVisible(false);
                                setQuickSearchError(null);
                                setQuickNeedsConsent(false);
                                setQuickMissingAngles(null);
                                setAiCompareModalVisible(true);
                            }}
                        >
                            <Text style={styles.modalTertiaryButtonText}>AI Search</Text>
                            <ArrowRight size={18} color={Colors.primaryColor} variant="Linear" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            <Modal
                visible={aiCompareModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setAiCompareModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setAiCompareModalVisible(false)}
                >
                    <TouchableOpacity style={styles.checkpointModal} activeOpacity={1}>
                        <Text style={styles.modalTitle}>AI quick compare</Text>
                        <SizeBox height={12} />
                        <Text style={styles.helperText}>
                            We will compare your saved face and chest number to find results in this competition.
                        </Text>
                        <SizeBox height={16} />
                        <Text style={styles.modalLabel}>Chest number</Text>
                        <View style={styles.modalInputRow}>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="e.g. 1234"
                                placeholderTextColor="#9B9F9F"
                                keyboardType="number-pad"
                                value={quickChestNumber}
                                onChangeText={setQuickChestNumber}
                            />
                        </View>
                        {quickSearchError ? (
                            <>
                                <SizeBox height={10} />
                                <Text style={styles.modalErrorText}>{quickSearchError}</Text>
                            </>
                        ) : null}
                        {quickNeedsConsent && (
                            <>
                                <SizeBox height={10} />
                                <TouchableOpacity style={styles.modalSecondaryButton} onPress={handleGrantConsent}>
                                    <Text style={styles.modalSecondaryButtonText}>Grant face consent</Text>
                                </TouchableOpacity>
                            </>
                        )}
                        {quickMissingAngles && (
                            <>
                                <SizeBox height={10} />
                                <TouchableOpacity style={styles.modalSecondaryButton} onPress={handleEnroll}>
                                    <Text style={styles.modalSecondaryButtonText}>Enroll your face</Text>
                                </TouchableOpacity>
                            </>
                        )}
                        <SizeBox height={16} />
                        <TouchableOpacity
                            style={[styles.modalPrimaryButton, quickSearchLoading && styles.modalPrimaryButtonDisabled]}
                            onPress={runQuickCompare}
                            disabled={quickSearchLoading}
                        >
                            {quickSearchLoading ? (
                                <ActivityIndicator color={Colors.whiteColor} />
                            ) : (
                                <>
                                    <Text style={styles.modalPrimaryButtonText}>Compare now</Text>
                                    <ArrowRight size={18} color={Colors.whiteColor} variant="Linear" />
                                </>
                            )}
                        </TouchableOpacity>
                        <SizeBox height={12} />
                        <TouchableOpacity
                            style={styles.modalSecondaryButton}
                            onPress={() => setAiCompareModalVisible(false)}
                        >
                            <Text style={styles.modalSecondaryButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

export default CompetitionDetailsScreen
