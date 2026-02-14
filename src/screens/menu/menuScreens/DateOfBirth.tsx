import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { createStyles } from '../MenuStyles'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../../../context/ThemeContext'
import { ArrowLeft2, Calendar, ArrowDown2 } from 'iconsax-react-nativejs'
import { CalendarList } from 'react-native-calendars'
import { useAuth } from '../../../context/AuthContext'
import { useTranslation } from 'react-i18next'

const DateOfBirth = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const Styles = createStyles(colors);
    const { userProfile, updateUserProfile } = useAuth();
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showYearPicker, setShowYearPicker] = useState(false);
    const [calendarFocusDate, setCalendarFocusDate] = useState<string | null>(null);

    const currentDob = userProfile?.birthDate || 'Not set';

    const toDateString = (date: Date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const formatDate = (value?: string | null) => {
        if (!value) return 'Select date';
        const [year, month, day] = value.split('-').map(Number);
        if (!year || !month || !day) return value;
        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    };

    const selectedYear = useMemo(() => {
        if (selectedDate) {
            const parsed = new Date(selectedDate);
            if (!Number.isNaN(parsed.getTime())) return parsed.getFullYear();
        }
        return new Date().getFullYear();
    }, [selectedDate]);

    const yearOptions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years: number[] = [];
        for (let year = currentYear; year >= 1900; year -= 1) {
            years.push(year);
        }
        return years;
    }, []);

    const openCalendar = () => {
        const seed = selectedDate ?? toDateString(new Date());
        setCalendarFocusDate(seed);
        setShowCalendar(true);
    };

    const jumpToYear = (year: number) => {
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
        if (!selectedDate) return {};
        return {
            [selectedDate]: {
                selected: true,
                selectedColor: colors.primaryColor,
                selectedTextColor: colors.pureWhite,
            },
        };
    }, [colors.primaryColor, colors.pureWhite, selectedDate]);

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{t('dateOfBirth')}</Text>
                <View style={Styles.headerSpacer} />
            </View>

            <ScrollView style={Styles.container} showsVerticalScrollIndicator={false}>
                <SizeBox height={24} />

                <Text style={Styles.changePasswordTitle}>{t('dateOfBirth')}</Text>
                <SizeBox height={16} />

                <View style={Styles.currentValueCard}>
                    <View>
                        <Text style={Styles.currentValueLabel}>{t('currentDateOfBirth')}</Text>
                        <Text style={Styles.currentValueText}>{currentDob === 'Not set' ? currentDob : formatDate(currentDob)}</Text>
                    </View>
                    <TouchableOpacity style={Styles.editActionButton} onPress={() => setIsEditing(true)}>
                        <Text style={Styles.editActionText}>{t('edit')}</Text>
                    </TouchableOpacity>
                </View>

                {isEditing && (
                    <>
                        <SizeBox height={24} />
                        <View style={Styles.addCardInputGroup}>
                            <Text style={Styles.addCardLabel}>{t('dateOfBirth')}</Text>
                            <SizeBox height={8} />
                            <TouchableOpacity
                                style={Styles.addCardInputContainer}
                                onPress={openCalendar}
                            >
                                <Calendar size={16} color={colors.primaryColor} variant="Linear" />
                                <SizeBox width={10} />
                                <Text style={[Styles.addCardPlaceholder, selectedDate && Styles.addCardInputText]}>
                                    {selectedDate ? formatDate(selectedDate) : t('selectDate')}
                                </Text>
                                <ArrowDown2 size={20} color={colors.grayColor} variant="Linear" />
                            </TouchableOpacity>
                        </View>

                        <View style={Styles.editActionsRow}>
                            <TouchableOpacity style={Styles.cancelButton} onPress={() => setIsEditing(false)}>
                                <Text style={Styles.cancelButtonText}>{t('cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={Styles.saveButton}
                                onPress={async () => {
                                    if (!selectedDate) return;
                                    await updateUserProfile({ birthDate: selectedDate });
                                    setIsEditing(false);
                                }}
                            >
                                <Text style={Styles.saveButtonText}>{t('save')}</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>

            <Modal visible={showCalendar} transparent animationType="fade" onRequestClose={() => setShowCalendar(false)}>
                <View style={Styles.calendarModalOverlay}>
                    <Pressable
                        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
                        onPress={() => setShowCalendar(false)}
                    />
                    <View style={Styles.calendarModalCard}>
                        <Text style={Styles.calendarModalTitle}>{t('selectDateOfBirth')}</Text>
                        <SizeBox height={12} />
                        <View style={Styles.calendarYearRow}>
                            <Text style={Styles.calendarYearLabel}>{t('year')}</Text>
                            <TouchableOpacity
                                style={Styles.calendarYearButton}
                                onPress={() => setShowYearPicker(true)}
                            >
                                <Text style={Styles.calendarYearText}>{selectedYear}</Text>
                                <ArrowDown2 size={16} color={colors.grayColor} variant="Linear" />
                            </TouchableOpacity>
                        </View>
                        <SizeBox height={8} />
                        <CalendarList
                            style={Styles.calendarContainer}
                            current={calendarFocusDate ?? selectedDate ?? toDateString(new Date())}
                            initialDate={calendarFocusDate ?? selectedDate ?? toDateString(new Date())}
                            firstDay={1}
                            maxDate={toDateString(new Date())}
                            onDayPress={(day) => {
                                setSelectedDate(day.dateString);
                                setCalendarFocusDate(day.dateString);
                            }}
                            markedDates={markedDates}
                            theme={{
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
                            }}
                            pastScrollRange={120}
                            futureScrollRange={0}
                            scrollEnabled
                            showScrollIndicator
                        />
                        <SizeBox height={12} />
                        <View style={Styles.calendarButtonRow}>
                            <TouchableOpacity style={Styles.calendarCancelButton} onPress={() => setShowCalendar(false)}>
                                <Text style={Styles.calendarCancelText}>{t('cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={Styles.calendarApplyButton}
                                onPress={() => setShowCalendar(false)}
                            >
                                <Text style={Styles.calendarApplyText}>{t('apply')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={showYearPicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowYearPicker(false)}
            >
                <View style={Styles.selectionModalOverlay}>
                    <Pressable
                        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
                        onPress={() => setShowYearPicker(false)}
                    />
                    <View style={Styles.selectionModalCard}>
                        <Text style={Styles.selectionModalTitle}>{t('year')}</Text>
                        <ScrollView>
                            {yearOptions.map((year) => (
                                <TouchableOpacity
                                    key={`year-${year}`}
                                    style={Styles.selectionOption}
                                    onPress={() => jumpToYear(year)}
                                >
                                    <Text style={Styles.selectionOptionText}>{year}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default DateOfBirth
