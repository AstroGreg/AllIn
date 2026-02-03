import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { SearchNormal1, TickSquare, Category, ArrowRight, ArrowLeft } from 'iconsax-react-nativejs';
import { useTheme } from '../../../context/ThemeContext';
import SizeBox from '../../../constants/SizeBox';
import { createStyles } from './ContextSearchScreenStyles';

interface FilterOption {
    id: string;
    label: string;
    checked: boolean;
}

const ContextSearchScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const contextInputRef = useRef<TextInput>(null);

    const [step, setStep] = useState<'context' | 'filters'>('context');
    const [contextSearchText, setContextSearchText] = useState('');
    const [filters, setFilters] = useState<FilterOption[]>([
        { id: 'competition', label: 'Competition', checked: true },
        { id: 'athlete', label: 'Athlete', checked: true },
        { id: 'location', label: 'Location', checked: true },
        { id: 'photographer', label: 'Photographer', checked: true },
    ]);

    useEffect(() => {
        setTimeout(() => contextInputRef.current?.focus(), 300);
    }, []);

    const handleNext = () => {
        if (contextSearchText.trim()) {
            setStep('filters');
        }
    };

    const handleFilterToggle = (filterId: string) => {
        setFilters(prev => prev.map(filter =>
            filter.id === filterId
                ? { ...filter, checked: !filter.checked }
                : filter
        ));
    };

    const handleStartSearch = () => {
        const selectedFilters = filters.filter(f => f.checked).map(f => f.id);
        navigation.navigate('ContextSearchLoadingScreen', {
            contextSearch: contextSearchText.trim(),
            filters: selectedFilters
        });
    };

    const handleBack = () => {
        if (step === 'filters') {
            setStep('context');
        } else {
            navigation.goBack();
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
                {step === 'context' ? (
                    <>
                        <Text style={Styles.title}>Describe Context</Text>
                        <Text style={Styles.subtitle}>
                            Enter keywords or describe what you're looking for
                        </Text>
                        <SizeBox height={24} />

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
                                onSubmitEditing={handleNext}
                                returnKeyType="next"
                                multiline={false}
                            />
                        </View>

                        <SizeBox height={40} />

                        <TouchableOpacity
                            onPress={handleNext}
                            disabled={!contextSearchText.trim()}
                            style={{ opacity: contextSearchText.trim() ? 1 : 0.5 }}
                        >
                            <LinearGradient
                                colors={['#3B82F6', '#8B5CF6']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={Styles.button}
                            >
                                <Text style={Styles.buttonText}>Next</Text>
                                <ArrowRight size={20} color="#FFFFFF" variant="Linear" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text style={Styles.title}>Specify Filters</Text>
                        <Text style={Styles.subtitle}>
                            Select the categories you want to search in
                        </Text>
                        <SizeBox height={24} />

                        {filters.map((filter) => (
                            <TouchableOpacity
                                key={filter.id}
                                style={Styles.filterOption}
                                onPress={() => handleFilterToggle(filter.id)}
                            >
                                <View style={Styles.filterLabelContainer}>
                                    <Category size={20} color={colors.grayColor} variant="Linear" />
                                    <SizeBox width={12} />
                                    <Text style={Styles.filterLabel}>{filter.label}</Text>
                                </View>
                                <View style={[Styles.checkbox, filter.checked && Styles.checkboxChecked]}>
                                    {filter.checked && (
                                        <TickSquare size={24} color={colors.primaryColor} variant="Bold" />
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}

                        <SizeBox height={40} />

                        <TouchableOpacity onPress={handleStartSearch}>
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
                    </>
                )}
            </ScrollView>
        </View>
    );
};

export default ContextSearchScreen;
