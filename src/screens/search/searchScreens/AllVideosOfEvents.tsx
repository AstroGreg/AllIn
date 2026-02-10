import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native'
import React, { useMemo } from 'react'
import Styles from '../SearchStyles'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import CustomHeader from '../../../components/customHeader/CustomHeader'
import Icons from '../../../constants/Icons'

const AllVideosOfEvents = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const eventName = route?.params?.eventName || 'Event';
    const division = route?.params?.division;
    const gender = route?.params?.gender;

    const formatDuration = (value?: string) => {
        const totalSeconds = Number.parseInt(String(value ?? '0'), 10);
        if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return '—';
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const paddedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
        if (hours > 0) {
            const paddedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
            return `${hours}:${paddedMinutes}:${paddedSeconds}`;
        }
        return `${minutes}:${paddedSeconds}`;
    };

    const formatDate = (value?: string) => {
        if (!value) return '—';
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return value;
        return parsed.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const data = useMemo(() => ([
        {
            id: 1,
            name: 'Passionate',
            event: eventName,
            videoUri: 'https://awssportreels.s3.eu-central-1.amazonaws.com/BK-2024.mp4',
            thumbnailUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
            uploadedAt: '2026-02-05',
            timer: '2300',
        },
        {
            id: 2,
            name: 'Passionate',
            event: eventName,
            videoUri: 'https://awssportreels.s3.eu-central-1.amazonaws.com/BK+studenten+2023.MP4',
            thumbnailUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
            uploadedAt: '2026-02-02',
            timer: '2300',
        },
        {
            id: 3,
            name: 'Passionate',
            event: eventName,
            videoUri: 'https://awssportreels.s3.eu-central-1.amazonaws.com/PK-800m.mp4',
            thumbnailUrl: 'https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=800&q=80',
            uploadedAt: '2026-01-29',
            timer: '2300',
        },
    ]), [eventName]);

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <CustomHeader
                title='All Videos'
                onBackPress={() => navigation.goBack()}
            />
            <FlatList
                data={data}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        activeOpacity={0.9}
                        style={{
                            marginHorizontal: 20,
                            marginBottom: 16,
                            borderRadius: 14,
                            overflow: 'hidden',
                            backgroundColor: '#FFFFFF',
                            borderWidth: 1,
                            borderColor: '#E8ECF2',
                        }}
                        onPress={() => navigation.navigate('PhotoDetailScreen', {
                            eventTitle: eventName,
                            media: {
                                type: 'video',
                                title: eventName,
                                thumbnailUrl: item.thumbnailUrl,
                                previewUrl: item.videoUri,
                                originalUrl: item.videoUri,
                                fullUrl: item.videoUri,
                            },
                        })}
                    >
                        <Image
                            source={{ uri: item.thumbnailUrl }}
                            style={{ width: '100%', height: 180 }}
                            resizeMode="cover"
                        />
                        <View style={{ position: 'absolute', top: 0, right: 0, height: 180, left: 0, alignItems: 'center', justifyContent: 'center' }}>
                            <View style={{ backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 30, padding: 10 }}>
                                <Icons.PlayCricle width={38} height={38} />
                            </View>
                        </View>
                        <View style={{ paddingHorizontal: 14, paddingVertical: 12 }}>
                            <Text style={[Styles.titleText, { fontSize: 16 }]} numberOfLines={1}>{eventName}</Text>
                            <SizeBox height={6} />
                            <Text style={Styles.subText} numberOfLines={1}>
                                By {item.name} • {formatDuration(item.timer)}
                            </Text>
                            <SizeBox height={4} />
                            <Text style={Styles.subText} numberOfLines={1}>
                                Uploaded {formatDate(item.uploadedAt)}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={{
                    paddingTop: 20,
                    paddingBottom: 10,
                }}
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
                ListHeaderComponent={
                    <View style={{ marginLeft: 20 }}>
                        <Text style={Styles.titleText}>{eventName}</Text>
                        {(division || gender) && (
                            <>
                                <SizeBox height={6} />
                                <Text style={Styles.filterText}>{[division, gender].filter(Boolean).join(' • ')}</Text>
                            </>
                        )}
                        <SizeBox height={16} />
                    </View>
                }
                ListFooterComponent={<SizeBox height={30} />}
            />
        </View>
    )
}

export default AllVideosOfEvents
