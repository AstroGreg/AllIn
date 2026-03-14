import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, Modal, TouchableOpacity, } from 'react-native';
import SizeBox from '../../../constants/SizeBox';
import { createStyles } from './ModalsStyles';
import BorderButton from '../../../components/borderButton/BorderButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const ReviewReport = ({ isVisible, onClose, onPressEdit, onPressNext }) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    return (_jsx(Modal, Object.assign({ transparent: true, animationType: "fade", visible: isVisible, onRequestClose: onClose }, { children: _jsxs(TouchableOpacity, Object.assign({ style: Styles.overlay, activeOpacity: 1, onPress: onClose }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(TouchableOpacity, Object.assign({ style: Styles.modalContent, activeOpacity: 1, onPress: (e) => e.stopPropagation() }, { children: [_jsx(Text, Object.assign({ style: Styles.titleText }, { children: t('Report mistake') })), _jsx(SizeBox, { height: 16 }), _jsx(Text, Object.assign({ style: Styles.subTitleText }, { children: t('Review your report') })), _jsx(SizeBox, { height: 16 }), _jsxs(View, Object.assign({ style: [Styles.row, { gap: 0 }] }, { children: [_jsx(Text, Object.assign({ style: Styles.subTitleText }, { children: t('Reason:') })), _jsx(SizeBox, { width: 1 }), _jsx(Text, Object.assign({ style: Styles.selectionText }, { children: t('Wrong heat') }))] })), _jsx(SizeBox, { height: 16 }), _jsx(Text, Object.assign({ style: Styles.subTitleText }, { children: t('Description:') })), _jsx(SizeBox, { height: 4 }), _jsx(Text, Object.assign({ numberOfLines: 3, style: Styles.selectionText }, { children: t('Abcdefghkj') })), _jsx(SizeBox, { height: 16 }), _jsxs(View, Object.assign({ style: [Styles.row, { justifyContent: 'space-between' }] }, { children: [_jsx(BorderButton, { title: t('Edit'), onPress: onPressEdit }), _jsx(BorderButton, { isFilled: true, title: t('Submit'), onPress: onPressNext })] }))] }))] })) })));
};
export default ReviewReport;
