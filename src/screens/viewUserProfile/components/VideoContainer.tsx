import { View, Text, Dimensions, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { createStyles } from '../ViewUserProfileStyles';
import SizeBox from '../../../constants/SizeBox';
import Icons from '../../../constants/Icons';
import Video from 'react-native-video';
import ShimmerEffect from '../../../components/shimmerEffect/ShimmerEffect';
import { useTheme } from '../../../context/ThemeContext';


interface VideoContainerProps {
    onPressVideo?: any;
    videoUri?: any;
    CompetitionName?: string;
    event?: string;
    timer?: string;
}

const VideoContainer = ({ onPressVideo, videoUri, CompetitionName, event, timer }: VideoContainerProps) => {

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


    return (
        <View style={{
            width: containerWidth,
            marginLeft: spacing,
            marginBottom: 20,
            borderRadius: 10,
            overflow: 'hidden',
            padding: 8,
            borderWidth: 0.5,
            borderColor: colors.lightGrayColor
        }}>
            <View style={styles.photoImgCont}>
                <TouchableOpacity
                    style={styles.videoWrapper}
                    onPress={handleVideoPress}
                    activeOpacity={0.9}>
                    {isLoading && (
                        <View style={[StyleSheet.absoluteFill, { zIndex: 1 }]}>
                            <ShimmerEffect
                                width="100%"
                                height="100%"
                                borderRadius={8}
                            />
                        </View>
                    )}
                    <Video
                        source={{ uri: videoUri }}
                        style={{ width: '100%', height: '100%' }}
                        controls={isPlaying}
                        resizeMode="cover"
                        poster="placeholder-image-url" // Add a placeholder image URL
                        posterResizeMode="cover"
                        repeat={false}
                        paused={!isPlaying}
                        onLoad={() => setIsLoading(false)}
                        onError={() => setIsLoading(false)}
                    />
                    {!isPlaying && (
                        <View style={styles.playButtonOverlay}>
                            <View style={styles.playButton}>
                                <Icons.PlayCricle width={32} height={32} />
                            </View>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <TouchableOpacity activeOpacity={0.8} onPress={onPressVideo}>
                <SizeBox height={8} />
                <Text style={[styles.downloadCount, { fontWeight: '400' }]} numberOfLines={1}>{event}</Text>
                <SizeBox height={4} />


                <View style={styles.row}>
                    <View style={styles.row}>
                        <Icons.Map height={16} width={16} />
                        <SizeBox width={4} />
                        <Text style={styles.subText}>{CompetitionName}</Text>
                    </View>
                    <SizeBox width={4} />
                    <View style={styles.dot} />
                    <SizeBox width={4} />
                    <View style={styles.row}>
                        <Icons.Timer height={16} width={16} />
                        <SizeBox width={4} />
                        <Text style={styles.subText}>{timer}</Text>
                    </View>
                </View>

                <TouchableOpacity style={[styles.btnRight, { bottom: 20, right: 0 }]}>
                    <Icons.Download height={20} width={20} />
                </TouchableOpacity>
            </TouchableOpacity>
        </View>
    )
}

export default VideoContainer
