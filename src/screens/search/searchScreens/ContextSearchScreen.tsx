import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { SearchNormal1, ArrowRight, ArrowLeft, CloseCircle } from 'iconsax-react-nativejs';
import { useTheme } from '../../../context/ThemeContext';
import SizeBox from '../../../constants/SizeBox';
import { createStyles } from './ContextSearchScreenStyles';

const FILTERS = ['Location', 'Athlete', 'Competition', 'Photographer'];

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
    const modalInputRef = useRef<TextInput>(null);

    const [contextSearchText, setContextSearchText] = useState('');
    const [activeChips, setActiveChips] = useState<FilterChip[]>([]);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [modalFilterType, setModalFilterType] = useState('');
    const [modalInputValue, setModalInputValue] = useState('');

    useEffect(() => {
        setTimeout(() => contextInputRef.current?.focus(), 300);
    }, []);

    const handleFilterPress = (filter: string) => {
        setModalFilterType(filter);
        setModalInputValue('');
        setShowFilterModal(true);
        setTimeout(() => modalInputRef.current?.focus(), 100);
    };

    const handleModalSubmit = () => {
        if (modalInputValue.trim()) {
            const newChip: FilterChip = {
                id: Date.now(),
                label: modalFilterType,
                value: modalInputValue.trim()
            };
            setActiveChips(prev => [...prev, newChip]);
        }
        setShowFilterModal(false);
        setModalInputValue('');
    };

    const handleModalClose = () => {
        setShowFilterModal(false);
        setModalInputValue('');
    };

    const removeChip = (chipId: number) => {
        setActiveChips(prev => prev.filter(chip => chip.id !== chipId));
    };

    const handleStartSearch = () => {
        if (contextSearchText.trim()) {
            const filters = activeChips.reduce((acc, chip) => {
                acc[chip.label.toLowerCase()] = chip.value;
                return acc;
            }, {} as Record<string, string>);

            navigation.navigate('ContextSearchLoadingScreen', {
                contextSearch: contextSearchText.trim(),
                filters: filters
            });
        }
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const getPlaceholderText = (filterType: string) => {
        switch (filterType) {
            case 'Location':
                return 'Enter location (e.g., Brussels, Gent)';
            case 'Athlete':
                return 'Enter athlete name';
            case 'Competition':
                return 'Enter competition name';
            case 'Photographer':
                return 'Enter photographer name';
            default:
                return `Enter ${filterType}`;
        }
    };

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

            {/* Filter Input Modal */}
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
                            <View style={Styles.modalInputContainer}>
                                <TextInput
                                    ref={modalInputRef}
                                    style={Styles.modalInput}
                                    placeholder={getPlaceholderText(modalFilterType)}
                                    placeholderTextColor={colors.grayColor}
                                    value={modalInputValue}
                                    onChangeText={setModalInputValue}
                                    onSubmitEditing={handleModalSubmit}
                                    returnKeyType="done"
                                />
                            </View>
                            <SizeBox height={20} />
                            <View style={Styles.modalButtonRow}>
                                <TouchableOpacity
                                    style={Styles.modalCancelButton}
                                    onPress={handleModalClose}
                                >
                                    <Text style={Styles.modalCancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        Styles.modalSubmitButton,
                                        !modalInputValue.trim() && Styles.modalSubmitButtonDisabled
                                    ]}
                                    onPress={handleModalSubmit}
                                    disabled={!modalInputValue.trim()}
                                >
                                    <Text style={Styles.modalSubmitText}>Add Filter</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

export default ContextSearchScreen;
