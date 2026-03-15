var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable, Alert } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { createStyles } from '../MenuStyles';
import SizeBox from '../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { ArrowLeft2, Calendar, ArrowDown2 } from 'iconsax-react-nativejs';
import { CalendarList } from 'react-native-calendars';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from 'react-i18next';
const DateOfBirth = ({ navigation }) => {
    var _a, _b, _c, _d, _e;
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const Styles = createStyles(colors);
    const { userProfile, authBootstrap, updateUserAccount } = useAuth();
    const [selectedDate, setSelectedDate] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showYearPicker, setShowYearPicker] = useState(false);
    const [calendarFocusDate, setCalendarFocusDate] = useState(null);
    const bootstrapDob = String((_b = (_a = authBootstrap === null || authBootstrap === void 0 ? void 0 : authBootstrap.user) === null || _a === void 0 ? void 0 : _a.birthdate) !== null && _b !== void 0 ? _b : '').trim();
    const resolvedDob = String((_c = userProfile === null || userProfile === void 0 ? void 0 : userProfile.birthDate) !== null && _c !== void 0 ? _c : '').trim() || (bootstrapDob ? bootstrapDob.slice(0, 10) : '');
    const currentDob = resolvedDob || 'Not set';
    const toDateString = (date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };
    const formatDate = (value) => {
        if (!value)
            return 'Select date';
        const [year, month, day] = value.split('-').map(Number);
        if (!year || !month || !day)
            return value;
        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    };
    const selectedYear = useMemo(() => {
        if (selectedDate) {
            const parsed = new Date(selectedDate);
            if (!Number.isNaN(parsed.getTime()))
                return parsed.getFullYear();
        }
        return new Date().getFullYear();
    }, [selectedDate]);
    const yearOptions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let year = currentYear; year >= 1900; year -= 1) {
            years.push(year);
        }
        return years;
    }, []);
    const openCalendar = () => {
        const seed = selectedDate !== null && selectedDate !== void 0 ? selectedDate : toDateString(new Date());
        setCalendarFocusDate(seed);
        setShowCalendar(true);
    };
    const jumpToYear = (year) => {
        const baseDate = selectedDate ? new Date(selectedDate) : new Date();
        const month = baseDate.getMonth();
        const day = baseDate.getDate();
        const maxDay = new Date(year, month + 1, 0).getDate();
        const nextDate = new Date(year, month, Math.min(day, maxDay));
        const nextString = toDateString(nextDate);
        setSelectedDate(nextString);
        setCalendarFocusDate(nextString);
        setShowYearPicker(false);
    };
    useEffect(() => {
        if (currentDob && currentDob !== 'Not set') {
            setSelectedDate(currentDob);
        }
    }, [currentDob]);
    const markedDates = useMemo(() => {
        if (!selectedDate)
            return {};
        return {
            [selectedDate]: {
                selected: true,
                selectedColor: colors.primaryColor,
                selectedTextColor: colors.pureWhite,
            },
        };
    }, [colors.primaryColor, colors.pureWhite, selectedDate]);
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('dateOfBirth') })), _jsx(View, { style: Styles.headerSpacer })] })), _jsxs(ScrollView, Object.assign({ style: Styles.container, showsVerticalScrollIndicator: false }, { children: [_jsx(SizeBox, { height: 24 }), _jsx(Text, Object.assign({ style: Styles.changePasswordTitle }, { children: t('dateOfBirth') })), _jsx(SizeBox, { height: 16 }), _jsxs(View, Object.assign({ style: Styles.currentValueCard }, { children: [_jsxs(View, { children: [_jsx(Text, Object.assign({ style: Styles.currentValueLabel }, { children: t('currentDateOfBirth') })), _jsx(Text, Object.assign({ style: Styles.currentValueText }, { children: currentDob === 'Not set' ? t('Not set') : formatDate(currentDob) }))] }), _jsx(TouchableOpacity, Object.assign({ style: Styles.editActionButton, onPress: () => setIsEditing(true) }, { children: _jsx(Text, Object.assign({ style: Styles.editActionText }, { children: t('edit') })) }))] })), isEditing && (_jsxs(_Fragment, { children: [_jsx(SizeBox, { height: 24 }), _jsxs(View, Object.assign({ style: Styles.addCardInputGroup }, { children: [_jsx(Text, Object.assign({ style: Styles.addCardLabel }, { children: t('dateOfBirth') })), _jsx(SizeBox, { height: 8 }), _jsxs(TouchableOpacity, Object.assign({ style: Styles.addCardInputContainer, onPress: openCalendar }, { children: [_jsx(Calendar, { size: 16, color: colors.primaryColor, variant: "Linear" }), _jsx(SizeBox, { width: 10 }), _jsx(Text, Object.assign({ style: [Styles.addCardPlaceholder, selectedDate && Styles.addCardInputText] }, { children: selectedDate ? formatDate(selectedDate) : t('selectDate') })), _jsx(ArrowDown2, { size: 20, color: colors.grayColor, variant: "Linear" })] }))] })), _jsxs(View, Object.assign({ style: Styles.editActionsRow }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.cancelButton, onPress: () => setIsEditing(false) }, { children: _jsx(Text, Object.assign({ style: Styles.cancelButtonText }, { children: t('cancel') })) })), _jsx(TouchableOpacity, Object.assign({ style: Styles.saveButton, onPress: () => __awaiter(void 0, void 0, void 0, function* () {
                                            if (!selectedDate)
                                                return;
                                            try {
                                                yield updateUserAccount({ birthdate: selectedDate });
                                                setIsEditing(false);
                                            }
                                            catch (_f) {
                                                Alert.alert(t('Error'), t('Failed to save. Please try again.'));
                                            }
                                        }) }, { children: _jsx(Text, Object.assign({ style: Styles.saveButtonText }, { children: t('save') })) }))] }))] })), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] })), _jsx(Modal, Object.assign({ visible: showCalendar, transparent: true, animationType: "fade", onRequestClose: () => setShowCalendar(false) }, { children: _jsxs(View, Object.assign({ style: Styles.calendarModalOverlay }, { children: [_jsx(Pressable, { style: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }, onPress: () => setShowCalendar(false) }), _jsxs(View, Object.assign({ style: Styles.calendarModalCard }, { children: [_jsx(Text, Object.assign({ style: Styles.calendarModalTitle }, { children: t('selectDateOfBirth') })), _jsx(SizeBox, { height: 12 }), _jsxs(View, Object.assign({ style: Styles.calendarYearRow }, { children: [_jsx(Text, Object.assign({ style: Styles.calendarYearLabel }, { children: t('year') })), _jsxs(TouchableOpacity, Object.assign({ style: Styles.calendarYearButton, onPress: () => setShowYearPicker(true) }, { children: [_jsx(Text, Object.assign({ style: Styles.calendarYearText }, { children: selectedYear })), _jsx(ArrowDown2, { size: 16, color: colors.grayColor, variant: "Linear" })] }))] })), _jsx(SizeBox, { height: 8 }), _jsx(CalendarList, { style: Styles.calendarContainer, current: (_d = calendarFocusDate !== null && calendarFocusDate !== void 0 ? calendarFocusDate : selectedDate) !== null && _d !== void 0 ? _d : toDateString(new Date()), initialDate: (_e = calendarFocusDate !== null && calendarFocusDate !== void 0 ? calendarFocusDate : selectedDate) !== null && _e !== void 0 ? _e : toDateString(new Date()), firstDay: 1, maxDate: toDateString(new Date()), onDayPress: (day) => {
                                        setSelectedDate(day.dateString);
                                        setCalendarFocusDate(day.dateString);
                                    }, markedDates: markedDates, theme: {
                                        calendarBackground: colors.modalBackground,
                                        backgroundColor: colors.modalBackground,
                                        dayTextColor: colors.mainTextColor,
                                        monthTextColor: colors.mainTextColor,
                                        textSectionTitleColor: colors.subTextColor,
                                        selectedDayBackgroundColor: colors.primaryColor,
                                        selectedDayTextColor: colors.pureWhite,
                                        todayTextColor: colors.primaryColor,
                                        weekVerticalMargin: 0,
                                        textDayHeaderFontSize: 11,
                                        textDayFontSize: 14,
                                    }, pastScrollRange: 120, futureScrollRange: 0, scrollEnabled: true, showScrollIndicator: true }), _jsx(SizeBox, { height: 12 }), _jsxs(View, Object.assign({ style: Styles.calendarButtonRow }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.calendarCancelButton, onPress: () => setShowCalendar(false) }, { children: _jsx(Text, Object.assign({ style: Styles.calendarCancelText }, { children: t('cancel') })) })), _jsx(TouchableOpacity, Object.assign({ style: Styles.calendarApplyButton, onPress: () => setShowCalendar(false) }, { children: _jsx(Text, Object.assign({ style: Styles.calendarApplyText }, { children: t('apply') })) }))] }))] }))] })) })), _jsx(Modal, Object.assign({ visible: showYearPicker, transparent: true, animationType: "fade", onRequestClose: () => setShowYearPicker(false) }, { children: _jsxs(View, Object.assign({ style: Styles.selectionModalOverlay }, { children: [_jsx(Pressable, { style: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }, onPress: () => setShowYearPicker(false) }), _jsxs(View, Object.assign({ style: Styles.selectionModalCard }, { children: [_jsx(Text, Object.assign({ style: Styles.selectionModalTitle }, { children: t('year') })), _jsx(ScrollView, { children: yearOptions.map((year) => (_jsx(TouchableOpacity, Object.assign({ style: Styles.selectionOption, onPress: () => jumpToYear(year) }, { children: _jsx(Text, Object.assign({ style: Styles.selectionOptionText }, { children: year })) }), `year-${year}`))) })] }))] })) }))] })));
};
export default DateOfBirth;
