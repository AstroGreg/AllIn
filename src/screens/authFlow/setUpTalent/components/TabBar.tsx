import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { createStyles } from '../AddTalentStyles'
import { useTheme } from '../../../../context/ThemeContext'

interface TabBarProps {
    selectedTab: number;
    onTabPress: (index: number) => void;
}

const TabBar = ({ selectedTab, onTabPress }: TabBarProps) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
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
                            borderBottomColor: selectedTab === index ? colors.primaryColor : 'transparent'
                        }
                    ]}
                >
                    <Text style={[
                        Styles.tabText,
                        {
                            color: selectedTab === index ? colors.primaryColor : colors.grayColor
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