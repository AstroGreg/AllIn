import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable, Alert } from 'react-native'
import React, { useCallback, useMemo, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowLeft2, Ghost, Trash } from 'iconsax-react-nativejs'
import { createStyles } from './CompetitionDetailsStyles'
import SizeBox from '../../constants/SizeBox'
import { useTheme } from '../../context/ThemeContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'

interface EventCategory {
    id: number;
    name: string;
}

const CompetitionDetailsScreen = ({ navigation, route }: any) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const competition = route?.params?.competition;
    const account = route?.params?.account;
    const anonymous = route?.params?.anonymous;
    const competitionType: 'track' | 'road' = route?.params?.competitionType ?? 'track';

    const [activeTab, setActiveTab] = useState<'track' | 'field'>('track');
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<EventCategory | null>(null);
    const [selectedGender, setSelectedGender] = useState<'Men' | 'Women' | null>(null);
    const [selectedDivision, setSelectedDivision] = useState<string | null>(null);
    const [uploadCounts, setUploadCounts] = useState<Record<string, { photos: number; videos: number }>>({});

    const trackEvents: EventCategory[] = [
        { id: 1, name: '200 Meters' },
        { id: 2, name: '400 Meters' },
        { id: 3, name: '800 Meters' },
        { id: 4, name: '5000 Meters' },
    ];

    const fieldEvents: EventCategory[] = [
        { id: 5, name: 'Long Jump' },
        { id: 6, name: 'High Jump' },
        { id: 7, name: 'Shot Put' },
        { id: 8, name: 'Discus Throw' },
    ];

    const roadCourses: EventCategory[] = [
        { id: 9, name: '5 km checkpoint' },
        { id: 10, name: '10 km checkpoint' },
        { id: 11, name: '15 km checkpoint' },
        { id: 12, name: 'Finish line' },
    ];

    const divisions = [
        'Pupil',
        'Miniem',
        'Cadet',
        'Scholier',
        'Junior',
        'Beloften',
        'Seniors',
        'Masters',
    ];

    const activeEvents = useMemo(() => {
        if (competitionType === 'road') return roadCourses;
        return activeTab === 'track' ? trackEvents : fieldEvents;
    }, [activeTab, competitionType, fieldEvents, roadCourses, trackEvents]);

    const formatDate = useCallback((value?: string) => {
        if (!value) return 'Date';
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return value;
        const day = String(parsed.getDate()).padStart(2, '0');
        const month = String(parsed.getMonth() + 1).padStart(2, '0');
        const year = parsed.getFullYear();
        return `${day}/${month}/${year}`;
    }, []);

    const competitionId = useMemo(
        () => String(competition?.id || competition?.event_id || competition?.eventId || 'competition'),
        [competition?.event_id, competition?.eventId, competition?.id],
    );

    const loadCounts = useCallback(async () => {
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
                        const t = String((asset as any)?.type || '').toLowerCase();
                        if (t.includes('video')) videos += 1;
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
        setSelectedEvent(category);
        setSelectedGender(null);
        setSelectedDivision(null);
        setCategoryModalVisible(true);
    };

    const handleContinue = () => {
        if (!selectedEvent || !selectedGender || !selectedDivision) return;
        navigation.navigate('UploadDetailsScreen', {
            competition,
            category: selectedEvent,
            gender: selectedGender,
            division: selectedDivision,
            account,
            anonymous,
            competitionType,
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
        >
            <View style={Styles.eventText}>
                <Text style={Styles.eventName}>{category.name}</Text>
                <Text style={[Styles.eventMeta, hasUploads && Styles.eventMetaActive]}>{countLabel}</Text>
            </View>
        </TouchableOpacity>
        );
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{competition?.name || t('BK Studenten 2023')}</Text>
                <TouchableOpacity
                    style={Styles.headerButton}
                    onPress={() => {
                        Alert.alert(
                            'Reset upload draft?',
                            'This will clear selected files for this competition on this device.',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Reset',
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
                    <Text style={Styles.infoTitle}>{competition?.name || t('Competition')}</Text>
                    <Text style={Styles.infoSub}>
                        {competition?.location || 'Location'} • {formatDate(competition?.date)}
                    </Text>
                </View>

                <SizeBox height={20} />

                {competitionType === 'track' && (
                    <>
                        <View style={Styles.toggleContainer}>
                            <TouchableOpacity
                                style={[Styles.toggleTab, activeTab === 'track' && Styles.toggleTabActive]}
                                onPress={() => setActiveTab('track')}
                            >
                                <Text style={[Styles.toggleTabText, activeTab === 'track' && Styles.toggleTabTextActive]}>
                                    Track Events
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[Styles.toggleTab, activeTab === 'field' && Styles.toggleTabActive]}
                                onPress={() => setActiveTab('field')}
                            >
                                <Text style={[Styles.toggleTabText, activeTab === 'field' && Styles.toggleTabTextActive]}>
                                    Field Events
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <SizeBox height={20} />
                    </>
                )}

                <Text style={Styles.sectionTitle}>
                    {competitionType === 'road' ? 'Choose a checkpoint' : 'Events'}
                </Text>
                <SizeBox height={16} />

                {activeEvents.map(renderEventCard)}

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
                                {divisions.map((division) => {
                                    const active = selectedDivision === division;
                                    return (
                                        <TouchableOpacity
                                            key={division}
                                            style={[Styles.choiceChip, active && Styles.choiceChipActive]}
                                            onPress={() => setSelectedDivision(division)}
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
