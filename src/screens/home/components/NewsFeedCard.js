import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, Dimensions, FlatList, Image, Animated, Modal, Pressable } from 'react-native';
import FastImage from 'react-native-fast-image';
import ShimmerEffect from '../../../components/shimmerEffect/ShimmerEffect';
import Video from 'react-native-video';
import { createStyles } from '../HomeStyles';
import Icons from '../../../constants/Icons';
import { useTheme } from '../../../context/ThemeContext';
import { Heart, Import, Eye } from 'iconsax-react-nativejs';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
function computeContainFrame(container, aspectRatio) {
    var _a, _b;
    const containerWidth = Number((_a = container === null || container === void 0 ? void 0 : container.width) !== null && _a !== void 0 ? _a : 0);
    const containerHeight = Number((_b = container === null || container === void 0 ? void 0 : container.height) !== null && _b !== void 0 ? _b : 0);
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
function resolveVideoAspectRatio(event) {
    var _a, _b, _c, _d, _e, _f;
    const naturalWidth = Number((_b = (_a = event === null || event === void 0 ? void 0 : event.naturalSize) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : 0);
    const naturalHeight = Number((_d = (_c = event === null || event === void 0 ? void 0 : event.naturalSize) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : 0);
    if (naturalWidth <= 0 || naturalHeight <= 0)
        return null;
    const orientation = String((_f = (_e = event === null || event === void 0 ? void 0 : event.naturalSize) === null || _e === void 0 ? void 0 : _e.orientation) !== null && _f !== void 0 ? _f : '').toLowerCase();
    let displayWidth = naturalWidth;
    let displayHeight = naturalHeight;
    if (orientation.includes('portrait') && naturalWidth > naturalHeight) {
        displayWidth = naturalHeight;
        displayHeight = naturalWidth;
    }
    else if (orientation.includes('landscape') && naturalHeight > naturalWidth) {
        displayWidth = naturalHeight;
        displayHeight = naturalWidth;
    }
    const ratio = displayWidth / displayHeight;
    return Number.isFinite(ratio) && ratio > 0 ? ratio : null;
}
const NewsFeedCard = ({ title, images, isVideo = false, videoUri, hasBorder = true, onPress, onImagePress, showPlayOverlay = false, videoIndexes = [], textSlide, headerTag, viewsLabel, likesLabel, liked = false, onToggleLike, likeDisabled = false, showActions = false, onPressVideo, onVideoProgress, onShare, onDownload, onTranslate, onPressMore, isActive = true, resumeAt, useSharedPlayer = false, onVideoLayout, videoSources, user, description: _description, onPressUser, hideUserDate = false, headerSeparated = false, toggleVideoOnPress = false, hideAvatar = false, mediaAspectRatios, }) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);
    const lastTapRef = useRef(0);
    const tapTimeoutRef = useRef(null);
    const doubleTapDelay = 320;
    const likeScale = useRef(new Animated.Value(0.6)).current;
    const likeOpacity = useRef(new Animated.Value(0)).current;
    // Full-width media for feed
    const [mediaWidth, setMediaWidth] = useState(screenWidth);
    const imageWidth = Math.round(mediaWidth);
    const [aspectRatiosByIndex, setAspectRatiosByIndex] = useState({});
    const [isPlaying, setIsPlaying] = useState(false);
    const [videoFailed, setVideoFailed] = useState(false);
    const [videoLoading, setVideoLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [isManualPaused, setIsManualPaused] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
    const [imagePreviewSource, setImagePreviewSource] = useState(null);
    const [imagePreviewAspectRatio, setImagePreviewAspectRatio] = useState(1);
    const [imagePreviewModalSize, setImagePreviewModalSize] = useState({ width: 0, height: 0 });
    const videoOpacity = useRef(new Animated.Value(0)).current;
    const videoRef = useRef(null);
    const hasSeekedRef = useRef(false);
    const lastResumeRef = useRef(0);
    const videoContainerRef = useRef(null);
    const getInlineVideoUri = useCallback((index) => {
        if (isVideo && videoUri && index === 0)
            return videoUri;
        if (videoSources && videoSources[index])
            return videoSources[index];
        return null;
    }, [isVideo, videoUri, videoSources]);
    const currentInlineVideoUri = useMemo(() => getInlineVideoUri(currentIndex), [currentIndex, getInlineVideoUri]);
    const isCurrentSlideVideo = Boolean(currentInlineVideoUri);
    const currentAspectRatio = aspectRatiosByIndex[currentIndex] ||
        (mediaAspectRatios === null || mediaAspectRatios === void 0 ? void 0 : mediaAspectRatios[currentIndex]) ||
        (isCurrentSlideVideo ? 16 / 9 : 4 / 5);
    const unclampedHeight = imageWidth / currentAspectRatio;
    const minHeight = imageWidth * 0.56;
    const maxHeight = imageWidth * 1.25;
    const imageHeight = Math.round(Math.max(minHeight, Math.min(maxHeight, unclampedHeight)));
    const portraitVideoContainer = useMemo(() => ({
        width: imageWidth * 0.88,
        height: screenHeight * 0.72,
    }), [imageWidth]);
    const portraitVideoFrame = useMemo(() => computeContainFrame(portraitVideoContainer, currentAspectRatio), [currentAspectRatio, portraitVideoContainer]);
    const mediaFrameWidth = Math.round(isCurrentSlideVideo && currentAspectRatio < 1
        ? Math.max(1, portraitVideoFrame.width || portraitVideoContainer.width)
        : imageWidth);
    const mediaFrameHeight = Math.round(isCurrentSlideVideo && currentAspectRatio < 1
        ? Math.max(minHeight, portraitVideoFrame.height || portraitVideoContainer.height)
        : imageHeight);
    const attemptAutoplay = useCallback(() => {
        if (!currentInlineVideoUri)
            return;
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
        if (!currentInlineVideoUri)
            return;
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
        var _a;
        if (!currentInlineVideoUri)
            return;
        if (!isActive)
            return;
        const resumeTime = Number(resumeAt !== null && resumeAt !== void 0 ? resumeAt : 0);
        if (!Number.isFinite(resumeTime) || resumeTime <= 0)
            return;
        if (Math.abs(resumeTime - lastResumeRef.current) < 0.25 && hasSeekedRef.current)
            return;
        lastResumeRef.current = resumeTime;
        (_a = videoRef.current) === null || _a === void 0 ? void 0 : _a.seek(resumeTime);
        hasSeekedRef.current = true;
    }, [currentInlineVideoUri, isActive, resumeAt]);
    useEffect(() => {
        if (!isActive) {
            setIsManualPaused(false);
        }
    }, [isActive]);
    const onViewableItemsChanged = useCallback(({ viewableItems }) => {
        if (viewableItems.length > 0 && viewableItems[0].index !== null) {
            setCurrentIndex(viewableItems[0].index);
        }
    }, []);
    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50
    }).current;
    const getItemLayout = useCallback((_, index) => ({
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
    const handleImagePress = (index) => {
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
        const selectedImage = images === null || images === void 0 ? void 0 : images[index];
        if (selectedImage && String(selectedImage) !== '__text__') {
            if (typeof selectedImage === 'number') {
                const resolved = Image.resolveAssetSource(selectedImage);
                if ((resolved === null || resolved === void 0 ? void 0 : resolved.width) && (resolved === null || resolved === void 0 ? void 0 : resolved.height)) {
                    setImagePreviewAspectRatio(resolved.width / resolved.height);
                }
                else {
                    setImagePreviewAspectRatio(1);
                }
            }
            else if ((selectedImage === null || selectedImage === void 0 ? void 0 : selectedImage.width) && (selectedImage === null || selectedImage === void 0 ? void 0 : selectedImage.height)) {
                setImagePreviewAspectRatio(Number(selectedImage.width) / Number(selectedImage.height));
            }
            else {
                setImagePreviewAspectRatio(1);
            }
            setImagePreviewSource(selectedImage);
            setImagePreviewVisible(true);
            return;
        }
    };
    const handlePressWithDoubleTap = (index) => {
        const now = Date.now();
        const delta = now - lastTapRef.current;
        if (delta < doubleTapDelay) {
            if (tapTimeoutRef.current) {
                clearTimeout(tapTimeoutRef.current);
                tapTimeoutRef.current = null;
            }
            lastTapRef.current = 0;
            triggerLikePulse();
            onToggleLike === null || onToggleLike === void 0 ? void 0 : onToggleLike();
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
    const renderImage = ({ item, index }) => {
        if (textSlide && index === 0) {
            return (_jsx(TouchableOpacity, Object.assign({ activeOpacity: 0.9, onPress: () => handlePressWithDoubleTap(index), style: [Styles.newsFeedImageContainer, Styles.textSlideContainer, { width: mediaFrameWidth, height: mediaFrameHeight }] }, { children: _jsxs(View, Object.assign({ style: Styles.textSlideContent }, { children: [_jsx(Text, Object.assign({ style: Styles.textSlideTitle, numberOfLines: 3 }, { children: textSlide.title })), textSlide.description ? (_jsx(Text, Object.assign({ style: Styles.textSlideDescription, numberOfLines: 6 }, { children: textSlide.description }))) : null] })) })));
        }
        const isCurrent = index === currentIndex;
        const inlineVideoUri = getInlineVideoUri(index);
        if (inlineVideoUri) {
            const isHls = String(inlineVideoUri).toLowerCase().includes('.m3u8');
            return (_jsxs(TouchableOpacity, Object.assign({ ref: videoContainerRef, activeOpacity: 0.9, onPress: () => handlePressWithDoubleTap(index), onLayout: (event) => {
                    if (!onVideoLayout)
                        return;
                    const { x, y, width, height } = event.nativeEvent.layout;
                    onVideoLayout({ x, y, width, height });
                }, style: [Styles.newsFeedImageContainer, { width: mediaFrameWidth, height: mediaFrameHeight }] }, { children: [(videoLoading || videoFailed || useSharedPlayer) && (_jsx(View, Object.assign({ style: Styles.newsFeedSkeleton }, { children: _jsx(ShimmerEffect, { width: "100%", height: "100%", borderRadius: 0 }) }))), !useSharedPlayer && !videoFailed && (_jsx(Animated.View, Object.assign({ style: [Styles.newsFeedVideoLayer, { opacity: videoOpacity }], pointerEvents: "none" }, { children: _jsx(Video, { ref: videoRef, source: {
                                uri: inlineVideoUri,
                                type: isHls ? 'm3u8' : undefined,
                            }, style: Styles.newsFeedImage, resizeMode: "contain", paused: !(isPlaying && isCurrent && isActive), controls: false, muted: isMuted, volume: isMuted ? 0 : 1.0, repeat: true, playInBackground: false, playWhenInactive: false, ignoreSilentSwitch: "ignore", onError: () => {
                                setVideoFailed(true);
                                setVideoLoading(false);
                            }, onProgress: (progress) => {
                                if (isCurrent) {
                                    const nextTime = progress.currentTime || 0;
                                    setCurrentTime(nextTime);
                                    if (onVideoProgress) {
                                        onVideoProgress(nextTime);
                                    }
                                }
                            }, onLoad: (event) => {
                                if (!(mediaAspectRatios === null || mediaAspectRatios === void 0 ? void 0 : mediaAspectRatios[index])) {
                                    const ratio = resolveVideoAspectRatio(event);
                                    if (ratio) {
                                        setAspectRatiosByIndex((prev) => {
                                            if (Math.abs((prev[index] || 0) - ratio) < 0.01)
                                                return prev;
                                            return Object.assign(Object.assign({}, prev), { [index]: ratio });
                                        });
                                    }
                                }
                                setVideoLoading(false);
                                Animated.timing(videoOpacity, {
                                    toValue: 1,
                                    duration: 220,
                                    useNativeDriver: true,
                                }).start();
                            } }) }))), !useSharedPlayer && !videoFailed && (_jsxs(TouchableOpacity, Object.assign({ style: Styles.videoMuteButton, activeOpacity: 0.85, onPress: () => setIsMuted((prev) => !prev) }, { children: [_jsx(Icons.Volume, { width: 18, height: 18 }), isMuted ? _jsx(View, { style: Styles.videoMuteSlash }) : null] }))), !useSharedPlayer && !isPlaying && isCurrent && (_jsx(View, Object.assign({ style: Styles.videoOverlay }, { children: _jsx(View, Object.assign({ style: Styles.playButtonLarge }, { children: _jsx(Icons.PlayCricle, { height: 38, width: 38 }) })) })))] })));
        }
        return (_jsxs(TouchableOpacity, Object.assign({ activeOpacity: 0.9, onPress: () => handlePressWithDoubleTap(index), style: [Styles.newsFeedImageContainer, { width: mediaFrameWidth, height: mediaFrameHeight }] }, { children: [_jsx(FastImage, { source: item, style: Styles.newsFeedImage, resizeMode: "cover", onLoad: (event) => {
                        var _a, _b, _c, _d;
                        const w = Number((_b = (_a = event === null || event === void 0 ? void 0 : event.nativeEvent) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : 0);
                        const h = Number((_d = (_c = event === null || event === void 0 ? void 0 : event.nativeEvent) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : 0);
                        if (w <= 0 || h <= 0)
                            return;
                        const ratio = w / h;
                        if (!Number.isFinite(ratio) || ratio <= 0)
                            return;
                        setAspectRatiosByIndex((prev) => {
                            if (Math.abs((prev[index] || 0) - ratio) < 0.01)
                                return prev;
                            return Object.assign(Object.assign({}, prev), { [index]: ratio });
                        });
                    } }), (showPlayOverlay || videoIndexes.includes(index)) && index === currentIndex && (_jsx(View, Object.assign({ style: Styles.videoOverlay }, { children: _jsx(View, Object.assign({ style: Styles.playButtonLarge }, { children: _jsx(Icons.PlayCricle, { height: 38, width: 38 }) })) })))] })));
    };
    const renderPaginationDots = () => (_jsx(View, Object.assign({ style: Styles.paginationDotsContainer }, { children: images.map((_, index) => (_jsx(View, { style: [
                Styles.paginationDot,
                index === currentIndex && Styles.paginationDotActive
            ] }, index))) })));
    const normalizedTitle = (title !== null && title !== void 0 ? title : '').trim();
    const isTextOnlyPost = Boolean(textSlide && images.length === 1 && String(images[0]) === '__text__');
    const likeCountText = useMemo(() => {
        const raw = String(likesLabel !== null && likesLabel !== void 0 ? likesLabel : '').trim();
        if (!raw)
            return '';
        const match = raw.match(/[0-9][0-9.,]*/);
        return match ? match[0] : raw;
    }, [likesLabel]);
    const viewCountText = useMemo(() => {
        const raw = String(viewsLabel !== null && viewsLabel !== void 0 ? viewsLabel : '').trim();
        if (!raw)
            return '';
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
    return (_jsxs(View, Object.assign({ style: [hasBorder ? Styles.newsFeedCard : Styles.newsFeedCardNoBorder, Styles.newsFeedCardFull] }, { children: [user && (_jsxs(View, Object.assign({ style: [
                    Styles.userPostHeader,
                    Styles.feedPadding,
                    headerSeparated && Styles.userPostHeaderSeparated,
                ] }, { children: [_jsx(View, Object.assign({ style: Styles.userPostHeaderLeft }, { children: _jsxs(View, Object.assign({ style: Styles.userPostHeaderLeftRow }, { children: [_jsxs(TouchableOpacity, Object.assign({ style: Styles.userPostInfo, onPress: onPressUser, disabled: !onPressUser, activeOpacity: 0.8 }, { children: [!hideAvatar && user.avatar ? (_jsx(FastImage, { source: user.avatar, style: Styles.userPostAvatar })) : null, _jsxs(View, Object.assign({ style: Styles.userPostTextBlock }, { children: [_jsx(Text, Object.assign({ style: Styles.userPostName }, { children: user.name })), !hideUserDate && !!user.date && (_jsx(Text, Object.assign({ style: Styles.userPostTime }, { children: user.date })))] }))] })), _jsx(TouchableOpacity, { style: Styles.userPostHeaderSpacerTap, onPress: onPress, disabled: !onPress, activeOpacity: 0.9 })] })) })), headerTag || onPressMore ? (_jsxs(View, Object.assign({ style: Styles.feedHeaderActions }, { children: [headerTag ? (_jsx(View, Object.assign({ style: Styles.feedTag }, { children: _jsx(Text, Object.assign({ style: Styles.feedTagText }, { children: headerTag })) }))) : null, onPressMore ? (_jsx(TouchableOpacity, Object.assign({ style: Styles.feedMoreButton, onPress: onPressMore }, { children: _jsx(Text, Object.assign({ style: Styles.feedMoreDots }, { children: "\u22EF" })) }))) : null] }))) : null] }))), isTextOnlyPost ? (_jsxs(TouchableOpacity, Object.assign({ activeOpacity: 0.9, onPress: onPress, style: Styles.redditTextCard }, { children: [_jsx(Text, Object.assign({ style: Styles.redditTextTitle, numberOfLines: 3 }, { children: (textSlide === null || textSlide === void 0 ? void 0 : textSlide.title) || normalizedTitle })), (textSlide === null || textSlide === void 0 ? void 0 : textSlide.description) ? (_jsx(Text, Object.assign({ style: Styles.redditTextBody, numberOfLines: 10 }, { children: textSlide.description }))) : null] }))) : (_jsxs(_Fragment, { children: [_jsx(View, Object.assign({ style: Styles.mediaViewport, onLayout: (event) => {
                            const width = event.nativeEvent.layout.width;
                            if (width && Math.abs(width - mediaWidth) > 1) {
                                setMediaWidth(width);
                            }
                        } }, { children: _jsxs(View, Object.assign({ style: [Styles.mediaWrapper, { width: mediaFrameWidth, height: mediaFrameHeight }] }, { children: [_jsx(FlatList, { ref: flatListRef, data: images, renderItem: renderImage, keyExtractor: (_, index) => `image-${index}`, horizontal: true, showsHorizontalScrollIndicator: false, snapToInterval: mediaFrameWidth, snapToAlignment: "start", decelerationRate: "fast", bounces: false, getItemLayout: getItemLayout, onViewableItemsChanged: onViewableItemsChanged, viewabilityConfig: viewabilityConfig, scrollEnabled: true, style: { width: mediaFrameWidth, height: mediaFrameHeight }, contentContainerStyle: { width: mediaFrameWidth * images.length, height: mediaFrameHeight } }), _jsx(Animated.View, Object.assign({ pointerEvents: "none", style: [
                                        Styles.likePulse,
                                        {
                                            opacity: likeOpacity,
                                            transform: [{ scale: likeScale }],
                                        },
                                    ] }, { children: _jsx(Heart, { size: 78, color: colors.pureWhite, variant: "Bold" }) })), images.length > 1 && (_jsx(View, Object.assign({ style: Styles.paginationBadge }, { children: _jsxs(Text, Object.assign({ style: Styles.paginationText }, { children: [currentIndex + 1, "/", images.length] })) })))] })) })), images.length > 1 && renderPaginationDots()] })), _jsxs(View, Object.assign({ style: [Styles.feedPadding, Styles.feedMetaRow] }, { children: [showActions && (onShare || onDownload || onTranslate) && (_jsxs(View, Object.assign({ style: Styles.feedActionsRow }, { children: [onTranslate ? (_jsx(TouchableOpacity, Object.assign({ style: Styles.feedActionButton, activeOpacity: 0.85, onPress: onTranslate }, { children: _jsx(Icons.LanguageSetting, { width: 18, height: 18 }) }))) : null, onDownload ? (_jsx(TouchableOpacity, Object.assign({ style: Styles.feedActionButton, activeOpacity: 0.85, onPress: onDownload }, { children: _jsx(Import, { size: 23, color: '#3B82F6', variant: "Linear" }) }))) : null, onShare ? (_jsx(TouchableOpacity, Object.assign({ style: Styles.feedActionButton, activeOpacity: 0.85, onPress: onShare }, { children: _jsx(Image, { source: Icons.ShareBlue, style: Styles.feedActionIcon }) }))) : null] }))), _jsxs(View, Object.assign({ style: [Styles.feedActionsRow, { marginLeft: 'auto' }] }, { children: [viewCountText ? (_jsxs(View, Object.assign({ style: Styles.feedLikeButton }, { children: [_jsx(Eye, { size: 24, color: colors.primaryColor, variant: "Linear" }), _jsx(Text, Object.assign({ style: Styles.feedLikeText }, { children: viewCountText }))] }))) : null, _jsxs(TouchableOpacity, Object.assign({ style: [Styles.feedLikeButton, likeDisabled && { opacity: 0.45 }], activeOpacity: likeDisabled ? 1 : 0.85, onPress: onToggleLike, disabled: likeDisabled || !onToggleLike }, { children: [_jsx(Heart, { size: 28, color: colors.primaryColor, variant: liked ? "Bold" : "Linear" }), likeCountText ? _jsx(Text, Object.assign({ style: Styles.feedLikeText }, { children: likeCountText })) : null] }))] }))] })), _jsx(Modal, Object.assign({ visible: imagePreviewVisible, transparent: true, animationType: "fade", onRequestClose: () => setImagePreviewVisible(false) }, { children: _jsxs(View, Object.assign({ style: Styles.feedImagePreviewOverlay }, { children: [_jsx(Pressable, { style: Styles.feedImagePreviewBackdrop, onPress: () => setImagePreviewVisible(false) }), _jsx(View, Object.assign({ style: Styles.feedImagePreviewViewport, onLayout: (event) => {
                                const { width, height } = event.nativeEvent.layout;
                                setImagePreviewModalSize({ width, height });
                            } }, { children: _jsx(Pressable, Object.assign({ style: [
                                    Styles.feedImagePreviewContent,
                                    {
                                        width: previewFrameStyle.width > 0 ? previewFrameStyle.width : '100%',
                                        height: previewFrameStyle.height > 0 ? previewFrameStyle.height : '100%',
                                    },
                                ], onPress: () => { } }, { children: imagePreviewSource ? (_jsx(FastImage, { source: imagePreviewSource, style: Styles.feedImagePreviewImage, resizeMode: "contain", onLoad: (event) => {
                                        var _a, _b, _c, _d;
                                        const w = Number((_b = (_a = event === null || event === void 0 ? void 0 : event.nativeEvent) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : 0);
                                        const h = Number((_d = (_c = event === null || event === void 0 ? void 0 : event.nativeEvent) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : 0);
                                        if (w > 0 && h > 0) {
                                            setImagePreviewAspectRatio(w / h);
                                        }
                                    } })) : null })) }))] })) }))] })));
};
export default NewsFeedCard;
