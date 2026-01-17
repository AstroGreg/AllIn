import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ArrowLeft2,
    NotificationBing,
} from 'iconsax-react-nativejs';
import Styles from './NotificationsScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Colors from '../../constants/Colors';
import Icons from '../../constants/Icons';

const NotificationsScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();

    const notifications = [
        {
            id: 1,
            title: 'You have New Notification',
            description: 'Lorem ipsum dolor sit amet contestre...',
            isNew: true,
            date: null,
        },
        {
            id: 2,
            title: 'You have New Notification',
            description: 'Lorem ipsum dolor sit amet contestre...',
            isNew: true,
            date: null,
        },
        {
            id: 3,
            title: 'You have New Notification',
            description: 'Lorem ipsum dolor sit amet contestre...',
            isNew: false,
            date: '27.5.2025',
        },
        {
            id: 4,
            title: 'You have New Notification',
            description: 'Lorem ipsum dolor sit amet contestre...',
            isNew: false,
            date: '27.5.2025',
        },
        {
            id: 5,
            title: 'You have New Notification',
            description: 'Lorem ipsum dolor sit amet contestre...',
            isNew: false,
            date: '27.5.2025',
        },
        {
            id: 6,
            title: 'You have New Notification',
            description: 'Lorem ipsum dolor sit amet contestre...',
            isNew: false,
            date: '27.5.2025',
        },
        {
            id: 7,
            title: 'You have New Notification',
            description: 'Lorem ipsum dolor sit amet contestre...',
            isNew: false,
            date: '27.5.2025',
        },
        {
            id: 8,
            title: 'You have New Notification',
            description: 'Lorem ipsum dolor sit amet contestre...',
            isNew: false,
            date: '27.5.2025',
        },
    ];

    const renderNotificationCard = (item: any) => (
        <View key={item.id} style={Styles.notificationCard}>
            <View style={Styles.notificationLeft}>
                <View style={Styles.iconContainer}>
                    <NotificationBing size={24} color={Colors.primaryColor} variant="Bold" />
                </View>
                <View style={Styles.notificationContent}>
                    <Text style={Styles.notificationTitle}>{item.title}</Text>
                    <Text style={Styles.notificationDescription}>{item.description}</Text>
                </View>
            </View>
            <View style={Styles.notificationRight}>
                {item.isNew ? (
                    <>
                        <View style={Styles.newBadge}>
                            <Text style={Styles.newBadgeText}>New</Text>
                        </View>
                        <TouchableOpacity>
                            <Text style={Styles.detailsLink}>Details</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text style={Styles.dateText}>{item.date}</Text>
                        <TouchableOpacity>
                            <Text style={Styles.detailsLink}>Details</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
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
                <Text style={Styles.headerTitle}>Notifications</Text>
                <TouchableOpacity style={Styles.notificationButton}>
                    <Icons.NotificationBoldBlue height={24} width={24} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {/* Section Header */}
                <View style={Styles.sectionHeader}>
                    <Text style={Styles.sectionTitle}>Notifications</Text>
                    <TouchableOpacity>
                        <Text style={Styles.viewAllText}>View all</Text>
                    </TouchableOpacity>
                </View>

                <SizeBox height={16} />

                {/* Notifications List */}
                <View style={Styles.notificationsList}>
                    {notifications.map(renderNotificationCard)}
                </View>

                <SizeBox height={40} />
            </ScrollView>
        </View>
    );
};

export default NotificationsScreen;
