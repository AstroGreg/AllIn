import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import Styles from '../ProfileStyles'
import FastImage from 'react-native-fast-image'
import Images from '../../../constants/Images'
import SizeBox from '../../../constants/SizeBox'
import Icons from '../../../constants/Icons'

interface EventContainerProps {
    onPressPhoto?: any;
    onPressVideo?: any;
}

const EventsContainer = ({ onPressPhoto, onPressVideo }: EventContainerProps) => {
    return (
        <View style={Styles.eventContainer}>
            <View style={Styles.eventImgCont}>
                <FastImage
                    source={Images.event1}
                    style={Styles.eventImg}
                />
            </View>
            <SizeBox height={10} />
            <View style={[Styles.row, Styles.spaceBetween]}>
                <Text style={Styles.eventText}>City Run Marathon</Text>
                <View style={Styles.row}>
                    <Icons.Location height={14} width={14} />
                    <SizeBox width={6} />
                    <Text style={Styles.subText}>NY, USA</Text>
                </View>
            </View>
            <SizeBox height={6} />

            <View style={[Styles.row, Styles.spaceBetween]}>
                <View style={Styles.row}>
                    <Icons.CalendarGrey height={14} width={14} />
                    <SizeBox width={6} />
                    <Text style={Styles.subText}>14 feb 2024</Text>
                </View>
                <View style={Styles.row}>
                    <Icons.Run height={14} width={14} />
                    <SizeBox width={6} />
                    <Text style={Styles.subText}>800 m</Text>
                </View>
            </View>

            <SizeBox height={12} />
            <View style={[Styles.row, Styles.spaceBetween]}>
                <TouchableOpacity activeOpacity={0.7} style={[Styles.eventbtns, Styles.row]} onPress={onPressPhoto}>
                    <Text style={Styles.eventBtnText}>Photograph</Text>
                    <SizeBox width={6} />
                    <Icons.Camera height={18} width={18} />
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.7} style={[Styles.eventbtns, Styles.row]} onPress={onPressVideo}>
                    <Text style={Styles.eventBtnText}>Videos</Text>
                    <SizeBox width={6} />
                    <Icons.Video height={18} width={18} />
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default EventsContainer