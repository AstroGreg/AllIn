import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, TouchableOpacity } from 'react-native';
import { createStyles } from '../HomeStyles';
import FastImage from 'react-native-fast-image';
import Images from '../../../constants/Images';
import SizeBox from '../../../constants/SizeBox';
import { useTheme } from '../../../context/ThemeContext';
import Icons from '../../../constants/Icons';
import { useTranslation } from 'react-i18next';
const Header = ({ userName, profilePic, notificationCount = 0, onPressFeed, onPressProfile, onPressNotifications }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const Styles = createStyles(colors);
    return (_jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ onPress: onPressProfile, style: Styles.profilePic }, { children: _jsx(FastImage, { source: profilePic ? { uri: profilePic } : Images.profilePic, style: Styles.img }) })), _jsx(SizeBox, { width: 10 }), _jsxs(View, Object.assign({ style: Styles.userInfoContainer }, { children: [_jsx(Text, Object.assign({ style: Styles.welcomeText }, { children: t('welcome') })), _jsx(Text, Object.assign({ style: Styles.userNameText }, { children: userName }))] })), _jsxs(View, Object.assign({ style: Styles.headerIconsContainer }, { children: [_jsx(TouchableOpacity, Object.assign({ onPress: onPressFeed, style: Styles.headerIconBtn }, { children: _jsx(Icons.FeedBlue, { height: 24, width: 24 }) })), _jsxs(View, Object.assign({ style: Styles.notificationIconWrap }, { children: [notificationCount > 0 ? (_jsx(View, Object.assign({ style: Styles.notificationCountBanner }, { children: _jsx(Text, Object.assign({ style: Styles.notificationCountText }, { children: notificationCount > 99 ? '99+' : String(notificationCount) })) }))) : null, _jsx(TouchableOpacity, Object.assign({ onPress: onPressNotifications, style: Styles.headerIconBtn }, { children: _jsx(Icons.NotificationBoldBlue, { height: 24, width: 24 }) }))] }))] }))] })));
};
export default Header;
