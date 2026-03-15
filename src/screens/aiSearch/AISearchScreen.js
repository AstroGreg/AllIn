import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useState } from 'react';
import { createStyles } from './AISearchStyles';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import Icons from '../../constants/Icons';
import { ArrowLeft2, ArrowRight } from 'iconsax-react-nativejs';
import { useTranslation } from 'react-i18next';
const AISearchScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const handleOptionPress = (optionId) => {
        setSelectedOption(optionId);
        setShowModal(true);
    };
    const searchOptions = [
        { id: 'bib', label: 'Chest number' },
        { id: 'face', label: 'Face' },
        { id: 'context', label: 'Context' },
    ];
    const renderSearchOption = (option) => {
        const isSelected = selectedOption === option.id;
        return (_jsx(TouchableOpacity, Object.assign({ style: [Styles.optionButton, isSelected && Styles.optionButtonActive], activeOpacity: 0.85, onPress: () => handleOptionPress(option.id) }, { children: _jsx(Text, Object.assign({ style: [Styles.optionButtonText, isSelected && Styles.optionButtonTextActive] }, { children: t(option.label) })) }), option.id));
    };
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('AI Search') })), _jsx(View, { style: { width: 44, height: 44 } })] })), _jsx(View, Object.assign({ style: Styles.topSection }, { children: _jsxs(View, Object.assign({ style: Styles.titleSection }, { children: [_jsx(Text, Object.assign({ style: Styles.mainTitle }, { children: t('How Should AI') })), _jsx(Text, Object.assign({ style: Styles.mainTitle }, { children: t('Find You?') })), _jsx(SizeBox, { height: 12 }), _jsx(Text, Object.assign({ style: Styles.subtitle }, { children: t('Choose what you remember.') })), _jsx(Text, Object.assign({ style: Styles.subtitle }, { children: t('AI handles the rest.') }))] })) })), _jsxs(ScrollView, Object.assign({ style: Styles.optionsContainer, contentContainerStyle: Styles.optionsContent, showsVerticalScrollIndicator: false }, { children: [_jsx(Text, Object.assign({ style: Styles.searchByLabel }, { children: t('Search by') })), _jsx(View, Object.assign({ style: Styles.optionsRow }, { children: searchOptions.map(renderSearchOption) })), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] })), _jsx(Modal, Object.assign({ visible: showModal, transparent: true, animationType: "fade", onRequestClose: () => setShowModal(false) }, { children: _jsx(TouchableOpacity, Object.assign({ style: Styles.modalOverlay, activeOpacity: 1, onPress: () => setShowModal(false) }, { children: _jsxs(TouchableOpacity, Object.assign({ activeOpacity: 1, style: Styles.modalContainer }, { children: [_jsxs(View, Object.assign({ style: Styles.modalHeader }, { children: [_jsx(Icons.AiColorful, { width: 80, height: 80 }), _jsx(Text, Object.assign({ style: Styles.modalPrice }, { children: t('$19/month') }))] })), _jsx(Text, Object.assign({ style: Styles.modalTitle }, { children: t('Find Your Photos') })), _jsx(Text, Object.assign({ style: Styles.modalTitle }, { children: t('& Videos Instantly') })), _jsx(Text, Object.assign({ style: Styles.modalDescription }, { children: t('Fast AI search by face, chest number, or context in seconds.') })), _jsx(TouchableOpacity, Object.assign({ onPress: () => {
                                    setShowModal(false);
                                    navigation.navigate('PaymentMethod');
                                } }, { children: _jsxs(View, Object.assign({ style: Styles.subscribeButton }, { children: [_jsx(Text, Object.assign({ style: Styles.subscribeButtonText }, { children: t('Subscribe Now') })), _jsx(ArrowRight, { size: 24, color: "#FFFFFF", variant: "Linear" })] })) }))] })) })) }))] })));
};
export default AISearchScreen;
