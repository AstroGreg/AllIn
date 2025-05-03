import { View, Text, TextComponent, TouchableOpacity, ScrollView, Dimensions, FlatList } from 'react-native'
import React, { useState } from 'react'
import CustomHeader from '../../components/customHeader/CustomHeader'
import SizeBox from '../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FastImage from 'react-native-fast-image'
import Images from '../../constants/Images'
import Icons from '../../constants/Icons'
import BorderButton from '../../components/borderButton/BorderButton'
import LinksModal from '../profile/components/LinksModal'
import EventsContainer from '../profile/components/EventsContainer'
import Styles from './UserProfileStyles'

const UserProfileScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();

    const [linksModalVisible, setLinksModalVisible] = useState(false);

    const deviceWidth = Dimensions.get('window').width;
    const horizontalPadding = 20; // Container padding
    const gap = 12; // Space between images
    const numberOfImages = 4;

    // Calculate image width based on device width, padding, and gaps
    const imageWidth = (deviceWidth - (horizontalPadding * 2) - (gap * (numberOfImages - 1))) / numberOfImages;


    const collections = [
        {
            id: 1,
            imgUrl: Images.photo1
        },
        {
            id: 2,
            imgUrl: Images.photo3
        },
        {
            id: 3,
            imgUrl: Images.photo4
        },
        {
            id: 4,
            imgUrl: Images.photo5
        },
    ]


    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />

            <CustomHeader title='Profile' onBackPress={() => navigation.goBack()} onPressSetting={() => navigation.navigate('ProfileSettings')} />
            <ScrollView showsVerticalScrollIndicator={false}>
                <SizeBox height={18} />

                <View style={Styles.profileImgCont}>
                    <FastImage source={Images.profile1} style={Styles.profileImg} />
                </View>
                <SizeBox height={12} />
                <Text style={[Styles.userNameText, Styles.textCenter]}>Josh Inglis</Text>
                <SizeBox height={5} />
                <Text style={[Styles.subText, Styles.textCenter]}>@jing_456</Text>

                <SizeBox height={10} />
                <View style={[Styles.followingCont, Styles.center]}>
                    <Text style={Styles.followersText}>
                        12K Followers
                    </Text>
                </View>

                <SizeBox height={10} />
                <TouchableOpacity activeOpacity={0.7} style={[Styles.unfollowCont, Styles.center]}>
                    <Text style={Styles.unfollowText}>
                        Unfollow
                    </Text>
                </TouchableOpacity>

                <SizeBox height={24} />

                {/* <View style={Styles.container}> */}
                <View style={[Styles.row, Styles.spaceBetween, Styles.container]}>
                    <Text style={Styles.titleText}>Bio</Text>
                    {/* <TouchableOpacity onPress={() => navigation.navigate('EditBioScreens')}>
                        <Icons.Edit height={18} width={18} />
                    </TouchableOpacity> */}
                </View>
                <SizeBox height={8} />
                <Text style={[Styles.subText, Styles.container]}>Passionate photographer capturing life’s most authentic moments through the lens.</Text>
                <SizeBox height={8} />
                <View style={Styles.separator} />

                <SizeBox height={14} />

                <View style={[Styles.row, Styles.container]}>
                    <FastImage source={Icons.Facebook} style={Styles.socialIcons} />
                    <SizeBox width={6} />
                    <Text style={Styles.subText}>Facebook profile + </Text>
                    <TouchableOpacity onPress={() => setLinksModalVisible(true)}>
                        <Text style={[Styles.subText, { borderBottomWidth: 0.2, }]}>2 links</Text>
                    </TouchableOpacity>
                </View>

                <SizeBox height={6} />

                <View style={[Styles.row, Styles.container]}>
                    <Icons.Website height={16} width={16} />
                    <SizeBox width={6} />
                    <Text style={Styles.subText}>georgia.young@example.com</Text>
                </View>

                <SizeBox height={24} />
                <View style={[Styles.row, Styles.spaceBetween, Styles.container]}>
                    <Text style={[Styles.titleText,]}>Collections</Text>
                    <TouchableOpacity>
                        <Text style={Styles.subText}>View all</Text>
                    </TouchableOpacity>
                </View>

                <SizeBox height={16} />
                <View style={[Styles.row, Styles.container]}>
                    {collections?.map((item, index) => (
                        <View
                            key={index.toString()}
                            style={[
                                Styles.collectionImgCont,
                                {
                                    width: imageWidth,
                                    marginRight: index < collections.length - 1 ? gap : 0
                                }
                            ]}
                        >
                            <FastImage
                                source={item.imgUrl}
                                style={Styles.collectionImg}
                            />
                        </View>
                    ))}
                </View>
                <SizeBox height={16} />
                {/* <TouchableOpacity onPress={() => navigation.navigate('MediaScreens')} activeOpacity={0.7} style={[Styles.editBtn, Styles.row,]}>
                    <Text style={Styles.btnText}>Edit</Text>
                    <SizeBox width={8} />
                    <Icons.Edit height={18} width={18} />
                </TouchableOpacity> */}

                <SizeBox height={16} />
                <View style={[Styles.row, Styles.spaceBetween, Styles.container]}>
                    <Text style={Styles.titleText}>Events</Text>
                    <TouchableOpacity>
                        <Text style={Styles.subText}>View all</Text>
                    </TouchableOpacity>
                </View>
                <SizeBox height={16} />
                <FlatList
                    data={['', '', '', '', '',]}
                    renderItem={(item: any) =>
                        <EventsContainer
                            onPressPhoto={() => navigation.navigate('AllPhotosOfEvents')}
                            onPressVideo={() => navigation.navigate('AllVideosOfEvents')}
                        />}
                    keyExtractor={(item, index) => index.toString()}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    style={{ paddingLeft: 20 }}
                />

                <SizeBox height={16} />
                <Text style={[Styles.titleText, Styles.container]}>Downloads</Text>

                <SizeBox height={12} />
                <View style={Styles.downloadContainer}>
                    <Icons.Downloads height={22} width={22} />
                    <View style={Styles.row}>
                        <Text style={Styles.downloadText}>
                            Total Downloads:
                        </Text>
                        <Text style={Styles.downloadCount}>
                            346,456
                        </Text>
                    </View>
                    <View style={Styles.btnRight}>
                        <BorderButton title='Details' onPress={() => navigation.navigate('DownloadsScreens')} />
                    </View>
                </View>

                <SizeBox height={26} />
                {/* </View> */}
            </ScrollView>

            <LinksModal isVisible={linksModalVisible} onClose={() => setLinksModalVisible(false)} />
        </View>
    )
}

export default UserProfileScreen