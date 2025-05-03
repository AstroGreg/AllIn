import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import Styles from '../ProfileStyles'
import SizeBox from '../../../constants/SizeBox'
import CustomHeader from '../../../components/customHeader/CustomHeader'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FastImage from 'react-native-fast-image'
import Images from '../../../constants/Images'
import Icons from '../../../constants/Icons'
import Colors from '../../../constants/Colors'
import CustomButton from '../../../components/customButton/CustomButton'

const EditBioScreens = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [bio, setBio] = useState('');

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

                <SizeBox height={24} />

                <View style={Styles.container}>
                    <Text style={Styles.titleText}>Bio</Text>
                    <SizeBox height={8} />
                    <View style={Styles.bioContainer}>
                        <View style={Styles.iconRow}>
                            <View style={Styles.icon}>
                                <Icons.Edit height={16} width={16} />
                            </View>
                            <TextInput
                                style={Styles.textInput}
                                placeholder="Write your bio..."
                                placeholderTextColor={Colors.subTextColor}
                                multiline
                                value={bio}
                                onChangeText={setBio}
                            />
                        </View>
                    </View>
                    <SizeBox height={16} />

                    <View style={[Styles.row, Styles.spaceBetween, { flex: 1 }]}>
                        <TouchableOpacity style={[Styles.cancelBtn, { flex: 0.484 }]} activeOpacity={0.7} onPress={() => navigation.goBack()}>
                            <Text style={Styles.eventBtnText}>Cancel</Text>
                        </TouchableOpacity>
                        <View style={{ flex: 0.484 }}>
                            <CustomButton title='Save' onPress={() => { }} isSmall={true} />
                        </View>
                    </View>

                    <SizeBox height={16} />
                </View>
            </ScrollView>
        </View>
    )
}

export default EditBioScreens