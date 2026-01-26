import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Dimensions, FlatList, ViewToken } from 'react-native';
import FastImage from 'react-native-fast-image';
import Video from 'react-native-video';
import { createStyles } from '../HomeStyles';
import Icons from '../../../constants/Icons';
import { useTheme } from '../../../context/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

interface NewsFeedCardProps {
    title: string;
    images: any[];
    isVideo?: boolean;
    videoUri?: string;
    hasBorder?: boolean;
    onPress?: () => void;
    user?: {
        name: string;
        avatar: any;
        timeAgo: string;
    };
    description?: string;
    onFollow?: () => void;
    onViewBlog?: () => void;
}

const NewsFeedCard = ({
    title,
    images,
    isVideo = false,
    videoUri,
    hasBorder = true,
    onPress,
    user,
    description,
    onFollow,
    onViewBlog
}: NewsFeedCardProps) => {
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const videoRef = useRef<any>(null);

    // Calculate image width based on whether card has border
    const imageWidth = hasBorder ? screenWidth - 72 : screenWidth - 40;

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

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const renderImage = ({ item, index }: { item: any; index: number }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={isVideo ? handlePlayPause : onPress}
            style={[Styles.newsFeedImageContainer, { width: imageWidth }]}
        >
            {isVideo && videoUri && isPlaying ? (
                <Video
                    ref={videoRef}
                    source={{ uri: videoUri }}
                    style={Styles.newsFeedImage}
                    resizeMode="cover"
                    paused={!isPlaying}
                    repeat={true}
                />
            ) : (
                <>
                    <FastImage
                        source={item}
                        style={Styles.newsFeedImage}
                        resizeMode="cover"
                    />
                    {isVideo && index === currentIndex && (
                        <View style={Styles.videoOverlay}>
                            <View style={Styles.playButtonLarge}>
                                <Icons.PlayWhite height={30} width={30} />
                            </View>
                        </View>
                    )}
                </>
            )}
        </TouchableOpacity>
    );

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

    return (
        <View style={hasBorder ? Styles.newsFeedCard : Styles.newsFeedCardNoBorder}>
            {user && (
                <View style={Styles.userPostHeader}>
                    <View style={Styles.userPostInfo}>
                        <FastImage
                            source={user.avatar}
                            style={Styles.userPostAvatar}
                        />
                        <View>
                            <Text style={Styles.userPostName}>{user.name}</Text>
                            <Text style={Styles.userPostTime}>{user.timeAgo}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={Styles.followButton} onPress={onFollow}>
                        <Text style={Styles.followButtonText}>Follow</Text>
                    </TouchableOpacity>
                </View>
            )}

            <Text style={Styles.newsFeedTitle}>{title}</Text>

            {description && (
                <Text style={Styles.userPostDescription}>{description}</Text>
            )}

            <View style={{ position: 'relative' }}>
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
                    scrollEnabled={!isPlaying}
                />
                {images.length > 1 && !isPlaying && (
                    <View style={Styles.paginationBadge}>
                        <Text style={Styles.paginationText}>{currentIndex + 1}/{images.length}</Text>
                    </View>
                )}
            </View>

            {images.length > 1 && !isPlaying && renderPaginationDots()}

            {onViewBlog && (
                <TouchableOpacity style={Styles.viewBlogButton} onPress={onViewBlog}>
                    <Text style={Styles.viewBlogButtonText}>View Blog</Text>
                    <Icons.RightBtnIcon height={18} width={18} />
                </TouchableOpacity>
            )}
        </View>
    );
};

export default NewsFeedCard;
