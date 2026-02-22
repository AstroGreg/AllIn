import { View, Text, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { createStyles } from './ChooseCompetitionStyles'
import CustomHeader from '../../components/customHeader/CustomHeader'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import SizeBox from '../../constants/SizeBox'
import TabBar from '../authFlow/setUpTalent/components/TabBar'
import SelcetionContainer from '../authFlow/setUpTalent/components/SelcetionContainer'
import CustomButton from '../../components/customButton/CustomButton'
import { useTheme } from '../../context/ThemeContext'
import { useTranslation } from 'react-i18next'

const trackData = [
    {
        id: 1,
        title: '60 meter',
    },
    {
        id: 2,
        title: '80 meter',
    },
    {
        id: 3,
        title: '100 meter',
    },
    {
        id: 4,
        title: '200 meter',
    },
    {
        id: 5,
        title: '300 meter',
    },
    {
        id: 6,
        title: '400 meter',
    },
]

const fieldData = [
    {
        id: 1,
        title: 'Long Jump',
    },
    {
        id: 2,
        title: 'High Jump',
    },
    {
        id: 3,
        title: 'Pole Vault',
    },
    {
        id: 4,
        title: 'Javelin Throw',
    },
    {
        id: 5,
        title: 'Discus Throw',
    },
    {
        id: 6,
        title: 'Hammer Throw',
    },
]

const ChooseEventScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);
    const [seletedTab, setSelectedTab] = useState(0);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const handleSelect = (id: number) => {
        setSelectedId(id === selectedId ? null : id);
    };

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />
            <CustomHeader title={t('Choose Event')} onBackPress={() => navigation.goBack()} onPressSetting={() => navigation.navigate('ProfileSettings')} />

            <SizeBox height={24} />
            <ScrollView style={styles.container}>
                <Text style={styles.screenHeader}>{t('Champions in Motion')}</Text>
                <SizeBox height={2} />
                <Text style={styles.subText}>{t('Champions in Motion is engaged and committed to the instruction of cheerleading, karate/martial arts')}</Text>
                <SizeBox height={24} />
                <TabBar
                    selectedTab={seletedTab}
                    onTabPress={(tab: number) => { setSelectedTab(tab); setSelectedId(null) }}
                />
                <SizeBox height={27} />

                {
                    seletedTab === 0 ?
                        trackData?.map((item) =>
                            <SelcetionContainer
                                title={item.title}
                                isIcon={false}
                                isSelected={item.id === selectedId}
                                onPress={() => handleSelect(item.id)}
                            />) :
                        fieldData?.map((item) =>
                            <SelcetionContainer
                                title={item.title}
                                isIcon={false}
                                isSelected={item.id === selectedId}
                                onPress={() => handleSelect(item.id)}
                            />)
                }

                <SizeBox height={16} />
                <CustomButton
                    title={t('Continue')}
                    onPress={() => navigation.navigate('CongratulationsScreen')}
                />
            </ScrollView>
        </View>
    )
}

export default ChooseEventScreen
