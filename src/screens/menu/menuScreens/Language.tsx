import { Text, View } from 'react-native'
import React, { useState } from 'react'
import Styles from '../MenuStyles'
import SizeBox from '../../../constants/SizeBox'
import CustomHeader from '../../../components/customHeader/CustomHeader'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import MenuContainers from '../components/MenuContainers'
import Icons from '../../../constants/Icons'

const Language = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [language, setLanguage] = useState('dt');

    return (
        <View style={Styles.mainContainer}>
            <SizeBox height={insets.top} />
            <CustomHeader title='Menu' onBackPress={() => navigation.goBack()} onPressSetting={() => navigation.navigate('ProfileSettings')} />
            <SizeBox height={24} />
            <View style={Styles.container}>
                <Text style={Styles.containerTitle}>Language</Text>
                <SizeBox height={16} />
                <MenuContainers
                    icon={<Icons.Dt height={20} width={20} />}
                    title='Dutch'
                    onPress={() => setLanguage('dt')}
                    isNext={false}
                    isSelected={language === 'dt'}
                />
                <SizeBox height={16} />
                <MenuContainers
                    icon={<Icons.En height={20} width={20} />}
                    title='English'
                    onPress={() => setLanguage('en')}
                    isNext={false}
                    isSelected={language === 'en'}
                />
            </View>
        </View>
    )
}

export default Language