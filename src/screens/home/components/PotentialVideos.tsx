import { View, Text, FlatList, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import EventContainer from './EventContainer'
import SizeBox from '../../../constants/SizeBox'
import Styles from '../HomeStyles'
import CustomButton from '../../../components/customButton/CustomButton'
import Icons from '../../../constants/Icons'
import BorderButton from '../../../components/borderButton/BorderButton'
import RequestContainers from './RequestContainers'
import SimilarEvents from '../../Events/components/SimilarEvents'
import { useNavigation } from '@react-navigation/native';

interface PotentialVideosProps {
    data: any;
    onPressAddEvent: any;
    onPressParticipant: any;
    onPressDownloads: any;
    onPressContainer?: any;
}

const PotentialVideos = ({ data, onPressAddEvent, onPressParticipant, onPressDownloads, onPressContainer }: PotentialVideosProps,) => {
    const navigation: any = useNavigation();

    return (
        <View style={{}}>
            <FlatList
                data={data}
                renderItem={({ item }: any) =>
                    <EventContainer
                        videoUri={item.videoUri}
                        eventName={item.eventName}
                        map={item.map}
                        location={item.location}
                        date={item.date}
                        onPress={onPressParticipant}
                        onPressContainer={() => navigation.navigate('VideoScreen', {
                            videoUrl: item.videoUri
                        })}
                    />
                }
                style={{ paddingLeft: 20 }}
                keyExtractor={(item, index) => index.toString()}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
            />

            <SizeBox height={4} />

            <Text style={Styles.tabText}>Followers & Spotlight</Text>
            <SizeBox height={16} />
            <FlatList
                data={data}
                renderItem={({ item }: any) =>
                    <EventContainer
                        videoUri={item.videoUri}
                        eventName={item.eventName}
                        map={item.map}
                        location={item.location}
                        date={item.date}
                        onPress={onPressParticipant}
                        onPressContainer={() => navigation.navigate('VideoScreen', {
                            videoUrl: item.videoUri
                        })}
                    />
                }
                keyExtractor={(item, index) => index.toString()}
                horizontal={true}
                style={{ paddingLeft: 20 }}
                showsHorizontalScrollIndicator={false}
            />

            <Text style={Styles.headings}>My events</Text>
            <SizeBox height={12} />
            <SimilarEvents isSubscription={false} />

            <View style={{ marginHorizontal: 20 }}>
                <CustomButton title='Add Myself To Events' onPress={onPressAddEvent} />
            </View>
            <SizeBox height={20} />

            <Text style={Styles.headings}>Downloads</Text>
            <SizeBox height={12} />

            <View style={Styles.downloadContainer}>
                <Icons.Downloads height={22} width={22} />
                <View style={Styles.rowCenter}>
                    <Text style={Styles.downloadText}>
                        Total Downloads:
                    </Text>
                    <Text style={Styles.downloadCount}>
                        346,456
                    </Text>
                </View>
                <View style={Styles.btnRight}>
                    <BorderButton title='Details' onPress={onPressDownloads} />
                </View>
            </View>

            <SizeBox height={20} />
            <View style={Styles.rowCenter}>
                <Text style={Styles.headings}>Request for edits</Text>
                <TouchableOpacity style={[Styles.btnRight, { right: 20 }]}>
                    <Text style={[Styles.eventSubText, { width: '100%', }]}>View all</Text>
                </TouchableOpacity>
            </View>

            <SizeBox height={16} />

            <Text style={[Styles.eventSubText, { width: '100%', marginLeft: 20 }]}>Sent</Text>

            <SizeBox height={10} />

            <RequestContainers
                title='Enhance Lighting & Colors'
                date='12.12.2024'
                time='12:00'
                status='Fixed'
                isFixed={true}
            />
            <RequestContainers
                title='Remove Watermark/Text'
                date='12.12.2024'
                time='12:00'
                status='Fixed'
                isFixed={true}
            />

            <Text style={[Styles.eventSubText, { width: '100%', marginLeft: 20 }]}>Received</Text>

            <SizeBox height={10} />

            <RequestContainers
                title='Enhance Lighting & Colors'
                date='12.12.2024'
                time='12:00'
                status='Pending'
                isFixed={false}
            />
            <RequestContainers
                title='Slow Motion Effect'
                date='12.12.2024'
                time='12:00'
                status='Fixed'
                isFixed={true}
            />

        </View>
    )
}

export default PotentialVideos