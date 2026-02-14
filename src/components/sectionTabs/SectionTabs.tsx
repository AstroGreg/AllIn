import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { createStyles } from './SectionTabsStyles';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

interface SectionTabsProps {
    selectedTab: number;
    onTabPress: (index: number) => void;
}

const SectionTabs = ({ selectedTab, onTabPress }: SectionTabsProps) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    const tabs = [t('Potential videos of me'), t('Created competitions')];

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
                            color: selectedTab === index ? colors.primaryColor : colors.subTextColor,
                            borderBottomWidth: selectedTab === index ? 3 : 0,
                            borderBottomColor: selectedTab === index ? colors.primaryColor : 'transparent',
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
