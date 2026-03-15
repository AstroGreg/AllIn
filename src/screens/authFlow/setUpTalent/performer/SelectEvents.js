import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, ScrollView, Text } from 'react-native';
import { useState } from 'react';
import { createStyles } from '../AddTalentStyles';
import SizeBox from '../../../../constants/SizeBox';
import FastImage from 'react-native-fast-image';
import Images from '../../../../constants/Images';
import CustomButton from '../../../../components/customButton/CustomButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TabBar from '../components/TabBar';
import SelcetionContainer from '../components/SelcetionContainer';
import { useTheme } from '../../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const SelectEvents = ({ navigation }) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const [seletedTab, setSelectedTab] = useState(0);
    const [selectedId, setSelectedId] = useState(null);
    const handleSelect = (id) => {
        setSelectedId(id === selectedId ? null : id);
    };
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
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false }, { children: [_jsx(SizeBox, { height: 30 }), _jsx(View, Object.assign({ style: { height: 130, width: 130, alignSelf: 'center' } }, { children: _jsx(FastImage, { source: Images.talentImg, style: { height: '100%', width: '100%' } }) })), _jsx(SizeBox, { height: 30 }), _jsxs(View, Object.assign({ style: Styles.contentContainer }, { children: [_jsx(Text, Object.assign({ style: Styles.headingText }, { children: t('Set Up Your Talent Profile') })), _jsx(SizeBox, { height: 8 }), _jsx(Text, Object.assign({ style: Styles.subHeadingText }, { children: t('Create your profile to showcase your skills and stand out.') })), _jsx(SizeBox, { height: 24 }), _jsx(Text, Object.assign({ style: Styles.containerTitle }, { children: t('Select your events') })), _jsx(SizeBox, { height: 16 }), _jsx(TabBar, { selectedTab: seletedTab, onTabPress: (tab) => { setSelectedTab(tab); setSelectedId(null); } }), _jsx(SizeBox, { height: 27 }), seletedTab === 0 ?
                                trackData === null || trackData === void 0 ? void 0 : trackData.map((item) => _jsx(SelcetionContainer, { title: item.title, isIcon: false, isSelected: item.id === selectedId, onPress: () => handleSelect(item.id) })) :
                                fieldData === null || fieldData === void 0 ? void 0 : fieldData.map((item) => _jsx(SelcetionContainer, { title: item.title, isIcon: false, isSelected: item.id === selectedId, onPress: () => handleSelect(item.id) })), _jsx(SizeBox, { height: 86 }), _jsx(CustomButton, { title: t('Continue'), onPress: () => navigation.navigate('ViewSelectedTalent') }), _jsx(SizeBox, { height: 86 })] }))] }))] })));
};
export default SelectEvents;
