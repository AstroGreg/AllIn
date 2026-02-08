import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import {
    ArrowLeft2,
    ArrowDown,
    Calendar,
    Map1,
    Location,
    VideoSquare,
    Eye,
    DocumentDownload,
} from 'iconsax-react-nativejs';
import { createStyles } from './HubScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Images from '../../constants/Images';
import Icons from '../../constants/Icons';
import { useTheme } from '../../context/ThemeContext';

const HubScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);

    const appearances = [
        {
            id: 1,
            title: 'BK Studentent 23',
            distance: '800m heat 1',
            location: 'Dhaka',
            date: '27/05/2025',
            thumbnail: Images.photo1,
        },
        {
            id: 2,
            title: 'BK Studentent 23',
            distance: '800m heat 1',
            location: 'Dhaka',
            date: '27/05/2025',
            thumbnail: Images.photo3,
        },
    ];

    const myEvents = [
        {
            id: 1,
            title: 'BK Studentent 23',
            videos: '254 Videos',
            location: 'Berlin, Germany',
            date: '27.5.2025',
            thumbnail: Images.photo4,
        },
        {
            id: 2,
            title: 'BK Studentent 23',
            videos: '254 Videos',
            location: 'Berlin, Germany',
            date: '27.5.2025',
            thumbnail: Images.photo5,
        },
    ];

    const renderAppearanceCard = (item: any) => (
        <View key={item.id} style={Styles.appearanceCard}>
            <View style={Styles.cardRow}>
                <FastImage source={item.thumbnail} style={Styles.squareThumbnail} resizeMode="cover" />
                <View style={Styles.cardInfo}>
	                    <View style={Styles.titleRow}>
	                        <View style={Styles.playIconCircle}>
	                            <Calendar size={12} color={colors.pureWhite} variant="Linear" />
	                        </View>
	                        <Text style={Styles.cardTitle}>{item.title}</Text>
	                    </View>
                    <View style={Styles.detailRow}>
                        <Text style={Styles.detailLabel}>Distance</Text>
                        <View style={Styles.detailValue}>
	                            <Map1 size={16} color={colors.grayColor} variant="Linear" />
	                            <Text style={Styles.detailText}>{item.distance}</Text>
	                        </View>
	                    </View>
                    <View style={Styles.detailRow}>
                        <Text style={Styles.detailLabel}>Location</Text>
                        <View style={Styles.detailValue}>
	                            <Location size={16} color={colors.grayColor} variant="Linear" />
	                            <Text style={Styles.detailText}>{item.location}</Text>
	                        </View>
	                    </View>
                    <View style={Styles.detailRow}>
                        <Text style={Styles.detailLabel}>Date</Text>
                        <View style={Styles.detailValue}>
	                            <Calendar size={16} color={colors.grayColor} variant="Linear" />
	                            <Text style={Styles.detailText}>{item.date}</Text>
	                        </View>
	                    </View>
                </View>
            </View>
            <View style={Styles.divider} />
            <TouchableOpacity
                style={Styles.viewButton}
                onPress={() => navigation.navigate('CompetitionsScreen')}
            >
                <Text style={Styles.viewButtonText}>View</Text>
                <Icons.RightBtnIcon height={18} width={18} />
            </TouchableOpacity>
        </View>
    );

    const renderMyEventCard = (item: any) => (
        <View key={item.id} style={Styles.myEventCard}>
            <FastImage source={item.thumbnail} style={Styles.squareThumbnail} resizeMode="cover" />
            <View style={Styles.cardInfo}>
                <View style={Styles.eventTitleRow}>
                    <Text style={Styles.cardTitle}>{item.title}</Text>
                    <View style={Styles.videosCount}>
	                        <VideoSquare size={16} color={colors.grayColor} variant="Linear" />
	                        <Text style={Styles.detailText}>{item.videos}</Text>
	                    </View>
                </View>
                <View style={Styles.detailRow}>
                    <Text style={Styles.detailLabel}>Location</Text>
                    <View style={Styles.detailValue}>
	                        <Location size={16} color={colors.grayColor} variant="Linear" />
	                        <Text style={Styles.detailText}>{item.location}</Text>
	                    </View>
                </View>
                <View style={Styles.detailRow}>
                    <Text style={Styles.detailLabel}>Date</Text>
                    <View style={Styles.detailValue}>
	                        <Calendar size={16} color={colors.grayColor} variant="Linear" />
	                        <Text style={Styles.detailText}>{item.date}</Text>
	                    </View>
                </View>
            </View>
        </View>
    );

    const renderCreatedEventCard = (item: any) => (
        <TouchableOpacity
            key={item.id}
            style={Styles.videoCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('EventDetailsScreen')}
        >
            <View style={Styles.videoThumbnailWrapper}>
                <FastImage source={item.thumbnail} style={Styles.videoThumbnail} resizeMode="cover" />
            </View>
            <View style={Styles.videoInfo}>
                <View style={Styles.requestBadgeSmall}>
                    <Icons.BellColorful height={16} width={16} />
                    <Text style={Styles.requestBadgeText}>{item.requestedChanges} Times Requested Changes</Text>
                </View>
                <View style={Styles.eventTitleRow}>
                    <Text style={Styles.cardTitle}>{item.title}</Text>
                    <View style={Styles.videosCount}>
	                        <VideoSquare size={16} color={colors.grayColor} variant="Linear" />
	                        <Text style={Styles.detailText}>{item.videos}</Text>
	                    </View>
                </View>
                <View style={Styles.detailRow}>
                    <Text style={Styles.detailLabel}>Location</Text>
                    <View style={Styles.detailValue}>
	                        <Location size={16} color={colors.grayColor} variant="Linear" />
	                        <Text style={Styles.detailText}>{item.location}</Text>
	                    </View>
                </View>
                <View style={Styles.detailRow}>
                    <Text style={Styles.detailLabel}>Date</Text>
                    <View style={Styles.detailValue}>
	                        <Calendar size={16} color={colors.grayColor} variant="Linear" />
	                        <Text style={Styles.detailText}>{item.date}</Text>
	                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderVideoCard = () => (
        <TouchableOpacity
            style={Styles.videoCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('VideoDetailsScreen')}
        >
            <View style={Styles.videoThumbnailWrapper}>
                <FastImage source={Images.photo7} style={Styles.videoThumbnail} resizeMode="cover" />
                <View style={Styles.videoPlayButton}>
                    <Icons.PlayBlue height={20} width={20} />
                </View>
            </View>
            <View style={Styles.videoInfo}>
                <View style={Styles.requestBadgeSmall}>
                    <Icons.BellColorful height={16} width={16} />
                    <Text style={Styles.requestBadgeText}>3 Times Requested Changes</Text>
                </View>
                <Text style={Styles.videoTitle}>PK 2025 indoor</Text>
                <View style={Styles.videoMeta}>
                    <View style={Styles.videoMetaItem}>
	                        <Map1 size={16} color={colors.grayColor} variant="Linear" />
	                        <Text style={Styles.detailText}>800m heat 1</Text>
	                    </View>
                    <View style={Styles.videoMetaDot} />
                    <View style={Styles.videoMetaItem}>
	                        <Eye size={16} color={colors.grayColor} variant="Linear" />
	                        <Text style={Styles.detailText}>2300</Text>
	                    </View>
	                </View>
	                <TouchableOpacity style={Styles.downloadButton}>
	                    <Text style={Styles.downloadButtonText}>Download</Text>
	                    <ArrowDown size={18} color={colors.pureWhite} variant="Linear" />
	                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            {/* Header */}
            <View style={Styles.header}>
                <TouchableOpacity style={Styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeft2 size={20} color={colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>Hub</Text>
                <View style={{ width: 44, height: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {/* My Appearances Section */}
                <Text style={Styles.sectionTitle}>My Appearances</Text>
                <SizeBox height={16} />
                {appearances.map(renderAppearanceCard)}

                <TouchableOpacity
                    style={Styles.primaryButton}
                    onPress={() => navigation.navigate('AllPhotosOfEvents')}
                >
                    <Text style={Styles.primaryButtonText}>View All</Text>
                    <Icons.RightBtnIcon height={18} width={18} />
                </TouchableOpacity>

                {/* My Events Section */}
                <View style={Styles.sectionHeader}>
                    <Text style={Styles.sectionTitle}>My Events</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('MyAllEventsScreen')}>
                        <Text style={Styles.viewAllText}>View all</Text>
                    </TouchableOpacity>
                </View>
                {myEvents.map(renderMyEventCard)}

                <TouchableOpacity
                    style={Styles.primaryButton}
                    onPress={() => navigation.navigate('AvailableEventsScreen')}
                >
                    <Text style={Styles.primaryButtonText}>Add Myself To Events</Text>
                    <Icons.RightBtnIcon height={18} width={18} />
                </TouchableOpacity>

                {/* My Downloads Section */}
                <Text style={Styles.sectionTitle}>My Downloads</Text>
                <SizeBox height={16} />
                <View style={Styles.downloadsCard}>
                    <View style={Styles.downloadsInfo}>
                        <Icons.Downloads height={24} width={24} />
                        <Text style={Styles.downloadsText}>Total Downloads: </Text>
                        <Text style={Styles.downloadsNumber}>346,456</Text>
                    </View>
                    <TouchableOpacity style={Styles.detailsButton}>
                        <Text style={Styles.detailsButtonText}>Details</Text>
                        <Icons.RightBtnIconGrey height={14} width={14} />
                    </TouchableOpacity>
                </View>

	                <TouchableOpacity style={Styles.primaryButton}>
	                    <Text style={Styles.primaryButtonText}>Redownload All Images</Text>
	                    <DocumentDownload size={18} color={colors.pureWhite} variant="Linear" />
	                </TouchableOpacity>

                {/* Created Events & Videos Section */}
                <View style={Styles.sectionHeader}>
                    <Text style={Styles.sectionTitle}>Created Events & Videos</Text>
                    <TouchableOpacity>
                        <Text style={Styles.viewAllText}>View all</Text>
                    </TouchableOpacity>
                </View>

                {renderCreatedEventCard({
                    id: 1,
                    title: 'BK Studentent 23',
                    videos: '254 Videos',
                    location: 'Berlin, Germany',
                    date: '27.5.2025',
                    thumbnail: Images.photo6,
                    requestedChanges: 3,
                })}

                {renderVideoCard()}

                <SizeBox height={20} />
            </ScrollView>
        </View>
    );
};

export default HubScreen;
