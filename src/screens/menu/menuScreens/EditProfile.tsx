import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { createStyles } from '../MenuStyles'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SizeBox from '../../../constants/SizeBox';
import CustomHeader from '../../../components/customHeader/CustomHeader';
import CustomTextInput from '../../../components/customTextInput/CustomTextInput';
import Icons from '../../../constants/Icons';
import FastImage from 'react-native-fast-image';
import CustomButton from '../../../components/customButton/CustomButton';
import AddSocialLink from '../components/AddSocialLink';
import { useTheme } from '../../../context/ThemeContext';

const EditProfile = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);

    const [modalVisible, setModalVisible] = useState(false);

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <CustomHeader title='Edit Profile' onBackPress={() => navigation.goBack()} isSetting={false} />

            <ScrollView style={Styles.container} showsVerticalScrollIndicator={false}>
                <SizeBox height={24} />
                <Text style={Styles.containerTitle}>Profile Settings</Text>
                <SizeBox height={20} />
                <CustomTextInput
                    label='Change username'
                    icon={<Icons.User height={16} width={16} />}
                    placeholder='Change username'
                />
                <SizeBox height={20} />
                <CustomTextInput
                    label='Change email'
                    icon={<Icons.Email height={16} width={16} />}
                    placeholder='Change email'
                />
                <SizeBox height={20} />
                <CustomTextInput
                    label='Password'
                    icon={<Icons.Password height={16} width={16} />}
                    placeholder='Password'
                    isPass={true}
                />
                <SizeBox height={20} />
                <CustomTextInput
                    label='Website'
                    icon={<Icons.WebsiteBlue height={16} width={16} />}
                    placeholder='www.demo365.com'
                />

                <SizeBox height={24} />
                <View style={Styles.row}>
                    <Text style={Styles.containerTitle}>Social links</Text>
                    <TouchableOpacity activeOpacity={0.3} style={[Styles.nextArrow, { right: 0, }, Styles.row]} onPress={() => setModalVisible(true)}>
                        <Icons.AddCircle height={16} width={16} />
                        <SizeBox width={4} />
                        <Text style={Styles.btnText}>Add More</Text>
                    </TouchableOpacity>
                </View>
                <SizeBox height={16} />
                <View style={Styles.talentContainer}>
                    <SizeBox height={16} />
                    <TouchableOpacity style={Styles.socialLinks}>
                        <FastImage source={Icons.Strava} style={Styles.icons} />
                        <SizeBox width={12} />
                        <Text style={Styles.titlesText}>Strava</Text>
                        <View style={[Styles.nextArrow, { right: 0 }]}>
                            <Icons.ArrowNext height={20} width={20} />
                        </View>
                    </TouchableOpacity>
                    <SizeBox height={14} />
                    <View style={Styles.separator} />
                    <SizeBox height={14} />
                    <TouchableOpacity style={Styles.socialLinks}>
                        <FastImage source={Icons.Facebook} style={Styles.icons} />
                        <SizeBox width={12} />
                        <Text style={Styles.titlesText}>Facebook</Text>
                        <View style={[Styles.nextArrow, { right: 0 }]}>
                            <Icons.ArrowNext height={20} width={20} />
                        </View>
                    </TouchableOpacity>
                    <SizeBox height={14} />
                    <View style={Styles.separator} />
                    <SizeBox height={14} />
                    <TouchableOpacity style={Styles.socialLinks}>
                        <FastImage source={Icons.Instagram} style={Styles.icons} />
                        <SizeBox width={12} />
                        <Text style={Styles.titlesText}>Instagram</Text>
                        <View style={[Styles.nextArrow, { right: 0 }]}>
                            <Icons.ArrowNext height={20} width={20} />
                        </View>
                    </TouchableOpacity>
                    <SizeBox height={16} />
                </View>
                <SizeBox height={30} />
                <CustomButton title='Save' onPress={() => navigation.goBack()} isSmall={true} />
                <SizeBox height={30} />

                <AddSocialLink isVisible={modalVisible} onClose={() => setModalVisible(false)} onYesPress={() => setModalVisible(false)} />
            </ScrollView>
        </View>
    )
}

export default EditProfile