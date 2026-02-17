import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ArrowLeft2,
    NotificationBing,
} from 'iconsax-react-nativejs';
import { createStyles } from './NotificationsScreenStyles';
import SizeBox from '../../constants/SizeBox';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { ApiError, getNotifications, markNotificationRead, type AppNotification } from '../../services/apiGateway';
import { useFocusEffect } from '@react-navigation/native';

const NotificationsScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const { apiAccessToken } = useAuth();
    const Styles = createStyles(colors);
    const [items, setItems] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [errorText, setErrorText] = useState<string | null>(null);
    const [markingId, setMarkingId] = useState<string | null>(null);

    const loadNotifications = useCallback(async (isRefresh = false) => {
        if (!apiAccessToken) {
            setItems([]);
            setErrorText(t('Log in to load notifications.'));
            return;
        }
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setErrorText(null);
        try {
            const res = await getNotifications(apiAccessToken, { limit: 100, offset: 0 });
            setItems(Array.isArray(res?.notifications) ? res.notifications : []);
        } catch (e: any) {
            const message = e instanceof ApiError ? e.message : String(e?.message ?? e);
            setErrorText(message);
            setItems([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [apiAccessToken, t]);

    useFocusEffect(
        useCallback(() => {
            loadNotifications(false);
        }, [loadNotifications]),
    );

    const formatDate = useCallback((value?: string | null) => {
        if (!value) return '';
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return '';
        return d.toLocaleDateString('en-GB');
    }, []);

    const unreadCount = useMemo(
        () => items.filter((x) => !x.read_at).length,
        [items],
    );

    const handleMarkRead = useCallback(async (item: AppNotification) => {
        if (!apiAccessToken || item.read_at) return;
        setMarkingId(item.id);
        try {
            await markNotificationRead(apiAccessToken, item.id);
            setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, read_at: new Date().toISOString() } : x)));
        } catch {
            // keep silent for now
        } finally {
            setMarkingId(null);
        }
    }, [apiAccessToken]);

    const renderNotificationCard = (item: AppNotification) => (
        <View key={item.id} style={Styles.notificationCard}>
            <View style={Styles.notificationLeft}>
                <View style={Styles.iconContainer}>
                    <NotificationBing size={24} color={colors.primaryColor} variant="Bold" />
                </View>
                <View style={Styles.notificationContent}>
                    <Text style={Styles.notificationTitle}>{item.title || t('notificationTitle')}</Text>
                    <Text style={Styles.notificationDescription}>{item.body || t('notificationDescription')}</Text>
                </View>
            </View>
            <View style={Styles.notificationRight}>
                {!item.read_at ? (
                    <>
                        <View style={Styles.newBadge}>
                            <Text style={Styles.newBadgeText}>{t('new')}</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleMarkRead(item)} disabled={markingId === item.id}>
                            <Text style={Styles.detailsLink}>
                                {markingId === item.id ? t('Loading...') : t('details')}
                            </Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text style={Styles.dateText}>{formatDate(item.created_at)}</Text>
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

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={Styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => loadNotifications(true)}
                        tintColor={colors.primaryColor}
                    />
                }
            >
                {/* Section Header */}
                <View style={Styles.sectionHeader}>
                    <Text style={Styles.sectionTitle}>{t('notifications')}</Text>
                    <Text style={Styles.viewAllText}>{`${unreadCount} ${t('new')}`}</Text>
                </View>

                <SizeBox height={16} />

                {loading ? (
                    <ActivityIndicator color={colors.primaryColor} />
                ) : errorText ? (
                    <Text style={[Styles.notificationDescription, { color: '#ED5454' }]}>{errorText}</Text>
                ) : items.length === 0 ? (
                    <Text style={Styles.notificationDescription}>{t('No notifications yet')}</Text>
                ) : (
                    <View style={Styles.notificationsList}>
                        {items.map(renderNotificationCard)}
                    </View>
                )}

                <SizeBox height={40} />
            </ScrollView>
        </View>
    );
};

export default NotificationsScreen;
