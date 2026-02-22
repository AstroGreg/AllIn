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
import { createStyles } from './CompetitionEventDetailsScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Images from '../../constants/Images';
import Icons from '../../constants/Icons';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const EventDetailsScreen = ({ navigation }: any) => {
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

    const renderEditRequestCard = (item: any) => (
        <View key={item.id} style={styles.editRequestCard}>
            <View style={styles.editRequestHeader}>
                <View style={styles.receiptIconContainer}>
                    <Icons.ReceiptEdit height={22} width={22} />
                </View>
                <TouchableOpacity style={styles.editButton}>
                    <Edit2 size={12} color={colors.subTextColor} variant="Linear" />
                    <Text style={styles.editButtonText}>{t('Edit')}</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.editRequestContent}>
                <Text style={styles.editRequestTitle}>{item.title}</Text>
                <View style={styles.editRequestMeta}>
                    <View style={styles.metaItem}>
                        <Calendar size={12} color={colors.subTextColor} variant="Linear" />
                        <Text style={styles.metaText}>{item.date}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Clock size={12} color={colors.subTextColor} variant="Linear" />
                        <Text style={styles.metaText}>{item.time}</Text>
                    </View>
                </View>
            </View>
            {item.status === 'fixed' ? (
                <View style={styles.fixedBadge}>
                    <Text style={styles.fixedBadgeText}>{t('Fixed')}</Text>
                    <TickCircle size={14} color="#00BD48" variant="Linear" />
                </View>
            ) : (
                <View style={styles.pendingBadge}>
                    <Text style={styles.pendingBadgeText}>{t('Pending')}</Text>
                    <Refresh size={14} color="#FF8000" variant="Linear" />
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={20} color={colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Event Details')}</Text>
                <TouchableOpacity
                    style={styles.notificationButton}
                    onPress={() => navigation.navigate('NotificationsScreen')}
                >
                    <Icons.NotificationBoldBlue height={24} width={24} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Event Thumbnail */}
                <View style={styles.eventContainer}>
                    <FastImage source={eventData.thumbnail} style={styles.eventThumbnail} resizeMode="cover" />
                </View>

                {/* Event Info */}
                <View style={styles.eventInfo}>
                    <View style={styles.eventInfoRow}>
                        <Text style={styles.eventTitle}>{eventData.title}</Text>
                        <View style={styles.locationContainer}>
                            <Location size={16} color={colors.subTextColor} variant="Linear" />
                            <Text style={styles.locationText}>{eventData.location}</Text>
                        </View>
                    </View>
                    <View style={styles.eventInfoRow}>
                        <View style={styles.participantsContainer}>
                            <People size={16} color={colors.subTextColor} variant="Linear" />
                            <Text style={styles.participantsText}>{eventData.participants}</Text>
                        </View>
                        <View style={styles.dateContainer}>
                            <Calendar size={16} color={colors.subTextColor} variant="Linear" />
                            <Text style={styles.dateText}>{eventData.date}</Text>
                        </View>
                    </View>
                </View>

                {/* Request for Edits Section */}
                <Text style={styles.sectionTitle}>{t('Request for Edits')}</Text>
                <SizeBox height={16} />

                <View style={styles.receivedLabel}>
                    <Text style={styles.receivedText}>{t('Received')}</Text>
                </View>

                <SizeBox height={16} />

                {/* Edit Requests Grid */}
                <View style={styles.editRequestsGrid}>
                    <View style={styles.editRequestsRow}>
                        {editRequests.slice(0, 2).map(renderEditRequestCard)}
                    </View>
                    <View style={styles.editRequestsRow}>
                        {editRequests.slice(2, 4).map(renderEditRequestCard)}
                    </View>
                </View>

                <SizeBox height={24} />

                {/* Edit Button */}
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => navigation.navigate('SentRequestStateScreen')}
                >
                    <Text style={styles.primaryButtonText}>{t('Edit')}</Text>
                    <Edit2 size={18} color={colors.pureWhite} variant="Linear" />
                </TouchableOpacity>

                <SizeBox height={20} />
            </ScrollView>
        </View>
    );
};

export default EventDetailsScreen;
