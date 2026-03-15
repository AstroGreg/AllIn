import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft2, AddSquare, CloseCircle, TickSquare, User, } from 'iconsax-react-nativejs';
import { createStyles } from './AddDisciplineToCompetitionScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Icons from '../../constants/Icons';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const AddToEventScreen = ({ navigation, route }) => {
    var _a, _b;
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const [chestNumber, setChestNumber] = useState('');
    const [selectedEvents, setSelectedEvents] = useState(['100m', '200m']);
    const [showEventPicker, setShowEventPicker] = useState(false);
    const [eventSearch, setEventSearch] = useState('');
    const [useDefaultChest, setUseDefaultChest] = useState(false);
    const suggestedEvents = useMemo(() => ['60m', '100m', '200m', '400m', '800m', '1500m', '5K', '10K', 'Long jump', 'Shot put'], []);
    const eventData = ((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.event) || {
        title: 'BK Studentent 23',
        date: '2 Nov, 2025',
        location: 'Berlin, Germany',
    };
    const defaultChestNumber = String(((_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.defaultChestNumber) || '').trim();
    const addEvent = (value) => {
        const cleaned = value.trim();
        if (!cleaned)
            return;
        if (selectedEvents.includes(cleaned))
            return;
        setSelectedEvents((prev) => [...prev, cleaned]);
    };
    const removeEvent = (value) => {
        setSelectedEvents((prev) => prev.filter((event) => event !== value));
    };
    const handleConfirm = () => {
        navigation.navigate('EventSummaryScreen', {
            event: eventData,
            personal: {
                name: 'James Ray',
                chestNumber: useDefaultChest ? (defaultChestNumber || null) : (chestNumber.trim() || null),
                events: selectedEvents,
            },
        });
    };
    return (_jsxs(View, Object.assign({ style: styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.backButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.mainTextColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: styles.headerTitle }, { children: t('Subscribe') })), _jsx(TouchableOpacity, Object.assign({ style: styles.notificationButton, onPress: () => navigation.navigate('NotificationsScreen') }, { children: _jsx(Icons.NotificationBoldBlue, { height: 24, width: 24 }) }))] })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, contentContainerStyle: styles.scrollContent }, { children: [_jsx(Text, Object.assign({ style: styles.sectionTitle }, { children: t('Event Details') })), _jsx(SizeBox, { height: 16 }), _jsxs(View, Object.assign({ style: styles.eventDetailsCard }, { children: [_jsxs(View, Object.assign({ style: styles.detailRow }, { children: [_jsx(Text, Object.assign({ style: styles.detailLabel }, { children: t('Event Name') })), _jsx(Text, Object.assign({ style: styles.detailValue }, { children: eventData.title }))] })), _jsx(View, { style: styles.divider }), _jsxs(View, Object.assign({ style: styles.detailRow }, { children: [_jsx(Text, Object.assign({ style: styles.detailLabel }, { children: t('Date') })), _jsx(Text, Object.assign({ style: styles.detailValue }, { children: eventData.date }))] })), _jsx(View, { style: styles.divider }), _jsxs(View, Object.assign({ style: styles.detailRow }, { children: [_jsx(Text, Object.assign({ style: styles.detailLabel }, { children: t('Location') })), _jsx(Text, Object.assign({ style: styles.detailValue }, { children: eventData.location }))] }))] })), _jsx(SizeBox, { height: 40 }), _jsx(Text, Object.assign({ style: styles.descriptionText }, { children: t('Select the event types you participated in.') })), _jsx(SizeBox, { height: 12 }), _jsx(Text, Object.assign({ style: styles.inputLabel }, { children: t('Events') })), _jsx(SizeBox, { height: 8 }), _jsxs(View, Object.assign({ style: styles.eventsInputContainer }, { children: [_jsx(View, Object.assign({ style: styles.eventChipsContainer }, { children: selectedEvents.map((event, index) => (_jsxs(TouchableOpacity, Object.assign({ style: styles.eventChip, onPress: () => removeEvent(event), activeOpacity: 0.8 }, { children: [_jsx(Text, Object.assign({ style: styles.eventChipText }, { children: event })), _jsx(CloseCircle, { size: 14, color: colors.grayColor, variant: "Linear" })] }), `${event}-${index}`))) })), _jsx(TouchableOpacity, Object.assign({ style: styles.addEventIconButton, onPress: () => setShowEventPicker((prev) => !prev), activeOpacity: 0.8 }, { children: _jsx(AddSquare, { size: 20, color: colors.primaryColor, variant: "Linear" }) }))] })), showEventPicker && (_jsxs(View, Object.assign({ style: styles.eventPicker }, { children: [_jsx(Text, Object.assign({ style: styles.eventPickerTitle }, { children: t('Select disciplines') })), _jsx(View, Object.assign({ style: styles.eventPickerGrid }, { children: suggestedEvents.map((item) => {
                                    const isSelected = selectedEvents.includes(item);
                                    return (_jsx(TouchableOpacity, Object.assign({ style: [styles.suggestionChip, isSelected && styles.suggestionChipActive], onPress: () => addEvent(item), activeOpacity: 0.8 }, { children: _jsx(Text, Object.assign({ style: [styles.suggestionText, isSelected && styles.suggestionTextActive] }, { children: item })) }), item));
                                }) }))] }))), _jsx(SizeBox, { height: 16 }), _jsx(Text, Object.assign({ style: styles.inputLabelBold }, { children: t('Chest Number') })), _jsx(SizeBox, { height: 8 }), _jsxs(View, Object.assign({ style: styles.chestNumberInput }, { children: [_jsx(User, { size: 16, color: colors.subTextColor, variant: "Linear" }), _jsx(TextInput, { style: styles.textInput, placeholder: t('Enter Chest Number'), placeholderTextColor: colors.grayColor, value: chestNumber, onChangeText: setChestNumber, editable: !useDefaultChest })] })), _jsxs(TouchableOpacity, Object.assign({ style: styles.defaultChestRow, onPress: () => {
                            if (!defaultChestNumber)
                                return;
                            setUseDefaultChest((prev) => !prev);
                        }, activeOpacity: 0.8 }, { children: [_jsx(View, Object.assign({ style: [styles.defaultChestBox, useDefaultChest && styles.defaultChestBoxActive] }, { children: useDefaultChest && _jsx(TickSquare, { size: 14, color: colors.pureWhite, variant: "Bold" }) })), _jsx(Text, Object.assign({ style: styles.defaultChestText }, { children: defaultChestNumber
                                    ? `${t('Use default number')} (${defaultChestNumber})`
                                    : t('No saved chest number yet. Enter the chest number for this competition below.') }))] })), _jsx(SizeBox, { height: 40 })] })), _jsxs(View, Object.assign({ style: styles.bottomContainer }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.confirmButton, onPress: handleConfirm }, { children: _jsx(Text, Object.assign({ style: styles.confirmButtonText }, { children: t('Continue') })) })), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom : 20 })] }))] })));
};
export default AddToEventScreen;
