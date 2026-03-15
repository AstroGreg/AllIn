import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import SizeBox from '../../../constants/SizeBox';
import { createStyles } from './ModalsStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BorderButton from '../../../components/borderButton/BorderButton';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const ReportMistakeModal = ({ isVisible, onClose, onPressNext }) => {
    const insets = useSafeAreaInsets();
    const [selectedItem, setSelectedItem] = useState(0);
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    const data = [
        {
            id: 1,
            name: t('Wrong heat'),
        },
        {
            id: 2,
            name: t('Wrong competition'),
        },
        {
            id: 3,
            name: t('Wrong results or people tagged'),
        },
        {
            id: 4,
            name: t('Other'),
        },
    ];
    return (_jsx(Modal, Object.assign({ transparent: true, animationType: "fade", visible: isVisible, onRequestClose: onClose }, { children: _jsxs(TouchableOpacity, Object.assign({ style: Styles.overlay, activeOpacity: 1, onPress: onClose }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(TouchableOpacity, Object.assign({ style: Styles.modalContent, activeOpacity: 1, onPress: (e) => e.stopPropagation() }, { children: [_jsx(Text, Object.assign({ style: Styles.titleText }, { children: t('Report mistake') })), _jsx(SizeBox, { height: 4 }), _jsx(Text, Object.assign({ style: Styles.titleText }, { children: t('Choose a reason for the report:') })), _jsx(SizeBox, { height: 10 }), _jsx(View, { style: Styles.divider }), _jsx(SizeBox, { height: 19 }), _jsx(View, Object.assign({ style: Styles.container }, { children: data.map((item, index) => (_jsxs(TouchableOpacity, Object.assign({ activeOpacity: 0.9, style: Styles.row, onPress: () => setSelectedItem(item.id) }, { children: [_jsx(View, Object.assign({ style: Styles.checkBox }, { children: selectedItem === item.id && _jsx(View, { style: Styles.selectedDot }) })), _jsx(Text, Object.assign({ style: Styles.selectionText }, { children: item.name }))] })))) })), _jsx(SizeBox, { height: 16 }), _jsx(View, Object.assign({ style: Styles.btn }, { children: _jsx(BorderButton, { isFilled: true, title: t('Next'), onPress: onPressNext }) }))] }))] })) })));
};
export default ReportMistakeModal;
