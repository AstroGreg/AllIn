import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { SearchNormal1, ArrowRight, ArrowLeft, CloseCircle } from 'iconsax-react-nativejs';
import { useTheme } from '../../../context/ThemeContext';
import { useEvents } from '../../../context/EventsContext';
import { AI_GROUPS, AI_PEOPLE } from '../../../constants/AiFilterOptions';
import SizeBox from '../../../constants/SizeBox';
import { createStyles } from './ContextSearchScreenStyles';
import { useRoute } from '@react-navigation/native';

const FILTERS = ['Competition', 'Person', 'Group', 'Location'];

interface FilterChip {
    id: number;
    label: string;
    value: string;
}

const ContextSearchScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const contextInputRef = useRef<TextInput>(null);
    const route = useRoute<any>();
    const filterState = route?.params?.filterState;
    const origin = route?.params?.origin;

    const [contextSearchText, setContextSearchText] = useState('');
    const [activeChips, setActiveChips] = useState<FilterChip[]>([]);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [modalFilterType, setModalFilterType] = useState('');
    const { events } = useEvents();

    useEffect(() => {
        setTimeout(() => contextInputRef.current?.focus(), 300);
    }, []);

    useEffect(() => {
        if (!filterState) return;
        const seeded: FilterChip[] = [];
        if (filterState.location) {
            seeded.push({ id: Date.now() + 1, label: 'Location', value: String(filterState.location) });
        }
        if (filterState.competition) {
            seeded.push({ id: Date.now() + 2, label: 'Competition', value: String(filterState.competition) });
        }
        if (filterState.person) {
            seeded.push({ id: Date.now() + 3, label: 'Person', value: String(filterState.person) });
        }
        if (filterState.group) {
            seeded.push({ id: Date.now() + 4, label: 'Group', value: String(filterState.group) });
        }
        if (seeded.length > 0) {
            setActiveChips((prev) => (prev.length > 0 ? prev : seeded));
        }
    }, [filterState]);

    const handleFilterPress = (filter: string) => {
        setModalFilterType(filter);
        setShowFilterModal(true);
    };

    const handleSelectOption = (label: string, value: string) => {
        const newChip: FilterChip = {
            id: Date.now(),
            label,
            value,
        };
        setActiveChips(prev => [...prev, newChip]);
        setShowFilterModal(false);
    };

    const handleModalClose = () => {
        setShowFilterModal(false);
    };

    const removeChip = (chipId: number) => {
        setActiveChips(prev => prev.filter(chip => chip.id !== chipId));
    };

    const handleStartSearch = () => {
        const hasCompetition = activeChips.some((chip) => chip.label === 'Competition');
        if (!hasCompetition) {
            setModalFilterType('Competition');
            setShowFilterModal(true);
            return;
        }
        if (contextSearchText.trim()) {
            const filters = activeChips.reduce((acc, chip) => {
                acc[chip.label.toLowerCase()] = chip.value;
                return acc;
            }, {} as Record<string, string>);

            navigation.navigate('ContextSearchLoadingScreen', {
                contextSearch: contextSearchText.trim(),
                filters: filters,
                filterState,
            });
        }
    };

    const handleBack = () => {
        const parent = navigation.getParent?.();
        if (origin === 'home' && parent) {
            parent.navigate('Home');
            return;
        }
        if (navigation.canGoBack()) {
            navigation.goBack();
            return;
        }
        if (parent) {
            parent.navigate('Search');
            return;
        }
        navigation.navigate('SearchScreen');
    };

    const filterOptions = useMemo(() => {
        const competitions = events.map((event) => {
            const name = String(event.event_name || event.event_title || 'Competition');
            const date = event.event_date ? new Date(event.event_date).toLocaleDateString() : '';
            const location = event.event_location ? String(event.event_location) : '';
            const sublabel = [date, location].filter(Boolean).join(' • ');
            return { label: name, value: name, sublabel };
        });
        const locations = Array.from(
            new Set([
                ...events.map((event) => String(event.event_location || '').trim()).filter(Boolean),
                ...AI_PEOPLE.map((p) => p.location || '').filter(Boolean),
                ...AI_GROUPS.map((g) => g.location || '').filter(Boolean),
            ])
        ).map((loc) => ({ label: loc, value: loc }));
        const people = AI_PEOPLE.map((p) => ({ label: p.name, value: p.name }));
        const groups = AI_GROUPS.map((g) => ({ label: g.name, value: g.name }));
        return { competitions, locations, people, groups };
    }, [events]);

    return (
        <View style={Styles.container}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity onPress={handleBack} style={Styles.backButton}>
                    <ArrowLeft size={24} color={colors.mainTextColor} />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Context Search</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={Styles.content} showsVerticalScrollIndicator={false}>
                <Text style={Styles.title}>Describe Context</Text>
                <Text style={Styles.subtitle}>
                    Enter keywords or describe what you're looking for
                </Text>
                <SizeBox height={24} />

                {/* Context Search Input */}
                <View style={Styles.inputContainer}>
                    <SearchNormal1 size={20} color={colors.grayColor} variant="Linear" />
                    <SizeBox width={10} />
                    <TextInput
                        ref={contextInputRef}
                        style={Styles.input}
                        placeholder="For example podium, finish line, medal..."
                        placeholderTextColor={colors.grayColor}
                        value={contextSearchText}
                        onChangeText={setContextSearchText}
                        returnKeyType="next"
                        multiline={false}
                    />
                </View>

                <SizeBox height={24} />

                {/* Filter Tabs */}
                <Text style={Styles.filterSectionTitle}>Add Filters (Optional)</Text>
                <SizeBox height={12} />

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={Styles.filterTabsContainer}
                >
                    {FILTERS.map((filter) => {
                        const hasValue = activeChips.some(chip => chip.label === filter);
                        return (
                            <TouchableOpacity
                                key={filter}
                                style={[Styles.filterTab, hasValue && Styles.filterTabActive]}
                                onPress={() => handleFilterPress(filter)}
                            >
                                <Text style={[Styles.filterTabText, hasValue && Styles.filterTabTextActive]}>
                                    {filter}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Active Filter Chips */}
                {activeChips.length > 0 && (
                    <>
                        <SizeBox height={16} />
                        <View style={Styles.activeChipsContainer}>
                            {activeChips.map((chip) => (
                                <TouchableOpacity
                                    key={chip.id}
                                    style={Styles.activeChip}
                                    onPress={() => removeChip(chip.id)}
                                >
                                    <Text style={Styles.activeChipText}>
                                        {chip.label}: {chip.value}
                                    </Text>
                                    <CloseCircle size={16} color="#FFFFFF" variant="Bold" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                )}

                <SizeBox height={40} />

                {/* Start Search Button */}
                <TouchableOpacity
                    onPress={handleStartSearch}
                    disabled={!contextSearchText.trim()}
                    style={{ opacity: contextSearchText.trim() ? 1 : 0.5 }}
                >
                    <LinearGradient
                        colors={['#3B82F6', '#8B5CF6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={Styles.button}
                    >
                        <Text style={Styles.buttonText}>Start Search</Text>
                        <ArrowRight size={20} color="#FFFFFF" variant="Linear" />
                    </LinearGradient>
                </TouchableOpacity>

                <SizeBox height={insets.bottom + 20} />
            </ScrollView>

            {/* Filter Selection Modal */}
            <Modal
                visible={showFilterModal}
                transparent
                animationType="fade"
                onRequestClose={handleModalClose}
            >
                <TouchableOpacity
                    style={Styles.modalOverlay}
                    activeOpacity={1}
                    onPress={handleModalClose}
                >
                    <View style={Styles.modalContainer}>
                        <TouchableOpacity activeOpacity={1}>
                            <Text style={Styles.modalTitle}>{modalFilterType}</Text>
                            <SizeBox height={16} />
                            <ScrollView style={Styles.modalList} contentContainerStyle={Styles.modalListContent}>
                                {(modalFilterType === 'Competition' ? filterOptions.competitions
                                    : modalFilterType === 'Location' ? filterOptions.locations
                                    : modalFilterType === 'Person' ? filterOptions.people
                                    : modalFilterType === 'Group' ? filterOptions.groups
                                    : []).map((option, index) => (
                                    <TouchableOpacity
                                        key={`${option.value}-${index}`}
                                        style={Styles.modalOption}
                                        onPress={() => handleSelectOption(modalFilterType, option.value)}
                                    >
                                        <Text style={Styles.modalOptionText}>{option.label}</Text>
                                        {!!option.sublabel && (
                                            <Text style={Styles.modalOptionSubText}>{option.sublabel}</Text>
                                        )}
                                    </TouchableOpacity>
                                ))}
                                {(modalFilterType === 'Competition' ? filterOptions.competitions
                                    : modalFilterType === 'Location' ? filterOptions.locations
                                    : modalFilterType === 'Person' ? filterOptions.people
                                    : modalFilterType === 'Group' ? filterOptions.groups
                                    : []).length === 0 && (
                                    <Text style={Styles.modalEmpty}>No options available.</Text>
                                )}
                            </ScrollView>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

export default ContextSearchScreen;
