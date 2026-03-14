import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, FlatList, ScrollView } from 'react-native';
import { useState } from 'react';
import CustomHeader from '../../components/customHeader/CustomHeader';
import { createStyles } from './EventsStyles';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomSearch from '../../components/customSearch/CustomSearch';
import TitleContainers from '../Events/components/TitleContainers';
import FeaturedEvents from '../Events/components/FeaturedEvents';
import SimilarEvents from '../Events/components/SimilarEvents';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const EventsScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [search, setSearch] = useState('');
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    const RenderFeaturedEvents = () => {
        return (_jsx(FeaturedEvents, { onPressSubscribe: () => navigation.navigate('ChooseEventScreen') }));
    };
    const RenderSimilarEvents = () => {
        return (_jsx(SimilarEvents, { onPressSubscribe: () => navigation.navigate('ChooseEventScreen') }));
    };
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsx(CustomHeader, { title: t('Events'), onBackPress: () => navigation.navigate('BottomTabBar'), onPressSetting: () => navigation.navigate('ProfileSettings') }), _jsxs(ScrollView, Object.assign({ style: Styles.container, showsVerticalScrollIndicator: false, nestedScrollEnabled: true }, { children: [_jsx(SizeBox, { height: 24 }), _jsx(CustomSearch, { value: search, placeholder: t('Search...'), onChangeText: (text) => setSearch(text) }), _jsx(SizeBox, { height: 24 }), _jsx(TitleContainers, { title: t('Featured events'), onActionPress: () => { } }), _jsx(SizeBox, { height: 16 }), _jsx(FlatList, { data: ['', '', ''], renderItem: RenderFeaturedEvents, keyExtractor: (item, index) => index.toString(), horizontal: true, style: { paddingLeft: 20 }, showsHorizontalScrollIndicator: false }), _jsx(SizeBox, { height: 24 }), _jsx(TitleContainers, { title: t('Similar events'), onActionPress: () => { } }), _jsx(SizeBox, { height: 16 }), _jsx(FlatList, { data: ['', '', ''], renderItem: RenderSimilarEvents, keyExtractor: (item, index) => index.toString(), showsVerticalScrollIndicator: false, scrollEnabled: false }), _jsx(SizeBox, { height: 24 })] }))] })));
};
export default EventsScreen;
