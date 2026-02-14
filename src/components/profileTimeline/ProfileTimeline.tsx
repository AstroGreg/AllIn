import React, { useMemo, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Animated,
    useWindowDimensions,
    StyleSheet,
    ImageBackground,
    ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Edit2, Add } from 'iconsax-react-nativejs';
import { useTheme } from '../../context/ThemeContext';
import Fonts from '../../constants/Fonts';

export type TimelineEntry = {
    id: string;
    year: string;
    title: string;
    description: string;
    highlight?: string;
    photos?: string[];
    linkedBlogs?: string[];
    linkedCompetitions?: string[];
    backgroundImage?: string;
};

type ProfileTimelineProps = {
    title?: string;
    items: TimelineEntry[];
    editable?: boolean;
    onAdd?: () => void;
    onEdit?: (item: TimelineEntry) => void;
    onPressItem?: (item: TimelineEntry) => void;
};

const ProfileTimeline = ({
    title = 'Timeline',
    items,
    editable = false,
    onAdd,
    onEdit,
    onPressItem,
}: ProfileTimelineProps) => {
    const { colors } = useTheme();
    const { width } = useWindowDimensions();
    const isDark = colors.backgroundColor !== '#FFFFFF';
    const scrollX = useRef(new Animated.Value(0)).current;
    const cardWidth = Math.min(width * 0.78, 340);
    const cardSpacing = 16;
    const snapInterval = cardWidth + cardSpacing;
    const sidePadding = (width - cardWidth) / 2;
    const gradientSets = useMemo(
        () =>
            isDark
                ? [
                      ['#0B1220', '#0F172A'],
                      ['#0B1A2B', '#0E1527'],
                  ]
                : [['#EAF1FF', '#FFFFFF']],
        [isDark],
    );

    const styles = useMemo(
        () =>
            StyleSheet.create({
                section: {
                    marginTop: 24,
                },
                headerRow: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                },
                sectionTitle: {
                    ...Fonts.medium18,
                    color: colors.mainTextColor,
                },
                addButton: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 10,
                    backgroundColor: colors.primaryColor,
                },
                addButtonText: {
                    ...Fonts.regular12,
                    color: colors.pureWhite,
                },
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
                yearText: {
                    ...Fonts.medium14,
                    color: colors.mainTextColor,
                },
                titleText: {
                    ...Fonts.medium16,
                    color: colors.mainTextColor,
                    marginTop: 12,
                },
                descriptionText: {
                    ...Fonts.regular12,
                    color: colors.grayColor,
                    marginTop: 8,
                },
                highlightChip: {
                    alignSelf: 'flex-start',
                    marginTop: 12,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                    backgroundColor: isDark ? 'rgba(60,130,246,0.2)' : '#E7F0FF',
                },
                highlightText: {
                    ...Fonts.medium12,
                    color: colors.primaryColor,
                },
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
                linkChipText: {
                    ...Fonts.regular12,
                    color: colors.grayColor,
                },
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
                emptyText: {
                    ...Fonts.regular12,
                    color: colors.grayColor,
                    textAlign: 'center',
                },
            }),
        [cardWidth, colors, sidePadding],
    );

    if (!items.length) {
        return (
            <View style={styles.section}>
                <View style={styles.headerRow}>
                    <Text style={styles.sectionTitle}>{title}</Text>
                    {editable && onAdd && (
                        <TouchableOpacity style={styles.addButton} onPress={onAdd}>
                            <Add size={14} color="#FFFFFF" variant="Linear" />
                            <Text style={styles.addButtonText}>Add milestone</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>
                        No milestones yet. Add your first highlight to build your timeline.
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.section}>
            <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>{title}</Text>
                {editable && onAdd && (
                    <TouchableOpacity style={styles.addButton} onPress={onAdd}>
                        <Add size={14} color="#FFFFFF" variant="Linear" />
                        <Text style={styles.addButtonText}>Add milestone</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.timelineWrap}>
                <View style={styles.timelineRail} />
                <Animated.ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={snapInterval}
                    decelerationRate="fast"
                    contentContainerStyle={styles.scrollContent}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: true },
                    )}
                    scrollEventThrottle={16}
                >
                    {items.map((item, index) => {
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
                        return (
                            <Animated.View
                                key={item.id}
                                style={{
                                    marginRight: cardSpacing,
                                    transform: [{ scale }, { translateY }, { rotate }],
                                }}
                            >
                                <LinearGradient colors={gradient} style={styles.card}>
                                    <CardWrapper
                                        style={styles.cardInnerWrapper}
                                        onPress={onPressItem ? () => onPressItem(item) : undefined}
                                        activeOpacity={0.88}
                                    >
                                        {item.backgroundImage ? (
                                            <ImageBackground
                                                source={{ uri: item.backgroundImage }}
                                                style={styles.cardBackground}
                                                imageStyle={styles.cardBackgroundImage}
                                            >
                                                <View style={styles.cardBackgroundOverlay}>
                                                    <View style={styles.cardContent}>
                                                        <View style={styles.yearBadge}>
                                                            <Text style={styles.yearText}>{item.year}</Text>
                                                        </View>
                                                        <Text style={styles.titleText}>{item.title}</Text>
                                                        <Text style={styles.descriptionText} numberOfLines={3}>
                                                            {item.description}
                                                        </Text>
                                                        {item.highlight ? (
                                                            <View style={styles.highlightChip}>
                                                                <Text style={styles.highlightText}>{item.highlight}</Text>
                                                            </View>
                                                        ) : null}
                                                        {(Array.isArray(item.linkedBlogs) && item.linkedBlogs.length) || (Array.isArray(item.linkedCompetitions) && item.linkedCompetitions.length) ? (
                                                            <View style={styles.linkRow}>
                                                                {Array.isArray(item.linkedBlogs) && item.linkedBlogs.length ? (
                                                                    <View style={styles.linkChip}>
                                                                        <Text style={styles.linkChipText}>{item.linkedBlogs.length} blogs</Text>
                                                                    </View>
                                                                ) : null}
                                                                {Array.isArray(item.linkedCompetitions) && item.linkedCompetitions.length ? (
                                                                    <View style={styles.linkChip}>
                                                                        <Text style={styles.linkChipText}>{item.linkedCompetitions.length} competitions</Text>
                                                                    </View>
                                                                ) : null}
                                                            </View>
                                                        ) : null}
                                                    </View>
                                                </View>
                                            </ImageBackground>
                                        ) : (
                                            <View style={styles.cardContent}>
                                                <View style={styles.yearBadge}>
                                                    <Text style={styles.yearText}>{item.year}</Text>
                                                </View>
                                                <Text style={styles.titleText}>{item.title}</Text>
                                                <Text style={styles.descriptionText} numberOfLines={3}>
                                                    {item.description}
                                                </Text>
                                                {item.highlight ? (
                                                    <View style={styles.highlightChip}>
                                                        <Text style={styles.highlightText}>{item.highlight}</Text>
                                                    </View>
                                                ) : null}
                                                {(Array.isArray(item.linkedBlogs) && item.linkedBlogs.length) || (Array.isArray(item.linkedCompetitions) && item.linkedCompetitions.length) ? (
                                                    <View style={styles.linkRow}>
                                                        {Array.isArray(item.linkedBlogs) && item.linkedBlogs.length ? (
                                                            <View style={styles.linkChip}>
                                                                <Text style={styles.linkChipText}>{item.linkedBlogs.length} blogs</Text>
                                                            </View>
                                                        ) : null}
                                                        {Array.isArray(item.linkedCompetitions) && item.linkedCompetitions.length ? (
                                                            <View style={styles.linkChip}>
                                                                <Text style={styles.linkChipText}>{item.linkedCompetitions.length} competitions</Text>
                                                            </View>
                                                        ) : null}
                                                    </View>
                                                ) : null}
                                            </View>
                                        )}
                                        {editable && onEdit ? (
                                            <TouchableOpacity
                                                style={styles.cardActions}
                                                onPress={() => onEdit(item)}
                                            >
                                                <Edit2 size={14} color={colors.mainTextColor} variant="Linear" />
                                            </TouchableOpacity>
                                        ) : null}
                                    </CardWrapper>
                                </LinearGradient>
                            </Animated.View>
                        );
                    })}
                </Animated.ScrollView>
            </View>
        </View>
    );
};

export default ProfileTimeline;
