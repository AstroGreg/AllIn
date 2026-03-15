import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, ScrollView } from 'react-native';
import { useState } from 'react';
import { createStyles } from './ChooseCompetitionStyles';
import CustomHeader from '../../components/customHeader/CustomHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SizeBox from '../../constants/SizeBox';
import TabBar from '../authFlow/setUpTalent/components/TabBar';
import SelcetionContainer from '../authFlow/setUpTalent/components/SelcetionContainer';
import CustomButton from '../../components/customButton/CustomButton';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const trackData = [
    {
        id: 1,
        title: '60 meter',
    },
    {
        id: 2,
        title: '80 meter',
    },
    {
        id: 3,
        title: '100 meter',
    },
    {
        id: 4,
        title: '200 meter',
    },
    {
        id: 5,
        title: '300 meter',
    },
    {
        id: 6,
        title: '400 meter',
    },
];
const fieldData = [
    {
        id: 1,
        title: 'Long Jump',
    },
    {
        id: 2,
        title: 'High Jump',
    },
    {
        id: 3,
        title: 'Pole Vault',
    },
    {
        id: 4,
        title: 'Javelin Throw',
    },
    {
        id: 5,
        title: 'Discus Throw',
    },
    {
        id: 6,
        title: 'Hammer Throw',
    },
];
const ChooseEventScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const [seletedTab, setSelectedTab] = useState(0);
    const [selectedId, setSelectedId] = useState(null);
    const handleSelect = (id) => {
        setSelectedId(id === selectedId ? null : id);
    };
    return (_jsxs(View, Object.assign({ style: styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsx(CustomHeader, { title: t('Choose Event'), onBackPress: () => navigation.goBack(), onPressSetting: () => navigation.navigate('ProfileSettings') }), _jsx(SizeBox, { height: 24 }), _jsxs(ScrollView, Object.assign({ style: styles.container }, { children: [_jsx(Text, Object.assign({ style: styles.screenHeader }, { children: t('Champions in Motion') })), _jsx(SizeBox, { height: 2 }), _jsx(Text, Object.assign({ style: styles.subText }, { children: t('Champions in Motion is engaged and committed to the instruction of cheerleading, karate/martial arts') })), _jsx(SizeBox, { height: 24 }), _jsx(TabBar, { selectedTab: seletedTab, onTabPress: (tab) => { setSelectedTab(tab); setSelectedId(null); } }), _jsx(SizeBox, { height: 27 }), seletedTab === 0 ?
                        trackData === null || trackData === void 0 ? void 0 : trackData.map((item) => _jsx(SelcetionContainer, { title: item.title, isIcon: false, isSelected: item.id === selectedId, onPress: () => handleSelect(item.id) })) :
                        fieldData === null || fieldData === void 0 ? void 0 : fieldData.map((item) => _jsx(SelcetionContainer, { title: item.title, isIcon: false, isSelected: item.id === selectedId, onPress: () => handleSelect(item.id) })), _jsx(SizeBox, { height: 16 }), _jsx(CustomButton, { title: t('Continue'), onPress: () => navigation.navigate('CongratulationsScreen') })] }))] })));
};
export default ChooseEventScreen;
