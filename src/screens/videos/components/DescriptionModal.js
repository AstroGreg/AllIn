import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, Modal, TouchableOpacity, TextInput } from 'react-native';
import { useState } from 'react';
import SizeBox from '../../../constants/SizeBox';
import { createStyles } from './ModalsStyles';
import BorderButton from '../../../components/borderButton/BorderButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icons from '../../../constants/Icons';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const DescriptionModal = ({ isVisible, onClose, onPressPrevious, onPressNext }) => {
    const insets = useSafeAreaInsets();
    const [bio, setBio] = useState('');
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    return (_jsx(Modal, Object.assign({ transparent: true, animationType: "fade", visible: isVisible, onRequestClose: onClose }, { children: _jsxs(TouchableOpacity, Object.assign({ style: Styles.overlay, activeOpacity: 1, onPress: onClose }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(TouchableOpacity, Object.assign({ style: Styles.modalContent, activeOpacity: 1, onPress: (e) => e.stopPropagation() }, { children: [_jsx(Text, Object.assign({ style: Styles.titleText }, { children: t('Report mistake') })), _jsx(SizeBox, { height: 10 }), _jsx(View, { style: Styles.divider }), _jsx(SizeBox, { height: 19 }), _jsx(View, Object.assign({ style: Styles.bioContainer }, { children: _jsxs(View, Object.assign({ style: Styles.iconRow }, { children: [_jsx(View, Object.assign({ style: Styles.icon }, { children: _jsx(Icons.Edit, { height: 16, width: 16 }) })), _jsx(TextInput, { style: Styles.textInput, placeholder: t('Add a shot description'), placeholderTextColor: colors.subTextColor, multiline: true, value: bio, onChangeText: setBio })] })) })), _jsx(SizeBox, { height: 16 }), _jsxs(View, Object.assign({ style: [Styles.row, { justifyContent: 'space-between' }] }, { children: [_jsx(BorderButton, { title: t('Previous'), onPress: onPressPrevious }), _jsx(BorderButton, { isFilled: true, title: t('Next'), onPress: onPressNext })] }))] }))] })) })));
};
export default DescriptionModal;
