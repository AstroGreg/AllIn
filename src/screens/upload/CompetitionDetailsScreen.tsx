import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable, Alert, ActivityIndicator } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowLeft2, Ghost, Trash } from 'iconsax-react-nativejs'
import { createStyles } from './CompetitionDetailsStyles'
import SizeBox from '../../constants/SizeBox'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import FastImage from 'react-native-fast-image'
import { ApiError, CompetitionMapSummary, getCompetitionMaps, getEventCompetitions } from '../../services/apiGateway'
import { getApiBaseUrl } from '../../constants/RuntimeConfig'
import { getSportFocusLabel, normalizeFocusId, type SportFocusId } from '../../utils/profileSelections'

interface EventCategory {
    id: string;
    name: string;
    kind: 'track' | 'field' | 'road';
    group?: string | null;
}

interface RoadCourseMap {
    id: string;
    label: string;
    imageUrl: string | null;
    disciplineId: string | null;
    checkpoints: Array<{
        id: string;
        label: string;
        checkpointIndex: number;
    }>;
}

const DIVISIONS = [
    'Pupil',
    'Miniem',
    'Cadet',
    'Scholier',
    'Junior',
    'Beloften',
    'Seniors',
    'Masters',
];

const FIELD_DISCIPLINE_PATTERN = /jump|throw|put|vault|discus|javelin|hammer/i;
const ROAD_DISCIPLINE_PATTERN = /road|trail|cross|veldloop|checkpoint|finish|start|\b\d+\s?km\b/i;
const GENERIC_DISCIPLINE_NAMES = new Set([
    'track field',
    'track&field',
    'road trail',
    'road&trail',
    'event',
    'competition',
]);

