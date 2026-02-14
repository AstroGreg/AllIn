import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import Icons from '../../constants/Icons';
import Fonts from '../../constants/Fonts';
import { ThemeColors } from '../../constants/Theme';
import { useTheme } from '../../context/ThemeContext';

interface Option {
    label: string;
    value: string;
}

interface CustomDropdownProps {
    title: string;
    options: Option[];
    selectedValue: string;
    onSelect: (value: string) => void;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
    title,
    options,
    selectedValue,
    onSelect,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <View style={styles.container}>
            {/* Header */}
            <TouchableOpacity
                onPress={() => setIsExpanded(!isExpanded)}
                style={styles.headerRow}
            >
                <Text style={styles.headerText}>{title}</Text>
                <Icons.Dropdown height={24} width={24} />
            </TouchableOpacity>

            {/* Options */}
            {isExpanded && (
                <FlatList
                    data={options}
                    keyExtractor={(item) => item.value}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => onSelect(item.value)}
                            style={styles.optionRow}
                        >
                            <Text style={styles.optionText}>{item.label}</Text>
                            <View style={styles.radioOuter}>
                                {selectedValue === item.value && (
                                    <View style={styles.radioInner} />
                                )}
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
};

export default CustomDropdown;

const createStyles = (colors: ThemeColors) => StyleSheet.create({
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
    headerText: {
        ...Fonts.regular14,
        color: colors.mainTextColor,
        fontWeight: '500',
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 0.5,
        borderColor: colors.lightGrayColor,
        marginHorizontal: 15,
    },
    optionText: {
        ...Fonts.regular14,
        color: colors.mainTextColor,
    },
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
