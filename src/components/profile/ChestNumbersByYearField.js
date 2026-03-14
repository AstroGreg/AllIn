import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Fonts from '../../constants/Fonts';
import { useTheme } from '../../context/ThemeContext';
const ChestNumbersByYearField = ({ currentYear, values, onChange, label, helperText, addYearLabel, moreYearsLabel, inputPlaceholder, }) => {
    var _a;
    const { colors } = useTheme();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [showYearPicker, setShowYearPicker] = useState(false);
    const styles = useMemo(() => StyleSheet.create({
        container: {
            gap: 10,
        },
        label: Object.assign(Object.assign({}, Fonts.medium14), { color: colors.mainTextColor }),
        helperText: Object.assign(Object.assign({}, Fonts.regular12), { color: colors.subTextColor, lineHeight: 18 }),
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
        chipText: Object.assign(Object.assign({}, Fonts.regular12), { color: colors.subTextColor }),
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
        input: Object.assign(Object.assign({}, Fonts.regular14), { color: colors.mainTextColor, paddingVertical: 14 }),
        yearHint: Object.assign(Object.assign({}, Fonts.regular12), { color: colors.subTextColor }),
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
        modalTitle: Object.assign(Object.assign({}, Fonts.medium16), { color: colors.mainTextColor, marginBottom: 12 }),
        option: {
            paddingVertical: 10,
            borderBottomWidth: 0.5,
            borderBottomColor: colors.lightGrayColor,
        },
        optionText: Object.assign(Object.assign({}, Fonts.regular14), { color: colors.mainTextColor }),
    }), [colors]);
    const knownYears = useMemo(() => {
        const years = Array.from(new Set([currentYear, selectedYear, ...Object.keys(values)]))
            .filter((year) => /^\d{4}$/.test(year))
            .sort((a, b) => Number(b) - Number(a));
        return years;
    }, [currentYear, selectedYear, values]);
    const quickYears = useMemo(() => knownYears.slice(0, 4), [knownYears]);
    const yearOptions = useMemo(() => {
        const start = Math.max(Number(currentYear) + 1, new Date().getFullYear() + 1);
        const out = [];
        for (let year = start; year >= 2000; year -= 1) {
            const safeYear = String(year);
            if (safeYear !== selectedYear && Object.prototype.hasOwnProperty.call(values, safeYear))
                continue;
            out.push(safeYear);
        }
        return out;
    }, [currentYear, selectedYear, values]);
    useEffect(() => {
        var _a;
        if (!knownYears.includes(selectedYear)) {
            setSelectedYear((_a = knownYears[0]) !== null && _a !== void 0 ? _a : currentYear);
        }
    }, [currentYear, knownYears, selectedYear]);
    const selectedValue = String((_a = values[selectedYear]) !== null && _a !== void 0 ? _a : '');
    return (_jsxs(View, Object.assign({ style: styles.container }, { children: [_jsxs(View, Object.assign({ style: { gap: 4 } }, { children: [_jsx(Text, Object.assign({ style: styles.label }, { children: label })), helperText ? _jsx(Text, Object.assign({ style: styles.helperText }, { children: helperText })) : null] })), _jsxs(View, Object.assign({ style: styles.chipsRow }, { children: [quickYears.map((year) => {
                        var _a;
                        const isActive = year === selectedYear;
                        const value = String((_a = values[year]) !== null && _a !== void 0 ? _a : '').trim();
                        return (_jsx(TouchableOpacity, Object.assign({ style: [styles.chip, isActive ? styles.chipActive : null], activeOpacity: 0.85, onPress: () => setSelectedYear(year) }, { children: _jsx(Text, Object.assign({ style: [styles.chipText, isActive ? styles.chipTextActive : null] }, { children: value ? `${year} · ${value}` : year })) }), `chest-year-${year}`));
                    }), _jsx(TouchableOpacity, Object.assign({ style: [styles.chip, styles.addChip], activeOpacity: 0.85, onPress: () => setShowYearPicker(true) }, { children: _jsx(Text, Object.assign({ style: styles.chipText }, { children: knownYears.length > 4 ? moreYearsLabel : addYearLabel })) }))] })), _jsxs(View, Object.assign({ style: { gap: 6 } }, { children: [_jsx(Text, Object.assign({ style: styles.yearHint }, { children: selectedYear })), _jsx(View, Object.assign({ style: styles.inputWrap }, { children: _jsx(TextInput, { style: styles.input, keyboardType: "number-pad", value: selectedValue, placeholder: inputPlaceholder, placeholderTextColor: colors.grayColor, onChangeText: (raw) => {
                                const nextValue = String(raw || '').replace(/[^0-9]/g, '');
                                const next = Object.assign({}, values);
                                if (!nextValue) {
                                    delete next[selectedYear];
                                }
                                else {
                                    next[selectedYear] = nextValue;
                                }
                                onChange(next);
                            } }) }))] })), _jsx(Modal, Object.assign({ visible: showYearPicker, transparent: true, animationType: "fade", onRequestClose: () => setShowYearPicker(false) }, { children: _jsxs(View, Object.assign({ style: styles.modalOverlay }, { children: [_jsx(Pressable, { style: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }, onPress: () => setShowYearPicker(false) }), _jsxs(View, Object.assign({ style: styles.modalCard }, { children: [_jsx(Text, Object.assign({ style: styles.modalTitle }, { children: moreYearsLabel })), _jsx(ScrollView, { children: yearOptions.map((year) => (_jsx(TouchableOpacity, Object.assign({ style: styles.option, onPress: () => {
                                            setSelectedYear(year);
                                            setShowYearPicker(false);
                                        } }, { children: _jsx(Text, Object.assign({ style: styles.optionText }, { children: year })) }), `chest-picker-${year}`))) })] }))] })) }))] })));
};
export default ChestNumbersByYearField;
