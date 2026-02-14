import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { ArrowLeft2, User, Clock } from 'iconsax-react-nativejs';
import { createStyles } from './ViewUserCollectionsVideosScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Images from '../../constants/Images';
import Icons from '../../constants/Icons';
import { useTheme } from '../../context/ThemeContext';

const ViewUserCollectionsVideosScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const [activeTab, setActiveTab] = useState('videos');

    const photos = [
        Images.photo1, Images.photo3, Images.photo4, Images.photo5,
        Images.photo1, Images.photo3, Images.photo4, Images.photo5,
        Images.photo1, Images.photo3, Images.photo4, Images.photo5,
        Images.photo1, Images.photo3, Images.photo4, Images.photo5,
        Images.photo1, Images.photo3, Images.photo4, Images.photo5,
    ];

    const videos = [
        { id: 1, thumbnail: Images.photo1, title: '17:45 / MIN-M (Series)', author: 'Smith', duration: '5:06 mins' },
        { id: 2, thumbnail: Images.photo3, title: '17:45 / MIN-M (Series)', author: 'Smith', duration: '5:06 mins' },
        { id: 3, thumbnail: Images.photo1, title: '17:45 / MIN-M (Series)', author: 'Smith', duration: '5:06 mins' },
        { id: 4, thumbnail: Images.photo3, title: '17:45 / MIN-M (Series)', author: 'Smith', duration: '5:06 mins' },
        { id: 5, thumbnail: Images.photo1, title: '17:45 / MIN-M (Series)', author: 'Smith', duration: '5:06 mins' },
        { id: 6, thumbnail: Images.photo3, title: '17:45 / MIN-M (Series)', author: 'Smith', duration: '5:06 mins' },
    ];

    const renderVideoCard = (video: any) => (
        <TouchableOpacity
            key={video.id}
            style={Styles.videoCard}
            onPress={() => navigation.navigate('VideoPlayingScreen', {
                video: {
                    title: 'BK Studenten 2023',
                    subtitle: video.title,
                    thumbnail: video.thumbnail,
                }
            })}
        >
            <View style={Styles.thumbnailContainer}>
                <FastImage source={video.thumbnail} style={Styles.thumbnail} resizeMode="cover" />
                <View style={Styles.playIconContainer}>
                    <Icons.PlayCricle width={26} height={26} />
                </View>
            </View>
            <Text style={Styles.videoTitle}>{video.title}</Text>
            <View style={Styles.videoMeta}>
                <View style={Styles.metaItem}>
                    <User size={14} color={colors.subTextColor} variant="Linear" />
                    <Text style={Styles.metaText}>{video.author}</Text>
                </View>
                <View style={Styles.metaItem}>
                    <Clock size={14} color={colors.subTextColor} variant="Linear" />
                    <Text style={Styles.metaText}>{video.duration}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.headerButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Collections</Text>
                <View style={[Styles.headerButton, { opacity: 0 }]} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {/* Section Header */}
                <View style={Styles.sectionHeader}>
                    <Text style={Styles.sectionTitle}>Collections</Text>
                    <View style={Styles.videosCountBadge}>
                        <Text style={Styles.videosCountText}>
                            {activeTab === 'photos' ? `${photos.length} photos` : `${videos.length} videos`}
                        </Text>
                    </View>
                </View>

                <SizeBox height={16} />

                {/* Toggle */}
                <View style={Styles.toggleContainer}>
                    <TouchableOpacity
                        style={[Styles.toggleButton, activeTab === 'photos' && Styles.toggleButtonActive]}
                        onPress={() => setActiveTab('photos')}
                    >
                        <Text style={activeTab === 'photos' ? Styles.toggleTextActive : Styles.toggleText}>Photos</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[Styles.toggleButton, activeTab === 'videos' && Styles.toggleButtonActive]}
                        onPress={() => setActiveTab('videos')}
                    >
                        <Text style={activeTab === 'videos' ? Styles.toggleTextActive : Styles.toggleText}>Videos</Text>
                    </TouchableOpacity>
                </View>

                <SizeBox height={16} />

                {/* Content Grid */}
                {activeTab === 'photos' ? (
                    <View style={Styles.photosCard}>
                        <View style={Styles.photosGrid}>
                            {photos.map((photo, index) => (
                                <TouchableOpacity
                                    key={index}
                                    activeOpacity={0.85}
                                    onPress={() => navigation.navigate('PhotoDetailScreen', {
                                        eventTitle: 'Collections',
                                        media: {
                                            id: '87873d40-addf-4289-aa82-7cd300acdd94',
                                            type: 'photo',
                                        },
                                    })}
                                >
                                    <FastImage
                                        source={photo}
                                        style={Styles.photoImage}
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ) : (
                    <View style={Styles.videosGrid}>
                        {videos.map(renderVideoCard)}
                    </View>
                )}

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    );
};

export default ViewUserCollectionsVideosScreen;
