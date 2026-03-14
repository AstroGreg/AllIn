import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { createStyles } from '../ViewUserProfileStyles';
import SizeBox from '../../../constants/SizeBox';
import Icons from '../../../constants/Icons';
import Video from 'react-native-video';
import ShimmerEffect from '../../../components/shimmerEffect/ShimmerEffect';
import { useTheme } from '../../../context/ThemeContext';
const VideoContainer = ({ onPressVideo, videoUri, CompetitionName, event, timer }) => {
    const deviceWidth = Dimensions.get('window').width;
    const spacing = 20;
    const containerWidth = (deviceWidth - (spacing * 3)) / 2; // 3 spaces: left, middle, right
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [isLoading, setIsLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const handleVideoPress = () => {
        if (onPressVideo) {
            onPressVideo();
            return;
        }
        setIsPlaying(!isPlaying);
    };
    return (_jsxs(View, Object.assign({ style: {
            width: containerWidth,
            marginLeft: spacing,
            marginBottom: 20,
            borderRadius: 10,
            overflow: 'hidden',
            padding: 8,
            borderWidth: 0.5,
            borderColor: colors.lightGrayColor
        } }, { children: [_jsx(View, Object.assign({ style: styles.photoImgCont }, { children: _jsxs(TouchableOpacity, Object.assign({ style: styles.videoWrapper, onPress: handleVideoPress, activeOpacity: 0.9 }, { children: [isLoading && (_jsx(View, Object.assign({ style: [StyleSheet.absoluteFill, { zIndex: 1 }] }, { children: _jsx(ShimmerEffect, { width: "100%", height: "100%", borderRadius: 8 }) }))), _jsx(Video, { source: { uri: videoUri }, style: { width: '100%', height: '100%' }, controls: isPlaying, resizeMode: "cover", poster: "placeholder-image-url" // Add a placeholder image URL
                            , posterResizeMode: "cover", repeat: false, paused: !isPlaying, onLoad: () => setIsLoading(false), onError: () => setIsLoading(false) }), !isPlaying && (_jsx(View, Object.assign({ style: styles.playButtonOverlay }, { children: _jsx(View, Object.assign({ style: styles.playButton }, { children: _jsx(Icons.PlayCricle, { width: 32, height: 32 }) })) })))] })) })), _jsxs(TouchableOpacity, Object.assign({ activeOpacity: 0.8, onPress: onPressVideo }, { children: [_jsx(SizeBox, { height: 8 }), _jsx(Text, Object.assign({ style: [styles.downloadCount, { fontWeight: '400' }], numberOfLines: 1 }, { children: event })), _jsx(SizeBox, { height: 4 }), _jsxs(View, Object.assign({ style: styles.row }, { children: [_jsxs(View, Object.assign({ style: styles.row }, { children: [_jsx(Icons.Map, { height: 16, width: 16 }), _jsx(SizeBox, { width: 4 }), _jsx(Text, Object.assign({ style: styles.subText }, { children: CompetitionName }))] })), _jsx(SizeBox, { width: 4 }), _jsx(View, { style: styles.dot }), _jsx(SizeBox, { width: 4 }), _jsxs(View, Object.assign({ style: styles.row }, { children: [_jsx(Icons.Timer, { height: 16, width: 16 }), _jsx(SizeBox, { width: 4 }), _jsx(Text, Object.assign({ style: styles.subText }, { children: timer }))] }))] })), _jsx(TouchableOpacity, Object.assign({ style: [styles.btnRight, { bottom: 20, right: 0 }] }, { children: _jsx(Icons.Download, { height: 20, width: 20 }) }))] }))] })));
};
export default VideoContainer;
