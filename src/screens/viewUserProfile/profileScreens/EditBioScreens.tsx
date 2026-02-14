import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { createStyles } from '../ViewUserProfileStyles'
import SizeBox from '../../../constants/SizeBox'
import CustomHeader from '../../../components/customHeader/CustomHeader'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FastImage from 'react-native-fast-image'
import Images from '../../../constants/Images'
import Icons from '../../../constants/Icons'
import CustomButton from '../../../components/customButton/CustomButton'
import { useTheme } from '../../../context/ThemeContext'
import { useTranslation } from 'react-i18next'

const EditBioScreens = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const [bio, setBio] = useState('');

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />

            <CustomHeader title={t('Profile')} onBackPress={() => navigation.goBack()} onPressSetting={() => navigation.navigate('ProfileSettings')} />

            <ScrollView showsVerticalScrollIndicator={false}>
                <SizeBox height={18} />
                <View style={styles.profileImgCont}>
                    <FastImage source={Images.profile1} style={styles.profileImg} />
                </View>
                <SizeBox height={12} />
                <Text style={[styles.userNameText, styles.textCenter]}>{t('Josh Inglis')}</Text>
                <SizeBox height={5} />
                <Text style={[styles.subText, styles.textCenter]}>@jing_456</Text>

                <SizeBox height={10} />
                <View style={[styles.followingCont, styles.center]}>
                    <Text style={styles.followersText}>
                        {t('12K Followers')}
                    </Text>
                </View>

                <SizeBox height={24} />

                <View style={styles.container}>
                    <Text style={styles.titleText}>{t('Bio')}</Text>
                    <SizeBox height={8} />
                    <View style={styles.bioContainer}>
                        <View style={styles.iconRow}>
                            <View style={styles.icon}>
                                <Icons.Edit height={16} width={16} />
                            </View>
                            <TextInput
                                style={styles.textInput}
                                placeholder={t('Write your bio...')}
                                placeholderTextColor={colors.subTextColor}
                                multiline
                                value={bio}
                                onChangeText={setBio}
                            />
                        </View>
                    </View>
                    <SizeBox height={16} />

                    <View style={[styles.row, styles.spaceBetween, { flex: 1 }]}>
                        <TouchableOpacity style={[styles.cancelBtn, { flex: 0.484 }]} activeOpacity={0.7} onPress={() => navigation.goBack()}>
                            <Text style={styles.eventBtnText}>{t('Cancel')}</Text>
                        </TouchableOpacity>
                        <View style={{ flex: 0.484 }}>
                            <CustomButton title={t('Save')} onPress={() => { }} isSmall={true} />
                        </View>
                    </View>

                    <SizeBox height={16} />
                </View>
            </ScrollView>
        </View>
    )
}

export default EditBioScreens
