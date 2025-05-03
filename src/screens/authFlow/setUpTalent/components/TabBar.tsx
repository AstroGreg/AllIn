import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import Styles from '../AddTalentStyles'
import Colors from '../../../../constants/Colors'

interface TabBarProps {
    selectedTab: number;
    onTabPress: (index: number) => void;
}

const TabBar = ({ selectedTab, onTabPress }: TabBarProps) => {
    const tabs = ['Track Events', 'Field Events'];

    return (
        <View style={Styles.tabContainer}>
            {tabs.map((tab, index) => (
                <TouchableOpacity
                    key={index}
                    activeOpacity={0.7}
                    onPress={() => onTabPress(index)}
                    style={[
                        Styles.tabs,
                        {
                            borderBottomColor: selectedTab === index ? Colors.primaryColor : 'transparent'
                        }
                    ]}
                >
                    <Text style={[
                        Styles.tabText,
                        {
                            color: selectedTab === index ? Colors.primaryColor : Colors.subTextColor
                        }
                    ]}>
                        {tab}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    )
}

export default TabBar