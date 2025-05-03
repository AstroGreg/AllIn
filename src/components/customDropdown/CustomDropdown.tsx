import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import Icons from '../../constants/Icons';
import Fonts from '../../constants/Fonts';
import Colors from '../../constants/Colors';

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

    return (
        <View style={{ marginHorizontal: 20, padding: 16, borderRadius: 10, borderWidth: 0.5, borderColor: Colors.lightGrayColor }}>
            {/* Header */}
            <TouchableOpacity
                onPress={() => setIsExpanded(!isExpanded)}
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
            >
                <Text style={{ ...Fonts.regular14, color: Colors.mainTextColor, fontWeight: '500' }}>{title}</Text>
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
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                paddingVertical: 14,
                                borderBottomWidth: 0.5,
                                borderColor: Colors.lightGrayColor,
                                marginHorizontal: 15
                            }}
                        >
                            <Text style={{ ...Fonts.regular14, color: Colors.mainTextColor }}>{item.label}</Text>
                            <View
                                style={{
                                    height: 16,
                                    width: 16,
                                    borderRadius: 10,
                                    borderWidth: 1,
                                    borderColor: Colors.primaryColor,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {selectedValue === item.value && (
                                    <View
                                        style={{
                                            height: 10,
                                            width: 10,
                                            borderRadius: 5,
                                            backgroundColor: Colors.primaryColor,
                                        }}
                                    />
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
