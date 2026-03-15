import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, ScrollView, Text } from 'react-native';
import { useState } from 'react';
import { createStyles } from '../AddTalentStyles';
import SizeBox from '../../../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomSearch from '../../../../components/customSearch/CustomSearch';
import Icons from '../../../../constants/Icons';
import SelcetionContainer from '../components/SelcetionContainer';
import CustomButton from '../../../../components/customButton/CustomButton';
import { useTheme } from '../../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const SelecteTalent = ({ navigation }) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState(null);
    const handleSelect = (id) => {
        setSelectedId(id === selectedId ? null : id);
    };
    const data = [
        {
            id: 1,
            title: 'Sports & Athletic Event',
            icon: _jsx(Icons.Talent1, { height: 22, width: 22 }),
        },
        {
            id: 2,
            title: 'Branding & Promotional Event',
            icon: _jsx(Icons.Talent2, { height: 22, width: 22 }),
        },
        {
            id: 3,
            title: 'Concert & Live Event',
            icon: _jsx(Icons.Talent3, { height: 22, width: 22 }),
        },
        {
            id: 4,
            title: 'Academic & Educational Event',
            icon: _jsx(Icons.Talent4, { height: 22, width: 22 }),
        },
        {
            id: 5,
            title: 'Corporate Event',
            icon: _jsx(Icons.Talent5, { height: 22, width: 22 }),
        },
    ];
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false }, { children: [_jsx(SizeBox, { height: 76 }), _jsxs(View, Object.assign({ style: Styles.contentContainer }, { children: [_jsx(Text, Object.assign({ style: Styles.headingText }, { children: t('Select your talent') })), _jsx(SizeBox, { height: 16 }), _jsx(CustomSearch, { value: search, onChangeText: (text) => setSearch(text), placeholder: t('Search') }), _jsx(SizeBox, { height: 24 }), _jsxs(View, Object.assign({ style: Styles.row }, { children: [_jsx(Icons.TickCircle, { height: 16, width: 16 }), _jsx(Text, Object.assign({ style: Styles.searchResultsText }, { children: t('Results:') }))] })), _jsx(SizeBox, { height: 24 }), _jsx(View, { style: Styles.separator }), _jsx(SizeBox, { height: 27 }), _jsxs(View, Object.assign({ style: Styles.talentContainer }, { children: [_jsx(SizeBox, { height: 16 }), data === null || data === void 0 ? void 0 : data.map((item) => _jsx(SelcetionContainer, { title: item.title, icon: item.icon, isSelected: item.id === selectedId, onPress: () => handleSelect(item.id) }))] })), _jsx(SizeBox, { height: 55 }), _jsx(CustomButton, { title: t('Next'), onPress: () => navigation.navigate('ChestDetails') })] }))] }))] })));
};
export default SelecteTalent;
