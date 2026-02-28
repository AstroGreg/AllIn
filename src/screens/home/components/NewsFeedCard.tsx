import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, Dimensions, FlatList, ViewToken, Image, Animated, Modal, Pressable } from 'react-native';
import FastImage from 'react-native-fast-image';
import ShimmerEffect from '../../../components/shimmerEffect/ShimmerEffect';
import Video from 'react-native-video';
import { createStyles } from '../HomeStyles';
import Icons from '../../../constants/Icons';
import { useTheme } from '../../../context/ThemeContext';
import { Heart, Import, Eye } from 'iconsax-react-nativejs';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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
    viewsLabel?: string;
    likesLabel?: string;
    liked?: boolean;
    onToggleLike?: () => void;
    likeDisabled?: boolean;
    showActions?: boolean;
    onPressVideo?: (currentTime: number) => void;
    onVideoProgress?: (currentTime: number) => void;
    onShare?: () => void;
    onDownload?: () => void;
    onTranslate?: () => void;
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
    mediaAspectRatios?: Record<number, number>;
}

function computeContainFrame(
    container: { width: number; height: number },
    aspectRatio: number,
) {
    const containerWidth = Number(container?.width ?? 0);
    const containerHeight = Number(container?.height ?? 0);
    if (containerWidth <= 0 || containerHeight <= 0) {
        return { width: 0, height: 0 };
    }
    const safeAspectRatio = Number.isFinite(aspectRatio) && aspectRatio > 0 ? aspectRatio : 1;
    const containerRatio = containerWidth / containerHeight;
    if (safeAspectRatio > containerRatio) {
        return { width: containerWidth, height: containerWidth / safeAspectRatio };
    }
    return { width: containerHeight * safeAspectRatio, height: containerHeight };
}

