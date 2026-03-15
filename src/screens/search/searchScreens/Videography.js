import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { createStyles } from '../SearchStyles';
import CustomHeader from '../../../components/customHeader/CustomHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SizeBox from '../../../constants/SizeBox';
import TabBar from '../../authFlow/setUpTalent/components/TabBar';
import Icons from '../../../constants/Icons';
import CustomButton from '../../../components/customButton/CustomButton';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const Videography = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const { type: initialType } = route.params || {};
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const [seletedTab, setSelectedTab] = useState(0);
    const [currentType, setCurrentType] = useState(initialType || 'video');
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
    // Toggle between video and photography
    const toggleMediaType = () => {
        setCurrentType((prev) => prev === 'video' ? 'photo' : 'video');
    };
    // Update title based on media type
    const getMediaTypeTitle = () => {
        return currentType === 'video' ? t('Videos') : t('Photography');
    };
    const RenderItem = ({ item }) => {
        return (_jsxs(TouchableOpacity, Object.assign({ onPress: () => navigation.navigate('VideosForEvent'), activeOpacity: 0.7, style: [styles.borderBox, styles.row, styles.spaceBetween, { marginBottom: 24 }] }, { children: [_jsx(Text, Object.assign({ style: styles.titleText }, { children: item.title })), _jsx(Icons.ArrowNext, { height: 24, width: 24 })] })));
    };
    return (_jsxs(View, Object.assign({ style: styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsx(CustomHeader, { title: t('BK Studentent 23'), onBackPress: () => navigation.goBack(), onPressSetting: () => navigation.navigate('ProfileSettings') }), _jsx(SizeBox, { height: 24 }), _jsxs(View, Object.assign({ style: { marginHorizontal: 20 } }, { children: [_jsx(Text, Object.assign({ style: styles.titleText }, { children: t('Running') })), _jsx(SizeBox, { height: 2 }), _jsx(Text, Object.assign({ style: styles.filterText }, { children: t('Here are your Loop and Veld Events') })), _jsxs(TouchableOpacity, Object.assign({ style: [styles.eventbtns, styles.row, { position: 'absolute', right: 0 }], onPress: toggleMediaType, activeOpacity: 0.7 }, { children: [_jsx(Text, Object.assign({ style: styles.eventBtnText }, { children: getMediaTypeTitle() })), _jsx(SizeBox, { width: 6 }), currentType === 'video' ? (_jsx(Icons.Video, { height: 18, width: 18 })) : (_jsx(Icons.Camera, { height: 18, width: 18 }) // Make sure you have Photo icon in your Icons constant
                            )] }))] })), _jsx(SizeBox, { height: 24 }), _jsx(TabBar, { selectedTab: seletedTab, onTabPress: (tab) => { setSelectedTab(tab); } }), _jsx(SizeBox, { height: 24 }), seletedTab === 0 && _jsx(FlatList, { data: trackData, renderItem: RenderItem, keyExtractor: (item, index) => index.toString() }), seletedTab === 1 && _jsx(FlatList, { data: fieldData, renderItem: RenderItem, keyExtractor: (item, index) => index.toString() }), _jsx(View, Object.assign({ style: styles.btn }, { children: _jsx(CustomButton, { title: t('Show All'), onPress: () => { currentType === 'video' ? navigation.navigate('AllVideosOfEvents') : navigation.navigate('AllPhotosOfEvents'); } }) })), _jsx(SizeBox, { height: insets.bottom })] })));
};
export default Videography;
