import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { ArrowDown2, ArrowLeft2, ArrowRight2 } from 'iconsax-react-nativejs';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import SizeBox from '../../constants/SizeBox';
const toDateString = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};
const DatePickerModal = ({ visible, value, onClose, onApply, title, maxDate }) => {
    var _a;
    const { colors } = useTheme();
    const { t } = useTranslation();
    const [calendarDate, setCalendarDate] = useState(null);
    const [calendarViewDate, setCalendarViewDate] = useState(null);
    const [showYearDropdown, setShowYearDropdown] = useState(false);
    useEffect(() => {
        if (!visible)
            return;
        const seedDate = value ? new Date(`${String(value).slice(0, 10)}T00:00:00`) : new Date();
        const safe = Number.isNaN(seedDate.getTime()) ? new Date() : seedDate;
        const seed = toDateString(safe);
        setCalendarDate(seed);
        setCalendarViewDate(seed);
        setShowYearDropdown(false);
    }, [value, visible]);
    const yearOptions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let year = currentYear; year >= 1930; year -= 1) {
            years.push(year);
        }
        return years;
    }, []);
    const selectedCalendarYear = useMemo(() => {
        const source = calendarViewDate || calendarDate;
        const parsed = Number(String(source || '').split('-')[0]);
        return Number.isFinite(parsed) ? parsed : new Date().getFullYear();
    }, [calendarDate, calendarViewDate]);
    const calendarRenderKey = useMemo(() => {
        const source = String(calendarViewDate || calendarDate || '');
        const [year, month] = source.split('-');
        if (year && month) {
            return `shared-birth-cal-${year}-${month}`;
        }
        return 'shared-birth-cal-default';
    }, [calendarDate, calendarViewDate]);
    const handleSelectYear = (year) => {
        const source = String(calendarViewDate || calendarDate || toDateString(new Date()));
        const [, monthRaw, dayRaw] = source.split('-').map(Number);
        const month = Number.isFinite(monthRaw) && monthRaw >= 1 && monthRaw <= 12 ? monthRaw : 1;
        const day = Number.isFinite(dayRaw) && dayRaw >= 1 ? dayRaw : 1;
        const daysInMonth = new Date(year, month, 0).getDate();
        const safeDay = Math.min(day, daysInMonth);
        const nextDate = `${year}-${String(month).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`;
        setCalendarViewDate(nextDate);
        setCalendarDate(nextDate);
        setShowYearDropdown(false);
    };
    const displayedCalendarMonthLabel = useMemo(() => {
        const source = String(calendarViewDate || calendarDate || toDateString(new Date()));
        const [yearRaw, monthRaw] = source.split('-').map(Number);
        const year = Number.isFinite(yearRaw) ? yearRaw : new Date().getFullYear();
        const month = Number.isFinite(monthRaw) && monthRaw >= 1 && monthRaw <= 12 ? monthRaw : 1;
        return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
            month: 'long',
            year: 'numeric',
        });
    }, [calendarDate, calendarViewDate]);
    const shiftCalendarMonth = (delta) => {
        const source = String(calendarViewDate || calendarDate || toDateString(new Date()));
        const [yearRaw, monthRaw] = source.split('-').map(Number);
        const year = Number.isFinite(yearRaw) ? yearRaw : new Date().getFullYear();
        const month = Number.isFinite(monthRaw) && monthRaw >= 1 && monthRaw <= 12 ? monthRaw : 1;
        const nextMonth = new Date(year, month - 1 + delta, 1);
        setCalendarViewDate(toDateString(nextMonth));
        setShowYearDropdown(false);
    };
    return (_jsx(Modal, Object.assign({ visible: visible, transparent: true, animationType: "fade", onRequestClose: () => {
            setShowYearDropdown(false);
            onClose();
        } }, { children: _jsxs(View, Object.assign({ style: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', paddingHorizontal: 20 } }, { children: [_jsx(Pressable, { style: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }, onPress: () => {
                        setShowYearDropdown(false);
                        onClose();
                    } }), _jsxs(View, Object.assign({ style: {
                        backgroundColor: colors.cardBackground,
                        borderRadius: 18,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: colors.lightGrayColor,
                    } }, { children: [_jsxs(View, Object.assign({ style: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 } }, { children: [_jsx(Text, Object.assign({ style: { color: colors.mainTextColor, fontSize: 16, fontWeight: '600' } }, { children: title || t('Select date of birth') })), _jsxs(TouchableOpacity, Object.assign({ style: {
                                        minHeight: 34,
                                        borderRadius: 10,
                                        borderWidth: 1,
                                        borderColor: colors.lightGrayColor,
                                        backgroundColor: colors.btnBackgroundColor,
                                        paddingHorizontal: 10,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 6,
                                    }, activeOpacity: 0.85, onPress: () => setShowYearDropdown((prev) => !prev) }, { children: [_jsx(Text, Object.assign({ style: { color: colors.mainTextColor, fontSize: 13, fontWeight: '500' } }, { children: selectedCalendarYear })), _jsx(ArrowDown2, { size: 16, color: colors.subTextColor, variant: "Linear" })] }))] })), showYearDropdown ? (_jsx(View, Object.assign({ style: {
                                marginTop: 8,
                                maxHeight: 180,
                                borderWidth: 1,
                                borderColor: colors.lightGrayColor,
                                borderRadius: 10,
                                backgroundColor: colors.btnBackgroundColor,
                                overflow: 'hidden',
                            } }, { children: _jsx(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, nestedScrollEnabled: true }, { children: yearOptions.map((year) => {
                                    const active = year === selectedCalendarYear;
                                    return (_jsx(TouchableOpacity, Object.assign({ style: {
                                            paddingHorizontal: 12,
                                            paddingVertical: 10,
                                            borderBottomWidth: 0.5,
                                            borderBottomColor: colors.lightGrayColor,
                                            backgroundColor: active ? colors.secondaryBlueColor : 'transparent',
                                        }, onPress: () => handleSelectYear(year) }, { children: _jsx(Text, Object.assign({ style: {
                                                color: active ? colors.primaryColor : colors.mainTextColor,
                                                fontSize: 13,
                                                fontWeight: active ? '600' : '400',
                                            } }, { children: year })) }), `shared-birth-year-${year}`));
                                }) })) }))) : null, _jsx(SizeBox, { height: 10 }), _jsx(Calendar, { current: (_a = (calendarViewDate || calendarDate)) !== null && _a !== void 0 ? _a : undefined, hideArrows: true, customHeaderTitle: _jsxs(View, Object.assign({ style: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 } }, { children: [_jsx(TouchableOpacity, Object.assign({ style: {
                                            width: 28,
                                            height: 28,
                                            borderRadius: 14,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: colors.btnBackgroundColor,
                                        }, onPress: () => shiftCalendarMonth(-1), activeOpacity: 0.8 }, { children: _jsx(ArrowLeft2, { size: 18, color: colors.mainTextColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: { color: colors.mainTextColor, fontSize: 15, fontWeight: '600', textTransform: 'capitalize' } }, { children: displayedCalendarMonthLabel })), _jsx(TouchableOpacity, Object.assign({ style: {
                                            width: 28,
                                            height: 28,
                                            borderRadius: 14,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: colors.btnBackgroundColor,
                                        }, onPress: () => shiftCalendarMonth(1), activeOpacity: 0.8 }, { children: _jsx(ArrowRight2, { size: 18, color: colors.mainTextColor, variant: "Linear" }) }))] })), markedDates: calendarDate ? { [calendarDate]: { selected: true, selectedColor: colors.primaryColor } } : undefined, onDayPress: (day) => {
                                setCalendarDate(day.dateString);
                                setCalendarViewDate(day.dateString);
                            }, onMonthChange: (month) => {
                                if (month === null || month === void 0 ? void 0 : month.dateString) {
                                    setCalendarViewDate(month.dateString);
                                }
                            }, enableSwipeMonths: true, maxDate: maxDate === undefined ? toDateString(new Date()) : maxDate || undefined, theme: {
                                calendarBackground: colors.cardBackground,
                                textSectionTitleColor: colors.grayColor,
                                dayTextColor: colors.mainTextColor,
                                monthTextColor: colors.mainTextColor,
                                arrowColor: colors.primaryColor,
                                selectedDayBackgroundColor: colors.primaryColor,
                                selectedDayTextColor: colors.pureWhite,
                                todayTextColor: colors.primaryColor,
                            }, style: { borderRadius: 12 } }, calendarRenderKey), _jsx(TouchableOpacity, Object.assign({ style: {
                                marginTop: 12,
                                borderRadius: 12,
                                backgroundColor: colors.primaryColor,
                                paddingVertical: 12,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }, onPress: () => {
                                onApply(calendarDate);
                                setShowYearDropdown(false);
                            } }, { children: _jsx(Text, Object.assign({ style: { color: colors.pureWhite, fontSize: 13, fontWeight: '600' } }, { children: t('Done') })) }))] }))] })) })));
};
export default DatePickerModal;
