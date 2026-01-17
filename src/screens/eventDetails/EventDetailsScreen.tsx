import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import {
    ArrowLeft2,
    Calendar,
    Location,
    Clock,
    Edit2,
    TickCircle,
    Refresh,
    People,
} from 'iconsax-react-nativejs';
import Styles from './EventDetailsScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Images from '../../constants/Images';
import Colors from '../../constants/Colors';
import Icons from '../../constants/Icons';

const EventDetailsScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();

    const eventData = {
        title: 'BK Studentent 23',
        location: 'Berlin, Germany',
        participants: 'Participants',
        date: '27.5.2025',
        thumbnail: Images.photo6,
    };

    const editRequests = [
        {
            id: 1,
            title: 'Enhance Lighting & Colors',
            date: '12.12.2024',
            time: '12:00',
            status: 'fixed',
        },
        {
            id: 2,
            title: 'Remove Watermark/Text',
            date: '12.12.2024',
            time: '12:00',
            status: 'fixed',
        },
        {
            id: 3,
            title: 'Enhance Lighting & Colors',
            date: '12.12.2024',
            time: '12:00',
            status: 'pending',
        },
        {
            id: 4,
            title: 'Slow Motion Effect',
            date: '12.12.2024',
            time: '12:00',
            status: 'fixed',
        },
    ];

    const renderEditRequestCard = (item: any) => (
        <View key={item.id} style={Styles.editRequestCard}>
            <View style={Styles.editRequestHeader}>
                <View style={Styles.receiptIconContainer}>
                    <Icons.ReceiptEdit height={22} width={22} />
                </View>
                <TouchableOpacity style={Styles.editButton}>
                    <Edit2 size={12} color="#9B9F9F" variant="Linear" />
                    <Text style={Styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
            </View>
            <View style={Styles.editRequestContent}>
                <Text style={Styles.editRequestTitle}>{item.title}</Text>
                <View style={Styles.editRequestMeta}>
                    <View style={Styles.metaItem}>
                        <Calendar size={12} color="#9B9F9F" variant="Linear" />
                        <Text style={Styles.metaText}>{item.date}</Text>
                    </View>
                    <View style={Styles.metaItem}>
                        <Clock size={12} color="#9B9F9F" variant="Linear" />
                        <Text style={Styles.metaText}>{item.time}</Text>
                    </View>
                </View>
            </View>
            {item.status === 'fixed' ? (
                <View style={Styles.fixedBadge}>
                    <Text style={Styles.fixedBadgeText}>Fixed</Text>
                    <TickCircle size={14} color="#00BD48" variant="Linear" />
                </View>
            ) : (
                <View style={Styles.pendingBadge}>
                    <Text style={Styles.pendingBadgeText}>Pending</Text>
                    <Refresh size={14} color="#FF8000" variant="Linear" />
                </View>
            )}
        </View>
    );

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={20} color={Colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Event Details</Text>
                <TouchableOpacity
                    style={Styles.notificationButton}
                    onPress={() => navigation.navigate('NotificationsScreen')}
                >
                    <Icons.NotificationBoldBlue height={24} width={24} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {/* Event Thumbnail */}
                <View style={Styles.eventContainer}>
                    <FastImage source={eventData.thumbnail} style={Styles.eventThumbnail} resizeMode="cover" />
                </View>

                {/* Event Info */}
                <View style={Styles.eventInfo}>
                    <View style={Styles.eventInfoRow}>
                        <Text style={Styles.eventTitle}>{eventData.title}</Text>
                        <View style={Styles.locationContainer}>
                            <Location size={16} color="#9B9F9F" variant="Linear" />
                            <Text style={Styles.locationText}>{eventData.location}</Text>
                        </View>
                    </View>
                    <View style={Styles.eventInfoRow}>
                        <View style={Styles.participantsContainer}>
                            <People size={16} color="#9B9F9F" variant="Linear" />
                            <Text style={Styles.participantsText}>{eventData.participants}</Text>
                        </View>
                        <View style={Styles.dateContainer}>
                            <Calendar size={16} color="#9B9F9F" variant="Linear" />
                            <Text style={Styles.dateText}>{eventData.date}</Text>
                        </View>
                    </View>
                </View>

                {/* Request for Edits Section */}
                <Text style={Styles.sectionTitle}>Request for Edits</Text>
                <SizeBox height={16} />

                <View style={Styles.receivedLabel}>
                    <Text style={Styles.receivedText}>Received</Text>
                </View>

                <SizeBox height={16} />

                {/* Edit Requests Grid */}
                <View style={Styles.editRequestsGrid}>
                    <View style={Styles.editRequestsRow}>
                        {editRequests.slice(0, 2).map(renderEditRequestCard)}
                    </View>
                    <View style={Styles.editRequestsRow}>
                        {editRequests.slice(2, 4).map(renderEditRequestCard)}
                    </View>
                </View>

                <SizeBox height={24} />

                {/* Edit Button */}
                <TouchableOpacity
                    style={Styles.primaryButton}
                    onPress={() => navigation.navigate('SentRequestStateScreen')}
                >
                    <Text style={Styles.primaryButtonText}>Edit</Text>
                    <Edit2 size={18} color={Colors.whiteColor} variant="Linear" />
                </TouchableOpacity>

                <SizeBox height={20} />
            </ScrollView>
        </View>
    );
};

export default EventDetailsScreen;
