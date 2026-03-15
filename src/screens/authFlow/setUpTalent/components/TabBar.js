import { jsx as _jsx } from "react/jsx-runtime";
import { View, Text, TouchableOpacity } from 'react-native';
import { createStyles } from '../AddTalentStyles';
import { useTheme } from '../../../../context/ThemeContext';
const TabBar = ({ selectedTab, onTabPress }) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const tabs = ['Track Events', 'Field Events'];
    return (_jsx(View, Object.assign({ style: Styles.tabContainer }, { children: tabs.map((tab, index) => (_jsx(TouchableOpacity, Object.assign({ activeOpacity: 0.7, onPress: () => onTabPress(index), style: [
                Styles.tabs,
                {
                    borderBottomColor: selectedTab === index ? colors.primaryColor : 'transparent'
                }
            ] }, { children: _jsx(Text, Object.assign({ style: [
                    Styles.tabText,
                    {
                        color: selectedTab === index ? colors.primaryColor : colors.grayColor
                    }
                ] }, { children: tab })) }), index))) })));
};
export default TabBar;
