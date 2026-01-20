import { View, Text, TouchableOpacity, FlatList } from 'react-native'
import React, { useState } from 'react'
import Styles from '../ViewUserProfileStyles'
import SizeBox from '../../../constants/SizeBox'
import CustomHeader from '../../../components/customHeader/CustomHeader'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import PhotosContainer from '../components/PhotosContainer'
import VideoContainer from '../components/VideoContainer'
import Images from '../../../constants/Images'

const MediaScreens = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [selectedTab, setSelectedTab] = useState(0); // 0 for Photos, 1 for videos

    const VideoData = [
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

    const PhotoData = [
        {
            id: 1,
            name: 'Passionate',
            photo: Images.photo1,
            price: '$15'
        },
        {
            id: 2,
            name: 'Passionate',
            photo: Images.photo3,
            price: '$15'
        },
        {
            id: 3,
            name: 'Passionate',
            photo: Images.photo4,
            price: '$15'
        },
        {
            id: 4,
            name: 'Passionate',
            photo: Images.photo5,
            price: '$15'
        },
        {
            id: 5,
            name: 'Passionate',
            photo: Images.photo6,
            price: '$15'
        },
        {
            id: 6,
            name: 'Passionate',
            photo: Images.photo7,
            price: '$15'
        },
        {
            id: 7,
            name: 'Passionate',
            photo: Images.photo8,
            price: '$15'
        },
        {
            id: 8,
            name: 'Passionate',
            photo: Images.photo9,
            price: '$15'
        },
        {
            id: 9,
            name: 'Passionate',
            photo: Images.photo5,
            price: '$15'
        },
        {
            id: 10,
            name: 'Passionate',
            photo: Images.photo4,
            price: '$15'
        },
        {
            id: 11,
            name: 'Passionate',
            photo: Images.photo9,
            price: '$15'
        },
    ]

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <CustomHeader title='Media' onBackPress={() => navigation.goBack()} onPressSetting={() => navigation.navigate('ProfileSettings')} />

            <SizeBox height={24} />

            <View style={Styles.toggleBtnContainer}>
                <TouchableOpacity style={[selectedTab === 0 && Styles.selectedTab, { height: '100%' }]} onPress={() => setSelectedTab(0)}>
                    <Text style={[Styles.btnText, { textAlign: 'right' }, selectedTab === 0 && Styles.selectedTabText]}>Photos</Text>
                </TouchableOpacity>
                <SizeBox width={48} />
                <TouchableOpacity style={[selectedTab === 1 && Styles.selectedTab, { height: '100%' }]} onPress={() => setSelectedTab(1)}>
                    <Text style={[Styles.btnText, selectedTab === 1 && Styles.selectedTabText, { textAlign: 'left' }]}>Video</Text>
                </TouchableOpacity>
            </View>

            {selectedTab === 0 &&
                <FlatList
                    data={PhotoData}
                    renderItem={({ item }) =>
                        <PhotosContainer
                            photo={item.photo}
                            name={item.name}
                            price={item.price}
                            onPressImg={() => navigation.navigate('PhotosScreen', { photoUri: item.photo })}
                        />
                    }
                    keyExtractor={(item, index) => index.toString()}
                    numColumns={2}
                    contentContainerStyle={{
                        paddingRight: 20,
                        paddingTop: 20,
                    }}
                    style={{ flex: 1 }}
                    ListFooterComponent={<SizeBox height={30} />}
                />
            }

            {selectedTab === 1 &&
                <FlatList
                    data={VideoData}
                    renderItem={({ item }) =>
                        <VideoContainer
                            event={item.name}
                            CompetitionName={item.event}
                            videoUri={item.videoUri}
                            timer={item.timer}
                            onPressVideo={() => navigation.navigate('VideoScreen', { videoUrl: '' })}
                        />
                    }
                    keyExtractor={(item, index) => index.toString()}
                    numColumns={2}
                    contentContainerStyle={{
                        paddingRight: 20,
                        paddingTop: 20,
                    }}
                    style={{ flex: 1 }}
                    ListFooterComponent={<SizeBox height={30} />}
                />
            }
        </View>
    )
}

export default MediaScreens