import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, useWindowDimensions, StyleSheet, ImageBackground, } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Edit2, Add } from 'iconsax-react-nativejs';
import { useTheme } from '../../context/ThemeContext';
import Fonts from '../../constants/Fonts';
import { useTranslation } from 'react-i18next';
const ProfileTimeline = ({ title, items, editable = false, onAdd, onEdit, onPressItem, }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const { width } = useWindowDimensions();
    const heading = title || t('Timeline');
    const isDark = colors.backgroundColor !== '#FFFFFF';
    const scrollX = useRef(new Animated.Value(0)).current;
    const cardWidth = Math.min(width * 0.78, 340);
    const cardSpacing = 16;
    const snapInterval = cardWidth + cardSpacing;
    const sidePadding = (width - cardWidth) / 2;
    const gradientSets = useMemo(() => isDark
        ? [
            ['#0B1220', '#0F172A'],
            ['#0B1A2B', '#0E1527'],
        ]
        : [['#EAF1FF', '#FFFFFF']], [isDark]);
    const styles = useMemo(() => StyleSheet.create({
        section: {
            marginTop: 24,
        },
        headerRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
        },
        sectionTitle: Object.assign(Object.assign({}, Fonts.medium18), { color: colors.mainTextColor }),
        addButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 10,
            backgroundColor: colors.primaryColor,
        },
        addButtonText: Object.assign(Object.assign({}, Fonts.regular12), { color: colors.pureWhite }),
        timelineWrap: {
            height: 230,
            position: 'relative',
        },
        timelineRail: {
            position: 'absolute',
            top: 26,
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: colors.primaryColor,
            opacity: isDark ? 0.45 : 0.25,
        },
        scrollContent: {
            paddingHorizontal: sidePadding,
            paddingBottom: 12,
            alignItems: 'center',
        },
        card: {
            width: cardWidth,
            borderRadius: 20,
            padding: 16,
            borderWidth: isDark ? 0 : 1,
            borderColor: colors.lightGrayColor,
            overflow: 'hidden',
            shadowColor: isDark ? '#3C82F6' : '#000000',
            shadowOpacity: isDark ? 0.25 : 0.08,
            shadowOffset: { width: 0, height: 8 },
            shadowRadius: isDark ? 18 : 10,
            elevation: isDark ? 6 : 3,
        },
        cardInnerWrapper: {
            borderRadius: 18,
            overflow: 'hidden',
            backgroundColor: isDark ? 'rgba(3,4,9,0.85)' : colors.whiteColor,
            position: 'relative',
            borderWidth: isDark ? 1 : 0,
            borderColor: isDark ? 'rgba(60,130,246,0.2)' : 'transparent',
        },
        cardContent: {
            padding: 16,
        },
        cardBackground: {
            width: '100%',
            minHeight: 180,
        },
        cardBackgroundImage: {
            resizeMode: 'cover',
        },
        cardBackgroundOverlay: {
            backgroundColor: isDark ? 'rgba(3,4,9,0.55)' : 'rgba(255,255,255,0.85)',
            minHeight: 180,
        },
        yearBadge: {
            alignSelf: 'flex-start',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 999,
            backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : colors.whiteColor,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.2)' : colors.lightGrayColor,
        },
        yearText: Object.assign(Object.assign({}, Fonts.medium14), { color: colors.mainTextColor }),
        titleText: Object.assign(Object.assign({}, Fonts.medium16), { color: colors.mainTextColor, marginTop: 12 }),
        descriptionText: Object.assign(Object.assign({}, Fonts.regular12), { color: colors.grayColor, marginTop: 8 }),
        highlightChip: {
            alignSelf: 'flex-start',
            marginTop: 12,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 8,
            backgroundColor: isDark ? 'rgba(60,130,246,0.2)' : '#E7F0FF',
        },
        highlightText: Object.assign(Object.assign({}, Fonts.medium12), { color: colors.primaryColor }),
        linkRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginTop: 12,
        },
        linkChip: {
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 999,
            backgroundColor: colors.btnBackgroundColor,
        },
        linkChipText: Object.assign(Object.assign({}, Fonts.regular12), { color: colors.grayColor }),
        cardActions: {
            position: 'absolute',
            top: 12,
            right: 12,
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: colors.btnBackgroundColor,
            alignItems: 'center',
            justifyContent: 'center',
        },
        emptyState: {
            height: 180,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.lightGrayColor,
            backgroundColor: colors.btnBackgroundColor,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 16,
        },
        emptyText: Object.assign(Object.assign({}, Fonts.regular12), { color: colors.grayColor, textAlign: 'center' }),
    }), [cardWidth, colors, sidePadding]);
    if (!items.length) {
        return (_jsxs(View, Object.assign({ style: styles.section }, { children: [_jsxs(View, Object.assign({ style: styles.headerRow }, { children: [_jsx(Text, Object.assign({ style: styles.sectionTitle }, { children: heading })), editable && onAdd && (_jsxs(TouchableOpacity, Object.assign({ style: styles.addButton, onPress: onAdd }, { children: [_jsx(Add, { size: 14, color: "#FFFFFF", variant: "Linear" }), _jsx(Text, Object.assign({ style: styles.addButtonText }, { children: t('Add milestone') }))] })))] })), _jsx(View, Object.assign({ style: styles.emptyState }, { children: _jsx(Text, Object.assign({ style: styles.emptyText }, { children: t('No milestones yet. Add your first highlight to build your timeline.') })) }))] })));
    }
    return (_jsxs(View, Object.assign({ style: styles.section }, { children: [_jsxs(View, Object.assign({ style: styles.headerRow }, { children: [_jsx(Text, Object.assign({ style: styles.sectionTitle }, { children: heading })), editable && onAdd && (_jsxs(TouchableOpacity, Object.assign({ style: styles.addButton, onPress: onAdd }, { children: [_jsx(Add, { size: 14, color: "#FFFFFF", variant: "Linear" }), _jsx(Text, Object.assign({ style: styles.addButtonText }, { children: t('Add milestone') }))] })))] })), _jsxs(View, Object.assign({ style: styles.timelineWrap }, { children: [_jsx(View, { style: styles.timelineRail }), _jsx(Animated.ScrollView, Object.assign({ horizontal: true, showsHorizontalScrollIndicator: false, snapToInterval: snapInterval, decelerationRate: "fast", contentContainerStyle: styles.scrollContent, onScroll: Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true }), scrollEventThrottle: 16 }, { children: items.map((item, index) => {
                            const inputRange = [
                                (index - 1) * snapInterval,
                                index * snapInterval,
                                (index + 1) * snapInterval,
                            ];
                            const scale = scrollX.interpolate({
                                inputRange,
                                outputRange: [0.9, 1, 0.92],
                                extrapolate: 'clamp',
                            });
                            const translateY = scrollX.interpolate({
                                inputRange,
                                outputRange: [12, 0, 12],
                                extrapolate: 'clamp',
                            });
                            const rotate = scrollX.interpolate({
                                inputRange,
                                outputRange: ['0deg', '0deg', '0deg'],
                                extrapolate: 'clamp',
                            });
                            const gradient = gradientSets[index % gradientSets.length];
                            const CardWrapper = onPressItem ? TouchableOpacity : View;
                            return (_jsx(Animated.View, Object.assign({ style: {
                                    marginRight: cardSpacing,
                                    transform: [{ scale }, { translateY }, { rotate }],
                                } }, { children: _jsx(LinearGradient, Object.assign({ colors: gradient, style: styles.card }, { children: _jsxs(CardWrapper, Object.assign({ style: styles.cardInnerWrapper, onPress: onPressItem ? () => onPressItem(item) : undefined, activeOpacity: 0.88 }, { children: [item.backgroundImage ? (_jsx(ImageBackground, Object.assign({ source: { uri: item.backgroundImage }, style: styles.cardBackground, imageStyle: styles.cardBackgroundImage }, { children: _jsx(View, Object.assign({ style: styles.cardBackgroundOverlay }, { children: _jsxs(View, Object.assign({ style: styles.cardContent }, { children: [_jsx(View, Object.assign({ style: styles.yearBadge }, { children: _jsx(Text, Object.assign({ style: styles.yearText }, { children: item.year })) })), _jsx(Text, Object.assign({ style: styles.titleText }, { children: item.title })), _jsx(Text, Object.assign({ style: styles.descriptionText, numberOfLines: 3 }, { children: item.description })), item.highlight ? (_jsx(View, Object.assign({ style: styles.highlightChip }, { children: _jsx(Text, Object.assign({ style: styles.highlightText }, { children: item.highlight })) }))) : null, (Array.isArray(item.linkedBlogs) && item.linkedBlogs.length) || (Array.isArray(item.linkedCompetitions) && item.linkedCompetitions.length) ? (_jsxs(View, Object.assign({ style: styles.linkRow }, { children: [Array.isArray(item.linkedBlogs) && item.linkedBlogs.length ? (_jsx(View, Object.assign({ style: styles.linkChip }, { children: _jsxs(Text, Object.assign({ style: styles.linkChipText }, { children: [item.linkedBlogs.length, " ", t('blogs')] })) }))) : null, Array.isArray(item.linkedCompetitions) && item.linkedCompetitions.length ? (_jsx(View, Object.assign({ style: styles.linkChip }, { children: _jsxs(Text, Object.assign({ style: styles.linkChipText }, { children: [item.linkedCompetitions.length, " ", t('competitions')] })) }))) : null] }))) : null] })) })) }))) : (_jsxs(View, Object.assign({ style: styles.cardContent }, { children: [_jsx(View, Object.assign({ style: styles.yearBadge }, { children: _jsx(Text, Object.assign({ style: styles.yearText }, { children: item.year })) })), _jsx(Text, Object.assign({ style: styles.titleText }, { children: item.title })), _jsx(Text, Object.assign({ style: styles.descriptionText, numberOfLines: 3 }, { children: item.description })), item.highlight ? (_jsx(View, Object.assign({ style: styles.highlightChip }, { children: _jsx(Text, Object.assign({ style: styles.highlightText }, { children: item.highlight })) }))) : null, (Array.isArray(item.linkedBlogs) && item.linkedBlogs.length) || (Array.isArray(item.linkedCompetitions) && item.linkedCompetitions.length) ? (_jsxs(View, Object.assign({ style: styles.linkRow }, { children: [Array.isArray(item.linkedBlogs) && item.linkedBlogs.length ? (_jsx(View, Object.assign({ style: styles.linkChip }, { children: _jsxs(Text, Object.assign({ style: styles.linkChipText }, { children: [item.linkedBlogs.length, " ", t('blogs')] })) }))) : null, Array.isArray(item.linkedCompetitions) && item.linkedCompetitions.length ? (_jsx(View, Object.assign({ style: styles.linkChip }, { children: _jsxs(Text, Object.assign({ style: styles.linkChipText }, { children: [item.linkedCompetitions.length, " ", t('competitions')] })) }))) : null] }))) : null] }))), editable && onEdit ? (_jsx(TouchableOpacity, Object.assign({ style: styles.cardActions, onPress: () => onEdit(item) }, { children: _jsx(Edit2, { size: 14, color: colors.mainTextColor, variant: "Linear" }) }))) : null] })) })) }), item.id));
                        }) }))] }))] })));
};
export default ProfileTimeline;
