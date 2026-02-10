import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Video from 'react-native-video';
import FastImage from 'react-native-fast-image';
import {
    ArrowLeft2,
    Calendar,
    Location,
    Clock,
} from 'iconsax-react-nativejs';
import Styles from './VideoEditRequestsScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Colors from '../../constants/Colors';
import Icons from '../../constants/Icons';
import Images from '../../constants/Images';
import ShimmerEffect from '../../components/shimmerEffect/ShimmerEffect';

const VideoEditRequestsScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const videoData = {
        title: 'BK Studentent 23',
        location: 'Berlin, Germany',
        duration: '2 Minutes',
        date: '27.5.2025',
        videoUri: 'https://awssportreels.s3.eu-central-1.amazonaws.com/PK-800m.mp4',
    };

    const handleVideoPress = () => {
        setIsPlaying(!isPlaying);
    };

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={20} color={Colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Video Details</Text>
                <TouchableOpacity
                    style={Styles.notificationButton}
                    onPress={() => navigation.navigate('NotificationsScreen')}
                >
                    <Icons.NotificationBoldBlue height={24} width={24} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {/* Video Player */}
                <TouchableOpacity
                    style={Styles.videoContainer}
                    onPress={handleVideoPress}
                    activeOpacity={0.9}
                >
                    {isPlaying ? (
                        <>
                            {isLoading && (
                                <View style={[StyleSheet.absoluteFill, { zIndex: 1 }]}>
                                    <ShimmerEffect
                                        width="100%"
                                        height="100%"
                                        borderRadius={10}
                                    />
                                </View>
                            )}
                            <Video
                                source={{ uri: videoData.videoUri }}
                                style={Styles.videoPlayer}
                                controls={true}
                                resizeMode="cover"
                                repeat={false}
                                paused={false}
                                onLoad={() => setIsLoading(false)}
                                onError={() => setIsLoading(false)}
                            />
                        </>
                    ) : (
                        <>
                            <FastImage
                                source={Images.photo7}
                                style={Styles.videoPlayer}
                                resizeMode="cover"
                            />
                            <View style={Styles.playButtonOverlay}>
                                <Icons.PlayCricle height={34} width={34} />
                            </View>
                        </>
                    )}
                </TouchableOpacity>

                {/* Video Info */}
                <View style={Styles.videoInfo}>
                    <View style={Styles.videoInfoRow}>
                        <Text style={Styles.videoTitle}>{videoData.title}</Text>
                        <View style={Styles.locationContainer}>
                            <Location size={16} color="#9B9F9F" variant="Linear" />
                            <Text style={Styles.locationText}>{videoData.location}</Text>
                        </View>
                    </View>
                    <View style={Styles.videoInfoRow}>
                        <View style={Styles.durationContainer}>
                            <Clock size={16} color="#9B9F9F" variant="Linear" />
                            <Text style={Styles.durationText}>{videoData.duration}</Text>
                        </View>
                        <View style={Styles.dateContainer}>
                            <Calendar size={16} color="#9B9F9F" variant="Linear" />
                            <Text style={Styles.dateText}>{videoData.date}</Text>
                        </View>
                    </View>
                </View>

                {/* Request for Edits Section */}
                <Text style={Styles.sectionTitle}>Request for Edits</Text>
                <SizeBox height={16} />

                {/* Empty State */}
                <View style={Styles.emptyStateContainer}>
                    <Icons.FileEmptyColorful height={147} width={143} />
                    <SizeBox height={16} />
                    <Text style={Styles.emptyStateText}>No edit request found</Text>
                </View>

                <SizeBox height={40} />
            </ScrollView>
        </View>
    );
};

export default VideoEditRequestsScreen;
