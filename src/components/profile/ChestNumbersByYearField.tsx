import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import Fonts from '../../constants/Fonts';
import { useTheme } from '../../context/ThemeContext';

type ChestNumbersByYearFieldProps = {
  currentYear: string;
  values: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
  label: string;
  helperText?: string;
  addYearLabel: string;
  moreYearsLabel: string;
  inputPlaceholder: string;
};

const ChestNumbersByYearField = ({
  currentYear,
  values,
  onChange,
  label,
  helperText,
  addYearLabel,
  moreYearsLabel,
  inputPlaceholder,
}: ChestNumbersByYearFieldProps) => {
  const { colors } = useTheme();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          gap: 10,
        },
        label: {
          ...Fonts.medium14,
          color: colors.mainTextColor,
        },
        helperText: {
          ...Fonts.regular12,
          color: colors.subTextColor,
          lineHeight: 18,
        },
        chipsRow: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
        },
        chip: {
          borderRadius: 999,
          borderWidth: 1,
          borderColor: colors.borderColor,
          backgroundColor: colors.btnBackgroundColor,
          paddingHorizontal: 12,
          paddingVertical: 8,
        },
        chipActive: {
          borderColor: colors.primaryColor,
          backgroundColor: colors.secondaryBlueColor,
        },
        chipText: {
          ...Fonts.regular12,
          color: colors.subTextColor,
        },
        chipTextActive: {
          color: colors.primaryColor,
          fontWeight: '600',
        },
        addChip: {
          borderStyle: 'dashed',
        },
        inputWrap: {
          borderWidth: 0.5,
          borderColor: colors.borderColor,
          borderRadius: 12,
          backgroundColor: colors.secondaryColor,
          paddingHorizontal: 16,
          minHeight: 54,
          justifyContent: 'center',
        },
        input: {
          ...Fonts.regular14,
          color: colors.mainTextColor,
          paddingVertical: 14,
        },
        yearHint: {
          ...Fonts.regular12,
          color: colors.subTextColor,
        },
        modalOverlay: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'center',
          paddingHorizontal: 20,
        },
        modalCard: {
          backgroundColor: colors.cardBackground,
          borderRadius: 16,
          padding: 16,
          maxHeight: '70%',
        },
        modalTitle: {
          ...Fonts.medium16,
          color: colors.mainTextColor,
          marginBottom: 12,
        },
        option: {
          paddingVertical: 10,
          borderBottomWidth: 0.5,
          borderBottomColor: colors.lightGrayColor,
        },
        optionText: {
          ...Fonts.regular14,
          color: colors.mainTextColor,
        },
      }),
    [colors],
  );

  const knownYears = useMemo(() => {
    const years = Array.from(new Set([currentYear, selectedYear, ...Object.keys(values)]))
      .filter((year) => /^\d{4}$/.test(year))
      .sort((a, b) => Number(b) - Number(a));
    return years;
  }, [currentYear, selectedYear, values]);

  const quickYears = useMemo(() => knownYears.slice(0, 4), [knownYears]);

  const yearOptions = useMemo(() => {
    const start = Math.max(Number(currentYear) + 1, new Date().getFullYear() + 1);
    const out: string[] = [];
    for (let year = start; year >= 2000; year -= 1) {
      const safeYear = String(year);
      if (safeYear !== selectedYear && Object.prototype.hasOwnProperty.call(values, safeYear)) continue;
      out.push(safeYear);
    }
    return out;
  }, [currentYear, selectedYear, values]);

  useEffect(() => {
    if (!knownYears.includes(selectedYear)) {
      setSelectedYear(knownYears[0] ?? currentYear);
    }
  }, [currentYear, knownYears, selectedYear]);

  const selectedValue = String(values[selectedYear] ?? '');

  return (
    <View style={styles.container}>
      <View style={{ gap: 4 }}>
        <Text style={styles.label}>{label}</Text>
        {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}
      </View>

      <View style={styles.chipsRow}>
        {quickYears.map((year) => {
          const isActive = year === selectedYear;
          const value = String(values[year] ?? '').trim();
          return (
            <TouchableOpacity
              key={`chest-year-${year}`}
              style={[styles.chip, isActive ? styles.chipActive : null]}
              activeOpacity={0.85}
              onPress={() => setSelectedYear(year)}
            >
              <Text style={[styles.chipText, isActive ? styles.chipTextActive : null]}>
                {value ? `${year} · ${value}` : year}
              </Text>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={[styles.chip, styles.addChip]}
          activeOpacity={0.85}
          onPress={() => setShowYearPicker(true)}
        >
          <Text style={styles.chipText}>{knownYears.length > 4 ? moreYearsLabel : addYearLabel}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ gap: 6 }}>
        <Text style={styles.yearHint}>{selectedYear}</Text>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={selectedValue}
            placeholder={inputPlaceholder}
            placeholderTextColor={colors.grayColor}
            onChangeText={(raw) => {
              const nextValue = String(raw || '').replace(/[^0-9]/g, '');
              const next = { ...values };
              if (!nextValue) {
                delete next[selectedYear];
              } else {
                next[selectedYear] = nextValue;
              }
              onChange(next);
            }}
          />
        </View>
      </View>

      <Modal visible={showYearPicker} transparent animationType="fade" onRequestClose={() => setShowYearPicker(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }} onPress={() => setShowYearPicker(false)} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{moreYearsLabel}</Text>
            <ScrollView>
              {yearOptions.map((year) => (
                <TouchableOpacity
                  key={`chest-picker-${year}`}
                  style={styles.option}
                  onPress={() => {
                    setSelectedYear(year);
                    setShowYearPicker(false);
                  }}
                >
                  <Text style={styles.optionText}>{year}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ChestNumbersByYearField;
