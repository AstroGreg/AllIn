import { View, ScrollView, Text } from 'react-native'
import React, { useState } from 'react'
import { createStyles } from '../AddTalentStyles'
import SizeBox from '../../../../constants/SizeBox'
import FastImage from 'react-native-fast-image'
import Images from '../../../../constants/Images'
import CustomButton from '../../../../components/customButton/CustomButton'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import TabBar from '../components/TabBar'
import SelcetionContainer from '../components/SelcetionContainer'
import { useTheme } from '../../../../context/ThemeContext'
import { useTranslation } from 'react-i18next'

const SelectEvents = ({ navigation }: any) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const Styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const [seletedTab, setSelectedTab] = useState(0);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const handleSelect = (id: number) => {
        setSelectedId(id === selectedId ? null : id);
    };

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
                    <Text style={Styles.containerTitle}>{t('Select your events')}</Text>
                    <SizeBox height={16} />
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

                    <SizeBox height={86} />
                    <CustomButton title={t('Continue')} onPress={() => navigation.navigate('ViewSelectedTalent')} />
                    <SizeBox height={86} />
                </View>
            </ScrollView>
        </View>
    )
}

export default SelectEvents