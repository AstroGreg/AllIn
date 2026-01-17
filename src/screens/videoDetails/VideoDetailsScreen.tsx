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
    Edit2,
    TickCircle,
    Refresh,
} from 'iconsax-react-nativejs';
import Styles from './VideoDetailsScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Colors from '../../constants/Colors';
import Icons from '../../constants/Icons';
import Images from '../../constants/Images';
import ShimmerEffect from '../../components/shimmerEffect/ShimmerEffect';

const VideoDetailsScreen = ({ navigation }: any) => {
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

    const editRequests = [
        {
            id: 1,
            title: 'Enhance Lighting & Colors',
            date: '12.12.2024',
            time: '12:00',
            status: 'fixed',
        },
        {
            id: 2,
            title: 'Remove Watermark/Text',
            date: '12.12.2024',
            time: '12:00',
            status: 'fixed',
        },
        {
            id: 3,
            title: 'Enhance Lighting & Colors',
            date: '12.12.2024',
            time: '12:00',
            status: 'pending',
        },
        {
            id: 4,
            title: 'Slow Motion Effect',
            date: '12.12.2024',
            time: '12:00',
            status: 'fixed',
        },
    ];

    const handleVideoPress = () => {
        setIsPlaying(!isPlaying);
    };

    const renderEditRequestCard = (item: any) => (
        <View key={item.id} style={Styles.editRequestCard}>
            <View style={Styles.editRequestHeader}>
                <View style={Styles.receiptIconContainer}>
                    <Icons.ReceiptEdit height={22} width={22} />
                </View>
                <TouchableOpacity style={Styles.editButton}>
                    <Edit2 size={12} color="#9B9F9F" variant="Linear" />
                    <Text style={Styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
            </View>
            <View style={Styles.editRequestContent}>
                <Text style={Styles.editRequestTitle}>{item.title}</Text>
                <View style={Styles.editRequestMeta}>
                    <View style={Styles.metaItem}>
                        <Calendar size={12} color="#9B9F9F" variant="Linear" />
                        <Text style={Styles.metaText}>{item.date}</Text>
                    </View>
                    <View style={Styles.metaItem}>
                        <Clock size={12} color="#9B9F9F" variant="Linear" />
                        <Text style={Styles.metaText}>{item.time}</Text>
                    </View>
                </View>
            </View>
            {item.status === 'fixed' ? (
                <View style={Styles.fixedBadge}>
                    <Text style={Styles.fixedBadgeText}>Fixed</Text>
                    <TickCircle size={14} color="#00BD48" variant="Linear" />
                </View>
            ) : (
                <View style={Styles.pendingBadge}>
                    <Text style={Styles.pendingBadgeText}>Pending</Text>
                    <Refresh size={14} color="#FF8000" variant="Linear" />
                </View>
            )}
        </View>
    );

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
                                <Icons.PlayWhite height={28} width={28} />
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

                <View style={Styles.receivedLabel}>
                    <Text style={Styles.receivedText}>Received</Text>
                </View>

                <SizeBox height={16} />

                {/* Edit Requests Grid */}
                <View style={Styles.editRequestsGrid}>
                    <View style={Styles.editRequestsRow}>
                        {editRequests.slice(0, 2).map(renderEditRequestCard)}
                    </View>
                    <View style={Styles.editRequestsRow}>
                        {editRequests.slice(2, 4).map(renderEditRequestCard)}
                    </View>
                </View>

                <SizeBox height={24} />

                {/* Edit Button */}
                <TouchableOpacity
                    style={Styles.primaryButton}
                    onPress={() => navigation.navigate('VideoEditRequestsScreen')}
                >
                    <Text style={Styles.primaryButtonText}>Edit</Text>
                    <Edit2 size={18} color={Colors.whiteColor} variant="Linear" />
                </TouchableOpacity>

                <SizeBox height={20} />
            </ScrollView>
        </View>
    );
};

export default VideoDetailsScreen;
