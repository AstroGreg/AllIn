import { View, ScrollView, Text } from 'react-native'
import React from 'react'
import { createStyles } from '../AddTalentStyles'
import SizeBox from '../../../../constants/SizeBox'
import FastImage from 'react-native-fast-image'
import Images from '../../../../constants/Images'
import CustomButton from '../../../../components/customButton/CustomButton'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import CustomTextInput from '../../../../components/customTextInput/CustomTextInput'
import { useTheme } from '../../../../context/ThemeContext'
import { useTranslation } from 'react-i18next'

const PhotographyName = ({ navigation }: any) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <ScrollView showsVerticalScrollIndicator={false}>
                <SizeBox height={30} />
                <View style={{ height: 130, width: 130, alignSelf: 'center' }}>
                    <FastImage source={Images.talentImg} style={{ height: '100%', width: '100%' }} />
                </View>
                <SizeBox height={30} />
                <View style={Styles.contentContainer}>

                    <Text style={Styles.headingText}>{t('Set Up Your Talent Profile')}</Text>
                    <SizeBox height={8} />
                    <Text style={Styles.subHeadingText}>{t('Create your profile to showcase your skills and stand out.')}</Text>

                    <SizeBox height={24} />
                    <CustomTextInput
                        label={t('Photography Name')}
                        placeholder={t('Enter photography name')}
                        subLabel='Leave empty to keep account name'
                        isIcon={false}
                    />

                    <SizeBox height={24} />
                    <CustomTextInput
                        label={t('Website')}
                        placeholder={t('Enter website link')}
                        isIcon={false}
                    />

                    <SizeBox height={86} />
                    <CustomButton title={t('Continue')} onPress={() => navigation.navigate('ViewPhotographProfile')} />
                </View>
            </ScrollView>
        </View>
    )
}

export default PhotographyName