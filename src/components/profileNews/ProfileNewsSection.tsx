import React from 'react';
import { Animated, PanResponder, Text, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import SizeBox from '../../constants/SizeBox';
import { Trash } from 'iconsax-react-nativejs';

export type ProfileNewsItem = {
    id: string;
    title: string;
    date?: string | null;
    description?: string | null;
    coverImage?: string | null;
};

type Props = {
    styles: any;
    sectionTitle: string;
    items: ProfileNewsItem[];
    emptyText: string;
    blogLabel: string;
    onPressItem: (item: ProfileNewsItem) => void;
    actionLabel?: string;
    onPressAction?: () => void;
    enableSwipeDelete?: boolean;
    onSwipeDelete?: (item: ProfileNewsItem) => void;
};

const SwipeDeleteRow = ({
    enabled,
    onSwipeRight,
    children,
}: {
    enabled: boolean;
    onSwipeRight: () => void;
    children: React.ReactNode;
}) => {
    const translateX = React.useRef(new Animated.Value(0)).current;

    const panResponder = React.useMemo(
        () =>
            PanResponder.create({
                onMoveShouldSetPanResponder: (_, gestureState) => enabled && gestureState.dx > 12 && Math.abs(gestureState.dy) < 10,
                onPanResponderMove: (_, gestureState) => {
                    if (!enabled) return;
                    const dx = Math.max(0, Math.min(gestureState.dx, 120));
                    translateX.setValue(dx);
                },
                onPanResponderRelease: (_, gestureState) => {
                    if (!enabled) return;
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
            }),
        [enabled, onSwipeRight, translateX],
    );

    if (!enabled) return <>{children}</>;

    return (
        <View style={{ borderRadius: 12, overflow: 'hidden' }}>
            <View
                pointerEvents="none"
                style={{
                    position: 'absolute',
                    left: 30,
                    top: 0,
                    bottom: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Trash size={25} color="#D32F2F" variant="Bold" />
            </View>
            <Animated.View style={{ transform: [{ translateX }] }} {...panResponder.panHandlers}>
                {children}
            </Animated.View>
        </View>
    );
};

const ProfileNewsSection = ({
    styles,
    sectionTitle,
    items,
    emptyText,
    blogLabel,
    onPressItem,
    actionLabel,
    onPressAction,
    enableSwipeDelete,
    onSwipeDelete,
}: Props) => {
    const renderCard = (item: ProfileNewsItem) => (
        <TouchableOpacity
            key={`blog-${item.id}`}
            style={styles.activityCard}
            activeOpacity={0.85}
            onPress={() => onPressItem(item)}
        >
            <View style={styles.activityCardRow}>
                <View style={styles.activityThumbWrap}>
                    {item.coverImage ? (
                        <FastImage source={{ uri: String(item.coverImage) }} style={styles.activityThumb} resizeMode="cover" />
                    ) : (
                        <View style={styles.activityThumbPlaceholder} />
                    )}
                </View>
                <View style={styles.activityTextColumn}>
                    <View style={styles.activityHeaderRow}>
                        <Text style={styles.activityTitle} numberOfLines={2}>
                            {item.title}
                        </Text>
                        <View style={[styles.activityBadge, styles.activityBadgeBlog]}>
                            <Text style={styles.activityBadgeTextBlog}>{blogLabel}</Text>
                        </View>
                    </View>
                    <Text style={styles.activityMeta}>{item.date || ''}</Text>
                    <Text style={styles.activityDescription} numberOfLines={2}>
                        {item.description || ''}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.activitySection}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{sectionTitle}</Text>
                {actionLabel && onPressAction ? (
                    <TouchableOpacity style={styles.actionPill} onPress={onPressAction}>
                        <Text style={styles.actionPillText}>{actionLabel}</Text>
                    </TouchableOpacity>
                ) : null}
            </View>
            <SizeBox height={16} />
            {items.length === 0 ? (
                <View style={styles.emptyStateCard}>
                    <Text style={styles.emptyStateText}>{emptyText}</Text>
                </View>
                ) : (
                    items.map((item) => (
                    <SwipeDeleteRow
                        key={`blog-swipe-${item.id}`}
                        enabled={Boolean(enableSwipeDelete && onSwipeDelete)}
                        onSwipeRight={() => {
                            if (onSwipeDelete) onSwipeDelete(item);
                        }}
                    >
                            {renderCard(item)}
                    </SwipeDeleteRow>
                ))
            )}
        </View>
    );
};

export default ProfileNewsSection;
