var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Animated, PanResponder } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { ArrowLeft2, NotificationBing, Eye, } from 'iconsax-react-nativejs';
import { createStyles } from './NotificationsScreenStyles';
import SizeBox from '../../constants/SizeBox';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { ApiError, getNotifications, markNotificationRead } from '../../services/apiGateway';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const SwipeToReadCard = ({ enabled, onSwipeRight, children, }) => {
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
    const panResponder = React.useMemo(() => PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => enabled && gestureState.dx > 12 && Math.abs(gestureState.dy) < 10,
        onPanResponderMove: (_, gestureState) => {
            if (!enabled)
                return;
            const dx = Math.max(0, Math.min(gestureState.dx, 120));
            translateX.setValue(dx);
        },
        onPanResponderRelease: (_, gestureState) => {
            if (!enabled)
                return;
            if (!didTrigger.current && gestureState.dx > 90) {
                didTrigger.current = true;
                onSwipeRight();
            }
            reset();
        },
        onPanResponderTerminate: () => {
            reset();
        },
    }), [enabled, onSwipeRight, reset, translateX]);
    if (!enabled)
        return _jsx(_Fragment, { children: children });
    return (_jsxs(View, Object.assign({ style: { borderRadius: 10, overflow: 'hidden' } }, { children: [_jsx(View, Object.assign({ pointerEvents: "none", style: {
                    position: 'absolute',
                    left: 16,
                    top: 0,
                    bottom: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                    opacity: 0.7,
                } }, { children: _jsx(Eye, { size: 22, color: "#8A8A8A", variant: "Linear" }) })), _jsx(Animated.View, Object.assign({ style: { transform: [{ translateX }] } }, panResponder.panHandlers, { children: children }))] })));
};
const NotificationsScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const { apiAccessToken } = useAuth();
    const Styles = createStyles(colors);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [errorText, setErrorText] = useState(null);
    const [markingId, setMarkingId] = useState(null);
    const [markingAll, setMarkingAll] = useState(false);
    const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(null);
    useFocusEffect(useCallback(() => {
        let mounted = true;
        AsyncStorage.getItem('@push_notifications_enabled')
            .then((value) => {
            if (!mounted)
                return;
            const enabled = value !== '0';
            setPushNotificationsEnabled(enabled);
            if (!enabled) {
                setItems([]);
                setErrorText(null);
            }
        })
            .catch(() => {
            if (!mounted)
                return;
            setPushNotificationsEnabled(true);
        });
        return () => {
            mounted = false;
        };
    }, []));
    const loadNotifications = useCallback((isRefresh = false) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
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
        if (isRefresh)
            setRefreshing(true);
        else
            setLoading(true);
        setErrorText(null);
        try {
            const res = yield getNotifications(apiAccessToken, { limit: 100, offset: 0, unread_only: true });
            const unread = Array.isArray(res === null || res === void 0 ? void 0 : res.notifications)
                ? res.notifications.filter((x) => !x.read_at)
                : [];
            setItems(unread);
        }
        catch (e) {
            const message = e instanceof ApiError ? e.message : String((_a = e === null || e === void 0 ? void 0 : e.message) !== null && _a !== void 0 ? _a : e);
            setErrorText(message);
            setItems([]);
        }
        finally {
            setLoading(false);
            setRefreshing(false);
        }
    }), [apiAccessToken, pushNotificationsEnabled, t]);
    useFocusEffect(useCallback(() => {
        if (pushNotificationsEnabled == null)
            return;
        loadNotifications(false);
    }, [loadNotifications]));
    const formatDate = useCallback((value) => {
        if (!value)
            return '';
        const d = new Date(value);
        if (Number.isNaN(d.getTime()))
            return '';
        return d.toLocaleDateString('en-GB');
    }, []);
    const unreadCount = useMemo(() => items.filter((x) => !x.read_at).length, [items]);
    const collectNotificationIds = useCallback((item) => {
        var _a;
        const bundled = Array.isArray((_a = item.metadata) === null || _a === void 0 ? void 0 : _a.notification_ids)
            ? item.metadata.notification_ids
                .map((entry) => String(entry || '').trim())
                .filter(Boolean)
            : [];
        return bundled.length > 0 ? bundled : [String(item.id || '').trim()].filter(Boolean);
    }, []);
    const handleMarkAllRead = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        if (!apiAccessToken || markingAll)
            return;
        const unreadItems = items.filter((x) => !x.read_at);
        if (unreadItems.length === 0)
            return;
        setMarkingAll(true);
        try {
            yield Promise.allSettled(unreadItems.flatMap((x) => collectNotificationIds(x).map((id) => markNotificationRead(apiAccessToken, id))));
            setItems([]);
        }
        finally {
            setMarkingAll(false);
        }
    }), [apiAccessToken, collectNotificationIds, items, markingAll]);
    const handleMarkRead = useCallback((item) => __awaiter(void 0, void 0, void 0, function* () {
        if (!apiAccessToken || item.read_at)
            return;
        setMarkingId(item.id);
        try {
            yield Promise.allSettled(collectNotificationIds(item).map((id) => markNotificationRead(apiAccessToken, id)));
            setItems((prev) => prev.filter((x) => x.id !== item.id));
        }
        catch (_b) {
            // keep silent for now
        }
        finally {
            setMarkingId(null);
        }
    }), [apiAccessToken, collectNotificationIds]);
    const handleOpenNotification = useCallback((item) => __awaiter(void 0, void 0, void 0, function* () {
        var _c, _d, _e, _f, _g, _h, _j, _k, _l;
        const metadata = item.metadata && typeof item.metadata === 'object' ? item.metadata : {};
        const action = String((metadata === null || metadata === void 0 ? void 0 : metadata.action) || '').trim().toLowerCase();
        const actorProfileId = String((_d = (_c = item.actor_profile_id) !== null && _c !== void 0 ? _c : metadata === null || metadata === void 0 ? void 0 : metadata.actor_profile_id) !== null && _d !== void 0 ? _d : '').trim();
        const rawMediaId = (_f = (_e = item.media_id) !== null && _e !== void 0 ? _e : metadata === null || metadata === void 0 ? void 0 : metadata.media_id) !== null && _f !== void 0 ? _f : null;
        const mediaId = rawMediaId ? String(rawMediaId).trim() : '';
        const mediaType = String((metadata === null || metadata === void 0 ? void 0 : metadata.media_type) || '').trim().toLowerCase();
        const eventId = String((_h = (_g = item.event_id) !== null && _g !== void 0 ? _g : metadata === null || metadata === void 0 ? void 0 : metadata.event_id) !== null && _h !== void 0 ? _h : '').trim();
        const eventName = String((metadata === null || metadata === void 0 ? void 0 : metadata.event_name) || item.title || '').trim();
        const rawPostId = (_l = (_j = item.post_id) !== null && _j !== void 0 ? _j : (_k = item.metadata) === null || _k === void 0 ? void 0 : _k.post_id) !== null && _l !== void 0 ? _l : null;
        const postId = rawPostId ? String(rawPostId).trim() : '';
        if (!item.read_at) {
            if (apiAccessToken) {
                setMarkingId(item.id);
                try {
                    yield Promise.allSettled(collectNotificationIds(item).map((id) => markNotificationRead(apiAccessToken, id)));
                }
                catch (_m) {
                    // ignore read failure and continue navigation
                }
                finally {
                    setMarkingId(null);
                }
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
    }), [apiAccessToken, collectNotificationIds, navigation, t]);
    const renderNotificationCard = (item) => (_jsx(SwipeToReadCard, Object.assign({ enabled: !item.read_at && markingId !== item.id, onSwipeRight: () => handleMarkRead(item) }, { children: _jsxs(TouchableOpacity, Object.assign({ style: Styles.notificationCard, activeOpacity: 0.9, onPress: () => handleOpenNotification(item), testID: `notification-card-${item.id}` }, { children: [_jsxs(View, Object.assign({ style: Styles.notificationLeft }, { children: [item.thumbnail_url ? (_jsx(FastImage, { source: { uri: item.thumbnail_url }, style: Styles.thumbnail, resizeMode: FastImage.resizeMode.cover })) : (_jsx(View, Object.assign({ style: Styles.iconContainer }, { children: _jsx(NotificationBing, { size: 24, color: colors.primaryColor, variant: "Bold" }) }))), _jsxs(View, Object.assign({ style: Styles.notificationContent }, { children: [_jsx(Text, Object.assign({ style: Styles.notificationTitle }, { children: item.title || t('notificationTitle') })), _jsx(Text, Object.assign({ style: Styles.notificationDescription }, { children: item.body || t('notificationDescription') }))] }))] })), _jsx(View, Object.assign({ style: Styles.notificationRight }, { children: !item.read_at ? (_jsxs(_Fragment, { children: [_jsx(View, Object.assign({ style: Styles.newBadge }, { children: _jsx(Text, Object.assign({ style: Styles.newBadgeText }, { children: t('new') })) })), _jsx(TouchableOpacity, Object.assign({ onPress: () => handleMarkRead(item), disabled: markingId === item.id }, { children: _jsx(Text, Object.assign({ style: Styles.detailsLink }, { children: markingId === item.id ? t('Loading...') : t('details') })) }))] })) : (_jsxs(_Fragment, { children: [_jsx(Text, Object.assign({ style: Styles.dateText }, { children: formatDate(item.created_at) })), _jsx(TouchableOpacity, { children: _jsx(Text, Object.assign({ style: Styles.detailsLink }, { children: t('details') })) })] })) }))] })) }), item.id));
    return (_jsxs(View, Object.assign({ style: Styles.mainContainer, testID: "notifications-screen" }, { children: [_jsx(SizeBox, { height: insets.top }), _jsxs(View, Object.assign({ style: Styles.header }, { children: [_jsx(TouchableOpacity, Object.assign({ style: Styles.backButton, onPress: () => navigation.goBack() }, { children: _jsx(ArrowLeft2, { size: 20, color: colors.primaryColor, variant: "Linear" }) })), _jsx(Text, Object.assign({ style: Styles.headerTitle }, { children: t('notifications') })), _jsx(View, { style: { width: 44, height: 44 } })] })), _jsxs(ScrollView, Object.assign({ showsVerticalScrollIndicator: false, contentContainerStyle: Styles.scrollContent, refreshControl: _jsx(RefreshControl, { refreshing: refreshing, onRefresh: () => loadNotifications(true), tintColor: colors.primaryColor }) }, { children: [_jsx(View, Object.assign({ style: Styles.sectionHeader }, { children: _jsx(TouchableOpacity, Object.assign({ disabled: markingAll || unreadCount === 0, onPress: handleMarkAllRead }, { children: _jsx(Text, Object.assign({ style: Styles.viewAllText }, { children: markingAll ? t('Loading...') : t('Mark all as read') })) })) })), _jsx(SizeBox, { height: 16 }), loading ? (_jsx(ActivityIndicator, { color: colors.primaryColor })) : errorText ? (_jsx(Text, Object.assign({ style: [Styles.notificationDescription, { color: '#ED5454' }] }, { children: errorText }))) : !pushNotificationsEnabled ? (_jsx(View, Object.assign({ style: { alignItems: 'center', paddingTop: 8 } }, { children: _jsx(Text, Object.assign({ style: Styles.notificationDescription }, { children: t('Push notifications are off') })) }))) : items.length === 0 ? (_jsx(View, Object.assign({ style: { alignItems: 'center', paddingTop: 8 } }, { children: _jsx(Text, Object.assign({ style: Styles.notificationDescription }, { children: t('No notifications yet') })) }))) : (_jsx(View, Object.assign({ style: Styles.notificationsList }, { children: items.map(renderNotificationCard) }))), _jsx(SizeBox, { height: 40 })] }))] })));
};
export default NotificationsScreen;
