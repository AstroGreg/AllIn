import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Dimensions, FlatList, StatusBar, } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CloseCircle } from 'iconsax-react-nativejs';
import { createStyles } from './FullPageImageViewerStyles';
import { useTheme } from '../../context/ThemeContext';
import { usePreventMediaCapture } from '../../utils/usePreventMediaCapture';
const { width: screenWidth } = Dimensions.get('window');
const FullPageImageViewerScreen = ({ navigation, route }) => {
    const { images, initialIndex = 0, title } = route.params;
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    usePreventMediaCapture(true);
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const flatListRef = useRef(null);
    const onViewableItemsChanged = useCallback(({ viewableItems }) => {
        if (viewableItems.length > 0 && viewableItems[0].index !== null) {
            setCurrentIndex(viewableItems[0].index);
        }
    }, []);
    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;
    const getItemLayout = useCallback((_, index) => ({
        length: screenWidth,
        offset: screenWidth * index,
        index,
    }), []);
    const handleClose = () => {
        navigation.goBack();
    };
    const renderImage = ({ item }) => (_jsx(View, Object.assign({ style: Styles.imageContainer }, { children: _jsx(FastImage, { source: item, style: Styles.fullImage, resizeMode: "contain" }) })));
    const renderPaginationDots = () => (_jsx(View, Object.assign({ style: [Styles.paginationDotsContainer, { bottom: insets.bottom + 20 }] }, { children: images.map((_, index) => (_jsx(View, { style: [
                Styles.paginationDot,
                index === currentIndex && Styles.paginationDotActive,
            ] }, index))) })));
    return (_jsxs(View, Object.assign({ style: Styles.container }, { children: [_jsx(StatusBar, { barStyle: "light-content", backgroundColor: "transparent", translucent: true }), _jsxs(View, Object.assign({ style: [Styles.header, { paddingTop: insets.top + 10 }] }, { children: [images.length > 1 ? (_jsx(View, Object.assign({ style: Styles.counterBadge }, { children: _jsxs(Text, Object.assign({ style: Styles.counterText }, { children: [currentIndex + 1, "/", images.length] })) }))) : (_jsx(View, {})), _jsx(TouchableOpacity, Object.assign({ style: Styles.closeButton, onPress: handleClose, hitSlop: { top: 10, bottom: 10, left: 10, right: 10 } }, { children: _jsx(CloseCircle, { size: 32, color: "#FFFFFF", variant: "Bold" }) }))] })), title && (_jsx(View, Object.assign({ style: [Styles.titleContainer, { top: insets.top + 60 }] }, { children: _jsx(Text, Object.assign({ style: Styles.title, numberOfLines: 2 }, { children: title })) }))), _jsx(FlatList, { ref: flatListRef, data: images, renderItem: renderImage, keyExtractor: (_, index) => `fullpage-image-${index}`, horizontal: true, pagingEnabled: true, showsHorizontalScrollIndicator: false, bounces: false, getItemLayout: getItemLayout, onViewableItemsChanged: onViewableItemsChanged, viewabilityConfig: viewabilityConfig, initialScrollIndex: initialIndex }), images.length > 1 && renderPaginationDots()] })));
};
export default FullPageImageViewerScreen;