const CompetitionDetailsScreen = ({ navigation, route }: any) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { apiAccessToken } = useAuth();
    const Styles = createStyles(colors);
    const competition = route?.params?.competition;
    const account = route?.params?.account;
    const anonymous = route?.params?.anonymous;
    const competitionType: 'track' | 'road' = route?.params?.competitionType ?? 'track';
    const [competitionFocusId, setCompetitionFocusId] = useState<SportFocusId | null>(
        normalizeFocusId(
            competition?.competition_focus
            ?? competition?.competition_type
            ?? route?.params?.competitionFocus
            ?? route?.params?.competitionType,
        ),
    );

    const [activeTab, setActiveTab] = useState<'track' | 'field'>('track');
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<EventCategory | null>(null);
    const [selectedGender, setSelectedGender] = useState<'Men' | 'Women' | null>(null);
    const [selectedDivision, setSelectedDivision] = useState<string | null>(null);
    const [uploadCounts, setUploadCounts] = useState<Record<string, { photos: number; videos: number }>>({});
    const [trackEvents, setTrackEvents] = useState<EventCategory[]>([]);
    const [fieldEvents, setFieldEvents] = useState<EventCategory[]>([]);
    const [roadEvents, setRoadEvents] = useState<EventCategory[]>([]);
    const [isLoadingDisciplines, setIsLoadingDisciplines] = useState(false);
    const [disciplinesError, setDisciplinesError] = useState<string | null>(null);
    const [roadCourseMaps, setRoadCourseMaps] = useState<RoadCourseMap[]>([]);
    const [selectedRoadCourseMapId, setSelectedRoadCourseMapId] = useState<string>('');
    const [isLoadingRoadCourseMaps, setIsLoadingRoadCourseMaps] = useState(false);

    const competitionId = useMemo(
        () => String(competition?.id || competition?.event_id || competition?.eventId || '').trim(),
        [competition?.event_id, competition?.eventId, competition?.id],
    );

    const isSignedUrl = useCallback((value?: string | null) => {
        if (!value) return false;
        const lower = String(value).toLowerCase();
        return (
            lower.includes('x-amz-signature') ||
            lower.includes('x-amz-credential') ||
            lower.includes('x-amz-security-token') ||
            lower.includes('signature=') ||
            lower.includes('sig=') ||
            lower.includes('token=') ||
            lower.includes('expires=') ||
            lower.includes('sv=') ||
            lower.includes('se=') ||
            lower.includes('sp=')
        );
    }, []);

    const withAccessToken = useCallback((value?: string | null) => {
        if (!value) return null;
        if (!apiAccessToken) return String(value);
        if (isSignedUrl(value)) return String(value);
        if (String(value).includes('access_token=')) return String(value);
        const sep = String(value).includes('?') ? '&' : '?';
        return `${String(value)}${sep}access_token=${encodeURIComponent(apiAccessToken)}`;
    }, [apiAccessToken, isSignedUrl]);

    const toAbsoluteUrl = useCallback((value?: string | null) => {
        if (!value) return null;
        const raw = String(value);
        if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
        const base = getApiBaseUrl();
        if (!base) return raw;
        return `${base.replace(/\/$/, '')}/${raw.replace(/^\//, '')}`;
    }, []);

    const formatDate = useCallback((value?: string) => {
        if (!value) return '';
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return value;
        const day = String(parsed.getDate()).padStart(2, '0');
        const month = String(parsed.getMonth() + 1).padStart(2, '0');
        const year = parsed.getFullYear();
        return `${day}/${month}/${year}`;
    }, []);

    const isRoadFocus = competitionFocusId === 'road-events' || competitionType === 'road';
    const isTrackFieldFocus = competitionFocusId === 'track-field' || (!competitionFocusId && competitionType === 'track');
    const competitionTypeLabel = useMemo(
        () => (competitionFocusId ? getSportFocusLabel(competitionFocusId, t) : (isRoadFocus ? t('roadAndTrail') : t('trackAndField'))),
        [competitionFocusId, isRoadFocus, t],
    );
    const competitionMetaLine = useMemo(() => {
        const parts = [
            competitionTypeLabel,
            String(competition?.location || '').trim(),
            formatDate(competition?.date),
        ].filter((part) => {
            const value = String(part || '').trim();
            return value.length > 0 && value !== '-' && value !== '—';
        });
        return parts.join(' • ');
    }, [competition?.date, competition?.location, competitionTypeLabel, formatDate]);
    const organizingClub = useMemo(
        () => String(competition?.organizingClub || competition?.organizing_club || '').trim(),
        [competition?.organizingClub, competition?.organizing_club],
    );

    const classifyDiscipline = useCallback((name: string, typeToken: string, groupToken: string, focusId: SportFocusId | null): EventCategory['kind'] => {
        const normalizedName = name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
        const normalizedType = String(typeToken || '').toLowerCase();
        const normalizedGroup = String(groupToken || '').toLowerCase();
        if (focusId === 'road-events') {
            return 'road';
        }
        if (focusId && focusId !== 'track-field') {
            return 'track';
        }
        if (
            ROAD_DISCIPLINE_PATTERN.test(normalizedType)
            || ROAD_DISCIPLINE_PATTERN.test(normalizedName)
            || normalizedGroup === 'road'
            || normalizedGroup === 'trail'
            || competitionType === 'road'
        ) {
            return 'road';
        }
        if (/field/.test(normalizedType) || FIELD_DISCIPLINE_PATTERN.test(normalizedName) || normalizedGroup === 'jumps' || normalizedGroup === 'throws') {
            return 'field';
        }
        return 'track';
    }, [competitionType]);

    const normalizeCheckpointLabel = useCallback((value?: string | null) => {
        return String(value || '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, ' ')
            .trim();
    }, []);

    useEffect(() => {
        if (!apiAccessToken || !competitionId) {
            setTrackEvents([]);
            setFieldEvents([]);
            setRoadEvents([]);
            setIsLoadingDisciplines(false);
            setDisciplinesError(null);
            return;
        }

        let isActive = true;
        const loadDisciplines = async () => {
            setIsLoadingDisciplines(true);
            setDisciplinesError(null);
            try {
                const res = await getEventCompetitions(apiAccessToken, competitionId);
                if (!isActive) return;
                const rows = Array.isArray(res?.competitions) ? res.competitions : [];
                const resolvedFocus = normalizeFocusId(rows[0]?.competition_focus ?? competitionFocusId ?? competitionType);
                setCompetitionFocusId(resolvedFocus);
                const seenIds = new Set<string>();
                const seenNames = new Set<string>();
                const normalizedRows: EventCategory[] = [];

                for (const row of rows) {
                    const id = String(row?.id || '').trim();
                    const rawName = String(row?.competition_name || row?.competition_name_normalized || '').trim();
                    const typeToken = String(row?.competition_type || '').trim();
                    const groupToken = String(row?.discipline_group || '').trim();
                    if (!id || !rawName || seenIds.has(id)) continue;
                    seenIds.add(id);
                    const normalizedName = rawName.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
                    if (seenNames.has(normalizedName)) continue;
                    seenNames.add(normalizedName);
                    normalizedRows.push({
                        id,
                        name: rawName,
                        kind: classifyDiscipline(rawName, typeToken, groupToken, resolvedFocus),
                        group: row?.discipline_group ?? null,
                    });
                }

                const withoutGeneric = normalizedRows.filter((item) => {
                    const normalizedName = item.name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
                    return !GENERIC_DISCIPLINE_NAMES.has(normalizedName);
                });
                const events = withoutGeneric.length > 0 ? withoutGeneric : normalizedRows;

                if (resolvedFocus === 'road-events' || competitionType === 'road') {
                    const roadOnly = events.filter((item) => item.kind === 'road');
                    setRoadEvents(roadOnly.length > 0 ? roadOnly : events);
                    setTrackEvents([]);
                    setFieldEvents([]);
                } else if (resolvedFocus && resolvedFocus !== 'track-field') {
                    setTrackEvents(events);
                    setFieldEvents([]);
                    setRoadEvents([]);
                } else {
                    const field = events.filter((item) => item.kind === 'field');
                    const track = events.filter((item) => item.kind !== 'field');
                    setTrackEvents(track);
                    setFieldEvents(field);
                    setRoadEvents([]);
                }
            } catch (error: any) {
                if (!isActive) return;
                const message = error instanceof ApiError ? error.message : String(error?.message || error);
                setDisciplinesError(message);
                setTrackEvents([]);
                setFieldEvents([]);
                setRoadEvents([]);
            } finally {
                if (isActive) setIsLoadingDisciplines(false);
            }
        };

        loadDisciplines();
        return () => {
            isActive = false;
        };
    }, [apiAccessToken, classifyDiscipline, competitionFocusId, competitionId, competitionType]);

    useEffect(() => {
        if (!apiAccessToken || !competitionId || !isRoadFocus) {
            setRoadCourseMaps([]);
            setSelectedRoadCourseMapId('');
            setIsLoadingRoadCourseMaps(false);
            return;
        }
        let active = true;
        const loadRoadMaps = async () => {
            setIsLoadingRoadCourseMaps(true);
            try {
                const res = await getCompetitionMaps(apiAccessToken, {
                    event_id: competitionId,
                    include_checkpoints: true,
                });
                if (!active) return;
                const maps = (Array.isArray(res?.maps) ? res.maps : []).map((map: CompetitionMapSummary) => {
                    const url = map.image_url ?? map.storage_key ?? null;
                    return {
                        id: String(map.id),
                        label: String(map.name || t('Course map')),
                        imageUrl: withAccessToken(toAbsoluteUrl(url)),
                        disciplineId: map.competition_id ? String(map.competition_id) : null,
                        checkpoints: Array.isArray(map.checkpoints)
                            ? map.checkpoints.map((cp) => ({
                                id: String(cp.id),
                                label: String(cp.label || `Checkpoint ${Number(cp.checkpoint_index ?? 0) + 1}`),
                                checkpointIndex: Number(cp.checkpoint_index ?? 0),
                            }))
                            : [],
                    } as RoadCourseMap;
                });
                setRoadCourseMaps(maps);
                setSelectedRoadCourseMapId((prev) => (
                    maps.some((item) => item.id === prev) ? prev : (maps[0]?.id || '')
                ));
            } catch {
                if (!active) return;
                setRoadCourseMaps([]);
                setSelectedRoadCourseMapId('');
            } finally {
                if (active) setIsLoadingRoadCourseMaps(false);
            }
        };
        loadRoadMaps();
        return () => {
            active = false;
        };
    }, [apiAccessToken, competitionId, isRoadFocus, t, toAbsoluteUrl, withAccessToken]);

    const activeEvents = useMemo(() => {
        if (isRoadFocus) return roadEvents;
        if (!isTrackFieldFocus) return trackEvents;
        return activeTab === 'track' ? trackEvents : fieldEvents;
    }, [activeTab, fieldEvents, isRoadFocus, isTrackFieldFocus, roadEvents, trackEvents]);

    const selectedRoadCourseMap = useMemo(() => {
        if (roadCourseMaps.length === 0) return null;
        return roadCourseMaps.find((map) => map.id === selectedRoadCourseMapId) ?? roadCourseMaps[0];
    }, [roadCourseMaps, selectedRoadCourseMapId]);

    const loadCounts = useCallback(async () => {
        if (!competitionId) {
            setUploadCounts({});
            return;
        }
        try {
            // Use the current upload draft (assets selected) instead of persisting "uploaded counts" forever.
            const assetsRaw = await AsyncStorage.getItem(`@upload_assets_${competitionId}`);
            const parsed = assetsRaw ? JSON.parse(assetsRaw) : {};
            const counts: Record<string, { photos: number; videos: number }> = {};
            if (parsed && typeof parsed === 'object') {
                for (const [name, list] of Object.entries(parsed)) {
                    const arr = Array.isArray(list) ? list : [];
                    let photos = 0;
                    let videos = 0;
                    for (const asset of arr as any[]) {
                        const mediaType = String((asset as any)?.type || '').toLowerCase();
                        if (mediaType.includes('video')) videos += 1;
                        else photos += 1;
                    }
                    if (photos + videos > 0) {
                        counts[String(name)] = { photos, videos };
                    }
                }
            }
            setUploadCounts(counts);
        } catch {
            setUploadCounts({});
        }
    }, [competitionId]);

    useFocusEffect(
        useCallback(() => {
            loadCounts();
        }, [loadCounts]),
    );

    const openCategoryModal = (category: EventCategory) => {
        if (isRoadFocus) {
            const matchedMap = roadCourseMaps.find((map) => map.disciplineId === category.id);
            if (matchedMap) {
                setSelectedRoadCourseMapId(matchedMap.id);
            }
        }
        setSelectedEvent(category);
        setSelectedGender(null);
        setSelectedDivision(null);
        setCategoryModalVisible(true);
    };

    const handleContinue = () => {
        if (!selectedEvent || !selectedGender || !selectedDivision) return;
        const selectedMap = isRoadFocus ? selectedRoadCourseMap : null;
        const selectedEventNameNormalized = normalizeCheckpointLabel(selectedEvent?.name);
        const selectedCheckpoint = (() => {
            if (!selectedMap || !Array.isArray(selectedMap.checkpoints) || selectedMap.checkpoints.length === 0) {
                return null;
            }
            const checkpoints = selectedMap.checkpoints;
            const exact = checkpoints.find((cp) => normalizeCheckpointLabel(cp.label) === selectedEventNameNormalized);
            if (exact) return exact;

            const includesMatch = checkpoints.find((cp) => {
                const cpNorm = normalizeCheckpointLabel(cp.label);
                return (
                    cpNorm.includes(selectedEventNameNormalized) ||
                    selectedEventNameNormalized.includes(cpNorm)
                );
            });
            if (includesMatch) return includesMatch;

            if (/\bstart\b/i.test(selectedEvent?.name || '')) {
                const startMatch = checkpoints.find((cp) => /\bstart\b/i.test(cp.label || ''));
                if (startMatch) return startMatch;
            }
            if (/\bfinish\b/i.test(selectedEvent?.name || '')) {
                const finishMatch = checkpoints.find((cp) => /\bfinish\b/i.test(cp.label || ''));
                if (finishMatch) return finishMatch;
            }
            const kmMatch = String(selectedEvent?.name || '').match(/(\d+(?:[.,]\d+)?)\s*km/i);
            if (kmMatch?.[1]) {
                const kmValue = kmMatch[1].replace(',', '.');
                const byKm = checkpoints.find((cp) => new RegExp(`\\b${kmValue}\\s*km\\b`, 'i').test(cp.label || ''));
                if (byKm) return byKm;
            }
            return checkpoints[0] ?? null;
        })();

        navigation.navigate('UploadDetailsScreen', {
            competition,
            category: selectedEvent,
            gender: selectedGender,
            division: selectedDivision,
            account,
            anonymous,
            competitionType: isRoadFocus ? 'road' : 'track',
            discipline_id: selectedEvent?.id ?? null,
            competition_map_id: selectedMap?.id ?? null,
            checkpoint_id: selectedCheckpoint?.id ?? null,
            checkpoint_label: selectedCheckpoint?.label ?? null,
            e2eFixtureFiles: Array.isArray(route?.params?.e2eFixtureFiles) ? route.params.e2eFixtureFiles : undefined,
        });
        setCategoryModalVisible(false);
    };

    const renderEventCard = (category: EventCategory) => {
        const counts = uploadCounts[category.name];
        const videos = Number(counts?.videos || 0);
        const photos = Number(counts?.photos || 0);
        const total = videos + photos;
        const parts: string[] = [];
        if (videos > 0) parts.push(`${videos} video${videos === 1 ? '' : 's'}`);
        if (photos > 0) parts.push(`${photos} photo${photos === 1 ? '' : 's'}`);
        const countLabel = total > 0 ? `Selected: ${parts.join(' • ')}` : 'No files selected';
        const hasUploads = total > 0;
        return (
            <TouchableOpacity
                key={category.id}
                style={[Styles.eventCard, hasUploads && Styles.eventCardActive]}
                activeOpacity={0.85}
                onPress={() => openCategoryModal(category)}
                testID={`upload-discipline-card-${category.id}`}
            >
                <View style={Styles.eventText}>
                    <Text style={Styles.eventName}>{category.name}</Text>
                    <Text style={[Styles.eventMeta, hasUploads && Styles.eventMetaActive]}>{countLabel}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={Styles.mainContainer} testID="upload-competition-details-screen">
            <SizeBox height={insets.top} />

            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{competition?.name || t('BK Studenten 2023')}</Text>
                <TouchableOpacity
                    style={Styles.headerButton}
                    onPress={() => {
                        if (!competitionId) return;
                        Alert.alert(
                            t('Reset upload draft?'),
                            t('This will clear selected files for this competition on this device.'),
                            [
                                { text: t('Cancel'), style: 'cancel' },
                                {
                                    text: t('Reset'),
                                    style: 'destructive',
                                    onPress: async () => {
                                        try {
                                            await AsyncStorage.multiRemove([
                                                `@upload_assets_${competitionId}`,
                                                `@upload_counts_${competitionId}`,
                                                `@upload_session_${competitionId}`,
                                                `@upload_activity_${competitionId}`,
                                            ]);
                                        } catch {}
                                        loadCounts();
                                    },
                                },
                            ]
                        );
                    }}
                    activeOpacity={0.8}
                >
                    {anonymous ? (
                        <Ghost size={22} color={colors.primaryColor} variant="Linear" />
                    ) : (
                        <Trash size={20} color={colors.primaryColor} variant="Linear" />
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                <View style={Styles.infoCard}>
                    <Text style={Styles.infoSub}>{competitionMetaLine || competitionTypeLabel}</Text>
                    {organizingClub ? (
                        <Text style={Styles.infoMeta} numberOfLines={1}>{organizingClub}</Text>
                    ) : null}
                </View>

                {isRoadFocus ? (
                    <>
                        <SizeBox height={12} />
                        <View style={Styles.mapCard}>
                            {isLoadingRoadCourseMaps ? (
                                <View style={Styles.disciplineLoadingState}>
                                    <ActivityIndicator color={colors.primaryColor} />
                                    <SizeBox height={8} />
                                    <Text style={Styles.disciplineLoadingText}>{t('Loading course maps...')}</Text>
                                </View>
                            ) : selectedRoadCourseMap?.imageUrl ? (
                                <>
                                    <FastImage source={{ uri: selectedRoadCourseMap.imageUrl }} style={Styles.mapImage} resizeMode="cover" />
                                    <View style={Styles.mapOverlay}>
                                        <Text style={Styles.mapTitle}>{selectedRoadCourseMap.label || t('Course map')}</Text>
                                    </View>
                                </>
                            ) : (
                                <View style={Styles.disciplineEmptyState}>
                                    <Text style={Styles.disciplineEmptyTitle}>{t('No map uploaded for this course yet.')}</Text>
                                </View>
                            )}
                        </View>
                    </>
                ) : null}

                <SizeBox height={20} />

                {isTrackFieldFocus && (
                    <>
                        <View style={Styles.toggleContainer}>
                            <TouchableOpacity
                                style={[Styles.toggleTab, activeTab === 'track' && Styles.toggleTabActive]}
                                onPress={() => setActiveTab('track')}
                            >
                                <Text style={[Styles.toggleTabText, activeTab === 'track' && Styles.toggleTabTextActive]}>
                                    {t('Track events')}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[Styles.toggleTab, activeTab === 'field' && Styles.toggleTabActive]}
                                onPress={() => setActiveTab('field')}
                            >
                                <Text style={[Styles.toggleTabText, activeTab === 'field' && Styles.toggleTabTextActive]}>
                                    {t('Field events')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <SizeBox height={20} />
                    </>
                )}

                <Text style={Styles.sectionTitle}>
                    {isRoadFocus ? t('Choose a checkpoint') : t('Disciplines')}
                </Text>
                <SizeBox height={16} />

                {isLoadingDisciplines ? (
                    <View style={Styles.disciplineLoadingState}>
                        <ActivityIndicator color={colors.primaryColor} />
                        <SizeBox height={8} />
                        <Text style={Styles.disciplineLoadingText}>{t('Loading disciplines...')}</Text>
                    </View>
                ) : activeEvents.length > 0 ? (
                    activeEvents.map(renderEventCard)
                ) : (
                    <View style={Styles.disciplineEmptyState}>
                        <Text style={Styles.disciplineEmptyTitle}>{t('No disciplines configured for this competition yet.')}</Text>
                        {disciplinesError ? (
                            <>
                                <SizeBox height={6} />
                                <Text style={Styles.disciplineEmptySubtitle}>{disciplinesError}</Text>
                            </>
                        ) : null}
                    </View>
                )}

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>

            <Modal visible={categoryModalVisible} transparent animationType="fade" onRequestClose={() => setCategoryModalVisible(false)}>
                <Pressable style={Styles.modalBackdrop} onPress={() => setCategoryModalVisible(false)}>
                    <Pressable style={Styles.modalCard} onPress={() => {}}>
                        <Text style={Styles.modalTitle}>{t('Select category')}</Text>
                        <Text style={Styles.modalSubtitle}>{selectedEvent?.name ?? t('Event')}</Text>
                        <View style={Styles.modalSection}>
                            <Text style={Styles.modalLabel}>{t('Gender')}</Text>
                            <View style={Styles.choiceRow}>
                                {['Men', 'Women'].map((gender) => {
                                    const active = selectedGender === gender;
                                    return (
                                        <TouchableOpacity
                                            key={gender}
                                            style={[Styles.choiceChip, active && Styles.choiceChipActive]}
                                            onPress={() => setSelectedGender(gender as 'Men' | 'Women')}
                                            testID={`upload-gender-${String(gender).toLowerCase()}`}
                                        >
                                            <Text style={[Styles.choiceChipText, active && Styles.choiceChipTextActive]}>
                                                {gender}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                        <View style={Styles.modalSection}>
                            <Text style={Styles.modalLabel}>{t('Division')}</Text>
                            <View style={Styles.choiceRow}>
                                {DIVISIONS.map((division) => {
                                    const active = selectedDivision === division;
                                    return (
                                        <TouchableOpacity
                                            key={division}
                                            style={[Styles.choiceChip, active && Styles.choiceChipActive]}
                                            onPress={() => setSelectedDivision(division)}
                                            testID={`upload-division-${String(division).toLowerCase()}`}
                                        >
                                            <Text style={[Styles.choiceChipText, active && Styles.choiceChipTextActive]}>
                                                {division}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                        <View style={Styles.modalActions}>
                            <TouchableOpacity style={Styles.modalGhost} onPress={() => setCategoryModalVisible(false)}>
                                <Text style={Styles.modalGhostText}>{t('Cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[Styles.modalPrimary, (!selectedGender || !selectedDivision) && Styles.modalPrimaryDisabled]}
                                disabled={!selectedGender || !selectedDivision}
                                onPress={handleContinue}
                                testID="upload-discipline-continue"
                            >
                                <Text style={Styles.modalPrimaryText}>{t('Continue')}</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
};

export default CompetitionDetailsScreen;
