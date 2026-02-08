import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import Icons from '../../../constants/Icons';
import LinearGradient from 'react-native-linear-gradient';
import { ArrowLeft2, ArrowRight, SearchNormal1, TickSquare, Category } from 'iconsax-react-nativejs';
import { createStyles } from './AISearchOptionsStyles';
import { useRoute } from '@react-navigation/native';

interface FilterOption {
    id: string;
    label: string;
    checked: boolean;
}

const AISearchOptions = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
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
        if (optionId === 'face') {
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
        {
            id: 'face',
            title: 'Face Search',
            description: 'Add your face once. AI finds you forever.',
            badge: 'Best Results',
            badgeIcon: 'target',
            gradientColors: ['#615FFF', '#7F22FE'],
            icon: 'facescan',
            badgeBgColor: '#E0E7FF',
            badgeBorderColor: '#C6D2FF',
            badgeTextColor: '#432DD7',
        },
        {
            id: 'context',
            title: 'Context Search',
            description: 'Describe the picture. For example "podium"',
            badge: 'AI Magic',
            badgeIcon: 'ai',
            gradientColors: ['#8E51FF', '#9810FA'],
            icon: 'image',
            badgeBgColor: '#F3E8FF',
            badgeBorderColor: '#E9D4FF',
            badgeTextColor: '#8200DB',
        },
    ];

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'hash':
                return <Icons.HashWhite width={32} height={32} />;
            case 'image':
                return <Icons.ImageWhite width={32} height={32} />;
            case 'facescan':
                return <Icons.FacescanWhite width={32} height={32} />;
            default:
                return null;
        }
    };

    const getBadgeIcon = (iconName: string) => {
        switch (iconName) {
            case 'bolt':
                return <Icons.BoltBlue width={16} height={16} />;
            case 'ai':
                return <Icons.AiViolate width={16} height={16} />;
            case 'target':
                return <Icons.TargetBlue width={16} height={16} />;
            default:
                return null;
        }
    };

    const renderSearchOption = (option: any) => {
        const isSelected = selectedOption === option.id;

        return (
            <TouchableOpacity
                key={option.id}
                style={[
                    styles.searchOptionCard,
                    isSelected && styles.searchOptionCardSelected,
                ]}
                activeOpacity={0.8}
                onPress={() => handleOptionPress(option.id)}
            >
                <View style={styles.searchOptionContent}>
                    {/* Icon Container with blur effect */}
                    <View style={styles.iconWrapper}>
                        {isSelected && <View style={styles.iconBlurEffect} />}
                        <LinearGradient
                            colors={option.gradientColors}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.iconContainer}
                        >
                            {getIcon(option.icon)}
                        </LinearGradient>
                    </View>

                    {/* Text Content */}
                    <View style={styles.textContainer}>
                        <Text style={styles.optionTitle}>{option.title}</Text>
                        <SizeBox height={8} />
                        <Text style={styles.optionDescription}>{option.description}</Text>
                        <SizeBox height={12} />

                        {/* Badge */}
                        <View
                            style={[
                                styles.badge,
                                {
                                    backgroundColor: option.badgeBgColor,
                                    borderColor: option.badgeBorderColor,
                                },
                            ]}
                        >
                            {getBadgeIcon(option.badgeIcon)}
                            <SizeBox width={6} />
                            <Text style={[styles.badgeText, { color: option.badgeTextColor }]}>
                                {option.badge}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Bottom Progress Bar */}
                {isSelected && (
                    <LinearGradient
                        colors={option.gradientColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.progressBar}
                    />
                )}
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
                <Text style={styles.filterLabel}>{filter.label}</Text>
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
                <Text style={styles.headerTitle}>AI</Text>
                <View style={{width: 44, height: 44}} />
            </View>

            {/* Top Section with Gradient Background */}
            <LinearGradient
                colors={isDark ? [colors.backgroundColor, colors.backgroundColor] : ['#F5F3FF', '#FFFFFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.topSection}
            >
                {/* Title Section */}
                <View style={styles.titleSection}>
                    <Text style={styles.mainTitle}>How Should AI</Text>
                    <Text style={styles.mainTitle}>Find You?</Text>
                    <SizeBox height={12} />
                    <Text style={styles.subtitle}>Choose what you remember.</Text>
                    <Text style={styles.subtitle}>AI handles the rest.</Text>
                </View>
            </LinearGradient>

            {/* Search Options */}
            <ScrollView
                style={styles.optionsContainer}
                contentContainerStyle={styles.optionsContent}
                showsVerticalScrollIndicator={false}
            >
                {searchOptions.map(renderSearchOption)}
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
                        <Text style={styles.modalTitle}>Describe Context</Text>

                        <SizeBox height={20} />

                        {/* Search Input */}
                        <View style={styles.contextInputContainer}>
                            <SearchNormal1 size={20} color={colors.grayColor} variant="Linear" />
                            <SizeBox width={10} />
                            <TextInput
                                ref={contextInputRef}
                                style={styles.contextInput}
                                placeholder="For example podium"
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
                            <LinearGradient
                                colors={['#3B82F6', '#8B5CF6']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.nextButton}
                            >
                                <Text style={styles.nextButtonText}>Next</Text>
                                <ArrowRight size={20} color="#FFFFFF" variant="Linear" />
                            </LinearGradient>
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
                        <Text style={styles.modalTitle}>Specify filters</Text>

                        <SizeBox height={20} />

                        {/* Filter Options */}
                        {filters.map(renderFilterOption)}

                        <SizeBox height={20} />

                        {/* Start Button */}
                        <TouchableOpacity onPress={handleStartSearch}>
                            <LinearGradient
                                colors={['#3B82F6', '#8B5CF6']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.nextButton}
                            >
                                <Text style={styles.nextButtonText}>Start</Text>
                                <ArrowRight size={20} color="#FFFFFF" variant="Linear" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

export default AISearchOptions;
