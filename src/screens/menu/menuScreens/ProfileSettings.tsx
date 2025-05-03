import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import Styles from '../MenuStyles'
import CustomHeader from '../../../components/customHeader/CustomHeader'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Icons from '../../../constants/Icons'
import FastImage from 'react-native-fast-image'
import Images from '../../../constants/Images'

const ProfileSettings = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <CustomHeader title='Profile Settings' onBackPress={() => navigation.goBack()} isSetting={false} />
            <SizeBox height={24} />
            <View style={Styles.container}>
                <View style={Styles.row}>
                    <Text style={Styles.containerTitle}>Payment Methods</Text>
                    <TouchableOpacity activeOpacity={0.7} style={[Styles.nextArrow, { right: 0 }]} onPress={() => navigation.navigate('EditProfile')}>
                        <Icons.Edit height={22} width={22} />
                    </TouchableOpacity>
                </View>
                <SizeBox height={20} />
                <TouchableOpacity activeOpacity={0.7} style={Styles.profilePicContainer}>
                    <FastImage source={Images.profilePic} style={Styles.profileImg} />
                    <View style={Styles.editIcon}>
                        <Icons.EditProfile height={24} width={24} />
                    </View>
                </TouchableOpacity>
                <SizeBox height={20} />

                <View style={[Styles.talentContainer, { padding: 16 }]}>
                    <View style={[Styles.row, { justifyContent: 'space-between' }]}>
                        <View style={Styles.row}>
                            <Icons.UserGrey height={16} width={16} />
                            <SizeBox width={8} />
                            <Text style={Styles.profileLabel}>Username</Text>
                        </View>
                        <Text style={Styles.titlesText}>@jing_456</Text>
                    </View>
                    <SizeBox height={16} />
                    <View style={Styles.separator} />
                    <SizeBox height={16} />

                    <View style={[Styles.row, { justifyContent: 'space-between' }]}>
                        <View style={Styles.row}>
                            <Icons.EmailGrey height={16} width={16} />
                            <SizeBox width={8} />
                            <Text style={Styles.profileLabel}>Email</Text>
                        </View>
                        <Text style={Styles.titlesText}>georgia.young@example.com</Text>
                    </View>
                    <SizeBox height={16} />
                    <View style={Styles.separator} />
                    <SizeBox height={16} />

                    <View style={[Styles.row, { justifyContent: 'space-between' }]}>
                        <View style={Styles.row}>
                            <Icons.PasswordGrey height={16} width={16} />
                            <SizeBox width={8} />
                            <Text style={Styles.profileLabel}>Password</Text>
                        </View>
                        <Text style={Styles.titlesText}>**********</Text>
                    </View>
                    <SizeBox height={16} />
                    <View style={Styles.separator} />
                    <SizeBox height={16} />

                    <View style={[Styles.row, { justifyContent: 'space-between' }]}>
                        <View style={Styles.row}>
                            <Icons.Website height={16} width={16} />
                            <SizeBox width={8} />
                            <Text style={Styles.profileLabel}>Website</Text>
                        </View>
                        <Text style={Styles.titlesText}>www.demo365.com</Text>
                    </View>
                    <SizeBox height={16} />
                    <View style={Styles.separator} />
                    <SizeBox height={16} />

                    <View style={[Styles.row, { justifyContent: 'space-between' }]}>
                        <View style={Styles.row}>
                            <Icons.Links height={16} width={16} />
                            <SizeBox width={8} />
                            <Text style={Styles.profileLabel}>Social links</Text>
                        </View>
                        <View style={[Styles.row, { gap: 10 }]}>
                            <FastImage source={Icons.Strava} style={Styles.linksIcon} />
                            <FastImage source={Icons.Facebook} style={Styles.linksIcon} />
                            <FastImage source={Icons.Instagram} style={Styles.linksIcon} />
                        </View>
                    </View>

                </View>

            </View>

        </View>
    )
}

export default ProfileSettings