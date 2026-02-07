import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import {
    ArrowLeft2,
    ArrowRight,
    Image,
} from 'iconsax-react-nativejs';
import Styles from './VideosScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Colors from '../../constants/Colors';
import Images from '../../constants/Images';
import Icons from '../../constants/Icons';

const VideosScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const eventTitle = route?.params?.eventTitle || 'BK Studentent 23';

    const videos = [
        { id: 1, price: '€0,10', resolution: '720p', thumbnail: Images.photo1 },
        { id: 2, price: '€0,10', resolution: '1080p', thumbnail: Images.photo7 },
        { id: 3, price: '€0,10', resolution: '1920p', thumbnail: Images.photo3 },
        { id: 4, price: '€0,10', resolution: '2160p', thumbnail: Images.photo4 },
        { id: 5, price: '€0,10', resolution: '720p', thumbnail: Images.photo5 },
        { id: 6, price: '€0,10', resolution: '720p', thumbnail: Images.photo6 },
    ];

    const renderVideoCard = (video: any) => (
        <View key={video.id} style={Styles.videoCard}>
            <TouchableOpacity
                style={Styles.videoThumbnailContainer}
                onPress={() => navigation.navigate('VideoPlayingScreen', {
                    video: {
                        title: 'PK 800m 2023 indoor',
                        subtitle: 'Senioren, Heat 1',
                        thumbnail: video.thumbnail,
                    },
                })}
            >
                <FastImage
                    source={video.thumbnail}
                    style={Styles.videoThumbnail}
                    resizeMode="cover"
                />
                <View style={Styles.playIconContainer}>
                    <Icons.PlayBlue width={16} height={16} />
                </View>
            </TouchableOpacity>
            <View style={Styles.videoInfo}>
                <View style={Styles.videoLeftInfo}>
                    <Text style={Styles.videoPrice}>{video.price}</Text>
                    <TouchableOpacity
                        style={Styles.viewButton}
                        onPress={() => navigation.navigate('VideoPlayingScreen', {
                            video: {
                                title: 'PK 800m 2023 Indoor',
                                subtitle: 'Senioren, Heat 1',
                                thumbnail: video.thumbnail,
                                price: video.price,
                            },
                            showBuyModal: true,
                        })}
                    >
                        <Text style={Styles.viewButtonText}>View</Text>
                        <ArrowRight size={12} color={Colors.whiteColor} variant="Linear" />
                    </TouchableOpacity>
                </View>
                <View style={Styles.videoRightInfo}>
                    <Text style={Styles.videoResolution}>{video.resolution}</Text>
                    <TouchableOpacity>
                        <Icons.DownloadBlue height={16} width={16} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={24} color={Colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>{eventTitle}</Text>
                <TouchableOpacity
                    style={Styles.imageButton}
                    onPress={() => navigation.goBack()}
                >
                    <Image size={24} color={Colors.primaryColor} variant="Bold" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {/* Videos Header */}
                <View style={Styles.videosHeader}>
                    <Text style={Styles.videosLabel}>Videos</Text>
                    <TouchableOpacity style={Styles.downloadAllButton}>
                        <Text style={Styles.downloadAllText}>Download All</Text>
                    </TouchableOpacity>
                </View>

                <SizeBox height={16} />

                {/* Info Card */}
                <View style={Styles.infoCard}>
                    <Icons.LightbulbColorful height={30} width={30} />
                    <Text style={Styles.infoText}>
                        These videos were found based on the competitions you subscribed to.
                    </Text>
                </View>

                <SizeBox height={24} />

                {/* Videos Grid */}
                <View style={Styles.videosGrid}>
                    {videos.map(renderVideoCard)}
                </View>

                <SizeBox height={insets.bottom > 0 ? insets.bottom + 20 : 40} />
            </ScrollView>
        </View>
    );
};

export default VideosScreen;