function resolveVideoAspectRatio(event: any) {
    const naturalWidth = Number(event?.naturalSize?.width ?? 0);
    const naturalHeight = Number(event?.naturalSize?.height ?? 0);
    if (naturalWidth <= 0 || naturalHeight <= 0) return null;

    const orientation = String(event?.naturalSize?.orientation ?? '').toLowerCase();
    let displayWidth = naturalWidth;
    let displayHeight = naturalHeight;

    if (orientation.includes('portrait') && naturalWidth > naturalHeight) {
        displayWidth = naturalHeight;
        displayHeight = naturalWidth;
    } else if (orientation.includes('landscape') && naturalHeight > naturalWidth) {
        displayWidth = naturalHeight;
        displayHeight = naturalWidth;
    }

    const ratio = displayWidth / displayHeight;
    return Number.isFinite(ratio) && ratio > 0 ? ratio : null;
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
    headerTag,
    viewsLabel,
    likesLabel,
    liked = false,
    onToggleLike,
    likeDisabled = false,
    showActions = false,
    onPressVideo,
    onVideoProgress,
    onShare,
    onDownload,
    onTranslate,
    onPressMore,
    isActive = true,
    resumeAt,
    useSharedPlayer = false,
    onVideoLayout,
    videoSources,
    user,
    description: _description,
    onPressUser,
    hideUserDate = false,
    headerSeparated = false,
    toggleVideoOnPress = false,
    hideAvatar = false,
    mediaAspectRatios,
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
    const [aspectRatiosByIndex, setAspectRatiosByIndex] = useState<Record<number, number>>({});
    const [isPlaying, setIsPlaying] = useState(false);
    const [videoFailed, setVideoFailed] = useState(false);
    const [videoLoading, setVideoLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [isManualPaused, setIsManualPaused] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
    const [imagePreviewSource, setImagePreviewSource] = useState<any | null>(null);
    const [imagePreviewAspectRatio, setImagePreviewAspectRatio] = useState(1);
    const [imagePreviewModalSize, setImagePreviewModalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
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
    const isCurrentSlideVideo = Boolean(currentInlineVideoUri);
    const currentAspectRatio =
        aspectRatiosByIndex[currentIndex] ||
        mediaAspectRatios?.[currentIndex] ||
        (isCurrentSlideVideo ? 16 / 9 : 4 / 5);
    const unclampedHeight = imageWidth / currentAspectRatio;
    const minHeight = imageWidth * 0.56;
    const maxHeight = imageWidth * 1.25;
    const imageHeight = Math.round(Math.max(minHeight, Math.min(maxHeight, unclampedHeight)));
    const portraitVideoContainer = useMemo(
        () => ({
            width: imageWidth * 0.88,
            height: screenHeight * 0.72,
        }),
        [imageWidth],
    );
    const portraitVideoFrame = useMemo(
        () => computeContainFrame(portraitVideoContainer, currentAspectRatio),
        [currentAspectRatio, portraitVideoContainer],
    );
    const mediaFrameWidth = Math.round(
        isCurrentSlideVideo && currentAspectRatio < 1
            ? Math.max(1, portraitVideoFrame.width || portraitVideoContainer.width)
            : imageWidth,
    );
    const mediaFrameHeight = Math.round(
        isCurrentSlideVideo && currentAspectRatio < 1
            ? Math.max(minHeight, portraitVideoFrame.height || portraitVideoContainer.height)
            : imageHeight,
    );

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
        setIsMuted(true);
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
        length: mediaFrameWidth,
        offset: mediaFrameWidth * index,
        index,
    }), [mediaFrameWidth]);

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
            return;
        }
        const selectedImage = images?.[index];
        if (selectedImage && String(selectedImage) !== '__text__') {
            if (typeof selectedImage === 'number') {
                const resolved = Image.resolveAssetSource(selectedImage);
                if (resolved?.width && resolved?.height) {
                    setImagePreviewAspectRatio(resolved.width / resolved.height);
                } else {
                    setImagePreviewAspectRatio(1);
                }
            } else if (selectedImage?.width && selectedImage?.height) {
                setImagePreviewAspectRatio(Number(selectedImage.width) / Number(selectedImage.height));
            } else {
                setImagePreviewAspectRatio(1);
            }
            setImagePreviewSource(selectedImage);
            setImagePreviewVisible(true);
            return;
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
            onToggleLike?.();
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
                    style={[Styles.newsFeedImageContainer, Styles.textSlideContainer, { width: mediaFrameWidth, height: mediaFrameHeight }]}
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
                    style={[Styles.newsFeedImageContainer, { width: mediaFrameWidth, height: mediaFrameHeight }]}
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
                                resizeMode="contain"
                                paused={!(isPlaying && isCurrent && isActive)}
                                controls={false}
                                muted={isMuted}
                                volume={isMuted ? 0 : 1.0}
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
                                onLoad={(event: any) => {
                                    if (!mediaAspectRatios?.[index]) {
                                        const ratio = resolveVideoAspectRatio(event);
                                        if (ratio) {
                                            setAspectRatiosByIndex((prev) => {
                                                if (Math.abs((prev[index] || 0) - ratio) < 0.01) return prev;
                                                return { ...prev, [index]: ratio };
                                            });
                                        }
                                    }
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
                    {!useSharedPlayer && !videoFailed && (
                        <TouchableOpacity
                            style={Styles.videoMuteButton}
                            activeOpacity={0.85}
                            onPress={() => setIsMuted((prev) => !prev)}
                        >
                            <Icons.Volume width={18} height={18} />
                            {isMuted ? <View style={Styles.videoMuteSlash} /> : null}
                        </TouchableOpacity>
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
                style={[Styles.newsFeedImageContainer, { width: mediaFrameWidth, height: mediaFrameHeight }]}
            >
                <FastImage
                    source={item}
                    style={Styles.newsFeedImage}
                    resizeMode="cover"
                    onLoad={(event) => {
                        const w = Number(event?.nativeEvent?.width ?? 0);
                        const h = Number(event?.nativeEvent?.height ?? 0);
                        if (w <= 0 || h <= 0) return;
                        const ratio = w / h;
                        if (!Number.isFinite(ratio) || ratio <= 0) return;
                        setAspectRatiosByIndex((prev) => {
                            if (Math.abs((prev[index] || 0) - ratio) < 0.01) return prev;
                            return { ...prev, [index]: ratio };
                        });
                    }}
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
    const isTextOnlyPost = Boolean(textSlide && images.length === 1 && String(images[0]) === '__text__');
    const likeCountText = useMemo(() => {
        const raw = String(likesLabel ?? '').trim();
        if (!raw) return '';
        const match = raw.match(/[0-9][0-9.,]*/);
        return match ? match[0] : raw;
    }, [likesLabel]);
    const viewCountText = useMemo(() => {
        const raw = String(viewsLabel ?? '').trim();
        if (!raw) return '';
        const match = raw.match(/[0-9][0-9.,]*/);
        return match ? match[0] : raw;
    }, [viewsLabel]);

    const previewFrameStyle = useMemo(() => {
        const maxWidth = Math.max(0, imagePreviewModalSize.width);
        const maxHeight = Math.max(0, imagePreviewModalSize.height);
        if (!maxWidth || !maxHeight) {
            return { width: 0, height: 0 };
        }
        const safeRatio = Number.isFinite(imagePreviewAspectRatio) && imagePreviewAspectRatio > 0
            ? imagePreviewAspectRatio
            : 1;
        let width = maxWidth;
        let height = width / safeRatio;
        if (height > maxHeight) {
            height = maxHeight;
            width = height * safeRatio;
        }
        return { width, height };
    }, [imagePreviewAspectRatio, imagePreviewModalSize.height, imagePreviewModalSize.width]);

    return (
        <View style={[hasBorder ? Styles.newsFeedCard : Styles.newsFeedCardNoBorder, Styles.newsFeedCardFull]}>
            {user && (
                <View style={[
                    Styles.userPostHeader,
                    Styles.feedPadding,
                    headerSeparated && Styles.userPostHeaderSeparated,
                ]}>
                    <View style={Styles.userPostHeaderLeft}>
                        <View style={Styles.userPostHeaderLeftRow}>
                            <TouchableOpacity
                                style={Styles.userPostInfo}
                                onPress={onPressUser}
                                disabled={!onPressUser}
                                activeOpacity={0.8}
                            >
                                {!hideAvatar && user.avatar ? (
                                    <FastImage
                                        source={user.avatar}
                                        style={Styles.userPostAvatar}
                                    />
                                ) : null}
                                <View style={Styles.userPostTextBlock}>
                                    <Text style={Styles.userPostName}>{user.name}</Text>
                                    {!hideUserDate && !!user.date && (
                                        <Text style={Styles.userPostTime}>{user.date}</Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={Styles.userPostHeaderSpacerTap}
                                onPress={onPress}
                                disabled={!onPress}
                                activeOpacity={0.9}
                            />
                        </View>
                    </View>
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

            {isTextOnlyPost ? (
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={onPress}
                    style={Styles.redditTextCard}
                >
                    <Text style={Styles.redditTextTitle} numberOfLines={3}>
                        {textSlide?.title || normalizedTitle}
                    </Text>
                    {textSlide?.description ? (
                        <Text style={Styles.redditTextBody} numberOfLines={10}>
                            {textSlide.description}
                        </Text>
                    ) : null}
                </TouchableOpacity>
            ) : (
                <>
                    <View
                        style={Styles.mediaViewport}
                        onLayout={(event) => {
                            const width = event.nativeEvent.layout.width;
                            if (width && Math.abs(width - mediaWidth) > 1) {
                                setMediaWidth(width);
                            }
                        }}
                    >
                        <View style={[Styles.mediaWrapper, { width: mediaFrameWidth, height: mediaFrameHeight }]}>
                            <FlatList
                                ref={flatListRef}
                                data={images}
                                renderItem={renderImage}
                                keyExtractor={(_, index) => `image-${index}`}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                snapToInterval={mediaFrameWidth}
                                snapToAlignment="start"
                                decelerationRate="fast"
                                bounces={false}
                                getItemLayout={getItemLayout}
                                onViewableItemsChanged={onViewableItemsChanged}
                                viewabilityConfig={viewabilityConfig}
                                scrollEnabled={true}
                                style={{ width: mediaFrameWidth, height: mediaFrameHeight }}
                                contentContainerStyle={{ width: mediaFrameWidth * images.length, height: mediaFrameHeight }}
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
                    </View>

                    {images.length > 1 && renderPaginationDots()}
                </>
            )}

     

            <View style={[Styles.feedPadding, Styles.feedMetaRow]}>
                {showActions && (onShare || onDownload || onTranslate) && (
                    <View style={Styles.feedActionsRow}>
                        {onTranslate ? (
                            <TouchableOpacity style={Styles.feedActionButton} activeOpacity={0.85} onPress={onTranslate}>
                                <Icons.LanguageSetting width={18} height={18} />
                            </TouchableOpacity>
                        ) : null}
                        {onDownload ? (
                            <TouchableOpacity style={Styles.feedActionButton} activeOpacity={0.85} onPress={onDownload}>
                                <Import size={23} color={'#3B82F6'} variant="Linear" />
                            </TouchableOpacity>
                        ) : null}
                        {onShare ? (
                            <TouchableOpacity style={Styles.feedActionButton} activeOpacity={0.85} onPress={onShare}>
                                <Image source={Icons.ShareBlue} style={Styles.feedActionIcon} />
                            </TouchableOpacity>
                        ) : null}
                    </View>
                )}
                <View style={[Styles.feedActionsRow, { marginLeft: 'auto' }]}>
                    {viewCountText ? (
                        <View style={Styles.feedLikeButton}>
                            <Eye size={24} color={colors.primaryColor} variant="Linear" />
                            <Text style={Styles.feedLikeText}>{viewCountText}</Text>
                        </View>
                    ) : null}
                    <TouchableOpacity
                        style={[Styles.feedLikeButton, likeDisabled && { opacity: 0.45 }]}
                        activeOpacity={likeDisabled ? 1 : 0.85}
                        onPress={onToggleLike}
                        disabled={likeDisabled || !onToggleLike}
                    >
                        <Heart size={28} color={colors.primaryColor} variant={liked ? "Bold" : "Linear"} />
                        {likeCountText ? <Text style={Styles.feedLikeText}>{likeCountText}</Text> : null}
                    </TouchableOpacity>
                </View>
            </View>

            <Modal
                visible={imagePreviewVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setImagePreviewVisible(false)}
            >
                <View style={Styles.feedImagePreviewOverlay}>
                    <Pressable
                        style={Styles.feedImagePreviewBackdrop}
                        onPress={() => setImagePreviewVisible(false)}
                    />
                    <View
                        style={Styles.feedImagePreviewViewport}
                        onLayout={(event) => {
                            const { width, height } = event.nativeEvent.layout;
                            setImagePreviewModalSize({ width, height });
                        }}
                    >
                        <Pressable
                            style={[
                                Styles.feedImagePreviewContent,
                                {
                                    width: previewFrameStyle.width > 0 ? previewFrameStyle.width : '100%',
                                    height: previewFrameStyle.height > 0 ? previewFrameStyle.height : '100%',
                                },
                            ]}
                            onPress={() => {}}
                        >
                            {imagePreviewSource ? (
                                <FastImage
                                    source={imagePreviewSource}
                                    style={Styles.feedImagePreviewImage}
                                    resizeMode="contain"
                                    onLoad={(event) => {
                                        const w = Number(event?.nativeEvent?.width ?? 0);
                                        const h = Number(event?.nativeEvent?.height ?? 0);
                                        if (w > 0 && h > 0) {
                                            setImagePreviewAspectRatio(w / h);
                                        }
                                    }}
                                />
                            ) : null}
                        </Pressable>
                    </View>
                </View>
            </Modal>

        </View>
    );
};

export default NewsFeedCard;
