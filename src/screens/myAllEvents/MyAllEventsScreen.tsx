import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import {
    ArrowLeft2,
    Calendar,
    Location,
    VideoSquare,
} from 'iconsax-react-nativejs';
import Styles from './MyAllEventsScreenStyles';
import SizeBox from '../../constants/SizeBox';
import Images from '../../constants/Images';
import Colors from '../../constants/Colors';
import Icons from '../../constants/Icons';

const MyAllEventsScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();

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
        {
            id: 3,
            title: 'BK Studentent 23',
            videos: '254 Videos',
            location: 'Berlin, Germany',
            date: '27.5.2025',
            thumbnail: Images.photo4,
        },
        {
            id: 4,
            title: 'BK Studentent 23',
            videos: '254 Videos',
            location: 'Berlin, Germany',
            date: '27.5.2025',
            thumbnail: Images.photo5,
        },
    ];

    const renderMyEventCard = (item: any) => (
        <View key={item.id} style={Styles.myEventCard}>
            <FastImage source={item.thumbnail} style={Styles.squareThumbnail} resizeMode="cover" />
            <View style={Styles.cardInfo}>
                <View style={Styles.eventTitleRow}>
                    <Text style={Styles.cardTitle}>{item.title}</Text>
                    <View style={Styles.videosCount}>
                        <VideoSquare size={16} color="#9B9F9F" variant="Linear" />
                        <Text style={Styles.detailText}>{item.videos}</Text>
                    </View>
                </View>
                <View style={Styles.detailRow}>
                    <Text style={Styles.detailLabel}>Location</Text>
                    <View style={Styles.detailValue}>
                        <Location size={16} color="#9B9F9F" variant="Linear" />
                        <Text style={Styles.detailText}>{item.location}</Text>
                    </View>
                </View>
                <View style={Styles.detailRow}>
                    <Text style={Styles.detailLabel}>Date</Text>
                    <View style={Styles.detailValue}>
                        <Calendar size={16} color="#9B9F9F" variant="Linear" />
                        <Text style={Styles.detailText}>{item.date}</Text>
                    </View>
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
                    <ArrowLeft2 size={20} color={Colors.mainTextColor} variant="Linear" />
                </TouchableOpacity>
                <Text style={Styles.headerTitle}>My All Events</Text>
                <TouchableOpacity
                    style={Styles.notificationButton}
                    onPress={() => navigation.navigate('NotificationsScreen')}
                >
                    <Icons.NotificationBoldBlue height={24} width={24} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={Styles.scrollContent}>
                {/* My All Events Section */}
                <View style={Styles.sectionHeader}>
                    <Text style={Styles.sectionTitle}>My All Events</Text>
                    <TouchableOpacity>
                        <Text style={Styles.viewAllText}>View all</Text>
                    </TouchableOpacity>
                </View>

                {myEvents.map(renderMyEventCard)}

                <TouchableOpacity style={Styles.primaryButton}>
                    <Text style={Styles.primaryButtonText}>Add Myself To Events</Text>
                    <Icons.RightBtnIcon height={18} width={18} />
                </TouchableOpacity>

                <SizeBox height={20} />
            </ScrollView>
        </View>
    );
};

export default MyAllEventsScreen;
