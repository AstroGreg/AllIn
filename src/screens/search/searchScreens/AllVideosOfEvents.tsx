import { View, Text, FlatList } from 'react-native'
import React from 'react'
import Styles from '../SearchStyles'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import CustomHeader from '../../../components/customHeader/CustomHeader'
import VideoContainer from '../../profile/components/VideoContainer'

const AllVideosOfEvents = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();


    const data = [
        {
            id: 1,
            name: 'Passionate',
            event: '800m heat 1',
            videoUri: 'https://awssportreels.s3.eu-central-1.amazonaws.com/BK-2024.mp4',
            timer: '2300'
        },
        {
            id: 2,
            name: 'Passionate',
            event: '800m heat 1',
            videoUri: 'https://awssportreels.s3.eu-central-1.amazonaws.com/BK+studenten+2023.MP4',
            timer: '2300'
        },
        {
            id: 3,
            name: 'Passionate',
            event: '800m heat 1',
            videoUri: 'https://awssportreels.s3.eu-central-1.amazonaws.com/PK-800m.mp4',
            timer: '2300'
        },
        {
            id: 4,
            name: 'Passionate',
            event: '800m heat 1',
            videoUri: 'https://awssportreels.s3.eu-central-1.amazonaws.com/PK-1500m.mp4',
            timer: '2300'
        },
        {
            id: 5,
            name: 'Passionate',
            event: '800m heat 1',
            videoUri: 'https://awssportreels.s3.eu-central-1.amazonaws.com/PK-400m.mp4',
            timer: '2300'
        },
        {
            id: 6,
            name: 'Passionate',
            event: '800m heat 1',
            videoUri: 'https://awssportreels.s3.eu-central-1.amazonaws.com/BK-2024.mp4',
            timer: '2300'
        },
        {
            id: 7,
            name: 'Passionate',
            event: '800m heat 1',
            videoUri: 'https://awssportreels.s3.eu-central-1.amazonaws.com/BK+studenten+2023.MP4',
            timer: '2300'
        },
        {
            id: 8,
            name: 'Passionate',
            event: '800m heat 1',
            videoUri: 'https://awssportreels.s3.eu-central-1.amazonaws.com/PK-800m.mp4',
            timer: '2300'
        },

    ]

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <CustomHeader
                title='All Videos'
                onBackPress={() => navigation.goBack()}
                onPressSetting={() => navigation.navigate('ProfileSettings')}
            />
            <FlatList
                data={data}
                renderItem={({ item }) =>
                    <VideoContainer
                        onPressVideo={() => navigation.navigate('VideoScreen', { videoUrl: item.videoUri })}
                        event={item.name}
                        eventName={item.event}
                        videoUri={item.videoUri}
                        timer={item.timer}
                    />
                }
                keyExtractor={(item, index) => index.toString()}
                numColumns={2}
                contentContainerStyle={{
                    paddingRight: 20,
                    paddingTop: 20,
                }}
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
                ListHeaderComponent={
                    <View style={{ marginLeft: 20 }}>
                        <Text style={Styles.titleText}>Talent : Running</Text>
                        <SizeBox height={16} />
                    </View>
                }
                ListFooterComponent={<SizeBox height={30} />}
            />
        </View>
    )
}

export default AllVideosOfEvents