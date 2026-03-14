import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import Icons from '../../constants/Icons';
import Fonts from '../../constants/Fonts';
import { useTheme } from '../../context/ThemeContext';
const CustomDropdown = ({ title, options, selectedValue, onSelect, }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    return (_jsxs(View, Object.assign({ style: styles.container }, { children: [_jsxs(TouchableOpacity, Object.assign({ onPress: () => setIsExpanded(!isExpanded), style: styles.headerRow }, { children: [_jsx(Text, Object.assign({ style: styles.headerText }, { children: title })), _jsx(Icons.Dropdown, { height: 24, width: 24 })] })), isExpanded && (_jsx(FlatList, { data: options, keyExtractor: (item) => item.value, renderItem: ({ item }) => (_jsxs(TouchableOpacity, Object.assign({ onPress: () => onSelect(item.value), style: styles.optionRow }, { children: [_jsx(Text, Object.assign({ style: styles.optionText }, { children: item.label })), _jsx(View, Object.assign({ style: styles.radioOuter }, { children: selectedValue === item.value && (_jsx(View, { style: styles.radioInner })) }))] }))) }))] })));
};
export default CustomDropdown;
const createStyles = (colors) => StyleSheet.create({
    container: {
        marginHorizontal: 20,
        padding: 16,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.lightGrayColor,
        backgroundColor: colors.cardBackground,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerText: Object.assign(Object.assign({}, Fonts.regular14), { color: colors.mainTextColor, fontWeight: '500' }),
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 0.5,
        borderColor: colors.lightGrayColor,
        marginHorizontal: 15,
    },
    optionText: Object.assign(Object.assign({}, Fonts.regular14), { color: colors.mainTextColor }),
    radioOuter: {
        height: 16,
        width: 16,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioInner: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: colors.primaryColor,
    },
});
