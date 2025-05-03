import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import Styles from '../HomeStyles'
import Icons from '../../../constants/Icons'
import SizeBox from '../../../constants/SizeBox'
import BorderButton from '../../../components/borderButton/BorderButton'
import Video from 'react-native-video'
import ActionBtn from './ActionBtn'
import ShimmerEffect from '../../../components/shimmerEffect/ShimmerEffect'

interface EventContainerProps {
    videoUri?: string;
    eventName?: string;
    map?: string;
    location?: string;
    date?: string;
    onPress?: any;
    isActions?: boolean;
    onPressContainer?: any;
}

const EventContainer = ({
    videoUri,
    eventName,
    map,
    location,
    date,
    onPress,
    isActions = false,
    onPressContainer
}: EventContainerProps) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleVideoPress = () => {
        setIsPlaying(!isPlaying);
    };

    return (
        <TouchableOpacity activeOpacity={0.7} style={Styles.eventContainer} onPress={onPressContainer}>
            <View style={Styles.VideoContainer}>
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
                                <Icons.Play width={40} height={40} />
                            </View>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
            <SizeBox height={11} />

            <View style={Styles.rowCenter}>
                <Icons.EventCalendar height={20} width={20} />
                <SizeBox width={6} />
                <Text numberOfLines={1} style={Styles.eventTitle} >{eventName}</Text>
            </View>

            <SizeBox height={6} />
            <View style={Styles.rowCenter}>
                <Icons.Map height={16} width={16} />
                <SizeBox width={6} />
                <Text numberOfLines={1} style={Styles.eventSubText}>{map}</Text>
            </View>

            <SizeBox height={6} />

            <View style={[Styles.rowCenter]}>
                <View style={[Styles.rowCenter, { width: '50%' }]}>
                    <Icons.Location height={16} width={16} />
                    <SizeBox width={6} />
                    <Text numberOfLines={1} style={Styles.eventSubText}>{location}</Text>
                </View>
                <View style={[Styles.rowCenter, { width: '50%' }]}>
                    <Icons.CalendarGrey height={16} width={16} />
                    <SizeBox width={6} />
                    <Text numberOfLines={1} style={Styles.eventSubText} >{date}</Text>
                </View>
            </View>

            <SizeBox height={12} />

            {isActions ?
                <View style={[Styles.rowCenter, { justifyContent: 'space-between' }]}>
                    <ActionBtn title='Edit' icon={<Icons.Edit height={14} width={14} />} />
                    <ActionBtn title='Delete' icon={<Icons.DeleteEvent height={14} width={14} />} />
                </View>
                : <BorderButton title='Participant' onPress={onPress} />}

        </TouchableOpacity>
    )
}

export default EventContainer