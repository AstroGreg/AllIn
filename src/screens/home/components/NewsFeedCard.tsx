import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, Dimensions, FlatList, ViewToken, Image, Animated } from 'react-native';
import FastImage from 'react-native-fast-image';
import ShimmerEffect from '../../../components/shimmerEffect/ShimmerEffect';
import Video from 'react-native-video';
import { createStyles } from '../HomeStyles';
import Icons from '../../../constants/Icons';
import { useTheme } from '../../../context/ThemeContext';
import { Heart } from 'iconsax-react-nativejs';

const { width: screenWidth } = Dimensions.get('window');

interface NewsFeedCardProps {
    title: string;
    images: any[];
    isVideo?: boolean;
    videoUri?: string;
    videoSources?: Record<number, string>;
    hasBorder?: boolean;
    onPress?: () => void;
    onImagePress?: (index: number) => void;
    showPlayOverlay?: boolean;
    videoIndexes?: number[];
    textSlide?: {
        title: string;
        description?: string;
    };
    hideBelowText?: boolean;
    headerTag?: string;
    likesLabel?: string;
    showActions?: boolean;
    onPressVideo?: (currentTime: number) => void;
    onVideoProgress?: (currentTime: number) => void;
    onShare?: () => void;
    onDownload?: () => void;
    onPressMore?: () => void;
    isActive?: boolean;
    resumeAt?: number;
    useSharedPlayer?: boolean;
    onVideoLayout?: (layout: { x: number; y: number; width: number; height: number }) => void;
    user?: {
        name: string;
        avatar: any;
        date?: string;
    };
    description?: string;
    onPressUser?: () => void;
    hideUserDate?: boolean;
    headerSeparated?: boolean;
    toggleVideoOnPress?: boolean;
    hideAvatar?: boolean;
}

