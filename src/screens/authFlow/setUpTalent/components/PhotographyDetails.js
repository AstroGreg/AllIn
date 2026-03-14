import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, TouchableOpacity } from 'react-native';
import { createStyles } from '../AddTalentStyles';
import Icons from '../../../../constants/Icons';
import SizeBox from '../../../../constants/SizeBox';
import { useTheme } from '../../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const PhotographyDetails = ({ title, wesite, isSelected = false, onPress, isIcon = true, disabled = false, isRightAction = true, isDelete = false, onPressDelete }) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    return (_jsxs(TouchableOpacity, Object.assign({ disabled: disabled, onPress: onPress, activeOpacity: 0.7, style: [Styles.photographyDetailsContainer, isSelected && { borderColor: colors.primaryColor }] }, { children: [_jsxs(View, Object.assign({ style: [Styles.row, { justifyContent: 'space-between', }] }, { children: [_jsx(Text, Object.assign({ style: Styles.tabText }, { children: t('Name') })), _jsx(Text, Object.assign({ style: Styles.titleText, numberOfLines: 1 }, { children: title }))] })), _jsxs(View, Object.assign({ style: [Styles.row, { justifyContent: 'space-between', }] }, { children: [_jsx(Text, Object.assign({ style: Styles.tabText }, { children: t('wesite') })), _jsx(Text, Object.assign({ style: Styles.titleText, numberOfLines: 1 }, { children: wesite }))] })), _jsxs(View, Object.assign({ style: [Styles.row, Styles.actionIcons] }, { children: [_jsx(TouchableOpacity, Object.assign({ onPress: onPressDelete }, { children: _jsx(Icons.EditDetails, { height: 24, width: 24 }) })), _jsx(SizeBox, { width: 0 }), _jsx(TouchableOpacity, Object.assign({ onPress: onPressDelete }, { children: _jsx(Icons.Trash, { height: 24, width: 24 }) }))] }))] })));
};
export default PhotographyDetails;
