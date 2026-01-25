import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import React, { useState } from 'react';
import SizeBox from '../../constants/SizeBox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Images from '../../constants/Images';
import Colors from '../../constants/Colors';
import Styles from './EventsViewAllStyles';
import { ArrowLeft2, User, Location, Calendar, Camera, VideoPlay, Edit2, CloseCircle, ArrowRight, Add } from 'iconsax-react-nativejs';

const EventsViewAllScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
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
        <TouchableOpacity key={event.id} style={Styles.eventCard} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
            <View style={Styles.eventCardContent}>
                <View style={Styles.eventImageContainer}>
                    <FastImage source={event.image} style={Styles.eventImage} resizeMode="cover" />
                </View>
                <View style={Styles.eventDetails}>
                    <View style={Styles.eventTitleRow}>
                        <View style={Styles.eventTitleIcon}>
                            <Calendar size={14} color={Colors.whiteColor} variant="Linear" />
                        </View>
                        <Text style={Styles.eventTitle}>{event.title}</Text>
                    </View>
                    <View style={Styles.eventInfoRow}>
                        <Text style={Styles.eventInfoLabel}>Location</Text>
                        <View style={Styles.eventInfoValue}>
                            <Location size={16} color="#9B9F9F" variant="Linear" />
                            <Text style={Styles.eventInfoValueText}>{event.location}</Text>
                        </View>
                    </View>
                    <View style={Styles.eventInfoRow}>
                        <Text style={Styles.eventInfoLabel}>Date</Text>
                        <View style={Styles.eventInfoValue}>
                            <Calendar size={16} color="#9B9F9F" variant="Linear" />
                            <Text style={Styles.eventInfoValueText}>{event.date}</Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={Styles.eventDivider} />
            <View style={Styles.eventActions}>
                <View style={Styles.eventActionButtons}>
                    <TouchableOpacity style={Styles.eventActionButton}>
                        <Text style={Styles.eventActionButtonText}>Photograph</Text>
                        <Camera size={18} color="#9B9F9F" variant="Linear" />
                    </TouchableOpacity>
                    <TouchableOpacity style={Styles.eventActionButton}>
                        <Text style={Styles.eventActionButtonText}>Videos</Text>
                        <VideoPlay size={18} color="#9B9F9F" variant="Linear" />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={Styles.eventEditButton}>
                    <Text style={Styles.eventEditButtonText}>Edit</Text>
                    <Edit2 size={18} color={Colors.whiteColor} variant="Linear" />
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
                    <ArrowLeft2 size={24} color={Colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Events</Text>
                <TouchableOpacity style={Styles.headerButton}>
                    <User size={24} color={Colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {/* Section Header */}
                <View style={Styles.sectionHeader}>
                    <Text style={Styles.sectionTitle}>Events</Text>
                    <View style={Styles.eventsBadge}>
                        <Text style={Styles.eventsBadgeText}>430 Events Available</Text>
                    </View>
                </View>

                {/* Events List */}
                <View style={Styles.eventsListContainer}>
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
                <View style={Styles.modalOverlay}>
                    <View style={Styles.modalContainer}>
                        <TouchableOpacity style={Styles.modalCloseButton} onPress={() => setModalVisible(false)}>
                            <CloseCircle size={28} color="#9B9F9F" variant="Bold" />
                        </TouchableOpacity>

                        <View style={Styles.modalOptionsContainer}>
                            <TouchableOpacity style={Styles.modalOptionButton} onPress={() => {
                                setModalVisible(false);
                                navigation.navigate('ViewUserProfileScreen');
                            }}>
                                <Text style={Styles.modalOptionText}>Standaard</Text>
                                <ArrowRight size={20} color="#9B9F9F" variant="Linear" />
                            </TouchableOpacity>

                            <TouchableOpacity style={Styles.modalOptionButton} onPress={() => {
                                setModalVisible(false);
                                navigation.navigate('ViewUserProfileScreen');
                            }}>
                                <Text style={Styles.modalOptionText}>Photographer</Text>
                                <ArrowRight size={20} color="#9B9F9F" variant="Linear" />
                            </TouchableOpacity>

                            <TouchableOpacity style={Styles.modalOptionButton} onPress={() => {
                                setModalVisible(false);
                                navigation.navigate('GroupProfileScreen');
                            }}>
                                <Text style={Styles.modalOptionText}>Group</Text>
                                <ArrowRight size={20} color="#9B9F9F" variant="Linear" />
                            </TouchableOpacity>

                            <TouchableOpacity style={Styles.modalAddButton} onPress={() => {
                                setModalVisible(false);
                                navigation.navigate('SelectCategoryScreen');
                            }}>
                                <Text style={Styles.modalAddButtonText}>Add New</Text>
                                <Add size={20} color={Colors.whiteColor} variant="Linear" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default EventsViewAllScreen;
