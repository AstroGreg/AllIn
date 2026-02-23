import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { CalendarList } from 'react-native-calendars';
import { ArrowDown2 } from 'iconsax-react-nativejs';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import SizeBox from '../../constants/SizeBox';

type Props = {
  visible: boolean;
  value?: string | null;
  onClose: () => void;
  onApply: (date: string | null) => void;
  title?: string;
};

const toDateString = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const BirthDatePickerModal = ({ visible, value, onClose, onApply, title }: Props) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [calendarFocusDate, setCalendarFocusDate] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    const next = value && String(value).trim() ? String(value).slice(0, 10) : null;
    setSelectedDate(next);
    setCalendarFocusDate(next ?? toDateString(new Date()));
    setShowYearPicker(false);
  }, [visible, value]);

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
    for (let year = currentYear; year >= 1900; year -= 1) years.push(year);
    return years;
  }, []);

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

  return (
    <>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 16 }}>
          <Pressable style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} onPress={onClose} />
          <View
            style={{
              borderRadius: 16,
              backgroundColor: colors.modalBackground,
              borderWidth: 0.5,
              borderColor: colors.lightGrayColor,
              padding: 16,
              maxHeight: '80%',
            }}
          >
            <Text style={{ color: colors.mainTextColor, fontSize: 18, fontWeight: '700' }}>
              {title || t('Select date of birth')}
            </Text>
            <SizeBox height={12} />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: colors.subTextColor, fontSize: 14, fontWeight: '600' }}>{t('year')}</Text>
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: colors.lightGrayColor }}
                onPress={() => setShowYearPicker(true)}
              >
                <Text style={{ color: colors.mainTextColor, fontSize: 15, fontWeight: '600' }}>{selectedYear}</Text>
                <ArrowDown2 size={16} color={colors.grayColor} variant="Linear" />
              </TouchableOpacity>
            </View>
            <SizeBox height={8} />
            <CalendarList
              style={{ maxHeight: 360 }}
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
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{ flex: 1, minHeight: 46, borderRadius: 12, borderWidth: 1, borderColor: colors.lightGrayColor, alignItems: 'center', justifyContent: 'center' }}
                onPress={onClose}
              >
                <Text style={{ color: colors.mainTextColor, fontWeight: '600' }}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, minHeight: 46, borderRadius: 12, backgroundColor: colors.primaryColor, alignItems: 'center', justifyContent: 'center' }}
                onPress={() => onApply(selectedDate)}
              >
                <Text style={{ color: colors.pureWhite, fontWeight: '700' }}>{t('apply')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showYearPicker} transparent animationType="fade" onRequestClose={() => setShowYearPicker(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 20 }}>
          <Pressable
            style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
            onPress={() => setShowYearPicker(false)}
          />
          <View style={{ maxHeight: '70%', borderRadius: 16, backgroundColor: colors.modalBackground, borderWidth: 0.5, borderColor: colors.lightGrayColor, padding: 16 }}>
            <Text style={{ color: colors.mainTextColor, fontSize: 18, fontWeight: '700' }}>{t('year')}</Text>
            <ScrollView>
              {yearOptions.map((year) => (
                <TouchableOpacity
                  key={`shared-year-${year}`}
                  style={{ paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: colors.lightGrayColor }}
                  onPress={() => jumpToYear(year)}
                >
                  <Text style={{ color: year === selectedYear ? colors.primaryColor : colors.mainTextColor, fontSize: 16, fontWeight: year === selectedYear ? '700' : '500' }}>
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default BirthDatePickerModal;

