import { jsx as _jsx } from "react/jsx-runtime";
import { View, Text, TouchableOpacity } from 'react-native';
import { createStyles } from './SectionTabsStyles';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const SectionTabs = ({ selectedTab, onTabPress }) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    const tabs = [t('Potential videos of me'), t('Created competitions')];
    return (_jsx(View, Object.assign({ style: Styles.tabContainer }, { children: tabs.map((tab, index) => (_jsx(TouchableOpacity, Object.assign({ activeOpacity: 0.7, onPress: () => onTabPress(index), style: [
                Styles.tabs,
            ] }, { children: _jsx(Text, Object.assign({ style: [
                    Styles.tabText,
                    {
                        color: selectedTab === index ? colors.primaryColor : colors.subTextColor,
                        borderBottomWidth: selectedTab === index ? 3 : 0,
                        borderBottomColor: selectedTab === index ? colors.primaryColor : 'transparent',
                    }
                ] }, { children: tab })) }), index))) })));
};
export default SectionTabs;
