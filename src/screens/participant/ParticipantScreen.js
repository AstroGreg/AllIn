import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { FlatList, View, Text } from 'react-native';
import { useCallback } from 'react';
import { createStyles } from './ParticipantStyles';
import SizeBox from '../../constants/SizeBox';
import CustomHeader from '../../components/customHeader/CustomHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ParticipantContainer from './components/ParticipantContainer';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const ParticipantScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const openProfileFromId = useCallback((profileId) => {
        const safeProfileId = String(profileId || '').trim();
        if (!safeProfileId) {
            navigation.navigate('BottomTabBar', { screen: 'Profile' });
            return;
        }
        navigation.navigate('ViewUserProfileScreen', { profileId: safeProfileId });
    }, [navigation]);
    const headerComponent = () => {
        return (_jsxs(_Fragment, { children: [_jsx(SizeBox, { height: 24 }), _jsx(Text, Object.assign({ style: styles.sportsName }, { children: t('800m') })), _jsxs(View, Object.assign({ style: styles.rowCenter }, { children: [_jsx(Text, Object.assign({ style: styles.subSportsName }, { children: t('Beligian Championships 2024') })), _jsx(SizeBox, { height: 2 }), _jsx(Text, Object.assign({ style: styles.subSportsName }, { children: t('1k +Participant') }))] })), _jsx(SizeBox, { height: 16 })] }));
    };
    return (_jsxs(View, Object.assign({ style: styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsx(CustomHeader, { title: t('Participant'), onBackPress: () => navigation.goBack(), onPressSetting: () => navigation.navigate('ProfileSettings') }), _jsx(FlatList, { data: ['', '', '', '', ''], renderItem: () => _jsx(ParticipantContainer, { onPress: () => openProfileFromId() }), keyExtractor: (item, index) => index.toString(), style: { paddingHorizontal: 20, }, ListHeaderComponent: headerComponent, showsVerticalScrollIndicator: false })] })));
};
export default ParticipantScreen;
