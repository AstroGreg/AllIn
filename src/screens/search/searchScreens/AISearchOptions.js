import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { ArrowLeft2, ArrowRight, SearchNormal1, TickSquare, Category } from 'iconsax-react-nativejs';
import { createStyles } from './AISearchOptionsStyles';
import { useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
const AISearchOptions = ({ navigation }) => {
    var _a;
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const route = useRoute();
    const [selectedOption, setSelectedOption] = useState('face');
    const [showContextModal, setShowContextModal] = useState(false);
    const [showFiltersModal, setShowFiltersModal] = useState(false);
    const [contextSearchText, setContextSearchText] = useState('');
    const contextInputRef = useRef(null);
    // Handle openContext param from navigation
    useEffect(() => {
        var _a;
        if ((_a = route.params) === null || _a === void 0 ? void 0 : _a.openContext) {
            setSelectedOption('context');
            setShowContextModal(true);
            setTimeout(() => { var _a; return (_a = contextInputRef.current) === null || _a === void 0 ? void 0 : _a.focus(); }, 100);
        }
    }, [(_a = route.params) === null || _a === void 0 ? void 0 : _a.openContext]);
    const [filters, setFilters] = useState([
        { id: 'competition', label: 'Competition', checked: true },
        { id: 'athlete', label: 'Athlete', checked: true },
        { id: 'location', label: 'Location', checked: true },
        { id: 'photographer', label: 'Photographer', checked: true },
    ]);
    const handleOptionPress = (optionId) => {
        setSelectedOption(optionId);
        if (optionId === 'bib') {
            navigation.navigate('BibSearchScreen');
        }
        else if (optionId === 'face') {
            // Navigate to Face Search screen
            navigation.navigate('FaceSearchScreen');
        }
        else if (optionId === 'context') {
            // Show context search modal
            setShowContextModal(true);
            setTimeout(() => { var _a; return (_a = contextInputRef.current) === null || _a === void 0 ? void 0 : _a.focus(); }, 100);
        }
    };
    const handleContextNext = () => {
        // Close context modal and show filters modal
        setShowContextModal(false);
        setShowFiltersModal(true);
    };
    const handleFilterToggle = (filterId) => {
        setFilters(prev => prev.map(filter => filter.id === filterId
            ? Object.assign(Object.assign({}, filter), { checked: !filter.checked }) : filter));
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
    const renderSearchOption = (option) => {
        const isSelected = selectedOption === option.id;
        return (_jsx(TouchableOpacity, Object.assign({ style: [
                styles.optionButton,
                isSelected && styles.optionButtonActive,
            ], activeOpacity: 0.85, onPress: () => handleOptionPress(option.id) }, { children: _jsx(Text, Object.assign({ style: [
                    styles.optionButtonText,
                    isSelected && styles.optionButtonTextActive,
                ] }, { children: t(option.title) })) }), option.id));
    };
    const renderFilterOption = (filter) => (_jsxs(TouchableOpacity, Object.assign({ style: styles.filterOption, onPress: () => handleFilterToggle(filter.id) }, { children: [_jsxs(View, Object.assign({ style: styles.filterLabelContainer }, { children: [_jsx(Category, { size: 20, color: colors.grayColor, variant: "Linear" }), _jsx(SizeBox, { width: 12 }), _jsx(Text, Object.assign({ style: styles.filterLabel }, { children: t(filter.label) }))] })), _jsx(View, Object.assign({ style: [styles.checkbox, filter.checked && styles.checkboxChecked] }, { children: filter.checked && (_jsx(TickSquare, { size: 24, color: colors.primaryColor, variant: "Bold" })) }))] }), filter.id));
    return (_jsxs(View, Object.assign({ style: styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: styles.headerTitle }, { children: t('AI') })), _jsx(View, { style: { width: 44, height: 44 } })] })), _jsx(View, Object.assign({ style: styles.topSection }, { children: _jsxs(View, Object.assign({ style: styles.titleSection }, { children: [_jsx(Text, Object.assign({ style: styles.mainTitle }, { children: t('How Should AI') })), _jsx(Text, Object.assign({ style: styles.mainTitle }, { children: t('Find You?') })), _jsx(SizeBox, { height: 12 }), _jsx(Text, Object.assign({ style: styles.subtitle }, { children: t('Choose what you remember.') })), _jsx(Text, Object.assign({ style: styles.subtitle }, { children: t('AI handles the rest.') }))] })) })), _jsxs(ScrollView, Object.assign({ style: styles.optionsContainer, contentContainerStyle: styles.optionsContent, showsVerticalScrollIndicator: false }, { children: [_jsx(Text, Object.assign({ style: styles.searchByLabel }, { children: t('Search by') })), _jsx(View, Object.assign({ style: styles.optionsRow }, { children: searchOptions.map(renderSearchOption) })), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] })), _jsx(Modal, Object.assign({ visible: showContextModal, transparent: true, animationType: "fade", onRequestClose: () => setShowContextModal(false) }, { children: _jsx(TouchableOpacity, Object.assign({ style: styles.modalOverlay, activeOpacity: 1, onPress: () => setShowContextModal(false) }, { children: _jsxs(TouchableOpacity, Object.assign({ activeOpacity: 1, style: styles.modalContainer }, { children: [_jsx(Text, Object.assign({ style: styles.modalTitle }, { children: t('Describe Context') })), _jsx(SizeBox, { height: 20 }), _jsxs(View, Object.assign({ style: styles.contextInputContainer }, { children: [_jsx(SearchNormal1, { size: 20, color: colors.grayColor, variant: "Linear" }), _jsx(SizeBox, { width: 10 }), _jsx(TextInput, { ref: contextInputRef, style: styles.contextInput, placeholder: t('For example podium'), placeholderTextColor: colors.grayColor, value: contextSearchText, onChangeText: setContextSearchText, onSubmitEditing: handleContextNext, returnKeyType: "next" })] })), _jsx(SizeBox, { height: 20 }), _jsx(TouchableOpacity, Object.assign({ onPress: handleContextNext }, { children: _jsxs(View, Object.assign({ style: styles.nextButton }, { children: [_jsx(Text, Object.assign({ style: styles.nextButtonText }, { children: t('Next') })), _jsx(ArrowRight, { size: 20, color: "#FFFFFF", variant: "Linear" })] })) }))] })) })) })), _jsx(Modal, Object.assign({ visible: showFiltersModal, transparent: true, animationType: "fade", onRequestClose: () => setShowFiltersModal(false) }, { children: _jsx(TouchableOpacity, Object.assign({ style: styles.modalOverlay, activeOpacity: 1, onPress: () => setShowFiltersModal(false) }, { children: _jsxs(TouchableOpacity, Object.assign({ activeOpacity: 1, style: styles.filtersModalContainer }, { children: [_jsx(Text, Object.assign({ style: styles.modalTitle }, { children: t('Specify filters') })), _jsx(SizeBox, { height: 20 }), filters.map(renderFilterOption), _jsx(SizeBox, { height: 20 }), _jsx(TouchableOpacity, Object.assign({ onPress: handleStartSearch }, { children: _jsxs(View, Object.assign({ style: styles.nextButton }, { children: [_jsx(Text, Object.assign({ style: styles.nextButtonText }, { children: t('Start') })), _jsx(ArrowRight, { size: 20, color: "#FFFFFF", variant: "Linear" })] })) }))] })) })) }))] })));
};
export default AISearchOptions;
