import { View, ScrollView, Text } from 'react-native'
import React, { useState } from 'react'
import { createStyles } from '../AddTalentStyles'
import SizeBox from '../../../../constants/SizeBox'
import FastImage from 'react-native-fast-image'
import Images from '../../../../constants/Images'
import CustomButton from '../../../../components/customButton/CustomButton'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import SelcetionContainer from '../components/SelcetionContainer'
import Icons from '../../../../constants/Icons'
import PhotographyDetails from '../components/PhotographyDetails'
import { useTheme } from '../../../../context/ThemeContext'
import { useTranslation } from 'react-i18next'

const ViewPhotographProfile = ({ navigation }: any) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const [events, setEvents] = useState([
        { id: 1, title: 'Athletics' },
        { id: 2, title: 'Football' },
        // Add more default events if needed
    ]);

    const handleDeleteCompetition = (id: number) => {
        setEvents(events.filter(event => event.id !== id));
    };
    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <ScrollView showsVerticalScrollIndicator={false}>
                <SizeBox height={30} />
                <View style={{ height: 110, width: 110, alignSelf: 'center' }}>
                    <FastImage source={Images.talentImg} style={{ height: '100%', width: '100%' }} />
                </View>
                <SizeBox height={30} />
                <View style={Styles.contentContainer}>

                    <Text style={Styles.headingText}>{t('Set Up Your Talent Profile')}</Text>
                    <SizeBox height={8} />
                    <Text style={Styles.subHeadingText}>{t('Create your profile to showcase your skills and stand out.')}</Text>
                    <SizeBox height={24} />
                    <Text style={Styles.containerTitle}>{t('Photography')}</Text>
                    <SizeBox height={16} />

                    <View style={Styles.talentContainer}>
                        <SizeBox height={16} />
                        <PhotographyDetails
                            title={t('Signature Photography')}
                            wesite={'www.signaturephotography.com'}
                            disabled={true}
                            isRightAction={false}
                        />

                        <Text style={Styles.containerTitle}>{t('Events')}</Text>
                        <SizeBox height={10} />
                        {events.map((event) => (
                            <SelcetionContainer
                                key={event.id}
                                isIcon={false}
                                title={event.title}
                                disabled={true}
                                isRightAction={true}
                                isDelete={true}
                                onPressDelete={() => handleDeleteCompetition(event.id)}
                            />
                        ))}

                        <SizeBox height={16} />
                        <CustomButton title={t('Add Event')} onPress={() => navigation.navigate('TalenetForPhotograph')} isAdd={true} isSmall={true} />

                        <SizeBox height={16} />
                    </View>

                    <SizeBox height={20} />
                    <CustomButton title={t('Next')} onPress={() => navigation.navigate('AddTalentScreen')} />
                    <SizeBox height={86} />
                </View>
            </ScrollView>
        </View>
    )
}

export default ViewPhotographProfile