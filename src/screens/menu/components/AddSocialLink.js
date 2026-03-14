import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { createStyles } from '../MenuStyles';
import CustomTextInput from '../../../components/customTextInput/CustomTextInput';
import Icons from '../../../constants/Icons';
import SizeBox from '../../../constants/SizeBox';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const AddSocialLink = ({ isVisible, onClose, onYesPress }) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    return (_jsx(Modal, Object.assign({ visible: isVisible, onRequestClose: onClose, style: Styles.mainContainer, animationType: 'fade', transparent: true }, { children: _jsx(View, Object.assign({ style: Styles.modalContainer }, { children: _jsxs(View, Object.assign({ style: Styles.modalContaint }, { children: [_jsx(CustomTextInput, { label: t('Platform'), placeholder: t('Add social platform'), icon: _jsx(Icons.WebsiteBlue, { height: 16, width: 16 }) }), _jsx(SizeBox, { height: 16 }), _jsx(CustomTextInput, { label: t('Profile Name'), placeholder: t('Add Profile Name'), icon: _jsx(Icons.User, { height: 16, width: 16 }) }), _jsx(SizeBox, { height: 16 }), _jsx(CustomTextInput, { label: t('Add Profile Link'), placeholder: t('Add Profile Link'), icon: _jsx(Icons.LinkBlue, { height: 16, width: 16 }) }), _jsx(SizeBox, { height: 24 }), _jsxs(View, Object.assign({ style: [Styles.row, { justifyContent: 'flex-end' }] }, { children: [_jsx(TouchableOpacity, Object.assign({ activeOpacity: 0.7, style: Styles.noBtn, onPress: onClose }, { children: _jsx(Text, Object.assign({ style: Styles.noText }, { children: t('Cancel') })) })), _jsx(SizeBox, { width: 20 }), _jsx(TouchableOpacity, Object.assign({ activeOpacity: 0.7, style: Styles.yesBtn, onPress: onYesPress }, { children: _jsx(Text, Object.assign({ style: Styles.yesText }, { children: t('Save') })) }))] }))] })) })) })));
};
export default AddSocialLink;
