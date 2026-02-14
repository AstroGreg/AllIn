import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ArrowLeft2,
    NotificationBing,
} from 'iconsax-react-nativejs';
import { createStyles } from './NotificationsScreenStyles';
import SizeBox from '../../constants/SizeBox';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const NotificationsScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const Styles = createStyles(colors);

    const notifications = [
        {
            id: 1,
            title: t('notificationTitle'),
            description: t('notificationDescription'),
            isNew: true,
            date: null,
        },
        {
            id: 2,
            title: t('notificationTitle'),
            description: t('notificationDescription'),
            isNew: true,
            date: null,
        },
        {
            id: 3,
            title: t('notificationTitle'),
            description: t('notificationDescription'),
            isNew: false,
            date: '27.5.2025',
        },
        {
            id: 4,
            title: t('notificationTitle'),
            description: t('notificationDescription'),
            isNew: false,
            date: '27.5.2025',
        },
        {
            id: 5,
            title: t('notificationTitle'),
            description: t('notificationDescription'),
            isNew: false,
            date: '27.5.2025',
        },
        {
            id: 6,
            title: t('notificationTitle'),
            description: t('notificationDescription'),
            isNew: false,
            date: '27.5.2025',
        },
        {
            id: 7,
            title: t('notificationTitle'),
            description: t('notificationDescription'),
            isNew: false,
            date: '27.5.2025',
        },
        {
            id: 8,
            title: t('notificationTitle'),
            description: t('notificationDescription'),
            isNew: false,
            date: '27.5.2025',
        },
    ];

    const renderNotificationCard = (item: any) => (
        <View key={item.id} style={Styles.notificationCard}>
            <View style={Styles.notificationLeft}>
                <View style={Styles.iconContainer}>
                    <NotificationBing size={24} color={colors.primaryColor} variant="Bold" />
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
                            <Text style={Styles.newBadgeText}>{t('new')}</Text>
                        </View>
                        <TouchableOpacity>
                            <Text style={Styles.detailsLink}>{t('details')}</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text style={Styles.dateText}>{item.date}</Text>
                        <TouchableOpacity>
                            <Text style={Styles.detailsLink}>{t('details')}</Text>
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
                    <ArrowLeft2 size={20} color={colors.primaryColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{t('notifications')}</Text>
                <View style={{ width: 44, height: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {/* Section Header */}
                <View style={Styles.sectionHeader}>
                    <Text style={Styles.sectionTitle}>{t('notifications')}</Text>
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
