import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Animated, PanResponder } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
    const [markingAll, setMarkingAll] = useState(false);

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
            const res = await getNotifications(apiAccessToken, { limit: 100, offset: 0, unread_only: true });
            const unread = Array.isArray(res?.notifications)
                ? res.notifications.filter((x) => !x.read_at)
                : [];
            setItems(unread);
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

    const handleMarkAllRead = useCallback(async () => {
        if (!apiAccessToken || markingAll) return;
        const unreadItems = items.filter((x) => !x.read_at);
        if (unreadItems.length === 0) return;
        setMarkingAll(true);
        try {
            await Promise.allSettled(unreadItems.map((x) => markNotificationRead(apiAccessToken, x.id)));
            setItems([]);
        } finally {
            setMarkingAll(false);
        }
    }, [apiAccessToken, items, markingAll]);

    const handleMarkRead = useCallback(async (item: AppNotification) => {
        if (!apiAccessToken || item.read_at) return;
        setMarkingId(item.id);
        try {
            await markNotificationRead(apiAccessToken, item.id);
            setItems((prev) => prev.filter((x) => x.id !== item.id));
        } catch {
            // keep silent for now
        } finally {
            setMarkingId(null);
        }
    }, [apiAccessToken]);

    const handleOpenNotification = useCallback(async (item: AppNotification) => {
        const rawPostId = item.post_id ?? (item.metadata as any)?.post_id ?? null;
        const postId = rawPostId ? String(rawPostId).trim() : '';

        if (!item.read_at) {
            if (apiAccessToken) {
                setMarkingId(item.id);
                try {
                    await markNotificationRead(apiAccessToken, item.id);
                } catch {
                    // ignore read failure and continue navigation
                } finally {
                    setMarkingId(null);
                }
            }
            setItems((prev) => prev.filter((x) => x.id !== item.id));
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
    }, [apiAccessToken, navigation, t]);

    const renderNotificationCard = (item: AppNotification) => (
        <SwipeToReadCard
            key={item.id}
            enabled={!item.read_at && markingId !== item.id}
            onSwipeRight={() => handleMarkRead(item)}
        >
            <TouchableOpacity style={Styles.notificationCard} activeOpacity={0.9} onPress={() => handleOpenNotification(item)}>
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
            </TouchableOpacity>
        </SwipeToReadCard>
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
                    <TouchableOpacity disabled={markingAll || unreadCount === 0} onPress={handleMarkAllRead}>
                        <Text style={Styles.viewAllText}>
                            {markingAll ? t('Loading...') : t('Mark all as read')}
                        </Text>
                    </TouchableOpacity>
                </View>

                <SizeBox height={16} />

                {loading ? (
                    <ActivityIndicator color={colors.primaryColor} />
                ) : errorText ? (
                    <Text style={[Styles.notificationDescription, { color: '#ED5454' }]}>{errorText}</Text>
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
