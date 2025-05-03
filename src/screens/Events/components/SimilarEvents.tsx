import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import Styles from '../EventsStyles'
import FastImage from 'react-native-fast-image'
import Images from '../../../constants/Images'
import SizeBox from '../../../constants/SizeBox'
import Icons from '../../../constants/Icons'
import SubscribedUsers from './SubscribedUsers'
import Colors from '../../../constants/Colors'

const subscribedUsers = [
    'https://picsum.photos/200/300',
    'https://picsum.photos/200/300',
    'https://picsum.photos/200/300',
    'https://picsum.photos/200/300',
];

interface SimilarEventsProps {
    onPressSubscribe?: any;
    isSubscription?: boolean;
}

const SimilarEvents = ({
    onPressSubscribe,
    isSubscription = true
}: SimilarEventsProps) => {
    return (
        <View style={Styles.similarEvents}>
            <View style={Styles.eventImg}>
                <FastImage
                    source={Images.event1}
                    style={Styles.images}
                />
            </View>
            <SizeBox width={14} />
            <View style={{ width: '70%' }}>
                <Text style={Styles.eventName} numberOfLines={1}>Champions in Motion</Text>
                <SizeBox height={6} />
                <View style={Styles.row}>
                    <SubscribedUsers users={subscribedUsers} />
                    <SizeBox width={6} />
                    <Text style={Styles.actionText}>20+ subscribed</Text>
                </View>
                <SizeBox height={6} />
                <View style={Styles.row}>
                    <View style={Styles.row}>
                        <Icons.CalendarGrey height={14} width={14} />
                        <SizeBox width={2} />
                        <Text style={Styles.actionText}>12/12/2024</Text>
                    </View>
                    <SizeBox width={6} />
                    <View style={[Styles.row, { width: '55%' }]}>
                        <Icons.Location height={14} width={14} />
                        <SizeBox width={2} />
                        <Text style={Styles.actionText} numberOfLines={1}>Berlin, Germany</Text>
                    </View>
                </View>
            </View>
            {isSubscription && <TouchableOpacity style={Styles.right} onPress={onPressSubscribe}>
                <Text style={[Styles.eventName, { color: Colors.primaryColor, fontWeight: '400', }]}>Subscribe</Text>
            </TouchableOpacity>}
        </View>
    )
}

export default SimilarEvents