import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import SizeBox from '../../../constants/SizeBox';
import FastImage from 'react-native-fast-image';
import Icons from '../../../constants/Icons';
import { createStyles } from '../ViewUserProfileStyles';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const LinksModal = ({ isVisible, onClose }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const Styles = createStyles(colors);
    return (_jsx(Modal, Object.assign({ visible: isVisible, onRequestClose: onClose, transparent: true, animationType: 'fade' }, { children: _jsx(TouchableOpacity, Object.assign({ style: Styles.modalContainer, activeOpacity: 1, onPress: onClose }, { children: _jsxs(TouchableOpacity, Object.assign({ style: Styles.talentContainer, activeOpacity: 1, onPress: (e) => e.stopPropagation() }, { children: [_jsx(SizeBox, { height: 16 }), _jsxs(TouchableOpacity, Object.assign({ style: Styles.socialLinks }, { children: [_jsx(FastImage, { source: Icons.Strava, style: Styles.icons }), _jsx(SizeBox, { width: 12 }), _jsx(Text, Object.assign({ style: Styles.eventText }, { children: t('Connect with Strava') })), _jsx(View, Object.assign({ style: [Styles.nextArrow, { right: 0 }] }, { children: _jsx(Icons.ArrowNext, { height: 24, width: 24 }) }))] })), _jsx(SizeBox, { height: 14 }), _jsx(View, { style: [Styles.separator, { marginHorizontal: 0 }] }), _jsx(SizeBox, { height: 14 }), _jsxs(TouchableOpacity, Object.assign({ style: Styles.socialLinks }, { children: [_jsx(FastImage, { source: Icons.Instagram, style: Styles.icons }), _jsx(SizeBox, { width: 12 }), _jsx(Text, Object.assign({ style: Styles.eventText }, { children: t('Connect with Instagram') })), _jsx(View, Object.assign({ style: [Styles.nextArrow, { right: 0 }] }, { children: _jsx(Icons.ArrowNext, { height: 24, width: 24 }) }))] })), _jsx(SizeBox, { height: 16 })] })) })) })));
};
export default LinksModal;
