import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Animated, PanResponder, Text, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import SizeBox from '../../constants/SizeBox';
import { Trash } from 'iconsax-react-nativejs';
const SwipeDeleteRow = ({ enabled, onSwipeRight, children, }) => {
    const translateX = React.useRef(new Animated.Value(0)).current;
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
            if (gestureState.dx > 90) {
                onSwipeRight();
            }
            Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: true,
                speed: 20,
                bounciness: 0,
            }).start();
        },
        onPanResponderTerminate: () => {
            Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: true,
                speed: 20,
                bounciness: 0,
            }).start();
        },
    }), [enabled, onSwipeRight, translateX]);
    if (!enabled)
        return _jsx(_Fragment, { children: children });
    return (_jsxs(View, Object.assign({ style: { borderRadius: 12, overflow: 'hidden' } }, { children: [_jsx(View, Object.assign({ pointerEvents: "none", style: {
                    position: 'absolute',
                    left: 30,
                    top: 0,
                    bottom: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                } }, { children: _jsx(Trash, { size: 25, color: "#D32F2F", variant: "Bold" }) })), _jsx(Animated.View, Object.assign({ style: { transform: [{ translateX }] } }, panResponder.panHandlers, { children: children }))] })));
};
const ProfileNewsSection = ({ styles, sectionTitle, items, emptyText, blogLabel, photoLabel, videoLabel, onPressItem, actionLabel, onPressAction, enableSwipeDelete, onSwipeDelete, }) => {
    const renderCard = (item) => {
        var _a;
        const kind = (_a = item.kind) !== null && _a !== void 0 ? _a : 'blog';
        const isBlog = kind === 'blog';
        const isPhoto = kind === 'photo';
        const isVideo = kind === 'video';
        const badgeLabel = isBlog
            ? blogLabel
            : isPhoto
                ? (photoLabel || 'Photo')
                : (videoLabel || 'Video');
        const descriptionText = String(item.description || '');
        return (_jsx(TouchableOpacity, Object.assign({ style: styles.activityCard, activeOpacity: 0.85, onPress: () => onPressItem(item), testID: `profile-news-item-${item.id}` }, { children: _jsxs(View, Object.assign({ style: styles.activityCardRow }, { children: [_jsx(View, Object.assign({ style: styles.activityThumbWrap }, { children: item.coverImage ? (_jsx(FastImage, { source: { uri: String(item.coverImage) }, style: styles.activityThumb, resizeMode: "cover" })) : (_jsx(View, { style: styles.activityThumbPlaceholder })) })), _jsxs(View, Object.assign({ style: styles.activityTextColumn }, { children: [_jsxs(View, Object.assign({ style: styles.activityHeaderRow }, { children: [_jsx(Text, Object.assign({ style: styles.activityTitle, numberOfLines: 2 }, { children: item.title })), _jsx(View, Object.assign({ style: [styles.activityBadge, isBlog ? styles.activityBadgeBlog : styles.activityBadgeEvent], testID: `profile-news-badge-${item.id}` }, { children: _jsx(Text, Object.assign({ style: isBlog ? styles.activityBadgeTextBlog : styles.activityBadgeText }, { children: badgeLabel })) }))] })), _jsx(Text, Object.assign({ style: styles.activityMeta }, { children: item.date || '' })), _jsx(Text, Object.assign({ style: styles.activityDescription, numberOfLines: 2 }, { children: descriptionText }))] }))] })) }), `news-${item.id}`));
    };
    return (_jsxs(View, Object.assign({ style: styles.activitySection }, { children: [_jsxs(View, Object.assign({ style: styles.sectionHeader }, { children: [_jsx(Text, Object.assign({ style: styles.sectionTitle }, { children: sectionTitle })), actionLabel && onPressAction ? (_jsx(TouchableOpacity, Object.assign({ style: styles.actionPill, onPress: onPressAction }, { children: _jsx(Text, Object.assign({ style: styles.actionPillText }, { children: actionLabel })) }))) : null] })), _jsx(SizeBox, { height: 16 }), items.length === 0 ? (_jsx(View, Object.assign({ style: styles.emptyStateCard }, { children: _jsx(Text, Object.assign({ style: styles.emptyStateText }, { children: emptyText })) }))) : (items.map((item) => (_jsx(SwipeDeleteRow, Object.assign({ enabled: Boolean(enableSwipeDelete && onSwipeDelete && item.canDelete !== false), onSwipeRight: () => {
                    if (onSwipeDelete)
                        onSwipeDelete(item);
                } }, { children: renderCard(item) }), `news-swipe-${item.id}`))))] })));
};
export default ProfileNewsSection;
