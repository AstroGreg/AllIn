import { View, ScrollView, Text } from 'react-native'
import React from 'react'
import Styles from '../AddTalentStyles'
import SizeBox from '../../../../constants/SizeBox'
import FastImage from 'react-native-fast-image'
import Images from '../../../../constants/Images'
import CustomButton from '../../../../components/customButton/CustomButton'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import CustomTextInput from '../../../../components/customTextInput/CustomTextInput'

const ChestDetails = ({ navigation }: any) => {

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

                    <Text style={Styles.headingText}>Set Up Your Talent Profile</Text>
                    <SizeBox height={8} />
                    <Text style={Styles.subHeadingText}>Create your profile to showcase your skills and stand out.</Text>

                    <SizeBox height={24} />
                    <CustomTextInput
                        label='Chest Number'
                        placeholder='Enter Chest Number'
                        isIcon={false}
                        keyboardType='number-pad'
                    />

                    <SizeBox height={24} />
                    <CustomTextInput
                        label='Website'
                        placeholder='Enter website link'
                        isIcon={false}
                    />

                    <SizeBox height={86} />
                    <CustomButton title='Continue' onPress={() => navigation.navigate('SelectEvents')} />
                </View>
            </ScrollView>
        </View>
    )
}

export default ChestDetails