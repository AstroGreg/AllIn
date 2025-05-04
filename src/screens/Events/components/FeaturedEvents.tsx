import { View, Text } from 'react-native'
import React from 'react'
import Styles from '../EventsStyles'
import FastImage from 'react-native-fast-image'
import Images from '../../../constants/Images'
import SizeBox from '../../../constants/SizeBox'
import Icons from '../../../constants/Icons'
import SubscribedUsers from './SubscribedUsers'
import BorderButton from '../../../components/borderButton/BorderButton'

const subscribedUsers = [
    'https://picsum.photos/200/300',
    'https://picsum.photos/200/300',
    'https://picsum.photos/200/300',
    'https://picsum.photos/200/300',
];

interface FeaturedEventsProps {
    onPressSubscribe: any
}

const FeaturedEvents = ({
    onPressSubscribe
}: FeaturedEventsProps) => {
    return (
        <View style={Styles.featuredEventsContinaer}>
            <View style={Styles.imgContainer}>
                <FastImage
                    source={Images.event1}
                    style={Styles.images}
                />
            </View>
            <SizeBox height={10} />
            <Text style={Styles.CompetitionName} numberOfLines={1}>Champions in Motion</Text>
            <SizeBox height={6} />
            <View style={Styles.row}>
                <View style={Styles.row}>
                    <Icons.CalendarGrey height={12} width={12} />
                    <SizeBox width={2} />
                    <Text style={Styles.actionText}>12/12/2024</Text>
                </View>
                <SizeBox width={6} />
                <View style={[Styles.row, { width: '55%', }]}>
                    <Icons.Location height={12} width={12} />
                    <SizeBox width={2} />
                    <Text style={Styles.actionText} numberOfLines={1}>Berlin, Germany</Text>
                </View>
            </View>
            <SizeBox height={11} />
            <View style={Styles.row}>
                <SubscribedUsers users={subscribedUsers} />
                <SizeBox width={6} />
                <Text style={Styles.actionText}>20+ subscribed already</Text>
            </View>
            <SizeBox height={20} />
            <BorderButton isFilled={true} title='Subscribe' onPress={onPressSubscribe} />
        </View>
    )
}

export default FeaturedEvents