const NewsFeedCard = ({
    title,
    images,
    isVideo = false,
    videoUri,
    hasBorder = true,
    onPress,
    onImagePress,
    showPlayOverlay = false,
    videoIndexes = [],
    textSlide,
    hideBelowText = false,
    headerTag,
    likesLabel,
    showActions = false,
    onPressVideo,
    onVideoProgress,
    onShare,
    onDownload,
    onPressMore,
    isActive = true,
    resumeAt,
    useSharedPlayer = false,
    onVideoLayout,
    videoSources,
    user,
    description,
    onPressUser,
    hideUserDate = false,
    headerSeparated = false,
    toggleVideoOnPress = false,
    hideAvatar = false
}: NewsFeedCardProps) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const lastTapRef = useRef(0);
    const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const doubleTapDelay = 320;
    const likeScale = useRef(new Animated.Value(0.6)).current;
    const likeOpacity = useRef(new Animated.Value(0)).current;

    // Full-width media for feed
    const [mediaWidth, setMediaWidth] = useState(screenWidth);
    const imageWidth = Math.round(mediaWidth);
    const imageHeight = Math.round(imageWidth * 0.78);
    const [isPlaying, setIsPlaying] = useState(false);
    const [videoFailed, setVideoFailed] = useState(false);
    const [videoLoading, setVideoLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [isManualPaused, setIsManualPaused] = useState(false);
    const videoOpacity = useRef(new Animated.Value(0)).current;
    const videoRef = useRef<Video>(null);
    const hasSeekedRef = useRef(false);
    const lastResumeRef = useRef(0);
    const videoContainerRef = useRef<View>(null);

    const getInlineVideoUri = useCallback((index: number) => {
        if (isVideo && videoUri && index === 0) return videoUri;
        if (videoSources && videoSources[index]) return videoSources[index];
        return null;
    }, [isVideo, videoUri, videoSources]);

    const currentInlineVideoUri = useMemo(() => getInlineVideoUri(currentIndex), [currentIndex, getInlineVideoUri]);

    const attemptAutoplay = useCallback(() => {
        if (!currentInlineVideoUri) return;
        if (!isActive) {
            setIsPlaying(false);
            return;
        }
        if (isManualPaused) {
            setIsPlaying(false);
            return;
        }
        setIsPlaying(true);
    }, [currentInlineVideoUri, isActive, isManualPaused]);

    useEffect(() => {
        attemptAutoplay();
    }, [attemptAutoplay]);

    useEffect(() => {
        if (!currentInlineVideoUri) return;
        const timer = setTimeout(() => {
            attemptAutoplay();
        }, 50);
        return () => clearTimeout(timer);
    }, [attemptAutoplay, currentInlineVideoUri, currentIndex, isActive]);

    useEffect(() => {
        videoOpacity.setValue(0);
        setVideoLoading(true);
        setVideoFailed(false);
        hasSeekedRef.current = false;
        lastResumeRef.current = 0;
        setIsManualPaused(false);
    }, [videoOpacity, currentIndex, currentInlineVideoUri]);

    useEffect(() => {
        if (!currentInlineVideoUri) return;
        if (!isActive) return;
        const resumeTime = Number(resumeAt ?? 0);
        if (!Number.isFinite(resumeTime) || resumeTime <= 0) return;
        if (Math.abs(resumeTime - lastResumeRef.current) < 0.25 && hasSeekedRef.current) return;
        lastResumeRef.current = resumeTime;
        videoRef.current?.seek(resumeTime);
        hasSeekedRef.current = true;
    }, [currentInlineVideoUri, isActive, resumeAt]);

    useEffect(() => {
        if (!isActive) {
            setIsManualPaused(false);
        }
    }, [isActive]);

    const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0 && viewableItems[0].index !== null) {
            setCurrentIndex(viewableItems[0].index);
        }
    }, []);

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50
    }).current;

    const getItemLayout = useCallback((_: any, index: number) => ({
        length: imageWidth,
        offset: imageWidth * index,
        index,
    }), [imageWidth]);

    const triggerLikePulse = useCallback(() => {
        likeOpacity.setValue(1);
        likeScale.setValue(0.6);
        Animated.parallel([
            Animated.spring(likeScale, {
                toValue: 1,
                useNativeDriver: true,
                speed: 14,
                bounciness: 10,
            }),
            Animated.timing(likeOpacity, {
                toValue: 0,
                duration: 900,
                useNativeDriver: true,
            }),
        ]).start();
    }, [likeOpacity, likeScale]);

    const handleImagePress = (index: number) => {
        const inlineVideoUri = getInlineVideoUri(index);
        if (inlineVideoUri) {
            if (toggleVideoOnPress) {
                setIsPlaying((prev) => {
                    const next = !prev;
                    setIsManualPaused(!next);
                    return next;
                });
                return;
            }
            if (onPressVideo) {
                onPressVideo(currentTime);
                return;
            }
        }
        if (onImagePress) {
            onImagePress(index);
            return;
        }
        if (onPress) {
            onPress();
        }
    };

    const handlePressWithDoubleTap = (index: number) => {
        const now = Date.now();
        const delta = now - lastTapRef.current;
        if (delta < doubleTapDelay) {
            if (tapTimeoutRef.current) {
                clearTimeout(tapTimeoutRef.current);
                tapTimeoutRef.current = null;
            }
            lastTapRef.current = 0;
            triggerLikePulse();
            return;
        }
        lastTapRef.current = now;
        if (tapTimeoutRef.current) {
            clearTimeout(tapTimeoutRef.current);
        }
        tapTimeoutRef.current = setTimeout(() => {
            handleImagePress(index);
        }, doubleTapDelay);
    };

    const renderImage = ({ item, index }: { item: any; index: number }) => {
        if (textSlide && index === 0) {
            return (
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => handlePressWithDoubleTap(index)}
                    style={[Styles.newsFeedImageContainer, Styles.textSlideContainer, { width: imageWidth, height: imageHeight }]}
                >
                    <View style={Styles.textSlideContent}>
                        <Text style={Styles.textSlideTitle} numberOfLines={3}>{textSlide.title}</Text>
                        {textSlide.description ? (
                            <Text style={Styles.textSlideDescription} numberOfLines={6}>{textSlide.description}</Text>
                        ) : null}
                    </View>
                </TouchableOpacity>
            );
        }

        const isCurrent = index === currentIndex;
        const inlineVideoUri = getInlineVideoUri(index);
        if (inlineVideoUri) {
            const isHls = String(inlineVideoUri).toLowerCase().includes('.m3u8');
            return (
                <TouchableOpacity
                    ref={videoContainerRef}
                    activeOpacity={0.9}
                    onPress={() => handlePressWithDoubleTap(index)}
                    onLayout={(event) => {
                        if (!onVideoLayout) return;
                        const { x, y, width, height } = event.nativeEvent.layout;
                        onVideoLayout({ x, y, width, height });
                    }}
                    style={[Styles.newsFeedImageContainer, { width: imageWidth, height: imageHeight }]}
                >
                    {(videoLoading || videoFailed || useSharedPlayer) && (
                        <View style={Styles.newsFeedSkeleton}>
                            <ShimmerEffect width="100%" height="100%" borderRadius={0} />
                        </View>
                    )}
                    {!useSharedPlayer && !videoFailed && (
                        <Animated.View style={[Styles.newsFeedVideoLayer, { opacity: videoOpacity }]} pointerEvents="none">
                            <Video
                                ref={videoRef}
                                source={{
                                    uri: inlineVideoUri,
                                    type: isHls ? 'm3u8' : undefined,
                                }}
                                style={Styles.newsFeedImage}
                                resizeMode="cover"
                                paused={!(isPlaying && isCurrent && isActive)}
                                controls={false}
                                muted={false}
                                volume={1.0}
                                repeat
                                playInBackground={false}
                                playWhenInactive={false}
                                ignoreSilentSwitch="ignore"
                                onError={() => {
                                    setVideoFailed(true);
                                    setVideoLoading(false);
                                }}
                                onProgress={(progress) => {
                                    if (isCurrent) {
                                        const nextTime = progress.currentTime || 0;
                                        setCurrentTime(nextTime);
                                        if (onVideoProgress) {
                                            onVideoProgress(nextTime);
                                        }
                                    }
                                }}
                                onLoad={() => {
                                    setVideoLoading(false);
                                    Animated.timing(videoOpacity, {
                                        toValue: 1,
                                        duration: 220,
                                        useNativeDriver: true,
                                    }).start();
                                }}
                            />
                        </Animated.View>
                    )}
                    {!useSharedPlayer && !isPlaying && isCurrent && (
                        <View style={Styles.videoOverlay}>
                            <View style={Styles.playButtonLarge}>
                                <Icons.PlayCricle height={38} width={38} />
                            </View>
                        </View>
                    )}
                </TouchableOpacity>
            );
        }

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handlePressWithDoubleTap(index)}
                style={[Styles.newsFeedImageContainer, { width: imageWidth, height: imageHeight }]}
            >
                <FastImage
                    source={item}
                    style={Styles.newsFeedImage}
                    resizeMode="cover"
                />
            {(showPlayOverlay || videoIndexes.includes(index)) && index === currentIndex && (
                <View style={Styles.videoOverlay}>
                    <View style={Styles.playButtonLarge}>
                        <Icons.PlayCricle height={38} width={38} />
                    </View>
                </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderPaginationDots = () => (
        <View style={Styles.paginationDotsContainer}>
            {images.map((_, index) => (
                <View
                    key={index}
                    style={[
                        Styles.paginationDot,
                        index === currentIndex && Styles.paginationDotActive
                    ]}
                />
            ))}
        </View>
    );

    const normalizedTitle = (title ?? '').trim();
    const normalizedDescription = (description ?? '').trim();
    const showDescription =
        normalizedDescription.length > 0 &&
        normalizedDescription.toLowerCase() !== normalizedTitle.toLowerCase();

    return (
        <View style={[hasBorder ? Styles.newsFeedCard : Styles.newsFeedCardNoBorder, Styles.newsFeedCardFull]}>
            {user && (
                <View style={[
                    Styles.userPostHeader,
                    Styles.feedPadding,
                    headerSeparated && Styles.userPostHeaderSeparated,
                ]}>
                    <TouchableOpacity style={Styles.userPostInfo} onPress={onPressUser}>
                        {!hideAvatar && user.avatar ? (
                            <FastImage
                                source={user.avatar}
                                style={Styles.userPostAvatar}
                            />
                        ) : null}
                        <View>
                            <Text style={Styles.userPostName}>{user.name}</Text>
                            {!hideUserDate && !!user.date && (
                                <Text style={Styles.userPostTime}>{user.date}</Text>
                            )}
                        </View>
                    </TouchableOpacity>
                    {headerTag || onPressMore ? (
                        <View style={Styles.feedHeaderActions}>
                            {headerTag ? (
                                <View style={Styles.feedTag}>
                                    <Text style={Styles.feedTagText}>{headerTag}</Text>
                                </View>
                            ) : null}
                            {onPressMore ? (
                                <TouchableOpacity style={Styles.feedMoreButton} onPress={onPressMore}>
                                    <Text style={Styles.feedMoreDots}>⋯</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>
                    ) : null}
                </View>
            )}

            <View
                style={Styles.mediaWrapper}
                onLayout={(event) => {
                    const width = event.nativeEvent.layout.width;
                    if (width && Math.abs(width - mediaWidth) > 1) {
                        setMediaWidth(width);
                    }
                }}
            >
                <FlatList
                    ref={flatListRef}
                    data={images}
                    renderItem={renderImage}
                    keyExtractor={(_, index) => `image-${index}`}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={imageWidth}
                    snapToAlignment="start"
                    decelerationRate="fast"
                    bounces={false}
                    getItemLayout={getItemLayout}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                    scrollEnabled={true}
                    style={{ width: imageWidth, height: imageHeight }}
                    contentContainerStyle={{ width: imageWidth, height: imageHeight }}
                />
                <Animated.View
                    pointerEvents="none"
                    style={[
                        Styles.likePulse,
                        {
                            opacity: likeOpacity,
                            transform: [{ scale: likeScale }],
                        },
                    ]}
                >
                    <Heart size={78} color={colors.pureWhite} variant="Bold" />
                </Animated.View>
                {images.length > 1 && (
                    <View style={Styles.paginationBadge}>
                        <Text style={Styles.paginationText}>{currentIndex + 1}/{images.length}</Text>
                    </View>
                )}
            </View>

            {images.length > 1 && renderPaginationDots()}

     

            <View style={[Styles.feedPadding, Styles.feedMetaRow]}>
                <TouchableOpacity style={Styles.feedLikeButton} activeOpacity={0.85}>
                    <Heart size={25} color={colors.primaryColor} variant="Linear" />
                    <Text style={Styles.feedLikeText}>{likesLabel ?? 'Like'}</Text>
                </TouchableOpacity>
                {showActions && (
                    <View style={Styles.feedActionsRow}>
                        <TouchableOpacity style={Styles.feedActionTextButton} activeOpacity={0.85} onPress={onDownload}>
                            <Text style={Styles.feedActionText}>Download</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={Styles.feedActionButton} activeOpacity={0.85} onPress={onShare}>
                            <Image source={Icons.ShareBlue} style={Styles.feedActionIcon} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

        </View>
    );
};

export default NewsFeedCard;
