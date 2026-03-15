import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal } from 'react-native';
import { useState } from 'react';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Images from '../../constants/Images';
import { createStyles } from './GroupCompetitionsViewAllStyles';
import { ArrowLeft2, SearchNormal1, Setting4, Location, Calendar, Add, CloseCircle, ArrowRight } from 'iconsax-react-nativejs';
import Icons from '../../constants/Icons';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
const GroupEventsViewAllScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    const [searchText, setSearchText] = useState('');
    const [joinModalVisible, setJoinModalVisible] = useState(false);
    const [joinOption, setJoinOption] = useState('team');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const teamMembers = [
        { id: '1', name: 'Tom' },
        { id: '2', name: 'Jason' },
        { id: '3', name: 'Greg' },
    ];
    const toggleMemberSelection = (memberId) => {
        setSelectedMembers(prev => prev.includes(memberId)
            ? prev.filter(id => id !== memberId)
            : [...prev, memberId]);
    };
    const events = [
        { id: 1, title: 'City Run Marathon', distance: '800m heat 1', location: 'Dhaka', date: '27/05/2025', image: Images.photo1 },
        { id: 2, title: 'City Run Marathon', distance: '800m heat 1', location: 'Dhaka', date: '27/05/2025', image: Images.photo1 },
        { id: 3, title: 'City Run Marathon', distance: '800m heat 1', location: 'Dhaka', date: '27/05/2025', image: Images.photo1 },
        { id: 4, title: 'City Run Marathon', distance: '800m heat 1', location: 'Dhaka', date: '27/05/2025', image: Images.photo1 },
    ];
    const renderEventCard = (event) => (_jsx(TouchableOpacity, Object.assign({ style: Styles.eventCard, activeOpacity: 0.8, onPress: () => navigation.navigate('EventAthletesScreen', { event }) }, { children: _jsxs(View, Object.assign({ style: Styles.eventCardContent }, { children: [_jsxs(View, Object.assign({ style: Styles.eventTopRow }, { children: [_jsx(FastImage, { source: event.image, style: Styles.eventImage, resizeMode: "cover" }), _jsxs(View, Object.assign({ style: Styles.eventInfo }, { children: [_jsx(Text, Object.assign({ style: Styles.eventTitle }, { children: event.title })), _jsxs(View, Object.assign({ style: Styles.eventDetailRow }, { children: [_jsx(Text, Object.assign({ style: Styles.eventDetailLabel }, { children: t('Distance') })), _jsxs(View, Object.assign({ style: Styles.eventDetailValueRow }, { children: [_jsx(Icons.Map, { width: 16, height: 16 }), _jsx(Text, Object.assign({ style: Styles.eventDetailValue }, { children: event.distance }))] }))] })), _jsxs(View, Object.assign({ style: Styles.eventDetailRow }, { children: [_jsx(Text, Object.assign({ style: Styles.eventDetailLabel }, { children: t('Location') })), _jsxs(View, Object.assign({ style: Styles.eventDetailValueRow }, { children: [_jsx(Location, { size: 16, color: colors.subTextColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: Styles.eventDetailValue }, { children: event.location }))] }))] })), _jsxs(View, Object.assign({ style: Styles.eventDetailRow }, { children: [_jsx(Text, Object.assign({ style: Styles.eventDetailLabel }, { children: t('Date') })), _jsxs(View, Object.assign({ style: Styles.eventDetailValueRow }, { children: [_jsx(Calendar, { size: 16, color: colors.subTextColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: Styles.eventDetailValue }, { children: event.date }))] }))] }))] }))] })), _jsxs(TouchableOpacity, Object.assign({ style: Styles.addButton, onPress: (e) => { e.stopPropagation(); setJoinModalVisible(true); } }, { children: [_jsx(Text, Object.assign({ style: Styles.addButtonText }, { children: t('Add') })), _jsx(Add, { size: 18, color: colors.pureWhite, variant: "Linear" })] }))] })) }), event.id));
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.headerButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 24, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('Events') })), _jsx(View, { style: Styles.headerButtonPlaceholder })] })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, contentContainerStyle: Styles.scrollContent }, { children: [_jsxs(View, Object.assign({ style: Styles.searchContainer }, { children: [_jsxs(View, Object.assign({ style: Styles.searchInputContainer }, { children: [_jsx(SearchNormal1, { size: 20, color: "#9B9F9F", variant: "Linear" }), _jsx(TextInput, { style: Styles.searchInput, placeholder: t('Search...'), placeholderTextColor: colors.subTextColor, value: searchText, onChangeText: setSearchText })] })), _jsx(TouchableOpacity, Object.assign({ style: Styles.filterButton }, { children: _jsx(Setting4, { size: 24, color: colors.pureWhite, variant: "Linear" }) }))] })), _jsxs(View, Object.assign({ style: Styles.sectionHeader }, { children: [_jsx(Text, Object.assign({ style: Styles.sectionTitle }, { children: t('Events') })), _jsxs(TouchableOpacity, Object.assign({ style: Styles.viewAllButton }, { children: [_jsx(Text, Object.assign({ style: Styles.viewAllText }, { children: t('View all') })), _jsx(Icons.RightBtnIcon, { width: 18, height: 18 })] }))] })), _jsx(View, Object.assign({ style: Styles.eventsList }, { children: events.map(renderEventCard) })), _jsx(SizeBox, { height: insets.bottom > 0 ? insets.bottom + 20 : 40 })] })), _jsx(Modal, Object.assign({ animationType: "fade", transparent: true, visible: joinModalVisible, onRequestClose: () => setJoinModalVisible(false) }, { children: _jsx(View, Object.assign({ style: Styles.modalOverlay }, { children: _jsxs(View, Object.assign({ style: Styles.joinModalContainer }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.joinModalCloseButton, onPress: () => {
                                    setJoinModalVisible(false);
                                    setSelectedMembers([]);
                                } }, { children: _jsx(CloseCircle, { size: 24, color: colors.subTextColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.joinModalTitle }, { children: t('Want to join the team?') })), _jsx(Text, Object.assign({ style: Styles.joinModalSubtitle }, { children: t('Add yourself and become a part of our creative journey.') })), _jsxs(View, Object.assign({ style: Styles.joinModalOptions }, { children: [_jsxs(TouchableOpacity, Object.assign({ style: [
                                            Styles.joinModalOption,
                                            joinOption === 'myself' && Styles.joinModalOptionSelected
                                        ], onPress: () => setJoinOption('myself') }, { children: [_jsx(Text, Object.assign({ style: [
                                                    Styles.joinModalOptionText,
                                                    joinOption === 'myself' && Styles.joinModalOptionTextSelected
                                                ] }, { children: t('Add myself') })), _jsx(View, Object.assign({ style: [
                                                    Styles.joinModalRadio,
                                                    joinOption === 'myself' && Styles.joinModalRadioSelected
                                                ] }, { children: joinOption === 'myself' && _jsx(View, { style: Styles.joinModalRadioInner }) }))] })), _jsxs(TouchableOpacity, Object.assign({ style: [
                                            Styles.joinModalOption,
                                            joinOption === 'team' && Styles.joinModalOptionSelected
                                        ], onPress: () => setJoinOption('team') }, { children: [_jsx(Text, Object.assign({ style: [
                                                    Styles.joinModalOptionText,
                                                    joinOption === 'team' && Styles.joinModalOptionTextSelected
                                                ] }, { children: t('Add team') })), _jsx(View, Object.assign({ style: [
                                                    Styles.joinModalRadio,
                                                    joinOption === 'team' && Styles.joinModalRadioSelected
                                                ] }, { children: joinOption === 'team' && _jsx(View, { style: Styles.joinModalRadioInner }) }))] }))] })), joinOption === 'team' && (_jsxs(View, Object.assign({ style: Styles.joinModalMembersSection }, { children: [_jsx(Text, Object.assign({ style: Styles.joinModalMembersTitle }, { children: t('Select participants for the event') })), teamMembers.map((member) => (_jsxs(TouchableOpacity, Object.assign({ style: Styles.joinModalMemberRow, onPress: () => toggleMemberSelection(member.id) }, { children: [_jsx(Text, Object.assign({ style: Styles.joinModalMemberName }, { children: member.name })), _jsx(View, Object.assign({ style: [
                                                    Styles.joinModalCheckbox,
                                                    selectedMembers.includes(member.id) && Styles.joinModalCheckboxSelected
                                                ] }, { children: selectedMembers.includes(member.id) && _jsx(View, { style: Styles.joinModalCheckboxInner }) }))] }), member.id)))] }))), _jsxs(TouchableOpacity, Object.assign({ style: Styles.joinModalConfirmButton, onPress: () => {
                                    setJoinModalVisible(false);
                                    setSelectedMembers([]);
                                    navigation.navigate('CongratulationsScreen');
                                } }, { children: [_jsx(Text, Object.assign({ style: Styles.joinModalConfirmButtonText }, { children: t('Confirm selection') })), _jsx(ArrowRight, { size: 20, color: colors.pureWhite, variant: "Linear" })] }))] })) })) }))] })));
};
export default GroupEventsViewAllScreen;
