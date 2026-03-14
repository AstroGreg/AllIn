import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { SearchNormal1, ArrowRight, ArrowLeft, CloseCircle } from 'iconsax-react-nativejs';
import { useTheme } from '../../../context/ThemeContext';
import { useEvents } from '../../../context/EventsContext';
import { AI_GROUPS, AI_PEOPLE } from '../../../constants/AiFilterOptions';
import SizeBox from '../../../constants/SizeBox';
import { createStyles } from './ContextSearchScreenStyles';
import UnifiedSearchInput from '../../../components/unifiedSearchInput/UnifiedSearchInput';
import { useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { buildSearchFilterChipLabel, getSearchFilterLabel, SEARCH_FILTER_KEYS, } from '../../../utils/searchLabels';
const ContextSearchScreen = ({ navigation }) => {
    var _a, _b;
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const contextInputRef = useRef(null);
    const route = useRoute();
    const filterState = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.filterState;
    const origin = (_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.origin;
    const [contextSearchText, setContextSearchText] = useState('');
    const [activeChips, setActiveChips] = useState([]);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [modalFilterType, setModalFilterType] = useState('');
    const { events } = useEvents();
    useEffect(() => {
        setTimeout(() => { var _a; return (_a = contextInputRef.current) === null || _a === void 0 ? void 0 : _a.focus(); }, 300);
    }, []);
    useEffect(() => {
        if (!filterState)
            return;
        const seeded = [];
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
    const handleFilterPress = (filter) => {
        setModalFilterType(filter);
        setShowFilterModal(true);
    };
    const handleSelectOption = (label, value) => {
        if (!label)
            return;
        const newChip = {
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
    const removeChip = (chipId) => {
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
            }, {});
            navigation.navigate('ContextSearchLoadingScreen', {
                contextSearch: contextSearchText.trim(),
                filters: filters,
                filterState,
            });
        }
    };
    const handleBack = () => {
        var _a;
        const parent = (_a = navigation.getParent) === null || _a === void 0 ? void 0 : _a.call(navigation);
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
            const name = String(event.event_name || event.event_title || t('Competition'));
            const date = event.event_date ? new Date(event.event_date).toLocaleDateString() : '';
            const location = event.event_location ? String(event.event_location) : '';
            const sublabel = [date, location].filter(Boolean).join(' • ');
            return { label: name, value: name, sublabel };
        });
        const locations = Array.from(new Set([
            ...events.map((event) => String(event.event_location || '').trim()).filter(Boolean),
            ...AI_PEOPLE.map((p) => p.location || '').filter(Boolean),
            ...AI_GROUPS.map((g) => g.location || '').filter(Boolean),
        ])).map((loc) => ({ label: loc, value: loc }));
        const people = AI_PEOPLE.map((p) => ({ label: p.name, value: p.name }));
        const groups = AI_GROUPS.map((g) => ({ label: g.name, value: g.name }));
        return { competitions, locations, people, groups };
    }, [events, t]);
    return (_jsxs(View, Object.assign({ style: Styles.container }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ onPress: handleBack, style: Styles.backButton }, { children: _jsx(ArrowLeft, { size: 24, color: colors.mainTextColor }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('Context Search') })), _jsx(View, { style: { width: 40 } })] })), _jsxs(ScrollView, Object.assign({ style: Styles.content, showsVerticalScrollIndicator: false, keyboardShouldPersistTaps: "handled" }, { children: [_jsx(Text, Object.assign({ style: Styles.title }, { children: t('Describe Context') })), _jsx(Text, Object.assign({ style: Styles.subtitle }, { children: t("Enter keywords or describe what you're looking for") })), _jsx(SizeBox, { height: 24 }), _jsx(UnifiedSearchInput, { ref: contextInputRef, containerStyle: Styles.inputContainer, left: _jsx(SearchNormal1, { size: 20, color: colors.grayColor, variant: "Linear" }), inputStyle: Styles.input, placeholder: t('For example podium, finish line, medal...'), value: contextSearchText, onChangeText: setContextSearchText, returnKeyType: "next", multiline: false }), _jsx(SizeBox, { height: 24 }), _jsx(Text, Object.assign({ style: Styles.filterSectionTitle }, { children: t('Add Filters (Optional)') })), _jsx(SizeBox, { height: 12 }), _jsx(ScrollView, Object.assign({ horizontal: true, showsHorizontalScrollIndicator: false, contentContainerStyle: Styles.filterTabsContainer }, { children: SEARCH_FILTER_KEYS.map((filter) => {
                            const hasValue = activeChips.some(chip => chip.label === filter);
                            return (_jsx(TouchableOpacity, Object.assign({ style: [Styles.filterTab, hasValue && Styles.filterTabActive], onPress: () => handleFilterPress(filter) }, { children: _jsx(Text, Object.assign({ style: [Styles.filterTabText, hasValue && Styles.filterTabTextActive] }, { children: getSearchFilterLabel(filter, t) })) }), filter));
                        }) })), activeChips.length > 0 && (_jsxs(_Fragment, { children: [_jsx(SizeBox, { height: 16 }), _jsx(View, Object.assign({ style: Styles.activeChipsContainer }, { children: activeChips.map((chip) => (_jsxs(TouchableOpacity, Object.assign({ style: Styles.activeChip, onPress: () => removeChip(chip.id) }, { children: [_jsx(Text, Object.assign({ style: Styles.activeChipText }, { children: buildSearchFilterChipLabel(chip.label, chip.value, t) })), _jsx(CloseCircle, { size: 16, color: "#FFFFFF", variant: "Bold" })] }), chip.id))) }))] })), _jsx(SizeBox, { height: 40 }), _jsx(TouchableOpacity, Object.assign({ onPress: handleStartSearch, disabled: !contextSearchText.trim(), style: { opacity: contextSearchText.trim() ? 1 : 0.5 } }, { children: _jsxs(LinearGradient, Object.assign({ colors: ['#3B82F6', '#8B5CF6'], start: { x: 0, y: 0 }, end: { x: 1, y: 0 }, style: Styles.button }, { children: [_jsx(Text, Object.assign({ style: Styles.buttonText }, { children: t('Start Search') })), _jsx(ArrowRight, { size: 20, color: "#FFFFFF", variant: "Linear" })] })) })), _jsx(SizeBox, { height: insets.bottom + 20 })] })), _jsx(Modal, Object.assign({ visible: showFilterModal, transparent: true, animationType: "fade", onRequestClose: handleModalClose }, { children: _jsx(TouchableOpacity, Object.assign({ style: Styles.modalOverlay, activeOpacity: 1, onPress: handleModalClose }, { children: _jsx(View, Object.assign({ style: Styles.modalContainer }, { children: _jsxs(TouchableOpacity, Object.assign({ activeOpacity: 1 }, { children: [_jsx(Text, Object.assign({ style: Styles.modalTitle }, { children: modalFilterType ? getSearchFilterLabel(modalFilterType, t) : '' })), _jsx(SizeBox, { height: 16 }), _jsxs(ScrollView, Object.assign({ style: Styles.modalList, contentContainerStyle: Styles.modalListContent }, { children: [(modalFilterType === 'Competition' ? filterOptions.competitions
                                            : modalFilterType === 'Location' ? filterOptions.locations
                                                : modalFilterType === 'Person' ? filterOptions.people
                                                    : modalFilterType === 'Group' ? filterOptions.groups
                                                        : []).map((option, index) => (_jsxs(TouchableOpacity, Object.assign({ style: Styles.modalOption, onPress: () => handleSelectOption(modalFilterType, option.value) }, { children: [_jsx(Text, Object.assign({ style: Styles.modalOptionText }, { children: option.label })), !!option.sublabel && (_jsx(Text, Object.assign({ style: Styles.modalOptionSubText }, { children: option.sublabel })))] }), `${option.value}-${index}`))), (modalFilterType === 'Competition' ? filterOptions.competitions
                                            : modalFilterType === 'Location' ? filterOptions.locations
                                                : modalFilterType === 'Person' ? filterOptions.people
                                                    : modalFilterType === 'Group' ? filterOptions.groups
                                                        : []).length === 0 && (_jsx(Text, Object.assign({ style: Styles.modalEmpty }, { children: t('No options available.') })))] }))] })) })) })) }))] })));
};
export default ContextSearchScreen;
