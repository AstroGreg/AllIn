import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import React, { useState } from 'react';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Images from '../../constants/Images';
import { createStyles } from './EventsViewAllStyles';
import { ArrowLeft2, User, Location, Calendar, Camera, VideoPlay, Edit2, CloseCircle, ArrowRight, Add } from 'iconsax-react-nativejs';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const EventsViewAllScreen = ({ navigation }: any) => {
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

    const renderEventCard = (event: any) => (
        <TouchableOpacity key={event.id} style={styles.eventCard} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
            <View style={styles.eventCardContent}>
                <View style={styles.eventImageContainer}>
                    <FastImage source={event.image} style={styles.eventImage} resizeMode="cover" />
                </View>
                <View style={styles.eventDetails}>
                    <View style={styles.eventTitleRow}>
                        <View style={styles.eventTitleIcon}>
                            <Calendar size={14} color={colors.pureWhite} variant="Linear" />
                        </View>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                    </View>
                    <View style={styles.eventInfoRow}>
                        <Text style={styles.eventInfoLabel}>{t('Location')}</Text>
                        <View style={styles.eventInfoValue}>
                            <Location size={16} color={colors.subTextColor} variant="Linear" />
                            <Text style={styles.eventInfoValueText}>{event.location}</Text>
                        </View>
                    </View>
                    <View style={styles.eventInfoRow}>
                        <Text style={styles.eventInfoLabel}>{t('Date')}</Text>
                        <View style={styles.eventInfoValue}>
                            <Calendar size={16} color={colors.subTextColor} variant="Linear" />
                            <Text style={styles.eventInfoValueText}>{event.date}</Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={styles.eventDivider} />
            <View style={styles.eventActions}>
                <View style={styles.eventActionButtons}>
                    <TouchableOpacity style={styles.eventActionButton}>
                        <Text style={styles.eventActionButtonText}>{t('Photograph')}</Text>
                        <Camera size={18} color={colors.subTextColor} variant="Linear" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.eventActionButton}>
                        <Text style={styles.eventActionButtonText}>{t('Videos')}</Text>
                        <VideoPlay size={18} color={colors.subTextColor} variant="Linear" />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.eventEditButton}>
                    <Text style={styles.eventEditButtonText}>{t('Edit')}</Text>
                    <Edit2 size={18} color={colors.pureWhite} variant="Linear" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Events')}</Text>
                <TouchableOpacity style={styles.headerButton}>
                    <User size={24} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Section Header */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{t('Events')}</Text>
                    <View style={styles.eventsBadge}>
                        <Text style={styles.eventsBadgeText}>{t('430 Events Available')}</Text>
                    </View>
                </View>

                {/* Events List */}
                <View style={styles.eventsListContainer}>
                    {events.map(renderEventCard)}
                </View>

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>

            {/* Event Options Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
                            <CloseCircle size={28} color={colors.subTextColor} variant="Bold" />
                        </TouchableOpacity>

                        <View style={styles.modalOptionsContainer}>
                            <TouchableOpacity style={styles.modalOptionButton} onPress={() => {
                                setModalVisible(false);
                                navigation.navigate('ViewUserProfileScreen');
                            }}>
                                <Text style={styles.modalOptionText}>{t('Standard')}</Text>
                                <ArrowRight size={20} color={colors.subTextColor} variant="Linear" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.modalOptionButton} onPress={() => {
                                setModalVisible(false);
                                navigation.navigate('ViewUserProfileScreen');
                            }}>
                                <Text style={styles.modalOptionText}>{t('Photographer')}</Text>
                                <ArrowRight size={20} color={colors.subTextColor} variant="Linear" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.modalOptionButton} onPress={() => {
                                setModalVisible(false);
                                navigation.navigate('GroupProfileScreen');
                            }}>
                                <Text style={styles.modalOptionText}>{t('Group')}</Text>
                                <ArrowRight size={20} color={colors.subTextColor} variant="Linear" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.modalAddButton} onPress={() => {
                                setModalVisible(false);
                                navigation.navigate('SelectCategoryScreen');
                            }}>
                                <Text style={styles.modalAddButtonText}>{t('Add New')}</Text>
                                <Add size={20} color={colors.pureWhite} variant="Linear" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default EventsViewAllScreen;
