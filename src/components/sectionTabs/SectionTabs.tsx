import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import Colors from '../../constants/Colors';
import Styles from './SectionTabsStyles';

interface SectionTabsProps {
    selectedTab: number;
    onTabPress: (index: number) => void;
}

const SectionTabs = ({ selectedTab, onTabPress }: SectionTabsProps) => {
    const tabs = ['Potential Videos of me', 'Created Competitions'];

    return (
        <View style={Styles.tabContainer}>
            {tabs.map((tab, index) => (
                <TouchableOpacity
                    key={index}
                    activeOpacity={0.7}
                    onPress={() => onTabPress(index)}
                    style={[
                        Styles.tabs,
                    ]}
                >
                    <Text style={[
                        Styles.tabText,
                        {
                            color: selectedTab === index ? Colors.primaryColor : Colors.subTextColor,
                            borderBottomWidth: selectedTab === index ? 3 : 0,
                            borderBottomColor: selectedTab === index ? Colors.primaryColor : 'transparent',
                        }
                    ]}>
                        {tab}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    )
}

export default SectionTabs