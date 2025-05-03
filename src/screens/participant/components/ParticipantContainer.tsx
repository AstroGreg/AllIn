import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import Styles from '../ParticipantStyles'
import FastImage from 'react-native-fast-image'
import Images from '../../../constants/Images'
import SizeBox from '../../../constants/SizeBox'

interface ParticipantContainerProps {
    onPress: any;
}

const ParticipantContainer = ({ onPress }: ParticipantContainerProps) => {
    return (
        <View style={Styles.participantCont}>
            <View style={Styles.imgContainer}>
                <FastImage source={Images.profilePic} style={Styles.img} />
            </View>
            <SizeBox width={10} />
            <Text style={Styles.userNameText}>Greg Wenshell</Text>
            <TouchableOpacity style={Styles.viewProfileBtn} onPress={onPress}>
                <Text style={Styles.btnText}>
                    View Profile
                </Text>
            </TouchableOpacity>
        </View>
    )
}

export default ParticipantContainer