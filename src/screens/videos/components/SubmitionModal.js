import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Text, Modal, TouchableOpacity, } from 'react-native';
import SizeBox from '../../../constants/SizeBox';
import { createStyles } from './ModalsStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const SubmitionModal = ({ isVisible, onClose, }) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    return (_jsx(Modal, Object.assign({ transparent: true, animationType: "fade", visible: isVisible, onRequestClose: onClose }, { children: _jsxs(TouchableOpacity, Object.assign({ style: Styles.overlay, activeOpacity: 1, onPress: onClose }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(TouchableOpacity, Object.assign({ style: Styles.modalContent, activeOpacity: 1, onPress: (e) => e.stopPropagation() }, { children: [_jsx(Text, Object.assign({ style: [Styles.titleText, { textAlign: 'center' }] }, { children: t('Report has been submitted') })), _jsx(SizeBox, { height: 16 }), _jsx(TouchableOpacity, Object.assign({ style: Styles.btnContianer, onPress: onClose }, { children: _jsx(Text, Object.assign({ style: Styles.btnText }, { children: t('Close') })) }))] }))] })) })));
};
export default SubmitionModal;
