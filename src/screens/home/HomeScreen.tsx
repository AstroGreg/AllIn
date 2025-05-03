import { View, ScrollView, } from 'react-native'
import React, { useState } from 'react'
import Styles from './HomeStyles'
import Header from './components/Header'
import SizeBox from '../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import SectionTabs from '../../components/sectionTabs/SectionTabs'
import PotentialVideos from './components/PotentialVideos'
import CretedEvents from './components/CretedEvents'
import CustomButton from '../../components/customButton/CustomButton'

const HomeScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [seletedTab, setSelectedTab] = useState(0);

    const data = [
        {
            id: 1,
            eventName: "BK Studentent 23",
            map: "800m heat 1",
            location: "Dhaka",
            date: "Mar 4,25",
            videoUri: "https://awssportreels.s3.eu-central-1.amazonaws.com/PK-800m.mp4"
        },
        {
            id: 2,
            eventName: "PK 2025 indoor",
            map: "800m heat 1",
            location: "Dhaka",
            date: "Mar 4,25",
            videoUri: "https://awssportreels.s3.eu-central-1.amazonaws.com/BK+studenten+2023.MP4"
        },
        {
            id: 3,
            eventName: "BK Studentent 23",
            map: "800m heat 1",
            location: "Dhaka",
            date: "Mar 4,25",
            videoUri: "https://awssportreels.s3.eu-central-1.amazonaws.com/BK-2024.mp4"
        },
        {
            id: 4,
            eventName: "BK Studentent 23",
            map: "800m heat 1",
            location: "Dhaka",
            date: "Mar 4,25",
            videoUri: "https://awssportreels.s3.eu-central-1.amazonaws.com/PK-1500m.mp4"
        },
        {
            id: 5,
            eventName: "BK Studentent 23",
            map: "800m heat 1",
            location: "Dhaka",
            date: "Mar 4,25",
            videoUri: "https://awssportreels.s3.eu-central-1.amazonaws.com/PK-400m.mp4"
        },
    ]

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <Header userName={"David Malan"} onPressSetting={() => navigation.navigate('ProfileSettings')} />

            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
                <SizeBox height={10} />

                <SectionTabs
                    selectedTab={seletedTab}
                    onTabPress={(tab: number) => { setSelectedTab(tab) }}
                />
                <SizeBox height={16} />

                {seletedTab === 0 ?
                    <PotentialVideos
                        data={data}
                        onPressAddEvent={() => navigation.navigate('EventsScreen')}
                        onPressDownloads={() => navigation.navigate('DownloadsScreens')}
                        onPressParticipant={() => navigation.navigate('ParticipantScreen')}
                    /> : <CretedEvents data={data} />}

                <SizeBox height={24} />
            </ScrollView>

            {seletedTab === 1 &&
                <View style={Styles.bottomAddEventBtn}>
                    <CustomButton title='Create Event' onPress={() => navigation.navigate('CreateEvent')} isAdd={true} />
                </View>}
        </View >
    )
}

export default HomeScreen