import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal } from 'react-native';
import React, { useState } from 'react';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Images from '../../constants/Images';
import { createStyles } from './GroupCompetitionsViewAllStyles';
import { ArrowLeft2, SearchNormal1, Setting4, Location, Calendar, Add, CloseCircle, ArrowRight } from 'iconsax-react-nativejs';
import Icons from '../../constants/Icons';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const GroupEventsViewAllScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const { t } = useTranslation();
    const [searchText, setSearchText] = useState('');
    const [joinModalVisible, setJoinModalVisible] = useState(false);
    const [joinOption, setJoinOption] = useState<'myself' | 'team'>('team');
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

    const teamMembers = [
        { id: '1', name: 'Tom' },
        { id: '2', name: 'Jason' },
        { id: '3', name: 'Greg' },
    ];

    const toggleMemberSelection = (memberId: string) => {
        setSelectedMembers(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    const events = [
        { id: 1, title: 'City Run Marathon', distance: '800m heat 1', location: 'Dhaka', date: '27/05/2025', image: Images.photo1 },
        { id: 2, title: 'City Run Marathon', distance: '800m heat 1', location: 'Dhaka', date: '27/05/2025', image: Images.photo1 },
        { id: 3, title: 'City Run Marathon', distance: '800m heat 1', location: 'Dhaka', date: '27/05/2025', image: Images.photo1 },
        { id: 4, title: 'City Run Marathon', distance: '800m heat 1', location: 'Dhaka', date: '27/05/2025', image: Images.photo1 },
    ];

    const renderEventCard = (event: any) => (
        <TouchableOpacity
            key={event.id}
            style={Styles.eventCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('EventAthletesScreen', { event })}
        >
            <View style={Styles.eventCardContent}>
                {/* Top Row - Image and Info */}
                <View style={Styles.eventTopRow}>
                    <FastImage source={event.image} style={Styles.eventImage} resizeMode="cover" />
                    <View style={Styles.eventInfo}>
                        {/* Title */}
                        <Text style={Styles.eventTitle}>{event.title}</Text>

                        {/* Distance Row */}
                        <View style={Styles.eventDetailRow}>
                        <Text style={Styles.eventDetailLabel}>{t('Distance')}</Text>
                            <View style={Styles.eventDetailValueRow}>
                                <Icons.Map width={16} height={16} />
                                <Text style={Styles.eventDetailValue}>{event.distance}</Text>
                            </View>
                        </View>

                        {/* Location Row */}
                        <View style={Styles.eventDetailRow}>
                        <Text style={Styles.eventDetailLabel}>{t('Location')}</Text>
                        <View style={Styles.eventDetailValueRow}>
                            <Location size={16} color={colors.subTextColor} variant="Linear" />
                            <Text style={Styles.eventDetailValue}>{event.location}</Text>
                        </View>
                        </View>

                        {/* Date Row */}
                        <View style={Styles.eventDetailRow}>
                        <Text style={Styles.eventDetailLabel}>{t('Date')}</Text>
                        <View style={Styles.eventDetailValueRow}>
                            <Calendar size={16} color={colors.subTextColor} variant="Linear" />
                            <Text style={Styles.eventDetailValue}>{event.date}</Text>
                        </View>
                        </View>
                    </View>
                </View>

                {/* Add Button */}
                <TouchableOpacity style={Styles.addButton} onPress={(e) => { e.stopPropagation(); setJoinModalVisible(true); }}>
                    <Text style={Styles.addButtonText}>{t('Add')}</Text>
                    <Add size={18} color={colors.pureWhite} variant="Linear" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{t('Events')}</Text>
                <View style={Styles.headerButtonPlaceholder} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {/* Search Bar */}
                <View style={Styles.searchContainer}>
                    <View style={Styles.searchInputContainer}>
                        <SearchNormal1 size={20} color="#9B9F9F" variant="Linear" />
                        <TextInput
                            style={Styles.searchInput}
                            placeholder={t('Search...')}
                            placeholderTextColor={colors.subTextColor}
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                    </View>
                    <TouchableOpacity style={Styles.filterButton}>
                        <Setting4 size={24} color={colors.pureWhite} variant="Linear" />
                    </TouchableOpacity>
                </View>

                {/* Section Header */}
                <View style={Styles.sectionHeader}>
                    <Text style={Styles.sectionTitle}>{t('Events')}</Text>
                    <TouchableOpacity style={Styles.viewAllButton}>
                        <Text style={Styles.viewAllText}>{t('View all')}</Text>
                        <Icons.RightBtnIcon width={18} height={18} />
                    </TouchableOpacity>
                </View>

                {/* Events List */}
                <View style={Styles.eventsList}>
                    {events.map(renderEventCard)}
                </View>

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>

            {/* Join Team Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={joinModalVisible}
                onRequestClose={() => setJoinModalVisible(false)}
            >
                <View style={Styles.modalOverlay}>
                    <View style={Styles.joinModalContainer}>
                        {/* Close Button */}
                        <TouchableOpacity
                            style={Styles.joinModalCloseButton}
                            onPress={() => {
                                setJoinModalVisible(false);
                                setSelectedMembers([]);
                            }}
                        >
                            <CloseCircle size={24} color={colors.subTextColor} variant="Linear" />
                        </TouchableOpacity>

                        {/* Title */}
                        <Text style={Styles.joinModalTitle}>{t('Want to join the team?')}</Text>
                        <Text style={Styles.joinModalSubtitle}>
                            {t('Add yourself and become a part of our creative journey.')}
                        </Text>

                        {/* Options */}
                        <View style={Styles.joinModalOptions}>
                            {/* Add Myself Option */}
                            <TouchableOpacity
                                style={[
                                    Styles.joinModalOption,
                                    joinOption === 'myself' && Styles.joinModalOptionSelected
                                ]}
                                onPress={() => setJoinOption('myself')}
                            >
                                <Text style={[
                                    Styles.joinModalOptionText,
                                    joinOption === 'myself' && Styles.joinModalOptionTextSelected
                                ]}>{t('Add myself')}</Text>
                                <View style={[
                                    Styles.joinModalRadio,
                                    joinOption === 'myself' && Styles.joinModalRadioSelected
                                ]}>
                                    {joinOption === 'myself' && <View style={Styles.joinModalRadioInner} />}
                                </View>
                            </TouchableOpacity>

                            {/* Add Team Option */}
                            <TouchableOpacity
                                style={[
                                    Styles.joinModalOption,
                                    joinOption === 'team' && Styles.joinModalOptionSelected
                                ]}
                                onPress={() => setJoinOption('team')}
                            >
                                <Text style={[
                                    Styles.joinModalOptionText,
                                    joinOption === 'team' && Styles.joinModalOptionTextSelected
                                ]}>{t('Add team')}</Text>
                                <View style={[
                                    Styles.joinModalRadio,
                                    joinOption === 'team' && Styles.joinModalRadioSelected
                                ]}>
                                    {joinOption === 'team' && <View style={Styles.joinModalRadioInner} />}
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Team Members Selection (shown when Add Team is selected) */}
                        {joinOption === 'team' && (
                            <View style={Styles.joinModalMembersSection}>
                        <Text style={Styles.joinModalMembersTitle}>{t('Select participants for the event')}</Text>

                                {teamMembers.map((member) => (
                                    <TouchableOpacity
                                        key={member.id}
                                        style={Styles.joinModalMemberRow}
                                        onPress={() => toggleMemberSelection(member.id)}
                                    >
                                        <Text style={Styles.joinModalMemberName}>{member.name}</Text>
                                        <View style={[
                                            Styles.joinModalCheckbox,
                                            selectedMembers.includes(member.id) && Styles.joinModalCheckboxSelected
                                        ]}>
                                            {selectedMembers.includes(member.id) && <View style={Styles.joinModalCheckboxInner} />}
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {/* Confirm Button */}
                        <TouchableOpacity
                            style={Styles.joinModalConfirmButton}
                            onPress={() => {
                                setJoinModalVisible(false);
                                setSelectedMembers([]);
                                navigation.navigate('CongratulationsScreen');
                            }}
                        >
                            <Text style={Styles.joinModalConfirmButtonText}>{t('Confirm selection')}</Text>
                            <ArrowRight size={20} color={colors.pureWhite} variant="Linear" />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default GroupEventsViewAllScreen;
