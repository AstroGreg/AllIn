import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import { CloseCircle } from 'iconsax-react-nativejs';

import Fonts from '../../constants/Fonts';
import { useTheme } from '../../context/ThemeContext';

export type SearchPickerOption = {
  id: string;
  title: string;
  subtitle?: string | null;
};

type SearchPickerModalProps = {
  visible: boolean;
  title: string;
  placeholder: string;
  testIDPrefix?: string;
  query: string;
  onChangeQuery: (value: string) => void;
  onClose: () => void;
  options: SearchPickerOption[];
  loading: boolean;
  error?: string | null;
  emptyText?: string;
  selectedId?: string | null;
  onSelect: (option: SearchPickerOption) => void;
};

const SearchPickerModal = ({
  visible,
  title,
  placeholder,
  testIDPrefix,
  query,
  onChangeQuery,
  onClose,
  options,
  loading,
  error,
  emptyText,
  selectedId,
  onSelect,
}: SearchPickerModalProps) => {
  const { colors } = useTheme();
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
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
        title: {
          ...Fonts.medium16,
          color: colors.mainTextColor,
          flex: 1,
        },
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
        optionTitle: {
          ...Fonts.regular14,
          color: colors.mainTextColor,
        },
        optionTitleSelected: {
          color: colors.primaryColor,
          fontWeight: '600',
        },
        optionSubtitle: {
          ...Fonts.regular12,
          color: colors.subTextColor,
          marginTop: 4,
        },
        emptyText: {
          ...Fonts.regular14,
          color: colors.grayColor,
          textAlign: 'center',
          paddingVertical: 20,
        },
      }),
    [colors],
  );

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.backdrop} testID={testIDPrefix ? `${testIDPrefix}-backdrop` : undefined}>
        <View style={styles.card} testID={testIDPrefix ? `${testIDPrefix}-card` : undefined}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} testID={testIDPrefix ? `${testIDPrefix}-close` : undefined}>
              <CloseCircle size={22} color={colors.grayColor} />
            </TouchableOpacity>
          </View>

          <View style={{ height: 12 }} />

          <TextInput
            style={styles.searchInput}
            testID={testIDPrefix ? `${testIDPrefix}-search-input` : undefined}
            placeholder={placeholder}
            placeholderTextColor={colors.grayColor}
            value={query}
            onChangeText={onChangeQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={{ height: 10 }} />

          {loading ? (
            <ActivityIndicator
              size="small"
              color={colors.primaryColor}
              testID={testIDPrefix ? `${testIDPrefix}-loading` : undefined}
            />
          ) : error ? (
            <Text style={styles.emptyText} testID={testIDPrefix ? `${testIDPrefix}-error` : undefined}>{error}</Text>
          ) : (
            <FlatList
              data={options}
              keyExtractor={(item) => item.id}
              testID={testIDPrefix ? `${testIDPrefix}-list` : undefined}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={12}
              maxToRenderPerBatch={12}
              windowSize={4}
              removeClippedSubviews
              renderItem={({ item }) => {
                const isSelected = item.id === String(selectedId || '');
                return (
                  <TouchableOpacity
                    testID={testIDPrefix ? `${testIDPrefix}-option-${item.id}` : undefined}
                    style={[styles.optionRow, isSelected ? styles.optionRowSelected : null]}
                    activeOpacity={0.8}
                    onPress={() => onSelect(item)}
                  >
                    <Text style={[styles.optionTitle, isSelected ? styles.optionTitleSelected : null]}>
                      {item.title}
                    </Text>
                    {item.subtitle ? <Text style={styles.optionSubtitle}>{item.subtitle}</Text> : null}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.emptyText} testID={testIDPrefix ? `${testIDPrefix}-empty` : undefined}>
                  {emptyText ?? 'No results found.'}
                </Text>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default SearchPickerModal;
