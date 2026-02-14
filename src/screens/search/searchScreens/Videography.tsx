import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { createStyles } from '../SearchStyles'
import CustomHeader from '../../../components/customHeader/CustomHeader'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import SizeBox from '../../../constants/SizeBox'
import TabBar from '../../authFlow/setUpTalent/components/TabBar'
import Icons from '../../../constants/Icons'
import CustomButton from '../../../components/customButton/CustomButton'
import { useTheme } from '../../../context/ThemeContext'
import { useTranslation } from 'react-i18next'

const Videography = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { type: initialType } = route.params || {};
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);

    const [seletedTab, setSelectedTab] = useState(0);
    const [currentType, setCurrentType] = useState(initialType || 'video');

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

    // Toggle between video and photography
    const toggleMediaType = () => {
        setCurrentType((prev: any) => prev === 'video' ? 'photo' : 'video');
    };

    // Update title based on media type
    const getMediaTypeTitle = () => {
        return currentType === 'video' ? t('Videos') : t('Photography');
    };



    const RenderItem = ({ item }: any) => {
        return (
            <TouchableOpacity onPress={() => navigation.navigate('VideosForEvent')} activeOpacity={0.7} style={[styles.borderBox, styles.row, styles.spaceBetween, { marginBottom: 24 }]}>
                <Text style={styles.titleText}>{item.title}</Text>
                <Icons.ArrowNext height={24} width={24} />
            </TouchableOpacity>
        )
    }

    return (
        <View style={styles.mainContainer}>
            <SizeBox height={insets.top} />
            <CustomHeader title={t('BK Studentent 23')} onBackPress={() => navigation.goBack()} onPressSetting={() => navigation.navigate('ProfileSettings')} />
            <SizeBox height={24} />
            <View style={{ marginHorizontal: 20 }}>
                <Text style={styles.titleText}>{t('Running')}</Text>
                <SizeBox height={2} />
                <Text style={styles.filterText}>{t('Here are your Loop and Veld Events')}</Text>

                <TouchableOpacity
                    style={[styles.eventbtns, styles.row, { position: 'absolute', right: 0 }]}
                    onPress={toggleMediaType}
                    activeOpacity={0.7}
                >
                    <Text style={styles.eventBtnText}>{getMediaTypeTitle()}</Text>
                    <SizeBox width={6} />
                    {currentType === 'video' ? (
                        <Icons.Video height={18} width={18} />
                    ) : (
                        <Icons.Camera height={18} width={18} /> // Make sure you have Photo icon in your Icons constant
                    )}
                </TouchableOpacity>
            </View>

            <SizeBox height={24} />
            <TabBar
                selectedTab={seletedTab}
                onTabPress={(tab: number) => { setSelectedTab(tab) }}
            />
            <SizeBox height={24} />
            {seletedTab === 0 && <FlatList
                data={trackData}
                renderItem={RenderItem}
                keyExtractor={(item, index) => index.toString()}
            />}

            {seletedTab === 1 && <FlatList
                data={fieldData}
                renderItem={RenderItem}
                keyExtractor={(item, index) => index.toString()}
            />}

            <View style={styles.btn}>
                <CustomButton title={t('Show All')} onPress={() => { currentType === 'video' ? navigation.navigate('AllVideosOfEvents') : navigation.navigate('AllPhotosOfEvents') }} />
            </View>
            <SizeBox height={insets.bottom} />
        </View>
    )
}

export default Videography
