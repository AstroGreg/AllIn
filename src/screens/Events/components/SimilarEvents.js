import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, TouchableOpacity } from 'react-native';
import { createStyles } from '../EventsStyles';
import FastImage from 'react-native-fast-image';
import Images from '../../../constants/Images';
import SizeBox from '../../../constants/SizeBox';
import Icons from '../../../constants/Icons';
import SubscribedUsers from './SubscribedUsers';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const subscribedUsers = [
    'https://picsum.photos/200/300',
    'https://picsum.photos/200/300',
    'https://picsum.photos/200/300',
    'https://picsum.photos/200/300',
];
const SimilarEvents = ({ onPressSubscribe, isSubscription = true }) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    return (_jsxs(View, Object.assign({ style: Styles.similarEvents }, { children: [_jsx(View, Object.assign({ style: Styles.eventImg }, { children: _jsx(FastImage, { source: Images.event1, style: Styles.images }) })), _jsx(SizeBox, { width: 14 }), _jsxs(View, Object.assign({ style: { width: '70%' } }, { children: [_jsx(Text, Object.assign({ style: Styles.CompetitionName, numberOfLines: 1 }, { children: t('Champions in Motion') })), _jsx(SizeBox, { height: 6 }), _jsxs(View, Object.assign({ style: Styles.row }, { children: [_jsx(SubscribedUsers, { users: subscribedUsers }), _jsx(SizeBox, { width: 6 }), _jsx(Text, Object.assign({ style: Styles.actionText }, { children: t('20+ subscribed') }))] })), _jsx(SizeBox, { height: 6 }), _jsxs(View, Object.assign({ style: Styles.row }, { children: [_jsxs(View, Object.assign({ style: Styles.row }, { children: [_jsx(Icons.CalendarGrey, { height: 14, width: 14 }), _jsx(SizeBox, { width: 2 }), _jsx(Text, Object.assign({ style: Styles.actionText }, { children: "12/12/2024" }))] })), _jsx(SizeBox, { width: 6 }), _jsxs(View, Object.assign({ style: [Styles.row, { width: '55%' }] }, { children: [_jsx(Icons.Location, { height: 14, width: 14 }), _jsx(SizeBox, { width: 2 }), _jsx(Text, Object.assign({ style: Styles.actionText, numberOfLines: 1 }, { children: t('Berlin, Germany') }))] }))] }))] })), isSubscription && _jsx(TouchableOpacity, Object.assign({ style: Styles.right, onPress: onPressSubscribe }, { children: _jsx(Text, Object.assign({ style: [Styles.CompetitionName, { color: colors.primaryColor, fontWeight: '400', }] }, { children: t('Subscribe') })) }))] })));
};
export default SimilarEvents;
