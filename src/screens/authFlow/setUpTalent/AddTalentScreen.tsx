import { View, ScrollView, Text } from 'react-native'
import React from 'react'
import Styles from './AddTalentStyles'
import SizeBox from '../../../constants/SizeBox'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Images from '../../../constants/Images'
import FastImage from 'react-native-fast-image'
import CustomButton from '../../../components/customButton/CustomButton'

const AddTalentScreen = ({ navigation }: any) => {
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
                    <Text style={Styles.containerTitle}>Choose Your Talent</Text>
                    <SizeBox height={16} />
                    <View style={Styles.talentContainer}>
                        <SizeBox height={16} />
                        <Text style={Styles.containerTitle}>Talents</Text>
                        <SizeBox height={10} />
                        <View style={Styles.talentList}>
                            <Text style={Styles.talentTypeTitle}>Performer</Text>
                            <SizeBox height={16} />
                            <CustomButton title='Add Talent' onPress={() => navigation.navigate('SelecteTalent')} isAdd={true} isSmall={true} />
                        </View>
                        <SizeBox height={24} />
                        <View style={Styles.separator} />
                        <SizeBox height={10} />
                        <View style={Styles.talentList}>
                            <Text style={Styles.talentTypeTitle}>Creater</Text>
                            <SizeBox height={16} />
                            <CustomButton title='Add Talent' onPress={() => navigation.navigate('TalenetForPhotograph')} isAdd={true} isSmall={true} />
                        </View>
                        <SizeBox height={24} />
                        <View style={Styles.separator} />
                    </View>
                    <SizeBox height={83} />
                    <CustomButton title='Next' onPress={() => navigation.navigate('BottomTabBar')} />
                </View>
            </ScrollView>
        </View>
    )
}

export default AddTalentScreen