import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft2, Calendar, Clock, Edit2, ArrowRight, TickSquare, } from 'iconsax-react-nativejs';
import { createStyles } from './ReceivedRequestStateScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Icons from '../../constants/Icons';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const ReceivedRequestStateScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const [description, setDescription] = useState(t('Enhance Lighting & Colors'));
    const [markAsFixes, setMarkAsFixes] = useState(true);
    const [markAsNonIssue, setMarkAsNonIssue] = useState(false);
    const handleStatusChange = (status) => {
        if (status === 'fixes') {
            setMarkAsFixes(true);
            setMarkAsNonIssue(false);
        }
        else {
            setMarkAsFixes(false);
            setMarkAsNonIssue(true);
        }
    };
    return (_jsxs(View, Object.assign({ style: styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.backButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 20, color: colors.mainTextColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: styles.headerTitle }, { children: t('Received Request State') })), _jsx(TouchableOpacity, Object.assign({ style: styles.notificationButton, onPress: () => navigation.navigate('NotificationsScreen') }, { children: _jsx(Icons.NotificationBoldBlue, { height: 24, width: 24 }) }))] })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, contentContainerStyle: styles.scrollContent }, { children: [_jsx(Text, Object.assign({ style: styles.sectionTitle }, { children: t('Request Summary') })), _jsx(SizeBox, { height: 16 }), _jsxs(View, Object.assign({ style: styles.summaryCard }, { children: [_jsx(Text, Object.assign({ style: styles.summaryTitle }, { children: t('Enhance Lighting & Colors') })), _jsxs(View, Object.assign({ style: styles.summaryMeta }, { children: [_jsxs(View, Object.assign({ style: styles.metaItem }, { children: [_jsx(Calendar, { size: 12, color: colors.subTextColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: styles.metaText }, { children: "12.12.2024" }))] })), _jsxs(View, Object.assign({ style: styles.metaItem }, { children: [_jsx(Clock, { size: 12, color: colors.subTextColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: styles.metaText }, { children: "12:00" }))] }))] }))] })), _jsx(SizeBox, { height: 24 }), _jsx(Text, Object.assign({ style: styles.sectionTitle }, { children: t('Change the Competition Details') })), _jsx(SizeBox, { height: 16 }), _jsx(Text, Object.assign({ style: styles.inputLabel }, { children: t('Edit Competition Details') })), _jsx(SizeBox, { height: 8 }), _jsxs(View, Object.assign({ style: styles.textAreaContainer }, { children: [_jsx(Edit2, { size: 16, color: colors.subTextColor, variant: "Linear" }), _jsx(TextInput, { style: styles.textArea, placeholder: t('Write Something.....'), placeholderTextColor: colors.grayColor, value: description, onChangeText: setDescription, multiline: true, textAlignVertical: "top" })] })), _jsx(SizeBox, { height: 24 }), _jsx(Text, Object.assign({ style: styles.sectionTitle }, { children: t('Update Status') })), _jsx(SizeBox, { height: 16 }), _jsxs(View, Object.assign({ style: styles.statusRow }, { children: [_jsxs(TouchableOpacity, Object.assign({ style: styles.statusOption, onPress: () => handleStatusChange('fixes') }, { children: [_jsx(Text, Object.assign({ style: styles.statusText }, { children: t('Mark as Fixes') })), _jsx(View, Object.assign({ style: [styles.checkbox, markAsFixes && styles.checkboxChecked] }, { children: markAsFixes && _jsx(TickSquare, { size: 16, color: colors.primaryColor, variant: "Bold" }) }))] })), _jsxs(TouchableOpacity, Object.assign({ style: styles.statusOption, onPress: () => handleStatusChange('nonIssue') }, { children: [_jsx(Text, Object.assign({ style: styles.statusText }, { children: t('Mark as Non Issue') })), _jsx(View, Object.assign({ style: [styles.checkbox, markAsNonIssue && styles.checkboxChecked] }, { children: markAsNonIssue && _jsx(TickSquare, { size: 16, color: colors.primaryColor, variant: "Bold" }) }))] }))] })), _jsx(SizeBox, { height: 30 }), _jsxs(View, Object.assign({ style: styles.bottomActions }, { children: [_jsxs(TouchableOpacity, Object.assign({ style: styles.cancelButton, onPress: () => navigation.goBack() }, { children: [_jsx(Text, Object.assign({ style: styles.cancelButtonText }, { children: t('Cancel') })), _jsx(ArrowRight, { size: 18, color: colors.subTextColor, variant: "Linear" })] })), _jsxs(TouchableOpacity, Object.assign({ style: styles.updateButton }, { children: [_jsx(Text, Object.assign({ style: styles.updateButtonText }, { children: t('Update Request') })), _jsx(ArrowRight, { size: 18, color: colors.pureWhite, variant: "Linear" })] }))] })), _jsx(SizeBox, { height: 40 })] }))] })));
};
export default ReceivedRequestStateScreen;
