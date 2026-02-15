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
import { useTranslation } from 'react-i18next'

const EditProfile = ({ navigation }: any) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const Styles = createStyles(colors);

    const [modalVisible, setModalVisible] = useState(false);

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <CustomHeader title={t('Edit Profile')} onBackPress={() => navigation.goBack()} isSetting={false} />

            <ScrollView style={Styles.container} showsVerticalScrollIndicator={false}>
                <SizeBox height={24} />
                <Text style={Styles.containerTitle}>{t('Profile Settings')}</Text>
                <SizeBox height={20} />
                <CustomTextInput
                    label={t('Change username')}
                    icon={<Icons.User height={16} width={16} />}
                    placeholder={t('Change username')}
                />
                <SizeBox height={20} />
                <CustomTextInput
                    label={t('Change email')}
                    icon={<Icons.Email height={16} width={16} />}
                    placeholder={t('Change email')}
                />
                <SizeBox height={20} />
                <CustomTextInput
                    label={t('Password')}
                    icon={<Icons.Password height={16} width={16} />}
                    placeholder={t('Password')}
                    isPass={true}
                />
                <SizeBox height={20} />
                <CustomTextInput
                    label={t('Website')}
                    icon={<Icons.WebsiteBlue height={16} width={16} />}
                    placeholder={t('www.demo365.com')}
                />

                <SizeBox height={24} />
                <View style={Styles.row}>
                    <Text style={Styles.containerTitle}>{t('Social links')}</Text>
                    <TouchableOpacity activeOpacity={0.3} style={[Styles.nextArrow, { right: 0, }, Styles.row]} onPress={() => setModalVisible(true)}>
                        <Icons.AddCircle height={16} width={16} />
                        <SizeBox width={4} />
                        <Text style={Styles.btnText}>{t('Add More')}</Text>
                    </TouchableOpacity>
                </View>
                <SizeBox height={16} />
                <View style={Styles.talentContainer}>
                    <SizeBox height={16} />
                    <TouchableOpacity style={Styles.socialLinks}>
                        <FastImage source={Icons.Strava} style={Styles.icons} />
                        <SizeBox width={12} />
                        <Text style={Styles.titlesText}>{t('Strava')}</Text>
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
                        <Text style={Styles.titlesText}>{t('Facebook')}</Text>
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
                        <Text style={Styles.titlesText}>{t('Instagram')}</Text>
                        <View style={[Styles.nextArrow, { right: 0 }]}>
                            <Icons.ArrowNext height={20} width={20} />
                        </View>
                    </TouchableOpacity>
                    <SizeBox height={16} />
                </View>
                <SizeBox height={30} />
                <CustomButton title={t('Save')} onPress={() => navigation.goBack()} isSmall={true} />
                <SizeBox height={30} />

                <AddSocialLink isVisible={modalVisible} onClose={() => setModalVisible(false)} onYesPress={() => setModalVisible(false)} />
            </ScrollView>
        </View>
    )
}

export default EditProfile