import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { ArrowLeft2, ArrowRight, SearchNormal1, TickSquare, Category } from 'iconsax-react-nativejs';
import { createStyles } from './AISearchOptionsStyles';
import { useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next'

interface FilterOption {
    id: string;
    label: string;
    checked: boolean;
}

const AISearchOptions = ({ navigation }: any) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const route = useRoute<any>();
    const [selectedOption, setSelectedOption] = useState<string>('face');
    const [showContextModal, setShowContextModal] = useState(false);
    const [showFiltersModal, setShowFiltersModal] = useState(false);
    const [contextSearchText, setContextSearchText] = useState('');
    const contextInputRef = useRef<TextInput>(null);

    // Handle openContext param from navigation
    useEffect(() => {
        if (route.params?.openContext) {
            setSelectedOption('context');
            setShowContextModal(true);
            setTimeout(() => contextInputRef.current?.focus(), 100);
        }
    }, [route.params?.openContext]);

    const [filters, setFilters] = useState<FilterOption[]>([
        { id: 'competition', label: 'Competition', checked: true },
        { id: 'athlete', label: 'Athlete', checked: true },
        { id: 'location', label: 'Location', checked: true },
        { id: 'photographer', label: 'Photographer', checked: true },
    ]);

    const handleOptionPress = (optionId: string) => {
        setSelectedOption(optionId);
        if (optionId === 'bib') {
            navigation.navigate('BibSearchScreen');
        } else if (optionId === 'face') {
            // Navigate to Face Search screen
            navigation.navigate('FaceSearchScreen');
        } else if (optionId === 'context') {
            // Show context search modal
            setShowContextModal(true);
            setTimeout(() => contextInputRef.current?.focus(), 100);
        }
    };

    const handleContextNext = () => {
        // Close context modal and show filters modal
        setShowContextModal(false);
        setShowFiltersModal(true);
    };

    const handleFilterToggle = (filterId: string) => {
        setFilters(prev => prev.map(filter =>
            filter.id === filterId
                ? { ...filter, checked: !filter.checked }
                : filter
        ));
    };

    const handleStartSearch = () => {
        setShowFiltersModal(false);
        const selectedFilters = filters.filter(f => f.checked).map(f => f.id);
        // Navigate to loading screen which will then navigate to results
        navigation.navigate('ContextSearchLoadingScreen', {
            contextSearch: contextSearchText.trim(),
            filters: selectedFilters
        });
        setContextSearchText('');
    };

    const searchOptions = [
        { id: 'bib', title: 'Chest number' },
        { id: 'face', title: 'Face' },
        { id: 'context', title: 'Context' },
    ];

    const renderSearchOption = (option: any) => {
        const isSelected = selectedOption === option.id;

        return (
            <TouchableOpacity
                key={option.id}
                style={[
                    styles.optionButton,
                    isSelected && styles.optionButtonActive,
                ]}
                activeOpacity={0.85}
                onPress={() => handleOptionPress(option.id)}
            >
                <Text style={[
                    styles.optionButtonText,
                    isSelected && styles.optionButtonTextActive,
                ]}>
                    {t(option.title)}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderFilterOption = (filter: FilterOption) => (
        <TouchableOpacity
            key={filter.id}
            style={styles.filterOption}
            onPress={() => handleFilterToggle(filter.id)}
        >
            <View style={styles.filterLabelContainer}>
                <Category size={20} color={colors.grayColor} variant="Linear" />
                <SizeBox width={12} />
                <Text style={styles.filterLabel}>{t(filter.label)}</Text>
            </View>
            <View style={[styles.checkbox, filter.checked && styles.checkboxChecked]}>
                {filter.checked && (
                    <TickSquare size={24} color={colors.primaryColor} variant="Bold" />
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('AI')}</Text>
                <View style={{width: 44, height: 44}} />
            </View>

            {/* Top Section */}
            <View style={styles.topSection}>
                {/* Title Section */}
                <View style={styles.titleSection}>
                    <Text style={styles.mainTitle}>{t('How Should AI')}</Text>
                    <Text style={styles.mainTitle}>{t('Find You?')}</Text>
                    <SizeBox height={12} />
                    <Text style={styles.subtitle}>{t('Choose what you remember.')}</Text>
                    <Text style={styles.subtitle}>{t('AI handles the rest.')}</Text>
                </View>
            </View>

            {/* Search Options */}
            <ScrollView
                style={styles.optionsContainer}
                contentContainerStyle={styles.optionsContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.searchByLabel}>{t('Search by')}</Text>
                <View style={styles.optionsRow}>
                    {searchOptions.map(renderSearchOption)}
                </View>
                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>

            {/* Context Search Modal */}
            <Modal
                visible={showContextModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowContextModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowContextModal(false)}
                >
                    <TouchableOpacity activeOpacity={1} style={styles.modalContainer}>
                        {/* Modal Title */}
                        <Text style={styles.modalTitle}>{t('Describe Context')}</Text>

                        <SizeBox height={20} />

                        {/* Search Input */}
                        <View style={styles.contextInputContainer}>
                            <SearchNormal1 size={20} color={colors.grayColor} variant="Linear" />
                            <SizeBox width={10} />
                            <TextInput
                                ref={contextInputRef}
                                style={styles.contextInput}
                                placeholder={t('For example podium')}
                                placeholderTextColor={colors.grayColor}
                                value={contextSearchText}
                                onChangeText={setContextSearchText}
                                onSubmitEditing={handleContextNext}
                                returnKeyType="next"
                            />
                        </View>

                        <SizeBox height={20} />

                        {/* Next Button */}
                        <TouchableOpacity onPress={handleContextNext}>
                            <View style={styles.nextButton}>
                                <Text style={styles.nextButtonText}>{t('Next')}</Text>
                                <ArrowRight size={20} color="#FFFFFF" variant="Linear" />
                            </View>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* Specify Filters Modal */}
            <Modal
                visible={showFiltersModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowFiltersModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowFiltersModal(false)}
                >
                    <TouchableOpacity activeOpacity={1} style={styles.filtersModalContainer}>
                        {/* Modal Title */}
                        <Text style={styles.modalTitle}>{t('Specify filters')}</Text>

                        <SizeBox height={20} />

                        {/* Filter Options */}
                        {filters.map(renderFilterOption)}

                        <SizeBox height={20} />

                        {/* Start Button */}
                        <TouchableOpacity onPress={handleStartSearch}>
                            <View style={styles.nextButton}>
                                <Text style={styles.nextButtonText}>{t('Start')}</Text>
                                <ArrowRight size={20} color="#FFFFFF" variant="Linear" />
                            </View>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

export default AISearchOptions;
