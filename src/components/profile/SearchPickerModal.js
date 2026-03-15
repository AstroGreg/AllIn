import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { ActivityIndicator, FlatList, Modal, Text, TextInput, TouchableOpacity, View, StyleSheet, } from 'react-native';
import { CloseCircle } from 'iconsax-react-nativejs';
import Fonts from '../../constants/Fonts';
import { useTheme } from '../../context/ThemeContext';
const SearchPickerModal = ({ visible, title, placeholder, testIDPrefix, query, onChangeQuery, onClose, options, loading, error, emptyText, selectedId, onSelect, }) => {
    const { colors } = useTheme();
    const styles = React.useMemo(() => StyleSheet.create({
        backdrop: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.45)',
            justifyContent: 'center',
            paddingHorizontal: 20,
        },
        card: {
            borderRadius: 16,
            backgroundColor: colors.backgroundColor,
            padding: 16,
            maxHeight: '72%',
            borderWidth: 0.5,
            borderColor: colors.lightGrayColor,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
        },
        title: Object.assign(Object.assign({}, Fonts.medium16), { color: colors.mainTextColor, flex: 1 }),
        searchInput: {
            height: 46,
            borderWidth: 1,
            borderColor: colors.borderColor,
            borderRadius: 12,
            paddingHorizontal: 12,
            color: colors.mainTextColor,
            backgroundColor: colors.secondaryColor,
        },
        optionRow: {
            paddingVertical: 12,
            paddingHorizontal: 10,
            borderBottomWidth: 0.5,
            borderBottomColor: colors.lightGrayColor,
            borderRadius: 10,
        },
        optionRowSelected: {
            backgroundColor: colors.secondaryColor,
        },
        optionTitle: Object.assign(Object.assign({}, Fonts.regular14), { color: colors.mainTextColor }),
        optionTitleSelected: {
            color: colors.primaryColor,
            fontWeight: '600',
        },
        optionSubtitle: Object.assign(Object.assign({}, Fonts.regular12), { color: colors.subTextColor, marginTop: 4 }),
        emptyText: Object.assign(Object.assign({}, Fonts.regular14), { color: colors.grayColor, textAlign: 'center', paddingVertical: 20 }),
    }), [colors]);
    return (_jsx(Modal, Object.assign({ visible: visible, transparent: true, animationType: "none", onRequestClose: onClose }, { children: _jsx(View, Object.assign({ style: styles.backdrop, testID: testIDPrefix ? `${testIDPrefix}-backdrop` : undefined }, { children: _jsxs(View, Object.assign({ style: styles.card, testID: testIDPrefix ? `${testIDPrefix}-card` : undefined }, { children: [_jsxs(View, Object.assign({ style: styles.header }, { children: [_jsx(Text, Object.assign({ style: styles.title }, { children: title })), _jsx(TouchableOpacity, Object.assign({ onPress: onClose, testID: testIDPrefix ? `${testIDPrefix}-close` : undefined }, { children: _jsx(CloseCircle, { size: 22, color: colors.grayColor }) }))] })), _jsx(View, { style: { height: 12 } }), _jsx(TextInput, { style: styles.searchInput, testID: testIDPrefix ? `${testIDPrefix}-search-input` : undefined, placeholder: placeholder, placeholderTextColor: colors.grayColor, value: query, onChangeText: onChangeQuery, autoCapitalize: "none", autoCorrect: false }), _jsx(View, { style: { height: 10 } }), loading ? (_jsx(ActivityIndicator, { size: "small", color: colors.primaryColor, testID: testIDPrefix ? `${testIDPrefix}-loading` : undefined })) : error ? (_jsx(Text, Object.assign({ style: styles.emptyText, testID: testIDPrefix ? `${testIDPrefix}-error` : undefined }, { children: error }))) : (_jsx(FlatList, { data: options, keyExtractor: (item) => item.id, testID: testIDPrefix ? `${testIDPrefix}-list` : undefined, keyboardShouldPersistTaps: "handled", initialNumToRender: 12, maxToRenderPerBatch: 12, windowSize: 4, removeClippedSubviews: true, renderItem: ({ item }) => {
                            const isSelected = item.id === String(selectedId || '');
                            return (_jsxs(TouchableOpacity, Object.assign({ testID: testIDPrefix ? `${testIDPrefix}-option-${item.id}` : undefined, style: [styles.optionRow, isSelected ? styles.optionRowSelected : null], activeOpacity: 0.8, onPress: () => onSelect(item) }, { children: [_jsx(Text, Object.assign({ style: [styles.optionTitle, isSelected ? styles.optionTitleSelected : null] }, { children: item.title })), item.subtitle ? _jsx(Text, Object.assign({ style: styles.optionSubtitle }, { children: item.subtitle })) : null] })));
                        }, ListEmptyComponent: _jsx(Text, Object.assign({ style: styles.emptyText, testID: testIDPrefix ? `${testIDPrefix}-empty` : undefined }, { children: emptyText !== null && emptyText !== void 0 ? emptyText : 'No results found.' })) }))] })) })) })));
};
export default SearchPickerModal;
