import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { ArrowLeft2, Calendar, Location, VideoSquare, } from 'iconsax-react-nativejs';
import { createStyles } from './MyAllCompetitionsScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Images from '../../constants/Images';
import Icons from '../../constants/Icons';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const MyAllEventsScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    const myEvents = [
        {
            id: 1,
            title: 'BK Studentent 23',
            videos: '254 Videos',
            location: 'Berlin, Germany',
            date: '27.5.2025',
            thumbnail: Images.photo4,
        },
        {
            id: 2,
            title: 'BK Studentent 23',
            videos: '254 Videos',
            location: 'Berlin, Germany',
            date: '27.5.2025',
            thumbnail: Images.photo5,
        },
        {
            id: 3,
            title: 'BK Studentent 23',
            videos: '254 Videos',
            location: 'Berlin, Germany',
            date: '27.5.2025',
            thumbnail: Images.photo4,
        },
        {
            id: 4,
            title: 'BK Studentent 23',
            videos: '254 Videos',
            location: 'Berlin, Germany',
            date: '27.5.2025',
            thumbnail: Images.photo5,
        },
    ];
    const renderMyEventCard = (item) => (_jsxs(View, Object.assign({ style: Styles.myEventCard }, { children: [_jsx(FastImage, { source: item.thumbnail, style: Styles.squareThumbnail, resizeMode: "cover" }), _jsxs(View, Object.assign({ style: Styles.cardInfo }, { children: [_jsxs(View, Object.assign({ style: Styles.eventTitleRow }, { children: [_jsx(Text, Object.assign({ style: Styles.cardTitle }, { children: item.title })), _jsxs(View, Object.assign({ style: Styles.videosCount }, { children: [_jsx(VideoSquare, { size: 16, color: colors.subTextColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: Styles.detailText }, { children: item.videos }))] }))] })), _jsxs(View, Object.assign({ style: Styles.detailRow }, { children: [_jsx(Text, Object.assign({ style: Styles.detailLabel }, { children: t('Location') })), _jsxs(View, Object.assign({ style: Styles.detailValue }, { children: [_jsx(Location, { size: 16, color: colors.subTextColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: Styles.detailText }, { children: item.location }))] }))] })), _jsxs(View, Object.assign({ style: Styles.detailRow }, { children: [_jsx(Text, Object.assign({ style: Styles.detailLabel }, { children: t('Date') })), _jsxs(View, Object.assign({ style: Styles.detailValue }, { children: [_jsx(Calendar, { size: 16, color: colors.subTextColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: Styles.detailText }, { children: item.date }))] }))] }))] }))] }), item.id));
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.backButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 20, color: colors.mainTextColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('My all events') })), _jsx(TouchableOpacity, Object.assign({ style: Styles.notificationButton, onPress: () => navigation.navigate('NotificationsScreen') }, { children: _jsx(Icons.NotificationBoldBlue, { height: 24, width: 24 }) }))] })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, contentContainerStyle: Styles.scrollContent }, { children: [_jsxs(View, Object.assign({ style: Styles.sectionHeader }, { children: [_jsx(Text, Object.assign({ style: Styles.sectionTitle }, { children: t('My all events') })), _jsx(TouchableOpacity, { children: _jsx(Text, Object.assign({ style: Styles.viewAllText }, { children: t('View all') })) })] })), myEvents.map(renderMyEventCard), _jsxs(TouchableOpacity, Object.assign({ style: Styles.primaryButton }, { children: [_jsx(Text, Object.assign({ style: Styles.primaryButtonText }, { children: t('Add myself to events') })), _jsx(Icons.RightBtnIcon, { height: 18, width: 18 })] })), _jsx(SizeBox, { height: 20 })] }))] })));
};
export default MyAllEventsScreen;
