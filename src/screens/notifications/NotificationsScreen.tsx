import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Animated, PanResponder } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import {
    ArrowLeft2,
    NotificationBing,
    Eye,
} from 'iconsax-react-nativejs';
import { createStyles } from './NotificationsScreenStyles';
import SizeBox from '../../constants/SizeBox';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { ApiError, getNotifications, markNotificationRead, type AppNotification } from '../../services/apiGateway';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SwipeToReadCard = ({
    enabled,
    onSwipeRight,
    children,
}: {
    enabled: boolean;
    onSwipeRight: () => void;
    children: React.ReactNode;
}) => {
    const translateX = React.useRef(new Animated.Value(0)).current;
    const didTrigger = React.useRef(false);

    const reset = useCallback(() => {
        Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            speed: 20,
            bounciness: 0,
        }).start(() => {
            didTrigger.current = false;
        });
    }, [translateX]);

    const panResponder = React.useMemo(
        () =>
            PanResponder.create({
                onMoveShouldSetPanResponder: (_, gestureState) =>
                    enabled && gestureState.dx > 12 && Math.abs(gestureState.dy) < 10,
                onPanResponderMove: (_, gestureState) => {
                    if (!enabled) return;
                    const dx = Math.max(0, Math.min(gestureState.dx, 120));
                    translateX.setValue(dx);
                },
                onPanResponderRelease: (_, gestureState) => {
                    if (!enabled) return;
                    if (!didTrigger.current && gestureState.dx > 90) {
                        didTrigger.current = true;
                        onSwipeRight();
                    }
                    reset();
                },
                onPanResponderTerminate: () => {
                    reset();
                },
            }),
        [enabled, onSwipeRight, reset, translateX],
    );

    if (!enabled) return <>{children}</>;

    return (
        <View style={{ borderRadius: 10, overflow: 'hidden' }}>
            <View
                pointerEvents="none"
                style={{
                    position: 'absolute',
                    left: 16,
                    top: 0,
                    bottom: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                    opacity: 0.7,
                }}
            >
                <Eye size={22} color="#8A8A8A" variant="Linear" />
            </View>
            <Animated.View style={{ transform: [{ translateX }] }} {...panResponder.panHandlers}>
                {children}
            </Animated.View>
        </View>
    );
};

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
    const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState<boolean | null>(null);

    useFocusEffect(
        useCallback(() => {
            let mounted = true;
            AsyncStorage.getItem('@push_notifications_enabled')
                .then((value) => {
                    if (!mounted) return;
                    const enabled = value !== '0';
                    setPushNotificationsEnabled(enabled);
                    if (!enabled) {
                        setItems([]);
                        setErrorText(null);
                    }
                })
                .catch(() => {
                    if (!mounted) return;
                    setPushNotificationsEnabled(true);
                });
            return () => {
                mounted = false;
            };
        }, []),
    );

    const loadNotifications = useCallback(async (isRefresh = false) => {
        if (pushNotificationsEnabled == null) {
            return;
        }
        if (!pushNotificationsEnabled) {
            setItems([]);
            setErrorText(null);
            setLoading(false);
            setRefreshing(false);
            return;
        }
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
            const notifications = Array.isArray(res?.notifications) ? res.notifications : [];
            setItems(notifications);
        } catch (e: any) {
            const message = e instanceof ApiError ? e.message : String(e?.message ?? e);
            setErrorText(message);
            setItems([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [apiAccessToken, pushNotificationsEnabled, t]);

    useFocusEffect(
        useCallback(() => {
            if (pushNotificationsEnabled == null) return;
            loadNotifications(false);
        }, [loadNotifications]),
    );

    const formatDate = useCallback((value?: string | null) => {
        if (!value) return '';
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return '';
        return d.toLocaleDateString('en-GB');
    }, []);

    const collectNotificationIds = useCallback((item: AppNotification) => {
        const bundled = Array.isArray((item.metadata as any)?.notification_ids)
            ? (item.metadata as any).notification_ids
                .map((entry: any) => String(entry || '').trim())
                .filter(Boolean)
            : [];
        return bundled.length > 0 ? bundled : [String(item.id || '').trim()].filter(Boolean);
    }, []);

    const handleMarkRead = useCallback(async (item: AppNotification) => {
        if (!apiAccessToken || item.read_at) return;
        setMarkingId(item.id);
        try {
            await Promise.allSettled(collectNotificationIds(item).map((id: string) => markNotificationRead(apiAccessToken, id)));
            const readAt = new Date().toISOString();
            setItems((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, read_at: readAt } : entry)));
        } catch {
            // keep silent for now
        } finally {
            setMarkingId(null);
        }
    }, [apiAccessToken, collectNotificationIds]);

    const handleOpenNotification = useCallback(async (item: AppNotification) => {
        const metadata = item.metadata && typeof item.metadata === 'object' ? item.metadata : {};
        const action = String((metadata as any)?.action || '').trim().toLowerCase();
        const actorProfileId = String(item.actor_profile_id ?? (metadata as any)?.actor_profile_id ?? '').trim();
        const rawMediaId = item.media_id ?? (metadata as any)?.media_id ?? null;
        const mediaId = rawMediaId ? String(rawMediaId).trim() : '';
        const mediaType = String((metadata as any)?.media_type || '').trim().toLowerCase();
        const eventId = String(item.event_id ?? (metadata as any)?.event_id ?? '').trim();
        const eventName = String((metadata as any)?.event_name || item.title || '').trim();
        const rawPostId = item.post_id ?? (item.metadata as any)?.post_id ?? null;
        const postId = rawPostId ? String(rawPostId).trim() : '';

        if (!item.read_at) {
            if (apiAccessToken) {
                setMarkingId(item.id);
                try {
                    await Promise.allSettled(collectNotificationIds(item).map((id: string) => markNotificationRead(apiAccessToken, id)));
                } catch {
                    // ignore read failure and continue navigation
            } finally {
                setMarkingId(null);
            }
            const readAt = new Date().toISOString();
            setItems((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, read_at: readAt } : entry)));
        }
            setItems((prev) => prev.filter((x) => x.id !== item.id));
        }

        if (actorProfileId && ['followed_you', 'media_liked', 'post_liked'].includes(action)) {
            navigation.navigate('ViewUserProfileScreen', { profileId: actorProfileId });
            return;
        }

        if (action === 'competition_upload' && eventId) {
            if (mediaType === 'video') {
                navigation.navigate('AllVideosOfEvents', {
                    eventId,
                    eventName: eventName || t('competition'),
                });
                return;
            }
            navigation.navigate('AllPhotosOfEvents', {
                eventId,
                eventName: eventName || t('competition'),
            });
            return;
        }

        if (mediaId && ['edit_request_received', 'edit_request_resolved'].includes(action)) {
            if (mediaType === 'video') {
                navigation.navigate('VideoDetailsScreen', { mediaId });
                return;
            }
            navigation.navigate('PhotoDetailScreen', {
                media: {
                    id: mediaId,
                    eventId: eventId || null,
                    type: 'image',
                },
            });
            return;
        }

        if (postId) {
            navigation.navigate('ViewUserBlogDetailsScreen', {
                postId,
                postPreview: {
                    id: postId,
                    title: item.title || t('notificationTitle'),
                    description: item.body || '',
                },
            });
        }
    }, [apiAccessToken, collectNotificationIds, navigation, t]);

    const renderNotificationCard = (item: AppNotification) => (
        <SwipeToReadCard
            key={item.id}
            enabled={!item.read_at && markingId !== item.id}
            onSwipeRight={() => handleMarkRead(item)}
        >
            <TouchableOpacity
                style={[Styles.notificationCard, item.read_at ? Styles.notificationCardRead : null]}
                activeOpacity={0.9}
                onPress={() => handleOpenNotification(item)}
                testID={`notification-card-${item.id}`}
            >
                <View style={Styles.notificationLeft}>
                    {item.thumbnail_url ? (
                        <FastImage
                            source={{ uri: item.thumbnail_url }}
                            style={Styles.thumbnail}
                            resizeMode={FastImage.resizeMode.cover}
                            testID={`notification-thumbnail-${item.id}`}
                        />
                    ) : (
                        <View style={Styles.iconContainer}>
                            <NotificationBing size={24} color={colors.primaryColor} variant="Bold" />
                        </View>
                    )}
                    <View style={Styles.notificationContent}>
                        <Text style={Styles.notificationTitle}>{item.title || t('notificationTitle')}</Text>
                        <Text style={Styles.notificationDescription}>{item.body || t('notificationDescription')}</Text>
                    </View>
                </View>
                <View style={Styles.notificationRight}>
                    {!item.read_at ? (
                        <View style={Styles.newBadge}>
                            <Text style={Styles.newBadgeText}>{t('new')}</Text>
                        </View>
                    ) : (
                        <>
                            <View style={Styles.readBadge} testID={`notification-read-badge-${item.id}`}>
                                <Text style={Styles.readBadgeText}>{t('read')}</Text>
                            </View>
                            <Text style={Styles.dateText}>{formatDate(item.created_at)}</Text>
                        </>
                    )}
                </View>
            </TouchableOpacity>
        </SwipeToReadCard>
    );

    return (
        <View style={Styles.mainContainer} testID="notifications-screen">
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
                {loading ? (
                    <ActivityIndicator color={colors.primaryColor} />
                ) : errorText ? (
                    <Text style={[Styles.notificationDescription, { color: '#ED5454' }]}>{errorText}</Text>
                ) : !pushNotificationsEnabled ? (
                    <View style={{ alignItems: 'center', paddingTop: 8 }}>
                        <Text style={Styles.notificationDescription}>{t('Push notifications are off')}</Text>
                    </View>
                ) : items.length === 0 ? (
                    <View style={{ alignItems: 'center', paddingTop: 8 }}>
                        <Text style={Styles.notificationDescription}>{t('No notifications yet')}</Text>
                    </View>
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
