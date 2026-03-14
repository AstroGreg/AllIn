import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { ArrowLeft2, Calendar, Location, Clock, Edit2, TickCircle, Refresh, People, } from 'iconsax-react-nativejs';
import { createStyles } from './CompetitionEventDetailsScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Images from '../../constants/Images';
import Icons from '../../constants/Icons';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const EventDetailsScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const eventData = {
        title: t('BK Studentent 23'),
        location: t('Berlin, Germany'),
        participants: t('Participants'),
        date: '27.5.2025',
        thumbnail: Images.photo6,
    };
    const editRequests = [
        {
            id: 1,
            title: t('Enhance Lighting & Colors'),
            date: '12.12.2024',
            time: '12:00',
            status: 'fixed',
        },
        {
            id: 2,
            title: t('Remove Watermark/Text'),
            date: '12.12.2024',
            time: '12:00',
            status: 'fixed',
        },
        {
            id: 3,
            title: t('Enhance Lighting & Colors'),
            date: '12.12.2024',
            time: '12:00',
            status: 'pending',
        },
        {
            id: 4,
            title: t('Slow Motion Effect'),
            date: '12.12.2024',
            time: '12:00',
            status: 'fixed',
        },
    ];
    const renderEditRequestCard = (item) => (_jsxs(View, Object.assign({ style: styles.editRequestCard }, { children: [_jsxs(View, Object.assign({ style: styles.editRequestHeader }, { children: [_jsx(View, Object.assign({ style: styles.receiptIconContainer }, { children: _jsx(Icons.ReceiptEdit, { height: 22, width: 22 }) })), _jsxs(TouchableOpacity, Object.assign({ style: styles.editButton }, { children: [_jsx(Edit2, { size: 12, color: colors.subTextColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: styles.editButtonText }, { children: t('Edit') }))] }))] })), _jsxs(View, Object.assign({ style: styles.editRequestContent }, { children: [_jsx(Text, Object.assign({ style: styles.editRequestTitle }, { children: item.title })), _jsxs(View, Object.assign({ style: styles.editRequestMeta }, { children: [_jsxs(View, Object.assign({ style: styles.metaItem }, { children: [_jsx(Calendar, { size: 12, color: colors.subTextColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: styles.metaText }, { children: item.date }))] })), _jsxs(View, Object.assign({ style: styles.metaItem }, { children: [_jsx(Clock, { size: 12, color: colors.subTextColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: styles.metaText }, { children: item.time }))] }))] }))] })), item.status === 'fixed' ? (_jsxs(View, Object.assign({ style: styles.fixedBadge }, { children: [_jsx(Text, Object.assign({ style: styles.fixedBadgeText }, { children: t('Fixed') })), _jsx(TickCircle, { size: 14, color: "#00BD48", variant: "Linear" })] }))) : (_jsxs(View, Object.assign({ style: styles.pendingBadge }, { children: [_jsx(Text, Object.assign({ style: styles.pendingBadgeText }, { children: t('Pending') })), _jsx(Refresh, { size: 14, color: "#FF8000", variant: "Linear" })] })))] }), item.id));
    return (_jsxs(View, Object.assign({ style: styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.backButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 20, color: colors.mainTextColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: styles.headerTitle }, { children: t('Event Details') })), _jsx(TouchableOpacity, Object.assign({ style: styles.notificationButton, onPress: () => navigation.navigate('NotificationsScreen') }, { children: _jsx(Icons.NotificationBoldBlue, { height: 24, width: 24 }) }))] })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, contentContainerStyle: styles.scrollContent }, { children: [_jsx(View, Object.assign({ style: styles.eventContainer }, { children: _jsx(FastImage, { source: eventData.thumbnail, style: styles.eventThumbnail, resizeMode: "cover" }) })), _jsxs(View, Object.assign({ style: styles.eventInfo }, { children: [_jsxs(View, Object.assign({ style: styles.eventInfoRow }, { children: [_jsx(Text, Object.assign({ style: styles.eventTitle }, { children: eventData.title })), _jsxs(View, Object.assign({ style: styles.locationContainer }, { children: [_jsx(Location, { size: 16, color: colors.subTextColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: styles.locationText }, { children: eventData.location }))] }))] })), _jsxs(View, Object.assign({ style: styles.eventInfoRow }, { children: [_jsxs(View, Object.assign({ style: styles.participantsContainer }, { children: [_jsx(People, { size: 16, color: colors.subTextColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: styles.participantsText }, { children: eventData.participants }))] })), _jsxs(View, Object.assign({ style: styles.dateContainer }, { children: [_jsx(Calendar, { size: 16, color: colors.subTextColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: styles.dateText }, { children: eventData.date }))] }))] }))] })), _jsx(Text, Object.assign({ style: styles.sectionTitle }, { children: t('Request for Edits') })), _jsx(SizeBox, { height: 16 }), _jsx(View, Object.assign({ style: styles.receivedLabel }, { children: _jsx(Text, Object.assign({ style: styles.receivedText }, { children: t('Received') })) })), _jsx(SizeBox, { height: 16 }), _jsxs(View, Object.assign({ style: styles.editRequestsGrid }, { children: [_jsx(View, Object.assign({ style: styles.editRequestsRow }, { children: editRequests.slice(0, 2).map(renderEditRequestCard) })), _jsx(View, Object.assign({ style: styles.editRequestsRow }, { children: editRequests.slice(2, 4).map(renderEditRequestCard) }))] })), _jsx(SizeBox, { height: 24 }), _jsxs(TouchableOpacity, Object.assign({ style: styles.primaryButton, onPress: () => navigation.navigate('SentRequestStateScreen') }, { children: [_jsx(Text, Object.assign({ style: styles.primaryButtonText }, { children: t('Edit') })), _jsx(Edit2, { size: 18, color: colors.pureWhite, variant: "Linear" })] })), _jsx(SizeBox, { height: 20 })] }))] })));
};
export default EventDetailsScreen;
