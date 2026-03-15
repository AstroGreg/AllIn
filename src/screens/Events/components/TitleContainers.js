import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, TouchableOpacity } from 'react-native';
import { createStyles } from '../EventsStyles';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const TitleContainers = ({ title, onActionPress }) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    return (_jsxs(View, Object.assign({ style: [Styles.rowCenter, { paddingHorizontal: 20 }] }, { children: [_jsx(Text, Object.assign({ style: Styles.titleText }, { children: title })), _jsx(TouchableOpacity, Object.assign({ onPress: onActionPress }, { children: _jsx(Text, Object.assign({ style: Styles.actionText }, { children: t('View all') })) }))] })));
};
export default TitleContainers;
