import { View, Text, Dimensions, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import Styles from '../ViewUserProfileStyles';
import Colors from '../../../constants/Colors';
import SizeBox from '../../../constants/SizeBox';
import Icons from '../../../constants/Icons';
import Video from 'react-native-video';
import ShimmerEffect from '../../../components/shimmerEffect/ShimmerEffect';


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
            borderColor: Colors.lightGrayColor
        }}>
            <View style={Styles.photoImgCont}>
                <TouchableOpacity
                    style={Styles.videoWrapper}
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
                        <View style={Styles.playButtonOverlay}>
                            <View style={Styles.playButton}>
                                <Icons.PlayCricle width={32} height={32} />
                            </View>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <TouchableOpacity activeOpacity={0.8} onPress={onPressVideo}>
                <SizeBox height={8} />
                <Text style={[Styles.downloadCount, { fontWeight: '400' }]} numberOfLines={1}>{event}</Text>
                <SizeBox height={4} />


                <View style={Styles.row}>
                    <View style={Styles.row}>
                        <Icons.Map height={16} width={16} />
                        <SizeBox width={4} />
                        <Text style={Styles.subText}>{CompetitionName}</Text>
                    </View>
                    <SizeBox width={4} />
                    <View style={Styles.dot} />
                    <SizeBox width={4} />
                    <View style={Styles.row}>
                        <Icons.Timer height={16} width={16} />
                        <SizeBox width={4} />
                        <Text style={Styles.subText}>{timer}</Text>
                    </View>
                </View>

                <TouchableOpacity style={[Styles.btnRight, { bottom: 20, right: 0 }]}>
                    <Icons.Download height={20} width={20} />
                </TouchableOpacity>
            </TouchableOpacity>
        </View>
    )
}

export default VideoContainer
