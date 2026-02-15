import { View, Text, } from 'react-native'
import React, { useState } from 'react'
import SizeBox from '../../../constants/SizeBox'
import CustomButton from '../../../components/customButton/CustomButton'
import { createStyles } from './LanguageScreenStyles'
import LanguageContainer from '../components/LanguageContainer'
import { useTheme } from '../../../context/ThemeContext'
import { useTranslation } from 'react-i18next'

const LanguageScreen = ({ navigation }: any) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const [selectedLng, setSelectedLng] = useState('en');
    return (
        <View style={Styles.mainContainer}>
            <View style={Styles.contentContainer}>
                <Text style={Styles.headingText}>{t('Select Your Language')}</Text>
                <SizeBox height={8} />
                <Text style={Styles.subHeadingText}>{t('Please choose your preferred language to continue.')}</Text>
                <SizeBox height={40} />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <LanguageContainer title={'English'} onPress={() => setSelectedLng('en')} isSelected={selectedLng === 'en'} />
                    <LanguageContainer title={'Dutch'} onPress={() => setSelectedLng('dc')} isSelected={selectedLng === 'dc'} />
                </View>

                <SizeBox height={40} />
                <CustomButton title={'Continue'} onPress={() => navigation.navigate('AddTalentScreen')} />

            </View>
        </View>
    )
}

export default LanguageScreen