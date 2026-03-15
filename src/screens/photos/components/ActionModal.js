import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Text, Modal, TouchableOpacity } from 'react-native';
import { createStyles } from '../PhotosStyles';
import Icons from '../../../constants/Icons';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const ActionModal = ({ visible, onClose, onEdit, onDelete }) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    return (_jsx(Modal, Object.assign({ transparent: true, animationType: "fade", visible: visible, onRequestClose: onClose }, { children: _jsxs(TouchableOpacity, Object.assign({ style: Styles.overlay, activeOpacity: 1, onPress: onClose }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(TouchableOpacity, Object.assign({ style: Styles.modalContent, activeOpacity: 1, onPress: (e) => e.stopPropagation() }, { children: [_jsxs(TouchableOpacity, Object.assign({ style: Styles.actionButton, onPress: onEdit }, { children: [_jsx(Icons.Edit, { height: 21, width: 21 }), _jsx(Text, Object.assign({ style: Styles.actionText }, { children: t('Edit') }))] })), _jsxs(TouchableOpacity, Object.assign({ style: Styles.actionButton, onPress: onDelete }, { children: [_jsx(Icons.DeleteCompetition, { height: 21, width: 21 }), _jsx(Text, Object.assign({ style: Styles.actionText }, { children: t('Delete') }))] }))] }))] })) })));
};
export default ActionModal;
