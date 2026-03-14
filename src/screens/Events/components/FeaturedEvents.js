import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text } from 'react-native';
import { createStyles } from '../EventsStyles';
import FastImage from 'react-native-fast-image';
import Images from '../../../constants/Images';
import SizeBox from '../../../constants/SizeBox';
import Icons from '../../../constants/Icons';
import SubscribedUsers from './SubscribedUsers';
import BorderButton from '../../../components/borderButton/BorderButton';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const subscribedUsers = [
    'https://picsum.photos/200/300',
    'https://picsum.photos/200/300',
    'https://picsum.photos/200/300',
    'https://picsum.photos/200/300',
];
const FeaturedEvents = ({ onPressSubscribe }) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    return (_jsxs(View, Object.assign({ style: Styles.featuredEventsContinaer }, { children: [_jsx(View, Object.assign({ style: Styles.imgContainer }, { children: _jsx(FastImage, { source: Images.event1, style: Styles.images }) })), _jsx(SizeBox, { height: 10 }), _jsx(Text, Object.assign({ style: Styles.CompetitionName, numberOfLines: 1 }, { children: t('Champions in Motion') })), _jsx(SizeBox, { height: 6 }), _jsxs(View, Object.assign({ style: Styles.row }, { children: [_jsxs(View, Object.assign({ style: Styles.row }, { children: [_jsx(Icons.CalendarGrey, { height: 12, width: 12 }), _jsx(SizeBox, { width: 2 }), _jsx(Text, Object.assign({ style: Styles.actionText }, { children: "12/12/2024" }))] })), _jsx(SizeBox, { width: 6 }), _jsxs(View, Object.assign({ style: [Styles.row, { width: '55%', }] }, { children: [_jsx(Icons.Location, { height: 12, width: 12 }), _jsx(SizeBox, { width: 2 }), _jsx(Text, Object.assign({ style: Styles.actionText, numberOfLines: 1 }, { children: t('Berlin, Germany') }))] }))] })), _jsx(SizeBox, { height: 11 }), _jsxs(View, Object.assign({ style: Styles.row }, { children: [_jsx(SubscribedUsers, { users: subscribedUsers }), _jsx(SizeBox, { width: 6 }), _jsx(Text, Object.assign({ style: Styles.actionText }, { children: t('20+ subscribed already') }))] })), _jsx(SizeBox, { height: 20 }), _jsx(BorderButton, { isFilled: true, title: t('Subscribe'), onPress: onPressSubscribe })] })));
};
export default FeaturedEvents;
