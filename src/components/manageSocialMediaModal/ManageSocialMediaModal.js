import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { useState } from 'react';
import { CloseCircle, Note, ArrowDown, ArrowRight } from 'iconsax-react-nativejs';
import { createStyles } from './ManageSocialMediaModalStyles';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const ManageSocialMediaModal = ({ visible, onClose, onSave }) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const [selectedSocialMedia, setSelectedSocialMedia] = useState('');
    const handleAddMore = () => {
        // Handle add more logic
    };
    const handleSave = () => {
        onSave();
        onClose();
    };
    return (_jsx(Modal, Object.assign({ visible: visible, transparent: true, animationType: "fade", onRequestClose: onClose }, { children: _jsx(TouchableWithoutFeedback, Object.assign({ onPress: onClose }, { children: _jsx(View, Object.assign({ style: Styles.overlay }, { children: _jsx(TouchableWithoutFeedback, { children: _jsxs(View, Object.assign({ style: Styles.modalContainer }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.closeButton, onPress: onClose }, { children: _jsx(CloseCircle, { size: 24, color: colors.subTextColor, variant: "Linear" }) })), _jsxs(View, Object.assign({ style: Styles.inputContainer }, { children: [_jsx(Text, Object.assign({ style: Styles.inputLabel }, { children: t('Social Media') })), _jsxs(TouchableOpacity, Object.assign({ style: Styles.selectInput }, { children: [_jsxs(View, Object.assign({ style: Styles.selectInputContent }, { children: [_jsx(Note, { size: 16, color: colors.grayColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: Styles.selectInputText }, { children: selectedSocialMedia || 'Select Social Media' }))] })), _jsx(ArrowDown, { size: 20, color: colors.grayColor, variant: "Linear" })] }))] })), _jsxs(View, Object.assign({ style: Styles.buttonsContainer }, { children: [_jsxs(TouchableOpacity, Object.assign({ style: Styles.addMoreButton, onPress: handleAddMore }, { children: [_jsx(Text, Object.assign({ style: Styles.addMoreButtonText }, { children: t('Add More') })), _jsx(ArrowRight, { size: 18, color: colors.subTextColor, variant: "Linear" })] })), _jsxs(TouchableOpacity, Object.assign({ style: Styles.saveButton, onPress: handleSave }, { children: [_jsx(Text, Object.assign({ style: Styles.saveButtonText }, { children: t('Save') })), _jsx(ArrowRight, { size: 18, color: "#FFFFFF", variant: "Linear" })] }))] }))] })) }) })) })) })));
};
export default ManageSocialMediaModal;
