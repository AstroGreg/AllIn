import { View, ScrollView } from 'react-native'
import React from 'react'
import Styles from './HomeStyles'
import Header from './components/Header'
import SizeBox from '../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import NewsFeedCard from './components/NewsFeedCard'
import Images from '../../constants/Images'

const HomeScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();

    const feedImages = [
        Images.photo1,
        Images.photo3,
        Images.photo4,
        Images.photo5,
        Images.photo6,
        Images.photo7,
        Images.photo8,
        Images.photo9,
    ];

    const kbcNachtImages = [
        Images.photo5,
    ];

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <Header
                userName={"David Malan"}
                onPressFeed={() => navigation.navigate('HubScreen')}
                onPressNotification={() => navigation.navigate('NotificationsScreen')}
            />

            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
                <SizeBox height={24} />

                {/* First card - no border, just title + image carousel */}
                <NewsFeedCard
                    title="Belgium championships 2025"
                    images={feedImages}
                    hasBorder={false}
                />

                {/* Second card - has border, user post with single image */}
                <NewsFeedCard
                    title="Belgium championships 2025"
                    description={`Elias took part in the 800m and achieved a time close to his best 1'50"99`}
                    images={[Images.photo1]}
                    hasBorder={true}
                    user={{
                        name: "Mia Moon",
                        avatar: Images.profilePic,
                        timeAgo: "3 Days Ago"
                    }}
                    onFollow={() => {}}
                    onViewBlog={() => {}}
                />

                {/* Third card - no border, video with play button */}
                <NewsFeedCard
                    title="KBC Nacht 2025"
                    images={kbcNachtImages}
                    hasBorder={false}
                    isVideo={true}
                    videoUri="https://awssportreels.s3.eu-central-1.amazonaws.com/PK-800m.mp4"
                />

                <SizeBox height={24} />
            </ScrollView>
        </View>
    )
}

export default HomeScreen
