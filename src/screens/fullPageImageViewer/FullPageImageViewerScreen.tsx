import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    FlatList,
    StatusBar,
    ViewToken,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CloseCircle } from 'iconsax-react-nativejs';
import { createStyles } from './FullPageImageViewerStyles';
import { useTheme } from '../../context/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const FullPageImageViewerScreen = ({ navigation, route }: any) => {
    const { images, initialIndex = 0, title } = route.params;
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);

    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const flatListRef = useRef<FlatList>(null);

    const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0 && viewableItems[0].index !== null) {
            setCurrentIndex(viewableItems[0].index);
        }
    }, []);

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    const getItemLayout = useCallback((_: any, index: number) => ({
        length: screenWidth,
        offset: screenWidth * index,
        index,
    }), []);

    const handleClose = () => {
        navigation.goBack();
    };

    const renderImage = ({ item }: { item: any }) => (
        <View style={Styles.imageContainer}>
            <FastImage
                source={item}
                style={Styles.fullImage}
                resizeMode="contain"
            />
        </View>
    );

    const renderPaginationDots = () => (
        <View style={[Styles.paginationDotsContainer, { bottom: insets.bottom + 20 }]}>
            {images.map((_: any, index: number) => (
                <View
                    key={index}
                    style={[
                        Styles.paginationDot,
                        index === currentIndex && Styles.paginationDotActive,
                    ]}
                />
            ))}
        </View>
    );

    return (
        <View style={Styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* Header */}
            <View style={[Styles.header, { paddingTop: insets.top + 10 }]}>
                {images.length > 1 ? (
                    <View style={Styles.counterBadge}>
                        <Text style={Styles.counterText}>
                            {currentIndex + 1}/{images.length}
                        </Text>
                    </View>
                ) : (
                    <View />
                )}

                <TouchableOpacity
                    style={Styles.closeButton}
                    onPress={handleClose}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <CloseCircle size={32} color="#FFFFFF" variant="Bold" />
                </TouchableOpacity>
            </View>

            {/* Title */}
            {title && (
                <View style={[Styles.titleContainer, { top: insets.top + 60 }]}>
                    <Text style={Styles.title} numberOfLines={2}>{title}</Text>
                </View>
            )}

            {/* Image Carousel */}
            <FlatList
                ref={flatListRef}
                data={images}
                renderItem={renderImage}
                keyExtractor={(_, index) => `fullpage-image-${index}`}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                bounces={false}
                getItemLayout={getItemLayout}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                initialScrollIndex={initialIndex}
            />

            {/* Pagination Dots */}
            {images.length > 1 && renderPaginationDots()}
        </View>
    );
};

export default FullPageImageViewerScreen;
