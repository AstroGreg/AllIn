import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useState } from 'react';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Images from '../../constants/Images';
import { createStyles } from './CompetitionsViewAllStyles';
import { ArrowLeft2, User, Location, Calendar, Camera, VideoPlay, Edit2, CloseCircle, ArrowRight, Add } from 'iconsax-react-nativejs';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const EventsViewAllScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const [modalVisible, setModalVisible] = useState(false);
    const events = [
        {
            id: 1,
            image: Images.photo1,
            title: 'City Run Marathon',
            location: 'Dhaka',
            date: '27/05/2025',
        },
        {
            id: 2,
            image: Images.photo3,
            title: 'City Run Marathon',
            location: 'Dhaka',
            date: '27/05/2025',
        },
        {
            id: 3,
            image: Images.photo4,
            title: 'City Run Marathon',
            location: 'Dhaka',
            date: '27/05/2025',
        },
        {
            id: 4,
            image: Images.photo5,
            title: 'City Run Marathon',
            location: 'Dhaka',
            date: '27/05/2025',
        },
    ];
    const renderEventCard = (event) => (_jsxs(TouchableOpacity, Object.assign({ style: styles.eventCard, onPress: () => setModalVisible(true), activeOpacity: 0.8 }, { children: [_jsxs(View, Object.assign({ style: styles.eventCardContent }, { children: [_jsx(View, Object.assign({ style: styles.eventImageContainer }, { children: _jsx(FastImage, { source: event.image, style: styles.eventImage, resizeMode: "cover" }) })), _jsxs(View, Object.assign({ style: styles.eventDetails }, { children: [_jsxs(View, Object.assign({ style: styles.eventTitleRow }, { children: [_jsx(View, Object.assign({ style: styles.eventTitleIcon }, { children: _jsx(Calendar, { size: 14, color: colors.pureWhite, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: styles.eventTitle }, { children: event.title }))] })), _jsxs(View, Object.assign({ style: styles.eventInfoRow }, { children: [_jsx(Text, Object.assign({ style: styles.eventInfoLabel }, { children: t('Location') })), _jsxs(View, Object.assign({ style: styles.eventInfoValue }, { children: [_jsx(Location, { size: 16, color: colors.subTextColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: styles.eventInfoValueText }, { children: event.location }))] }))] })), _jsxs(View, Object.assign({ style: styles.eventInfoRow }, { children: [_jsx(Text, Object.assign({ style: styles.eventInfoLabel }, { children: t('Date') })), _jsxs(View, Object.assign({ style: styles.eventInfoValue }, { children: [_jsx(Calendar, { size: 16, color: colors.subTextColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: styles.eventInfoValueText }, { children: event.date }))] }))] }))] }))] })), _jsx(View, { style: styles.eventDivider }), _jsxs(View, Object.assign({ style: styles.eventActions }, { children: [_jsxs(View, Object.assign({ style: styles.eventActionButtons }, { children: [_jsxs(TouchableOpacity, Object.assign({ style: styles.eventActionButton }, { children: [_jsx(Text, Object.assign({ style: styles.eventActionButtonText }, { children: t('Photograph') })), _jsx(Camera, { size: 18, color: colors.subTextColor, variant: "Linear" })] })), _jsxs(TouchableOpacity, Object.assign({ style: styles.eventActionButton }, { children: [_jsx(Text, Object.assign({ style: styles.eventActionButtonText }, { children: t('Videos') })), _jsx(VideoPlay, { size: 18, color: colors.subTextColor, variant: "Linear" })] }))] })), _jsxs(TouchableOpacity, Object.assign({ style: styles.eventEditButton }, { children: [_jsx(Text, Object.assign({ style: styles.eventEditButtonText }, { children: t('Edit') })), _jsx(Edit2, { size: 18, color: colors.pureWhite, variant: "Linear" })] }))] }))] }), event.id));
    return (_jsxs(View, Object.assign({ style: styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: styles.headerTitle }, { children: t('Events') })), _jsx(TouchableOpacity, Object.assign({ style: styles.headerButton }, { children: _jsx(User, { size: 24, color: colors.primaryColor, variant: "Linear" }) }))] })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, contentContainerStyle: styles.scrollContent }, { children: [_jsxs(View, Object.assign({ style: styles.sectionHeader }, { children: [_jsx(Text, Object.assign({ style: styles.sectionTitle }, { children: t('Events') })), _jsx(View, Object.assign({ style: styles.eventsBadge }, { children: _jsx(Text, Object.assign({ style: styles.eventsBadgeText }, { children: t('430 Events Available') })) }))] })), _jsx(View, Object.assign({ style: styles.eventsListContainer }, { children: events.map(renderEventCard) })), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] })), _jsx(Modal, Object.assign({ animationType: "fade", transparent: true, visible: modalVisible, onRequestClose: () => setModalVisible(false) }, { children: _jsx(View, Object.assign({ style: styles.modalOverlay }, { children: _jsxs(View, Object.assign({ style: styles.modalContainer }, { children: [_jsx(TouchableOpacity, Object.assign({ style: styles.modalCloseButton, onPress: () => setModalVisible(false) }, { children: _jsx(CloseCircle, { size: 28, color: colors.subTextColor, variant: "Bold" }) })), _jsxs(View, Object.assign({ style: styles.modalOptionsContainer }, { children: [_jsxs(TouchableOpacity, Object.assign({ style: styles.modalOptionButton, onPress: () => {
                                            setModalVisible(false);
                                            navigation.navigate('BottomTabBar', { screen: 'Profile' });
                                        } }, { children: [_jsx(Text, Object.assign({ style: styles.modalOptionText }, { children: t('Standard') })), _jsx(ArrowRight, { size: 20, color: colors.subTextColor, variant: "Linear" })] })), _jsxs(TouchableOpacity, Object.assign({ style: styles.modalOptionButton, onPress: () => {
                                            setModalVisible(false);
                                            navigation.navigate('BottomTabBar', { screen: 'Profile' });
                                        } }, { children: [_jsx(Text, Object.assign({ style: styles.modalOptionText }, { children: t('Photographer') })), _jsx(ArrowRight, { size: 20, color: colors.subTextColor, variant: "Linear" })] })), _jsxs(TouchableOpacity, Object.assign({ style: styles.modalOptionButton, onPress: () => {
                                            setModalVisible(false);
                                            navigation.navigate('GroupProfileScreen');
                                        } }, { children: [_jsx(Text, Object.assign({ style: styles.modalOptionText }, { children: t('Group') })), _jsx(ArrowRight, { size: 20, color: colors.subTextColor, variant: "Linear" })] })), _jsxs(TouchableOpacity, Object.assign({ style: styles.modalAddButton, onPress: () => {
                                            setModalVisible(false);
                                            navigation.navigate('CategorySelectionScreen', { fromAddFlow: true });
                                        } }, { children: [_jsx(Text, Object.assign({ style: styles.modalAddButtonText }, { children: t('Add New') })), _jsx(Add, { size: 20, color: colors.pureWhite, variant: "Linear" })] }))] }))] })) })) }))] })));
};
export default EventsViewAllScreen;
