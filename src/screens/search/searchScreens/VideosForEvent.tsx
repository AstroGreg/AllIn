import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native'
import React, { useMemo } from 'react'
import Styles from '../SearchStyles'
import CustomHeader from '../../../components/customHeader/CustomHeader'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Icons from '../../../constants/Icons'

const VideosForEvent = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const eventName = route?.params?.eventName || 'Event';
    const division = route?.params?.division;
    const gender = route?.params?.gender;

    const data = useMemo(() => ([
        {
            id: 1,
            name: 'Passionate',
            event: eventName,
            videoUri: 'https://awssportreels.s3.eu-central-1.amazonaws.com/BK-2024.mp4',
            timer: '2300',
            thumbnail: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
        },
        {
            id: 2,
            name: 'Passionate',
            event: eventName,
            videoUri: 'https://awssportreels.s3.eu-central-1.amazonaws.com/BK+studenten+2023.MP4',
            timer: '2300',
            thumbnail: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
        },
        {
            id: 3,
            name: 'Passionate',
            event: eventName,
            videoUri: 'https://awssportreels.s3.eu-central-1.amazonaws.com/PK-800m.mp4',
            timer: '2300',
            thumbnail: 'https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=1200&q=80',
        },
    ]), [eventName]);

    const renderItem = ({ item }: any) => {
        return (
            <View style={[Styles.borderBox, { marginBottom: 24 }]}>
                <Text style={Styles.subText}>{item.event}</Text>
                <SizeBox height={16} />
                <View style={[Styles.row, Styles.spaceBetween]}>
                    <Text style={Styles.subText}>Author: {item.name}</Text>
                    <Text style={Styles.subText}>5:06 Mins</Text>
                    <Text style={Styles.subText}>5k Views</Text>
                </View>
                <SizeBox height={12} />
                <TouchableOpacity
                    onPress={() => navigation.navigate('PhotoDetailScreen', {
                        eventTitle: eventName,
                        media: {
                            type: 'video',
                            title: eventName,
                            thumbnailUrl: item.thumbnail,
                            previewUrl: item.videoUri,
                            originalUrl: item.videoUri,
                            fullUrl: item.videoUri,
                        },
                    })}
                    style={{ position: 'relative' }}
                >
                    <Image source={{ uri: item.thumbnail }} style={{ width: '100%', height: 150, borderRadius: 8 }} />
                    <View style={{ position: 'absolute', right: 12, bottom: 12 }}>
                        <Icons.PlayCricle height={28} width={28} />
                    </View>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <CustomHeader title='Video' onBackPress={() => navigation.goBack()} onPressSetting={() => navigation.navigate('ProfileSettings')} />

            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <>
                        <SizeBox height={24} />
                        <View style={{ marginHorizontal: 20 }}>
                            <Text style={Styles.titleText}>{eventName}</Text>
                            <SizeBox height={2} />
                            <Text style={Styles.filterText}>
                                {[eventName, division, gender].filter(Boolean).join(' • ')}
                            </Text>
                            <SizeBox height={10} />
                            <View style={Styles.separator} />
                        </View>
                        <SizeBox height={27} />
                    </>
                }
            />
        </View>
    )
}

export default VideosForEvent
