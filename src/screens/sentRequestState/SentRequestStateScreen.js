import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ArrowLeft2, Calendar, Clock, Note, Location, Edit2, ArrowDown2, ArrowRight, TickSquare, } from 'iconsax-react-nativejs';
import { createStyles } from './SentRequestStateScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Icons from '../../constants/Icons';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const SentRequestStateScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    const isLightTheme = String(colors.backgroundColor || '').toLowerCase() === '#ffffff';
    const pickerVisualProps = Platform.OS === 'ios'
        ? {
            themeVariant: isLightTheme ? 'light' : 'dark',
            textColor: isLightTheme ? '#0B1220' : '#F8FAFC',
            accentColor: colors.primaryColor,
        }
        : {};
    const [eventName, setEventName] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [description, setDescription] = useState('');
    const [keepAsSent, setKeepAsSent] = useState(true);
    const [markAsNonIssue, setMarkAsNonIssue] = useState(false);
    const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };
    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (event.type === 'set' && selectedDate) {
            setDate(selectedDate);
        }
    };
    const handleStatusChange = (status) => {
        if (status === 'sent') {
            setKeepAsSent(true);
            setMarkAsNonIssue(false);
        }
        else {
            setKeepAsSent(false);
            setMarkAsNonIssue(true);
        }
    };
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.backButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 20, color: colors.mainTextColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('Sent request state') })), _jsx(TouchableOpacity, Object.assign({ style: Styles.notificationButton, onPress: () => navigation.navigate('NotificationsScreen') }, { children: _jsx(Icons.NotificationBoldBlue, { height: 24, width: 24 }) }))] })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, contentContainerStyle: Styles.scrollContent }, { children: [_jsx(Text, Object.assign({ style: Styles.sectionTitle }, { children: t('Request summary') })), _jsx(SizeBox, { height: 16 }), _jsxs(View, Object.assign({ style: Styles.summaryCard }, { children: [_jsx(Text, Object.assign({ style: Styles.summaryTitle }, { children: t('Enhance lighting & colors') })), _jsxs(View, Object.assign({ style: Styles.summaryMeta }, { children: [_jsxs(View, Object.assign({ style: Styles.metaItem }, { children: [_jsx(Calendar, { size: 12, color: colors.subTextColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: Styles.metaText }, { children: "12.12.2024" }))] })), _jsxs(View, Object.assign({ style: Styles.metaItem }, { children: [_jsx(Clock, { size: 12, color: colors.subTextColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: Styles.metaText }, { children: "12:00" }))] }))] }))] })), _jsx(SizeBox, { height: 24 }), _jsx(Text, Object.assign({ style: Styles.sectionTitle }, { children: t('Edit requested comment') })), _jsx(SizeBox, { height: 16 }), _jsx(Text, Object.assign({ style: Styles.inputLabel }, { children: t('Event name') })), _jsx(SizeBox, { height: 8 }), _jsxs(View, Object.assign({ style: Styles.inputContainer }, { children: [_jsx(Note, { size: 16, color: colors.primaryColor, variant: "Linear" }), _jsx(TextInput, { style: Styles.textInput, placeholder: t('Enter event name'), placeholderTextColor: colors.grayColor, value: eventName, onChangeText: setEventName })] })), _jsx(SizeBox, { height: 16 }), _jsx(Text, Object.assign({ style: Styles.inputLabel }, { children: t('Location') })), _jsx(SizeBox, { height: 8 }), _jsxs(View, Object.assign({ style: Styles.inputContainer }, { children: [_jsx(Location, { size: 16, color: colors.primaryColor, variant: "Linear" }), _jsx(TextInput, { style: Styles.textInput, placeholder: t('Enter location'), placeholderTextColor: colors.grayColor, value: location, onChangeText: setLocation })] })), _jsx(SizeBox, { height: 16 }), _jsx(Text, Object.assign({ style: Styles.inputLabel }, { children: t('Date') })), _jsx(SizeBox, { height: 8 }), _jsxs(TouchableOpacity, Object.assign({ style: Styles.inputContainer, onPress: () => setShowDatePicker(!showDatePicker) }, { children: [_jsx(Calendar, { size: 16, color: colors.primaryColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: [Styles.textInput, { color: date ? colors.mainTextColor : colors.grayColor }] }, { children: date ? formatDate(date) : t('Select date') })), _jsx(ArrowDown2, { size: 20, color: colors.subTextColor, variant: "Linear" })] })), showDatePicker && (_jsx(DateTimePicker, Object.assign({}, pickerVisualProps, { value: date || new Date(), mode: "date", display: Platform.OS === 'ios' ? 'spinner' : 'default', onChange: onDateChange }))), _jsx(SizeBox, { height: 16 }), _jsx(Text, Object.assign({ style: Styles.inputLabel }, { children: t('Description') })), _jsx(SizeBox, { height: 8 }), _jsxs(View, Object.assign({ style: Styles.textAreaContainer }, { children: [_jsx(Edit2, { size: 16, color: colors.primaryColor, variant: "Linear" }), _jsx(TextInput, { style: Styles.textArea, placeholder: t('Write something...'), placeholderTextColor: colors.grayColor, value: description, onChangeText: setDescription, multiline: true, textAlignVertical: "top" })] })), _jsx(SizeBox, { height: 24 }), _jsx(Text, Object.assign({ style: Styles.sectionTitle }, { children: t('Update status') })), _jsx(SizeBox, { height: 16 }), _jsxs(View, Object.assign({ style: Styles.statusRow }, { children: [_jsxs(TouchableOpacity, Object.assign({ style: Styles.statusOption, onPress: () => handleStatusChange('sent') }, { children: [_jsx(Text, Object.assign({ style: Styles.statusText }, { children: t('Keep as sent') })), _jsx(View, Object.assign({ style: [Styles.checkbox, keepAsSent && Styles.checkboxChecked] }, { children: keepAsSent && _jsx(TickSquare, { size: 16, color: colors.primaryColor, variant: "Bold" }) }))] })), _jsxs(TouchableOpacity, Object.assign({ style: Styles.statusOption, onPress: () => handleStatusChange('nonIssue') }, { children: [_jsx(Text, Object.assign({ style: Styles.statusText }, { children: t('Mark as non issue') })), _jsx(View, Object.assign({ style: [Styles.checkbox, markAsNonIssue && Styles.checkboxChecked] }, { children: markAsNonIssue && _jsx(TickSquare, { size: 16, color: colors.primaryColor, variant: "Bold" }) }))] }))] })), _jsx(SizeBox, { height: 30 }), _jsxs(View, Object.assign({ style: Styles.bottomActions }, { children: [_jsx(TouchableOpacity, { children: _jsx(Text, Object.assign({ style: Styles.deleteText }, { children: t('Delete') })) }), _jsxs(View, Object.assign({ style: Styles.rightActions }, { children: [_jsxs(TouchableOpacity, Object.assign({ style: Styles.cancelButton, onPress: () => navigation.goBack() }, { children: [_jsx(Text, Object.assign({ style: Styles.cancelButtonText }, { children: t('Cancel') })), _jsx(ArrowRight, { size: 18, color: "#9B9F9F", variant: "Linear" })] })), _jsxs(TouchableOpacity, Object.assign({ style: Styles.submitButton, onPress: () => navigation.navigate('ReceivedRequestStateScreen') }, { children: [_jsx(Text, Object.assign({ style: Styles.submitButtonText }, { children: t('Submit') })), _jsx(ArrowRight, { size: 18, color: colors.pureWhite, variant: "Linear" })] }))] }))] })), _jsx(SizeBox, { height: 40 })] }))] })));
};
export default SentRequestStateScreen;
