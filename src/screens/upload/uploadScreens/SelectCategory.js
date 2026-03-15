import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ScrollView, Text, View } from 'react-native';
import { useState } from 'react';
import { createStyles } from '../UploadDetailsStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SizeBox from '../../../constants/SizeBox';
import CustomHeader from '../../../components/customHeader/CustomHeader';
import CustomSearch from '../../../components/customSearch/CustomSearch';
import CustomButton from '../../../components/customButton/CustomButton';
import CustomDropdown from '../../../components/customDropdown/CustomDropdown';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const SelectCategory = ({ route, navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { video } = route.params || {};
    const [search, setSearch] = useState('');
    const [selectedTalent, setSelectedTalent] = useState('');
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsx(CustomHeader, { title: t('Upload Details'), isBack: false, onPressSetting: () => navigation.navigate('ProfileSettings') }), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false }, { children: [_jsx(SizeBox, { height: 24 }), _jsxs(View, { children: [_jsx(Text, Object.assign({ style: [Styles.titleText, { marginLeft: 15 }] }, { children: t('Event Search') })), _jsx(SizeBox, { height: 8 }), _jsxs(View, Object.assign({ style: [Styles.row] }, { children: [_jsx(View, Object.assign({ style: { flex: 2 } }, { children: _jsx(CustomSearch, { value: search, placeholder: t('Event Search....'), onChangeText: (text) => setSearch(text) }) })), _jsx(SizeBox, { width: 5 }), _jsx(View, Object.assign({ style: { flex: 1, marginRight: 20 } }, { children: _jsx(CustomButton, { title: t('Add New'), onPress: () => navigation.navigate('CreateCompetition'), isAdd: true }) }))] })), _jsx(SizeBox, { height: 24 })] }), _jsx(CustomDropdown, { title: t('Talent Selection'), options: [
                            { label: 'Athletics', value: 'athletics' },
                            { label: 'Swimming', value: 'swimming' },
                            { label: 'Other', value: 'other' },
                        ], selectedValue: selectedTalent, onSelect: setSelectedTalent }), _jsx(SizeBox, { height: 24 }), _jsx(CustomDropdown, { title: t('Event Type'), options: [
                            { label: '400m', value: '400m' },
                            { label: '200m', value: '200m' },
                            { label: '5k', value: '5k' },
                            { label: 'Custom', value: 'Custom' },
                        ], selectedValue: selectedTalent, onSelect: setSelectedTalent }), _jsx(SizeBox, { height: 24 }), _jsx(CustomDropdown, { title: t('Gender Selection'), options: [
                            { label: 'Men', value: 'men' },
                            { label: 'Women', value: 'women' },
                            { label: 'Both', value: 'both' },
                        ], selectedValue: selectedTalent, onSelect: setSelectedTalent }), _jsx(SizeBox, { height: 24 }), _jsx(CustomDropdown, { title: t('Category Selection'), options: [
                            { label: 'Seniors', value: 'seniors' },
                            { label: 'Masters', value: 'masters' },
                            { label: 'Juniors', value: 'juniors' },
                        ], selectedValue: selectedTalent, onSelect: setSelectedTalent }), _jsx(SizeBox, { height: 124 })] })), _jsx(View, Object.assign({ style: Styles.bottomBtn }, { children: _jsx(CustomButton, { title: t('Upload'), onPress: () => { navigation.goBack(); }, isSmall: true }) }))] })));
};
export default SelectCategory;
